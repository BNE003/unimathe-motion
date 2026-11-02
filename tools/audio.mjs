// Erzeugt Soundeffekte (public/sfx/*.wav) und den Musik-Puls (public/music.wav) synthetisch.
// Der Musik-Puls folgt den Szenenzeiten aus src/timeline.json.
import fs from 'node:fs';
import path from 'node:path';

const SR = 48000;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
// node tools/audio.mjs [timeline.json] [music.wav]
const [tlArg = 'src/timeline.json', outArg = 'public/music.wav'] = process.argv.slice(2);
const timeline = JSON.parse(fs.readFileSync(path.resolve(root, tlArg), 'utf8'));
const S = timeline.scenes;

function writeWav(file, L, R = L) {
  const n = L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
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
    const l = Math.max(-1, Math.min(1, L[i]));
    const r = Math.max(-1, Math.min(1, R[i]));
    buf.writeInt16LE(Math.round(l * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(r * 32767), 46 + i * 4);
  }
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, buf);
}

// deterministisches Rauschen
let seed = 12345;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296 * 2 - 1;
};

const buf = (sec) => new Float32Array(Math.ceil(sec * SR));
const normalize = (a, peak) => {
  let m = 0;
  for (const x of a) m = Math.max(m, Math.abs(x));
  if (m > 0) for (let i = 0; i < a.length; i++) a[i] *= peak / m;
  return a;
};
const fadeOut = (a, sec) => {
  const n = Math.floor(sec * SR);
  for (let i = 0; i < n; i++) a[a.length - 1 - i] *= i / n;
  return a;
};

// Zustandsvariablen-Filter (Bandpass/Tiefpass)
function svf(input, fcAt, q = 0.7, mode = 'bp') {
  const out = new Float32Array(input.length);
  let low = 0;
  let band = 0;
  for (let i = 0; i < input.length; i++) {
    const f = 2 * Math.sin((Math.PI * Math.min(fcAt(i / SR), SR / 6)) / SR);
    const high = input[i] - low - band / q;
    band += f * high;
    low += f * band;
    out[i] = mode === 'bp' ? band : mode === 'lp' ? low : high;
  }
  return out;
}

/* ---------- Soundeffekte ---------- */

function thump(a, at, f0, f1, dec, amp) {
  let ph = 0;
  for (let i = Math.floor(at * SR); i < a.length; i++) {
    const t = i / SR - at;
    const f = f1 + (f0 - f1) * Math.exp(-t / 0.035);
    ph += (2 * Math.PI * f) / SR;
    a[i] += Math.sin(ph) * Math.exp(-t / dec) * amp;
  }
}
function bell(a, at, f, dec, amp) {
  for (let i = Math.floor(at * SR); i < a.length; i++) {
    const t = i / SR - at;
    const e = Math.exp(-t / dec) * Math.min(1, t / 0.004);
    a[i] += amp * e * (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 2.01 * t) * Math.exp(-t / (dec * 0.4)) + 0.12 * Math.sin(2 * Math.PI * f * 3.97 * t) * Math.exp(-t / (dec * 0.2)));
  }
}
function clickAt(a, at, f, dec, amp) {
  for (let i = Math.floor(at * SR); i < Math.min(a.length, Math.floor((at + 0.08) * SR)); i++) {
    const t = i / SR - at;
    a[i] += amp * Math.exp(-t / dec) * (Math.sin(2 * Math.PI * f * t) * 0.7 + rnd() * 0.3);
  }
}

const sfx = {
  swell() {
    const d = 1.45;
    const n = buf(d);
    for (let i = 0; i < n.length; i++) n[i] = rnd();
    const nb = svf(n, (t) => 300 + 2200 * Math.pow(t / d, 2), 1.2, 'bp');
    const a = buf(d);
    let ph = 0;
    for (let i = 0; i < a.length; i++) {
      const t = i / SR;
      const e = Math.pow(t / d, 2.2);
      ph += (2 * Math.PI * (45 + 20 * t / d)) / SR;
      a[i] = nb[i] * e * 0.9 + Math.sin(ph) * e * 0.5;
    }
    return fadeOut(normalize(a, 0.8), 0.06);
  },
  lock() {
    const a = buf(1.2);
    thump(a, 0, 150, 62, 0.16, 1);
    clickAt(a, 0, 2100, 0.008, 0.5);
    bell(a, 0.005, 880, 0.45, 0.22);
    return fadeOut(normalize(a, 0.85), 0.1);
  },
  lock_hi() {
    const a = buf(1.2);
    thump(a, 0, 170, 70, 0.14, 0.9);
    clickAt(a, 0, 2400, 0.008, 0.5);
    bell(a, 0.005, 1108.73, 0.45, 0.24);
    return fadeOut(normalize(a, 0.85), 0.1);
  },
  tick() {
    const a = buf(0.15);
    clickAt(a, 0, 3200, 0.006, 1);
    bell(a, 0, 1760, 0.04, 0.3);
    return fadeOut(normalize(a, 0.7), 0.02);
  },
  click() {
    const a = buf(0.35);
    clickAt(a, 0, 2400, 0.01, 1);
    thump(a, 0, 220, 110, 0.05, 0.6);
    bell(a, 0.002, 1320, 0.12, 0.25);
    return fadeOut(normalize(a, 0.8), 0.05);
  },
  whoosh() {
    const d = 0.75;
    const n = buf(d);
    for (let i = 0; i < n.length; i++) n[i] = rnd();
    const b = svf(n, (t) => 350 + 2600 * Math.sin((Math.PI * t) / d) ** 2, 1.4, 'bp');
    for (let i = 0; i < b.length; i++) b[i] *= Math.sin((Math.PI * i) / b.length) ** 2;
    return normalize(b, 0.7);
  },
  rise() {
    const d = 2.0;
    const a = buf(d);
    let p1 = 0;
    let p2 = 0;
    for (let i = 0; i < a.length; i++) {
      const t = i / SR;
      const f = 220 * Math.pow(2, t / d);
      p1 += (2 * Math.PI * f) / SR;
      p2 += (2 * Math.PI * f * 1.5) / SR;
      const e = Math.sin((Math.PI * t) / d) ** 1.5;
      a[i] = e * (Math.sin(p1) * 0.6 + Math.sin(p2) * 0.25 + Math.sin(2 * p1) * 0.12);
    }
    return normalize(a, 0.6);
  },
  accent_small() {
    const a = buf(1.4);
    thump(a, 0, 130, 55, 0.2, 0.8);
    bell(a, 0.003, 659.25, 0.5, 0.25);
    bell(a, 0.003, 880, 0.5, 0.2);
    return fadeOut(normalize(a, 0.8), 0.15);
  },
  buzz() {
    const a = buf(0.45);
    for (let i = 0; i < a.length; i++) {
      const t = i / SR;
      const sq = Math.sign(Math.sin(2 * Math.PI * 110 * t)) * 0.5 + Math.sin(2 * Math.PI * 220 * t) * 0.3;
      a[i] = sq * Math.exp(-t / 0.14) * Math.min(1, t / 0.005);
    }
    return fadeOut(normalize(svf(a, () => 1400, 0.7, 'lp'), 0.7), 0.05);
  },
  collapse() {
    const a = buf(1.2);
    let ph = 0;
    for (let i = 0; i < a.length; i++) {
      const t = i / SR;
      ph += (2 * Math.PI * (330 * Math.pow(0.25, t / 0.8))) / SR;
      a[i] = Math.sin(ph) * Math.exp(-t / 0.5) * 0.5;
    }
    thump(a, 0.75, 120, 45, 0.25, 0.9);
    return fadeOut(normalize(a, 0.8), 0.1);
  },
  accent() {
    const a = buf(3.2);
    thump(a, 0, 120, 50, 0.35, 1);
    for (const [f, g] of [[110, 0.35], [164.81, 0.25], [220, 0.25], [277.18, 0.2], [329.63, 0.18], [440, 0.12], [554.37, 0.08]]) bell(a, 0.004, f, 1.4, g);
    return fadeOut(normalize(a, 0.85), 0.4);
  },
};

for (const [name, fn] of Object.entries(sfx)) {
  writeWav(path.join(root, 'public/sfx', `${name}.wav`), fn());
  console.log('sfx', name);
}

/* ---------- Musik-Puls (~100 BPM, A-Dur: A – F#m – D – E) ---------- */

const total = timeline.total;
const L = buf(total);
const R = buf(total);
const BEAT = 60 / 100;
const CHORDS = [
  [110, 164.81, 220, 277.18, 329.63, 493.88],
  [92.5, 138.59, 185, 220, 277.18],
  [73.42, 110, 146.83, 185, 220, 329.63],
  [82.41, 123.47, 164.81, 207.65, 246.94],
];
const ROOTS = [55, 46.25, 73.42, 41.2];

const at = (k, off = 0) => S[k].from + off;
// Arrangement: entweder als Block "arrangement" in der Timeline (absolute Sekunden) oder aus den Szenen des Eigenvektor-Videos
const cue = (k, name) => timeline.cues[k][name];
const inAny = (ranges) => (t) => ranges.some(([a, b]) => t >= a && t < b);
const arr = timeline.arrangement ?? {
  pulse: [[at('S2', 0.5), at('S4')], [at('S5', 0.9), at('S7', cue('S7', 'stille'))], [at('S8'), at('S11', cue('S11', 'unimathe'))]],
  hats: [[at('S5', 0.9), at('S7', cue('S7', 'stille'))], [at('S8'), at('S11', cue('S11', 'unimathe'))]],
  arp: [[at('S9', cue('S9', 'streckt')), at('S11', cue('S11', 'unimathe'))]],
  quiet: [at('S7', cue('S7', 'stille')), at('S8')],
  ask: [at('S4'), at('S5')],
  end: at('S11', cue('S11', 'unimathe')),
  gridReset: at('S8'),
};
const QUIET = arr.quiet[0];
const END = arr.end;
const pulseOn = inAny(arr.pulse);
const hatsOn = inAny(arr.hats);
const arpOn = inAny(arr.arp);
// Taktraster: startet bei 0 und wird beim harten Schnitt neu ausgerichtet
const gridStart = (t) => (t >= arr.gridReset ? arr.gridReset : 0);
const padGain = (t) => {
  const intro = Math.min(1, t / 2.5) * 0.55;
  const main = t >= at('S2', 0.5) ? 1 : intro;
  const dip = t >= QUIET - 0.2 && t < arr.quiet[1] ? Math.max(0.12, 1 - (t - QUIET + 0.2) / 0.5) : 1;
  const ask = arr.ask && t >= arr.ask[0] && t < arr.ask[1] ? 0.6 : 1;
  const outro = t >= END ? Math.max(0, 1 - (t - END) / (total - END)) : 1;
  return main * dip * outro * ask;
};

// Pad
for (let i = 0; i < L.length; i++) {
  const t = i / SR;
  const g0 = gridStart(t);
  const bar = Math.floor((t - g0) / (BEAT * 4));
  const ci = t >= END ? 0 : ((bar % 4) + 4) % 4;
  const xf = Math.min(1, ((t - g0) % (BEAT * 4)) / 0.35);
  const prev = t >= END ? 0 : (((bar - 1) % 4) + 4) % 4;
  const g = padGain(t) * 0.05;
  let l = 0;
  let r = 0;
  for (const [idx, w] of [[ci, xf], [prev, 1 - xf]]) {
    if (w <= 0) continue;
    for (const f of CHORDS[idx]) {
      for (let h = 1; h <= 3; h++) {
        const amp = w / Math.pow(h, 1.6);
        l += amp * Math.sin(2 * Math.PI * f * h * 0.9985 * t);
        r += amp * Math.sin(2 * Math.PI * f * h * 1.0015 * t + 0.4);
      }
    }
  }
  const trem = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.2 * t);
  L[i] += l * g * trem;
  R[i] += r * g * trem;
}

// Puls, Bass, Hats, Arpeggio
function addVoice(t0, fn, dur, gl = 1, gr = 1) {
  const s0 = Math.floor(t0 * SR);
  const s1 = Math.min(L.length, Math.floor((t0 + dur) * SR));
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    const v = fn(t);
    L[i] += v * gl;
    R[i] += v * gr;
  }
}
const steps = [];
for (const [g0, end] of [[0, arr.gridReset], [arr.gridReset, total]]) {
  for (let step = 0; g0 + (step * BEAT) / 4 < end; step++) steps.push([g0 + (step * BEAT) / 4, step]);
}
for (const [tt, step] of steps) {
  const bar = Math.floor(step / 16);
  const ci = ((bar % 4) + 4) % 4;
  if (step % 4 === 0 && pulseOn(tt)) {
    let ph = 0;
    addVoice(tt, (x) => {
      ph += (2 * Math.PI * (52 + 70 * Math.exp(-x / 0.03))) / SR;
      return Math.sin(ph) * Math.exp(-x / 0.16) * 0.32;
    }, 0.6);
    const f = ROOTS[ci] * 2;
    addVoice(tt, (x) => (Math.sin(2 * Math.PI * f * x) + 0.3 * Math.sin(4 * Math.PI * f * x)) * Math.exp(-x / 0.32) * 0.12, 0.9);
  }
  if (step % 4 === 2 && hatsOn(tt)) {
    addVoice(tt, (x) => rnd() * Math.exp(-x / 0.018) * 0.035, 0.08, 0.8, 1);
  }
  if (arpOn(tt)) {
    const notes = CHORDS[ci].slice(-4);
    const f = notes[step % notes.length] * 2;
    const pan = step % 2 ? [0.6, 1] : [1, 0.6];
    addVoice(tt, (x) => Math.sin(2 * Math.PI * f * x) * Math.exp(-x / 0.11) * 0.045 * Math.min(1, x / 0.003), 0.4, pan[0], pan[1]);
  }
}

// Ein- und Ausblenden, sanfte Sättigung
for (let i = 0; i < L.length; i++) {
  const t = i / SR;
  const fin = Math.min(1, t / 0.3);
  const fout = Math.min(1, (total - t) / 1.2);
  L[i] = Math.tanh(L[i] * 1.4) * fin * fout;
  R[i] = Math.tanh(R[i] * 1.4) * fin * fout;
}
let peak = 0;
for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
for (let i = 0; i < L.length; i++) {
  L[i] *= 0.7 / peak;
  R[i] *= 0.7 / peak;
}
writeWav(path.resolve(root, outArg), L, R);
console.log('music', total, 's');
