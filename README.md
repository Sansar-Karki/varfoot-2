# varfoot-2

The source for the launch video I made for VarFooty, my soccer training app. The video is built in code with [Remotion](https://www.remotion.dev/), over screenshots that a Playwright script captures from the app.

The app itself is not in this repo. It is the separate [varfoot](https://github.com/Sansar-Karki/varfoot) project. All the code for this video is in `varfooty-video/`.

## What is in it

- **Two Remotion compositions** (`src/Root.tsx`)
  - `VarFooty`: the full launch video, 1920x1080 at 60 fps, about 84 seconds. Scenes are a cold open, the readiness score, drills, the weekly plan, nutrition, the AI coach, a recap and an outro (`src/scenes/` and `src/Main.tsx`).
  - `DemoShort`: a shorter cut of about 19 seconds, built around a phone screen recording (`src/DemoShort.tsx`).
- **Capture scripts** (`capture/*.mjs`). They drive the app in a mobile-sized browser with Playwright, log in with the app's demo user, and save 3x screenshots and card crops into `public/app/`. They expect the app at `http://localhost:3000`. Set `BASE` to point somewhere else.
- **Soundtrack** (`music/score.py`, `music/swoosh.py`). Two small Python scripts that synthesize the music and a swoosh sound with numpy and write WAV files into `public/`. The beat timing in `src/theme.ts` is locked to the 123 BPM track.
- **Voiceover** (`vo/`). The script, voice id and model settings are in `vo/voiceover-config.json`. The generated audio files are committed too.
- **`PLAN.md`**. My build notes and storyboard from when I made it.

All the app screens in the video show a demo account with made-up data.

## Tech stack

Remotion 4, React 19, TypeScript, Playwright, and Python 3 with numpy for the audio. Fonts come from `@remotion/google-fonts`.

## Running it

From `varfooty-video/`:

```bash
npm install
npm run studio    # open the Remotion preview
npm run render    # renders the VarFooty composition to out/varfooty.mp4
```

To re-capture the screenshots, start the VarFoot app locally first, make sure Playwright's Chromium is installed, then run a script such as `node capture/capture.mjs`. To regenerate the music, run `python3 music/score.py` (it needs numpy).

## Status

Finished project, kept as a record of how the video was made. It is not maintained. The repo has one commit, an import from my Mac in August 2026. The `varfoot` entry at the repo root is a leftover pointer to another repo and has no files in it.

## Author

Sansar Karki, [github.com/Sansar-Karki](https://github.com/Sansar-Karki)
