import { CATEGORIES, getAllPosts } from "@/lib/content"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "分类 — Zhitu Space",
  description: "按分类浏览所有卡片。",
  alternates: { canonical: "https://zhi-tu.me/categories" },
}

const CATEGORY_LABELS: Record<string, { title: string; description: string }> = {
  projects: { title: "项目记录", description: "项目复盘、技术方案回顾和深度解析。" },
  papers: { title: "论文笔记", description: "阅读论文后的个人理解、反思和关键思路提炼。" },
  debugging: { title: "排错手记", description: "排查问题的过程、根因分析和解决思路。" },
  interests: { title: "兴趣分享", description: "我感兴趣、正在学习的领域和知识分享。" },
  moments: { title: "拾光", description: "语录、随想、感悟——沿途拾起的片刻光亮。" },
}

export default function CategoriesPage() {
  const allPosts = getAllPosts()

  const categories = CATEGORIES
    .map((cat) => ({
      slug: cat.slug,
      title: CATEGORY_LABELS[cat.slug]?.title || cat.slug,
      description: CATEGORY_LABELS[cat.slug]?.description || "",
      count: allPosts.filter((p) => p.category === cat.slug).length,
    }))

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          分类
        </h1>
        <p className="text-[var(--color-ink-subtle)] text-base">
          所有的卡片，按类别陈列。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className="drawer block group"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-base font-semibold group-hover:text-[var(--color-accent)] transition-colors">
                {cat.title}
              </span>
              <span
                className="text-xs shrink-0 ml-3"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink-faint)" }}
              >
                {cat.count} 张卡片
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-ink-subtle)" }}>
              {cat.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
