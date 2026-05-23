"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Button from "@/components/ui/Button"

export default function Wallet({ user }: any) {
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState("")

  useEffect(() => {
    const fetchWallet = async () => {
      const { data } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single()

      setBalance(data?.balance || 0)
    }

    if (user?.id) fetchWallet()
  }, [user])

  const handleWithdraw = async () => {
    if (!amount) return alert("Enter amount")

    await supabase.from("withdrawals").insert({
      user_id: user.id,
      amount: Number(amount),
    })

    alert("Withdraw requested")
    setAmount("")
  }

  return (
    <div>
      <h2>Wallet</h2>
      <h3>Balance: ₹{balance}</h3>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
      />

      <Button variant="warning" onClick={handleWithdraw}>
        Withdraw 💸
      </Button>
    </div>
  )
}