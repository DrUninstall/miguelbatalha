import {
  GradientTypes,
  GradientColorSpaces,
  AnimatedGradient,
  AnimatedBorderGradient,
  LayeredGradients,
} from "@/components/gradient-demos";
import { Code, Demo } from "../_components/demo";

export default function CssGradients() {
  return (
    <>
      <p>
        The first draft of this post said that <code>linear-gradient(red, blue)</code>{" "}
        goes through a muddy brown in the middle. It doesn’t. The midpoint is{" "}
        <code>rgb(128 0 128)</code>, a dark purple. I’d repeated something I’d
        read instead of checking, which is a bad habit in a post about getting
        colour right.
      </p>
      <p>
        The underlying point still holds, and it’s the most useful thing in
        here: <em>how</em> a gradient mixes colours is a choice now, and the
        default isn’t always the right one.
      </p>

      <h2>Three shapes</h2>
      <p>
        Quick grounding first. <code>linear-gradient</code> blends along a
        line, <code>radial-gradient</code> out from a point, and{" "}
        <code>conic-gradient</code> around a point, like a colour wheel or a
        pie chart. Each one takes its geometry from the pointer here, through
        two CSS variables the component sets.
      </p>
      <Demo caption="Hover, drag on touch, or focus a swatch and use the arrow keys. Home resets.">
        <GradientTypes />
      </Demo>

      <h2>Where the colours travel</h2>
      <p>
        A gradient between two colours is a path through a colour space. By
        default, that space is sRGB, and the path is a straight line through
        the RGB cube. Between complementary colours, that line runs straight
        through the grey in the middle: blue <code>#0000ff</code> to yellow{" "}
        <code>#ffff00</code> passes through <code>rgb(128 128 128)</code>.
      </p>
      <p>
        Since 2023, every major browser lets you pick the space:
      </p>
      <Code label="CSS">{`
background: linear-gradient(to right in oklab, blue, yellow);
background: linear-gradient(to right in oklch, blue, yellow);
`}</Code>
      <p>The two “ok” spaces solve different problems:</p>
      <ul>
        <li>
          <strong>oklab</strong> is built so that equal steps look like equal
          changes. The path is still a straight line, but the brightness in the
          middle sits where your eye expects it. Complements still pass close
          to grey, just a nicer grey.
        </li>
        <li>
          <strong>oklch</strong> is the same space in polar form: lightness,
          chroma, hue. Interpolating there walks around the hue wheel and keeps
          the saturation up. Blue to yellow stays vivid, but it gets there
          through cyan and green. Some of those in-between colours are outside
          what an sRGB screen can show, so the browser clips them.
        </li>
      </ul>
      <p>
        Each row below uses the same two endpoints with no extra stops. Only
        the interpolation space changes. The small square at the end of each
        row is the exact midpoint, computed with <code>color-mix()</code> in
        the same space:
      </p>
      <Code label="gradient-demos.module.css">{`
.oklch    { background: linear-gradient(to right in oklch, var(--from), var(--to)); }
.oklchMid { background: color-mix(in oklch, var(--from), var(--to)); }
`}</Code>
      <Demo caption="Switch between three pairs. Blue → yellow shows the sRGB grey; green → magenta shows how far oklch can detour.">
        <GradientColorSpaces />
      </Demo>
      <p>
        How I choose now: oklab when the two colours are related and I want
        the blend to stay between them, oklch when I want saturation and I’m
        happy with the detour. The midpoint swatch is how I check. If it
        surprises me, I add a stop.
      </p>
      <p>
        One gotcha with fallbacks. If the gradient comes through a CSS
        variable and the browser doesn’t support the <code>in</code> syntax, the
        whole declaration becomes invalid when it’s computed, and the element
        gets no background at all. It doesn’t fall back to sRGB on its own.
        The demo uses <code>@supports</code> to redeclare the plain version for
        those browsers.
      </p>

      <h2>Animating a gradient</h2>
      <p>
        You can’t transition one gradient into another: the browser treats
        gradient images as not interpolable, so it swaps them in one step. What
        you can animate is where the gradient sits. Make the tile twice as
        wide as the box, let it repeat, and slide it by exactly one tile:
      </p>
      <Code label="gradient-demos.module.css">{`
.animated {
  background-image: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b);
  background-size: 200% 100%;
  animation: slide 12s linear infinite;
}
@keyframes slide { to { background-position: 200% 0; } }
`}</Code>
      <p>
        The gradient starts and ends on the same colour, and a position of
        200% on a 200%-wide tile is exactly one tile, so the last frame
        matches the first and the loop never jumps. Earlier versions ran back
        and forth, which always looks like it’s breathing rather than flowing.
      </p>
      <Demo caption="12 seconds per loop. With reduced motion on, it shows one still frame.">
        <AnimatedGradient />
      </Demo>
      <p>
        The cost: moving a background repaints the element every frame. It
        isn’t a compositor animation. On a card this size that’s nothing. On a
        full-screen hero, I’d check the frame rate on a cheap laptop first.
      </p>

      <h2>A rotating border with @property</h2>
      <p>
        Custom properties are normally just strings, so the browser can’t
        animate them smoothly. Registering one with a type fixes that:
      </p>
      <Code label="gradient-demos.module.css">{`
@property --angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

.border {
  padding: 2px;
  background: conic-gradient(from var(--angle), #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b);
  animation: spin 4s linear infinite;
}
@keyframes spin { to { --angle: 360deg; } }
`}</Code>
      <p>
        The “border” is 2px of the wrapper’s background showing around an
        inner card. <code>@property</code> has worked in every major browser
        since mid-2024. Without it, the angle can’t interpolate, and the border
        jumps instead of turning.
      </p>
      <Demo caption="A registered --angle turns once every 4 seconds.">
        <AnimatedBorderGradient />
      </Demo>
      <p>
        This also repaints every frame. The alternative, a rotating
        pseudo-element behind the card, uses <code>transform</code> and stays
        on the compositor, but it needs extra markup and clipping. For one
        small card I take the simpler CSS.
      </p>

      <h2>Layers</h2>
      <p>
        <code>background</code> takes a list, and most interesting gradient
        effects are several simple ones stacked. The first layer listed paints
        on top. A mesh gradient is six soft radial spots over a dark linear
        base, which comes last so it sits at the bottom:
      </p>
      <Code label="gradient-demos.module.css">{`
background:
  radial-gradient(at 40% 20%, rgb(255 107 107 / 0.8) 0px, transparent 50%),
  radial-gradient(at 80% 0%, rgb(72 219 251 / 0.8) 0px, transparent 50%),
  /* …four more… */
  linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
`}</Code>
      <p>
        The other tiles use the same idea: a <code>repeating-linear-gradient</code>{" "}
        of translucent stripes over a colour sweep, an SVG noise texture over a
        gradient for grain, and a frosted panel. The frosted one taught me
        something obvious in hindsight: <code>backdrop-filter</code> blurs what’s
        behind the element, and the first version had nothing behind it. It
        was a white box on a white card. Now it sits over hard-edged shapes, so
        you can see the blur working.
      </p>
      <Demo caption="Four tiles, each a stack of simple layers. The first three respond to the pointer.">
        <LayeredGradients />
      </Demo>

      <h2>What changed my mind</h2>
      <p>
        I used to think of gradients as decoration you get right by eye.
        Picking the colour space and checking the midpoint turned it into
        something I can reason about. It’s one keyword and a{" "}
        <code>color-mix()</code> to check it. I’m still not sure oklch is
        always the right default for UI. It can be too vivid for subtle
        surfaces. But I now choose the space deliberately instead of
        inheriting sRGB by accident.
      </p>
    </>
  );
}
