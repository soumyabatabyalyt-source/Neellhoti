import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Check if GOOGLE_SCRIPT_URL is configured
    if (!process.env.GOOGLE_SCRIPT_URL) {
      throw new Error(
        "GOOGLE_SCRIPT_URL environment variable is not set. " +
        "Please add your Google Apps Script URL to .env.local (e.g., GOOGLE_SCRIPT_URL=https://script.google.com/macros/d/YOUR_ID/usercache...)"
      )
    }

    const res = await fetch(process.env.GOOGLE_SCRIPT_URL)
    console.log("Google Script response status:", res.status)

    if (!res.ok) {
      throw new Error(
        `Google Apps Script returned status ${res.status}. ` +
        `Check that GOOGLE_SCRIPT_URL is valid and the script is deployed.`
      )
    }

    const text = await res.text()
    console.log("Google Script raw response:", text)

    // Validate response is not empty
    if (!text || text.trim().length === 0) {
      throw new Error("Google Apps Script returned empty response")
    }

    let tasks
    try {
      tasks = JSON.parse(text)
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr)
      throw new Error(
        `Invalid JSON from Google Apps Script. ` +
        `Response: ${text.substring(0, 200)}`
      )
    }

    // Validate tasks is an array
    if (!Array.isArray(tasks)) {
      throw new Error(
        `Expected array of tasks from Google Apps Script, got ${typeof tasks}. ` +
        `Response: ${JSON.stringify(tasks).substring(0, 200)}`
      )
    }

    // 🔥 STEP 1: get existing tasks
    const { data: existingTasks } = await supabase
      .from("tasks")
      .select("task_code")

    const existingIds = new Set(existingTasks?.map(t => t.task_code))

    // 🔥 STEP 2: filter only NEW tasks
    const newTasks = tasks
      .filter((t: any) => {
        if (!t.task_id) {
          console.warn("Task missing task_id, skipping:", t)
          return false
        }
        return !existingIds.has(t.task_id)
      })
      .map((task: any) => {
        try {
          // Normalize task_type to lowercase
          const taskTypeRaw = task.task_type
          if (taskTypeRaw === undefined || taskTypeRaw === null) {
            console.warn(`Task ${task.task_id} has missing task_type, skipping`)
            return null
          }
          const normalizedTaskType = String(taskTypeRaw).toLowerCase().trim()

          // Validate task_type
          if (!["post", "comment"].includes(normalizedTaskType)) {
            console.warn(`Invalid task_type: "${task.task_type}", skipping task ${task.task_id}`)
            return null
          }

          // Determine content based on task type
          const isComment = normalizedTaskType === "comment"

          // Use the exact column names from the sheet (sheet may have different structures)
          const content = isComment
            ? (task.comment_text || task.body || task.description)
            : (task.post_body || task.description || task.body)

          const postTitle = task.post_title || task.title
          const postLink = task.post_link

          // Parse requirements (handle both string and number formats)
          const minKarma = task.min_karma ? parseInt(String(task.min_karma), 10) : null
          const minAccountAge = task.min_account_age_days ? parseInt(String(task.min_account_age_days), 10) : null

          return {
            task_code: task.task_id,
            task_type: normalizedTaskType,
            title: !isComment ? postTitle : null,
            description: content,
            body: content,
            reward: parseInt(String(task.reward || 0), 10),
            status: "draft",
            platform: "reddit",
            draft: true,
            source: "google_sheets",
            post_link: isComment ? postLink : null,
            comment_type: isComment ? (task.comment_type || "comment") : null,
            time_limit: task.time_limit ? parseInt(String(task.time_limit), 10) : 30,
            min_karma: minKarma,
            min_account_age_days: minAccountAge,
            sheet_row_link: task.sheet_row_link || null,
          }
        } catch (mapErr) {
          console.error(`Error processing task ${task.task_id}:`, mapErr)
          return null
        }
      })
      .filter((task: any) => task !== null)
      .filter((task: any): task is NonNullable<typeof task> => task !== null)

    // 🔥 STEP 3: insert only new ones
    if (newTasks.length > 0) {
      console.log(`Inserting ${newTasks.length} new tasks:`, newTasks)
      const { error } = await supabase.from("tasks").insert(newTasks)
      if (error) {
        console.error("Insert error:", error)
        throw error
      }
      console.log(`Successfully inserted ${newTasks.length} tasks`)
    } else {
      console.log("No new tasks to insert")
    }

    return NextResponse.json({
      success: true,
      inserted: newTasks.length,
      message: `Imported ${newTasks.length} new task(s)`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message })
  }
}
