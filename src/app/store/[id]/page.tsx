"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Shield, Shirt, Target } from "lucide-react"
import { ProductActions } from "./product-actions"

const MEMBER_DISCOUNT = 0.1

const categoryIcons: Record<string, typeof Target> = {
  archery: Target,
  survival: Shield,
  apparel: Shirt,
}

export default function ProductPage() {
  const { data: session } = useSession()
  const params = useParams()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/products?id=${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data) { setLoading(false); return }
        setProduct(Array.isArray(data) ? data[0] : data)
        setLoading(false)
      })
  }, [params.id])

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-zinc-500">Loading...</div>
  if (!product) notFound()

  const images = JSON.parse(product.images || "[]") as string[]
  const variants = JSON.parse(product.variants || "[]") as { color: string; sizes: string[] }[]
  const Icon = categoryIcons[product.category?.slug] || Target

  function formatPrice(price: number) {
    return `$${price.toFixed(2)}`
  }

  const discPrice = session ? product.price * (1 - MEMBER_DISCOUNT) : product.price

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/store"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Store
      </Link>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl bg-zinc-100">
          {images[0] ? (
            <img
              src={images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Icon className="h-20 w-20 text-zinc-300" />
            </div>
          )}
        </div>

        <div>
          {product.category?.name && (
            <Badge variant="primary" className="mb-4 capitalize">
              {product.category.name}
            </Badge>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-amber-600">
              {formatPrice(discPrice)}
            </span>
            {session && discPrice !== product.price && (
              <span className="text-lg text-zinc-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
            {!session && product.comparePrice && (
              <span className="text-lg text-zinc-400 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
            {session && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold uppercase text-amber-700">
                -{Math.round(MEMBER_DISCOUNT * 100)}%
              </span>
            )}
          </div>
          <p className="mt-6 text-lg leading-relaxed text-zinc-600">
            {product.description}
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  product.inventory > 0 ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {product.inventory > 0
                ? `In Stock (${product.inventory} available)`
                : "Out of Stock"}
            </div>
          </div>

          <ProductActions product={product} variants={variants} />
        </div>
      </div>
    </div>
  )
}
