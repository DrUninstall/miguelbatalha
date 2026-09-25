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
    title: "Transform, Opacity, and the Exceptions",
    description:
      "Why the one rule of web animation works, a 3D coin and orbit that stay on the cheap path, and the one place I break it on purpose.",
    date: "2026-09-25",
    tags: ["animation", "performance", "css"],
  },
  {
    slug: "springs-and-gestures",
    title: "Springs, Velocity, and Letting Go",
    description:
      "What a spring gives you that a duration can't: a carousel that keeps your fling, a meter that reacts, and a dialog that resizes to fit.",
    date: "2026-09-25",
    tags: ["animation", "interaction", "framer-motion"],
  },
  {
    slug: "layout-animations",
    title: "Animating Between Layouts",
    description:
      "How layout and layoutId animations work, what they cost, and the details that make a tab bar, a reorder and a card-to-dialog feel continuous.",
    date: "2026-09-25",
    tags: ["framer-motion", "animation", "react"],
  },
  {
    slug: "designing-for-the-pointer",
    title: "Designing for the Pointer",
    description:
      "Cursor-driven effects from someone who works on an aim trainer, and what each one does when there's no cursor at all.",
    date: "2026-09-25",
    tags: ["interaction", "input", "accessibility"],
  },
  {
    slug: "css-gradients",
    title: "CSS Gradients, Revisited",
    description:
      "Colour-space interpolation, animated borders with @property, and layered backgrounds, with demos that show the difference.",
    date: "2026-09-25",
    tags: ["css", "color", "visual-design"],
  },
  {
    slug: "the-boring-components",
    title: "The Boring Components",
    description:
      "Buttons, inputs, switches, tabs, toasts and icons: the parts that ship in every feature, and the details that make them hold up.",
    date: "2026-09-25",
    tags: ["design-system", "components", "accessibility"],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllSlugs(): string[] {
  return blogPosts.map((post) => post.slug);
}
