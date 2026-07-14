import { MDXRemote } from "next-mdx-remote/rsc"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"

const components = {
  // Custom components can be added here later
}

export function MDXContent({ source }: { source: string }) {
  return (
    <div className="prose-custom">
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            rehypePlugins: [
              rehypeSlug,
              [
                rehypePrettyCode,
                {
                  theme: { dark: "github-dark", light: "github-light" },
                  keepBackground: true,
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
