// Musik für „Warum ist AB ≠ BA?“ (public/music-ab.wav), synthetisch und an die Zeiten aus src/ab/timeline.ts gekoppelt.
// Hook: treibender Puls · kurze Stille vor „Völlig anderes Ergebnis“ · Sturzflug: Sog · Duell: Puls mit Hats · Aha: tiefer Ton sinkt bis zu den Matrizen, dann Dur · Abspann: Arpeggio
import fs from 'node:fs';
import path from 'node:path';

const SR = 48000;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
// Zeiten im Video, aus src/ab/timeline.ts
const TOTAL = 49.2;
const VOELLIG = 7.12; // „Völlig anderes Ergebnis“
const DIVE = [14.7, 15.95]; // Sturzflug auf die Ebene
const DUEL = [19.87, 29.2]; // Platten teilen sich bis „Denn B zieht …“
const AHA = [29.2, 37.7]; // Aha bis zum ≠ der Matrizen
const HIT = 37.7;
const BACK = 39.08; // zurück in den Raum
const CTA = 43.46;

const n = Math.ceil(TOTAL * SR);
const L = new Float32Array(n);
const R = new Float32Array(n);
let seed = 4711;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const smooth = (a, b, x) => Math.min(1, Math.max(0, (x - a) / (b - a)));

// A-Moll add9 bis zu den Matrizen, danach A-Dur
const MINOR = [55, 82.41, 110, 130.81, 164.81, 246.94];
const MAJOR = [55, 82.41, 110, 138.59, 164.81, 246.94, 329.63];

for (let i = 0; i < n; i++) {
  const t = i / SR;
  let g;
  if (t < VOELLIG - 0.35) g = 0.45 + 0.35 * smooth(0, VOELLIG, t);
  else if (t < VOELLIG) g = 0.04;
  else if (t < HIT) g = smooth(VOELLIG, VOELLIG + 0.8, t) * (t > DUEL[0] ? 0.85 : 0.7);
  else if (t < HIT + 0.3) g = 0.1;
  else if (t < CTA) g = smooth(HIT + 0.3, HIT + 1.5, t) * 0.75;
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
  const trem = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.4 * t);
  L[i] += l * g * trem;
  R[i] += r * g * trem;

  // Sog vor „Völlig anderes Ergebnis“
  if (t >= VOELLIG - 2 && t < VOELLIG) {
    const e = Math.pow(smooth(VOELLIG - 2, VOELLIG, t), 2);
    const v = rnd() * 0.06 * e;
    L[i] += v;
    R[i] += v;
  }
  // Sog beim Sturzflug
  if (t >= DIVE[0] - 0.4 && t < DIVE[1]) {
    const e = smooth(DIVE[0] - 0.4, DIVE[1] - 0.1, t);
    const v = rnd() * 0.05 * e + Math.sin(2 * Math.PI * (45 + 40 * e) * t) * 0.12 * e;
    L[i] += v;
    R[i] += v;
  }
  // Aha: tiefer Ton sinkt bis zu den Matrizen
  if (t >= AHA[0] && t < HIT) {
    const e = smooth(AHA[0], HIT - 0.1, t);
    const f = 110 * Math.pow(2, -e);
    const v = (Math.sin(2 * Math.PI * f * t) * 0.6 + Math.sin(2 * Math.PI * f * 1.5 * t) * 0.25) * 0.07 * Math.min(1, e * 4) * (t > HIT - 0.05 ? 0 : 1);
    L[i] += v;
    R[i] += v;
  }
}

// Puls: 96 BPM; Pause vor „Völlig“, halb so dicht beim Vorstellen von A und B, Achtel-Hats im Duell und im Aha
const BEAT = 60 / 96;
const kick = (t0, amp) => {
  let ph = 0;
  for (let i = Math.floor(t0 * SR); i < Math.min(n, Math.floor((t0 + 0.5) * SR)); i++) {
    const x = i / SR - t0;
    ph += (2 * Math.PI * (48 + 60 * Math.exp(-x / 0.03))) / SR;
    const v = Math.sin(ph) * Math.exp(-x / 0.14) * amp;
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
for (let k = 0; 0.3 + k * BEAT < CTA - 0.3; k++) {
  const t0 = 0.3 + k * BEAT;
  if (t0 > VOELLIG - 0.5 && t0 < VOELLIG) continue;
  if (t0 > HIT - 0.1 && t0 < HIT + 0.4) continue;
  const intro = t0 > DIVE[1] && t0 < DUEL[0];
  const after = t0 > HIT;
  if ((intro || after) && k % 2) continue;
  const tense = (t0 >= DUEL[0] && t0 < HIT) || (t0 >= VOELLIG && t0 < DIVE[0]);
  kick(t0, 0.15 * Math.min(1, (k + 1) / 3) * (tense ? 1.2 : 1) * (after ? 0.8 : 1));
  if (tense && t0 >= DUEL[0]) hat(t0 + BEAT / 2, 0.03);
}
kick(VOELLIG, 0.3);
kick(HIT, 0.26);
kick(BACK, 0.14);

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
fs.writeFileSync(path.join(root, 'public/music-ab.wav'), buf);
console.log('music-ab', TOTAL, 's');
