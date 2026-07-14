"use client"

import { usePathname, useRouter } from "next/navigation"

export function LocaleSwitcher() {
  const pathname = usePathname()
  const router = useRouter()

  const currentLocale = pathname.split("/")[1]
  const targetLocale = currentLocale === "zh" ? "en" : "zh"

  const switchLocale = () => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${targetLocale}`)
    router.push(newPath)
  }

  return (
    <button
      onClick={switchLocale}
      className="px-2 py-1 rounded-md text-xs font-medium text-subtle hover:text-text dark:text-subtle-dark dark:hover:text-text-dark hover:bg-surface dark:hover:bg-surface-dark transition-colors"
      aria-label={`Switch to ${targetLocale === "zh" ? "Chinese" : "English"}`}
    >
      {targetLocale === "zh" ? "中文" : "EN"}
    </button>
  )
}
