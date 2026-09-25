# Effort Keeper reel

Source for `public/work/effort-keeper/reel-{light,dark}.mp4`, the homepage video.

`reel.html` is one 1440×1440 page where every frame is a pure function of time:
`seek(t)` writes every style from scratch. Springs are closed-form step
responses, and a value that changes target many times is the sum of one spring
per change, so the 20 s loop is periodic (frame 20 s equals frame 0, velocity
included). Tempo is 120 BPM; something happens on every beat.

Assets come from the Effort Keeper app: its fonts, blob art rendered by its own
`BlobAvatar`, and `ek-audio.js`, an esbuild bundle of its
`src/lib/audio/palette.ts`, so the sound effects are the app's own recipes.

## Render

Needs Node 22, `playwright` (Chromium) and `ffmpeg` (set `FFMPEG` to use another
binary). Serve this folder on port 4199, then:

```sh
python3 -m http.server 4199 &
THEME=light node shoot.mjs 0.3 5.3 10.8   # stills for review, into beats/
node audio.mjs                             # renders audio-raw.json via the app's engine
python3 fold-audio.py                      # tails past 20 s wrap onto the start; writes sfx.wav
THEME=light node render.mjs                # 60 fps, 4 subframes per frame blended for motion blur
THEME=dark node render.mjs
sh encode.sh light && sh encode.sh dark    # 1080², H.264 + AAC, and a poster from frame 0
```

`audio.mjs` renders each cue alone first and places it by its measured first
peak, so every sound lands on the frame of the contact that causes it.
