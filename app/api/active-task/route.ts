import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const user_id = searchParams.get("user_id")

    if (!user_id) {
      return Response.json(
        { error: "Missing user_id" },
        { status: 400 }
      )
    }

    const { data: claim, error } = await supabaseAdmin
      .from("task_claims")
      .select(`
        id,
        task_id,
        status,
        claimed_at,
        expires_at,
        tasks!task_claims_task_id_fkey (
          id,
          title,
          description,
          reward
        )
      `)
      .eq("user_id", user_id)
      .eq("status", "active")
.gt("expires_at", new Date().toISOString()) // 🔥 THIS FIX
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("DB ERROR:", error)
      return Response.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!claim) {
      return Response.json({
        claim: null,
        task: null,
        server_now: new Date().toISOString(),
      })
    }

    return Response.json({
      claim: {
        id: claim.id,
        task_id: claim.task_id,
        claimed_at: claim.claimed_at,
        expires_at: claim.expires_at,
      },
      task: claim.tasks || null,
      server_now: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error("SERVER ERROR:", err)
    return Response.json(
      { error: err?.message || "Server failed" },
      { status: 500 }
    )
  }
}