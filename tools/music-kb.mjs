// Musik für das Klausurvideo Basis & Dimension (public/music-kb.wav), synthetisch und an die Zeiten aus src/kb/timeline.ts gekoppelt.
// Hook: Sog bis zum Flachklappen · Rechnung: ruhiger Puls · Fallunterscheidung: mehr Spannung · Aha: Stille, dann Dur · Abspann: Arpeggio
import fs from 'node:fs';
import path from 'node:path';

const SR = 48000;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
// Zeiten im Video, aus src/kb/timeline.ts
const TOTAL = 107.1;
const HOOK_HIT = 9.3;
const CALM = [14.78, 47.64]; // Ansatz und Rechnung: ruhiger Puls
const TENSION = [47.64, 67.9]; // „Jetzt entscheidet a“ bis zur Antwort
const KIPPT = 70.78;
const HIT = 74.86; // „Der Körper wird flach“
const S3 = 79.04;
const MERK = 96.0;
const CTA = 98.26;

const n = Math.ceil(TOTAL * SR);
const L = new Float32Array(n);
const R = new Float32Array(n);
let seed = 4711;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const smooth = (a, b, x) => Math.min(1, Math.max(0, (x - a) / (b - a)));

// D-Moll add9 bis zum Aha, danach D-Dur
const MINOR = [73.42, 110, 146.83, 174.61, 220, 329.63];
const MAJOR = [73.42, 110, 146.83, 185, 220, 329.63, 440];

for (let i = 0; i < n; i++) {
  const t = i / SR;
  // Pegel des Pads je Abschnitt
  let g;
  if (t < HOOK_HIT) g = 0.35 + 0.4 * smooth(0, HOOK_HIT, t);
  else if (t < HOOK_HIT + 0.5) g = 0.05;
  else if (t < HIT) g = smooth(HOOK_HIT + 0.5, HOOK_HIT + 2.5, t) * (t > TENSION[0] ? 0.8 : 0.62);
  else if (t < HIT + 0.45) g = 0;
  else if (t < CTA) g = smooth(HIT + 0.45, HIT + 2.2, t) * (t > S3 ? 0.62 : 0.8) * (t > MERK ? 1.1 : 1);
  else g = smooth(CTA - 0.2, CTA + 0.8, t) * Math.min(1, (TOTAL - t) / 2.5);
  g *= 0.045;
  const chord = t >= HIT ? MAJOR : MINOR;
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

  // Sog im Hook: Rauschen + tiefer Ton steigen bis zum Flachklappen
  if (t < HOOK_HIT) {
    const e = Math.pow(t / HOOK_HIT, 2.5);
    const v = rnd() * 0.05 * e + Math.sin(2 * Math.PI * (40 + 30 * e) * t) * 0.18 * e;
    L[i] += v;
    R[i] += v;
  }

  // Aha: tiefer Ton sinkt, während v₃ in die Ebene kippt
  if (t >= KIPPT - 0.5 && t < HIT) {
    const e = smooth(KIPPT - 0.5, HIT - 0.2, t);
    const f = 110 * Math.pow(2, -e);
    const v = (Math.sin(2 * Math.PI * f * t) * 0.6 + Math.sin(2 * Math.PI * f * 1.5 * t) * 0.25) * 0.1 * Math.min(1, e * 3) * (t > HIT - 0.05 ? 0 : 1);
    L[i] += v;
    R[i] += v;
  }
}

// Puls: weicher Herzschlag, 84 BPM in der Rechnung, Achtel-Hats in der Fallunterscheidung
const BEAT = 60 / 84;
for (let k = 0; CALM[0] + k * BEAT < TENSION[1] - 0.05; k++) {
  const t0 = CALM[0] + k * BEAT;
  let ph = 0;
  const tense = t0 > TENSION[0];
  const amp = 0.16 * Math.min(1, k / 4) * (tense ? 1.3 : 1);
  for (let i = Math.floor(t0 * SR); i < Math.min(n, Math.floor((t0 + 0.5) * SR)); i++) {
    const x = i / SR - t0;
    ph += (2 * Math.PI * (48 + 60 * Math.exp(-x / 0.03))) / SR;
    const v = Math.sin(ph) * Math.exp(-x / 0.14) * amp;
    L[i] += v;
    R[i] += v;
  }
  if (tense) {
    const s0 = Math.floor((t0 + BEAT / 2) * SR);
    for (let i = s0; i < Math.min(n, s0 + 0.06 * SR); i++) {
      const v = rnd() * Math.exp(-(i - s0) / SR / 0.015) * 0.03;
      L[i] += v * 0.8;
      R[i] += v;
    }
  }
}

// ruhiger Puls in Teil 2 (Basis & Dimension), halb so dicht
for (let k = 0; S3 + 1 + k * 2 * BEAT < MERK; k++) {
  const t0 = S3 + 1 + k * 2 * BEAT;
  let ph = 0;
  for (let i = Math.floor(t0 * SR); i < Math.min(n, Math.floor((t0 + 0.5) * SR)); i++) {
    const x = i / SR - t0;
    ph += (2 * Math.PI * (48 + 60 * Math.exp(-x / 0.03))) / SR;
    const v = Math.sin(ph) * Math.exp(-x / 0.14) * 0.12;
    L[i] += v;
    R[i] += v;
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
fs.writeFileSync(path.join(root, 'public/music-kb.wav'), buf);
console.log('music-kb', TOTAL, 's');
