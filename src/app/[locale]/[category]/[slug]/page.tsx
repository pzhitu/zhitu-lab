import { getPostBySlug, getAllPosts, CATEGORIES } from "@/lib/content"
import { MDXContent } from "@/components/mdx-content"
import { Giscus } from "@/components/giscus"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export async function generateStaticParams() {
  const params: { locale: string; category: string; slug: string }[] = []
  const posts = getAllPosts()
  for (const post of posts) {
    params.push({ locale: "zh", category: post.category, slug: post.slug })
    params.push({ locale: "en", category: post.category, slug: post.slug })
  }
  return params
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>
}) {
  const { locale, category, slug } = await params
  const catInfo = CATEGORIES.find((c) => c.slug === category)
  if (!catInfo) notFound()

  const post = getPostBySlug(category, slug)
  if (!post) notFound()

  const t = await getTranslations("Post")
  const isZh = locale === "zh"
  const title = isZh ? post.frontmatter.title : (post.frontmatter.titleEn || post.frontmatter.title)
  const description = isZh
    ? post.frontmatter.description
    : (post.frontmatter.descriptionEn || post.frontmatter.description)
  const tags = isZh
    ? post.frontmatter.tags
    : (post.frontmatter.tagsEn || post.frontmatter.tags)

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Back link */}
      <Link
        href={`/${locale}/${category}`}
        className="inline-flex items-center gap-1 text-sm text-subtle dark:text-subtle-dark hover:text-text dark:hover:text-text-dark mb-8"
      >
        {t("back")} {t(catInfo.titleKey)}
      </Link>

      {/* Header */}
      <header className="mb-10">
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
          style={{ fontFamily: "var(--font-serif)", lineHeight: 1.2 }}
        >
          {title}
        </h1>
        {description && (
          <p className="text-lg text-subtle dark:text-subtle-dark mb-4">
            {description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm text-subtle dark:text-subtle-dark">
          <time dateTime={post.frontmatter.date}>
            {t("publishedOn")} {formatDate(post.frontmatter.date, locale)}
          </time>
          <span>·</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warm-100 dark:bg-warm-900 text-warm-700 dark:text-warm-300">
            {post.category}
          </span>
        </div>
      </header>

      {/* Content */}
      <MDXContent source={post.content} />

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-12 pt-6 border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
          <span className="text-sm font-medium text-subtle dark:text-subtle-dark mr-3">{t("tags")}:</span>
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/${locale}/tags?tag=${encodeURIComponent(tag)}`}
              className="inline-block text-sm mr-2 mb-2 px-2.5 py-0.5 rounded-full bg-surface dark:bg-surface-dark text-subtle dark:text-subtle-dark hover:text-text dark:hover:text-text-dark transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* Comments */}
      <Giscus />
    </article>
  )
}
