"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function MyTasks() {
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) return

    const { data, error } = await supabase
      .from("task_claims")
      .select("*, tasks(*)")
      .eq("user_id", user.id)

    if (error) {
      console.error(error)
      return
    }

    setTasks(data || [])
  }

  // 🔥 GROUPING
  const active = tasks.filter((t) => t.status === "claimed")
  const submitted = tasks.filter((t) => t.status === "submitted")
  const approved = tasks.filter((t) => t.status === "approved")
  const rejected = tasks.filter((t) => t.status === "rejected")

  return (
    <div style={container}>
      <h1>My Tasks</h1>

      <Section title="🟢 Active" tasks={active} />
      <Section title="🟡 Submitted" tasks={submitted} />
      <Section title="✅ Approved" tasks={approved} />
      <Section title="❌ Rejected" tasks={rejected} />
    </div>
  )
}

function Section({ title, tasks }: any) {
  return (
    <div style={{ marginBottom: "30px" }}>
      <h2>{title}</h2>

      {tasks.length === 0 ? (
        <p>No tasks</p>
      ) : (
        tasks.map((t: any) => (
          <div key={t.id} style={card}>
            <h3>{t.tasks?.title}</h3>
            <p>Status: {t.status}</p>

            {t.submission_link && (
              <a href={t.submission_link} target="_blank">
                View Submission
              </a>
            )}
          </div>
        ))
      )}
    </div>
  )
}

const container = {
  maxWidth: "800px",
  margin: "auto",
  padding: "20px",
}

const card = {
  border: "1px solid #ccc",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
}