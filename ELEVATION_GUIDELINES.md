# Elevation Guidelines

This document outlines the elevation system and best practices inspired by Apple, Vercel, and Linear.

## Overview

Elevation creates visual hierarchy through shadows and layering. Our system uses subtle, realistic shadows that adapt to light and dark modes.

## Elevation Levels

### Raised
**Use for**: Cards, buttons, and elements slightly above the base surface.

**Light Mode**:
```css
box-shadow: 0px 2px 4px -2px rgba(0, 0, 0, 0.08),
            0px 20px 24px -4px rgba(0, 0, 0, 0.08);
```

**Dark Mode**:
```css
box-shadow: 0px 8px 8px -4px rgba(0, 0, 0, 0.04),
            0px 2px 4px -2px rgba(0, 0, 0, 0.08);
```

**CSS Variable**: `--elevation-raised`

### Overlay
**Use for**: Dropdowns, modals, popovers, and floating elements.

**Light Mode**:
```css
box-shadow: 0px 8px 8px -4px rgba(0, 0, 0, 0.04),
            0px 20px 24px -4px rgba(0, 0, 0, 0.08);
```

**Dark Mode**:
```css
box-shadow: 0px 20px 24px -4px rgba(0, 0, 0, 0.08),
            0px 4px 8px -2px rgba(0, 0, 0, 0.04);
```

**CSS Variable**: `--elevation-overlay`

## Dark Mode Considerations

In dark mode, shadows are often less visible due to the dark background. Our approach:

1. **Lighter Backgrounds**: Use elevated surface colors (`background-raised`, `background-overlay`)
2. **Subtle Shadows**: Keep shadow opacity low (4-8%) for realism
3. **Border Enhancement**: Combine with subtle borders for definition

```css
/* Dark mode card with elevation */
.card {
  background: rgb(var(--background-raised));
  border: 1px solid rgb(var(--border));
  box-shadow: var(--elevation-raised);
}
```

## Usage Guidelines

### When to Use Elevation

✅ **Use elevation for**:
- Cards and content blocks
- Dropdown menus and popovers
- Modal dialogs
- Floating action buttons
- Hover states on interactive cards
- Navigation bars (subtle)

❌ **Avoid elevation for**:
- Flat buttons
- Text links
- List items (unless interactive)
- Large background sections
- Elements at the page edge

### Layering Hierarchy

Establish clear z-index layers:

```css
:root {
  --z-base: 0;
  --z-raised: 10;
  --z-sticky: 100;
  --z-overlay: 1000;
  --z-modal: 2000;
  --z-toast: 3000;
}
```

### Combining with Backgrounds

Use semantic background tokens with elevation:

```css
/* Raised card */
.card-raised {
  background: rgb(var(--background-raised));
  box-shadow: var(--elevation-raised);
}

/* Overlay menu */
.dropdown-overlay {
  background: rgb(var(--background-overlay));
  box-shadow: var(--elevation-overlay);
}
```

## Best Practices from Apple, Vercel, Linear

### 1. Apple's Depth Philosophy
- **Subtle is better**: Apple uses minimal shadows (2-4px) for most UI
- **Glass morphism**: Combine blur with transparency for modern depth
- **Layered approach**: Use multiple subtle shadows instead of one heavy shadow

```css
.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  box-shadow: var(--elevation-raised);
}
```

### 2. Vercel's Minimal Elevation
- **Border-first**: Prefer borders over heavy shadows
- **Hover elevation**: Add elevation on hover for interactive feedback
- **Consistent spacing**: Maintain visual rhythm with consistent elevation

```css
.vercel-card {
  border: 1px solid rgb(var(--border));
  transition: box-shadow 200ms ease, border-color 200ms ease;
}

.vercel-card:hover {
  border-color: rgb(var(--accent));
  box-shadow: var(--elevation-raised);
}
```

### 3. Linear's Elevation System
- **Context-aware**: Different elevations for different contexts
- **Animation**: Animate elevation changes smoothly
- **Performance**: Use `will-change` for animated shadows sparingly

```css
.linear-interactive {
  box-shadow: none;
  transition: box-shadow 200ms ease, transform 200ms ease;
  will-change: box-shadow, transform;
}

.linear-interactive:hover {
  transform: translateY(-1px);
  box-shadow: var(--elevation-raised);
}
```

## Utility Classes

Use these pre-built classes from `globals.css`:

### Basic Elevation
```html
<div class="elevation-raised">Raised element</div>
<div class="elevation-overlay">Floating menu</div>
```

### Interactive Elevation
```html
<!-- Lift on hover (Vercel style) -->
<div class="hover-lift card">Interactive card</div>

<!-- Scale on hover (Apple style) -->
<button class="hover-scale">Button</button>
```

### Glass Morphism
```html
<!-- Apple-style glass effect -->
<div class="glass elevation-overlay">
  Frosted glass panel
</div>
```

## Origin-Aware Shadows

Shadows should respect their light source and origin point:

### Top-Lit (Default)
Most UI shadows assume light from above (y-offset is positive):
```css
box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
```

### Origin-Based (Dropdowns)
Dropdowns should appear to emerge from their trigger:
```css
/* Dropdown from top-left button */
.dropdown-top-left {
  transform-origin: top left;
  box-shadow: var(--elevation-overlay);
}

/* Dropdown from bottom-right button */
.dropdown-bottom-right {
  transform-origin: bottom right;
  box-shadow: var(--elevation-overlay);
}
```

## Performance Optimization

### Best Practices
1. **Limit shadow blur**: Keep blur radius under 24px for performance
2. **Use CSS variables**: Enable theme switching without recalculating
3. **Avoid animating shadows**: Animate `transform` and `opacity` instead when possible
4. **Combine with borders**: Reduce shadow intensity by adding subtle borders

### Good Example (Performant)
```css
.card {
  box-shadow: var(--elevation-raised);
  border: 1px solid rgb(var(--border));
  transition: transform 200ms ease;
}

.card:hover {
  transform: translateY(-1px);
  /* Shadow stays the same, only transform changes */
}
```

### Bad Example (Avoid)
```css
.card {
  transition: box-shadow 300ms ease;
}

.card:hover {
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.2);
  /* Animating shadow values is expensive */
}
```

## Accessibility

### Respect User Preferences
```css
@media (prefers-reduced-motion: reduce) {
  .elevation-raised,
  .elevation-overlay {
    box-shadow: none;
    border: 1px solid rgb(var(--border));
  }
}
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  .card {
    box-shadow: none;
    border: 2px solid rgb(var(--foreground));
  }
}
```

## Examples

### Card Component
```tsx
<div className="card elevation-raised">
  <h3>Card Title</h3>
  <p>Card content with subtle elevation</p>
</div>
```

### Interactive Card
```tsx
<div className="card elevation-raised hover-lift">
  <h3>Hover me</h3>
  <p>I lift up on hover</p>
</div>
```

### Dropdown Menu
```tsx
<div className="elevation-overlay" style={{
  background: 'rgb(var(--background-overlay))',
  borderRadius: '12px',
  padding: '0.5rem'
}}>
  <MenuItem>Option 1</MenuItem>
  <MenuItem>Option 2</MenuItem>
</div>
```

### Modal Dialog
```tsx
<div className="elevation-overlay glass" style={{
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  borderRadius: '16px',
  padding: '2rem'
}}>
  <h2>Modal Title</h2>
  <p>Modal content with glass effect and elevation</p>
</div>
```

## Summary

- **Use subtle shadows** - 2-4px for raised, 8-24px for overlay
- **Combine with borders** - Especially important in dark mode
- **Respect context** - Different elevations for different use cases
- **Optimize performance** - Animate transforms, not shadows
- **Support accessibility** - Respect motion and contrast preferences
- **Follow platform conventions** - Apple (subtle), Vercel (minimal), Linear (context-aware)
