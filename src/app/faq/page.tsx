import { Card } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    q: "Do I need prior experience to shoot at Alpha Bear Club?",
    a: "Not at all. We welcome beginners and provide basic instruction. Our staff will get you set up safely. Walk-ins are welcome during business hours.",
  },
  {
    q: "Can I bring my own bow and arrows?",
    a: "Yes. You are welcome to bring your own equipment. We also have rental bows and arrows available for $10 per session.",
  },
  {
    q: "Do I need to book in advance?",
    a: "Walk-ins are welcome for individual sessions. If you want a guaranteed lane, booking ahead is recommended. Group events must be booked in advance.",
  },
  {
    q: "What are the age requirements?",
    a: "Archers of all ages are welcome. Children under 12 must be supervised by a parent or guardian at all times. Youth bows are available.",
  },
  {
    q: "Do you offer lessons or coaching?",
    a: "Yes. We offer beginner lessons, private coaching, and group clinics. Check our booking page for availability.",
  },
  {
    q: "What safety measures are in place?",
    a: "All archers must follow range safety rules. Safety briefings are provided. Eye protection is recommended and available for purchase.",
  },
  {
    q: "Can I host a birthday party or corporate event?",
    a: "Absolutely. We host group events of all sizes. Fill out the form on our Events page and we will help you plan it.",
  },
  {
    q: "What is your return policy on products?",
    a: "Unused products in original packaging can be returned within 30 days for a full refund. See our Policies page for details.",
  },
  {
    q: "Do you ship products?",
    a: "Yes. We ship anywhere in the continental US. Orders over $100 ship free. Standard delivery takes 3-7 business days.",
  },
]

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Everything you need to know about Alpha Bear Club.
        </p>
      </div>

      <div className="mt-12 space-y-4">
        {faqs.map((faq, i) => (
          <details key={i} className="group">
            <summary className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-200 bg-white p-5 text-left text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 [&::-webkit-details-marker]:hidden">
              {faq.q}
              <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-open:rotate-180" />
            </summary>
            <div className="rounded-b-xl border-x border-b border-zinc-200 bg-zinc-50 px-5 py-4">
              <p className="text-sm leading-relaxed text-zinc-600">{faq.a}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
