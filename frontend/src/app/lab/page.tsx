"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, FlaskConical, ShieldAlert, User, Cpu,
  CheckCircle2, XCircle, Zap, AlertTriangle, Shield,
  Activity, Brain, Wifi, WifiOff,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ThinFileResult {
  local_model: { status: string; confidence: number };
  global_model: { status: string; confidence: number };
  shap_insights: string[];
}

type AttackPhase = "idle" | "injecting" | "detected" | "blocked" | "safe";

// ─── Scene 1: Thin-File Persona Simulator ────────────────────────────────────

function ThinFilePanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ThinFileResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable inputs
  const [creditHistory, setCreditHistory] = useState(0);
  const [microTxns, setMicroTxns] = useState(47);
  const [networkTrust, setNetworkTrust] = useState(0.74);

  const runUnderwriting = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/evaluate-thin-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credit_history_months: creditHistory,
          num_micro_transactions: microTxns,
          network_trust_score: networkTrust,
        }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data: ThinFileResult = await res.json();
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="tab1"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      className="w-full max-w-5xl mx-auto space-y-6"
    >
      {/* Customer Profile Card */}
      <div className="clay-card-cream p-6 space-y-5">
        {/* Identity row */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full clay-card-lavender flex items-center justify-center shadow-lg flex-shrink-0">
            <User className="w-7 h-7 text-indigo-700" />
          </div>
          <div>
            <p className="text-xs font-mono text-slate-400 mb-0.5 uppercase tracking-widest">Loan Applicant</p>
            <h2 className="text-xl font-bold text-slate-800">Ravi Kumar</h2>
          </div>
          <span className="ml-auto text-[10px] font-mono text-indigo-400 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-full">
            ✏ Editable — try different values!
          </span>
        </div>

        {/* Editable input tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Credit History */}
          <div className="clay-inset-cream px-4 py-4 space-y-2">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Credit History</p>
            <p className="text-3xl font-black text-rose-500">{creditHistory}
              <span className="text-sm font-normal text-slate-400 ml-1">mo</span>
            </p>
            <input
              id="input-credit-history"
              type="range" min={0} max={120} step={1}
              value={creditHistory}
              onChange={(e) => { setCreditHistory(Number(e.target.value)); setResult(null); }}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>0 mo</span><span>120 mo</span>
            </div>
          </div>

          {/* Micro-Transactions */}
          <div className="clay-inset-cream px-4 py-4 space-y-2">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Micro-Transactions</p>
            <p className="text-3xl font-black text-indigo-600">{microTxns}
              <span className="text-sm font-normal text-slate-400 ml-1">txns</span>
            </p>
            <input
              id="input-micro-txns"
              type="range" min={0} max={200} step={1}
              value={microTxns}
              onChange={(e) => { setMicroTxns(Number(e.target.value)); setResult(null); }}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>0</span><span>200</span>
            </div>
          </div>

          {/* Network Trust Score */}
          <div className="clay-inset-cream px-4 py-4 space-y-2">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Network Trust Score</p>
            <p className="text-3xl font-black text-emerald-600">{networkTrust.toFixed(2)}</p>
            <input
              id="input-network-trust"
              type="range" min={0} max={1} step={0.01}
              value={networkTrust}
              onChange={(e) => { setNetworkTrust(parseFloat(e.target.value)); setResult(null); }}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>0.00</span><span>1.00</span>
            </div>
          </div>
        </div>

        <button
          id="run-underwriting-btn"
          onClick={runUnderwriting}
          disabled={loading}
          className="clay-btn-lavender px-6 py-3 text-sm font-bold flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed sm:ml-4 flex-shrink-0"
        >
          {loading ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
                <Cpu className="w-4 h-4" />
              </motion.div>
              Evaluating…
            </>
          ) : (
            <><Brain className="w-4 h-4" />Run AI Underwriting</>
          )}
        </button>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="clay-card-pink p-4 flex items-center gap-3 text-rose-800">
            <WifiOff className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-semibold">Backend unreachable — <span className="font-mono font-normal">{error}</span></p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Local Bank Model */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                className="clay-card-cream p-6 space-y-4 border-2 border-rose-200">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Local Bank Model</p>
                </div>
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-rose-500 flex-shrink-0" />
                  <div>
                    <p className="text-2xl font-black text-rose-600">{result.local_model.status}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Isolated — no cross-bank context</p>
                  </div>
                </div>
                <div className="clay-inset-cream p-3">
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">Confidence Score</p>
                  <p className="text-3xl font-black text-rose-500">{(result.local_model.confidence * 100).toFixed(1)}%</p>
                  <div className="mt-2 w-full h-2 rounded-full bg-rose-100 overflow-hidden">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600"
                      initial={{ width: 0 }} animate={{ width: `${result.local_model.confidence * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }} />
                  </div>
                </div>
                <p className="text-xs text-rose-700 bg-rose-50 rounded-xl px-3 py-2 font-mono">
                  ⚠ Thin credit file — insufficient history.
                </p>
              </motion.div>

              {/* Global FedGuard Model */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="clay-card-cream p-6 space-y-4 border-2 border-emerald-200">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Global FedGuard Model</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-2xl font-black text-emerald-600">{result.global_model.status}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Enriched by federated cross-bank intelligence</p>
                  </div>
                </div>
                <div className="clay-inset-cream p-3">
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">Confidence Score</p>
                  <p className="text-3xl font-black text-emerald-600">{(result.global_model.confidence * 100).toFixed(1)}%</p>
                  <div className="mt-2 w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                      initial={{ width: 0 }} animate={{ width: `${result.global_model.confidence * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }} />
                  </div>
                </div>
                <p className="text-xs text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2 font-mono">
                  ✓ Behavioural pattern confirms creditworthiness.
                </p>
              </motion.div>
            </div>

            {/* SHAP Insights */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="clay-card-cream p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-700">Explainable AI — Why FedGuard Approved</h3>
                <span className="ml-auto text-[10px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">SHAP Insights</span>
              </div>
              <ul className="space-y-2">
                {result.shap_insights.map((insight, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-black flex-shrink-0">{i + 1}</span>
                    {insight}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle State */}
      {!result && !loading && !error && (
        <div className="clay-inset-cream p-10 flex flex-col items-center justify-center text-center space-y-3">
          <Brain className="w-10 h-10 text-indigo-300" />
          <p className="text-sm text-slate-400 font-medium">
            Press <span className="font-bold text-indigo-500">Run AI Underwriting</span> to see the power of federated intelligence
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ─── Scene 2: Rogue Bank Attack Simulator ────────────────────────────────────

const TRUSTED_BANKS = [
  { id: "A", label: "Bank Alpha", color: "#10b981" },
  { id: "B", label: "Bank Beta",  color: "#6366f1" },
  { id: "C", label: "Bank Gamma", color: "#10b981" },
];

function RogueAttackPanel() {
  const [phase, setPhase] = useState<AttackPhase>("idle");
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = () => timeoutRefs.current.forEach(clearTimeout);

  const triggerAttack = () => {
    if (phase === "injecting" || phase === "detected" || phase === "blocked") return;
    clearAll();
    setPhase("injecting");
    const t1 = setTimeout(() => setPhase("detected"), 1800);
    const t2 = setTimeout(() => setPhase("blocked"),  3000);
    const t3 = setTimeout(() => setPhase("safe"),     5000);
    timeoutRefs.current = [t1, t2, t3];
  };

  useEffect(() => () => clearAll(), []);

  const phaseLabel: Record<AttackPhase, string> = {
    idle:      "System Nominal — All Nodes Trusted",
    injecting: "⚠  Malicious update detected in transit…",
    detected:  "🔍  Cosine Similarity: 0.42 < Threshold 0.85 — THREAT CONFIRMED",
    blocked:   "🛡  Byzantine Fault Tolerance — Poisoned weights DROPPED",
    safe:      "✓  System Integrity Restored — Rogue node quarantined",
  };

  const phaseCls: Record<AttackPhase, string> = {
    idle:      "text-emerald-700 bg-emerald-50 border-emerald-200",
    injecting: "text-amber-700 bg-amber-50 border-amber-200",
    detected:  "text-rose-700 bg-rose-50 border-rose-300",
    blocked:   "text-indigo-700 bg-indigo-50 border-indigo-200",
    safe:      "text-emerald-700 bg-emerald-50 border-emerald-200",
  };

  const showMalicious = phase !== "idle";
  const maliciousQuarantined = phase === "blocked" || phase === "safe";

  return (
    <motion.div
      key="tab2"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      className="w-full max-w-5xl mx-auto space-y-6"
    >
      {/* Status Banner */}
      <motion.div layout className={`clay-card-cream p-4 flex items-center gap-3 border-2 transition-colors duration-500 ${phaseCls[phase]}`}>
        <Activity className="w-5 h-5 flex-shrink-0" />
        <p className="font-mono text-sm font-bold">{phaseLabel[phase]}</p>
      </motion.div>

      {/* Network Diagram */}
      <div className="clay-card-cream p-6 sm:p-10">
        <div className="relative flex flex-col items-center gap-14">
          {/* Bank Nodes */}
          <div className="flex items-end justify-center gap-6 sm:gap-14 w-full">
            {TRUSTED_BANKS.map((bank, i) => (
              <motion.div key={bank.id} className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="relative">
                  <motion.div className="absolute inset-0 rounded-full" style={{ backgroundColor: bank.color, opacity: 0.2 }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.25, 0, 0.25] }}
                    transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.4 }} />
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg relative z-10"
                    style={{ background: `${bank.color}22`, border: `2px solid ${bank.color}` }}>
                    <span className="font-black text-lg" style={{ color: bank.color }}>{bank.id}</span>
                  </div>
                </div>
                <p className="text-[10px] font-mono text-slate-500">{bank.label}</p>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${bank.color}22`, color: bank.color }}>Trusted</span>
              </motion.div>
            ))}

            {/* Malicious Node */}
            <AnimatePresence>
              {showMalicious && (
                <motion.div className="flex flex-col items-center gap-2"
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: maliciousQuarantined ? 0.3 : 1, scale: maliciousQuarantined ? 0.7 : 1 }}
                  exit={{ opacity: 0, scale: 0.3 }}
                  transition={{ duration: 0.5 }}>
                  <div className="relative">
                    {phase === "injecting" && (
                      <motion.div className="absolute inset-0 rounded-full bg-rose-500"
                        animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ repeat: Infinity, duration: 0.8 }} />
                    )}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg relative z-10 bg-gradient-to-br from-rose-100 to-rose-200 border-2 border-rose-500">
                      <AlertTriangle className="w-7 h-7 text-rose-600" />
                    </div>
                  </div>
                  <p className="text-[10px] font-mono text-rose-500 font-bold">Node M</p>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold bg-rose-100 text-rose-600">
                    {maliciousQuarantined ? "Quarantined" : "MALICIOUS"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Poison beam + shield + FL Server */}
          <div className="relative flex flex-col items-center gap-3 w-full">
            {/* Poison beam */}
            <AnimatePresence>
              {phase === "injecting" && (
                <motion.div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div className="w-1 rounded-full bg-gradient-to-b from-rose-600 to-rose-300"
                    initial={{ height: 0 }} animate={{ height: 40 }} transition={{ duration: 0.5 }} />
                  <span className="text-[9px] font-mono text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 mt-1">
                    Poisoned weights →
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Shield */}
            <AnimatePresence>
              {maliciousQuarantined && (
                <motion.div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                  initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                  <Shield className="w-10 h-10 text-indigo-600 drop-shadow-lg" />
                  <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 mt-1">BLOCKED</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FL Server */}
            <motion.div className="clay-card-lavender px-8 py-4 flex flex-col items-center gap-2 shadow-2xl">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-700" />
                <span className="font-black text-indigo-800 text-sm">FL Aggregation Server</span>
              </div>
              <AnimatePresence>
                {(phase === "detected" || phase === "blocked") && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="mt-2 px-3 py-2 rounded-xl bg-rose-100 border border-rose-300 text-center">
                      <p className="text-[11px] font-mono font-black text-rose-700">⚠ Cosine Similarity: 0.42 &lt; Threshold 0.85</p>
                      <p className="text-[10px] text-rose-600 mt-0.5">Byzantine Fault Tolerance — Dropping update</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {phase === "safe" && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-[10px] font-mono text-indigo-600 font-semibold">
                  ✓ Aggregating 3 trusted gradients only
                </motion.p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <button id="inject-attack-btn" onClick={triggerAttack}
          disabled={phase === "injecting" || phase === "detected" || phase === "blocked"}
          className="clay-btn-pink px-6 py-3 text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          <ShieldAlert className="w-4 h-4" />
          Inject Poisoned Model Weights (Sybil Attack)
        </button>
        {phase === "safe" && (
          <button id="reset-attack-btn" onClick={() => setPhase("idle")}
            className="clay-btn-mint px-5 py-3 text-sm font-bold flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            Reset Simulation
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="clay-inset-cream p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { color: "#10b981", label: "Trusted Node",   desc: "Valid gradient update" },
          { color: "#f43f5e", label: "Malicious Node", desc: "Sybil / poisoned weights" },
          { color: "#6366f1", label: "FL Server",      desc: "Cosine similarity filter" },
          { color: "#6366f1", label: "Shield (BFT)",   desc: "Byzantine fault tolerant" },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" style={{ background: item.color }} />
            <div>
              <p className="text-[10px] font-bold text-slate-700">{item.label}</p>
              <p className="text-[9px] text-slate-400">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 1 as const, label: "X-Factor 1", sublabel: "Thin-File Persona Simulator",    icon: Brain,      color: "indigo" },
  { id: 2 as const, label: "X-Factor 2", sublabel: "Rogue Bank Attack Simulator", icon: ShieldAlert, color: "rose"   },
];

export default function LabPage() {
  const [activeTab, setActiveTab] = useState<1 | 2>(1);

  return (
    <main className="min-h-screen bg-[#fcf6ee] flex flex-col pb-16">
      {/* Nav */}
      <div className="w-full max-w-7xl mx-auto px-4 pt-4 flex items-center justify-between">
        <Link href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full clay-card-cream text-indigo-700 hover:scale-105 transition-transform shadow-md">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Main Console
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 font-bold">
          <FlaskConical className="w-4 h-4 text-indigo-400" />
          FedGuard Innovation Lab
        </div>
      </div>

      {/* Header */}
      <div className="w-full max-w-7xl mx-auto px-4 mt-8 mb-6 text-center">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-block text-[10px] font-mono font-bold tracking-widest uppercase text-indigo-400 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full mb-3">
            Simulation Lab
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 leading-tight">
            FedGuard&apos;s{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-rose-500 bg-clip-text text-transparent">X-Factor Innovations</span>
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
            Interactive demos of the two capabilities that set FedGuard apart.
          </p>
        </motion.div>
      </div>

      {/* Tab Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 mb-8">
        <div className="clay-card-cream p-2 inline-flex rounded-[28px] gap-2 w-full sm:w-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button key={tab.id} id={`tab-${tab.id}-btn`} onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 sm:flex-none flex items-center gap-3 px-5 py-3 rounded-2xl text-left transition-all duration-300 font-bold ${
                  isActive
                    ? tab.color === "indigo" ? "clay-btn-lavender text-white" : "clay-btn-pink text-white"
                    : "text-slate-500 hover:text-slate-700"
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="text-xs font-black">{tab.label}</p>
                  <p className={`text-[10px] font-normal ${isActive ? "text-white/80" : "text-slate-400"}`}>{tab.sublabel}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel */}
      <div className="w-full max-w-7xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {activeTab === 1 ? <ThinFilePanel key="panel-1" /> : <RogueAttackPanel key="panel-2" />}
        </AnimatePresence>
      </div>
    </main>
  );
}
