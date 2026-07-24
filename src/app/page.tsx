import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardGrid } from "@/components/ui/card"
import { Target, Shield, Shirt, Users, Clock, ArrowRight, Star, Crosshair, Zap, Calendar, Award } from "lucide-react"

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-zinc-950">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="https://videos.pexels.com/video-files/6668847/hd.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-zinc-950/60" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="flex items-center gap-12 lg:flex-row flex-col">
            <div className="max-w-2xl shrink-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-400">
                <Star className="h-3.5 w-3.5" />
                Premium Archery & Survival Experience
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Find Your{" "}
                <span className="text-amber-500">Target</span>
                , Master Your{" "}
                <span className="text-amber-500">Survival</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-zinc-400">
                Alpha Bear Club is your premier destination for archery practice, elite survival products,
                and tactical training. Whether you are a beginner or a seasoned pro, step into the range
                and unleash your potential.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/booking">
                  <Button size="lg" className="gap-2">
                    Book a Session <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/store">
                  <Button variant="outline" size="lg" className="border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white">
                    Shop Gear
                  </Button>
                </Link>
              </div>
            </div>
            <div className="shrink-0">
              <img src="/logo.png" alt="Alpha Bear Club" className="h-48 w-auto object-contain opacity-90 sm:h-56 lg:h-64" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-800 bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "10-50", label: "Yard Range Lanes", icon: Target },
              { value: "$20", label: "Per Session", icon: Zap },
              { value: "5+", label: "Years Experience", icon: Award },
              { value: "24/7", label: "Online Booking", icon: Calendar },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto mb-2 h-5 w-5 text-amber-500" />
                <p className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-sm text-zinc-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            What We Offer
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            Everything you need to train, compete, and survive.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="group relative overflow-hidden border-amber-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Target className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-zinc-900">Archery Range</h3>
            <p className="mt-2 text-zinc-600">
              State-of-the-art indoor range with targets from 10 to 50 yards. Walk-ins welcome for
              individual practice or book lane time in advance.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-amber-600">
              From $20/session <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Card>

          <Card className="group relative overflow-hidden border-amber-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Shield className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-zinc-900">Elite Survival Gear</h3>
            <p className="mt-2 text-zinc-600">
              Curated selection of premium survival equipment, tactical gear, and outdoor essentials.
              From bushcraft tools to emergency kits.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-amber-600">
              Shop Now <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Card>

          <Card className="group relative overflow-hidden border-amber-100 sm:col-span-2 lg:col-span-1">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-zinc-900">Group Events</h3>
            <p className="mt-2 text-zinc-600">
              Birthday parties, corporate team building, and private group sessions. Plan your event
              in advance and we will handle the rest.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-amber-600">
              Plan Event <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Card>
        </div>
      </section>

      <section className="bg-zinc-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Walk-ins Welcome.
                <br />
                <span className="text-amber-500">Book Ahead Guaranteed.</span>
              </h2>
              <p className="mt-4 text-lg leading-8 text-zinc-400">
                Got a sudden urge to hit the range? Drop by anytime during business hours for
                individual walk-in sessions. For guaranteed lane availability or group events,
                book online in advance.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: Clock, text: "Walk-in individual sessions available daily" },
                  { icon: Target, text: "Reserve lanes up to 2 weeks in advance" },
                  { icon: Users, text: "Group events planned and booked ahead" },
                  { icon: Crosshair, text: "Equipment rental included with all sessions" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <span className="text-zinc-300">{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/booking">
                  <Button size="lg">Book Now</Button>
                </Link>
                <Link href="/events">
                  <Button variant="outline" size="lg" className="border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white">
                    Explore Events
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/18278542/pexels-photo-18278542.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Archer aiming indoors at Alpha Bear Club range"
                className="aspect-square rounded-2xl object-cover"
              />
              <div className="absolute -bottom-4 -right-4 rounded-2xl border border-amber-500/30 bg-zinc-900 p-6">
                <p className="text-3xl font-bold text-amber-500">5+</p>
                <p className="text-sm text-zinc-400">Years Combined Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            Premium gear for every discipline.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/store?category=archery">
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-amber-50 to-amber-100/50 p-10 transition-all hover:shadow-lg">
              <Target className="h-10 w-10 text-amber-600" />
              <h3 className="mt-4 text-2xl font-bold text-zinc-900">Archery Equipment</h3>
              <p className="mt-2 text-zinc-600">
                Bows, arrows, targets, and accessories for all skill levels.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-600 group-hover:gap-2 transition-all">
                Browse Archery <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Card>
          </Link>
          <Link href="/store?category=survival">
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-zinc-800 to-zinc-900 p-10 transition-all hover:shadow-lg">
              <Shield className="h-10 w-10 text-amber-500" />
              <h3 className="mt-4 text-2xl font-bold text-white">Survival Gear</h3>
              <p className="mt-2 text-zinc-400">
                Bushcraft tools, emergency kits, tactical equipment, and outdoor essentials.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-500 group-hover:gap-2 transition-all">
                Browse Survival <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Card>
          </Link>
          <Link href="/store?category=apparel">
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-green-100 to-green-200/50 p-10 transition-all hover:shadow-lg">
              <Shirt className="h-10 w-10 text-green-600" />
              <h3 className="mt-4 text-2xl font-bold text-zinc-900">Apparel</h3>
              <p className="mt-2 text-zinc-600">
                Caps, t-shirts, hoodies, and beanies with the Alpha Bear Club logo.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-green-600 group-hover:gap-2 transition-all">
                Browse Apparel <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Card>
          </Link>
        </div>
      </section>
    </>
  )
}