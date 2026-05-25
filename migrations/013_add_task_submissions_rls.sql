-- Migration: Add RLS policies for task_submissions table
-- Date: 2026-05-24
-- Purpose: Allow managers to read all submissions, users to read their own

-- Enable RLS on task_submissions table
ALTER TABLE public.task_submissions
ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS managers_read_all_submissions ON public.task_submissions;
DROP POLICY IF EXISTS users_read_own_submissions ON public.task_submissions;

-- Manager policy: Managers can read all submissions
CREATE POLICY managers_read_all_submissions
ON public.task_submissions
FOR SELECT
TO authenticated
USING (public.is_pipeline_manager());

-- User policy: Users can read their own submissions
CREATE POLICY users_read_own_submissions
ON public.task_submissions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
