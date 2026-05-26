# Testing Guide: Discord Notifications & Karma/Role-Based Claims

## Overview
This document outlines the testing procedures for:
1. Discord webhook notifications
2. Karma-based task claims
3. Account age-based task claims

---

## 1. Discord Notification System

### Status: ✅ IMPLEMENTED & READY FOR TESTING

**Location:** `lib/discord.ts`

**Implementation Details:**
- Webhook URL: Read from `process.env.DISCORD_WEBHOOK_URL`
- Two notification types:
  - `sendTaskAvailableNotification()` - Sends when a new task becomes available
  - `sendSummaryNotification()` - Sends periodic task summary

**Features:**
- Rich embeds with task ID, type, and reward
- @everyone mention for visibility
- Reddit bot avatar
- Graceful error handling (logs errors but doesn't crash)

### Testing Checklist:

**Step 1: Verify Environment Setup**
- [ ] Check `.env.local` has `DISCORD_WEBHOOK_URL` set
- [ ] Webhook URL should be from your Discord server's configured channel

**Step 2: Local Testing**
```bash
# Start dev server (currently requires user's local machine)
npm run dev

# Create a new task from manager dashboard
# Expected: Discord message in configured channel within 5 seconds
```

**Step 3: Verify Message Content**
- [ ] Message appears in Discord channel
- [ ] Green embed (color: 0x00ff00) for new task notifications
- [ ] Embed shows:
  - Task ID (task_code)
  - Task type (post/comment)
  - Reward (credits amount)
  - Clickable link to Neellohit

**Step 4: Test Error Scenarios**
- [ ] Comment in server logs about webhook status (search for `[Discord]`)
- [ ] If webhook fails, logs should show error code and response

### API Endpoint to Test:
```
POST /api/send-notification
Content-Type: application/json

{
  "id": "task-uuid",
  "title": "Post about Reddit",
  "task_type": "post",
  "reward_credits": 100,
  "task_code": "TASK001"
}
```

Expected Response:
```json
{
  "success": true
}
```

---

## 2. Karma-Based Claims (Min Karma Requirement)

### Status: ✅ IMPLEMENTED & READY FOR TESTING

**Location:** `app/api/claim-task/route.ts` (Lines 265-278)

**How It Works:**
1. Task creator sets `min_karma` field when creating task
2. When user attempts to claim task, system checks:
   - Does user's profile have `reddit_karma` field?
   - Is user's karma >= task's `min_karma`?
3. If check fails, return 403 with helpful error message

### Implementation Code:
```typescript
if (task.min_karma !== null && (!userProfile?.reddit_karma || userProfile.reddit_karma < task.min_karma)) {
  return NextResponse.json(
    {
      error: `Minimum karma requirement: ${task.min_karma}. You have: ${userProfile?.reddit_karma || 0}`,
    },
    { status: 403 }
  )
}
```

### Testing Checklist:

**Setup:**
- [ ] User 1: Reddit karma = 500
- [ ] User 2: Reddit karma = 5000
- [ ] Create task with `min_karma = 2000`

**Test Case 1: Low Karma User**
- [ ] User 1 attempts to claim task
- [ ] Expected: 403 error "Minimum karma requirement: 2000. You have: 500"
- [ ] User 1 should see error in UI

**Test Case 2: High Karma User**
- [ ] User 2 attempts to claim task
- [ ] Expected: Success (200)
- [ ] Task should be claimed

**Test Case 3: No Requirement**
- [ ] Create task with `min_karma = null`
- [ ] Any user should be able to claim
- [ ] Requirement validation should be skipped

### Where to Set Min Karma:
**Manager Dashboard → Create Task Form**
```
Fields:
- Post Title (optional)
- Post Body / Comment Text
- Reward (credits)
- Min Karma Requirement (optional) ← NEW
- Min Account Age Days (optional) ← NEW
```

---

## 3. Account Age-Based Claims (Min Account Age Requirement)

### Status: ✅ IMPLEMENTED & READY FOR TESTING

**Location:** `app/api/claim-task/route.ts` (Lines 281-288)

**How It Works:**
1. Task creator sets `min_account_age_days` field when creating task
2. When user attempts to claim task, system checks:
   - Does user's profile have `reddit_account_age_days` field?
   - Is user's account age >= task's `min_account_age_days`?
3. If check fails, return 403 with helpful error message

### Implementation Code:
```typescript
if (task.min_account_age_days !== null && (!userProfile?.reddit_account_age_days || userProfile.reddit_account_age_days < task.min_account_age_days)) {
  return NextResponse.json(
    {
      error: `Minimum account age requirement: ${task.min_account_age_days} days. You have: ${userProfile?.reddit_account_age_days || 0} days`,
    },
    { status: 403 }
  )
}
```

### Testing Checklist:

**Setup:**
- [ ] User A: Account age = 30 days
- [ ] User B: Account age = 180 days
- [ ] Create task with `min_account_age_days = 60`

**Test Case 1: New Account User**
- [ ] User A attempts to claim task
- [ ] Expected: 403 error "Minimum account age requirement: 60 days. You have: 30 days"
- [ ] User A should see error in UI

**Test Case 2: Old Account User**
- [ ] User B attempts to claim task
- [ ] Expected: Success (200)
- [ ] Task should be claimed

**Test Case 3: Both Requirements**
- [ ] Create task with `min_karma = 1000` AND `min_account_age_days = 90`
- [ ] Test different users:
  - Low karma + old account → Should fail (karma check)
  - High karma + new account → Should fail (age check)
  - High karma + old account → Should succeed

---

## 4. Combined Requirements Testing

### Scenario: Strict Task
```
Task: "Reddit Marketing Campaign"
- Min Karma: 5000
- Min Account Age: 180 days
- Reward: 500 credits
```

### Test Matrix:

| Karma | Age (days) | Expected Result | Error Message |
|-------|-----------|-----------------|---|
| 2000 | 365 | ❌ FAIL | "Minimum karma requirement: 5000. You have: 2000" |
| 6000 | 30 | ❌ FAIL | "Minimum account age requirement: 180 days. You have: 30 days" |
| 6000 | 365 | ✅ SUCCESS | Task claimed |
| 2000 | 30 | ❌ FAIL | "Minimum karma requirement: 5000. You have: 2000" (checks karma first) |

---

## 5. Local Testing Setup

### Prerequisites:
```bash
# 1. Have valid Supabase credentials
# 2. Have Discord webhook URL
# 3. Have test Reddit accounts with known karma/age
```

### Step-by-Step:

**1. Create Test Tasks**
```bash
# Login as manager
# Go to Manager Dashboard → Create Task
# Set requirements and save
```

**2. Create Test Users**
```bash
# Sign up new user with known Reddit stats
# Or manually set in Supabase: UPDATE profiles SET reddit_karma = X
```

**3. Test Claims**
```bash
# Switch to test user
# Go to Tasks page
# Attempt to claim tasks with various requirements
# Verify error messages
```

**4. Verify Logs**
```bash
# Server logs should show:
# [Discord] sendTaskAvailableNotification called
# [Discord] ✅ Notification sent successfully!
# [SEND-NOTIFICATION] ✅ Notification sent
```

---

## 6. Database Schema

### profiles table - Additional Fields:
```sql
reddit_karma: integer
reddit_account_age_days: integer
```

### tasks table - New Fields:
```sql
min_karma: integer (nullable)
min_account_age_days: integer (nullable)
```

---

## 7. Known Issues & Fixes Applied

✅ **RESOLVED:** Claim-task validates against correct database columns
- Changed from checking non-existent fields to proper `reddit_karma` and `reddit_account_age_days`

✅ **RESOLVED:** Error messages are user-friendly
- Shows requirement vs. user's actual stats
- Checks are performed in order (karma first, then age)

✅ **RESOLVED:** Optional requirements
- If `min_karma = null`, requirement is skipped
- If `min_account_age_days = null`, requirement is skipped
- Both can be omitted for no requirements

---

## 8. Quick Reference: Server Logs to Monitor

```
[Discord] sendTaskAvailableNotification called with task: {...}
[Discord] DISCORD_WEBHOOK_URL: SET (or NOT SET)
[Discord] Preparing notification with: {...}
[Discord] ✅ Notification sent successfully!

[SEND-NOTIFICATION] Request received
[SEND-NOTIFICATION] Sending notification for task: abc123
[SEND-NOTIFICATION] ✅ Notification sent
```

---

## 9. Troubleshooting

### Discord notification not sending?
1. Check if `DISCORD_WEBHOOK_URL` is set in `.env.local`
2. Verify webhook URL is valid (test in browser)
3. Check server logs for `[Discord] Error sending notification`
4. Ensure bot has permission to post in the channel

### Karma requirement validation failing?
1. Verify `reddit_karma` is set in user's profile
2. Check SQL: `SELECT reddit_karma FROM profiles WHERE id = 'user-id'`
3. Verify task has `min_karma` set (not null)
4. Check server logs for claim attempt

### Account age requirement failing?
1. Verify `reddit_account_age_days` is set in user's profile
2. Check SQL: `SELECT reddit_account_age_days FROM profiles WHERE id = 'user-id'`
3. Verify task has `min_account_age_days` set (not null)
4. Ensure value represents actual days (not timestamps)

---

## Next Steps

1. **Deploy to Vercel:** Push the fixed code and verify Vercel deployment succeeds
2. **Create Test Tasks:** Add tasks with various requirement combinations
3. **Test User Flows:** Go through the testing checklist above
4. **Monitor Logs:** Watch server logs during testing
5. **Verify Discord:** Check Discord channel for notifications

