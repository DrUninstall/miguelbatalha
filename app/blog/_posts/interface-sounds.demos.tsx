"use client";

import { useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import ui from "../_components/post.module.css";
import styles from "./interface-sounds.module.css";

/* ─── A small synth ────────────────────────────────────────────────────────
 * One AudioContext for the page, created on the first press (browsers only
 * allow audio after a gesture). Every sound is scheduled on the audio clock,
 * so "play this 360ms from now" is exact rather than a setTimeout guess. */

let context: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

function audio(): AudioContext {
  context ??= new AudioContext();
  if (context.state === "suspended") void context.resume();
  return context;
}

// exponentialRampToValueAtTime can't reach zero, and the exponential ramp is
// what makes a decay sound natural.
const SILENCE = 0.0001;

// Everything here stays quiet: the loudest single layer is 0.16.
const MASTER = 0.8;

type ToneSpec = {
  freq: number;
  gain: number;
  decay: number;
  at?: number;
  attack?: number;
  type?: OscillatorType;
  lowpass?: number;
  /** Hold at full level before decaying, in seconds (the alarm uses this). */
  hold?: number;
};

function tone(ac: AudioContext, start: number, spec: ToneSpec) {
  const { freq, gain, decay, at = 0, attack = 0.002, type = "sine", lowpass, hold = 0 } = spec;
  const t = start + at;
  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  const amp = ac.createGain();
  amp.gain.setValueAtTime(SILENCE, t);
  amp.gain.linearRampToValueAtTime(gain * MASTER, t + attack);
  amp.gain.setValueAtTime(gain * MASTER, t + attack + hold);
  amp.gain.exponentialRampToValueAtTime(SILENCE, t + attack + hold + decay);
  let source: AudioNode = osc;
  if (lowpass) {
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = lowpass;
    osc.connect(filter);
    source = filter;
  }
  source.connect(amp).connect(ac.destination);
  osc.start(t);
  osc.stop(t + attack + hold + decay + 0.05);
}

/** A band-passed noise burst: reads as a physical tick where a sine reads as a
 *  tone. `offset` picks where in the shared noise it starts. */
function tick(ac: AudioContext, start: number, gain: number, offset: number) {
  noiseBuffer ??= makeNoise(ac);
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer;
  const band = ac.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 4000;
  band.Q.value = 1.2;
  const amp = ac.createGain();
  amp.gain.setValueAtTime(gain * MASTER, start);
  amp.gain.exponentialRampToValueAtTime(SILENCE, start + 0.012);
  src.connect(band).connect(amp).connect(ac.destination);
  src.start(start, offset, 0.02);
}

function makeNoise(ac: AudioContext): AudioBuffer {
  const buffer = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

const cents = (hz: number, c: number) => hz * Math.pow(2, c / 1200);
const spread = () => Math.random() * 2 - 1;

/* ─── 1. Land on the contact ───────────────────────────────────────────────*/

const FALL_MS = 360;
// Matches the drop area in interface-sounds.module.css: 120px tall, 24px ball.
const FALL_PX = 96;

export function ContactDemo() {
  const [when, setWhen] = useState("contact");
  const ball = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  function drop() {
    const ac = audio();
    // With reduced motion the ball doesn't fall, so contact is now.
    const fall = reduceMotion ? 0 : FALL_MS / 1000;
    const at = ac.currentTime + (when === "contact" ? fall : 0);
    // Transient plus body: a short tick on top of a low thud, fired together.
    tick(ac, at, 0.08, 0);
    tone(ac, at, { freq: 150, gain: 0.16, decay: 0.14, lowpass: 900 });

    if (reduceMotion) return;
    ball.current?.getAnimations().forEach((a) => a.cancel());
    ball.current?.animate(
      [
        { translate: "0 0", easing: "cubic-bezier(0.55, 0, 1, 0.45)" },
        { translate: `0 ${FALL_PX}px`, offset: FALL_MS / 520, easing: "cubic-bezier(0, 0.55, 0.45, 1)" },
        { translate: `0 ${FALL_PX - 10}px`, offset: (FALL_MS + 80) / 520, easing: "cubic-bezier(0.55, 0, 1, 0.45)" },
        { translate: `0 ${FALL_PX}px` },
      ],
      { duration: 520, fill: "forwards" }
    );
  }

  return (
    <div className={`${ui.stack} ${ui.stackCentered}`}>
      <div className={styles.drop} aria-hidden="true">
        <div ref={ball} className={styles.ball} />
        <div className={styles.floor} />
      </div>
      <div className={ui.row}>
        <SegmentedControl
          aria-label="Play the sound at"
          options={[
            { value: "start", label: "At the start" },
            { value: "contact", label: "At contact" },
          ]}
          value={when}
          onChange={setWhen}
        />
        <Button onClick={drop}>Drop</Button>
      </div>
    </div>
  );
}

/* ─── 2. Never the same sound twice ────────────────────────────────────────*/

// The same spreads Effort Keeper uses: ±30 cents of pitch, ±10% of level.
const PITCH_DRIFT = 30;
const GAIN_DRIFT = 0.1;
const TAPS_SHOWN = 16;

type Tap = { id: number; cents: number; gain: number };

export function RepetitionDemo() {
  const [mode, setMode] = useState("varied");
  const [taps, setTaps] = useState<Tap[]>([]);
  const nextId = useRef(0);

  function tap() {
    const ac = audio();
    const varied = mode === "varied";
    const c = varied ? spread() * PITCH_DRIFT : 0;
    const g = varied ? 1 + spread() * GAIN_DRIFT : 1;
    const now = ac.currentTime;
    tick(ac, now, 0.06 * g, varied ? Math.random() * 0.9 : 0);
    tone(ac, now, { freq: cents(1300, c), gain: 0.1 * g, decay: 0.035 });
    const id = nextId.current++;
    setTaps((list) => [...list.slice(-(TAPS_SHOWN - 1)), { id, cents: c, gain: g }]);
  }

  return (
    <div className={`${ui.stack} ${ui.stackCentered}`}>
      {/* Each mark is one tap: height is its pitch, strength its level. */}
      <div className={styles.taps} aria-hidden="true">
        {taps.map((t) => (
          <span
            key={t.id}
            className={styles.tapMark}
            style={{ translate: `0 ${(-t.cents / PITCH_DRIFT) * 10}px`, opacity: 0.35 + (t.gain - 0.9) * 3 }}
          />
        ))}
      </div>
      <div className={ui.row}>
        <SegmentedControl
          aria-label="Each tap"
          options={[
            { value: "same", label: "Identical" },
            { value: "varied", label: "Varied" },
          ]}
          value={mode}
          onChange={(v) => {
            setMode(v);
            setTaps([]);
          }}
        />
        <Button onClick={tap}>Tap</Button>
      </div>
    </div>
  );
}

/* ─── 3. Pitch that counts ─────────────────────────────────────────────────*/

const ROOT = 523.25; // C5
const PENTATONIC = [0, 2, 4, 7, 9];
const IONIAN = [0, 2, 4, 5, 7, 9, 11];
const note = (scale: number[], n: number) =>
  ROOT * Math.pow(2, (scale[n % scale.length] + 12 * Math.floor(n / scale.length)) / 12);
const QUOTA = 5;
// A pause this long starts the climb again from the bottom, as in Effort Keeper.
const STREAK_RESET_MS = 1400;

export function CountDemo() {
  const [steps, setSteps] = useState<number[]>([]);
  const last = useRef(0);
  const done = steps.length === QUOTA;

  function log() {
    const ac = audio();
    const now = ac.currentTime;
    if (done) {
      setSteps([]);
      return;
    }
    const nowMs = performance.now();
    const previous = steps.at(-1);
    const step = previous === undefined || nowMs - last.current > STREAK_RESET_MS ? 0 : previous + 1;
    last.current = nowMs;
    tick(ac, now, 0.04, Math.random() * 0.9);
    tone(ac, now, { freq: note(PENTATONIC, step), gain: 0.12, decay: 0.12, lowpass: 4200 });
    const next = [...steps, step];
    setSteps(next);
    if (next.length === QUOTA) {
      // The resolution: a major chord, root to octave, 60ms apart, the top
      // note ringing longest.
      [0, 2, 4, 7].forEach((n, i) => {
        tone(ac, now, {
          freq: note(IONIAN, n),
          gain: 0.1 * (1 - i * 0.05),
          decay: i === 3 ? 0.5 : 0.2,
          at: 0.2 + i * 0.06,
          lowpass: 5000,
        });
      });
    }
  }

  return (
    <div className={`${ui.stack} ${ui.stackCentered}`}>
      {/* Dots rise with the pitch they played. */}
      <ol className={styles.melody} aria-label={`${steps.length} of ${QUOTA} logged`}>
        {Array.from({ length: QUOTA }, (_, i) => (
          <li
            key={i}
            className={styles.melodyDot}
            data-filled={i < steps.length || undefined}
            data-done={done || undefined}
            style={i < steps.length ? { translate: `0 ${-steps[i] * 6}px` } : undefined}
          />
        ))}
      </ol>
      <Button onClick={log}>{done ? "Start over" : "Log"}</Button>
    </div>
  );
}

/* ─── 4. Done, not an alarm ────────────────────────────────────────────────*/

function playAlarm() {
  const ac = audio();
  const now = ac.currentTime;
  // Square wave, 2.8kHz, three flat pulses: the shape alarms are built on.
  for (let i = 0; i < 3; i++) {
    tone(ac, now, { freq: 2800, gain: 0.03, decay: 0.01, hold: 0.09, at: i * 0.15, type: "square" });
  }
}

function playConfirmation() {
  const ac = audio();
  const now = ac.currentTime;
  // One event: a sine triad cascading 70ms apart, decaying, low-passed.
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    tone(ac, now, { freq, gain: 0.1, decay: i === 2 ? 0.45 : 0.3, at: i * 0.07, lowpass: 3000 });
  });
}

export function AlarmDemo() {
  return (
    <div className={styles.pair}>
      <div className={styles.shape}>
        {/* Level over time: three flat-topped pulses. */}
        <svg viewBox="0 0 120 40" aria-hidden="true">
          <path d="M4 36 H14 V8 H32 V36 H44 V8 H62 V36 H74 V8 H92 V36 H116" />
        </svg>
        <Button onClick={playAlarm}>Alarm-shaped</Button>
      </div>
      <div className={styles.shape}>
        {/* Level over time: three staggered notes, each decaying. */}
        <svg viewBox="0 0 120 40" aria-hidden="true">
          <path d="M4 36 H10 L12 10 C20 26 30 34 44 36" />
          <path d="M18 36 L20 12 C28 26 38 34 54 36" />
          <path d="M26 36 L28 14 C40 28 60 35 116 36" />
        </svg>
        <Button onClick={playConfirmation}>Confirmation-shaped</Button>
      </div>
    </div>
  );
}
