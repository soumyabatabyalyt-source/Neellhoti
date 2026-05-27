import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
  try {
    const { withdrawal_id } = await req.json()

    // 🔹 Get withdrawal
    const { data: withdrawal } = await supabaseAdmin
      .from("withdrawals")
      .select("*")
      .eq("id", withdrawal_id)
      .single()

    if (!withdrawal) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }

    if (withdrawal.status !== "pending") {
      return Response.json({ error: "Already processed" }, { status: 400 })
    }

    // 🔹 Deduct wallet (correct column: balance_credits)
    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("balance_credits")
      .eq("user_id", withdrawal.user_id)
      .single()

    if (!wallet || wallet.balance_credits < withdrawal.amount_credits) {
      return Response.json({ error: "Invalid balance" }, { status: 400 })
    }

    await supabaseAdmin
      .from("wallets")
      .update({
        balance_credits: wallet.balance_credits - withdrawal.amount_credits,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", withdrawal.user_id)

    // 🔹 Mark approved
    await supabaseAdmin
      .from("withdrawals")
      .update({ status: "approved" })
      .eq("id", withdrawal_id)

    return Response.json({ success: true })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Server error" }, { status: 500 })
  }
}