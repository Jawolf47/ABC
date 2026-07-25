"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Menu, X, ShoppingCart, User, LogOut, Calendar, Package, Settings, Shield, GraduationCap, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/store", label: "Store", icon: Package },
  { href: "/booking", label: "Book a Session", icon: Calendar },
  { href: "/events", label: "Group Events" },
  { href: "/about", label: "About" },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const [showMenu, setShowMenu] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    function loadCart() {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]")
      const count = cart.reduce((sum: number, item: { quantity: number }) => sum + (item.quantity || 0), 0)
      setCartCount(count)
    }
    loadCart()
    window.addEventListener("cart-updated", loadCart)
    return () => window.removeEventListener("cart-updated", loadCart)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Alpha Bear Club" className="h-12 w-auto" />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white">Alpha Bear Club</span>
            <span className="-mt-1 text-[10px] font-medium uppercase tracking-widest text-amber-500">Archery & Survival</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {session ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-[11px] font-bold text-white">
                  {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="max-w-[100px] truncate">{session.user?.name || "Member"}</span>
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl">
                    <div className="border-b border-zinc-800 px-4 py-2">
                      <p className="text-xs text-zinc-500">Signed in as</p>
                      <p className="truncate text-sm font-medium text-white">
                        {session.user?.role === "admin" ? "Admin" : session.user?.role === "coach" ? "Coach" : "Customer"}
                      </p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setShowMenu(false)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                      <Settings className="h-4 w-4" />
                      My Account
                    </Link>
                    <Link
                      href="/account/bookings"
                      onClick={() => setShowMenu(false)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                      <Calendar className="h-4 w-4" />
                      My Bookings
                    </Link>
                    <Link
                      href="/account/progress"
                      onClick={() => setShowMenu(false)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                      <Target className="h-4 w-4" />
                      My Progress
                    </Link>
                    {session.user?.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setShowMenu(false)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-amber-400 hover:bg-zinc-800 hover:text-amber-300"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}
                    {session.user?.role === "coach" && (
                      <Link
                        href="/coach"
                        onClick={() => setShowMenu(false)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-blue-400 hover:bg-zinc-800 hover:text-blue-300"
                      >
                        <GraduationCap className="h-4 w-4" />
                        Coach Panel
                      </Link>
                    )}
                    <button
                      onClick={() => { setShowMenu(false); signOut() }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="hidden text-zinc-400 hover:bg-zinc-800 hover:text-white sm:flex">
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}

          <Link href="/booking">
            <Button size="sm" className="hidden sm:flex">
              Book Now
            </Button>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 md:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-zinc-800 bg-zinc-950 transition-all duration-300 md:hidden",
          open ? "max-h-[600px]" : "max-h-0"
        )}
        >
          <nav className="flex flex-col gap-1 px-4 pb-4 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-zinc-800" />
            {session ? (
              <>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-[11px] font-bold text-white">
                    {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="truncate">{session.user?.name || "Member"}</span>
                </div>
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                  My Account
                </Link>
                <Link
                  href="/account/bookings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  <Calendar className="h-4 w-4" />
                  My Bookings
                </Link>
                <Link
                  href="/account/progress"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  <Target className="h-4 w-4" />
                  My Progress
                </Link>
                {session.user?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-amber-400 transition-colors hover:bg-zinc-800 hover:text-amber-300"
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                {session.user?.role === "coach" && (
                  <Link
                    href="/coach"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-blue-400 transition-colors hover:bg-zinc-800 hover:text-blue-300"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Coach Panel
                  </Link>
                )}
                <button
                  onClick={() => { setOpen(false); signOut() }}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <User className="h-4 w-4" />
                Sign In
              </Link>
            )}
          </nav>
      </div>
    </header>
  )
}
