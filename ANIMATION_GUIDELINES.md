# Animation Guidelines

This document outlines the animation principles and best practices for this project.

## General Principles

### Keep Animations Fast
- **Default easing**: `ease-out` for most animations
- **Duration**: Never longer than 1s (unless illustrative)
- **Typical range**: 200ms - 300ms
- **CSS variables**: `--duration-fast` (200ms), `--duration-normal` (300ms)

## Easing Functions

### Ease-Out (Recommended for most use cases)
**Best for**: Elements entering the screen or user-initiated interactions

```css
--ease-out-quad: cubic-bezier(.25, .46, .45, .94)
--ease-out-cubic: cubic-bezier(.215, .61, .355, 1)
--ease-out-quart: cubic-bezier(.165, .84, .44, 1)
--ease-out-quint: cubic-bezier(.23, 1, .32, 1)
--ease-out-expo: cubic-bezier(.19, 1, .22, 1)
--ease-out-circ: cubic-bezier(.075, .82, .165, 1)
```

### Ease-In-Out
**Best for**: Elements moving within the screen

```css
--ease-in-out-quad: cubic-bezier(.455, .03, .515, .955)
--ease-in-out-cubic: cubic-bezier(.645, .045, .355, 1)
--ease-in-out-quart: cubic-bezier(.77, 0, .175, 1)
--ease-in-out-quint: cubic-bezier(.86, 0, .07, 1)
--ease-in-out-expo: cubic-bezier(1, 0, 0, 1)
--ease-in-out-circ: cubic-bezier(.785, .135, .15, .86)
```

### Ease-In (Generally Avoided)
**Warning**: Makes UI feel slow. Use sparingly.

```css
--ease-in-quad: cubic-bezier(.55, .085, .68, .53)
--ease-in-cubic: cubic-bezier(.550, .055, .675, .19)
--ease-in-quart: cubic-bezier(.895, .03, .685, .22)
--ease-in-quint: cubic-bezier(.755, .05, .855, .06)
--ease-in-expo: cubic-bezier(.95, .05, .795, .035)
--ease-in-circ: cubic-bezier(.6, .04, .98, .335)
```

## Hover Transitions

### Simple Hover Effects
Use built-in CSS `ease` with 200ms duration for:
- `color`
- `background-color`
- `opacity`
- `border-color`

```css
transition: color 200ms ease;
```

### Touch Devices
Disable hover transitions on touch devices:
```css
@media (hover: hover) and (pointer: fine) {
  /* hover transitions here */
}
```

## Accessibility

### Reduced Motion
Always respect user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable or minimize animations */
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
}
```

## Performance Optimization

### Preferred Properties
Stick to GPU-accelerated properties:
- ✅ `transform`
- ✅ `opacity`

Avoid animating:
- ❌ `top`, `left`, `right`, `bottom`
- ❌ `width`, `height`
- ❌ `margin`, `padding`

### Will-Change
Use `will-change` sparingly and only for:
- `transform`
- `opacity`
- `clip-path`
- `filter`

```css
.animated-element {
  will-change: transform, opacity;
}
```

### Performance Tips
- ❌ Don't animate drag gestures using CSS variables
- ❌ Don't animate blur values higher than 20px
- ✅ Use `transform` instead of `x`/`y` in Framer Motion for hardware acceleration

## Origin-Aware Animations

Elements should animate from their trigger point:
```css
/* Dropdown animating from button */
.dropdown {
  transform-origin: top left; /* Adjust based on button position */
}
```

## Framer Motion Guidelines

### Default to Spring Animations
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
/>
```

### Avoid Bouncy Springs
Unless working with drag gestures, use controlled spring animations:
```tsx
// ✅ Good - Controlled spring
transition={{ type: "spring", stiffness: 300, damping: 30 }}

// ❌ Avoid - Too bouncy for most UI
transition={{ type: "spring", stiffness: 100, damping: 10 }}
```

### Hardware Acceleration
Use `transform` instead of `x`/`y`:
```tsx
// ✅ Hardware accelerated
<motion.div style={{ transform: 'translateX(100px)' }} />

// ❌ Not hardware accelerated
<motion.div style={{ x: 100 }} />
```

## Examples

### Fade In
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
/>
```

### Slide Up
```tsx
<motion.div
  initial={{ opacity: 0, transform: 'translateY(20px)' }}
  animate={{ opacity: 1, transform: 'translateY(0)' }}
  transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
/>
```

### Hover Scale
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
>
  Click me
</motion.button>
```

### Icon Switch (Blur/Scale/Opacity)
For contextual icon transitions (copy/check, play/pause, theme toggle, etc.), use blur + scale + opacity for a polished feel:

```tsx
import { AnimatedIconSwitch } from "@/components/animated-icons";

// Usage with the reusable component
<button onClick={handleCopy}>
  <AnimatedIconSwitch iconKey={isCopied ? "check" : "copy"}>
    {isCopied ? <CheckIcon /> : <CopyIcon />}
  </AnimatedIconSwitch>
</button>

// Or manually with AnimatePresence
<AnimatePresence mode="popLayout" initial={false}>
  <motion.div
    key={isCopied ? "check" : "copy"}
    initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
    exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
    transition={{
      type: "spring",
      duration: 0.3,
      bounce: 0,
    }}
  >
    {isCopied ? <CheckIcon /> : <CopyIcon />}
  </motion.div>
</AnimatePresence>
```

Key points:
- Use `mode="popLayout"` for smoother layout transitions
- `scale: 0.25` creates a nice "pop in" effect
- `filter: "blur(4px)"` adds depth to the transition
- Spring with `bounce: 0` keeps it responsive without overshoot

## Predefined Animation Classes

Use these classes from `globals.css`:

```tsx
<div className="animate-in">Fades in</div>
<div className="slide-in-from-top">Slides from top</div>
```

Available classes:
- `.animate-in` - Fade in (200ms, ease-out-quad)
- `.animate-out` - Fade out (200ms, ease-in-quad)
- `.slide-in-from-top` - Slide from top (300ms, ease-out-cubic)
- `.slide-out-to-top` - Slide to top (300ms, ease-in-cubic)
