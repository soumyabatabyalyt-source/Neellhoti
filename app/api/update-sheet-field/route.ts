import { NextResponse } from "next/server"
import { createUserClient } from "@/lib/taskLifecycle"

/**
 * Updates a specific field in the Google Sheet for a task
 * Called after task submission to sync post_link, comment_link, etc.
 *
 * POST /api/update-sheet-field
 * Body: { task_code: string, field: string, value: string }
 */

export async function POST(req: Request) {
  try {
    const { task_code, field, value } = await req.json()

    if (!task_code || !field || value === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: task_code, field, value" },
        { status: 400 }
      )
    }

    // Validate field is one we're allowed to update
    const allowedFields = ["post_link", "comment_link", "status"]
    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { error: `Field '${field}' is not allowed to be updated` },
        { status: 400 }
      )
    }

    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL
    if (!googleScriptUrl) {
      console.error("GOOGLE_SCRIPT_URL not set in environment")
      // Don't fail - just log the error and continue
      // Sheet updates are nice-to-have, not critical
      return NextResponse.json(
        { success: true, warning: "Sheet update skipped - GOOGLE_SCRIPT_URL not configured" },
        { status: 200 }
      )
    }

    // Call the Google Apps Script to update the sheet
    // The Apps Script should handle POST requests with this payload
    const response = await fetch(googleScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "updateField",
        task_code: task_code,
        field: field,
        value: value,
      }),
    })

    if (!response.ok) {
      console.error(
        `Sheet update failed: HTTP ${response.status}`,
        await response.text()
      )
      // Again, don't fail the task submission if sheet update fails
      return NextResponse.json(
        { success: true, warning: `Sheet update returned HTTP ${response.status}` },
        { status: 200 }
      )
    }

    return NextResponse.json({ success: true, updated: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed"
    console.error("Sheet update error:", error)

    // Return success anyway - task was already saved to DB
    // Sheet sync is secondary
    return NextResponse.json(
      { success: true, warning: `Sheet update error: ${message}` },
      { status: 200 }
    )
  }
}
