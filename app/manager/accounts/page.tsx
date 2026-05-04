"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Accounts() {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("approved", false)

    if (error) {
      console.error(error)
      return
    }

    setUsers(data || [])
  }

  const approveUser = async (id: string) => {
    await supabase
      .from("profiles")
      .update({ approved: true })
      .eq("id", id)

    alert("User approved ✅")
    load()
  }

  return (
    <div style={center}>
      <h2 style={{ marginBottom: "20px" }}>Pending Accounts</h2>

      {users.length === 0 ? (
        <p>No pending users</p>
      ) : (
        users.map((u) => (
          <div key={u.id} style={card}>
            <p><b>Email:</b> {u.email}</p>
            <p><b>Reddit:</b> {u.reddit || "N/A"}</p>

            <button style={btn} onClick={() => approveUser(u.id)}>
              Approve
            </button>
          </div>
        ))
      )}
    </div>
  )
}

//
// 🎨 STYLES (FIX)
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

const btn = {
  marginTop: "10px",
  padding: "8px 12px",
  borderRadius: "8px",
  border: "none",
  background: "#00c853",
  color: "#fff",
  cursor: "pointer",
}