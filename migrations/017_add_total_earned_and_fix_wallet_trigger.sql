-- Migration: Add total_earned_credits to wallets and fix trigger
-- Date: 2026-05-27
-- Purpose: Track cumulative earnings separately from spendable balance.
--   balance_credits      = spendable now (goes up on approval, down on withdrawal approval)
--   total_earned_credits = lifetime total (only ever goes up, never decremented)

ALTER TABLE public.wallets
ADD COLUMN IF NOT EXISTS total_earned_credits NUMERIC DEFAULT 0;

-- Backfill from approved task_claims
UPDATE public.wallets w
SET total_earned_credits = COALESCE((
  SELECT SUM(FLOOR(t.reward * 100))
  FROM public.task_claims tc
  JOIN public.tasks t ON t.id = tc.task_id
  WHERE tc.user_id = w.user_id
    AND tc.status = 'approved'
    AND t.reward > 0
), 0);

-- Fix any rows where balance_credits somehow exceeded total_earned (bad legacy data)
UPDATE public.wallets
SET balance_credits = total_earned_credits
WHERE balance_credits > total_earned_credits;

-- Drop and recreate trigger + function
DROP TRIGGER IF EXISTS fn_credit_reward_on_approval_trigger ON public.tasks;
DROP FUNCTION IF EXISTS public.fn_credit_reward_on_approval();

CREATE OR REPLACE FUNCTION public.fn_credit_reward_on_approval()
RETURNS TRIGGER AS $$
DECLARE
  v_reward_credits NUMERIC;
  v_user_id        UUID;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status <> 'approved') THEN

    v_reward_credits := FLOOR(COALESCE(NEW.reward, 0) * 100);

    SELECT user_id INTO v_user_id
    FROM public.task_claims
    WHERE task_id = NEW.id
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_user_id IS NOT NULL AND v_reward_credits > 0 THEN

      INSERT INTO public.wallets (user_id, balance_credits, total_earned_credits)
      VALUES (v_user_id, 0, 0)
      ON CONFLICT (user_id) DO NOTHING;

      UPDATE public.wallets
      SET
        balance_credits      = balance_credits + v_reward_credits,
        total_earned_credits = total_earned_credits + v_reward_credits,
        updated_at           = NOW()
      WHERE user_id = v_user_id;

    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.fn_credit_reward_on_approval() TO authenticated;

CREATE TRIGGER fn_credit_reward_on_approval_trigger
AFTER UPDATE ON public.tasks
FOR EACH ROW
WHEN (NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status <> 'approved'))
EXECUTE FUNCTION public.fn_credit_reward_on_approval();
