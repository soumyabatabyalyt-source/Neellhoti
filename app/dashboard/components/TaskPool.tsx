"use client"

import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type TaskRow = {
  id: string
  title?: string | null
  post_title?: string | null
  reward?: number | string | null
}

export default function TaskPool() {
  const [tasks, setTasks] = useState<TaskRow[]>([])

  const fetchTasks = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) return

    const res = await fetch("/api/tasks", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    })
    const payload = await res.json()

    setTasks(res.ok ? payload.tasks || [] : [])
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchTasks()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [fetchTasks])

  const claimTask = async (taskId: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      alert("Login required")
      return
    }

    const res = await fetch("/api/claim-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ task_id: taskId }),
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
          <h3>{task.title || task.post_title}</h3>
          <p>Reward: ${task.reward}</p>

          <button onClick={() => claimTask(task.id)}>
            Claim Task
          </button>
        </div>
      ))}
    </div>
  )
}
