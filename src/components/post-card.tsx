"use client"

import Link from "next/link"
import { Post } from "@/lib/content"
import { usePathname } from "next/navigation"
import { formatDate } from "@/lib/utils"

export function PostCard({ post }: { post: Post }) {
  const pathname = usePathname()
  const locale = pathname.split("/")[1]
  const isZh = locale === "zh"

  const title = isZh ? post.frontmatter.title : (post.frontmatter.titleEn || post.frontmatter.title)
  const description = isZh
    ? post.frontmatter.description
    : (post.frontmatter.descriptionEn || post.frontmatter.description)
  const tags = isZh
    ? post.frontmatter.tags
    : (post.frontmatter.tagsEn || post.frontmatter.tags)

  return (
    <Link
      href={`/${locale}/${post.category}/${post.slug}`}
      className="card block group no-underline"
      style={{ color: "inherit" }}
    >
      <article>
        <div className="flex items-center gap-3 text-sm text-subtle dark:text-subtle-dark mb-2">
          <time dateTime={post.frontmatter.date}>
            {formatDate(post.frontmatter.date, locale)}
          </time>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warm-100 dark:bg-warm-900 text-warm-700 dark:text-warm-300">
            {post.category}
          </span>
        </div>

        <h3
          className="text-xl font-semibold mb-2 group-hover:text-warm-600 dark:group-hover:text-warm-400 transition-colors"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {title}
        </h3>

        {description && (
          <p className="text-[15px] text-subtle dark:text-subtle-dark line-clamp-2 leading-relaxed mb-3">
            {description}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-md bg-surface dark:bg-surface-dark text-subtle dark:text-subtle-dark"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </Link>
  )
}
