import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    // ✅ get ALL withdrawals first
    const { data, error } = await supabase
      .from("withdrawals")
      .select("*")
      .order("created_at", { ascending: false })

    console.log("WITHDRAWALS API DATA:", data)

    if (error) {
      console.log("API ERROR:", error)

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // ✅ manually filter pending
    const pending =
      data?.filter(
        (w) =>
          w.status?.trim()?.toLowerCase() === "pending"
      ) || []

    console.log("PENDING:", pending)

    return NextResponse.json(pending)

  } catch (err: any) {

    console.log("SERVER ERROR:", err)

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}