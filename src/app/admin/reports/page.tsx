"use client"

import { useEffect, useState } from "react"
import { Loader2, Download, Calendar, TrendingUp, TrendingDown, DollarSign, Receipt, BarChart3, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface Booking {
  date: string
  guests: number
  duration: number
  payment: string
  total: number | null
  status: string
  name: string
  timeSlot: string
  type: string
}

interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
  miles: number | null
  notes: string | null
  adminName: string | null
}

function toDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function getDayKey(dateStr: string) {
  const parts = dateStr.split("T")[0].split("-")
  return `${parts[0]}-${parts[1]}-${parts[2]}`
}

function formatDisplayDate(dateStr: string) {
  const parts = dateStr.split("T")[0].split("-")
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function ReportsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"cashflow" | "expenses" | "tax">("cashflow")

  const now = new Date()
  const [from, setFrom] = useState(toDateString(new Date(now.getFullYear(), now.getMonth(), 1)))
  const [to, setTo] = useState(toDateString(now))

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      fetch("/api/admin/bookings").then((r) => r.json()),
      fetch(`/api/admin/expenses?from=${from}&to=${to}`).then((r) => r.json()),
    ]).then(([bookingsData, expensesData]) => {
      setBookings(bookingsData.bookings || [])
      setExpenses(expensesData.expenses || [])
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchData()
  }, [from, to])

  const filteredBookings = bookings.filter((b) => {
    if (b.status === "cancelled") return false
    if (b.payment !== "paid") return false
    const key = getDayKey(b.date)
    return key >= from && key <= to
  })

  const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.total || 0), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const netProfit = totalRevenue - totalExpenses

  // Build daily cash flow
  const dayMap: Record<string, { revenue: number; expenses: number }> = {}
  for (const b of filteredBookings) {
    const key = getDayKey(b.date)
    if (!dayMap[key]) dayMap[key] = { revenue: 0, expenses: 0 }
    dayMap[key].revenue += b.total || 0
  }
  for (const e of expenses) {
    const key = getDayKey(e.date)
    if (!dayMap[key]) dayMap[key] = { revenue: 0, expenses: 0 }
    dayMap[key].expenses += e.amount
  }
  const dailyCashFlow = Object.entries(dayMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, data]) => ({ date, ...data, profit: data.revenue - data.expenses }))

  // Expense by category
  const expenseByCategory: Record<string, number> = {}
  for (const e of expenses) {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount
  }
  const categoryBreakdown = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({ category, amount, percent: totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : "0" }))

  // Expense by day
  const expenseByDay: Record<string, { total: number; items: Expense[] }> = {}
  for (const e of expenses) {
    const key = getDayKey(e.date)
    if (!expenseByDay[key]) expenseByDay[key] = { total: 0, items: [] }
    expenseByDay[key].total += e.amount
    expenseByDay[key].items.push(e)
  }

  function exportCashFlowCSV() {
    const header = "Date,Revenue,Expenses,Profit\n"
    const rows = dailyCashFlow.map((d) => `${d.date},${d.revenue},${d.expenses},${d.profit}`).join("\n")
    const totals = `\nTotal,,${totalExpenses},${netProfit}`
    downloadCSV(`cashflow-${from}-to-${to}.csv`, header + rows + totals)
  }

  function exportExpenseCSV() {
    const header = "Date,Category,Description,Amount,Notes\n"
    const rows = expenses
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) => `${getDayKey(e.date)},${e.category},"${e.description}",${e.amount},"${e.notes || ""}"`)
      .join("\n")
    const totals = `\n,,,${totalExpenses},`
    downloadCSV(`expenses-${from}-to-${to}.csv`, header + rows + totals)
  }

  function exportTaxCSV() {
    const header = "Date,Category,Description,Miles,Amount,Submitted By,Notes\n"
    const rows = expenses
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) => `${getDayKey(e.date)},${e.category},"${e.description}",${e.miles || ""},${e.amount},"${e.adminName || ""}","${e.notes || ""}"`)
      .join("\n")
    const totalRow = `\n,,,,${totalExpenses},,`
    const summaryHeader = `\n\nCategory,Total\n`
    const summaryRows = categoryBreakdown.map((c) => `${c.category},${c.amount}`).join("\n")
    const summaryTotal = `\nTotal,${totalExpenses}`
    const revenueRow = `\n\nRevenue Summary\nTotal Revenue,${totalRevenue}\nTotal Expenses,${totalExpenses}\nNet Profit/Loss,${netProfit}`
    downloadCSV(`tax-report-${from}-to-${to}.csv`, header + rows + totalRow + summaryHeader + summaryRows + summaryTotal + revenueRow)
  }

  function downloadCSV(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="mt-1 text-sm text-zinc-400">Cash flow and expense analysis for any date range.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-zinc-500">From</label>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border-zinc-700 bg-zinc-800 text-sm text-white"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500">To</label>
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border-zinc-700 bg-zinc-800 text-sm text-white"
          />
        </div>
        <div className="flex gap-2">
          {[
            { label: "This Month", from: toDateString(new Date(now.getFullYear(), now.getMonth(), 1)), to: toDateString(now) },
            { label: "Last 30 Days", from: toDateString(new Date(now.getTime() - 30 * 86400000)), to: toDateString(now) },
            { label: "This Year", from: `${now.getFullYear()}-01-01`, to: toDateString(now) },
          ].map((preset) => (
            <Button
              key={preset.label}
              size="sm"
              variant="ghost"
              className="text-zinc-400 hover:text-white"
              onClick={() => { setFrom(preset.from); setTo(preset.to) }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={activeTab === "cashflow" ? "primary" : "ghost"}
          className={activeTab === "cashflow" ? "bg-amber-600" : "text-zinc-400 hover:text-white"}
          onClick={() => setActiveTab("cashflow")}
        >
          <TrendingUp className="mr-1 h-3 w-3" /> Cash Flow
        </Button>
        <Button
          size="sm"
          variant={activeTab === "expenses" ? "primary" : "ghost"}
          className={activeTab === "expenses" ? "bg-amber-600" : "text-zinc-400 hover:text-white"}
          onClick={() => setActiveTab("expenses")}
        >
          <Receipt className="mr-1 h-3 w-3" /> Expenses
        </Button>
        <Button
          size="sm"
          variant={activeTab === "tax" ? "primary" : "ghost"}
          className={activeTab === "tax" ? "bg-amber-600" : "text-zinc-400 hover:text-white"}
          onClick={() => setActiveTab("tax")}
        >
          <FileText className="mr-1 h-3 w-3" /> Tax Report
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900 p-5">
          <p className="text-xs text-zinc-400">Total Revenue</p>
          <p className="mt-1 text-2xl font-bold text-green-400">${totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-zinc-600">{filteredBookings.length} paid bookings</p>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900 p-5">
          <p className="text-xs text-zinc-400">Total Expenses</p>
          <p className="mt-1 text-2xl font-bold text-red-400">${totalExpenses.toFixed(2)}</p>
          <p className="text-xs text-zinc-600">{expenses.length} expense entries</p>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900 p-5">
          <p className="text-xs text-zinc-400">Net Profit</p>
          <p className={`mt-1 text-2xl font-bold ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
            ${netProfit.toFixed(2)}
          </p>
          <p className="text-xs text-zinc-600">{netProfit >= 0 ? "Profitable" : "Operating at a loss"}</p>
        </Card>
      </div>

      {activeTab === "cashflow" && (
        <Card className="border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">Cash Flow by Day</p>
            <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white" onClick={exportCashFlowCSV}>
              <Download className="mr-1 h-3 w-3" /> Export CSV
            </Button>
          </div>
          {dailyCashFlow.length === 0 ? (
            <p className="py-8 text-center text-zinc-500">No data for this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4 text-right">Revenue</th>
                    <th className="pb-2 pr-4 text-right">Expenses</th>
                    <th className="pb-2 text-right">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyCashFlow.map((d) => (
                    <tr key={d.date} className="border-b border-zinc-800/50">
                      <td className="py-2 pr-4 text-white">{formatDisplayDate(d.date)}</td>
                      <td className="py-2 pr-4 text-right text-green-400">${d.revenue.toFixed(2)}</td>
                      <td className="py-2 pr-4 text-right text-red-400">${d.expenses.toFixed(2)}</td>
                      <td className={`py-2 text-right font-medium ${d.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                        ${d.profit.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-700 font-medium">
                    <td className="py-2 pr-4 text-white">Total</td>
                    <td className="py-2 pr-4 text-right text-green-400">${totalRevenue.toFixed(2)}</td>
                    <td className="py-2 pr-4 text-right text-red-400">${totalExpenses.toFixed(2)}</td>
                    <td className={`py-2 text-right ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                      ${netProfit.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === "expenses" && (
        <div className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">Expenses by Category</p>
              <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white" onClick={exportExpenseCSV}>
                <Download className="mr-1 h-3 w-3" /> Export CSV
              </Button>
            </div>
            {categoryBreakdown.length === 0 ? (
              <p className="py-8 text-center text-zinc-500">No expenses for this period.</p>
            ) : (
              <div className="space-y-3">
                {categoryBreakdown.map((c) => (
                  <div key={c.category} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-sm capitalize text-zinc-300">{c.category}</span>
                    <div className="flex-1">
                      <div className="h-4 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-amber-600"
                          style={{ width: `${c.percent}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-20 text-right text-sm font-medium text-red-400">${c.amount.toFixed(2)}</span>
                    <span className="w-12 text-right text-xs text-zinc-500">{c.percent}%</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="border-zinc-800 bg-zinc-900 p-5">
            <p className="mb-4 text-sm font-medium text-zinc-400">Expense Details</p>
            {expenses.length === 0 ? (
              <p className="py-8 text-center text-zinc-500">No expenses for this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
                      <th className="pb-2 pr-4">Date</th>
                      <th className="pb-2 pr-4">Category</th>
                      <th className="pb-2 pr-4">Description</th>
                      <th className="pb-2 pr-4">Notes</th>
                      <th className="pb-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.sort((a, b) => a.date.localeCompare(b.date)).map((e) => (
                      <tr key={e.id} className="border-b border-zinc-800/50">
                        <td className="py-2 pr-4 text-white">{formatDisplayDate(e.date)}</td>
                        <td className="py-2 pr-4"><span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs capitalize text-zinc-300">{e.category}</span></td>
                        <td className="py-2 pr-4 text-zinc-300">{e.description}</td>
                        <td className="py-2 pr-4 text-zinc-500">{e.notes || "-"}</td>
                        <td className="py-2 text-right font-medium text-red-400">${e.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-zinc-700 font-medium">
                      <td colSpan={4} className="py-2 pr-4 text-white">Total</td>
                      <td className="py-2 text-right text-red-400">${totalExpenses.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "tax" && (
        <div className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400">Tax Report</p>
                <p className="text-xs text-zinc-600">Summary for tax filing — {formatDisplayDate(from)} to {formatDisplayDate(to)}</p>
              </div>
              <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white" onClick={exportTaxCSV}>
                <Download className="mr-1 h-3 w-3" /> Export CSV
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Income</h3>
                <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">Gross Revenue ({filteredBookings.length} paid bookings)</span>
                    <span className="text-sm font-medium text-green-400">${totalRevenue.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Expenses by Category</h3>
                {categoryBreakdown.length === 0 ? (
                  <p className="py-4 text-center text-zinc-500">No expenses for this period.</p>
                ) : (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 divide-y divide-zinc-800">
                    {categoryBreakdown.map((c) => (
                      <div key={c.category} className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm capitalize text-zinc-300">{c.category}</span>
                        <span className="text-sm font-medium text-red-400">${c.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-4 py-3 font-medium">
                      <span className="text-sm text-white">Total Expenses</span>
                      <span className="text-sm text-red-400">${totalExpenses.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Net Profit / Loss</h3>
                <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">Revenue − Expenses</span>
                    <span className={`text-lg font-bold ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                      ${netProfit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Expense Log</h3>
                {expenses.length === 0 ? (
                  <p className="py-4 text-center text-zinc-500">No expenses for this period.</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-zinc-800">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-800/50 text-left text-xs text-zinc-500">
                          <th className="pb-2 pt-3 pl-4 pr-4">Date</th>
                          <th className="pb-2 pt-3 pr-4">Category</th>
                          <th className="pb-2 pt-3 pr-4">Description</th>
                          <th className="pb-2 pt-3 pr-4">Miles</th>
                          <th className="pb-2 pt-3 pr-4">Amount</th>
                          <th className="pb-2 pt-3 pr-4">Submitted By</th>
                          <th className="pb-2 pt-3 pr-4">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.sort((a, b) => a.date.localeCompare(b.date)).map((e) => (
                          <tr key={e.id} className="border-b border-zinc-800/50">
                            <td className="py-2 pl-4 pr-4 text-white">{formatDisplayDate(e.date)}</td>
                            <td className="py-2 pr-4"><span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs capitalize text-zinc-300">{e.category}</span></td>
                            <td className="py-2 pr-4 text-zinc-300">{e.description}</td>
                            <td className="py-2 pr-4 text-zinc-500">{e.miles ? `${e.miles} mi` : "-"}</td>
                            <td className="py-2 pr-4 text-right font-medium text-red-400">${e.amount.toFixed(2)}</td>
                            <td className="py-2 pr-4 text-zinc-500">{e.adminName || "-"}</td>
                            <td className="py-2 pr-4 text-zinc-500">{e.notes || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-zinc-700 font-medium">
                          <td colSpan={4} className="py-2 pl-4 pr-4 text-white">Total</td>
                          <td className="py-2 pr-4 text-right text-red-400">${totalExpenses.toFixed(2)}</td>
                          <td colSpan={2}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
