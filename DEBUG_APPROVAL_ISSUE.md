# 🔍 DEBUG: Approval Still Not Working

Since migration succeeded but approval is failing, we need to find the exact error.

## Step 1: Get the Error Message

### In Your Browser:
1. Open `/manager/submissions`
2. Press `F12` (Developer Tools)
3. Go to **Console** tab
4. Click **Approve** on a submission
5. **Look for RED ERROR messages** in console
6. **Copy the ENTIRE error message**

### In Server Logs:
1. If running Next.js locally: check terminal where `npm run dev` is running
2. Look for `[REVIEW-TASK]` messages
3. Copy any error lines

---

## Possible Errors & Solutions

### Error: "Cannot read property 'user_id' of null"

**Cause**: The submission doesn't have user_id populated

**Fix**: Check task_submissions table - ensure user_id is filled

```sql
SELECT id, task_id, user_id, claim_id
FROM task_submissions
LIMIT 5;
```

---

### Error: "Constraint violation" or "Check constraint"

**Cause**: Status constraint still has issues

**Check**: Run this in Supabase:
```sql
SELECT check_clause
FROM information_schema.check_constraints
WHERE table_name = 'tasks' AND constraint_name LIKE '%status%';
```

Should show: `'draft', 'open', 'available', 'claimed', 'completed', 'expired', 'rejected', 'approved', 'pending_review'`

---

### Error: "new row violates check constraint"

**Same as above** - Status constraint wasn't properly updated

**Solution**: Run this in Supabase SQL Editor:

```sql
ALTER TABLE public.tasks
DROP CONSTRAINT IF EXISTS tasks_status_check;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_status_check
CHECK (status IN ('draft', 'open', 'available', 'claimed', 'completed', 'expired', 'rejected', 'approved', 'pending_review'));
```

---

### Error: "permission denied" or "RLS policy"

**Cause**: Manager can't update task_submissions or tasks

**Check**: Look at review-task route - line 59 should update tasks table

**Fix**: Verify RLS policy allows managers to update:

```sql
-- Check existing policy
SELECT policy_name, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'tasks'
AND policy_name LIKE '%manager%';
```

---

### Error: "trigger" or "function"

**Cause**: Wallet credit trigger has an issue

**Check**: Look in Supabase SQL Editor at the function definition:

```sql
SELECT pg_get_functiondef(p.oid)
FROM pg_proc p
WHERE p.proname = 'fn_credit_reward_on_approval'
AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
```

---

## Step 2: Check Review-Task Logs

The review-task API logs show what happens:

```typescript
console.log("[REVIEW-TASK] Request received")
console.log("[REVIEW-TASK] Token verified")
console.log("[REVIEW-TASK] Body parsed", { claim_id, action, rejectionReason })
console.log("[REVIEW-TASK] Submission status updated to:", action)
console.log("[REVIEW-TASK] Task status updated to:", action)
console.log("[REVIEW-TASK] Task reward - dollars:", task.reward, "credits:", task.reward_credits)
```

**Which log line appears before the error?**

---

## Step 3: Database State Check

Run these in Supabase to see current state:

### Check task_submissions table:
```sql
SELECT id, task_id, user_id, claim_id, status
FROM task_submissions
ORDER BY created_at DESC
LIMIT 5;
```

### Check tasks table:
```sql
SELECT id, status, reward, reward_credits, claimed_by
FROM tasks
ORDER BY updated_at DESC
LIMIT 5;
```

### Check wallets table:
```sql
SELECT user_id, balance, total_earned
FROM wallets
ORDER BY updated_at DESC
LIMIT 5;
```

---

## What to Report Back

Send me:

1. **The exact error message** from browser console
2. **Which [REVIEW-TASK] log line** appears last before error
3. **Browser console error stack trace** (if available)
4. **Results from the 3 database checks above**

---

## Quick Checklist

- [ ] Migration showed "Success" in Supabase ✅
- [ ] Can you see submissions in `/manager/submissions`?
- [ ] Did you click "Approve" button?
- [ ] Does error appear in browser console (F12)?
- [ ] Are there logs in your server terminal?

---

## Most Likely Issues

**#1 (60% chance)**: Status constraint still broken
- Check: Does the constraint include 'approved'?
- Fix: Re-run the constraint fix SQL

**#2 (20% chance)**: Wallet doesn't exist for user
- Check: Does wallets table have entry for this user?
- Fix: Create wallet first

**#3 (15% chance)**: RLS policy blocks update
- Check: Is user a manager?
- Fix: Check manager role in profiles