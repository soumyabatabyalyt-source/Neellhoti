"use client"

import { useEffect } from "react"
import { AlertTriangle, RotateCcw, Shield } from "lucide-react"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Admin panel error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.03] backdrop-blur-xl p-8 text-center">
          <div className="animate-pulse">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Shield className="w-6 h-6 text-amber-500" />
              <AlertTriangle className="w-12 h-12 text-amber-500" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            Admin Panel Error
          </h2>

          <p className="text-slate-400 text-sm mb-8">
            {error.message || "An critical error occurred in the admin panel."}
          </p>

          <button
            onClick={() => reset()}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/10 hover:from-amber-500/30 hover:to-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-500/50 transition-all font-semibold flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            Try Again
          </button>

          {error.digest && (
            <p className="text-xs text-slate-500 mt-6 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
