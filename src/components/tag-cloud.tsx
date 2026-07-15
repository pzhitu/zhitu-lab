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
          className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
          style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink-subtle)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-terminal-accent" />
          索引词
        </h4>
      )}
      <div className="flex flex-wrap gap-1.5">
        {tags.slice(0, compact ? 15 : tags.length).map((tag) => {
          const ratio = tag.count / maxCount
          const fontSize = compact ? "text-[12px]" : ratio > 0.7 ? "text-[14px]" : ratio > 0.3 ? "text-[12px]" : "text-[11px]"
          const weight = ratio > 0.5 ? "font-medium" : "font-normal"

          return (
            <Link
              key={tag.name}
              href={`/tags?tag=${encodeURIComponent(tag.name)}`}
              className={`${fontSize} ${weight} px-2.5 py-1 rounded-sm transition-colors bg-surface dark:bg-surface-dark text-ink-subtle dark:text-ink-subtle-dark hover:text-accent dark:hover:text-accent-light`}
              style={{ textDecoration: "none" }}
            >
              {tag.name}
            </Link>
          )
        })}
      </div>
      {compact && tags.length > 15 && (
        <Link
          href="/tags"
          className="inline-block mt-2 text-[12px] text-ink-faint dark:text-ink-faint-dark hover:text-accent dark:hover:text-accent-light transition-colors"
        >
          全部索引 →
        </Link>
      )}
    </div>
  )
}
