import { chromium } from 'playwright';
import { spawn } from 'child_process';
const FF = process.env.FFMPEG || 'ffmpeg';
const theme = process.env.THEME || 'light';
const FPS = 60, SUB = 4, T = 23, SHUTTER = 0.5;
const limit = Number(process.env.LIMIT || T * FPS);
const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1440,height:1440}})).newPage();
await p.goto('http://localhost:4199/reel.html?theme='+theme); await p.waitForFunction(()=>window.READY);
const ff = spawn(FF, ['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS*SUB),'-i','-',
  '-vf',`tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB-1})',setpts=N/${FPS}/TB`,
  '-c:v','libx264','-preset','slow','-crf','12','-pix_fmt','yuv444p','-r',String(FPS), `master-${theme}.mp4`], {stdio:['pipe','inherit','inherit']});
const t0 = Date.now();
for (let f = 0; f < limit; f++) {
  for (let k = 0; k < SUB; k++) {
    const t = f / FPS + ((k + 0.5) / SUB - 0.5) * SHUTTER / FPS;
    await p.evaluate((t)=>seek(t), t);
    const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain', r));
  }
  if (f % 120 === 0) console.log('frame', f, ((Date.now()-t0)/1000).toFixed(0)+'s');
}
ff.stdin.end(); await new Promise(r=>ff.on('close', r));
await b.close(); console.log('done', ((Date.now()-t0)/1000).toFixed(0)+'s');
