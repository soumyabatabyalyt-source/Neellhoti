"use client"

import { useEffect, useState } from "react"

type Withdrawal = {
  id: string
  user_id: string
  amount: number
  status: string
  created_at: string
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ FETCH WITHDRAWALS
  useEffect(() => {
    async function fetchWithdrawals() {
      try {
        const res = await fetch("/api/manager/withdrawals")
        const data = await res.json()
        setWithdrawals(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchWithdrawals()
  }, [])

  // ✅ THIS IS THE FUNCTION YOU ASKED ABOUT
  async function handleAction(id: string, action: "approve" | "reject") {
    try {
      const res = await fetch("/api/manager/withdrawals/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, action }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      // ✅ remove updated withdrawal from UI
      setWithdrawals(prev => prev.filter(w => w.id !== id))

      alert(`Withdrawal ${action}d successfully`)
    } catch (err) {
      console.error("ACTION ERROR:", err)
      alert("Action failed")
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Withdrawals</h1>

      {withdrawals.length === 0 && <p>No withdrawals</p>}

      {withdrawals.map(w => (
        <div key={w.id} className="border p-4 rounded mb-4">
          <p>User: {w.user_id}</p>
          <p>Amount: ₹{w.amount}</p>
          <p>Status: {w.status}</p>
          <p>{new Date(w.created_at).toLocaleString()}</p>

          {w.status === "pending" && (
            <div className="mt-2 space-x-2">
              <button
                onClick={() => handleAction(w.id, "approve")}
                className="bg-green-500 px-3 py-1 text-white rounded"
              >
                Approve
              </button>

              <button
                onClick={() => handleAction(w.id, "reject")}
                className="bg-red-500 px-3 py-1 text-white rounded"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}