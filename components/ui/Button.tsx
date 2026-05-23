"use client"

import React from "react"

type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "success" | "warning"
}

export default function Button({
  children,
  onClick,
  variant = "primary",
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
    transition: "all 0.2s ease",
  }

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: "#3b82f6",
      color: "#fff",
    },
    success: {
      background: "#22c55e",
      color: "#000",
    },
    warning: {
      background: "#facc15",
      color: "#000",
    },
  }

  return (
    <button
      onClick={onClick}
      style={{
        ...baseStyle,
        ...variants[variant],
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.85"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1"
      }}
    >
      {children}
    </button>
  )
}