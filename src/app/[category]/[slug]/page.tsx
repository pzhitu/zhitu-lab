import { getPostBySlug, getAllPosts, CATEGORIES } from "@/lib/content"
import { MDXContent } from "@/components/mdx-content"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import Comments from "@/components/comments"
import type { Metadata } from "next"

const CATEGORY_LABELS: Record<string, string> = {
  projects: "项目记录",
  papers: "论文笔记",
  debugging: "排错手记",
  interests: "兴趣分享",
  moments: "拾光",
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ category: post.category, slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata> {
  const { category, slug: encodedSlug } = await params
  const slug = decodeURIComponent(encodedSlug)
  const post = getPostBySlug(category, slug)
  if (!post) return {}

  const { title, titleEn, description, descriptionEn, tags, tagsEn } = post.frontmatter
  return {
    title: `${title}${titleEn ? ` (${titleEn})` : ""} — Zhitu Space`,
    description: descriptionEn ? `${description} | ${descriptionEn}` : description,
    keywords: [...tags, ...(tagsEn || [])],
    openGraph: {
      title: `${title}${titleEn ? ` (${titleEn})` : ""} — Zhitu Space`,
      description: descriptionEn ? `${description} | ${descriptionEn}` : description,
      type: "article",
      publishedTime: post.frontmatter.date,
      authors: ["知途"],
      tags,
      locale: "zh_CN",
    },
    alternates: { canonical: `https://zhi-tu.me/${category}/${slug}` },
  }
}

export default async function PostPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug: encodedSlug } = await params
  const slug = decodeURIComponent(encodedSlug)
  const catInfo = CATEGORIES.find((c) => c.slug === category)
  if (!catInfo) notFound()

  const post = getPostBySlug(category, slug)
  if (!post) notFound()

  const { title, description, tags, date } = post.frontmatter

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="paper">
        <Link
          href={`/${category}`}
          className="inline-flex items-center gap-1 text-[13px] mb-8 transition-colors"
          style={{ color: "var(--color-ink-faint)" }}
        >
          ← {CATEGORY_LABELS[category]}
        </Link>

        <header className="mb-10">
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight mb-3"
            style={{ fontFamily: "var(--font-serif)", lineHeight: 1.2 }}
          >
            {title}
          </h1>
          {description && (
            <p className="text-[13px] leading-relaxed mb-3" style={{ color: "var(--color-ink-subtle)" }}>
              {description}
            </p>
          )}
          <div className="flex items-center gap-2 text-[13px]" style={{ color: "var(--color-ink-faint)" }}>
            <time dateTime={date}>归档于 {formatDate(date)}</time>
          </div>
        </header>

        <MDXContent source={post.content} />

        {/* ── After the article ── */}
        <div className="mt-20 pt-8 border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
          {tags.length > 0 && (
            <div className="mb-8">
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink-subtle)" }}
              >
                索引词
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tags?tag=${encodeURIComponent(tag)}`}
                    className="text-xs px-2 py-0.5 rounded-sm bg-surface dark:bg-surface-dark transition-colors"
                    style={{ color: "var(--color-ink-subtle)" }}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm transition-colors"
              style={{ color: "var(--color-ink-subtle)" }}
            >
              ← 回到书桌
            </Link>
          </div>
        </div>
      </div>

      {/* ── Comments ── */}
      <div className="mt-16 mx-auto max-w-[40rem]">
        <h3
          className="text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2"
          style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink-subtle)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-terminal-accent)" }} />
          翻阅留言
        </h3>
        <div className="library-card">
          <Comments slug={`${category}/${slug}`} />
        </div>
      </div>
    </article>
  )
}
