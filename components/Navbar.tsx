"use client"

import { useState } from "react"
import { useTheme } from "@/components/ThemeProvider"

type Props = {
  page: string
  setPage: (page: string) => void
}

export default function Navbar({ page, setPage }: Props) {
  const { dark, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)

  // ✅ UPDATED NAV ITEMS (Tasks + My Tasks separated)
  const navItems = [
    { key: "pool", label: "Tasks" },
    { key: "my", label: "My Tasks" },
    { key: "wallet", label: "Wallet" },
    { key: "account", label: "Account" },
  ]

  const bg = dark ? "#0f172a" : "#ffffff"
  const border = "#334155"

  const activeStyle: React.CSSProperties = {
    background: dark ? "#1e293b" : "#e2e8f0",
    padding: "6px 12px",
    borderRadius: "6px",
  }

  return (
    <div
      style={{
        background: bg,
        borderBottom: `1px solid ${border}`,
        padding: "12px 20px",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* LOGO */}
        <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>
          Nillohit
        </h2>

        {/* DESKTOP NAV */}
        <div
          className="desktop-menu"
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
          }}
        >
          {navItems.map((item) => (
            <span
              key={item.key}
              onClick={() => setPage(item.key)}
              style={{
                cursor: "pointer",
                ...(page === item.key ? activeStyle : {}),
              }}
            >
              {item.label}
            </span>
          ))}

          {/* 🎯 SMART TOGGLE */}
          <div
            onClick={toggleTheme}
            style={{
              width: "42px",
              height: "22px",
              borderRadius: "20px",
              background: dark ? "#334155" : "#cbd5f5",
              display: "flex",
              alignItems: "center",
              padding: "3px",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "#fff",
                transform: dark ? "translateX(18px)" : "translateX(0px)",
                transition: "all 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* MOBILE MENU BUTTON */}
        <div
          className="mobile-menu"
          style={{
            display: "none",
            cursor: "pointer",
            fontSize: "20px",
          }}
          onClick={() => setOpen(!open)}
        >
          ☰
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {open && (
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {navItems.map((item) => (
            <div
              key={item.key}
              onClick={() => {
                setPage(item.key)
                setOpen(false)
              }}
              style={{
                padding: "8px",
                borderRadius: "6px",
                cursor: "pointer",
                ...(page === item.key ? activeStyle : {}),
              }}
            >
              {item.label}
            </div>
          ))}

          <div onClick={toggleTheme} style={{ cursor: "pointer" }}>
            Toggle Theme
          </div>
        </div>
      )}

      {/* RESPONSIVE CSS */}
      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}