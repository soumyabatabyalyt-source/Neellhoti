# 🔴 CRITICAL: Approval Trigger Failure - Root Cause & Fix

## The Problem

When you click "Approve" on task submissions, the approval is failing. The root cause is **TWO MISSING COMPONENTS**:

### Issue #1: Status Constraint Blocks 'approved' Status ❌
**File**: `migrations/008_fix_status_constraint.sql`
**Problem**: The constraint only allows these statuses:
```sql
CHECK (status IN ('draft', 'open', 'available', 'claimed', 'completed', 'expired', 'rejected'))
```
**Missing**: `'approved'` and `'pending_review'`

When the sync trigger tries to update task status to 'approved', **PostgreSQL rejects it with a CHECK constraint violation**.

### Issue #2: Wallet Crediting Trigger Doesn't Exist ❌
**Problem**: No trigger exists to credit the wallet when a task is approved.
- The review-task API logs "The trigger fn_credit_reward_on_approval should handle wallet credit"
- But this trigger was **never created**
- Even if it had been, the status constraint violation prevents the trigger from ever firing

---

## The Fix

A new migration has been created: **`migrations/012_add_wallet_credit_trigger.sql`**

This migration does THREE things:

### 1. ✅ FIX STATUS CONSTRAINT
Adds missing statuses to the check constraint:
```sql
CHECK (status IN ('draft', 'open', 'available', 'claimed', 'completed', 'expired', 'rejected', 'approved', 'pending_review'))
```

### 2. ✅ CREATE WALLET CREDIT TRIGGER
Creates function `fn_credit_reward_on_approval()` that:
- Fires when task.status changes to 'approved'
- Gets the `reward_credits` amount from the task
- Gets the `claimed_by` (user_id) from the task
- Creates wallet if it doesn't exist
- **Adds `reward_credits` to wallet.balance**
- **Adds `reward_credits` to wallet.total_earned**

### 3. ✅ ENSURE WALLET STRUCTURE
- Adds unique constraint on `wallets.user_id` (one wallet per user)
- Adds `reward_credits` column to tasks if missing
- Updates all existing tasks with correct conversion: **reward_credits = reward × 100**
  - Example: $0.50 → 50 credits (1 credit = $0.01)

---

## The Conversion Rate (Why × 100)

**User confirmed**: "0.01 reward credits is equal to 0.01$"

Therefore:
- 1 credit = $0.01
- $0.50 = 50 credits
- $1.00 = 100 credits
- Formula: `reward_credits = FLOOR(reward * 100)`

---

## How to Apply This Fix

### Step 1: Run the Migration in Supabase
1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire contents of `/migrations/012_add_wallet_credit_trigger.sql`
3. Paste into the SQL Editor
4. Click "Run"
5. ✅ You should see "Success" with no errors

### Step 2: Test the Approval Flow
1. Login as manager
2. Go to `/manager/submissions`
3. Click "Approve" on a submission
4. ✅ Status should change to "approved"
5. ✅ User's wallet should receive the credits

### Step 3: Verify the Wallet Credit
1. Check the user's wallet balance in the database
2. Or go to the dashboard/wallet page to see the balance

---

## What Was Happening Before (The Bug)

```
1. User submits task
   ↓
2. Manager clicks "Approve" on submission
   ↓
3. review-task API updates task_submissions status → 'approved'
   ↓
4. sync_task_submission_status trigger fires
   ↓
5. Tries to update tasks.status → 'approved'
   ↓
6. ❌ CONSTRAINT VIOLATION: 'approved' not in allowed statuses
   ↓
7. Update fails, trigger fails, nothing happens
   ↓
8. User sees error, wallet never credited
```

---

## What Happens After the Fix

```
1. User submits task
   ↓
2. Manager clicks "Approve" on submission
   ↓
3. review-task API updates task_submissions status → 'approved'
   ↓
4. sync_task_submission_status trigger fires
   ↓
5. Updates tasks.status → 'approved' ✅ (constraint allows it now)
   ↓
6. fn_credit_reward_on_approval_trigger fires
   ↓
7. Updates wallets.balance = balance + reward_credits ✅
   ↓
8. User's wallet is credited automatically ✅
```

---

## File Location

**Migration**: `C:\Users\SOUMYA\nillohit\migrations\012_add_wallet_credit_trigger.sql`

---

## Troubleshooting

If you still see errors after applying the migration:

### "Constraint still failing"
→ Make sure you ran migration 012
→ Verify in Supabase: check if `tasks_status_check` constraint includes 'approved'

### "Wallet not updating"
→ Verify trigger exists: SQL Editor → search for `fn_credit_reward_on_approval`
→ Check function exists: `\df fn_credit_reward_on_approval`
→ Check trigger exists: Look at triggers on `tasks` table

### "Function permission denied"
→ Trigger should have `SECURITY DEFINER` set (it does in the migration)
→ This allows it to run with full permissions regardless of RLS policies

---

## Summary of Changes

| Component | Status | Issue | Fix |
|-----------|--------|-------|-----|
| Status Constraint | ❌ BROKEN | Missing 'approved' | ✅ Added in migration 012 |
| Wallet Credit Trigger | ❌ MISSING | Doesn't exist | ✅ Created in migration 012 |
| Conversion Rate | ✅ CORRECT | $0.01 = 1 credit | Already fixed in 011 |
| Reward Credits Column | ✅ EXISTS | Added, being populated | Already fixed in 011 |

---

## Next Steps

1. ✅ Run migration 012 in Supabas