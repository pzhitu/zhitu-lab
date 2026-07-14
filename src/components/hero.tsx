"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"

export function Hero() {
  const t = useTranslations("HomePage.hero")
  const pathname = usePathname()
  const locale = pathname.split("/")[1]
  const base = `/${locale}`

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            style={{
              fontFamily: "var(--font-serif)",
              lineHeight: 1.1,
              color: "var(--color-text)",
            }}
          >
            {t("greeting")}
            <span
              className="block text-2xl sm:text-3xl lg:text-4xl mt-3 font-normal"
              style={{ color: "var(--color-subtle)", fontFamily: "var(--font-body)" }}
            >
              {t("tagline")}
            </span>
          </h1>
          <Link
            href={`${base}/archive`}
            className="inline-flex items-center gap-2 text-base font-medium"
          >
            {t("cta")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
