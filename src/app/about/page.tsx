import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "这间研究室的主人",
  description: "关于知途——一位工科研究生的个人研究室。",
  alternates: {
    canonical: "https://zhi-tu.me/about",
  },
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          这间研究室的主人
        </h1>
        <p className="text-ink-subtle dark:text-ink-subtle-dark text-base">
          钉在布告板上的个人信息。
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* ── 教育背景 ── */}
        <div className="index-card index-card--yellow">
          <span className="card-call-number">01 · 教育背景</span>
          <div className="mt-2 space-y-3">
            <div>
              <h3 className="font-semibold text-lg" style={{ fontFamily: "var(--font-serif)" }}>
                本科院校
              </h3>
              <p className="text-[14px] text-ink-subtle dark:text-ink-subtle-dark">
                XX 专业 · 20XX — 20XX
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg" style={{ fontFamily: "var(--font-serif)" }}>
                研究生院校
              </h3>
              <p className="text-[14px] text-ink-subtle dark:text-ink-subtle-dark">
                XX 方向 · 20XX — 至今
              </p>
            </div>
          </div>
        </div>

        {/* ── 研究方向 ── */}
        <div className="index-card index-card--green">
          <span className="card-call-number">02 · 研究方向</span>
          <p className="mt-2 text-[15px] text-ink-subtle dark:text-ink-subtle-dark leading-relaxed">
            在这里描述你的研究兴趣。你对什么问题感兴趣？想解决什么问题？
          </p>
        </div>

        {/* ── 技能 ── */}
        <div className="index-card index-card--pink">
          <span className="card-call-number">03 · 工具箱</span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["Python", "C/C++", "PyTorch", "MATLAB", "Git", "LaTeX", "Docker", "Linux"].map((skill) => (
              <span
                key={skill}
                className="text-xs px-2.5 py-1 rounded-sm bg-surface dark:bg-surface-dark text-ink-subtle dark:text-ink-subtle-dark"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* ── 联系 ── */}
        <div className="index-card">
          <span className="card-call-number">04 · 联系方式</span>
          <div className="mt-2 space-y-2 text-[14px]">
            <p className="flex items-center gap-3">
              <span className="text-ink-faint dark:text-ink-faint-dark w-14 text-xs">GitHub</span>
              <a
                href="https://github.com/pzhitu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent dark:text-accent-light hover:underline"
              >
                github.com/pzhitu
              </a>
            </p>
            <p className="flex items-center gap-3">
              <span className="text-ink-faint dark:text-ink-faint-dark w-14 text-xs">邮箱</span>
              <a href="mailto:your.email@example.com" className="text-accent dark:text-accent-light hover:underline">
                your.email@example.com
              </a>
            </p>
            <p className="flex items-center gap-3">
              <span className="text-ink-faint dark:text-ink-faint-dark w-14 text-xs">学术</span>
              <a
                href="https://scholar.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent dark:text-accent-light hover:underline"
              >
                Google Scholar
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* ── 布告板底部 ── */}
      <div className="mt-8 text-center">
        <p
          className="text-[13px] italic"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-ink-faint)",
          }}
        >
          "把学到的东西写下来，是我对抗遗忘和焦虑的方式。"
        </p>
      </div>
    </div>
  )
}
