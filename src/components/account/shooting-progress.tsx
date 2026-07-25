"use client"

import { useEffect, useState, useMemo } from "react"
import { Loader2, Plus, Trash2, Target, X, Check, ChevronDown, ChevronUp, AlertTriangle, Info, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { analyzeScorecard } from "@/lib/archery-analysis"

interface ProgressEntry {
  id: string
  date: string
  distance: number | null
  arrowsShot: number
  score: number | null
  maxScore: number | null
  accuracy: number | null
  endsData: string | null
  bowType: string | null
  notes: string | null
  imageUrl: string | null
  createdAt: string
}

interface FeedbackDiagnosis {
  code: string
  title?: string
  type: string
  severity: string
  observation: string
  root_cause: string
  actionable_tips: string[]
}

interface FeedbackResult {
  summary: {
    total_score: number
    max_possible_score: number
    total_arrows: number
    average_arrow_value: number
    score_percentage: number
    tier: string
  }
  primary_feedback: FeedbackDiagnosis
  secondary_feedback: FeedbackDiagnosis[]
  performance_tier_info: FeedbackDiagnosis
}

const SCORE_BUTTONS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]

function formatDate(dateStr: string) {
  const parts = dateStr.split("T")[0].split("-")
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function toDateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    High: "bg-red-900/50 text-red-400",
    Medium: "bg-amber-900/50 text-amber-400",
    Low: "bg-green-900/50 text-green-400",
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${colors[severity] || colors.Low}`}>
      {severity}
    </span>
  )
}

function TierBadge({ code }: { code: string }) {
  const styles: Record<string, string> = {
    TIER_FOUNDATION: "border-zinc-600 text-zinc-400",
    TIER_EXECUTION: "border-blue-800 text-blue-400",
    TIER_REFINEMENT: "border-amber-800 text-amber-400",
    TIER_HIGH_PERFORMANCE: "border-green-800 text-green-400",
  }
  const labels: Record<string, string> = {
    TIER_FOUNDATION: "Foundation",
    TIER_EXECUTION: "Execution",
    TIER_REFINEMENT: "Refinement",
    TIER_HIGH_PERFORMANCE: "Elite",
  }
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${styles[code] || styles.TIER_FOUNDATION}`}>
      {labels[code] || code}
    </span>
  )
}

function FeedbackPanel({ feedback }: { feedback: FeedbackResult }) {
  const { primary_feedback: primary, secondary_feedback: secondary, performance_tier_info: tier, summary } = feedback

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-white">Session Analysis</span>
          </div>
          <TierBadge code={tier.code} />
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-white">{summary.total_score}/{summary.max_possible_score}</p>
            <p className="text-[10px] text-zinc-500">Score</p>
          </div>
          <div>
            <p className="text-lg font-bold text-amber-400">{summary.average_arrow_value}</p>
            <p className="text-[10px] text-zinc-500">Avg Arrow</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-400">{summary.score_percentage}%</p>
            <p className="text-[10px] text-zinc-500">Accuracy</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium text-white">{primary.type}</span>
          <SeverityBadge severity={primary.severity} />
        </div>
        <p className="text-xs text-zinc-400">{primary.observation}</p>
        <p className="mt-1 text-xs text-zinc-500 italic">{primary.root_cause}</p>
        <div className="mt-3 space-y-1.5">
          {primary.actionable_tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <Check className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
              <span className="text-xs text-zinc-300">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {secondary.map((diag, i) => (
        <div key={i} className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-white">{diag.type}</span>
            <SeverityBadge severity={diag.severity} />
          </div>
          <p className="text-xs text-zinc-400">{diag.observation}</p>
          <div className="mt-2 space-y-1">
            {diag.actionable_tips.map((tip, j) => (
              <div key={j} className="flex items-start gap-2">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-blue-500" />
                <span className="text-xs text-zinc-300">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function MiniScorecard({ endsData }: { endsData: number[][] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {endsData.map((end, i) => {
        const endScore = end.reduce((a, b) => a + b, 0)
        return (
          <span key={i} className="rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-300">
            E{i + 1}: {endScore} ({end.join(",")})
          </span>
        )
      })}
    </div>
  )
}

export function ShootingProgress() {
  const [entries, setEntries] = useState<ProgressEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)

  const [date, setDate] = useState(toDateString(new Date()))
  const [distance, setDistance] = useState("")
  const [bowType, setBowType] = useState("")
  const [arrowsPerEnd, setArrowsPerEnd] = useState(6)
  const [ends, setEnds] = useState<number[][]>([[]])
  const [activeEnd, setActiveEnd] = useState(0)
  const [notes, setNotes] = useState("")

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

  const currentEnd = ends[activeEnd] || []
  const isComplete = currentEnd.length >= arrowsPerEnd
  const allEndsComplete = ends.every((e) => e.length >= arrowsPerEnd) && ends.length > 0 && ends[ends.length - 1].length >= arrowsPerEnd
  const totalArrows = ends.flat().length
  const totalScore = ends.flat().reduce((a, b) => a + b, 0)
  const maxScore = totalArrows * 10

  const resetForm = () => {
    setDate(toDateString(new Date()))
    setDistance("")
    setBowType("")
    setArrowsPerEnd(6)
    setEnds([[]])
    setActiveEnd(0)
    setNotes("")
    setFeedback(null)
  }

  const addScore = (score: number) => {
    if (isComplete) return
    const updated = [...ends]
    updated[activeEnd] = [...updated[activeEnd], score]
    setEnds(updated)
  }

  const removeLastScore = () => {
    if (currentEnd.length === 0) return
    const updated = [...ends]
    updated[activeEnd] = updated[activeEnd].slice(0, -1)
    setEnds(updated)
  }

  const addEnd = () => {
    if (!isComplete) return
    setEnds([...ends, []])
    setActiveEnd(ends.length)
  }

  const removeEnd = (idx: number) => {
    if (ends.length <= 1) return
    const updated = ends.filter((_, i) => i !== idx)
    setEnds(updated)
    if (activeEnd >= updated.length) setActiveEnd(updated.length - 1)
  }

  const handleSubmit = async () => {
    if (!allEndsComplete && totalArrows === 0) return
    setSaving(true)
    const validEnds = ends.filter((e) => e.length > 0)

    const res = await fetch("/api/user/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        distance: distance ? Number(distance) : null,
        bowType: bowType || null,
        endsData: validEnds,
        notes: notes || null,
      }),
    })
    const saved = await res.json()

    try {
      const result = analyzeScorecard(validEnds)
      setFeedback(result)
    } catch {
      // ignore
    }

    setSaving(false)
    setShowForm(false)
    resetForm()
    fetchEntries()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/user/progress?id=${id}`, { method: "DELETE" })
    fetchEntries()
  }

  const sessionsCount = entries.length
  const lifetimeArrows = entries.reduce((s, e) => s + e.arrowsShot, 0)
  const lifetimeScore = entries.reduce((s, e) => s + (e.score || 0), 0)
  const avgAccuracy = entries.filter((e) => e.accuracy != null).reduce((s, e, _, a) => s + (e.accuracy || 0) / a.length, 0)

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
        <Button size="sm" onClick={() => { setShowForm(!showForm); if (showForm) resetForm() }}>
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
            <p className="text-2xl font-bold text-amber-400">{lifetimeArrows.toLocaleString()}</p>
            <p className="text-xs text-zinc-500">Total Arrows</p>
          </div>
          <div className="rounded-lg bg-zinc-800/50 p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{lifetimeScore.toLocaleString()}</p>
            <p className="text-xs text-zinc-500">Total Score</p>
          </div>
          <div className="rounded-lg bg-zinc-800/50 p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{avgAccuracy > 0 ? `${avgAccuracy.toFixed(1)}%` : "\u2014"}</p>
            <p className="text-xs text-zinc-500">Avg Accuracy</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="mb-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <div className="mb-3 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs text-zinc-500">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border-zinc-600 bg-zinc-900 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Distance (yards)</label>
              <Input type="number" min={1} value={distance} onChange={(e) => setDistance(e.target.value)} className="border-zinc-600 bg-zinc-900 text-sm text-white" placeholder="e.g. 20" />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Bow Type</label>
              <select value={bowType} onChange={(e) => setBowType(e.target.value)} className="flex h-10 w-full rounded-md border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white">
                <option value="">Select</option>
                <option value="compound">Compound</option>
                <option value="recurve">Recurve</option>
                <option value="barebow">Barebow</option>
                <option value="traditional">Traditional</option>
                <option value="crossbow">Crossbow</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="text-xs text-zinc-500">Arrows per End</label>
            <div className="mt-1 flex gap-2">
              {[3, 6].map((n) => (
                <button key={n} onClick={() => { setArrowsPerEnd(n); setEnds([[]]); setActiveEnd(0) }}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${arrowsPerEnd === n ? "bg-amber-600 text-white" : "bg-zinc-700 text-zinc-400 hover:text-white"}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs text-zinc-500">Ends ({ends.filter((e) => e.length > 0).length} completed)</label>
              <div className="flex items-center gap-2">
                {totalArrows > 0 && (
                  <span className="text-xs text-zinc-400">{totalScore}/{maxScore}</span>
                )}
                {isComplete && (
                  <button onClick={addEnd} className="rounded bg-amber-600 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-amber-700">
                    + New End
                  </button>
                )}
              </div>
            </div>

            <div className="mb-2 flex gap-1 overflow-x-auto pb-1">
              {ends.map((end, i) => (
                <button key={i} onClick={() => setActiveEnd(i)}
                  className={`flex h-7 min-w-[28px] items-center justify-center rounded text-xs font-medium transition-colors ${
                    activeEnd === i ? "bg-amber-600 text-white" : end.length >= arrowsPerEnd ? "bg-green-900/50 text-green-400" : "bg-zinc-700 text-zinc-400"
                  }`}>
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="mb-2 flex flex-wrap gap-1 rounded-lg border border-zinc-700 bg-zinc-900 p-2">
              {currentEnd.map((score, i) => (
                <span key={i} className={`flex h-7 w-7 items-center justify-center rounded text-xs font-bold ${
                  score >= 9 ? "bg-green-900/50 text-green-400" : score >= 7 ? "bg-amber-900/50 text-amber-400" : "bg-red-900/50 text-red-400"
                }`}>
                  {score}
                </span>
              ))}
              {Array.from({ length: arrowsPerEnd - currentEnd.length }).map((_, i) => (
                <span key={`empty-${i}`} className="flex h-7 w-7 items-center justify-center rounded border border-zinc-700 text-xs text-zinc-600">
                  -
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {SCORE_BUTTONS.map((score) => (
                <button key={score} onClick={() => addScore(score)} disabled={isComplete}
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold transition-colors ${
                    isComplete ? "cursor-not-allowed bg-zinc-800 text-zinc-600" :
                    score >= 9 ? "bg-green-900/30 text-green-400 hover:bg-green-900/50" :
                    score >= 7 ? "bg-amber-900/30 text-amber-400 hover:bg-amber-900/50" :
                    "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}>
                  {score}
                </button>
              ))}
              <button onClick={removeLastScore} disabled={currentEnd.length === 0}
                className="flex h-8 items-center rounded-md bg-red-900/30 px-2 text-xs text-red-400 hover:bg-red-900/50 disabled:cursor-not-allowed disabled:text-zinc-600">
                Undo
              </button>
            </div>

            {ends.length > 1 && (
              <div className="mt-2">
                <button onClick={() => removeEnd(activeEnd)} className="text-[10px] text-red-400 hover:text-red-300">
                  Remove End {activeEnd + 1}
                </button>
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="text-xs text-zinc-500">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
              rows={2} placeholder="How did it go? What to work on?" />
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={handleSubmit} disabled={saving || totalArrows === 0}>
              {saving ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Check className="mr-1 h-3 w-3" />}
              Save & Analyze
            </Button>
            <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => { setShowForm(false); resetForm() }}>
              Cancel
            </Button>
          </div>

          {feedback && (
            <div className="mt-4">
              <FeedbackPanel feedback={feedback} />
            </div>
          )}
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
          {entries.map((e) => {
            const parsedEnds: number[][] = e.endsData ? JSON.parse(e.endsData) : []
            const tierCode = (() => {
              if (e.accuracy == null) return null
              if (e.accuracy >= 85) return "TIER_HIGH_PERFORMANCE"
              if (e.accuracy >= 70) return "TIER_REFINEMENT"
              if (e.accuracy >= 50) return "TIER_EXECUTION"
              return "TIER_FOUNDATION"
            })()

            return (
              <div key={e.id} className="rounded-lg border border-zinc-800 bg-zinc-800/30 px-3 py-3 sm:px-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-white">{formatDate(e.date)}</span>
                      {e.distance && <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-xs text-zinc-300">{e.distance} yd</span>}
                      {e.bowType && <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-xs text-zinc-400 capitalize">{e.bowType}</span>}
                      {tierCode && <TierBadge code={tierCode} />}
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
                    {parsedEnds.length > 0 && (
                      <>
                        <button
                          onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
                          className="mt-1 flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-400"
                        >
                          {expandedId === e.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          Scorecard ({parsedEnds.length} ends)
                        </button>
                        {expandedId === e.id && <MiniScorecard endsData={parsedEnds} />}
                      </>
                    )}
                    {e.notes && <p className="mt-1 text-xs text-zinc-500 truncate">{e.notes}</p>}
                  </div>
                  <button onClick={() => handleDelete(e.id)} className="shrink-0 rounded p-1 text-zinc-600 hover:bg-red-900/30 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
