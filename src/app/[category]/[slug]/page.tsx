import { getPostBySlug, getAllPosts, CATEGORIES } from "@/lib/content"
import { MDXContent } from "@/components/mdx-content"
import { Giscus } from "@/components/giscus"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

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

export default async function PostPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params
  const catInfo = CATEGORIES.find((c) => c.slug === category)
  if (!catInfo) notFound()

  const post = getPostBySlug(category, slug)
  if (!post) notFound()

  const { title, description, tags, date } = post.frontmatter

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link href={`/${category}`} className="inline-flex items-center gap-1 text-sm text-subtle dark:text-subtle-dark hover:text-text dark:hover:text-text-dark mb-8">
        ← 返回{CATEGORY_LABELS[category]}
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: "var(--font-serif)", lineHeight: 1.2 }}>
          {title}
        </h1>
        {description && (
          <p className="text-lg text-subtle dark:text-subtle-dark mb-4">{description}</p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm text-subtle dark:text-subtle-dark">
          <time dateTime={date}>{formatDate(date)}</time>
          <span>·</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warm-100 dark:bg-warm-900 text-warm-700 dark:text-warm-300">
            {CATEGORY_LABELS[category]}
          </span>
        </div>
      </header>

      <MDXContent source={post.content} />

      {tags.length > 0 && (
        <div className="mt-12 pt-6 border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
          <span className="text-sm font-medium text-subtle dark:text-subtle-dark mr-3">标签：</span>
          {tags.map((tag) => (
            <Link key={tag} href={`/tags?tag=${encodeURIComponent(tag)}`} className="inline-block text-sm mr-2 mb-2 px-2.5 py-0.5 rounded-full bg-surface dark:bg-surface-dark text-subtle dark:text-subtle-dark hover:text-text dark:hover:text-text-dark transition-colors">
              {tag}
            </Link>
          ))}
        </div>
      )}

      <Giscus />
    </article>
  )
}
