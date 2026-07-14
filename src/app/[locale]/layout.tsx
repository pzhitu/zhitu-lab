import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/lib/routing"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { getAllTags } from "@/lib/content"

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!routing.locales.includes(locale as never)) notFound()

  const messages = await getMessages()
  const tags = getAllTags()

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer tags={tags} />
    </NextIntlClientProvider>
  )
}
