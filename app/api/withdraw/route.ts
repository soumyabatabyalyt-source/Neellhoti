import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      user_id,
      amount,
      method,
      upi_id,
      crypto_address,
    } = body

    // ✅ validate input
    if (!user_id || !amount) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      )
    }

    // ✅ prevent invalid amount
    if (Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      )
    }

    // amount from frontend is in dollars; DB stores credits (1 credit = $0.01)
    const amountCredits = Math.round(Number(amount) * 100)

    // ✅ get wallet (correct column: balance_credits)
    const { data: wallet, error: walletError } =
      await supabase
        .from("wallets")
        .select("balance_credits")
        .eq("user_id", user_id)
        .single()

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      )
    }

    // ✅ BALANCE CHECK (compare credits to credits)
    if (Number(wallet.balance_credits) < amountCredits) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      )
    }

    // ✅ prevent duplicate pending withdrawals
    const { data: existing } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("user_id", user_id)
      .eq("status", "pending")

    if (existing && existing.length > 0) {
      return NextResponse.json(
        {
          error:
            "You already have a pending withdrawal"
        },
        { status: 400 }
      )
    }

    // ✅ create withdrawal request
    // DB columns: amount_credits, upi_id, note (for crypto address)
    const { data, error } = await supabase
      .from("withdrawals")
      .insert({
        user_id,
        amount_credits: amountCredits,
        status: "pending",
        upi_id: method === "upi" ? upi_id : null,
        note: method === "crypto" ? crypto_address : null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      withdrawal: data
    })

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}