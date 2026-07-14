import { getAllPosts } from "@/lib/content"
import { PostCard } from "@/components/post-card"
import { getTranslations } from "next-intl/server"

export default async function ArchivePage() {
  const t = await getTranslations("Archive")
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
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {t("title")}
        </h1>
        <p className="text-subtle dark:text-subtle-dark text-lg">{t("description")}</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-subtle dark:text-subtle-dark py-20 text-center">{t("empty")}</p>
      ) : (
        <div className="space-y-12">
          {years.map((year) => (
            <section key={year}>
              <h2
                className="text-5xl font-bold mb-6"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--color-warm-200)",
                }}
              >
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
