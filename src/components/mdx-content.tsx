import { MDXRemote } from "next-mdx-remote/rsc"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"

export function MDXContent({ source }: { source: string }) {
  return (
    <div
      className="paper-content max-w-[40rem] mx-auto"
      style={{ fontFamily: "var(--font-serif)", fontSize: "0.9375rem", lineHeight: 1.8, color: "var(--color-ink)" }}
    >
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            rehypePlugins: [
              rehypeSlug,
              [
                rehypePrettyCode,
                {
                  theme: { dark: "github-dark", light: "github-light" },
                  keepBackground: false,
                  defaultLang: "text",
                },
              ],
            ],
          },
        }}
      />
    </div>
  )
}
