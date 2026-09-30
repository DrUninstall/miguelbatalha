import { AlarmDemo, ContactDemo, CountDemo, RepetitionDemo } from "./interface-sounds.demos";
import { Code, Demo } from "../_components/demo";

export default function InterfaceSounds() {
  return (
    <>
      <p>
        I studied audio science, then spent four years at Stam Audio around
        studio gear. Most interface sounds I hear fail in ways a studio would
        catch in a second: they land late, they repeat exactly, or they say
        the wrong thing. None of that is about taste. It’s about timing,
        variation and shape, and those can be designed like anything else.
      </p>
      <p>
        Everything here comes from building sound for Effort Keeper, the app
        I’m working on, and from a reel of its interface where every sound is
        the app’s own. Nothing on this page makes a sound until you press a
        button. On iPhone, Web Audio follows the ring/silent switch, so turn
        it off to hear the demos.
      </p>

      <h2>Sound never works alone</h2>
      <p>
        One rule first. People mute their devices, work in open offices and
        turn sound off in settings, so a sound can reinforce what happened but
        can’t be the only way to find out. The rule I hold Effort Keeper to:
        every sound sits on a state change you can see. Every demo here shows
        something too.
        If the screen doesn’t make sense muted, the sound is covering a gap
        it shouldn’t.
      </p>

      <h2>Land on the contact</h2>
      <p>
        When a sound accompanies motion, it belongs to the moment something
        hits, not the moment the animation starts. Your ear is much faster
        than your eye at judging timing: a sound that fires at the start of a
        360ms fall arrives a third of a second before the thing it describes,
        and the two stop reading as one event.
      </p>
      <Demo caption="The ball falls for 360ms. The sound is a short tick over a low thud, scheduled on the audio clock. With reduced motion on, the ball doesn’t fall and both options play at once.">
        <ContactDemo />
      </Demo>
      <p>
        There’s a second, subtler version of the same mistake. A sound’s
        loudest moment is rarely its first sample. A chord that cascades, or a
        tone with a soft attack, peaks some milliseconds in. Line up the start
        of the file with the contact and the ear hears it late.
      </p>
      <p>
        For the Effort Keeper reel, the audio script renders each sound on its
        own first, finds its first peak (the loudest point in the 40ms after
        it becomes audible), and shifts every cue earlier by that amount. The
        peak lands on the frame of the contact:
      </p>
      <Code label="audio.mjs">{`
// measure each cue's first peak once, rendered alone
let onset = start; while (onset < L.length && Math.abs(L[onset]) < 1e-4) onset++;
let pk = onset, mx = 0;
for (let i = onset; i < Math.min(L.length, onset + 0.04 * SR); i++) if (Math.abs(L[i]) > mx) { mx = Math.abs(L[i]); pk = i; }
offsets[key] = (pk - start) / SR;
// …
const placed = cues.map(([t, n, o]) => [t - offsets[n + JSON.stringify(o || {})], n, o]);
`}</Code>
      <p>
        The reel loops, which adds one more detail: a sound that starts near
        the end is still ringing when the loop point arrives. Cutting it there
        clicks. So the tails past the end are added back onto the start, and
        the last sound keeps decaying under the first frame, the way it would
        if the loop were real.
      </p>

      <h2>Never the same sound twice</h2>
      <p>
        Sample libraries have a name for this: the machine-gun effect. Play one
        recorded snare hit sixteen times and it sounds like a machine, because
        no drummer can hit the same spot at the same force twice. Libraries
        record several takes of every hit and rotate through them, which is
        called round-robin.
      </p>
      <p>
        Interface sounds have the same problem, worse. You’ll hear a key
        sound hundreds of times. Tap each mode quickly and listen for when the
        identical one starts to sound like a fault:
      </p>
      <Demo caption="Each mark is one tap: its height is the pitch, its strength the level. Varied taps drift up to ±30 cents in pitch and ±10% in level, and each click reads a different stretch of noise.">
        <RepetitionDemo />
      </Demo>
      <p>
        Effort Keeper synthesises its sounds rather than playing files, so the
        variation is two lines. Every tone drifts in pitch and level on every
        firing, and every click reads a random window of one shared noise
        buffer, so no two are the same noise:
      </p>
      <Code label="voices.ts">{`
/** Pitch humanisation, in cents. */
const PITCH_DRIFT = 30;
/** Gain humanisation, as a fraction. */
const GAIN_DRIFT = 0.1;

function varied(value: number, spread: number): number {
  return value * (1 + (Math.random() * 2 - 1) * spread);
}

function drift(hz: number): number {
  return cents(hz, (Math.random() * 2 - 1) * PITCH_DRIFT);
}
`}</Code>
      <p>
        Pitch drift is in cents rather than hertz on purpose. Cents are a
        ratio, so 30 cents is the same musical distance at 200Hz and at
        2,000Hz. A fixed number of hertz would be a wobble at the top and a
        wrong note at the bottom.
      </p>

      <h2>Pitch can count</h2>
      <p>
        Logging effort in Effort Keeper happens in bursts: tap, tap, tap. Each
        log in a burst plays one step higher on a pentatonic scale, so a
        burst becomes a short climbing phrase. Pause for 1.4 seconds and the
        next log starts at the bottom again. When the quota fills, the phrase
        resolves.
      </p>
      <Demo caption="Five logs to fill the quota. Each dot rises with the note it played; pause for 1.4 seconds and the climb restarts. The fifth plays a major chord, root to octave, 60ms apart.">
        <CountDemo />
      </Demo>
      <p>
        The pentatonic scale is the useful part. It has no semitones, so any
        two of its notes sound fine together. Taps come faster than a note
        decays, so notes overlap, and a scale that could clash would clash
        exactly when someone is using the app most.
      </p>
      <p>
        The count is carried by the dots, not the pitch. Pitch only adds that
        the burst is going somewhere, and you can still hear it with your
        eyes elsewhere.
      </p>

      <h2>Done, not an alarm</h2>
      <p>
        The first cut of the reel used a completion sound that, in context,
        sounded like an alarm going off. I swapped it for Effort Keeper’s
        achievement sound: four notes of a major chord, 60ms apart, the last
        one ringing longest. It’s the same chord as the demo above.
      </p>
      <p>
        Alarms are designed to be impossible to ignore, and they share a
        shape: a square wave in the 2–4kHz range where hearing is most
        sensitive, flat-topped pulses that don’t decay, and repetition.
        Anything that says “done” should be the opposite: one event, a sine or
        something soft, lower, and fading on its own.
      </p>
      <Demo caption="Left: three flat 90ms pulses of a 2.8kHz square wave. Right: a C major triad, sine, 70ms apart, low-passed at 3kHz, each note decaying. The drawings are each one’s level over time.">
        <AlarmDemo />
      </Demo>
      <p>
        Direction matters as well. Rising reads as arriving or confirming;
        falling reads as closing or settling. Effort Keeper’s end-of-day
        sound descends in the mixolydian mode on purpose, so ending the day
        sounds like putting something down rather than winning something.
      </p>

      <h2>Quiet in proportion to how often</h2>
      <p>
        The more often a sound plays, the quieter, shorter and higher it
        should be. Someone who hears it a hundred times a day can’t turn that
        one sound down, so it has to be designed down. Effort Keeper’s log
        sound is a short, filtered note. The chord waits for a filled quota.
        Saving something sits in between: heavier than a toggle, well under a
        finished quota.
      </p>
      <p>
        This site has no sound at all, and that’s the right call for it.
        Nothing here is repeated enough, or physical enough, to earn one.
        Effort Keeper is different: logging effort is a small, repeated,
        physical act, which is exactly where sound pays for itself. Most
        interfaces are closer to this site than to that app, and should ship
        silent.
      </p>
    </>
  );
}
