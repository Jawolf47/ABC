"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ShootingProgress } from "@/components/account/shooting-progress"

export default function ProgressPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/auth/login")
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">My Progress</h1>
          <p className="mt-2 text-zinc-400">Track your archery sessions and improvements.</p>
        </div>
        <ShootingProgress />
      </div>
    </div>
  )
}
