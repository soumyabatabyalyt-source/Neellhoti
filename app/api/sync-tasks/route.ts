import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const res = await fetch(process.env.GOOGLE_SCRIPT_URL!)
    console.log("Google Script response status:", res.status)

    const text = await res.text()
    console.log("Google Script raw response:", text)

    let tasks
    try {
      tasks = JSON.parse(text)
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr)
      throw new Error(`Invalid JSON from Google Apps Script: ${text.substring(0, 100)}`)
    }

    // 🔥 STEP 1: get existing tasks
    const { data: existingTasks } = await supabase
      .from("tasks")
      .select("task_code")

    const existingIds = new Set(existingTasks?.map(t => t.task_code))

    // 🔥 STEP 2: filter only NEW tasks
    if (!Array.isArray(tasks)) {
      throw new Error(`Expected array from Google Apps Script, got: ${typeof tasks}`)
    }

    const newTasks = tasks
      .filter((t: any) => !existingIds.has(t.task_id))
      .map((task: any) => {
        // Normalize task_type to lowercase
        const normalizedTaskType = (task.task_type || "").toString().toLowerCase().trim()

        // Validate task_type
        if (!["post", "comment"].includes(normalizedTaskType)) {
          console.warn(`Invalid task_type: "${task.task_type}", skipping task ${task.task_id}`)
          return null
        }

        // Determine content based on task type
        const isComment = normalizedTaskType === "comment"

        // Use the exact column names from the sheet (sheet may have different structures)
        const content = isComment
          ? (task.comment_text || task.