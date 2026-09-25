import { CoinFlip } from "@/components/coin-flip";
import { OrbitAnimation } from "@/components/orbit-animation";
import { TextReveal } from "@/components/text-reveal";
import { HoldToDelete } from "@/components/hold-to-delete";
import { Code, Demo } from "../_components/demo";

export default function MotionFoundations() {
  return (
    <>
      <p>
        “Only animate <code>transform</code> and <code>opacity</code>.” It’s the
        first rule anyone learns about web animation, and it’s a good one. It’s
        also incomplete. The useful skill is knowing what you pay when you break
        it, and when that price is fine.
      </p>
      <p>
        I spend most of my time on an aim trainer, where a dropped frame is
        something players notice and complain about. That makes you care about
        where the work happens.
      </p>

      <h2>What the rule is actually about</h2>
      <p>
        Every frame, the browser can run up to four stages: style, layout,
        paint, composite. Change <code>width</code> and it redoes layout for
        that element and everything it pushes around, then paints, then
        composites. Change <code>background-color</code> and it skips layout
        but repaints. Change <code>transform</code> or <code>opacity</code> on
        an element that has its own layer, and it only composites: the GPU
        moves or fades a texture it already has.
      </p>
      <p>
        That last condition matters. Browsers give an element its own layer
        when a CSS animation or transition on <code>transform</code> or{" "}
        <code>opacity</code> starts. <code>will-change</code> asks for that
        layer ahead of time, which can save a hitch on the first frame. Layers
        cost GPU memory, though, so add the hint before the animation and take
        it off after.
      </p>
      <Code label="CSS">{`
.drawer { transition: transform 300ms ease-out; }
.drawer.is-about-to-open { will-change: transform; }
`}</Code>
      <p>
        I originally built a side-by-side demo for this: two balls, one with{" "}
        <code>will-change</code>, one without. They looked identical, because
        the browser already promotes an element for a transform transition. So
        now it’s a paragraph. The hint only matters in narrower cases than most
        articles suggest.
      </p>

      <h2>A coin with real depth</h2>
      <p>
        CSS 3D is still just transforms, so it stays on the cheap path. Three
        properties do the work: <code>perspective</code> on the parent sets how
        far away the viewer is, <code>transform-style: preserve-3d</code> keeps
        the children in the same 3D space, and{" "}
        <code>backface-visibility: hidden</code> hides each face when it turns
        away.
      </p>
      <Code label="coin-flip.module.css">{`
.scene { perspective: 400px; }

.coin {
  transform-style: preserve-3d;
  transform: rotateY(var(--rotation, 0deg));
  transition: transform 600ms cubic-bezier(0.34, 1.4, 0.64, 1);
}

.tails { transform: rotateY(180deg) translateZ(3px); }
`}</Code>
      <p>
        Two details make it feel right. The easing curve goes past 1, so the
        coin swings a few degrees beyond the face and settles back. And the
        component stores a flip count rather than a boolean, so the rotation
        keeps growing (0, 180, 360…) and the coin always turns the same way
        instead of unwinding every other click. Six thin discs stacked on the Z
        axis give it an edge you can see mid-flip.
      </p>
      <Demo caption="Click or tap the coin, or focus it and press Space.">
        <CoinFlip />
      </Demo>
      <p>
        Without <code>preserve-3d</code>, the browser flattens each child into
        its parent’s plane, and you get a coin that squashes to a line and back.
        It’s the most common reason a CSS flip “doesn’t work”.
      </p>

      <h2>An orbit that sorts its own depth</h2>
      <p>
        The moon here is one element with one keyframe animation. The
        transform chain reads left to right: tilt the orbital plane, rotate
        around it, step out to the radius, then undo the rotation and the tilt
        so the moon keeps facing you.
      </p>
      <Code label="orbit-animation.module.css">{`
@keyframes orbit {
  to {
    transform: rotateZ(var(--tilt-z)) rotateX(var(--tilt-x))
      rotateY(360deg) translateZ(var(--radius))
      rotateY(-360deg)
      rotateX(calc(var(--tilt-x) * -1)) rotateZ(calc(var(--tilt-z) * -1));
  }
}
`}</Code>
      <p>
        Because the planet, the ring and the moon share one 3D context, the
        browser sorts them by depth. The moon passes in front of the planet and
        disappears behind it with no z-index juggling.
      </p>
      <Demo loop caption="One element, one 6-second linear loop. With reduced motion on, it holds a still pose.">
        <OrbitAnimation />
      </Demo>
      <p>
        The first version had a bug that’s easy to miss: all the positioning
        lived inside the keyframes. Turn animation off and the moon lost its
        offset and sat in the middle of the planet. Now the element has a base
        transform of its own, a pose with the moon just in front of the planet.
        If motion is optional, the still frame is part of the design.
      </p>

      <h2>Staggered text</h2>
      <p>
        Each letter rises from one line below into place. The mask is just{" "}
        <code>overflow: hidden</code> on the word, and the stagger is a 30ms
        delay per letter.
      </p>
      <Code label="text-reveal.module.css">{`
.letter {
  display: inline-block;
  animation: reveal 1.3s cubic-bezier(0.19, 1, 0.22, 1) backwards;
  animation-delay: calc(30ms * var(--index));
}
`}</Code>
      <p>
        <code>backwards</code> keeps each letter hidden during its delay. Keep
        the delay short enough and the eye reads one motion instead of ten
        little ones. For “Animations”, the last letter starts at 270ms.
      </p>
      <Demo caption="Plays once on load. Replay restarts it by remounting the paragraph.">
        <TextReveal />
      </Demo>
      <p>
        Two things I got wrong at first. Splitting a word into spans makes some
        screen readers spell it out, so the letters are{" "}
        <code>aria-hidden</code> and the real word sits in visually hidden text.
        And the site’s reduced-motion rule shortens durations but not delays,
        so the letters still popped in one by one. This component turns the
        animation off entirely in that case.
      </p>

      <h2>The exception: hold to delete</h2>
      <p>
        Here’s where I break the rule on purpose. A red layer wipes across the
        button while you hold it, and that wipe is a <code>clip-path</code>{" "}
        transition. That usually means a repaint every frame. The area is one
        small button for 1.5 seconds, and the wipe <em>is</em> the progress
        bar, so I’m fine paying for it.
      </p>
      <p>
        The important part isn’t the animation. The wipe is only a picture; a
        timer decides when the hold succeeds:
      </p>
      <Code label="hold-to-delete.tsx">{`
const startHold = () => {
  setState("holding");
  timer.current = setTimeout(() => setState("done"), HOLD_MS);
};
// pointerup, pointerleave, blur, or keyup → clearTimeout + back to idle
`}</Code>
      <p>
        That split pays off with reduced motion. The site collapses transition
        durations, so if the animation were the source of truth, the hold would
        finish instantly. Instead the timer still takes 1.5 seconds, the label
        switches to “Keep holding…”, and the wipe keeps running at the same
        linear speed. It’s a progress bar moving inside a button, not
        something travelling across the screen, and without it you’d have no
        idea how much longer to hold. My first version turned it off and
        filled the button instantly, which removed exactly that information.
      </p>
      <Demo caption="Press and hold with a mouse, finger, Space or Enter. Letting go early cancels.">
        <HoldToDelete />
      </Demo>
      <p>
        The wipe runs at constant speed (<code>linear</code>) while you hold,
        so its edge is honest progress. Letting go snaps back in 200ms with an
        ease-out. On touch, the button blocks the long-press menu and text
        selection, which would otherwise fire right as the hold completes.
      </p>
      <p>
        One problem I haven’t solved: screen reader users in browse mode
        activate buttons with a single synthetic click, so they can’t hold at
        all. The likely answer is a second confirmation path for that case,
        not a shorter hold. I haven’t built it yet.
      </p>

      <h2>What I check now</h2>
      <p>
        I don’t treat the rule as a law anymore. I ask three questions: which
        stage am I paying for (layout, paint, or just composite), how much of
        the screen does it cover, and how long does it run. A full-width{" "}
        <code>height</code> animation on every scroll is a real problem. A
        1.5-second <code>clip-path</code> on one button isn’t. The rule gets
        you most of the way, and those three questions cover the rest.
      </p>
    </>
  );
}
