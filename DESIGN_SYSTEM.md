# Design system

All tokens live in `app/globals.css`. Light values are on `:root`; dark values override them under `.dark` (set by `next-themes`).

## Colour

Colours are bare RGB channels so they can take an alpha:

```css
color: rgb(var(--text-strong));
background: rgb(var(--fill-brand-strong) / 0.2);
```

| Role | Tokens |
| --- | --- |
| Text | `--text-strong`, `--text-weak`, `--text-brand`, `--text-disabled`, `--text-error`, `--text-inverse-strong` |
| Surfaces | `--background-base`, `--background-raised`, `--background-overlay` |
| Fills | `--fill-weak`, `--fill-weaker`, `--fill-brand-strong`, `--fill-brand-weak`, `--fill-disabled`, … |
| Hairlines | `--stroke-color-weak` (a colour, for borders) |

`--stroke-*`, `--fill-hover`, `--fill-press` and `--elevation-*` are complete `box-shadow` values, not colours:

```css
.control:hover { box-shadow: var(--stroke-weak-hover), var(--fill-hover); }
```

Never pass a `--stroke-*` token to `rgb()` or use it in `border`: it isn't a colour, and the whole declaration is silently dropped.

## Focus

One global rule draws focus as a 2px brand `outline` with a 2px offset. It's an outline rather than a box-shadow so component shadows can't override it. Don't set `outline: none`; inside an `overflow: hidden` parent, use a negative `outline-offset`.

## Layout

One reading column: `--measure` (540px) plus `--gutter` (24px) either side. Post demos break out wider on larger screens.

## Type

Geist Sans and Geist Mono, used through role tokens. Each size has exactly one line height; apply a role with `font: var(--type-body)` and adjust only the weight.

| Token | Size / line height | Use |
| --- | --- | --- |
| `--type-display` | 30 / 38, 600 | Post title |
| `--type-title` | 22 / 30, 500 | Page title |
| `--type-heading` | 20 / 28, 600 | Section heading in a post |
| `--type-body` | 16 / 28 | Reading text |
| `--type-row` | 15 / 24 | List rows, links, site name |
| `--type-small` | 14 / 22 | Metadata, descriptions, nav |
| `--type-caption` | 13 / 20 | Captions, list headings, footer |
| `--type-label` | 12 / 16 | Code labels |
| `--type-code` | 13 / 21, mono | Code blocks |

The reading column is `--measure` (540px), about 70 characters a line. Dates and year ranges use `tabular-nums`.

## Motion

- Hover colour changes: 150ms `ease`.
- State changes: 200–300ms `--ease-out-cubic`.
- Nothing animates on scroll or page load. Motion answers to input.
- Anything that loops on its own has a pause control (`<Demo loop>` in posts).
- Keyboard-driven changes (arrow keys in tabs and segmented controls) snap instead of animating.
- Infinite loops and JS-driven animations check `useReducedMotion()`; `MotionConfig` only stops transform and layout animations.
- `prefers-reduced-motion` collapses CSS durations globally, and `MotionConfig reducedMotion="user"` does the same for Framer Motion.
- The theme switch grows the new theme as a circle from the toggle (View Transitions API), skipped under reduced motion.
