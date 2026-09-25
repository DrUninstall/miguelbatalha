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

One reading column: `--measure` (640px) plus `--gutter` (24px) either side. Post demos break out wider on larger screens.

## Type

Geist Sans and Geist Mono. Body 15–16px; headings are set by weight and a small size step rather than scale. Dates and year ranges use `tabular-nums`.

## Motion

- Hover colour changes: 150ms `ease`.
- State changes: 200–300ms `--ease-out-cubic`.
- Nothing animates on scroll or page load. Motion answers to input.
- Keyboard-driven changes (arrow keys in tabs and segmented controls) snap instead of animating.
- Infinite loops and JS-driven animations check `useReducedMotion()`; `MotionConfig` only stops transform and layout animations.
- `prefers-reduced-motion` collapses CSS durations globally, and `MotionConfig reducedMotion="user"` does the same for Framer Motion.
- The theme switch grows the new theme as a circle from the toggle (View Transitions API), skipped under reduced motion.
