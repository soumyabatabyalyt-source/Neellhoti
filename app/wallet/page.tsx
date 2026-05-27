"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAndSubscribeWallet() {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) {
        setLoading(false)
        return
      }

      // Initial fetch — balance_credits is the correct column (1 credit = $0.01)
      const { data } = await supabase
        .from("wallets")
        .select("balance_credits")
        .eq("user_id", user.id)
        .single()

      if (data) {
        setBalance(Number(data.balance_credits || 0))
      }

      setLoading(false)

      // Subscribe to real-time updates on the wallets table for this user
      const subscription = supabase
        .channel(`wallets-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "wallets",
            filter: `user_id=eq.${user.id}`,
          },
          (payload: any) => {
            if (payload.new?.balance_credits != null) {
              setBalance(Number(payload.new.balance_credits))
            }
          }
        )
        .subscribe()

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe()
      }
    }

    fetchAndSubscribeWallet()
  }, [])

  async function handleWithdraw() {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) {
      alert("Not logged in")
      return
    }

    if (balance <= 0) {
      alert("No balance to withdraw")
      return
    }

    console.log("Sending withdraw:", {
      user_id: user.id,
      amount: balance,
    })

    const res = await fetch("/api/withdraw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // send amount in dollars (balance_credits / 100)
      body: JSON.stringify({
        user_id: user.id,
        amount: balance / 100,
      }),
    })

    const data = await res.json()

    console.log("Response:", data)

    if (!res.ok) {
      alert(data.error || "Withdraw failed")
      return
    }

    alert("Withdrawal request sent!")

    // Optional: reset UI
    setBalance(0)
  }

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>
  }

  return (
    <div className="p-6 text-white space-y-6">
      <h1 className="text-2xl font-bold">Wallet</h1>

      <div className="border border-white/20 rounded-xl p-6">
        <p className="text-lg">Balance</p>
        <p className="text-3xl font-bold text-emerald-400">${(balance / 100).toFixed(2)}</p>
      </div>

      <button
        onClick={handleWithdraw}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 font-bold"
      >
        Withdraw Balance
      </button>
    </div>
  )
}