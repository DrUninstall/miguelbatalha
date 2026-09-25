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
        A spring does. It starts from whatever speed the element already has,
        and that’s most of the case for springs. It’s narrower than “they feel
        more natural”: springs matter when the user’s input has speed the
        animation should keep, and when the target moves while the animation
        is still running.
      </p>

      <h2>Three numbers, two that matter</h2>
      <p>
        I studied audio before I worked on games, and a UI spring is an old
        friend from there: a damped oscillator, the same maths as a plucked
        string dying out. It has stiffness (how hard it pulls toward the
        target), mass (how heavy the thing is) and damping (how much energy it
        loses). Those three combine into two numbers that describe how it
        feels:
      </p>
      <Code label="damping ratio and natural frequency">{`
ζ = damping / (2 · √(stiffness · mass))
ω = √(stiffness / mass)

ζ ≥ 1   from rest, settles without overshooting
ζ < 1   overshoots, then settles; lower means more bounce
`}</Code>
      <p>
        ζ describes the shape of the motion, not its speed. Speed comes from
        ω, the natural frequency. Keep ζ at 1 and go from stiffness 100 to 900
        (damping 20 to 60, so the ratio holds), and ω goes from 10 to 30: the
        same curve, arriving three times as fast. So I think in two numbers:
        how much it overshoots, and how fast it gets there.
      </p>
      <p>
        The “from rest” matters. Give a spring enough speed toward its target
        and even ζ = 1 passes it once: 60px out and moving at 2,500px/s, the
        carousel’s snap spring below goes about 9px past before it comes back.
        Critical damping rules out oscillation, not overshoot.
      </p>
      <p>
        Framer Motion also accepts <code>{"{ duration, bounce }"}</code>, which
        are the same two ideas under other names. <code>bounce</code> is 1 − ζ,
        so <code>bounce: 0</code> is ζ = 1 and <code>bounce: 0.25</code> is
        ζ = 0.75. <code>duration</code> is when it settles, and Framer solves
        for the stiffness that gets there. <code>visualDuration</code> is
        roughly when it looks like it has arrived, with any bounce after that.
        If you also pass stiffness, damping or mass, those win and{" "}
        <code>duration</code> and <code>bounce</code> are ignored. I use both
        styles below.
      </p>

      <h2>A carousel that keeps your fling</h2>
      <p>
        Drag the track and let go. Where it lands depends on where it was
        heading: the release velocity projects a resting point, as if the track
        coasted to a stop like a scroll view, and it snaps to the card nearest
        that point. A slow drag has to cross half a card. A flick needs much
        less, and a flick back toward where you started can undo most of a
        drag. Then the same velocity goes into the spring, so the track leaves
        your finger at the speed it had:
      </p>
      <Code label="swipe-carousel.tsx">{`
// ζ = 22 / (2 · √300) ≈ 0.64: a thrown card overshoots a little
const RELEASE_SPRING = { type: "spring", stiffness: 300, damping: 22, mass: 1 } satisfies Transition;
// ζ = 40 / (2 · √400) = 1: buttons, dots and arrow keys don't
const SNAP_SPRING = { type: "spring", stiffness: 400, damping: 40, mass: 1 } satisfies Transition;

// How far (px) a release coasts if it slows like a scroll view: × 0.99 every millisecond.
function project(velocity: number, rate = 0.99) {
  return ((velocity / 1000) * rate) / (1 - rate);
}

// On release: where would the track stop, in cards? Snap to the nearest one.
const resting = -(x.get() + project(velocity)) / step;
const index = Math.max(0, Math.min(Math.round(resting), lastIndex));
animate(x, -index * step, { ...RELEASE_SPRING, velocity });
`}</Code>
      <p>
        At 0.99, the faster paging rate, a release coasts about a tenth of its
        speed in pixels: 1,000px/s adds roughly 100px. The first version used
        two thresholds instead, 50px of drag or 500px/s, and moved exactly one
        card either way, so a hard fling only meant more wobble. Now it takes a
        fling of around 4,000px/s to carry past a second card. I don’t cap it
        at one; if you throw it that hard, you probably meant it.
      </p>
      <p>
        From rest, the release spring overshoots by about 7.6% of the
        distance, roughly 22px on a full card step, and a harder fling
        overshoots more. That overshoot is what makes it read as something you
        threw. The first version used the same spring for the Next button too,
        so the card wobbled even though nothing had been thrown. Now buttons,
        dots and arrow keys get a critically damped spring and just arrive. I
        also turned off Framer’s built-in drag momentum, so it doesn’t compete
        with either.
      </p>
      <p>
        The edges needed their own case. Pull past the first card and let go,
        and your velocity points out into empty space: handed to the bouncy
        spring, a 1,000px/s release from 15px past the edge carried the track
        on to about 38px before it came back. Now, when the projected resting
        point lies beyond the first or last card, the track settles with the
        critically damped spring and keeps only speed that heads back toward
        the card.
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
        “Card 2 of 6”. The cards are this blog’s own posts.
      </p>

      <h2>A meter that reacts</h2>
      <p>
        Nothing gets thrown in the next three demos, and they still use
        springs. That’s the second reason: interruption. When the target
        changes mid-flight, a spring carries its current velocity into the new
        move. A CSS transition also starts from wherever the element is, but
        from a standstill, so something moving fast stalls and sets off again.
        You type faster than a meter settles, and a dialog can move to its
        next step before its height has finished changing.
      </p>
      <p>
        The bar under the field shows how many of the four rules you’ve met,
        driven by a critically damped spring (ζ = 1). It moves quickly and
        stops exactly on the value. I first gave it some bounce, so it jumped a
        little past each step. It felt lively, but a meter that briefly shows
        more than you have is reporting something false. It also used to
        scale with <code>scaleX</code>, which squashed its rounded end. Now
        the spring drives a motion value that becomes{" "}
        <code>clip-path: inset()</code>, cutting the fill from the right, and
        the end stays round.
      </p>
      <p>
        When a rule is met, its check mark grows from a quarter of its size
        while a little blur clears, on a 0.3s spring with no bounce. It used to
        pop with ζ ≈ 0.34, peaking around 120%. On a 14px icon that can flip
        with every keystroke, that looked like a rendering glitch, not a
        reward. An X coming back doesn’t animate at all.
      </p>
      <Demo caption="Type a password. Screen readers hear the count of rules met as it changes, and the rules as the field’s description.">
        <PasswordStrength />
      </Demo>
      <p>
        The bigger problem wasn’t motion, though. A rules checklist measures
        compliance, not strength. This meter used to label the result from
        Weak to Strong, and <code>Password1!</code> ticks every box, so it
        scored Strong. A four-word passphrase in lowercase scored Fair, and
        only got that far because its spaces counted as special characters.
        So now it says only what it knows: how many of this demo’s rules
        you’ve met. A space no longer counts as a symbol.
      </p>
      <p>
        Current guidance, NIST SP 800-63B, drops composition rules like these
        altogether in favour of a minimum length and a check against lists of
        breached passwords. A meter that actually estimates strength needs an
        estimator such as zxcvbn, which models how passwords get guessed. This
        demo deliberately doesn’t ship one. It’s here for the motion, and it
        shouldn’t pretend to be more.
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
      <p>
        The panel opens the same way. It used to arrive with a little bounce
        while the overlay faded on a separate 0.2s curve, which contradicted
        everything I just said and made one event look like two. Now the
        overlay and the panel share one 0.3s spring with no bounce, and they
        leave together on a 0.24s one, since an exit should be quicker than
        the entrance.
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
          the transform. Centring with the individual CSS{" "}
          <code>translate</code> property would also have worked, since it
          applies on top of whatever <code>transform</code> Framer writes.
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
        and closing returns focus to the button that opened it. The code field
        takes “123 456” pasted from a message, spaces and all, and only checks
        for six digits when you press Verify. One thing I didn’t build: a real
        sign-in rarely needs a passkey tab. Mark the email field{" "}
        <code>{`autocomplete="username webauthn"`}</code>, start a conditional
        WebAuthn request, and the browser offers saved passkeys right in the
        field’s autofill.
      </p>

      <h2>A pill that changes shape</h2>
      <p>
        Last, a small take on Apple’s Dynamic Island. The pill has the{" "}
        <code>layout</code> prop and a spring at ζ ≈ 0.78, so it resizes to
        whatever it contains with about 2% overshoot. Enough to feel like it
        has some weight, not enough to look like a toy. Accept picks the call
        up: the pill shrinks to a running call timer and an End button, and
        focus moves to End. Decline and End put it back to idle and move focus
        to the Idle control.
      </p>
      <Demo
        loop
        caption="Switch between states, and accept the call to start its timer. With reduced motion on, the pill jumps to its new size and the music bars hold still."
      >
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
      <p>
        One trap: the pill’s <code>borderRadius: 50</code> sits in its{" "}
        <code>style</code> prop, not the CSS, and it has to. A layout animation
        resizes the pill with a scale transform, and Framer only corrects the
        corners for a radius it controls. Move it to the stylesheet and the
        corners stretch with the pill mid-morph.
      </p>

      <h2>How I pick the numbers</h2>
      <p>
        Honestly, by feel, then I write both numbers down so I can be
        consistent. Overshoot first. ζ = 1 (no overshoot from rest) for things
        that contain or indicate, like dialogs, tab highlights and progress.
        Around 0.6–0.8 for things you throw or that change shape. Big overshoot
        only on rare, larger moments. On small elements it reads as a glitch.
      </p>
      <p>
        Then speed. With Framer’s <code>duration</code> I start around 0.3s
        for a step or an icon and 0.4s when something changes size; in
        physics terms, stiffness 300–500 at mass 1 lands in the same range. I
        haven’t found a formula that beats trying it, and it’s worth
        interrupting it halfway rather than only watching it once. But having
        both numbers written down stops every component inventing its own.
      </p>
    </>
  );
}
