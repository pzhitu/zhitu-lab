"use client"

import Link from "next/link"
import { useTheme } from "./theme-provider"

interface StatusLink {
  key: string
  label: string
  href: string
  hideSm?: boolean
}

export function StatusBar() {
  const now = new Date()
  const { resolved } = useTheme()
  const isDark = resolved === "dark"

  const barBg = isDark ? "#0f1117" : "#f5f1eb"
  const barFg = isDark ? "#9e9688" : "#7a756e"
  const barFgHover = isDark ? "#f0ebe0" : "#3d3830"
  const barBorder = isDark ? "rgba(255,255,255,0.06)" : "#e0dbd2"
  const kbBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"
  const kbBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)"
  const accent = isDark ? "#f0b040" : "#a56017"

  const links: StatusLink[] = [
    { key: "W", label: "书桌", href: "/" },
    { key: "P", label: "项目", href: "/projects", hideSm: true },
    { key: "N", label: "论文", href: "/papers", hideSm: true },
    { key: "D", label: "排错", href: "/debugging", hideSm: true },
    { key: "I", label: "兴趣", href: "/interests", hideSm: true },
    { key: "O", label: "拾光", href: "/moments", hideSm: true },
    { key: "M", label: "归档", href: "/archive" },
    { key: "T", label: "索引", href: "/tags" },
    { key: "A", label: "关于", href: "/about", hideSm: true },
  ]

  return (
    <div
      className="border-t"
      style={{
        background: barBg,
        fontFamily: "var(--font-serif)",
        fontSize: "0.8125rem",
        color: barFg,
        userSelect: "none",
        borderColor: barBorder,
        transition: "background 0.4s ease, color 0.4s ease",
      }}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-1.5 sm:px-6">
        <div className="flex items-center gap-4" style={{ fontSize: "11px" }}>
          {links.map(({ key: k, label, href, hideSm }) => (
            <Link
              key={k}
              href={href}
              className={`flex items-center gap-1 transition-colors ${hideSm ? "hidden sm:flex" : ""}`}
              style={{ color: barFg }}
              onMouseEnter={(e) => { e.currentTarget.style.color = barFgHover }}
              onMouseLeave={(e) => { e.currentTarget.style.color = barFg }}
            >
              <kbd style={{ fontSize: "10px", padding: "0 3px", borderRadius: "3px", border: `1px solid ${kbBorder}`, background: kbBg }}>
                {k}
              </kbd>
              <span>{label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 ml-auto" style={{ fontSize: "11px" }}>
          <a
            href="/rss.xml"
            className="flex items-center gap-1 transition-colors"
            style={{ color: barFg }}
            onMouseEnter={(e) => { e.currentTarget.style.color = barFgHover }}
            onMouseLeave={(e) => { e.currentTarget.style.color = barFg }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
            <span>新卡提醒</span>
          </a>
        </div>
      </div>
    </div>
  )
}
