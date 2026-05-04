"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function TaskPool({ user }: any) {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")

  // 🔄 Fetch unclaimed tasks
  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .is("claimed_by", null)

      if (error) {
        console.error(error)
        setErrorMsg("Failed to load tasks")
      } else {
        setTasks(data || [])
      }

      setLoading(false)
    }

    fetchTasks()
  }, [])

  // ✅ CLAIM FUNCTION (UPDATED)
  const handleClaim = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          claimed_by: user.id,
          claimed_at: new Date().toISOString(), // timer start
          status: "active",
        })
        .eq("id", taskId)
        .is("claimed_by", null) // prevent double claim

      if (error) {
        console.error(error)
        alert("Failed to claim")
        return
      }

      // remove from UI
      setTasks((prev) => prev.filter((t) => t.id !== taskId))

      alert("Task claimed!")
    } catch (err) {
      console.error(err)
      alert("Something went wrong")
    }
  }

  if (loading) return <p>Loading...</p>
  if (errorMsg) return <p style={{ color: "red" }}>{errorMsg}</p>

  return (
    <div>
      <h2>Task Pool</h2>

      <p style={{ fontSize: "12px", opacity: 0.6 }}>
        Available: {tasks.length}
      </p>

      {tasks.length === 0 && <p>No tasks available</p>}

      {/* ✅ THIS IS WHERE handleClaim IS USED */}
      {tasks.map((task) => (
        <div
          key={task.id}
          style={{
            border: "1px solid #334155",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "8px",
          }}
        >
          <h3>{task.title}</h3>
          <p>{task.description}</p>

          <p><b>Platform:</b> {task.platform}</p>
          <p><b>Reward:</b> ₹{task.reward}</p>

          {/* 🔥 THIS LINE CALLS THE FUNCTION */}
          <button
            onClick={() => handleClaim(task.id)}
            style={{
              marginTop: "10px",
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            Claim Task
          </button>
        </div>
      ))}
    </div>
  )
}