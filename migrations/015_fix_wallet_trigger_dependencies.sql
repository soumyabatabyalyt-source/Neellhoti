-- Migration: Fix wallet credit trigger - safely drop all dependencies
-- Date: 2026-05-27
-- Purpose: Drop all triggers using fn_credit_reward_on_approval, then update the function with proper implementation

-- Drop all triggers that depend on fn_credit_reward_on_approval function
DROP TRIGGER IF EXISTS fn_credit_reward_on_approval_trigger ON public.tasks;
DROP TRIGGER IF EXISTS trg_credit_on_approval ON public.tasks;
DROP TRIGGER IF EXISTS trg_credit_on_approval ON public.task_submissions;
DROP TRIGGER IF EXISTS fn_credit_reward_on_approval_trigger ON public.task_submissions;

-- Now safe to drop the function
DROP FUNCTION IF EXISTS public.fn_credit_reward_on_approval();

-- Create improved function that gets user_id from task_claims
CREATE OR REPLACE FUNCTION public.fn_credit_reward_on_approval()
RETURNS TRIGGER AS $$
DECLARE
  v_reward_amount NUMERIC;
  v_reward_credits NUMERIC;
  v_user_id UUID;
  v_wallet_exists BOOLEAN;
  v_claim_id UUID;
BEGIN
  -- Only process when status changes TO 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN

    -- Get the reward amount (use reward field, convert to credits if needed)
    v_reward_amount := COALESCE(NEW.reward, 0);

    -- Calculate reward_credits: 1 credit = $0.01, so $0.50 = 50 credits
    v_reward_credits := FLOOR(v_reward_amount * 100);

    -- Get user_id from task_claims table using the task id
    -- Find the most recent claim for this task that's not expired
    SELECT user_id INTO v_user_id
    FROM public.task_claims
    WHERE task_id = NEW.id
    ORDER BY created_at DESC
    LIMIT 1;

    -- Only proceed if we have valid data and reward is positive
    IF v_user_id IS NOT NULL AND v_reward_credits > 0 THEN

      -- Check if wallet exists for this user
      SELECT EXISTS(SELECT 1 FROM public.wallets WHERE user_id = v_user_id)
      INTO v_wallet_exists;

      -- Create wallet if it doesn't exist
      IF NOT v_wallet_exists THEN
        INSERT INTO public.wallets (user_id, balance, total_earned)
        VALUES (v_user_id, 0, 0)
        ON CONFLICT (user_id) DO NOTHING;
      END IF;

      -- Credit the wallet with the reward
      UPDATE public.wallets
      SET
        balance = balance + v_reward_credits,
        total_earned = total_earned + v_reward_credits,
        updated_at = NOW()
      WHERE user_id = v_user_id;

      -- Log the credit (visible in Supabase function logs)
      RAISE NOTICE 'Credited % credits (USD %.2f) to user % for task %', v_reward_credits, v_reward_amount, v_user_id, NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.fn_credit_reward_on_approval() TO authenticated;

-- Create new trigger on tasks table (fires after update)
CREATE TRIGGER fn_credit_reward_on_approval_trigger
AFTER UPDATE ON public.tasks
FOR EACH ROW
WHEN (NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved'))
EXECUTE FUNCTION public.fn_credit_reward_on_approval();

-- Ensure tables have necessary columns
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS reward NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS reward_credits NUMERIC DEFAULT 0;

-- Ensure wallets table is properly configured
ALTER TABLE public.wallets
DROP CONSTRAINT IF EXISTS wallets_user_id_unique;

ALTER TABLE public.wallets
ADD CONSTRAINT wallets_user_id_unique UNIQUE (user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_claims_task_id ON public.task_claims(task_id);
CREATE INDEX IF NOT EXISTS idx_task_claims_user_id ON public.task_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_reward ON public.tasks(reward);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
