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
components/
  site/               header, footer, shared list rows
  ui/                 design-system primitives used in posts
  *.tsx               the demo components posts embed
```

To add a post: write `app/blog/_posts/<slug>.tsx`, add an entry to `posts.ts`, and register it in `app/blog/[slug]/page.tsx`.

See `DESIGN_SYSTEM.md` for tokens.
