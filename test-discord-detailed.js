// Test Discord Webhook with more details
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1508165713674895494/_u5qTcwjfP385aicKbeE_lV69PCbrXX1GKLbCslAAAlEGgaDqqeVStNDdHQI5rS_t0pX"

const payload = {
  content: "@everyone 🎯 New Task Available! Task ID: test-12345 | Type: Comment Post | Reward: 150 credits"
}

console.log("Webhook URL:", DISCORD_WEBHOOK_URL)
console.log("Testing basic webhook...")

fetch(DISCORD_WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
})
  .then(response => {
    console.log("✅ Connected to Discord")
    console.log("Status code:", response.status)
    console.log("Status text:", response.statusText)
    return response.text().then(text => ({ text, status: response.status }))
  })
  .then(({ text, status }) => {
    console.log("Response:", text || "(empty)")
    if (status === 204) {
      console.log("✅ WEBHOOK WORKS - Message sent successfully!")
    } else if (status === 401) {
      console.log("❌ WEBHOOK ERROR - Invalid or expired webhook URL")
    } else if (status === 404) {
      console.log("❌ WEBHOOK ERROR - Webhook not found")
    }
  })
  .catch(err => {
    console.error(