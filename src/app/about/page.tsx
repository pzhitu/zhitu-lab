import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "关于 — 知途的实验室",
  description: "关于知途——一位工科研究生的个人博客。",
  alternates: {
    canonical: "https://zhi-tu.me/about",
  },
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          关于我
        </h1>
        <p className="text-subtle dark:text-subtle-dark text-lg">一个简单的自我介绍。</p>
      </div>

      <div className="prose-custom space-y-10">
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-body)" }}>
            <span className="w-6 h-6 rounded-full bg-warm-200 dark:bg-warm-800 flex items-center justify-center text-xs">1</span>
            教育背景
          </h2>
          <div className="pl-9 space-y-4">
            <div className="card">
              <h3 className="font-semibold text-lg">本科院校</h3>
              <p className="text-subtle dark:text-subtle-dark">XX 专业 · 20XX — 20XX</p>
              <p className="text-sm text-subtle dark:text-subtle-dark mt-2">简述你的本科学习、毕设或竞赛经历。</p>
            </div>
            <div className="card">
              <h3 className="font-semibold text-lg">研究生院校</h3>
              <p className="text-subtle dark:text-subtle-dark">XX 方向 · 20XX — 至今</p>
              <p className="text-sm text-subtle dark:text-subtle-dark mt-2">简述你的研究方向和实验室。</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-body)" }}>
            <span className="w-6 h-6 rounded-full bg-warm-200 dark:bg-warm-800 flex items-center justify-center text-xs">2</span>
            研究方向
          </h2>
          <div className="pl-9">
            <div className="card">
              <p className="text-subtle dark:text-subtle-dark">在这里描述你的研究兴趣。你对什么问题感兴趣？想解决什么问题？</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-body)" }}>
            <span className="w-6 h-6 rounded-full bg-warm-200 dark:bg-warm-800 flex items-center justify-center text-xs">3</span>
            技能
          </h2>
          <div className="pl-9 flex flex-wrap gap-2">
            {["Python", "C/C++", "PyTorch", "MATLAB", "Git", "LaTeX", "Docker", "Linux"].map((skill) => (
              <span key={skill} className="px-3 py-1 rounded-full text-sm bg-surface dark:bg-surface-dark text-text dark:text-text-dark border border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-body)" }}>
            <span className="w-6 h-6 rounded-full bg-warm-200 dark:bg-warm-800 flex items-center justify-center text-xs">4</span>
            联系
          </h2>
          <div className="pl-9">
            <div className="card space-y-2">
              <p className="flex items-center gap-3 text-sm">
                <span className="text-subtle dark:text-subtle-dark w-12">GitHub</span>
                <a href="https://github.com/pzhitu" target="_blank" rel="noopener noreferrer">github.com/pzhitu</a>
              </p>
              <p className="flex items-center gap-3 text-sm">
                <span className="text-subtle dark:text-subtle-dark w-12">邮箱</span>
                <a href="mailto:your.email@example.com">your.email@example.com</a>
              </p>
              <p className="flex items-center gap-3 text-sm">
                <span className="text-subtle dark:text-subtle-dark w-12">学术</span>
                <a href="https://scholar.google.com/" target="_blank" rel="noopener noreferrer">Google Scholar</a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
