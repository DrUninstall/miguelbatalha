# miguelbatalha.com

Personal site: a short résumé and a blog of interface experiments, each post with the live components it describes.

Next.js 16 (App Router, static export), TypeScript, CSS Modules, Framer Motion.

```bash
npm install
npm run dev
```

Pushing to `main` builds and deploys to GitHub Pages.

## Structure

```
app/
  page.tsx            home
  _data/resume.ts     experience, education, links
  blog/_data/posts.ts post index
  blog/_posts/        one component per post
  blog/_components/   Demo and Code frames, article styles
components/
  site/               header, footer, shared list rows
  ui/                 design-system primitives used in posts
  *.tsx               the demo components posts embed
```

To add a post: write `app/blog/_posts/<slug>.tsx` using plain elements plus `Demo` and `Code` from `app/blog/_components/demo.tsx`, add an entry to `posts.ts`, and create `app/blog/<slug>/page.tsx` rendering it inside `PostPage` (one route per post, so each page ships only its own demos). Demos that loop on their own take `<Demo loop>`, which adds a pause toggle. Every claim a post makes about a demo should match the component's code.

The blog publishes an RSS feed at `/blog/rss.xml`.

See `DESIGN_SYSTEM.md` for tokens.
