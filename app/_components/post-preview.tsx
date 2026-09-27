"use client";

import { useState } from "react";
import { CoinFlip } from "@/components/coin-flip";
import { MorphingPill } from "@/components/morphing-pill";
import { SharedLayoutSwap } from "@/components/shared-layout-demo";
import { ConicGradientSwatch } from "@/components/gradient-demos";
import { Toggle } from "@/components/ui/toggle";
import { SparklesButton } from "@/components/sparkles-button";

function TogglePreview() {
  const [on, setOn] = useState(true);
  return <Toggle checked={on} onChange={setOn} label="Notifications" />;
}

/**
 * One working demo from each post, shown on the home page above its title.
 * Every one waits for input, so nothing on the page moves on its own. A post
 * without an entry here shows its description instead.
 */
const previews: Record<string, () => React.ReactNode> = {
  "motion-foundations": () => <CoinFlip />,
  "springs-and-gestures": () => <MorphingPill />,
  "layout-animations": () => <SharedLayoutSwap />,
  "designing-for-the-pointer": () => <SparklesButton>Sparkle</SparklesButton>,
  "css-gradients": () => <ConicGradientSwatch />,
  "the-boring-components": () => <TogglePreview />,
};

export function PostPreview({ slug, fallback }: { slug: string; fallback: string }) {
  const Preview = previews[slug];
  return Preview ? <Preview /> : <p>{fallback}</p>;
}
