import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { getAllTags } from "@/lib/content"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Zhitu's Lab",
    template: "%s — Zhitu's Lab",
  },
  description:
    "知途的个人博客。记录项目复盘、论文阅读笔记、排错经验和兴趣分享。",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tags = getAllTags()

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..600;1,9..40,400..600&family=JetBrains+Mono:ital,wght@0,400..600;1,400..600&family=Lora:ital,wght@0,500..700;1,500..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer tags={tags} />
        </ThemeProvider>
      </body>
    </html>
  )
}
