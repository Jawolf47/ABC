import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const url = process.env.DATABASE_URL ?? "file:./dev.db"
const adapter = new PrismaLibSql({ url })
const prisma = new PrismaClient({ adapter })

const sizes = ["XS", "S", "M", "L", "XL", "2XL"]

const apparelVariants: Record<string, [string, string[]]> = {
  "Alpha Bear Club T-Shirt - Black": ["Black", sizes],
  "Alpha Bear Club T-Shirt - Olive": ["Olive", sizes],
  "Alpha Bear Club T-Shirt - White": ["White", sizes],
  "Alpha Bear Club Performance Tee": ["Black", sizes],
  "Alpha Bear Club Hoodie - Black": ["Black", sizes],
  "Alpha Bear Club Hoodie - Grey": ["Charcoal Grey", sizes],
  "Alpha Bear Club Zip Hoodie": ["Black", sizes],
  "Alpha Bear Club Cap - Black": ["Black", ["OSFM"]],
  "Alpha Bear Club Cap - Olive": ["Olive", ["OSFM"]],
  "Alpha Bear Club Trucker Cap": ["Black/White", ["OSFM"]],
  "Alpha Bear Club Beanie": ["Black", ["OSFM"]],
  "Alpha Bear Club Patch (Iron-On)": ["Multi", ["3-inch"]],
}

const imageMap: Record<string, Record<string, string[]>> = {
  archery: {
    "Alpha Recurve Bow - 40lb": ["/products/archery/recurve-bow.jpg"],
    "Alpha Recurve Bow - 30lb": ["/products/archery/recurve-bow.jpg"],
    "Alpha Recurve Bow - 50lb": ["/products/archery/recurve-bow.jpg"],
    "Bear Archery Cruzer G2": ["/products/archery/compound-bow.jpg"],
    "Hoyt Torrex Compound Bow": ["/products/archery/compound-bow.jpg"],
    "PSE Brute NXT Compound Bow": ["/products/archery/compound-bow.jpg"],
    "Samick Sage Longbow": ["/products/archery/archer-01.jpg"],
    "Bear Montana Longbow": ["/products/archery/archer-01.jpg"],
    "Carbon X10 Arrows (Dozen)": ["/products/archery/arrows.jpg"],
    "Easton Carbon Arrows (Dozen)": ["/products/archery/arrows.jpg"],
    "Gold Tip Traditional Carbon Arrows (Dozen)": ["/products/archery/arrows.jpg"],
    "Aluminum Hunting Arrows (Dozen)": ["/products/archery/arrow-01.jpg"],
    "Easton XX75 Aluminum Arrows (Dozen)": ["/products/archery/arrow-01.jpg"],
    "Pine Wood Target Arrows (6-Pack)": ["/products/archery/arrow-01.jpg"],
    "Hickory Wood Longbow Arrows (6-Pack)": ["/products/archery/arrow-01.jpg"],
    "Youth Fiberglass Arrows (Dozen)": ["/products/archery/arrow-01.jpg"],
    "Tactical Finger Tab": ["/products/archery/target.jpg"],
    "Arm Guard Pro": ["/products/archery/target.jpg"],
    "Nylon Arm Guard": ["/products/archery/target.jpg"],
    "Deluxe Archery Quiver": ["/products/archery/quiver.jpg"],
    "Back Quiver - 12 Arrow": ["/products/archery/quiver.jpg"],
    "Pro Target Face Pack (50-pack)": ["/products/archery/target.jpg"],
    "3D Animal Target - Deer": ["/products/archery/target-01.jpg"],
    "Bag Target - 24x24x12": ["/products/archery/target-01.jpg"],
    "Bow Stand - Adjustable": ["/products/archery/target.jpg"],
    "Bow Stringer - Recurve": ["/products/archery/target.jpg"],
    "Arrow Rest - Drop Away": ["/products/archery/target.jpg"],
  },
  survival: {
    "Survival Knife - Bushcraft Pro": ["/products/survival/knife-01.jpg"],
    "Survival Knife - Compact EDC": ["/products/survival/pocket-knife-01.jpg"],
    "Emergency Fire Starter Kit": ["/products/survival/fire-starter.jpg"],
    "Ferro Rod - Survival XL": ["/products/survival/fire-starter.jpg"],
    "Tactical Backpack 45L": ["/products/survival/backpack-01.jpg"],
    "Tactical Backpack 25L": ["/products/survival/backpack-01.jpg"],
    "First Aid Trauma Kit": ["/products/survival/trauma-kit.jpg"],
    "Pocket First Aid Kit": ["/products/survival/trauma-kit.jpg"],
    "Water Filter - Trail Pro": ["/products/survival/tactical-01.jpg"],
    "Paracord - 550lb 100ft": ["/products/survival/tactical-01.jpg"],
    "Compass - Lensatic": ["/products/survival/compass.jpg"],
    "Emergency Blanket 4-Pack": ["/products/survival/tactical-01.jpg"],
  },
  apparel: {
    "Alpha Bear Club T-Shirt - Black": ["/products/apparel/black-tshirt.jpg"],
    "Alpha Bear Club T-Shirt - Olive": ["/products/apparel/tshirts-01.jpg"],
    "Alpha Bear Club T-Shirt - White": ["/products/apparel/tshirts-01.jpg"],
    "Alpha Bear Club Performance Tee": ["/products/apparel/tshirts-01.jpg"],
    "Alpha Bear Club Hoodie - Black": ["/products/apparel/black-hoodie.jpg"],
    "Alpha Bear Club Hoodie - Grey": ["/products/apparel/grey-hoodie.jpg"],
    "Alpha Bear Club Zip Hoodie": ["/products/apparel/hoodie-03.jpg"],
    "Alpha Bear Club Cap - Black": ["/products/apparel/cap.jpg"],
    "Alpha Bear Club Cap - Olive": ["/products/apparel/cap.jpg"],
    "Alpha Bear Club Trucker Cap": ["/products/apparel/cap.jpg"],
    "Alpha Bear Club Beanie": ["/products/apparel/beanie.jpg"],
    "Alpha Bear Club Patch (Iron-On)": ["/products/apparel/clothing-stack-01.jpg"],
  },
}

async function main() {
  const categories = await prisma.category.findMany()
  const catMap: Record<string, string> = {}
  for (const c of categories) catMap[c.slug] = c.id

  for (const [slug, products] of Object.entries(imageMap)) {
    for (const [name, images] of Object.entries(products)) {
      const product = await prisma.product.findFirst({
        where: { name, categoryId: catMap[slug] },
      })
      if (!product) { console.log(`NOT FOUND: ${name}`); continue }

      const variant = slug === "apparel" && apparelVariants[name]
        ? { color: apparelVariants[name][0], sizes: apparelVariants[name][1] }
        : null

      await prisma.product.update({
        where: { id: product.id },
        data: {
          images: JSON.stringify(images),
          variants: variant ? JSON.stringify([variant]) : "[]",
        },
      })
      console.log(`✓ ${name} ${variant ? `[${variant.color} - ${variant.sizes.join(", ")}]` : ""}`)
    }
  }

  console.log("\nDone! All products updated with accurate images and apparel variants.")
}

main().catch(console.error).finally(() => prisma.$disconnect())
