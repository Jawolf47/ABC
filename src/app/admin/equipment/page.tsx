"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Loader2, Plus, Trash2, Package, AlertTriangle, LogOut, LogIn, Calendar, ArrowDown, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface Equipment {
  id: string; name: string; category: string; quantity: number; condition: string
  purchaseDate: string | null; purchaseCost: number | null; currentValue: number | null
  serialNumber: string | null; notes: string | null; active: boolean
}

interface EquipmentUsage {
  id: string; equipmentId: string; bookingId: string | null; eventName: string | null
  date: string; checkedOutBy: string; quantityOut: number; checkedOutAt: string
  returnedAt: string | null; conditionOut: string; conditionIn: string | null; returnedBy: string | null; notes: string | null
  equipment: { name: string; category: string }
}

const CATEGORIES = ["bow", "arrow", "target", "accessory", "safety", "maintenance", "other"]
const CONDITIONS = ["excellent", "good", "fair", "poor", "needs repair"]

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

export default function EquipmentPage() {
  const { data: session } = useSession()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [usages, setUsages] = useState<EquipmentUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"inventory" | "log">("inventory")
  const [logDate, setLogDate] = useState(toDateString(new Date()))
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [conditionFilter, setConditionFilter] = useState<string>("all")
  const [working, setWorking] = useState(false)

  const [form, setForm] = useState({
    name: "", category: "bow", quantity: 1, condition: "good",
    purchaseDate: "", purchaseCost: "", currentValue: "", serialNumber: "", notes: "",
  })

  const adminName = session?.user?.name || "Admin"

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

  const resetForm = () => {
    setForm({ name: "", category: "bow", quantity: 1, condition: "good", purchaseDate: "", purchaseCost: "", currentValue: "", serialNumber: "", notes: "" })
    setShowForm(false)
    setEditId(null)
  }

  const handleAddEdit = async () => {
    if (!form.name) return
    const payload = {
      name: form.name, category: form.category, quantity: Number(form.quantity) || 1,
      condition: form.condition,
      purchaseCost: form.purchaseCost ? Number(form.purchaseCost) : null,
      currentValue: form.currentValue ? Number(form.currentValue) : null,
      purchaseDate: form.purchaseDate || null, serialNumber: form.serialNumber || null,
      notes: form.notes || null,
    }
    const url = editId ? `/api/admin/equipment/${editId}` : "/api/admin/equipment"
    await fetch(url, { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    resetForm()
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this equipment?")) return
    await fetch(`/api/admin/equipment/${id}`, { method: "DELETE" })
    fetchData()
  }

  const handleEdit = (eq: Equipment) => {
    setForm({
      name: eq.name, category: eq.category, quantity: eq.quantity, condition: eq.condition,
      purchaseDate: eq.purchaseDate ? eq.purchaseDate.split("T")[0] : "",
      purchaseCost: eq.purchaseCost?.toString() || "", currentValue: eq.currentValue?.toString() || "",
      serialNumber: eq.serialNumber || "", notes: eq.notes || "",
    })
    setEditId(eq.id)
    setShowForm(true)
  }

  const checkout = async (eqId: string) => {
    await fetch("/api/admin/equipment-usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        equipmentId: eqId, date: logDate, checkedOutBy: adminName,
        quantityOut: 1, conditionOut: "good",
      }),
    })
  }

  const checkin = async (usageId: string) => {
    const u = usages.find((x) => x.id === usageId)
    await fetch("/api/admin/equipment-usage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: usageId, conditionIn: u?.conditionOut || "good", returnedBy: adminName }),
    })
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
        await checkout(eqId)
      }
    }
    setSelected(new Set())
    setWorking(false)
    fetchData()
  }

  const handleBulkCheckin = async () => {
    if (selected.size === 0) return
    setWorking(true)
    const toReturn = usages.filter((u) => !u.returnedAt && selected.has(u.equipmentId))
    for (const u of toReturn) {
      await checkin(u.id)
    }
    setSelected(new Set())
    setWorking(false)
    fetchData()
  }

  const handleSingleCheckout = async (eqId: string) => {
    setWorking(true)
    await checkout(eqId)
    setWorking(false)
    fetchData()
  }

  const handleSingleCheckin = async (usageId: string) => {
    setWorking(true)
    await checkin(usageId)
    setWorking(false)
    fetchData()
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
    if (selected.size === filteredEquipment.length) setSelected(new Set())
    else setSelected(new Set(filteredEquipment.map((e) => e.id)))
  }

  const filteredEquipment = equipment.filter((eq) => {
    if (categoryFilter !== "all" && eq.category !== categoryFilter) return false
    if (conditionFilter !== "all" && eq.condition !== conditionFilter) return false
    return true
  })

  const checkedOutItems = usages.filter((u) => !u.returnedAt)
  const returnedToday = usages.filter((u) => u.returnedAt)
  const totalItems = equipment.reduce((sum, eq) => sum + eq.quantity, 0)
  const totalCheckedOut = checkedOutItems.reduce((sum, u) => sum + u.quantityOut, 0)
  const needsRepair = equipment.filter((eq) => eq.condition === "needs repair").length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Equipment</h1>
          <p className="mt-1 text-sm text-zinc-400">Track inventory and daily equipment checkout/return.</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm) }}>
          <Plus className="mr-1 h-4 w-4" /> {showForm ? "Cancel" : "Add Equipment"}
        </Button>
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

      {showForm && (
        <Card className="border-zinc-800 bg-zinc-900 p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">{editId ? "Edit" : "Add"} Equipment</h3>
          <div className="grid gap-3 sm:grid-cols-4">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name *" className="border-zinc-700 bg-zinc-800 text-sm text-white" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <Input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} placeholder="Qty" className="border-zinc-700 bg-zinc-800 text-sm text-white" />
            <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white">
              {CONDITIONS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <Input value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} placeholder="Serial #" className="border-zinc-700 bg-zinc-800 text-sm text-white" />
            <Input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} className="border-zinc-700 bg-zinc-800 text-sm text-white" />
            <Input type="number" min="0" step="0.01" value={form.purchaseCost} onChange={(e) => setForm({ ...form, purchaseCost: e.target.value })} placeholder="Cost ($)" className="border-zinc-700 bg-zinc-800 text-sm text-white" />
            <Input type="number" min="0" step="0.01" value={form.currentValue} onChange={(e) => setForm({ ...form, currentValue: e.target.value })} placeholder="Value ($)" className="border-zinc-700 bg-zinc-800 text-sm text-white" />
            <div className="sm:col-span-4">
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="border-zinc-700 bg-zinc-800 text-sm text-white" />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleAddEdit}>{editId ? "Update" : "Add"}</Button>
            <Button size="sm" variant="ghost" onClick={resetForm}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        <Button size="sm" variant={activeTab === "inventory" ? "primary" : "ghost"} onClick={() => setActiveTab("inventory")}>Inventory</Button>
        <Button size="sm" variant={activeTab === "log" ? "primary" : "ghost"} onClick={() => setActiveTab("log")}>Daily Log</Button>
      </div>

      {activeTab === "inventory" && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={selected.size === filteredEquipment.length && filteredEquipment.length > 0} onChange={toggleAll} className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-amber-500" />
              <span className="text-xs text-zinc-500">{selected.size > 0 ? `${selected.size} selected` : "Select all"}</span>
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-white">
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-white">
              <option value="all">All Conditions</option>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            {selected.size > 0 && (() => {
              const selectedArr = Array.from(selected)
              const checkedOutCount = selectedArr.filter((id) => {
                const eq = equipment.find((e) => e.id === id)
                if (!eq) return false
                return usages.some((u) => u.equipmentId === eq.id && !u.returnedAt)
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
                  <th className="pb-2 pr-4">Serial #</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipment.map((eq) => {
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
                      <td className="py-2 pr-4 text-center">
                        {isOut ? <span className="text-amber-400 font-medium">{outCount}</span> : <span className="text-zinc-600">0</span>}
                      </td>
                      <td className="py-2 pr-4 text-center">
                        <span className={available > 0 ? "text-green-400" : "text-red-400"}>{available}</span>
                      </td>
                      <td className={`py-2 pr-4 capitalize ${getConditionColor(eq.condition)}`}>{eq.condition}</td>
                      <td className="py-2 pr-4 text-zinc-500 text-xs">{eq.serialNumber || "-"}</td>
                      <td className="py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {available > 0 && (
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" disabled={working} onClick={() => handleSingleCheckout(eq.id)}>
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                          )}
                          {isOut && (
                            <Button size="sm" className="h-7 px-3 text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold" disabled={working} onClick={() => handleSingleCheckin(eqOut[0].id)}>
                              <ArrowDown className="mr-1 h-3 w-3" /> Check In
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => handleEdit(eq)}>Edit</Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => handleDelete(eq.id)}>
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredEquipment.length === 0 && (
            <p className="py-12 text-center text-zinc-500">No equipment found.</p>
          )}
        </>
      )}

      {activeTab === "log" && (
        <Card className="border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-4 flex items-center gap-3">
            <Calendar className="h-4 w-4 text-amber-400" />
            <label className="text-sm text-zinc-400">Date:</label>
            <Input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} className="w-48 border-zinc-700 bg-zinc-800 text-sm text-white" />
          </div>

          {checkedOutItems.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-400">Checked Out ({checkedOutItems.length})</h3>
              <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-4 px-4 py-1.5 text-xs text-zinc-500">
                  <span className="w-5 shrink-0" />
                  <span className="w-40 shrink-0">Equipment</span>
                  <span className="w-12 shrink-0 text-center">Qty</span>
                  <span className="w-36 shrink-0">Checked Out By</span>
                  <span className="w-20 shrink-0 text-center">Category</span>
                  <span className="w-20 shrink-0 text-center">Condition</span>
                  <div className="flex-1" />
                </div>
                {checkedOutItems.map((u) => (
                  <div key={u.id} className="flex items-center gap-4 px-4 py-2.5">
                    <LogOut className="h-3 w-3 shrink-0 text-amber-400" />
                    <span className="w-40 shrink-0 truncate text-sm font-medium text-white">{u.equipment.name}</span>
                    <span className="w-12 shrink-0 text-center text-sm text-zinc-400">×{u.quantityOut}</span>
                    <span className="w-36 shrink-0 truncate text-sm text-zinc-400">{u.checkedOutBy}</span>
                    <span className="w-20 shrink-0 text-center text-xs text-zinc-500 capitalize">{u.equipment.category}</span>
                    <span className={`w-20 shrink-0 text-center text-xs capitalize ${getConditionColor(u.conditionOut)}`}>{u.conditionOut}</span>
                    <div className="flex-1" />
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs shrink-0" disabled={working} onClick={() => handleSingleCheckin(u.id)}>
                      <ArrowDown className="mr-1 h-3 w-3" /> Return
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {returnedToday.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-green-400">Returned ({returnedToday.length})</h3>
              <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-4 px-4 py-1.5 text-xs text-zinc-500">
                  <span className="w-5 shrink-0" />
                  <span className="w-40 shrink-0">Equipment</span>
                  <span className="w-12 shrink-0 text-center">Qty</span>
                  <span className="w-36 shrink-0">Returned By</span>
                  <span className="w-20 shrink-0 text-center">Category</span>
                  <span className="w-20 shrink-0 text-center">Condition</span>
                </div>
                {returnedToday.map((u) => (
                  <div key={u.id} className="flex items-center gap-4 px-4 py-2.5">
                    <LogIn className="h-3 w-3 shrink-0 text-green-400" />
                    <span className="w-40 shrink-0 truncate text-sm font-medium text-white">{u.equipment.name}</span>
                    <span className="w-12 shrink-0 text-center text-sm text-zinc-400">×{u.quantityOut}</span>
                    <span className="w-36 shrink-0 truncate text-sm text-zinc-400">{u.returnedBy || u.checkedOutBy}</span>
                    <span className="w-20 shrink-0 text-center text-xs text-zinc-500 capitalize">{u.equipment.category}</span>
                    <span className={`w-20 shrink-0 text-center text-xs capitalize ${getConditionColor(u.conditionIn || u.conditionOut)}`}>{u.conditionIn || u.conditionOut}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {checkedOutItems.length === 0 && returnedToday.length === 0 && (
            <p className="py-8 text-center text-zinc-500">No equipment activity for this date.</p>
          )}
        </Card>
      )}
    </div>
  )
}
