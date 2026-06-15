import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Shield, Target } from "lucide-react"
import { AddToCartButton } from "./add-to-cart-button"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  })

  if (!product) notFound()

  const images = JSON.parse(product.images) as string[]

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
              {product.category.slug === "archery" ? (
                <Target className="h-20 w-20 text-zinc-300" />
              ) : (
                <Shield className="h-20 w-20 text-zinc-300" />
              )}
            </div>
          )}
        </div>

        <div>
          <Badge variant="primary" className="mb-4 capitalize">
            {product.category.name}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-amber-600">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-lg text-zinc-400 line-through">
                {formatPrice(product.comparePrice)}
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

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  )
}
