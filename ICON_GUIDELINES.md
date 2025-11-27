# Icon Usage Guidelines

This project uses **Lucide React** as the standard icon library for all interface elements.

## Why Lucide Icons?

1. **Consistent Design Language**: Clean, simple, and modern aesthetic that matches Vercel/Linear/Apple
2. **Comprehensive Library**: 1000+ icons covering most use cases
3. **Perfect for UI**: Designed specifically for interfaces, not decorative purposes
4. **Tree-Shakable**: Only imports icons you use
5. **Accessible**: Proper ARIA labels and semantic HTML
6. **Customizable**: Easy to resize, color, and animate
7. **TypeScript Support**: Full type safety out of the box

## Installation

```bash
npm install lucide-react
```

## Basic Usage

### Importing Icons
```tsx
import { Heart, Star, Moon, Sun, ArrowRight } from "lucide-react";
```

### Rendering Icons
```tsx
<Heart size={20} style={{ color: 'rgb(var(--red-light-800))' }} />
<Star size={24} style={{ color: 'rgb(var(--fill-yellow))' }} />
```

## Icon Sizing

### Size Options
Use consistent sizing based on context:

| Context | Size (px) | CSS Size | Lucide Prop |
|---------|-----------|----------|-------------|
| **Tiny** (inline text) | 12-14px | `0.75-0.875rem` | `size={12}` |
| **Small** (buttons, nav) | 16px | `1rem` | `size={16}` |
| **Medium** (default) | 20-24px | `1.25-1.5rem` | `size={20}` |
| **Large** (feature cards) | 32px | `2rem` | `size={32}` |
| **XL** (hero sections) | 48px+ | `3rem+` | `size={48}` |

### Examples by Component

**Buttons**:
```tsx
<button>
  <ArrowRight size={16} />
  Continue
</button>
```

**Navigation**:
```tsx
<nav>
  <Menu size={20} />
</nav>
```

**Feature Cards**:
```tsx
<div className="feature-card">
  <Zap size={32} style={{ color: 'rgb(var(--fill-brand-strong))' }} />
  <h3>Fast Performance</h3>
</div>
```

## Color Guidelines

### Semantic Colors
Match icon colors to their purpose:

```tsx
// Success
<CheckCircle className="text-green-600" />

// Error
<XCircle className="text-red-600" />

// Warning
<AlertTriangle style={{ color: 'rgb(var(--text-warning))' }} />

// Info
<Info className="text-blue-600" />

// Neutral
<Settings className="text-muted-foreground" />

// Brand
<Sparkles className="text-accent" />
```

### Color Tokens
Use semantic tokens from our design system:

```tsx
// Foreground (default text color)
<Icon className="text-foreground" />

// Muted (secondary elements)
<Icon className="text-muted-foreground" />

// Accent (interactive elements)
<Icon className="text-accent" />

// Custom with CSS variables
<Icon style={{ color: 'rgb(var(--text-brand))' }} />
```

## Stroke Width

Lucide icons default to 2px stroke. Match this to your design:

```tsx
// Default (2px)
<Icon />

// Thin (1.5px)
<Icon strokeWidth={1.5} />

// Bold (2.5px)
<Icon strokeWidth={2.5} />
```

**Recommendation**: Stick to default 2px for consistency.

## Filled vs. Outline

Most Lucide icons are outline by default. For filled icons:

```tsx
// Outline (default)
<Heart className="text-red-600" />

// Filled
<Heart className="text-red-600 fill-red-600" />

// Filled on hover
<Heart className="text-red-600 hover:fill-red-600 transition-colors" />
```

## Animation

### With Framer Motion

**Hover animations**:
```tsx
<motion.div whileHover={{ scale: 1.1 }}>
  <Heart size={24} />
</motion.div>
```

**Rotation (loading spinner)**:
```tsx
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
>
  <Loader2 size={20} />
</motion.div>
```

**Entrance animation**:
```tsx
<motion.div
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: "spring", stiffness: 300 }}
>
  <CheckCircle size={32} style={{ color: 'rgb(var(--text-success))' }} />
</motion.div>
```

### With CSS

**Spin animation**:
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.icon-spin {
  animation: spin 1s linear infinite;
}
```

```tsx
<Loader2 size={20} className={styles.iconSpin} />
```

## Common Icons Reference

### Navigation & UI
```tsx
import {
  Menu,           // Hamburger menu
  X,              // Close/Cancel
  ChevronRight,   // Navigation arrows
  ChevronDown,
  ArrowRight,     // CTA arrows
  ArrowLeft,
  Home,           // Home icon
  Search,         // Search
  Settings,       // Settings
} from "lucide-react";
```

### Actions
```tsx
import {
  Plus,           // Add
  Minus,          // Remove/Subtract
  Check,          // Confirm
  CheckCircle,    // Success
  XCircle,        // Error
  Edit,           // Edit/Pencil
  Trash2,         // Delete
  Copy,           // Copy
  Download,       // Download
  Upload,         // Upload
  Share2,         // Share
} from "lucide-react";
```

### Status & Feedback
```tsx
import {
  Info,           // Information
  AlertCircle,    // Alert
  AlertTriangle,  // Warning
  HelpCircle,     // Help/Question
  Loader2,        // Loading spinner
  CheckCircle,    // Success
  XCircle,        // Error
} from "lucide-react";
```

### Theme
```tsx
import {
  Sun,            // Light mode
  Moon,           // Dark mode
  Monitor,        // System
} from "lucide-react";
```

### Social & External
```tsx
import {
  Mail,           // Email
  Phone,          // Phone
  MapPin,         // Location
  ExternalLink,   // External link
  Github,         // GitHub
  Twitter,        // Twitter/X
  Linkedin,       // LinkedIn
} from "lucide-react";
```

### Content
```tsx
import {
  FileText,       // Document
  Image,          // Image
  Video,          // Video
  Music,          // Audio
  File,           // Generic file
  Folder,         // Folder
  Calendar,       // Date
  Clock,          // Time
} from "lucide-react";
```

## Accessibility

### Alt Text
Icons should have proper ARIA labels when used without text:

```tsx
<button aria-label="Close dialog">
  <X size={16} />
</button>
```

### Decorative Icons
Icons next to text are decorative and should be hidden from screen readers:

```tsx
<button>
  <CheckCircle aria-hidden="true" size={16} />
  <span>Save Changes</span>
</button>
```

### Interactive Icons
Standalone interactive icons need labels:

```tsx
<button
  aria-label="Toggle dark mode"
  className="icon-button"
>
  <Moon size={20} />
</button>
```

## Performance

### Tree Shaking
Only import the icons you use:

```tsx
// ✅ Good - Tree shakeable
import { Heart, Star } from "lucide-react";

// ❌ Bad - Imports entire library
import * as Icons from "lucide-react";
```

### Bundle Size
Each icon adds ~1-2KB. Use sparingly on critical paths.

### Lazy Loading
For large icon sets, consider lazy loading:

```tsx
const Icon = lazy(() =>
  import("lucide-react").then(mod => ({ default: mod.Heart }))
);
```

## Best Practices

### Do's ✅
- Use consistent sizing throughout the app
- Match stroke width across all icons
- Use semantic colors for status icons
- Provide ARIA labels for standalone icons
- Animate with purpose (loading, success states)
- Keep icons visually aligned with text

### Don'ts ❌
- Don't mix icon libraries (stick to Lucide)
- Don't use decorative icons without semantic purpose
- Don't forget accessibility labels
- Don't use overly complex icons (keep it simple)
- Don't animate excessively (performance)
- Don't use inconsistent sizes

## Component Examples

### Icon Button
```tsx
function IconButton({
  icon: Icon,
  label,
  onClick
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="p-2 rounded-lg hover:bg-muted transition-colors"
    >
      <Icon size={20} />
    </button>
  );
}

// Usage
<IconButton icon={Settings} label="Open settings" onClick={openSettings} />
```

### Icon with Text
```tsx
function IconText({
  icon: Icon,
  children
}: IconTextProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon aria-hidden className="w-4 h-4" />
      <span>{children}</span>
    </div>
  );
}

// Usage
<IconText icon={CheckCircle}>
  Successfully saved
</IconText>
```

### Animated Status Icon
```tsx
function StatusIcon({ status }: { status: 'success' | 'error' | 'loading' }) {
  if (status === 'loading') {
    return (
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
        <Loader2 size={20} />
      </motion.div>
    );
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring" }}
      >
        <CheckCircle className="w-5 h-5 text-green-600" />
      </motion.div>
    );
  }

  return <XCircle className="w-5 h-5 text-red-600" />;
}
```

## Migration from Other Libraries

If migrating from Radix Icons or other libraries:

```tsx
// Before (Radix)
import { ArrowRightIcon } from "@radix-ui/react-icons";
<ArrowRightIcon width={16} height={16} />

// After (Lucide)
import { ArrowRight } from "lucide-react";
<ArrowRight size={16} />

// or with className
<ArrowRight className="w-4 h-4" />
```

## Resources

- **Official Docs**: https://lucide.dev
- **Icon Search**: https://lucide.dev/icons
- **GitHub**: https://github.com/lucide-icons/lucide
- **Figma Plugin**: Available for design consistency

---

**Summary**: Use Lucide React for all icons in this project. Keep sizing consistent, use semantic colors, provide accessibility labels, and animate purposefully.
