-- Migration: Fix sync trigger to properly join task_claims and get task_id
-- Date: 2026-05-27
-- Purpose: The sync_task_submission_status trigger was using NEW.task_id which doesn't exist
--          Now it will get task_id from the related task_claims row using claim_id

-- Drop the broken trigger first
DROP TRIGGER IF EXISTS sync_task_submission_status_trigger ON public.task_submissions;

-- Drop the broken function
DROP FUNCTION IF EXISTS public.sync_task_submission_status();

-- Ensure task_submissions has claim_id column
ALTER TABLE public.task_submissions
ADD COLUMN IF NOT EXISTS claim_id UUID REFERENCES public.task_claims(id);

-- Recreate the function with proper implementation
CREATE FUNCTION public.sync_task_submission_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_task_id UUID;
BEGIN
  -- Get task_id from task_claims using the claim_id relationship
  SELECT tc.task_id
  INTO v_task_id
  FROM public.task_claims tc
  WHERE tc.id = NEW.claim_id;

  -- Only update if we found a task_id
  IF v_task_id IS NOT NULL THEN
    UPDATE public.tasks
    SET
      status = CASE
        WHEN NEW.status = 'approved' THEN 'approved'
        WHEN NEW.status = 'rejected' THEN 'rejected'
        ELSE status
      END,
      approval_status = NEW.status,
      rejection_reason = NEW.rejection_reason
    WHERE id = v_task_id;

    RAISE NOTICE 'Synced task_submissions % to tasks % with status %', NEW.id, v_task_id, NEW.status;
  ELSE
    RAISE WARNING 'No task found for task_submissions % with claim_id %', NEW.id, NEW.claim_id;
  END IF;

  RETURN NEW;
END;
$func$;

-- Recreate the trigger
CREATE TRIGGER sync_task_submission_status_trigger
AFTER UPDATE ON public.task_submissions
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.sync_task_submission_status();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_task_submissions_claim_id ON public.task_submissions(claim_id);
