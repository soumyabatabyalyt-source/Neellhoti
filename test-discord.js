// Test Discord Webhook
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1508165713674895494/_u5qTcwjfP385aicKbeE_lV69PCbrXX1GKLbCslAAAlEGgaDqqeVStNDdHQI5rS_t0pX"
const WEBSITE_URL = "https://neellohit.xyz"

const task = {
  id: "test-12345",
  task_type: "Comment Post",
  reward_credits: 150,
}

const taskType = task.task_type || "General"
const reward = task.reward_credits != null ? `${task.reward_credits} credits` : "N/A"

const embed = {
  title: "🎯 New Task Available!",
  color: 0xff4500,
  fields: [
    {
      name: "Task ID",
      value: task.id,
      inline: true,
    },
    {
      name: "Task Type",
      value: taskType,
      inline: true,
    },
    {
      name: "Reward",
      value: reward,
      inline: true,
    },
  ],
  footer: {
    text: "Click the link below to claim this task!",
  },
}

const payload = {
  content: "@everyone",
  username: "Task Bot",
  avatar_url: "https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png",
  embeds: [embed],
  components: [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 5,
          label: "Claim Task on neellohit.xyz",
          url: WEBSITE_URL,
        },
      ],
    },
  ],
}

console.log("Testing Discord webhook...")
console.log("Payload:", JSON.stringify(payload, null, 2))

fetch(DISCORD_WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
})
  .then(response => {
    console.log("Response status:", response.status)
    return response.text()
  })
  .then(text => {
    console.log("Response body:", text)
    if (text) {
      console.log("Response JSON:", JSON.parse(text))
    } else {
      console.log("✅ SUCCESS - No response body (normal for Discord webhooks)")
   