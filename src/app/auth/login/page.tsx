"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Target } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const res = await signIn("credentials", {
      email: form.get("email") as string,
      password: form.get("password") as string,
      redirect: false,
    })

    setLoading(false)
    if (res?.error) {
      setError("Invalid email or password")
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-20">
      <Card className="w-full">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Target className="h-6 w-6 text-amber-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">Welcome Back</h1>
          <p className="mt-1 text-zinc-600">Sign in to unlock your 10% member discount</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            required
            placeholder="Enter your password"
          />
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-600">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-medium text-amber-600 hover:text-amber-700">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  )
}
