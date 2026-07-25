"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Loader2, Plus, Trash2, DollarSign, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Expense {
  id: string; date: string; category: string; description: string
  amount: number; miles: number | null; notes: string | null; adminName: string | null
}

const CATEGORIES = ["Equipment", "Rent", "Utilities", "Supplies", "Marketing", "Insurance", "Staff", "Maintenance", "Transportation", "Other"]

function formatDate(dateStr: string) {
  const parts = dateStr.split("T")[0].split("-")
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function toDateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export default function CoachExpensesPage() {
  const { data: session } = useSession()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterCategory, setFilterCategory] = useState("")
  const [filterFrom, setFilterFrom] = useState("")
  const [filterTo, setFilterTo] = useState("")
  const [form, setForm] = useState({ date: toDateString(new Date()), category: "Equipment", description: "", amount: "", miles: "", notes: "" })
  const [saving, setSaving] = useState(false)

  const MILE_RATE = 0.76

  const fetchExpenses = () => {
    const params = new URLSearchParams()
    if (filterCategory) params.set("category", filterCategory)
    if (filterFrom) params.set("from", filterFrom)
    if (filterTo) params.set("to", filterTo)
    fetch(`/api/coach/expenses?${params}`)
      .then((r) => r.json())
      .then((data) => { setExpenses(data.expenses || []); setLoading(false) })
  }

  useEffect(() => { setLoading(true); fetchExpenses() }, [filterCategory, filterFrom, filterTo])

  const handleSubmit = async () => {
    if (!form.description) return
    setSaving(true)
    const amount = form.category === "Transportation" && form.miles ? parseFloat(form.miles) * MILE_RATE : parseFloat(form.amount)
    const res = await fetch("/api/coach/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form, amount,
        miles: form.category === "Transportation" ? (form.miles ? parseFloat(form.miles) : null) : null,
      }),
    })
    if (res.ok) {
      setForm({ date: toDateString(new Date()), category: "Equipment", description: "", amount: "", miles: "", notes: "" })
      setShowForm(false)
      fetchExpenses()
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/coach/expenses?id=${id}`, { method: "DELETE" })
    fetchExpenses()
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Expenses</h1>
          <p className="mt-1 text-sm text-zinc-400">Track your personal expenses. Only you can see these.</p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1 h-4 w-4" /> Add Expense
        </Button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-900 p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div>
              <label className="text-xs text-zinc-500">Date</label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border-zinc-600 bg-zinc-800 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="flex h-10 w-full rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500">Description</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border-zinc-600 bg-zinc-800 text-sm text-white" placeholder="e.g. 10 new targets" />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Amount ($)</label>
              <Input type="number" min={0} step={0.01} value={form.category === "Transportation" && form.miles ? (parseFloat(form.miles) * MILE_RATE).toFixed(2) : form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} disabled={form.category === "Transportation" && !!form.miles} className="border-zinc-600 bg-zinc-800 text-sm text-white disabled:opacity-60" placeholder="0.00" />
            </div>
            {form.category === "Transportation" && (
              <div>
                <label className="text-xs text-zinc-500">Miles (round trip)</label>
                <Input type="number" min={0} step={0.1} value={form.miles} onChange={(e) => setForm({ ...form, miles: e.target.value })} className="border-zinc-600 bg-zinc-800 text-sm text-white" placeholder="e.g. 45" />
                {form.miles && <p className="mt-1 text-xs text-zinc-500">${MILE_RATE}/mi × {form.miles} mi = ${(parseFloat(form.miles) * MILE_RATE).toFixed(2)}</p>}
              </div>
            )}
            <div>
              <label className="text-xs text-zinc-500">Notes (optional)</label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="border-zinc-600 bg-zinc-800 text-sm text-white" placeholder="Notes" />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <DollarSign className="mr-1 h-3 w-3" />} Add
            </Button>
            <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <Input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="w-40 border-zinc-700 bg-zinc-800 text-sm text-white" />
        <Input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="w-40 border-zinc-700 bg-zinc-800 text-sm text-white" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-amber-500" /></div>
      ) : expenses.length === 0 ? (
        <div className="py-20 text-center text-zinc-500">No expenses recorded yet.</div>
      ) : (
        <div className="mt-4 space-y-2">
          {expenses.map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-900/30">
                  <DollarSign className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{e.description}</p>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(e.date)}</span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 capitalize">{e.category}</span>
                    {e.miles && <span>{e.miles} mi</span>}
                    {e.notes && <span>{e.notes}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-red-400">-${e.amount.toLocaleString()}</span>
                <button onClick={() => handleDelete(e.id)} className="rounded p-1 text-zinc-600 hover:bg-red-900/30 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-end rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3">
            <span className="text-sm text-zinc-400">Total:</span>
            <span className="ml-2 text-lg font-bold text-red-400">-${total.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  )
}
