"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { ThemeToggle } from "./theme-toggle"
import { LocaleSwitcher } from "./locale-switcher"
import { useState } from "react"

const NAV_ITEMS = [
  "projects",
  "papers",
  "debugging",
  "interests",
  "archive",
  "about",
] as const

export function Nav() {
  const t = useTranslations("Nav")
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const locale = pathname.split("/")[1]
  const base = `/${locale}`

  function isActive(item: string) {
    return pathname.startsWith(`${base}/${item}`)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-cream/80 dark:bg-cream-dark/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href={base}
          className="font-serif text-xl font-semibold tracking-tight no-underline"
          style={{ fontFamily: "var(--font-serif)", color: "inherit" }}
        >
          Zhitu&apos;s Lab
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item}
              href={`${base}/${item}`}
              className={`text-[15px] transition-colors ${
                isActive(item)
                  ? "font-medium text-warm-600 dark:text-warm-400"
                  : "text-subtle dark:text-subtle-dark hover:text-text dark:hover:text-text-dark"
              }`}
            >
              {t(item)}
            </Link>
          ))}
          <div className="flex items-center gap-1 ml-2 pl-4 border-l border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-1">
          <LocaleSwitcher />
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
              key={item}
              href={`${base}/${item}`}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 text-[15px] transition-colors rounded-md px-3 ${
                isActive(item)
                  ? "font-medium text-warm-600 dark:text-warm-400 bg-warm-50 dark:bg-warm-950"
                  : "text-subtle dark:text-subtle-dark hover:text-text dark:hover:text-text-dark hover:bg-surface dark:hover:bg-surface-dark"
              }`}
            >
              {t(item)}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
