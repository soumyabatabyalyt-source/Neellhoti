import { NextRequest, NextResponse } from "next/server"

import { createUserClient } from "@/lib/taskLifecycle"

export async function POST(
  req: NextRequest
) {

  try {

    // =========================================
    // AUTH TOKEN
    // =========================================

    const token =
      req.headers
        .get("authorization")
        ?.replace(
          "Bearer ",
          ""
        )

    if (!token) {

      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      )
    }

    // =========================================
    // GET USER
    // =========================================

    const supabase = createUserClient(token)

    const {
      data: authData,
      error: authError,
    } = await supabase.auth.getUser(
      token
    )

    if (
      authError ||
      !authData.user
    ) {

      return NextResponse.json(
        {
          error:
            "Invalid session",
        },
        {
          status: 401,
        }
      )
    }

    const user =
      authData.user

    // =========================================
    // BODY
    // =========================================

    const body =
      await req.json()

    const task_id =
      body.task_id

    if (!task_id) {

      return NextResponse.json(
        {
          error:
            "Missing task_id",
        },
        {
          status: 400,
        }
      )
    }

    // =========================================
    // CLEANUP EXPIRED CLAIMS
    // =========================================

    const nowIso =
      new Date().toISOString()

    const {
      data: expiredClaims,
    } = await supabase
      .from("task_claims")
      .select(`
        id,
        task_id
      `)
      .eq("status", "active")
      .lt(
        "expires_at",
        nowIso
      )

    if (
      expiredClaims &&
      expiredClaims.length > 0
    ) {

      const expiredIds =
        expiredClaims.map(
          (c) => c.id
        )

      const expiredTaskIds =
        expiredClaims.map(
          (c) => c.task_id
        )

      // MARK CLAIMS EXPIRED
      await supabase
        .from("task_claims")
        .update({
          status: "expired",
        })
        .in("id", expiredIds)

      // RETURN TASKS TO POOL
      await supabase
        .from("tasks")
        .update({
          status: "open",
        })
        .in("id", expiredTaskIds)
    }

    // =========================================
    // PROFILE CHECK
    // =========================================

    const {
      data: profile,
    } = await supabase
      .from("profiles")
      .select(`
        approval_status,
        cooldown_until
      `)
      .eq("id", user.id)
      .single()

    if (profile?.approval_status !== 'approved') {

      return NextResponse.json(
        {
          error:
            "Await manager approval",
        },
        {
          status: 403,
        }
      )
    }

    if (profile?.approval_status === 'suspended') {

      return NextResponse.json(
        {
          error:
            "Account suspended",
        },
        {
          status: 403,
        }
      )
    }

    // =========================================
    // COOLDOWN CHECK
    // =========================================

    if (
      profile?.cooldown_until &&
      new Date(
        profile.cooldown_until
      ) > new Date()
    ) {

      return NextResponse.json(
        {
          error:
            "Cooldown active",
        },
        {
          status: 403,
        }
      )
    }

    // =========================================
    // USER ACTIVE CLAIM CHECK
    // =========================================

    const {
      data: existingClaim,
    } = await supabase
      .from("task_claims")
      .select(`
        id,
        expires_at
      `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle()

    if (existingClaim) {

      return NextResponse.json(
        {
          error:
            "Finish your current task first",
        },
        {
          status: 400,
        }
      )
    }

    // =========================================
    // CHECK TASK EXISTS & GET REQUIREMENTS
    // =========================================

    const {
      data: task,
    } = await supabase
      .from("tasks")
      .select("*, min_karma, min_account_age_days")
      .eq("id", task_id)
      .single()

    if (!task) {

      return NextResponse.json(
        {
          error:
            "Task not found",
        },
        {
          status: 404,
        }
      )
    }

    // =========================================
    // CHECK KARMA & ACCOUNT AGE REQUIREMENTS
    // =========================================

    if (task.min_karma !== null || task.min_account_age_days !== null) {
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("reddit_karma, reddit_account_age_days")
        .eq("id", user.id)
        .single()

      if (task.min_karma !== null && (!userProfile?.reddit_karma || userProfile.reddit_karma < task.min_karma)) {
        return NextResponse.json(
          {
            error: `Minimum karma requirement: ${task.min_karma}. You have: ${userProfile?.reddit_karma || 0}`,
          },
          { status: 403 }
        )
      }

      if (task.min_account_age_days !== null && (!userProfile?.reddit_account_age_days || userProfile.reddit_account_age_days < task.min_account_age_days)) {
        return NextResponse.json(
          {
            error: `Minimum account age requirement: ${task.min_account_age_days} days. You have: ${userProfile?.reddit_account_age_days || 0} days`,
          },
          { status: 403 }
        )
      }
    }

    // =========================================
    // TASK STATUS CHECK
    // =========================================

    if (
      task.status !== "open" &&
      task.status !== "available"
    ) {

      return NextResponse.json(
        {
          error:
            "Task unavailable",
        },
        {
          status: 400,
        }
      )
    }

    // =========================================
    // CHECK TASK CLAIMED
    // =========================================

    const {
      data: activeTaskClaim,
    } = await supabase
      .from("task_claims")
      .select("id")
      .eq("task_id", task_id)
      .eq("status", "active")
      .maybeSingle()

    if (activeTaskClaim) {

      return NextResponse.json(
        {
          error:
            "Task already claimed",
        },
        {
          status: 400,
        }
      )
    }

    // =========================================
    // TIMER
    // =========================================

    const minutes =
      Number(
        task.time_limit || 30
      )

    const expiresAt =
      new Date(
        Date.now() +
          minutes *
            60 *
            1000
      ).toISOString()

    // ========