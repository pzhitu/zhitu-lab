"use client"

import Link from "next/link"
import type { Post } from "@/lib/content"
import { PostCard } from "@/components/post-card"

interface TagLike {
  name: string
  nameEn?: string
  count: number
}

interface CategoryLink {
  slug: string
  title: string
  description: string
  count: number
}

const CATEGORY_LABELS: Record<string, { title: string; description: string }> = {
  projects: { title: "项目记录", description: "项目复盘、技术方案回顾和深度解析。" },
  papers: { title: "论文笔记", description: "阅读论文后的个人理解、反思和关键思路提炼。" },
  debugging: { title: "排错手记", description: "排查问题的过程、根因分析和解决思路。" },
  interests: { title: "兴趣分享", description: "我感兴趣、正在学习的领域和知识分享。" },
  moments: { title: "拾光", description: "语录、随想、感悟——沿途拾起的片刻光亮。" },
}

export function Desk({ posts, tags, categories }: { posts: Post[]; tags: TagLike[]; categories: CategoryLink[] }) {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_16rem]">
        {/* ── Left: recent cards ── */}
        <div>
          <h2
            className="text-xs font-semibold uppercase tracking-wider mb-5 flex items-center gap-2"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink-subtle)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-terminal-accent)" }} />
            最近写下的卡片
          </h2>

          {posts.length === 0 ? (
            <div className="index-card text-center py-16">
              <p className="text-ink-subtle dark:text-ink-subtle-dark text-sm">
                书桌上还没有卡片。写下第一张吧。
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, i) => (
                <PostCard key={`${post.category}/${post.slug}`} post={post} variant={i % 4} />
              ))}
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-6">
          {/* Category cards */}
          <div>
            <h3
              className="text-[11px] font-semibold uppercase tracking-wider mb-3"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink-subtle)" }}
            >
              分类
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  className="drawer block group"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold group-hover:text-accent dark:group-hover:text-accent-light transition-colors">
                      {cat.title}
                    </span>
                    <span className="text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink-faint)" }}>
                      {cat.count}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--color-ink-subtle)" }}>
                    {cat.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3
              className="text-[11px] font-semibold uppercase tracking-wider mb-3"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink-subtle)" }}
            >
              索引词
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 12).map((tag) => (
                <a
                  key={tag.name}
                  href={`/tags?tag=${encodeURIComponent(tag.name)}`}
                  className="text-[12px] px-2.5 py-1 rounded-sm bg-surface dark:bg-surface-dark text-ink-subtle dark:text-ink-subtle-dark hover:text-accent dark:hover:text-accent-light transition-colors"
                  style={{ textDecoration: "none" }}
                >
                  {tag.name}
                </a>
              ))}
            </div>
            {tags.length > 12 && (
              <Link
                href="/tags"
                className="inline-block mt-2 text-[11px] transition-colors"
                style={{ color: "var(--color-ink-faint)" }}
              >
                全部 {tags.length} 个 →
              </Link>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
