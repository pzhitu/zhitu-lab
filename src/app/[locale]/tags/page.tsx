import { getAllTags, getPostsByTag } from "@/lib/content"
import { PostCard } from "@/components/post-card"
import { TagCloud } from "@/components/tag-cloud"
import { getTranslations } from "next-intl/server"

export default async function TagsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const t = await getTranslations("Tags")
  const { tag } = await searchParams
  const allTags = getAllTags()
  const filteredPosts = tag ? getPostsByTag(tag) : null

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

      {allTags.length === 0 ? (
        <p className="text-subtle dark:text-subtle-dark py-20 text-center">{t("empty")}</p>
      ) : (
        <>
          <div className="mb-12">
            <TagCloud tags={allTags} />
          </div>

          {tag && filteredPosts && (
            <section>
              <h2
                className="text-lg font-semibold mb-6"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Posts tagged with &ldquo;{tag}&rdquo; ({filteredPosts.length})
              </h2>
              {filteredPosts.length === 0 ? (
                <p className="text-subtle dark:text-subtle-dark">No posts found.</p>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  {filteredPosts.map((post) => (
                    <PostCard key={`${post.category}/${post.slug}`} post={post} />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  )
}
