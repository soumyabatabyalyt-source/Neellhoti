// app/admin/staff/page.tsx

"use client"

export const dynamic = "force-dynamic"

import { useEffect, useMemo, useState } from "react"
import {
  Shield,
  UserPlus,
  Search,
  Crown,
  Trash2,
  RefreshCw,
} from "lucide-react"

import { supabase } from "@/lib/supabaseClient"

type StaffUser = {
  id: string
  email: string
  role: string
  created_at: string
}

export default function AdminStaffPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [users, setUsers] = useState<StaffUser[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setUsers(data)
    }

    setLoading(false)
  }

  async function refreshUsers() {
    setRefreshing(true)
    await fetchUsers()
    setRefreshing(false)
  }

  async function promoteToManager(userId: string) {
    const confirmed = confirm(
      "Promote this user to manager?"
    )

    if (!confirmed) return

    const { error } = await supabase
      .from("profiles")
      .update({
        role: "manager",
      })
      .eq("id", userId)

    if (error) {
      alert(error.message)
      return
    }

    await fetchUsers()
  }

  async function promoteToAdmin(userId: string) {
    const confirmed = confirm(
      "Promote this user to admin?"
    )

    if (!confirmed) return

    const { error } = await supabase
      .from("profiles")
      .update({
        role: "admin",
      })
      .eq("id", userId)

    if (error) {
      alert(error.message)
      return
    }

    await fetchUsers()
  }

  async function removeStaff(userId: string) {
    const confirmed = confirm(
      "Remove staff privileges from this user?"
    )

    if (!confirmed) return

    const { error } = await supabase
      .from("profiles")
      .update({
        role: "user",
      })
      .eq("id", userId)

    if (error) {
      alert(error.message)
      return
    }

    await fetchUsers()
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      return (
        user.email
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        user.role
          ?.toLowerCase()
          .includes(search.toLowerCase())
      )
    })
  }, [users, search])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center">
        <div className="animate-pulse text-lg">
          Loading staff panel...
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
              Staff Management
            </h1>

            <p className="text-zinc-400 mt-1">
              Manage admins and managers.
            </p>
          </div>

          <button
            onClick={refreshUsers}
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

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold">
                Platform Users
              </h2>

              <p className="text-sm text-zinc-400">
                Promote or demote platform staff.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search users..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-2 outline-none focus:border-white"
              />
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="text-left py-4">
                    Email
                  </th>

                  <th className="text-left py-4">
                    Role
                  </th>

                  <th className="text-left py-4">
                    Joined
                  </th>

                  <th className="text-right py-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-zinc-800 hover:bg-zinc-800/40 transition"
                  >
                    <td className="py-5">
                      {user.email}
                    </td>

                    <td className="py-5">
                      <div className="flex items-center gap-2">
                        {user.role === "admin" && (
                          <Crown className="w-4 h-4 text-yellow-400" />
                        )}

                        {user.role === "manager" && (
                          <Shield className="w-4 h-4 text-blue-400" />
                        )}

                        <span className="capitalize">
                          {user.role}
                        </span>
                      </div>
                    </td>

                    <td className="py-5 text-zinc-400">
                      {new Date(
                        user.created_at
                      ).toLocaleDateString()}
                    </td>

                    <td className="py-5">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {user.role !== "manager" &&
                          user.role !== "admin" && (
                            <button
                              onClick={() =>
                                promoteToManager(user.id)
                              }
                              className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition"
                            >
                              <UserPlus className="w-3 h-3" />
                              Manager
                            </button>
                          )}

                        {user.role !== "admin" && (
                          <button
                            onClick={() =>
                              promoteToAdmin(user.id)
                            }
                            className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition"
                          >
                            <Crown className="w-3 h-3" />
                            Admin
                          </button>
                        )}

                        {user.role !== "user" && (
                          <button
                            onClick={() =>
                              removeStaff(user.id)
                            }
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3 h-3" />
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-10 text-zinc-500">
                No users found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
