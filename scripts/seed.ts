import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const url = process.env.DATABASE_URL ?? "file:./dev.db"
const adapter = new PrismaLibSql({ url })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  const archery = await prisma.category.create({ data: { name: "Archery", slug: "archery" } })
  const survival = await prisma.category.create({ data: { name: "Survival Gear", slug: "survival" } })
  const apparel = await prisma.category.create({ data: { name: "Apparel", slug: "apparel" } })

  const products = [
    // === RECURVE BOWS ===
    { name: "Alpha Recurve Bow - 40lb", desc: "Premium takedown recurve bow with CNC-machined aluminum riser and fiberglass limbs. Smooth draw, ideal for target practice and competition. Includes bow stringer.", price: 299.99, compare: 349.99, cat: archery.id, inv: 15, feat: true },
    { name: "Alpha Recurve Bow - 30lb", desc: "Lighter draw weight version of our premium takedown recurve. Perfect for beginners and young archers learning proper form.", price: 279.99, compare: null, cat: archery.id, inv: 20, feat: false },
    { name: "Alpha Recurve Bow - 50lb", desc: "Heavy draw weight takedown recurve for experienced archers. Delivers higher arrow speed for longer distance target shooting.", price: 329.99, compare: null, cat: archery.id, inv: 10, feat: false },
    { name: "Bear Archery Cruzer G2", desc: "Adjustable compound bow ranging from 5-70lbs. Perfect for all ages and skill levels. Features a lightweight CNC machined cams.", price: 399.99, compare: 449.99, cat: archery.id, inv: 12, feat: true },
    { name: "Hoyt Torrex Compound Bow", desc: "High-performance compound bow with HBX Pro cams for a smooth draw cycle. Ideal for target archery and hunting practice.", price: 599.99, compare: null, cat: archery.id, inv: 8, feat: false },
    { name: "PSE Brute NXT Compound Bow", desc: "Durable compound bow with 70lb max draw weight. Eccentric system provides let-off for holding comfort.", price: 479.99, compare: 529.99, cat: archery.id, inv: 6, feat: false },
    { name: "Samick Sage Longbow", desc: "Traditional takedown longbow in 30-50lb options. African Dymondwood riser with maple limbs for classic archery feel.", price: 199.99, compare: null, cat: archery.id, inv: 18, feat: false },
    { name: "Bear Montana Longbow", desc: "Lightweight 64-inch longbow perfect for traditional archery. Bamboo core with fiberglass backing for durability.", price: 249.99, compare: null, cat: archery.id, inv: 14, feat: false },

    // === ARROWS ===
    { name: "Carbon X10 Arrows (Dozen)", desc: "Professional-grade carbon arrows with precision-machined nocks and field points. Consistent spine and weight for tournament-grade groupings.", price: 89.99, compare: null, cat: archery.id, inv: 50, feat: true },
    { name: "Easton Carbon Arrows (Dozen)", desc: "High-quality carbon arrows with 4mm diameter for reduced wind drift. Includes replaceable nocks and points.", price: 79.99, compare: 94.99, cat: archery.id, inv: 40, feat: false },
    { name: "Gold Tip Traditional Carbon Arrows (Dozen)", desc: "Carbon arrows designed for traditional bows and longbows. Wood grain finish with 5-inch parabolic fletching.", price: 84.99, compare: null, cat: archery.id, inv: 35, feat: false },
    { name: "Aluminum Hunting Arrows (Dozen)", desc: "Premium 7075 aluminum alloy arrows for hunting and target practice. Straightness tolerance of ±.003 inches.", price: 59.99, compare: null, cat: archery.id, inv: 60, feat: false },
    { name: "Easton XX75 Aluminum Arrows (Dozen)", desc: "Legendary aluminum arrows with anodized finish. Excellent durability for outdoor target ranges.", price: 69.99, compare: 79.99, cat: archery.id, inv: 45, feat: false },
    { name: "Pine Wood Target Arrows (6-Pack)", desc: "Traditional Port Orford cedar arrows with natural feather fletching. Hand-selected for straightness.", price: 39.99, compare: null, cat: archery.id, inv: 75, feat: false },
    { name: "Hickory Wood Longbow Arrows (6-Pack)", desc: "Hand-crafted hickory arrows for traditional longbow shooting. 11/32-inch diameter with turkey feather fletching.", price: 44.99, compare: null, cat: archery.id, inv: 55, feat: false },
    { name: "Youth Fiberglass Arrows (Dozen)", desc: "Durable fiberglass arrows perfect for beginners and youth archers. Pre-fletched with safety-blunt tips.", price: 29.99, compare: null, cat: archery.id, inv: 100, feat: false },

    // === ARCHERY ACCESSORIES ===
    { name: "Tactical Finger Tab", desc: "Premium leather finger tab with adjustable finger spacer and wrist strap. Provides consistent release and finger protection.", price: 24.99, compare: null, cat: archery.id, inv: 100, feat: false },
    { name: "Arm Guard Pro", desc: "Lightweight aluminum arm guard with padded leather lining and adjustable elastic straps. Protects your forearm from string slap.", price: 19.99, compare: null, cat: archery.id, inv: 75, feat: false },
    { name: "Nylon Arm Guard", desc: "Durable nylon arm guard with memory foam padding and dual adjustable straps. Comfortable for extended shooting sessions.", price: 14.99, compare: null, cat: archery.id, inv: 120, feat: false },
    { name: "Deluxe Archery Quiver", desc: "6-arrow hip quiver with leather construction and adjustable belt loop. Holds arrows securely while walking to the line.", price: 49.99, compare: 59.99, cat: archery.id, inv: 30, feat: false },
    { name: "Back Quiver - 12 Arrow", desc: "Traditional leather back quiver holding up to 12 arrows. Padded shoulder strap for comfort during long practice sessions.", price: 69.99, compare: null, cat: archery.id, inv: 25, feat: false },
    { name: "Pro Target Face Pack (50-pack)", desc: "Professional 40cm target faces with 10-ring scoring system. Printed on durable weather-resistant paper.", price: 24.99, compare: null, cat: archery.id, inv: 200, feat: false },
    { name: "3D Animal Target - Deer", desc: "Life-sized 3D deer target with replaceable vital core. Self-healing foam construction for thousands of shots.", price: 179.99, compare: 219.99, cat: archery.id, inv: 10, feat: false },
    { name: "Bag Target - 24x24x12", desc: "Heavy-duty layered bag target for field points and broadheads. Weather-resistant nylon cover with carrying handles.", price: 89.99, compare: null, cat: archery.id, inv: 20, feat: false },
    { name: "Bow Stand - Adjustable", desc: "Portable adjustable bow stand compatible with recurve and compound bows. Folds flat for easy transport.", price: 34.99, compare: null, cat: archery.id, inv: 50, feat: false },
    { name: "Bow Stringer - Recurve", desc: "Heavy-duty nylon bow stringer for safely stringing recurve bows. Padded saddle pockets protect limb tips.", price: 12.99, compare: null, cat: archery.id, inv: 80, feat: false },
    { name: "Arrow Rest - Drop Away", desc: "Premium drop-away arrow rest with micro-adjustable tension. Smooth, quiet operation for compound bows.", price: 44.99, compare: 54.99, cat: archery.id, inv: 40, feat: false },

    // === SURVIVAL GEAR ===
    { name: "Survival Knife - Bushcraft Pro", desc: "Full-tang 1095 carbon steel blade with micarta handle, ferro rod, and Kydex sheath. Built for the field.", price: 149.99, compare: 179.99, cat: survival.id, inv: 25, feat: true },
    { name: "Survival Knife - Compact EDC", desc: "Compact everyday carry survival knife with 3.5-inch stainless blade. Includes paracord wrap handle and belt clip.", price: 79.99, compare: null, cat: survival.id, inv: 35, feat: false },
    { name: "Emergency Fire Starter Kit", desc: "Waterproof fire starter kit with ferro rod, magnesium block, stormproof matches, and tinder tabs.", price: 34.99, compare: null, cat: survival.id, inv: 200, feat: true },
    { name: "Ferro Rod - Survival XL", desc: "Extra-large ferrocerium rod with striker. Produces 5000+ strikes and 3000°F sparks in any weather.", price: 19.99, compare: null, cat: survival.id, inv: 150, feat: false },
    { name: "Tactical Backpack 45L", desc: "Rugged 45-liter tactical backpack with MOLLE webbing, hydration sleeve, and multiple compartments.", price: 129.99, compare: 159.99, cat: survival.id, inv: 30, feat: false },
    { name: "Tactical Backpack 25L", desc: "Compact 25-liter day pack with MOLLE webbing and padded laptop sleeve. Perfect for day hikes and range trips.", price: 79.99, compare: null, cat: survival.id, inv: 40, feat: false },
    { name: "First Aid Trauma Kit", desc: "Comprehensive trauma kit with tourniquet, hemostatic gauze, chest seals, and pressure bandage in a compact pouch.", price: 79.99, compare: null, cat: survival.id, inv: 40, feat: true },
    { name: "Pocket First Aid Kit", desc: "Compact first aid kit for everyday carry. Contains bandages, antiseptic, pain reliever, and emergency blanket.", price: 14.99, compare: null, cat: survival.id, inv: 200, feat: false },
    { name: "Water Filter - Trail Pro", desc: "Portable water filtration system removing 99.9999% of bacteria and parasites. Filters up to 100,000 gallons.", price: 44.99, compare: 54.99, cat: survival.id, inv: 60, feat: false },
    { name: "Paracord - 550lb 100ft", desc: "Mil-spec Type III 550 paracord. 7 inner strands with nylon sheath. Infinite uses in survival situations.", price: 12.99, compare: null, cat: survival.id, inv: 300, feat: false },
    { name: "Compass - Lensatic", desc: "Precision lensatic compass with tritium glow markers. Liquid-filled bezel for accurate readings in any conditions.", price: 39.99, compare: null, cat: survival.id, inv: 45, feat: false },
    { name: "Emergency Blanket 4-Pack", desc: "Heavy-duty mylar emergency blankets. 84x56 inches, reflecting 90% of body heat. Includes survival guide.", price: 9.99, compare: null, cat: survival.id, inv: 500, feat: false },

    // === APPAREL ===
    { name: "Alpha Bear Club T-Shirt - Black", desc: "Premium 6oz cotton t-shirt with embroidered Alpha Bear Club logo on chest. Relaxed fit with ribbed collar.", price: 34.99, compare: null, cat: apparel.id, inv: 100, feat: true },
    { name: "Alpha Bear Club T-Shirt - Olive", desc: "Premium 6oz cotton t-shirt in tactical olive. Embroidered Alpha Bear Club logo on chest. Relaxed fit.", price: 34.99, compare: null, cat: apparel.id, inv: 80, feat: false },
    { name: "Alpha Bear Club T-Shirt - White", desc: "Premium 6oz cotton t-shirt in crisp white. Embroidered Alpha Bear Club logo on chest. Relaxed fit.", price: 34.99, compare: null, cat: apparel.id, inv: 90, feat: false },
    { name: "Alpha Bear Club Performance Tee", desc: "Moisture-wicking performance t-shirt with screened Alpha Bear Club logo. UPF 50+ sun protection. 4-way stretch.", price: 44.99, compare: 54.99, cat: apparel.id, inv: 60, feat: false },
    { name: "Alpha Bear Club Hoodie - Black", desc: "Heavyweight 12oz fleece hoodie with embroidered Alpha Bear Club logo across back. Front pouch pocket with adjustable hood.", price: 69.99, compare: null, cat: apparel.id, inv: 50, feat: true },
    { name: "Alpha Bear Club Hoodie - Grey", desc: "Heavyweight 12oz fleece hoodie in charcoal grey. Embroidered Alpha Bear Club logo across back.", price: 69.99, compare: null, cat: apparel.id, inv: 40, feat: false },
    { name: "Alpha Bear Club Zip Hoodie", desc: "Full-zip fleece hoodie with embroidered Alpha Bear Club logo on left chest. Zippered pockets and adjustable hood.", price: 79.99, compare: null, cat: apparel.id, inv: 35, feat: false },
    { name: "Alpha Bear Club Cap - Black", desc: "Premium 6-panel unstructured cap with embroidered Alpha Bear Club logo. Adjustable metal buckle closure. 100% cotton.", price: 29.99, compare: null, cat: apparel.id, inv: 150, feat: true },
    { name: "Alpha Bear Club Cap - Olive", desc: "Premium 6-panel unstructured cap in tactical olive. Embroidered Alpha Bear Club logo. Adjustable metal buckle.", price: 29.99, compare: null, cat: apparel.id, inv: 120, feat: false },
    { name: "Alpha Bear Club Trucker Cap", desc: "Classic mesh trucker cap with embroidered Alpha Bear Club logo. Foam front panels with snapback closure.", price: 27.99, compare: null, cat: apparel.id, inv: 100, feat: false },
    { name: "Alpha Bear Club Beanie", desc: "Ribbed knit beanie with embroidered Alpha Bear Club patch. One-size-fits-all. 100% acrylic.", price: 24.99, compare: null, cat: apparel.id, inv: 80, feat: false },
    { name: "Alpha Bear Club Patch (Iron-On)", desc: "Official Alpha Bear Club embroidered patch. 3-inch diameter, iron-on backing. Perfect for bags, jackets, or display.", price: 9.99, compare: null, cat: apparel.id, inv: 500, feat: false },
  ]

  for (const p of products) {
    await prisma.product.create({
      data: {
        name: p.name,
        description: p.desc,
        price: p.price,
        comparePrice: p.compare ?? null,
        images: JSON.stringify([]),
        categoryId: p.cat,
        inventory: p.inv,
        featured: p.feat,
      },
    })
  }

  console.log(`Seeded ${products.length} products across 3 categories`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
