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
        At KovaaK’s, the mouse is the product. A gaming mouse reports its
        position a thousand times a second or more, and players can feel the
        difference when something in that chain slips. So I have strong
        opinions about cursors.
      </p>
      <p>
        The browser is much coarser. It usually hands you about one{" "}
        <code>pointermove</code> per display frame and folds the rest together
        (<code>getCoalescedEvents()</code> gives you the in-between points if
        you need them, as a drawing app does). Even so, that’s a continuous
        stream of position you can design with, and most interfaces reduce it
        to a single bit: hovering or not.
      </p>
      <p>
        The catch is that plenty of visitors have no cursor at all. So every
        demo here answers three questions: what does it do with a mouse, with
        a finger, and with a keyboard?
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
        The performance lesson is where the positions come from. The first
        version called <code>getBoundingClientRect()</code> on every one of
        120 pills on every move, about 240 layout reads per event. Now each
        pill caches its centre once, and again on resize, using{" "}
        <code>offsetLeft</code> and <code>offsetTop</code>, which ignore the
        pill’s own rotation. Per move, the only DOM read is the container’s
        rect. Everything else is arithmetic.
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

      <h2>A card that knows where you came from</h2>
      <p>
        Hover the card and a panel slides in from the edge you crossed. Leave,
        and it slides out the way you left. The edge detection is one small
        function:
      </p>
      <Code label="card-hover.tsx">{`
function nearestEdge(rect: DOMRect, clientX: number, clientY: number) {
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const distances = [["top", y], ["right", rect.width - x],
                     ["bottom", rect.height - y], ["left", x]];
  return distances.reduce((a, b) => (b[1] < a[1] ? b : a))[0];
}
`}</Code>
      <p>
        The same function handles leaving. By the time{" "}
        <code>pointerleave</code> fires, the pointer is just outside the card,
        so the edge it crossed has a negative distance and wins. The other
        trick is switching entry edges: if the panel last left through the
        right, it gets moved to the new edge with transitions off before
        sliding in. Otherwise it would sweep across the whole card from the
        old side.
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
        any of this.
      </p>

      <h2>A marquee you can stop</h2>
      <p>
        An infinite ticker is one CSS animation: render the list twice and
        slide the track by exactly half its width, <code>translateX(-50%)</code>.
        When the first copy has scrolled off, the second is exactly where the
        first started, and the loop restarts invisibly.
      </p>
      <p>
        The first version of this post called “pause on hover” an
        accessibility win. It isn’t enough. Anything that moves on its own for
        more than five seconds needs a way to pause it, and hover doesn’t exist
        on touch or for keyboard users. So there’s a real pause button now.
        Hover still pauses on devices that can hover, and with reduced motion
        on, the ticker becomes a still, wrapped list.
      </p>
      <Demo caption="The button pauses and resumes it for everyone. Screen readers read each item once; the duplicate copy is hidden from them.">
        <Marquee />
      </Demo>

      <h2>Two buttons that react</h2>
      <p>
        These are the most decorative things on the page, so they get the
        strictest check: they must still behave like plain buttons.
      </p>
      <p>
        The sparkles button bursts twelve particles outward from the point you
        clicked, each at its own angle and distance. A keyboard “click” has no
        coordinates (they come through as 0,0, the corner of the window), so
        when <code>event.detail</code> is 0, the burst comes from the centre of
        the button instead.
      </p>
      <Demo caption="Click, tap, or press Enter. With reduced motion on, there are no particles.">
        <SparklesButton>Sparkle</SparklesButton>
      </Demo>
      <p>
        The orbit button has three dashed outlines moving around it: plain CSS
        keyframes on <code>stroke-dashoffset</code>, 3 seconds a lap. On hover
        or keyboard focus they speed up to 2.5×. The animations aren’t
        restarted at a new speed. Their playback rate is eased over 600ms, and
        changing <code>playbackRate</code> keeps each animation’s current
        position, so the dashes accelerate from where they are:
      </p>
      <Code label="outline-orbit-button.tsx">{`
const rings = el.getAnimations({ subtree: true });
// every frame for 600ms, easing from the current rate toward the target
for (const ring of rings) ring.playbackRate = rate;
`}</Code>
      <p>
        The first version ran the loop in JavaScript, which meant it redrew
        every frame forever, even scrolled out of view, and nothing but the
        OS setting could stop it. As CSS it pauses off-screen, and like every
        looping demo on this site, it has a pause button.
      </p>
      <Demo loop caption="Hover or focus it to speed the orbit up. With reduced motion on, the rings stay still.">
        <OrbitButtonDemo />
      </Demo>

      <h2>The test I use now</h2>
      <p>
        Cursor effects are the part of interface work I enjoy most, and the
        part most likely to be decoration. The check I’ve settled on: unplug
        the mouse. If something becomes unreachable, or a demo just sits
        there looking broken, the effect was covering for a missing design,
        not adding to one. Most of these needed changes to pass that test.
      </p>
    </>
  );
}
