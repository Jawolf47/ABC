import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Target, Shield, Users, Clock, Mail, Phone } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          About Alpha Bear Club
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
          Where precision meets preparedness. We are a community-driven archery range and premium
          survival gear store built for those who train to be ready for anything.
        </p>
      </section>

      <section className="mt-16 grid gap-8 md:grid-cols-3">
        <Card className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Target className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Our Mission</h3>
          <p className="mt-2 text-sm text-zinc-600">
            To provide a world-class archery experience and equip our community with the finest
            survival gear. We believe in discipline, preparedness, and the outdoors.
          </p>
        </Card>
        <Card className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Shield className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Our Values</h3>
          <p className="mt-2 text-sm text-zinc-600">
            Quality over quantity. Every product we sell is tested and trusted. Every session on
            our range is coached and safe. We stand behind everything we offer.
          </p>
        </Card>
        <Card className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Users className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Our Community</h3>
          <p className="mt-2 text-sm text-zinc-600">
            From beginners to competitive archers, survival enthusiasts to corporate teams —
            everyone belongs at the Alpha Bear Club. Walk in, train, and belong.
          </p>
        </Card>
      </section>

      <section className="mt-20 grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900">Visit Us</h2>
          <p className="mt-4 text-lg text-zinc-600">
            Drop by for walk-in archery sessions, browse our store, or pick up your online orders.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="mt-1 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-medium text-zinc-900">Hours</p>
                <p className="text-zinc-600">Saturday: 10 AM - 4 PM</p>
                <p className="text-zinc-600">Sunday: 10 AM - 4 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-medium text-zinc-900">Phone</p>
                <p className="text-zinc-600">(555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-medium text-zinc-900">Email</p>
                <p className="text-zinc-600">hello@alphabearclub.com</p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/booking">
              <Button size="lg">Book a Session</Button>
            </Link>
            <Link href="/store">
              <Button variant="outline" size="lg">Shop Gear</Button>
            </Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-zinc-200">
          <iframe
            src="https://maps.google.com/maps?q=Michigan&t=&z=8&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: "400px" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </div>
  )
}
