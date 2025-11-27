# UI Components Library

A comprehensive collection of reusable React components built with TypeScript, CSS Modules with semantic design tokens, and Framer Motion.

## Table of Contents

1. [Accordion](#accordion)
2. [Segmented Control](#segmented-control)
3. [Input & TextArea](#input--textarea)
4. [Tab Selector](#tab-selector)
5. [Progress Stages](#progress-stages)
6. [Toggle Switch](#toggle-switch)
7. [Paginated List](#paginated-list)
8. [List (Virtualized)](#list-virtualized)

---

## Accordion

Expandable/collapsible content sections with smooth height animations.

### Features
- Smooth expand/collapse animations (250ms cubic-bezier)
- Animated chevron rotation
- Controlled or uncontrolled state
- Auto-expand and collapse-all support
- Accessibility support (aria-expanded)

### Usage

```tsx
import { Accordion, AccordionItem } from "@/components/ui/accordion";

<Accordion>
  <AccordionItem title="Section 1">
    <p>Content for section 1</p>
  </AccordionItem>
  <AccordionItem title="Section 2" defaultOpen>
    <p>Content for section 2 (open by default)</p>
  </AccordionItem>
</Accordion>
```

### Props

**AccordionItem**:
- `title` (string, required): Section header text
- `children` (ReactNode, required): Content to display when expanded
- `defaultOpen` (boolean): Whether section starts open (default: false)
- `shouldAutoExpand` (boolean): Auto-expand trigger
- `collapseAll` (boolean): Collapse trigger
- `onToggle` (function): Callback when toggle state changes

### File Location
`components/ui/accordion.tsx`

---

## Segmented Control

Animated control with sliding thumb indicator, similar to iOS segmented controls.

### Features
- Smooth sliding thumb with spring physics
- ResizeObserver for responsive positioning
- Keyboard navigation support (instant animation)
- Mouse/touch with 300ms spring animation
- Icon support for options
- Size variants (small, normal)

### Usage

```tsx
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Grid, List, Table } from "lucide-react";

const [view, setView] = useState("grid");

<SegmentedControl
  options={[
    { value: "grid", label: "Grid", icon: Grid },
    { value: "list", label: "List", icon: List },
    { value: "table", label: "Table", icon: Table },
  ]}
  value={view}
  onChange={setView}
  size="normal"
/>
```

### Props
- `options` (Option[], required): Array of options with value, label, and optional icon
- `value` (string, required): Currently selected value
- `onChange` (function, required): Callback when selection changes
- `size` ("small" | "normal"): Control size (default: "normal")
- `className` (string): Additional CSS classes

### File Location
`components/ui/segmented-control.tsx`

---

## Input & TextArea

Form input components with icon support, validation states, and consistent styling.

### Features
- Icon support (Lucide icons)
- Validation states (invalid prop)
- Optional field indicator
- Two size variants (small, large)
- Focus ring with accent color
- Hover states
- forwardRef support

### Usage

```tsx
import { Input, TextArea } from "@/components/ui/input";
import { Mail, User } from "lucide-react";

<Input
  label="Email"
  type="email"
  icon={Mail}
  placeholder="your@email.com"
  invalid={emailError}
/>

<Input
  label="Username"
  icon={User}
  optional
  placeholder="Enter username"
/>

<TextArea
  label="Message"
  placeholder="Write your message..."
  variant="large"
/>
```

### Props

**Input**:
- `label` (string): Input label
- `icon` (LucideIcon): Icon component to display
- `variant` ("small" | "large"): Input size (default: "small")
- `invalid` (boolean): Show error state (default: false)
- `optional` (boolean): Show "(optional)" text (default: false)
- All standard HTML input attributes

**TextArea**:
- Same as Input, except no `icon` prop
- min-height: 96px (small), 128px (large)
- max-height: 300px (resizable)

### File Location
`components/ui/input.tsx`

---

## Tab Selector

Horizontal tab navigation with animated bottom indicator.

### Features
- Animated sliding indicator (spring physics)
- Smooth color transitions
- Keyboard navigation
- ARIA roles (tablist, tab, aria-selected)
- Responsive positioning with useLayoutEffect

### Usage

```tsx
import { TabSelector } from "@/components/ui/tab-selector";

const [activeTab, setActiveTab] = useState("overview");

<TabSelector
  tabs={[
    { id: "overview", label: "Overview" },
    { id: "analytics", label: "Analytics" },
    { id: "settings", label: "Settings" },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

{/* Tab content */}
<div id={`panel-${activeTab}`}>
  Content for {activeTab}
</div>
```

### Props
- `tabs` (Tab[], required): Array of tabs with id and label
- `activeTab` (string, required): Currently active tab ID
- `onTabChange` (function, required): Callback when tab changes
- `className` (string): Additional CSS classes

### File Location
`components/ui/tab-selector.tsx`

---

## Progress Stages

Step progress indicator with visual bars and navigation.

### Features
- Animated progress bar (spring physics)
- Step indicators with completion states
- Back button support
- Responsive design
- Auto-scaling based on stage count

### Usage

```tsx
import { Stages } from "@/components/ui/stages";

const [currentStage, setCurrentStage] = useState(0);
const stages = [
  { id: "1", label: "Account" },
  { id: "2", label: "Profile" },
  { id: "3", label: "Complete" },
];

<Stages
  stages={stages}
  currentStage={currentStage}
  onBack={() => setCurrentStage(currentStage - 1)}
/>
```

### Props
- `stages` (Stage[], required): Array of stages with id and label
- `currentStage` (number, required): Current stage index (0-based)
- `onBack` (function): Callback for back button (optional)
- `className` (string): Additional CSS classes

### File Location
`components/ui/stages.tsx`

---

## Toggle Switch

Animated toggle switch with spring physics.

### Features
- Smooth sliding animation (spring physics)
- Two size variants (small, medium)
- Label support
- Disabled state
- Focus ring for accessibility
- forwardRef support

### Usage

```tsx
import { Toggle } from "@/components/ui/toggle";

const [enabled, setEnabled] = useState(false);

<Toggle
  label="Enable notifications"
  checked={enabled}
  onChange={setEnabled}
  size="medium"
/>

<Toggle
  label="Disabled option"
  checked={false}
  onChange={() => {}}
  disabled
/>
```

### Props
- `checked` (boolean, required): Toggle state
- `onChange` (function, required): Callback when state changes
- `label` (string): Label text
- `disabled` (boolean): Disable interaction (default: false)
- `size` ("small" | "medium"): Toggle size (default: "medium")
- `className` (string): Additional CSS classes

### File Location
`components/ui/toggle.tsx`

---

## Paginated List

List component with full pagination controls and page navigation.

### Features
- Page navigation (first, previous, next, last)
- Page number buttons with ellipsis
- Item count display
- Empty state support
- Generic type support
- Smart page number display (max 7 visible)

### Usage

```tsx
import { PaginatedList } from "@/components/ui/paginated-list";

const items = [/* array of items */];

<PaginatedList
  items={items}
  itemsPerPage={10}
  renderItem={(item, index) => (
    <div key={item.id}>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  )}
  emptyState={<p>No items found</p>}
/>
```

### Props
- `items` (T[], required): Array of items to display
- `itemsPerPage` (number): Items per page (default: 10)
- `renderItem` (function, required): Render function for each item
- `emptyState` (ReactNode): Content to show when list is empty
- `className` (string): Additional CSS classes

### File Location
`components/ui/paginated-list.tsx`

---

## List (Virtualized)

Efficient list rendering with virtual scrolling and infinite scroll support.

### Features
- Virtual scrolling for large datasets
- Intersection Observer for infinite scroll
- Loading states
- Empty state support
- Dynamic height calculation
- Generic type support

### Usage

```tsx
import { List, SimpleList } from "@/components/ui/list";

// Virtualized list with infinite scroll
const [items, setItems] = useState([/* initial items */]);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const newItems = await fetchMoreItems();
  setItems([...items, ...newItems]);
  if (newItems.length === 0) setHasMore(false);
};

<List
  items={items}
  renderItem={(item) => <div>{item.title}</div>}
  itemHeight={60}
  loadMore={loadMore}
  hasMore={hasMore}
  isLoading={loading}
/>

// Simple list for small datasets
<SimpleList
  items={items}
  renderItem={(item) => <div>{item.title}</div>}
  gap="medium"
  emptyState={<p>No items</p>}
/>
```

### Props

**List**:
- `items` (T[], required): Array of items
- `renderItem` (function, required): Render function for each item
- `itemHeight` (number): Fixed height per item in pixels (default: 60)
- `loadMore` (async function): Function to load more items
- `hasMore` (boolean): Whether more items are available (default: false)
- `isLoading` (boolean): Loading state (default: false)
- `emptyState` (ReactNode): Content when empty
- `loadingState` (ReactNode): Custom loading UI
- `className` (string): Additional CSS classes

**SimpleList**:
- `items` (T[], required): Array of items
- `renderItem` (function, required): Render function
- `emptyState` (ReactNode): Content when empty
- `className` (string): Additional CSS classes
- `gap` ("none" | "small" | "medium" | "large"): Spacing between items

### File Location
`components/ui/list.tsx`

---

## Design Principles

All components follow these design principles:

1. **Consistency**: Use semantic design tokens from `globals.css`
2. **Accessibility**: ARIA labels, keyboard navigation, focus states
3. **Animation**: 200-300ms transitions, spring physics for natural motion
4. **Dark Mode**: Automatic support via theme tokens
5. **TypeScript**: Full type safety with proper interfaces
6. **Responsive**: Mobile-first approach with responsive breakpoints
7. **Performance**: Optimized animations (GPU-accelerated), virtual scrolling

## Common Patterns

### Animation
- Spring physics: `{ type: "spring", stiffness: 300-500, damping: 25-30 }`
- Transitions: `{ duration: 0.2-0.3, ease: [0.16, 1, 0.3, 1] }`
- AnimatePresence for mount/unmount animations

### Styling
- Border radius: `rounded-lg` (8px) or `rounded-full`
- Focus rings: `focus:ring-2 focus:ring-accent/20`
- Hover states: `hover:bg-muted` or `hover:text-foreground`
- Transitions: `transition-colors` or `transition-all`

### Icons
- Lucide React for all icons
- Standard sizes: `w-4 h-4` (16px), `w-5 h-5` (20px)
- Always include `aria-hidden` or `aria-label`

### States
- Invalid/Error: Red border (`border-red-600`)
- Disabled: 50% opacity (`opacity-50 cursor-not-allowed`)
- Active/Selected: Accent color (`bg-accent text-accent-foreground`)

## Usage with Index Export

Import all components from a single entry point:

```tsx
import {
  Accordion,
  AccordionItem,
  SegmentedControl,
  Input,
  TextArea,
  TabSelector,
  Stages,
  Toggle,
  PaginatedList,
  List,
  SimpleList,
} from "@/components/ui";
```

---

**Last Updated**: 2025-11-18
**Component Count**: 8 component groups, 11 total exports
