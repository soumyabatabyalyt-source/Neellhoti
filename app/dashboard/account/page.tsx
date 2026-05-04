"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { motion } from "framer-motion"
import { 
  Loader2, 
  UserCircle, 
  Mail, 
  MessageSquare, 
  LogOut, 
  ShieldCheck 
} from "lucide-react"

export default function Account() {
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user

      if (!user) return

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      setProfile(data)
    }

    load()
  }, [])

  // --- Premium Loading UI ---
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 font-sans text-slate-200">
        <Loader2 className="animate-spin text-blue-400 mb-4" size={32} />
        <p className="text-slate-400 font-light tracking-wide animate-pulse">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="w-full font-sans text-slate-200">
      
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
          Your <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-indigo-500">Account</span>
        </h1>
        <p className="text-slate-400 font-light">Manage your profile details and session.</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80 }}
        className="w-full max-w-2xl p-8 md:p-10 rounded-[2rem] bg-blue-500/[0.04] border-2 border-white/20 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_30px_rgba(0,0,0,0.2)] flex flex-col gap-8"
      >
        {/* Avatar & Role Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-5 pb-8 border-b-2 border-white/10 text-center md:text-left">
          <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border-2 border-blue-500/20 flex items-center justify-center shrink-0 shadow-lg">
            <UserCircle size={40} className="text-blue-400" />
          </div>
          <div className="flex flex-col justify-center h-full pt-1">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
              <h2 className="text-2xl font-bold text-white">Profile Details</h2>
              {profile.role && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck size={14} />
                  {profile.role}
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm">Your linked accounts and credentials</p>
          </div>
        </div>

        {/* Info List */}
        <div className="space-y-4">
          
          {/* Email */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-black/20 border-2 border-white/5 transition-colors hover:border-white/10">
            <div className="p-3 rounded-xl bg-white/5 text-slate-400 border border-white/5">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Email Address</p>
              <p className="text-slate-200 font-medium">{profile.email}</p>
            </div>
          </div>

          {/* Reddit */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-black/20 border-2 border-white/5 transition-colors hover:border-white/10">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Reddit Account</p>
              <p className="text-slate-200 font-medium">{profile.reddit || "Not connected"}</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-4">
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              location.href = "/login"
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border-2 border-rose-500/30 text-rose-400 font-bold transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(243,64,121,0.15)]"
          >
            <LogOut size={18} />
            Logout Safely
          </button>
        </div>
      </motion.div>
    </div>
  )
}