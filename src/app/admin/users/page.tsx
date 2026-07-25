"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Loader2, Search, ChevronDown, ChevronUp, Calendar, MapPin, Phone, Users, Shield, ShieldOff, GraduationCap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface UserSummary {
  id: string
  name: string | null
  email: string | null
  role: string
  createdAt: string
}

interface UserDetail {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  street: string | null
  city: string | null
  state: string | null
  zip: string | null
  guestsTypical: number | null
  birthDate: string | null
  role: string
  createdAt: string
}

interface Booking {
  id: string
  date: string
  timeSlot: string
  guests: number
  duration: number
  status: string
  payment: string
  total: number | null
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  const dt = new Date(`${y}-${m}-${day}T12:00:00`)
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<{ user: UserDetail; bookings: Booking[] } | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || [])
        setLoading(false)
      })
  }, [])

  const expandUser = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
      setDetail(null)
      return
    }
    setExpandedId(id)
    setDetailLoading(true)
    const res = await fetch(`/api/admin/users?id=${id}`)
    const data = await res.json()
    setDetail(data)
    setDetailLoading(false)
  }

  const cycleRole = async (id: string, currentRole: string) => {
    const order = ["customer", "coach", "admin"]
    const nextIdx = (order.indexOf(currentRole) + 1) % order.length
    const newRole = order[nextIdx]
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role: newRole }),
    })
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: newRole } : u))
    if (detail?.user.id === id) {
      setDetail({ ...detail, user: { ...detail.user, role: newRole } })
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Users</h1>
      <p className="mt-1 text-sm text-zinc-400">View registered users and their details.</p>

      <div className="mt-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="border-zinc-700 bg-zinc-800 pl-10 text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-zinc-500">No users found.</div>
      ) : (
        <div className="mt-6 space-y-2">
          {filtered.map((u) => {
            const isExpanded = expandedId === u.id
            return (
              <div key={u.id} className="rounded-lg border border-zinc-800 bg-zinc-900">
                <div
                  className="flex cursor-pointer items-center gap-3 px-3 py-3 transition-colors hover:bg-zinc-800/50 sm:gap-6 sm:px-4"
                  onClick={() => expandUser(u.id)}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white sm:h-9 sm:w-9">
                    {u.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="w-28 shrink-0 truncate font-medium text-white sm:w-40">{u.name || "Unnamed"}</span>
                  <span className="hidden w-56 shrink-0 truncate text-sm text-zinc-500 sm:block">{u.email}</span>
                  {u.role === "admin" ? (
                    <span className="shrink-0 rounded bg-amber-900/50 px-1.5 py-0.5 text-xs font-medium text-amber-400 sm:px-2">Admin</span>
                  ) : u.role === "coach" ? (
                    <span className="shrink-0 rounded bg-blue-900/50 px-1.5 py-0.5 text-xs font-medium text-blue-400 sm:px-2">Coach</span>
                  ) : (
                    <span className="shrink-0 rounded bg-green-900/50 px-1.5 py-0.5 text-xs font-medium text-green-400 sm:px-2">Customer</span>
                  )}
                  <div className="flex-1" />
                  <span className="hidden shrink-0 text-xs text-zinc-600 sm:block">{new Date(u.createdAt).toLocaleDateString()}</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0 text-zinc-500" /> : <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />}
                </div>

                {isExpanded && (
                  <div className="border-t border-zinc-800 px-4 py-4">
                    {detailLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                      </div>
                    ) : detail ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          {detail.user.role === "admin" ? (
                            <span className="rounded bg-amber-900/50 px-2 py-0.5 text-xs font-medium text-amber-400">Admin</span>
                          ) : detail.user.role === "coach" ? (
                            <span className="rounded bg-blue-900/50 px-2 py-0.5 text-xs font-medium text-blue-400">Coach</span>
                          ) : (
                            <span className="rounded bg-green-900/50 px-2 py-0.5 text-xs font-medium text-green-400">Customer</span>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={detail.user.id === session?.user?.id || (detail.user.id === "cmrmq0ksp000004l21bqbwxk2" || detail.user.id === "cmrwty8pf000004ktiqdwns9u") && detail.user.role === "admin"}
                            className="text-amber-400 hover:bg-amber-900/30 hover:text-amber-300"
                            onClick={() => cycleRole(detail.user.id, detail.user.role)}
                          >
                            {detail.user.role === "admin" ? (
                              <><ShieldOff className="mr-1 h-3 w-3" /> Demote</>
                            ) : detail.user.role === "coach" ? (
                              <><Shield className="mr-1 h-3 w-3" /> Promote to Admin</>
                            ) : (
                              <><GraduationCap className="mr-1 h-3 w-3" /> Make Coach</>
                            )}
                          </Button>
                          {(detail.user.id === session?.user?.id || detail.user.id === "cmrmq0ksp000004l21bqbwxk2" || detail.user.id === "cmrwty8pf000004ktiqdwns9u") && detail.user.role === "admin" && (
                            <span className="text-xs text-zinc-600">Protected admin</span>
                          )}
                        </div>

                        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                          {detail.user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-zinc-500" />
                              <span className="text-white">{detail.user.phone}</span>
                            </div>
                          )}
                          {detail.user.birthDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-zinc-500" />
                              <span className="text-white">DOB: {detail.user.birthDate}</span>
                            </div>
                          )}
                          {detail.user.guestsTypical && (
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3 text-zinc-500" />
                              <span className="text-white">Typical group: {detail.user.guestsTypical}</span>
                            </div>
                          )}
                          {(detail.user.street || detail.user.city) && (
                            <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-3">
                              <MapPin className="h-3 w-3 text-zinc-500" />
                              <span className="text-white">
                                {[detail.user.street, detail.user.city, detail.user.state, detail.user.zip].filter(Boolean).join(", ")}
                              </span>
                            </div>
                          )}
                          <div className="text-zinc-500">
                            Joined {new Date(detail.user.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {detail.bookings.length > 0 && (
                          <div>
                            <p className="mb-2 text-xs font-medium uppercase text-zinc-500">Booking History ({detail.bookings.length})</p>
                            <div className="space-y-1">
                              {detail.bookings.map((b) => (
                                <div key={b.id} className="flex items-center gap-3 rounded-md bg-zinc-800/50 px-3 py-2 text-sm">
                                  <span className="text-white">{formatDate(b.date)}</span>
                                  <span className="text-amber-400">{b.timeSlot}</span>
                                  <span className="text-zinc-500">{b.guests} shooter(s) · {b.duration}min</span>
                                  <span className={`rounded px-1.5 py-0.5 text-xs ${b.status === "cancelled" ? "bg-red-900/50 text-red-400" : "bg-green-900/50 text-green-400"}`}>{b.status}</span>
                                  <span className={`rounded px-1.5 py-0.5 text-xs ${b.payment === "paid" ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"}`}>{b.payment}</span>
                                  {b.total != null && <span className="text-zinc-400">${Number(b.total).toFixed(2)}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
