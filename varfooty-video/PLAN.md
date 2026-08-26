# VarFooty Launch Video — Build Plan

A from-scratch rebuild aiming for a real "SaaS launch ad" feel, in the spirit of the
LangEase reference video you sent. This file is my live worklog. I update the checkboxes
as I go, so you can watch progress.

Last updated: live during the build.

---

## The core problem we're fixing

The old video used a real-time iPhone screen recording (~6 fps, jittery, cropped). No
amount of editing fully rescues bad source footage. So we are not screen-recording in
real time at all.

**New approach (the professional one):**

1. **Playwright drives the real app** in an automated browser and clicks through every
   real flow (demo login, readiness, train, plan, fuel, AI coach).
2. Instead of a janky live recording, it captures **pixel-perfect frames** at 3x
   resolution: full screens, tall full-page captures for scroll sections, individual UI
   cards, and before/after state pairs for interactions.
3. **Remotion synthesizes ALL motion at a locked 60 fps** over those crisp frames:
   pans, zooms, transitions, kinetic typography, floating UI, the score counting up.

This is exactly the reasoning the Remotion team gives for rendering frames instead of
recording a browser: a recording is locked to a variable, jittery frame rate, while a
frame-by-frame render is deterministic and perfectly smooth. Every pixel of motion in the
final video is computed, so there is zero jitter by construction.

### Research that informed this (SaaS launch conventions)
- Most top SaaS launches open on an **abstract, non-UI cinematic hook** in the first ~3s
  (kinetic type / geometry) to frame the product as an event, then reveal the UI.
- **Kinetic typography** is treated as a physical object that pushes and reveals UI.
- **Seamless morphs and continuous camera pans** between features (one cohesive world)
  rather than hard cuts.
- **Brand-locked palette and type** so the motion design feels native to the product.
- Music with a clear build, a drop on the product reveal, and a resolve on the CTA.

Sources: contentbeta motion-graphics-styles, advids SaaS launch teasers, Remotion
discussion #4351 (frames vs recording), the playwright-recording skill for Remotion.

---

## Look & feel (brand-locked to the app)

- **Canvas:** near-black `#06070A` with a slow-drifting green radial glow, faint pitch
  lines, film grain, vignette.
- **Accent:** electric green `#12FC74` (sampled from the app's primary button).
- **Type:** Bricolage Grotesque (display, characterful + bold), Hanken Grotesk (body),
  a monospace for stat labels and numbers to echo the app's mono input fields.
- **Device:** the app shown in a sleek floating phone frame; hero moments zoom a single
  card to near full-bleed for impact, then pull back (the seamless-morph pattern).
- **Motion-graphics vocabulary:** kinetic captions synced to the beat, big stat numbers
  that count up, "exploded UI" floating cards lifted from real screenshots, thin-line
  accents, soft parallax.

---

## Soundtrack

Synthesized from scratch (royalty-free by construction, no downloads): a modern, uplifting
electronic bed at ~123 BPM so cuts land on the beat.
- Intro riser into the brand hit.
- Four-on-the-floor kick + sub bass + plucked arp + airy pad chord progression on the
  product reveal (the "drop").
- Filtered breakdown under the AI-coach moment.
- Clean resolve under the outro CTA.

---

## Storyboard (target ~80s, 60 fps)

1. **Cold open (0–4s):** black void, green grid/particles, kinetic hook line, brand mark
   assembles. Music riser → hit.
2. **Problem → promise (4–9s):** kinetic type — "Talent isn't the problem. A plan is." →
   VarFooty wordmark + tagline.
3. **Reveal (9–18s):** phone floats in; "Your readiness, scored." The 70 score counts up,
   the ring draws, the three category tiles (71 / 70 / 55) fly in.
4. **Train (18–32s):** "Coached, never generic." Drill card; a result logs and the score
   ticks 70 → 71.
5. **Plan / progress (32–45s):** "A roadmap to varsity." weekly plan, score climbing.
6. **Fuel (45–58s):** "Eat like an athlete." USDA search → results → macros.
7. **AI coach (58–72s):** "A coach that knows you." a question types in, an answer streams,
   grounded in the player's real data.
8. **Outro (72–80s):** wordmark, "Train with purpose. Make varsity.", varfoot.vercel.app,
   music resolves.

---

## Task checklist

### Phase 0 — Setup & research
- [x] Inspect app + existing Remotion project
- [x] Research SaaS launch conventions + capture technique
- [x] Confirm app screens (auth, home, tabs: TODAY/PLAN/TRAIN/FUEL/COACH)
- [x] Dev server up; Playwright + Chromium installed
- [x] Write this plan

### Phase 1 — Clean capture (Playwright, real app, 3x) ✅
- [x] Capture script that walks every flow (mobile, 3x device scale)
- [x] Full-screen crisp shots: auth, today, plan, progress, fuel, session, drill
- [x] Tall full-page strips for scroll sections (plan, progress)
- [x] Hero card crops (readiness ring, up-next, gap, coach note, score history, radar,
      drill progress, macro ring, meal, food result)
- [x] Live states: USDA search returns real foods; AI coach gives a real grounded answer
      ("prioritize your 5.9s Recovery Sprint... 70/100 readiness... next: Passing session")
- [x] Reviewed the asset library — all crisp and on-brand

### Phase 2 — Soundtrack ✅
- [x] Synthesized 83.9s track at 123 BPM (riser, drop, feature beds, filtered coach
      breakdown, recap, resolve) -> public/score.wav
- [x] Beat-locked section markers: reveal 7.8s, train 19.5s, plan 31.2s, fuel 41.0s,
      coach 52.7s, outro 66.3s, final hit 76.1s, end 83.9s

### Phase 3 — Remotion build (motion graphics) ✅
- [x] Scene system: cold open, reveal, train, plan, fuel, coach, recap, outro
- [x] Kinetic typography (word-by-word reveal), eyebrow, sub, chips, count-up
- [x] Persistent floating phone that pans across sections, swaps + scrolls screens
- [x] Readiness count-up, category chips, floating "exploded" UI cards
- [x] Beat-synced caption + scene timing (locked to the 123 BPM track)
- [x] Soundtrack wired via <Audio>
- [x] Validated every scene with stills; fixed headline spacing, screen-fit, and the
      tall roadmap capture

### Phase 4 — Render & deliver ✅
- [x] Rendered 5034 frames at 1920x1080 / 60 fps, H.264 + AAC stereo, 83.9s, ~29.5MB
- [x] Soundtrack muxed in
- [x] Delivered to ~/Desktop/varfooty-launch.mp4 and revealed in Finder (NOT published)

### Phase 5 — Combine the two GitHub skills (ULTIMATE cut) ✅
Combined EveryInc/product-launch-video (PLV) + AKCodez/promo-video-skill (PVS).
- [x] PVS: ElevenLabs voiceover (Daniel), 13 sections with emotional presets, timed to
      every scene boundary, generated via the skill's generate-voiceover.ts
- [x] Fixed all VO overlaps by nudging start times (no Whisper installed, verified via
      per-section durations vs scene windows)
- [x] PVS: music ducked under the VO via sidechain compression (not a flat -10dB bed)
- [x] PVS: brand-green metallic-swoosh transitions at every section boundary + matching
      panned swoosh SFX
- [x] PLV: ran the 4-lens review inline (layout / readability / narrative / brand)
- [x] Delivered ~/Desktop/varfooty-launch-ULTIMATE.mp4 and revealed in Finder (NOT published)
- API key stored in gitignored .env (delete anytime). Optional next: 9:16 portrait cut.

---

## Output

Final file will be written to the Desktop and revealed in Finder. Nothing gets published.
