"use client"

import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
  Search, User, Mail, Timer, Loader2, Save,
  ExternalLink, TrendingUp, CalendarDays, ArrowUpDown,
  MessageSquare,
} from "lucide-react"

type Tasker = {
  id: string
  username?: string | null
  email: string | null
  reddit: string | null
  discord: string | null
  role: string | null
  cooldown_minutes?: number | null
  cooldown_until?: string | null
  reddit_karma?: number | null
  reddit_account_age_days?: number | null
  created_at?: string | null
}

type SortKey = "username" | "karma" | "age" | "cooldown"

function redditUsername(raw: string): string {
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`)
    const parts = url.pathname.replace(/\/$/, "").split("/").filter(Boolean)
    const idx = parts.findIndex((p) => p === "user" || p === "u")
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1]
    return parts[parts.length - 1] || raw
  } catch {
    return raw.replace(/^\/?u\//, "")
  }
}

function redditProfileUrl(raw: string): string {
  return `https://www.reddit.com/user/${redditUsername(raw)}`
}

function formatCooldownUntil(value?: string | null): string {
  if (!value) return "None"
  const ms = new Date(value).getTime() - Date.now()
  if (ms <= 0) return "None"
  const totalMins = Math.ceil(ms / 60000)
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  return `${h}h ${m}m remaining`
}

function formatAge(days?: number | null): string {
  if (!days) return "—"
  if (days < 30) return `${days}d`
  if (days < 365) return `${Math.floor(days / 30)}mo`
  const y = Math.floor(days / 365)
  const mo = Math.floor((days % 365) / 30)
  return mo > 0 ? `${y}y ${mo}mo` : `${y}y`
}

export default function Taskers() {
  const [users, setUsers] = useState<Tasker[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("username")
  const [sortAsc, setSortAsc] = useState(true)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, email, reddit, discord, role, cooldown_minutes, cooldown_until, reddit_karma, reddit_account_age_days, created_at")
      .in("role", ["tasker", "user"])

    if (error) { console.error(error); return }
    setUsers(data || [])
  }, [])

  useEffect(() => { void load() }, [load])

  async function saveStats(
    userId: string,
    karma: number,
    ageDays: number,
    cooldownHours: number,
    cooldownMinutes: number
  ) {
    setSaving(userId)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { alert("Login required"); setSaving(null); return }

    const res = await fetch("/api/update-tasker-stats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        user_id: userId,
        reddit_karma: karma,
        reddit_account_age_days: ageDays,
        cooldown_hours: cooldownHours,
        cooldown_minutes: cooldownMinutes,
      }),
    })

    const payload = await res.json()
    setSaving(null)
    if (!res.ok) { alert(payload.error || "Save failed"); return }
    await load()
  }

  const sorted = [...users]
    .filter((u) => (u.username || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let cmp = 0
      if (sortKey === "username") cmp = (a.username || "").localeCompare(b.username || "")
      else if (sortKey === "karma") cmp = (a.reddit_karma || 0) - (b.reddit_karma || 0)
      else if (sortKey === "age") cmp = (a.reddit_account_age_days || 0) - (b.reddit_account_age_days || 0)
      else if (sortKey === "cooldown") {
        const aActive = formatCooldownUntil(a.cooldown_until) !== "None" ? 1 : 0
        const bActive = formatCooldownUntil(b.cooldown_until) !== "None" ? 1 : 0
        cmp = aActive - bActive
      }
      return sortAsc ? cmp : -cmp
    })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v)
    else { setSortKey(key); setSortAsc(key === "username") }
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full font-sans text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Taskers
            <span className="bg-white/10 text-slate-300 text-sm py-1 px-3 rounded-full font-medium border border-white/10">
              {users.length} Users
            </span>
          </h2>
          <p className="text-slate-400 mt-1 text-sm">
            Manage roles, Reddit stats, and cooldowns for each tasker.
          </p>
        </div>

        <div className="relative w-full md:max-w-xs group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-red-400 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-black/50 focus:border-red-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
          <ArrowUpDown size={13} /> Sort:
        </span>
        {(["username", "karma", "age", "cooldown"] as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => toggleSort(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize flex items-center gap-1 ${
              sortKey === key
                ? "bg-red-500/20 border-red-500/40 text-red-400"
                : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
            }`}
          >
            {key === "karma" && <TrendingUp size={12} />}
            {key === "age" && <CalendarDays size={12} />}
            {key === "cooldown" && <Timer size={12} />}
            {key === "username" && <User size={12} />}
            {key}
            {sortKey === key && (
              <span className="ml-0.5 opacity-70">{sortAsc ? "↑" : "↓"}</span>
            )}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="py-16 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-500 bg-white/[0.01]">
          <User className="mb-3 text-slate-600" size={36} />
          <p className="text-slate-300 font-medium">No taskers found</p>
          <p className="text-sm mt-1">Try a different search.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {sorted.map((user) => (
            <TaskerCard
              key={user.id}
              user={user}
              saving={saving === user.id}
              onSave={saveStats}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TaskerCard({
  user,
  saving,
  onSave,
}: {
  user: Tasker
  saving: boolean
  onSave: (userId: string, karma: number, ageDays: number, cooldownHours: number, cooldownMinutes: number) => void
}) {
  const [karma, setKarma] = useState(Number(user.reddit_karma || 0))
  const [ageDays, setAgeDays] = useState(Number(user.reddit_account_age_days || 0))
  const [hasChanges, setHasChanges] = useState(false)

  const handleKarmaChange = (value: number) => {
    setKarma(value)
    setHasChanges(true)
  }

  const handleAgeChange = (value: number) => {
    setAgeDays(value)
    setHasChanges(true)
  }

  const handleSave = () => {
    onSave(user.id, karma, ageDays, 0, 0)
    setHasChanges(false)
  }

  return (
    <div className="rounded-2xl border-2 border-white/15 bg-white/[0.03] backdrop-blur-sm shadow-lg hover:bg-white/[0.05] hover:border-white/25 transition-all duration-300 overflow-hidden animate-in fade-in zoom-in-98 duration-200">
      <div className="px-5 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <User size={17} className="text-slate-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold text-white tracking-tight truncate">
                {user.username || "Unknown"}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                user.role === "tasker"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "bg-slate-500/10 text-slate-400 border-slate-500/20"
              }`}>
                {user.role || "user"}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">{user.id}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-b border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 bg-black/20 rounded-xl px-3 py-2.5 border border-white/8 min-w-0">
          <Mail size={15} className="text-slate-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Email</p>
            <p className="text-sm text-slate-200 truncate">{user.email || "—"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/20 rounded-xl px-3 py-2.5 border border-white/8 min-w-0">
          <MessageSquare size={15} className="text-indigo-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Discord</p>
            <p className="text-sm text-slate-200 truncate">{user.discord || "—"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/20 rounded-xl px-3 py-2.5 border border-white/8 min-w-0">
          <div className="w-4 h-4 rounded-full bg-[#FF4500]/20 flex items-center justify-center shrink-0">
            <span className="text-[10px] text-[#FF4500] font-bold">R</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Reddit</p>
            {user.reddit ? (
              <a
                href={redditProfileUrl(user.reddit)}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1 w-fit max-w-full"
              >
                <span className="truncate">u/{redditUsername(user.reddit)}</span>
                <ExternalLink size={11} className="shrink-0 opacity-60" />
              </a>
            ) : (
              <span className="text-sm text-slate-500 italic">—</span>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 py-6">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold flex items-center gap-1.5 mb-4">
          <TrendingUp size={12} /> Update Reddit Stats
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-2">
              Karma
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                value={karma}
                onChange={(e) => handleKarmaChange(Number(e.target.value))}
                placeholder="Enter karma amount"
                className="flex-1 bg-black/30 border border-white/15 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all font-mono"
              />
              <span className="text-xs text-slate-400 min-w-fit">{karma.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-2">
              Account Age (days)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                value={ageDays}
                onChange={(e) => handleAgeChange(Number(e.target.value))}
                placeholder="Enter account age in days"
                className="flex-1 bg-black/30 border border-white/15 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-purple-500/50 focus:bg-black/40 transition-all font-mono"
              />
              <span className="text-xs text-slate-400 min-w-fit">{formatAge(ageDays)}</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              hasChanges
                ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "bg-white/5 text-slate-400 cursor-not-allowed"
            } disabled:opacity-50 disabled:pointer-events-none`}
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>

          <div className="flex gap-2 flex-wrap pt-2">
            <span className="text-[11px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-md font-medium flex items-center gap-1">
              <TrendingUp size={12} /> {karma.toLocaleString()} karma
            </span>
            <span className="text-[11px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1.5 rounded-md font-medium flex items-center gap-1">
              <CalendarDays size={12} /> {formatAge(ageDays)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
