"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MyTasksPage() {
  const router = useRouter()

  useEffect(() => {
    // AUTO REDIRECT TO ACTIVE TASKS
    // This maintains routing consistency with /dashboard pattern
    router.replace("/dashboard/my-tasks/active")
  }, [router])

  return null
}