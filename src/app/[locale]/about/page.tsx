import { getTranslations } from "next-intl/server"

export default async function AboutPage() {
  const t = await getTranslations("About")

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {t("title")}
        </h1>
        <p className="text-subtle dark:text-subtle-dark text-lg">{t("description")}</p>
      </div>

      <div className="prose-custom space-y-10">
        {/* Education */}
        <section>
          <h2
            className="text-xl font-semibold mb-4 flex items-center gap-2"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <span className="w-6 h-6 rounded-full bg-warm-200 dark:bg-warm-800 flex items-center justify-center text-xs">1</span>
            {t("education")}
          </h2>
          <div className="pl-9 space-y-4">
            <div className="card">
              <h3 className="font-semibold text-lg">Your University</h3>
              <p className="text-subtle dark:text-subtle-dark">B.Eng. in Your Major · 20XX — 20XX</p>
              <p className="text-sm text-subtle dark:text-subtle-dark mt-2">
                Add a brief description of your studies, thesis topic, or academic achievements.
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold text-lg">Graduate School</h3>
              <p className="text-subtle dark:text-subtle-dark">M.Eng. / Ph.D. in Your Field · 20XX — Present</p>
              <p className="text-sm text-subtle dark:text-subtle-dark mt-2">
                Describe your research direction and lab affiliation.
              </p>
            </div>
          </div>
        </section>

        {/* Research */}
        <section>
          <h2
            className="text-xl font-semibold mb-4 flex items-center gap-2"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <span className="w-6 h-6 rounded-full bg-warm-200 dark:bg-warm-800 flex items-center justify-center text-xs">2</span>
            {t("research")}
          </h2>
          <div className="pl-9">
            <div className="card">
              <p className="text-subtle dark:text-subtle-dark">
                Describe your research interests here. What topics fascinate you? What problems do you want to solve?
              </p>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section>
          <h2
            className="text-xl font-semibold mb-4 flex items-center gap-2"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <span className="w-6 h-6 rounded-full bg-warm-200 dark:bg-warm-800 flex items-center justify-center text-xs">3</span>
            {t("skills")}
          </h2>
          <div className="pl-9 flex flex-wrap gap-2">
            {["Python", "C/C++", "PyTorch", "MATLAB", "Git", "LaTeX", "Docker", "Linux"].map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-full text-sm bg-surface dark:bg-surface-dark text-text dark:text-text-dark border border-[var(--color-border)] dark:border-[var(--color-border-dark)]"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2
            className="text-xl font-semibold mb-4 flex items-center gap-2"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <span className="w-6 h-6 rounded-full bg-warm-200 dark:bg-warm-800 flex items-center justify-center text-xs">4</span>
            {t("contact")}
          </h2>
          <div className="pl-9">
            <div className="card space-y-2">
              <p className="flex items-center gap-3 text-sm">
                <span className="text-subtle dark:text-subtle-dark w-12">GitHub</span>
                <a href="https://github.com/YOUR_USERNAME" target="_blank" rel="noopener noreferrer">
                  github.com/YOUR_USERNAME
                </a>
              </p>
              <p className="flex items-center gap-3 text-sm">
                <span className="text-subtle dark:text-subtle-dark w-12">Email</span>
                <a href="mailto:your.email@example.com">your.email@example.com</a>
              </p>
              <p className="flex items-center gap-3 text-sm">
                <span className="text-subtle dark:text-subtle-dark w-12">Scholar</span>
                <a href="https://scholar.google.com/" target="_blank" rel="noopener noreferrer">
                  Google Scholar
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
