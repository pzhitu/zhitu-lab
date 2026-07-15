"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LampToggle } from "./lamp-toggle"
import { useTheme } from "./theme-provider"

function pathToPrompt(pathname: string): { label: string; href: string }[] {
  if (pathname === "/") return []
  const parts = pathname.split("/").filter(Boolean)
  return parts.map((_, i) => {
    const href = "/" + parts.slice(0, i + 1).join("/")
    return { label: decodeURIComponent(parts[i]), href }
  })
}

export function Nav() {
  const pathname = usePathname()
  const { resolved } = useTheme()
  const segments = pathToPrompt(pathname)
  const isDark = resolved === "dark"

  const barBg = isDark ? "#0f1117" : "#f5f1eb"
  const barFg = isDark ? "#9e9688" : "#7a756e"
  const barFgHover = isDark ? "#f0ebe0" : "#3d3830"
  const barAccent = isDark ? "#f0b040" : "#a56017"
  const barBorder = isDark ? "rgba(255,255,255,0.06)" : "#e0dbd2"
  const hoverBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"
  const kbBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"
  const kbBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)"
  const mono = "var(--font-mono)"
  const bodyFont = "var(--font-serif)"

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: barBg,
          fontFamily: bodyFont,
          fontSize: "0.8125rem",
          color: barFg,
          userSelect: "none",
          borderColor: barBorder,
          transition: "background 0.4s ease, color 0.4s ease",
        }}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-2 sm:px-6">
          <div className="flex items-center gap-1 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-1.5 shrink-0 px-1.5 py-0.5 -ml-1.5 rounded transition-colors"
              style={{ color: "inherit", textDecoration: "none" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = hoverBg }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
            >
              <span style={{ color: barAccent, marginRight: "0.375rem", fontFamily: mono }}>zhitu@space</span>
              <span style={{ opacity: 0.6, fontFamily: mono }}>:</span>
            </Link>

            {segments.length > 0 ? (
              <>
                <Link href="/" className="shrink-0 transition-colors" style={{ color: barFg, fontFamily: mono }}>
                  ~
                </Link>
                <span style={{ color: barFg, opacity: 0.3, fontFamily: mono }}>/</span>
              </>
            ) : (
              <Link href="/" className="shrink-0 transition-colors" style={{ color: barFgHover, fontFamily: mono }}>
                ~
              </Link>
            )}

            {segments.map((seg, i) => (
              <span key={seg.href} className="flex items-center gap-1 shrink-0">
                <Link
                  href={seg.href}
                  className="transition-colors truncate max-w-[160px]"
                  style={{ color: i === segments.length - 1 ? barFgHover : barFg }}
                >
                  {seg.label}
                </Link>
                {i < segments.length - 1 && (
                  <span style={{ color: barFg, opacity: 0.3, fontFamily: mono }}>/</span>
                )}
              </span>
            ))}

            <span
              className="cursor-blink inline-block w-[6px] h-[14px] ml-0.5 align-middle shrink-0"
              style={{ backgroundColor: barAccent }}
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true }))}
              className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors"
              style={{ color: barFg }}
              title="打开命令面板"
              onMouseEnter={(e) => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = barFgHover }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = barFg }}
            >
              <kbd style={{ fontSize: "10px", padding: "0 3px", borderRadius: "3px", border: `1px solid ${kbBorder}`, background: kbBg }}>
                Ctrl+K
              </kbd>
              <span style={{ fontSize: "11px" }}>检索</span>
            </button>
            <LampToggle />
          </div>
        </div>
      </header>
    </>
  )
}
