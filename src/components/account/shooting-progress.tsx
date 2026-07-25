"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, Trash2, Target, TrendingUp, Calendar, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ProgressEntry {
  id: string
  date: string
  distance: number | null
  arrowsShot: number
  score: number | null
  maxScore: number | null
  accuracy: number | null
  notes: string | null
  imageUrl: string | null
  createdAt: string
}

function formatDate(dateStr: string) {
  const parts = dateStr.split("T")[0].split("-")
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function toDateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function ShootingProgress() {
  const [entries, setEntries] = useState<ProgressEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    date: toDateString(new Date()),
    distance: "",
    arrowsShot: "36",
    score: "",
    maxScore: "",
    notes: "",
  })

  const fetchEntries = () => {
    fetch("/api/user/progress")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.progress || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchEntries() }, [])

  const handleSubmit = async () => {
    if (!form.arrowsShot) return
    setSaving(true)
    await fetch("/api/user/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: form.date,
        distance: form.distance ? Number(form.distance) : null,
        arrowsShot: Number(form.arrowsShot),
        score: form.score ? Number(form.score) : null,
        maxScore: form.maxScore ? Number(form.maxScore) : null,
        notes: form.notes || null,
      }),
    })
    setForm({ date: toDateString(new Date()), distance: "", arrowsShot: "36", score: "", maxScore: "", notes: "" })
    setShowForm(false)
    setSaving(false)
    fetchEntries()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/user/progress?id=${id}`, { method: "DELETE" })
    fetchEntries()
  }

  const totalArrows = entries.reduce((s, e) => s + e.arrowsShot, 0)
  const totalScore = entries.reduce((s, e) => s + (e.score || 0), 0)
  const avgAccuracy = entries.filter((e) => e.accuracy != null).reduce((s, e, _, a) => s + (e.accuracy || 0) / a.length, 0)
  const sessionsCount = entries.length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-white">My Progress</h2>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1 h-3 w-3" /> {showForm ? "Cancel" : "Log Session"}
        </Button>
      </div>

      {entries.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-zinc-800/50 p-3 text-center">
            <p className="text-2xl font-bold text-white">{sessionsCount}</p>
            <p className="text-xs text-zinc-500">Sessions</p>
          </div>
          <div className="rounded-lg bg-zinc-800/50 p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{totalArrows.toLocaleString()}</p>
            <p className="text-xs text-zinc-500">Total Arrows</p>
          </div>
          <div className="rounded-lg bg-zinc-800/50 p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{totalScore.toLocaleString()}</p>
            <p className="text-xs text-zinc-500">Total Score</p>
          </div>
          <div className="rounded-lg bg-zinc-800/50 p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{avgAccuracy > 0 ? `${avgAccuracy.toFixed(1)}%` : "—"}</p>
            <p className="text-xs text-zinc-500">Avg Accuracy</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="mb-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-zinc-500">Date</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="border-zinc-600 bg-zinc-900 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Distance (yards)</label>
              <Input
                type="number"
                min={1}
                value={form.distance}
                onChange={(e) => setForm({ ...form, distance: e.target.value })}
                className="border-zinc-600 bg-zinc-900 text-sm text-white"
                placeholder="e.g. 20"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Arrows Shot</label>
              <Input
                type="number"
                min={1}
                value={form.arrowsShot}
                onChange={(e) => setForm({ ...form, arrowsShot: e.target.value })}
                className="border-zinc-600 bg-zinc-900 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Score</label>
              <Input
                type="number"
                min={0}
                value={form.score}
                onChange={(e) => setForm({ ...form, score: e.target.value })}
                className="border-zinc-600 bg-zinc-900 text-sm text-white"
                placeholder="e.g. 285"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Max Score</label>
              <Input
                type="number"
                min={0}
                value={form.maxScore}
                onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
                className="border-zinc-600 bg-zinc-900 text-sm text-white"
                placeholder="e.g. 300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-zinc-500">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="mt-1 w-full rounded-md border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
                rows={2}
                placeholder="How did it go? What to work on?"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Check className="mr-1 h-3 w-3" />}
              Save
            </Button>
            <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="py-8 text-center">
          <Target className="mx-auto mb-3 h-8 w-8 text-zinc-700" />
          <p className="text-zinc-500">No sessions logged yet.</p>
          <p className="mt-1 text-sm text-zinc-600">Start tracking your archery progress!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <div key={e.id} className="flex items-start justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-800/30 px-3 py-3 sm:px-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-white">{formatDate(e.date)}</span>
                  {e.distance && <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-xs text-zinc-300">{e.distance} yd</span>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                  <span>{e.arrowsShot} arrows</span>
                  {e.score != null && e.maxScore != null && (
                    <span className="text-green-400">{e.score}/{e.maxScore}</span>
                  )}
                  {e.accuracy != null && (
                    <span className="text-amber-400">{e.accuracy.toFixed(1)}%</span>
                  )}
                </div>
                {e.notes && <p className="mt-1 text-xs text-zinc-500 truncate">{e.notes}</p>}
              </div>
              <button
                onClick={() => handleDelete(e.id)}
                className="shrink-0 rounded p-1 text-zinc-600 hover:bg-red-900/30 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
