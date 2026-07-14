import { getAllPosts } from "@/lib/content"
import { Hero } from "@/components/hero"
import { PostCard } from "@/components/post-card"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "知途的实验室 — 记录、思考与分享",
  description: "知途的个人博客。记录项目复盘、论文阅读笔记、踩坑经验和兴趣分享。",
  keywords: ["博客", "技术博客", "工科", "项目复盘", "论文笔记", "机器学习", "深度学习"],
  openGraph: {
    title: "知途的实验室 — 记录、思考与分享",
    description: "知途的个人博客。记录项目复盘、论文阅读笔记、踩坑经验和兴趣分享。",
    type: "website",
    locale: "zh_CN",
    url: "https://zhi-tu.me",
  },
  alternates: {
    canonical: "https://zhi-tu.me",
  },
}

export default function HomePage() {
  const posts = getAllPosts().slice(0, 6)

  return (
    <>
      <Hero />
      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <h2
          className="text-lg font-semibold uppercase tracking-wider text-subtle dark:text-subtle-dark mb-8"
          style={{ fontFamily: "var(--font-body)" }}
        >
          最近更新
        </h2>

        {posts.length === 0 ? (
          <p className="text-subtle dark:text-subtle-dark">暂无文章，开始写吧！</p>
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
