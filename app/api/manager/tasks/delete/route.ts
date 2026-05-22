import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

  try {

    const { taskId } = await req.json()

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID missing" },
        { status: 400 }
      )
    }

    // delete claims first
    await supabase
      .from("task_claims")
      .delete()
      .eq("task_id", taskId)

    // delete task
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true
    })

  } catch (err: any) {

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}