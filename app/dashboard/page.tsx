"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {

  const router = useRouter()

  useEffect(() => {

    // AUTO REDIRECT TO TASKS
    router.replace("/dashboard/tasks")

  }, [router])

  return null
}