"use client"

import Link from "next/link"

export function Hero() {
  return (
    <section className="py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="max-w-[36rem]">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            你好，我是知途
          </h1>

          <p
            className="mt-5 text-lg sm:text-xl leading-relaxed"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-subtle)" }}
          >
            工科研究生 / 写代码、做科研、偶尔折腾些有趣的东西
          </p>

          <p
            className="mt-4 text-base leading-relaxed max-w-[32rem]"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-subtle)", opacity: 0.75 }}
          >
            这个博客记录了我的项目复盘、论文阅读笔记、踩坑经验和一些随想。把学到的东西写下来，是我对抗遗忘和焦虑的方式。
          </p>

          <div className="mt-8 flex items-center gap-6">
            <Link href="/archive" className="btn-primary">
              看看文章 →
            </Link>
            <div className="flex items-center gap-4 text-sm" style={{ color: "var(--color-subtle)" }}>
              <a href="https://github.com/pzhitu" target="_blank" rel="noopener noreferrer" className="hover:text-warm-600 dark:hover:text-warm-400 transition-colors">
                GitHub
              </a>
              <span style={{ opacity: 0.3 }}>/</span>
              <a href="mailto:your.email@example.com" className="hover:text-warm-600 dark:hover:text-warm-400 transition-colors">
                邮件
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
