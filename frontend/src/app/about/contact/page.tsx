import type { Metadata } from "next"
import { Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the AgriHCM team.",
}

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-10 md:py-14">
      <h1 className="text-3xl font-semibold text-emerald-900">Contact us</h1>
      <p className="mt-3 text-gray-700">
        We’d love to hear from you. Reach out with questions, feedback, or collaboration ideas.
      </p>

      {/* Contact info */}
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <div className="flex flex-col items-start rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <Mail className="h-6 w-6 text-emerald-600" />
          <p className="mt-2 text-sm text-gray-600">Email</p>
          <a href="mailto:hello@agrihcm.id.vn" className="mt-1 text-emerald-700 hover:underline">
            hello@agrihcm.id.vn
          </a>
        </div>

        <div className="flex flex-col items-start rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <Phone className="h-6 w-6 text-emerald-600" />
          <p className="mt-2 text-sm text-gray-600">Phone</p>
          <a href="tel:+84123456789" className="mt-1 text-emerald-700 hover:underline">
            +84 123 456 789
          </a>
        </div>

        <div className="flex flex-col items-start rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <MapPin className="h-6 w-6 text-emerald-600" />
          <p className="mt-2 text-sm text-gray-600">Address</p>
          <span className="mt-1 text-emerald-700">
            Ho Chi Minh City, Vietnam
          </span>
        </div>
      </div>

      {/* Form */}
      <form className="mt-12 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border border-emerald-200 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-md border border-emerald-200 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            rows={4}
            className="mt-1 w-full rounded-md border border-emerald-200 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            required
          />
        </div>

        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
          Send message
        </Button>
      </form>
    </main>
  )
}
