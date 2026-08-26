#!/usr/bin/env python3
"""Metallic swoosh SFX bed, synced to the visual swooshes. Stereo, panned L->R."""
import numpy as np, wave, os

SR = 44100
DUR = 84.0
T = int(DUR * SR)
L = np.zeros(T); R = np.zeros(T)
rng = np.random.default_rng(7)

# boundary centers (seconds) = train, plan, fuel, coach, recap, outro
BPM = 123.0
bar = lambda b: b * 4 * 60.0 / BPM
BOUNDS = [bar(10), bar(16), bar(21), bar(27), bar(34), bar(39)]

def whoosh(dur=0.6):
    n = int(dur * SR); t = np.arange(n) / SR
    env = t / dur
    amp = np.sin(np.pi * env) ** 1.4            # swell up then down
    noise = rng.standard_normal(n)
    # simple "filter opening" via blend of smoothed and raw noise
    k = 200
    smooth = np.convolve(noise, np.ones(k) / k, mode='same')
    opened = (1 - amp) * smooth + amp * noise   # brighter at the peak
    air = np.sin(2 * np.pi * (320 + 2800 * env) * t) * 0.18
    shimmer = (np.sin(2 * np.pi * 3200 * t) + 0.6 * np.sin(2 * np.pi * 5400 * t)) \
              * np.exp(-((env - 0.55) ** 2) / 0.012) * 0.16
    sig = (opened * 0.5 + air + shimmer) * amp
    return sig, env

for c in BOUNDS:
    sig, env = whoosh(0.62)
    n = len(sig)
    s = int((c - 0.31) * SR)
    if s < 0: s = 0
    e = min(T, s + n)
    seg = sig[:e - s]; ev = env[:e - s]
    panL = (1 - ev) * 0.85 + 0.15
    panR = ev * 0.85 + 0.15
    L[s:e] += seg * panL
    R[s:e] += seg * panR

# normalize to modest peak
peak = max(np.max(np.abs(L)), np.max(np.abs(R)), 1e-6)
L *= 0.7 / peak; R *= 0.7 / peak

out = os.path.join(os.path.dirname(__file__), '..', 'public', 'swoosh.wav')
inter = np.empty(T * 2, dtype=np.int16)
inter[0::2] = np.clip(L * 32767, -32768, 32767).astype(np.int16)
inter[1::2] = np.clip(R * 32767, -32768, 32767).astype(np.int16)
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(inter.tobytes())
print('wrote', out, 'bounds(s):', [round(b, 2) for b in BOUNDS])
