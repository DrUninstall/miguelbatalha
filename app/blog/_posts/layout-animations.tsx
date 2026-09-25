import {
  SharedLayoutTabs,
  SharedLayoutSwap,
  SharedLayoutCard,
} from "@/components/shared-layout-demo";
import { CollectionPreview } from "@/components/collection-preview";
import { Code, Demo } from "../_components/demo";

export default function LayoutAnimations() {
  return (
    <>
      <p>
        Moving a box from A to B is easy. The hard case is when A and B are
        different layouts: a highlight that sits in one tab and then another,
        a list that reorders, a card that becomes a dialog.
      </p>
      <p>
        The platform has an answer for part of this now. Same-document view
        transitions, a <code>view-transition-name</code> on the element plus{" "}
        <code>document.startViewTransition()</code> around the change, snapshot
        the page before and after and animate between the two, and they’re in
        every major browser engine. For a page or route change, that’s what I’d
        reach for. They’re worse for things you click repeatedly. Start a new
        transition while one is running and the browser skips the running one
        to its end instead of carrying on from where things are on screen.
      </p>
      <p>
        That repeated, interruptible case is what Framer Motion’s{" "}
        <code>layout</code> and <code>layoutId</code> props handle well, and
        they’re the part of the library I’d miss most. This post is about how
        they work, what they cost, and the details the one-line examples leave
        out.
      </p>

      <h2>How it works</h2>
      <p>
        Both props use a technique called FLIP: measure the element’s box
        (First), let React render the new layout and measure again (Last),
        apply a transform that makes it look like it’s still in the old place
        (Invert), then animate that transform away (Play).
      </p>
      <p>
        The result only ever animates <code>transform</code>, so the page never
        re-runs layout mid-animation. It isn’t free, though. Framer computes
        those transforms in JavaScript on every frame, on the main thread. If
        the main thread is busy, a layout animation stutters in a way a CSS
        transform transition wouldn’t. For UI-sized moves that’s a fine trade.
        I just don’t call it “compositor-only”, because it isn’t.
      </p>

      <h2>A highlight that moves between tabs</h2>
      <p>
        The pill exists only inside the active tab. When you pick another tab,
        a new pill with the same <code>layoutId</code> mounts there, and Framer
        animates it from where the old one was:
      </p>
      <Code label="shared-layout-demo.tsx">{`
{isActive && (
  <motion.span
    layoutId={\`\${baseId}-highlight\`}
    style={{ borderRadius: 16 }}
    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
  />
)}
`}</Code>
      <p>
        Three details in there. The <code>layoutId</code> is prefixed with an
        id from <code>useId()</code>, because layoutIds are global to the page:
        put this component on a page twice and there’d be one pill flying
        between both rows. Wrapping each instance in{" "}
        <code>{"<LayoutGroup id={…}>"}</code> does the same job.
      </p>
      <p>
        The radius is set through <code>style</code>, not a CSS class. The pill
        stretches between tabs of different widths using a scale transform,
        which would squash its corners. Framer corrects{" "}
        <code>border-radius</code> and <code>box-shadow</code> for the current
        scale, but only when they’re values it controls, set in{" "}
        <code>style</code> or <code>animate</code>: a pixel radius, a single
        literal shadow. Anything that comes from a class or a CSS variable scales with
        the box.
      </p>
      <p>
        And the spring has no bounce. This is something you click all day, and
        overshoot on every click gets old fast.
      </p>
      <Demo caption="Click a tab, or focus the row and use the arrow keys, Home and End.">
        <SharedLayoutTabs />
      </Demo>
      <p>
        Click another tab while the pill is still moving and it heads for the
        new one from wherever it is. Framer starts every layout animation from the
        element’s current box on screen, and that’s the concrete thing it has
        over view transitions.
      </p>
      <p>
        The keyboard is different. Arrow keys, Home and End switch the pill,
        the label colour and the panel instantly. Someone arrowing through tabs
        presses a key every fraction of a second, focus already shows where
        they are, and a 0.4s slide per key press would trail behind them.
      </p>
      <p>
        I used a light tint for the pill and coloured text rather than a solid
        pill with white text. With white text, the label switches colour the
        instant you click, before the pill arrives, and for a moment you get
        white text on a pale background. With a tint, the label is readable at
        every frame of the animation.
      </p>
      <p>
        The label colour still transitions, and it has to agree with the pill.
        My first version faded it over 200ms against a 0.4s spring, so the
        colour arrived first. Framer’s <code>spring()</code> can write a spring
        out as a CSS <code>linear()</code> easing, so the colour transition now
        runs on the pill’s exact curve.
      </p>
      <p>
        The standard way to make them agree completely is to render the tab row
        twice: a second copy styled as the active state, clipped to the active
        tab with <code>clip-path: inset()</code>, and animate the clip.
        Background and label are then one thing being revealed, so they can’t
        drift apart, and white text on a solid pill works. I kept the tint. The
        clipped version needs a hidden second copy of every label and its own
        measuring of where each tab is, which is the work{" "}
        <code>layoutId</code> already does for me, and with a tint, a colour
        fading in place while the pill travels never costs legibility.
      </p>

      <h2>Reordering</h2>
      <p>
        When items change position in the same list, you don’t need{" "}
        <code>layoutId</code>. Give each item a stable key and the{" "}
        <code>layout</code> prop. React moves the same DOM node, and Framer
        animates it from its old box to the new one.
      </p>
      <Code label="shared-layout-demo.tsx">{`
{items.map((item) => (
  <motion.div
    key={item.id}
    layout
    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
  />
))}
`}</Code>
      <p>
        The key has to follow the item, not its index. Key by index and React
        thinks nothing moved; the colours jump and nothing animates. I also
        made shuffle reject the order you already have. With three items,
        one press in six would otherwise do nothing, and a button that
        sometimes does nothing reads as broken.
      </p>
      <p>
        No bounce here either. I had a little at first, on the theory that
        things moving somewhere new deserve some physics. But nothing threw
        them. A click moved them, and overshoot after a click is the same
        annoyance it is on the tabs.
      </p>
      <Demo caption="Shuffle always produces a new order.">
        <SharedLayoutSwap />
      </Demo>
      <p>
        One limit worth knowing: <code>layout</code> only animates components
        that re-render. Here the list renders every circle, so they all get
        measured. If a change inside one component pushes a sibling component
        somewhere else, the sibling didn’t re-render, so it jumps. Wrapping
        both in <code>{"<LayoutGroup>"}</code> makes them measure together.
      </p>

      <h2>A card that becomes a dialog</h2>
      <p>
        This is where <code>layoutId</code> earns its place. The card and the
        dialog are different elements in different parts of the tree: the
        dialog is rendered into <code>document.body</code>. They share{" "}
        <code>layoutId</code>s for the container, the title and the subtitle,
        so Framer morphs one into the other. Closing runs the same morph in
        reverse because the dialog is inside <code>AnimatePresence</code>,
        which keeps it mounted until its exit finishes. Opening takes 0.4s and
        closing 0.3s, both without bounce. By the time you close something
        you’ve already moved on, so the exit is the shorter half.
      </p>
      <Demo caption="Click the card or press Enter on it. Escape, the Close button, or clicking outside closes it. Try reopening it while it’s still closing.">
        <SharedLayoutCard />
      </Demo>
      <p>
        My first version stretched its text. Framer animates a layout change
        by scaling the box, and a scale transform applies to everything inside
        it. For the first frames the dialog’s paragraph was squashed into the
        card’s shape, and the title showed two copies crossfading, one
        stretched and one squashed. Three things fixed it:
      </p>
      <ul>
        <li>
          Children that should keep their shape need their own{" "}
          <code>layout</code> prop, which makes Framer counter-scale them. The
          dialog’s body has one, and it fades in 100ms after the morph starts.
        </li>
        <li>
          Text shared between the two states should usually get{" "}
          <code>{'layout="position"'}</code>, which animates where it is but not
          its size. The subtitle has it.
        </li>
        <li>
          Text boxes should hug their glyphs (<code>width: fit-content</code>),
          with the parent’s alignment doing the positioning. A heading as wide
          as the dialog has a very different shape from the same words in the
          card, and that difference is what gets stretched. Boxes that hug the
          text have the same proportions in both places, so there’s no double
          image. That’s also why I let the title scale: it goes from 16px to
          20px, and a uniform scale looks like the text simply growing.
        </li>
      </ul>
      <p>
        The one thing I left scaling is the shadows. Framer only corrects a
        single shadow, and the card and dialog use this site’s shadow tokens:
        five layers each (a hairline, two soft edge shadows and a two-layer
        elevation), from CSS variables. During the
        morph they stretch with the box, so the hairline is two or three
        pixels thick for the first frames of the close. It lasts a few frames,
        and I decided it wasn’t worth replacing the design tokens with one
        hand-written shadow per theme.
      </p>
      <p>
        Most of the work wasn’t the animation. It was making it behave like a
        real dialog:
      </p>
      <ul>
        <li>
          The card is a <code>button</code>, so keyboard users can open it.
        </li>
        <li>
          Focus moves into the dialog, stays inside it while it’s open, and
          goes back to the card when it closes. Nothing waits for an Effect to
          notice: the Close button has <code>autoFocus</code>, and the same
          function that closes the dialog focuses the card.
        </li>
        <li>
          The card’s focus ring is drawn by a wrapper that never moves. On the
          card itself, the outline would be scaled with everything else while
          it morphs back.
        </li>
        <li>
          The page behind stops scrolling, with padding added for the
          scrollbar so nothing shifts sideways.
        </li>
        <li>
          While it closes, the dialog is <code>inert</code>, so a click during
          the exit goes to whatever is underneath, including the card.
        </li>
        <li>
          The dialog is centred by a full-screen grid, not by{" "}
          <code>translate(-50%, -50%)</code>. Framer writes its own inline
          transform on anything it animates, which silently replaces yours.
        </li>
      </ul>
      <p>
        Most of that list is what <code>{"<dialog>"}</code> with{" "}
        <code>showModal()</code> gives you: it sits in the top layer above
        everything, Escape closes it, and the rest of the page becomes truly
        inert rather than just unreachable with Tab. A Radix or Base UI dialog
        does the same in React. The catch is the exit.{" "}
        <code>close()</code> takes a native dialog away at once, so you have to
        hold it open until the exit animation finishes, and a Radix dialog
        needs <code>forceMount</code> (Base UI calls it{" "}
        <code>keepMounted</code>) before <code>AnimatePresence</code> can keep
        it on screen for its exit. I hand-rolled this one to
        show the parts. In a product I’d start from one of those.
      </p>

      <h2>A stack that opens into a dock</h2>
      <p>
        The last one combines everything. Four cards sit on top of each other
        in a single grid cell, fanned out by rotation alone. Hovering or
        focusing the stack spreads them a little further, as a hint. Clicking
        it gives each card its own slot in a row, and each card’s{" "}
        <code>layoutId</code> carries it there. The name and count move to the
        header with <code>{'layout="position"'}</code> and boxes that hug their
        text, like the card’s subtitle.
      </p>
      <Demo caption="Hover or focus the stack to preview, click to expand. In the dock, move the pointer across the cards.">
        <CollectionPreview />
      </Demo>
      <p>
        Two small things I care about here. The button you pressed disappears
        in both directions, so focus is moved to its counterpart (Collapse
        after expanding, the stack after collapsing). Otherwise keyboard users
        land back at the top of the page. And the button’s visible text matches
        what a screen reader announces. The earlier version said “View All” on
        screen and “Collapse preview” to assistive tech, for a button that did
        the opposite of what it said.
      </p>

      <h2>What “you’re done” leaves out</h2>
      <p>
        The pitch for <code>layoutId</code> is that you put the same id on two
        elements and you’re done. That’s true for the motion. The rest is
        still yours: ids that are unique per instance, radius in{" "}
        <code>style</code> so it scale-corrects, <code>layout</code> on
        children and text boxes that hug their glyphs so nothing stretches,{" "}
        <code>AnimatePresence</code> so exits run, no CSS transforms on
        animated elements, and everything a dialog owes keyboard users. I
        still think it’s the best abstraction in the library. It just moves
        the work from the maths to the details.
      </p>
    </>
  );
}
