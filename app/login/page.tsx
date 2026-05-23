"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useTheme } from "@/lib/useTheme"

export default function Login() {
  const { dark, mounted } = useTheme()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // ✅ Move conditional rendering into JSX, not early return
  if (!mounted) return null

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      })

      if (error) {
        console.error('Google login error:', error)
        alert(error.message || 'Google login failed')
        setLoading(false)
      }
    } catch (err) {
      console.error('Google login error:', err)
      alert('Something went wrong with Google login')
      setLoading(false)
    }
  }

  const handleLogin = async () => {

    if (!email || !password) {
      alert("Please enter both email and password")
      return
    }

    setLoading(true)

    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        alert(error.message || "Login failed. Please check your credentials.")
        setLoading(false)
        return
      }

      const user = data.user

      if (!user) {
        alert("Authentication failed. Please try again.")
        setLoading(false)
        return
      }

      // fetch profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, approval_status")
        .eq("id", user.id)
        .single()

      if (profileError || !profile) {
        console.error(profileError)
        alert("Failed to load profile data. Please try again.")
        setLoading(false)
        return
      }

      // Check if account is suspended
      if (profile.approval_status === 'suspended') {
        alert("Your account has been suspended. Please contact support.")
        setLoading(false)
        return
      }

      // Check if account is approved
      if (profile.approval_status !== 'approved') {
        router.push(`/pending-approval?email=${encodeURIComponent(email)}`)
        return
      }

      const role = profile?.role?.trim()?.toLowerCase()

      console.log("Login successful. Role:", role)

      // Smooth navigation instead of hard redirect
      if (role === "admin") {
        router.push("/admin")
      } else if (role === "manager") {
        router.push("/manager/tasks")
      } else {
        router.push("/dashboard/tasks")
      }
    } catch (err) {
      console.error("Login error:", err)
      alert("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex justify-center items-center relative overflow-hidden p-5 transition-colors duration-500 ${
      dark ? "bg-[#0f0814]" : "bg-[#fafaf8]"
    }`}>

      {/* HOME BUTTON WITH LOGO */}
      <button
        onClick={() => router.push("/")}
        className={`
          fixed
          top-6
          left-6
          z-50
          flex
          items-center
          gap-2
          px-4
          py-2
          rounded-full
          font-semibold
          text-sm
          transition-all
          hover:scale-105
          ${dark
            ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/50"
            : "bg-red-600 text-white hover:bg-red-700"}
        `}
      >
        <img src="/logo-icon.png" alt="Neellohit" className="w-6 h-6" />
        Home
      </button>

      <div className={`absolute w-[400px] h-[400px] rounded-full blur-[120px] top-[-100px] left-[-100px] ${
        dark ? "bg-red-500/20" : "bg-red-500/10"
      }`} />
      <div className={`absolute w-[400px] h-[400px] rounded-full blur-[120px] bottom-[-100px] right-[-100px] ${
        dark ? "bg-blue-600/10" : "bg-red-500/5"
      }`} />

      <div className={`relative z-10 w-full max-w-md rounded-[28px] p-10 backdrop-blur-2xl border-2 transition-all duration-500 ${
        dark
          ? "bg-[#7f1d1d] border-black shadow-[0_0_40px_rgba(239,68,68,0.2)] hover:shadow-[0_0_60px_rgba(239,68,68,0.3)]"
          : "bg-[#7f1d1d] border-black shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
      }`}>

        <div className="w-20 h-20 rounded-[18px] mx-auto mb-6 flex items-center justify-center">
          <img src="/logo-md.png" alt="Neellohit" className="w-20 h-20 object-contain" />
        </div>

        <h1 className="text-white text-center text-4xl font-bold mb-2.5">
          Welcome Back
        </h1>

        <p className={`text-center mb-8 text-sm ${
          dark ? "text-slate-400" : "text-slate-600"
        }`}>
          Login to continue to Nillohit
        </p>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className={`w-full px-4 py-4 mb-4 rounded-xl border outline-none transition-all ${
            dark
              ? "bg-black/30 border-white/10 text-white placeholder-slate-500 focus:border-red-500/50 focus:bg-black/50"
              : "bg-white/60 border-red-500/30 text-slate-900 placeholder-slate-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
          }`}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className={`w-full px-4 py-4 mb-4 rounded-xl border outline-none transition-all ${
            dark
              ? "bg-black/30 border-white/10 text-white placeholder-slate-500 focus:border-red-500/50 focus:bg-black/50"
              : "bg-white/60 border-red-500/30 text-slate-900 placeholder-slate-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
          }`}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-4 rounded-xl text-white font-bold text-base mt-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            dark
              ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>

        {/* DIVIDER */}
        <div className="flex items-center gap-3 my-6">
          <div className={`flex-1 h-px ${
            dark ? "bg-white/10" : "bg-red-500/20"
          }`} />
          <span className={`text-xs ${
            dark ? "text-white/40" : "text-slate-500"
          }`}>OR</span>
          <div className={`flex-1 h-px ${
            dark ? "bg-white/10" : "bg-red-500/20"
          }`} />
        </div>

        {/* GOOGLE LOGIN BUTTON */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`w-full py-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            dark
              ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
              : "bg-red-500/20 hover:bg-red-500/30 border-red-500/40 text-white"
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
          {loading ? "Connecting..." : "Login with Google"}
        </button>

        <p className={`mt-6 text-center text-sm ${
          dark ? "text-slate-400" : "text-slate-600"
        }`}>
          New here?{" "}
          <span
            onClick={() =>
              router.push("/auth")
            }
            className={`ml-2 cursor-pointer font-semibold transition-colors ${
              dark ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-600"
            }`}
          >
            Create account
          </span>
        </p>

      </div>
    </div>
  )
}