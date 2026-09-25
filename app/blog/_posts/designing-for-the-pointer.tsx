import { MouseFollowPattern } from "@/components/mouse-follow-pattern";
import { MagnifiedDock } from "@/components/magnified-dock";
import { CardHover } from "@/components/card-hover";
import { Marquee } from "@/components/marquee";
import { SparklesButton } from "@/components/sparkles-button";
import { OrbitButtonDemo } from "./designing-for-the-pointer.demos";
import { Code, Demo } from "../_components/demo";

export default function DesigningForThePointer() {
  return (
    <>
      <p>
        At KovaaK’s, the mouse is the product. A gaming mouse reports how far
        it moved, a thousand times a second or more. It doesn’t know where the
        cursor is: the OS adds those counts up into a position, usually with
        acceleration on top, unless the game reads raw input and skips that
        step. Players can feel it when anything in that chain slips. So I have
        strong opinions about cursors.
      </p>
      <p>
        The browser is much coarser. It usually hands you about one{" "}
        <code>pointermove</code> per display frame and folds the rest together
        (<code>getCoalescedEvents()</code> gives you the in-between points if
        you need them, as a drawing app does). Chromium also has{" "}
        <code>pointerrawupdate</code>, which fires at the device’s rate instead
        of the display’s. A game might want that. An interface can’t draw
        faster than the screen refreshes, so one event per frame is all it can
        use. Even so, that’s a continuous stream of position you can design
        with, and most interfaces reduce it to a single bit: hovering or not.
      </p>
      <p>
        The catch is that plenty of visitors have no cursor at all. So every
        demo here answers three questions: what does it do with a mouse, with
        a finger, and with a keyboard?
      </p>
      <p>
        They answer it per event, not per device. <code>@media (hover: hover)
        and (pointer: fine)</code> describes the device’s primary pointer,
        which is the right question for styling: should hover styles exist
        here at all? <code>event.pointerType</code> describes the pointer behind
        this particular event, which is the right question for behaviour. A
        touchscreen laptop has a trackpad and a finger, and it’ll send you
        both, sometimes a second apart.
      </p>

      <h2>A field that follows you</h2>
      <p>
        A grid of small pills. Within 100px of the pointer, each one turns to
        point at it (<code>atan2</code> of the offset). Brightness falls off
        over 150px with a smoothstep curve, which has no slope at either end,
        so the spotlight has no visible edge:
      </p>
      <Code label="mouse-follow-pattern.tsx">{`
function smoothstep(t: number) {
  const c = Math.min(Math.max(t, 0), 1);
  return c * c * (3 - 2 * c);
}

const opacity = 0.2 + 0.8 * smoothstep(1 - distance / 150);
`}</Code>
      <p>
        The performance lesson is where the positions come from, and I first
        got it wrong. The first version called{" "}
        <code>getBoundingClientRect()</code> on every one of 120 pills on every
        move, and I blamed those reads. They were cheaper than I thought.
        Framer Motion writes its styles in a <code>requestAnimationFrame</code>,
        so when my handler ran, the layout was clean, and reading a clean
        layout is cheap. Reads get expensive when they follow a style write in
        the same frame, because the browser has to recompute layout on the spot
        to answer. The real problem was that the handler’s cost grew with the
        number of pills. Now each pill caches its centre on mount and on resize
        (<code>offsetLeft</code> and <code>offsetTop</code>, which ignore
        transforms), and a move costs one read of the container’s rect plus
        arithmetic, however many pills there are.
      </p>
      <Demo caption="Move the pointer over the grid. On touch, press and drag sideways; vertical swipes still scroll the page.">
        <MouseFollowPattern />
      </Demo>
      <p>
        On touch, it follows your finger only while you’re pressing. The demo
        uses <code>touch-action: pan-y</code> rather than <code>none</code>,
        so a vertical swipe still scrolls the page instead of getting trapped
        by a decoration.
      </p>

      <h2>A dock that magnifies</h2>
      <p>
        The macOS dock effect. Each icon’s scale depends on its distance from
        the pointer along the dock, through a raised-cosine bell: 2.25× right
        under the pointer, fading smoothly to 1× at 110px.
      </p>
      <Code label="magnified-dock.tsx">{`
function bell(d: number, radius: number) {
  if (Math.abs(d) >= radius) return 0;
  return (1 + Math.cos((Math.PI * d) / radius)) / 2;
}

const scale = 1 + 1.25 * bell(distance, 110);
`}</Code>
      <p>
        My first version used a straight-line falloff. The shape of the curve
        matters more than I expected: a straight line has a corner at the
        edge of the effect, and you can see icons “switch on” as the pointer
        reaches them. The bell doesn’t. Growing icons also push their
        neighbours outward with a <code>translateX</code>, so nothing
        overlaps, and every scale and offset goes through a spring.
      </p>
      <Demo caption="Move across the dock, drag a finger along it, or Tab through the icons: keyboard focus magnifies too.">
        <MagnifiedDock />
      </Demo>
      <p>
        Two things that aren’t in most dock tutorials. Tabbing to an icon moves
        the magnification there, as if the pointer were over it, so the effect
        isn’t mouse-only. And on a narrow screen, the whole dock scales down so
        eight icons fit on a phone. That sizing lives in CSS, not JavaScript:
        the dock is a size container and each icon is{" "}
        <code>min(40px, 8cqi)</code>. My first version measured the width in
        JavaScript, which meant the server rendered a full-size dock and it
        visibly shrank a moment later. The grid above works the same way now,
        with <code>repeat(auto-fill, 4px)</code> deciding how many columns fit.
      </p>
      <p>
        What I left out the first time is the part I should know best from
        aim training: Fitts’s law. Magnification changes what you see, not what
        you can hit. The icons move as the pointer moves, so the stretch of
        pointer positions that lands on a given icon is about 48px wide, barely
        more than the 40px icon at rest. And because growing icons push their
        neighbours outward, the icon you’re aiming at slides away as you
        approach it. With the pointer 34px left of where Photos sits at rest,
        the magnified Photos is centred 58px away. In aim-trainer terms,
        that’s a target that moves while you flick to it. I suspect that’s why
        macOS ships with Dock magnification off. It’s delight, not ergonomics.
      </p>
      <p>
        The version I first published made that worse with dead strips. The
        gaps between icons and the padding under them are part of the dock, so
        the magnification stays on there, but they aren’t part of any button:
        the tooltip blinked off between icons and a click did nothing. Each
        icon now has an invisible <code>::before</code> that reaches half a gap
        to each side and down through the padding. The catch is that it scales
        with the icon, and at 2× it would reach over its neighbours, so its
        insets are divided by the icon’s current scale. Now the icons’ targets
        meet with no gaps, and each one is its 52px slot (at full size),
        exactly what it would be without any magnification.
      </p>

      <h2>A card that knows where you came from</h2>
      <p>
        Hover the card and a panel slides in from the edge you crossed. Leave,
        and it slides out the way you left.
      </p>
      <p>
        My first version picked the edge nearest to where the pointer entered.
        That works until you flick in near a corner. The browser only tells you
        where the pointer is once it has already moved, and a fast pointer
        coming in through the top, close to the corner, can land nearer the
        right edge than the top. Direction of travel is the better signal.{" "}
        <code>pointerenter</code> doesn’t carry any (in Chrome, its{" "}
        <code>movementX</code> and <code>movementY</code> are 0), but the{" "}
        <code>pointermove</code> the browser sends straight after it does. Step
        back from the entry point along that movement, and the first edge you
        hit is the one you came through:
      </p>
      <Code label="card-hover.tsx">{`
type Edge = "top" | "right" | "bottom" | "left";

function edgeAlong(rect: DOMRect, x: number, y: number, dx: number, dy: number): Edge | null {
  const left = x - rect.left;
  const top = y - rect.top;
  const hits: [Edge, number][] = [];
  if (dy < 0) hits.push(["top", top / -dy]);
  if (dx > 0) hits.push(["right", (rect.width - left) / dx]);
  if (dy > 0) hits.push(["bottom", (rect.height - top) / dy]);
  if (dx < 0) hits.push(["left", left / -dx]);
  if (hits.length === 0) return null;
  return hits.reduce((a, b) => (b[1] < a[1] ? b : a))[0];
}

// entering: step back along the movement
edgeAlong(rect, e.clientX, e.clientY, -e.movementX, -e.movementY);
`}</Code>
      <p>
        Leaving works the same way, going forward from the last point seen
        inside the card. The nearest edge is still there, as the fallback for
        when there’s no movement at all. The other trick is switching entry
        edges: if the panel last left through the right, it gets moved to the
        new edge with transitions off before sliding in. Otherwise it would
        sweep across the whole card from the old side.
      </p>
      <Demo caption="Enter from different sides with a mouse. On touch, tap to toggle; with a keyboard, focus the card.">
        <CardHover
          title="CSS Gradients, Revisited"
          subtitle="Colour-space interpolation, animated borders with @property, and layered backgrounds."
        />
      </Demo>
      <p>
        Without a pointer, there’s no edge to come from, so touch and
        keyboard both reveal from the bottom. The panel’s text is always in
        the page, just moved out of view, so screen readers get it without
        any of this. In a grid of these cards, I’d also add a short dwell,
        around 100ms, before revealing, so a pointer crossing the grid doesn’t
        set off every card it passes.
      </p>

      <h2>A marquee you can stop</h2>
      <p>
        An infinite ticker is one CSS animation: render the list twice and
        slide the track by exactly half its width, <code>translateX(-50%)</code>.
        When the first copy has scrolled off, the second is exactly where the
        first started, and the loop restarts invisibly. That holds only if one
        copy is at least as wide as the strip. With a short list on a wide
        screen, the track runs out before the loop restarts and you see the
        gap. So the component measures both, and repeats the list inside each
        half when one copy is too narrow.
      </p>
      <p>
        It also takes its speed in pixels per second and works out the
        duration from the measured width. Linear motion is honest here,
        because a ticker is a rate, so the rate is what you should set. With a
        fixed duration instead, a longer list would scroll faster.
      </p>
      <p>
        The first version of this post called “pause on hover” an
        accessibility win. It isn’t enough. Anything that moves on its own for
        more than five seconds needs a way to pause it, and hover doesn’t exist
        on touch or for keyboard users. So there’s a real pause button now.
        Hover still pauses on devices that can hover, and with reduced motion
        on, the ticker becomes a still, wrapped list.
      </p>
      <Demo caption="The button pauses and resumes it for everyone. Screen readers read each item once; the duplicate copies are hidden from them.">
        <Marquee />
      </Demo>

      <h2>Two buttons that react</h2>
      <p>
        These are the most decorative things on the page, so they get the
        strictest check. They must still work as plain buttons from a keyboard.
        That’s the floor, though. The real question is how often someone sees
        the effect. A burst on a one-off “Join” button is a reward. On
        Save, it’s noise by the tenth click. And a button that orbits all the
        time is a notification that never ends.
      </p>
      <p>
        The sparkles button bursts twelve particles outward from the point you
        clicked, each at its own angle and distance. A keyboard “click” has no
        coordinates (they come through as 0,0, the corner of the window), so
        when <code>event.detail</code> is 0, the burst comes from the centre of
        the button instead. Moving a mouse over it leaves a trail: one sparkle
        per 24px travelled rather than one per event, so it looks the same on a
        60Hz screen and a 144Hz one.
      </p>
      <Demo caption="Click, tap, or press Enter. With reduced motion on, there are no particles.">
        <SparklesButton>Sparkle</SparklesButton>
      </Demo>
      <p>
        The orbit button has three dashed outlines around it. My first version
        kept them orbiting all the time and sped them up on hover, which is
        exactly the never-ending notification. Now they’re still at rest. On
        hover or keyboard focus, they start moving, and when that ends, they
        coast to a stop. The orbit is plain CSS keyframes on{" "}
        <code>stroke-dashoffset</code>, starting paused. JavaScript only plays
        it and eases its playback rate from 0 to 1 over 600ms, and back to 0
        when you leave. Changing <code>playbackRate</code> keeps each
        animation’s current position, so the dashes speed up from where they
        are and stop where they are:
      </p>
      <Code label="outline-orbit-button.tsx">{`
const rings = el.getAnimations({ subtree: true });
for (const ring of rings) ring.play();
// then every frame for 600ms, easing from the current rate toward 1:
for (const ring of rings) ring.playbackRate = rate;
`}</Code>
      <p>
        Two bugs I shipped in the first version. The dashes are 4px on, 4px
        off, and a ring’s perimeter is almost never a multiple of 8, so where
        each path starts there was a dash of the wrong length that never
        moved, a seam. <code>pathLength</code> fixes it: set it to the
        perimeter rounded to a multiple of 8, and the browser stretches the
        dash pattern to fit a whole number of times.
      </p>
      <Code label="outline-orbit-button.tsx">{`
function pillPerimeter({ width, height }: { width: number; height: number }) {
  const diameter = Math.min(width, height);
  return 2 * Math.abs(width - height) + Math.PI * diameter;
}

const pathLength = Math.max(1, Math.round(pillPerimeter(ringSize) / 8)) * 8;
`}</Code>
      <p>
        The other was the dock’s mistake again: the rings were drawn at a
        guessed size until the button was measured, then jumped. Now nothing
        is drawn until the real size is known, and the rings fade in.
      </p>
      <Demo caption="Hover or focus it to start the orbit; leave and it coasts to a stop. With reduced motion on, the rings stay still.">
        <OrbitButtonDemo />
      </Demo>

      <h2>The test I use now</h2>
      <p>
        Cursor effects are the part of interface work I enjoy most, and the
        part most likely to be decoration. The check I’ve settled on: unplug
        the mouse, then pick up a phone. If something becomes unreachable, or
        a demo just sits there looking broken, the effect was covering for a
        missing design, not adding to one. The phone catches what the keyboard
        doesn’t: there’s no hover at all, and every drag has to share the
        screen with scrolling. Most of these needed changes to pass that test.
      </p>
    </>
  );
}
