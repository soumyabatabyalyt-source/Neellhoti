import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getUserRole } from "@/lib/getUserRole"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid user" }, { status: 401 })
    }

    // 🔥 ROLE CHECK
    const role = await getUserRole(user.id)

    if (role !== "admin" && role !== "manager") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { task_id, action } = body

    // 🔥 GET TASK
    const { data: task } = await supabase
      .from("tasks")
      .select("*")
      .eq("task_id", task_id)
      .single()

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      )
    }

    const userId = task.claimed_by
    const reward = Number(task.reward || 0)

    if (action === "approved") {
      const { data: wallet } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle()

      if (!wallet) {
        await supabase.from("wallets").insert({
          user_id: userId,
          balance: reward,
        })
      } else {
        await supabase
          .from("wallets")
          .update({
            balance: Number(wallet.balance || 0) + reward,
          })
          .eq("user_id", userId)
      }

      await supabase.from("earnings").insert({
        user_id: userId,
        task_id,
        amount: reward,
      })
    }

    await supabase
      .from("tasks")
      .update({ status: action })
      .eq("task_id", task_id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}