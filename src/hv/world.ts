// Mathematik und Zustand für das Harvard-Video. Bühne und Overlays lesen beide nur von hier.
import {M2, V2, clamp, easeInOutCubic, easeOutExpo, lerp, lerpM, mul, prog} from '../math';
import {T} from './timeline';

export const AM: M2 = [[0, 1], [0, 0]]; // Gegenbeispiel aus der Klausurlösung
export const BM: M2 = [[0.6, 0.9], [0, 1.5]]; // Beispiel: (1,1) wird länger (Faktor 1,5), (1,0) kürzer (Faktor 0,6)
export const I: M2 = [[1, 0], [0, 1]];

export const show = (t: number, at: number, d = 0.4) => easeOutExpo(clamp((t - at) / d));
export const hide = (t: number, at: number, d = 0.35) => 1 - easeInOutCubic(clamp((t - at) / d));
export const dir = (deg: number, r = 1): V2 => [r * Math.cos((deg * Math.PI) / 180), r * Math.sin((deg * Math.PI) / 180)];
export const smul = (M: M2, k: number): M2 => [[M[0][0] * k, M[0][1] * k], [M[1][0] * k, M[1][1] * k]];
type Key = [number, number, number];
export const chain = (t: number, v0: number, keys: Key[]) => keys.reduce((v, [at, dur, to]) => lerp(v, to, easeInOutCubic(clamp((t - at) / dur))), v0);

/* ---------- Kamera: die Bühne füllt das ganze Bild, wichtige Teile bleiben in x < 940 ---------- */

export const RING_PX = 400;
export type View = {ox: number; oy: number; u: number};
export const viewAt = (t: number): View => ({
  ox: chain(t, 500, [[T.probieren + 0.9, 0.9, 300], [T.jedem - 0.5, 0.6, 500]]),
  oy: chain(t, 940, [[T.probieren + 0.9, 0.9, 1150], [T.jedem - 0.5, 0.6, 940]]),
  u: chain(t, 170, [[T.probieren + 0.9, 0.9, 150], [T.jedem - 0.5, 0.6, 130], [T.f1 - 0.2, 0.8, 112]]),
});
export const toS = (v: View, p: V2): V2 => [v.ox + v.u * p[0], v.oy - v.u * p[1]];

export const stage = (t: number) => show(t, T.eineM - 0.1, 0.7) * hide(t, T.a2ist - 0.2, 0.5);

/* ---------- Teil 1: was das Wort bedeutet ---------- */

export const pW = (t: number) => chain(t, 0, [[T.neu, 1.2, 1], [T.aber - 0.2, 0.6, 0], [T.sie, 1.3, 1], [T.plan - 0.1, 0.7, 0]]);
export const V_TILT: V2 = [-0.7, 1.3];
export const W_LONG: V2 = [1.05, 1.05];
export const W_SHORT: V2 = [1.9, 0];
export const tiltOn = (t: number) => show(t, T.matrix, 0.4) * hide(t, T.aber - 0.25, 0.4);
export const newOn = (t: number) => show(t, T.neu, 0.3) * hide(t, T.aber - 0.25, 0.4);
export const tiltLine = (t: number) => show(t, T.meist, 0.5) * hide(t, T.aber - 0.25, 0.4);
export const holdOn = (t: number) => show(t, T.aber + 0.05, 0.5) * hide(t, T.plan - 0.2, 0.5);
export const ruleDim = (t: number) => lerp(1, 0.4, prog(t, T.regel, 0.5)) * 1;
export const ringW = (t: number) => show(t, T.findest + 1.2, 0.6) * hide(t, T.plan - 0.2, 0.5);
export const litW = (t: number) => show(t, T.findest + 2, 0.4) * hide(t, T.plan - 0.2, 0.5);

/* ---------- Teil 2: ein Pfeil, Regel von A ---------- */

export const P32: V2 = [3, 2];
export const arrow32 = (t: number) => show(t, T.aus3, 0.4) * hide(t, T.jedem - 0.5, 0.4);
export const step1 = (t: number) => prog(t, T.wird, 0.9);
export const step2 = (t: number) => prog(t, T.aus2 + 0.2, 1.2);

/* ---------- Teil 3: alle Pfeile, zwei Schritte ---------- */

export const pA1 = (t: number) => prog(t, T.jedem + 0.1, 1.5);
export const pA2 = (t: number) => prog(t, T.nach, 1.4);
export const COLLAPSED = T.nach + 1.45;

export const planeM = (t: number): M2 => {
  if (t < T.jedem) return lerpM(BM, pW(t));
  if (t < T.nullm + 0.2) return smul(lerpM(AM, pA1(t)), 1 - pA2(t));
  return I;
};
export const gridA = (t: number) => (t < T.nullm + 0.2 ? 1 : prog(t, T.f1 - 0.3, 0.8));
export const dotsA = (t: number) => show(t, T.jedem - 0.3, 0.4) * hide(t, COLLAPSED + 0.05, 0.1);

/* ---------- Teil 4: erste Frage ---------- */

export const Q1_DEG = 125;
export const Q1_LEN = 3.1;
export const ring1 = (t: number) => show(t, T.f1, 0.6) * hide(t, T.f2 - 0.2, 0.4);
export const q1On = (t: number) => show(t, T.f1 + 0.5, 0.5) * hide(t, T.gilt + 0.2, 0.4);
export const q1Shrink = (t: number) => prog(t, T.schrumpft + 0.15, 1.3);
export const q1Line = (t: number) => show(t, T.schrumpft, 0.5) * hide(t, T.f2 - 0.2, 0.4);
export const q1Lit = (t: number) => show(t, T.bleibt + 0.1, 0.4) * hide(t, T.f2 - 0.2, 0.4);
export const allFan = (t: number) => show(t, T.gilt, 0.3) * hide(t, T.gilt + 1.2, 0.3);
export const allFall = (t: number) => prog(t, T.gilt + 0.2, 0.9);
// Jede Richtung leuchtet, im Uhrzeigersinn von oben
export const lit1 = (t: number, deg: number) => prog(t, T.gilt + 0.1 + ((((90 - deg) % 360) + 360) % 360) / 360 * 1.1, 0.2, (x) => x) * hide(t, T.f2 - 0.2, 0.4);

/* ---------- Teil 5: zweite Frage ---------- */

export const ring2 = (t: number) => show(t, T.f2 + 0.2, 0.6) * hide(t, T.a2ist - 0.2, 0.5);
export const q2On = (t: number) => show(t, T.aus32 - 0.2, 0.4) * hide(t, T.jedesA - 0.1, 0.3);
export const q2Step = (t: number) => prog(t, T.aus32 + 1.0, 1.0);
export const SCAN_FROM = 172;
export const SCAN_LEN = 3;
export const scanOn = (t: number) => show(t, T.jedesA, 0.3) * hide(t, T.aus30 + 2.6, 0.4);
export const scanDeg = (t: number) => SCAN_FROM * (1 - prog(t, T.jedesA + 0.15, T.nurx + 0.3 - T.jedesA, (x) => x * (2 - x)));
export const scanShrink = (t: number) => prog(t, T.aus30 + 0.3, 1.5);
export const axisLit = (t: number) => show(t, T.nurx + 0.2, 0.5) * hide(t, T.a2ist - 0.2, 0.5);

/* ---------- Grund ---------- */

export const panels = (t: number) => show(t, T.grund, 0.6) * hide(t, T.cta - 0.2, 0.4);
export const tipStep = (t: number) => prog(t, T.kippt + 0.1, 1.2);
export const dropStep = (t: number) => prog(t, T.a2k + 0.8, 1.0);

export const RIPPLES = [COLLAPSED, T.gilt + 1.1];
export {mul};
