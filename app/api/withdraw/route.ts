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
      amount
    } = body

    // ✅ validate input
    if (!user_id || !amount) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      )
    }

    // ✅ get wallet
    const { data: wallet, error: walletError } =
      await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user_id)
        .single()

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      )
    }

    // ✅ prevent invalid amount
    if (Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      )
    }

    // ✅ BALANCE CHECK
    if (Number(wallet.balance) < Number(amount)) {
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
    const { data, error } = await supabase
      .from("withdrawals")
      .insert({
        user_id,
        amount,
        status: "pending"
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