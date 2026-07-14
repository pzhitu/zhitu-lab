"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import { useState } from "react"

const NAV_ITEMS = [
  { href: "/projects", label: "项目记录" },
  { href: "/papers", label: "论文笔记" },
  { href: "/debugging", label: "排错手记" },
  { href: "/interests", label: "兴趣分享" },
  { href: "/archive", label: "归档" },
  { href: "/about", label: "关于" },
]

export function Nav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-cream/80 dark:bg-cream-dark/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="no-underline hover:no-underline"
        >
          <span
            className="text-xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
          >
            Zhitu&apos;s Lab
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[15px] transition-colors ${
                isActive(item.href)
                  ? "font-medium text-warm-600 dark:text-warm-400"
                  : "text-subtle dark:text-subtle-dark hover:text-text dark:hover:text-text-dark"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="ml-2 pl-4 border-l border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="ml-2 p-1.5 rounded-md text-subtle hover:text-text dark:text-subtle-dark dark:hover:text-text-dark"
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileOpen ? (
                <path d="M5 5l10 10M15 5L5 15" />
              ) : (
                <path d="M3 5h14M3 10h14M3 15h14" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-cream dark:bg-cream-dark px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 text-[15px] transition-colors rounded-md px-3 ${
                isActive(item.href)
                  ? "font-medium text-warm-600 dark:text-warm-400 bg-warm-50 dark:bg-warm-950"
                  : "text-subtle dark:text-subtle-dark hover:text-text dark:hover:text-text-dark hover:bg-surface dark:hover:bg-surface-dark"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
