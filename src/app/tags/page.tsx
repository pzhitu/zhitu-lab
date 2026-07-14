import { getAllTags, getPostsByTag } from "@/lib/content"
import { PostCard } from "@/components/post-card"
import { TagCloud } from "@/components/tag-cloud"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "标签 — 知途的实验室",
  description: "按主题浏览所有文章。",
  alternates: {
    canonical: "https://zhi-tu.me/tags",
  },
}

export default async function TagsPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { tag } = await searchParams
  const allTags = getAllTags()
  const filteredPosts = tag ? getPostsByTag(tag) : null

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          标签
        </h1>
        <p className="text-subtle dark:text-subtle-dark text-lg">按主题浏览文章。</p>
      </div>

      {allTags.length === 0 ? (
        <p className="text-subtle dark:text-subtle-dark py-20 text-center">暂无标签。</p>
      ) : (
        <>
          <div className="mb-12">
            <TagCloud tags={allTags} />
          </div>

          {tag && filteredPosts && (
            <section>
              <h2 className="text-lg font-semibold mb-6" style={{ fontFamily: "var(--font-body)" }}>
                标签「{tag}」下的文章（{filteredPosts.length} 篇）
              </h2>
              {filteredPosts.length === 0 ? (
                <p className="text-subtle dark:text-subtle-dark">没有找到相关文章。</p>
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
