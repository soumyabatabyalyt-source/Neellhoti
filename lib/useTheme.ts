import { useState, useEffect } from 'react'

export function useTheme() {
  const [dark, setDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme')
    if (saved === 'light') setDark(false)
  }, [])

  const toggleTheme = () => {
    const newDark = !dark
    setDark(newDark)
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
  }

  return { dark, setDark, mounted, toggleTheme }
}

// Color utility for common theme colors
export const themeColors = {
  dark: {
    bg: '#0f0814',
    card: '#7f1d1d',
    border: '#000000',
    text: '#ffffff',
    textSecondary: '#d1d5db',
    accent: '#ef4444',
  },
  light: {
    bg: '#fafaf8',
    card: '#7f1d1d',
    border: '#000000',
    text: '#1f2937',
    textSecondary: '#6b7