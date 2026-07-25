-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "color" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "size" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "birthDate" TEXT;
ALTER TABLE "User" ADD COLUMN "city" TEXT;
ALTER TABLE "User" ADD COLUMN "guestsTypical" INTEGER;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "state" TEXT;
ALTER TABLE "User" ADD COLUMN "street" TEXT;
ALTER TABLE "User" ADD COLUMN "zip" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "comparePrice" REAL,
    "images" TEXT NOT NULL DEFAULT '[]',
    "variants" TEXT NOT NULL DEFAULT '[]',
    "categoryId" TEXT NOT NULL,
    "inventory" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("categoryId", "comparePrice", "createdAt", "description", "featured", "id", "images", "inventory", "name", "price", "published", "updatedAt") SELECT "categoryId", "comparePrice", "createdAt", "description", "featured", "id", "images", "inventory", "name", "price", "published", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
