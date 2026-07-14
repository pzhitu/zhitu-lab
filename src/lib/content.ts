import fs from "fs"
import path from "path"
import matter from "gray-matter"

const CONTENT_DIR = path.join(process.cwd(), "content")

export interface PostFrontmatter {
  title: string
  titleEn?: string
  date: string
  tags: string[]
  tagsEn?: string[]
  description: string
  descriptionEn?: string
  slug: string
}

export interface Post {
  slug: string
  category: string
  frontmatter: PostFrontmatter
  content: string
}

export interface CategoryInfo {
  slug: string
  titleKey: string
  descriptionKey: string
}

export const CATEGORIES: CategoryInfo[] = [
  { slug: "projects", titleKey: "Projects.title", descriptionKey: "Projects.description" },
  { slug: "papers", titleKey: "Papers.title", descriptionKey: "Papers.description" },
  { slug: "debugging", titleKey: "Debugging.title", descriptionKey: "Debugging.description" },
  { slug: "interests", titleKey: "Interests.title", descriptionKey: "Interests.description" },
]

export function getPostBySlug(category: string, slug: string): Post | null {
  const filePath = path.join(CONTENT_DIR, category, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const fileContent = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(fileContent)

  return {
    slug,
    category,
    frontmatter: {
      title: data.title || slug,
      titleEn: data.titleEn,
      date: data.date instanceof Date ? data.date.toISOString().split("T")[0] : (data.date || new Date().toISOString().split("T")[0]),
      tags: data.tags || [],
      tagsEn: data.tagsEn,
      description: data.description || "",
      descriptionEn: data.descriptionEn,
      slug: data.slug || slug,
    },
    content,
  }
}

export function getAllPosts(): Post[] {
  const posts: Post[] = []

  for (const cat of CATEGORIES) {
    const catDir = path.join(CONTENT_DIR, cat.slug)
    if (!fs.existsSync(catDir)) continue

    const files = fs.readdirSync(catDir).filter((f) => f.endsWith(".mdx"))
    for (const file of files) {
      const slug = file.replace(".mdx", "")
      const post = getPostBySlug(cat.slug, slug)
      if (post) posts.push(post)
    }
  }

  return posts.sort(
    (a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  )
}

export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter((p) => p.category === category)
}

export function getAllTags(): { name: string; nameEn?: string; count: number }[] {
  const posts = getAllPosts()
  const tagMap = new Map<string, { nameEn?: string; count: number }>()

  for (const post of posts) {
    const { tags, tagsEn } = post.frontmatter
    tags.forEach((tag, i) => {
      const existing = tagMap.get(tag)
      tagMap.set(tag, {
        nameEn: tagsEn?.[i] || existing?.nameEn,
        count: (existing?.count || 0) + 1,
      })
    })
  }

  return Array.from(tagMap.entries())
    .map(([name, { nameEn, count }]) => ({ name, nameEn, count }))
    .sort((a, b) => b.count - a.count)
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((p) => p.frontmatter.tags.includes(tag))
}
