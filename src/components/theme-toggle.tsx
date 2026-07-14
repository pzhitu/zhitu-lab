"use client"

import { useTheme } from "./theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycle = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  const icon =
    theme === "dark" ? (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 10a4 4 0 0 1-8-2 4 4 0 0 1 4-4c.3 0 .6.05.9.1A4 4 0 0 0 6 8a4 4 0 0 0 4 4c.7 0 1.4-.2 2-.6-.3 0-.7-.1-1-.1z" />
        <path d="M8 1v1M8 14v1M1 8h1M14 8h1M2.5 2.5l.7.7M12.8 12.8l.7.7M2.5 13.5l.7-.7M12.8 3.2l.7-.7" />
      </svg>
    ) : theme === "light" ? (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="3" />
        <path d="M8 1v1M8 14v1M1 8h1M14 8h1M2.5 2.5l.7.7M12.8 12.8l.7.7M2.5 13.5l.7-.7M12.8 3.2l.7-.7" />
      </svg>
    ) : (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 10a4 4 0 0 1-8-2 4 4 0 0 1 8 2z" />
        <path d="M8 1v1M8 14v1M1 8h1M14 8h1M2.5 2.5l.7.7M12.8 12.8l.7.7" />
      </svg>
    )

  return (
    <button
      onClick={cycle}
      className="p-1.5 rounded-md text-subtle hover:text-text dark:text-subtle-dark dark:hover:text-text-dark hover:bg-surface dark:hover:bg-surface-dark transition-colors"
      aria-label={`Theme: ${theme}`}
      title={`Theme: ${theme}`}
    >
      {icon}
    </button>
  )
}
