import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const response = await supabase.from("test").select("*");

  console.log("SUPABASE RESPONSE:", response); // 👈 add this

  return (
    <div>
      <h1>Supabase Test</h1>
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
}