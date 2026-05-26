-- Migration: Add triggers to sync task_submissions and tasks status
-- Date: 2026-05-24
-- Purpose: When task_submissions status changes, automatically update tasks table status

-- Create function to update tasks table when task_submissions is updated
CREATE OR REPLACE FUNCTION public.sync_task_submission_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the corresponding task's status based on submission status
  UPDATE public.tasks
  SET
    status = CASE
      WHEN NEW.status = 'approved' THEN 'approved'
      WHEN NEW.status = 'rejected' THEN 'rejected'
      ELSE status
    END,
    approval_status = NEW.status,
    rejection_reason = NEW.rejection_reason
  WHERE id = NEW.task_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_task_submission_status_trigger ON public.task_submissions;

-- Create trigger that fires after update on task_submissions
CREATE TRIGGER sync_task_submission_status_trigger
AFTER UPDATE ON public.task_submissions
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public