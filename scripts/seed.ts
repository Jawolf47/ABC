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
    { name: "Alpha Recurve Bow - 40lb", desc: "Premium takedown recurve bow with CNC-machined aluminum riser and fiberglass limbs. Smooth draw, ideal for target practice and competition. Includes bow stringer.", price: 299.99, compare: 349.99, img: "/products/archery/recurve-bow.jpg", cat: archery.id, inv: 15, feat: true },
    { name: "Alpha Recurve Bow - 30lb", desc: "Lighter draw weight version of our premium takedown recurve. Perfect for beginners and young archers learning proper form.", price: 279.99, compare: null, img: "/products/archery/recurve-bow.jpg", cat: archery.id, inv: 20, feat: false },
    { name: "Alpha Recurve Bow - 50lb", desc: "Heavy draw weight takedown recurve for experienced archers. Delivers higher arrow speed for longer distance target shooting.", price: 329.99, compare: null, img: "/products/archery/recurve-bow.jpg", cat: archery.id, inv: 10, feat: false },
    { name: "Bear Archery Cruzer G2", desc: "Adjustable compound bow ranging from 5-70lbs. Perfect for all ages and skill levels. Features a lightweight CNC machined cam system.", price: 399.99, compare: 449.99, img: "/products/archery/compound-bow.jpg", cat: archery.id, inv: 12, feat: true },
    { name: "Hoyt Torrex Compound Bow", desc: "High-performance compound bow with HBX Pro cams for a smooth draw cycle. Ideal for target archery and hunting practice.", price: 599.99, compare: null, img: "/products/archery/compound-bow.jpg", cat: archery.id, inv: 8, feat: false },
    { name: "PSE Brute NXT Compound Bow", desc: "Durable compound bow with 70lb max draw weight. Eccentric system provides let-off for holding comfort during extended sessions.", price: 479.99, compare: 529.99, img: "/products/archery/compound-bow.jpg", cat: archery.id, inv: 6, feat: false },
    { name: "Samick Sage Longbow", desc: "Traditional takedown longbow in 30-50lb options. African Dymondwood riser with maple limbs for classic archery feel and performance.", price: 199.99, compare: null, img: "/products/archery/archer-01.jpg", cat: archery.id, inv: 18, feat: false },
    { name: "Bear Montana Longbow", desc: "Lightweight 64-inch longbow perfect for traditional archery. Bamboo core with fiberglass backing for durability and smooth shooting.", price: 249.99, compare: null, img: "/products/archery/archer-01.jpg", cat: archery.id, inv: 14, feat: false },

    // === ARROWS ===
    { name: "Carbon X10 Arrows (Dozen)", desc: "Professional-grade carbon arrows with precision-machined nocks and field points. Consistent spine and weight for tournament-grade groupings.", price: 89.99, compare: null, img: "/products/archery/arrows.jpg", cat: archery.id, inv: 50, feat: true },
    { name: "Easton Carbon Arrows (Dozen)", desc: "High-quality carbon arrows with 4mm diameter for reduced wind drift. Includes replaceable nocks and screw-in points.", price: 79.99, compare: 94.99, img: "/products/archery/arrows.jpg", cat: archery.id, inv: 40, feat: false },
    { name: "Gold Tip Traditional Carbon Arrows (Dozen)", desc: "Carbon arrows designed for traditional bows and longbows. Wood grain finish with 5-inch parabolic fletching for stable flight.", price: 84.99, compare: null, img: "/products/archery/arrows.jpg", cat: archery.id, inv: 35, feat: false },
    { name: "Aluminum Hunting Arrows (Dozen)", desc: "Premium 7075 aluminum alloy arrows for hunting and target practice. Straightness tolerance of ±.003 inches for consistent accuracy.", price: 59.99, compare: null, img: "/products/archery/arrow-01.jpg", cat: archery.id, inv: 60, feat: false },
    { name: "Easton XX75 Aluminum Arrows (Dozen)", desc: "Legendary aluminum arrows with anodized finish. Excellent durability for outdoor target ranges and repeated use.", price: 69.99, compare: 79.99, img: "/products/archery/arrow-01.jpg", cat: archery.id, inv: 45, feat: false },
    { name: "Pine Wood Target Arrows (6-Pack)", desc: "Traditional Port Orford cedar arrows with natural feather fletching. Hand-selected for straightness and authentic traditional shooting.", price: 39.99, compare: null, img: "/products/archery/arrow-01.jpg", cat: archery.id, inv: 75, feat: false },
    { name: "Hickory Wood Longbow Arrows (6-Pack)", desc: "Hand-crafted hickory arrows for traditional longbow shooting. 11/32-inch diameter with turkey feather fletching.", price: 44.99, compare: null, img: "/products/archery/arrow-01.jpg", cat: archery.id, inv: 55, feat: false },
    { name: "Youth Fiberglass Arrows (Dozen)", desc: "Durable fiberglass arrows perfect for beginners and youth archers. Pre-fletched with safety-blunt tips for worry-free practice.", price: 29.99, compare: null, img: "/products/archery/arrow-01.jpg", cat: archery.id, inv: 100, feat: false },

    // === ARCHERY ACCESSORIES ===
    { name: "Tactical Finger Tab", desc: "Premium leather finger tab with adjustable finger spacer and wrist strap. Provides a consistent release and protects your fingers during long sessions.", price: 24.99, compare: null, img: "/products/archery/target.jpg", cat: archery.id, inv: 100, feat: false },
    { name: "Arm Guard Pro", desc: "Lightweight aluminum arm guard with padded leather lining and adjustable elastic straps. Protects your forearm from string slap.", price: 19.99, compare: null, img: "/products/archery/target.jpg", cat: archery.id, inv: 75, feat: false },
    { name: "Nylon Arm Guard", desc: "Durable nylon arm guard with memory foam padding and dual adjustable straps. Comfortable fit for extended shooting sessions.", price: 14.99, compare: null, img: "/products/archery/target.jpg", cat: archery.id, inv: 120, feat: false },
    { name: "Deluxe Archery Quiver", desc: "6-arrow hip quiver with premium leather construction and adjustable belt loop. Keeps your arrows secure and accessible while on the range.", price: 49.99, compare: 59.99, img: "/products/archery/quiver.jpg", cat: archery.id, inv: 30, feat: false },
    { name: "Back Quiver - 12 Arrow", desc: "Traditional leather back quiver holding up to 12 arrows. Padded shoulder strap distributes weight comfortably for long practice sessions.", price: 69.99, compare: null, img: "/products/archery/quiver.jpg", cat: archery.id, inv: 25, feat: false },
    { name: "Pro Target Face Pack (50-pack)", desc: "Professional 40cm target faces with 10-ring Olympic scoring system. Printed on durable weather-resistant paper for outdoor use.", price: 24.99, compare: null, img: "/products/archery/target.jpg", cat: archery.id, inv: 200, feat: false },
    { name: "3D Animal Target - Deer", desc: "Life-sized 3D deer target with replaceable vital core. Self-healing foam construction delivers thousands of shots without losing shape.", price: 179.99, compare: 219.99, img: "/products/archery/target-01.jpg", cat: archery.id, inv: 10, feat: false },
    { name: "Bag Target - 24x24x12", desc: "Heavy-duty layered bag target suitable for both field points and broadheads. Weather-resistant nylon cover with convenient carrying handles.", price: 89.99, compare: null, img: "/products/archery/target-01.jpg", cat: archery.id, inv: 20, feat: false },
    { name: "Bow Stand - Adjustable", desc: "Portable adjustable bow stand compatible with recurve and compound bows. Folds flat for easy transport and storage in your range bag.", price: 34.99, compare: null, img: "/products/archery/target.jpg", cat: archery.id, inv: 50, feat: false },
    { name: "Bow Stringer - Recurve", desc: "Heavy-duty nylon bow stringer for safely stringing recurve bows. Padded saddle pockets protect your limb tips during use.", price: 12.99, compare: null, img: "/products/archery/target.jpg", cat: archery.id, inv: 80, feat: false },
    { name: "Arrow Rest - Drop Away", desc: "Premium drop-away arrow rest with micro-adjustable tension settings. Ultra-smooth, quiet operation for compound bow precision.", price: 44.99, compare: 54.99, img: "/products/archery/target.jpg", cat: archery.id, inv: 40, feat: false },

    // === SURVIVAL GEAR ===
    { name: "Survival Knife - Bushcraft Pro", desc: "Full-tang 1095 carbon steel blade with textured micarta handle. Includes ferro rod striker and custom Kydex sheath. Built for serious field work.", price: 149.99, compare: 179.99, img: "/products/survival/knife-01.jpg", cat: survival.id, inv: 25, feat: true },
    { name: "Survival Knife - Compact EDC", desc: "Compact everyday carry survival knife with 3.5-inch stainless steel blade. Paracord wrap handle provides grip in wet conditions.", price: 79.99, compare: null, img: "/products/survival/pocket-knife-01.jpg", cat: survival.id, inv: 35, feat: false },
    { name: "Emergency Fire Starter Kit", desc: "Waterproof fire starter kit containing ferro rod, magnesium block, stormproof matches, and tinder tabs. Everything you need to start a fire in any weather.", price: 34.99, compare: null, img: "/products/survival/fire-starter.jpg", cat: survival.id, inv: 200, feat: true },
    { name: "Ferro Rod - Survival XL", desc: "Extra-large ferrocerium rod with ergonomic striker. Produces 5000+ strikes and 3000°F sparks in any weather condition.", price: 19.99, compare: null, img: "/products/survival/fire-starter.jpg", cat: survival.id, inv: 150, feat: false },
    { name: "Tactical Backpack 45L", desc: "Rugged 45-liter tactical backpack with MOLLE webbing system, hydration reservoir sleeve, and multiple padded compartments for organized storage.", price: 129.99, compare: 159.99, img: "/products/survival/backpack-01.jpg", cat: survival.id, inv: 30, feat: false },
    { name: "Tactical Backpack 25L", desc: "Compact 25-liter day pack with MOLLE webbing and padded laptop sleeve. Ideal for day hikes, range trips, and urban carry.", price: 79.99, compare: null, img: "/products/survival/backpack-01.jpg", cat: survival.id, inv: 40, feat: false },
    { name: "First Aid Trauma Kit", desc: "Comprehensive trauma kit packed with tourniquet, hemostatic gauze, chest seals, and pressure bandage in a compact MOLLE-compatible pouch.", price: 79.99, compare: null, img: "/products/survival/trauma-kit.jpg", cat: survival.id, inv: 40, feat: true },
    { name: "Pocket First Aid Kit", desc: "Compact first aid kit designed for everyday carry. Contains bandages, antiseptic wipes, pain reliever, and emergency blanket.", price: 14.99, compare: null, img: "/products/survival/trauma-kit.jpg", cat: survival.id, inv: 200, feat: false },
    { name: "Water Filter - Trail Pro", desc: "Portable water filtration system that removes 99.9999% of bacteria and parasites. Filters up to 100,000 gallons for long-term field use.", price: 44.99, compare: 54.99, img: "/products/survival/water-filter.jpg", cat: survival.id, inv: 60, feat: false },
    { name: "Paracord - 550lb 100ft", desc: "Mil-spec Type III 550 paracord with 7 inner strands and durable nylon sheath. Endless uses in survival, camping, and everyday situations.", price: 12.99, compare: null, img: "/products/survival/paracord.jpg", cat: survival.id, inv: 300, feat: false },
    { name: "Compass - Lensatic", desc: "Precision lensatic compass with tritium glow markers for low-light use. Liquid-filled bezel provides accurate readings in any conditions.", price: 39.99, compare: null, img: "/products/survival/compass.jpg", cat: survival.id, inv: 45, feat: false },
    { name: "Emergency Blanket 4-Pack", desc: "Heavy-duty mylar emergency blankets measuring 84x56 inches. Reflects 90% of body heat. Includes compact survival guide in each pack.", price: 9.99, compare: null, img: "/products/survival/tactical-01.jpg", cat: survival.id, inv: 500, feat: false },

    // === APPAREL ===
    { name: "Alpha Bear Club T-Shirt - Black", desc: "Premium 6oz ring-spun cotton t-shirt with embroidered Alpha Bear Club logo on chest. Relaxed fit with ribbed collar for all-day comfort.", price: 34.99, compare: null, img: "/products/apparel/black-tshirt.jpg", cat: apparel.id, inv: 100, feat: true },
    { name: "Alpha Bear Club T-Shirt - Olive", desc: "Premium 6oz cotton t-shirt in tactical olive green. Features embroidered Alpha Bear Club logo on chest. Relaxed everyday fit.", price: 34.99, compare: null, img: "/products/apparel/tshirts-01.jpg", cat: apparel.id, inv: 80, feat: false },
    { name: "Alpha Bear Club T-Shirt - White", desc: "Premium 6oz cotton t-shirt in crisp white. Embroidered Alpha Bear Club logo on chest. Clean, classic, and built to last.", price: 34.99, compare: null, img: "/products/apparel/tshirts-01.jpg", cat: apparel.id, inv: 90, feat: false },
    { name: "Alpha Bear Club Performance Tee", desc: "Moisture-wicking performance t-shirt with screened Alpha Bear Club logo. UPF 50+ sun protection and 4-way stretch for active wear.", price: 44.99, compare: 54.99, img: "/products/apparel/tshirts-01.jpg", cat: apparel.id, inv: 60, feat: false },
    { name: "Alpha Bear Club Hoodie - Black", desc: "Heavyweight 12oz fleece hoodie with embroidered Alpha Bear Club logo across back. Front pouch pocket and adjustable drawcord hood.", price: 69.99, compare: null, img: "/products/apparel/black-hoodie.jpg", cat: apparel.id, inv: 50, feat: true },
    { name: "Alpha Bear Club Hoodie - Grey", desc: "Heavyweight 12oz fleece hoodie in charcoal grey. Embroidered Alpha Bear Club logo across back with front pouch pocket.", price: 69.99, compare: null, img: "/products/apparel/grey-hoodie.jpg", cat: apparel.id, inv: 40, feat: false },
    { name: "Alpha Bear Club Zip Hoodie", desc: "Full-zip fleece hoodie with embroidered Alpha Bear Club logo on left chest. Zippered side pockets and adjustable hood for versatility.", price: 79.99, compare: null, img: "/products/apparel/hoodie-03.jpg", cat: apparel.id, inv: 35, feat: false },
    { name: "Alpha Bear Club Cap - Black", desc: "Premium 6-panel unstructured cap with embroidered Alpha Bear Club logo. Adjustable metal buckle closure. 100% cotton construction.", price: 29.99, compare: null, img: "/products/apparel/cap.jpg", cat: apparel.id, inv: 150, feat: true },
    { name: "Alpha Bear Club Cap - Olive", desc: "Premium 6-panel unstructured cap in tactical olive. Embroidered Alpha Bear Club logo with adjustable metal buckle back.", price: 29.99, compare: null, img: "/products/apparel/cap.jpg", cat: apparel.id, inv: 120, feat: false },
    { name: "Alpha Bear Club Trucker Cap", desc: "Classic mesh trucker cap with embroidered Alpha Bear Club logo. Foam front panels and snapback closure for a comfortable fit.", price: 27.99, compare: null, img: "/products/apparel/cap.jpg", cat: apparel.id, inv: 100, feat: false },
    { name: "Alpha Bear Club Beanie", desc: "Ribbed knit beanie featuring an embroidered Alpha Bear Club patch. One-size-fits-all stretch fit. 100% soft acrylic yarn.", price: 24.99, compare: null, img: "/products/apparel/beanie.jpg", cat: apparel.id, inv: 80, feat: false },
    { name: "Alpha Bear Club Patch (Iron-On)", desc: "Official Alpha Bear Club embroidered patch measuring 3 inches in diameter. Iron-on backing for easy attachment to bags, jackets, or hats.", price: 9.99, compare: null, img: "/products/apparel/clothing-stack-01.jpg", cat: apparel.id, inv: 500, feat: false },
  ]

  for (const p of products) {
    const variant = p.name.includes("T-Shirt") || p.name.includes("Hoodie") || p.name.includes("Zip Hoodie")
      ? JSON.stringify([{ color: "Default", sizes: ["XS", "S", "M", "L", "XL", "2XL"] }])
      : p.name.includes("Cap") || p.name.includes("Beanie")
      ? JSON.stringify([{ color: p.name.includes("Olive") ? "Olive" : p.name.includes("Trucker") ? "Black/White" : "Black", sizes: ["OSFM"] }])
      : p.name.includes("Patch")
      ? JSON.stringify([{ color: "Multi", sizes: ["3-inch"] }])
      : "[]"

    await prisma.product.create({
      data: {
        name: p.name,
        description: p.desc,
        price: p.price,
        comparePrice: p.compare ?? null,
        images: JSON.stringify([p.img]),
        variants: variant,
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
