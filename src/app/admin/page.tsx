import { prisma } from "@/lib/db"
import { Card, CardGrid } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice, formatDate } from "@/lib/utils"
import { Target, ShoppingBag, Calendar, Users, DollarSign } from "lucide-react"

export default async function AdminPage() {
  const [products, bookings, events, orders] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.booking.findMany({ orderBy: { date: "desc" } }),
    prisma.event.findMany({ include: { registrations: true }, orderBy: { date: "desc" } }),
    prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } }),
  ])

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Admin Dashboard</h1>
          <p className="mt-1 text-zinc-600">Manage your Alpha Bear Club business</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Total Revenue</p>
              <p className="text-xl font-bold text-zinc-900">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Products</p>
              <p className="text-xl font-bold text-zinc-900">{products.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Bookings</p>
              <p className="text-xl font-bold text-zinc-900">{bookings.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Events</p>
              <p className="text-xl font-bold text-zinc-900">{events.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-xl font-bold text-zinc-900">Recent Bookings</h2>
          <div className="mt-4 space-y-3">
            {bookings.slice(0, 5).map((booking) => (
              <Card key={booking.id} padding="sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-900">{booking.name}</p>
                    <p className="text-sm text-zinc-500">
                      {formatDate(booking.date)} - {booking.timeSlot}
                    </p>
                  </div>
                  <Badge
                    variant={
                      booking.status === "confirmed"
                        ? "success"
                        : booking.status === "cancelled"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {booking.status}
                  </Badge>
                </div>
              </Card>
            ))}
            {bookings.length === 0 && (
              <p className="text-sm text-zinc-500">No bookings yet.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900">Products</h2>
          <div className="mt-4 space-y-3">
            {products.map((product) => (
              <Card key={product.id} padding="sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-900">{product.name}</p>
                    <p className="text-sm text-zinc-500">
                      {formatPrice(product.price)} &middot; {product.inventory} in stock
                    </p>
                  </div>
                  <Badge variant="primary">{product.category.name}</Badge>
                </div>
              </Card>
            ))}
            {products.length === 0 && (
              <p className="text-sm text-zinc-500">No products yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
