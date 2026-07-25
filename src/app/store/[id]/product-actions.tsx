"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

const MEMBER_DISCOUNT = 0.1

interface Variant {
  color: string
  sizes: string[]
}

interface Product {
  id: string
  name: string
  price: number
  inventory: number
}

export function ProductActions({
  product,
  variants,
}: {
  product: Product
  variants: Variant[]
}) {
  const { data: session } = useSession()
  const [selectedColor, setSelectedColor] = useState(variants[0]?.color ?? "")
  const [selectedSize, setSelectedSize] = useState(variants[0]?.sizes[0] ?? "")

  const memberPrice = session ? Math.round(product.price * (1 - MEMBER_DISCOUNT) * 100) / 100 : product.price
  const current = variants.find((v) => v.color === selectedColor)
  const sizes = current?.sizes ?? []

  function handleAddToCart() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const hasVariant = variants.length > 0
    const color = hasVariant ? selectedColor : ""
    const size = hasVariant ? selectedSize : ""
    const itemKey = hasVariant ? `${product.id}-${size}-${color}` : product.id

    const existing = cart.find((item: { itemKey: string }) => item.itemKey === itemKey)
    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({
        itemKey,
        id: product.id,
        name: product.name,
        price: memberPrice,
        originalPrice: session ? product.price : undefined,
        quantity: 1,
        size: hasVariant ? size : null,
        color: hasVariant ? color : null,
      })
    }
    localStorage.setItem("cart", JSON.stringify(cart))
    window.dispatchEvent(new Event("cart-updated"))
  }

  return (
    <>
      {variants.length > 0 && (
        <div className="mt-8 space-y-6">
          <div>
            <p className="text-sm font-medium text-zinc-900">
              Color: <span className="text-zinc-500">{selectedColor}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {variants.map((v) => (
                <button
                  key={v.color}
                  onClick={() => {
                    setSelectedColor(v.color)
                    setSelectedSize(v.sizes[0])
                  }}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                    selectedColor === v.color
                      ? "border-amber-600 bg-amber-50 text-amber-700"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300",
                  )}
                >
                  {v.color}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-900">
              Size: <span className="text-zinc-500">{selectedSize}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                    selectedSize === s
                      ? "border-amber-600 bg-amber-50 text-amber-700"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="w-full gap-2 sm:w-auto"
          onClick={handleAddToCart}
          disabled={product.inventory === 0}
        >
          <ShoppingCart className="h-5 w-5" />
          {product.inventory === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </>
  )
}
