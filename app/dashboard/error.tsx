"use client"

import { useEffect } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center px-4">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md w-full">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.03] backdrop-blur-xl p-8 text-center">
          <div className="animate-pulse">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            Something went wrong
          </h2>

          <p className="text-slate-400 text-sm mb-8">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>

          <button
            onClick={() => reset()}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-red-500/20 to-red-500/10 hover:from-red-500/30 hover:to-red-500/20 text-red-300 border border-red-500/30 hover:border-red-500/50 transition-all font-semibold flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            Try Again
          </button>

          {error.digest && (
            <p className="text-xs text-slate-500 mt-6 font-mono">
              Error ID: {error.digest}
            </p>
          )}
