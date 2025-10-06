"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Slide = { src: string; alt?: string }

export function HeroSlider({
  slides,
  intervalMs = 5000,
}: {
  slides: Slide[]
  intervalMs?: number
}) {
  const [index, setIndex] = useState(0)
  const count = slides.length

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count),
    [count]
  )

  // auto-rotate
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs)
    return () => clearInterval(id)
  }, [count, intervalMs])

  const current = useMemo(() => slides[index], [slides, index])

  return (
    <section className="relative mx-auto mt-4 w-full max-w-7xl overflow-hidden rounded-3xl border border-emerald-100 shadow-xl">
      {/* image */}
      <div className="relative h-[46vh] min-h-[18rem] w-full">
        {/* Crossfade with opacity */}
        {slides.map((s, i) => (
          <img
            key={s.src}
            src={s.src}
            alt={s.alt || `Slide ${i + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        ))}
        {/* overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-10">
          <h1 className="text-balance text-3xl font-semibold leading-tight text-white md:text-4xl">
            Smarter, sustainable farming—season after season.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/90 md:text-base">
            Field-ready guides to save water, improve soil, and boost yields.
          </p>
        </div>

        {/* controls */}
        <button
          aria-label="Previous slide"
          onClick={() => go(-1)}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
        >
          <ChevronLeft className="h-5 w-5 text-emerald-700" />
        </button>
        <button
          aria-label="Next slide"
          onClick={() => go(1)}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
        >
          <ChevronRight className="h-5 w-5 text-emerald-700" />
        </button>

        {/* dots */}
        <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 shadow">
            {slides.map((_s, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  i === index ? "bg-emerald-600" : "bg-emerald-200 hover:bg-emerald-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
