import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { id, action } = await req.json()

  const status = action === "approve" ? "approved" : "rejected"

  // Fetch the withdrawal to get user_id and amount_credits
  const { data: withdrawal, error: fetchError } = await supabase
    .from("withdrawals")
    .select("user_id, amount_credits, status")
    .eq("id", id)
    .single()

  if (fetchError || !withdrawal) {
    return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 })
  }

  if (withdrawal.status !== "pending") {
    return NextResponse.json({ error: "Already processed" }, { status: 400 })
  }

  // If approving: deduct balance_credits from wallet (available balance → 0 if full withdrawal)
  if (action === "approve") {
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("balance_credits")
      .eq("user_id", withdrawal.user_id)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    const newBalance = Math.max(0, Number(wallet.balance_credits) - Number(withdrawal.amount_credits))

    const { error: deductError } = await supabase
      .from("wallets")
      .update({
        balance_credits: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", withdrawal.user_id)

    if (deductError) {
      return NextResponse.json({ error: deductError.message }, { status: 500 })
    }
  }

  // Update withdrawal status
  const { error } = await supabase
    .from("withdrawals")
    .update({ status })
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}