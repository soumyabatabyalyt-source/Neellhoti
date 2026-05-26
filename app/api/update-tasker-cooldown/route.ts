import { NextResponse } from "next/server"
import { createUserClient } from "@/lib/taskLifecycle"

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createUserClient(token)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { data: managerProfile, error: managerError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    if (managerError) throw managerError

    if (managerProfile?.role !== "admin" && managerProfile?.role !== "manager") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { user_id, hours, minutes } = await req.json()
    const parsedHours = Number(hours || 0)
    const parsedMinutes = Number(minutes || 0)

    if (!user_id || parsedHours < 0 || parsedMinutes < 0 || parsedMinutes > 59) {
      return NextResponse.json({ error: "Invalid cooldown" }, { status: 400 })
    }

    const cooldownMinutes = Math.floor(parsedHours * 60 + parsedMinutes)

    const { error } = await supabase
      .from("profiles")
      .update({ cooldown_minutes: cooldownMinutes })
      .eq("id", user_id)

    if (error) throw error

    return NextResponse.json({ success: true, cooldown_minutes: cooldownMinutes })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Cooldown update failed"
    console.error("Cooldown update error:", error)
    return NextResp