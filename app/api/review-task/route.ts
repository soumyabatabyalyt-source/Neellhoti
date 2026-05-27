import { NextResponse } from "next/server"
import {
  createUserClient,
  createAdminClient,
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

    // Use user client only for auth verification
    const userSupabase = createUserClient(token)
    const {
      data: { user },
      error: authError,
    } = await userSupabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid user" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await userSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) throw profileError

    if (profile?.role !== "admin" && profile?.role !== "manager") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { claim_id, action, rejectionReason } = await req.json()
    if (!claim_id) {
      return NextResponse.json({ error: "Missing claim_id" }, { status: 400 })
    }
    if (action !== "approved" && action !== "rejected") {
      return NextResponse.json({ error: "Invalid review action" }, { status: 400 })
    }

    // Use admin client for all database operations to bypass RLS
    const supabase = createAdminClient()

    console.log("Step 1: Fetching task claim...", { claim_id })

    // Get the submission (claim_id is actually the task_claims ID, not submission ID)
    const { data: taskClaim, error: claimError } = await supabase
      .from("task_claims")
      .select("*")
      .eq("id", claim_id)
      .maybeSingle()

    if (claimError) {
      console.error("Step 1 failed:", claimError)
      throw claimError
    }

    if (!taskClaim) {
      console.error("Task claim not found")
      return NextResponse.json({ error: "Claim not found" }, { status: 404 })
    }

    console.log("Step 1 success:", { taskClaimStatus: taskClaim.status })
    console.log("Step 2: Fetching submission...")

    // Get the submission from task_submissions
    const { data: submission, error: submissionError } = await supabase
      .from("task_submissions")
      .select("*")
      .eq("claim_id", claim_id)
      .maybeSingle()

    if (submissionError) {
      console.error("Step 2 failed:", submissionError)
      throw submissionError
    }

    if (!submission) {
      console.error("Submission not found for claim", claim_id)
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    console.log("Step 2 success:", { submissionStatus: submission.status })
    console.log("Step 3: Fetching task...")

    const task = await findTaskByClaimTaskId(supabase, taskClaim.task_id)
    console.log("Step 3 success:", { taskFound: !!task })

    // Calculate reward_credits: 1 credit = $0.01, so $0.50 = 50 credits
    const rewardAmount = Number((task as any)?.reward || 0)
    const rewardCredits = Math.floor(rewardAmount * 100)
    const reviewedStatus = action as ReviewAction

    console.log("Step 3: Updating task_submissions...")

    // Update task_submissions status
    const { data: reviewedSubmission, error: updateSubmissionError } = await supabase
      .from("task_submissions")
      .update({ status: reviewedStatus })
      .eq("id", submission.id)
      .select("*")
      .maybeSingle()

    if (updateSubmissionError) {
      console.error("Step 3 failed:", updateSubmissionError)
      throw updateSubmissionError
    }

    if (!reviewedSubmission) {
      console.error("Submission update returned no data")
      return NextResponse.json(
        { error: "Submission was already reviewed" },
        { status: 409 }
      )
    }

    console.log("Step 3 success: Updated submission")

    // Update task_claims status — "approved" for approved, "rejected" for rejected
    // The task_claims status reflects the user's claim state
    const claimFinalStatus = reviewedStatus === "approved" ? "approved" : "rejected"
    const { error: claimUpdateError } = await supabase
      .from("task_claims")
      .update({ status: claimFinalStatus })
      .eq("id", claim_id)

    if (claimUpdateError) {
      throw claimUpdateError
    }

    // NOTE: Wallet credit is now handled by database trigger on tasks.status = 'approved'
    // The trigger fn_credit_reward_on_approval() automatically updates wallets when task is approved
    // No need for manual wallet update here - the trigger will handle it

    if (task) {
      // tasks.status enum: draft/open/available/claimed/pending_review/approved/rejected/expired
      // Setting status to "approved" triggers the database trigger to credit the wallet
      const taskFinalStatus = reviewedStatus === "approved" ? "approved" : "rejected"
      const taskUpdate: any = {
        status: taskFinalStatus,
      }

      // Add rejection reason if rejected
      if (reviewedStatus === "rejected" && rejectionReason) {
        taskUpdate.rejection_reason = rejectionReason
      }

      console.log("Step 4: Updating tasks table...", { taskId: getTaskPrimaryId(task, taskClaim.task_id), taskUpdate })

      const { error: taskUpdateError } = await supabase
        .from("tasks")
        .update(taskUpdate)
        .eq("id", getTaskPrimaryId(task, taskClaim.task_id))

      if (taskUpdateError) {
        console.error("Step 4 failed:", taskUpdateError)
        throw taskUpdateError
      }

      console.log("Step 4 success: Updated tasks table")
    } else {
      console.warn("Task not found, skipping tasks table update")
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Review failed"
    console.error("Review task error:", {
      message,
      error: error instanceof Error ? error.stack : error,
    })
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
