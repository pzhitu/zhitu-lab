import { getAllPosts } from "@/lib/content"
import { PostCard } from "@/components/post-card"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "归档 — Zhitu Space",
  description: "所有卡片，按年份排列。",
  alternates: { canonical: "https://zhi-tu.me/archive" },
}

export default function ArchivePage() {
  const posts = getAllPosts()

  const byYear = posts.reduce<Record<string, typeof posts>>((acc, post) => {
    const year = post.frontmatter.date.slice(0, 4)
    if (!acc[year]) acc[year] = []
    acc[year].push(post)
    return acc
  }, {})

  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a))

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          归档
        </h1>
        <p className="text-ink-subtle dark:text-ink-subtle-dark text-base">
          所有卡片，按年份排列。
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="index-card text-center py-16">
          <p className="text-ink-subtle dark:text-ink-subtle-dark">暂无卡片。</p>
        </div>
      ) : (
        <div className="space-y-12">
          {years.map((year) => (
            <section key={year}>
              <h3
                className="text-5xl font-bold mb-6 tracking-tight"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--color-accent-soft)",
                  WebkitTextStroke: "1px var(--color-warm-400)",
                }}
              >
                {year}
              </h3>
              <div className="space-y-4">
                {byYear[year].map((post, i) => (
                  <PostCard key={`${post.category}/${post.slug}`} post={post} variant={i % 4} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
