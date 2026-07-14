"use client"

import Link from "next/link"
import { TagCloud } from "./tag-cloud"

export function Footer({ tags }: { tags: { name: string; nameEn?: string; count: number }[] }) {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <TagCloud tags={tags} compact />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-subtle dark:text-subtle-dark">
          <p>基于 Next.js、MDX 和 Tailwind CSS 构建。部署于 Vercel。</p>
          <div className="flex items-center gap-4">
            <Link href="/tags" className="text-sm text-subtle dark:text-subtle-dark hover:text-text dark:hover:text-text-dark">
              全部标签
            </Link>
            <span>/</span>
            <a href="/rss.xml" className="text-sm text-subtle dark:text-subtle-dark hover:text-text dark:hover:text-text-dark">
              RSS
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
