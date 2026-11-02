// Findet Sprechpausen in einer 16-kHz-Mono-WAV: node tools/pauses.mjs file.wav [minPause=0.45]
import fs from 'node:fs';
const [file, minP = '0.45'] = process.argv.slice(2);
const b = fs.readFileSync(file);
let off = 12;
let data = null;
let sr = 16000;
while (off < b.length) {
  const id = b.toString('ascii', off, off + 4);
  const size = b.readUInt32LE(off + 4);
  if (id === 'fmt ') sr = b.readUInt32LE(off + 12);
  if (id === 'data') { data = b.subarray(off + 8, off + 8 + size); break; }
  off += 8 + size + (size % 2);
}
const n = data.length / 2;
const win = Math.round(sr * 0.02);
const rms = [];
for (let i = 0; i + win <= n; i += win) {
  let s = 0;
  for (let j = 0; j < win; j++) { const v = data.readInt16LE((i + j) * 2) / 32768; s += v * v; }
  rms.push(Math.sqrt(s / win));
}
const thr = 0.012;
const pauses = [];
let start = -1;
rms.forEach((r, k) => {
  if (r < thr) { if (start < 0) start = k; }
  else if (start >= 0) { const d = (k - start) * 0.02; if (d >= Number(minP)) pauses.push([start * 0.02, k * 0.02]); start = -1; }
});
const total = n / sr;
console.log('dauer', total.toFixed(2));
// Sprachsegmente zwischen den Pausen
let prev = 0;
const segs = [];
for (const [a, e] of pauses) { if (a - prev > 0.05) segs.push([prev, a]); prev = e; }
if (total - prev > 0.05) segs.push([prev, total]);
segs.forEach(([a, e], i) => console.log(String(i).padStart(2), a.toFixed(2), e.toFixed(2), (e - a).toFixed(2)));
