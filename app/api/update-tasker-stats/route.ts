import { NextResponse } from "next/server"
import { createUserClient } from "@/lib/taskLifecycle"

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = createUserClient(token)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: "Invalid session" }, { status: 401 })

    const { data: caller } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    if (caller?.role !== "admin" && caller?.role !== "manager") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { user_id, reddit_karma, reddit_account_age_days, cooldown_hours, cooldown_minutes } = await req.json()

    if (!user_id) return NextResponse.json({ error: "Missing user_id" }, { status: 400 })

    const updates: Record<string, number> = {}
    if (reddit_karma !== undefined)           updates.reddit_karma = Math.max(0, Number(reddit_karma))
    if (reddit_account_age_days !== undefined) updates.reddit_account_age_days = Math.max(0, Number(reddit_account_age_days))

    if (cooldown_hours !== undefined || cooldown_minutes !== undefined) {
      const total = Math.floor(Number(cooldown_hours || 0) * 60 + Number(cooldown_minutes || 0))
      updates.cooldown_minutes = Math.max(0, total)
    }

    const { error } = await supabase.from("profiles").update(updates).eq("id", user_id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Update failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
