"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface CartItem {
  itemKey: string
  id: string
  name: string
  price: number
  quantity: number
  size?: string | null
  color?: string | null
  originalPrice?: number
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadCart()
    const handler = () => loadCart()
    window.addEventListener("cart-updated", handler)
    return () => window.removeEventListener("cart-updated", handler)
  }, [])

  function loadCart() {
    setItems(JSON.parse(localStorage.getItem("cart") || "[]"))
  }

  function updateQuantity(itemKey: string, delta: number) {
    const newItems = items
      .map((item) =>
        item.itemKey === itemKey ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
      )
      .filter((item) => item.quantity > 0)
    setItems(newItems)
    localStorage.setItem("cart", JSON.stringify(newItems))
    window.dispatchEvent(new Event("cart-updated"))
  }

  function removeItem(itemKey: string) {
    const newItems = items.filter((item) => item.itemKey !== itemKey)
    setItems(newItems)
    localStorage.setItem("cart", JSON.stringify(newItems))
    window.dispatchEvent(new Event("cart-updated"))
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const hasMemberDiscount = items.some((item) => item.originalPrice)

  if (!mounted) return null

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="mt-12 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-zinc-300" />
          <h2 className="mt-4 text-xl font-semibold text-zinc-600">Your cart is empty</h2>
          <p className="mt-2 text-zinc-500">Ready to gear up? Browse our store.</p>
          <Link href="/store">
            <Button className="mt-6 gap-2">
              <ShoppingBag className="h-4 w-4" /> Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 space-y-4">
            {items.map((item) => (
              <Card key={item.itemKey} padding="sm" className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-zinc-900">{item.name}</h3>
                  {(item.color || item.size) && (
                    <p className="text-sm text-zinc-400">
                      {item.color}{item.color && item.size ? " / " : ""}{item.size}
                    </p>
                  )}
                  <p className="text-sm text-zinc-500">
                    {item.originalPrice ? (
                      <>
                        <span className="text-zinc-400 line-through">{formatPrice(item.originalPrice)}</span>{" "}
                        <span className="text-amber-600">{formatPrice(item.price)}</span>
                      </>
                    ) : (
                      <>{formatPrice(item.price)} each</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.itemKey, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-100"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.itemKey, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-100"
                  >
                    +
                  </button>
                </div>
                <p className="w-20 text-right font-semibold text-zinc-900">
                  {formatPrice(item.price * item.quantity)}
                </p>
                <button
                  onClick={() => removeItem(item.itemKey)}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6">
            {hasMemberDiscount && (
              <div className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700">
                Member discount (10%) applied to eligible items.
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-zinc-900">Total</span>
              <span className="text-2xl font-bold text-amber-600">{formatPrice(total)}</span>
            </div>
            <Button size="lg" className="mt-4 w-full gap-2">
              Proceed to Checkout
            </Button>
            <Link
              href="/store"
              className="mt-3 flex items-center justify-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Continue Shopping
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
