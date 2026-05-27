-- Migration: Ensure reward column is numeric(10,2) for decimal support
-- Date: 2026-05-27
-- Purpose: Support decimal reward values (0.15, 0.4, etc) instead of integers only
-- Note: reward column should already be numeric type

-- Verify reward column is numeric type (already should be)
-- If needed, uncomment the line below to convert:
-- ALTER TABLE public.tasks
-- ALTER COLUMN reward TYPE numeric(10,2);

ALTER TABLE public.tasks
ALTER COLUMN reward SET DEFAULT 0;

COMMENT ON COLUMN public.tasks.reward
IS 'Reward amount in USD for completing the task - supports decimal values (e.g., 0.15, 0.50, 100.00)';
