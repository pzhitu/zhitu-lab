import { getPostsByCategory, CATEGORIES } from "@/lib/content"
import { PostCard } from "@/components/post-card"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  const params: { locale: string; category: string }[] = []
  for (const cat of CATEGORIES) {
    params.push({ locale: "zh", category: cat.slug })
    params.push({ locale: "en", category: cat.slug })
  }
  return params
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>
}) {
  const { category } = await params
  const catInfo = CATEGORIES.find((c) => c.slug === category)
  if (!catInfo) notFound()

  const t = await getTranslations()
  const posts = getPostsByCategory(category)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {t(catInfo.titleKey)}
        </h1>
        <p className="text-subtle dark:text-subtle-dark text-lg">{t(catInfo.descriptionKey)}</p>
      </div>

      {posts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-subtle dark:text-subtle-dark text-lg">No posts yet in this category.</p>
          <p className="text-subtle dark:text-subtle-dark mt-2 text-sm">
            Create a <code>.mdx</code> file in <code>content/{category}/</code> to get started.
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
