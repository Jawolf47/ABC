import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardGrid } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { Target, Shield, Shirt } from "lucide-react"

const categoryIcons: Record<string, typeof Target> = {
  archery: Target,
  survival: Shield,
  apparel: Shirt,
}

interface StorePageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const { category } = await searchParams

  const products = await prisma.product.findMany({
    where: {
      published: true,
      ...(category ? { category: { slug: category } } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  })

  const categories = await prisma.category.findMany()

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
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            !category
              ? "bg-amber-600 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => {
          const Icon = categoryIcons[cat.slug]
          return (
            <Link
              key={cat.id}
              href={`/store?category=${cat.slug}`}
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
            const Icon = categoryIcons[product.category.slug] || Target
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
                    <Badge variant="primary">{product.category.name}</Badge>
                    <h3 className="mt-2 font-semibold text-zinc-900 group-hover:text-amber-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-lg font-bold text-amber-600">
                        {formatPrice(product.price)}
                      </span>
                      {product.comparePrice && (
                        <span className="text-sm text-zinc-400 line-through">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                    </div>
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
