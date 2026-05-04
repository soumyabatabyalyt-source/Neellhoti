"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Tasks() {
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [reward, setReward] = useState("")

  const createTask = async () => {
    if (!title || !desc || !reward) {
      alert("Fill all fields")
      return
    }

    await supabase.from("tasks").insert({
      title,
      description: desc,
      reward: Number(reward),
      status: "open",
    })

    alert("Task created ✅")

    // reset fields
    setTitle("")
    setDesc("")
    setReward("")
  }

  return (
    <div style={center}>
      <div style={card}>
        <h2>Create Task</h2>

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={input}
        />

        <input
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          style={input}
        />

        <input
          placeholder="Reward"
          value={reward}
          onChange={(e) => setReward(e.target.value)}
          style={input}
        />

        <button onClick={createTask} style={btn}>
          Create Task
        </button>
      </div>
    </div>
  )
}

//
// 🎨 STYLES (FIX INCLUDED)
//

const center = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  marginTop: "40px",
}

const card = {
  width: "100%",
  maxWidth: "500px",
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(12px)",
  padding: "20px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
}

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "none",
}

const btn = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  background: "#00c853",
  color: "#fff",
  cursor: "pointer",
}