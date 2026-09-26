"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Server,
  Building2,
  Smartphone,
  Play,
  RotateCcw,
  TrendingUp,
  Activity,
  Layers,
  ArrowRight,
  Lock,
  Sparkles,
  CheckCircle,
  FileCheck2,
  ChevronRight,
  Info,
} from "lucide-react";

export default function FedGuardClayInteractivePrototype() {
  // Navigation scenes: 1 = Federated Network, 2 = Global Monitoring, 3 = Privacy & Compliance
  const [activeScene, setActiveScene] = useState<1 | 2 | 3>(1);

  // Scene 1 State: Training trigger and countdown flow
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [countdownText, setCountdownText] = useState<string>("");
  const [dataFlowActive, setDataFlowActive] = useState<boolean>(false);

  // Scene 2 State: Animated Counter and Chart
  const [counterVal, setCounterVal] = useState<number>(0.78);
  const [bankStatus, setBankStatus] = useState<"Idle" | "Training...">("Idle");

  // Scene 3 State: Gauge sweep
  const [gaugeVal, setGaugeVal] = useState<number>(0.0);

  // Handle "Start Training" in Scene 1
  const handleStartTraining = () => {
    setIsTraining(true);
    setCountdownText("Round 1 Initiated...");
    setDataFlowActive(false);

    // After 1.2s start pulsing gradient arrows
    setTimeout(() => {
      setDataFlowActive(true);
    }, 1200);
  };

  const handleResetScene1 = () => {
    setIsTraining(false);
    setCountdownText("");
    setDataFlowActive(false);
  };

  // Scene 2 animations trigger on entry
  useEffect(() => {
    if (activeScene === 2) {
      setBankStatus("Idle");
      setCounterVal(0.78);

      // Smooth climb from 0.78 to 0.92
      const startTime = Date.now();
      const duration = 2000;
      const startVal = 0.78;
      const endVal = 0.92;

      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Eased climb
        const current = startVal + (endVal - startVal) * (1 - Math.pow(1 - progress, 3));
        setCounterVal(parseFloat(current.toFixed(2)));

        if (progress >= 1) {
          clearInterval(timer);
        }
      }, 30);

      // Toggle bank status after 600ms
      const statusTimer = setTimeout(() => {
        setBankStatus("Training...");
      }, 700);

      return () => {
        clearInterval(timer);
        clearTimeout(statusTimer);
      };
    }
  }, [activeScene]);

  // Scene 3 gauge sweep on entry
  useEffect(() => {
    if (activeScene === 3) {
      setGaugeVal(0.0);
      const startTime = Date.now();
      const duration = 1800;
      const target = 0.82;

      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        const current = target * (1 - Math.pow(1 - progress, 3));
        setGaugeVal(parseFloat(current.toFixed(2)));

        if (progress >= 1) {
          clearInterval(timer);
        }
      }, 30);

      return () => clearInterval(timer);
    }
  }, [activeScene]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Top Claymorphic Nav & Breadcrumb */}
      <header className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-[#f8fafc] border border-white/80 rounded-[28px] p-5 shadow-[10px_14px_24px_rgba(166,175,195,0.35),-8px_-8px_20px_rgba(255,255,255,0.95)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[22px] bg-gradient-to-tr from-sky-400 to-teal-300 flex items-center justify-center text-white shadow-[4px_6px_12px_rgba(14,165,233,0.35)]">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              FedGuard
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                FinTech Risk Platform
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Privacy-Preserving Federated Intelligence Prototype
            </p>
          </div>
        </div>

        {/* 3-Scene Stepper Tabs */}
        <nav className="flex items-center gap-2 p-1.5 bg-[#e9eff5] rounded-full shadow-[inset_3px_3px_6px_rgba(166,175,195,0.35),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]">
          <button
            onClick={() => setActiveScene(1)}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
              activeScene === 1
                ? "bg-white text-sky-700 shadow-[4px_6px_14px_rgba(14,165,233,0.25)]"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>1.</span> Network Overview
          </button>
          <button
            onClick={() => setActiveScene(2)}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
              activeScene === 2
                ? "bg-white text-sky-700 shadow-[4px_6px_14px_rgba(14,165,233,0.25)]"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>2.</span> Global Monitoring
          </button>
          <button
            onClick={() => setActiveScene(3)}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
              activeScene === 3
                ? "bg-white text-sky-700 shadow-[4px_6px_14px_rgba(14,165,233,0.25)]"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>3.</span> Privacy Insights
          </button>
        </nav>
      </header>

      {/* Dynamic Content Container */}
      <main className="w-full">
        <AnimatePresence mode="wait">
          {/* ================= SCENE 1: THE FEDERATED NETWORK OVERVIEW ================= */}
          {activeScene === 1 && (
            <motion.section
              key="scene-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="w-full flex flex-col items-center"
            >
              <div className="w-full clay-card p-6 md:p-10 relative overflow-hidden flex flex-col items-center">
                {/* Scene Description & Action Bar */}
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-slate-800">
                      Federated Network Architecture
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Collaborative training without centralizing customer records. Click the central server to jump to monitoring.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isTraining ? (
                      <button
                        onClick={handleStartTraining}
                        className="clay-btn px-6 py-2.5 text-xs font-bold flex items-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        Start Training
                      </button>
                    ) : (
                      <button
                        onClick={handleResetScene1}
                        className="clay-btn-secondary px-5 py-2.5 text-xs font-bold flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Animated Countdown Text Banner */}
                <div className="h-10 flex items-center justify-center mb-6">
                  <AnimatePresence>
                    {countdownText && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-800 text-xs font-extrabold shadow-[4px_6px_12px_rgba(186,230,253,0.5)] flex items-center gap-2"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
                        {countdownText}
                        {dataFlowActive && (
                          <span className="text-[11px] text-teal-600 font-semibold ml-2">
                            • Transmitting Encrypted Gradients Only
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Network Canvas (Center FL Server + 3 Peripheral Banks) */}
                <div className="relative w-full max-w-[850px] h-[480px] bg-[#f0f4f9] rounded-[36px] shadow-[inset_6px_6px_14px_rgba(166,175,195,0.35),inset_-6px_-6px_14px_rgba(255,255,255,0.9)] p-6 flex items-center justify-center overflow-hidden">
                  {/* Background Soft Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Bank A (left) to Center (425, 240) */}
                    <line
                      x1="180"
                      y1="160"
                      x2="425"
                      y2="240"
                      stroke="#cbd5e1"
                      strokeWidth="3"
                      strokeDasharray="6 6"
                    />
                    {/* Bank B (bottom) to Center (425, 240) */}
                    <line
                      x1="425"
                      y1="380"
                      x2="425"
                      y2="240"
                      stroke="#cbd5e1"
                      strokeWidth="3"
                      strokeDasharray="6 6"
                    />
                    {/* PhonePe (right) to Center (425, 240) */}
                    <line
                      x1="670"
                      y1="160"
                      x2="425"
                      y2="240"
                      stroke="#cbd5e1"
                      strokeWidth="3"
                      strokeDasharray="6 6"
                    />

                    {/* Animated Data Flow: Only pulsing arrows moving FROM banks TOWARD the central server */}
                    {dataFlowActive && (
                      <>
                        {/* Flow Bank A -> Server */}
                        <g>
                          <circle r="6" fill="#0284c7">
                            <animateMotion
                              path="M 180 160 L 425 240"
                              dur="1.8s"
                              repeatCount="indefinite"
                            />
                          </circle>
                          <circle r="12" fill="#38bdf8" opacity="0.3">
                            <animateMotion
                              path="M 180 160 L 425 240"
                              dur="1.8s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        </g>

                        {/* Flow Bank B -> Server */}
                        <g>
                          <circle r="6" fill="#059669">
                            <animateMotion
                              path="M 425 380 L 425 240"
                              dur="1.8s"
                              repeatCount="indefinite"
                              begin="0.3s"
                            />
                          </circle>
                          <circle r="12" fill="#34d399" opacity="0.3">
                            <animateMotion
                              path="M 425 380 L 425 240"
                              dur="1.8s"
                              repeatCount="indefinite"
                              begin="0.3s"
                            />
                          </circle>
                        </g>

                        {/* Flow PhonePe -> Server */}
                        <g>
                          <circle r="6" fill="#0284c7">
                            <animateMotion
                              path="M 670 160 L 425 240"
                              dur="1.8s"
                              repeatCount="indefinite"
                              begin="0.6s"
                            />
                          </circle>
                          <circle r="12" fill="#38bdf8" opacity="0.3">
                            <animateMotion
                              path="M 670 160 L 425 240"
                              dur="1.8s"
                              repeatCount="indefinite"
                              begin="0.6s"
                            />
                          </circle>
                        </g>
                      </>
                    )}
                  </svg>

                  {/* Flow labels on path */}
                  {dataFlowActive && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <span className="absolute top-[170px] left-[260px] text-[10px] font-bold text-sky-700 bg-sky-100/90 border border-sky-300 px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                        Encrypted Gradients ➔
                      </span>
                      <span className="absolute bottom-[160px] text-[10px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                        Encrypted Gradients ▲
                      </span>
                      <span className="absolute top-[170px] right-[260px] text-[10px] font-bold text-sky-700 bg-sky-100/90 border border-sky-300 px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                        ➔ Encrypted Gradients
                      </span>
                    </div>
                  )}

                  {/* CENTRAL CIRCULAR NODE: 'FedGuard FL Server' (Clickable transition to Scene 2) */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setActiveScene(2)}
                    className="absolute z-20 w-40 h-40 rounded-full bg-gradient-to-br from-sky-100 via-white to-sky-200 border-2 border-white flex flex-col items-center justify-center p-3 text-center cursor-pointer shadow-[12px_16px_28px_rgba(186,215,233,0.7),-10px_-10px_24px_rgba(255,255,255,0.95),inset_2px_2px_6px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(186,215,233,0.3)] transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md mb-1.5">
                      <Server className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-800 leading-tight">
                      FedGuard FL Server
                    </span>
                    <span className="text-[10px] font-bold text-sky-600 flex items-center gap-1 mt-1 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                      View Dashboard <ChevronRight className="w-3 h-3" />
                    </span>
                  </motion.button>

                  {/* BANK NODE 1: HDFC Bank (Top Left) */}
                  <div className="absolute top-10 left-10 md:left-14 flex flex-col items-center">
                    <div className="clay-card-sky p-4 w-44 flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-2xl bg-white text-sky-600 flex items-center justify-center shadow-sm mb-1.5">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-extrabold text-slate-800">
                        HDFC Bank
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Node A • Tier-1
                      </span>
                    </div>
                    {/* Strict static text label beneath */}
                    <div className="mt-2 flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold shadow-sm">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      Raw Data STAYS HERE
                    </div>
                  </div>

                  {/* BANK NODE 2: PhonePe (Top Right) */}
                  <div className="absolute top-10 right-10 md:right-14 flex flex-col items-center">
                    <div className="clay-card-sky p-4 w-44 flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-2xl bg-white text-sky-600 flex items-center justify-center shadow-sm mb-1.5">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-extrabold text-slate-800">
                        PhonePe
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Node C • UPI FinTech
                      </span>
                    </div>
                    {/* Strict static text label beneath */}
                    <div className="mt-2 flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold shadow-sm">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      Raw Data STAYS HERE
                    </div>
                  </div>

                  {/* BANK NODE 3: ICICI Bank (Bottom Center) */}
                  <div className="absolute bottom-6 flex flex-col items-center">
                    <div className="clay-card-mint p-4 w-44 flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-sm mb-1.5">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-extrabold text-slate-800">
                        ICICI Bank
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Node B • Retail Banking
                      </span>
                    </div>
                    {/* Strict static text label beneath */}
                    <div className="mt-2 flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold shadow-sm">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      Raw Data STAYS HERE
                    </div>
                  </div>
                </div>

                {/* Bottom Tip */}
                <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Info className="w-4 h-4 text-sky-500" />
                  <span>
                    Zero raw data ever leaves any bank perimeter. Only DP-noised mathematical weights are transmitted.
                  </span>
                </div>
              </div>
            </motion.section>
          )}

          {/* ================= SCENE 2: GLOBAL MONITORING DASHBOARD ================= */}
          {activeScene === 2 && (
            <motion.section
              key="scene-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="w-full flex flex-col gap-6"
            >
              {/* Scene 2 Header & Direct Transition Button */}
              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/70 backdrop-blur-sm rounded-[24px] p-5 border border-white shadow-[6px_8px_18px_rgba(166,175,195,0.25)]">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-800">
                    Global Monitoring Dashboard
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Aggregated model performance and real-time bank participation states.
                  </p>
                </div>

                {/* Transition Button to Scene 3 */}
                <button
                  onClick={() => setActiveScene(3)}
                  className="clay-btn px-6 py-2.5 text-xs font-bold flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Privacy Insights ➔
                </button>
              </div>

              {/* Metrics & Graph Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* PRIMARY METRIC CARD: Global AUC-ROC Animated Counter (0.78 -> 0.92) */}
                <div className="clay-card-sky p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
                      Primary Risk Metric
                    </span>
                    <span className="w-8 h-8 rounded-full bg-white text-sky-600 flex items-center justify-center shadow-sm">
                      <TrendingUp className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="my-5">
                    <div className="text-xs text-slate-500 font-semibold mb-1">
                      Global AUC-ROC
                    </div>
                    {/* Animated Number Counter */}
                    <div className="text-5xl font-black text-slate-800 tracking-tight flex items-baseline gap-2">
                      <span>{counterVal.toFixed(2)}</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                        +14% Lift
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-1">
                      Starting baseline: 0.78 ➔ Cross-bank peak: 0.92
                    </div>
                  </div>

                  <div className="pt-3 border-t border-sky-200/60 flex items-center justify-between text-[11px] text-sky-900 font-semibold">
                    <span>Target Threshold: 0.90</span>
                    <span className="text-emerald-700">✓ Target Achieved</span>
                  </div>
                </div>

                {/* LIVE LINE CHART CARD: Model Accuracy Trend over 10 Rounds */}
                <div className="clay-card p-6 md:col-span-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800">
                        Model Accuracy Trend
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Federated learning convergence curve across 10 rounds
                      </p>
                    </div>
                    <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                      10 Rounds Active
                    </span>
                  </div>

                  {/* SVG Line Chart with rising curve animation */}
                  <div className="relative w-full h-44 bg-[#f1f5f9] rounded-[20px] p-3 flex items-end shadow-[inset_3px_3px_8px_rgba(166,175,195,0.35)] overflow-hidden">
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 500 150"
                      preserveAspectRatio="none"
                    >
                      {/* Grid lines */}
                      <line x1="0" y1="30" x2="500" y2="30" stroke="#e2e8f0" strokeWidth="1" />
                      <line x1="0" y1="75" x2="500" y2="75" stroke="#e2e8f0" strokeWidth="1" />
                      <line x1="0" y1="120" x2="500" y2="120" stroke="#e2e8f0" strokeWidth="1" />

                      {/* Rising Curve Gradient Fill */}
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        d="M 20 125 C 100 115, 180 85, 260 60 C 340 38, 420 28, 480 22 L 480 145 L 20 145 Z"
                        fill="url(#clayChartGrad)"
                        opacity="0.25"
                      />

                      {/* Animated Rising Stroke */}
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        d="M 20 125 C 100 115, 180 85, 260 60 C 340 38, 420 28, 480 22"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />

                      <defs>
                        <linearGradient id="clayChartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Round markers at bottom */}
                    <div className="absolute bottom-1 inset-x-4 flex justify-between text-[9px] text-slate-400 font-bold">
                      <span>R1 (78%)</span>
                      <span>R3 (82%)</span>
                      <span>R5 (86%)</span>
                      <span>R8 (90%)</span>
                      <span className="text-sky-700 font-extrabold">R10 (94.2%)</span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Loss: 0.142 (Converged)</span>
                    <span className="text-slate-400 font-mono">Algorithm: FedProx (μ=0.01)</span>
                  </div>
                </div>
              </div>

              {/* THREE STATUS CARDS: Bank A, B, C toggling status from 'Idle' to 'Training...' with fade */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Bank A Status Card */}
                <div className="clay-card p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800">
                        Bank A (HDFC)
                      </h4>
                      <p className="text-[11px] text-slate-500">120,400 Records</p>
                    </div>
                    <span className="w-8 h-8 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                      A
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Node Status:</span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={bankStatus}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.3 }}
                        className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                          bankStatus === "Training..."
                            ? "bg-sky-100 text-sky-700 border border-sky-300"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {bankStatus === "Training..." && (
                          <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                        )}
                        {bankStatus}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Bank B Status Card */}
                <div className="clay-card p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800">
                        Bank B (ICICI)
                      </h4>
                      <p className="text-[11px] text-slate-500">95,800 Records</p>
                    </div>
                    <span className="w-8 h-8 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      B
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Node Status:</span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={bankStatus}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.3 }}
                        className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                          bankStatus === "Training..."
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {bankStatus === "Training..." && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        )}
                        {bankStatus}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Bank C Status Card */}
                <div className="clay-card p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800">
                        Bank C (PhonePe)
                      </h4>
                      <p className="text-[11px] text-slate-500">182,300 Records</p>
                    </div>
                    <span className="w-8 h-8 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      C
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Node Status:</span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={bankStatus}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.3 }}
                        className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                          bankStatus === "Training..."
                            ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {bankStatus === "Training..." && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                        )}
                        {bankStatus}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* ================= SCENE 3: PRIVACY & COMPLIANCE PANEL ================= */}
          {activeScene === 3 && (
            <motion.section
              key="scene-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="w-full flex flex-col gap-6"
            >
              {/* Scene 3 Header */}
              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/70 backdrop-blur-sm rounded-[24px] p-5 border border-white shadow-[6px_8px_18px_rgba(166,175,195,0.25)]">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-800">
                    Privacy Budget &amp; Regulatory Compliance
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Opacus Differential Privacy accounting with strict statutory linkages.
                  </p>
                </div>

                <button
                  onClick={() => setActiveScene(1)}
                  className="clay-btn-secondary px-5 py-2.5 text-xs font-bold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restart Cycle
                </button>
              </div>

              {/* Main Gauge & Compliance Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* PROMINENT PRIVACY BUDGET GAUGE (ε) */}
                <div className="lg:col-span-5 clay-card p-6 flex flex-col items-center justify-between text-center">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Privacy Budget Gauge (ε)
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Rényi DP Accountant
                    </span>
                  </div>

                  {/* Needle Gauge SVG */}
                  <div className="relative w-64 h-36 mt-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 200 110">
                      {/* Gauge Arch Background (0.0 to 1.0) */}
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="14"
                        strokeLinecap="round"
                      />
                      {/* Safe zone (0 to 0.7: mint green) */}
                      <path
                        d="M 20 100 A 80 80 0 0 1 130 32"
                        fill="none"
                        stroke="#86efac"
                        strokeWidth="14"
                        strokeLinecap="round"
                      />
                      {/* Warning zone (0.7 to 1.0: soft amber) */}
                      <path
                        d="M 130 32 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#fde047"
                        strokeWidth="14"
                        strokeLinecap="round"
                      />

                      {/* Sweeping Needle (-90deg to +90deg based on gaugeVal 0.0 to 1.0) */}
                      {/* 0.0 corresponds to -90 deg, 1.0 corresponds to +90 deg */}
                      {/* 0.82 corresponds to -90 + (180 * 0.82) = 57.6 deg */}
                      <g transform="translate(100, 100)">
                        <motion.line
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="-68"
                          stroke="#0284c7"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          style={{
                            transformOrigin: "bottom center",
                            transform: `rotate(${-90 + gaugeVal * 180}deg)`,
                            transition: "transform 0.05s linear",
                          }}
                        />
                        <circle cx="0" cy="0" r="7" fill="#0284c7" />
                        <circle cx="0" cy="0" r="3" fill="#ffffff" />
                      </g>
                    </svg>

                    {/* Scale ticks */}
                    <div className="absolute bottom-0 inset-x-3 flex justify-between text-[10px] font-bold text-slate-400">
                      <span>0.0</span>
                      <span>0.5</span>
                      <span>1.0</span>
                    </div>
                  </div>

                  {/* Animated Value Readout */}
                  <div className="mt-4 bg-sky-50 border border-sky-200/80 px-5 py-2.5 rounded-full shadow-[4px_6px_12px_rgba(186,230,253,0.4)]">
                    <span className="text-xl font-black text-sky-900 tracking-tight">
                      ε = {gaugeVal.toFixed(2)}
                    </span>
                    <span className="text-xs text-sky-700 font-semibold ml-2">
                      (Target Limit: 1.00)
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium mt-3">
                    Gaussian noise σ=1.0 and clipping norm C=1.0 applied at each batch, mathematically bounding risk.
                  </p>
                </div>

                {/* REGULATORY COMPLIANCE MAPPING */}
                <div className="lg:col-span-7 clay-card p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                        Regulatory Compliance Mapping
                      </h3>
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        100% Audit Verified
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* DPDP Act Card (Hover gentle glow effect) */}
                      <motion.div
                        whileHover={{
                          scale: 1.015,
                          boxShadow: "0 0 20px rgba(56, 189, 248, 0.45)",
                        }}
                        transition={{ duration: 0.2 }}
                        className="clay-card-sky p-4 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-white text-sky-600 flex items-center justify-center font-bold text-xs shadow-sm">
                              <FileCheck2 className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-slate-800">
                                Digital Personal Data Protection (DPDP) Act
                              </h4>
                              <p className="text-[11px] text-sky-800 font-semibold">
                                Section 4 &amp; 8 — Principle of Purpose Limitation &amp; Siloed Processing
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-sky-700 bg-white/80 px-2.5 py-1 rounded-full border border-sky-200">
                            Compliant
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-2.5 pl-10">
                          Raw customer transactions never cross corporate boundaries. Zero data centralization complies with India&apos;s data residency and purpose specifications.
                        </p>
                      </motion.div>

                      {/* GDPR Card (Hover gentle glow effect) */}
                      <motion.div
                        whileHover={{
                          scale: 1.015,
                          boxShadow: "0 0 20px rgba(74, 222, 128, 0.45)",
                        }}
                        transition={{ duration: 0.2 }}
                        className="clay-card-mint p-4 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-white text-emerald-600 flex items-center justify-center font-bold text-xs shadow-sm">
                              <FileCheck2 className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-slate-800">
                                General Data Protection Regulation (GDPR)
                              </h4>
                              <p className="text-[11px] text-emerald-800 font-semibold">
                                Article 25 &amp; 32 — Data Protection by Design &amp; Pseudonymisation
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-700 bg-white/80 px-2.5 py-1 rounded-full border border-emerald-200">
                            Compliant
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-2.5 pl-10">
                          Differential privacy provides formal mathematical bounds against reconstruction attacks, satisfying state-of-the-art technical security mandates.
                        </p>
                      </motion.div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Audit Mechanism: Immutable Append-Only Ledger</span>
                    <span className="font-mono text-slate-400">Hash: sha256:7f9a2b8c...</span>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Navigation Hints */}
      <footer className="w-full max-w-4xl mt-10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-medium border-t border-slate-300/50">
        <div>FedGuard • Federated Financial Risk Intelligence Platform</div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveScene(1)}
            className="hover:text-sky-600 transition"
          >
            Scene 1: Network
          </button>
          <span>•</span>
          <button
            onClick={() => setActiveScene(2)}
            className="hover:text-sky-600 transition"
          >
            Scene 2: Monitoring
          </button>
          <span>•</span>
          <button
            onClick={() => setActiveScene(3)}
            className="hover:text-sky-600 transition"
          >
            Scene 3: Privacy
          </button>
        </div>
      </footer>
    </div>
  );
}
