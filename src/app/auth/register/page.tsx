"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Target } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const password = form.get("password") as string
    const confirm = form.get("confirmPassword") as string

    if (password !== confirm) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password,
      }),
    })

    setLoading(false)
    if (res.ok) {
      router.push("/auth/login")
    } else {
      const data = await res.json()
      setError(data.error || "Something went wrong")
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-20">
      <Card className="w-full">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Target className="h-6 w-6 text-amber-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">Create Account</h1>
          <p className="mt-1 text-zinc-600">Join the Alpha Bear Club</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" id="name" name="name" required placeholder="John Doe" />
          <Input label="Email" id="email" name="email" type="email" required placeholder="you@example.com" />
          <Input label="Password" id="password" name="password" type="password" required placeholder="Min. 8 characters" />
          <Input label="Confirm Password" id="confirmPassword" name="confirmPassword" type="password" required placeholder="Repeat password" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            Create Account
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-amber-600 hover:text-amber-700">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}
