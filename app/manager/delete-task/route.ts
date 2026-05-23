import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
  try {
    const { task_id } = await req.json()

    if (!task_id) {
      return Response.json({ error: "Missing task_id" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("tasks")
      .delete()
      .eq("id", task_id)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 })
  }
}