// Musik für „Warum ist das Skalarprodukt bei 90° null?“ (public/music-sk.wav), synthetisch und an die Zeiten aus src/sk/timeline.ts gekoppelt.
// Hook: Tiefschlag auf Frame 0, Puls · Stille bei jedem Nullmoment · Schatten: ruhig · Formel: Spannung bis zur Null · Orthogonalität: Dur · CTA: Arpeggio
import fs from 'node:fs';
import path from 'node:path';

const SR = 48000;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
// Zeiten im Video, aus src/sk/timeline.ts
const TOTAL = 49.5;
const NULL1 = 7.56; // Rechteck klappt zusammen
const WARUM = 11.06;
const STELL = 16.32;
const NULL2 = 24.54; // Schatten weg, Blick von oben
const FORMEL = 27.63;
const NULL3 = 37.82; // Kosinus wird null
const ORTHO = 43.82;
const CTA = 44.94;

const n = Math.ceil(TOTAL * SR);
const L = new Float32Array(n);
const R = new Float32Array(n);
let seed = 90;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const smooth = (a, b, x) => Math.min(1, Math.max(0, (x - a) / (b - a)));

// D-Moll add9, ab der Orthogonalität D-Dur
const MINOR = [73.42, 110, 146.83, 174.61, 220, 329.63];
const MAJOR = [73.42, 110, 146.83, 185, 220, 329.63, 440];

// kurze Stille vor und nach einem Nullmoment
const dip = (t, at) => 1 - 0.92 * smooth(at - 0.28, at - 0.04, t) * (1 - smooth(at + 0.5, at + 1.5, t));

for (let i = 0; i < n; i++) {
  const t = i / SR;
  let g;
  if (t < WARUM) g = 0.55 + 0.3 * smooth(0, NULL1, t);
  else if (t < STELL) g = 0.6;
  else if (t < FORMEL) g = 0.55 + 0.2 * smooth(STELL, NULL2, t);
  else if (t < NULL3) g = 0.6 + 0.35 * smooth(FORMEL, NULL3, t);
  else if (t < CTA) g = 0.75;
  else g = 0.85 * Math.min(1, (TOTAL - t) / 2);
  g *= dip(t, NULL1) * dip(t, NULL2) * dip(t, NULL3) * 0.045;
  const chord = t >= ORTHO ? MAJOR : MINOR;
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

  // Sog in jeden Nullmoment
  for (const at of [NULL1, NULL3]) {
    if (t >= at - 2.2 && t < at - 0.05) {
      const e = Math.pow(smooth(at - 2.2, at - 0.05, t), 2.4);
      const v = rnd() * 0.05 * e + Math.sin(2 * Math.PI * (55 + 50 * e) * t) * 0.1 * e;
      L[i] += v;
      R[i] += v;
    }
  }
  // einzelner hoher Ton in der Stille
  for (const at of [NULL1, NULL2, NULL3]) {
    if (t >= at && t < at + 1.8) {
      const x = t - at;
      const v = Math.sin(2 * Math.PI * 880 * x) * Math.exp(-x / 0.55) * 0.05 * Math.min(1, x / 0.004);
      L[i] += v;
      R[i] += v * 0.8;
    }
  }
}

// Puls: 92 BPM; setzt in den Nullmomenten aus, im Schatten-Teil halb so dicht
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
const quiet = (x) => [NULL1, NULL2, NULL3].some((at) => x > at - 0.35 && x < at + 1.3);
for (let k = 0; 0.66 + k * BEAT < CTA - 0.2; k++) {
  const t0 = 0.66 + k * BEAT;
  if (quiet(t0)) continue;
  const calm = t0 > WARUM && t0 < FORMEL;
  if (calm && k % 2) continue;
  kick(t0, 0.15 * (t0 > ORTHO ? 0.8 : 1));
  if (t0 > FORMEL && t0 < NULL3) hat(t0 + BEAT / 2, 0.03);
}
kick(0, 0.42);
kick(NULL1, 0.3);
kick(NULL2, 0.22);
kick(NULL3, 0.3);
kick(ORTHO, 0.24);

// Arpeggio im CTA
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
fs.writeFileSync(path.join(root, 'public/music-sk.wav'), buf);
console.log('music-sk', TOTAL, 's');
