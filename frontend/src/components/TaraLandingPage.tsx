"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import ScrollVideoPlayer from "./ScrollVideoPlayer";
import {
  ShieldCheck,
  Lock,
  Cpu,
  Activity,
  FileCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Database,
  CheckCircle2,
  Server,
  Zap,
  EyeOff,
  GitPullRequest,
  Sliders,
  Scale,
  Sparkles,
  BarChart3,
} from "lucide-react";

export default function TaraLandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [currentScene, setCurrentScene] = useState<number>(1);
  const [btnPulse, setBtnPulse] = useState<boolean>(false);
  const [epsilon, setEpsilon] = useState<number>(0.85);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // ── SCENE TRACKER & STATE MACHINE (STRICT SCENE BREAKPOINTS) ──
  useMotionValueEvent(scrollYProgress, "change", (val) => {
    let scene = 1;
    if (val >= 0.80) scene = 5;
    else if (val >= 0.60) scene = 4;
    else if (val >= 0.40) scene = 3;
    else if (val >= 0.20) scene = 2;

    if (scene !== currentScene) {
      setCurrentScene(scene);
    }

    // Auto tab-switching in Scene 4 (0.60 -> 0.80)
    if (val >= 0.60 && val < 0.80) {
      const p = (val - 0.60) / 0.20;
      const idx = Math.min(3, Math.floor(p * 4));
      setActiveTab(idx);
      if (p > 0.80) {
        setBtnPulse(true);
        setEpsilon(parseFloat((0.85 + p * 0.15).toFixed(2)));
      } else {
        setBtnPulse(false);
      }
    }
  });

  // Data
  const problemCards = [
    {
      title: "Data Silos",
      desc: "HDFC, ICICI, PhonePe each see only their slice — fraudsters exploit the gaps between institutions.",
      icon: Database,
      cardClass: "clay-card-lavender",
      iconBg: "bg-indigo-500/20",
      iconColor: "text-indigo-700",
    },
    {
      title: "Privacy Regulations",
      desc: "DPDP Act 2023 & GDPR explicitly prohibit raw cross-institution customer data sharing.",
      icon: Lock,
      cardClass: "clay-card-pink",
      iconBg: "bg-rose-500/20",
      iconColor: "text-rose-700",
    },
    {
      title: "Weak Fraud Models",
      desc: "Isolated datasets produce fragile models that miss cross-bank fraud patterns entirely.",
      icon: AlertTriangle,
      cardClass: "clay-card-yellow",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-800",
    },
    {
      title: "Limited Risk Vision",
      desc: "Incomplete transaction history causes systemic errors — approving risky loans, denying good ones.",
      icon: BarChart3,
      cardClass: "clay-card-mint",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-700",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Download Global Model",
      subtitle: "Flower Engine Distribution",
      desc: "Bank A, Bank B, and FinTech C pull the latest neural network weights from the central Federated Server without transmitting any customer transactions.",
      tag: "Flower flwr 1.x",
      cardClass: "clay-card-lavender",
      iconColor: "text-indigo-600",
      accentBg: "bg-indigo-500/10",
      icon: Server,
    },
    {
      num: "02",
      title: "Local Institution Training",
      subtitle: "Siloed Data Remains On-Premise",
      desc: "Institutions train the model locally using Dirichlet Non-IID partitioned credit datasets (alpha=0.5). Raw transactions never leave the bank's secure vault.",
      tag: "Non-IID Partitioning",
      cardClass: "clay-card-mint",
      iconColor: "text-emerald-700",
      accentBg: "bg-emerald-500/10",
      icon: Database,
    },
    {
      num: "03",
      title: "Differential Privacy Noise",
      subtitle: "Opacus (ε, δ) Accounting",
      desc: "Calibrated Gaussian noise is injected into model gradients via PyTorch Opacus PrivacyEngine, creating mathematically protected weight updates.",
      tag: "Opacus DP Engine",
      cardClass: "clay-card-yellow",
      iconColor: "text-amber-800",
      accentBg: "bg-amber-500/10",
      icon: EyeOff,
    },
    {
      num: "04",
      title: "Secure Aggregation & Filtering",
      subtitle: "FedAvg + Cosine Poisoning Defense",
      desc: "The Federated Server applies SecAgg+ and Cosine Similarity gradient checks to filter out malicious updates, merging clean weights into an improved global model.",
      tag: "SecAgg + Defense",
      cardClass: "clay-card-pink",
      iconColor: "text-rose-700",
      accentBg: "bg-rose-500/10",
      icon: ShieldCheck,
    },
  ];

  const innovations = [
    {
      title: "Secure Aggregation (SecAgg+)",
      desc: "Even the central server cannot inspect individual bank gradient updates. Only the combined sum is decrypted.",
      badge: "Cryptographic Privacy",
      icon: Lock,
      cardClass: "clay-card-lavender",
    },
    {
      title: "Privacy Budget Tracker (ε-δ)",
      desc: "Live accounting gauge tracking spent Differential Privacy budget (epsilon) per round for complete transparency.",
      badge: "Opacus RDP",
      icon: Activity,
      cardClass: "clay-card-mint",
    },
    {
      title: "Non-IID Dirichlet Partitioning",
      desc: "Realistic heterogeneous label distributions across bank nodes (alpha=0.5) mimicking real-world banking imbalance.",
      badge: "Dirichlet Split",
      icon: Sliders,
      cardClass: "clay-card-yellow",
    },
    {
      title: "Append-Only Audit Trail",
      desc: "Immutable SQLite logging of every round timestamp, participant bank IDs, gradient hashes, and epsilon spent.",
      badge: "Regulatory Compliance",
      icon: FileCheck,
      cardClass: "clay-card-pink",
    },
    {
      title: "SHAP Feature Importance",
      desc: "Extract local SHAP values per institution to understand top credit risk predictors without exporting raw data.",
      badge: "Explainable AI",
      icon: BarChart3,
      cardClass: "clay-card-lavender",
    },
    {
      title: "Model Poisoning Detection",
      desc: "Cosine similarity filtering on incoming client weights to detect and drop malicious or corrupted bank updates.",
      badge: "Byzantine Defense",
      icon: AlertTriangle,
      cardClass: "clay-card-yellow",
    },
    {
      title: "Personalized FL (FedProx)",
      desc: "Proximal regularization term added to local objective functions to optimize performance for each bank's unique portfolio.",
      badge: "FedProx Regularizer",
      icon: GitPullRequest,
      cardClass: "clay-card-mint",
    },
    {
      title: "Compliance Mapping Panel",
      desc: "Explicit UI mapping of system mechanisms to specific articles of India's DPDP Act 2023 and EU GDPR.",
      badge: "DPDP & GDPR",
      icon: Scale,
      cardClass: "clay-card-pink",
    },
  ];

  const currentStep = steps[activeTab];
  const StepIcon = currentStep.icon;

  return (
    <>
      {/* ── LAYER 1 (Lowest, z-index: -10): HUGE FADED BACKGROUND WATERMARK TEXT ── */}
      <div className="fixed inset-0 pointer-events-none z-[-10] flex flex-col items-center justify-center select-none overflow-hidden opacity-[0.035]">
        <div className="text-[11vw] font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap leading-none">
          INTELLIGENCE ZERO
        </div>
        <div className="text-[11vw] font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap leading-none">
          RAW DATA SHARED
        </div>
      </div>

      {/* ── LAYER 3 (Top, z-index: 999): STICKY NAVBAR WITH SCENE DOTS ── */}
      <header className="fixed top-4 left-0 right-0 z-[999] px-4 sm:px-8 pointer-events-none">
        <div className="max-w-7xl mx-auto clay-card-cream px-6 py-3.5 flex items-center justify-between shadow-xl pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
              <ShieldCheck className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">FedGuard</span>
              <span className="hidden sm:inline-block ml-2.5 text-[10px] uppercase font-bold font-mono px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                3D Claymorphism AI
              </span>
            </div>
          </div>

          {/* Scene indicator dots */}
          <div className="hidden md:flex items-center gap-3">
            {["Hero", "Problem", "Architecture", "FL Cycle", "Innovations"].map((label, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${currentScene === i + 1
                    ? "bg-indigo-600 scale-125 shadow-sm shadow-indigo-400"
                    : "bg-slate-300"
                    }`}
                />
                <span
                  className={`text-[10px] transition-colors duration-300 ${currentScene === i + 1
                    ? "text-indigo-700 font-bold"
                    : "text-slate-400 font-semibold"
                    }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/dashboard"
            className="clay-btn-lavender px-5 py-2.5 font-bold text-xs tracking-wide flex items-center gap-2"
          >
            <span>Launch Console</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>
      </header>

      {/* ── SCROLL CONTAINER (500vh drives the scrollytelling timeline) ── */}
      <div ref={containerRef} style={{ height: "500vh" }} className="relative">

        {/* ── LAYER 2 (Middle): STICKY 100VH VIEWPORT ── */}
        <div
          style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}
          className="w-full bg-[#fcf6ee] text-slate-800 font-sans relative"
        >
          {/* ── GLOBAL FULL-BLEED VIDEO BACKGROUND (heropg.mp4) ── */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
            <ScrollVideoPlayer
              src="/assets/heropg.mp4"
              speed={0.75}
              className="w-full h-full object-cover scale-105"
            />
            {/* Soft global gradient scrim so text and cards across all scenes are perfectly legible */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#fcf6ee]/10 via-[#fcf6ee]/10 to-[#fcf6ee]/10 backdrop-blur-[1px]" />
          </div>

          {/* Ambient background blur blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute -top-[10%] -left-[5%] w-[50vw] h-[50vw] rounded-full bg-indigo-200/25 blur-[100px]" />
            <div className="absolute top-[30%] -right-[5%] w-[45vw] h-[45vw] rounded-full bg-rose-200/20 blur-[100px]" />
            <div className="absolute bottom-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-emerald-200/20 blur-[100px]" />
          </div>

          {/* ── DISCRETE SCENE SWITCHER ── */}
          <AnimatePresence mode="wait">

            {/* ============================================================
                SCENE 1 — HERO: FULL-BLEED VIDEO BACKGROUND WITH LEFT-ALIGNED CONTENT
                ============================================================ */}
            {currentScene === 1 && (
              <motion.section
                key="scene-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 pt-16 z-10 overflow-hidden"
              >
                {/* FOREGROUND CONTENT (Left-Aligned Text & Controls) */}
                <div className="max-w-7xl mx-auto w-full relative z-10">
                  <div className="max-w-2xl text-left space-y-6">

                    {/* Top Tag */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100/90 text-indigo-700 font-mono font-extrabold text-[11px] tracking-widest uppercase border border-indigo-200 shadow-sm backdrop-blur-md">
                      <span>PRIVACY</span>
                      <span>/</span>
                      <span>COLLABORATION</span>
                      <span>/</span>
                      <span>FORESIGHT</span>
                    </div>

                    {/* Main H1 Title */}
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.08]">
                      Financial Risk Intelligence. <br />
                      <span className="bg-gradient-to-r from-indigo-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
                        Zero Raw Data Shared.
                      </span>
                    </h1>

                    {/* Subtitle Paragraph */}
                    <p className="text-slate-700 text-base sm:text-lg font-medium leading-relaxed max-w-xl">
                      A privacy-preserving federated AI platform where banks collaboratively train fraud &amp; credit risk models — protected by Differential Privacy, SecAgg, and fully auditable by design.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <Link
                        href="/dashboard"
                        className="clay-btn-lavender px-8 py-4 font-extrabold text-sm flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
                      >
                        <span>Explore Interactive Prototype</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </Link>

                      <button
                        onClick={() => {
                          window.scrollTo({ top: window.innerHeight * 2, behavior: "smooth" });
                        }}
                        className="clay-btn-cream px-7 py-4 font-extrabold text-sm text-slate-800 flex items-center gap-2 shadow-md hover:bg-slate-100 transition-colors backdrop-blur-md"
                      >
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <span className="text-[10px] pl-0.5">▶</span>
                        </div>
                        <span>View 3D Data Flow</span>
                      </button>
                    </div>

                    {/* 3 Pill Badges */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs font-semibold">
                      <span className="px-4 py-2 rounded-full bg-white/90 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1.5 text-xs shadow-sm backdrop-blur-md">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> DPDP Act &amp; GDPR Compliant
                      </span>
                      <span className="px-4 py-2 rounded-full bg-white/90 text-indigo-800 border border-indigo-300 font-bold flex items-center gap-1.5 text-xs shadow-sm backdrop-blur-md">
                        <Lock className="w-4 h-4 text-indigo-600" /> Opacus Differential Privacy (ε,δ)
                      </span>
                      <span className="px-4 py-2 rounded-full bg-white/90 text-amber-900 border border-amber-300 font-bold flex items-center gap-1.5 text-xs shadow-sm backdrop-blur-md">
                        <Server className="w-4 h-4 text-amber-700" /> Flower FL 1.x Framework
                      </span>
                    </div>

                  </div>
                </div>
              </motion.section>
            )}

            {/* ============================================================
                SCENE 2 — THE PROBLEM: THE UNFOLDING MORPH
                ============================================================ */}
            {currentScene === 2 && (
              <motion.section
                key="scene-2"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-8 pt-20 z-10"
              >
                <div className="w-full max-w-6xl mx-auto space-y-10">
                  <div className="text-center space-y-3">
                    <span className="text-xs font-mono font-bold text-rose-600 uppercase tracking-widest px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 shadow-sm">
                      Industry Pain Points
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                      Why Traditional Banking Risk Systems Fail
                    </h2>
                    <p className="text-slate-600 text-base font-medium max-w-2xl mx-auto">
                      Financial institutions operate in isolated silos — leaving critical blindspots that fraudsters exploit.
                    </p>
                  </div>

                  {/* 4-column Grid with Staggered Spring Physics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {problemCards.map((card, i) => {
                      const CardIcon = card.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 30, scale: 0.92 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: i * 0.08, type: "spring", stiffness: 220, damping: 22 }}
                          className={`${card.cardClass} p-6 sm:p-8 space-y-4 shadow-xl overflow-hidden`}
                        >
                          <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center font-bold shadow-inner`}>
                            <CardIcon className={`w-6 h-6 ${card.iconColor}`} />
                          </div>
                          <h3 className="text-lg font-extrabold text-slate-950">{card.title}</h3>
                          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                            {card.desc}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.section>
            )}

            {/* ============================================================
                SCENE 3 — ARCHITECTURE: VIDEO FOCUS (USING SCROLLVIDEOPLAYER)
                ============================================================ */}
            {currentScene === 3 && (
              <motion.section
                key="scene-3"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-8 pt-20 z-10"
              >
                <div className="w-full max-w-5xl mx-auto space-y-5">
                  <div className="text-center space-y-2">
                    <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 shadow-sm">
                      Architecture Deep Dive
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                      How FedGuard Enables Cross-Bank Collaboration
                    </h2>
                  </div>

                  <div className="clay-card-cream p-4 sm:p-6 shadow-2xl space-y-3 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <motion.span
                          animate={{ scale: [1, 1.8, 1], opacity: [1, 0.3, 1] }}
                          transition={{ repeat: Infinity, duration: 0.85 }}
                          className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-400"
                        />
                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider font-mono">
                          Live 3D Architecture Flow Animation (Continuous Loop)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-extrabold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                        archvideo.mp4 · 0.75× speed
                      </span>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 shadow-xl bg-slate-900 max-w-4xl mx-auto">
                      <ScrollVideoPlayer src="/assets/archvideo.mp4" speed={0.75} />
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center text-xs font-bold pt-1">
                      <div className="clay-card-lavender p-2.5 rounded-2xl overflow-hidden">
                        <div className="text-indigo-950 font-extrabold">3 Institutions</div>
                        <div className="text-[10px] text-indigo-700 font-mono">HDFC · ICICI · PhonePe</div>
                      </div>
                      <div className="clay-card-mint p-2.5 rounded-2xl overflow-hidden">
                        <div className="text-emerald-950 font-extrabold">Zero Raw Data</div>
                        <div className="text-[10px] text-emerald-700 font-mono">Encrypted Gradients Only</div>
                      </div>
                      <div className="clay-card-pink p-2.5 rounded-2xl overflow-hidden">
                        <div className="text-rose-950 font-extrabold">AUC 0.947</div>
                        <div className="text-[10px] text-rose-700 font-mono">Global Model Score</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* ============================================================
                SCENE 4 — 4-STEP CYCLE: INTERACTIVE STATE MACHINE
                ============================================================ */}
            {currentScene === 4 && (
              <motion.section
                key="scene-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="fl-cycle-section absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-8 pt-20 z-10 overflow-y-visible"
              >
                <div className="w-full max-w-5xl mx-auto space-y-5">
                  <div className="text-center space-y-2">
                    <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-widest px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 shadow-sm">
                      The FL Pipeline
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                      4-Step Federated Learning Cycle
                    </h2>
                  </div>

                  {/* Step Navigation Tabs */}
                  <div className="flex items-center gap-2 justify-center flex-wrap">
                    {steps.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTab(idx)}
                        className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${activeTab === idx
                          ? "clay-btn-lavender shadow-md scale-105"
                          : "clay-btn-cream text-slate-700"
                          }`}
                      >
                        <span>{s.num}.</span>
                        <span>{s.title}</span>
                      </button>
                    ))}
                  </div>

                  {/* Active / Large Content Card (ISOLATED MODAL OVERLAY IN SECTION BOUNDARIES) */}
                  <div className="w-full relative z-[1000] overflow-hidden rounded-[2.5rem]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -15 }}
                        transition={{ type: "spring", stiffness: 280, damping: 26 }}
                        className={`${currentStep.cardClass} p-7 sm:p-10 shadow-2xl relative overflow-hidden border-2 border-white/80`}
                      >
                        <div className="flex flex-col sm:flex-row gap-7 items-start">
                          <div className={`${currentStep.accentBg} rounded-3xl p-5 flex-shrink-0 shadow-inner`}>
                            <StepIcon className={`w-12 h-12 ${currentStep.iconColor} stroke-[1.5]`} />
                          </div>
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-4xl font-black opacity-20 font-mono">{currentStep.num}</span>
                              <div>
                                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                                  {currentStep.title}
                                </h3>
                                <p className="text-xs font-mono font-semibold opacity-70">{currentStep.subtitle}</p>
                              </div>
                            </div>
                            <p className="text-sm sm:text-base leading-relaxed opacity-90 font-medium max-w-xl text-slate-800">
                              {currentStep.desc}
                            </p>
                            <span className="inline-block px-4 py-1.5 rounded-full bg-white/70 text-xs font-bold uppercase tracking-wider shadow-sm">
                              {currentStep.tag}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Bottom row: epsilon + simulate FL round button */}
                  <div className="flex items-center justify-between px-2 pt-1">
                    <div className="text-xs font-mono text-slate-600">
                      Privacy budget: <span className="font-bold text-indigo-700">epsilon = {epsilon}</span> / 1.0
                    </div>
                    <motion.button
                      animate={
                        btnPulse
                          ? {
                            boxShadow: [
                              "0 0 0px 0px rgba(99,102,241,0)",
                              "0 0 24px 8px rgba(99,102,241,0.45)",
                              "0 0 0px 0px rgba(99,102,241,0)",
                            ],
                            scale: [1, 1.04, 1],
                          }
                          : {}
                      }
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="clay-btn-lavender px-6 py-3 text-xs font-bold flex items-center gap-2 shadow-md"
                    >
                      <Zap className="w-4 h-4" />
                      {btnPulse ? "Round Complete!" : "Simulate FL Round"}
                    </motion.button>
                  </div>
                </div>
              </motion.section>
            )}

            {/* ============================================================
                SCENE 5 — COMPLIANCE & CTA: ENTRY
                ============================================================ */}
            {currentScene === 5 && (
              <motion.section
                key="scene-5"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col items-center justify-between px-4 sm:px-8 pt-20 pb-4 z-10 overflow-y-auto"
              >
                <div className="w-full max-w-6xl mx-auto space-y-6">
                  <div className="text-center space-y-2 pt-2">
                    <span className="text-xs font-mono font-bold text-amber-800 uppercase tracking-widest px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 shadow-sm">
                      Our Winning Edge
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                      8 Technical Innovations Powering FedGuard
                    </h2>
                  </div>

                  {/* 8-card Innovations Grid softly fading in */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {innovations.map((inn, i) => {
                      const InnIcon = inn.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`${inn.cardClass} p-4 space-y-2 shadow-md overflow-hidden`}
                        >
                          <InnIcon className="w-5 h-5 opacity-70" />
                          <div className="font-extrabold text-xs leading-snug">{inn.title}</div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 font-bold uppercase tracking-wider inline-block">
                            {inn.badge}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* CTA Banner */}
                  <div className="clay-card-lavender p-6 sm:p-8 text-center space-y-4 shadow-2xl border-2 border-white/80">
                    <h2 className="text-xl sm:text-3xl font-extrabold text-indigo-950 tracking-tight">
                      Ready to test collaborative risk intelligence?
                    </h2>
                    <p className="text-indigo-900 text-xs sm:text-sm max-w-xl mx-auto font-medium">
                      Experience the 4-scene interactive dashboard with live gradient flow animations, accuracy metrics, and audit log.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <motion.div
                        animate={{
                          boxShadow: [
                            "0 0 0px 0px rgba(16,185,129,0)",
                            "0 0 24px 8px rgba(16,185,129,0.4)",
                            "0 0 0px 0px rgba(16,185,129,0)",
                          ],
                        }}
                        transition={{ repeat: Infinity, duration: 1.6 }}
                        className="rounded-full"
                      >
                        <Link
                          href="/dashboard"
                          className="clay-btn-mint px-8 py-3.5 font-extrabold text-sm flex items-center gap-2"
                        >
                          <span>Request Demo</span>
                          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                        </Link>
                      </motion.div>
                      <Link
                        href="/dashboard"
                        className="clay-btn-cream px-6 py-3.5 font-bold text-sm text-slate-700"
                      >
                        View Audit Log
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Footer with Absolute "1 Issue" Banner inside footer container */}
                <footer className="w-full max-w-6xl mx-auto relative pt-4 pb-2 border-t border-amber-200/60 text-xs text-slate-600 bg-white/40 backdrop-blur-md rounded-2xl px-6 mt-4 z-[1]">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span className="font-extrabold text-slate-900">FedGuard Platform</span>
                      <span>• ENIGMA 5.0 Fintech Track</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                        <span>1 Issue: Data Silos Addressed via DPDP Act</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-slate-700 font-mono text-[10px] font-bold">
                      <span>Tanishq</span>
                      <span>• Yash</span>
                      <span>• Vrinda</span>
                      <span>• Amishi</span>
                    </div>
                  </div>
                </footer>
              </motion.section>
            )}

          </AnimatePresence>

          {/* ── Scroll progress bar ─────────────────────────────────────── */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/60 z-50">
            <motion.div
              style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
              className="h-full bg-gradient-to-r from-indigo-500 via-teal-500 to-amber-400"
            />
          </div>

        </div>
      </div>
    </>
  );
}
