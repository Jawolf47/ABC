import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  const category = searchParams.get("category")

  if (id) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    })
    return NextResponse.json(product)
  }

  const products = await prisma.product.findMany({
    where: {
      published: true,
      ...(category ? { category: { slug: category } } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
        images: JSON.stringify(data.images || []),
        categoryId: data.categoryId,
        inventory: parseInt(data.inventory) || 0,
        featured: data.featured || false,
      },
      include: { category: true },
    })
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
