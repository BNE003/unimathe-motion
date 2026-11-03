// Musik für das Determinante-Video (public/music-det.wav), synthetisch und an die Zeiten aus src/det/timeline.ts gekoppelt.
// Hook: Sog bis zum Kollaps · Mitte: ruhiger Puls · Kippen: Drone sinkt mit der Determinante · „null“: Stille · Abspann: Dur-Auflösung
import fs from 'node:fs';
import path from 'node:path';

const SR = 48000;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const TOTAL = 31.2;
const HOOK_HIT = 2.1;
const REWIND = 3.45;
const PULSE = [4.4, 18.1];
const TILT = [[15.3, 3], [16.2, 2], [17.18, 1], [18.1, 0]];
const HIT = 18.1;
const CTA = 26.0;

const n = Math.ceil(TOTAL * SR);
const L = new Float32Array(n);
const R = new Float32Array(n);
let seed = 4711;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const smooth = (a, b, x) => Math.min(1, Math.max(0, (x - a) / (b - a)));
const tiltDet = (t) => {
  if (t <= TILT[0][0]) return 3;
  for (let i = 1; i < TILT.length; i++) if (t <= TILT[i][0]) return TILT[i - 1][1] + ((TILT[i][1] - TILT[i - 1][1]) * (t - TILT[i - 1][0])) / (TILT[i][0] - TILT[i - 1][0]);
  return 0;
};

// D-Moll add9 im Mittelteil, D-Dur im Abspann
const MINOR = [73.42, 110, 146.83, 174.61, 220, 329.63];
const MAJOR = [73.42, 110, 146.83, 185, 220, 329.63, 440];

for (let i = 0; i < n; i++) {
  const t = i / SR;
  // Gesamtpegel des Pads: Hook leise, nach dem Kollaps kurz still, Mitte, Stille bei „null“, Abspann
  const hook = t < HOOK_HIT ? 0.35 + 0.4 * smooth(0, HOOK_HIT, t) : 0;
  const gapHook = t >= HOOK_HIT && t < REWIND ? 0.08 : 0;
  const mid = t >= REWIND && t < HIT ? smooth(REWIND, REWIND + 1.2, t) * 0.8 : 0;
  const gapHit = t >= HIT && t < HIT + 0.45 ? 0 : 0;
  const after = t >= HIT + 0.45 && t < CTA ? smooth(HIT + 0.45, HIT + 2, t) * 0.75 : 0;
  const end = t >= CTA ? smooth(CTA - 0.2, CTA + 0.8, t) * Math.min(1, (TOTAL - t) / 2.2) : 0;
  const g = (hook + gapHook + mid + gapHit + after + end) * 0.045;
  const chord = t >= CTA ? MAJOR : MINOR;
  let l = 0;
  let r = 0;
  for (const f of chord) {
    for (let h = 1; h <= 3; h++) {
      const a = 1 / Math.pow(h, 1.7);
      l += a * Math.sin(2 * Math.PI * f * h * 0.998 * t);
      r += a * Math.sin(2 * Math.PI * f * h * 1.002 * t + 0.5);
    }
  }
  const trem = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.25 * t);
  L[i] += l * g * trem;
  R[i] += r * g * trem;

  // Sog im Hook: Rauschen + tiefer Ton steigen bis zum Kollaps
  if (t < HOOK_HIT) {
    const e = Math.pow(t / HOOK_HIT, 2.5);
    const v = rnd() * 0.05 * e + Math.sin(2 * Math.PI * (40 + 30 * e) * t) * 0.18 * e;
    L[i] += v;
    R[i] += v;
  }

  // Drone folgt der Determinante: 3 → 0 heißt eine Oktave tiefer
  if (t >= 12.8 && t < HIT) {
    const d = tiltDet(t);
    const f = 110 * Math.pow(2, (d - 3) / 3);
    const e = smooth(12.8, 14, t) * (t > HIT - 0.05 ? 0 : 1);
    const v = (Math.sin(2 * Math.PI * f * t) * 0.6 + Math.sin(2 * Math.PI * f * 1.5 * t) * 0.25) * 0.09 * e * (1 + 0.6 * (3 - d) / 3);
    L[i] += v;
    R[i] += v;
  }
}

// Puls: weicher Herzschlag, 96 BPM
const BEAT = 60 / 96;
for (let k = 0; PULSE[0] + k * BEAT < PULSE[1] - 0.05; k++) {
  const t0 = PULSE[0] + k * BEAT;
  let ph = 0;
  const amp = 0.22 * Math.min(1, k / 3) * (t0 > 12.8 ? 1.25 : 1);
  for (let i = Math.floor(t0 * SR); i < Math.min(n, Math.floor((t0 + 0.5) * SR)); i++) {
    const x = i / SR - t0;
    ph += (2 * Math.PI * (48 + 60 * Math.exp(-x / 0.03))) / SR;
    const v = Math.sin(ph) * Math.exp(-x / 0.14) * amp;
    L[i] += v;
    R[i] += v;
  }
  // in der Spannungsphase Achtel-Hats dazu
  if (t0 > 12.8) {
    for (const off of [BEAT / 2]) {
      const s0 = Math.floor((t0 + off) * SR);
      for (let i = s0; i < Math.min(n, s0 + 0.06 * SR); i++) {
        const v = rnd() * Math.exp(-(i - s0) / SR / 0.015) * 0.03;
        L[i] += v * 0.8;
        R[i] += v;
      }
    }
  }
}

// Arpeggio im Abspann
for (let k = 0; CTA + 0.8 + k * (BEAT / 2) < TOTAL - 1; k++) {
  const t0 = CTA + 0.8 + k * (BEAT / 2);
  const f = MAJOR.slice(-4)[k % 4] * 2;
  const pan = k % 2 ? [0.6, 1] : [1, 0.6];
  for (let i = Math.floor(t0 * SR); i < Math.min(n, Math.floor((t0 + 0.4) * SR)); i++) {
    const x = i / SR - t0;
    const v = Math.sin(2 * Math.PI * f * x) * Math.exp(-x / 0.12) * 0.04 * Math.min(1, x / 0.003);
    L[i] += v * pan[0];
    R[i] += v * pan[1];
  }
}

let peak = 0;
for (let i = 0; i < n; i++) {
  const t = i / SR;
  const fio = Math.min(1, t / 0.05) * Math.min(1, (TOTAL - t) / 0.8);
  L[i] = Math.tanh(L[i] * 1.4) * fio;
  R[i] = Math.tanh(R[i] * 1.4) * fio;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const buf = Buffer.alloc(44 + n * 4);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + n * 4, 4);
buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(n * 4, 40);
for (let i = 0; i < n; i++) {
  buf.writeInt16LE(Math.round((L[i] * 0.7) / peak * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round((R[i] * 0.7) / peak * 32767), 46 + i * 4);
}
fs.writeFileSync(path.join(root, 'public/music-det.wav'), buf);
console.log('music-det', TOTAL, 's');
