import { createClient } from "@supabase/supabase-js"

export default async function Wallet() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = "af10f1c6-a07f-4ad0-9ab5-93a87d..." // SAME ID

  const { data } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .single()

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Wallet</h1>
      <h2>${data?.balance || 0}</h2>
    </div>
  )
}