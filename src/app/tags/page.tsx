import { getAllTags, getPostsByTag } from "@/lib/content"
import { PostCard } from "@/components/post-card"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "主题索引",
  description: "按主题检索所有卡片。",
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
        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          主题索引
        </h1>
        <p className="text-ink-subtle dark:text-ink-subtle-dark text-base">
          打开抽屉，按主题查阅卡片。
        </p>
      </div>

      {allTags.length === 0 ? (
        <div className="index-card text-center py-16">
          <p className="text-ink-subtle dark:text-ink-subtle-dark">暂无索引词。</p>
        </div>
      ) : (
        <>
          {/* ── Drawer grid ── */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-12">
            {allTags.map((t) => {
              const isActive = tag === t.name
              return (
                <a
                  key={t.name}
                  href={isActive ? "/tags" : `/tags?tag=${encodeURIComponent(t.name)}`}
                  className={`drawer flex items-center justify-between ${isActive ? "ring-1 ring-accent dark:ring-accent-light" : ""}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: isActive ? "var(--color-accent)" : "var(--color-border)" }}
                    />
                    <span className={`text-sm ${isActive ? "font-medium" : ""}`}>
                      {t.name}
                    </span>
                  </div>
                  <span
                    className="text-xs shrink-0 ml-2"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink-faint)" }}
                  >
                    {t.count}
                  </span>
                </a>
              )
            })}
          </div>

          {/* ── Filtered posts ── */}
          {tag && filteredPosts && (
            <section>
              <h2
                className="text-sm font-semibold mb-5 flex items-center gap-2"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink-subtle)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--color-terminal-accent)" }} />
                索引词「{tag}」({filteredPosts.length} 张卡片)
              </h2>
              {filteredPosts.length === 0 ? (
                <p className="text-ink-subtle dark:text-ink-subtle-dark text-sm">没有找到相关卡片。</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredPosts.map((post, i) => (
                    <PostCard key={`${post.category}/${post.slug}`} post={post} variant={i % 4} />
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
