// =============================================
// DISCORD WEBHOOK NOTIFICATIONS
// =============================================

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL
const WEBSITE_URL = "https://neellohit.xyz"

type Task = {
  id: string
  title?: string | null
  reward_credits?: number | null
  task_type?: string | null
  task_code?: string | null
}

type TaskSummary = {
  tasks: Task[]
}

export async function sendTaskAvailableNotification(task: Task): Promise<void> {
  console.log("[Discord] sendTaskAvailableNotification called with task:", task)
  console.log("[Discord] DISCORD_WEBHOOK_URL:", DISCORD_WEBHOOK_URL ? "SET" : "NOT SET")

  if (!DISCORD_WEBHOOK_URL) {
    console.warn("[Discord] DISCORD_WEBHOOK_URL not set — skipping notification")
    return
  }

  const taskType = task.task_type || "General"
  const reward = task.reward_credits != null ? `${task.reward_credits} credits` : "N/A"
  const taskId = task.task_code || task.id

  console.log("[Discord] Preparing notification with:", { taskId, taskType, reward })

  const embed = {
    title: "✨ New Task Available!",
    color: 0x00ff00, // Green for fresh tasks
    fields: [
      {
        name: "🎫 Task ID",
        value: `\`${taskId}\``,
        inline: true,
      },
      {
        name: "📌 Type",
        value: `\`${taskType}\``,
        inline: true,
      },
      {
        name: "💎 Reward",
        value: `\`${reward}\``,
        inline: true,
      },
      {
        name: "🔗 Claim Task",
        value: `[Open on Neellohit](${WEBSITE_URL})`,
        inline: false,
      },
    ],
    footer: {
      text: `✨ Neellohit • Earn Credits Today`,
    },
  }

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "@everyone 🎯 New Task Available!",
        username: "Neellohit Bot",
        avatar_url: "https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png",
        embeds: [embed],
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error(`[Discord] Webhook failed (${response.status}):`, text)
    } else {
      console.log("[Discord] ✅ Notification sent successfully!")
    }
  } catch (err) {
    // Never throw from notification helpers — log and move on
    console.error("[Discord] Error sending notification:", err)
  }
}

export async function sendSummaryNotification(summary: TaskSummary): Promise<void> {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn("[Discord] DISCORD_WEBHOOK_URL not set — skipping summary notification")
    return
  }

  const taskList = summary.tasks
    .map((t) => {
      const id = t.task_code || t.id
      const reward = t.reward_credits != null ? `${t.reward_credits} credits` : "N/A"
      return `• \`${id}\` — ${reward}`
    })
    .join("\n") || "No tasks available."

  const embed = {
    title: "📋 Task Summary",
    description: taskList,
    color: 0x5865f2,
    footer: {
      text: "✨ Neellohit • Earn Credits Today",
    },
  }

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "📢 Here are the currently available tasks:",
        username: "Neellohit Bot",
        avatar_url: "https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png",
        embeds: [embed],
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error(`[Discord] Summary webhook failed (${response.status}):`, text)
    } else {
      console.log("[Discord] ✅ Summary notification sent successfully!")
    }
  } catch (err) {
    console.error("[Discord] Error sending summary notification:", err)
  }
}
