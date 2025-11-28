# Design System

Quick reference for the design tokens and patterns used across the site.

## Colors

Semantic tokens that auto-switch for dark mode:

```css
/* Text */
--text-strong       /* headings, primary */
--text-weak         /* secondary, descriptions */
--text-brand        /* links, accents */

/* Backgrounds */
--background-base   /* page background */
--background-raised /* cards, elevated surfaces */

/* Borders */
--stroke-weak       /* subtle borders */
--stroke-strong     /* input borders */

/* Interactive */
--fill-hover        /* hover states */
--fill-press        /* active/pressed */
```

## Spacing

4px grid. Common values:

| Token | Size |
|-------|------|
| `--space-2` | 8px |
| `--space-4` | 16px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-16` | 64px |

## Typography

Using Geist Sans. Scale based on 1.2 ratio:

- Display: 56px (desktop) / 40px (mobile)
- H1: 40px / 36px
- H2: 32px / 28px
- Body: 16px
- Small: 14px

## Elevation

Two levels:

```css
--elevation-raised  /* cards, buttons */
--elevation-overlay /* dropdowns, modals */
```

## Animation

Keep it fast:
- Hover transitions: 200ms
- Page transitions: 300ms
- Easing: `ease-out` for entering, `ease-in-out` for movement

Framer Motion defaults:
```tsx
transition={{ type: "spring", stiffness: 300, damping: 30 }}
```

**Exit animations**: Make exits subtler than enters - less attention needed when leaving. Use smaller values (e.g., `scale: 0.75` vs `0.25` on enter, `y: -8` vs full height).

**will-change**: Hint to browsers to pre-promote elements to GPU layers before animation starts, avoiding first-frame stutter.

```css
/* Good - specific properties on elements that animate */
.animated-button {
  will-change: transform;
}

/* Also good - multiple properties */
.complex-animation {
  will-change: transform, opacity;
}

/* Bad - too broad or on everything */
* { will-change: auto; }
.element { will-change: all; }
```

Properties that benefit: `transform`, `opacity`, `filter`, `clip-path`, `mask`, `scroll-position`.

Use sparingly - creating layers costs memory. Only apply to elements that actually animate.

## Icons

Using Lucide React. Standard sizes:
- 16px for buttons
- 20px for navigation
- 24px+ for features

Always include `aria-label` for icon-only buttons.

## Breakpoints

| Name | Width | Columns |
|------|-------|---------|
| Mobile | < 768px | 4 |
| Tablet | 768-1439px | 8 |
| Desktop | 1440px+ | 12 |
