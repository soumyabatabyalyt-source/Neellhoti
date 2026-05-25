// app/admin/layout.tsx

"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Wallet,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
} from "lucide-react"

import { supabase } from "@/lib/supabaseClient"

const navItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Tasks",
    href: "/admin/tasks",
    icon: ClipboardList,
  },
  {
    name: "Withdrawals",
    href: "/admin/withdrawals",
    icon: Wallet,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const role = profile?.role?.trim()?.toLowerCase()

    if (error || role !== "admin") {
      router.push("/dashboard")
      return
    }

    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0814] text-white flex items-center justify-center">
        <div className="animate-pulse text-lg">
          Loading admin panel...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0814] text-white flex">
      <aside className="w-72 bg-[#111111] border-r border-red-500/30 hidden md:flex flex-col">
        <div className="p-6 border-b border-red-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Neellohit</h1>
              <p className="text-zinc-400 text-sm">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                  active
                    ? "bg-red-500 text-white"
                    : "hover:bg-red-500/10 text-gray-300 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-red-500/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-2xl transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#111111] border-b border-red-500/30 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <span className="font-semibold">Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-red-500/20 rounded-lg transition"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div
          className="md:hidden fixed inset-0 top-16 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute left-0 top-16 bottom-0 w-64 bg-[#111111] border-r border-red-500/30 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                      active
                        ? "bg-red-500 text-white"
                        : "hover:bg-red-500/10 text-gray-300 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-red-500/20">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-2xl transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <main className="flex-1 overflow-auto md:ml-0 mt-16 md:mt-0">
        {children}
      </main>
    </div>
  )
}
