# Spacing & Grid System

Complete spacing and grid guidelines for consistent, scalable layouts.

## Spacing Scale

All spacing uses a **4px increment system** for consistency and visual rhythm.

### Spacing Tokens

| Token | Value (px) | Value (rem) | Common Usage |
|-------|------------|-------------|--------------|
| `--space-0` | 0 | 0 | Reset/None |
| `--space-1` | 4 | 0.25rem | Tight spacing, icon gaps |
| `--space-2` | 8 | 0.5rem | Small gaps, compact layouts |
| `--space-3` | 12 | 0.75rem | Medium-small gaps |
| `--space-4` | 16 | 1rem | Standard gaps, padding |
| `--space-5` | 20 | 1.25rem | Medium gaps |
| `--space-6` | 24 | 1.5rem | Card padding, section spacing |
| `--space-8` | 32 | 2rem | Large gaps, section margins |
| `--space-10` | 40 | 2.5rem | Extra large gaps |
| `--space-12` | 48 | 3rem | Section spacing |
| `--space-14` | 56 | 3.5rem | Large section spacing |
| `--space-16` | 64 | 4rem | Major section spacing |
| `--space-20` | 80 | 5rem | Hero spacing |
| `--space-24` | 96 | 6rem | Large hero spacing |
| `--space-32` | 128 | 8rem | Extra large sections |
| `--space-48` | 192 | 12rem | Massive spacing |
| `--space-64` | 256 | 16rem | Exceptional spacing |

### Usage in CSS

```css
/* Using CSS variables */
.card {
  padding: var(--space-6);
  margin-bottom: var(--space-8);
}

/* In CSS Modules */
.section {
  padding-top: var(--space-16);
  padding-bottom: var(--space-16);
}
```

### Common Patterns

**Card Padding**:
- Small card: `--space-4` (16px)
- Medium card: `--space-6` (24px)
- Large card: `--space-8` (32px)

**Section Spacing**:
- Between sections: `--space-16` to `--space-24` (64-96px)
- Page top/bottom: `--space-20` to `--space-32` (80-128px)

**Component Gaps**:
- Tight (icons): `--space-1` to `--space-2` (4-8px)
- Normal (buttons): `--space-3` to `--space-4` (12-16px)
- Relaxed (cards): `--space-6` to `--space-8` (24-32px)

---

## Grid System

Our responsive grid adapts across three breakpoints with specific column counts, gutters, and margins.

### Breakpoints

| Name | Min Width | Max Width | Columns | Gutter | Margin |
|------|-----------|-----------|---------|--------|--------|
| **Mobile** | 0 | 767px | 4 | 16px | 32px |
| **Tablet** | 768px | 1439px | 8 | 24px | 48px |
| **Desktop** | 1440px | ∞ | 12 | 32px | 120px |

### Grid Specifications

#### Mobile (< 768px)
```css
--grid-columns-mobile: 4;
--grid-gutter-mobile: 16px;
--grid-margin-mobile: 32px;
```

**Total width**: 428px (typical mobile)
- 4 columns for simple layouts
- 16px gutters between columns
- 32px margins on each side

**Usage**: Stack elements vertically, use full width for cards

#### Tablet (768px - 1439px)
```css
--grid-columns-tablet: 8;
--grid-gutter-tablet: 24px;
--grid-margin-tablet: 48px;
```

**Total width**: 768px
- 8 columns for moderate complexity
- 24px gutters for breathing room
- 48px margins for comfortable reading

**Usage**: 2-column layouts, sidebars, split content

#### Desktop (≥ 1440px)
```css
--grid-columns-desktop: 12;
--grid-gutter-desktop: 32px;
--grid-margin-desktop: 120px;
```

**Total width**: 1440px
- 12 columns for complex layouts
- 32px gutters for generous spacing
- 120px margins for focus on content

**Usage**: Multi-column layouts, dashboards, data tables

### Grid Implementation

#### CSS Grid Example
```css
.grid-container {
  display: grid;
  gap: var(--grid-gutter-mobile);
  padding: 0 var(--grid-margin-mobile);
  grid-template-columns: repeat(var(--grid-columns-mobile), 1fr);
}

@media (min-width: 768px) {
  .grid-container {
    gap: var(--grid-gutter-tablet);
    padding: 0 var(--grid-margin-tablet);
    grid-template-columns: repeat(var(--grid-columns-tablet), 1fr);
  }
}

@media (min-width: 1440px) {
  .grid-container {
    gap: var(--grid-gutter-desktop);
    padding: 0 var(--grid-margin-desktop);
    grid-template-columns: repeat(var(--grid-columns-desktop), 1fr);
  }
}
```

#### CSS Grid Example with Media Queries
```tsx
import styles from "./page.module.css";

<div className={styles.gridContainer}>
  <div className={styles.gridItem}>
    Content
  </div>
</div>
```

```css
/* page.module.css */
.gridContainer {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 0 32px;
}

@media (min-width: 768px) {
  .gridContainer {
    grid-template-columns: repeat(8, 1fr);
    gap: 24px;
    padding: 0 48px;
  }
}

@media (min-width: 1440px) {
  .gridContainer {
    grid-template-columns: repeat(12, 1fr);
    gap: 32px;
    padding: 0 120px;
  }
}

.gridItem {
  grid-column: span 4;
}

@media (min-width: 768px) {
  .gridItem {
    grid-column: span 4;
  }
}

@media (min-width: 1440px) {
  .gridItem {
    grid-column: span 6;
  }
}
```

### Column Spanning

**Mobile (4 columns)**:
- Full width: `grid-column: span 4`
- Half width: `grid-column: span 2`
- Third width: Not recommended (use half or full)

**Tablet (8 columns)**:
- Full width: `grid-column: span 8`
- Half width: `grid-column: span 4`
- Third width: `grid-column: span 3` (approximate)
- Sidebar: `grid-column: span 2` or `span 3`

**Desktop (12 columns)**:
- Full width: `grid-column: span 12`
- Two-thirds: `grid-column: span 8`
- Half width: `grid-column: span 6`
- Third width: `grid-column: span 4`
- Quarter: `grid-column: span 3`

---

## Content Width Constraints

### Max-Width Guidelines

```css
/* Full width container */
.content-wrapper {
  max-width: 80rem; /* 1280px */
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

/* Narrow content (ideal for reading) */
.content-narrow {
  max-width: 42rem; /* 672px - 60-75 characters per line */
  margin-left: auto;
  margin-right: auto;
}
```

**Usage**:
- `content-wrapper`: General page content, most sections
- `content-narrow`: Blog posts, articles, long-form text

### Reading Width

For optimal readability:
- **Minimum**: 45 characters per line
- **Ideal**: 60-75 characters per line
- **Maximum**: 90 characters per line

This typically translates to:
- **Mobile**: 100% width (with margins)
- **Tablet**: 600-700px
- **Desktop**: 650-750px

---

## Vertical Rhythm

Maintain consistent vertical spacing throughout the page:

### Heading Margins
```css
h1 { margin-bottom: var(--space-6); }  /* 24px */
h2 { margin-bottom: var(--space-5); }  /* 20px */
h3 { margin-bottom: var(--space-4); }  /* 16px */
h4 { margin-bottom: var(--space-3); }  /* 12px */
```

### Paragraph Spacing
```css
p { margin-bottom: var(--space-4); }   /* 16px */
p + p { margin-top: var(--space-4); }  /* 16px between paragraphs */
```

### Section Spacing
```css
section { margin-bottom: var(--space-16); }      /* 64px */
section.hero { margin-bottom: var(--space-20); } /* 80px */
```

---

## Practical Examples

### Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div className="card p-6">
    <h3 className="mb-3">Title</h3>
    <p>Content</p>
  </div>
</div>
```

### Two-Column Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
  {/* Main content: 8 columns */}
  <main className="lg:col-span-8">
    <article className="max-w-prose">
      Content
    </article>
  </main>

  {/* Sidebar: 4 columns */}
  <aside className="lg:col-span-4">
    Sidebar
  </aside>
</div>
```

### Hero Section
```tsx
<section className="py-20 md:py-24 lg:py-32">
  <div className="content-wrapper">
    <h1 className="mb-6">Hero Title</h1>
    <p className="mb-8 text-lg">Hero description</p>
    <div className="flex gap-4">
      <button>Primary CTA</button>
      <button>Secondary CTA</button>
    </div>
  </div>
</section>
```

---

## Best Practices

### Do's ✅
- Use spacing tokens consistently
- Maintain 4px increments
- Respect grid margins
- Use content-width constraints
- Test all breakpoints
- Ensure adequate touch targets (44px minimum)

### Don'ts ❌
- Don't use arbitrary spacing values
- Don't break the 4px rhythm
- Don't ignore grid gutters
- Don't create too-wide text columns
- Don't use fixed pixel widths for layout
- Don't forget mobile-first approach

### Responsive Strategy
1. **Mobile first**: Start with mobile layout
2. **Progressive enhancement**: Add complexity at larger breakpoints
3. **Content-driven**: Let content determine breakpoints
4. **Touch-friendly**: Ensure adequate spacing for touch targets
5. **Performance**: Use CSS Grid for complex layouts

---

## Quick Reference

### CSS Variable Spacing Scale
- `var(--space-1)` = 4px
- `var(--space-2)` = 8px
- `var(--space-3)` = 12px
- `var(--space-4)` = 16px
- `var(--space-6)` = 24px
- `var(--space-8)` = 32px
- `var(--space-12)` = 48px
- `var(--space-16)` = 64px
- `var(--space-20)` = 80px
- `var(--space-24)` = 96px

### Common CSS Module Patterns
```css
/* Card component */
.card {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Section spacing */
.section {
  padding-top: var(--space-16);
  padding-bottom: var(--space-16);
}

@media (min-width: 768px) {
  .section {
    padding-top: var(--space-24);
    padding-bottom: var(--space-24);
  }
}

/* Responsive grid */
.grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1440px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Container with max-width */
.container {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}
```
