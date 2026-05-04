"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { motion } from "framer-motion"
import { Loader2, ShieldAlert, Coins, CheckCircle, FileText } from "lucide-react"

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user

      if (!user) return

      // 🔐 ROLE CHECK (THIS IS WHAT YOU ASKED FOR)
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error(error)
        return
      }

      // ❌ BLOCK MANAGERS
      if (profile?.role === "manager") {
        setBlocked(true)
        setLoading(false)
        return
      }

      // ✅ LOAD TASKS FOR TASKERS
      const { data, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("status", "open")

      if (taskError) {
        console.error(taskError)
        return
      }

      setTasks(data || [])
      setLoading(false)
    }

    init()
  }, [])

  const claimTask = async (taskId: string) => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) return

    // 🔥 Insert claim
    const { error } = await supabase.from("task_claims").insert({
      task_id: taskId,
      user_id: user.id,
      status: "claimed",
    })

    if (error) {
      console.error(error)
      alert("Claim failed ❌")
      return
    }

    // 🔥 Update task status
    await supabase
      .from("tasks")
      .update({ status: "claimed" })
      .eq("id", taskId)

    alert("Task claimed ✅")
  }

  // --- Premium Loading UI ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] font-sans text-slate-200">
        <Loader2 className="animate-spin text-blue-400 mb-4" size={32} />
        <p className="text-slate-400 font-light tracking-wide animate-pulse">Scanning available tasks...</p>
      </div>
    )
  }

  // --- Premium Blocked UI ---
  if (blocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] font-sans text-slate-200">
        <div className="p-8 rounded-[2rem] bg-rose-500/10 border-2 border-rose-500/30 backdrop-blur-xl flex flex-col items-center text-center max-w-sm mx-4 shadow-2xl">
          <ShieldAlert className="text-rose-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm mb-6">Managers cannot perform tasks ❌</p>
        </div>
      </div>
    )
  }

  // --- Main Task List UI ---
  return (
    <div className="flex flex-col items-center mt-10 px-4 w-full max-w-4xl mx-auto font-sans">
      
      <div className="w-full mb-10 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
          Available <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-indigo-500">Tasks</span>
        </h2>
        <p className="text-slate-400 font-light">Claim bounties below to start earning.</p>
      </div>

      <div className="w-full flex flex-col gap-6">
        {tasks.length === 0 ? (
          <div className="p-10 rounded-[2rem] bg-white/[0.02] border-2 border-white/10 backdrop-blur-xl text-center shadow-lg">
            <p className="text-slate-400 font-medium">No tasks available right now. Check back soon!</p>
          </div>
        ) : (
          tasks.map((t, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 80 }}
              key={t.id} 
              className="group p-6 md:p-8 rounded-[2rem] bg-blue-500/[0.04] border-2 border-white/20 hover:border-blue-400/40 backdrop-blur-2xl transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_30px_rgba(0,0,0,0.2)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_12px_40px_rgba(96,165,250,0.15)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              
              {/* Task Details */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <FileText size={18} className="text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 group-hover:text-white transition-colors">{t.title}</h3>
                </div>
                
                <p className="text-slate-400 text-sm leading-relaxed mb-4 md:mb-0 pl-13 md:pl-13">
                  {t.description}
                </p>
              </div>

              {/* Reward & Action */}
              <div className="flex flex-col items-end gap-4 w-full md:w-auto mt-4 md:mt-0 border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                  <Coins size={16} className="text-emerald-400" />
                  <span className="text-emerald-300 font-bold tracking-wide">₹{t.reward}</span>
                </div>

                <button 
                  onClick={() => claimTask(t.id)}
                  className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 border-2 border-emerald-400/30 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Claim Task
                </button>
              </div>

            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}