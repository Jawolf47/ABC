import { Card } from "@/components/ui/card"
import { Shield, Package, RefreshCcw, Truck, Lock, FileText } from "lucide-react"

const policies = [
  {
    icon: RefreshCcw,
    title: "Return Policy",
    content:
      "Unused products in original packaging may be returned within 30 days of purchase for a full refund. Returns must include all original tags and packaging. Customers are responsible for return shipping unless the item arrived damaged or incorrect.",
  },
  {
    icon: Truck,
    title: "Shipping Policy",
    content:
      "Orders are processed within 1-2 business days. Standard shipping takes 3-7 business days within the continental US. Expedited shipping is available at checkout. Free shipping on orders over $100.",
  },
  {
    icon: Package,
    title: "Product Warranty",
    content:
      "All bows and archery equipment carry a 1-year manufacturer warranty against defects in materials and workmanship. Warranty does not cover damage from misuse, abuse, or normal wear and tear.",
  },
  {
    icon: Lock,
    title: "Privacy Policy",
    content:
      "We collect only the information necessary to process your orders and bookings. Your personal data is never sold or shared with third parties. Payment processing is handled securely through Stripe.",
  },
  {
    icon: Shield,
    title: "Range Safety Rules",
    content:
      "All archers must follow range safety rules at all times. No dry firing. Bows must remain pointed downrange. Only shoot when the range is hot. Eye protection is recommended. Children under 12 must be supervised.",
  },
  {
    icon: FileText,
    title: "Cancellation Policy",
    content:
      "Bookings can be cancelled or rescheduled up to 24 hours before your session at no charge. Late cancellations or no-shows may forfeit the session fee. Group events require 72 hours notice for cancellations.",
  },
]

export default function PoliciesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Policies
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Our commitments to safety, quality, and your satisfaction.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {policies.map((policy) => {
          const Icon = policy.icon
          return (
            <Card key={policy.title} className="flex flex-col">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-zinc-900">{policy.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">{policy.content}</p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
