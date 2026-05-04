"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ListTodo, 
  LayoutDashboard, 
  Users, 
  UserCog, 
  CreditCard, 
  Sun, 
  Moon, 
  LogOut,
  Loader2,
  ShieldAlert
} from "lucide-react"

const tabs = [
  { name: "Tasks", path: "/manager/tasks", icon: ListTodo },
  { name: "Submissions", path: "/manager/submissions", icon: LayoutDashboard },
  { name: "Accounts", path: "/manager/accounts", icon: Users },
  { name: "Taskers", path: "/manager/taskers", icon: UserCog },
  { name: "Withdrawals", path: "/manager/withdrawals", icon: CreditCard },
]

export default function ManagerLayout({ children }: any) {
  const [allowed, setAllowed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dark, setDark] = useState(true)

  const router = useRouter()
  const pathname = usePathname()

  // 🔐 ROLE-BASED ACCESS CHECK
  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user

      if (!user) {
        router.push("/auth")
        return
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error(error)
        router.push("/auth")
        return
      }

      // ✅ ONLY MANAGER CAN ENTER
      if (profile?.role === "manager") {
        setAllowed(true)
      } else {
        router.push("/dashboard/tasks") // block taskers
      }

      setLoading(false)
    }

    check()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  // --- Loading State UI ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center font-sans text-slate-200">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={32} />
        <p className="text-slate-400 font-light tracking-wide animate-pulse">Verifying clearance...</p>
      </div>
    )
  }

  // --- Access Denied UI ---
  if (!allowed) {
    return (
      <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center font-sans text-slate-200">
        <div className="p-8 rounded-[2rem] bg-rose-500/10 border-2 border-rose-500/30 backdrop-blur-xl flex flex-col items-center text-center max-w-sm mx-4 shadow-2xl">
          <ShieldAlert className="text-rose-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm mb-6">You do not have manager clearance to view this area.</p>
          <button 
            onClick={() => router.push("/dashboard/tasks")}
            className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border-2 border-white/20 transition-all text-sm font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // --- Main Layout UI ---
  return (
    <div className={`relative min-h-screen overflow-hidden font-sans transition-colors duration-500 flex flex-col ${dark ? 'bg-[#05070A] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Premium Background Effects */}
      <div className={`absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')] ${dark ? 'invert-0' : 'invert'}`} />
      
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: dark ? [0.15, 0.25, 0.15] : [0.05, 0.1, 0.05] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-red-600/30 to-rose-600/10 rounded-full blur-[120px] pointer-events-none fixed" 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: dark ? [0.1, 0.15, 0.1] : [0.05, 0.08, 0.05] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none fixed" 
      />

      {/* FLOATING NAVBAR CARD */}
      <div className="relative z-50 px-4 md:px-8 pt-6 pb-2 w-full max-w-7xl mx-auto">
        <nav className={`w-full px-4 py-4 md:px-6 flex flex-wrap items-center justify-between rounded-[2rem] border-2 backdrop-blur-2xl transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${dark ? 'bg-black/40 border-white/20' : 'bg-white/60 border-slate-300'}`}>
          
          {/* Navigation Tabs (Blue Tint) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mask-linear-fade w-full md:w-auto mb-4 md:mb-0">
            {tabs.map((t) => {
              const isActive = pathname === t.path;
              const Icon = t.icon;
              return (
                <Link key={t.name} href={t.path}>
                  <div className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap border-2 ${
                    isActive 
                      ? (dark ? 'bg-blue-500/20 border-blue-400/40 text-blue-300 shadow-[inset_0_1px_0_rgba(96,165,250,0.3)]' : 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm')
                      : (dark ? 'bg-blue-500/5 border-white/10 text-slate-300 hover:text-white hover:border-blue-400/30 hover:bg-blue-500/10' : 'bg-transparent border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50')
                  }`}>
                    <Icon size={18} className={isActive ? 'text-blue-400' : 'opacity-70'} />
                    {t.name}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 pl-0 md:pl-6 md:border-l-2 border-white/20 w-full md:w-auto justify-end">
            <button 
              onClick={() => setDark(!dark)} 
              className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center border-2 ${dark ? 'bg-white/5 hover:bg-white/10 border-white/20 text-slate-200' : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm'}`}
              title="Toggle Theme"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button 
              onClick={logout} 
              className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 border-2 text-sm font-bold ${dark ? 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/40 text-rose-300' : 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-700'}`}
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* CONTENT CARD (Red Tint) */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 pb-12 flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 80 }}
          className={`flex-1 p-6 md:p-10 rounded-[2rem] border-2 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_12px_40px_0_rgba(0,0,0,0.4)] ${
            dark ? 'bg-rose-500/[0.04] border-white/20' : 'bg-rose-500/[0.05] border-slate-300'
          }`}
        >
          {children}
        </motion.div>
      </main>

    </div>
  )
}