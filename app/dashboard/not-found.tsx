import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function DashboardNotFound() {
  return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center px-4 py-12">
      <div
        className="max-w-md w-full text-center animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 mb-4">
          404
        </h1>

        <h2 className="text-3xl font-bold text-white mb-3">
          Page Not Found
        </h2>

        <p className="text-slate-400 mb-8">
          The page you're looking for doesn't exist in your dashboard.
        </p>

        <Link
          href="/dashboard/tasks"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-300 border border-blue-500/30 hover:border-blue-500/50 transition-all font-semibold"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
  