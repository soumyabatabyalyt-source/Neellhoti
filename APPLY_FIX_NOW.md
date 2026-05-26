# 🔥 APPROVAL TRIGGER FIX - APPLY NOW!

## The Problem (Diagnosis Complete)

Your approval trigger is failing because of **TWO missing components**:

### 1. ❌ Status Constraint Missing 'approved'
**File**: `migrations/008_fix_status_constraint.sql`  
**Current allowed statuses**: `'draft', 'open', 'available', 'claimed', 'completed', 'expired', 'rejected'`  
**Missing**: `'approved'`, `'pending_review'`

**What happens**: When you approve a task, PostgreSQL rejects the status update with constraint violation.

### 2. ❌ Wallet Credit Trigger Doesn't Exist
**Function**: `fn_credit_reward_on_approval()`  
**Status**: NEVER CREATED  
**Impact**: Even if status was allowed, wallet wouldn't be credited

---

## ✅ INSTANT FIX (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project: `jbymiopbxtxkfvublfeh`
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**

### Step 2: Paste the Migration SQL
Copy everything below and paste into Supabase SQL Editor:

```sql
-- FIX #1: Update tasks status constraint to include 'approved' and 'pending_review'
ALTER TABLE public.tasks
DROP CONSTRAINT IF EXISTS tasks_status_check;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_status_check
CHECK (status IN ('draft', 'open', 'available', 'claimed', 'completed', 'expired', 'rejected', 'approved', 'pending_review'));

-- FIX #2: Create wallet credit trigger function
CREATE OR REPLACE FUNCTION public.fn_credit_reward_on_approval()
RETURNS TRIGGER AS $$
DECLARE
  v_reward_credits NUMERIC;
  v_user_id UUID;
  v_wallet_exists BOOLEAN;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    SELECT reward_credits, claimed_by
    INTO v_reward_credits, v_user_id
    FROM public.tasks
    WHERE id = NEW.id;

    IF v_user_id IS NOT NULL AND v_reward_credits > 0 THEN
      SELECT EXISTS(SELECT 1 FROM public.wallets WHERE user_id = v_user_id)
      INTO v_wallet_exists;

      IF NOT v_wallet_exists THEN
        INSERT INTO public.wallets (user_id, balance, total_earned)
        VALUES (v_user_id, 0, 0)
        ON CONFLICT (user_id) DO NOTHING;
      END IF;

      UPDATE public.wallets
      SET
        balance = balance + v_reward_credits,
        total_earned = total_earned + v_reward_credits,
        updated_at = NOW()
      WHERE user_id = v_user_id;

      RAISE NOTICE 'Credited % credits to user %', v_reward_credits, v_user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.fn_credit_reward_on_approval() TO authenticated;

-- FIX #3: Create the trigger
DROP TRIGGER IF EXISTS fn_credit_reward_on_approval_trigger ON public.tasks;

CREATE TRIGGER fn_credit_reward_on_approval_trigger
AFTER UPDATE ON public.tasks
FOR EACH ROW
WHEN (NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved'))
EXECUTE FUNCTION public.fn_credit_reward_on_approval();

-- FIX #4: Ensure wallets table is properly configured
ALTER TABLE public.wallets
ADD CONSTRAINT IF NOT EXISTS wallets_user_id_unique UNIQUE (user_id);

-- FIX #5: Ensure reward_credits column exists
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS reward_credits NUMERIC DEFAULT 0;

-- FIX #6: Update all tasks with correct conversion (1 credit = $0.01)
UPDATE public.tasks
SET reward_credits = FLOOR(CAST(reward AS numeric) * 100)
WHERE reward > 0 AND reward_credits = 0;

-- FIX #7: Create performance index
CREATE INDEX IF NOT EXISTS idx_tasks_reward_credits
ON public.tasks(reward_credits)
WHERE reward_credits > 0;
```

### Step 3: Execute
1. Click **Run** button (top right)
2. ✅ You should see "Success" - no errors

### Step 4: Test It Works
1. Go to your app: `/manager/submissions`
2. Click **Approve** on any submission
3. ✅ Status should change to **"approved"** immediately
4. ✅ User's wallet should receive **credits**

---

## What Gets Fixed

| Issue | Before | After |
|-------|--------|-------|
| Task status to 'approved' | ❌ CONSTRAINT VIOLATION | ✅ Works |
| Wallet credit on approval | ❌ Never happens | ✅ Automatic |
| Reward conversion | ✅ $0.50 = 50 credits | ✅ Stays correct |

---

## Verification Checklist

After running the migration:

- [ ] Migration runs without errors
- [ ] Can see "Approve" button works
- [ ] Task status changes to "approved"  
- [ ] Check wallets table - balance increased by reward_credits
- [ ] User can see their updated wallet balance

---

## If You Hit an Error

**"Constraint already exists"** → This is fine, it means the constraint was partially fixed  
**"Function already exists"** → This is fine, it's just updating the function  
**"Trigger already exists"** → This is fine, it's replacing the trigger  

All these are safe operations.

---

## The Conversion Rate (Confirmed)

```
0.01 reward_credits = 0.01 dollars
Therefore:
  $0.50 = 50 credits
  $1.00 = 100 credits
  Formula: reward_credits = reward × 100
```

---

## After the Fix

The flow will work correctly:

```
Manager clicks "Approve"
    ↓
API updates task_submissions status → 'approved'
    ↓
Sync trigger fires (migration 011)
    ↓
Tasks table status → 'approved' ✅
    ↓
Wallet credit trigger fires ✅
    ↓
Wallet balance += reward_credits ✅
    ↓
User sees credits in wa