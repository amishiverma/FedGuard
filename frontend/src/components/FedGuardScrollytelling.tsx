"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import {
  ShieldCheck, Lock, Cpu, TrendingUp, AlertTriangle,
  ArrowRight, Database, CheckCircle2, Server, Zap,
  EyeOff, GitPullRequest, Sliders, Scale, Sparkles,
  BarChart3, Users, RefreshCw, Activity, FileCheck,
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────────────────

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
    desc: "DPDP Act 2023 & GDPR explicitly prohibit raw cross-institution data sharing.",
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
    desc: "Bank A, Bank B, and FinTech C pull the latest neural network weights from the central Federated Server. No customer transactions are transmitted — only a model file.",
    tag: "Flower flwr 1.x",
    cardClass: "clay-card-lavender",
    iconColor: "text-indigo-700",
    accentBg: "bg-indigo-500/10",
    icon: Server,
  },
  {
    num: "02",
    title: "Local Institution Training",
    subtitle: "Siloed Data Remains On-Premise",
    desc: "Each bank trains locally using Dirichlet Non-IID partitioned credit datasets (alpha=0.5). Raw transactions never leave the vault.",
    tag: "Non-IID alpha=0.5",
    cardClass: "clay-card-mint",
    iconColor: "text-emerald-700",
    accentBg: "bg-emerald-500/10",
    icon: Database,
  },
  {
    num: "03",
    title: "Differential Privacy Noise",
    subtitle: "Opacus (epsilon, delta) Accounting",
    desc: "Calibrated Gaussian noise is injected into gradients via PyTorch Opacus PrivacyEngine — mathematically protected weight updates with live budget tracking.",
    tag: "Opacus DP Engine",
    cardClass: "clay-card-yellow",
    iconColor: "text-amber-800",
    accentBg: "bg-amber-500/10",
    icon: EyeOff,
  },
  {
    num: "04",
    title: "Secure Aggregation",
    subtitle: "FedAvg + Cosine Poisoning Defense",
    desc: "The Federated Server applies SecAgg+ and Cosine Similarity gradient checks to filter malicious updates, merging clean weights into an improved global model.",
    tag: "SecAgg + Defense",
    cardClass: "clay-card-pink",
    iconColor: "text-rose-700",
    accentBg: "bg-rose-500/10",
    icon: ShieldCheck,
  },
];

const innovations = [
  { title: "Secure Aggregation (SecAgg+)", badge: "Cryptographic Privacy", icon: Lock, cardClass: "clay-card-lavender" },
  { title: "Privacy Budget Tracker (epsilon-delta)", badge: "Opacus RDP", icon: Activity, cardClass: "clay-card-mint" },
  { title: "Non-IID Dirichlet Partitioning", badge: "Dirichlet alpha=0.5", icon: Sliders, cardClass: "clay-card-yellow" },
  { title: "Append-Only Audit Trail", badge: "Regulatory Compliance", icon: FileCheck, cardClass: "clay-card-pink" },
  { title: "SHAP Feature Importance", badge: "Explainable AI", icon: BarChart3, cardClass: "clay-card-lavender" },
  { title: "Model Poisoning Detection", badge: "Byzantine Defense", icon: AlertTriangle, cardClass: "clay-card-yellow" },
  { title: "Personalized FL (FedProx)", badge: "FedProx Regularizer", icon: GitPullRequest, cardClass: "clay-card-mint" },
  { title: "Compliance Mapping Panel", badge: "DPDP & GDPR", icon: Scale, cardClass: "clay-card-pink" },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function FedGuardScrollytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [currentScene, setCurrentScene] = useState(1);
  const [btnPulse, setBtnPulse] = useState(false);
  const [innovPulse, setInnovPulse] = useState(false);
  const [epsilon, setEpsilon] = useState(0.85);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Scene tracker + side effects
  useMotionValueEvent(scrollYProgress, "change", (val) => {
    let scene = 1;
    if (val >= 0.73) scene = 5;
    else if (val >= 0.53) scene = 4;
    else if (val >= 0.35) scene = 3;
    else if (val >= 0.15) scene = 2;
    setCurrentScene(scene);

    // Auto tab-switching in Scene 4 (0.53 -> 0.76)
    if (val >= 0.53 && val < 0.76) {
      const p = (val - 0.53) / 0.23;
      const idx = Math.min(3, Math.floor(p * 4));
      setActiveTab(idx);
      if (p > 0.88) {
        setBtnPulse(true);
        setEpsilon(parseFloat((0.85 + p * 0.15).toFixed(2)));
      } else {
        setBtnPulse(false);
      }
    }

    setInnovPulse(val >= 0.78);
  });

  // Video control
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (currentScene === 3) {
      video.playbackRate = 0.75;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [currentScene]);

  // ── Motion transforms ──
  const s1Opacity = useTransform(scrollYProgress, [0, 0.13, 0.20], [1, 1, 0]);
  const s1Y       = useTransform(scrollYProgress, [0.10, 0.20],    [0, -50]);

  const s2Opacity = useTransform(scrollYProgress, [0.14, 0.20, 0.32, 0.40], [0, 1, 1, 0]);
  const card0X    = useTransform(scrollYProgress, [0.28, 0.40], [0,  90]);
  const card0R    = useTransform(scrollYProgress, [0.28, 0.40], [0, -14]);
  const card1X    = useTransform(scrollYProgress, [0.28, 0.40], [0,  25]);
  const card1R    = useTransform(scrollYProgress, [0.28, 0.40], [0,   6]);
  const card2X    = useTransform(scrollYProgress, [0.28, 0.40], [0, -25]);
  const card2R    = useTransform(scrollYProgress, [0.28, 0.40], [0,   9]);
  const card3X    = useTransform(scrollYProgress, [0.28, 0.40], [0, -90]);
  const card3R    = useTransform(scrollYProgress, [0.28, 0.40], [0, -10]);
  const collapseY = useTransform(scrollYProgress, [0.28, 0.40], [0,  80]);
  const collapseLabel = useTransform(scrollYProgress, [0.28, 0.36, 0.40], [0, 1, 0]);

  const s3Opacity = useTransform(scrollYProgress, [0.33, 0.40, 0.52, 0.58], [0, 1, 1, 0]);
  const s3Scale   = useTransform(scrollYProgress, [0.33, 0.42], [0.92, 1]);

  const s4Opacity = useTransform(scrollYProgress, [0.51, 0.58, 0.72, 0.78], [0, 1, 1, 0]);
  const s4Scale   = useTransform(scrollYProgress, [0.51, 0.60], [0.94, 1]);

  const s5Opacity = useTransform(scrollYProgress, [0.71, 0.80], [0, 1]);
  const s5Y       = useTransform(scrollYProgress, [0.71, 0.82], [40, 0]);

  const cardTransforms = [
    { x: card0X, rotate: card0R },
    { x: card1X, rotate: card1R },
    { x: card2X, rotate: card2R },
    { x: card3X, rotate: card3R },
  ];

  const step = steps[activeTab];
  const StepIcon = step.icon;

  return (
    <>
      {/* ── FIXED NAVBAR ────────────────────────────────────────────────── */}
      <header className="fixed top-4 left-0 right-0 z-[100] px-4 sm:px-8 pointer-events-none">
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

          {/* Scene dots */}
          <div className="hidden md:flex items-center gap-3">
            {["Hero", "Problem", "Architecture", "FL Cycle", "Innovations"].map((label, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  currentScene === i + 1 ? "bg-indigo-600 scale-150 shadow-sm shadow-indigo-400" : "bg-slate-300"
                }`} />
                <span className={`text-[10px] font-semibold transition-colors duration-300 ${
                  currentScene === i + 1 ? "text-indigo-700" : "text-slate-400"
                }`}>{label}</span>
              </div>
            ))}
          </div>

          <Link href="/dashboard" className="clay-btn-lavender px-5 py-2.5 font-bold text-xs tracking-wide flex items-center gap-2">
            <span>Launch Console</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>
      </header>

      {/* ── SCROLL CONTAINER (600vh drives the timeline) ────────────────── */}
      <div ref={containerRef} style={{ height: "600vh" }} className="relative">

        {/* ── STICKY VIEWPORT ─────────────────────────────────────────────── */}
        <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}
          className="w-full bg-[#fcf6ee]">

          {/* Ambient blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-[10%] -left-[5%] w-[50vw] h-[50vw] rounded-full bg-indigo-200/30 blur-[80px]" />
            <div className="absolute -bottom-[10%] -right-[5%] w-[40vw] h-[40vw] rounded-full bg-rose-200/25 blur-[80px]" />
            <div className="absolute top-[30%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-emerald-200/20 blur-[70px]" />
          </div>

          {/* ============================================================
              SCENE 1 — HERO
              ============================================================ */}
          <motion.section
            style={{ opacity: s1Opacity, y: s1Y }}
            className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-8 pt-20 z-10"
          >
            <div className="text-center max-w-4xl mx-auto space-y-7">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-indigo-700 font-semibold text-xs shadow-md border border-indigo-100"
              >
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>ENIGMA 5.0 FINTECH TRACK · PRIVACY-PRESERVING AI</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="text-5xl sm:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.08]"
              >
                Financial Risk Intelligence.{" "}
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-indigo-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
                  Zero Raw Data Shared.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed"
              >
                A privacy-preserving federated AI platform where banks collaboratively train fraud &amp; credit risk models — protected by Differential Privacy, SecAgg, and fully auditable by design.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="flex flex-wrap items-center justify-center gap-4"
              >
                <Link href="/dashboard" className="clay-btn-lavender px-8 py-4 font-extrabold text-sm flex items-center gap-2">
                  Explore Interactive Prototype
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
                <a href="#arch" className="clay-btn-mint px-7 py-4 font-bold text-sm">
                  View 3D Data Flow
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold"
              >
                <span className="px-4 py-2 rounded-full bg-white shadow border border-emerald-200 text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> DPDP Act &amp; GDPR Compliant
                </span>
                <span className="px-4 py-2 rounded-full bg-white shadow border border-indigo-200 text-indigo-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" /> Opacus Differential Privacy
                </span>
                <span className="px-4 py-2 rounded-full bg-white shadow border border-amber-200 text-amber-800 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-amber-600" /> Flower FL 1.x Framework
                </span>
              </motion.div>

              {/* Scroll cue */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="flex flex-col items-center gap-1.5 pt-2 text-slate-400"
              >
                <span className="text-[10px] font-semibold tracking-widest uppercase">Scroll to explore</span>
                <div className="w-0.5 h-7 rounded-full bg-gradient-to-b from-slate-300 to-transparent" />
              </motion.div>
            </div>
          </motion.section>

          {/* ============================================================
              SCENE 2 — THE PROBLEM (cards collapse into a pile)
              ============================================================ */}
          <motion.section
            style={{ opacity: s2Opacity }}
            className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-8 pt-24 z-10"
          >
            <div className="w-full max-w-5xl mx-auto space-y-10">
              <div className="text-center space-y-3">
                <span className="text-xs font-mono font-bold text-rose-600 uppercase tracking-widest px-3 py-1 rounded-full bg-rose-50 border border-rose-200">
                  Industry Pain Points
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                  Why Traditional Banking Risk Systems Fail
                </h2>
                <p className="text-slate-500 text-sm sm:text-base font-medium max-w-2xl mx-auto">
                  Financial institutions operate in isolated silos — leaving critical blindspots that fraudsters exploit.
                </p>
              </div>

              {/* Collapsing cards */}
              <div className="relative flex items-end justify-center gap-4 h-56">
                {problemCards.map((card, i) => {
                  const t = cardTransforms[i];
                  const CardIcon = card.icon;
                  return (
                    <motion.div
                      key={i}
                      style={{ x: t.x, rotate: t.rotate, y: collapseY }}
                      className={`${card.cardClass} p-5 w-52 shrink-0 space-y-3 shadow-2xl origin-bottom`}
                    >
                      <div className={`w-10 h-10 rounded-2xl ${card.iconBg} flex items-center justify-center`}>
                        <CardIcon className={`w-5 h-5 ${card.iconColor}`} />
                      </div>
                      <h3 className="font-extrabold text-sm">{card.title}</h3>
                      <p className="text-xs leading-relaxed opacity-80">{card.desc}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Collapse warning label */}
              <motion.div style={{ y: collapseY, opacity: collapseLabel }} className="text-center">
                <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-rose-100 text-rose-700 text-xs font-extrabold uppercase tracking-widest border border-rose-200">
                  The Broken Silo System — Collapses Under Pressure
                </span>
              </motion.div>
            </div>
          </motion.section>

          {/* ============================================================
              SCENE 3 — ARCHITECTURE VIDEO
              ============================================================ */}
          <motion.section
            id="arch"
            style={{ opacity: s3Opacity, scale: s3Scale }}
            className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-8 pt-24 z-10"
          >
            <div className="w-full max-w-5xl mx-auto space-y-5">
              <div className="text-center space-y-2">
                <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200">
                  Architecture Deep Dive
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  How FedGuard Enables Cross-Bank Collaboration
                </h2>
              </div>

              <div className="clay-card-cream p-4 sm:p-5 shadow-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <motion.span
                      animate={currentScene === 3 ? { scale: [1, 1.7, 1], opacity: [1, 0.3, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 0.85 }}
                      className="w-3 h-3 rounded-full bg-emerald-500 inline-block"
                    />
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider font-mono">
                      Live 3D Architecture Flow · Continuous Loop
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                    archvideo.mp4 · 0.75×
                  </span>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 shadow-xl bg-slate-900 max-w-4xl mx-auto">
                  <video
                    ref={videoRef}
                    src="/assets/archvideo.mp4"
                    loop
                    muted
                    playsInline
                    className="w-full h-auto rounded-2xl object-cover"
                  />
                  {currentScene !== 3 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 rounded-2xl">
                      <span className="text-white text-sm font-semibold opacity-60">Scroll to Scene 3 to play</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs font-bold pt-1">
                  <div className="clay-card-lavender p-2.5 rounded-2xl">
                    <div className="text-indigo-950">3 Institutions</div>
                    <div className="text-[10px] text-indigo-700 font-mono">HDFC · ICICI · PhonePe</div>
                  </div>
                  <div className="clay-card-mint p-2.5 rounded-2xl">
                    <div className="text-emerald-950">Zero Raw Data</div>
                    <div className="text-[10px] text-emerald-700 font-mono">Encrypted Gradients Only</div>
                  </div>
                  <div className="clay-card-pink p-2.5 rounded-2xl">
                    <div className="text-rose-950">AUC 0.947</div>
                    <div className="text-[10px] text-rose-700 font-mono">Global Model Score</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ============================================================
              SCENE 4 — 4-STEP FL CYCLE (auto tab-switching)
              ============================================================ */}
          <motion.section
            style={{ opacity: s4Opacity, scale: s4Scale }}
            className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-8 pt-24 z-10"
          >
            <div className="w-full max-w-5xl mx-auto space-y-5">
              <div className="text-center space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  The FL Pipeline
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  4-Step Federated Learning Cycle
                </h2>
              </div>

              {/* Tab row */}
              <div className="flex items-center gap-2 justify-center flex-wrap">
                {steps.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                      activeTab === idx ? "clay-btn-lavender shadow-md" : "clay-btn-cream text-slate-700"
                    }`}
                  >
                    <span>{s.num}.</span>
                    <span>{s.title}</span>
                  </button>
                ))}
              </div>

              {/* Active card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 280, damping: 26 }}
                  className={`${step.cardClass} p-7 sm:p-10 shadow-2xl`}
                >
                  <div className="flex flex-col sm:flex-row gap-7 items-start">
                    <div className={`${step.accentBg} rounded-3xl p-5 flex-shrink-0`}>
                      <StepIcon className={`w-12 h-12 ${step.iconColor} stroke-[1.5]`} />
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-4xl font-black opacity-20 font-mono">{step.num}</span>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">{step.title}</h3>
                          <p className="text-xs font-mono font-semibold opacity-70">{step.subtitle}</p>
                        </div>
                      </div>
                      <p className="text-sm sm:text-base leading-relaxed opacity-90 font-medium max-w-xl">{step.desc}</p>
                      <span className="inline-block px-4 py-1.5 rounded-full bg-white/60 text-xs font-bold uppercase tracking-wider">
                        {step.tag}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Bottom row: epsilon + simulate button */}
              <div className="flex items-center justify-between px-1">
                <div className="text-xs font-mono text-slate-500">
                  Privacy budget: <span className="font-bold text-indigo-700">epsilon = {epsilon}</span> / 1.0
                </div>
                <motion.button
                  animate={btnPulse ? {
                    boxShadow: [
                      "0 0 0px 0px rgba(99,102,241,0)",
                      "0 0 22px 8px rgba(99,102,241,0.45)",
                      "0 0 0px 0px rgba(99,102,241,0)",
                    ],
                    scale: [1, 1.05, 1],
                  } : {}}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="clay-btn-lavender px-5 py-2.5 text-xs font-bold flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4" />
                  {btnPulse ? "Round Complete!" : "Simulate FL Round"}
                </motion.button>
              </div>
            </div>
          </motion.section>

          {/* ============================================================
              SCENE 5 — INNOVATIONS GRID + CTA BANNER
              ============================================================ */}
          <motion.section
            style={{ opacity: s5Opacity, y: s5Y }}
            className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-8 pt-24 z-10"
          >
            <div className="w-full max-w-6xl mx-auto space-y-7">
              <div className="text-center space-y-2">
                <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                  Our Winning Edge
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  8 Technical Innovations Powering FedGuard
                </h2>
              </div>

              {/* 8-card innovations grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {innovations.map((inn, i) => {
                  const InnIcon = inn.icon;
                  return (
                    <motion.div
                      key={i}
                      animate={innovPulse ? {
                        y: [0, -5, 0],
                      } : {}}
                      transition={{ delay: i * 0.07, repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                      className={`${inn.cardClass} p-4 space-y-2`}
                    >
                      <InnIcon className="w-5 h-5 opacity-70" />
                      <div className="font-extrabold text-xs leading-snug">{inn.title}</div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/50 font-bold uppercase tracking-wider inline-block">
                        {inn.badge}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* CTA Banner */}
              <div className="clay-card-lavender p-7 text-center space-y-4">
                <h2 className="text-xl sm:text-3xl font-extrabold text-indigo-950 tracking-tight">
                  Ready to test collaborative risk intelligence?
                </h2>
                <p className="text-indigo-800 text-sm max-w-xl mx-auto font-medium">
                  Experience the 4-scene interactive dashboard with live gradient flow animations, accuracy metrics, and audit log.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
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
                    <Link href="/dashboard" className="clay-btn-mint px-8 py-3.5 font-extrabold text-sm flex items-center gap-2">
                      Request Demo
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </Link>
                  </motion.div>
                  <Link href="/dashboard" className="clay-btn-cream px-7 py-3.5 font-bold text-sm text-slate-700">
                    View Audit Log
                  </Link>
                </div>
              </div>
            </div>
          </motion.section>

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
