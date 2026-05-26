import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createUserClient } from "@/lib/taskLifecycle"

const serviceRoleClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Verify user and role
    const userClient = createUserClient(token)
    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: "Invalid session" }, { status: 401 })

    const { data: caller } = await userClient.from("profiles").select("role").eq("id", user.id).maybeSingle()
    if (caller?.role !== "admin" && caller?.role !== "manager") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Use service role for the actual update (bypass RLS for admin operations)
    const supabase = serviceRoleClient

    const { user_id, reddit_karma, reddit_account_age_days, cooldown_hours, cooldown_minutes } = await req.json()

    if (!user_id) return NextResponse.json({ error: "Missing user_id" }, { status: 400 })

    const updates: Record<string, any> = {}
    if (reddit_karma !== undefined)           updates.reddit_karma = Math.max(0, Number(reddit_karma))
    if (reddit_account_age_days !== undefined) updates.reddit_account_age_days = Math.max(0, Number(reddit_account_age_days))

    if (cooldown_hours !== undefined || cooldown_minutes !== undefined) {
      const total = Math.floor(Number(cooldown_hours || 0) * 60 + Number(cooldown_minutes || 0))
      updates.cooldown_minutes = Math.max(0, total)

      // Calculate cooldown_until based on the total minutes
      if (total > 0) {
        updates.cooldown_until = new Date(Date.now() + total * 60 * 1000).toISOString()
      } else {
        updates.cooldown_until = null
      }
    }

    const { data, error, count } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user_id)
      .select()

    if (error) {
      console.error("Database error:", { error, user_id, updates })
      throw error
    }

    if (!data || data.length === 0) {
      console.error("No rows returned from update for user:", {
        user_id,
        updates,
        data,
        count,
      })
      throw new Error(`Failed to update profile for user ${user_id} - no rows affected`)
    }

    console.log("Successfully updated profile:", { user_id, updates, data: data[0] })
    return NextResponse.json({ success: true, updated: data[0] })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Update failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
