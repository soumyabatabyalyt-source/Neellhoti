import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js"

// =========================================
// CONSTANTS
// =========================================

export const TASK_WINDOW_SECONDS =
  10 * 60

export const DEFAULT_TASK_WINDOW_MINUTES =
  15

// =========================================
// TYPES
// =========================================

export type TaskClaim = {
  id: string

  task_id: string

  user_id: string

  status: string

  claimed_at?: string | null

  expires_at?: string | null

  submission_link?: string | null

  created_at?: string | null
}

export type ProfileCooldown = {
  cooldown_minutes?: number | string | null

  cooldown_until?: string | null
}

type TaskRow = {
  id?: string

  status?: string

  reward?: number | string | null

  claim_duration_minutes?:
    | number
    | string
    | null

  time_limit?:
    | number
    | string
    | null

  claimed_by?: string | null

  claimed_at?: string | null

  [key: string]: unknown
}

// =========================================
// CLIENTS
// =========================================

export function createAdminClient() {

  return createClient(

    process.env.SUPABASE_URL ||
      process.env
        .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  )
}

export function createUserClient(
  accessToken: string
) {

  return createClient(

    process.env.SUPABASE_URL ||
      process.env
        .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .NEXT_PUBLIC_SUPABASE_ANON_KEY!,

    {
      global: {
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      },
    }
  )
}

// =========================================
// HELPERS
// =========================================

export function safeNumber(
  value: unknown,
  fallback = 0
) {

  const parsed =
    Number(value)

  return Number.isFinite(parsed)
    ? parsed
    : fallback
}

export function getClaimExpiry(

  claimedAt = new Date(),

  durationMinutes =
    DEFAULT_TASK_WINDOW_MINUTES

) {

  return new Date(

    claimedAt.getTime() +

      durationMinutes *
        60 *
        1000
  )
}

export function isClaimExpired(

  claim: Pick<
    TaskClaim,
    "claimed_at" |
    "expires_at"
  >,

  now = new Date()

) {

  try {

    const deadline =
      claim.expires_at

        ? new Date(
            claim.expires_at
          )

        : getClaimExpiry(

            claim.claimed_at

              ? new Date(
                  claim.claimed_at
                )

              : now
          )

    if (
      Number.isNaN(
        deadline.getTime()
      )
    ) {
      return true
    }

    return (
      deadline.getTime() <=
      now.getTime()
    )

  } catch {

    return true
  }
}

// =========================================
// TASK HELPERS
// =========================================

export async function findTaskByClaimTaskId(

  supabase: SupabaseClient,

  claimTaskId: string

) {

  const result =
    await supabase

      .from("tasks")

      .select("*")

      .eq("id", claimTaskId)

      .maybeSingle()

  if (result.error)
    throw result.error

  return (
    result.data || null
  ) as TaskRow | null
}

export function getTaskPrimaryId(

  task: TaskRow,

  fallback: string

) {

  return String(
    task.id || fallback
  )
}

export function getTaskClaimDurationMinutes(

  task: TaskRow | null

) {

  const duration =
    safeNumber(

      task?.claim_duration_minutes ??

      task?.time_limit ??

      DEFAULT_TASK_WINDOW_MINUTES,

      DEFAULT_TASK_WINDOW_MINUTES
    )

  return duration > 0

    ? duration

    : DEFAULT_TASK_WINDOW_MINUTES
}

// =========================================
// COOLDOWN
// =========================================

export function getCooldownUntil(

  profile:
    | ProfileCooldown
    | null,

  now = new Date()

) {

  const minutes =
    safeNumber(
      profile?.cooldown_minutes,
      0
    )

  if (
    minutes <= 0
  ) {
    return null
  }

  return new Date(

    now.getTime() +

      minutes *
        60 *
        1000

  ).toISOString()
}

export function hasActiveCooldown(

  profile:
    | ProfileCooldown
    | null,

  now = new Date()

) {

  if (
    !profile?.cooldown_until
  ) {
    return false
  }

  const cooldown =
    new Date(
      profile.cooldown_until
    )

  if (
    Number.isNaN(
      cooldown.getTime()
    )
  ) {
    return false
  }

  return (
    cooldown.getTime() >
    now.getTime()
  )
}

// =========================================
// TASK REOPEN
// =========================================

export async function reopenTaskForClaim(

  supabase: SupabaseClient,

  claim: Pick<
    TaskClaim,
    "task_id"
  >

) {

  const task =
    await findTaskByClaimTaskId(
      supabase,
      claim.task_id
    )

  if (!task) return

  await supabase

    .from("tasks")

    .update({

      status: "open",

      claimed_by: null,

      claimed_at: null,
    })

    .eq(
      "id",
      getTaskPrimaryId(
        task,
        claim.task_id
      )
    )
}

// =========================================
// EXPIRE CLAIM
// =========================================

export async function expireClaim(

  supabase: SupabaseClient,

  claim: TaskClaim

) {

  const { error } =
    await supabase

      .from("task_claims")

      .update({
        status: "expired",
      })

      .eq("id", claim.id)

      .in("status", [
        "active",
        "submitted",
      ])

  if (error)
    throw error

  await reopenTaskForClaim(
    supabase,
    claim
  )
}

// =========================================
// CLEANUP EXPIRED CLAIMS
// =========================================

export async function expireExpiredClaims(

  supabase: SupabaseClient,

  userId?: string

) {

  const nowIso =
    new Date()
      .toISOString()

  let query =
    supabase

      .from("task_claims")

      .select("*")

      .in("status", [
        "active",
        "submitted",
      ])

      .lt(
        "expires_at",
        nowIso
      )

  if (userId) {

    query =
      query.eq(
        "user_id",
        userId
      )
  }

  const {
    data,
    error,
  } = await query

  if (error)
    throw error

  for (const claim of (
    data || []
  ) as TaskClaim[]) {

    await expireClaim(
      supabase,
      claim
    )
  }
}

// =========================================
// USER ACTIVE CLAIMS
// =========================================

export async function getUsableActiveClaims(

  supabase: SupabaseClient,

  userId: string

) {

  // CLEANUP FIRST
  await expireExpiredClaims(
    supabase,
    userId
  )

  const {
    data,
    error,
  } = await supabase

    .from("task_claims")

    .select("*")

    .eq("user_id", userId)

    .eq("status", "active")

    .order(
      "created_at",
      {
        ascending: false,
      }
    )

  if (error)
    throw error

  const claims =
    (
      (data || []) as TaskClaim[]
    ).filter(

      (claim) =>
        !isClaimExpired(
          claim
        )
    )

  // SINGLE CLAIM OK
  if (
    claims.length <= 1
  ) {

    return claims
  }

  // =======================================
  // DUPLICATE CLEANUP
  // =======================================

  const [
    keeper,
    ...duplicates
  ] = claims

  for (const duplicate of duplicates) {

    // SAME TASK DUPLICATE
    if (
      duplicate.task_id ===
    