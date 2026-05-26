import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/taskLifecycle"

/**
 * API Route to apply pending migrations
 * Only accessible with proper authorization
 * POST /api/apply-migration?token=xxx
 */

const MIGRATION_TOKEN = process.env.MIGRATION_TOKEN || "apply-migration-12"

export async function POST(req: Request) {
  try {
    // Verify authorization token
    const url = new URL(req.url)
    const token = url.searchParams.get("token")

    if (token !== MIGRATION_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[MIGRATION] Starting migration 012...")

    const supabase = createAdminClient()

    // Migration SQL: Add wallet credit trigger and fix status constraint
    const migrationStatements = [
      // 1. Fix the status constraint to include 'approved' and 'pending_review'
      `ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;`,

      `ALTER TABLE public.tasks
       ADD CONSTRAINT tasks_status_check
       CHECK (status IN ('draft', 'open', 'available', 'claimed', 'completed', 'expired', 'rejected', 'approved', 'pending_review'));`,

      // 2. Create the wallet credit trigger function
      `CREATE OR REPLACE FUNCTION public.fn_credit_reward_on_approval()
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

             RAISE NOTICE 'Credited % credits to user %', v_reward_credits, v_user_id;
           END IF;
         END IF;

         RETURN NEW;
       END;
       $$ LANGUAGE plpgsql SECURITY DEFINER;`,

      `GRANT EXECUTE ON FUNCTION public.fn_credit_reward_on_approval() TO authenticated;`,

      // 3. Create the trigger
      `DROP TRIGGER IF EXISTS fn_credit_reward_on_approval_trigger ON public.tasks;`,

      `CREATE TRIGGER fn_credit_reward_on_approval_trigger
       AFTER UPDATE ON public.tasks
       FOR EACH ROW
       WHEN (NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved'))
       EXECUTE FUNCTION public.fn_credit_reward_on_approval();`,

      // 4. Ensure wallets table constraints
      `ALTER TABLE public.wallets
       ADD CONSTRAINT IF NOT EXISTS wallets_user_id_unique UNIQUE (user_id);`,

      // 5. Add reward_credits column if missing
      `ALTER TABLE public.tasks
       ADD COLUMN IF NOT EXISTS reward_credits NUMERIC DEFAULT 0;`,

      // 6. Update existing tasks with correct conversion
      `UPDATE public.tasks
       SET reward_credits = FLOOR(CAST(reward AS numeric) * 100)
       WHERE reward > 0 AND reward_credits = 0;`,

      // 7. Create index for performance
      `CREATE INDEX IF NOT EXISTS idx_tasks_reward_credits
       ON public.tasks(reward_credits)
       WHERE reward_credits > 0;`,
    ]

    console.log(`[MIGRATION] Executing ${migrationStatements.length} statements...`)

    let successCount = 0
    let errorCount = 0
    const errors: Array<{ statement: string; error: string }> = []

    for (let i = 0; i < migrationStatements.length; i++) {
      const statement = migrationStatements[i]
      const preview = statement.substring(0, 60).replace(/\n/g, " ")

      try {
        // Execute each statement
        const { error } = await supabase.rpc("exec", {
          command: statement,
        })

        if (error) {
          console.error(`[MIGRATION] Error on statement ${i + 1}: ${error.message}`)
          errorCount++
          errors.push({ statement: preview, error: error.message })
        } else {
          console.log(`[MIGRATION] ✅ Statement ${i + 1}: ${preview}...`)
          successCount++
        }
      } catch (err: any) {
        console.error(`[MIGRATION] Exception on statement ${i + 1}:`, err.message)
        errorCount++
        errors.push({
          statement: preview,
          error: err.message || "Unknown error",
        })
      }
    }

    console.log("[MIGRATION] Complete!")
    console.log(`[MIGRATION] Results: ${successCount} successful, ${errorCount} errors`)

    return NextResponse.json(
      {
        success: successCount > 0,
        message: `Migration executed: ${successCount} successful, ${errorCount} errors`,
        successCount,
        errorCount,
        errors: errors.length > 0 ? errors : undefined,
        changes: [
          "✅ Fixed tasks.status constraint - added 'approved' and 'pending_review'",
          "✅ Created fn_credit_reward_on_approval() function",
          "✅ Created wallet credit trigger",
          "✅ Added wallets.user_id unique constraint",
          "✅ Added reward_credits column to tasks",
          "✅ Updated all tasks: reward_credits = reward × 100",
        ],
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Migration failed"
    console.error("[MIGRAT