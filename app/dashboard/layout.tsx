"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const [dark, setDark] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // Wait for auth client to fully initialize (restores session from localStorage + refreshes if needed)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") {
        // Fires once after client loads from localStorage & refreshes token if expired
        if (!session) {
          router.push("/login")
          setIsAuthenticated(false)
        } else {
          setIsAuthenticated(true)
        }
      } else if (event === "SIGNED_OUT") {
        router.push("/login")
        setIsAuthenticated(false)
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setIsAuthenticated(true)
      }
    })

    return () => subscription?.unsubscribe()
  }, [router])

  // persist theme
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("theme")
    if (saved === "light") setDark(false)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("theme", dark ? "dark" : "light")
    }
  }, [dark, mounted])

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className={`min-h-screen w-full flex items-center justify-center px-4 ${dark ? "bg-[#0f0814]" : "bg-[#fafaf8]"}`}>
        <div className="text-center">
          <div
            className={`w-12 h-12 rounded-xl border-2 mx-auto mb-4 animate-spin ${dark ? "border-red-500/30 border-t-red-500" : "border-red-500/50 border-t-red-500"}`}
          />
          <p className={`animate-pulse ${dark ? "text-gray-300" : "text-gray-600"}`}>
            Verifying session...
          </p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null
  }

  const navItems = [
    { name: "Tasks", path: "/dashboard/tasks" },
    { name: "My Tasks", path: "/dashboard/my-tasks/active" },
    { name: "Wallet", path: "/dashboard/wallet" },
    { name: "Account", path: "/dashboard/account" },
  ]

  // Prevent hydration mismatch on theme render
  if (!mounted) return null

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-500 font-sans overflow-x-hidden ${
        dark
          ? "bg-[#0f0814] text-[#ffffff] selection:bg-red-500/30"
          : "bg-[#fafaf8] text-slate-900 selection:bg-red-500/20"
      }`}
    >
      {/* 🌟 AMBIENT GLOWS */}
      {dark && (
        <>
          <div className="fixed w-[600px] h-[600px] bg-red-600/8 rounded-full blur-[120px] top-[-20%] left-[-10%] pointer-events-none" />
          <div className="fixed w-[500px] h-[500px] bg-red-500/6 rounded-full blur-[100px] bottom-[-10%] right-[-5%] pointer-events-none" />
        </>
      )}

      {/* 🔥 NAVBAR */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 backdrop-blur-2xl transition-all duration-300 ${
          dark
            ? "bg-[#0f0814]/80 border-b border-red-500/30 shadow-[0_4px_30px_rgba(239,68,68,0.1)]"
            : "bg-[#fafaf8]/95 border-b border-red-500/20 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex justify-between items-center gap-2 sm:gap-4">

          {/* LEFT: BRAND LOGO */}
          <div
            className="flex-shrink-0 flex items-center gap-1 sm:gap-2 cursor-pointer group hover:scale-110 transition-transform"
            onClick={() => router.push("/")}
          >
            <img src="/logo-icon.png" alt="Neellohit" className="w-8 h-8 sm:w-10 sm:h-10" />
            <h2 className="font-bold text-sm sm:text-xl tracking-tight hidden sm:block">
              Nillohit
            </h2>
          </div>

          {/* CENTER: NAV ITEMS (Centered Dock) */}
          <div className="flex-1 flex justify-center overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className={`flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border transition-colors ${
              dark ? "bg-white/[0.02] border-red-500/30" : "bg-white/60 border-red-500/20"
            }`}>
              {navItems.map((item) => {
                const active = pathname === item.path

                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.path)}
                    className={`relative px-2 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap outline-none border ${
                      active
                        ? (dark ? "border-red-500/50 text-white bg-red-500/10" : "border-black bg-[#7f1d1d] text-white shadow-md")
                        : (dark ? "border-transparent text-gray-300 hover:text-white hover:border-red-500/30 hover:bg-red-500/5" : "border-transparent text-slate-600 hover:text-slate-900 hover:border-red-500/30 hover:bg-red-500/5")
                    }`}
                  >
                    {active && (
                      <div
                        className={`absolute inset-0 rounded-lg sm:rounded-xl border ${
                          dark ? "bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "bg-[#7f1d1d] border-black shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                        }`}
                      />
                    )}
                    <span className="relative z-10">{item.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* RIGHT: THEME TOGGLE */}
          <div className="flex-shrink-0 flex items-center justify-end">
            <button
              onClick={() => setDark(!dark)}
              className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border flex items-center justify-center transition-all shadow-sm hover:scale-110 ${
                dark
                  ? "bg-white/5 border-white/10 hover:bg-white/10 text-yellow-400 hover:border-white/20"
                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300"
              }`}
              aria-label="Toggle theme"
            >
              <div
                className="transition-transform duration-200" style={{ transform: `rotate(${dark ? 0 : 180}deg) scale(${dark ? 1 : 0.8})` }}
              >
                {dark ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
            </button>
          </div>

        </div>
      </nav>

      {/* 📦 CONTENT WRAPPER */}
      <main className="relative z-10 pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div
          key={pathname}
          className="animate-in fade-in slide-in-from-bottom-4 duration-400"
        >
          {children}
        </div>
      </main>
      
    </div>
  )
}