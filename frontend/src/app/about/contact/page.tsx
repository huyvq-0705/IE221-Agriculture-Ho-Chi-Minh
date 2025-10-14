import type { Metadata } from "next"
import { Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://agrihcm.shop"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Liên hệ – AgriHCM",
  description:
    "Liên hệ đội ngũ AgriHCM để đặt câu hỏi, gửi góp ý hoặc đề xuất hợp tác. Email, số điện thoại và địa chỉ liên hệ chính thức.",
  alternates: { canonical: "/contact" },
  keywords: [
    "AgriHCM",
    "liên hệ AgriHCM",
    "contact AgriHCM",
    "nông nghiệp bền vững",
    "tưới tiêu",
    "sức khỏe đất",
    "quản lý cây trồng",
  ],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    title: "Liên hệ – AgriHCM",
    description:
      "Kết nối với AgriHCM: email, điện thoại, địa chỉ và biểu mẫu phản hồi.",
    url: "/contact",
    siteName: "AgriHCM",
    images: [{ url: "/og-home.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Liên hệ – AgriHCM",
    description:
      "Gửi câu hỏi, góp ý hoặc hợp tác với đội ngũ AgriHCM qua email, điện thoại hoặc biểu mẫu.",
  },
}

export default function ContactPage() {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AgriHCM",
    url: SITE_URL,
    email: "hello@agrihcm.id.vn",
    telephone: "+84 123 456 789",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Thành phố Hồ Chí Minh",
      addressCountry: "VN",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "hello@agrihcm.id.vn",
        telephone: "+84 123 456 789",
        areaServed: "VN",
        availableLanguage: ["vi", "en"],
      },
    ],
  }

  return (
    <main
      className="mx-auto max-w-4xl px-5 py-10 md:py-14"
      aria-labelledby="page-title"
    >
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      <h1 id="page-title" className="text-3xl font-semibold text-emerald-900">
        Liên hệ AgriHCM
      </h1>
      <p className="mt-3 text-gray-700">
        Chúng tôi rất vui được lắng nghe bạn. Hãy gửi câu hỏi, góp ý hoặc ý tưởng
        hợp tác để cùng AgriHCM lan tỏa các thực hành canh tác bền vững.
      </p>

      {/* Thông tin liên hệ */}
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <div className="flex flex-col items-start rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <Mail className="h-6 w-6 text-emerald-600" aria-hidden="true" />
          <p className="mt-2 text-sm text-gray-600">Email</p>
          <a
            href="mailto:hello@agrihcm.id.vn"
            className="mt-1 text-emerald-700 hover:underline"
            aria-label="Gửi email đến AgriHCM"
          >
            hello@agrihcm.id.vn
          </a>
        </div>

        <div className="flex flex-col items-start rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <Phone className="h-6 w-6 text-emerald-600" aria-hidden="true" />
          <p className="mt-2 text-sm text-gray-600">Điện thoại</p>
          <a
            href="tel:+84123456789"
            className="mt-1 text-emerald-700 hover:underline"
            aria-label="Gọi đến số điện thoại AgriHCM"
          >
            +84 123 456 789
          </a>
        </div>

        <div className="flex flex-col items-start rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <MapPin className="h-6 w-6 text-emerald-600" aria-hidden="true" />
          <p className="mt-2 text-sm text-gray-600">Địa chỉ</p>
          <span className="mt-1 text-emerald-700">
            Thành phố Hồ Chí Minh, Việt Nam
          </span>
        </div>
      </div>

      {/* Biểu mẫu liên hệ */}
      <form className="mt-12 space-y-5" aria-label="Biểu mẫu liên hệ AgriHCM">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Họ và tên
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Nhập họ và tên của bạn"
            autoComplete="name"
            className="mt-1 w-full rounded-md border border-emerald-200 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-emerald-200 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700"
          >
            Nội dung
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Bạn muốn AgriHCM hỗ trợ điều gì?"
            className="mt-1 w-full rounded-md border border-emerald-200 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            required
          />
        </div>

        <Button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700"
          aria-label="Gửi tin nhắn đến AgriHCM"
        >
          Gửi tin nhắn
        </Button>
      </form>
    </main>
  )
}
