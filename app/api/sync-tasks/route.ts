import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─────────────────────────────────────────────────────────────
// Sheet column reference (Apps Script must output these keys):
//
//  task_id              – API reference, used for deduplication     [col A]
//  task_code            – Human reference shown in admin/manager UI  [col B]
//  task_type            – "post" | "comment"                         [col C]
//  title                – Post title (required for post tasks)        [col D]
//  description          – Task description / comment text             [col E]
//  body                 – Post body (posts) or comment text (comments)[col F]
//  reward               – Dollar amount integer                       [col G]
//  post_link            – Reddit URL (required for comment tasks)     [col H]
//  comment_type         – "comment" | "reply"                        [col I]
//  min_karma            – Integer or blank                            [col J]
//  min_account_age_days – Integer or blank                            [col K]
//
// NOTE: body and description are interchangeable — whichever is
// filled in will be used. For comment tasks the text is often
// only in description; for post tasks it may be only in body.
// ─────────────────────────────────────────────────────────────

/** Strip query strings and fragments from a URL, normalize domain. */
function cleanUrl(raw: string): string {
  return raw
    .trim()
    .replace("old.reddit.com", "reddit.com")
    .replace("www.reddit.com", "reddit.com")
    .replace("new.reddit.com", "reddit.com")
    .replace("m.reddit.com", "reddit.com")
    .split("?")[0]   // remove UTM params and any query string
    .split("#")[0]   // remove fragments
    .replace(/\/$/, "") // remove trailing slash
}

export async function GET() {
  try {
    // ── env check ──────────────────────────────────────────
    if (!process.env.GOOGLE_SCRIPT_URL) {
      throw new Error(
        "GOOGLE_SCRIPT_URL is not set. Add it to .env.local."
      )
    }

    // ── fetch from Apps Script ─────────────────────────────
    const res = await fetch(process.env.GOOGLE_SCRIPT_URL)
    if (!res.ok) {
      throw new Error(
        `Apps Script returned HTTP ${res.status}. Check your GOOGLE_SCRIPT_URL.`
      )
    }

    const text = await res.text()
    if (!text?.trim()) {
      throw new Error("Apps Script returned an empty response.")
    }

    let rows: any[]
    try {
      rows = JSON.parse(text)
    } catch {
      throw new Error(
        `Apps Script did not return valid JSON. Got: ${text.substring(0, 300)}`
      )
    }

    if (!Array.isArray(rows)) {
      throw new Error(
        `Expected a JSON array from Apps Script, got: ${typeof rows}`
      )
    }

    // ── load existing codes from DB for dedup ──────────────
    const { data: existingTasks, error: fetchError } = await supabase
      .from("tasks")
      .select("task_code")

    if (fetchError) {
      throw new Error(`Failed to load existing tasks: ${fetchError.message}`)
    }

    const existingCodes = new Set(
      (existingTasks ?? []).map((t) => t.task_code).filter(Boolean)
    )

    // ── process rows ───────────────────────────────────────
    const newTasks: any[]  = []
    const skipped: string[] = []
    const invalid: string[] = []

    for (const row of rows) {

      // ── resolve identifier ─────────────────────────────
      // Sheet has task_id (API ref) and task_code (human ref).
      // task_code is what we store in the DB and show in the UI.
      // We fall back to task_id if task_code is absent (old sheets).
      const taskId   = row.task_id   ? String(row.task_id).trim()   : null
      const taskCode = row.task_code ? String(row.task_code).trim() : null
      const codeForDB = taskCode ?? taskId

      if (!codeForDB) {
        console.warn("Row missing both task_id and task_code — skipping:", row)
        invalid.push("(no id)")
        continue
      }

      // Skip if already imported (check both task_code and task_id)
      if (
        existingCodes.has(codeForDB) ||
        (taskId && existingCodes.has(taskId)) ||
        (taskCode && existingCodes.has(taskCode))
      ) {
        skipped.push(codeForDB)
        continue
      }

      // ── task_type ──────────────────────────────────────
      const taskType = row.task_type
        ? String(row.task_type).toLowerCase().trim()
        : null

      if (!taskType || !["post", "comment"].includes(taskType)) {
        console.warn(`Row ${codeForDB}: invalid task_type "${row.task_type}" — skipping`)
        invalid.push(codeForDB)
        continue
      }

      const isComment = taskType === "comment"

      // ── resolve body text ──────────────────────────────
      // Comments often have their text only in "description".
      // Posts often have their text only in "body".
      // Accept whichever is filled in — prefer body, fall back to description.
      const bodyVal = row.body        ? String(row.body).trim()        : null
      const descVal = row.description ? String(row.description).trim() : null
      const resolvedBody = bodyVal || descVal || null
      const resolvedDesc = descVal || bodyVal || null

      // ── validate required fields by task type ──────────
      // POST tasks require:    task_code, title, body, reward (karma/age optional)
      // COMMENT tasks require: task_code, comment_type, body
      if (!isComment && !row.title?.trim()) {
        console.warn(`Row ${codeForDB}: post task missing title — skipping`)
        invalid.push(codeForDB)
        continue
      }
      if (!resolvedBody) {
        console.warn(`Row ${codeForDB}: no body or description text — skipping`)
        invalid.push(codeForDB)
        continue
      }

      // ── comment_type (comment tasks only) ──────────────
      const validCommentTypes = ["comment", "reply", "hyperlink"]
      const rawCommentType = row.comment_type
        ? String(row.comment_type).toLowerCase().trim()
        : null
      const resolvedCommentType = isComment
        ? (validCommentTypes.includes(rawCommentType ?? "") ? rawCommentType : "comment")
        : null

      // ── numeric fields ─────────────────────────────────
      const reward    = row.reward     ? parseInt(String(row.reward), 10)     : 0
      const timeLimit = row.time_limit ? parseInt(String(row.time_limit), 10) : 30

      // POST tasks: karma/age eligibility gates apply
      // COMMENT tasks: no eligibility filters from sheet
      const minKarma = !isComment && row.min_karma
        ? parseInt(String(row.min_karma), 10)
        : null
      const minAccountAge = !isComment && row.min_account_age_days
        ? parseInt(String(row.min_account_age_days), 10)
        : null

      // ── build DB row ────────────────────────────────────
      // POST:    task_code, title, body, reward, min_karma, min_account_age_days
      //          post_link = null (tasker submits their post URL as proof)
      // COMMENT: task_code, comment_type, body
      //          comment_link = null (tasker submits their comment URL as proof)
      newTasks.push({
        task_code:            codeForDB,
        task_type:            taskType,
        title:                isComment ? null : String(row.title).trim(),
        description:          resolvedDesc,
        body:                 resolvedBody,
        subreddit:            row.subreddit ? String(row.subreddit).trim() : null,
        reward:               isNaN(reward) ? 0 : reward,
        time_limit:           isNaN(timeLimit) ? 30 : timeLimit,
        post_link:            null,  // filled by tasker on submission
        comment_link:         null,  // filled by tasker on submission (comment tasks)
        comment_type:         resolvedCommentType,
        min_karma:            minKarma !== null && !isNaN(minKarma as number) ? minKarma : null,
        min_account_age_days: minAccountAge !== null && !isNaN(minAccountAge as number)
                                ? minAccountAge : null,
        sheet_row_link:       row.sheet_row_link ?? null,
        platform:             "reddit",
        status:               "draft",
        draft:                true,
        source:               "google_sheets",
      })
    }

    // ── insert new rows ────────────────────────────────────
    if (newTasks.length > 0) {
      const { error: insertError } = await supabase
        .from("tasks")
        .insert(newTasks)

      if (insertError) {
        console.error("Insert error:", insertError)
        throw new Error(`DB insert failed: ${insertError.message}`)
      }
    }

    console.log(
      `Sync done — inserted: ${newTasks.length}, skipped: ${skipped.length}, invalid: ${invalid.length}`
    )

    return NextResponse.json({
      success:  true,
      inserted: newTasks.length,
      skipped:  skipped.length,
      invalid:  invalid.length,
      message:  `Imported ${newTasks.length} new task(s). Skipped ${skipped.length} already imported${invalid.length ? `. ${invalid.length} rows skipped (missing required fields)` : ""}.`,
    })

  } catch (err: any) {
    console.error("sync-tasks error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
