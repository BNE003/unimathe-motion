// Kamera und Bühnenzustand für „Gabriels Horn“. Canvas und Overlays lesen beide nur von hier.
// Welt: Achse des Horns = x-Achse, z zeigt nach oben. Radius r(x) = 1/x.
import {V2, clamp, easeInOutCubic, easeOutCubic, lerp, prog} from '../math';
import {V3, dot3} from '../space';
import {volTo} from './fn';
import {T} from './timeline';

type Key = [number, number, number, ((x: number) => number)?];
// ab Zeit `at` in `dur` Sekunden weich auf den Wert `to`
export const chain = (t: number, v0: number, keys: Key[]) =>
  keys.reduce((v, [at, dur, to, ease = easeInOutCubic]) => lerp(v, to, ease(clamp((t - at) / dur))), v0);

const sine = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);
const lin = (x: number) => x;

/* ---------- Kamera mit Ziel und einstellbarer Perspektive ---------- */

export type Cam = {
  p: (q: V3) => V2;
  depth: (q: V3) => number;
  scale: (q: V3) => number; // Pixel je Welteinheit an diesem Punkt
  pos: V3;
  fw: V3;
  r: V3;
  up: V3;
};

export const makeCam = (theta: number, phi: number, tg: V3, D: number, u: number, cx: number, cy: number): Cam => {
  const th = (theta * Math.PI) / 180;
  const ph = (phi * Math.PI) / 180;
  const r: V3 = [-Math.sin(ph), Math.cos(ph), 0];
  const up: V3 = [-Math.sin(th) * Math.cos(ph), -Math.sin(th) * Math.sin(ph), Math.cos(th)];
  const fw: V3 = [Math.cos(th) * Math.cos(ph), Math.cos(th) * Math.sin(ph), Math.sin(th)];
  const pos: V3 = [tg[0] + fw[0] * D, tg[1] + fw[1] * D, tg[2] + fw[2] * D];
  const rel = (q: V3): V3 => [q[0] - tg[0], q[1] - tg[1], q[2] - tg[2]];
  const depth = (q: V3) => D - dot3(rel(q), fw);
  return {
    p: (q) => {
      const d = rel(q);
      const f = (u * D) / Math.max(0.05, D - dot3(d, fw));
      return [cx + f * dot3(d, r), cy - f * dot3(d, up)];
    },
    depth,
    scale: (q) => (u * D) / Math.max(0.05, depth(q)),
    pos,
    fw,
    r,
    up,
  };
};

// Seitenansicht: x nach rechts, z nach oben, Blick leicht von links oben
const SIDE = {th: 12, ph: 262, tx: 4.5, D: 16, u: 120, cx: 540, cy: 760};

export const camAt = (t: number) => {
  const toGraph = T.wie + 0.1;
  const graphD = T.kurve - toGraph + 0.2;
  const th = chain(t, 17, [
    [0, 2.3, 21, sine],
    [T.trotzdem - 0.1, 1.6, 26],
    [toGraph, graphD, 0],
    [T.rotiert + 0.3, 2.2, SIDE.th],
    [T.halbeDicke - 0.3, 1.2, 17],
    [T.jedesStueck - 0.4, 1.0, SIDE.th],
    [T.endlich - 0.6, 1.8, 20],
  ]);
  const ph = chain(t, 224, [
    [0, 2.3, 209, sine],
    [T.trotzdem - 0.1, 1.6, 206],
    [T.aber, 4.5, 214, lin],
    [toGraph, graphD, 270],
    [T.rotiert + 0.3, 2.2, SIDE.ph],
    [T.halbeDicke - 0.3, 1.2, 238],
    [T.jedesStueck - 0.4, 1.0, SIDE.ph],
    [T.endlich - 0.6, 6, 212, sine],
  ]);
  const tx = chain(t, 1.6, [
    [0, 2.3, 4.0, sine],
    [T.trotzdem - 0.1, 1.6, 3.4],
    [toGraph, graphD, SIDE.tx],
    [T.nie - 0.2, 1.8, 9.2],
    [T.endlich - 0.6, 1.8, 3.6],
  ]);
  const D = chain(t, 5.5, [
    [T.trotzdem - 0.1, 1.6, 8.5],
    [toGraph, graphD, SIDE.D],
    [T.endlich - 0.6, 1.8, 9],
  ]);
  const u = chain(t, 175, [
    [0, 2.3, 185, sine],
    [T.trotzdem - 0.1, 1.6, 150],
    [toGraph, graphD, SIDE.u],
    [T.nie - 0.2, 1.8, 112],
    [T.endlich - 0.6, 1.8, 150],
  ]);
  const cx = chain(t, 300, [
    [0, 2.3, 380, sine],
    [T.trotzdem - 0.1, 1.6, 470],
    [toGraph, graphD, SIDE.cx],
    [T.endlich - 0.6, 1.8, 560],
  ]);
  const cy = chain(t, 1060, [
    [T.trotzdem - 0.1, 1.6, 1030],
    [toGraph, graphD, SIDE.cy],
    [T.endlich - 0.6, 1.8, 830],
  ]);
  return {cam: makeCam(th, ph, [tx, 0, 0], D, u, cx, cy), th, ph, u};
};

export const project = (t: number, q: V3): V2 => camAt(t).cam.p(q);

/* ---------- Horn: Sichtbarkeit, Rotation, Schnitte ---------- */

const TAU = Math.PI * 2;

// Das Horn löst sich bei „Wie geht das?“ in seine Kurve auf und entsteht neu durch Rotation
export const hornAlpha = (t: number) => (t < T.rotiert ? 1 - prog(t, T.wie + 0.15, 1.0) : 1);
export const sweepAt = (t: number) => (t < T.rotiert ? TAU : TAU * prog(t, T.rotiert, 2.4, sine));
export const curveVis = (t: number) => prog(t, T.wie + 0.5, 0.9) * (1 - prog(t, T.schneiden, 0.6));
export const axisVis = (t: number) => prog(t, T.wie + 0.5, 0.9) * (1 - prog(t, T.endlich - 0.3, 0.6));

// Abstand zwischen den Stücken
export const cutGap = (t: number) => 0.16 * prog(t, T.schneiden + 0.15, 0.9) * (1 - prog(t, T.endlich - 0.3, 1.0));
// Stücke [2^k, 2^(k+1)]; jedes rückt um k Lücken nach rechts
export const pieceOf = (x: number) => Math.max(0, Math.floor(Math.log2(x) + 1e-9));
export const shiftX = (x: number, gap: number) => gap * Math.min(pieceOf(x), 6);
export const pieceVis = (t: number) => prog(t, T.schneiden + 0.15, 0.6) * (1 - prog(t, T.endlich - 0.3, 0.8));

/* ---------- Farbe innen (Volumen) und Anstrich außen ---------- */

const LOG_FAR = 17; // 2^17: Front liegt weit hinter dem sichtbaren Ende
// Füllfront: im Hook rast sie ins Unendliche, später füllt sie Stück für Stück
export const fillX = (t: number): number => {
  if (t < T.wie + 1.2) {
    const p = prog(t, T.trotzdem + 0.35, T.fuellEnde - T.trotzdem - 0.1, (x) => x);
    if (p <= 0) return 1;
    // Volumen π·p genau zur Front X = 1/(1 − p)
    return 1 / Math.max(1e-6, 1 - Math.pow(p, 0.8) * (1 - 1e-6));
  }
  const L = chain(t, 0, [
    [T.piHalbe - 0.05, 0.75, 1],
    [T.piViertel - 0.05, 0.75, 2],
    [T.piAchtel - 0.05, 0.75, 3],
    [T.zusammen - 0.1, T.genauPi + 0.25 - T.zusammen, LOG_FAR, (x) => Math.pow(x, 1.6)],
  ]);
  return Math.pow(2, L);
};
export const fillAlpha = (t: number) => (t < T.wie + 1.2 ? hornAlpha(t) : 1 - 0.45 * prog(t, T.umfang, 0.6) * (1 - prog(t, T.endlich - 0.2, 0.8)));
export const volumeShown = (t: number) => volTo(fillX(t));

// Anstrich außen: Front bei e^s; s wächst gleichmäßig, die Fläche wächst ohne Ende
export const coatS = (t: number) => (t < T.wie + 1.2 ? 12.5 * prog(t, T.aber + 0.25, T.unendl - T.aber - 0.2, (x) => Math.pow(x, 1.8)) : 0);
export const coatX = (t: number) => Math.exp(coatS(t));
export const coatAlpha = (t: number) => (t < T.wie + 1.2 ? hornAlpha(t) * prog(t, T.aber + 0.1, 0.3) : 0);

/* ---------- Streck-Kopie: Stück [a, 2a] → [2a, 4a] ---------- */

export type CopyState = {a: number; o: number; lift: number; sx: number; sr: number; slide: number; lock: number};
export const copies = (t: number): CopyState[] => {
  const c1 = {
    a: 1,
    lift: 1.5 * prog(t, T.zieh, 0.6, easeOutCubic),
    sx: 1 + prog(t, T.laenge - 0.25, 0.8),
    sr: 1 - 0.5 * prog(t, T.dicke - 0.1, 0.7),
    slide: prog(t, T.passt - 0.45, 0.8),
    lock: T.passt + 0.35,
  };
  const s2 = T.passtEnde - 0.05;
  const c2 = {
    a: 2,
    lift: 1.0 * prog(t, s2, 0.3, easeOutCubic),
    sx: 1 + prog(t, s2 + 0.3, 0.5),
    sr: 1 - 0.5 * prog(t, s2 + 0.3, 0.5),
    slide: prog(t, s2 + 0.8, 0.45),
    lock: s2 + 1.25,
  };
  return [c1, c2].map((c) => ({...c, o: prog(t, c === c1 ? T.zieh - 0.1 : s2 - 0.1, 0.3) * (1 - prog(t, c.lock + 0.35, 0.5))}));
};
// Punkt des Stücks (vor Verschiebung) → Lage der Kopie
export const copyPoint = (c: CopyState, gap: number, q: V3): V3 => {
  const a = c.a;
  const x0 = lerp(a + shiftX(a, gap), 2 * a + shiftX(2 * a, gap), c.slide);
  const lift = c.lift * (1 - c.slide);
  return [x0 + (q[0] - a) * c.sx, q[1] * c.sr, q[2] * c.sr + lift];
};

/* ---------- Querschnitt, Umfang, Längen ---------- */

// kleine Scheibe (r = ½) gleitet in die große (r = 1): ein Viertel der Fläche
export const discSlide = (t: number) => prog(t, T.viertel + 0.15, 0.8);
export const discVis = (t: number) => prog(t, T.halbeDicke + 0.1, 0.5) * (1 - prog(t, T.piHalbe - 0.2, 0.5));
export const lenVis1 = (t: number) => prog(t, T.malL1, 0.4) * (1 - prog(t, T.piHalbe - 0.2, 0.5));
export const ringVis = (t: number) => prog(t, T.umfang + 0.1, 0.5) * (1 - prog(t, T.jedesStueck + 0.4, 0.5));
export const lenVis2 = (t: number) => prog(t, T.malL2, 0.4) * (1 - prog(t, T.jedesStueck + 0.4, 0.5));

/* ---------- Abrollen der Haut ---------- */

// Ort der Streifen in der Welt: Maßstab K, Mittellinie in Höhe ZC
export const BAND_K = 0.42;
export const BAND_ZC = -3.9;
const BAND_X0 = 1.08;
const BAND_SP = 0.25;
export const BANDS = [1, 2, 4, 8, 16, 32].map((a, i, all) => {
  const x0 = BAND_X0 + all.slice(0, i).reduce((s, b) => s + b * BAND_K + BAND_SP, 0);
  return {a, x0};
});
const bandStart = (i: number) => (i < 3 ? T.jedesStueck + 0.05 + i * 0.45 : T.nie - 0.15 + (i - 3) * 0.45);
export const unroll = (t: number, i: number) => ({
  b: prog(t, bandStart(i), 1.0),
  m: prog(t, bandStart(i) + 0.3, 1.0),
  o: prog(t, bandStart(i), 0.2) * (1 - prog(t, T.endlich - 0.3, 0.6)),
});
export const bandLanded = (t: number, i: number) => t >= bandStart(i) + 1.3;

// Ring mit Winkel θ (0 = zur Kamera, −y) beim Abrollgrad b: bogenlängentreu aufgebogen
export const unrollPoint = (x: number, r: number, th: number, b: number): V3 => {
  if (b < 1e-4) return [x, -r * Math.cos(th), r * Math.sin(th)];
  const k = Math.max(1e-4, 1 - b);
  const R = r / k;
  return [x, -R * Math.cos(th * k) + (R - r), R * Math.sin(th * k)];
};
export const slotPoint = (i: number, q: V3, m: number): V3 => {
  const {a, x0} = BANDS[i];
  const s: V3 = [x0 + (q[0] - a) * BAND_K, q[1] * BAND_K * 0.2, BAND_ZC + q[2] * BAND_K];
  return [lerp(q[0], s[0], m), lerp(q[1], s[1], m), lerp(q[2], s[2], m)];
};

/* ---------- Boden, Bühne ---------- */

export const floorVis = (t: number) => (1 - prog(t, T.wie, 0.9)) + prog(t, T.endlich, 1.5) * (1 - prog(t, T.cta - 0.2, 0.6));
export const stageVis = (t: number) => chain(t, 1, [[T.cta - 0.1, 0.8, 0.09]]);
export const heroGlow = (t: number) => prog(t, T.endlich, 1.2) * (1 - prog(t, T.cta - 0.2, 0.6));
export {prog};
