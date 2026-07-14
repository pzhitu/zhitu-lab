"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "./theme-provider"
import { usePathname } from "next/navigation"

export function WalineComments() {
  const ref = useRef<HTMLDivElement>(null)
  const { resolved } = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    if (!ref.current || ref.current.querySelector(".waline-container")) return

    const initWaline = async () => {
      const { init } = await import("@waline/client")
      init({
        el: ref.current!,
        serverURL: "https://waline-zhitu.vercel.app",
        path: pathname,
        lang: "zh-CN",
        dark: resolved === "dark",
        search: false,
        emoji: [
          "https://unpkg.com/@waline/emojis@1.1.0/tw-emoji",
        ],
        imageUploader: false,
      })
    }

    initWaline()
  }, [pathname, resolved])

  return (
    <section
      ref={ref}
      className="mt-16 pt-8 border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)]"
    />
  )
}
