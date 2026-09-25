import { Toaster } from "@/components/toast";
import { ThemeToggleExpanded } from "@/components/theme-toggle";
import { Code, Demo } from "../_components/demo";
import styles from "./the-boring-components.module.css";
import {
  ButtonsDemo,
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
        Three variants (primary, secondary, tertiary), three tones (brand,
        neutral, destructive), three sizes on a 4px grid:
      </p>
      <ul>
        <li>small: 32px tall, 12px side padding, 14px text</li>
        <li>medium: 40px, 16px, 16px text</li>
        <li>large: 48px, 24px, 18px text</li>
      </ul>
      <p>
        Nine variant and tone pairs in three sizes is what the system allows,
        not what anything needs. Three variants plus a destructive tone cover
        everything on this site. There was a fourth tone, inverse, that
        nothing used, so I deleted it, along with an icon prop, a full-width option and an{" "}
        <code>htmlType</code> prop that stood in for the native{" "}
        <code>type</code>. The button now takes <code>type</code> like any
        button and defaults it to <code>{`"button"`}</code>, because the HTML
        default is <code>submit</code>.
      </p>
      <p>
        Pressing scales the button to 97% over 150ms with plain CSS{" "}
        <code>:active</code>, and a <code>still</code> prop turns that off for
        dense rows. <code>:active</code> covers mouse, touch and holding
        Space. Enter doesn’t trigger it: Enter activates the button on key
        down, so a keyboard press has no squash. I’ve left that alone. The
        focus ring is already on the button and the result is immediate, and
        faking a pointer press for a key felt like the wrong fix. Hover only
        changes the colour, and only on devices with a real pointer, since a
        touch screen fires hover on tap and leaves it stuck. It used to scale
        up too, which made every row of buttons twitch as the pointer crossed
        it.
      </p>
      <Demo caption="Primary, secondary and tertiary in the brand tone, then the destructive and neutral tones. Delete shows a toast with Undo.">
        <ButtonsDemo />
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
        A declaration with <code>var()</code> in it can’t be checked when the
        stylesheet is parsed, so the browser accepts this one. It fails later,
        when the variable is substituted and the result isn’t a colour. At
        that point the property behaves as if it were <code>unset</code>,
        which for <code>border</code> means no border at all. It also means a
        fallback can’t save you: a <code>border: 1px solid gray</code> earlier
        in the same rule has already lost the cascade to this one. Secondary
        buttons, the switch track and the active step all lost their outlines
        this way, and nothing warned me.
      </p>
      <p>
        The real cause was the names. <code>--stroke-weak</code> was a shadow
        and <code>--stroke-color-weak</code> was a colour, and nothing about
        either name said which. So the fix wasn’t only using the token as a{" "}
        <code>box-shadow</code>. I renamed every shadow token to{" "}
        <code>--ring-*</code>, and the hover and press overlays to{" "}
        <code>--overlay-*</code>, so <code>rgb(var(--ring-brand-weak))</code>{" "}
        looks wrong the moment you type it.
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
  outline: 2px solid rgb(var(--text-strong));
  outline-offset: 2px;
}
`}</Code>
      <p>
        It’s the text colour rather than the brand colour, so a focused button
        never looks like a selected one next to brand-filled controls.
        Outlines have followed <code>border-radius</code> since Chrome 94,
        Firefox 88 and Safari 16.4, the last of those in 2023, so the old
        reason to fake the ring with a shadow is gone.
      </p>
      <p>
        The better reason for an outline turned out to be forced colours, the
        mode Windows calls High Contrast. In it, the browser removes every{" "}
        <code>box-shadow</code> and repaints outlines and borders in the
        user’s system colours. A shadow ring would have vanished for exactly
        the people who need it most. The same went for every hairline on this
        site, since they were all shadows: in forced colours the buttons were
        bare text, the field had no box and the switch disappeared. Each of
        those controls now also has a transparent 1px border, sized so
        nothing moves, which stays invisible until that mode paints it.
        Selected states use system colours, which forced colours leave
        alone:
      </p>
      <Code label="toggle.module.css">{`
@media (forced-colors: active) {
  .trackChecked {
    background: Highlight;
  }
}
`}</Code>
      <p>
        The selected segment and theme option fill with{" "}
        <code>Highlight</code> the same way, and the active tab’s underline
        and the current step’s ring are drawn in it.
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
        Nothing is flagged until you leave the field with a bad value. After
        that, the message updates as you type, so it disappears the moment
        the address is fixed. My first version got this backwards: leaving
        the field once, even with a valid address, turned on checking for
        every keystroke. It also shook the field whenever it turned invalid,
        which, once checking was live, meant it could shake halfway through a
        word. I took the shake out instead of fixing its timing. The ring and
        the message already say what’s wrong without moving anything.
      </p>
      <p>
        On touch screens, fields use at least 16px text: below that, iOS
        zooms the whole page when you tap into one.
      </p>

      <h2>Choosing between options</h2>
      <p>
        A segmented control, tabs and a switch look like three versions of
        one thing. They aren’t. Each one tells the keyboard and a screen
        reader something different about how it’s operated and when the
        change happens:
      </p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Control</th>
            <th scope="col">Role</th>
            <th scope="col">Keys</th>
            <th scope="col">Takes effect</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Segmented control</th>
            <td><code>radiogroup</code></td>
            <td>One Tab stop; arrows move the selection</td>
            <td>Immediately</td>
          </tr>
          <tr>
            <th scope="row">Tabs</th>
            <td><code>tablist</code></td>
            <td>Arrows, Home and End pick a tab; Tab moves into its panel</td>
            <td>Immediately, by showing that tab’s panel</td>
          </tr>
          <tr>
            <th scope="row">Switch</th>
            <td><code>switch</code></td>
            <td>Space or Enter flips it</td>
            <td>The moment it flips</td>
          </tr>
          <tr>
            <th scope="row">Checkbox</th>
            <td><code>checkbox</code></td>
            <td>Space ticks it</td>
            <td>When the form is saved</td>
          </tr>
        </tbody>
      </table>
      <p>
        The last two rows are the ones I see mixed up most. A switch inside a
        form with a Save button claims the change already happened when it
        hasn’t. If a setting only applies on Save, it’s a checkbox.
      </p>
      <p>
        My own tabs demo broke the second row: it had no panel, which made it
        a segmented control with an underline. Each tab now has an id, and
        the panel under it is a <code>tabpanel</code> labelled by the
        selected tab, so tabbing into it announces which section you’re in.
      </p>
      <p>
        The segmented thumb and the tab underline are both a shared-layout
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
        text, and the “Step 2 of 4” line and the step title sit in a polite
        live region, so moving between steps is announced. The region is
        atomic, and the line is one string. My first version rendered
        “Step ”, the number, “ of ” and the total as separate text nodes, and
        without <code>aria-atomic</code> a screen reader may read only the
        node that changed: “2”. The bar above the steps scales horizontally to
        the share of steps reached rather than animating its width.
      </p>
      <Demo caption="Step through with Back and Next.">
        <StagesDemo />
      </Demo>

      <h2>Toasts</h2>
      <p>
        A toast is for background confirmation: something happened and nobody
        has to do anything about it. If you have to act, the message belongs
        next to whatever caused it, or the toast stays until you dismiss it
        and carries the action itself. A connection error has nowhere else to
        go, so here it waits for you and has a Retry button. Undo is the other
        case: the Delete button in the first demo shows a toast that can’t
        leave on its own, because the action is the whole point of it.
      </p>
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
          Success and info stay for about as long as they take to read: 300ms
          a word, never less than 4 seconds. Errors, and any toast with a
          button in it, stay until you dismiss them or use the button. A
          loading toast stays until it resolves. Hovering or focusing the
          stack pauses every timer, and so does switching browser tabs, so
          nothing disappears while you’re not looking.
        </li>
        <li>
          The same message twice in a row doesn’t stack a copy. The toast
          already on screen shows a count (“×3”) and restarts its timer.
        </li>
        <li>
          Every toast except a loading one has a dismiss button. After
          dismissing with the keyboard, focus moves to the next toast instead
          of falling back to the top of the page.
        </li>
      </ul>
      <p>
        Collapsed, each older toast sits 8px higher and 5% smaller than the
        one in front, three deep. Hover or focus spreads them out using each
        toast’s measured height, so a toast whose text wraps still gets the
        right amount of space. Entry and exit are CSS transitions, with entry
        defined by <code>@starting-style</code>.
      </p>
      <Demo caption="Press Success a few times, trigger the error and retry it, then hover or Tab into the stack.">
        <ToastDemo />
      </Demo>

      <h2>Switching themes</h2>
      <p>
        The theme switch is a radio group: Light, Dark and System, one Tab
        stop, arrow keys to move. It started as two buttons with{" "}
        <code>aria-pressed</code>, where pressing the one already pressed did
        nothing. That’s a radio button announced as something else. And
        System was missing, even though it’s the site’s default. The
        highlight marks what you chose, not what it resolved to, so System
        stays highlighted when your operating system switches to dark.
      </p>
      <p>
        When the choice changes the page’s colours, the switch uses the View
        Transitions API: the browser takes a snapshot of the page, the theme
        changes, and the new theme is revealed as a circle growing from the
        option over 500ms. Three details made it reliable. The theme class is
        applied inside <code>flushSync</code>, so the “after” snapshot really
        is after. Keyboard changes have no pointer position, so the circle
        starts from the centre of the option instead of the corner of the
        screen. And next-themes switches CSS transitions off while it changes
        the theme class, so the highlight’s slide is a Web Animation, which
        that doesn’t touch.
      </p>
      <Demo caption="Light, Dark or System. With reduced motion on, it switches without the circle or the slide.">
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
        a loading state before its check. Like is a thumbs-up. It used to be
        a second heart, right next to Favorite with a different animation,
        so the same shape meant two things.
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
        only a keyboard, with a screen reader on, at phone width, in dark
        mode and in forced colours. The boring components are where that habit catches the most.
      </p>
      <Toaster />
    </>
  );
}
