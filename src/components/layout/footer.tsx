import Link from "next/link"
import { Target, Shield, Clock, Mail, Phone, MapPin } from "lucide-react"

const footerLinks = {
  Shop: [
    { href: "/store?category=archery", label: "Archery Equipment" },
    { href: "/store?category=survival", label: "Survival Gear" },
    { href: "/store", label: "All Products" },
  ],
  Services: [
    { href: "/booking", label: "Book a Session" },
    { href: "/events", label: "Group Events" },
    { href: "/about", label: "About Us" },
  ],
  Support: [
    { href: "/about", label: "Contact" },
    { href: "/faq", label: "FAQ" },
    { href: "/policies", label: "Policies" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600">
                <span className="text-lg font-bold text-white">ABC</span>
              </div>
              <span className="text-lg font-bold text-white">Alpha Bear Club</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed">
              Premium archery range and survival equipment store. Train, compete, and conquer.
            </p>
            <div className="mt-4 flex gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-amber-500" />
                <span>Archery</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-amber-500" />
                <span>Survival</span>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-amber-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-8 sm:flex-row">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-amber-500" />
              <span>Your City, ST</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>Mon-Sat 9AM-8PM</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-amber-500" />
              <span>hello@alphabearclub.com</span>
            </div>
          </div>
          <p className="text-xs">&copy; {new Date().getFullYear()} Alpha Bear Club. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
