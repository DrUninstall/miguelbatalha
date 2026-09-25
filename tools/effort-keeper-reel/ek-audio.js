(() => {
  // ../../../../../../home/user/efforttracker/src/lib/audio/engine.ts
  var DEFAULT_VOLUME = 0.7;
  var MAX_VOICES = 24;
  var NOISE_SECONDS = 2;
  var bus = null;
  var volume = DEFAULT_VOLUME;
  var voices = 0;
  function contextCtor() {
    if (typeof window === "undefined") return null;
    const w = window;
    return w.AudioContext ?? w.webkitAudioContext ?? null;
  }
  function makeNoise(ctx) {
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * NOISE_SECONDS), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }
  function build() {
    const Ctor = contextCtor();
    if (!Ctor) return null;
    let ctx;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
    const input = ctx.createGain();
    input.gain.value = volume;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -18;
    limiter.knee.value = 12;
    limiter.ratio.value = 6;
    limiter.attack.value = 3e-3;
    limiter.release.value = 0.1;
    input.connect(limiter);
    limiter.connect(ctx.destination);
    const direct = ctx.createGain();
    direct.gain.value = volume;
    direct.connect(ctx.destination);
    return { ctx, input, direct, noise: makeNoise(ctx) };
  }
  function getBus() {
    if (!bus) bus = build();
    if (bus && bus.ctx.state === "suspended") void bus.ctx.resume();
    return bus;
  }
  function claimVoice(durationSeconds) {
    if (voices >= MAX_VOICES) return false;
    voices++;
    setTimeout(
      () => {
        voices = Math.max(0, voices - 1);
      },
      Math.ceil(durationSeconds * 1e3) + 40
    );
    return true;
  }
  var lastFired = /* @__PURE__ */ new Map();
  function throttled(key, minIntervalMs) {
    const now = Date.now();
    const prev = lastFired.get(key);
    if (prev !== void 0 && now - prev < minIntervalMs) return true;
    lastFired.set(key, now);
    return false;
  }

  // ../../../../../../home/user/efforttracker/src/lib/audio/scale.ts
  var OFFSETS = {
    pentatonic: [0, 2, 4, 7, 9],
    ionian: [0, 2, 4, 5, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    aeolian: [0, 2, 3, 5, 7, 8, 10]
  };
  var ROOT = 523.25;
  var SEMITONE = Math.pow(2, 1 / 12);
  function semitonesAt(mode, n) {
    const set = OFFSETS[mode];
    const octave = Math.floor(n / set.length);
    return set[n - octave * set.length] + 12 * octave;
  }
  function degree(mode, n) {
    return ROOT * Math.pow(2, semitonesAt(mode, n) / 12);
  }
  function cents(hz, value) {
    return hz * Math.pow(2, value / 1200);
  }

  // ../../../../../../home/user/efforttracker/src/lib/audio/streak.ts
  var streaks = /* @__PURE__ */ new Map();
  var RESET_MS = 1400;
  var CAP = 7;
  function nextIndex(key) {
    const now = Date.now();
    const prev = streaks.get(key);
    const index = !prev || now - prev.at > RESET_MS ? 0 : Math.min(prev.index + 1, CAP);
    streaks.set(key, { index, at: now });
    return index;
  }
  function resetStreak(key) {
    streaks.delete(key);
  }

  // ../../../../../../home/user/efforttracker/src/lib/audio/voices.ts
  var PITCH_DRIFT = 30;
  var GAIN_DRIFT = 0.1;
  var SILENCE = 1e-4;
  function varied(value, spread) {
    return value * (1 + (Math.random() * 2 - 1) * spread);
  }
  function drift(hz) {
    return cents(hz, (Math.random() * 2 - 1) * PITCH_DRIFT);
  }
  function tone(spec) {
    const bus2 = getBus();
    if (!bus2) return;
    const total = (spec.at ?? 0) + spec.decay + 0.05;
    if (!claimVoice(total)) return;
    const { ctx } = bus2;
    const input = spec.direct ? bus2.direct : bus2.input;
    const at = ctx.currentTime + (spec.at ?? 0);
    const freq = drift(spec.freq);
    const gain = Math.max(SILENCE, varied(spec.gain, GAIN_DRIFT));
    const decay = spec.decay;
    const amp = ctx.createGain();
    if (spec.reverse) {
      amp.gain.setValueAtTime(SILENCE, at);
      amp.gain.linearRampToValueAtTime(gain, at + decay);
      amp.gain.setValueAtTime(SILENCE, at + decay + 2e-3);
    } else if (spec.attack) {
      amp.gain.setValueAtTime(SILENCE, at);
      amp.gain.linearRampToValueAtTime(gain, at + spec.attack);
      amp.gain.exponentialRampToValueAtTime(SILENCE, at + decay);
    } else {
      amp.gain.setValueAtTime(gain, at);
      amp.gain.exponentialRampToValueAtTime(SILENCE, at + decay);
    }
    let tail = amp;
    if (spec.lowpass) {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = spec.lowpass;
      filter.Q.value = 0.5;
      amp.connect(filter);
      tail = filter;
    }
    tail.connect(input);
    const stopAt = at + decay + 0.03;
    const oscillators = [];
    const makeCarrier = (detuneCents, level) => {
      const osc = ctx.createOscillator();
      osc.type = spec.type ?? "sine";
      osc.frequency.setValueAtTime(freq, at);
      if (detuneCents) osc.detune.setValueAtTime(detuneCents, at);
      if (spec.sweepTo !== void 0) {
        osc.frequency.exponentialRampToValueAtTime(
          drift(spec.sweepTo),
          at + decay * (spec.sweepAt ?? 0.6)
        );
      }
      if (level === 1) {
        osc.connect(amp);
      } else {
        const trim = ctx.createGain();
        trim.gain.value = level;
        osc.connect(trim);
        trim.connect(amp);
      }
      oscillators.push(osc);
      return osc;
    };
    const carrier = makeCarrier(0, 1);
    if (spec.detune) makeCarrier(spec.detune, 0.5);
    if (spec.fm) {
      const mod = ctx.createOscillator();
      mod.type = "sine";
      mod.frequency.setValueAtTime(freq * spec.fm.ratio, at);
      const depth = ctx.createGain();
      depth.gain.setValueAtTime(freq * spec.fm.index, at);
      depth.gain.exponentialRampToValueAtTime(SILENCE, at + decay);
      mod.connect(depth);
      depth.connect(carrier.frequency);
      oscillators.push(mod);
    }
    if (spec.vibrato) {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = spec.vibrato.rate;
      const depth = ctx.createGain();
      depth.gain.value = spec.vibrato.cents;
      lfo.connect(depth);
      depth.connect(carrier.detune);
      oscillators.push(lfo);
    }
    for (const osc of oscillators) {
      osc.start(at);
      osc.stop(stopAt);
    }
  }
  var MATERIALS = {
    wood: { type: "bandpass", freq: 700, q: 2, duration: 6e-3 },
    key: { type: "bandpass", freq: 1800, q: 1.2, duration: 4e-3 },
    felt: { type: "lowpass", freq: 500, q: 0.7, duration: 0.01 },
    air: { type: "highpass", freq: 5e3, q: 0.7, duration: 0.025 }
  };
  function transient(spec) {
    const bus2 = getBus();
    if (!bus2) return;
    const material = MATERIALS[spec.material];
    const duration = spec.duration ?? material.duration;
    if (!claimVoice((spec.at ?? 0) + duration + 0.05)) return;
    const { ctx, input, noise } = bus2;
    const at = ctx.currentTime + (spec.at ?? 0);
    const gain = Math.max(SILENCE, varied(spec.gain, GAIN_DRIFT));
    const source = ctx.createBufferSource();
    source.buffer = noise;
    const offset = Math.random() * (noise.duration - duration - 0.01);
    const filter = ctx.createBiquadFilter();
    filter.type = material.type;
    filter.frequency.setValueAtTime(varied(spec.filterFrom ?? material.freq, 0.08), at);
    filter.Q.value = spec.q ?? material.q;
    if (spec.filterTo !== void 0) {
      filter.frequency.exponentialRampToValueAtTime(spec.filterTo, at + duration);
    }
    const amp = ctx.createGain();
    if (spec.attack) {
      amp.gain.setValueAtTime(SILENCE, at);
      amp.gain.linearRampToValueAtTime(gain, at + spec.attack);
      amp.gain.exponentialRampToValueAtTime(SILENCE, at + duration);
    } else {
      amp.gain.setValueAtTime(gain, at);
      amp.gain.exponentialRampToValueAtTime(SILENCE, at + duration);
    }
    source.connect(filter);
    filter.connect(amp);
    amp.connect(input);
    source.start(at, offset, duration + 0.01);
    source.stop(at + duration + 0.02);
  }
  function sparkle(spec) {
    let offset = spec.at ?? 0;
    for (let i = 0; i < spec.count; i++) {
      offset += 0.015 + Math.random() * 0.025;
      tone({
        freq: degree(spec.mode, spec.from + 4 + Math.floor(Math.random() * 8)),
        gain: spec.gain * (0.7 + Math.random() * 0.3),
        decay: 0.06 + Math.random() * 0.05,
        at: offset,
        type: "triangle"
      });
    }
  }

  // ../../../../../../home/user/efforttracker/src/lib/audio/palette.ts
  var P = (n) => degree("pentatonic", n);
  var I = (n) => degree("ionian", n);
  var M = (n) => degree("mixolydian", n);
  var A = (n) => degree("aeolian", n);
  var MALLET = { ratio: 2, index: 1.4 };
  var click = {
    throttle: 25,
    play: ({ volume: volume2 = 1 }) => {
      transient({ material: "key", gain: 0.055 * volume2 });
      tone({ freq: P(-3), gain: 0.05 * volume2, decay: 0.045, lowpass: 3200 });
    }
  };
  var tick = {
    throttle: 22,
    play: ({ volume: volume2 = 1 }) => {
      transient({ material: "wood", gain: 0.05 * volume2 });
      tone({ freq: P(2), gain: 0.014 * volume2, decay: 0.03 });
    }
  };
  var THROW = 0.086;
  var toggleOn = {
    play: ({ volume: volume2 = 1 }) => {
      tone({ freq: I(-3), gain: 0.06 * volume2, decay: 0.025, attack: 1e-3, lowpass: 2400 });
      tone({ freq: I(-2), gain: 0.055 * volume2, decay: 0.03, attack: 1e-3, at: THROW, lowpass: 2400 });
    }
  };
  var toggleOff = {
    play: ({ volume: volume2 = 1 }) => {
      tone({ freq: I(-2), gain: 0.055 * volume2, decay: 0.025, attack: 1e-3, lowpass: 2400 });
      tone({ freq: I(-3), gain: 0.06 * volume2, decay: 0.03, attack: 1e-3, at: THROW, lowpass: 2400 });
    }
  };
  var lightSwitch = (on) => ({
    throttle: 40,
    play: ({ volume: volume2 = 1 }) => {
      transient({ material: "key", gain: 0.08 * volume2, duration: 3e-3, filterFrom: on ? 4200 : 3e3, q: 1.6 });
      transient({ material: "wood", gain: 0.045 * volume2, at: 0.012, duration: 7e-3, filterFrom: on ? 1100 : 850 });
      tone({ freq: on ? P(-2) : P(-4), gain: 0.028 * volume2, decay: 0.022, attack: 5e-4, at: 0.012, lowpass: 1600 });
    }
  });
  var navigate = {
    throttle: 60,
    play: ({ volume: volume2 = 1, direction = 1 }) => {
      transient({ material: "key", gain: 0.04 * volume2, filterFrom: 2200 });
      tone({
        freq: direction >= 0 ? P(5) : P(0),
        gain: 0.052 * volume2,
        decay: 0.03,
        lowpass: 5200
      });
    }
  };
  var type = {
    throttle: 12,
    play: ({ volume: volume2 = 1 }) => {
      tone({ freq: P(7), type: "sawtooth", gain: 0.032 * volume2, decay: 35e-4, lowpass: 7e3 });
      transient({ material: "key", gain: 0.022 * volume2, duration: 2e-3, filterFrom: 7e3 });
    }
  };
  var typeSpace = {
    throttle: 12,
    play: ({ volume: volume2 = 1 }) => {
      tone({ freq: P(4), type: "sawtooth", gain: 0.034 * volume2, decay: 5e-3, lowpass: 4800 });
      transient({ material: "key", gain: 0.02 * volume2, duration: 3e-3, filterFrom: 4600 });
    }
  };
  var back = {
    play: ({ volume: volume2 = 1 }) => {
      transient({ material: "felt", gain: 0.05 * volume2 });
      tone({ freq: P(-5), gain: 0.06 * volume2, decay: 0.05, sweepTo: P(-7), lowpass: 1600 });
    }
  };
  var sheetOpen = {
    play: ({ volume: volume2 = 1 }) => {
      transient({ material: "wood", gain: 0.25 * volume2, duration: 0.062, attack: 0.018, filterFrom: 780, q: 3.5 });
    }
  };
  var sheetClose = {
    play: ({ volume: volume2 = 1 }) => {
      transient({ material: "wood", gain: 0.28 * volume2, duration: 0.078, attack: 0.016, filterFrom: 620, q: 3.5 });
    }
  };
  var error = {
    play: ({ volume: volume2 = 1 }) => {
      tone({
        freq: 350,
        sweepTo: 220,
        sweepAt: 0.8,
        gain: 0.078 * volume2,
        decay: 0.1,
        attack: 8e-3,
        lowpass: 800
      });
      tone({
        freq: 280,
        sweepTo: 180,
        sweepAt: 0.75,
        gain: 0.055 * volume2,
        decay: 0.08,
        at: 0.1,
        attack: 5e-3,
        lowpass: 800
      });
    }
  };
  var undo = {
    play: ({ volume: volume2 = 1 }) => {
      tone({ freq: A(-5), gain: 0.06 * volume2, decay: 0.09, reverse: true, lowpass: 2e3 });
      transient({ material: "wood", gain: 0.04 * volume2, at: 0.09 });
    }
  };
  var LOG_BASE = -2;
  function logVoice(volume2, counted) {
    const step = nextIndex("log");
    transient({ material: counted ? "key" : "wood", gain: 0.05 * volume2 });
    tone({
      freq: P(LOG_BASE + step),
      gain: 0.07 * volume2,
      decay: counted ? 0.09 : 0.13,
      fm: MALLET,
      lowpass: 4200
    });
  }
  var log = { throttle: 40, play: ({ volume: volume2 = 1 }) => logVoice(volume2, false) };
  var pop = { throttle: 40, play: ({ volume: volume2 = 1 }) => logVoice(volume2, true) };
  var logOvertime = {
    throttle: 40,
    play: ({ volume: volume2 = 1 }) => {
      transient({ material: "felt", gain: 0.035 * volume2 });
      tone({ freq: P(LOG_BASE - 5), gain: 0.045 * volume2, decay: 0.1, lowpass: 2200 });
    }
  };
  var commit = {
    play: ({ volume: volume2 = 1 }) => {
      transient({ material: "key", gain: 0.05 * volume2 });
      tone({ freq: I(0), gain: 0.07 * volume2, decay: 0.16, fm: MALLET, lowpass: 4e3 });
      tone({ freq: I(4), gain: 0.065 * volume2, decay: 0.26, at: 0.075, fm: MALLET, lowpass: 4e3 });
    }
  };
  var complete = {
    play: ({ volume: volume2 = 1, plain }) => {
      resetStreak("log");
      const gain = 0.09 * volume2;
      tone({ freq: I(0), gain, decay: 0.22, fm: MALLET, lowpass: 5e3 });
      tone({ freq: I(2), gain: gain * 0.95, decay: 0.24, at: 0.055, fm: MALLET, lowpass: 5e3 });
      tone({ freq: I(4), gain: gain * 0.9, decay: 0.26, at: 0.11, fm: MALLET, lowpass: 5e3 });
      tone({ freq: I(6), gain: gain * 0.5, decay: 0.08, at: 0.16, lowpass: 5e3 });
      tone({ freq: I(7), gain: gain * 0.95, decay: 0.45, at: 0.185, fm: MALLET, lowpass: 5e3 });
      if (plain) return;
      sparkle({ mode: "ionian", from: 7, count: 3, gain: gain * 0.3, at: 0.2 });
      transient({ material: "air", gain: 0.02 * volume2, duration: 0.3, attack: 0.12, at: 0.18 });
    }
  };
  var closure = {
    play: ({ volume: volume2 = 1, plain }) => {
      resetStreak("log");
      const gain = 0.075 * volume2;
      tone({ freq: M(-1), gain, decay: 0.4, at: 0, fm: MALLET, lowpass: 2400 });
      tone({ freq: M(-3), gain: gain * 0.95, decay: 0.45, at: 0.13, fm: MALLET, lowpass: 2400 });
      tone({ freq: M(-7), gain: gain * 0.9, decay: 0.8, at: 0.26, fm: MALLET, lowpass: 2e3 });
      tone({ freq: M(-14), gain: gain * 0.35, decay: 0.9, at: 0.26, attack: 0.15, lowpass: 600 });
      if (plain) return;
      sparkle({ mode: "mixolydian", from: 0, count: 4, gain: gain * 0.22, at: 0.3 });
    }
  };
  var milestone = {
    play: ({ volume: volume2 = 1, progress = 0.5, plain }) => {
      const step = Math.round(progress * 6);
      const gain = 0.07 * volume2 * (0.8 + progress * 0.4);
      tone({ freq: I(step), gain, decay: 0.16, fm: MALLET, lowpass: 4200 });
      tone({ freq: I(step + 2), gain: gain * 0.85, decay: 0.22, at: 0.07, fm: MALLET, lowpass: 4200 });
      if (plain || progress < 0.7) return;
      sparkle({ mode: "ionian", from: step + 2, count: 2, gain: gain * 0.25, at: 0.1 });
    }
  };
  var achievement = {
    play: ({ volume: volume2 = 1, plain }) => {
      const gain = 0.09 * volume2;
      [0, 2, 4, 7].forEach((n, i) => {
        tone({
          freq: I(n),
          gain: gain * (1 - i * 0.05),
          decay: i === 3 ? 0.5 : 0.2,
          at: i * 0.06,
          fm: MALLET,
          lowpass: 5e3,
          vibrato: i === 3 ? { rate: 6, cents: 12 } : void 0
        });
      });
      if (plain) return;
      sparkle({ mode: "ionian", from: 7, count: 4, gain: gain * 0.28, at: 0.22 });
    }
  };
  function artifact(tier) {
    const notes = [
      [0, 4],
      [0, 4, 7],
      [0, 4, 7, 9, 11]
    ][tier];
    const sparkles = [0, 2, 5][tier];
    const gainBase = [0.085, 0.1, 0.11][tier];
    return {
      play: ({ volume: volume2 = 1, plain }) => {
        const gain = gainBase * volume2;
        notes.forEach((n, i) => {
          tone({
            freq: M(n),
            gain: gain * (1 - i * 0.04),
            decay: i === notes.length - 1 ? 0.45 + tier * 0.15 : 0.22,
            at: i * 0.055,
            fm: MALLET,
            lowpass: 4600
          });
          if (tier === 2) {
            tone({ freq: M(n + 7), gain: gain * 0.12, decay: 0.3, at: i * 0.055, type: "triangle" });
          }
        });
        if (plain || !sparkles) return;
        sparkle({
          mode: "mixolydian",
          from: 7,
          count: sparkles,
          gain: gain * 0.25,
          at: notes.length * 0.055
        });
      }
    };
  }
  var blobPoke = {
    throttle: 90,
    play: ({ volume: volume2 = 1 }) => {
      const n = Math.floor(Math.random() * 7);
      transient({ material: "felt", gain: 0.04 * volume2 });
      tone({
        freq: M(n),
        gain: 0.07 * volume2,
        decay: 0.2,
        sweepTo: M(n + 1),
        sweepAt: 0.35,
        fm: MALLET,
        vibrato: { rate: 7, cents: 18 },
        lowpass: 3600
      });
    }
  };
  var timerStart = {
    play: ({ volume: volume2 = 1 }) => {
      transient({ material: "key", gain: 0.05 * volume2 });
      tone({ freq: I(0), gain: 0.07 * volume2, decay: 0.14, fm: MALLET, lowpass: 3600 });
      tone({ freq: I(3), gain: 0.06 * volume2, decay: 0.2, at: 0.07, fm: MALLET, lowpass: 3600 });
    }
  };
  var timerPause = {
    play: ({ volume: volume2 = 1 }) => {
      transient({ material: "felt", gain: 0.045 * volume2 });
      tone({ freq: I(3), gain: 0.06 * volume2, decay: 0.13, sweepTo: I(0), lowpass: 1800 });
    }
  };
  var phaseFocus = {
    play: ({ volume: volume2 = 1 }) => {
      const gain = 0.075 * volume2;
      tone({ freq: I(4), gain, decay: 0.3, fm: MALLET, lowpass: 2800 });
      tone({ freq: I(2), gain: gain * 0.9, decay: 0.35, at: 0.11, fm: MALLET, lowpass: 2800 });
      tone({ freq: I(0), gain: gain * 0.85, decay: 0.5, at: 0.22, fm: MALLET, lowpass: 2400 });
    }
  };
  var phaseBreak = {
    play: ({ volume: volume2 = 1 }) => {
      const gain = 0.075 * volume2;
      transient({ material: "air", gain: 0.025 * volume2, duration: 0.12, attack: 0.05 });
      tone({ freq: I(0), gain, decay: 0.3, fm: MALLET, lowpass: 3600 });
      tone({ freq: I(2), gain: gain * 0.9, decay: 0.35, at: 0.11, fm: MALLET, lowpass: 3600 });
      tone({ freq: I(4), gain: gain * 0.9, decay: 0.5, at: 0.22, fm: MALLET, lowpass: 3600 });
    }
  };
  var timerEnd = {
    play: ({ volume: volume2 = 1, plain }) => {
      const gain = 0.085 * volume2;
      tone({ freq: I(4), gain, decay: 0.35, fm: { ratio: 3, index: 2 }, lowpass: 4600 });
      tone({ freq: I(7), gain: gain * 0.9, decay: 0.7, at: 0.12, fm: { ratio: 3, index: 2 }, lowpass: 4600 });
      if (plain) return;
      transient({ material: "air", gain: 0.018 * volume2, duration: 0.35, attack: 0.15, at: 0.12 });
    }
  };
  var bloomTick = {
    play: ({ volume: volume2 = 1, frequency = 1046.5 }) => {
      tone({ freq: frequency, gain: 0.05 * volume2, decay: 0.055, direct: true });
    }
  };
  var bloomPress = {
    play: ({ volume: volume2 = 1, frequency = 1046.5 }) => {
      const root = frequency / 2;
      tone({ freq: root, gain: 0.11 * volume2, decay: 0.09, sweepTo: root * 1.26, direct: true });
    }
  };
  var bloomCommit = {
    play: ({ volume: volume2 = 1, frequency = 1046.5 }) => {
      const root = frequency / 2;
      tone({ freq: root, gain: 0.09 * volume2, decay: 0.16, direct: true });
      tone({ freq: root * 1.5, gain: 0.075 * volume2, decay: 0.22, at: 0.085, direct: true });
    }
  };
  var bloomCancel = {
    play: ({ volume: volume2 = 1, frequency = 1046.5 }) => {
      const root = frequency / 2;
      tone({ freq: root * 1.5, gain: 0.07 * volume2, decay: 0.12 });
      tone({ freq: root, gain: 0.055 * volume2, decay: 0.18, at: 0.07 });
    }
  };
  var holdStep = {
    throttle: 20,
    play: ({ volume: volume2 = 1, progress = 0 }) => {
      transient({ material: "wood", gain: (0.028 + progress * 0.03) * volume2 });
      tone({
        freq: P(Math.round(progress * 6)),
        gain: (0.018 + progress * 0.028) * volume2,
        decay: 0.035,
        lowpass: 3600
      });
    }
  };
  var checkIn = {
    play: ({ volume: volume2 = 1, plain }) => {
      const gain = 0.088 * volume2;
      if (!plain) {
        transient({ material: "air", gain: 0.03 * volume2, duration: 0.34, attack: 0.13 });
      }
      transient({ material: "key", gain: 0.055 * volume2 });
      tone({ freq: I(0), gain, decay: 0.26, fm: MALLET, lowpass: 4800 });
      tone({ freq: I(4), gain: gain * 0.92, decay: 0.3, at: 0.06, fm: MALLET, lowpass: 4800 });
      tone({
        freq: I(7),
        gain: gain * 0.9,
        decay: 0.55,
        at: 0.13,
        fm: MALLET,
        lowpass: 4800,
        vibrato: { rate: 5.5, cents: 10 }
      });
      if (plain) return;
      sparkle({ mode: "ionian", from: 9, count: 3, gain: gain * 0.26, at: 0.2 });
    }
  };
  var gauge = {
    throttle: 25,
    play: ({ volume: volume2 = 1, progress = 0.5 }) => {
      transient({ material: "wood", gain: 0.04 * volume2 });
      tone({
        freq: P(Math.round(progress * 7) - 2),
        gain: 0.042 * volume2,
        decay: 0.05,
        lowpass: 3400
      });
    }
  };
  var RECIPES = {
    click,
    tap: click,
    tick,
    toggleOn,
    toggleOff,
    lightOn: lightSwitch(true),
    lightOff: lightSwitch(false),
    navigate,
    navigation: navigate,
    type,
    typeSpace,
    back,
    pop,
    sheetOpen,
    sheetClose,
    error,
    undo,
    log,
    logOvertime,
    success: log,
    commit,
    complete,
    closure,
    milestone,
    milestone25: { play: (o) => milestone.play({ ...o, progress: 0.25 }) },
    milestone50: { play: (o) => milestone.play({ ...o, progress: 0.5 }) },
    milestone75: { play: (o) => milestone.play({ ...o, progress: 0.75 }) },
    achievement,
    crystalEvolve: achievement,
    artifactCommon: artifact(0),
    artifactRare: artifact(1),
    artifactLegendary: artifact(2),
    blobPoke,
    holdStep,
    checkIn,
    gauge,
    timerStart,
    timerPause,
    phaseFocus,
    phaseBreak,
    timerEnd,
    toastInfo: tick,
    toastSuccess: { play: (o) => milestone.play({ ...o, progress: 0.5, plain: true }) },
    toastError: { play: (o) => error.play({ ...o, volume: (o.volume ?? 1) * 0.6 }) },
    bloomTick,
    bloomPress,
    bloomCommit,
    bloomCancel
  };
  function playRecipe(name, options) {
    const recipe = RECIPES[name];
    if (!recipe) return false;
    if ("throttle" in recipe && recipe.throttle && throttled(name, recipe.throttle)) return false;
    recipe.play(options);
    return true;
  }

  // ../../../../../../home/user/efforttracker/src/lib/oklch.ts
  var toLinear = (channel) => channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  var toGamma = (channel) => channel <= 31308e-7 ? 12.92 * channel : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
  var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  function hexToRgb(hex) {
    const value = hex.replace("#", "");
    const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16)
    ];
  }
  function rgbToHex([r, g, b]) {
    return `#${[r, g, b].map((c) => Math.round(clamp(c, 0, 255)).toString(16).padStart(2, "0")).join("")}`;
  }
  function rgbToOklch([r, g, b]) {
    const lr = toLinear(r / 255);
    const lg = toLinear(g / 255);
    const lb = toLinear(b / 255);
    const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
    const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
    const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
    const okL = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const okA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const okB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    const hue = Math.atan2(okB, okA) * 180 / Math.PI;
    return { l: okL, c: Math.hypot(okA, okB), h: hue < 0 ? hue + 360 : hue };
  }
  function oklchToLinearRgb({ l: okL, c, h }) {
    const rad = h * Math.PI / 180;
    const okA = c * Math.cos(rad);
    const okB = c * Math.sin(rad);
    const l = (okL + 0.3963377774 * okA + 0.2158037573 * okB) ** 3;
    const m = (okL - 0.1055613458 * okA - 0.0638541728 * okB) ** 3;
    const s = (okL - 0.0894841775 * okA - 1.291485548 * okB) ** 3;
    return [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
    ];
  }
  var EPSILON = 1e-4;
  var inGamut = (rgb) => rgb.every((channel) => channel >= -EPSILON && channel <= 1 + EPSILON);
  function oklchToRgb(colour) {
    let chroma = colour.c;
    if (!inGamut(oklchToLinearRgb(colour))) {
      let low = 0;
      let high = colour.c;
      for (let i = 0; i < 24; i += 1) {
        const mid = (low + high) / 2;
        if (inGamut(oklchToLinearRgb({ ...colour, c: mid }))) low = mid;
        else high = mid;
      }
      chroma = low;
    }
    const linear = oklchToLinearRgb({ ...colour, c: chroma });
    return {
      rgb: linear.map((channel) => Math.round(toGamma(clamp(channel, 0, 1)) * 255)),
      chroma
    };
  }
  var oklchToHex = (colour) => rgbToHex(oklchToRgb(colour).rgb);
  function apcaLuminance([r, g, b]) {
    const channel = (c) => Math.pow(clamp(c, 0, 255) / 255, 2.4);
    return 0.2126729 * channel(r) + 0.7151522 * channel(g) + 0.072175 * channel(b);
  }
  function apcaContrast(text, background) {
    const BLACK_THRESHOLD = 0.022;
    const BLACK_CLAMP = 1.414;
    const DELTA_Y_MIN = 5e-4;
    const LOW_CLIP = 0.1;
    const LOW_OFFSET = 0.027;
    const soft = (y) => y > BLACK_THRESHOLD ? y : y + Math.pow(BLACK_THRESHOLD - y, BLACK_CLAMP);
    const textY = soft(apcaLuminance(text));
    const bgY = soft(apcaLuminance(background));
    if (Math.abs(bgY - textY) < DELTA_Y_MIN) return 0;
    let contrast;
    if (bgY > textY) {
      const sapc = (Math.pow(bgY, 0.56) - Math.pow(textY, 0.57)) * 1.14;
      contrast = sapc < LOW_CLIP ? 0 : sapc - LOW_OFFSET;
    } else {
      const sapc = (Math.pow(bgY, 0.65) - Math.pow(textY, 0.62)) * 1.14;
      contrast = sapc > -LOW_CLIP ? 0 : sapc + LOW_OFFSET;
    }
    return Math.abs(contrast * 100);
  }
  function maxLightnessFor(text, chroma, hue, target) {
    let low = 0.15;
    let high = 0.98;
    for (let i = 0; i < 24; i += 1) {
      const mid = (low + high) / 2;
      if (apcaContrast(text, oklchToRgb({ l: mid, c: chroma, h: hue }).rgb) >= target) low = mid;
      else high = mid;
    }
    return low;
  }
  function minLightnessFor(text, chroma, hue, target) {
    let low = 0.02;
    let high = 0.99;
    for (let i = 0; i < 24; i += 1) {
      const mid = (low + high) / 2;
      if (apcaContrast(text, oklchToRgb({ l: mid, c: chroma, h: hue }).rgb) >= target) high = mid;
      else low = mid;
    }
    return high;
  }

  // ../../../../../../home/user/efforttracker/src/utils/taskColors.ts
  var TASK_COLOR_INK = "#0d0d10";
  var TASK_COLORS = [
    { value: "#ef736c", label: "Coral", gradient: ["#ff8c84", "#cb5550"] },
    { value: "#e6802d", label: "Orange", gradient: ["#fb984f", "#c36200"] },
    { value: "#c89600", label: "Amber", gradient: ["#ddac38", "#a77700"] },
    { value: "#65b553", label: "Green", gradient: ["#7fcb6e", "#489536"] },
    { value: "#00b99a", label: "Teal", gradient: ["#40cfb0", "#00997c"] },
    { value: "#00b3c9", label: "Cyan", gradient: ["#3ec8de", "#0093a8"] },
    { value: "#35a6f7", label: "Blue", gradient: ["#57bcff", "#0086d4"] },
    { value: "#968efa", label: "Violet", gradient: ["#aba5ff", "#796fd6"] },
    { value: "#c87cda", label: "Magenta", gradient: ["#dd94ee", "#a75eb8"] },
    { value: "#e472ac", label: "Pink", gradient: ["#f98bc1", "#c0548d"] },
    // the default sits after the hues: it is the absence of a choice,
    // and putting it first made the palette open on the same cap twice
    { value: "default", label: "Default", gradient: ["#ff9455", "#c25715"] }
  ];
  var TASK_SHADES = ["light", "mid", "deep"];
  var TASK_COLOR_ICON_LC = 60;
  var INK_RGB = hexToRgb(TASK_COLOR_INK);
  var WHITE_RGB = [255, 255, 255];
  var LIGHT_LIFT = 0.13;
  var LIGHT_CHROMA = 0.86;
  var DEEP_DROP = 0.22;
  var DEEP_CHROMA = 0.92;
  var TASK_BLOOM = TASK_COLORS.filter(
    (colour) => colour.value !== "default"
  ).map((colour) => {
    const base = rgbToOklch(hexToRgb(colour.value));
    const lightChroma = base.c * LIGHT_CHROMA;
    const lightL = Math.max(
      base.l + LIGHT_LIFT,
      minLightnessFor(INK_RGB, lightChroma, base.h, TASK_COLOR_ICON_LC)
    );
    const deepChroma = base.c * DEEP_CHROMA;
    const deepL = Math.min(
      base.l - DEEP_DROP,
      maxLightnessFor(WHITE_RGB, deepChroma, base.h, TASK_COLOR_ICON_LC)
    );
    return {
      label: colour.label,
      hue: base.h,
      shades: {
        light: oklchToHex({ l: lightL, c: lightChroma, h: base.h }),
        mid: colour.value,
        deep: oklchToHex({ l: deepL, c: deepChroma, h: base.h })
      }
    };
  });
  function findBloomChoice(hex) {
    for (let hue = 0; hue < TASK_BLOOM.length; hue += 1) {
      for (const shade of TASK_SHADES) {
        if (TASK_BLOOM[hue].shades[shade] === hex) return { hue, shade };
      }
    }
    return void 0;
  }
  function nearestBloomChoice(hex) {
    const exact = findBloomChoice(hex);
    if (exact) return exact;
    const target = rgbToOklch(hexToRgb(hex));
    let hue = 0;
    let bestAngle = Infinity;
    TASK_BLOOM.forEach((entry, index) => {
      const raw = Math.abs(entry.hue - target.h) % 360;
      const angle = raw > 180 ? 360 - raw : raw;
      if (angle < bestAngle) {
        bestAngle = angle;
        hue = index;
      }
    });
    let shade = "mid";
    let bestDelta = Infinity;
    for (const step of TASK_SHADES) {
      const delta = Math.abs(rgbToOklch(hexToRgb(TASK_BLOOM[hue].shades[step])).l - target.l);
      if (delta < bestDelta) {
        bestDelta = delta;
        shade = step;
      }
    }
    return { hue, shade };
  }

  // ../../../../../../home/user/efforttracker/src/utils/bloomSound.ts
  var BLOOM_SCALE = [
    523.25,
    // C5
    587.33,
    // D5
    659.25,
    // E5
    783.99,
    // G5
    880,
    // A5
    1046.5,
    // C6
    1174.66,
    // D6
    1318.51,
    // E6
    1567.98,
    // G6
    1760
    // A6
  ];
  var SHADE_INTERVAL = {
    deep: 0.75,
    mid: 1,
    light: 1.25
  };
  function bloomPitch(hex) {
    const { hue, shade } = nearestBloomChoice(hex);
    return BLOOM_SCALE[hue] * SHADE_INTERVAL[shade];
  }

  // entry.ts
  window.EK = { playRecipe, degree, bloomPitch };
})();
