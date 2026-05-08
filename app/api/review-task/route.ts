import { NextResponse } from "next/server"
import {
  createUserClient,
  findTaskByClaimTaskId,
  getTaskPrimaryId,
} from "@/lib/taskLifecycle"

type ReviewAction = "approved" | "rejected"

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
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid user" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) throw profileError

    if (profile?.role !== "admin" && profile?.role !== "manager") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { claim_id, task_id, action } = await req.json()
    if (action !== "approved" && action !== "rejected") {
      return NextResponse.json({ error: "Invalid review action" }, { status: 400 })
    }

    let claimQuery = supabase
      .from("task_claims")
      .select("*")
      .eq("status", "submitted")
      .order("created_at", { ascending: false })
      .limit(1)

    claimQuery = claim_id
      ? claimQuery.eq("id", claim_id)
      : claimQuery.eq("task_id", task_id)

    const { data: claim, error: claimError } = await claimQuery.maybeSingle()
    if (claimError) throw claimError

    if (!claim) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    const task = await findTaskByClaimTaskId(supabase, claim.task_id)
    const reward = Number(task?.reward || 0)
    const reviewedStatus = action as ReviewAction

    const { data: reviewedClaim, error: updateClaimError } = await supabase
      .from("task_claims")
      .update({ status: reviewedStatus })
      .eq("id", claim.id)
      .eq("status", "submitted")
      .select("*")
      .maybeSingle()

    if (updateClaimError) throw updateClaimError

    if (!reviewedClaim) {
      return NextResponse.json(
        { error: "Submission was already reviewed" },
        { status: 409 }
      )
    }

    if (reviewedStatus === "approved" && reward > 0) {
      try {
        const { data: wallet, error: walletError } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", claim.user_id)
          .maybeSingle()

        if (walletError) throw walletError

        if (!wallet) {
          const { error } = await supabase.from("wallets").insert({
            user_id: claim.user_id,
            balance: reward,
          })
          if (error) throw error
        } else {
          const { error } = await supabase
            .from("wallets")
            .update({ balance: Number(wallet.balance || 0) + reward })
            .eq("user_id", claim.user_id)

          if (error) throw error
        }

        try {
          const { error: earningError } = await supabase.from("earnings").insert({
            user_id: claim.user_id,
            task_id: claim.task_id,
            amount: reward,
          })

          if (earningError) console.error("Earning insert failed:", earningError.message)
        } catch (earningError) {
          console.error("Earning insert skipped:", earningError)
        }
      } catch (creditError) {
        await supabase
          .from("task_claims")
          .update({ status: "submitted" })
          .eq("id", claim.id)
        throw creditError
      }
    }

    if (task) {
      await supabase
        .from("tasks")
        .update({ status: reviewedStatus })
        .eq("id", getTaskPrimaryId(task, claim.task_id))
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Review failed"
    console.error("Review task error:", error)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
