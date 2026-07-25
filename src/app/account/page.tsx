"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { User, Phone, MapPin, Users, Gift, Save, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Profile {
  name: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  zip: string
  guestsTypical: number | null
  birthDate: string
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState<Profile>({
    name: "", email: "", phone: "", street: "", city: "", state: "", zip: "",
    guestsTypical: null, birthDate: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }
    if (session?.user) {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          setProfile({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            street: data.street || "",
            city: data.city || "",
            state: data.state || "",
            zip: data.zip || "",
            guestsTypical: data.guestsTypical || null,
            birthDate: data.birthDate || "",
          })
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [session, status, router])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
      if (res.ok) {
        const updated = await res.json()
        setProfile(updated)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  const states = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
    "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
    "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
    "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
    "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
  ]

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="mt-2 text-zinc-400">Manage your personal information and preferences.</p>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-white">Personal Information</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-zinc-400">Full Name</label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="border-zinc-700 bg-zinc-800 text-white"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400">Email</label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="border-zinc-700 bg-zinc-800 text-white"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="border-zinc-700 bg-zinc-800 pl-10 text-white"
                    placeholder="(248) 555-0123"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-zinc-400">Date of Birth</label>
                <Input
                  type="date"
                  value={profile.birthDate}
                  onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                  className="border-zinc-700 bg-zinc-800 text-white"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-white">Address</h2>
            </div>
            <div className="grid gap-4">
              <div>
                <label className="text-sm text-zinc-400">Street Address</label>
                <Input
                  value={profile.street}
                  onChange={(e) => setProfile({ ...profile, street: e.target.value })}
                  className="border-zinc-700 bg-zinc-800 text-white"
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-sm text-zinc-400">City</label>
                  <Input
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="border-zinc-700 bg-zinc-800 text-white"
                    placeholder="Farmington Hills"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400">State</label>
                  <select
                    value={profile.state}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                  >
                    <option value="">Select</option>
                    {states.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-zinc-400">ZIP Code</label>
                  <Input
                    value={profile.zip}
                    onChange={(e) => setProfile({ ...profile, zip: e.target.value })}
                    className="border-zinc-700 bg-zinc-800 text-white"
                    placeholder="48335"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-white">Event Preferences</h2>
            </div>
            <div>
              <label className="text-sm text-zinc-400">Typical Guest Count</label>
              <p className="mb-2 text-xs text-zinc-500">Used to pre-fill booking forms for faster reservations.</p>
              <Input
                type="number"
                min={1}
                max={100}
                value={profile.guestsTypical ?? ""}
                onChange={(e) => setProfile({ ...profile, guestsTypical: e.target.value ? parseInt(e.target.value) : null })}
                className="w-32 border-zinc-700 bg-zinc-800 text-white"
                placeholder="e.g. 6"
              />
            </div>
          </div>

          <div className="rounded-xl border border-amber-900/30 bg-amber-950/20 p-6">
            <div className="mb-3 flex items-center gap-2">
              <Gift className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Member Benefits</h2>
            </div>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-500" />
                10% off store items, bookings, and cart
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-500" />
                Priority booking access
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-500" />
                Early access to special events
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-500" />
                Personalized experience with your profile info
              </li>
            </ul>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-amber-600 text-white hover:bg-amber-700"
            size="lg"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : saved ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saved ? "Saved!" : saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </div>
  )
}
