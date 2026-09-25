import { chromium } from 'playwright';
import fs from 'fs';
const theme = process.env.THEME || 'light';
const times = process.argv.slice(2).map(Number);
const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1440,height:1440}})).newPage();
p.on('pageerror',e=>console.log('ERR',String(e))); p.on('console',m=>{ if(m.type()==='error') console.log('CONSOLE',m.text()); });
await p.goto('http://localhost:4199/reel.html?theme='+theme); await p.waitForFunction(()=>window.READY);
const OUT=process.env.OUT||'beats'; fs.mkdirSync(OUT,{recursive:true});
for (const t of times) { await p.evaluate(t=>seek(t), t); await p.screenshot({path:`${OUT}/${theme}-${String(Math.round(t*100)).padStart(4,'0')}.png`}); }
await b.close();
