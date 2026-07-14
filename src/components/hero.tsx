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
    <section className="py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="max-w-[36rem]">
          {/* Main greeting — large, bold, serif */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {t("greeting")}
          </h1>

          {/* Role line — smaller, body font, warm accent color */}
          <p
            className="mt-5 text-lg sm:text-xl leading-relaxed"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-subtle)",
            }}
          >
            {t("role")}
          </p>

          {/* Description — even quieter, a short personal note */}
          <p
            className="mt-4 text-base leading-relaxed max-w-[32rem]"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-subtle)",
              opacity: 0.75,
            }}
          >
            {t("description")}
          </p>

          {/* Actions — primary CTA + subtle secondary links */}
          <div className="mt-8 flex items-center gap-6">
            <Link href={`${base}/archive`} className="btn-primary">
              {t("cta")}
            </Link>
            <div className="flex items-center gap-4 text-sm" style={{ color: "var(--color-subtle)" }}>
              <a
                href="https://github.com/pzhitu"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-warm-600 dark:hover:text-warm-400 transition-colors"
              >
                {t("social.github")}
              </a>
              <span style={{ opacity: 0.3 }}>/</span>
              <a
                href="mailto:your.email@example.com"
                className="hover:text-warm-600 dark:hover:text-warm-400 transition-colors"
              >
                {t("social.email")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
