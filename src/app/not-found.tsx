import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <h1 className="text-6xl sm:text-8xl font-bold mb-4" style={{ fontFamily: "var(--font-serif)", color: "var(--color-warm-300)" }}>
        404
      </h1>
      <h2 className="text-xl font-semibold mb-2">页面不存在</h2>
      <p className="text-subtle dark:text-subtle-dark mb-8">这个页面还没有被创建——也许未来会有的。</p>
      <Link href="/" className="btn-primary">← 回到首页</Link>
    </div>
  )
}
