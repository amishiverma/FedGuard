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
      {/* Top Floating Navbar (Joint Nav Bar) */}
      <header className="w-full max-w-7xl px-4 sm:px-6 py-2 sticky top-0 z-50">
        <div className="clay-card-cream w-full flex items-center justify-between px-5 py-1 shadow-xl rounded-full">
          <div
            onClick={() => window.location.href = "/"}
            className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
          >
            <img 
              src="/assets/logo.png" 
              alt="Logo" 
              className="w-28 sm:w-32 h-auto object-contain drop-shadow-md" 
            />
          </div>

          {/* Scene Switcher Pills -> Colored Underlines */}
          <nav className="hidden md:flex items-center gap-5">
            {[
              { id: 1, label: "Platform Overview", color: "text-indigo-600 border-indigo-600" },
              { id: 2, label: "Core Architecture", color: "text-emerald-600 border-emerald-600" },
              { id: 3, label: "Live Dashboard", color: "text-amber-600 border-amber-600" },
              { id: 4, label: "Compliance & Audit", color: "text-rose-600 border-rose-600" },
            ].map((scene) => (
              <button
                key={scene.id}
                onClick={() => setActiveScene(scene.id as 1 | 2 | 3 | 4)}
                className={`text-sm font-bold transition-all duration-300 border-b-[2.5px] pb-1 ${
                  activeScene === scene.id
                    ? scene.color
                    : "text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-300"
                }`}
              >
                {scene.label}
              </button>
            ))}
          </nav>
        </div>
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
              className="relative w-full min-h-[75vh] rounded-[2.5rem] overflow-hidden shadow-2xl flex items-center bg-cover bg-left"
              style={{ backgroundImage: "url('/assets/dashboard_bg.jpg')" }}
            >
              {/* Gradient overlay to ensure text readability on the right side */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-[#fff9f2]/90 md:via-white/50 md:to-[#fff9f2]/95"></div>
              
              <div className="relative w-full flex flex-col md:flex-row items-center justify-end px-6 sm:px-12 pt-24 pb-12 z-10 h-full">
                <div className="w-full md:w-[42%] flex flex-col items-start space-y-5">
                  
                  <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-[#1e293b] tracking-tight leading-[1.1]">
                    Financial Risk <br /> Intelligence. <br />
                    <span className="leading-tight mt-2 block">
                      <span className="text-[#6b46ff]">Zero </span>
                      <span className="text-[#0084ff]">Raw </span>
                      <span className="text-[#00b875]">Data </span>
                      <br />
                      <span className="text-[#ff9100]">Shared.</span>
                    </span>
                  </h1>

                  <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-md">
                    Train collaborative fraud and credit risk models across financial institutions without raw customer records ever leaving local vaults.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      onClick={() => setActiveScene(2)}
                      className="bg-[#5b54f9] hover:bg-indigo-600 transition-colors px-6 py-3.5 rounded-full font-bold text-xs flex items-center gap-2 text-white shadow-lg shadow-indigo-300/50"
                    >
                      <span>Get Started → Zoom Architecture</span>
                    </button>
                    <button
                      onClick={() => setActiveScene(3)}
                      className="bg-white hover:bg-slate-50 transition-colors px-6 py-3.5 rounded-full font-bold text-xs flex items-center gap-2 text-slate-800 shadow-xl shadow-slate-200/50 border border-slate-100"
                    >
                      <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-indigo-600 border-b-[4px] border-b-transparent ml-0.5" />
                      </div>
                      <span>Jump to Live Dashboard</span>
                    </button>
                  </div>

                  {/* 3 Bank Cards Grid (Restored) */}
                  <div className="w-full max-w-xl bg-white/40 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/60 mt-8">
                    <div className="flex items-center justify-between border-b border-slate-200/50 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-[9px] font-extrabold text-indigo-800 uppercase tracking-widest font-mono">
                          Live Architecture Nodes
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveScene(2)}
                        className="text-[9px] font-extrabold text-indigo-700 hover:underline flex items-center gap-1"
                      >
                        View Interactive Zoom <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-[#6b46ff]/10 backdrop-blur-sm rounded-xl p-3 space-y-2 border border-[#6b46ff]/20">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-indigo-950">Bank A (HDFC)</span>
                        </div>
                        <div className="text-[10px] text-indigo-900 font-medium leading-snug">Local Kaggle Dataset<br/>94,935 Transactions</div>
                      </div>

                      <div className="bg-[#00b875]/10 backdrop-blur-sm rounded-xl p-3 space-y-2 border border-[#00b875]/20">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-emerald-950">Bank B (ICICI)</span>
                        </div>
                        <div className="text-[10px] text-emerald-900 font-medium leading-snug">Local Kaggle Dataset<br/>94,936 Transactions</div>
                      </div>

                      <div className="bg-[#ff9100]/10 backdrop-blur-sm rounded-xl p-3 space-y-2 border border-[#ff9100]/20">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-amber-950">FinTech C (PhonePe)</span>
                        </div>
                        <div className="text-[10px] text-amber-900 font-medium leading-snug">Local Kaggle Dataset<br/>94,936 Transactions</div>
                      </div>
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
              <div className="clay-card-cream p-5 sm:p-8 space-y-6 shadow-2xl relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase tracking-wider">
                      Scene 2 • Magnified Architecture Focus
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                      Collaborative Training Network (archvideo.mp4)
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveScene(3)}
                    className="clay-btn-lavender px-4 py-2 text-[10px] font-extrabold flex items-center gap-1 text-white"
                  >
                    <span>Proceed to Live Training Console</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>

                {/* Looping Architecture Video Card */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-xl bg-slate-900">
                  <ScrollVideoPlayer src="/assets/archvideo.mp4" speed={0.5} />
                </div>

                {/* Main 3D Node Mesh */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Bank A Card */}
                  <div className="clay-card-lavender p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center text-indigo-700 font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-white/80 text-indigo-950">
                        Node 01
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-indigo-950">Bank A (HDFC)</h3>
                    <p className="text-[10px] text-indigo-900 font-medium leading-relaxed">
                      Trains local XGBoost & PyTorch NN model on siloed credit default data. Applies Opacus DP noise before exporting gradients.
                    </p>
                  </div>

                  {/* Bank B Card */}
                  <div className="clay-card-mint p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center text-emerald-800 font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-white/80 text-emerald-950">
                        Node 02
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-emerald-950">Bank B (ICICI)</h3>
                    <p className="text-[10px] text-emerald-900 font-medium leading-relaxed">
                      Trains local credit card fraud detection model on internal records. Implements FedProx regularization for Non-IID data.
                    </p>
                  </div>

                  {/* FinTech C Card */}
                  <div className="clay-card-yellow p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center text-amber-900 font-bold">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-white/80 text-amber-950">
                        Node 03
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-amber-950">FinTech C (PhonePe)</h3>
                    <p className="text-[10px] text-amber-900 font-medium leading-relaxed">
                      Trains UPI risk scoring model. Generates local SHAP feature importance values without exposing underlying customer profiles.
                    </p>
                  </div>
                </div>

                {/* Central Server Card (Soft Pink) */}
                <div
                  onMouseEnter={() => setShowServerSummary(true)}
                  onMouseLeave={() => setShowServerSummary(false)}
                  className="clay-card-pink p-5 space-y-3 text-center cursor-pointer relative shadow-2xl"
                >
                  <div className="w-10 h-10 mx-auto rounded-2xl bg-white/80 flex items-center justify-center text-rose-700 shadow-md">
                    <Server className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-extrabold text-rose-950">FedGuard FL Server (Flower)</h3>
                  <p className="text-[10px] text-rose-900 max-w-xl mx-auto font-medium">
                    Runs SecAgg+ protocol, FedAvg weight aggregation, and Cosine Similarity gradient checks to filter out corrupted updates.
                  </p>

                  {/* Hover Summary Overlay */}
                  <AnimatePresence>
                    {showServerSummary && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="clay-card-cream p-3 text-left text-[10px] font-mono text-slate-800 space-y-1 shadow-2xl border border-rose-200"
                      >
                        <div className="font-extrabold text-indigo-700 text-xs">Server Security Metrics</div>
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
              <div className="clay-card-cream p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
                <div>
                  <span className="text-[10px] font-mono font-extrabold text-indigo-700 uppercase">
                    Scene 3 • Live Training Console
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                    Federated Model Optimization (Round 1)
                  </h2>
                </div>
                <button
                  onClick={() => setActiveScene(4)}
                  className="clay-btn-lavender px-4 py-2 text-[10px] font-extrabold flex items-center gap-1 text-white"
                >
                  <span>View Audit Log & Compliance</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* 3 Metric Clay Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Metric 1: Accuracy Counter */}
                <div className="clay-card-lavender p-5 space-y-1.5 relative overflow-hidden flex justify-between items-center group">
                  <div className="space-y-1 z-10">
                    <div className="text-[9px] font-extrabold text-indigo-900/80 uppercase tracking-widest">Global Model Accuracy</div>
                    <div className="text-3xl font-extrabold text-[#3730a3] font-sans tracking-tighter">
                      {(counterVal * 100).toFixed(0)}%
                    </div>
                    <div className="text-[9px] text-indigo-800 font-bold flex items-center gap-1 pt-1">
                      <TrendingUp className="w-3 h-3 text-indigo-600" /> AUC Score improved from 0.78 to 0.92
                    </div>
                  </div>
                  <div className="z-10 bg-white/40 shadow-inner p-3 rounded-2xl border border-white/60 backdrop-blur-sm group-hover:scale-105 transition-transform duration-300">
                    <BarChart3 className="w-6 h-6 text-[#3730a3]" />
                  </div>
                </div>

                {/* Metric 2: Privacy Budget Gauge */}
                <div className="clay-card-peach p-5 space-y-1.5 relative overflow-hidden flex justify-between items-center group">
                  <div className="space-y-1 z-10">
                    <div className="text-[9px] font-extrabold text-[#9a3412]/80 uppercase tracking-widest">Privacy Budget Consumed (ε)</div>
                    <div className="text-3xl font-extrabold text-[#d97706] font-sans tracking-tighter">
                      ε = {gaugeVal.toFixed(2)}
                    </div>
                    <div className="text-[9px] text-[#b45309] font-bold flex items-center gap-1 pt-1">
                      <ShieldCheck className="w-3 h-3 text-[#d97706]" /> Target ε = 1.0 (Strong Privacy Guarantee)
                    </div>
                  </div>
                  <div className="z-10 bg-white/50 shadow-inner p-3 rounded-2xl border border-white/60 backdrop-blur-sm group-hover:scale-105 transition-transform duration-300">
                    <Lock className="w-6 h-6 text-[#d97706]" />
                  </div>
                </div>

                {/* Metric 3: Bank Node Status */}
                <div className="clay-card-mint p-5 space-y-1.5 relative overflow-hidden flex justify-between items-center group">
                  <div className="space-y-1 z-10">
                    <div className="text-[9px] font-extrabold text-emerald-900/80 uppercase tracking-widest">Bank Node Status</div>
                    <div className="text-lg font-extrabold text-[#065f46] flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                      <span className="tracking-tighter">{bankStatus}</span>
                    </div>
                    <div className="text-[9px] text-emerald-800 font-bold pt-1">
                      3/3 Financial Institutions Synchronized
                    </div>
                  </div>
                  <div className="z-10 bg-white/40 shadow-inner p-3 rounded-2xl border border-white/60 backdrop-blur-sm group-hover:scale-105 transition-transform duration-300">
                    <Building2 className="w-6 h-6 text-[#065f46]" />
                  </div>
                </div>
              </div>

              {/* Live Loss Curve Chart */}
              <div className="bg-white/80 backdrop-blur-xl p-5 shadow-xl rounded-[1.5rem] border border-white/60">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
                  <div className="font-extrabold text-sm text-[#1e1b4b] flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#4f46e5]" />
                    <span>Improved Global Model — Loss & Accuracy Progress</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-[#4338ca] bg-[#e0e7ff] px-2.5 py-1 rounded-full shadow-inner flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#6366f1] rounded-full inline-block mr-1.5"></span> Round 1 Active
                  </span>
                </div>

                <div className="h-32 w-full mt-5 rounded-2xl flex items-end justify-between gap-2.5 relative px-1">
                  {[
                    { h: 0.2, c: 'from-[#e0e7ff] to-[#c7d2fe]', border: 'border-[#818cf8]' },
                    { h: 0.35, c: 'from-[#93c5fd] to-[#60a5fa]', border: 'border-[#3b82f6]' },
                    { h: 0.45, c: 'from-[#60a5fa] to-[#3b82f6]', border: 'border-[#2563eb]' },
                    { h: 0.55, c: 'from-[#d8b4fe] to-[#c084fc]', border: 'border-[#a855f7]' },
                    { h: 0.65, c: 'from-[#f0abfc] to-[#e879f9]', border: 'border-[#d946ef]' },
                    { h: 0.75, c: 'from-[#f9a8d4] to-[#f472b6]', border: 'border-[#ec4899]' },
                    { h: 0.9, c: 'from-[#fdba74] to-[#fb923c]', border: 'border-[#f97316]' },
                  ].map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end relative group z-10">
                      {/* Floating dot */}
                      <div 
                        className={`absolute w-1.5 h-1.5 rounded-full border bg-white shadow-sm transition-all duration-700 ${bar.border}`}
                        style={{ bottom: `calc(${bar.h * chartProgress * 100}% + 20px)` }}
                      />
                      {/* Bar */}
                      <div
                        className={`w-full bg-gradient-to-b ${bar.c} transition-all duration-700 rounded-xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_4px_6px_rgba(0,0,0,0.05)]`}
                        style={{ height: `${bar.h * chartProgress * 100}%` }}
                      />
                      <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">R{idx + 1}</span>
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
              <div className="clay-card-cream p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
                <div>
                  <span className="text-[10px] font-mono font-extrabold text-indigo-700 uppercase">
                    Scene 4 • Regulatory Audit & Compliance
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                    Immutable Audit Trail & Legal Mapping
                  </h2>
                </div>
                <button
                  onClick={() => setActiveScene(1)}
                  className="clay-btn-lavender px-4 py-2 text-[10px] font-extrabold flex items-center gap-1 text-white"
                >
                  <span>Return to Hero</span>
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Regulatory Mapping Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="clay-card-lavender p-4 space-y-2 shadow-xl">
                  <div className="flex items-center gap-2 text-indigo-950 font-extrabold text-sm">
                    <Scale className="w-4 h-4 text-indigo-700" />
                    <span>India DPDP Act 2023 Mapping</span>
                  </div>
                  <p className="text-[10px] text-indigo-900 leading-relaxed font-medium">
                    Satisfies Section 4 & 6 data minimization provisions. Customer personal data never leaves local bank servers; only noisy weight gradients are shared.
                  </p>
                </div>

                <div className="clay-card-mint p-4 space-y-2 shadow-xl">
                  <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>EU GDPR Article 25 & 32 Compliance</span>
                  </div>
                  <p className="text-[10px] text-emerald-900 leading-relaxed font-medium">
                    Complies with Privacy-by-Design mandates and state-of-the-art cryptographic security via SecAgg+ protocol and Differential Privacy accounting.
                  </p>
                </div>
              </div>

              {/* TanStack Table-Style Audit Log */}
              <div className="clay-card-cream p-4 space-y-3 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-indigo-600" />
                    <span>SQLite Append-Only Audit Trail</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500">3 Log Entries Recorded</span>
                </div>

                <div className="space-y-2 font-mono text-[10px]">
                  {[
                    { id: 1, round: "Round 1", bank: "Bank A (HDFC)", eps: "0.27", hash: "0x8f3a...91bc", time: "12:04:15 PM" },
                    { id: 2, round: "Round 1", bank: "Bank B (ICICI)", eps: "0.28", hash: "0x4b7c...29ae", time: "12:04:16 PM" },
                    { id: 3, round: "Round 1", bank: "FinTech C (PhonePe)", eps: "0.27", hash: "0x1d9e...88fa", time: "12:04:17 PM" },
                  ].map((row) => (
                    <div
                      key={row.id}
                      onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                      className="clay-card-lavender p-3 space-y-1.5 cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <div className="flex items-center justify-between font-bold text-indigo-950">
                        <span>{row.round} • {row.bank}</span>
                        <span className="text-indigo-800">Spent ε = {row.eps}</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-indigo-900 font-medium">
                        <span>Gradient Hash: {row.hash}</span>
                        <span>{row.time}</span>
                      </div>

                      {expandedRow === row.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="pt-1.5 border-t border-indigo-200 text-[9px] text-indigo-950 space-y-1"
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
