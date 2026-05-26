# Local Testing Guide - Discord Notifications & Karma/Age Claims

## Quick Start

### 1. Start Your Local Dev Server
```bash
npm run dev
```
The server should start on `http://localhost:3000`

---

## Test 1: Discord Notifications

### Prerequisites:
- [ ] Discord webhook URL in `.env.local` as `DISCORD_WEBHOOK_URL`
- [ ] Discord server with a channel configured for webhooks
- [ ] Manager/Admin account to create tasks

### Test Steps:

**A. Verify Discord Webhook is Connected**
1. Go to `http://localhost:3000` in Chrome
2. Open **Manager Dashboard**
3. Go to **Create Task** section
4. Fill in task details:
   - Title: "Test Discord Notification"
   - Task Type: "Post"
   - Body: "Test content for Discord"
   - Reward: 100 credits
5. Click **Create Task**
6. **Expected:** Discord message appears in your configured channel within 5 seconds
   - Green embed with task details
   - Shows: Task ID, Type, Reward
   - "Open on Neellohit" button

**B. Monitor Server Logs**
Open browser DevTools (F12) → **Console** tab:
```
[SEND-NOTIFICATION] Request received
[SEND-NOTIFICATION] Sending notification for task: [task-id]
[Discord] sendTaskAvailableNotification called with task: {...}
[Discord] DISCORD_WEBHOOK_URL: SET
[Discord] ✅ Notification sent successfully!
```

---

## Test 2: Karma-Based Claims

### Prerequisites:
- [ ] Supabase profiles populated with `reddit_karma` values
- [ ] Two test users with different karma levels

### Setup Test Users:

**User 1 (Low Karma):**
- Signup or use existing account
- In Supabase: `UPDATE profiles SET reddit_karma = 500 WHERE id = 'user1-id'`

**User 2 (High Karma):**
- Signup or use existing account
- In Supabase: `UPDATE profiles SET reddit_karma = 10000 WHERE id = 'user2-id'`

### Test Steps:

**Step 1: Create Task with Karma Requirement**
1. **Manager Dashboard** → **Create Task**
2. Fill in:
   - Title: "High Karma Task"
   - Task Type: "Post"
   - Body: "This task requires high karma"
   - Reward: 250 credits
   - **Min Karma Requirement: 5000** ← Important!
3. Click **Create Task**

**Step 2: Test Low Karma User (User 1)**
1. **Logout** from manager account
2. **Login as User 1** (500 karma)
3. Go to **Tasks** → **Task Pool**
4. Find the "High Karma Task"
5. Click **Claim Task**
6. **Expected Error Message:**
   ```
   Minimum karma requirement: 5000. You have: 500
   ```
7. **Verify:** Error appears in toast/alert notification

**Step 3: Test High Karma User (User 2)**
1. **Logout** User 1
2. **Login as User 2** (10000 karma)
3. Go to **Tasks** → **Task Pool**
4. Find the "High Karma Task"
5. Click **Claim Task**
6. **Expected:** Task is claimed successfully
7. **Verify:** Task moves to "Active" tab in My Tasks

**Step 4: Monitor API Response**
In Chrome DevTools → **Network** tab:
```
POST /api/claim-task

Request Body:
{
  "task_id": "task-uuid"
}

Success Response (200):
{
  "success": true,
  "claim": {
    "id": "claim-id",
    "task_id": "task-uuid",
    ...
  }
}

Error Response (403):
{
  "error": "Minimum karma requirement: 5000. You have: 500"
}
```

---

## Test 3: Account Age-Based Claims

### Prerequisites:
- [ ] Two test users with different account ages
- [ ] Supabase profiles populated with `reddit_account_age_days`

### Setup Test Users:

**User A (New Account):**
- In Supabase: `UPDATE profiles SET reddit_account_age_days = 15 WHERE id = 'userA-id'`

**User B (Old Account):**
- In Supabase: `UPDATE profiles SET reddit_account_age_days = 365 WHERE id = 'userB-id'`

### Test Steps:

**Step 1: Create Task with Age Requirement**
1. **Manager Dashboard** → **Create Task**
2. Fill in:
   - Title: "Experienced Redditor Task"
   - Task Type: "Comment"
   - Body: "Only seasoned Redditors"
   - Reward: 150 credits
   - **Min Account Age Days: 180** ← Important!
3. Click **Create Task**

**Step 2: Test New Account User (User A)**
1. **Logout**, **Login as User A** (15 days old)
2. Go to **Tasks** → **Task Pool**
3. Find "Experienced Redditor Task"
4. Click **Claim Task**
5. **Expected Error:**
   ```
   Minimum account age requirement: 180 days. You have: 15 days
   ```

**Step 3: Test Old Account User (User B)**
1. **Logout**, **Login as User B** (365 days old)
2. Go to **Tasks** → **Task Pool**
3. Find "Experienced Redditor Task"
4. Click **Claim Task**
5. **Expected:** Task claimed successfully

---

## Test 4: Combined Requirements (Advanced)

### Create a Strict Task:
```
Title: "Premium Reddit Campaign"
Min Karma: 10000
Min Account Age: 90 days
Reward: 500 credits
```

### Test Matrix:

| Test User | Karma | Age (days) | Expected Outcome |
|-----------|-------|-----------|-----------------|
| User X | 5000 | 365 | ❌ FAIL - "Minimum karma requirement: 10000. You have: 5000" |
| User Y | 15000 | 30 | ❌ FAIL - "Minimum account age requirement: 90 days. You have: 30 days" |
| User Z | 15000 | 365 | ✅ SUCCESS - Task claimed |

---

## Browser DevTools Testing Checklist

### Console Logs to Monitor:
```
✓ [SEND-NOTIFICATION] Request received
✓ [SEND-NOTIFICATION] Sending notification for task: xyz
✓ [Discord] sendTaskAvailableNotification called
✓ [Discord] DISCORD_WEBHOOK_URL: SET
✓ [Discord] ✅ Notification sent successfully!
```

### Network Tab Checklist:
- [ ] `POST /api/claim-task` returns 200 on success
- [ ] `POST /api/claim-task` returns 403 with error message on validation failure
- [ ] `POST /api/send-notification` returns 200 after creating task

### UI Checklist:
- [ ] Task creation form has "Min Karma Requirement" field
- [ ] Task creation form has "Min Account Age Days" field
- [ ] Error messages display as toast/alert when claim fails
- [ ] Task successfully moves to "Active" when claimed with valid stats
- [ ] Discord message appears within 5 seconds of task creation

---

## Troubleshooting

### Discord Notification Not Appearing?
1. Check `.env.local` has `DISCORD_WEBHOOK_URL` set
2. Verify webhook URL by testing in Discord (try posting manually)
3. Check browser console for `[Discord] Error sending notification`
4. Check that bot has permissions in Discord channel

### Karma Check Not Working?
1. Verify user's profile has `reddit_karma` set:
   ```sql
   SELECT reddit_karma FROM profiles WHERE id = 'user-id';
   ```
2. Verify task has `min_karma` set:
   ```sql
   SELECT min_karma FROM tasks WHERE id = 'task-id';
   ```
3. Check Network tab for error response from `/api/claim-task`

### Account Age Check Not Working?
1. Verify user's profile has `reddit_account_age_days`:
   ```sql
   SELECT reddit_account_age_days FROM profiles WHERE id = 'user-id';
   ```
2. Verify task has `min_account_age_days`:
   ```sql
   SELECT min_account_age_days FROM tasks WHERE id = 'task-id';
   ```
3. Ensure value is in days (not timestamp)

---

## Expected Results Summary

### ✅ All Features Working When:

**Discord:**
- ✓ New task created → Message appears in Discord within 5s
- ✓ Embed shows green color (0x00ff00)
- ✓ Includes task ID, type, reward, and clickable link

**Karma Claims:**
- ✓ User below min karma → 403 error with helpful message
- ✓ User at/above min karma → Task claimed successfully
- ✓ No requirement set → All users can claim

**Account Age Claims:**
- ✓ User below min age → 403 error with helpful message
- ✓ User at/above min age → Task claimed successfully
- ✓ No requirement set → All users can claim

**Combined:**
- ✓ Both requirements validated in order (karma first, then age)
- ✓ Stops at first failure and returns that error
- ✓ Only claims when both pass

---

## Code References

**Discord Notifications:**
- File: `lib/discord.ts`
- Endpoint: `POST /api/send-notification`

**Karma/Age Claims:**
- File: `app/api/claim-task/route.ts`
- Lines: 265-289
- Database: `profiles` table (reddit_karma, reddit_account_age_days)
- Database: `tasks` table (min_karma, min_account_age_days)

