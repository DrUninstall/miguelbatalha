# Button Component - Styles & Guidelines

## Overview

A comprehensive, accessible button system built with React, TypeScript, and CSS Modules. The button component uses a **variant + tone** architecture that provides flexibility while maintaining design consistency across light and dark modes using semantic design tokens.

## Component Locations

- **Button**: `components/ui/button.tsx`
- **IconButton**: `components/ui/icon-button.tsx`

## Design Philosophy

The button system is built on two key dimensions:

1. **Variant** (Visual Hierarchy): Controls the emphasis level - primary, secondary, or tertiary
2. **Tone** (Color Scheme): Controls the semantic color - brand, neutral, destructive, or inverse

This matrix gives you 12 button combinations (3 variants × 4 tones) that work seamlessly in both light and dark modes.

## Features

- **Variant + Tone System**: Independent control over hierarchy and color
- **Dark Mode Support**: Automatically adapts to theme with proper contrast
- **Three Sizes**: Small (32px), Medium (48px), Large (56px)
- **Icon Support**: Icons can be positioned left or right
- **Full Width Option**: Stretch button to fill container
- **Accessibility**: Proper focus states, ARIA labels, keyboard navigation
- **Smooth Animations**: Hover, active, and focus transitions
- **TypeScript**: Fully typed with excellent IntelliSense

## API Reference

### Button Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode \| () => ReactNode` | - | Button label/content (required) |
| `variant` | `"primary" \| "secondary" \| "tertiary"` | `"secondary"` | Visual hierarchy level |
| `tone` | `"brand" \| "neutral" \| "destructive" \| "inverse"` | `"neutral"` | Color scheme/semantic meaning |
| `size` | `"small" \| "medium" \| "large"` | `"medium"` | Button size |
| `icon` | `ReactNode \| () => ReactNode` | - | Icon element or render function |
| `iconPosition` | `"left" \| "right"` | `"left"` | Icon placement |
| `fullWidth` | `boolean` | `false` | Stretch button to full width |
| `htmlType` | `"button" \| "submit" \| "reset"` | `"button"` | Native HTML button type |
| `disabled` | `boolean` | `false` | Disable button interaction |
| `className` | `string` | `""` | Additional CSS classes |

All other standard HTML button attributes are supported through `...rest` props.

## Variants (Visual Hierarchy)

### Primary
Highest emphasis. Use for the main call-to-action on a page or section.

**Visual Characteristics:**
- Filled background with solid color
- High contrast text
- Shadow for depth
- Most visually prominent

**When to use:**
- Main action on a page (e.g., "Save Changes", "Create Account")
- Final step in a flow (e.g., "Submit", "Confirm Purchase")
- Limit to 1-2 primary buttons per screen section

### Secondary
Medium emphasis. Use for important but not primary actions.

**Visual Characteristics:**
- Tinted background or border
- Medium contrast
- Less prominent than primary

**When to use:**
- Alternative actions (e.g., "Cancel" next to "Save")
- Important but secondary features
- Multiple actions of similar importance

### Tertiary
Lowest emphasis. Use for supplementary or less important actions.

**Visual Characteristics:**
- Transparent background
- Minimal visual weight
- Only visible on interaction

**When to use:**
- Optional or less critical actions
- Inline actions within content
- Navigation or browsing actions

## Tones (Color Schemes)

### Brand
Uses your brand accent color. Best for positive, promotional, or brand-aligned actions.

```tsx
<Button variant="primary" tone="brand">Get Started</Button>
<Button variant="secondary" tone="brand">Learn More</Button>
<Button variant="tertiary" tone="brand">View Details</Button>
```

**Primary + Brand**: Solid accent background, high contrast
**Secondary + Brand**: Tinted accent background with border
**Tertiary + Brand**: Transparent with accent text

### Neutral
Uses foreground/background colors. Best for standard, non-semantic actions.

```tsx
<Button variant="primary" tone="neutral">Continue</Button>
<Button variant="secondary" tone="neutral">Cancel</Button>
<Button variant="tertiary" tone="neutral">Skip</Button>
```

**Primary + Neutral**: Solid foreground background
**Secondary + Neutral**: Border with muted background
**Tertiary + Neutral**: Transparent with muted text

### Destructive
Uses red/error colors. For dangerous or irreversible actions.

```tsx
<Button variant="primary" tone="destructive">Delete Account</Button>
<Button variant="secondary" tone="destructive">Remove Item</Button>
<Button variant="tertiary" tone="destructive">Clear All</Button>
```

**Primary + Destructive**: Solid red background, white text
**Secondary + Destructive**: Red tinted background with red text
**Tertiary + Destructive**: Transparent with red text

### Inverse
Inverts foreground/background. Useful on colored backgrounds or for contrast.

```tsx
<Button variant="primary" tone="inverse">Save</Button>
<Button variant="secondary" tone="inverse">Edit</Button>
<Button variant="tertiary" tone="inverse">Close</Button>
```

**Behavior:**
- Light mode: White/light button with dark text
- Dark mode: Dark button with light text
- Provides contrast on colored backgrounds

## Sizes

### Small
Compact button for tight spaces or less prominent actions.

```tsx
<Button variant="primary" tone="brand" size="small">
  Small Button
</Button>
```

- Height: 32px (2rem)
- Padding: 16px horizontal
- Text: 14px
- Icon: 16px

### Medium (Default)
Standard button size for most use cases.

```tsx
<Button variant="primary" tone="brand" size="medium">
  Medium Button
</Button>
```

- Height: 48px (3rem)
- Padding: 20px horizontal
- Text: 16px
- Icon: 20px

### Large
Larger button for hero sections or important CTAs.

```tsx
<Button variant="primary" tone="brand" size="large">
  Large Button
</Button>
```

- Height: 56px (3.5rem)
- Padding: 24px horizontal
- Text: 18px
- Icon: 24px

## Usage Examples

### Basic Usage

```tsx
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

export function Example() {
  return (
    <div className={styles.buttonGroup}>
      {/* Primary actions */}
      <Button variant="primary" tone="brand">Save</Button>
      <Button variant="primary" tone="destructive">Delete</Button>

      {/* Secondary actions */}
      <Button variant="secondary" tone="neutral">Cancel</Button>

      {/* Tertiary actions */}
      <Button variant="tertiary" tone="neutral">Skip</Button>
    </div>
  );
}
```

```css
/* page.module.css */
.buttonGroup {
  display: flex;
  gap: 12px;
}
```

### With Icons

```tsx
import { Button } from "@/components/ui/button";
import { ArrowRight, Save, Download, Trash2 } from "lucide-react";
import styles from "./page.module.css";

export function IconExample() {
  return (
    <div className={styles.buttonGroup}>
      {/* Icon on left */}
      <Button variant="primary" tone="brand" icon={<Save />}>
        Save Changes
      </Button>

      {/* Icon on right */}
      <Button
        variant="primary"
        tone="brand"
        icon={<ArrowRight />}
        iconPosition="right"
      >
        Continue
      </Button>

      {/* Small button with icon */}
      <Button
        variant="secondary"
        tone="neutral"
        icon={<Download />}
        size="small"
      >
        Download
      </Button>
    </div>
  );
}
```

### Form Submission

```tsx
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export function FormExample() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // ... submit logic
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <div className={styles.buttonGroup}>
        <Button
          htmlType="button"
          variant="tertiary"
          tone="neutral"
        >
          Cancel
        </Button>
        <Button
          htmlType="submit"
          variant="primary"
          tone="brand"
          icon={<Save />}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
```

### Destructive Actions

```tsx
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DestructiveExample() {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div>
      <Button
        variant="secondary"
        tone="destructive"
        icon={<Trash2 />}
        onClick={() => setShowConfirm(true)}
      >
        Delete Item
      </Button>

      {showConfirm && (
        <div className={styles.confirmDialog}>
          <p className={styles.confirmText}>Are you sure? This action cannot be undone.</p>
          <div className={styles.buttonGroup}>
            <Button
              variant="tertiary"
              tone="neutral"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              tone="destructive"
              onClick={handleDelete}
            >
              Yes, Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Full Width Button

```tsx
<Button variant="primary" tone="brand" fullWidth>
  Create Account
</Button>
```

## IconButton Component

For icon-only buttons (pagination controls, toolbar actions, close buttons), use the `IconButton` component.

### IconButton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Icon element (required) |
| `variant` | `"primary" \| "secondary" \| "tertiary"` | `"tertiary"` | Visual hierarchy level |
| `tone` | `"brand" \| "neutral" \| "destructive" \| "inverse"` | `"neutral"` | Color scheme |
| `size` | `"small" \| "medium" \| "large"` | `"medium"` | Button size |
| `htmlType` | `"button" \| "submit" \| "reset"` | `"button"` | Native HTML button type |
| `disabled` | `boolean` | `false` | Disable button interaction |
| `className` | `string` | `""` | Additional CSS classes |

### IconButton Sizes

- **Small**: 32px × 32px (2rem × 2rem)
- **Medium**: 36px × 36px (2.25rem × 2.25rem)
- **Large**: 40px × 40px (2.5rem × 2.5rem)

### IconButton Usage

```tsx
import { IconButton } from "@/components/ui/icon-button";
import { X, Settings, ChevronLeft, Trash2 } from "lucide-react";

// Tertiary (default) - most common for icon buttons
<IconButton aria-label="Close">
  <X size={20} />
</IconButton>

// Small size
<IconButton size="small" aria-label="Settings">
  <Settings size={16} />
</IconButton>

// With brand tone
<IconButton variant="tertiary" tone="brand" aria-label="Go back">
  <ChevronLeft size={20} />
</IconButton>

// Destructive action
<IconButton variant="secondary" tone="destructive" aria-label="Delete">
  <Trash2 size={20} />
</IconButton>
```

### IconButton Best Practices

1. **Always use aria-label**: Required for accessibility since there's no visible text
2. **Match icon size to button size**:
   - Small button → 16px icon (`size={16}`)
   - Medium button → 20px icon (`size={20}`)
   - Large button → 24px icon (`size={24}`)
3. **Default to tertiary**: Icon buttons should have minimal visual weight by default
4. **Clear icons**: Use universally recognized icons that clearly communicate the action

## Best Practices

### Visual Hierarchy

1. **One Primary per Section**: Limit primary buttons to 1-2 per screen section
2. **Progressive Disclosure**: Use tertiary buttons for less important or optional actions
3. **Consistent Pairing**: When showing action pairs, use primary + secondary or primary + tertiary

### Tone Selection

1. **Brand**: Main positive actions, getting started, conversions
2. **Neutral**: Standard actions without semantic meaning
3. **Destructive**: Deleting, removing, or irreversible actions
4. **Inverse**: On colored backgrounds or for contrast needs

### Sizing

1. **Consistency**: Use the same size for buttons in the same context
2. **Small**: Forms, tables, cards, compact UIs
3. **Medium**: Standard pages and modals (default)
4. **Large**: Hero sections, landing pages, major CTAs

### Icons

1. **Meaningful**: Only use icons that reinforce the button's purpose
2. **Consistent Direction**:
   - Navigation/forward actions → icon right
   - Actions/commands → icon left
3. **Optional**: Icons should enhance, not replace, clear button text

### Accessibility

1. **Descriptive Labels**: Button text should clearly describe the action
2. **Loading States**: Disable during async operations and show feedback
3. **Focus Visible**: Never remove focus outlines without alternatives
4. **Keyboard Support**: Ensure all buttons are keyboard accessible
5. **Icon Buttons**: Always include aria-label for icon-only buttons

## Common Patterns

### Action Pairs

```tsx
// Save/Cancel
<div className={styles.buttonGroup}>
  <Button variant="tertiary" tone="neutral">Cancel</Button>
  <Button variant="primary" tone="brand">Save</Button>
</div>

// Delete confirmation
<div className={styles.buttonGroup}>
  <Button variant="secondary" tone="neutral">Keep</Button>
  <Button variant="primary" tone="destructive">Delete</Button>
</div>
```

### Wizard/Multi-step

```tsx
<div className={styles.wizardActions}>
  <Button variant="tertiary" tone="neutral" icon={<ChevronLeft />}>
    Back
  </Button>
  <Button variant="primary" tone="brand" icon={<ChevronRight />} iconPosition="right">
    Continue
  </Button>
</div>
```

```css
/* page.module.css */
.wizardActions {
  display: flex;
  justify-content: space-between;
}
```

### Toolbar Actions

```tsx
<div className={styles.toolbar}>
  <IconButton aria-label="Bold">
    <Bold size={20} />
  </IconButton>
  <IconButton aria-label="Italic">
    <Italic size={20} />
  </IconButton>
  <IconButton aria-label="Underline">
    <Underline size={20} />
  </IconButton>
</div>
```

```css
/* page.module.css */
.toolbar {
  display: flex;
  gap: 8px;
}
```

## Design Tokens

The button component uses CSS Modules with semantic design tokens from `globals.css`:

### Color Tokens
- `--fill-brand-strong`: Brand/accent fill color
- `--fill-brand-weak`: Subtle brand tint
- `--text-strong`: High contrast text
- `--text-weak`: Lower contrast text
- `--text-inverse-strong`: Text on dark backgrounds
- `--text-brand`: Brand-colored text
- `--stroke-weak`: Border color
- `--stroke-brand-strong`: Brand border
- `--background-base`: Base background color

### Interactive States
- `--fill-hover`: Hover state overlay (RGB values)
- `--fill-press`: Active/press state overlay (RGB values)

### Usage Pattern
All color tokens use the RGB format for proper opacity support:

```css
/* button.module.css */
.primaryBrand {
  background: rgb(var(--fill-brand-strong));
  color: rgb(var(--text-inverse-strong));
  border: 1px solid rgb(var(--stroke-brand-strong));
}

.primaryBrand:hover {
  background: rgba(var(--fill-brand-strong), 0.9);
}
```

Ensure these tokens are defined in your `app/globals.css` design system.

## Migration Guide

### From Old System

**Before** (variant-based):
```tsx
<button variant="primary">Save</button>
<button variant="danger">Delete</button>
<button variant="ghost">Skip</button>
```

**After** (variant + tone):
```tsx
<Button variant="primary" tone="brand">Save</Button>
<Button variant="primary" tone="destructive">Delete</Button>
<Button variant="tertiary" tone="neutral">Skip</Button>
```

### From Inline Styles

**Before** (inline styles):
```tsx
<button style={{
  padding: "12px 24px",
  background: "var(--accent)",
  color: "white",
  borderRadius: "8px"
}}>
  Primary
</button>
```

**After** (Button component with design system):
```tsx
<Button variant="primary" tone="brand">
  Primary
</Button>
```

## Troubleshooting

### TypeScript errors with htmlType

If you need to specify HTML button type (submit/reset), use `htmlType` prop:

```tsx
// ✅ Correct
<Button htmlType="submit" variant="primary" tone="brand">Submit</Button>

// ❌ Wrong - conflicts with native button type
<Button type="submit" variant="primary" tone="brand">Submit</Button>
```

### Buttons not showing proper theme colors

Ensure your design tokens are defined in `globals.css`:

```css
:root {
  --accent: ...;
  --foreground: ...;
  /* etc */
}
```

### Icon size doesn't match button

Match icon size prop to button size:

```tsx
<Button size="small" icon={<Icon size={16} />}>Small</Button>
<Button size="medium" icon={<Icon size={20} />}>Medium</Button>
<Button size="large" icon={<Icon size={24} />}>Large</Button>
```

## Related Components

- **IconButton**: For icon-only buttons
- **Link**: For navigation, use Next.js `<Link>` component
- **Button Group**: Wrap multiple buttons in flex container for grouping
