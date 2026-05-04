"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Taskers() {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "user") // 🔥 hide managers

    if (error) {
      console.error(error)
      return
    }

    setUsers(data || [])
  }

  return (
    <div style={center}>
      <h2 style={{ marginBottom: "20px" }}>Taskers</h2>

      {users.length === 0 ? (
        <p>No taskers found</p>
      ) : (
        users.map((u) => (
          <div key={u.id} style={card}>
            <p><b>Email:</b> {u.email}</p>
            <p><b>Reddit:</b> {u.reddit || "N/A"}</p>
            <p><b>Role:</b> {u.role}</p>
          </div>
        ))
      )}
    </div>
  )
}

//
// 🎨 STYLES (FIXES ERROR)
//

const center = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  marginTop: "40px",
}

const card = {
  width: "100%",
  maxWidth: "600px",
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(12px)",
  padding: "15px",
  borderRadius: "12px",
  marginBottom: "10px",
  border: "1px solid rgba(255,255,255,0.1)",
}