import { getPostsByCategory, CATEGORIES } from "@/lib/content"
import { PostCard } from "@/components/post-card"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ category: cat.slug }))
}

const CATEGORY_LABELS: Record<string, { title: string; description: string }> = {
  projects: { title: "项目记录", description: "项目复盘、技术方案回顾和深度解析。" },
  papers: { title: "论文笔记", description: "阅读论文后的个人理解、反思和关键思路提炼。" },
  debugging: { title: "排错手记", description: "排查问题的过程、根因分析和解决思路。" },
  interests: { title: "兴趣分享", description: "我感兴趣、正在学习的领域和知识分享。" },
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const catInfo = CATEGORIES.find((c) => c.slug === category)
  if (!catInfo) notFound()

  const labels = CATEGORY_LABELS[category]
  const posts = getPostsByCategory(category)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          {labels.title}
        </h1>
        <p className="text-subtle dark:text-subtle-dark text-lg">{labels.description}</p>
      </div>

      {posts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-subtle dark:text-subtle-dark text-lg">这个分类还没有文章。</p>
          <p className="text-subtle dark:text-subtle-dark mt-2 text-sm">
            在 <code>content/{category}/</code> 目录下创建 <code>.mdx</code> 文件即可。
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
