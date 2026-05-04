"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { motion } from "framer-motion"
import { Loader2, Send, Link as LinkIcon, FileText, Coins } from "lucide-react"

export default function ActiveTasks() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = async () => {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("task_claims")
      .select("*, tasks(*)")
      .eq("user_id", user.id)
      .eq("status", "claimed")

    console.log("ACTIVE TASKS:", data)

    if (!error) setTasks(data || [])

    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // --- Premium Loading UI ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 font-sans text-slate-200">
        <Loader2 className="animate-spin text-blue-400 mb-4" size={32} />
        <p className="text-slate-400 font-light tracking-wide animate-pulse">Loading active tasks...</p>
      </div>
    )
  }

  return (
    <div className="w-full font-sans text-slate-200">
      
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
          Active <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-indigo-500">Tasks</span>
        </h1>
        <p className="text-slate-400 font-light">Complete your claimed bounties and submit your proof below.</p>
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="p-10 rounded-[2rem] bg-white/[0.02] border-2 border-white/10 backdrop-blur-xl text-center shadow-lg">
          <p className="text-slate-400 font-medium">No active tasks found. Go claim some bounties!</p>
        </div>
      )}

      {/* Task List */}
      <div className="grid grid-cols-1 gap-6">
        {tasks.map((claim, index) => (
          <TaskCard key={claim.id} claim={claim} refresh={fetchTasks} index={index} />
        ))}
      </div>
    </div>
  )
}

function TaskCard({ claim, refresh, index }: any) {
  const [link, setLink] = useState("")
  const [loading, setLoading] = useState(false)

  const task = claim.tasks

  const submit = async () => {
    if (!link) {
      alert("Paste your link")
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from("task_claims")
      .update({
        submission_link: link,
        status: "submitted",
      })
      .eq("id", claim.id)

    setLoading(false)

    if (error) {
      console.error(error)
      alert("Submission failed ❌")
      return
    }

    alert("Submitted ✅")
    setLink("")
    refresh()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 80 }}
      className="group p-6 md:p-8 rounded-[2rem] bg-blue-500/[0.04] border-2 border-white/20 hover:border-blue-400/40 backdrop-blur-2xl transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_30px_rgba(0,0,0,0.2)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_12px_40px_rgba(96,165,250,0.15)] flex flex-col md:flex-row justify-between items-start gap-6"
    >
      {/* Task Information */}
      <div className="flex-1 w-full">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <FileText size={18} className="text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-100 group-hover:text-white transition-colors">{task?.title}</h3>
        </div>
        
        <p className="text-slate-400 text-sm leading-relaxed mb-5 md:pl-13">
          {task?.description}
        </p>
        
        <div className="flex items-center flex-wrap gap-3 md:pl-13">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
            <Coins size={14} className="text-emerald-400" />
            <span className="text-emerald-300 font-bold text-sm tracking-wide">₹{task?.reward}</span>
          </div>
          <StatusBadge status={claim.status} />
        </div>
      </div>

      {/* Submission Actions */}
      <div className="w-full md:w-[350px] flex flex-col gap-3 pt-5 md:pt-0 border-t md:border-t-0 border-white/10 md:pl-6 md:border-l">
        <div className="relative group/input">
          <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Paste Reddit link..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full bg-black/20 border-2 border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-400/50 focus:bg-black/40 transition-all duration-300"
          />
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2 border-2 border-blue-400/30"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          {loading ? "Submitting..." : "Submit Task"}
        </button>
      </div>
    </motion.div>
  )
}

function StatusBadge({ status }: { status: string }) {
  // Map statuses to our premium Tailwind color classes
  const themes: Record<string, string> = {
    claimed: "bg-orange-500/10 border-orange-500/30 text-orange-400",
    submitted: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    approved: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    rejected: "bg-rose-500/10 border-rose-500/30 text-rose-400",
  }

  const activeTheme = themes[status] || "bg-slate-500/10 border-slate-500/30 text-slate-400"

  return (
    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 uppercase tracking-wider ${activeTheme}`}>
      {status}
    </span>
  )
}