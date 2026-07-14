"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { TagCloud } from "./tag-cloud"

export function Footer({ tags }: { tags: { name: string; nameEn?: string; count: number }[] }) {
  const t = useTranslations("Footer")
  const pathname = usePathname()
  const locale = pathname.split("/")[1]
  const base = `/${locale}`

  return (
    <footer className="mt-auto border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* Tag cloud */}
        <div className="mb-8">
          <TagCloud tags={tags} compact />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-subtle dark:text-subtle-dark">
          <p>{t("builtWith")}</p>
          <div className="flex items-center gap-4">
            <Link
              href={`${base}/tags`}
              className="text-sm text-subtle dark:text-subtle-dark hover:text-text dark:hover:text-text-dark"
            >
              {t("allTags")}
            </Link>
            <span>/</span>
            <a href="/rss.xml" className="text-sm text-subtle dark:text-subtle-dark hover:text-text dark:hover:text-text-dark">
              {t("rss")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
