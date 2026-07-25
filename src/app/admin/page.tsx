"use client"

import { useEffect, useState } from "react"
import { Calendar, Users, DollarSign, TrendingUp, TrendingDown, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card } from "@/components/ui/card"

interface Booking {
  date: string
  guests: number
  duration: number
  payment: string
  total: number | null
  status: string
}

interface Expense {
  date: string
  category: string
  amount: number
}

function getDayKey(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/bookings").then((r) => r.json()),
      fetch("/api/admin/expenses").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
    ]).then(([bookingsData, expensesData, usersData]) => {
      setBookings(bookingsData.bookings || [])
      setExpenses(expensesData.expenses || [])
      setUsers(usersData.users || [])
      setLoading(false)
    })
  }, [])

  const [users, setUsers] = useState<{ role: string }[]>([])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    )
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayKey = getDayKey(today)

  const activeBookings = bookings.filter((b) => b.status !== "cancelled" && new Date(b.date) >= today)
  const paidBookings = bookings.filter((b) => b.payment === "paid" && b.status !== "cancelled")
  const revenue = paidBookings.reduce((sum, b) => sum + (b.total || 0), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const profit = revenue - totalExpenses

  function revenueForPeriod(from: Date, to: Date) {
    return paidBookings
      .filter((b) => {
        const d = new Date(b.date)
        return d >= from && d <= to
      })
      .reduce((sum, b) => sum + (b.total || 0), 0)
  }

  function expensesForPeriod(from: Date, to: Date) {
    return expenses
      .filter((e) => {
        const d = new Date(e.date)
        return d >= from && d <= to
      })
      .reduce((sum, e) => sum + e.amount, 0)
  }

  const todayRev = revenueForPeriod(today, today)
  const todayExp = expensesForPeriod(today, today)
  const todayProfit = todayRev - todayExp

  const weekStart = daysAgo(today.getDay())
  const weekRev = revenueForPeriod(weekStart, today)
  const weekExp = expensesForPeriod(weekStart, today)
  const weekProfit = weekRev - weekExp

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthRev = revenueForPeriod(monthStart, today)
  const monthExp = expensesForPeriod(monthStart, today)
  const monthProfit = monthRev - monthExp

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = daysAgo(6 - i)
    const key = getDayKey(d)
    const rev = paidBookings
      .filter((b) => getDayKey(new Date(b.date)) === key)
      .reduce((s, b) => s + (b.total || 0), 0)
    const exp = expenses
      .filter((e) => getDayKey(new Date(e.date)) === key)
      .reduce((s, e) => s + e.amount, 0)
    return { label: d.toLocaleDateString("en-US", { weekday: "short" }), day: d.getDate(), revenue: rev, expenses: exp, profit: rev - exp }
  })

  const expenseByCategory: Record<string, number> = {}
  for (const e of expenses) {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount
  }

  const summaryCards = [
    { label: "Total Revenue", value: `$${Number(revenue).toFixed(2)}`, icon: DollarSign, color: "text-green-400" },
    { label: "Total Expenses", value: `$${Number(totalExpenses).toFixed(2)}`, icon: TrendingDown, color: "text-red-400" },
    { label: "Net Profit", value: `$${Number(profit).toFixed(2)}`, icon: TrendingUp, color: profit >= 0 ? "text-green-400" : "text-red-400" },
    { label: "Upcoming Bookings", value: activeBookings.length, icon: Calendar, color: "text-blue-400" },
    { label: "Registered Users", value: users.filter((u) => u.role !== "admin").length, icon: Users, color: "text-purple-400" },
  ]

  const periodCards = [
    { label: "Today", revenue: todayRev, expenses: todayExp, profit: todayProfit },
    { label: "This Week", revenue: weekRev, expenses: weekExp, profit: weekProfit },
    { label: "This Month", revenue: monthRev, expenses: monthExp, profit: monthProfit },
  ]

  const maxBar = Math.max(...last7.map((d) => Math.max(d.revenue, d.expenses)), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">Revenue, expenses, and profit overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {summaryCards.map((c) => {
          const Icon = c.icon
          return (
            <Card key={c.label} className="border-zinc-800 bg-zinc-900 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400">{c.label}</p>
                  <p className="mt-1 text-xl font-bold text-white">{c.value}</p>
                </div>
                <Icon className={`h-6 w-6 ${c.color}`} />
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {periodCards.map((p) => (
          <Card key={p.label} className="border-zinc-800 bg-zinc-900 p-5">
            <p className="text-xs font-medium uppercase text-zinc-400">{p.label}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs sm:gap-3 sm:text-sm">
              <div>
                <p className="text-zinc-500">Revenue</p>
                <p className="font-semibold text-green-400">${Number(p.revenue).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-zinc-500">Expenses</p>
                <p className="font-semibold text-red-400">${Number(p.expenses).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-zinc-500">Profit</p>
                <p className={`font-semibold ${p.profit >= 0 ? "text-green-400" : "text-red-400"}`}>${Number(p.profit).toFixed(2)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-zinc-800 bg-zinc-900 p-5">
        <p className="mb-4 text-sm font-medium text-zinc-400">Last 7 Days</p>
        <div className="flex items-end gap-3" style={{ height: 160 }}>
          {last7.map((d) => (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full gap-0.5" style={{ height: 120 }}>
                <div
                  className="flex-1 rounded-t bg-green-600"
                  style={{ height: `${(d.revenue / maxBar) * 100}%`, minHeight: d.revenue > 0 ? 4 : 0 }}
                  title={`Revenue: $${Number(d.revenue).toFixed(2)}`}
                />
                <div
                  className="flex-1 rounded-t bg-red-600"
                  style={{ height: `${(d.expenses / maxBar) * 100}%`, minHeight: d.expenses > 0 ? 4 : 0 }}
                  title={`Expenses: $${Number(d.expenses).toFixed(2)}`}
                />
              </div>
              <div className="text-center">
                <p className="text-[10px] text-zinc-500">{d.label}</p>
                <p className={`text-[10px] font-medium ${d.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {d.profit >= 0 ? "+" : ""}${Number(d.profit).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-green-600" /> Revenue</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-red-600" /> Expenses</span>
        </div>
      </Card>

      {Object.keys(expenseByCategory).length > 0 && (
        <Card className="border-zinc-800 bg-zinc-900 p-5">
          <p className="mb-4 text-sm font-medium text-zinc-400">Expenses by Category</p>
          <div className="space-y-2">
            {Object.entries(expenseByCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, amt]) => (
                <div key={cat} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300 capitalize">{cat}</span>
                  <span className="font-medium text-red-400">${Number(amt).toFixed(2)}</span>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  )
}
