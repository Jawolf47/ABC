"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, Wrench, Receipt, ArrowLeft, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const sidebarLinks = [
  { href: "/coach", label: "Dashboard", icon: LayoutDashboard },
  { href: "/coach/bookings", label: "Bookings", icon: Calendar },
  { href: "/coach/equipment", label: "Equipment", icon: Wrench },
  { href: "/coach/expenses", label: "My Expenses", icon: Receipt },
]

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
    if (status === "authenticated" && session?.user?.role !== "coach" && session?.user?.role !== "admin") router.push("/")
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!session || (session.user.role !== "coach" && session.user.role !== "admin")) return null

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <aside className="hidden w-64 border-r border-zinc-800 bg-zinc-900 lg:block">
        <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-6">
          <span className="text-lg font-bold text-white">Coach Panel</span>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {sidebarLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-amber-600/10 text-amber-500"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-zinc-800 p-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Site
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="border-b border-zinc-800 bg-zinc-900 px-6 py-4 lg:hidden">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-white">Coach</span>
            <Link href="/" className="text-sm text-zinc-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {sidebarLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-amber-600/10 text-amber-500"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
