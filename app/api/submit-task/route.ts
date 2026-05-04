import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { task_id, submission_link } = body

    if (!task_id || !submission_link) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      )
    }

    // 🔥 GET USER FROM TOKEN
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    const {
      data: { user },
    } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid user" }, { status: 401 })
    }

    // 🔥 UPDATE TASK
    const { error } = await supabase
      .from("tasks")
      .update({
        status: "submitted",
        submission_link,
        submitted_at: new Date().toISOString(),
      })
      .eq("task_id", task_id)
      .eq("claimed_by", user.id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}