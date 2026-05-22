"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useTheme } from "@/lib/useTheme"

export default function Callback() {
  const { dark, mounted } = useTheme()
  const router = useRouter()

  useEffect(() => {
    const handle = async () => {
      const { data, error } = await supabase.auth.getSession()

      console.log("SESSION:", data)

      if (error) {
        console.error(error)
        router.push("/auth")
        return
      }

      if (!data.session) {
        router.push("/auth")
        return
      }

      const user = data.session.user
      const email = user.email || ""

      try {
        // Check if profile exists
        const { data: existingProfile, error: profileError } = await supabase
          .from("profiles")
          .select("id, role, approval_status")
          .eq("id", user.id)
          .maybeSingle()

        // If profile doesn't exist and user came from OAuth, create it
        if (!existingProfile && user.identities && user.identities.length > 0) {
          const provider = user.identities[0]?.provider

          if (provider === "google") {
            // For Google users, auto-approve them
            const { error: createError } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                email,
                username: user.user_metadata?.name || email.split("@")[0],
                reddit: user.user_metadata?.google_metadata?.picture || "",
                discord: "",
                role: "user",
                approval_status: "approved",
                approved: true,
                suspended: false,
              })

            if (createError) {
              console.error("Profile creation error:", createError)
              router.push(`/pending-approval?email=${encodeURIComponent(email)}`)
              return
            }

            // Redirect to dashboard after successful profile creation
            router.push("/dashboard/tasks")
            return
          }
        }

        // If profile exists, handle based on approval status
        if (existingProfile) {
          const status = existingProfile.approval_status || "pending"

          if (status === "suspended") {
            alert("Your account has been suspended. Please contact support.")
            await supabase.auth.signOut()
            router.push("/auth")
            return
          }

          if (status !== "approved") {
            router.push(`/pending-approval?email=${encodeURIComponent(email)}`)
            return
          }

          // Account is approved, redirect based on role
          const role = existingProfile.role?.trim()?.toLowerCase()

          if (role === "admin") {
            router.push("/admin")
          } else if (role === "manager") {
            router.push("/manager/tasks")
          } else {
            router.push("/dashboard/tasks")
          }
          return
        }

        // No profile and not OAuth, go to pending approval
        router.push(`/pending-approval?email=${encodeURIComponent(email)}`)
      } catch (err) {
        console.error("Callback error:", err)
        router.push("/auth")
      }
    }

    handle()
  }, [])

  // ✅ Move conditional rendering into JSX, not early return
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0814]">
        <p className="text-white">Verifying your login...</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
      dark ? "bg-[#0f0814]" : "bg-[#fafaf8]"
    }`}>
      <p className={dark ? "text-white" : "text-slate-900"}>Verifying your login...</p>
    </div>
  )
}