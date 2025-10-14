import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sprout, Droplets, Leaf, BookOpen, Users, ShieldCheck } from "lucide-react"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://agrihcm.shop"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Giới thiệu – AgriHCM",
  description:
    "Tìm hiểu về AgriHCM: chúng tôi chia sẻ hướng dẫn nông nghiệp thực hành, dựa trên khoa học để canh tác thông minh và bền vững hơn.",
  alternates: { canonical: "/about" },
  keywords: [
    "AgriHCM",
    "giới thiệu AgriHCM",
    "nông nghiệp bền vững",
    "hướng dẫn nông nghiệp",
    "tưới tiêu",
    "sức khỏe đất",
    "quản lý cây trồng",
  ],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    title: "Giới thiệu – AgriHCM",
    description:
      "AgriHCM biến tri thức nông học thành hành động đơn giản, hiệu quả cho mùa vụ bền vững.",
    url: "/about",
    siteName: "AgriHCM",
    images: [{ url: "/og-home.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Giới thiệu – AgriHCM",
    description:
      "AgriHCM chia sẻ hướng dẫn thực hành, dựa trên bằng chứng, ưu tiên bền vững.",
  },
}

export default function AboutPage() {
  const pillars = [
    {
      icon: <Sprout className="h-5 w-5" />,
      title: "Ưu tiên bền vững",
      text: "AgriHCM đặt sức khỏe đất, đa dạng sinh học và quản trị nước lên hàng đầu trong mọi hướng dẫn.",
    },
    {
      icon: <Droplets className="h-5 w-5" />,
      title: "Thực tiễn & sẵn sàng áp dụng",
      text: "Quy trình từng bước để bạn áp dụng ngay trong mùa vụ này—không lý thuyết mơ hồ.",
    },
    {
      icon: <Leaf className="h-5 w-5" />,
      title: "Dựa trên bằng chứng",
      text: "Tham chiếu nguồn nông học và thử nghiệm thực địa để lời khuyên luôn vững chắc.",
    },
  ]

  const whatWeDo = [
    "Xuất bản hướng dẫn súc tích cho trang trại quy mô nhỏ–trung bình.",
    "Chuyển nghiên cứu thành checklist và template dễ dùng.",
    "Nêu bật cải tiến chi phí thấp với ROI rõ ràng.",
    "Chia sẻ câu chuyện thành công và sai lầm nên tránh.",
  ]

  const team = [
    { name: "Quang Huy Vũ", role: "Người sáng lập & Biên tập", initials: "QV" },
  ]

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 md:py-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-8 md:p-12">
        <div className="max-w-3xl">
          <p className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
            Về AgriHCM
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-tight text-emerald-900 md:text-5xl">
            Hướng dẫn nông nghiệp thực hành cho cánh đồng thật, mùa vụ thật.
          </h1>
          <p className="mt-4 text-pretty text-base text-gray-700 md:text-lg">
            Chúng tôi là một nhóm nhỏ đam mê biến tri thức nông học thành hành động
            đơn giản. Sứ mệnh của AgriHCM là giúp bà con tiết kiệm nước, cải thiện đất,
            tăng năng suất một cách bền vững—với chi phí hợp lý.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/blog" aria-label="Đọc blog AgriHCM">Đọc blog AgriHCM</Link>
            </Button>
            <Button variant="outline" asChild className="border-emerald-200 text-emerald-700">
              <Link href="/about/contact" aria-label="Liên hệ AgriHCM">Liên hệ</Link>
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
          <h2 className="text-xl font-semibold text-emerald-900">Chúng tôi làm gì</h2>
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
          <h2 className="text-xl font-semibold text-emerald-900">Đội ngũ</h2>
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
            <h3 className="text-lg font-semibold text-emerald-900">Cam kết của chúng tôi</h3>
            <p className="mt-1 text-sm text-emerald-900/80">
              AgriHCM minh bạch về nguồn tài liệu và luôn cập nhật hướng dẫn khi thực hành thay đổi.
              Nếu bạn phát hiện lỗi hoặc có cải tiến đã thử nghiệm thực tế, hãy cho chúng tôi biết—
              chúng tôi sẽ xem xét và ghi nhận đóng góp.
            </p>
            <div className="mt-4">
              <Button variant="outline" asChild className="border-emerald-200 text-emerald-700">
                <Link href="/contact" aria-label="Gửi góp ý cho AgriHCM">Gửi góp ý</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
