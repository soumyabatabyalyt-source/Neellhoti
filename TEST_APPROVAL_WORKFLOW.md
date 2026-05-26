# 🧪 TEST APPROVAL WORKFLOW - Verify Migration Success

## Quick Test (5 minutes)

### Step 1: Create a Test Task (if you don't have one)

Go to `/manager/tasks/create` and:
1. Enter title: "Test Task"
2. Enter reward: `0.50` (should be 50 credits)
3. Click "Create Task"

### Step 2: Publish the Task

Go to `/manager/draft-tasks`:
1. Find "Test Task"
2. Click "Publish"
3. Task should appear in `/dashboard/tasks`

### Step 3: Claim the Task

Login as a regular user (not manager):
1. Go to `/dashboard/tasks`
2. Click "Claim" on "Test Task"
3. Task should move to `/dashboard/my-tasks` as "Active"

### Step 4: Submit the Task

1. Still in `/dashboard/my-tasks`
2. Click "Submit"
3. Add a dummy link (e.g., `https://reddit.com/test`)
4. Click "Submit Task"
5. Task should move to "Pending" section

### Step 5: Manager Approves (THE TEST)

Login as manager:
1. Go to `/manager/submissions`
2. Click "Approve" on "Test Task"
3. **WATCH WHAT HAPPENS:**
   - ✅ **Should succeed** (no 500 error)
   - ✅ **Status changes to "Approved"**
   - ✅ **User's wallet balance increases by 50 credits**

---

## What to Check for Success

### If Migration Worked:

```
Manager clicks "Approve"
  ↓
✅ No error
  ↓
✅ Status changes to "approved" in manager submissions
  ↓
✅ User sees wallet balance increased by 50 credits
  ↓
🎉 MIGRATION SUCCESSFUL
```

### If Migration Failed:

```
Manager clicks "Approve"
  ↓
❌ Error message appears
  ↓
Check the error:
- "constraint tasks_status_check" → Migration didn't apply correctly
- Something else → Different issue
```

---

## Verification Queries (Optional - in Supabase)

Run these in Supabase SQL Editor to verify:

### Check 1: Status Constraint Fixed
```sql
SELECT check_clause
FROM information_schema.check_constraints
WHERE table_name = 'tasks' AND constraint_name LIKE '%status%'
LIMIT 1;

-- Should show: 'approved' in the list
```

### Check 2: Trigger Function Exists
```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'fn_credit_reward_on_approval'
AND routine_schema = 'public';

-- Should show: fn_credit_reward_on_approval | FUNCTION
```

### Check 3: Trigger Exists
```sql
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'fn_credit_reward_on_approval_trigger'
AND trigger_schema = 'public';

-- Should show: fn_credit_reward_on_approval_trigger | UPDATE
```

### Check 4: Wallet Was Credited
```sql
SELECT user_id, balance, total_earned
FROM public.wallets
ORDER BY updated_at DESC
LIMIT 5;

-- Should show recent wallet with increased balance
```

---

## Expected Results

| Component | Before | After |
|-----------|--------|-------|
| Click Approve | ❌ Error/Hangs | ✅ Works |
| Task Status | ❌ Stays pending | ✅ Changes to approved |
| Wallet Balance | ❌ Stays 0 | ✅ Increases by reward_credits |
| User Sees Credits | ❌ No | ✅ Yes |

---

## Troubleshooting

### Problem: Still getting error on Approve

**Check 1**: Did Supabase show "Success" when you ran the migration?
- If NO → Run the migration again
- If YES → Check browser console for the actual error

**Check 2**: What's the error message?
```
Error: "constraint tasks_status_check"
  → Migration didn't fully apply
  → Run migration again

Error: "Something else"
  → Different issue, send me the full error
```

### Problem: Status changes but wallet doesn't update

This means:
- ✅ Status constraint is fixed (migration partially worked)
- ❌ Wallet trigger isn't firing (migration partially failed)

Solution: Run the migration again (might have stopped mid-way)

### Problem: Can't find the task to test

**If you have no submissions:**
1. Go to `/manager/submissions`
2. Is the list empty?
3. Then create and submit a task first (follow steps 1-4 above)

---

## Timeline

```
Now: Run migration in Supabase
  ↓
1 min: Follow test steps 1-5
  ↓
5 min: Click "Approve" and watch
  ↓
Result: Success or error
  ↓
Send me the result!
```

---

## Report Back With:

1. ✅/❌ Did migration show "Success" in Supabase?
2. ✅/❌ Does clicking "Approve" work without error?
3. ✅/❌ Does task status change to "approved"?
4. ✅/❌ Does user wallet balance