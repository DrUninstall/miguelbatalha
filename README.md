# Miguel Batalha - Personal Website

A minimal, beautifully designed personal website built with modern web technologies.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **CSS Modules** - Component-scoped styling with semantic design tokens
- **Framer Motion** - Smooth animations and micro-interactions
- **React Hot Toast** - Elegant toast notifications
- **Lucide React** - High-quality icon library

## Design Philosophy

This website follows design principles inspired by Vercel, Apple, and Linear:

- **Minimal & Clean** - Focus on content with generous whitespace
- **Semantic Design Tokens** - Comprehensive token system for text, stroke, fill, and backgrounds
- **Responsive Typography** - Fluid type scale that adapts from mobile to desktop
- **Smooth Animations** - Delightful micro-interactions without overwhelming the user
- **Dark Mode Support** - Automatic dark mode that respects system preferences

## Project Structure

```
miguel-batalha-com/
├── app/
│   ├── page.tsx              # Home page with hero and experience
│   ├── blog/
│   │   └── page.tsx          # Blog listing page
│   ├── components/
│   │   └── page.tsx          # Component showcase
│   ├── globals.css           # Global styles and design tokens
│   └── layout.tsx            # Root layout
├── components/
│   ├── toast.tsx             # Toast notification hook
│   └── animated-icons.tsx    # Animated icon components
└── lib/
    └── utils.ts              # Utility functions
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Design Tokens

The website uses a comprehensive semantic token system:

- **Text tokens**: `text.strong`, `text.weak`, `text.brand`, etc.
- **Stroke tokens**: `stroke.strong`, `stroke.weak`, etc.
- **Fill tokens**: `fill.strong`, `fill.weak`, `fill.hover`, etc.
- **Background tokens**: `background.base`, `background.raised`, etc.
- **Elevation tokens**: `elevation.raised`, `elevation.overlay`

All tokens automatically adapt for light and dark modes.

### Elevation System

Inspired by Apple, Vercel, and Linear:
- **Raised**: Subtle elevation for cards and buttons (2-4px shadows)
- **Overlay**: Higher elevation for dropdowns and modals (8-24px shadows)
- Automatically adapts shadow intensity for dark mode
- Combines shadows with elevated surface colors for optimal depth perception

## Typography

Responsive typography using the 1.200 Minor Third type scale:

- **Display**: 40px/48px (mobile) → 56px/64px (desktop)
- **H1**: 36px/44px → 40px/48px
- **H2**: 28px/36px → 32px/40px
- **H3**: 24px/32px (consistent)
- **H4**: 20px/28px (consistent)
- **Small**: 16px/24px (consistent)
- **Tiny**: 14px/20px (consistent)

## Features

- ✅ Responsive design for all screen sizes
- ✅ Automatic dark mode support
- ✅ Professional elevation system (Apple/Vercel/Linear inspired)
- ✅ Smooth animations with custom easing curves
- ✅ Interactive component showcase
- ✅ Blog structure with MDX support
- ✅ Toast notifications
- ✅ Animated icons and micro-interactions
- ✅ Glass morphism effects
- ✅ Custom scrollbar styling
- ✅ Focus-visible accessibility
- ✅ Reduced motion support
- ✅ Optimized performance with Next.js 15

## Deployment

Deploy easily with Vercel:

```bash
npm run build
```

Or deploy to Vercel with one click:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## License

© 2025 Miguel Batalha. All rights reserved.
