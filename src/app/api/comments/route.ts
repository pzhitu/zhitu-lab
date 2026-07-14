import { NextRequest, NextResponse } from "next/server"
import { getSql, initSchema } from "@/lib/db"

// DELETE: 删除评论（需密码验证）
async function DELETE(request: NextRequest) {
  await initSchema()
  const sql = getSql()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const pwd = searchParams.get("pwd")

  if (!id) {
    return NextResponse.json({ error: "缺少 id" }, { status: 400 })
  }

  // 简单密码保护
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
  if (!ADMIN_PASSWORD || pwd !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "密码错误" }, { status: 403 })
  }

  await sql`DELETE FROM comments WHERE id = ${parseInt(id)}`
  return NextResponse.json({ ok: true })
}

// GET: 获取某篇文章的所有评论
async function GET(request: NextRequest) {
  await initSchema()
  const sql = getSql()

  const { searchParams } = new URL(request.url)
  const slug = searchParams.get("slug")
  if (!slug) {
    return NextResponse.json({ error: "缺少 slug 参数" }, { status: 400 })
  }

  const rows = await sql`
    SELECT id, slug, parent_id, nickname, content, approved, created_at
    FROM comments
    WHERE slug = ${slug} AND approved = true
    ORDER BY created_at ASC
  `

  // 组装嵌套回复
  const topLevel: typeof rows = []
  const replyMap = new Map<number, typeof rows>()

  for (const c of rows) {
    const item = { ...c, replies: [] as typeof rows }
    if (c.parent_id) {
      const siblings = replyMap.get(c.parent_id) || []
      siblings.push(item)
      replyMap.set(c.parent_id, siblings)
    } else {
      topLevel.push(item)
    }
  }

  // 递归挂载子回复
  for (const item of topLevel) {
    item.replies = replyMap.get(item.id) || []
    for (const reply of item.replies) {
      reply.replies = replyMap.get(reply.id) || []
    }
  }

  return NextResponse.json({ comments: topLevel })
}

// POST: 提交新评论
async function POST(request: NextRequest) {
  await initSchema()
  const sql = getSql()

  const body = await request.json()
  const { slug, parent_id, nickname, email, content } = body

  if (!slug || !nickname?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "昵称和内容不能为空" }, { status: 400 })
  }

  if (nickname.trim().length > 50) {
    return NextResponse.json({ error: "昵称最多 50 个字符" }, { status: 400 })
  }

  if (content.trim().length > 2000) {
    return NextResponse.json({ error: "评论最多 2000 个字符" }, { status: 400 })
  }

  const result = await sql`
    INSERT INTO comments (slug, parent_id, nickname, email, content)
    VALUES (${slug}, ${parent_id || null}, ${nickname.trim()}, ${email?.trim() || null}, ${content.trim()})
    RETURNING id, slug, parent_id, nickname, content, approved, created_at
  `

  return NextResponse.json(
    { comment: result[0] },
    { status: 201 }
  )
}

export { GET, POST, DELETE }
