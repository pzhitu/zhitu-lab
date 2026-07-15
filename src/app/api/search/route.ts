import { NextResponse } from "next/server"
import { getAllPosts } from "@/lib/content"

export async function GET() {
  const posts = getAllPosts().map((p) => ({
    title: p.frontmatter.title,
    category: p.category,
    slug: p.slug,
    tags: p.frontmatter.tags,
    date: p.frontmatter.date,
  }))

  return NextResponse.json({ posts })
}
