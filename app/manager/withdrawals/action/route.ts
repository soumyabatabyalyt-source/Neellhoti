import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { id, action } = await req.json()

    if (!id || !action) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      )
    }

    // ✅ get withdrawal
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("id", id)
      .single()

    if (withdrawalError || !withdrawal) {
      return NextResponse.json(
        { error: "Withdrawal not found" },
        { status: 404 }
      )
    }

    const status = action === "approve"
      ? "approved"
      : "rejected"

    // ✅ approve logic
    if (action === "approve") {

      // get wallet
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", withdrawal.user_id)
        .single()

      if (walletError || !wallet) {
        return NextResponse.json(
          { error: "Wallet not found" },
          { status: 404 }
        )
      }

      // prevent negative balance
      if (wallet.balance < withdrawal.amount) {
        return NextResponse.json(
          { error: "Insufficient wallet balance" },
          { status: 400 }
        )
      }

      // deduct balance
      const newBalance =
        Number(wallet.balance) - Number(withdrawal.amount)

      const { error: updateWalletError } = await supabase
        .from("wallets")
        .update({
          balance: newBalance
        })
        .eq("user_id", withdrawal.user_id)

      if (updateWalletError) {
        return NextResponse.json(
          { error: updateWalletError.message },
          { status: 500 }
        )
      }

      // add transaction
      await supabase
        .from("transactions")
        .insert({
          user_id: withdrawal.user_id,
          type: "withdrawal",
          amount: withdrawal.amount,
          status: "completed"
        })
    }

    // update withdrawal status
    const { error } = await supabase
      .from("withdrawals")
      .update({
        status
      })
      .eq("id", id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true
    })

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}