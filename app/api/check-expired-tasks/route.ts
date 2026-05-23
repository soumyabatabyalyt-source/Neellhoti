import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {

  try {

    const now = new Date().toISOString()

    // find expired active claims
    const { data: claims, error } =
      await supabase
        .from("task_claims")
        .select("*")
        .eq("status", "active")
        .lt("expires_at", now)

    if (error) {
      throw error
    }

    if (!claims || claims.length === 0) {

      return NextResponse.json({
        success: true,
        expired: 0,
      })
    }

    // mark expired
    for (const claim of claims) {

      await supabase
        .from("task_claims")
        .update({
          status: "expired",
        })
        .eq("id", claim.id)
    }

    return NextResponse.json({
      success: true,
      expired: claims.length,
    })

  } catch (err: any) {

    return NextResponse.json(
      {
        error: err.message,
      },
      {
        status: 500,
      }
    )
  }
}