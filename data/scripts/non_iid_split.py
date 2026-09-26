"""
FedGuard — data/non_iid_split.py
=================================
Phase 1 : Lightweight preprocessing of Home Credit Default Risk dataset.
Phase 2 : Dirichlet Non-IID partition into 3 bank CSVs (alpha=0.5).

Run:
    python data/non_iid_split.py

Output:
    data/splits/bank_a.csv
    data/splits/bank_b.csv
    data/splits/bank_c.csv
"""

import os
import sys
import time

import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import LabelEncoder

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
RAW_CSV       = os.path.join("data/raw", "application_train.csv")
SPLITS_DIR    = os.path.join("data/raw", "splits")
TARGET_COL    = "TARGET"
N_CLIENTS     = 3
ALPHA         = 0.5          # Dirichlet concentration — low = high heterogeneity
SEED          = 42
NAN_THRESHOLD = 0.60         # drop columns with >60% missing values
CLIENT_NAMES  = ["bank_a", "bank_b", "bank_c"]


# ---------------------------------------------------------------------------
# Phase 1: Preprocessing
# ---------------------------------------------------------------------------

def load_and_drop_degenerate(path: str, threshold: float) -> pd.DataFrame:
    """Load CSV and drop columns that exceed the NaN fraction threshold."""
    print(f"[1/5] Loading {path} ...")
    t0 = time.time()
    df = pd.read_csv(path)
    print(f"      Loaded  : {df.shape[0]:,} rows x {df.shape[1]} cols  ({time.time()-t0:.1f}s)")

    nan_fractions = df.isnull().mean()
    cols_to_drop  = nan_fractions[nan_fractions >= threshold].index.tolist()
    df = df.drop(columns=cols_to_drop)
    print(f"[2/5] Dropped {len(cols_to_drop)} columns with >{threshold*100:.0f}% NaNs")
    print(f"      Remaining: {df.shape[1]} cols")
    return df


def segregate_columns(df: pd.DataFrame, target: str):
    """Split column names into categorical and numerical (excluding target)."""
    cat_cols = df.select_dtypes(include=["object"]).columns.tolist()
    num_cols = df.select_dtypes(include=["number"]).columns.tolist()
    if target in num_cols:
        num_cols.remove(target)
    return cat_cols, num_cols


def impute_numerical(df: pd.DataFrame, num_cols: list) -> pd.DataFrame:
    """Median imputation for numerical columns via sklearn (vectorised, one pass)."""
    print(f"[3/5] Imputing {len(num_cols)} numerical cols with median ...")
    imputer = SimpleImputer(strategy="median")
    df[num_cols] = imputer.fit_transform(df[num_cols])
    return df


def impute_and_encode_categoricals(df: pd.DataFrame, cat_cols: list) -> pd.DataFrame:
    """Mode imputation + LabelEncoder for categorical columns."""
    print(f"      Imputing & encoding {len(cat_cols)} categorical cols with mode + LabelEncoder ...")
    for col in cat_cols:
        mode_val = df[col].mode()[0]
        df[col]  = df[col].fillna(mode_val)
        df[col]  = LabelEncoder().fit_transform(df[col])
    return df


def validate(df: pd.DataFrame, target: str) -> None:
    """Hard assertions — fail fast before writing any splits."""
    assert df.isnull().sum().sum() == 0, \
        f"[FAIL] NaN leak after imputation: {df.isnull().sum().sum()} remaining nulls"
    assert target in df.columns, \
        f"[FAIL] Target column '{target}' missing after preprocessing"
    assert df[target].nunique() == 2, \
        f"[FAIL] Expected 2 unique target values, got {df[target].nunique()}"
    print("[4/5] Validation passed: zero NaNs, binary TARGET intact")


# ---------------------------------------------------------------------------
# Phase 2: Dirichlet Non-IID Partitioning
# ---------------------------------------------------------------------------

def dirichlet_split(
    df: pd.DataFrame,
    target_col: str,
    n_clients: int,
    alpha: float,
    seed: int,
) -> list:
    """
    Split dataframe indices into n_clients Non-IID partitions.

    For each class c in {0, 1}:
      - Sample proportions p ~ Dir(alpha) of shape (n_clients,)
      - Distribute class-c samples across clients according to p

    Low alpha (0.5) => high heterogeneity across banks.
    Reproducible via seed.
    """
    rng = np.random.default_rng(seed)
    client_indices = [[] for _ in range(n_clients)]

    for cls in sorted(df[target_col].unique()):
        cls_idx = df.index[df[target_col] == cls].tolist()
        rng.shuffle(cls_idx)

        # Sample a Dirichlet proportion vector for this class
        proportions = rng.dirichlet([alpha] * n_clients)

        # Convert proportions -> integer split points
        cumulative = np.cumsum(proportions)
        split_pts  = (cumulative * len(cls_idx)).astype(int)[:-1]

        chunks = np.split(cls_idx, split_pts)
        for k, chunk in enumerate(chunks):
            client_indices[k].extend(chunk.tolist())

    return client_indices


def write_splits(df: pd.DataFrame, client_indices: list, names: list, out_dir: str) -> None:
    """Write each client's partition to a CSV file."""
    os.makedirs(out_dir, exist_ok=True)
    for name, indices in zip(names, client_indices):
        out_path = os.path.join(out_dir, f"{name}.csv")
        df.loc[indices].reset_index(drop=True).to_csv(out_path, index=False)
        print(f"      Written: {out_path}  ({len(indices):,} rows)")


# ---------------------------------------------------------------------------
# Verification Table
# ---------------------------------------------------------------------------

def print_verification_table(df: pd.DataFrame, client_indices: list, names: list, target: str) -> None:
    """Print a per-bank fraud rate table for human verification."""
    print("\n" + "="*60)
    print(f"  {'Bank':<10} {'Total Rows':>12} {'Fraud (1)':>12} {'Fraud Rate':>12}")
    print("="*60)
    for name, indices in zip(names, client_indices):
        subset     = df.loc[indices, target]
        total      = len(subset)
        fraud_cnt  = int(subset.sum())
        fraud_rate = fraud_cnt / total * 100 if total > 0 else 0.0
        print(f"  {name:<10} {total:>12,} {fraud_cnt:>12,} {fraud_rate:>11.2f}%")
    print("="*60)
    print()
    print("  Non-IID check: Fraud rates SHOULD differ significantly between banks.")
    print("  If all rates are ~8% (global base rate), alpha may be too high.\n")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    t_start = time.time()

    # --- Phase 1: Preprocessing ---
    df = load_and_drop_degenerate(RAW_CSV, NAN_THRESHOLD)
    cat_cols, num_cols = segregate_columns(df, TARGET_COL)
    df = impute_numerical(df, num_cols)
    df = impute_and_encode_categoricals(df, cat_cols)
    validate(df, TARGET_COL)

    # --- Phase 2: Dirichlet Split ---
    print(f"[5/5] Dirichlet split -> {N_CLIENTS} clients (alpha={ALPHA}, seed={SEED}) ...")
    client_indices = dirichlet_split(df, TARGET_COL, N_CLIENTS, ALPHA, SEED)
    write_splits(df, client_indices, CLIENT_NAMES, SPLITS_DIR)

    # --- Verification ---
    print_verification_table(df, client_indices, CLIENT_NAMES, TARGET_COL)

    elapsed = time.time() - t_start
    print(f"Done. Total time: {elapsed:.1f}s")
    print(f"Splits saved to : {os.path.abspath(SPLITS_DIR)}")


if __name__ == "__main__":
    if not os.path.exists(RAW_CSV):
        print(f"[ERROR] Raw CSV not found at: {RAW_CSV}")
        print("        Place application_train.csv in data/raw/ and retry.")
        sys.exit(1)
    main()
