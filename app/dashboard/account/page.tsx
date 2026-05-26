"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

import {
  Loader2,
  UserCircle,
  Mail,
  MessageSquare,
  LogOut,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  AlertTriangle,
} from "lucide-react"

// =========================================
// REDDIT URL HELPER
// =========================================

function buildRedditProfileUrl(value: string): string {
  // Already a full URL
  if (value.startsWith("http")) return value
  // u/username or /u/username
  const handle = value.replace(/^\/?u\//, "")
  return `https://www.reddit.com/user/${handle}`
}

function redditDisplayName(value: string): string {
  return (
    value
      .replace(/^https?:\/\/(www\.|old\.|new\.)?reddit\.com\/user\//, "u/")
      .replace(/^\/?u\//, "u/")
      .replace(/\/$/, "") || value
  )
}

// =========================================
// COMPONENT
// =========================================

export default function Account() {

  const [profile, setProfile] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [cooldownMsg, setCooldownMsg] = useState("")

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState("")
  const [deleting, setDeleting] = useState(false)

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

      // Check cooldown on load
      if (data?.cooldown_until && new Date(data.cooldown_until) > new Date()) {
        updateCooldownTimer(data.cooldown_until)
      }
    }

    load()

  }, [])

  // =========================================
  // COOLDOWN TIMER
  // =========================================

  const updateCooldownTimer = (cooldownUntil: string) => {

    const now = new Date()
    const end = new Date(cooldownUntil)
    const remainingMs = end.getTime() - now.getTime()

    if (remainingMs <= 0) {

      setCooldownMsg("")
      return
    }

    const totalSeconds = Math.ceil(remainingMs / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    setCooldownMsg(
      `Cooldown active: ${hours}h ${minutes}m ${seconds}s remaining`
    )
  }

  useEffect(() => {

    if (!profile?.cooldown_until) return

    updateCooldownTimer(profile.cooldown_until)
    const interval = setInterval(() => updateCooldownTimer(profile.cooldown_until), 1000)

    return () => clearInterval(interval)

  }, [profile?.cooldown_until])

  // =========================================
  // COPY EMAIL
  // =========================================

  async function copyEmail() {
    if (!profile?.email) return
    await navigator.clipboard.writeText(profile.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // =========================================
  // DELETE ACCOUNT
  // =========================================

  async function deleteAccount() {
    setDeleting(true)

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    if (!token) {
      alert("Session expired. Please log in again.")
      setDeleting(false)
      return
    }

    const res = await fetch("/api/delete-account", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })

    const payload = await res.json()

    if (!res.ok) {
      alert(payload.error || "Failed to delete account.")
      setDeleting(false)
      return
    }

    await supabase.auth.signOut()
    location.href = "/login"
  }

  // =========================================
  // LOADING
  // =========================================

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 font-sans text-slate-200">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
          <Loader2 className="animate-spin text-blue-400" size={28} />
        </div>
        <p className="text-slate-400 font-light tracking-wide animate-pulse">
          Loading profile...
        </p>
      </div>
    )
  }

  const redditUrl = profile.reddit ? buildRedditProfileUrl(profile.reddit) : null
  const redditLabel = profile.reddit ? redditDisplayName(profile.reddit) : "Not connected"

  return (
    <div className="w-full max-w-4xl mx-auto font-sans text-slate-200">

      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight text-white">
          Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            Account
          </span>
        </h1>
        <p className="text-slate-400 mt-3 text-sm leading-relaxed">
          Manage your profile details, linked accounts, and session access.
        </p>
      </div>

      {/* COOLDOWN ALERT */}
      {cooldownMsg && (
        <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-amber-300">
          {cooldownMsg}
        </div>
      )}

      {/* PROFILE CARD */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-600 relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.35)]">

        {/* GLOW */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 p-6 md:p-10">

          {/* TOP SECTION */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-8 border-b border-white/10">

            {/* AVATAR */}
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center shadow-xl shadow-blue-500/10">
                <UserCircle size={52} className="text-blue-400" />
              </div>
              {/* ONLINE DOT */}
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-400 border-4 border-[#0B1120] shadow-[0_0_15px_rgba(74,222,128,0.7)]" />
            </div>

            {/* INFO */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Profile Details
                </h2>
                {profile.role && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck size={14} />
                    {profile.role}
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
                Your account credentials and connected platform details.
              </p>
            </div>

          </div>

          {/* INFO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">

            {/* EMAIL */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 hover:bg-black/30 transition-all duration-300">
              <div className="absolute inset-y-0 left-0 w-1 bg-blue-500/60" />
              <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Mail size={24} className="text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Email Address
                    </p>
                    <p className="text-slate-100 font-medium truncate">
                      {profile.email}
                    </p>
                  </div>
                </div>
                {/* COPY */}
                <button
                  onClick={copyEmail}
                  className="shrink-0 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  {copied ? (
                    <Check size={18} className="text-emerald-400" />
                  ) : (
                    <Copy size={18} className="text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* REDDIT */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 hover:bg-black/30 transition-all duration-300">
              <div className="absolute inset-y-0 left-0 w-1 bg-orange-500/70" />
              <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                    <MessageSquare size={24} className="text-orange-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Reddit Account
                    </p>
                    <p className="text-slate-100 font-medium truncate">
                      {redditLabel}
                    </p>
                  </div>
                </div>
                {/* OPEN LINK */}
                {redditUrl && (
                  <a
                    href={redditUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 p-3 rounded-xl bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/30 transition-all"
                    title="Open Reddit profile"
                  >
                    <ExternalLink size={18} className="text-slate-400 group-hover:text-orange-400 transition-colors" />
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* LOGOUT */}
          <div className="pt-8 mt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-white font-semibold">Active Session</h3>
              <p className="text-slate-400 text-sm mt-1">Logout securely from your account.</p>
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                location.href = "/login"
              }}
              className="px-8 py-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(244,63,94,0.18)]"
            >
              <LogOut size={18} />
              Logout Safely
            </button>
          </div>

        </div>
      </div>

      {/* DANGER ZONE */}
      <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative overflow-hidden rounded-[2rem] border border-rose-500/20 bg-rose-500/[0.03] backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
        <div className="p-6 md:p-10">

          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle size={20} className="text-rose-400" />
            <h3 className="text-white font-bold text-lg">Danger Zone</h3>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold transition-all duration-300 flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete My Account
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                Type <span className="font-mono font-bold text-rose-400">DELETE</span> to confirm:
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="Type DELETE"
                className="w-full max-w-xs bg-black/30 border border-rose-500/30 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 outline-none focus:border-rose-500/60 transition-all font-mono"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={deleteAccount}
                  disabled={deleteInput !== "DELETE" || deleting}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
                >
                  {deleting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput("") }}
                  className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  )
}
