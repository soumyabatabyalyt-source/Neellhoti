"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function TaskPool({ user }: any) {
  const [tasks, setTasks] = useState<any[]>([])

  const fetchTasks = async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("status", "available")

    setTasks(data || [])
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const claimTask = async (task_id: string) => {
    const res = await fetch("/api/claim-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task_id,
        user_id: user.id,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error)
      return
    }

    alert("Task claimed ✅")
    fetchTasks()
  }

  return (
    <div>
      <h2>Task Pool</h2>

      {tasks.map((task) => (
        <div
          key={task.id}
          style={{
            border: "1px solid #ccc",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "10px"
          }}
        >
          <h3>{task.post_title}</h3>
          <p>Reward: ${task.reward}</p>

          <button onClick={() => claimTask(task.task_id)}>
            Claim Task
          </button>
        </div>
      ))}
    </div>
  )
}