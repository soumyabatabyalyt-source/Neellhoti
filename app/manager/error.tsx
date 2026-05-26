"use client"

import { useEffect } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"

export default function ManagerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Manager panel error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center px-4">
      <div
        className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/[0.03] backdrop-blur-xl p-8 text-center">
          <div
            className="animate-pulse"
          >
            <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            Manager Panel Error
          </h2>

          <p className="text-slate-400 text-sm mb-8">
            {error.message || "An error occurred in the manager panel. Please try again."}
          </p>

          <button
            onClick={() => reset()}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500/20 to-rose-500/10 hover:from-rose-500/30 hover:to-rose-500/20 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 transition-all font-semibold flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            Try Again
          </button>

          {error.digest && (
            <p className="text-xs text-slate-500 mt-6 font-mono">
              Error ID: {error.digest}
            </p>
          