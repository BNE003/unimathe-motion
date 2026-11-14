// Musik für „Was hat dein Herzschlag mit Vektoren zu tun?“ (public/music-ekg.wav), synthetisch. Start: npx tsx tools/music-ekg.mjs
// Übliche UniMathe-Musik (wie music-kr.mjs): D-Moll add9 mit 92-BPM-Puls, in der Erklärung halb so dicht, Akzent mit hohem Ton
// auf jedem Kapitel (Zacken, Wellen, Brummen, Auflösung), ab dem sauberen EKG D-Dur, CTA: Arpeggio.
// Dazu im Hook leise Monitor-Pieptöne auf den R-Zacken. Die Zeiten kommen direkt aus src/ekg/timeline.ts.
import fs from 'node:fs';
import path from 'node:path';
import {T, TOTAL} from '../src/ekg/timeline.ts';
import {BEAT_S, FREEZE} from '../src/ekg/world.ts';

const SR = 48000;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CALM = T.digital; // ab hier Erklärung
const ACCENTS = [T.jeder, T.wellen, T.einzige, T.derselbe];
const DUR = T.sauber; // sauberes EKG: ab hier Dur
const CTA = T.cta;
const n = Math.ceil(TOTAL * SR);
const L = new Float32Array(n);
const R = new Float32Array(n);
let seed = 90;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const smooth = (a, b, x) => Math.min(1, Math.max(0, (x - a) / (b - a)));

const MINOR = [73.42, 110, 146.83, 174.61, 220, 329.63];
const MAJOR = [73.42, 110, 146.83, 185, 220, 329.63, 440];

for (let i = 0; i < n; i++) {
  const t = i / SR;
  let g;
  if (t < CALM) g = 0.55 + 0.3 * smooth(0, CALM, t);
  else if (t < T.wellen) g = 0.6;
  else if (t < DUR) g = 0.6 + 0.15 * smooth(T.wellen, T.einzige, t);
  else if (t < CTA) g = 0.75;
  else g = 0.85 * Math.min(1, (TOTAL - t) / 2);
  g *= 0.045;
  const chord = t >= DUR ? MAJOR : MINOR;
  let l = 0;
  let r = 0;
  for (const f of chord) {
    for (let h = 1; h <= 3; h++) {
      const a = 1 / Math.pow(h, 1.7);
      l += a * Math.sin(2 * Math.PI * f * h * 0.998 * t);
      r += a * Math.sin(2 * Math.PI * f * h * 1.002 * t + 0.5);
    }
  }
  const trem = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.35 * t);
  L[i] += l * g * trem;
  R[i] += r * g * trem;

  for (const at of ACCENTS) {
    if (t >= at && t < at + 1.8) {
      const x = t - at;
      const v = Math.sin(2 * Math.PI * 880 * x) * Math.exp(-x / 0.55) * 0.04 * Math.min(1, x / 0.004);
      L[i] += v;
      R[i] += v * 0.8;
    }
  }
}

// Monitor-Piepton auf jeder R-Zacke bis zum Anhalten (Kopfphase t / BEAT_S + 0,62, R bei 0,39)
for (let k = 1; ; k++) {
  const t0 = (k + 0.39 - 0.62) * BEAT_S;
  if (t0 < 0) continue;
  if (t0 > FREEZE) break;
  for (let i = Math.floor(t0 * SR); i < Math.min(n, Math.floor((t0 + 0.16) * SR)); i++) {
    const x = i / SR - t0;
    const env = Math.min(1, x / 0.004) * Math.min(1, (0.16 - x) / 0.03);
    const v = Math.sin(2 * Math.PI * 1046.5 * x) * env * 0.05;
    L[i] += v;
    R[i] += v;
  }
}

const BEAT = 60 / 92;
const kick = (t0, amp) => {
  let ph = 0;
  for (let i = Math.floor(t0 * SR); i < Math.min(n, Math.floor((t0 + 0.6) * SR)); i++) {
    const x = i / SR - t0;
    ph += (2 * Math.PI * (44 + 60 * Math.exp(-x / 0.03))) / SR;
    const v = Math.sin(ph) * Math.exp(-x / 0.16) * amp;
    L[i] += v;
    R[i] += v;
  }
};
const hat = (t0, amp) => {
  const s0 = Math.floor(t0 * SR);
  for (let i = s0; i < Math.min(n, s0 + 0.06 * SR); i++) {
    const v = rnd() * Math.exp(-(i - s0) / SR / 0.015) * amp;
    L[i] += v * 0.8;
    R[i] += v;
  }
};
const near = (x) => ACCENTS.some((at) => Math.abs(x - at) < 0.3);
for (let k = 0; 0.66 + k * BEAT < CTA - 0.2; k++) {
  const t0 = 0.66 + k * BEAT;
  if (t0 < FREEZE) continue; // im Hook schlägt das „Herz“
  if (near(t0)) continue;
  const calm = t0 > CALM && t0 < T.wellen;
  if (calm && k % 2) continue;
  kick(t0, 0.15 * (t0 > DUR ? 0.8 : 1));
  if (t0 > T.wellen && t0 < DUR) hat(t0 + BEAT / 2, 0.03);
}
// Herzschlag im Hook: doppelter weicher Schlag auf jeder R-Zacke
for (let k = 1; ; k++) {
  const t0 = (k + 0.39 - 0.62) * BEAT_S;
  if (t0 < 0) continue;
  if (t0 > FREEZE) break;
  kick(t0, 0.2);
  kick(t0 + 0.17, 0.11);
}
kick(0, 0.42);
for (const at of ACCENTS) kick(at, 0.24);
kick(DUR, 0.24);

for (let k = 0; CTA + 0.3 + k * (BEAT / 2) < TOTAL - 0.8; k++) {
  const t0 = CTA + 0.3 + k * (BEAT / 2);
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
  const fio = Math.min(1, (t + 0.02) / 0.03) * Math.min(1, (TOTAL - t) / 0.7);
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
fs.writeFileSync(path.join(root, 'public/music-ekg.wav'), buf);
console.log('music-ekg', TOTAL, 's');
