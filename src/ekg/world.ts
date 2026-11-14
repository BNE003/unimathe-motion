// Geometrie, Farben und Zeitfenster des EKG-Videos (v2), gemeinsam für Canvas und Formeln.
import {V2, clamp, easeInOutCubic, lerp, prog} from '../math';
import {C} from '../theme';
import {T} from './timeline';

export const K = {
  sig: C.cyan, // das Signal s selbst
  imp: C.eig, // Zacken-Basis und Messwerte
  wave: '#B49BFF', // Wellen-Basis und Gewichte
  wave2: '#FF8AD8',
  err: '#FF6B6B', // Brummen
  grid: C.vec,
};

/* ---------- Bühne EKG ---------- */

export const X0 = 90;
export const X1 = 990;
export const ex = (x: number) => lerp(X0, X1, x);
// Nulllinie und Verstärkung: in der Auflösung rückt das EKG nach oben
export const stage = (t: number) => {
  const k = prog(t, T.derselbe - 0.1, 0.9);
  return {by: lerp(760, 610, k), g: lerp(320, 240, k)};
};
export const BY = 760;
export const GAIN = 320;
export const ey = (v: number, by = BY, g = GAIN) => by - g * v;

// Monitor im Hook: Kurve läuft durch, Kopf bei HX, ein Herzschlag = P px, 0,9 s
export const HX = 860;
export const P = 420;
export const BEAT_S = 0.9;
const DECEL = 0.45;
export const FREEZE = T.digital - 0.55;
export const headPhase = (t: number) => {
  if (t < FREEZE) return t / BEAT_S + 0.62;
  const u = clamp((t - FREEZE) / DECEL);
  return (FREEZE + (DECEL / 2) * (1 - (1 - u) ** 2)) / BEAT_S + 0.62;
};
export const PH_STOP = headPhase(1e9);
export const PHI0 = Math.floor(PH_STOP) - 1;
export const ZOOM = [T.digital - 0.2, 0.85] as const;

// Lupe auf das Zittern (Hook)
export const LENS1 = {cx: 540, cy: 1150, r: 190, sx: 330, span: 44, zy: 4};
// Lupe auf die Zacken
export const N0 = 640; // mittlere Zacke in der Lupe
export const LENS2 = {cx: 540, cy: 1190, r: 205, n: 11, dx: 32, base: 1300, gain: 560};

// Fächer aus Wellen und Rekonstruktion
export const FAN = {open: T.wellen + 0.25, close: T.gewicht - 0.2};
export const REC = {start: T.gewicht + 0.1, end: T.zusammen + 1.3};
export const STRIP = {y: 1310, gain: 2300, kMax: 70};
export const kAt = (t: number) => 60 * Math.pow(clamp((t - REC.start) / (REC.end - REC.start)), 1.6);
// Gewicht der Welle 50: 1 → 0, danach wird ohne sie addiert
export const humBar = (t: number) => 1 - prog(t, T.null + 0.1, 0.7);
export const humCurve = (t: number) => 1 - prog(t, T.addieren + 0.1, 1.0);

/* ---------- Auflösung: Pfeil im gedrehten Gitter ---------- */

export const PO: V2 = [430, 1330];
export const PU = 65;
export const pe = (p: V2): V2 => [PO[0] + PU * p[0], PO[1] - PU * p[1]];
export const turn = (t: number) => prog(t, T.bleibt - 0.05, 1.1);

/* ---------- Sichtbarkeiten ---------- */

const win = (t: number, a: number, b: number, fi = 0.5, fo = 0.5) => clamp((t - a) / fi) * (1 - clamp((t - b) / fo));

export const vis = {
  monitor: (t: number) => 1 - clamp((t - (T.wellen - 0.1)) / 0.5),
  lens1: (t: number) => win(t, T.zittert - 0.1, T.digital - 0.3, 0.45, 0.4),
  column: (t: number) => win(t, T.vektor + 0.3, T.jeder - 0.1, 0.6, 0.45),
  stems: (t: number) => win(t, T.jeder + 0.1, T.wellen - 0.1, 0.4, 0.5),
  lens2: (t: number) => win(t, T.stelle - 0.1, T.wellen - 0.1, 0.45, 0.45),
  rec: (t: number) => win(t, T.wellen, T.cta, 0.5, 0.45),
  strip: (t: number) => win(t, T.gewicht - 0.1, T.derselbe, 0.5, 0.45),
  plane: (t: number) => win(t, T.pfeil - 0.2, T.cta, 0.6, 0.45),
};

export const ease = easeInOutCubic;
