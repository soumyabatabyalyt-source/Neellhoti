// app/admin/settings/page.tsx

"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import {
  Save,
  Settings,
  Shield,
  Wallet,
  Clock3,
  AlertTriangle,
} from "lucide-react"

import { supabase } from "@/lib/supabaseClient"

type PlatformSettings = {
  task_claim_limit: number
  claim_timeout_minutes: number
  submission_cooldown_minutes: number
  minimum_withdrawal_amount: number
  maintenance_mode: boolean
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [settings, setSettings] =
    useState<PlatformSettings>({
      task_claim_limit: 1,
      claim_timeout_minutes: 30,
      submission_cooldown_minutes: 15,
      minimum_withdrawal_amount: 100,
      maintenance_mode: false,
    })

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    setLoading(true)

    const { data, error } = await supabase
      .from("platform_settings")
      .select("*")
      .single()

    if (!error && data) {
      setSettings(data)
    }

    setLoading(false)
  }

  async function saveSettings() {
    setSaving(true)

    const { error } = await supabase
      .from("platform_settings")
      .upsert({
        id: 1,
        ...settings,
      })

    if (error) {
      alert(error.message)
      setSaving(false)
      return
    }

    alert("Settings saved successfully.")
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center">
        <div className="animate-pulse text-lg">
          Loading settings...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Platform Settings
          </h1>

          <p className="text-zinc-400 mt-1">
            Configure global platform behaviour.
          </p>
        </div>

        <div className="space-y-6">
          {/* Task Settings */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>

              <div>
                <h2 className="text-2xl font-semibold">
                  Task Settings
                </h2>

                <p className="text-zinc-400 text-sm">
                  Configure task claiming behaviour.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-zinc-400 block mb-2">
                  Max Claimed Tasks Per User
                </label>

                <input
                  type="number"
                  value={settings.task_claim_limit}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      task_claim_limit: Number(e.target.value),
                    })
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400 block mb-2">
                  Claim Timeout (Minutes)
                </label>

                <input
                  type="number"
                  value={settings.claim_timeout_minutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      claim_timeout_minutes: Number(
                        e.target.value
                      ),
                    })
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400 block mb-2">
                  Submission Cooldown (Minutes)
                </label>

                <input
                  type="number"
                  value={
                    settings.submission_cooldown_minutes
                  }
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      submission_cooldown_minutes: Number(
                        e.target.value
                      ),
                    })
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-white"
                />
              </div>
            </div>
          </div>

          {/* Withdrawal Settings */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>

              <div>
                <h2 className="text-2xl font-semibold">
                  Withdrawal Settings
                </h2>

                <p className="text-zinc-400 text-sm">
                  Configure payout rules.
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-400 block mb-2">
                Minimum Withdrawal Amount
              </label>

              <input
                type="number"
                value={
                  settings.minimum_withdrawal_amount
                }
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minimum_withdrawal_amount: Number(
                      e.target.value
                    ),
                  })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-white"
              />
            </div>
          </div>

          {/* Security & Maintenance */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>

              <div>
                <h2 className="text-2xl font-semibold">
                  Security & Maintenance
                </h2>

                <p className="text-zinc-400 text-sm">
                  Platform-wide control settings.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-zinc-800 border border-zinc-700 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />

                <div>
                  <p className="font-medium">
                    Maintenance Mode
                  </p>

                  <p className="text-sm text-zinc-400">
                    Temporarily disable user access.
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    maintenance_mode:
                      !settings.maintenance_mode,
                  })
                }
                className={`w-16 h-9 rounded-full transition relative ${
                  settings.maintenance_mode
                    ? "bg-green-500"
                    : "bg-zinc-700"
                }`}
              >
                <div
                  className={`absolute top-1 w-7 h-7 bg-white rounded-full transition ${
                    settings.maintenance_mode
                      ? "left-8"
                      : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="bg-white text-black px-6 py-3 rounded-2xl flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />

              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
