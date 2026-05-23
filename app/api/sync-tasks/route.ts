import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const res = await fetch(process.env.GOOGLE_SHEET_URL!)
    const tasks = await res.json()

    // 🔥 STEP 1: get existing tasks
    const { data: existingTasks } = await supabase
      .from("tasks")
      .select("task_id")

    const existingIds = new Set(existingTasks?.map(t => t.task_id))

    // 🔥 STEP 2: filter only NEW tasks
    const newTasks = tasks
      .filter((t: any) => !existingIds.has(t.task_id))
      .map((task: any) => ({
        task_id: task.task_id,
        task_type: task.task_type,
        post_title: task.post_title,
        post_body: task.post_body,
        comment_text: task.comment_text,
        reward: task.reward,
        status: "available",
        claimed_by: null,
      }))

    // 🔥 STEP 3: insert only new ones
    if (newTasks.length > 0) {
      const { error } = await supabase.from("tasks").insert(newTasks)
      if (error) throw error
    }

    return NextResponse.json({
      success: true,
      inserted: newTasks.length,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message })
  }
}