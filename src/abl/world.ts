// Mathematik, Kamera und Sichtbarkeit für „Warum misst die Ableitung die Steigung?“. Canvas und Overlays lesen nur von hier.
import {V2, bump, clamp, easeInOutCubic, easeOutCubic, lerp} from '../math';
import {T} from './timeline';

/* ---------- Mathematik: f(x) = x², Punkt P = (1 | 1) ---------- */

export const f = (x: number) => x * x;
export const X0 = 1;
export const P: V2 = [X0, f(X0)];
// Steigung der Sekante durch P und Q = (1+h | f(1+h)): ((1+h)² − 1)/h = 2 + h für h ≠ 0
export const secSlope = (h: number) => (f(X0 + h) - f(X0)) / h;
export const TAN_SLOPE = 2;

type Key = [number, number, number, ((x: number) => number)?];
// ab Zeit `at` in `dur` Sekunden weich auf den Wert `to`
export const chain = (t: number, v0: number, keys: Key[]) =>
  keys.reduce((v, [at, dur, to, ease = easeInOutCubic]) => lerp(v, to, ease(clamp((t - at) / Math.max(1e-3, dur)))), v0);

const L05 = Math.log10(0.5);

// Zeitpunkt, an dem Q die Seite wechselt (Kamera steht dann ganz in der Übersicht)
export const SWITCH = T.links + 0.45;
const COLLAPSE_FROM = T.zusammen + 0.4;
export const COLLAPSE_AT = T.nullNull + 0.25;

// h(t): erst rechts 1 → 0,5 → 0,1 → 0,01 (Halt bei jeder gesprochenen Zahl), dann links −1 → −0,01, dann gegen 0
export const hAt = (t: number) => {
  if (t < SWITCH) {
    const L = chain(t, 0, [
      [T.naeher + 0.7, T.v25 - T.naeher - 0.75, L05],
      [T.v25 + 0.85, T.v21 - T.v25 - 0.9, -1],
      [T.v21 + 0.85, T.v201 - T.v21 - 0.9, -2],
    ]);
    return Math.pow(10, L);
  }
  if (t < COLLAPSE_FROM) {
    const L = chain(t, 0, [
      [SWITCH + 0.5, 0.65, L05],
      [SWITCH + 1.25, 0.65, -1],
      [SWITCH + 2.0, 0.85, -2],
    ]);
    return -Math.pow(10, L);
  }
  const k = easeInOutCubic(clamp((t - COLLAPSE_FROM) / (COLLAPSE_AT - COLLAPSE_FROM)));
  return -0.01 * (1 - k);
};
export const side = (t: number) => (t < SWITCH ? 1 : -1);
// h = 0: die Punkte liegen aufeinander, es gibt keine Sekante
export const collapsed = (t: number) => t >= COLLAPSE_AT;

export const Q = (h: number): V2 => [X0 + h, f(X0 + h)];
// Ecke des Steigungsdreiecks: rechts (1+h | 1), links (1 | f(1+h))
export const corner = (h: number): V2 => (h > 0 ? [X0 + h, f(X0)] : [X0, f(X0 + h)]);

/* ---------- Kamera ---------- */

// Abbildung: Bildpunkt von P und Pixel pro Einheit
export type Cam = {px: number; py: number; u: number};
export const toS = (c: Cam, [x, y]: V2): V2 => [c.px + c.u * (x - X0), c.py - c.u * (y - f(X0))];
export const fromSx = (c: Cam, sx: number) => X0 + (sx - c.px) / c.u;

export const U0 = 220;
// Dreieck bleibt beim Heranzoomen 250 px breit, seine Mitte steht bei (540 | 980)
const TRI = 250;
const ANCHOR: V2 = [540, 980];

const trackCam = (h: number): Cam => {
  const u = TRI / Math.abs(h);
  return {px: ANCHOR[0] - (u * h) / 2, py: ANCHOR[1] + (u * (f(X0 + h) - f(X0))) / 2, u};
};

const overviewCam = (t: number): Cam => ({px: 600, py: 1180, u: lerp(204, U0, easeOutCubic(clamp(t / 4.5)))});

// Gewicht der Übersicht: 1 = ganze Kurve, 0 = Kamera folgt dem Dreieck
export const overviewW = (t: number) =>
  chain(t, 1, [
    [T.naeher - 0.1, 1.1, 0],
    [T.links, 0.42, 1],
    [SWITCH + 0.1, 0.75, 0],
    [T.ziel + 0.2, T.tangente + 0.9 - T.ziel - 0.2, 1],
  ]);

export const camAt = (t: number): Cam => {
  const h = hAt(t);
  const s = h === 0 ? -1 : Math.sign(h);
  const hc = s * Math.max(Math.abs(h), 0.01);
  const a = trackCam(hc);
  const b = overviewCam(t);
  const w = overviewW(t);
  return {
    px: lerp(a.px, b.px, w),
    py: lerp(a.py, b.py, w),
    u: Math.pow(10, lerp(Math.log10(a.u), Math.log10(b.u), w)),
  };
};
export const zoomFactor = (t: number) => camAt(t).u / U0;

/* ---------- Hook ---------- */

// Kurve zeichnet sich, ein Lichtpunkt fährt sie entlang und hält in P
export const curveDraw = (t: number) => lerp(0.5, 1, easeOutCubic(clamp(t / 1.1)));
export const CURVE_X: [number, number] = [-1.7, 2.6];
export const ARRIVE = T.punkt + 0.35;
export const riderX = (t: number) => lerp(-1.25, X0, easeInOutCubic(clamp(t / ARRIVE)));

/* ---------- Sichtbarkeit ---------- */

const fade = (t: number, keys: Key[], v0 = 0) => chain(t, v0, keys);

export const vis = {
  q: (t: number) => fade(t, [[T.zweiP, 0.3, 1], [T.links, 0.28, 0], [SWITCH + 0.05, 0.3, 1], [COLLAPSE_AT, 0.15, 0]]),
  // Sekante wächst bei „Von hier bis hier“ von P nach Q, danach als ganze Gerade
  secGrow: (t: number) => clamp((t - T.hier) / 0.7),
  sec: (t: number) => fade(t, [[T.hier, 0.2, 1], [T.links, 0.28, 0], [SWITCH + 0.1, 0.35, 1], [COLLAPSE_AT, 0.05, 0]]),
  tri: (t: number) => fade(t, [[T.hier + 0.7, 0.45, 1], [T.links, 0.28, 0], [SWITCH + 0.15, 0.35, 1], [COLLAPSE_AT, 0.1, 0]]),
  secTag: (t: number) => fade(t, [[T.hier + 0.9, 0.4, 1], [T.naeher + 0.3, 0.4, 0]]),
  // Fächer der bisherigen Sekanten; schließt sich zur Tangente
  fan: (t: number) => fade(t, [[T.naeher + 0.8, 0.5, 1], [T.ziel + 0.75, 0.6, 0]]),
  fanClose: (t: number) => clamp((t - T.ziel - 0.1) / 0.75),
  tan: (t: number) => fade(t, [[T.ziel + 0.35, 0.3, 1], [T.cta - 0.1, 0.5, 0.3]]),
  tanGrow: (t: number) => easeOutCubic(clamp((t - T.ziel - 0.35) / 0.8)),
  tanTag: (t: number) => fade(t, [[T.tangente, 0.4, 1], [T.cta - 0.2, 0.4, 0]]),
  tanTri: (t: number) => fade(t, [[T.ableitung + 0.1, 0.5, 1], [T.cta - 0.2, 0.4, 0]]),
  rider: (t: number) => fade(t, [[ARRIVE + 0.1, 0.3, 0]], 1),
  p: (t: number) => fade(t, [[ARRIVE - 0.12, 0.2, 1]]),
  stage: (t: number) => fade(t, [[T.cta - 0.1, 0.8, 0.12]], 1),
};

// Glanz von P bei der Ankunft und beim Einrasten der Tangente
export const pPulse = (t: number) => bump(t, ARRIVE - 0.05, 0.9) + bump(t, T.tangente - 0.1, 0.9) * 0.8;
export const zeroPulse = (t: number) => bump(t, COLLAPSE_AT - 0.05, 0.8);
export const tanPulse = (t: number) => bump(t, T.tangente - 0.1, 1.0);
