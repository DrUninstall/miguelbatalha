import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/toast";
import { ThemeToggleExpanded } from "@/components/theme-toggle";
import { Code, Demo } from "../_components/demo";
import ui from "../_components/post.module.css";
import {
  FieldDemo,
  SelectionDemo,
  StagesDemo,
  ToastDemo,
  IconsDemo,
} from "./the-boring-components.demos";

export default function TheBoringComponents() {
  return (
    <>
      <p>
        A good animation plays once per visit. A button gets pressed every
        time anyone does anything. Buttons, fields, switches, tabs, toasts:
        they ship in every feature, nobody puts them in a portfolio, and
        they’re where most of the bugs are.
      </p>
      <p>
        I learned that the uncomfortable way. When I audited the components on
        this site, the flashy ones had problems, but the boring ones had more,
        and several were invisible in a screenshot: borders that didn’t
        render, labels that weren’t connected to their inputs, focus rings
        that had been quietly erased. This post covers what I changed.
      </p>

      <h2>Buttons</h2>
      <p>
        Three variants (primary, secondary, tertiary), four tones (brand,
        neutral, destructive, inverse), three sizes on a 4px grid:
      </p>
      <ul>
        <li>small: 32px tall, 12px side padding, 14px text</li>
        <li>medium: 40px, 16px, 16px text</li>
        <li>large: 48px, 24px, 18px text</li>
      </ul>
      <p>
        Pressing scales the button to 97% over 150ms with plain CSS{" "}
        <code>:active</code>. Hover only changes the colour. It used to scale
        up too, which made every row of buttons twitch as the pointer
        crossed it.
      </p>
      <Demo caption="Primary, secondary and tertiary in the brand tone, plus the destructive and neutral tones.">
        <div className={ui.row}>
          <Button variant="primary" tone="brand">Save</Button>
          <Button variant="secondary" tone="brand">Preview</Button>
          <Button variant="tertiary" tone="brand">Cancel</Button>
          <Button variant="primary" tone="destructive">Delete</Button>
          <Button variant="secondary">Export</Button>
        </div>
      </Demo>
      <p>
        The bug I found here was in the design tokens. Some of them hold whole{" "}
        <code>box-shadow</code> values, and a few components used them as
        colours:
      </p>
      <Code label="button.module.css (before)">{`
/* --stroke-brand-weak is "0 0 0 1px rgb(…)", not a colour */
border: 1px solid rgb(var(--stroke-brand-weak));
`}</Code>
      <p>
        That makes the whole <code>border</code> declaration invalid, and the
        browser drops it without a warning. Secondary buttons, the switch
        track and the active step all lost their outlines this way. The fix
        was to use the token for what it is (<code>box-shadow</code>) and to
        write down which tokens are colours and which are shadows.
      </p>

      <h2>Focus you can see</h2>
      <p>
        The site drew its focus ring as a <code>box-shadow</code>. Any
        component that set its own shadow for hover or elevation had the same
        specificity, loaded later, and silently replaced the ring. The
        carousel dots, among others, had no visible focus at all. The ring is
        now an outline, which doesn’t compete with shadows:
      </p>
      <Code label="globals.css">{`
:focus-visible {
  outline: 2px solid rgb(var(--fill-brand-strong));
  outline-offset: 2px;
}
`}</Code>
      <p>
        Outlines follow <code>border-radius</code> in current browsers, so the
        old reason to fake it with a shadow is gone.
      </p>

      <h2>Fields</h2>
      <p>
        A visible label above the field, tied to it with{" "}
        <code>htmlFor</code> and an id from <code>useId()</code>. Placeholder
        text is an example, never the label. Errors show up below the field
        in words, are linked with <code>aria-describedby</code>, and set{" "}
        <code>aria-invalid</code>. The red ring is a <code>box-shadow</code>{" "}
        so it doesn’t change the field’s size, and the focus outline still
        shows on top of it.
      </p>
      <Demo caption="Type something that isn’t an email address, then leave the field.">
        <FieldDemo />
      </Demo>
      <p>
        Two smaller rules. Nothing is flagged until you leave the field with
        a bad value. After that, the message updates as you type, so it
        disappears the moment the address is fixed. My first version got this
        backwards: leaving the field once, even with a valid address, turned
        on checking for every keystroke. And on touch
        screens, fields use at least 16px text: below that, iOS zooms the
        whole page when you tap into one.
      </p>

      <h2>Choosing between options</h2>
      <p>
        A segmented control for a few mutually exclusive views, tabs when
        each option has its own content, and a switch for on or off. The
        segmented thumb and the tab underline are both a shared-layout
        element rendered inside the selected option, so they slide between
        options of different widths. Each instance gets its own{" "}
        <code>layoutId</code> from <code>useId()</code>. Otherwise two
        controls on one page share an indicator, and it flies across the page
        between them.
      </p>
      <Demo caption="Click, or use Tab and the arrow keys. Keyboard changes snap instead of animating.">
        <SelectionDemo />
      </Demo>
      <p>
        Moving with the arrow keys switches instantly. Someone arrowing
        through options already sees the focus move, and making them wait for
        an animation on every key press is friction. The switch’s thumb uses a
        spring with a little overshoot (ζ ≈ 0.67), and clicking its label
        toggles it, like a native checkbox.
      </p>

      <h2>Progress</h2>
      <p>
        The step indicator is an ordered list. The current step has{" "}
        <code>{`aria-current="step"`}</code>, completed steps say so in hidden
        text, and the heading (“Step 2 of 4”) sits in a polite live region, so
        moving between steps is announced. The bar above scales horizontally
        to the share of steps reached rather than animating its width.
      </p>
      <Demo caption="Step through with Back and Next.">
        <StagesDemo />
      </Demo>

      <h2>Toasts</h2>
      <p>
        Toasts are easy to get almost right. What changed here:
      </p>
      <ul>
        <li>
          One live region is always on the page, and toasts are added inside
          it. A region created at the same moment as its message often isn’t
          announced at all.
        </li>
        <li>
          Success and info stay for 4 seconds, errors for 6, and a loading
          toast stays until it resolves. Hovering or focusing the stack
          pauses every timer, so nothing disappears while you’re reading it.
        </li>
        <li>
          Every toast has a dismiss button. After dismissing with the
          keyboard, focus moves to the next toast instead of falling back to
          the top of the page.
        </li>
      </ul>
      <p>
        Collapsed, each older toast sits 8px higher and 5% smaller than the
        one in front, three deep. Hover or focus spreads them out using each
        toast’s measured height, so a toast whose text wraps still gets the
        right amount of space. Entry and exit are CSS transitions, with entry
        defined by <code>@starting-style</code>.
      </p>
      <Demo caption="Trigger a few in a row, then hover or Tab into the stack.">
        <ToastDemo />
      </Demo>

      <h2>Switching themes</h2>
      <p>
        The theme switch uses the View Transitions API: the browser takes a
        snapshot of the page, the theme changes, and the new theme is revealed
        as a circle growing from the button over 500ms. Two details made it
        reliable. The theme class is applied inside{" "}
        <code>flushSync</code>, so the “after” snapshot really is after. And
        keyboard presses have no pointer position, so the circle starts from
        the centre of the button instead of the corner of the screen.
      </p>
      <Demo caption="Switch between light and dark. With reduced motion on, it switches without the circle.">
        <ThemeToggleExpanded />
      </Demo>

      <h2>Icons that answer back</h2>
      <p>
        Twelve small icons. I’ll be straight about these: six of them (like,
        play, mute, show password, copy, send) share one animation, a quick
        crossfade where the new icon scales up from 25% as the old one blurs
        out. That’s fine. They’re doing the same job, swapping one state for
        another, and one consistent motion is better than six clever ones.
        Copy and Send add behaviour on top of that swap: Copy actually writes
        to your clipboard and says “Copied” to screen readers, and Send shows
        a loading state before its check.
      </p>
      <p>
        The other six have something specific to say. The heart pops with a
        bouncy spring when you fill it and doesn’t bounce when you unfill it.
        The star turns 72° as it fills, which a five-pointed star can do
        without looking any different at the end. The chevron turns to show
        whether the details are open. The download arrow drops into a tray and
        a check draws in. And two aren’t buttons at all: a spinner and an
        “online” dot, which are status indicators with their own names.
      </p>
      <Demo loop caption="Ten buttons and two status indicators. Each caption is the control’s accessible name; toggles report their state.">
        <IconsDemo />
      </Demo>
      <p>
        One rule from this set I’d apply everywhere: a state change you can
        only see isn’t feedback for everyone. Every one of these either
        changes its accessible state (<code>aria-pressed</code>,{" "}
        <code>aria-expanded</code>) or announces the result.
      </p>

      <h2>Why this is the real work</h2>
      <p>
        None of these fixes would show up in a screenshot, which is exactly
        why they were broken. I’m not going to pretend there are none left.
        What I have now is a habit: before a component is done, I use it with
        only a keyboard, with a screen reader on, at phone width and in dark
        mode. The boring components are where that habit catches the most.
      </p>
      <Toaster />
    </>
  );
}
