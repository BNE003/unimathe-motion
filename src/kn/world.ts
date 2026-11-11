// Geometrie, Zustände und Kamera für „Wie kann eine Matrix einen Vektor verschwinden lassen?“.
// Canvas und Overlays lesen beide nur von hier. Der Punkt (x, y) der Ebene liegt bei Welt (x, y, 0) auf dem Glasboden.
//
// A = (1 −1; 0 0), also A·(x, y) = (x − y, 0). A² = A: eine schräge Projektion auf die x-Achse.
// Animation von I nach A: M(s) = (1 −s; 0 1−s), M(s)·p = p − s·y·(1, 1). Jeder Punkt fährt also parallel zu (1, 1)
// auf seiner „Schiene“ y − x = c, bis er auf der x-Achse liegt (bei x − y). det M(s) = 1 − s > 0: nichts klappt um.
// Die Schiene durch den Nullpunkt ist die Diagonale y = x: alles darauf landet in 0. Das ist der Kern von A.
import {V2, bump, clamp, easeInOutCubic, easeOutCubic, lerp} from '../math';
import {V3, makeCam} from '../space';
import {T} from './timeline';

type Key = [number, number, number, ((x: number) => number)?];
// ab Zeit `at` in `dur` Sekunden weich auf den Wert `to`
export const chain = (t: number, v0: number, keys: Key[]) =>
  keys.reduce((v, [at, dur, to, ease = easeInOutCubic]) => lerp(v, to, ease(clamp((t - at) / dur))), v0);
const eio = easeInOutCubic;
const sine = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);
const step = (t: number, at: number, d: number) => eio(clamp((t - at) / d));

/* ---------- Mathematik ---------- */

export const Amul = (p: V2): V2 => [p[0] - p[1], 0];
// Zwischenstufe der Animation: M(s)·p
export const Ms = (p: V2, s: number): V2 => [p[0] - s * p[1], (1 - s) * p[1]];
export const flat = (p: V2, z = 0): V3 => [p[0], p[1], z];

export const VV: V2 = [2, 2]; // der Vektor aus dem Hook
export const OTHERS: V2[] = [
  [3, 1], // → (2, 0)
  [-1, 2], // → (−3, 0)
];
// der doppelte, der halbe, der umgedrehte
export const KVECS: {v: V2; at: number}[] = [
  {v: [4, 4], at: T.doppelte},
  {v: [1, 1], at: T.halbe},
  {v: [-2, -2], at: T.umgedreht},
];
// viele Vektoren der Geraden: Spitzen t·(1, 1)
export const BEADS: number[] = Array.from({length: 29}, (_, i) => -6 + i * 0.5).filter((k) => k !== 0);
// kein Zurück: zwei Vektoren auf derselben Schiene y = x − 2 landen beide auf (2, 0)
export const PAIR: V2[] = [
  [3, 1],
  [4, 2],
];
export const PAIR_HIT: V2 = [2, 0];

/* ---------- Zustände ---------- */

// Hook: Gitter und v werden abgebildet, beim „Spul zurück“ läuft alles zurück
// Die Matrix trifft den Vektor bei „Heraus kommt“, bei „nichts!“ ist er im Nullpunkt
export const HOOK: [number, number] = [T.heraus + 0.2, T.nichts + 0.02 - (T.heraus + 0.2)];
export const REWIND: [number, number] = [T.spul + 0.05, 0.85];
export const sHook = (t: number) => (t < REWIND[0] ? step(t, HOOK[0], HOOK[1]) : 1 - step(t, REWIND[0], REWIND[1]));

// Punkte des Gitters rutschen auf ihren Schienen
export const DOTS_SLIDE: [number, number] = [T.rutscht + 0.15, 2.4];
export const sDots = (t: number) => step(t, DOTS_SLIDE[0], DOTS_SLIDE[1]);
export const DOTS: V2[] = [];
for (let x = -4; x <= 6; x++) for (let y = -3; y <= 4; y++) if (Math.abs(y) > 0 || Math.abs(x) <= 6) DOTS.push([x, y]);

// andere Pfeile: tauchen nacheinander auf und rutschen auf die Achse
export const OTHER_IN = (i: number) => T.anderen + 0.1 + i * 0.22;
export const OTHER_SLIDE: [number, number] = [T.anderen + 0.85, 1.35];
export const sOther = (t: number) => step(t, OTHER_SLIDE[0], OTHER_SLIDE[1]);

// v fährt auf seiner Schiene in den Nullpunkt
export const V_SLIDE: [number, number] = [T.nullpunkt - 0.05, 1.15];
export const sV = (t: number) => (t < T.aber - 0.5 ? sHook(t) : step(t, V_SLIDE[0], V_SLIDE[1]));

// der doppelte, der halbe, der umgedrehte
export const K_SLIDE_D = 0.85;
export const kIn = (i: number) => KVECS[i].at - 0.05;
export const kSlideAt = (i: number) => KVECS[i].at + 0.4;
export const sK = (t: number, i: number) => step(t, kSlideAt(i), K_SLIDE_D);

// viele Vektoren: wachsen vom Nullpunkt nach außen, landen alle zugleich, fahren beim Benennen zurück
export const BEADS_IN: [number, number] = [T.jeder - 0.1, 1.5];
export const beadIn = (t: number, k: number) => step(t, BEADS_IN[0] + (Math.abs(k) / 6) * BEADS_IN[1] * 0.75, 0.35);
export const BEADS_SLIDE: [number, number] = [T.einzigen - 0.15, 1.15];
export const BEADS_BACK: [number, number] = [T.alle + 0.1, 1.1];
export const sBeads = (t: number) => (t < BEADS_BACK[0] ? step(t, BEADS_SLIDE[0], BEADS_SLIDE[1]) : 1 - step(t, BEADS_BACK[0], BEADS_BACK[1]));

// zwei Vektoren auf derselben Schiene
export const PAIR_SLIDE: [number, number] = [T.zwei + 0.55, 1.5];
export const sPair = (t: number) => step(t, PAIR_SLIDE[0], PAIR_SLIDE[1]);

/* ---------- Sichtbarkeit ---------- */

export const vis = {
  stage: (t: number) => chain(t, 1, [[T.cta - 0.1, 0.8, 0.12]]),
  // bewegtes, helles Gitter (Hook); danach bleibt nur das ruhige Gitter
  liveGrid: (t: number) => chain(t, 1, [[REWIND[0] + REWIND[1], 0.6, 0]]),
  dots: (t: number) => chain(t, 0, [[T.punkte - 0.25, 0.5, 1], [T.anderen - 0.2, 0.6, 0]]),
  rails: (t: number) => chain(t, 0, [[DOTS_SLIDE[0], 1.2, 0.75], [T.moment, 1, 0.3], [T.deshalb, 0.6, 0.12]]),
  other: (t: number, i: number) => chain(t, 0, [[OTHER_IN(i), 0.35, 1], [T.aber, 0.6, 0.35], [T.moment, 0.6, 0]]),
  v: (t: number) => chain(t, 1, [[REWIND[0] + REWIND[1], 0.4, 0.3], [T.aber - 0.1, 0.4, 1]]),
  // gestrichelter Umriss von v an seinem Platz, nachdem es verschwunden ist
  vGhost: (t: number) => chain(t, 0, [[HOOK[0] + HOOK[1] - 0.4, 0.4, 0.8], [REWIND[0], 0.3, 0], [V_SLIDE[0] + 0.6, 0.5, 0.8], [T.doppelte, 0.5, 0]]),
  kernRail: (t: number) => chain(t, 0, [[T.schiene - 0.1, 0.5, 1], [T.deshalb, 0.6, 0.3], [T.cta - 0.3, 0.5, 0]]),
  kvec: (t: number, i: number) => chain(t, 0, [[kIn(i), 0.3, 1]]) * (1 - step(t, T.jeder - 0.2, 0.3)),
  beads: (t: number) => chain(t, 1, [[T.deshalb, 0.6, 0.3]]),
  pair: (t: number) => chain(t, 0, [[T.deshalb + 0.1, 0.45, 1], [T.cta - 0.3, 0.5, 0]]),
  ask: (t: number) => chain(t, 0, [[T.dort + 0.2, 0.5, 1], [T.cta - 0.3, 0.5, 0]]),
};

// Leuchten des Nullpunkts: jedes Mal, wenn etwas dort landet
export const zeroGlow = (t: number) =>
  0.25 +
  bump(t, HOOK[0] + HOOK[1], 1.2) * 1.2 +
  bump(t, V_SLIDE[0] + V_SLIDE[1], 1.2) * 1.1 +
  KVECS.reduce((s, _, i) => s + bump(t, kSlideAt(i) + K_SLIDE_D, 0.9) * 0.8, 0) +
  // viele Vektoren: wird heller und bleibt hell, bis sie zurückfahren
  sBeads(t) * 1.4 * (t < BEADS_BACK[0] ? 1 : 0) +
  bump(t, BEADS_SLIDE[0] + BEADS_SLIDE[1], 1.4) * 1.2 +
  bump(t, T.nullvektor + 0.2, 1.2) * 1.3;

/* ---------- Kamera ---------- */

// Blick schräg von vorn auf den Glasboden: x läuft quer durchs Bild, y in die Tiefe.
const O = easeOutCubic;
export const camAt = (t: number) => {
  const th = chain(t, 54, [
    [0, 5, 62, O],
    [T.spul, 2.5, 66],
    [T.moment, 3, 60],
    [T.alle, 2.5, 66],
    [T.deshalb, 2, 64],
  ]);
  const ph = chain(t, -102, [
    [0, 6, -95, O],
    [T.spul, 14, -85, sine],
    [T.moment, 10, -96, sine],
    [T.alle, 8, -88, sine],
    [T.deshalb, 7, -94, sine],
  ]);
  const u = chain(t, 190, [
    [0, 5, 172, O],
    [T.spul, 2, 150],
    [T.aber, 2, 165],
    [T.jeder - 0.5, 2, 140],
    [T.alle, 2, 150],
    [T.deshalb, 1.6, 168],
  ]);
  const tx = chain(t, 0.6, [[T.spul, 2, 0.7], [T.aber, 2, 0.8], [T.jeder - 0.5, 2, 0.4], [T.deshalb, 1.6, 2.2]]);
  const ty = chain(t, 0.7, [[T.spul, 2, 0.5], [T.aber, 2, 0.8], [T.jeder - 0.5, 2, 0.3], [T.deshalb, 1.6, 0.9]]);
  // im Hook tiefer, damit die große Matrix darüber Platz hat
  const cy = chain(t, 1180, [[T.spul, 2, 980], [T.alle, 2, 1000], [T.deshalb, 1.6, 980]]);
  const base = makeCam(th, ph, 540, cy, u);
  const rel = (q: V3): V3 => [q[0] - tx, q[1] - ty, q[2]];
  const cam = {p: (q: V3) => base.p(rel(q)), depth: (q: V3) => base.depth(rel(q))};
  return {cam, th, ph, u};
};
export type KCam = ReturnType<typeof camAt>['cam'];
export const project = (t: number, q: V3): V2 => camAt(t).cam.p(q);
