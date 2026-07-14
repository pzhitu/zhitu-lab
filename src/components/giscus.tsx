"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "./theme-provider"

export function Giscus() {
  const ref = useRef<HTMLDivElement>(null)
  const { resolved } = useTheme()

  useEffect(() => {
    if (!ref.current || ref.current.querySelector("script")) return

    const script = document.createElement("script")
    script.src = "https://giscus.app/client.js"
    script.async = true
    script.crossOrigin = "anonymous"
    script.setAttribute("data-repo", "TODO/YOUR_REPO")
    script.setAttribute("data-repo-id", "TODO_REPO_ID")
    script.setAttribute("data-category", "Announcements")
    script.setAttribute("data-category-id", "TODO_CATEGORY_ID")
    script.setAttribute("data-mapping", "pathname")
    script.setAttribute("data-strict", "0")
    script.setAttribute("data-reactions-enabled", "1")
    script.setAttribute("data-emit-metadata", "0")
    script.setAttribute("data-input-position", "top")
    script.setAttribute("data-theme", resolved === "dark" ? "dark_dimmed" : "light")
    script.setAttribute("data-lang", "zh-CN")
    script.setAttribute("data-loading", "lazy")

    ref.current.appendChild(script)
  }, [resolved])

  return <section ref={ref} className="mt-16 pt-8 border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)]" />
}
