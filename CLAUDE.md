# CLAUDE.md

## Design, UI and UX

For any design, UI, UX, motion, or interaction work on this site — building, changing, polishing, or reviewing a page, component, demo, or blog post's presentation — invoke the `anthropic-skills:interaction-craft` skill first and follow it, including its `references/` and its review-and-verification pass before finishing.

## Project notes

- Static export (Next.js App Router) deployed to GitHub Pages from `main`.
- Tokens and base styles: `app/globals.css` (see `DESIGN_SYSTEM.md`).
- Blog posts: `app/blog/_posts/*.tsx`, indexed in `app/blog/_data/posts.ts`, registered in `app/blog/[slug]/page.tsx`. Demos are framed with `Demo` / `Code` from `app/blog/_components/demo.tsx`.
- Every claim a post makes about a demo must match the component's code.
