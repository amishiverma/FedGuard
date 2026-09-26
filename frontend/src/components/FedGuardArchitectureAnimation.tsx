"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
  Database,
  Radio,
  CheckCircle2,
  Server,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function FedGuardArchitectureAnimation() {
  // 10-second seamless loop timer (0.0 to 10.0 seconds)
  const [time, setTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = 50; // 20 updates per second for smooth timeline progression
    const timer = setInterval(() => {
      setTime((prev) => {
        const next = prev + (interval / 1000) * speed;
        return next >= 10 ? next % 10 : next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  // Phase computation
  // Flow ①: 0.0s - 2.5s (Server illuminates, Model download packets travel to banks)
  // Flow ②: 2.5s - 5.0s (Banks train locally, Green raw data shields pulse, 0 data leaves)
  // Flow ③: 5.0s - 7.5s (Opacus Gaussian DP noise injection, epsilon/delta badges lock on)
  // Flow ④: 7.5s - 10.0s (DP gradients ascend back to server, model fuses, telemetry streams to dashboard)
  const phase1Active = time >= 0.0 && time < 2.5;
  const phase2Active = time >= 2.5 && time < 5.0;
  const phase3Active = time >= 5.0 && time < 7.5;
  const phase4Active = time >= 7.5 && time < 10.0;

  // Normalized phase progress (0 to 1)
  const progress1 = Math.max(0, Math.min(1, (time - 0.0) / 2.5));
  const progress2 = Math.max(0, Math.min(1, (time - 2.5) / 2.5));
  const progress3 = Math.max(0, Math.min(1, (time - 5.0) / 2.5));
  const progress4 = Math.max(0, Math.min(1, (time - 7.5) / 2.5));

  // Current round tracker
  const currentRound = Math.floor(time / 10) + 1;

  // Live dynamic accuracy and epsilon for the dashboard
  const simulatedAccuracy = (94.2 + (phase4Active ? progress4 * 1.6 : 0)).toFixed(1);
  const simulatedEpsilon = (1.24 + (phase3Active ? progress3 * 0.12 : phase4Active ? 0.12 : 0)).toFixed(2);

  return (
    <div className="relative w-full max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col items-center select-none font-mono">
      {/* Top Header & Interactive Playback Controls */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-[#0e1628]/80 border border-cyan-500/20 rounded-xl px-6 py-3.5 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-wider text-slate-100 uppercase flex items-center gap-2">
              FedGuard Architecture
              <span className="text-xs font-normal text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                60 FPS Precision Loop
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-sans">
              Decentralized Cross-Institution Risk Intelligence • Zero Raw Data Leakage
            </p>
          </div>
        </div>

        {/* Phase Timeline Pill */}
        <div className="flex items-center gap-2 bg-[#090d16] border border-slate-800 rounded-lg p-1.5 px-3">
          <span className="text-xs text-slate-400">Step:</span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors ${
              phase1Active
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : phase2Active
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : phase3Active
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40"
            }`}
          >
            {phase1Active && "① Download Global Model"}
            {phase2Active && "② Local Training (Raw Data Contained)"}
            {phase3Active && "③ Opacus DP Noise (ε, δ) Injected"}
            {phase4Active && "④ SecAgg & Telemetry Stream"}
          </span>
          <span className="text-xs text-cyan-400 font-bold ml-2">
            {time.toFixed(1)}s / 10.0s
          </span>
        </div>

        {/* Playback Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            <Play className={`w-3.5 h-3.5 ${isPlaying ? "fill-cyan-400 text-cyan-400" : ""}`} />
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => setTime(0)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
            title="Reset Loop"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            Reset
          </button>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-slate-800 text-slate-300 text-xs border border-slate-700 rounded-lg px-2 py-1.5 outline-none"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1.0x (Normal)</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2.0x</option>
          </select>
        </div>
      </div>

      {/* Main Diagram Canvas: Locked 2D Planar Frame with 2% slow camera push */}
      <motion.div
        animate={{ scale: [1.0, 1.02, 1.0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-full max-w-[1280px] bg-[#0a0f1d] border-2 border-slate-800/90 rounded-2xl p-6 sm:p-10 shadow-[0_0_80px_rgba(0,0,0,0.85)] overflow-hidden"
      >
        {/* Subtle Cyber Grid Background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Outer Frame Title Badge matching ASCII Diagram */}
        <div className="absolute top-4 left-6 flex items-center gap-2">
          <div className="px-3 py-1 rounded bg-[#0f172a] border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            FEDGUARD PLATFORM
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            // Cross-Institution Financial Risk Mesh
          </span>
        </div>

        {/* Global Round Badge */}
        <div className="absolute top-4 right-6 flex items-center gap-2">
          <span className="text-[11px] text-slate-400">FL Round:</span>
          <span className="px-2 py-0.5 text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded">
            #0{currentRound}
          </span>
        </div>

        {/* ----------------- SVG VECTOR FLOW PIPES & PACKETS ----------------- */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Cyan Glow Filter for Flow 1 */}
            <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Amber Glow Filter for DP gradients */}
            <filter id="glowAmber" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Magenta Glow for Telemetry */}
            <filter id="glowMagenta" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradient Markers */}
            <linearGradient id="cyanLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="amberLineGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* PIPE 1: FL Server -> Bank Nodes (Download Global Model ①) */}
          {/* Path: FL Server Center (250, 150) -> Rightward to (780, 150) -> Downward to (780, 480) & branching to Banks */}
          <path
            d="M 360 140 H 820 V 480"
            fill="none"
            stroke="#1e293b"
            strokeWidth="3"
            strokeDasharray="6 6"
          />
          {/* Active Flow 1 Glowing Pipe */}
          <path
            d="M 360 140 H 820 V 480"
            fill="none"
            stroke={phase1Active ? "#06b6d4" : "#1e293b"}
            strokeWidth={phase1Active ? "3.5" : "2"}
            className={phase1Active ? "glow-cyan transition-all duration-300" : ""}
          />
          {/* Branches to each Bank */}
          <path
            d="M 820 480 H 220 V 520"
            fill="none"
            stroke={phase1Active ? "#06b6d4" : "#1e293b"}
            strokeWidth={phase1Active ? "2.5" : "1.5"}
          />
          <path
            d="M 820 480 H 600 V 520"
            fill="none"
            stroke={phase1Active ? "#06b6d4" : "#1e293b"}
            strokeWidth={phase1Active ? "2.5" : "1.5"}
          />
          <path
            d="M 820 480 H 980 V 520"
            fill="none"
            stroke={phase1Active ? "#06b6d4" : "#1e293b"}
            strokeWidth={phase1Active ? "2.5" : "1.5"}
          />

          {/* FLOW ① PARTICLES (Model Weight Packets: Electric-Cyan) */}
          {phase1Active && (
            <>
              {/* Main trunk packet */}
              <circle
                cx={
                  progress1 < 0.5
                    ? 360 + (820 - 360) * (progress1 * 2)
                    : 820
                }
                cy={
                  progress1 < 0.5
                    ? 140
                    : 140 + (480 - 140) * ((progress1 - 0.5) * 2)
                }
                r="6.5"
                fill="#22d3ee"
                filter="url(#glowCyan)"
              />
              <circle
                cx={
                  progress1 < 0.5
                    ? 360 + (820 - 360) * (progress1 * 2)
                    : 820
                }
                cy={
                  progress1 < 0.5
                    ? 140
                    : 140 + (480 - 140) * ((progress1 - 0.5) * 2)
                }
                r="12"
                fill="#06b6d4"
                opacity="0.35"
              />

              {/* Branch packets when entering second half */}
              {progress1 > 0.6 && (
                <>
                  {/* Bank A packet */}
                  <circle
                    cx={820 - (820 - 220) * ((progress1 - 0.6) / 0.4)}
                    cy={progress1 > 0.9 ? 480 + (520 - 480) * ((progress1 - 0.9) / 0.1) : 480}
                    r="5"
                    fill="#38bdf8"
                    filter="url(#glowCyan)"
                  />
                  {/* Bank B packet */}
                  <circle
                    cx={820 - (820 - 600) * ((progress1 - 0.6) / 0.4)}
                    cy={progress1 > 0.9 ? 480 + (520 - 480) * ((progress1 - 0.9) / 0.1) : 480}
                    r="5"
                    fill="#38bdf8"
                    filter="url(#glowCyan)"
                  />
                  {/* Lending App packet */}
                  <circle
                    cx={820 + (980 - 820) * ((progress1 - 0.6) / 0.4)}
                    cy={progress1 > 0.9 ? 480 + (520 - 480) * ((progress1 - 0.9) / 0.1) : 480}
                    r="5"
                    fill="#38bdf8"
                    filter="url(#glowCyan)"
                  />
                </>
              )}
            </>
          )}

          {/* PIPE 4: Banks -> FL Server (Aggregated DP-protected updates ④) */}
          {/* Path: From Banks Top through right ascending conduit (1060, 520) -> (1060, 200) -> FL Server (360, 200) */}
          <path
            d="M 1000 520 H 1080 V 200 H 360"
            fill="none"
            stroke="#1e293b"
            strokeWidth="3"
            strokeDasharray="6 6"
          />
          <path
            d="M 1000 520 H 1080 V 200 H 360"
            fill="none"
            stroke={phase4Active ? "#f59e0b" : "#1e293b"}
            strokeWidth={phase4Active ? "3.5" : "2"}
            className={phase4Active ? "glow-amber transition-all duration-300" : ""}
          />
          {/* Collecting lines from Bank A & B into Bank C bus */}
          <path
            d="M 220 520 V 495 H 1080"
            fill="none"
            stroke={phase4Active ? "#f59e0b" : "#1e293b"}
            strokeWidth={phase4Active ? "2" : "1.5"}
          />
          <path
            d="M 600 520 V 495"
            fill="none"
            stroke={phase4Active ? "#f59e0b" : "#1e293b"}
            strokeWidth={phase4Active ? "2" : "1.5"}
          />

          {/* FLOW ④ PARTICLES (Aggregated DP-Protected Encrypted Packets: Amber/Gold) */}
          {phase4Active && (
            <>
              {/* Ascending and returning gradient update */}
              <circle
                cx={
                  progress4 < 0.4
                    ? 1080
                    : 1080 - (1080 - 360) * ((progress4 - 0.4) / 0.6)
                }
                cy={
                  progress4 < 0.4
                    ? 520 - (520 - 200) * (progress4 / 0.4)
                    : 200
                }
                r="7"
                fill="#fbbf24"
                filter="url(#glowAmber)"
              />
              <circle
                cx={
                  progress4 < 0.4
                    ? 1080
                    : 1080 - (1080 - 360) * ((progress4 - 0.4) / 0.6)
                }
                cy={
                  progress4 < 0.4
                    ? 520 - (520 - 200) * (progress4 / 0.4)
                    : 200
                }
                r="14"
                fill="#f59e0b"
                opacity="0.3"
              />
            </>
          )}

          {/* PIPE: FL Server -> Dashboard (FastAPI + WebSocket Live Metrics Stream) */}
          <path
            d="M 240 240 V 330"
            fill="none"
            stroke={phase4Active ? "#ec4899" : "#334155"}
            strokeWidth={phase4Active ? "3" : "2"}
            strokeDasharray={phase4Active ? "4 4" : "none"}
            className={phase4Active ? "glow-magenta" : ""}
          />
          {phase4Active && (
            <circle
              cx="240"
              cy={240 + (330 - 240) * progress4}
              r="4.5"
              fill="#f472b6"
              filter="url(#glowMagenta)"
            />
          )}
        </svg>

        {/* ----------------- DIAGRAM CONTENT GRID ----------------- */}
        <div className="relative z-20 flex flex-col gap-10 mt-8">
          {/* TOP TIER: FL SERVER & LABELS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Box 1: FL SERVER (Flower) + FedAvg + Secure Agg */}
            <div className="lg:col-span-4">
              <motion.div
                animate={{
                  boxShadow: phase1Active
                    ? "0 0 35px rgba(6, 182, 212, 0.45), inset 0 0 15px rgba(6, 182, 212, 0.2)"
                    : phase4Active
                    ? "0 0 40px rgba(245, 158, 11, 0.5), inset 0 0 20px rgba(245, 158, 11, 0.25)"
                    : "0 0 15px rgba(0, 0, 0, 0.5)",
                  borderColor: phase1Active
                    ? "#06b6d4"
                    : phase4Active
                    ? "#f59e0b"
                    : "#334155",
                }}
                transition={{ duration: 0.3 }}
                className="bg-[#0f172a] border-2 rounded-xl p-5 relative overflow-hidden backdrop-blur-sm"
              >
                {/* Fusion radial burst in Phase 4 */}
                {phase4Active && progress4 > 0.8 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0.9 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute inset-0 bg-amber-400 rounded-full blur-xl pointer-events-none"
                  />
                )}

                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold text-slate-100 text-sm tracking-wide">
                      FL Server
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                    Flower 1.7+
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>+ FedAvg (Federated Averaging)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+ Secure Aggregation (SecAgg+)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] pt-1">
                    <span>Poisoning Filter:</span>
                    <span className="text-emerald-400 font-bold">Cosine Sim &gt; 0.85</span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">State:</span>
                  <span
                    className={`font-semibold flex items-center gap-1.5 ${
                      phase1Active
                        ? "text-cyan-400 animate-pulse"
                        : phase4Active
                        ? "text-amber-400 animate-pulse"
                        : "text-slate-400"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        phase1Active
                          ? "bg-cyan-400"
                          : phase4Active
                          ? "bg-amber-400"
                          : "bg-slate-600"
                      }`}
                    />
                    {phase1Active
                      ? "Broadcasting Weights"
                      : phase4Active
                      ? "Aggregating Gradients"
                      : "Standing By"}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Flows ① & ④ Explanation Banners matching exact diagram arrows */}
            <div className="lg:col-span-8 flex flex-col justify-between h-full pt-1 space-y-4">
              {/* Flow ① Download Global Model Label */}
              <div
                className={`p-3.5 rounded-lg border transition-all duration-300 ${
                  phase1Active
                    ? "bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                    : "bg-[#0b1324]/50 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-[11px]">
                      ①
                    </span>
                    <span className="text-cyan-300">Download Global Model</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Server ➔ Bank Clients
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-sans pl-7">
                  Global PyTorch neural net weights dispatched to siloed client nodes.
                </p>
              </div>

              {/* Flow ④ Aggregated DP-protected updates Label */}
              <div
                className={`p-3.5 rounded-lg border transition-all duration-300 ${
                  phase4Active
                    ? "bg-amber-950/40 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                    : "bg-[#0b1324]/50 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-[11px]">
                      ④
                    </span>
                    <span className="text-amber-300">
                      Aggregated DP-protected updates
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Bank Clients ➔ Server
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-sans pl-7">
                  Zero raw data transmitted; only noisy, clipped model gradients are returned.
                </p>
              </div>
            </div>
          </div>

          {/* MIDDLE TIER: FASTAPI + WEBSOCKET & NEXT.JS DASHBOARD */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Box: Dashboard (Next.js) */}
            <div className="lg:col-span-4">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                FastAPI + WebSocket Pipe
              </div>
              <motion.div
                animate={{
                  boxShadow: phase4Active
                    ? "0 0 30px rgba(236, 72, 153, 0.4), inset 0 0 10px rgba(236, 72, 153, 0.15)"
                    : "0 0 10px rgba(0, 0, 0, 0.5)",
                  borderColor: phase4Active ? "#ec4899" : "#334155",
                }}
                className="bg-[#0f172a] border-2 rounded-xl p-4 relative backdrop-blur-sm"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-pink-400" />
                    <span className="font-bold text-slate-100 text-xs">
                      Dashboard (Next.js)
                    </span>
                  </div>
                  <span className="text-[10px] text-pink-400 bg-pink-950/60 px-1.5 py-0.5 rounded border border-pink-800/40">
                    Live Stream
                  </span>
                </div>

                {/* Real-time telemetry readouts */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-[#090d16] p-2 rounded border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Global AUC / Acc</div>
                    <div className="text-emerald-400 font-bold text-sm flex items-center gap-1 mt-0.5">
                      {simulatedAccuracy}%
                      {phase4Active && (
                        <span className="text-[9px] text-emerald-300 animate-bounce">▲</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-[#090d16] p-2 rounded border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Total ε Budget</div>
                    <div className="text-amber-400 font-bold text-sm mt-0.5">
                      {simulatedEpsilon} / 8.0
                    </div>
                  </div>
                </div>

                {/* Animated Mini Sparkline */}
                <div className="mt-2.5 h-6 w-full flex items-end gap-1 px-1 bg-[#090d16]/70 rounded overflow-hidden">
                  {[40, 52, 65, 78, 84, 88, 91, Number(simulatedAccuracy)].map((val, idx) => (
                    <motion.div
                      key={idx}
                      className="flex-1 bg-gradient-to-t from-cyan-600 to-pink-500 rounded-t"
                      style={{ height: `${(val / 100) * 100}%` }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-8 flex items-center justify-center p-3 text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl bg-[#090d16]/30">
              <span className="text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                DPDP Act (India) &amp; GDPR Article 25/32 Compliant Architecture By Design
              </span>
            </div>
          </div>

          {/* BOTTOM TIER: 3 CLIENT BANKS */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                Decentralized Participant Nodes (Dirichlet Non-IID Splitting)
              </span>
              <span className="text-[11px] text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                Strict Zero-Egress Boundary
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* BANK A (HDFC) */}
              <BankNode
                title="Bank A"
                institution="HDFC"
                focus="Loan Defaults & Card Fraud"
                phase1Active={phase1Active}
                phase2Active={phase2Active}
                phase3Active={phase3Active}
                phase4Active={phase4Active}
                progress2={progress2}
                progress3={progress3}
                epsilon="ε = 1.18"
              />

              {/* BANK B (ICICI) */}
              <BankNode
                title="Bank B"
                institution="ICICI"
                focus="ATM & Wire Fraud"
                phase1Active={phase1Active}
                phase2Active={phase2Active}
                phase3Active={phase3Active}
                phase4Active={phase4Active}
                progress2={progress2}
                progress3={progress3}
                epsilon="ε = 1.25"
              />

              {/* LENDING APP (PhonePe) */}
              <BankNode
                title="Lending App"
                institution="PhonePe"
                focus="UPI Micro-Lending Risk"
                phase1Active={phase1Active}
                phase2Active={phase2Active}
                phase3Active={phase3Active}
                phase4Active={phase4Active}
                progress2={progress2}
                progress3={progress3}
                epsilon="ε = 1.29"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Specification Details */}
      <div className="w-full max-w-[1280px] mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            Model Weights
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Raw Customer Data (Guarded)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            Opacus DP Gradients (ε, δ)
          </span>
        </div>
        <div>60 FPS • Next.js 14 App Router • Framer Motion Hardware Accelerated</div>
      </div>
    </div>
  );
}

// Subcomponent: Individual Bank Client Box
interface BankNodeProps {
  title: string;
  institution: string;
  focus: string;
  phase1Active: boolean;
  phase2Active: boolean;
  phase3Active: boolean;
  phase4Active: boolean;
  progress2: number;
  progress3: number;
  epsilon: string;
}

function BankNode({
  title,
  institution,
  focus,
  phase1Active,
  phase2Active,
  phase3Active,
  phase4Active,
  progress2,
  progress3,
  epsilon,
}: BankNodeProps) {
  return (
    <motion.div
      animate={{
        borderColor: phase2Active
          ? "#10b981"
          : phase3Active
          ? "#f59e0b"
          : phase1Active
          ? "#06b6d4"
          : "#334155",
        boxShadow: phase2Active
          ? "0 0 25px rgba(16, 185, 129, 0.3)"
          : phase3Active
          ? "0 0 25px rgba(245, 158, 11, 0.3)"
          : "0 0 10px rgba(0, 0, 0, 0.5)",
      }}
      className="bg-[#0f172a] border-2 rounded-xl p-5 relative overflow-hidden backdrop-blur-sm"
    >
      {/* Node Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="font-bold text-slate-100 text-sm tracking-wide">
            {title}
          </h2>
          <span className="text-xs font-semibold text-cyan-400">
            ({institution})
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          Client Node
        </span>
      </div>

      <div className="mt-2 text-[11px] text-slate-400 font-sans">{focus}</div>

      {/* Internal Elements matching ASCII layout */}
      <div className="mt-4 space-y-3">
        {/* ② Local Train Box with Neural Net Flash in Phase 2 */}
        <div
          className={`p-3 rounded-lg border transition-all duration-300 relative overflow-hidden ${
            phase2Active
              ? "bg-slate-900 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              : "bg-[#090d16] border-slate-800"
          }`}
        >
          {phase2Active && (
            <motion.div
              animate={{ opacity: [0.2, 0.9, 0.2] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="absolute inset-0 bg-emerald-500/10 pointer-events-none"
            />
          )}

          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1.5">
              <Cpu
                className={`w-3.5 h-3.5 ${
                  phase2Active ? "text-emerald-400 animate-spin" : "text-slate-500"
                }`}
              />
              ② Local Train
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {phase2Active ? "Epoch 3/3" : "PyTorch NN"}
            </span>
          </div>

          {/* Local Neural Net Circuit Nodes Flash */}
          <div className="mt-2 flex items-center justify-between px-2 py-1 bg-black/40 rounded">
            {[1, 2, 3, 4, 5].map((node) => (
              <motion.div
                key={node}
                animate={
                  phase2Active
                    ? {
                        scale: [1, 1.4, 1],
                        backgroundColor: ["#10b981", "#34d399", "#059669"],
                      }
                    : { scale: 1, backgroundColor: "#334155" }
                }
                transition={{
                  duration: 0.4,
                  repeat: phase2Active ? Infinity : 0,
                  delay: node * 0.1,
                }}
                className="w-2 h-2 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* ③ DP Noise Applied Box with Opacus (ε, δ) Sparkle Dust */}
        <div
          className={`p-3 rounded-lg border transition-all duration-300 relative ${
            phase3Active
              ? "bg-amber-950/30 border-amber-500/80 shadow-[0_0_18px_rgba(245,158,11,0.35)]"
              : "bg-[#090d16] border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1.5">
              <Sparkles
                className={`w-3.5 h-3.5 ${
                  phase3Active ? "text-amber-400 animate-bounce" : "text-slate-500"
                }`}
              />
              ③ DP Noise Applied
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                phase3Active
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                  : "text-slate-500"
              }`}
            >
              {epsilon}
            </span>
          </div>

          <div className="mt-1 text-[10px] text-slate-400 font-sans">
            Opacus Gaussian Noise + L2 Norm Clip
          </div>

          {/* Floating Gold/Amber Gaussian DP Sparkles */}
          {phase3Active && (
            <div className="absolute inset-0 flex items-center justify-around pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [-4, 4, -4],
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 0.7,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                  className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]"
                />
              ))}
            </div>
          )}
        </div>

        {/* GREEN BOX: Raw Data STAYS HERE (Vibrant Neon Emerald Shield & Padlock) */}
        <div
          className={`p-3 rounded-lg border-2 transition-all duration-300 relative overflow-hidden ${
            phase2Active
              ? "bg-emerald-950/50 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.7),inset_0_0_15px_rgba(16,185,129,0.4)]"
              : "bg-emerald-950/20 border-emerald-600/70 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
              <div>
                <div className="font-extrabold text-emerald-300 text-xs tracking-wider uppercase">
                  Raw Data
                </div>
                <div className="text-[10px] font-bold text-emerald-400">
                  STAYS HERE
                </div>
              </div>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="mt-2 text-[10px] text-emerald-300/80 font-mono flex items-center justify-between border-t border-emerald-800/40 pt-1.5">
            <span>Egress: 0 Bytes</span>
            <span>DPDP Sec. 4</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
