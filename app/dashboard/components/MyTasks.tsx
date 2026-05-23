"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function MyTasks({ user }: any) {
  const [tasks, setTasks] = useState<any[]>([])

  const fetchTasks = async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("claimed_by", user.id)

    setTasks(data || [])
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const submitTask = async (task_id: string) => {
    const link = prompt("Paste Reddit link")
    if (!link) return

    const {
      data: { session },
    } = await supabase.auth.getSession()

    await fetch("/api/submit-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        task_id,
        submission_link: link,
      }),
    })

    fetchTasks()
  }

  const active = tasks.filter(t => t.status === "claimed")
  const pending = tasks.filter(t => t.status === "submitted")
  const approved = tasks.filter(t => t.status === "approved")
  const failed = tasks.filter(t => t.status === "rejected")

  return (
    <div>
      <Section title="Active Tasks" tasks={active} submitTask={submitTask} />
      <Section title="Pending" tasks={pending} />
      <Section title="Approved" tasks={approved} />
      <Section title="Failed" tasks={failed} />
    </div>
  )
}

function Section({ title, tasks, submitTask }: any) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h3>{title}</h3>

      {tasks.map((task: any) => (
        <div key={task.id} style={{ border: "1px solid gray", padding: "10px" }}>
          <p>{task.task_id}</p>
          <p>{task.post_title}</p>

          {submitTask && task.status === "claimed" && (
            <button onClick={() => submitTask(task.task_id)}>
              Submit
            </button>
          )}

          {task.submission_link && (
            <a href={task.submission_link} target="_blank">
              View
            </a>
          )}
        </div>
      ))}
    </div>
  )
}