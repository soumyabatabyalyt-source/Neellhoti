"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Navbar from "@/components/Navbar"
import { ThemeProvider } from "@/components/ThemeProvider"
import MyTasks from "../../components/MyTasks"
import Wallet from "../../components/Wallet"
import Account from "../../components/Account"
import { motion } from "framer-motion"
import { Loader2, ShieldAlert } from "lucide-react"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [page, setPage] = useState("tasks")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }

    getUser()
  }, [])

  // --- Premium Loading UI ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#05070A] flex flex-col items-center justify-center font-sans text-slate-800 dark:text-slate-200 transition-colors duration-500">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={32} />
        <p className="text-slate-500 dark:text-slate-400 font-light tracking-wide animate-pulse">Loading dashboard...</p>
      </div>
    )
  }

  // --- Premium Unauthorized UI ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#05070A] flex flex-col items-center justify-center font-sans transition-colors duration-500">
        <div className="p-8 rounded-[2rem] bg-rose-100 dark:bg-rose-500/10 border-2 border-rose-300 dark:border-rose-500/30 backdrop-blur-xl flex flex-col items-center text-center max-w-sm mx-4 shadow-2xl">
          <ShieldAlert className="text-rose-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">Please log in to view your dashboard.</p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="px-6 py-2.5 rounded-xl bg-white/50 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 border-2 border-slate-300 dark:border-white/20 transition-all text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // --- Main Layout UI ---
  return (
    <ThemeProvider>
      <div className="relative min-h-screen overflow-hidden font-sans transition-colors duration-500 flex flex-col bg-slate-50 dark:bg-[#05070A] text-slate-800 dark:text-slate-200">
        
        {/* Premium Background Effects */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')] invert dark:invert-0" />
        
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
          whileInView={{ opacity: [0.15, 0.25, 0.15] }} // Dark mode opacity adjusted by ThemeProvider implicitly via classes if needed
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-red-600/30 to-rose-600/10 rounded-full blur-[120px] pointer-events-none fixed dark:opacity-100 opacity-50" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.08, 0.05] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none fixed dark:opacity-100 opacity-50" 
        />

        {/* FLOATING NAVBAR CONTAINER */}
        <div className="relative z-50 px-4 md:px-8 pt-6 pb-2 w-full max-w-7xl mx-auto">
          {/* ✅ UPDATED NAVBAR USAGE - Ensure the Navbar component uses the blue-tint styles internally! */}
          <Navbar page={page} setPage={setPage} />
        </div>

        {/* CONTENT CARD (Red Tint) */}
        <main className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 pb-12 flex-1 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 80 }}
            className="flex-1 p-6 md:p-10 rounded-[2rem] border-2 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_12px_40px_0_rgba(0,0,0,0.1)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_12px_40px_0_rgba(0,0,0,0.4)] bg-rose-500/[0.05] border-slate-300 dark:bg-rose-500/[0.04] dark:border-white/20"
          >
            {page === "tasks" && <MyTasks user={user} />}
            {page === "wallet" && <Wallet user={user} />}
            {page === "account" && <Account user={user} />}
          </motion.div>
        </main>

      </div>
    </ThemeProvider>
  )
}