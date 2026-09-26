import FedGuardInteractiveFourScenePrototype from "@/components/FedGuardInteractiveFourScenePrototype";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#fcf6ee] flex flex-col items-center relative">
      {/* Navigation header back to Landing Page */}
      <div className="w-full max-w-7xl px-4 pt-4 flex items-center justify-between z-50">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full clay-card-cream text-indigo-700 hover:scale-105 transition-transform shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Landing Page
        </Link>
        <span className="text-xs text-slate-500 font-mono font-bold">
          FedGuard FL Console v1.0
        </span>
      </div>

      <FedGuardInteractiveFourScenePrototype />
    </main>
  );
}
