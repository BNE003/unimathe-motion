// Bewegungen, Kamera der Zahlengeraden und Ziffernplätze für das 0,999…-Video. Canvas und Overlays lesen nur von hier.
import {clamp, easeInOutCubic, easeOutCubic, lerp} from '../math';
import {A, E, T} from './timeline';

type Key = [number, number, number, ((x: number) => number)?];
// ab Zeit `at` in `dur` Sekunden weich auf den Wert `to`
export const chain = (t: number, v0: number, keys: Key[]) =>
  keys.reduce((v, [at, dur, to, ease = easeInOutCubic]) => lerp(v, to, ease(clamp((t - at) / Math.max(1e-3, dur)))), v0);
export const fade = (t: number, keys: Key[], v0 = 0) => chain(t, v0, keys);

export const pulse = (t: number, at: number, d = 0.9) => {
  const x = (t - at) / d;
  return x < 0 || x > 1 ? 0 : Math.sin(Math.PI * x) * (1 - x * 0.4);
};
export const show = (t: number, at: number, d = 0.4) => easeOutCubic(clamp((t - at) / d));

/* ---------- Ziffernplätze: endlich viele volle Stellen, dann ein unendlicher, kleiner werdender Schweif ---------- */

export const FULL = 3; // volle Nachkommastellen
export const R = 0.68; // Verkleinerung pro Stelle im Schweif
export const CW = 0.6; // Stellenbreite in Schriftgrößen
export const COMMA = 0.3; // Breite des Kommas in Schriftgrößen
export const TAIL_W = (CW * R) / (1 - R); // Breite des ganzen Schweifs in Schriftgrößen

// Platz i (i ≥ 0 Nachkommastellen, i < 0 vor dem Komma) relativ zum Komma: Mitte und Maßstab, auch für gebrochene i
const slotInt = (i: number, size: number) => {
  const cw = CW * size;
  const c = (COMMA * size) / 2;
  if (i < 0) return {x: -c + (i + 0.5) * cw, k: 1};
  if (i < FULL) return {x: c + (i + 0.5) * cw, k: 1};
  const j = i - FULL + 1;
  const k = Math.pow(R, j);
  const left = c + FULL * cw + (cw * R * (1 - Math.pow(R, j - 1))) / (1 - R);
  return {x: left + (cw * k) / 2, k};
};
export const slot = (i: number, size: number) => {
  const a = Math.floor(i);
  const f = i - a;
  const p = slotInt(a, size);
  if (f < 1e-6) return p;
  const q = slotInt(a + 1, size);
  return {x: lerp(p.x, q.x, f), k: lerp(p.k, q.k, f)};
};
// rechter Rand des Schweifs relativ zum Komma
export const tailEnd = (size: number) => (COMMA * size) / 2 + FULL * CW * size + TAIL_W * size;
export const TAIL_N = 14; // gezeichnete Schweifstellen (danach unsichtbar klein)

// Lauflicht entlang des Schweifs: die Neunen gehen weiter
export const shimmer = (t: number, i: number) => Math.max(0, Math.sin(2 * Math.PI * (t * 0.7 - i * 0.16))) ** 3;

/* ---------- Reihen „0,999… = 1“: Hook groß, dann oben als Anker, dann als Zeile x der Rechnung ---------- */

export type RowPose = {cx: number; y: number; size: number; eq: number};
// Komma so, dass „0,999… = 1“ mittig steht
export const centeredComma = (size: number) => {
  const left = -(COMMA / 2 + CW) * size;
  const right = tailEnd(size) + 1.3 * size + 0.3 * size;
  return 540 - (left + right) / 2;
};
export const EQ_DX = 0.55; // „=“ hinter dem Schweif, in Schriftgrößen
export const ONE_DX = 1.3; // „1“ hinter dem Schweif

const HOOK: RowPose = {cx: centeredComma(130), y: 780, size: 130, eq: 1};
const ANCHOR: RowPose = {cx: centeredComma(64), y: 390, size: 64, eq: 1};
// Zeilen der Rechnung: Kommas übereinander
export const PROOF = {comma: 480, size: 110, yA: 620, yB: 790, yRule: 872, yRes: 960, label: 268, eqX: 340};
const ROWB: RowPose = {cx: PROOF.comma, y: PROOF.yB, size: PROOF.size, eq: 0};

const mixPose = (a: RowPose, b: RowPose, k: number): RowPose => ({cx: lerp(a.cx, b.cx, k), y: lerp(a.y, b.y, k), size: lerp(a.size, b.size, k), eq: lerp(a.eq, b.eq, k)});

// die Hook-Zahl: groß → oben als Anker → wird zur Zeile x
export const hookPose = (t: number): RowPose => {
  const k1 = easeInOutCubic(clamp((t - T.egal + 0.05) / 0.8));
  const k2 = easeInOutCubic(clamp((t - T.hier - 0.05) / 0.9));
  return mixPose(mixPose(HOOK, ANCHOR, k1), ROWB, k2);
};

// am Ende der Rechnung: „0,999… = 1“ mittig auf der Ergebniszeile, dann oben als Anker
const FINAL: RowPose = {cx: centeredComma(PROOF.size), y: PROOF.yRes, size: PROOF.size, eq: 1};
const BIGC: RowPose = {cx: centeredComma(120), y: 700, size: 120, eq: 1};
export const finalPose = (t: number): RowPose =>
  mixPose(mixPose(FINAL, ANCHOR, easeInOutCubic(clamp((t - T.abstand + 0.1) / 0.9))), BIGC, easeInOutCubic(clamp((t - T.unterwegs - 0.2) / 1.0)));
// Abstand, um den „x = 1“ nach rechts gleitet, damit „= 1“ auf „= 1“ der fertigen Zeile landet
export const FINAL_SHIFT = FINAL.cx + tailEnd(PROOF.size) + ONE_DX * PROOF.size - (PROOF.comma + slot(-1, PROOF.size).x);

/* ---------- Rechnung ---------- */

// Zeile 10x: steigt aus Zeile x auf, dann rücken alle Ziffern eine Stelle nach links
export const riseA = (t: number) => easeInOutCubic(clamp((t - T.zehn - 0.05) / 0.6));
export const shiftA = (t: number) => easeInOutCubic(clamp((t - T.schiebt) / 1.1));

// unendlich viele Paare in endlicher Zeit: Stelle i nach einer geometrischen Reihe
const Q = 0.72;
const geo = (i: number, total: number) => total * (1 - Math.pow(Q, i));
export const partnerAt = (i: number) => T.partner + 0.3 + geo(i, 1.0);
export const cancelAt = (i: number) => T.tilgen + geo(i, 0.7);

export const vis = {
  proof: (t: number) => fade(t, [[T.nennen - 0.2, 0.3, 1], [T.xEins + 0.6, 0.5, 0]], 0),
  rule: (t: number) => fade(t, [[T.ziehen + 0.2, 0.5, 1], [T.xEins + 0.6, 0.5, 0]]),
  minus: (t: number) => fade(t, [[T.ziehen + 0.1, 0.35, 1], [T.xEins + 0.6, 0.5, 0]]),
  res9: (t: number) => fade(t, [[T.uebrig + 0.1, 0.45, 1], [T.also + 0.2, 0.4, 0]]),
  resX1: (t: number) => fade(t, [[T.xEins - 0.05, 0.4, 1], [T.zurueck + 0.25, 0.45, 0]]),
  final: (t: number) => fade(t, [[T.zurueck + 0.1, 0.5, 1], [T.cta - 0.2, 0.5, 0]]),
  // Zahlengerade
  line: (t: number) => fade(t, [[T.egal + 0.05, 0.5, 1], [T.hier - 0.05, 0.5, 0], [T.abstand + 0.2, 0.6, 1], [T.cta - 0.2, 0.5, 0]]),
  readout: (t: number) => fade(t, [[T.jede + 0.15, 0.45, 1], [T.hier - 0.1, 0.4, 0]]),
  gaps: (t: number) => fade(t, [[T.zehntel - 0.1, 0.3, 1], [T.unterwegs + 0.1, 0.6, 0]]),
  label999: (t: number) => fade(t, [[T.dieEins - 0.25, 0.4, 1], [T.cta - 0.2, 0.5, 0]]),
};

/* ---------- Zahlengerade: Bildschirm-x der 1 fest, Zoom in die Lücke ---------- */

export const X1 = 840; // Bildschirm-x der Eins
export const U0 = 700; // Pixel pro Einheit ohne Zoom (0 liegt bei 140)
export const LINE_Y = 1010;

// Zoomstufe z: Pixel pro Einheit = U0 · 10^z
const STEPS = [T.egal + 0.75, T.fehlt + 0.25, T.stimmt - 0.05, T.jede + 0.75];
export const STEP_D = 1.05;
export const zoomAt = (t: number) => (t > T.hier + 0.6 ? 0 : STEPS.reduce((z, at) => z + easeInOutCubic(clamp((t - at) / STEP_D)), 0));
export const toX = (x: number, z: number) => X1 + (x - 1) * U0 * Math.pow(10, z);

// Näherungen 0,9 … 0,99999 im Paradox-Teil: erscheinen, wenn der Zoom sie an dieselbe Stelle gebracht hat
export const PARA = [1, 2, 3, 4, 5].map((n, i) => ({
  n,
  at: i === 0 ? T.egal + 0.25 : STEPS[i - 1] + STEP_D * 0.8,
}));
export const paraVis = (t: number, i: number) => show(t, PARA[i].at, 0.45) * fade(t, [[T.hier - 0.1, 0.5, 0]], 1);

// Näherungen 0,9, 0,99, 0,999 im Abstand-Teil (fester Maßstab)
export const GAPS = [
  {n: 1, at: T.zehntel},
  {n: 2, at: T.hundertstel},
  {n: 3, at: T.tausendstel},
];

// Anzahl Neunen in der wachsenden Zeile 1 − 0,999…9 = 0,000…1
export const growN = (t: number) => {
  const d = Math.max(0, t - T.winzig - 0.35);
  return 3 + 1.5 * d + 0.55 * d * d;
};
export const nullAt = T.uebrigNull + 0.05; // „= 0“ rastet ein
export {A, E};
