-- Migration: Add trigger to credit wallet when task is approved
-- Date: 2026-05-24
-- Purpose: Automatically credit user wallet with reward_credits when task approval is processed

-- CRITICAL FIX: Update tasks status constraint to include 'approved' and 'pending_review'
-- These statuses were missing and causing constraint violations
ALTER TABLE public.tasks
DROP CONSTRAINT IF EXISTS tasks_status_check;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_status_check
CHECK (status IN ('draft', 'open', 'available', 'claimed', 'completed', 'expired', 'rejected', 'approved', 'pending_review'));

-- Create function to credit wallet on task approval
CREATE OR REPLACE FUNCTION public.fn_credit_reward_on_approval()
RETURNS TRIGGER AS $$
DECLARE
  v_reward_credits NUMERIC;
  v_user_id UUID;
  v_wallet_exists BOOLEAN;
BEGIN
  -- Only process when status changes TO 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN

    -- Get the reward_credits and user_id from the task
    SELECT reward_credits, claimed_by
    INTO v_reward_credits, v_user_id
    FROM public.tasks
    WHERE id = NEW.id;

    -- Only proceed if we have valid data
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

      -- Log the credit
      RAISE NOTICE 'Credited % credits to user %', v_reward_credits, v_user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.fn_credit_reward_on_approval() TO authenticated;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS fn_credit_reward_on_approval_trigger ON public.tasks;

-- Create trigger that fires after task status is updated to 'approved'
CREATE TRIGGER fn_credit_reward_on_approval_trigger
AFTER UPDATE ON public.tasks
FOR EACH ROW
WHEN (NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved'))
EXECUTE FUNCTION public.fn_credit_reward_on_approval();

-- Ensure wallets table is properly configured
-- Add unique constraint on user_id (one wallet per user)
-- Drop first if it exists
ALTER TABLE public.wallets
DROP CONSTRAINT IF EXISTS wallets_user_id_unique;

ALTER TABLE public.wallets
ADD CONSTRAINT wallets_user_id_unique UNIQUE (user_id);

-- Add reward_credits column if it doesn't exist
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS reward_credits NUMERIC DEFAULT 0;

-- Update existing tasks: convert reward to reward_credits (1 credit = $0.01)
-- So $0.50 = 50 credits
UPDATE public.tasks
SET reward_credits = FLOOR(CAST(reward AS numeric) * 100)
WHERE reward > 0 AND reward_credits = 0;

-- Create index on reward_credits for performance
CREATE INDEX IF NOT EXISTS idx_tasks_reward_credits
ON public.tasks(reward_credits)
WHERE reward_credits > 0;
