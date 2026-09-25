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
        A gradient between two colours is a path through a colour space, and
        the default space depends on how you wrote the stops. If every stop is
        a legacy colour (hex, <code>rgb()</code>, <code>hsl()</code> or a
        named colour), it’s sRGB, and the path is a straight line through the
        RGB cube. Blue <code>#0000ff</code> and yellow <code>#ffff00</code>{" "}
        sit on opposite corners of that cube, so the line runs straight
        through the grey in the middle: <code>rgb(128 128 128)</code>. If any
        stop is written as <code>oklch()</code>, <code>oklab()</code> or{" "}
        <code>color()</code>, the default switches to oklab.
      </p>
      <p>
        Since mid-2024 (Chrome and Safari had it earlier, Firefox arrived
        last), every major browser lets you pick the space:
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
          middle sits where your eye expects it. Whether it passes near grey
          depends on whether the two hues are opposite in Oklab, not in RGB.
          Blue and yellow are 154° apart there, so the blend misses grey and
          lands on a muted steel blue. Green and magenta are 186° apart and do
          pass close to grey, just a lighter one than sRGB gives.
        </li>
        <li>
          <strong>oklch</strong> is the same space in polar form: lightness,
          chroma, hue. Interpolating there walks around the hue wheel and keeps
          the saturation up. Blue to yellow stays vivid, but it gets there
          through cyan and green. Most of those in-between colours are outside
          what an sRGB screen can show, so the browser clips them.
        </li>
      </ul>
      <p>
        Clipping isn’t graceful. A clipped colour shifts in hue and lightness,
        and where the path comes back inside the gamut you get a hard seam: the
        sharp edge in the green on the blue → yellow oklch row below. The fixes
        are to lower the endpoints’ chroma until the whole path fits, or to add
        a mid stop you picked yourself inside sRGB. A mid stop leaves a soft
        corner of its own, but that’s the smaller problem.
      </p>
      <p>
        oklch also has to choose a direction round the hue wheel. By default it
        takes the shorter arc. <code>longer hue</code> takes the other one, and{" "}
        <code>increasing hue</code> or <code>decreasing hue</code> fix the
        direction outright:
      </p>
      <Code label="CSS">{`
background: linear-gradient(to right in oklch longer hue, blue, yellow);
background: linear-gradient(to right in oklch decreasing hue, blue, yellow);
`}</Code>
      <p>
        Green and magenta are 186° apart, which puts them on the knife edge: the
        short way is only 12° shorter than the long way, and nudging either
        colour a few degrees flips which one counts as shorter. For pairs near
        180°, I name the direction.
      </p>
      <p>
        Each row below uses the same two endpoints with no extra stops. Only
        the interpolation space changes, and the oklch row has a switch for the
        hue direction. The small square at the end of each row is the exact
        midpoint, computed with <code>color-mix()</code> in the same space:
      </p>
      <Code label="gradient-demos.module.css">{`
.oklch {
  background: linear-gradient(to right in oklch, var(--from), var(--to));
}
.oklchMid {
  background: color-mix(in oklch, var(--from), var(--to));
}
`}</Code>
      <Demo caption="Switch between three pairs, and between the shorter and longer hue on the oklch row. Blue → yellow shows the sRGB grey and the clipping seam; green → magenta shows how far oklch can detour.">
        <GradientColorSpaces />
      </Demo>
      <p>
        How I choose now: oklab when the two colours are related and I want
        the blend to stay between them, oklch when I want saturation and I’m
        happy with the detour. The midpoint swatch is how I check. If it
        surprises me, I add a stop.
      </p>
      <p>
        There’s one case where that check misses: oklch with white, black or a
        grey as a stop. Those have no hue (the spec calls it powerless), so the
        hue should come from the other stop. <code>color-mix()</code> does
        that. Chrome’s gradients don’t: in oklch, <code>#fff</code> →{" "}
        <code>#f00</code> renders <code>rgb(241 182 89)</code> at the middle,
        an orange detour, while <code>color-mix()</code> gives{" "}
        <code>rgb(255 161 145)</code>, a pink. I’ve only measured this in
        Chrome. For a fade to a neutral I use oklab, where there’s no hue to
        get wrong.
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
        gradient images as not interpolable, so it swaps them in one step.
        There are two ways round it. The first is to animate the values the
        gradient reads instead of the gradient. Register a custom property
        with <code>@property</code> and it gets a type, so the browser can
        transition it, and the gradient redraws at every step:
      </p>
      <Code label="CSS">{`
@property --from {
  syntax: "<color>";
  inherits: false;
  initial-value: #6366f1;
}

.card {
  background: linear-gradient(135deg, var(--from), #ef4444);
  transition: --from 300ms;
}
.card:hover { --from: #22c55e; }
`}</Code>
      <p>
        The swatches in the first demo use this. <code>--pointer-x</code> and{" "}
        <code>--pointer-y</code> are registered as numbers, so when the pointer
        leaves or you press an arrow key they ease to the new position instead
        of jumping. While the pointer is over a swatch there’s no transition,
        so it tracks one to one.
      </p>
      <p>
        The second way is to animate where the gradient sits. Make the tile
        twice as wide as the box, let it repeat, and slide it by exactly one
        tile:
      </p>
      <Code label="gradient-demos.module.css">{`
.animatedGradient {
  background-image: linear-gradient(
    90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b
  );
  background-size: 200% 100%;
  animation: gradientSlide 12s linear infinite;
}
@keyframes gradientSlide { to { background-position: 200% 0; } }
`}</Code>
      <p>
        The gradient starts and ends on the same colour, and a position of
        200% on a 200%-wide tile is exactly one tile, so the last frame
        matches the first and the loop never jumps. Earlier versions ran back
        and forth, which always looks like it’s breathing rather than flowing.
      </p>
      <Demo loop caption="12 seconds per loop. With reduced motion on, it shows one still frame.">
        <AnimatedGradient />
      </Demo>
      <p>
        The cost: moving a background repaints the element every frame. It
        isn’t a compositor animation. On a card this size that’s nothing. On a
        full-screen hero, I’d check the frame rate on a cheap laptop first.
      </p>

      <h2>A rotating border with @property</h2>
      <p>
        The same registration turns a conic gradient into a spinning border.
        It’s one element: a transparent 2px border, and two background layers.
        The card colour is clipped to the padding box, and the conic gradient
        fills the border box, so it only shows through the border. The card
        colour is written as a one-colour gradient because{" "}
        <code>background-color</code> can’t take its own clip box.
      </p>
      <Code label="gradient-demos.module.css">{`
@property --angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

.borderCard {
  border: 2px solid transparent;
  border-radius: 14px;
  background:
    linear-gradient(rgb(var(--background-raised)), rgb(var(--background-raised))) padding-box,
    conic-gradient(from var(--angle), #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b) border-box;
  animation: spinAngle 4s linear infinite;
}
@keyframes spinAngle { to { --angle: 360deg; } }
`}</Code>
      <p>
        <code>@property</code> has worked in every major browser since
        mid-2024. Without it, <code>--angle</code> has no type and no starting
        value. For the first half of each loop <code>var(--angle)</code> is
        empty, so the whole <code>background</code> is invalid and the card
        loses its border and its fill. Halfway through, it flips to{" "}
        <code>360deg</code> and sits still.
      </p>
      <Demo loop caption="One element: a transparent 2px border with the conic gradient painted under it.">
        <AnimatedBorderGradient />
      </Demo>
      <p>
        This keeps the real <code>border-radius</code>.{" "}
        <code>border-image</code> takes a gradient directly, but it ignores{" "}
        <code>border-radius</code>, so the corners come out square. If the card
        needs to be see-through inside, there’s no opaque layer to cover the
        middle of the gradient. Then the gradient goes on a pseudo-element, and{" "}
        <code>mask-composite: exclude</code> cuts the middle out.
      </p>
      <p>
        It also repaints every frame. The alternative, a rotating{" "}
        <code>::before</code> behind the card, uses <code>transform</code> and
        stays on the compositor, but the pseudo-element has to be an oversized
        square so its corners still cover the card as it turns, and the card
        needs <code>overflow: hidden</code> to clip it. For one small card I
        take the simpler CSS.
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

      <h2>Smaller things I check</h2>
      <p>
        If a gradient is built on a brand colour, derive the other stops from
        that one token instead of picking them, so changing the token moves the
        whole gradient. <code>color-mix()</code> does it, and so does relative
        colour syntax, which lets you edit one channel. Here it lightens and
        pulls chroma back, because a lighter colour at the same chroma can
        easily leave sRGB:
      </p>
      <Code label="CSS">{`
background: linear-gradient(
  in oklab, var(--brand), color-mix(in oklab, var(--brand), white 30%)
);
background: linear-gradient(
  in oklch, var(--brand), oklch(from var(--brand) calc(l + 0.15) calc(c * 0.6) h)
);
`}</Code>
      <p>
        Big, subtle gradients band: 8 bits per channel don’t have enough
        values across a dark, low-contrast range, and you see steps. A faint
        noise layer, like the grain tile above, dithers them away. Separately,
        a plain two-stop ramp starts and stops abruptly, which reads as a line
        at each end; a few extra stops following an easing curve soften that.
      </p>
      <p>
        Text on a gradient has no single background colour, so there’s no
        single contrast number. Measure the text against the lightest and the
        darkest point that sits under it. Both have to pass.
      </p>

      <h2>What changed my mind</h2>
      <p>
        I used to think of gradients as decoration you get right by eye.
        Picking the colour space and checking the midpoint turned it into
        something I can reason about. It’s one keyword and a{" "}
        <code>color-mix()</code> to check it. I’m still not sure oklch is
        always the right default for UI. It can be too vivid for subtle
        surfaces. But I now choose the space deliberately instead of taking
        whatever default the stop syntax happens to imply.
      </p>
    </>
  );
}
