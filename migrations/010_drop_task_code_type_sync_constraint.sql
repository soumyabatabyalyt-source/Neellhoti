-- Migration: Drop problematic task_code_type_sync constraint
-- Date: 2026-05-24
-- Purpose: Fix task creation failure - constraint is too restrictive for manual task creation

-- Drop the constraint that's blocking task creation
ALTER TABLE public.tasks
DROP CONSTRAINT IF EXISTS chk_task_code_type_sync;
