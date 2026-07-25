"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Calendar, Wrench, Receipt, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"

interface Stats {
  bookings: number
  equipmentOut: number
  myExpenses: number
}

export default function CoachDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/bookings").then((r) => r.json()),
      fetch("/api/admin/equipment-usage").then((r) => r.json()),
      fetch("/api/coach/expenses").then((r) => r.json()),
    ]).then(([bookings, usage, expenses]) => {
      setStats({
        bookings: (bookings.bookings || []).length,
        equipmentOut: (usage.usages || []).filter((u: { returnedAt: string | null }) => !u.returnedAt).length,
        myExpenses: (expenses.expenses || []).reduce((sum: number, e: { amount: number }) => sum + e.amount, 0),
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome, {session?.user?.name || "Coach"}</h1>
        <p className="mt-1 text-sm text-zinc-400">View bookings, equipment, and manage your expenses.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900/30">
              <Calendar className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Total Bookings</p>
              <p className="text-2xl font-bold text-white">{stats?.bookings ?? 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-900/30">
              <Wrench className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Equipment Out</p>
              <p className="text-2xl font-bold text-amber-400">{stats?.equipmentOut ?? 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-900/30">
              <Receipt className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">My Expenses</p>
              <p className="text-2xl font-bold text-red-400">${(stats?.myExpenses ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
