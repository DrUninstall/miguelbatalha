import { SwipeCarousel } from "@/components/swipe-carousel";
import { PasswordStrength } from "@/components/password-strength";
import { SignInDialog } from "@/components/sign-in-dialog";
import { MorphingPill } from "@/components/morphing-pill";
import { Code, Demo } from "../_components/demo";

export default function SpringsAndGestures() {
  return (
    <>
      <p>
        A CSS transition takes a duration: <code>300ms ease-out</code>, however
        the element got there. Flick a card hard or nudge it gently, and it
        settles in exactly 300ms either way. The animation has no idea how you
        let go.
      </p>
      <p>
        A spring does. That’s the whole case for springs, and it’s narrower
        than “they feel more natural”. They matter when the user’s input has
        speed, and the animation should keep it.
      </p>

      <h2>Three numbers, one that matters</h2>
      <p>
        I studied audio before I worked on games, and a UI spring is an old
        friend from there: a damped oscillator, the same maths as a plucked
        string dying out. It has stiffness (how hard it pulls toward the
        target), mass (how heavy the thing is) and damping (how much energy it
        loses). The number that describes the feel combines all three:
      </p>
      <Code label="damping ratio">{`
ζ = damping / (2 · √(stiffness · mass))

ζ ≥ 1   settles without overshooting
ζ < 1   overshoots, then settles; lower means more bounce
`}</Code>
      <p>
        Framer Motion also accepts <code>{"{ duration, bounce }"}</code>. It’s
        the same spring described differently, and easier to reason about when
        you need something to finish in roughly 400ms. I use both below. What
        matters is being deliberate about ζ.
      </p>

      <h2>A carousel that keeps your fling</h2>
      <p>
        Drag the track and let go. It commits to the next card if you dragged
        more than 50px or released faster than 500px/s; otherwise it springs
        back. Either way, the release velocity goes into the spring:
      </p>
      <Code label="swipe-carousel.tsx">{`
// ζ = 22 / (2 · √300) ≈ 0.64
const SPRING = { type: "spring", stiffness: 300, damping: 22, mass: 1 };

// on release, and on every button or arrow-key move (velocity 0)
animate(x, target, { ...SPRING, velocity });
`}</Code>
      <p>
        From rest, this spring overshoots by about 7.6% of the distance,
        roughly 22px on a full card step. A hard fling arrives with more
        energy and swings further. That small overshoot is what makes it read
        as something you threw rather than something that moved on its own. I
        also turned off Framer’s built-in drag momentum, so it doesn’t compete
        with this spring.
      </p>
      <Demo caption="Drag or swipe the cards. Prev/Next, the dots and the arrow keys work too.">
        <SwipeCarousel />
      </Demo>
      <p>
        The cards scale down to 0.92 and fade to 50% as they move away from
        the centre, both computed from the track’s position rather than
        animated separately, so they can never get out of sync with your
        finger. For keyboard and screen reader users it’s a labelled
        carousel: arrows move between cards and a live region announces
        “Card 2 of 5”.
      </p>

      <h2>A meter that reacts</h2>
      <p>
        The strength bar is one element scaled horizontally to the share of
        rules met (0, 0.25, 0.5, 0.75, 1) with a spring at ζ ≈ 0.63. Each time
        you satisfy a new rule, it jumps forward a little too far and settles.
        Break a rule and it pulls back the same way. It’s a small thing, but
        it makes the meter feel like it’s reacting to your typing rather than
        being recalculated.
      </p>
      <p>
        Each rule’s check mark pops in with a much bouncier spring, ζ ≈ 0.34,
        peaking around 120%. I only allow that much bounce for moments of
        success. An X coming back doesn’t pop at all.
      </p>
      <Demo caption="Type a password. The strength label and each rule are announced to screen readers.">
        <PasswordStrength />
      </Demo>
      <p>
        The colours took longer than the motion. The original amber “Fair”
        label was about 1.8:1 against white, which is unreadable. Each level
        now has its own colour for light and dark mode, and all of them clear
        4.5:1.
      </p>

      <h2>A dialog that fits its content</h2>
      <p>
        The sign-in dialog changes height at every step: a form, a code entry
        screen, a waiting screen, a success state. A ResizeObserver measures
        the current step, and the wrapper animates to that height with a
        spring that has no bounce:
      </p>
      <Code label="sign-in-dialog.tsx">{`
<motion.div
  animate={{ height: bounds.height || "auto" }}
  transition={{ type: "spring", duration: 0.4, bounce: 0 }}
>
`}</Code>
      <p>
        No bounce, because a dialog is a container. You want it to fit the
        content, not wobble around it. And yes, this animates{" "}
        <code>height</code>, a layout property. It’s one element for 400ms,
        and the alternatives are much more complicated. That trade is fine.
      </p>
      <Demo caption="Open it and walk through a flow. Every path ends in a success state; Escape or Done closes it.">
        <SignInDialog />
      </Demo>
      <p>Two bugs from the first version, both worth knowing about:</p>
      <ul>
        <li>
          <strong>It opened off-centre.</strong> The dialog centred itself with{" "}
          <code>translate(-50%, -50%)</code> while Framer animated its scale.
          Framer writes the whole <code>transform</code> inline, so the
          centring disappeared and the top-left corner landed in the middle of
          the screen. Now a full-screen grid does the centring and Framer owns
          the transform.
        </li>
        <li>
          <strong>It could measure itself too small.</strong> The measure
          hook used <code>getBoundingClientRect()</code>, which returns the
          size after transforms. The dialog scales in from 0.95, so a
          measurement taken during the entrance comes back 5% short and clips
          the content. The hook now reads the ResizeObserver’s{" "}
          <code>borderBoxSize</code>, which ignores transforms. It also used to
          start at a hardcoded 420px.
        </li>
      </ul>
      <p>
        The rest is the usual dialog work: focus moves into each new step and
        is trapped inside while it’s open, every label is tied to its input,
        and closing returns focus to the button that opened it.
      </p>

      <h2>A pill that changes shape</h2>
      <p>
        Last, a small take on Apple’s Dynamic Island. The pill has the{" "}
        <code>layout</code> prop and a spring at ζ ≈ 0.78, so it resizes to
        whatever it contains with about 2% overshoot. Enough to feel like it
        has some weight, not enough to look like a toy.
      </p>
      <Demo caption="Switch between states. With reduced motion on, the pill jumps to its new size and the music bars hold still.">
        <MorphingPill />
      </Demo>
      <p>
        The content uses <code>AnimatePresence</code> with{" "}
        <code>{`mode="popLayout"`}</code>, which takes the outgoing content out of
        the layout immediately. The pill springs to the new size while the old
        content fades out on top, instead of waiting for it. The equaliser
        bars animate <code>scaleY</code> from the bottom, not{" "}
        <code>height</code>, since they loop forever.
      </p>

      <h2>How I pick the numbers</h2>
      <p>
        Honestly, by feel, then I write down the ratio so I can be consistent.
        My rough rules: ζ = 1 (no overshoot) for things that contain or
        indicate, like dialogs, tab highlights and progress. Around 0.6–0.8
        for things you throw or that change shape. Below 0.5 only for small
        celebratory moments. I haven’t found a formula that beats trying it,
        but having the ratio written down stops every component inventing its
        own.
      </p>
    </>
  );
}
