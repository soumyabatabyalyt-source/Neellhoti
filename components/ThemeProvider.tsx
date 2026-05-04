"use client"

import { createContext, useContext, useState } from "react"

const ThemeContext = createContext<any>(null)

export function ThemeProvider({ children }: any) {
  const [dark, setDark] = useState(true)

  const toggleTheme = () => setDark(!dark)

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      <div
        style={{
          background: dark ? "#0f172a" : "#f1f5f9",
          color: dark ? "#fff" : "#000",
          minHeight: "100vh",
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)