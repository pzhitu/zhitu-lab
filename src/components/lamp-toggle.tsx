"use client"

import { useTheme } from "./theme-provider"

export function LampToggle() {
  const { resolved, setTheme } = useTheme()

  const toggle = () => setTheme(resolved === "dark" ? "light" : "dark")
  const isDark = resolved === "dark"

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors"
      style={{
        color: "inherit",
        fontFamily: "var(--font-mono)",
      }}
      title={isDark ? "熄灯" : "掌灯"}
      aria-label={isDark ? "熄灯" : "掌灯"}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent"
      }}
    >
      {isDark ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15 14l2.5 5.5" strokeLinecap="round" />
          <path d="M6.5 19.5L9 14" strokeLinecap="round" />
          <path d="M6 14h12l-2-8H8l-2 8z" />
          <rect x="10" y="2" width="4" height="3" rx="1" />
          <circle cx="12" cy="9" r="1" />
          <line x1="12" y1="5" x2="12" y2="7" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7">
          <path d="M15 14l2.5 5.5" strokeLinecap="round" />
          <path d="M6.5 19.5L9 14" strokeLinecap="round" />
          <path d="M6 14h12l-2-8H8l-2 8z" />
          <rect x="10" y="2" width="4" height="3" rx="1" />
          <line x1="9.5" y1="7.5" x2="14.5" y2="13.5" strokeWidth="1" />
        </svg>
      )}
      <span className="hidden sm:inline" style={{ fontSize: "11px" }}>
        {isDark ? "掌灯" : "熄灯"}
      </span>
    </button>
  )
}
