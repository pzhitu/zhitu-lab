"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

interface PaletteItem {
  label: string
  kind: "page" | "post" | "tag" | "category"
  href: string
}

export function CommandPalette() {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [index, setIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<PaletteItem[]>([])

  // Colors all via CSS variables — auto-swap under html.dark, no JS theme check needed
  const c = {
    overlayBg: "rgba(0,0,0,0.45)",
    dialogBg: "var(--color-paper)",
    dialogBorder: "var(--color-border)",
    dialogShadow: "0 16px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
    prompt: "var(--color-accent)",
    inputFg: "var(--color-ink)",
    inputPlaceholder: "var(--color-ink-faint)",
    itemFg: "var(--color-ink-subtle)",
    itemHoverBg: "var(--color-surface)",
    itemHoverFg: "var(--color-ink)",
    itemHref: "var(--color-ink-faint)",
    thinBorder: "var(--color-border)",
    kbBg: "var(--color-surface)",
    noResults: "var(--color-ink-faint)",
  }

  const staticItems: PaletteItem[] = [
    { label: "书桌 (首页)", kind: "page", href: "/" },
    { label: "项目记录", kind: "category", href: "/projects" },
    { label: "论文笔记", kind: "category", href: "/papers" },
    { label: "排错手记", kind: "category", href: "/debugging" },
    { label: "兴趣分享", kind: "category", href: "/interests" },
    { label: "拾光", kind: "category", href: "/moments" },
    { label: "归档", kind: "page", href: "/archive" },
    { label: "索引 (标签)", kind: "page", href: "/tags" },
    { label: "关于", kind: "page", href: "/about" },
  ]

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/search")
      const data = await res.json()
      const dynamic: PaletteItem[] = data.posts.map((p: { title: string; category: string; slug: string }) => ({
        label: p.title,
        kind: "post",
        href: `/${p.category}/${p.slug}`,
      }))
      setItems([...staticItems, ...dynamic])
    } catch {
      setItems(staticItems)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchItems()
      setQuery("")
      setIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, fetchItems])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") setOpen(false)
    }
    // Capture on document: intercept Ctrl+K before Chrome steals it for the address bar
    document.addEventListener("keydown", handler, { capture: true })
    return () => document.removeEventListener("keydown", handler, { capture: true })
  }, [])

  // Listen for custom event dispatched by the nav's "检索" button
  useEffect(() => {
    const handler = () => setOpen((prev) => !prev)
    document.addEventListener("toggle-command-palette", handler)
    return () => document.removeEventListener("toggle-command-palette", handler)
  }, [])

  const filtered = query
    ? items.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.href.toLowerCase().includes(query.toLowerCase())
      )
    : items

  const navigate = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setIndex((i) => (i + 1) % Math.max(filtered.length, 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setIndex((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (filtered[index]) navigate(filtered[index].href)
    }
  }

  if (!open) return null

  const kindIcon: Record<string, string> = {
    page: "▸",
    post: "📝",
    tag: "#",
    category: "📂",
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      style={{ background: c.overlayBg, backdropFilter: "blur(4px)" }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl mx-4"
        style={{
          background: c.dialogBg,
          border: `1px solid ${c.dialogBorder}`,
          borderRadius: "0.75rem",
          boxShadow: c.dialogShadow,
          fontFamily: "var(--font-mono)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: `1px solid ${c.thinBorder}` }}
        >
          <span style={{ color: c.prompt }}>$</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIndex(0) }}
            onKeyDown={onKeyDown}
            placeholder="检索文章、标签、页面..."
            className="flex-1 bg-transparent border-none outline-none text-base"
            style={{
              color: c.inputFg,
              fontFamily: "var(--font-mono)",
            }}
          />
          <kbd
            className="text-[11px] px-1.5 py-0.5 rounded"
            style={{ background: c.kbBg, color: c.inputPlaceholder }}
          >
            esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm" style={{ color: c.noResults }}>
              没有找到相关结果
            </div>
          ) : (
            filtered.slice(0, 20).map((item, i) => (
              <div
                key={`${item.kind}-${item.href}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer text-sm transition-colors"
                style={{
                  background: i === index ? c.itemHoverBg : "transparent",
                  color: i === index ? c.itemHoverFg : c.itemFg,
                }}
                onClick={() => navigate(item.href)}
                onMouseEnter={() => setIndex(i)}
              >
                <span className="w-5 text-center">{kindIcon[item.kind]}</span>
                <span className="flex-1">{item.label}</span>
                <span className="text-[11px]" style={{ color: c.itemHref }}>
                  {item.href}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div
          className="flex items-center gap-4 px-4 py-2 text-[11px]"
          style={{ borderTop: `1px solid ${c.thinBorder}`, color: c.itemFg }}
        >
          <span><kbd className="px-1 py-px rounded" style={{ background: c.kbBg }}>↑↓</kbd> 导航</span>
          <span><kbd className="px-1 py-px rounded" style={{ background: c.kbBg }}>↵</kbd> 进入</span>
          <span><kbd className="px-1 py-px rounded" style={{ background: c.kbBg }}>esc</kbd> 关闭</span>
        </div>
      </div>
    </div>
  )
}
