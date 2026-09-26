import FedGuardInteractiveFourScenePrototype from "@/components/FedGuardInteractiveFourScenePrototype";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#0b1329] flex flex-col items-center relative">
      {/* Navigation header back to Landing Page */}
      <div className="w-full max-w-7xl px-4 pt-4 flex items-center justify-between z-50">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-md hover:scale-105"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
          Back to Landing Page
        </Link>
        <span className="text-xs text-slate-400 font-mono">
          FedGuard FL Console v1.0
        </span>
      </div>

      <FedGuardInteractiveFourScenePrototype />
    </main>
  );
}
