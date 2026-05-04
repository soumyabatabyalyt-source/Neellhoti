"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Admin() {
  const [tasks, setTasks] = useState<any[]>([])

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("status", "submitted")

    if (error) {
      console.error(error)
      return
    }

    setTasks(data || [])
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleAction = async (
    task_id: string,
    action: "approved" | "rejected"
  ) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        alert("Not logged in ❌")
        return
      }

      const res = await fetch("/api/review-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          task_id,
          action,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Action failed ❌")
        return
      }

      alert(`Task ${action} successfully ✅`)

      fetchTasks()
    } catch (err) {
      console.error(err)
      alert("Request failed ❌")
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Panel</h1>

      {tasks.length === 0 && <p>No submissions</p>}

      {tasks.map((task) => (
        <div
          key={task.id}
          style={{
            border: "1px solid gray",
            marginBottom: "10px",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <p><b>Task ID:</b> {task.task_id}</p>
          <h3>{task.post_title}</h3>

          <p>
            <b>Submission:</b>{" "}
            <a href={task.submission_link} target="_blank">
              View
            </a>
          </p>

          <button onClick={() => handleAction(task.task_id, "approved")}>
            Approve
          </button>

          <button
            onClick={() => handleAction(task.task_id, "rejected")}
            style={{ marginLeft: "10px" }}
          >
            Reject
          </button>
        </div>
      ))}
    </div>
  )
}