import { getTranslations } from "next-intl/server"
import Link from "next/link"

export default async function NotFound() {
  const t = await getTranslations("NotFound")

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <h1
        className="text-6xl sm:text-8xl font-bold mb-4"
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--color-warm-300)",
        }}
      >
        404
      </h1>
      <h2 className="text-xl font-semibold mb-2">{t("title")}</h2>
      <p className="text-subtle dark:text-subtle-dark mb-8">{t("description")}</p>
      <Link href="/zh" className="btn-primary">
        {t("backHome")}
      </Link>
    </div>
  )
}
