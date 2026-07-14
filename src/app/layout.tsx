import type { Metadata } from "next"
import { DM_Sans, JetBrains_Mono, Lora } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { getAllTags } from "@/lib/content"
import "./globals.css"

const lora = Lora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
  display: "swap",
})

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
    <html
      lang="zh-CN"
      className={`${lora.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
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
