import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ManagerNotFound() {
  return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center px-4 py-12">
      <div
        className="max-w-md w-full text-center animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400 mb-4">
          404
        </h1>

        <h2 className="text-3xl font-bold text-white mb-3">
          Page Not Found
        </h2>

        <p className="text-slate-400 mb-8">
          This page doesn't exist in the manager panel.
        </p>

        <Link
          href="/manager"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500/20 to-red-500/20 hover:from-rose-500/30 hover:to-red-500/30 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 transition-all font-semibold"
        >
          <ArrowLeft size={18} />
          Back to Manager
        </Link>
  