import { neon, NeonQueryFunction } from "@neondatabase/serverless"

let _sql: NeonQueryFunction<false, false> | null = null

function getSql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error("DATABASE_URL 未设置")
    _sql = neon(url)
  }
  return _sql
}

let schemaInitialized = false

export async function initSchema() {
  if (schemaInitialized) return
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(500) NOT NULL,
      parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
      nickname VARCHAR(100) NOT NULL,
      email VARCHAR(255),
      content TEXT NOT NULL,
      approved BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_comments_slug ON comments(slug)
  `
  schemaInitialized = true
}

export { getSql }
