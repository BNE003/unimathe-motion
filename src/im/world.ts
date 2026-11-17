// Kamera, Bewegungen und Sichtbarkeit für das i-Video. Canvas und Overlays lesen nur von hier.
import {V2, clamp, easeInOutCubic, easeOutCubic, lerp, springOS} from '../math';
import {A, E, T} from './timeline';

type Key = [number, number, number, ((x: number) => number)?];
// ab Zeit `at` in `dur` Sekunden weich auf den Wert `to`
export const chain = (t: number, v0: number, keys: Key[]) =>
  keys.reduce((v, [at, dur, to, ease = easeInOutCubic]) => lerp(v, to, ease(clamp((t - at) / Math.max(1e-3, dur)))), v0);
const fade = (t: number, keys: Key[], v0 = 0) => chain(t, v0, keys);

/* ---------- Kamera: Ursprung im Bild und Pixel pro Einheit ---------- */

export type Cam = {ox: number; oy: number; u: number};
export const toS = (c: Cam, [x, y]: V2): V2 => [c.ox + c.u * x, c.oy - c.u * y];

// Hook und Problem: Gerade mittig, i schwebt groß darüber · Geschichte: Gerade sinkt ab · Ebene: nah
export const camAt = (t: number): Cam => {
  const oy = chain(t, 1080, [
    [A(6) - 0.1, 0.9, 1330],
    [A(9) - 0.25, 1.0, 1060],
    [A(21) - 0.1, 1.4, 1000],
  ]);
  const u = chain(t, 240, [
    [A(9) - 0.25, 1.0, 330],
    [A(21) - 0.1, 1.4, 175],
  ]);
  // die Kamera steht nie ganz still
  const drift = 1 + 0.012 * Math.sin(t * 0.37);
  return {ox: 540 + 5 * Math.sin(t * 0.29), oy, u: u * drift};
};

/* ---------- Hook: i stürzt auf die Gerade, prallt ab, schwebt über der 0 ---------- */

export const IMPACT = 0.42;
export const iHeight = (t: number) => {
  if (t < IMPACT) {
    const k = t / IMPACT;
    return lerp(3.2, 0, k * k);
  }
  return springOS(clamp((t - IMPACT) / 1.0));
};
// Wellen auf der Geraden nach dem Aufprall
export const ripple = (t: number, x: number) => {
  const dt = t - IMPACT;
  if (dt < 0 || dt > 1.6) return 0;
  const front = dt * 7;
  const d = Math.abs(x);
  if (d > front) return 0;
  return 0.09 * Math.sin((d - front) * 5.5) * Math.exp(-dt * 2.6) * Math.exp(-d * 0.35);
};

/* ---------- Problem: x und x² auf der Geraden ---------- */

// zwei ruhige Schritte: 1² = 1, dann springt das Quadrat von −1 in einem Bogen über die 0 auf +1
export const jumpK = (t: number) => easeInOutCubic(clamp((t - T.minus - 0.3) / 1.0));
export const JUMP_H = 0.5; // Höhe des Bogens in Einheiten

/* ---------- Ebene und Drehung ---------- */

export const vAxis = (t: number) => easeOutCubic(clamp((t - T.achse - 0.05) / 0.85));
// Winkel des Pfeils in Grad: 0 → 90 → 180, am Ende ruhige Dauerdrehung
export const thetaAt = (t: number) => {
  const a = chain(t, 0, [
    [T.einsI + 0.15, 0.85, 90],
    [T.iMinus + 0.15, 0.9, 180],
  ]);
  const spin = Math.max(0, t - T.also - 0.2);
  return a + 95 * spin * easeOutCubic(clamp(spin / 1.2));
};

export const vis = {
  line: (t: number) => fade(t, [[A(6), 0.6, 0.35], [A(9) - 0.25, 0.6, 1], [T.cta - 0.1, 0.8, 0.12]], 1),
  // großes schwebendes i
  glyph: (t: number) => fade(t, [[A(2) + 0.1, 0.6, 0.2], [A(6) - 0.1, 0.4, 0], [T.ausweg, 0.5, 0.75], [T.iSnap, 0.3, 1]], 1),
  arc0: (t: number) => fade(t, [[T.bogen, 0.25, 1], [A(2) + 0.2, 0.4, 0]]),
  neg: (t: number) => fade(t, [[T.minusEins - 0.1, 0.5, 1], [A(6) - 0.1, 0.5, 0]]),
  target: (t: number) => fade(t, [[T.minusEins - 0.1, 0.4, 1], [A(6) - 0.1, 0.4, 0], [T.mult, 0.4, 1], [T.also, 0.5, 0]]),
  one: (t: number) => fade(t, [[T.eins - 0.05, 0.35, 1], [A(6) - 0.1, 0.4, 0]]),
  minusPt: (t: number) => fade(t, [[T.minus - 0.05, 0.35, 1], [A(6) - 0.1, 0.4, 0]]),
  pos: (t: number) => fade(t, [[T.kein - 0.1, 0.6, 1], [A(6) - 0.1, 0.5, 0]]),
  grid: (t: number) => fade(t, [[T.achse + 0.3, 1.1, 1], [T.cta - 0.1, 0.8, 0.12]]),
  axisLabels: (t: number) => fade(t, [[T.senkrecht + 0.2, 0.5, 1], [T.cta - 0.2, 0.5, 0]]),
  rightAngle: (t: number) => fade(t, [[T.senkrecht + 0.1, 0.4, 1], [T.liegt + 0.3, 0.4, 0]]),
  dotOne: (t: number) => fade(t, [[T.mult - 0.1, 0.35, 1], [T.cta - 0.2, 0.5, 0]]),
  dotI: (t: number) => fade(t, [[T.iSnap, 0.2, 1], [T.cta - 0.2, 0.5, 0]]),
  arrow: (t: number) => fade(t, [[T.mult + 0.2, 0.4, 1], [T.cta - 0.1, 0.6, 0.2]]),
  arcs: (t: number) => fade(t, [[T.einsI, 0.2, 1], [T.also - 0.1, 0.5, 0]]),
  realGlow: (t: number) => fade(t, [[T.erweitert - 0.4, 0.5, 1], [T.cta - 0.2, 0.5, 0]]),
  circle: (t: number) => fade(t, [[T.also + 0.3, 0.8, 1], [T.cta - 0.1, 0.6, 0.15]]),
};

// Glanz beim Einrasten
export const pulse = (t: number, at: number, d = 0.9) => {
  const x = (t - at) / d;
  return x < 0 || x > 1 ? 0 : Math.sin(Math.PI * x) * (1 - x * 0.4);
};
export {A, E};
