"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  inventory: number
}

export function AddToCartButton({ product }: { product: Product }) {
  function handleAddToCart() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const existing = cart.find((item: { id: string }) => item.id === product.id)
    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 })
    }
    localStorage.setItem("cart", JSON.stringify(cart))
    window.dispatchEvent(new Event("cart-updated"))
    alert(`${product.name} added to cart!`)
  }

  return (
    <Button
      size="lg"
      className="w-full gap-2 sm:w-auto"
      onClick={handleAddToCart}
      disabled={product.inventory === 0}
    >
      <ShoppingCart className="h-5 w-5" />
      {product.inventory === 0 ? "Out of Stock" : "Add to Cart"}
    </Button>
  )
}
