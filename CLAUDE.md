# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project overview

**Zhitu Space** — a personal blog for 知途 (a Chinese engineering graduate student). The site uses a "research room" metaphor: CLI terminal navigation bar, handwritten index cards for article previews, library card catalog for categories, and clean paper for reading.

- **Stack**: Next.js 16.2 (App Router) + TypeScript + Tailwind CSS v4 + MDX + Neon Postgres
- **Deployed on**: Vercel (via GitHub `pzhitu/zhitu-lab`)
- **Fonts**: Noto Serif SC (body/serif), JetBrains Mono (code/mono) — loaded from Google Fonts in root layout

## Commands

```bash
npm run dev        # Start dev server (Turbopack, default port 3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint
```

## Architecture: layers of the framework

The site has three visual layers matching the "research room" metaphor:

| Layer | Component | Visual role |
|-------|-----------|-------------|
| Global frame | `nav.tsx` + `status-bar.tsx` | Terminal-style breadcrumb bar (top) + keyboard shortcut bar (bottom) |
| Content cards | `post-card.tsx` / `desk.tsx` | Handwritten index cards with note backgrounds (home), drawer-grid for categories |
| Reading | `mdx-content.tsx` | Clean paper layout, max-width prose, `paper-content` typography utilities |

## Color system (globals.css)

Two **independent** CSS custom property palettes — light and dark modes share NO values:

- Light: `--color-paper: #fffdf9`, `--color-ink: #1f1c18`, `--color-accent: #b06814`
- Dark: `--color-paper-dark: #0d0c0a`, `--color-ink-dark: #f5f0e5`, `--color-accent-dark: #f0b040`

Dark mode is activated by `ThemeProvider` via `html.dark body` in CSS. Components reference dark tokens either through Tailwind `dark:` variants (e.g. `dark:text-ink-dark`) or inline style objects using the resolved theme state.

**IMPORTANT**: `nav.tsx`, `status-bar.tsx`, and `command-palette.tsx` use hardcoded hex colors (not CSS custom properties) because they adapt to theme via `useTheme()` in JS. When updating both light and dark values, check both the CSS custom properties AND these component-level inline styles.

## CSS architecture (Tailwind v4)

Tailwind v4 uses `@theme` blocks (not `tailwind.config.ts`). Custom colors are defined in `@theme { ... }` in `globals.css`. Classes like `text-ink-subtle`, `bg-surface`, `dark:text-ink-dark`, `dark:bg-surface-dark` map to the custom properties.

`@tailwindcss/typography` plugin is loaded via `@plugin "@tailwindcss/typography"`.

MDX article typography uses `.paper-content` utility class. Code highlighting uses `rehype-pretty-code` with `github-light`/`github-dark` themes.

## Content system (src/lib/content.ts)

MDX files live in `content/<category>/<slug>.mdx`. Frontmatter uses `gray-matter`:

```yaml
---
title: "文章标题"
date: 2026-07-14
tags: ["标签1", "标签2"]
description: "文章描述"
---
```

Categories: `projects`, `papers`, `debugging`, `interests`, `moments`. Defined in `CATEGORIES` array in `content.ts`.

`content.ts` uses Node `fs` — it CANNOT be imported by Client Components. Always fetch data in Server Components (pages) and pass as props.

## Route structure

```
/                              → page.tsx (Server) → Desk (Client, receives props)
/[category]                    → [category]/page.tsx (Server, lists posts in category)
/[category]/[slug]             → [category]/[slug]/page.tsx (Server, renders MDX)
/archive                       → archive/page.tsx (Server, year-grouped)
/tags                          → tags/page.tsx (Server, filterable by ?tag=)
/about                         → about/page.tsx (Server, static content)
/api/comments                  → api/comments/route.ts (GET/POST/DELETE)
/api/search                    → api/search/route.ts (GET, returns all post metadata)
```

## Server vs Client Components

- **All pages** (`page.tsx`) are Server Components by default — they can use `fs`, `async`, and fetch data directly
- **Client Components**: `desk.tsx`, `post-card.tsx`, `nav.tsx`, `status-bar.tsx`, `command-palette.tsx`, `comments.tsx`, `theme-provider.tsx`, `theme-toggle.tsx`, `lamp-toggle.tsx`, `footer.tsx`, `tag-cloud.tsx`
- **`mdx-content.tsx`**: MUST be a Server Component — `MDXRemote` from `next-mdx-remote/rsc` is an async Server Component and cannot have `'use client'`

In Next.js 16, `params` and `searchParams` are **Promises** — always `await` them:

```tsx
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // ...
}
```

## Comments (src/lib/db.ts + src/app/api/comments/route.ts)

Neon Postgres (serverless). Schema: `comments(id, slug, parent_id, nickname, email, content, approved, created_at)`. Nested replies assembled in the API route via a simple recursive map. `DATABASE_URL` environment variable required.

- POST requires: `slug`, `nickname`, `content`; optional: `parent_id`, `email`
- DELETE requires `id` and `pwd` matching `ADMIN_PASSWORD` env var

## The "reset" bit

No i18n (single-language Chinese), no Giscus, no RSS yet — these were in the original plan but not implemented. The site is currently database-free except for comments.

## User preferences (important)

- **Do NOT push to GitHub.** Output terminal commands for the user to run manually.
- **Output a summary** after completing each significant task.
- **Do not repeat the same command** if it returns the same result twice — stop and ask.
- The user reads and writes Chinese. Code comments and UI text are in Chinese; technical identifiers use English.
