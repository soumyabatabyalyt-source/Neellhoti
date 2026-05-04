"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const [dark, setDark] = useState(true)

  // persist theme
  useEffect(() => {
    const saved = localStorage.getItem("theme")
    if (saved === "light") setDark(false)
  }, [])

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light")
  }, [dark])

  const navItems = [
    { name: "Tasks", path: "/dashboard/tasks" },
    { name: "My Tasks", path: "/dashboard/my-tasks/active" },
    { name: "Wallet", path: "/dashboard/wallet" },
    { name: "Account", path: "/dashboard/account" },
  ]

  return (
    <div style={dark ? styles.darkBg : styles.lightBg}>
      
      {/* 🔥 NAVBAR */}
      <div style={navBar(dark)}>
        <div style={navContent}>
          <h2 style={{ margin: 0 }}>Nillohit</h2>

          <div style={navItemsWrap}>
            {navItems.map((item) => {
              const active = pathname === item.path

              return (
                <div
                  key={item.name}
                  onClick={() => router.push(item.path)}
                  style={navCard(active, dark)}
                >
                  {item.name}
                </div>
              )
            })}

            {/* 🌙 THEME */}
            <div onClick={() => setDark(!dark)} style={toggleCard(dark)}>
              {dark ? "🌙" : "☀️"}
            </div>
          </div>
        </div>
      </div>

      {/* 📦 CONTENT */}
      <div style={container}>{children}</div>
    </div>
  )
}

//
// 🎨 STYLES (THIS WAS MISSING / BROKEN)
//

const styles = {
  darkBg: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a0a, #151515)",
    color: "#fff",
  },
  lightBg: {
    minHeight: "100vh",
    background: "#f5f5f5",
    color: "#111",
  },
}

const navBar = (dark: boolean) => ({
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100%",
  zIndex: 1000,
  backdropFilter: "blur(14px)",
  background: dark
    ? "rgba(10,10,10,0.85)"
    : "rgba(255,255,255,0.85)",
  borderBottom: dark ? "1px solid #222" : "1px solid #ddd",
})

const navContent = {
  maxWidth: "1100px",
  margin: "auto",
  padding: "12px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}

const navItemsWrap = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
}

const navCard = (active: boolean, dark: boolean) => ({
  padding: "8px 14px",
  borderRadius: "14px",
  cursor: "pointer",
  fontSize: "14px",
  background: active
    ? dark
      ? "#fff"
      : "#111"
    : dark
    ? "#1c1c1c"
    : "#eaeaea",
  color: active
    ? dark
      ? "#000"
      : "#fff"
    : dark
    ? "#aaa"
    : "#333",
  transition: "all 0.2s ease",
})

const toggleCard = (dark: boolean) => ({
  padding: "8px 12px",
  borderRadius: "14px",
  cursor: "pointer",
  background: dark ? "#222" : "#ddd",
})

const container = {
  maxWidth: "900px",
  margin: "auto",
  padding: "100px 20px 20px", // 👈 important
}