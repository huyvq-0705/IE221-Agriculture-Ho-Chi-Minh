import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sprout, Droplets, Leaf, BookOpen, Users, ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "About",
  description:
    "AgriHCM shares practical, science-backed tips for smarter, more sustainable farming. Learn who we are and why we do this.",
}

export default function AboutPage() {
  const pillars = [
    {
      icon: <Sprout className="h-5 w-5" />,
      title: "Sustainable first",
      text: "We prioritize soil health, biodiversity, and water stewardship in every guide.",
    },
    {
      icon: <Droplets className="h-5 w-5" />,
      title: "Practical & field-ready",
      text: "Step-by-step practices you can apply this season—not vague theory.",
    },
    {
      icon: <Leaf className="h-5 w-5" />,
      title: "Evidence-based",
      text: "We review agronomy sources and field trials to keep advice grounded.",
    },
  ]

  const whatWeDo = [
    "Publish concise guides tailored to small–mid scale farms.",
    "Translate research into easy checklists and templates.",
    "Highlight low-cost improvements with clear ROI.",
    "Share success stories and mistakes to avoid.",
  ]

  const team = [
    { name: "Quang Huy Vũ", role: "Founder & Editor", initials: "QV" },
  ]

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 md:py-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-8 md:p-12">
        <div className="max-w-3xl">
          <p className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
            About AgriHCM
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-tight text-emerald-900 md:text-5xl">
            Practical agriculture guides for real fields, real seasons.
          </h1>
          <p className="mt-4 text-pretty text-base text-gray-700 md:text-lg">
            We’re a small team obsessed with turning solid agronomy into simple actions.
            Our mission is to help growers save water, improve soil, and increase yields
            sustainably—without breaking the bank.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/blog">Read the blog</Link>
            </Button>
            <Button variant="outline" asChild className="border-emerald-200 text-emerald-700">
              <Link href="/about/contact">Contact us</Link>
            </Button>
          </div>
        </div>

        {/* subtle corner badge */}
        <div className="pointer-events-none absolute -right-10 -top-10 hidden h-40 w-40 rounded-full bg-emerald-200/30 blur-2xl md:block" />
      </section>

      {/* Pillars */}
      <section className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {pillars.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-3 inline-flex items-center justify-center rounded-xl bg-emerald-50 p-2 text-emerald-700 ring-1 ring-emerald-100">
              {p.icon}
            </div>
            <h3 className="text-lg font-semibold text-emerald-900">{p.title}</h3>
            <p className="mt-1 text-sm text-gray-700">{p.text}</p>
          </div>
        ))}
      </section>

      {/* What we do */}
      <section className="mt-12 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-700" />
          <h2 className="text-xl font-semibold text-emerald-900">What we do</h2>
        </div>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-800">
          {whatWeDo.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      {/* Team */}
      <section className="mt-12">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-700" />
          <h2 className="text-xl font-semibold text-emerald-900">Team</h2>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {team.map((m) => (
            <li
              key={m.name}
              className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                {m.initials}
              </div>
              <div>
                <p className="font-medium text-emerald-900">{m.name}</p>
                <p className="text-sm text-gray-600">{m.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Trust / pledge */}
      <section className="mt-12 rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-700" />
          <div>
            <h3 className="text-lg font-semibold text-emerald-900">Our pledge</h3>
            <p className="mt-1 text-sm text-emerald-900/80">
              We’re transparent about sources and keep our guides updated when practices
              change. If you spot an error or have a field-tested improvement, tell us—
              we’ll review and credit contributors.
            </p>
            <div className="mt-4">
              <Button variant="outline" asChild className="border-emerald-200 text-emerald-700">
                <Link href="/contact">Send feedback</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}