"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardGrid } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Shield, Shirt } from "lucide-react"

const MEMBER_DISCOUNT = 0.1

const categoryIcons: Record<string, typeof Target> = {
  archery: Target,
  survival: Shield,
  apparel: Shirt,
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  comparePrice: number | null
  images: string
  variants: string
  category: { slug: string; name: string }
}

const CATEGORIES = [
  { slug: "archery", name: "Archery" },
  { slug: "survival", name: "Survival Gear" },
  { slug: "apparel", name: "Apparel" },
]

export default function StorePage() {
  const { data: session } = useSession()
  const [category, setCategory] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const cat = params.get("category")
    setCategory(cat)
  }, [])

  useEffect(() => {
    const url = category ? `/api/products?category=${category}` : "/api/products"
    fetch(url)
      .then((r) => r.json())
      .then(setProducts)
  }, [category])

  function formatPrice(price: number) {
    return `$${price.toFixed(2)}`
  }

  function memberPrice(price: number) {
    return session ? price * (1 - MEMBER_DISCOUNT) : price
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Store</h1>
          <p className="mt-2 text-zinc-600">
            {category
              ? `Browse our ${category} collection`
              : "Premium archery equipment, survival gear, and apparel"}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/store"
          onClick={() => setCategory(null)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            !category
              ? "bg-amber-600 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((cat) => {
          const Icon = categoryIcons[cat.slug]
          return (
            <Link
              key={cat.slug}
              href={`/store?category=${cat.slug}`}
              onClick={() => setCategory(cat.slug)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                category === cat.slug
                  ? "bg-amber-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {cat.name}
            </Link>
          )
        })}
      </div>

      {products.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-lg text-zinc-500">No products found in this category.</p>
        </div>
      ) : (
        <CardGrid className="mt-8">
          {products.map((product) => {
            const images = JSON.parse(product.images) as string[]
            const variants = JSON.parse(product.variants) as { color: string; sizes: string[] }[]
            const Icon = categoryIcons[product.category?.slug] || Target
            const discPrice = memberPrice(product.price)
            return (
              <Link key={product.id} href={`/store/${product.id}`}>
                <Card className="group h-full transition-all hover:shadow-md">
                  <div className="aspect-square overflow-hidden rounded-lg bg-zinc-100">
                    {images[0] ? (
                      <img
                        src={images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-400">
                        <Icon className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    {product.category?.name && (
                      <Badge variant="primary">{product.category.name}</Badge>
                    )}
                    <h3 className="mt-2 font-semibold text-zinc-900 group-hover:text-amber-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-lg font-bold text-amber-600">
                        {formatPrice(discPrice)}
                      </span>
                      {session && product.price !== discPrice && (
                        <span className="text-sm text-zinc-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                      {!session && product.comparePrice && (
                        <span className="text-sm text-zinc-400 line-through">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                      {session && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                          -{Math.round(MEMBER_DISCOUNT * 100)}%
                        </span>
                      )}
                    </div>
                    {variants.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {variants.slice(0, 4).map((v) => (
                          <span key={v.color} className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                            {v.color}
                          </span>
                        ))}
                        {variants.length > 4 && (
                          <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500">
                            +{variants.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                      {product.description}
                    </p>
                  </div>
                </Card>
              </Link>
            )
          })}
        </CardGrid>
      )}
    </div>
  )
}
