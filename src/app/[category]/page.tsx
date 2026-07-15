import { getPostsByCategory, CATEGORIES } from "@/lib/content"
import { PostCard } from "@/components/post-card"
import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ category: cat.slug }))
}

const CATEGORY_LABELS: Record<string, { title: string; description: string }> = {
  projects: { title: "项目记录", description: "项目复盘、技术方案回顾和深度解析。" },
  papers: { title: "论文笔记", description: "阅读论文后的个人理解、反思和关键思路提炼。" },
  debugging: { title: "排错手记", description: "排查问题的过程、根因分析和解决思路。" },
  interests: { title: "兴趣分享", description: "我感兴趣、正在学习的领域和知识分享。" },
  moments: { title: "拾光", description: "语录、随想、感悟——沿途拾起的片刻光亮。" },
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params
  const labels = CATEGORY_LABELS[category]
  if (!labels) return {}
  return {
    title: `${labels.title} — Zhitu Space`,
    description: labels.description,
    alternates: {
      canonical: `https://zhi-tu.me/${category}`,
    },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const catInfo = CATEGORIES.find((c) => c.slug === category)
  if (!catInfo) notFound()

  const labels = CATEGORY_LABELS[category]
  const posts = getPostsByCategory(category)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-ink-subtle dark:text-ink-subtle-dark hover:text-accent dark:hover:text-accent-light transition-colors mb-6"
      >
        ← 书桌
      </Link>

      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          {labels.title}
        </h1>
        <p className="text-ink-subtle dark:text-ink-subtle-dark text-base">{labels.description}</p>
      </div>

      {posts.length === 0 ? (
        <div className="index-card text-center py-16">
          <p className="text-ink-subtle dark:text-ink-subtle-dark text-sm">
            这个抽屉还是空的。
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((post, i) => (
            <PostCard key={post.slug} post={post} variant={i % 4} />
          ))}
        </div>
      )}
    </div>
  )
}
