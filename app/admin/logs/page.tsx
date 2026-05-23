// app/admin/logs/page.tsx

"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import {
  Activity,
  RefreshCw,
  Shield,
  Clock3,
} from "lucide-react"

import { supabase } from "@/lib/supabaseClient"

type Log = {
  id: string
  action: string
  created_at: string
  admin_id: string
  details: string | null
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    setLoading(true)

    const { data, error } = await supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setLogs(data)
    }

    setLoading(false)
  }

  async function refreshLogs() {
    setRefreshing(true)
    await fetchLogs()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center">
        <div className="animate-pulse text-lg">
          Loading logs...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold">
              Admin Logs
            </h1>

            <p className="text-zinc-400 mt-1">
              Track all admin activity across the platform.
            </p>
          </div>

          <button
            onClick={refreshLogs}
            className="bg-white text-black px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-10 text-center text-zinc-500">
              No logs found.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-5 hover:bg-zinc-800/40 transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white">
                            {log.action}
                          </span>

                          <div className="flex items-center gap-1 text-xs text-zinc-400">
                            <Shield className="w-3 h-3" />
                            {log.admin_id}
                          </div>
                        </div>

                        {log.details && (
                          <p className="text-sm text-zinc-400 mt-2">
                            {log.details}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Clock3 className="w-4 h-4" />
                      {new Date(
                        log.created_at
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
