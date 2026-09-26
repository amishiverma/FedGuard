"""
FedGuard — clients/core/dp_training.py
========================================
Opacus Differential Privacy wrapper for TabularNet.

Hardware target: RTX 4060 8 GB VRAM (Yash's machine).
Opacus per-sample gradient tracking spikes VRAM. To stay within 8 GB:
  - Logical batch_size can be large (e.g. 256) for noise calibration.
  - Physical batch_size is capped at MAX_PHYSICAL_BATCH_SIZE = 64.
  - BatchMemoryManager handles the micro-batching transparently.

Usage:
    model, optimizer, private_loader = attach_dp_engine(
        model, optimizer, train_loader,
        target_epsilon=1.0, epochs=5
    )
    # Then use BatchMemoryManager inside training loop (see example in __main__)
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

from opacus import PrivacyEngine
from opacus.utils.batch_memory_manager import BatchMemoryManager

# ---------------------------------------------------------------------------
# Hardware constraint constant — DO NOT raise above 64 on RTX 4060 8 GB
# ---------------------------------------------------------------------------
MAX_PHYSICAL_BATCH_SIZE: int = 64

# Default Opacus delta (1/N, safe for 307k dataset)
DEFAULT_DELTA: float = 1e-5


# ---------------------------------------------------------------------------
# Core API
# ---------------------------------------------------------------------------

def attach_dp_engine(
    model: nn.Module,
    optimizer: optim.Optimizer,
    data_loader: DataLoader,
    target_epsilon: float = 1.0,
    target_delta: float = DEFAULT_DELTA,
    max_grad_norm: float = 1.0,
    epochs: int = 5,
) -> tuple[nn.Module, optim.Optimizer, DataLoader]:
    """
    Attach an Opacus PrivacyEngine to the model/optimizer/loader triple.

    Opacus replaces the model with a GradSampleModule, the optimizer with a
    DPOptimizer, and the loader with a DPDataLoader. Use the returned objects
    for all subsequent training — never the originals.

    VRAM strategy:
        If data_loader.batch_size > MAX_PHYSICAL_BATCH_SIZE, Opacus still
        computes noise for the full logical batch, but BatchMemoryManager
        (used inside the training loop) feeds only MAX_PHYSICAL_BATCH_SIZE
        samples per backward pass, preventing VRAM OOM.

    Args:
        model            : Unwrapped nn.Module (must be on correct device).
        optimizer        : Standard torch optimizer (e.g. Adam).
        data_loader      : Training DataLoader — batch_size is the *logical*
                           (noise-calibration) batch size.
        target_epsilon   : Privacy budget ε to reach by epoch `epochs`.
        target_delta     : Failure probability δ. Default 1e-5.
        max_grad_norm    : L2 clipping threshold for per-sample gradients.
        epochs           : Number of training epochs (needed for noise scaling).

    Returns:
        (private_model, private_optimizer, private_loader)
    """
    privacy_engine = PrivacyEngine(accountant="rdp")

    private_model, private_optimizer, private_loader = (
        privacy_engine.make_private_with_epsilon(
            module=model,
            optimizer=optimizer,
            data_loader=data_loader,
            epochs=epochs,
            target_epsilon=target_epsilon,
            target_delta=target_delta,
            max_grad_norm=max_grad_norm,
        )
    )

    # Attach engine reference to optimizer so get_privacy_spent can reach it
    private_optimizer._privacy_engine = privacy_engine  # type: ignore[attr-defined]

    logical_bs = data_loader.batch_size or MAX_PHYSICAL_BATCH_SIZE
    if logical_bs > MAX_PHYSICAL_BATCH_SIZE:
        print(
            f"[DP] Logical batch={logical_bs} > MAX_PHYSICAL_BATCH_SIZE={MAX_PHYSICAL_BATCH_SIZE}. "
            f"Use BatchMemoryManager in training loop to prevent VRAM OOM."
        )
    else:
        print(f"[DP] Physical batch={logical_bs} is within VRAM budget.")

    noise_mult = private_optimizer.noise_multiplier
    print(
        f"[DP] Engine attached | ε_target={target_epsilon} | δ={target_delta} "
        f"| σ(noise)={noise_mult:.4f} | clip={max_grad_norm}"
    )

    return private_model, private_optimizer, private_loader


def get_privacy_spent(optimizer: optim.Optimizer) -> dict:
    """
    Return current (ε, δ) spent from the PrivacyEngine attached to optimizer.

    Args:
        optimizer: The *private* DPOptimizer returned by attach_dp_engine.

    Returns:
        {"epsilon": float, "delta": float}
    """
    try:
        engine: PrivacyEngine = optimizer._privacy_engine  # type: ignore[attr-defined]
        epsilon = engine.get_epsilon(delta=DEFAULT_DELTA)
        return {"epsilon": round(epsilon, 6), "delta": DEFAULT_DELTA}
    except AttributeError:
        raise RuntimeError(
            "No PrivacyEngine found on optimizer. "
            "Call attach_dp_engine() first and use the returned private_optimizer."
        )


# ---------------------------------------------------------------------------
# Training loop helper (single epoch)
# ---------------------------------------------------------------------------

def train_one_epoch_dp(
    model: nn.Module,
    optimizer: optim.Optimizer,
    private_loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
) -> dict:
    """
    Run one epoch of DP-SGD training with VRAM-safe micro-batching.

    BatchMemoryManager splits each logical batch into physical micro-batches
    of size MAX_PHYSICAL_BATCH_SIZE, accumulates gradients, then steps.

    Returns:
        {"loss": float, "epsilon": float, "delta": float}
    """
    model.train()
    total_loss = 0.0
    n_batches  = 0

    with BatchMemoryManager(
        data_loader=private_loader,
        max_physical_batch_size=MAX_PHYSICAL_BATCH_SIZE,
        optimizer=optimizer,
    ) as memory_safe_loader:
        for X_batch, y_batch in memory_safe_loader:
            X_batch = X_batch.to(device)
            y_batch = y_batch.to(device).float().unsqueeze(1)

            optimizer.zero_grad()
            logits = model(X_batch)
            loss   = criterion(logits, y_batch)
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            n_batches  += 1

    avg_loss     = total_loss / max(n_batches, 1)
    privacy_info = get_privacy_spent(optimizer)
    return {"loss": round(avg_loss, 6), **privacy_info}


# ---------------------------------------------------------------------------
# Self-test (__main__)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    """
    Smoke test: attach PrivacyEngine to TabularNet with a dummy DataLoader.
    Verifies:
      1. Model wraps into GradSampleModule without error.
      2. Noise multiplier is computed (ε budget satisfied).
      3. One forward + backward pass succeeds without OOM or shape error.
      4. get_privacy_spent() returns a valid dict.

    Expected output (approximate):
      [DP] Physical batch=128 is within VRAM budget.   (or VRAM warning)
      [DP] Engine attached | ε_target=1.0 | δ=1e-05 | σ(noise)=X.XXXX | clip=1.0
      Test forward pass loss : X.XXXXXX
      Privacy spent          : {'epsilon': X.XXXXXX, 'delta': 1e-05}
      dp_training.py smoke test PASSED
    """
    import sys, os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

    from model import TabularNet, get_device

    BATCH_SIZE = 128   # logical batch — intentionally > MAX_PHYSICAL_BATCH_SIZE
    N_SAMPLES  = 512
    INPUT_DIM  = 104
    EPOCHS     = 3

    device = get_device()
    print(f"Device: {device}")

    # --- Dummy dataset ---
    X_dummy = torch.randn(N_SAMPLES, INPUT_DIM)
    y_dummy = torch.randint(0, 2, (N_SAMPLES,)).float()
    dataset = TensorDataset(X_dummy, y_dummy)
    loader  = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True, drop_last=True)

    # --- Model + optimizer ---
    model     = TabularNet(input_dim=INPUT_DIM).to(device)
    optimizer = optim.Adam(model.parameters(), lr=1e-3)
    criterion = nn.BCEWithLogitsLoss()

    # --- Attach DP engine ---
    model, optimizer, private_loader = attach_dp_engine(
        model=model,
        optimizer=optimizer,
        data_loader=loader,
        target_epsilon=1.0,
        epochs=EPOCHS,
    )

    # --- One training epoch ---
    result = train_one_epoch_dp(model, optimizer, private_loader, criterion, device)
    print(f"Test forward pass loss : {result['loss']}")
    print(f"Privacy spent          : {{'epsilon': {result['epsilon']}, 'delta': {result['delta']}}}")
    print("dp_training.py smoke test PASSED")
