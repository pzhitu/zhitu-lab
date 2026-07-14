import { getAllPosts } from "@/lib/content"
import { PostCard } from "@/components/post-card"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "归档 — 知途的实验室",
  description: "所有文章，按时间排列。",
  alternates: {
    canonical: "https://zhi-tu.me/archive",
  },
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
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          归档
        </h1>
        <p className="text-subtle dark:text-subtle-dark text-lg">所有文章，按时间排列。</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-subtle dark:text-subtle-dark py-20 text-center">暂无文章。</p>
      ) : (
        <div className="space-y-12">
          {years.map((year) => (
            <section key={year}>
              <h2 className="text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-serif)", color: "var(--color-warm-200)" }}>
                {year}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {byYear[year].map((post) => (
                  <PostCard key={`${post.category}/${post.slug}`} post={post} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
