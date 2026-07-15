"use client"

import Link from "next/link"
import { Post } from "@/lib/content"
import { formatDateFull } from "@/lib/utils"

const CATEGORY_LABELS: Record<string, string> = {
  projects: "项目记录",
  papers: "论文笔记",
  debugging: "排错手记",
  interests: "兴趣分享",
  moments: "拾光",
}

const CARD_COLORS = ["", "index-card--yellow", "index-card--pink", "index-card--green"]

export function PostCard({ post, variant = 0 }: { post: Post; variant?: number }) {
  const { title, description, tags, date } = post.frontmatter
  const colorClass = CARD_COLORS[variant % CARD_COLORS.length]

  return (
    <Link
      href={`/${post.category}/${post.slug}`}
      className={`index-card ${colorClass} block group`}
      style={{ color: "inherit", textDecoration: "none" }}
    >
      <article>
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-sm"
            style={{
              fontFamily: "var(--font-serif)",
              background: "var(--color-accent-soft)",
              color: "var(--color-accent)",
            }}
          >
            {CATEGORY_LABELS[post.category] || post.category}
          </span>
          <time dateTime={date} className="text-[11px]" style={{ color: "var(--color-ink-faint)" }}>
            {formatDateFull(date)}
          </time>
        </div>

        <h3
          className="text-lg font-bold mb-1.5 group-hover:text-accent dark:group-hover:text-accent-light transition-colors"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {title}
        </h3>

        {description && (
          <p className="text-[14px] leading-relaxed line-clamp-2 mb-2.5" style={{ color: "var(--color-ink-subtle)" }}>
            {description}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded-sm"
                style={{ background: "var(--color-surface)", color: "var(--color-ink-subtle)" }}
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[10px]" style={{ color: "var(--color-ink-faint)" }}>+{tags.length - 3}</span>
            )}
          </div>
        )}
      </article>
    </Link>
  )
}
