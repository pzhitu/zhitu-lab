import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { getAllTags } from "@/lib/content"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const tags = getAllTags()

  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer tags={tags} />
    </>
  )
}
