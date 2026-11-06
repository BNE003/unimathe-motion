// Geometrie, Kamera und Bühnenzustand für „Warum ist das Skalarprodukt bei 90° null?“. Canvas und Overlays lesen beide nur von hier.
import {V2, bump, clamp, easeInOutCubic, easeOutCubic, lerp, prog} from '../math';
import {V3, makeCam} from '../space';
import {T} from './timeline';

// b liegt auf der x-Achse, a dreht in der xz-Ebene, das Licht fällt längs −z. Der Fußpunkt beider Vektoren ist der Ursprung.
export const LEN_A = 4;
export const LEN_B = 6;

type Key = [number, number, number, ((x: number) => number)?];
// ab Zeit `at` in `dur` Sekunden weich auf den Wert `to`
export const chain = (t: number, v0: number, keys: Key[]) =>
  keys.reduce((v, [at, dur, to, ease = easeInOutCubic]) => lerp(v, to, ease(clamp((t - at) / dur))), v0);

const inQuad = (x: number) => x * x;
const sine = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);

// Winkel zwischen a und b in Grad. Bleibt immer in 0…90°, exakt 90° nach jedem Einrasten.
export const alphaAt = (t: number) =>
  chain(t, 62, [
    [0, 1.05, 14, easeOutCubic],
    [T.wenn + 0.1, T.null1 - T.wenn - 0.1, 90, inQuad],
    [T.warum - 0.05, 0.85, 0],
    [T.sk + 0.5, 1.5, 36],
    [T.richtung - 0.1, 1.1, 0],
    [T.stell, 0.9, 20],
    [T.je, T.verschw2 + 0.32 - T.je, 90, sine],
    [T.formel + 0.1, 1.5, 50],
    [T.bei90b + 0.2, T.kosnull - T.bei90b - 0.2, 90],
  ]);

export const lenA = (t: number) => chain(t, LEN_A, [[T.egal - 0.1, 1.5, 9], [T.nennt - 0.2, 0.9, LEN_A]]);
export const lenB = (t: number) => chain(t, LEN_B, [[T.egal - 0.1, 1.5, 30], [T.nennt - 0.2, 0.9, LEN_B]]);

const rad = (d: number) => (d * Math.PI) / 180;
// exakt null bei 90°, nicht nur 6·10⁻¹⁷
export const cosDeg = (d: number) => (d >= 90 ? 0 : Math.cos(rad(d)));
export const shadowLen = (t: number) => lenA(t) * cosDeg(alphaAt(t));
export const dotValue = (t: number) => shadowLen(t) * lenB(t);
export const tipA = (t: number): V3 => {
  const a = rad(alphaAt(t));
  const L = lenA(t);
  return [L * cosDeg(alphaAt(t)), 0, L * Math.sin(a)];
};

/* ---------- Sichtbarkeit ---------- */

export const vis = {
  // Fläche des Rechtecks
  rect: (t: number) => chain(t, 1, [[T.null1 + 0.15, 0.5, 0], [T.warum - 0.05, 0.4, 1], [T.stell, 0.8, 0.14], [T.verschw2 + 0.2, 0.3, 0], [T.malb + 0.1, 0.4, 1], [T.kosnull + 0.15, 0.5, 0]]),
  // Rechteck klappt bei „diese Fläche“ von der Schattenkante nach vorne auf
  rectDepth: (t: number) => chain(t, 1, [[T.formel, 0.2, 0], [T.malb + 0.1, 1.1, 1]]),
  light: (t: number) => chain(t, 0, [[T.stell, 1.0, 1], [T.formel + 1.2, 0.8, 0.55], [T.deshalb, 0.8, 0.25], [T.cta - 0.3, 0.5, 0]]),
  shadow: (t: number) => chain(t, 0, [[T.schatten - 0.1, 0.5, 1], [T.cta - 0.3, 0.5, 0]]),
  arc: (t: number) => chain(t, 0, [[T.bei - 0.1, 0.5, 1], [T.warum, 0.3, 0], [T.sk + 0.4, 0.4, 1], [T.egal - 0.1, 0.4, 0], [T.nennt, 0.4, 1], [T.cta - 0.3, 0.5, 0]]),
  right: (t: number) => chain(t, 0, [[T.null1 - 0.05, 0.25, 1], [T.warum, 0.3, 0], [T.verschw2 + 0.2, 0.3, 1], [T.formel, 0.3, 0], [T.kosnull, 0.25, 1], [T.cta - 0.3, 0.5, 0]]),
  stage: (t: number) => chain(t, 1, [[T.cta - 0.1, 0.8, 0.09]]),
};

// Ringe auf dem Boden bei den Nullmomenten
export const RIPPLES = [T.null1, T.verschw2 + 0.32, T.kosnull];

// Pulsieren beider Vektoren bei „keiner verschwindet“
export const pulseA = (t: number) => bump(t, T.obwohl - 0.05, 1.0) + bump(t, T.dieser, 1.1) * 0.6;
export const pulseB = (t: number) => bump(t, T.verschw1 - 0.2, 1.0) + bump(t, T.malb, 1.0) * 0.6;

/* ---------- Kamera ---------- */

const O = easeOutCubic;

export const camAt = (t: number) => {
  const toTop = T.bei90 - 0.25;
  const topD = T.verschw2 + 0.5 - toTop;
  const th = chain(t, 54, [[0, 1.5, 27, O], [T.obwohl, 2, 21], [T.warum, 0.9, 30], [T.stell, 1.3, 42], [toTop, topD, 90], [T.senk - 0.1, 1.4, 11], [T.formel, 1.5, 36], [T.egal - 0.2, 1.4, 24], [T.nennt - 0.2, 1.2, 15]]);
  const top = clamp((th - 55) / 30);
  const ph0 = chain(t, -152, [[0, 1.5, -101, O], [T.obwohl, 2, -80], [T.warum, 0.9, -93], [T.stell, 1.5, -104], [toTop, topD, -90], [T.formel, 1.5, -99], [T.nennt - 0.2, 1.6, -118]]);
  const ph = ph0 + 3.5 * Math.sin(t / 4.3) * (1 - top);
  const u = chain(t, 142, [[0, 1.5, 116, O], [T.warum, 0.9, 110], [toTop, topD, 128], [T.formel, 1.5, 102], [T.egal - 0.2, 1.5, 62], [T.nennt - 0.2, 1.1, 118]]);
  const cx = chain(t, 270, [[0, 1.5, 196, O], [toTop, topD, 232], [T.formel, 1.5, 200], [T.nennt - 0.2, 1.2, 330]]);
  const cy = chain(t, 1140, [[0, 1.5, 1040, O], [toTop, topD, 1000], [T.senk - 0.1, 1.4, 1190], [T.formel, 1.5, 1030], [T.egal - 0.2, 1.5, 1285], [T.nennt - 0.2, 1.2, 1170]]);
  return {cam: makeCam(th, ph, cx, cy, u), th, ph, u, top};
};

export const project = (t: number, q: V3): V2 => camAt(t).cam.p(q);
export {prog};
