import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { Nav } from "@/components/nav"
import { StatusBar } from "@/components/status-bar"
import { Footer } from "@/components/footer"
import { CommandPalette } from "@/components/command-palette"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Zhitu Space",
    template: "%s — Zhitu Space",
  },
  description:
    "知途的个人研究室。记录项目复盘、论文阅读笔记、排错经验和兴趣分享。",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400..600;1,400..600&family=Noto+Serif+SC:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <StatusBar />
          <Footer />
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  )
}
