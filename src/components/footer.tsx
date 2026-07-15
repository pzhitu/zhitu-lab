export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-subtle dark:text-subtle-dark">
          <p>
            <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>Zhitu Space</span>
          </p>
          <div className="flex items-center gap-3">
            <a href="/rss.xml" className="hover:text-accent dark:hover:text-accent-light transition-colors">
              新卡提醒
            </a>
            <span className="opacity-30">·</span>
            <a href="https://github.com/pzhitu" target="_blank" rel="noopener noreferrer" className="hover:text-accent dark:hover:text-accent-light transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
