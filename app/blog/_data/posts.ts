export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "motion-foundations",
    title: "Motion Foundations",
    description:
      "The building blocks of animation on the web — orbits, flips, reveals, and the GPU tricks that make them smooth.",
    date: "2025-02-28",
    tags: ["animation", "performance", "css"],
  },
  {
    slug: "layout-animations",
    title: "Shared Layout Animations",
    description:
      "How Framer Motion's layout animations create fluid transitions between completely different UI states.",
    date: "2025-02-21",
    tags: ["framer-motion", "animation", "react"],
  },
  {
    slug: "interactive-buttons",
    title: "Crafting Buttons That Feel Alive",
    description:
      "Sparkles, orbits, morphing pills, and hold-to-confirm — making the most clicked element on the web worth clicking.",
    date: "2025-02-14",
    tags: ["interaction", "animation", "ux"],
  },
  {
    slug: "css-gradients",
    title: "The Art of CSS Gradients",
    description:
      "Linear, radial, conic. Color spaces, animation, layering. Everything I've learned about making gradients that don't look like 2012.",
    date: "2025-02-07",
    tags: ["css", "visual-design", "animation"],
  },
  {
    slug: "cursor-interactions",
    title: "Cursor-Driven Interfaces",
    description:
      "Mouse-follow patterns, magnified docks, card reveals, and infinite marquees — designing for the pointer.",
    date: "2025-01-31",
    tags: ["interaction", "animation", "ux"],
  },
  {
    slug: "animated-icons",
    title: "Building Animated Icons",
    description:
      "Twelve icons that transition between states with purpose. Hearts, spinners, toggles — each with a different animation strategy.",
    date: "2025-01-24",
    tags: ["icons", "animation", "svg"],
  },
  {
    slug: "drag-and-spring-physics",
    title: "Drag, Swipe & Spring Physics",
    description:
      "Carousels that snap, passwords that pulse, dialogs that resize — building interfaces that respond to force.",
    date: "2025-01-17",
    tags: ["physics", "interaction", "framer-motion"],
  },
  {
    slug: "design-system",
    title: "Building a Design System",
    description:
      "Buttons, inputs, toggles, tabs, accordions, and stages — the unsexy components that make everything else work.",
    date: "2025-01-10",
    tags: ["design-system", "components", "architecture"],
  },
  {
    slug: "theming-and-polish",
    title: "Dark Mode, Toasts & the Details",
    description:
      "Theme switching with view transitions, toast notifications, virtualized lists, and the small things that separate good from great.",
    date: "2025-01-03",
    tags: ["theming", "polish", "ux"],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllSlugs(): string[] {
  return blogPosts.map((post) => post.slug);
}
