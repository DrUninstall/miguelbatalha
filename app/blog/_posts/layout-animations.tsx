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
        a list that reorders, a card that becomes a dialog. Nothing in CSS
        animates “this element is now somewhere else in the tree”.
      </p>
      <p>
        Framer Motion’s <code>layout</code> and <code>layoutId</code> props do,
        and they’re the part of the library I’d miss most. This post is about
        how they work, what they cost, and the details the one-line examples
        leave out.
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
    layoutId="tab-highlight"
    style={{ borderRadius: 16 }}
    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
  />
)}
`}</Code>
      <p>
        Two details in there. First, the radius is set through{" "}
        <code>style</code>, not a CSS class. The pill stretches between tabs of
        different widths using a scale transform, which would squash its
        corners. Framer corrects the radius for the current scale, but only
        for values it controls. Second, the spring has no bounce. This is
        something you click all day, and overshoot on every click gets old
        fast.
      </p>
      <Demo caption="Click a tab, or focus the row and use the arrow keys, Home and End.">
        <SharedLayoutTabs />
      </Demo>
      <p>
        I used a light tint for the pill and coloured text rather than a
        solid pill with white text. With white text, the label switches colour
        the instant you click, before the pill arrives, and for a moment you
        get white text on a pale background. With a tint, the label is
        readable at every frame of the animation.
      </p>

      <h2>Reordering</h2>
      <p>
        When items change position in the same list, you don’t need{" "}
        <code>layoutId</code>. Give each item a stable key and the{" "}
        <code>layout</code> prop. React moves the same DOM node, and Framer
        animates it from its old box to the new one.
      </p>
      <Code label="shared-layout-demo.tsx">{`
{order.map((id) => (
  <motion.div key={id} layout transition={{ type: "spring", bounce: 0.1, duration: 0.55 }} />
))}
`}</Code>
      <p>
        The key has to follow the item, not its index. Key by index and React
        thinks nothing moved; the colours jump and nothing animates. I also
        made shuffle reject the order you already have. With three items,
        one press in six would otherwise do nothing, and a button that
        sometimes does nothing reads as broken.
      </p>
      <Demo caption="Shuffle always produces a new order.">
        <SharedLayoutSwap />
      </Demo>

      <h2>A card that becomes a dialog</h2>
      <p>
        This is where <code>layoutId</code> earns its place. The card and the
        dialog are different elements in different parts of the tree: the
        dialog is rendered into <code>document.body</code>. They share{" "}
        <code>layoutId</code>s for the container, the title and the subtitle,
        so Framer morphs one into the other. Closing runs the same morph in
        reverse because the dialog is inside <code>AnimatePresence</code>,
        which keeps it mounted until its exit finishes.
      </p>
      <Demo caption="Click the card or press Enter on it. Escape, the Close button, or clicking outside closes it.">
        <SharedLayoutCard />
      </Demo>
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
          goes back to the card when it closes.
        </li>
        <li>
          The page behind stops scrolling, with padding added for the
          scrollbar so nothing shifts sideways.
        </li>
        <li>
          The dialog is centred by a full-screen grid, not by{" "}
          <code>translate(-50%, -50%)</code>. Framer writes its own inline
          transform on anything it animates, which silently replaces yours.
        </li>
      </ul>
      <p>
        The dialog content fades in 100ms after the morph starts, so text
        isn’t stretched while the box grows.
      </p>

      <h2>A stack that opens into a dock</h2>
      <p>
        The last one combines everything. Four cards sit on top of each other
        in a single grid cell, fanned out by rotation alone. Hovering or
        focusing the stack spreads them a little further, as a hint. Clicking
        it gives each card its own slot in a row, and each card’s{" "}
        <code>layoutId</code> carries it there.
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
        still yours: radius in <code>style</code> so it scale-corrects,{" "}
        <code>AnimatePresence</code> so exits run, no CSS transforms on
        animated elements, and everything a dialog owes keyboard users. I
        still think it’s the best abstraction in the library. It just moves
        the work from the maths to the details.
      </p>
    </>
  );
}
