# CLAUDE.md

## Design, UI and UX

For any design, UI, UX, motion, or interaction work on this site — building, changing, polishing, or reviewing a page, component, demo, or blog post's presentation — invoke the `anthropic-skills:interaction-craft` skill first and follow it, including its `references/` and its review-and-verification pass before finishing.

## Project notes

- Static export (Next.js App Router) deployed to GitHub Pages from `main`.
- Tokens and base styles: `app/globals.css` (see `DESIGN_SYSTEM.md`).
- Blog posts: `app/blog/_posts/*.tsx` (interactive bits in `*.demos.tsx` client files), indexed in `app/blog/_data/posts.ts`, each with its own route `app/blog/<slug>/page.tsx` rendering `PostPage`. Demos are framed with `Demo` (`loop` adds a pause toggle) / `Code` from `app/blog/_components/demo.tsx`.
- Shadow tokens are named `--ring-*` / `--overlay-*` / `--elevation-*` (box-shadow values); colour tokens are bare RGB channels used as `rgb(var(--x))`. Never pass a ring/overlay token to `rgb()`.
- Controls must stay visible under `forced-colors: active` (box-shadows are removed there): give them a transparent 1px border and system-colour selected states.
- Every claim a post makes about a demo must match the component's code.
