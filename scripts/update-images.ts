import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const url = process.env.DATABASE_URL ?? "file:./dev.db"
const adapter = new PrismaLibSql({ url })
const prisma = new PrismaClient({ adapter })

const archeryImages = [
  "/products/archery/bow-01.jpg",
  "/products/archery/archer-01.jpg",
  "/products/archery/target-01.jpg",
  "/products/archery/arrow-01.jpg",
]

const survivalImages = [
  "/products/survival/knife-01.jpg",
  "/products/survival/pocket-knife-01.jpg",
  "/products/survival/multitool-01.jpg",
  "/products/survival/tactical-01.jpg",
  "/products/survival/backpack-01.jpg",
  "/products/survival/axe-01.jpg",
]

const apparelImages = [
  "/products/apparel/tshirts-01.jpg",
  "/products/apparel/hoodie-01.jpg",
  "/products/apparel/hoodie-02.jpg",
  "/products/apparel/hoodie-03.jpg",
  "/products/apparel/hoodie-04.jpg",
  "/products/apparel/clothing-stack-01.jpg",
]

async function main() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "asc" } })
  const archery = await prisma.category.findUnique({ where: { slug: "archery" } })
  const survival = await prisma.category.findUnique({ where: { slug: "survival" } })

  let ai = 0, si = 0, api = 0

  for (const p of products) {
    let img: string
    if (p.categoryId === archery!.id) {
      img = archeryImages[ai % archeryImages.length]
      ai++
    } else if (p.categoryId === survival!.id) {
      img = survivalImages[si % survivalImages.length]
      si++
    } else {
      img = apparelImages[api % apparelImages.length]
      api++
    }

    await prisma.product.update({
      where: { id: p.id },
      data: { images: JSON.stringify([img]) },
    })
    console.log(`${p.name} -> ${img}`)
  }

  console.log(`\nUpdated ${products.length} products with images.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
