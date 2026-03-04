"use client";

import {
  GradientTypes,
  GradientColorSpaces,
  AnimatedGradient,
  AnimatedBorderGradient,
  LayeredGradients,
} from "@/components/gradient-demos";
import styles from "../[slug]/page.module.css";

export default function CssGradients() {
  return (
    <div className={styles.prose}>
      <p>
        Gradients have a reputation problem. Say &quot;gradient&quot; and most people picture a neon pink-to-blue banner from a 2013 startup landing page. Fair. But modern CSS gradients are a completely different tool — color space interpolation, conic sweeps, animated borders, layered compositions. The spec evolved. Most implementations didn&apos;t.
      </p>

      <h2 className={styles.sectionHeading}>Gradient Types</h2>
      <p>
        Three types, three use cases. <strong>Linear</strong> for directional fills — backgrounds, text masks, dividers. <strong>Radial</strong> for focal points — highlights, glows, spotlight effects. <strong>Conic</strong> for angular sweeps — pie charts, loading rings, color wheels.
      </p>
      <p>
        Most devs only reach for linear. That&apos;s leaving two-thirds of the toolkit on the table.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Linear, Radial, Conic</div>
        <div className={styles.demoInner}>
          <GradientTypes />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Color Space Interpolation</h2>
      <p>
        Here&apos;s the thing nobody tells you: <code>linear-gradient(red, blue)</code> in sRGB produces a muddy brown in the middle. That&apos;s not a bug — it&apos;s how sRGB mixes colors. The fix is one keyword: <code>in oklch</code> or <code>in lab</code>.
      </p>
      <p>
        OKLCH interpolates through perceptually uniform color space — the midpoint between red and blue is a vibrant purple, not mud. This single change makes every gradient look better. Browser support is solid now — no excuse not to use it.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — sRGB vs OKLCH</div>
        <div className={styles.demoInner}>
          <GradientColorSpaces />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Animated Gradient</h2>
      <p>
        You can&apos;t animate <code>background</code> directly — CSS treats it as a non-animatable shorthand. The workaround: use <code>@property</code> to register custom properties with a declared type (<code>&lt;color&gt;</code>), then animate those properties. The browser knows the type, so it can interpolate.
      </p>
      <p>
        Alternatively — and this is what I usually reach for — animate <code>background-position</code> on an oversized gradient. Make the gradient 200% wide, shift it left-to-right on a loop. Simpler, wider support, and the visual result is identical for most cases.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo</div>
        <div className={styles.demoInner}>
          <AnimatedGradient />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Animated Border</h2>
      <p>
        Animated gradient borders are the one effect I see constantly requested and rarely implemented well. The trick: a pseudo-element with the gradient rotating behind the card, masked by the card&apos;s own background. The pseudo rotates using <code>transform: rotate()</code> — compositor-only, smooth at 60fps.
      </p>
      <p>
        The alternative approach uses <code>conic-gradient</code> with animated <code>@property</code> angle values. Both work. I prefer the pseudo-element method because it&apos;s more portable and doesn&apos;t require <code>@property</code> support.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo</div>
        <div className={styles.demoInner}>
          <AnimatedBorderGradient />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Layered Gradients</h2>
      <p>
        CSS allows multiple background layers in a single declaration — and most of the interesting gradient effects come from stacking them. A radial highlight on top of a linear base. A noise texture over a color sweep. Conic accents behind a frosted overlay.
      </p>
      <p>
        Layer order matters. Later declarations sit behind earlier ones. Transparency in upper layers lets lower layers bleed through. It&apos;s essentially compositing — the same mental model as Photoshop layers, but in one CSS property.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Stacked gradient layers</div>
        <div className={styles.demoInner}>
          <LayeredGradients />
        </div>
      </div>

      <hr className={styles.separator} />

      <p>
        Gradients are one of those CSS features where the gap between &quot;standard usage&quot; and &quot;what&apos;s actually possible&quot; is enormous. Color spaces alone are a game-changer — the muddy midpoints that plagued gradients for a decade are a solved problem. Worth revisiting if you haven&apos;t touched gradients since 2015.
      </p>
    </div>
  );
}
