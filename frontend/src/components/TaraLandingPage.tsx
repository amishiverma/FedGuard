"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
  CreditCard,
  Banknote,
  FileText,
  Smartphone,
  ShoppingBag,
  Users,
  RefreshCw,
} from "lucide-react";

export default function TaraLandingPage() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [demoState, setDemoState] = useState<"idle" | "downloading" | "training" | "aggregating" | "complete">("idle");
  const [epsilon, setEpsilon] = useState<number>(0.85);

  const runHeroAnimation = () => {
    setDemoState("downloading");
    setTimeout(() => setDemoState("training"), 1200);
    setTimeout(() => {
      setDemoState("aggregating");
      setEpsilon((prev) => parseFloat((prev + 0.15).toFixed(2)));
    }, 2800);
    setTimeout(() => setDemoState("complete"), 4200);
    setTimeout(() => setDemoState("idle"), 5800);
  };

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
      icon: Server
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
      icon: Database
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
      icon: EyeOff
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
      icon: ShieldCheck
    }
  ];

  const innovations = [
    {
      title: "Secure Aggregation (SecAgg+)",
      desc: "Even the central server cannot inspect individual bank gradient updates. Only the combined sum is decrypted.",
      badge: "Cryptographic Privacy",
      icon: Lock,
      cardClass: "clay-card-lavender"
    },
    {
      title: "Privacy Budget Tracker (ε-δ)",
      desc: "Live accounting gauge tracking spent Differential Privacy budget (epsilon) per round for complete transparency.",
      badge: "Opacus RDP",
      icon: Activity,
      cardClass: "clay-card-mint"
    },
    {
      title: "Non-IID Dirichlet Partitioning",
      desc: "Realistic heterogeneous label distributions across bank nodes (alpha=0.5) mimicking real-world banking imbalance.",
      badge: "Dirichlet Split",
      icon: Sliders,
      cardClass: "clay-card-yellow"
    },
    {
      title: "Append-Only Audit Trail",
      desc: "Immutable SQLite logging of every round timestamp, participant bank IDs, gradient hashes, and epsilon spent.",
      badge: "Regulatory Compliance",
      icon: FileCheck,
      cardClass: "clay-card-pink"
    },
    {
      title: "SHAP Feature Importance",
      desc: "Extract local SHAP values per institution to understand top credit risk predictors without exporting raw data.",
      badge: "Explainable AI",
      icon: BarChart3,
      cardClass: "clay-card-lavender"
    },
    {
      title: "Model Poisoning Detection",
      desc: "Cosine similarity filtering on incoming client weights to detect and drop malicious or corrupted bank updates.",
      badge: "Byzantine Defense",
      icon: AlertTriangle,
      cardClass: "clay-card-yellow"
    },
    {
      title: "Personalized FL (FedProx)",
      desc: "Proximal regularization term added to local objective functions to optimize performance for each bank's unique portfolio.",
      badge: "FedProx Regularizer",
      icon: GitPullRequest,
      cardClass: "clay-card-mint"
    },
    {
      title: "Compliance Mapping Panel",
      desc: "Explicit UI mapping of system mechanisms to specific articles of India's DPDP Act 2023 and EU GDPR.",
      badge: "DPDP & GDPR",
      icon: Scale,
      cardClass: "clay-card-pink"
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#fcf6ee] text-slate-800 font-sans selection:bg-indigo-500/20 selection:text-indigo-900 relative">

      {/* ── LAYER 1 (Lowest, z-index: -10): HUGE FADED BACKGROUND WATERMARK TEXT ── */}
      <div className="fixed inset-0 pointer-events-none z-[-10] flex flex-col items-center justify-center select-none overflow-hidden opacity-[0.035]">
        <div className="text-[11vw] font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap leading-none">
          INTELLIGENCE ZERO
        </div>
        <div className="text-[11vw] font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap leading-none">
          RAW DATA SHARED
        </div>
      </div>

      {/* Ambient background blur blobs */}
      <div className="fixed inset-0 pointer-events-none z-[-5] overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[50vw] h-[50vw] rounded-full bg-indigo-200/25 blur-[100px]" />
        <div className="absolute top-[30%] -right-[5%] w-[45vw] h-[45vw] rounded-full bg-rose-200/20 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-emerald-200/20 blur-[100px]" />
      </div>

      {/* ── LAYER 3 (Top, z-index: 999): STICKY NAVBAR ── */}
      <header className="sticky top-4 z-[999] w-full px-4 sm:px-8">
        <div className="max-w-7xl mx-auto clay-card-cream px-6 py-3.5 flex items-center justify-between shadow-xl">
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

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#overview" className="hover:text-indigo-600 transition-colors">Overview</a>
            <a href="#problems" className="hover:text-indigo-600 transition-colors">Pain Points</a>
            <a href="#architecture" className="hover:text-indigo-600 transition-colors">Architecture Flow</a>
            <a href="#cycle" className="hover:text-indigo-600 transition-colors">4-Step FL</a>
            <a href="#innovations" className="hover:text-indigo-600 transition-colors">Winning Edge</a>
            <a href="#techstack" className="hover:text-indigo-600 transition-colors">Tech Stack</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="clay-btn-lavender px-5 py-2.5 font-bold text-xs tracking-wide flex items-center gap-2"
            >
              <span>Launch Console</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── LAYER 2 (Middle): MAIN CONTENT FLOW (SUSTAINED py-24 / py-32 SPACING) ── */}

      {/* 1. HERO SECTION */}
      <section id="overview" className="relative py-24 sm:py-32 px-4 sm:px-8 max-w-7xl mx-auto z-[1]">
        <div className="text-center max-w-4xl mx-auto space-y-7">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-indigo-700 font-semibold text-xs shadow-md border border-indigo-100"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>ENIGMA 5.0 FINTECH TRACK • PRIVACY-PRESERVING AI</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.08]"
          >
            Financial Risk Intelligence. <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-indigo-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
              Zero Raw Data Shared.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-600 text-base sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed"
          >
            A privacy-preserving federated AI platform where banks collaboratively train fraud & credit risk models — protected by Differential Privacy, SecAgg, and fully auditable by design.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <Link
              href="/dashboard"
              className="clay-btn-lavender px-8 py-4 font-extrabold text-sm flex items-center gap-2 shadow-xl"
            >
              <span>Explore Interactive Prototype</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <a
              href="#architecture"
              className="clay-btn-mint px-7 py-4 font-bold text-sm flex items-center gap-2 shadow-lg"
            >
              <span>View 3D Data Flow</span>
            </a>
          </motion.div>

          {/* Key Pill Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 text-xs font-semibold text-slate-700">
            <span className="px-4 py-2 rounded-full bg-white shadow-sm border border-emerald-200 text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> DPDP Act & GDPR Compliant
            </span>
            <span className="px-4 py-2 rounded-full bg-white shadow-sm border border-indigo-200 text-indigo-800 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-600" /> Opacus Differential Privacy (ε,δ)
            </span>
            <span className="px-4 py-2 rounded-full bg-white shadow-sm border border-amber-200 text-amber-800 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-amber-600" /> Flower FL 1.x Framework
            </span>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM GRID SECTION */}
      <section id="problems" className="py-24 sm:py-32 px-4 sm:px-8 max-w-7xl mx-auto z-[1]">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-mono font-bold text-rose-600 uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 shadow-sm">
            Industry Pain Points
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Why Traditional Banking Risk Systems Fail
          </h2>
          <p className="text-slate-600 text-base font-medium">
            Financial institutions operate in isolated silos, leaving critical blindspots that fraudsters exploit across institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {problemCards.map((card, i) => {
            const CardIcon = card.icon;
            return (
              <div key={i} className={`${card.cardClass} p-6 sm:p-8 space-y-4 shadow-xl overflow-hidden`}>
                <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center font-bold shadow-inner`}>
                  <CardIcon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-950">{card.title}</h3>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. ARCHITECTURE FLOW VIDEO & DIAGRAM SECTION */}
      <section id="architecture" className="py-24 sm:py-32 px-4 sm:px-8 max-w-7xl mx-auto space-y-12 z-[1]">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 shadow-sm">
            Architecture Deep Dive
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            How FedGuard Enables Cross-Bank Collaboration
          </h2>
          <p className="text-slate-600 text-base font-medium">
            End-to-end privacy preservation combining Flower FL, Opacus Differential Privacy, and SecAgg+.
          </p>
        </div>

        {/* 3D Architecture Video Loop Card */}
        <div className="clay-card-cream p-4 sm:p-8 shadow-2xl relative overflow-hidden space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider font-mono">
                Live 3D Architecture Flow Animation (Continuous Loop)
              </span>
            </div>
            <span className="text-[10px] font-mono font-extrabold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
              archvideo.mp4 · 0.5× speed
            </span>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 shadow-xl bg-slate-900 max-w-4xl mx-auto">
            <ScrollVideoPlayer src="/assets/archvideo.mp4" speed={0.5} />
          </div>
        </div>

        {/* Interactive Step-by-Step Flow Controls Card */}
        <div className="clay-card-cream p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200/80 pb-5 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider font-mono">
                  Interactive Controls & Data Pipeline
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                Federated Cross-Institution Pipeline
              </h3>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Privacy Budget</div>
                <div className="text-xs font-mono font-bold text-indigo-700">ε = {epsilon} / 1.0 (Target)</div>
              </div>
              <button
                onClick={runHeroAnimation}
                disabled={demoState !== "idle"}
                className="clay-btn-lavender px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-60 shadow-md"
              >
                <Zap className="w-4 h-4" />
                {demoState === "idle" ? "Simulate FL Round" : demoState.toUpperCase() + "..."}
              </button>
            </div>
          </div>

          {/* Interactive Flow Diagram */}
          <div className="py-8 space-y-8 overflow-x-auto">
            <div className="min-w-[900px] grid grid-cols-12 gap-4 items-center relative">
              {/* Left Column: Customers */}
              <div className="col-span-3 space-y-3">
                <div className="clay-card-pink p-4 text-center space-y-2 overflow-hidden">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/20 text-rose-700 flex items-center justify-center font-bold text-lg">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="font-extrabold text-sm text-rose-900">Users / Customers</div>
                </div>

                <div className="space-y-1.5 text-xs font-bold">
                  <div className="clay-card-lavender px-3 py-1.5 flex items-center justify-between overflow-hidden">
                    <span className="flex items-center gap-1.5 text-indigo-950">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-600" /> Transactions
                    </span>
                    <span className="text-[10px] text-indigo-700 font-mono">HDFC</span>
                  </div>
                  <div className="clay-card-mint px-3 py-1.5 flex items-center justify-between overflow-hidden">
                    <span className="flex items-center gap-1.5 text-emerald-950">
                      <Banknote className="w-3.5 h-3.5 text-emerald-600" /> Repayments
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono">ICICI</span>
                  </div>
                  <div className="clay-card-yellow px-3 py-1.5 flex items-center justify-between overflow-hidden">
                    <span className="flex items-center gap-1.5 text-amber-950">
                      <FileText className="w-3.5 h-3.5 text-amber-700" /> Claims
                    </span>
                    <span className="text-[10px] text-amber-800 font-mono">FinTech</span>
                  </div>
                  <div className="clay-card-lavender px-3 py-1.5 flex items-center justify-between overflow-hidden">
                    <span className="flex items-center gap-1.5 text-indigo-950">
                      <Smartphone className="w-3.5 h-3.5 text-indigo-600" /> Apps
                    </span>
                    <span className="text-[10px] text-indigo-700 font-mono">Mobile</span>
                  </div>
                  <div className="clay-card-pink px-3 py-1.5 flex items-center justify-between overflow-hidden">
                    <span className="flex items-center gap-1.5 text-rose-950">
                      <ShoppingBag className="w-3.5 h-3.5 text-rose-600" /> UPI
                    </span>
                    <span className="text-[10px] text-rose-700 font-mono">Payment</span>
                  </div>
                </div>
              </div>

              {/* Middle Section: Financial Institutions */}
              <div className="col-span-5 p-4 rounded-3xl bg-slate-50/60 border-2 border-dashed border-amber-200/80 space-y-4">
                <div className="text-center font-bold text-xs text-amber-900 uppercase tracking-wider font-mono">
                  Participating Financial Institutions
                </div>

                <div className="flex items-center gap-2">
                  <div className="clay-card-lavender p-3 flex-1 flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-700 flex items-center justify-center">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-indigo-950">Bank A</div>
                      <div className="text-[9px] font-mono text-indigo-800">Private Data</div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    2
                  </div>
                  <div className="clay-card-lavender p-2 flex items-center gap-1 text-[10px] font-bold text-indigo-950 shrink-0 overflow-hidden">
                    <Lock className="w-3 h-3 text-indigo-600" />
                    <span>Protected</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="clay-card-mint p-3 flex-1 flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-800 flex items-center justify-center">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-emerald-950">Bank B</div>
                      <div className="text-[9px] font-mono text-emerald-800">Private Data</div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    2
                  </div>
                  <div className="clay-card-mint p-2 flex items-center gap-1 text-[10px] font-bold text-emerald-950 shrink-0 overflow-hidden">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>Protected</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="clay-card-yellow p-3 flex-1 flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-amber-950">FinTech C</div>
                      <div className="text-[9px] font-mono text-amber-900">Private Data</div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    2
                  </div>
                  <div className="clay-card-yellow p-2 flex items-center gap-1 text-[10px] font-bold text-amber-950 shrink-0 overflow-hidden">
                    <Lock className="w-3 h-3 text-amber-700" />
                    <span>Protected</span>
                  </div>
                </div>
              </div>

              {/* Server */}
              <div className="col-span-2 space-y-2 text-center">
                <div className="w-7 h-7 mx-auto rounded-full bg-rose-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-md">
                  4
                </div>
                <div className="clay-card-pink p-4 space-y-2 overflow-hidden">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-rose-500/20 text-rose-700 flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div className="font-extrabold text-xs text-rose-950">Federated Server</div>
                  <div className="text-[9px] font-mono text-rose-800 font-semibold">SecAgg+</div>
                </div>
              </div>

              {/* Global Model */}
              <div className="col-span-2 space-y-2 text-center">
                <div className="w-7 h-7 mx-auto rounded-full bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-md">
                  5
                </div>
                <div className="clay-card-lavender p-4 space-y-2 overflow-hidden">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-500/20 text-indigo-700 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="font-extrabold text-xs text-indigo-950">Global Model</div>
                  <div className="text-[9px] font-mono text-indigo-800 font-bold">AUC 0.947</div>
                </div>
              </div>
            </div>

            {/* Feedback Bar */}
            <div className="clay-card-lavender px-6 py-3 flex items-center justify-between text-xs font-bold overflow-hidden">
              <div className="flex items-center gap-2 text-indigo-950">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-xs flex items-center justify-center">
                  6
                </div>
                <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" style={{ animationDuration: "8s" }} />
                <span>Send Updated Model (next round feedback loop)</span>
              </div>
              <span className="text-[11px] font-mono text-indigo-800">DP Noise Applied • Zero Data Shared</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE 4-STEP FEDERATED CYCLE SECTION (.fl-cycle-section) */}
      <section id="cycle" className="fl-cycle-section py-24 sm:py-32 px-4 sm:px-8 max-w-7xl mx-auto relative z-[1] overflow-y-visible">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 shadow-sm">
            Privacy Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            The 4-Step Federated Cycle
          </h2>
          <p className="text-slate-600 text-base font-medium">
            How FedGuard trains global financial risk models without moving a single customer record.
          </p>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex justify-center gap-3 mb-10 overflow-x-auto pb-2">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-6 py-3 rounded-full text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === idx
                  ? "clay-btn-lavender shadow-lg scale-105"
                  : "clay-btn-cream text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>{step.num}.</span>
              <span>{step.title}</span>
            </button>
          ))}
        </div>

        {/* 4 Cards Grid - replacing negative margins with proper gap spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = activeTab === idx;
            return (
              <motion.div
                key={idx}
                onClick={() => setActiveTab(idx)}
                whileHover={{ y: -4 }}
                className={`${step.cardClass} p-6 sm:p-8 cursor-pointer transition-all duration-300 relative overflow-hidden shadow-xl ${
                  isActive ? "ring-4 ring-indigo-500/40 scale-[1.02]" : "opacity-90 hover:opacity-100"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <span className="text-3xl font-black opacity-25 font-mono">{step.num}</span>
                  <div className={`w-12 h-12 rounded-2xl ${step.accentBg} flex items-center justify-center shrink-0 shadow-inner`}>
                    <StepIcon className={`w-6 h-6 ${step.iconColor}`} />
                  </div>
                </div>
                <h3 className="text-xl font-extrabold tracking-tight text-slate-900 mb-1">{step.title}</h3>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 mb-3">{step.subtitle}</p>
                <p className="text-slate-800 text-xs sm:text-sm leading-relaxed font-medium mb-4">{step.desc}</p>
                <span className="inline-block px-3 py-1 rounded-full bg-white/70 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  {step.tag}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* LAYER 4 (Modal/Overlay): Active/Large "04 Secure Aggregation" Card Container */}
        <div className="w-full max-w-5xl mx-auto relative z-[1000] overflow-hidden rounded-[2.5rem]">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`${steps[activeTab].cardClass} p-8 sm:p-12 shadow-2xl relative overflow-hidden border-2 border-white/80`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-mono font-extrabold px-3.5 py-1 rounded-full bg-white/90 text-slate-900 shadow-sm">
                    {steps[activeTab].tag}
                  </span>
                  <span className="text-xs font-bold text-indigo-700 font-mono">
                    Active Focus Stage
                  </span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Step {steps[activeTab].num}: {steps[activeTab].title}
                </h3>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                  {steps[activeTab].subtitle}
                </p>
                <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-medium">
                  {steps[activeTab].desc}
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <a href="#architecture" className="clay-btn-lavender px-6 py-3 font-extrabold text-xs inline-flex items-center gap-2 shadow-md">
                    <span>View 3D Data Flow</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </a>
                  <Link href="/dashboard" className="clay-btn-cream px-5 py-3 font-bold text-xs text-slate-800 shadow-sm">
                    Test in Console
                  </Link>
                </div>
              </div>

              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white/80 flex items-center justify-center shrink-0 shadow-inner p-4">
                {React.createElement(steps[activeTab].icon, {
                  className: `w-14 h-14 sm:w-16 sm:h-16 ${steps[activeTab].iconColor}`
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. THE WINNING EDGE INNOVATIONS GRID */}
      <section id="innovations" className="py-24 sm:py-32 px-4 sm:px-8 max-w-7xl mx-auto z-[1]">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-mono font-bold text-amber-800 uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-200 shadow-sm">
            Technological Superiority
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            The Winning Edge Innovations
          </h2>
          <p className="text-slate-600 text-base font-medium">
            Built for hackathon execution excellence and real-world regulatory approval.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {innovations.map((item, idx) => (
            <div
              key={idx}
              className={`${item.cardClass} p-6 sm:p-8 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between space-y-4 shadow-xl overflow-hidden`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center text-slate-900 shadow-sm">
                    {React.createElement(item.icon, { className: "w-5 h-5" })}
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/80 text-slate-900 font-extrabold shadow-sm">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-950">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TECH STACK OVERVIEW SECTION */}
      <section id="techstack" className="py-24 sm:py-32 px-4 sm:px-8 max-w-7xl mx-auto z-[1]">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-mono font-bold text-indigo-700 uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 shadow-sm">
            Production Engineering
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            FedGuard Tech Stack
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {[
            { label: "FL Engine", val: "Flower (flwr) 1.x" },
            { label: "Privacy (DP)", val: "Opacus Engine" },
            { label: "ML Model", val: "PyTorch Tabular NN" },
            { label: "Dataset", val: "Kaggle Credit Fraud" },
            { label: "Backend API", val: "FastAPI + WebSockets" },
            { label: "Frontend", val: "Next.js 14 + Tailwind" }
          ].map((item, idx) => (
            <div key={idx} className="clay-card-cream p-5 text-center space-y-1.5 shadow-lg overflow-hidden">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">{item.label}</div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-900">{item.val}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. BOTTOM CTA BANNER SECTION */}
      <section className="py-24 sm:py-32 px-4 sm:px-8 max-w-6xl mx-auto z-[1]">
        <div className="clay-card-lavender p-10 sm:p-16 text-center space-y-6 relative overflow-hidden shadow-2xl border-2 border-white/80">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-indigo-950 tracking-tight leading-tight">
            Ready to test collaborative risk intelligence?
          </h2>

          <p className="text-indigo-900 text-base sm:text-lg max-w-xl mx-auto font-medium">
            Experience the 4-scene interactive dashboard prototype with live gradient flow animations, accuracy metrics, and audit log.
          </p>

          <div className="pt-2">
            <Link
              href="/dashboard"
              className="clay-btn-lavender px-9 py-4 font-extrabold text-base inline-flex items-center gap-3 shadow-xl hover:scale-105"
            >
              <span>Launch FedGuard Dashboard Console</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FOOTER WITH ABSOLUTE (NOT FIXED) "1 ISSUE" BANNER */}
      <footer className="relative py-12 px-4 sm:px-8 border-t border-amber-200/60 text-xs text-slate-600 bg-white/40 backdrop-blur-md z-[1]">
        <div className="max-w-7xl mx-auto relative space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span className="font-extrabold text-slate-900 text-sm">FedGuard Platform</span>
              <span className="text-slate-500">• ENIGMA 5.0 Fintech Track</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-700 font-mono text-[11px] font-bold">
              <span>Tanishq (Data/DP)</span>
              <span>• Yash (ML/FL)</span>
              <span>• Vrinda (Backend)</span>
              <span>• Amishi (Frontend)</span>
            </div>
          </div>

          {/* Absolute "1 Issue" Banner positioned inside bottom footer container */}
          <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between flex-wrap gap-3">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-rose-100/90 text-rose-800 text-xs font-bold border border-rose-300 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
              <span>1 Issue Identified: Data Silos Across Institutions</span>
              <span className="font-mono text-[10px] bg-rose-200/80 px-2 py-0.5 rounded-full text-rose-900">DPDP Act Addressed</span>
            </div>

            <p className="text-[11px] text-slate-500 font-mono">
              © 2026 FedGuard. Privacy-Preserving Collaborative Intelligence.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
