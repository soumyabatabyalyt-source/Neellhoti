"use client"

import { supabase } from "@/lib/supabaseClient"

export default function Sidebar({ setPage }: any) {
  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div style={{
      width: "220px",
      background: "#111",
      color: "#fff",
      padding: "20px"
    }}>
      <h2>Reddit Tasks</h2>

      <button onClick={() => setPage("pool")}>Task Pool</button>
      <br /><br />

      <button onClick={() => setPage("my")}>My Tasks</button>
      <br /><br />

      <button onClick={logout}>Logout</button>
    </div>
  )
}