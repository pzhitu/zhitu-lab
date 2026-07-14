import { getTranslations } from "next-intl/server"
import { getAllPosts } from "@/lib/content"
import { Hero } from "@/components/hero"
import { PostCard } from "@/components/post-card"

export default async function HomePage() {
  const t = await getTranslations("HomePage")
  const posts = getAllPosts().slice(0, 6)

  return (
    <>
      <Hero />
      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <h2
          className="text-lg font-semibold uppercase tracking-wider text-subtle dark:text-subtle-dark mb-8"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {t("recentPosts")}
        </h2>

        {posts.length === 0 ? (
          <p className="text-subtle dark:text-subtle-dark">No posts yet. Start writing!</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={`${post.category}/${post.slug}`} post={post} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
