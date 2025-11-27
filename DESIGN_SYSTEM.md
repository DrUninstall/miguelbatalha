# Design System Documentation

Complete design system for Miguel Batalha's personal website, inspired by Apple, Vercel, and Linear.

## Table of Contents
1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Elevation](#elevation)
5. [Animation](#animation)
6. [Components](#components)
7. [Best Practices](#best-practices)

---

## Color System

### Semantic Color Tokens

Our color system uses semantic naming that describes *usage* rather than appearance.

#### Text Colors
```css
--text-strong         /* Primary text, headings */
--text-weak           /* Secondary text, descriptions */
--text-brand          /* Links, branded text */
--text-disabled       /* Disabled state text */
```

#### Stroke Colors
```css
--stroke-strong       /* Primary borders (inputs, dividers) */
--stroke-weak         /* Subtle borders (cards, decorative) */
--stroke-selected     /* Selected element borders */
--stroke-focus        /* Focus ring color */
```

#### Fill Colors
```css
--fill-strong         /* High contrast fills (buttons) */
--fill-weak           /* Low contrast fills (badges, tags) */
--fill-weaker         /* Very subtle fills (hover states) */
--fill-hover          /* Hover state backgrounds */
--fill-press          /* Active/pressed state backgrounds */
```

#### Background Colors
```css
--background-base     /* Default page background (z-index: 0) */
--background-raised   /* Elevated cards (z-index: 10) */
--background-overlay  /* Floating menus, dropdowns (z-index: 100+) */
--background-sunken   /* Recessed areas */
--background-alternate /* Zebra striping, sections */
```

### Light & Dark Mode

All tokens automatically adapt:
```css
/* Light mode */
--text-strong: #0a0a0a;
--background-base: #ffffff;

/* Dark mode (automatic) */
--text-strong: #fafafa;
--background-base: #18181b;
```

---

## Typography

### Type Scale (1.200 Minor Third)

#### Mobile (< 768px)
| Style   | Size   | Line Height | Weight |
|---------|--------|-------------|--------|
| Display | 40px   | 48px (120%) | 700    |
| H1      | 36px   | 44px (122%) | 600    |
| H2      | 28px   | 36px (128%) | 600    |
| H3      | 24px   | 32px (133%) | 600    |
| H4      | 20px   | 28px (140%) | 600    |
| Small   | 16px   | 24px (150%) | 400    |
| Tiny    | 14px   | 20px (143%) | 400    |

#### Desktop (≥ 768px)
| Style   | Size   | Line Height | Weight |
|---------|--------|-------------|--------|
| Display | 56px   | 64px (114%) | 700    |
| H1      | 40px   | 48px (120%) | 600    |
| H2      | 32px   | 40px (125%) | 600    |
| H3      | 24px   | 32px (133%) | 600    |
| H4      | 20px   | 28px (140%) | 600    |
| Small   | 16px   | 24px (150%) | 400    |
| Tiny    | 14px   | 20px (143%) | 400    |

### Usage
```html
<h1 class="type-display">Display Heading</h1>
<h1 class="type-h1">H1 Heading</h1>
<p class="type-small">Small text</p>
```

### Font Stack
```css
font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Geist Sans** features:
- Modern geometric sans-serif by Vercel
- Excellent legibility at all sizes
- Optimized for UI/UX
- Used by Vercel, Linear

---

## Spacing

### Scale (Based on 4px grid)

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
--space-24: 6rem;    /* 96px */
```

### Layout Constraints
```css
--content-width: 80rem;   /* 1280px - Max content width */
--content-narrow: 42rem;  /* 672px - Optimal reading width */
```

---

## Elevation

### Levels

#### Raised (z-index: 10)
**Use for**: Cards, buttons, slightly elevated content

**Light mode**:
```css
box-shadow: 0px 2px 4px -2px rgba(0, 0, 0, 0.08),
            0px 20px 24px -4px rgba(0, 0, 0, 0.08);
```

**Dark mode**:
```css
box-shadow: 0px 8px 8px -4px rgba(0, 0, 0, 0.04),
            0px 2px 4px -2px rgba(0, 0, 0, 0.08);
```

**Usage**:
```html
<div class="elevation-raised">Raised card</div>
```

#### Overlay (z-index: 100+)
**Use for**: Dropdowns, modals, popovers, tooltips

**Light mode**:
```css
box-shadow: 0px 8px 8px -4px rgba(0, 0, 0, 0.04),
            0px 20px 24px -4px rgba(0, 0, 0, 0.08);
```

**Dark mode**:
```css
box-shadow: 0px 20px 24px -4px rgba(0, 0, 0, 0.08),
            0px 4px 8px -2px rgba(0, 0, 0, 0.04);
```

**Usage**:
```html
<div class="elevation-overlay">Dropdown menu</div>
```

### Z-Index Scale
```css
--z-base: 0;
--z-raised: 10;
--z-sticky: 100;
--z-overlay: 1000;
--z-modal: 2000;
--z-toast: 3000;
```

---

## Animation

### Timing

```css
--duration-fast: 200ms;    /* Quick transitions */
--duration-normal: 300ms;  /* Standard animations */
```

**Rule**: Never exceed 1000ms (except illustrative animations)

### Easing Curves

#### Ease-Out (Default - Use for entering elements)
```css
--ease-out-quad: cubic-bezier(.25, .46, .45, .94);
--ease-out-cubic: cubic-bezier(.215, .61, .355, 1);
--ease-out-quart: cubic-bezier(.165, .84, .44, 1);
```

#### Ease-In-Out (Use for moving elements)
```css
--ease-in-out-quad: cubic-bezier(.455, .03, .515, .955);
--ease-in-out-cubic: cubic-bezier(.645, .045, .355, 1);
```

#### Ease-In (Avoid - Makes UI feel slow)
```css
--ease-in-quad: cubic-bezier(.55, .085, .68, .53);
```

### Predefined Animations
```css
.animate-in           /* Fade in - 200ms */
.animate-out          /* Fade out - 200ms */
.slide-in-from-top    /* Slide from top - 300ms */
.slide-out-to-top     /* Slide to top - 300ms */
```

### Framer Motion Defaults
```tsx
// Spring animation (default)
transition={{ type: "spring", stiffness: 300, damping: 30 }}

// Ease animation
transition={{ duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
```

---

## Components

### Card
```html
<div class="card elevation-raised">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>
```

**CSS**:
```css
.card {
  background: rgb(var(--background-raised));
  border: 1px solid rgb(var(--border));
  border-radius: 12px;
  padding: 1.5rem;
}
```

### Interactive Card
```html
<div class="card elevation-raised hover-lift">
  <h3>Hover Me</h3>
  <p>I lift on hover</p>
</div>
```

### Button Variants

#### Primary
```html
<button class="btn-primary">
  Primary Action
</button>
```

**CSS**:
```css
.btn-primary {
  background: rgb(var(--accent));
  color: rgb(var(--accent-foreground));
  padding: 0.625rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: opacity 200ms ease;
}

.btn-primary:hover {
  opacity: 0.9;
}
```

#### Secondary
```html
<button class="btn-secondary">
  Secondary Action
</button>
```

**CSS**:
```css
.btn-secondary {
  border: 1px solid rgb(var(--border));
  padding: 0.625rem 1.5rem;
  border-radius: 0.5rem;
  transition: background 200ms ease;
}

.btn-secondary:hover {
  background: rgb(var(--muted));
}
```

### Glass Effect
```html
<div class="glass elevation-overlay">
  <p>Frosted glass panel</p>
</div>
```

**CSS**:
```css
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

@media (prefers-color-scheme: dark) {
  .glass {
    background: rgba(24, 24, 27, 0.8);
  }
}
```

---

## Best Practices

### From Apple
1. **Subtle is better** - Use minimal shadows (2-4px)
2. **Glass morphism** - Combine blur with transparency
3. **Consistent spacing** - Stick to 4px grid
4. **Focus on typography** - Type is the primary UI element
5. **Motion with purpose** - Animations enhance, not distract

### From Vercel
1. **Border-first** - Prefer borders over heavy shadows
2. **Minimal palette** - Black, white, and grays
3. **Fast animations** - 200ms default
4. **Content-focused** - Let content shine
5. **Mobile-first** - Design for smallest screen first

### From Linear
1. **Context-aware** - Different elevations for different contexts
2. **Keyboard shortcuts** - Enable power users
3. **Smooth transitions** - Everything fades/slides
4. **Performance** - Never sacrifice speed
5. **Consistent patterns** - Reuse components

### General Principles
1. **Accessibility first** - Support keyboard, screen readers, reduced motion
2. **Performance matters** - Animate transform/opacity, not layout properties
3. **Semantic HTML** - Use correct elements (button, nav, article)
4. **Progressive enhancement** - Work without JavaScript
5. **Responsive always** - Mobile to desktop, seamless

---

## Code Examples

### Complete Card Component
```tsx
export function FeatureCard({
  title,
  description,
  icon
}: FeatureCardProps) {
  return (
    <motion.div
      className="card elevation-raised hover-lift"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
    >
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h3 className="type-h4">{title}</h3>
      </div>
      <p className="type-small text-muted-foreground">
        {description}
      </p>
    </motion.div>
  );
}
```

### Modal with Glass Effect
```tsx
export function Modal({ children }: ModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-modal flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        className="glass elevation-overlay relative z-10 max-w-lg rounded-2xl p-8"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
```

---

## Quick Reference

### Most Used Classes
```css
/* Layout */
.content-wrapper    /* Max-width container with padding */
.content-narrow     /* Narrow content for reading */

/* Elevation */
.elevation-raised   /* Cards, buttons */
.elevation-overlay  /* Dropdowns, modals */

/* Effects */
.glass             /* Frosted glass effect */
.hover-lift        /* Lift on hover */
.hover-scale       /* Scale on hover */

/* Typography */
.type-display      /* Largest heading */
.type-h1           /* H1 heading */
.type-small        /* Small text */

/* Borders */
.border-subtle     /* Subtle border */
.border-strong     /* Strong border */

/* Animation */
.animate-in        /* Fade in */
.slide-in-from-top /* Slide from top */
```

### Color Usage
```tsx
// Text
className="text-foreground"           // Strong text
className="text-muted-foreground"     // Weak text

// Backgrounds
className="bg-background"             // Base
className="bg-muted"                  // Subtle

// Borders
className="border-border"             // Subtle
className="border-accent"             // Branded

// Accents
className="bg-accent text-accent-foreground"  // Primary button
```

---

For detailed guidelines, see:
- [ANIMATION_GUIDELINES.md](./ANIMATION_GUIDELINES.md)
- [ELEVATION_GUIDELINES.md](./ELEVATION_GUIDELINES.md)
