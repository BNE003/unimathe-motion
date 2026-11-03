// Kürzt Sprechpausen und beschleunigt leicht: node tools/tighten.mjs in.mp3 out.mp3 tempo "a:b:keep,a:b:keep,…"
// a/b = Pause in der Originaldatei (s), keep = gewünschte Pausenlänge (s). Gibt die Umrechnung alt → neu aus.
import {execFileSync} from 'node:child_process';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dir = path.join(root, 'node_modules/@remotion/compositor-darwin-arm64');
const [inp, out, tempoArg, cutsArg] = process.argv.slice(2);
const tempo = Number(tempoArg);
const cuts = cutsArg.split(',').map((s) => s.split(':').map(Number)); // [a, b, keep]

// Behaltene Stücke der Originaldatei
const keep = [];
let from = 0;
for (const [a, b, k] of cuts) {
  keep.push([from, a + k / 2]);
  from = b - k / 2;
}
keep.push([from, null]);

const parts = keep.map(([s, e], i) => `[0:a]atrim=start=${s}${e === null ? '' : `:end=${e}`},asetpts=PTS-STARTPTS[p${i}]`);
const filter = `${parts.join(';')};${keep.map((_, i) => `[p${i}]`).join('')}concat=n=${keep.length}:v=0:a=1,atempo=${tempo}[o]`;
execFileSync(path.join(dir, 'ffmpeg'), ['-loglevel', 'error', '-y', '-i', inp, '-filter_complex', filter, '-map', '[o]', '-b:a', '192k', out], {
  env: {...process.env, DYLD_LIBRARY_PATH: dir},
});
console.log(JSON.stringify({tempo, cuts}));
