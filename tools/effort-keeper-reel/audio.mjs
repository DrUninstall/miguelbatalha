import { chromium } from 'playwright';
import fs from 'fs';
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext();
const SR = 48000;
const fresh = async () => { const p = await ctx.newPage(); await p.goto('http://localhost:4199/reel.html'); await p.waitForFunction(()=>window.READY); return p; };
let p = await fresh();
const cues = await p.evaluate(() => window.CUES);
await p.close();
// measure each cue's first peak once, rendered alone
const offsets = {};
for (const [, name, opts] of cues) {
  const key = name + JSON.stringify(opts || {});
  if (key in offsets) continue;
  const pg = await fresh();
  const [L] = await pg.evaluate(([n, o]) => window.renderAudio([[0.1, n, o]], 0.6), [name, opts]);
  await pg.close();
  const start = Math.round(0.1 * SR);
  let onset = start; while (onset < L.length && Math.abs(L[onset]) < 1e-4) onset++;
  let pk = onset, mx = 0;
  for (let i = onset; i < Math.min(L.length, onset + 0.04 * SR); i++) if (Math.abs(L[i]) > mx) { mx = Math.abs(L[i]); pk = i; }
  offsets[key] = (pk - start) / SR;
}
console.log(offsets);
const placed = cues.map(([t, n, o]) => [t - offsets[n + JSON.stringify(o || {})], n, o]);
p = await fresh();
const [L, R] = await p.evaluate((c) => window.renderAudio(c, 29), placed);
await b.close();
fs.writeFileSync('audio-raw.json', JSON.stringify({ L, R }));
