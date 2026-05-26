import { NextRequest, NextResponse } from "next/server"
import { sendTaskAvailableNotification } from "@/lib/discord"

export async function POST(req: NextRequest) {
  try {
    console.log("[SEND-NOTIFICATION] Request received")

    const body = await req.json()

    const { id, title, task_type, reward_credits, task_code } = body

    if (!id) {
      return NextResponse.json(
        { error: "Missing task ID" },
        { status: 400 }
      )
    }

    console.log(
      "[SEND-NOTIFICATION] Sending notification for task:",
      id
    )

    // Call Discord notification (server-side)
    await sendTaskAvailableNotification({
      id,
      title,
      task_type,
      reward_credits,
      task_code,
    })

    console.log(
      "[SEND-NOTIFICATION] ✅ Notification sent"
    )

    return NextResponse.json({
      success: true,
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to send notification"

    console.error(
      "[SEND-NOTIFICATION] Error:",
      error
    )

    return NextResponse.json(
      { e