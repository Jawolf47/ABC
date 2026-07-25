"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Loader2, Package, LogOut, LogIn, AlertTriangle, ArrowDown, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface Equipment {
  id: string; name: string; category: string; quantity: number; condition: string
  serialNumber: string | null; notes: string | null
}

interface EquipmentUsage {
  id: string; equipmentId: string; eventName: string | null; date: string
  checkedOutBy: string; quantityOut: number; returnedAt: string | null
  conditionOut: string; conditionIn: string | null; returnedBy: string | null
  equipment: { name: string; category: string }
}

function toDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function getConditionColor(c: string) {
  switch (c) {
    case "excellent": case "good": return "text-green-400"
    case "fair": return "text-yellow-400"
    case "poor": case "needs repair": return "text-red-400"
    default: return "text-zinc-400"
  }
}

export default function CoachEquipmentPage() {
  const { data: session } = useSession()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [usages, setUsages] = useState<EquipmentUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [logDate, setLogDate] = useState(toDateString(new Date()))
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [working, setWorking] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const coachName = session?.user?.name || "Coach"

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      fetch("/api/admin/equipment").then((r) => r.json()),
      fetch(`/api/admin/equipment-usage?date=${logDate}`).then((r) => r.json()),
    ]).then(([eqData, usageData]) => {
      setEquipment(eqData.equipment || [])
      setUsages(usageData.usages || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [logDate])

  const handleCheckout = async (eqId: string) => {
    setWorking(true)
    await fetch("/api/admin/equipment-usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        equipmentId: eqId, date: logDate, checkedOutBy: coachName,
        quantityOut: 1, conditionOut: "good",
      }),
    })
    setWorking(false)
    fetchData()
  }

  const handleCheckin = async (usageId: string) => {
    const u = usages.find((x) => x.id === usageId)
    setWorking(true)
    await fetch("/api/admin/equipment-usage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: usageId, conditionIn: u?.conditionOut || "good", returnedBy: coachName }),
    })
    setWorking(false)
    fetchData()
  }

  const handleBulkCheckout = async () => {
    if (selected.size === 0) return
    setWorking(true)
    for (const eqId of selected) {
      const eq = equipment.find((e) => e.id === eqId)
      if (!eq) continue
      const eqOut = usages.filter((u) => u.equipmentId === eq.id && !u.returnedAt)
      const outCount = eqOut.reduce((s, u) => s + u.quantityOut, 0)
      if (eq.quantity - outCount > 0) {
        await handleCheckout(eqId)
      }
    }
    setSelected(new Set())
    setWorking(false)
  }

  const handleBulkCheckin = async () => {
    if (selected.size === 0) return
    setWorking(true)
    const toReturn = usages.filter((u) => !u.returnedAt && selected.has(u.equipmentId))
    for (const u of toReturn) {
      await handleCheckin(u.id)
    }
    setSelected(new Set())
    setWorking(false)
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map((e) => e.id)))
  }

  const filtered = equipment.filter((eq) => categoryFilter === "all" || eq.category === categoryFilter)
  const checkedOutItems = usages.filter((u) => !u.returnedAt)
  const returnedToday = usages.filter((u) => u.returnedAt)
  const totalItems = equipment.reduce((sum, eq) => sum + eq.quantity, 0)
  const totalCheckedOut = checkedOutItems.reduce((sum, u) => sum + u.quantityOut, 0)
  const needsRepair = equipment.filter((eq) => eq.condition === "needs repair").length

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-amber-500" /></div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Equipment</h1>
        <p className="mt-1 text-sm text-zinc-400">Check in and check out equipment.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-2"><Package className="h-4 w-4 text-blue-400" /><p className="text-xs text-zinc-400">Total</p></div>
          <p className="mt-1 text-xl font-bold text-white">{totalItems}</p>
          <p className="text-xs text-zinc-600">{equipment.length} items</p>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-2"><LogOut className="h-4 w-4 text-amber-400" /><p className="text-xs text-zinc-400">Checked Out</p></div>
          <p className="mt-1 text-xl font-bold text-amber-400">{totalCheckedOut}</p>
          <p className="text-xs text-zinc-600">{checkedOutItems.length} active</p>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-2"><LogIn className="h-4 w-4 text-green-400" /><p className="text-xs text-zinc-400">Returned</p></div>
          <p className="mt-1 text-xl font-bold text-green-400">{returnedToday.length}</p>
          <p className="text-xs text-zinc-600">today</p>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-400" /><p className="text-xs text-zinc-400">Repair</p></div>
          <p className="mt-1 text-xl font-bold text-red-400">{needsRepair}</p>
          <p className="text-xs text-zinc-600">need attention</p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-amber-500" />
          <span className="text-xs text-zinc-500">{selected.size > 0 ? `${selected.size} selected` : "Select all"}</span>
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-white">
          <option value="all">All Categories</option>
          {["bow", "arrow", "target", "accessory", "safety", "maintenance", "other"].map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <Input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} className="w-40 border-zinc-700 bg-zinc-800 text-xs text-white" />
        {selected.size > 0 && (() => {
          const selectedArr = Array.from(selected)
          const checkedOutCount = selectedArr.filter((id) => {
            return usages.some((u) => u.equipmentId === id && !u.returnedAt)
          }).length
          const availableCount = selected.size - checkedOutCount
          return (
            <>
              {availableCount > 0 && (
                <Button size="sm" onClick={handleBulkCheckout} disabled={working}>
                  {working ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <ArrowUp className="mr-1 h-3 w-3" />}
                  Check Out {availableCount} item{availableCount > 1 ? "s" : ""}
                </Button>
              )}
              {checkedOutCount > 0 && (
                <Button size="sm" onClick={handleBulkCheckin} disabled={working} className="bg-amber-600 hover:bg-amber-500 text-white font-semibold">
                  {working ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <ArrowDown className="mr-1 h-3 w-3" />}
                  Check In {checkedOutCount} item{checkedOutCount > 1 ? "s" : ""}
                </Button>
              )}
            </>
          )
        })()}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
              <th className="pb-2 pr-2 w-8"></th>
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Category</th>
              <th className="pb-2 pr-4 text-center">Total</th>
              <th className="pb-2 pr-4 text-center">Out</th>
              <th className="pb-2 pr-4 text-center">Available</th>
              <th className="pb-2 pr-4">Condition</th>
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((eq) => {
              const eqOut = usages.filter((u) => u.equipmentId === eq.id && !u.returnedAt)
              const outCount = eqOut.reduce((s, u) => s + u.quantityOut, 0)
              const available = eq.quantity - outCount
              const isOut = outCount > 0

              return (
                <tr key={eq.id} className={`border-b border-zinc-800/50 ${isOut ? "bg-amber-950/30" : selected.has(eq.id) ? "bg-amber-900/10" : ""}`}>
                  <td className="py-2 pr-2">
                    <input type="checkbox" checked={selected.has(eq.id)} onChange={() => toggleSelect(eq.id)} className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-amber-500" />
                  </td>
                  <td className="py-2 pr-4 font-medium text-white">
                    {eq.name}
                    {isOut && <span className="ml-2 inline-block rounded bg-amber-600/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-400">Checked Out</span>}
                  </td>
                  <td className="py-2 pr-4 text-zinc-400 capitalize">{eq.category}</td>
                  <td className="py-2 pr-4 text-center text-zinc-300">{eq.quantity}</td>
                  <td className="py-2 pr-4 text-center">{outCount > 0 ? <span className="text-amber-400 font-medium">{outCount}</span> : <span className="text-zinc-600">0</span>}</td>
                  <td className="py-2 pr-4 text-center"><span className={available > 0 ? "text-green-400" : "text-red-400"}>{available}</span></td>
                  <td className={`py-2 pr-4 capitalize ${getConditionColor(eq.condition)}`}>{eq.condition}</td>
                  <td className="py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {available > 0 && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" disabled={working} onClick={() => handleCheckout(eq.id)}>
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                      )}
                      {isOut && (
                        <Button size="sm" className="h-7 px-3 text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold" disabled={working} onClick={() => handleCheckin(eqOut[0].id)}>
                          <ArrowDown className="mr-1 h-3 w-3" /> Check In
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {checkedOutItems.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-400">Currently Checked Out ({checkedOutItems.length})</h3>
          <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
            {checkedOutItems.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <LogOut className="h-3 w-3 text-amber-400" />
                  <span className="text-sm font-medium text-white">{u.equipment.name}</span>
                  <span className="text-xs text-zinc-500">→ {u.checkedOutBy}</span>
                  {u.eventName && <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">{u.eventName}</span>}
                </div>
                <Button size="sm" className="h-7 px-3 text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold" disabled={working} onClick={() => handleCheckin(u.id)}>
                  <ArrowDown className="mr-1 h-3 w-3" /> Return
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
