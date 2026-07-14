"use client"

import Link from "next/link"

interface Tag {
  name: string
  nameEn?: string
  count: number
}

export function TagCloud({ tags, compact = false }: { tags: Tag[]; compact?: boolean }) {
  if (tags.length === 0) return null

  const maxCount = tags[0]?.count || 1

  return (
    <div>
      {!compact && (
        <h4
          className="text-xs font-semibold uppercase tracking-wider text-subtle dark:text-subtle-dark mb-3"
          style={{ fontFamily: "var(--font-body)" }}
        >
          标签
        </h4>
      )}
      <div className="flex flex-wrap gap-2">
        {tags.slice(0, compact ? 15 : tags.length).map((tag) => {
          const ratio = tag.count / maxCount
          const size = compact ? "text-xs" : ratio > 0.7 ? "text-sm" : ratio > 0.3 ? "text-xs" : "text-[11px]"
          const opacity = compact ? "opacity-80" : ratio > 0.5 ? "opacity-100" : "opacity-60"

          return (
            <Link
              key={tag.name}
              href={`/tags?tag=${encodeURIComponent(tag.name)}`}
              className={`${size} ${opacity} px-2.5 py-1 rounded-full transition-colors bg-surface dark:bg-surface-dark text-subtle dark:text-subtle-dark hover:text-text dark:hover:text-text-dark hover:bg-warm-100 dark:hover:bg-warm-900`}
            >
              {tag.name}
            </Link>
          )
        })}
      </div>
      {compact && tags.length > 15 && (
        <Link href="/tags" className="inline-block mt-2 text-xs text-subtle dark:text-subtle-dark hover:text-text dark:hover:text-text-dark">
          + {tags.length - 15} 更多 →
        </Link>
      )}
    </div>
  )
}
