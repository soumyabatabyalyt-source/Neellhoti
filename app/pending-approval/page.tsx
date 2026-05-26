"use client"

export const dynamic = "force-dynamic"

import { useSearchParams, useRouter } from "next/navigation"
import { Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"
import { useState, Suspense } from "react"
import { useTheme } from "@/lib/useTheme"

function PendingApprovalContent() {
  const { dark, mounted } = useTheme()
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get("email") || "your account"
  const [isHovered, setIsHovered] = useState(false)

  if (!mounted) return null

  return (
    <div className={`min-h-screen flex justify-center items-center relative overflow-hidden p-5 transition-colors duration-500 ${
      dark ? "bg-[#0f0814]" : "bg-[#fafaf8]"
    }`}>
      {/* Gradient background */}
      <div className={`absolute w-[400px] h-[400px] rounded-full blur-[120px] top-[-100px] left-[-100px] ${
        dark ? "bg-red-500/20" : "bg-red-500/10"
      }`} />
      <div className={`absolute w-[400px] h-[400px] rounded-full blur-[120px] bottom-[-100px] right-[-100px] ${
        dark ? "bg-blue-600/10" : "bg-red-500/5"
      }`} />

      {/* Main container */}
      <div className={`relative z-10 w-full max-w-xl rounded-[28px] p-12 backdrop-blur-2xl border-2 transition-all duration-500 ${
        dark
          ? "bg-[#7f1d1d] border-black shadow-[0_0_40px_rgba(239,68,68,0.2)] hover:shadow-[0_0_60px_rgba(239,68,68,0.3)]"
          : "bg-[#7f1d1d] border-black shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
      }`}>
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <Clock size={48} className={dark ? "text-amber-500" : "text-amber-600"} />
        </div>

        {/* Title */}
        <h1 className="text-white text-center text-3xl font-bold mb-4">
          Account Pending Approval
        </h1>

        {/* Description */}
        <p className={`text-center text-sm leading-relaxed mb-8 ${
          dark ? "text-slate-400" : "text-slate-200"
        }`}>
          Welcome! Your account has been created successfully. A manager will review and approve your account shortly.
        </p>

        {/* Email display */}
        <div className={`rounded-xl p-4 mb-8 border transition-colors ${
          dark
            ? "bg-white/[0.02] border-white/5"
            : "bg-white/10 border-white/10"
        }`}>
          <p className={`text-xs font-semibold uppercase mb-2 ${
            dark ? "text-slate-500" : "text-slate-400"
          }`}>Email:</p>
          <p className="text-white text-sm break-all">{email}</p>
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center min-w-[40px] w-10">
              <CheckCircle2 size={20} className="text-green-500" />
            </div>
            <p className={dark ? "text-slate-300 text-sm" : "text-white text-sm"}>Account created</p>
          </div>

          <div className={`h-4 border-l-2 ml-5 ${
            dark ? "border-white/10" : "border-white/20"
          }`} />

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center min-w-[40px] w-10">
              <Clock size={20} className="text-amber-500" />
            </div>
            <p className={dark ? "text-slate-300 text-sm" : "text-white text-sm"}>Awaiting manager review</p>
          </div>

          <div className={`h-4 border-l-2 ml-5 ${
            dark ? "border-white/10" : "border-white/20"
          }`} />

          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center min-w-[40px] w-10">
              <CheckCircle2 size={20} className="text-slate-500" />
            </div>
            <p className={dark ? "text-slate-300 text-sm" : "text-white text-sm"}>Account approved</p>
          </div>
        </div>

        {/* Info box */}
        <div className={`flex gap-3 rounded-xl p-4 mb-8 border ${
          dark
            ? "bg-blue-500/5 border-blue-500/20"
            : "bg-blue-500/10 border-blue-500/30"
        }`}>
          <AlertCircle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className={`text-sm font-semibold mb-1 ${
              dark ? "text-blue-400" : "text-blue-300"
            }`}>What happens next?</p>
            <p className={`text-xs leading-relaxed ${
              dark ? "text-slate-400" : "text-slate-300"
            }`}>
              Our team will verify your Reddit account and Discord username. You'll be able to login once your account is approved.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => router.push("/login")}
            className={`flex-1 py-3.5 rounded-xl border font-semibold text-sm transition-all ${
              dark
                ? "bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/5"
                : "bg-white/10 border-white/20 text-white hover:bg-white/20"
            }`}
          >
            Back to Login
          </button>

          <button
            onClick={() => router.push("/")}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`flex-1 py-3.5 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              dark
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 border-red-600"
                : "bg-red-500 hover:bg-red-600 border-black text-white"
            } ${isHovered ? "transform -translate-y-0.5" : ""}`}
            style={{
              boxShadow: isHovered
                ? "0 20px 40px rgba(239, 68, 68, 0.3)"
                : "0 10px 20px rgba(239, 68, 68, 0.2)",
            }}
          >
            Go Home
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Help text */}
        <p className={`text-center text-xs ${
          dark ? "text-slate-500" : "text-slate-400"
        }`}>
          Need help? Check your email for more information or contact support.
        </p>
      </div>
    </div>
  )
}

export default function PendingApproval() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex item