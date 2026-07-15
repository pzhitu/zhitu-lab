import { getAllPosts, getAllTags, CATEGORIES } from "@/lib/content"
import { Desk } from "@/components/desk"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Zhitu Space — 书桌",
  description: "知途的个人研究室。记录项目复盘、论文阅读笔记、踩坑经验和兴趣分享。",
  keywords: ["博客", "技术博客", "工科", "项目复盘", "论文笔记", "机器学习", "深度学习"],
  openGraph: {
    title: "Zhitu Space — 知途的个人研究室",
    description: "知途的个人研究室。记录项目复盘、论文阅读笔记、踩坑经验和兴趣分享。",
    type: "website",
    locale: "zh_CN",
    url: "https://zhi-tu.me",
  },
  alternates: { canonical: "https://zhi-tu.me" },
}

const CATEGORY_LABELS: Record<string, { title: string; description: string }> = {
  projects: { title: "项目记录", description: "项目复盘、技术方案回顾和深度解析。" },
  papers: { title: "论文笔记", description: "阅读论文后的个人理解、反思和关键思路提炼。" },
  debugging: { title: "排错手记", description: "排查问题的过程、根因分析和解决思路。" },
  interests: { title: "兴趣分享", description: "我感兴趣、正在学习的领域和知识分享。" },
  moments: { title: "拾光", description: "语录、随想、感悟——沿途拾起的片刻光亮。" },
}

export default function HomePage() {
  const allPosts = getAllPosts()
  const posts = allPosts.slice(0, 6)
  const tags = getAllTags()

  const categories = CATEGORIES
    .map((cat) => ({
      slug: cat.slug,
      title: CATEGORY_LABELS[cat.slug]?.title || cat.slug,
      description: CATEGORY_LABELS[cat.slug]?.description || "",
      count: allPosts.filter((p) => p.category === cat.slug).length,
    }))

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 pt-10 pb-6 sm:px-6 sm:pt-14">
        <p className="text-[15px] leading-relaxed max-w-[32rem]" style={{ color: "var(--color-ink-subtle)" }}>
          你好，我是知途。随便坐，这儿有点乱，但很舒服。
        </p>
      </div>
      <Desk posts={posts} tags={tags} categories={categories} />
    </>
  )
}
