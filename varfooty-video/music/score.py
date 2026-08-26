#!/usr/bin/env python3
"""VarFooty launch-video soundtrack. Synthesized from scratch (royalty-free).
Modern uplifting electronic bed at 123 BPM: riser -> drop -> features -> filtered
breakdown under the AI coach -> resolve. Outputs stereo 44.1k WAV."""
import numpy as np, wave, struct, os, math

SR = 44100
BPM = 123.0
BEAT = 60.0 / BPM
BAR = BEAT * 4
N_BARS = 43
DUR = N_BARS * BAR
T = int(DUR * SR)
L = np.zeros(T); R = np.zeros(T)

def midi(m): return 440.0 * 2 ** ((m - 69) / 12.0)
def smp(sec): return int(sec * SR)

def env_adsr(n, a, d, s, r, peak=1.0):
    a, d, r = max(1, smp(a)), max(1, smp(d)), max(1, smp(r))
    sus = max(0, n - a - d - r)
    e = np.concatenate([
        np.linspace(0, peak, a, endpoint=False),
        np.linspace(peak, s * peak, d, endpoint=False),
        np.full(sus, s * peak),
        np.linspace(s * peak, 0, r, endpoint=True),
    ])
    if len(e) < n: e = np.concatenate([e, np.zeros(n - len(e))])
    return e[:n]

def add(buf_l, buf_r, sig, start, panL=0.5, panR=0.5):
    s = smp(start); e = s + len(sig)
    if s >= T: return
    if e > T: sig = sig[:T - s]; e = T
    buf_l[s:e] += sig * panL
    buf_r[s:e] += sig * panR

# ---- instruments -----------------------------------------------------------
def pad(notes, dur, peak=0.16):
    n = smp(dur)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for i, m in enumerate(notes):
        f = midi(m)
        det = 1 + (0.004 * (i - len(notes) / 2))  # slight spread
        wave_ = (np.sin(2 * np.pi * f * det * t)
                 + 0.5 * np.sin(2 * np.pi * 2 * f * det * t)
                 + 0.22 * np.sin(2 * np.pi * 3 * f * det * t)
                 + 0.12 * np.sin(2 * np.pi * 4 * f * det * t))
        out += wave_
    out /= max(1, len(notes))
    e = env_adsr(n, 0.25, 0.4, 0.85, 0.6, peak)
    return out * e

def pluck(m, dur=0.34, peak=0.22):
    n = smp(dur); t = np.arange(n) / SR; f = midi(m)
    w = (np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * 2 * f * t)
         + 0.35 * np.sin(2 * np.pi * 3 * f * t) + 0.18 * np.sin(2 * np.pi * 5 * f * t))
    e = np.exp(-t * 9.0) * (1 - np.exp(-t * 400))
    return w * e * peak

def kick(dur=0.34, peak=0.95):
    n = smp(dur); t = np.arange(n) / SR
    fstart, fend = 150.0, 48.0
    f = fend + (fstart - fend) * np.exp(-t * 32)
    phase = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(phase) * np.exp(-t * 6.2)
    click = (np.random.randn(n) * np.exp(-t * 220)) * 0.5
    return (body + click) * peak

def sub(m, dur, peak=0.5):
    n = smp(dur); t = np.arange(n) / SR; f = midi(m)
    w = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    e = env_adsr(n, 0.006, 0.05, 0.9, 0.05, peak)
    return w * e

def hat(dur=0.05, peak=0.16):
    n = smp(dur); t = np.arange(n) / SR
    return np.random.randn(n) * np.exp(-t * 90) * peak

def riser(dur, peak=0.35):
    n = smp(dur); t = np.arange(n) / SR
    noise = np.random.randn(n)
    # rising amplitude + simple one-pole highpass that opens up
    amp = (t / dur) ** 2.2
    # pitch-ish sweep via modulated sine on top
    sweep = np.sin(2 * np.pi * (200 + 1400 * (t / dur) ** 2) * t) * 0.3
    return (noise * 0.5 + sweep) * amp * peak

def impact(dur=1.6, peak=0.8):
    n = smp(dur); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (60 * np.exp(-t * 1.5) + 35) * t) * np.exp(-t * 2.4)
    crash = np.random.randn(n) * np.exp(-t * 3.0) * 0.5
    return (boom + crash) * peak

# ---- chord tables ----------------------------------------------------------
# bright I-V-vi-IV in C ; breakdown vi-IV-I-V
def voic(root, third, fifth, bass):
    return dict(pad=[root, third, fifth], arp=[root + 12, third + 12, fifth + 12, root + 24], bass=bass)
C  = voic(60, 64, 67, 36)
G  = voic(59, 62, 67, 31)
Am = voic(60, 64, 69, 33)
F  = voic(60, 65, 69, 29)
MAIN = [C, G, Am, F]
BREAK = [Am, F, C, G]

# ---- arrangement -----------------------------------------------------------
def bar_time(b): return b * BAR

# Intro 0-4: pad swell + riser into impact at bar 4
for i, ch in enumerate([Am, F, C, G]):
    add(L, R, pad(ch['pad'], BAR, peak=0.10 + 0.02 * i), bar_time(i), 0.7, 0.7)
add(L, R, riser(BAR * 4, peak=0.30), bar_time(0), 0.8, 0.8)
add(L, R, impact(1.8, peak=0.85), bar_time(4), 0.9, 0.9)

def section(start_bar, n_bars, chords, drums=True, arp=True, hats=True,
            kick_peak=0.95, pad_peak=0.16, sub_peak=0.5, arp_peak=0.2):
    for b in range(n_bars):
        ch = chords[b % len(chords)]
        bt = bar_time(start_bar + b)
        add(L, R, pad(ch['pad'], BAR, pad_peak), bt, 0.62, 0.62)
        if drums:
            for beat in range(4):
                add(L, R, kick(0.34, kick_peak), bt + beat * BEAT, 0.7, 0.7)
                add(L, R, sub(ch['bass'], BEAT * 0.95, sub_peak), bt + beat * BEAT, 0.7, 0.7)
                if hats:
                    add(L, R, hat(peak=0.12), bt + beat * BEAT + BEAT / 2, 0.4, 0.55)
        if arp:
            seq = ch['arp']
            for k in range(8):  # 8th notes
                note = seq[k % len(seq)]
                pan = 0.4 if k % 2 == 0 else 0.6
                add(L, R, pluck(note, 0.30, arp_peak), bt + k * (BEAT / 2),
                    panL=(1 - pan) + 0.3, panR=pan + 0.3)

# Reveal + Train + Plan + Fuel = full drop (bars 4..27)
section(4, 6, MAIN)                    # readiness reveal
section(10, 6, MAIN)                   # train/drill
section(16, 5, MAIN)                   # plan
section(21, 6, MAIN)                   # fuel
# Coach breakdown (bars 27..34): filtered, softer, no hats, lighter kick
section(27, 7, BREAK, hats=False, kick_peak=0.5, pad_peak=0.20, sub_peak=0.35, arp_peak=0.14)
# Outro (bars 34..42): bring drop back briefly then resolve
section(34, 5, MAIN)
# final resolve: long C pad + impact
add(L, R, pad([60, 64, 67, 72], BAR * 4, peak=0.20), bar_time(39), 0.7, 0.7)
add(L, R, impact(2.2, peak=0.7), bar_time(39), 0.85, 0.85)

# ---- sidechain pump (duck pads/arp/bass on each beat of drop) --------------
gain = np.ones(T)
duck = 1 - 0.45 * np.exp(-np.arange(smp(0.28)) / SR * 14)  # dip then recover
for b in range(4, 39):
    if 27 <= b < 34:  # gentler in breakdown
        d = 1 - 0.22 * np.exp(-np.arange(smp(0.28)) / SR * 14)
    else:
        d = duck
    for beat in range(4):
        s = smp(bar_time(b) + beat * BEAT)
        e = min(T, s + len(d))
        gain[s:e] = np.minimum(gain[s:e], d[:e - s])
# smooth gain
k = np.ones(64) / 64
gain = np.convolve(gain, k, mode='same')
L *= gain; R *= gain

# ---- master: soft saturation + normalize + fades --------------------------
def master(x):
    x = np.tanh(x * 1.1) * 0.92
    return x
L = master(L); R = master(R)
peak = max(np.max(np.abs(L)), np.max(np.abs(R)), 1e-6)
L *= 0.95 / peak; R *= 0.95 / peak
# fades
fi = smp(0.05); fo = smp(2.5)
L[:fi] *= np.linspace(0, 1, fi); R[:fi] *= np.linspace(0, 1, fi)
L[-fo:] *= np.linspace(1, 0, fo); R[-fo:] *= np.linspace(1, 0, fo)

# ---- write WAV -------------------------------------------------------------
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'score.wav')
inter = np.empty(T * 2, dtype=np.int16)
inter[0::2] = np.clip(L * 32767, -32768, 32767).astype(np.int16)
inter[1::2] = np.clip(R * 32767, -32768, 32767).astype(np.int16)
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(inter.tobytes())
print(f"wrote {out}  dur={DUR:.2f}s  bars={N_BARS}  bpm={BPM}")
print(f"section starts (s): reveal={bar_time(4):.2f} train={bar_time(10):.2f} "
      f"plan={bar_time(16):.2f} fuel={bar_time(21):.2f} coach={bar_time(27):.2f} "
      f"outro={bar_time(34):.2f} end={DUR:.2f}")
