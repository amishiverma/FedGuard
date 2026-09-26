"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollVideoPlayer from "./ScrollVideoPlayer";
import {
  ShieldCheck,
  Server,
  Building2,
  Smartphone,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Lock,
  CheckCircle2,
  FileCheck2,
  ChevronRight,
  ChevronDown,
  Info,
  Play,
  RotateCcw,
  Zap,
  Globe,
  Database,
  Sliders,
  ExternalLink,
  Scale,
  Users,
  BarChart3,
  CreditCard,
  Banknote,
  FileText,
  ShoppingBag
} from "lucide-react";

export default function FedGuardInteractiveFourScenePrototype() {
  // 4 Scenes: 1 = Landing Page Hero, 2 = Architecture Deep Dive, 3 = Live Dashboard, 4 = Compliance & Audit Panel
  const [activeScene, setActiveScene] = useState<1 | 2 | 3 | 4>(1);

  // Scene 2 state: server hover summary panel
  const [showServerSummary, setShowServerSummary] = useState<boolean>(false);

  // Scene 3 state: automated training sequence
  const [bankStatus, setBankStatus] = useState<"Idle" | "Training Round 1...">("Idle");
  const [counterVal, setCounterVal] = useState<number>(0.78);
  const [chartProgress, setChartProgress] = useState<number>(0);
  const [gaugeVal, setGaugeVal] = useState<number>(0.0);
  const [dataFlowActive, setDataFlowActive] = useState<boolean>(false);

  // Scene 4 state: selected audit log row expansion
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // When navigating to Scene 3, automatically initiate the training animation sequence
  useEffect(() => {
    if (activeScene === 3) {
      setBankStatus("Idle");
      setCounterVal(0.78);
      setChartProgress(0);
      setGaugeVal(0.0);
      setDataFlowActive(false);

      const t1 = setTimeout(() => {
        setDataFlowActive(true);
        setBankStatus("Training Round 1...");
      }, 400);

      const startTime = Date.now();
      const duration = 2200;
      const counterTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        const current = 0.78 + (0.92 - 0.78) * (1 - Math.pow(1 - progress, 3));
        setCounterVal(parseFloat(current.toFixed(2)));
        setChartProgress(progress);

        if (progress >= 1) clearInterval(counterTimer);
      }, 40);

      const gaugeStartTime = Date.now();
      const gaugeDuration = 2200;
      const gaugeTimer = setInterval(() => {
        const elapsed = Date.now() - gaugeStartTime;
        const progress = Math.min(1, elapsed / gaugeDuration);
        const current = 0.82 * (1 - Math.pow(1 - progress, 3));
        setGaugeVal(parseFloat(current.toFixed(2)));

        if (progress >= 1) clearInterval(gaugeTimer);
      }, 40);

      return () => {
        clearTimeout(t1);
        clearInterval(counterTimer);
        clearInterval(gaugeTimer);
      };
    }
  }, [activeScene]);

  return (
    <div className="w-full min-h-screen text-slate-800 flex flex-col items-center select-none font-sans pb-12 bg-[#fcf6ee]">
      {/* Top Floating Navbar (3D Claymorphism Pill Header) */}
      <header className="w-full max-w-7xl px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div
          onClick={() => setActiveScene(1)}
          className="clay-card-cream px-5 py-2.5 flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              FedGuard
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                3D Clay Console
              </span>
            </div>
          </div>
        </div>

        {/* Scene Switcher Pills */}
        <nav className="clay-card-cream p-1.5 flex items-center gap-1.5 shadow-xl">
          {[
            { id: 1, label: "1. Landing Hero" },
            { id: 2, label: "2. Architecture" },
            { id: 3, label: "3. Live Dashboard" },
            { id: 4, label: "4. Compliance & Audit" },
          ].map((scene) => (
            <button
              key={scene.id}
              onClick={() => setActiveScene(scene.id as 1 | 2 | 3 | 4)}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-full transition-all ${
                activeScene === scene.id
                  ? "clay-btn-lavender shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {scene.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Prototype View Stage */}
      <main className="w-full max-w-7xl px-4 sm:px-6 pt-6">
        <AnimatePresence mode="wait">
          {/* ========================================================================= */}
          {/* SCENE 1: LANDING PAGE HERO (ANCHOR STATE) */}
          {/* ========================================================================= */}
          {activeScene === 1 && (
            <motion.div
              key="scene-1"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="space-y-10"
            >
              {/* Hero Banner Card */}
              <div className="clay-card-cream p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-800 font-extrabold text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>3D CLAYMORPHISM INTERACTIVE FL PROTOTYPE</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Financial Risk Intelligence. <br />
                  <span className="bg-gradient-to-r from-indigo-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
                    Zero Raw Data Shared.
                  </span>
                </h1>

                <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                  Train collaborative fraud and credit risk models across financial institutions without raw customer records ever leaving local vaults.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <button
                    onClick={() => setActiveScene(2)}
                    className="clay-btn-lavender px-8 py-4 font-extrabold text-sm flex items-center gap-2 text-white"
                  >
                    <span>Get Started → Zoom Architecture</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <button
                    onClick={() => setActiveScene(3)}
                    className="clay-btn-mint px-7 py-4 font-extrabold text-sm flex items-center gap-2 text-white"
                  >
                    <span>Jump to Live Dashboard</span>
                  </button>
                </div>
              </div>

              {/* 3D Flow Preview Card (image_2.png styled) */}
              <div className="clay-card-cream p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-extrabold text-indigo-700 uppercase font-mono">
                      image_2.png Interactive Architecture Reference
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveScene(2)}
                    className="text-xs font-extrabold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    View Interactive Zoom <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 3 Bank Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="clay-card-lavender p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-indigo-950">Bank A (HDFC)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/80 text-indigo-900 font-bold">Lavender 3D</span>
                    </div>
                    <div className="text-xs text-indigo-900 font-medium">Local Kaggle Dataset • 94,935 Transactions</div>
                    <div className="clay-card-cream p-2 text-[10px] font-mono font-bold text-indigo-900 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-indigo-600" /> Protected Local Updates Only
                    </div>
                  </div>

                  <div className="clay-card-mint p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-emerald-950">Bank B (ICICI)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/80 text-emerald-900 font-bold">Mint 3D</span>
                    </div>
                    <div className="text-xs text-emerald-900 font-medium">Local Kaggle Dataset • 94,936 Transactions</div>
                    <div className="clay-card-cream p-2 text-[10px] font-mono font-bold text-emerald-900 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-600" /> Protected Local Updates Only
                    </div>
                  </div>

                  <div className="clay-card-yellow p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-amber-950">FinTech C (PhonePe)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/80 text-amber-950 font-bold">Yellow 3D</span>
                    </div>
                    <div className="text-xs text-amber-900 font-medium">Local Kaggle Dataset • 94,936 Transactions</div>
                    <div className="clay-card-cream p-2 text-[10px] font-mono font-bold text-amber-900 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-700" /> Protected Local Updates Only
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* SCENE 2: ARCHITECTURE DEEP DIVE (FOCUS STATE) */}
          {/* ========================================================================= */}
          {activeScene === 2 && (
            <motion.div
              key="scene-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="clay-card-cream p-6 sm:p-10 space-y-8 shadow-2xl relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-700 uppercase tracking-wider">
                      Scene 2 • Magnified Architecture Focus
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                      Collaborative Training Network (archvideo.mp4)
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveScene(3)}
                    className="clay-btn-lavender px-5 py-2.5 text-xs font-extrabold flex items-center gap-1.5 text-white"
                  >
                    <span>Proceed to Live Training Console</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Looping Architecture Video Card */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-xl bg-slate-900">
                  <ScrollVideoPlayer src="/assets/archvideo.mp4" speed={0.5} />
                </div>

                {/* Main 3D Node Mesh */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Bank A Card */}
                  <div className="clay-card-lavender p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center text-indigo-700 font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-full bg-white/80 text-indigo-950">
                        Node 01
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-indigo-950">Bank A (HDFC)</h3>
                    <p className="text-xs text-indigo-900 font-medium leading-relaxed">
                      Trains local XGBoost & PyTorch NN model on siloed credit default data. Applies Opacus DP noise before exporting gradients.
                    </p>
                  </div>

                  {/* Bank B Card */}
                  <div className="clay-card-mint p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center text-emerald-800 font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-full bg-white/80 text-emerald-950">
                        Node 02
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-emerald-950">Bank B (ICICI)</h3>
                    <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                      Trains local credit card fraud detection model on internal records. Implements FedProx regularization for Non-IID data.
                    </p>
                  </div>

                  {/* FinTech C Card */}
                  <div className="clay-card-yellow p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center text-amber-900 font-bold">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-full bg-white/80 text-amber-950">
                        Node 03
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-amber-950">FinTech C (PhonePe)</h3>
                    <p className="text-xs text-amber-900 font-medium leading-relaxed">
                      Trains UPI risk scoring model. Generates local SHAP feature importance values without exposing underlying customer profiles.
                    </p>
                  </div>
                </div>

                {/* Central Server Card (Soft Pink) */}
                <div
                  onMouseEnter={() => setShowServerSummary(true)}
                  onMouseLeave={() => setShowServerSummary(false)}
                  className="clay-card-pink p-8 space-y-4 text-center cursor-pointer relative shadow-2xl"
                >
                  <div className="w-14 h-14 mx-auto rounded-3xl bg-white/80 flex items-center justify-center text-rose-700 shadow-md">
                    <Server className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-rose-950">FedGuard FL Server (Flower)</h3>
                  <p className="text-xs text-rose-900 max-w-xl mx-auto font-medium">
                    Runs SecAgg+ protocol, FedAvg weight aggregation, and Cosine Similarity gradient checks to filter out corrupted updates.
                  </p>

                  {/* Hover Summary Overlay */}
                  <AnimatePresence>
                    {showServerSummary && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="clay-card-cream p-4 text-left text-xs font-mono text-slate-800 space-y-1 shadow-2xl border border-rose-200"
                      >
                        <div className="font-extrabold text-indigo-700 text-sm">Server Security Metrics</div>
                        <div>✓ Flower flwr 1.x Secure Aggregation Active</div>
                        <div>✓ Cosine Similarity Threshold: 0.85 (Zero Poisoning)</div>
                        <div>✓ SQLite Audit Log Append-Only Status: Immutable</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* SCENE 3: LIVE DASHBOARD & AUTOMATED TRAINING METRICS */}
          {/* ========================================================================= */}
          {activeScene === 3 && (
            <motion.div
              key="scene-3"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Dashboard Banner */}
              <div className="clay-card-cream p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div>
                  <span className="text-xs font-mono font-extrabold text-indigo-700 uppercase">
                    Scene 3 • Live Training Console
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                    Federated Model Optimization (Round 1)
                  </h2>
                </div>
                <button
                  onClick={() => setActiveScene(4)}
                  className="clay-btn-lavender px-5 py-2.5 text-xs font-extrabold flex items-center gap-1.5 text-white"
                >
                  <span>View Audit Log & Compliance</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* 3 Metric Clay Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metric 1: Accuracy Counter */}
                <div className="clay-card-lavender p-6 space-y-3 shadow-xl">
                  <div className="text-xs font-mono font-bold text-indigo-900 uppercase">Global Model Accuracy</div>
                  <div className="text-4xl font-extrabold text-indigo-950 font-mono">
                    {(counterVal * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-indigo-900 font-bold flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-indigo-700" /> AUC Score improved from 0.78 to 0.92
                  </div>
                </div>

                {/* Metric 2: Privacy Budget Gauge */}
                <div className="clay-card-pink p-6 space-y-3 shadow-xl">
                  <div className="text-xs font-mono font-bold text-rose-900 uppercase">Privacy Budget Consumed (ε)</div>
                  <div className="text-4xl font-extrabold text-rose-950 font-mono">
                    ε = {gaugeVal.toFixed(2)}
                  </div>
                  <div className="text-xs text-rose-900 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-rose-700" /> Target ε = 1.0 (Strong Privacy Guarantee)
                  </div>
                </div>

                {/* Metric 3: Bank Node Status */}
                <div className="clay-card-mint p-6 space-y-3 shadow-xl">
                  <div className="text-xs font-mono font-bold text-emerald-900 uppercase">Bank Node Status</div>
                  <div className="text-lg font-extrabold text-emerald-950 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-600 animate-pulse" />
                    <span>{bankStatus}</span>
                  </div>
                  <div className="text-xs text-emerald-900 font-medium">
                    3/3 Financial Institutions Synchronized
                  </div>
                </div>
              </div>

              {/* Live Loss Curve Chart (3D Card matching image_2.png style) */}
              <div className="clay-card-cream p-8 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    <span>Improved Global Model — Loss & Accuracy Progress</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                    Round 1 Active
                  </span>
                </div>

                <div className="h-44 w-full bg-slate-50/80 rounded-2xl p-4 flex items-end justify-between gap-3 border border-slate-200">
                  {[0.4, 0.55, 0.65, 0.75, 0.82, 0.88, 0.92].map((height, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div
                        className="w-full clay-card-lavender transition-all duration-700 rounded-t-xl"
                        style={{ height: `${height * chartProgress * 100}%` }}
                      />
                      <span className="text-[10px] font-mono text-slate-500 font-bold">R{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* SCENE 4: COMPLIANCE & AUDIT LOG PANEL */}
          {/* ========================================================================= */}
          {activeScene === 4 && (
            <motion.div
              key="scene-4"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Scene 4 Banner */}
              <div className="clay-card-cream p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div>
                  <span className="text-xs font-mono font-extrabold text-indigo-700 uppercase">
                    Scene 4 • Regulatory Audit & Compliance
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                    Immutable Audit Trail & Legal Mapping
                  </h2>
                </div>
                <button
                  onClick={() => setActiveScene(1)}
                  className="clay-btn-lavender px-5 py-2.5 text-xs font-extrabold flex items-center gap-1.5 text-white"
                >
                  <span>Return to Hero</span>
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Regulatory Mapping Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="clay-card-lavender p-6 space-y-3 shadow-xl">
                  <div className="flex items-center gap-2 text-indigo-950 font-extrabold text-base">
                    <Scale className="w-5 h-5 text-indigo-700" />
                    <span>India DPDP Act 2023 Mapping</span>
                  </div>
                  <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                    Satisfies Section 4 & 6 data minimization provisions. Customer personal data never leaves local bank servers; only noisy weight gradients are shared.
                  </p>
                </div>

                <div className="clay-card-mint p-6 space-y-3 shadow-xl">
                  <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-base">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    <span>EU GDPR Article 25 & 32 Compliance</span>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                    Complies with Privacy-by-Design mandates and state-of-the-art cryptographic security via SecAgg+ protocol and Differential Privacy accounting.
                  </p>
                </div>
              </div>

              {/* TanStack Table-Style Audit Log */}
              <div className="clay-card-cream p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-indigo-600" />
                    <span>SQLite Append-Only Audit Trail</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">3 Log Entries Recorded</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {[
                    { id: 1, round: "Round 1", bank: "Bank A (HDFC)", eps: "0.27", hash: "0x8f3a...91bc", time: "12:04:15 PM" },
                    { id: 2, round: "Round 1", bank: "Bank B (ICICI)", eps: "0.28", hash: "0x4b7c...29ae", time: "12:04:16 PM" },
                    { id: 3, round: "Round 1", bank: "FinTech C (PhonePe)", eps: "0.27", hash: "0x1d9e...88fa", time: "12:04:17 PM" },
                  ].map((row) => (
                    <div
                      key={row.id}
                      onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                      className="clay-card-lavender p-4 space-y-2 cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <div className="flex items-center justify-between font-bold text-indigo-950">
                        <span>{row.round} • {row.bank}</span>
                        <span className="text-indigo-800">Spent ε = {row.eps}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-indigo-900 font-medium">
                        <span>Gradient Hash: {row.hash}</span>
                        <span>{row.time}</span>
                      </div>

                      {expandedRow === row.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="pt-2 border-t border-indigo-200 text-[10px] text-indigo-950 space-y-1"
                        >
                          <div>✓ Cosine Similarity Poisoning Score: 0.98 (Passed)</div>
                          <div>✓ Opacus Differential Privacy Gaussian Noise Added: (delta=1e-5)</div>
                          <div>✓ SQLite Audit Signature: Verified</div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
