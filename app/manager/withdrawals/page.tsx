"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Withdrawals() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data, error } = await supabase
      .from("withdrawals")
      .select("*")

    if (error) {
      console.error(error)
      return
    }

    setData(data || [])
  }

  const approve = async (w: any) => {
    // 🔥 deduct wallet
    await supabase.rpc("deduct_wallet_balance", {
      w_id: w.id,
    })

    // update status
    await supabase
      .from("withdrawals")
      .update({ status: "approved" })
      .eq("id", w.id)

    alert("Approved ✅")
    load()
  }

  const reject = async (id: string) => {
    await supabase
      .from("withdrawals")
      .update({ status: "rejected" })
      .eq("id", id)

    alert("Rejected ❌")
    load()
  }

  return (
    <div style={center}>
      <h2 style={{ marginBottom: "20px" }}>Withdrawals</h2>

      {data.length === 0 ? (
        <p>No withdrawals</p>
      ) : (
        data.map((w) => (
          <div key={w.id} style={card}>
            <p><b>Amount:</b> ₹{w.amount}</p>
            <p><b>Status:</b> {w.status}</p>
            <p><b>Method:</b> {w.method}</p>
            <p><b>Details:</b> {w.details}</p>

            <div style={btnRow}>
              <button style={approveBtn} onClick={() => approve(w)}>
                Approve
              </button>
              <button style={rejectBtn} onClick={() => reject(w.id)}>
                Reject
              </button>
            </div>
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

const btnRow = {
  display: "flex",
  gap: "10px",
  marginTop: "10px",
}

const approveBtn = {
  padding: "6px 12px",
  background: "#00c853",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  color: "#fff",
}

const rejectBtn = {
  padding: "6px 12px",
  background: "#ff1744",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  color: "#fff",
}