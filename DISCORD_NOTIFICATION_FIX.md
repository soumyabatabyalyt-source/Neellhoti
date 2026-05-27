# Discord Notification Fix - Implementation Complete

## Status
✅ **Backend code changes completed** - Requires Discord webhook configuration

## The Problem
Discord notifications were completely non-functional because:
1. The `/api/send-notification` endpoint existed but was **never called** from anywhere
2. When tasks were published from draft status, no notification was sent to Discord
3. Managers/admins had no way to know when new tasks were available

## The Solution

### Backend Changes (DONE ✅)

**Updated: `/api/manager/draft-tasks/route.ts`**
- When a draft task is published, the system now:
  1. Fetches the task details (title, reward, type)
  2. Updates the database (draft: false)
  3. Calls `/api/send-notification` with task details
  4. Discord notification is sent asynchronously (non-blocking)

### Flow
```
Manager publishes a draft
↓
Task details fetched from database
↓
Database updated: draft = false ✅
↓
/api/send-notification called (async)
↓
Discord webhook received
↓
Discord notification posted to channel ✅
```

## Environment Setup Required

### 1. Create Discord Server & Webhook

1. Go to Discord Server Settings
2. Navigate to Integrations → Webhooks
3. Click "New Webhook"
4. Name it "Neellohit Bot"
5. Choose target channel (e.g. #tasks or #notifications)
6. Copy the webhook URL

### 2. Add to Environment Variables

Add to `.env.local`:
```
DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

### 3. Set NEXT_PUBLIC_APP_URL (if not already set)

```
NEXT_PUBLIC_APP_URL=http://localhost:3000      # for development
NEXT_PUBLIC_APP_URL=https://yourdomain.com    # for production
```

## Testing

1. **Create a draft task** (either manually or import from sheet)
2. **Publish the draft** from manager/tasks/create page
3. **Check Discord** - you should see:
   - Bot avatar (Reddit icon)
   - "✨ New Task Available!" embed
   - Task ID, Type, Reward displayed
   - "Claim Task" link

### Example Discord Notification
```
Neellohit Bot — Today at 3:45 PM

✨ New Task Available!

🎫 Task ID: A-1-1001
📌 Type: post
💎 Reward: 50 credits
🔗 Claim Task: [Open on Neellohit]

✨ Neellohit • Earn Credits Today
```

## Discord Webhook Configuration Details

### Webhook URL Format
```
https://discordapp.com/api/webhooks/{WEBHOOK_ID}/{WEBHOOK_TOKEN}
```

### Permissions Needed
The webhook needs:
- Send Messages (automatically included with webhook creation)
- Embed Links (to display embeds)
- Read Messages (to verify channel exists)

### Testing Webhook Manually

```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"content":"Test message"}' \
  https://discordapp.com/api/webhooks/YOUR_ID/YOUR_TOKEN
```

## Notification Types

Currently implemented:
- **Task Published**: Sent when manager publishes a draft to the task pool

Future notifications could include:
- Task Submitted (when user submits proof)
- Task Approved (when manager approves submission)
- Wallet Updated (when user earns credits)
- Summary (daily/hourly task digest)

## Troubleshooting

### Notifications Not Appearing

Check:
1. **DISCORD_WEBHOOK_URL is set** in .env.local
   ```bash
   echo $DISCORD_WEBHOOK_URL  # should not be empty
   ```

2. **Webhook URL is correct**
   - Go to Discord Server Settings → Webhooks
   - Verify the webhook still exists
   - Verify the webhook is in the right channel

3. **Discord bot has permissions**
   - Right-click the channel → Edit Channel → Permissions
   - Ensure the webhook's role can "Send Messages" and "Embed Links"

4. **Check logs**
   ```bash
   # Look for [Discord] logs in your app logs
   # Should see: "[Discord] ✅ Notification sent successfully!"
   ```

5. **Test the endpoint directly**
   ```bash
   curl -X POST http://localhost:3000/api/send-notification \
     -H 'Content-Type: application/json' \
     -d '{
       "id": "test-1",
       "title": "Test Task",
       "task_type": "post",
       "reward_credits": 50,
       "task_code": "TEST-001"
     }'
   ```

### Discord Webhook Returns 401/403

- Webhook URL is invalid or token expired
- Delete the webhook and create a new one
- Update .env.local with new webhook URL

### Discord Webhook Returns 429 (Rate Limited)

- Too many requests to Discord API
- Discord notification is already rate-limited by design
- Wait a few seconds and try again

## Code Overview

### Discord Notification Flow
```
/api/manager/draft-tasks (PUT)
  ↓
Task published (draft: false)
  ↓
/api/send-notification (POST)
  ↓
/lib/discord.ts sendTaskAvailableNotification()
  ↓
Discord Webhook API
  ↓
Discord Channel Message
```

### Files Modified
- `/api/manager/draft-tasks/route.ts` - Added notification call on publish

### Files Already Present
- `/api/send-notification/route.ts` - Notification endpoint
- `/lib/discord.ts` - Discord webhook integration
- `/api/send-summary-notification/route.ts` - Summary notifications (for future use)

## Next Steps

1. Set `DISCORD_WEBHOOK_URL` in .env.local
2. Create a Discord webhook in your server
3. Restart the app
4. Test by publishing a draft task
5. Verify notification appears in Discord

## Deployment

When deploying to production:
1. Create a webhook in production Discord server
2. Add webhook URL to production environment variables
3. Set NEXT_PUBLIC_APP_URL to production domain
4. Restart the app
5. Test the notification flow

---

**Status**: Ready to use once DISCORD_WEBHOOK_URL is configured
