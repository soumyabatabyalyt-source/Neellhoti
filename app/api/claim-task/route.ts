import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { task_id, user_id } = await req.json()

  // 🔥 check if already has active task
  const { data: existing } = await supabase
    .from("tasks")
    .select("*")
    .eq("claimed_by", user_id)
    .eq("status", "claimed")

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: "Finish current task first" },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      status: "claimed",
      claimed_by: user_id,
      claimed_at: new Date(),
    })
    .eq("task_id", task_id)

  if (error) {
    return NextResponse.json({ error: error.message })
  }

  return NextResponse.json({ success: true })
}