"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function ReviewActions({
  claimId,
  onReviewed,
}: {
  claimId: string
  onReviewed?: () => void
}) {
  const [reviewing, setReviewing] = useState<"approved" | "rejected" | null>(null)

  async function review(action: "approved" | "rejected") {
    setReviewing(action)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      alert("Login required")
      setReviewing(null)
      return
    }

    const res = await fetch("/api/review-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ claim_id: claimId, action }),
    })

    const payload = await res.json()
    setReviewing(null)

    if (!res.ok) {
      alert(payload.error || "Review failed")
      return
    }

    onReviewed?.()
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => review("approved")}
        disabled={reviewing !== null}
        className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {reviewing === "approved" ? "Approving..." : "Approve"}
      </button>
      <button
        onClick={() => review("rejected")}
        disabled={reviewing !== null}
        className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {reviewing === "rejected" ? "Rejecting..." : "Reject"}
      </button>
    </div>
  )
}
