import {M2, V2, clamp, easeInCubic, easeInOutCubic, lerp, prog} from '../math';
import {T} from './timeline';

export const I: M2 = [[1, 0], [0, 1]];
export const A: M2 = [[2, 1], [1, 2]]; // det 3
export const A0: M2 = [[2, 1], [1, 0.5]]; // det 0, Bild = Gerade y = x/2
export const KERNEL: V2 = [1, -2]; // A0 · (1, −2) = 0

export const det = (M: M2) => M[0][0] * M[1][1] - M[0][1] * M[1][0];
export const apply = (M: M2, p: V2): V2 => [M[0][0] * p[0] + M[0][1] * p[1], M[1][0] * p[0] + M[1][1] * p[1]];
export const mix = (P: M2, Q: M2, s: number): M2 => [
  [lerp(P[0][0], Q[0][0], s), lerp(P[0][1], Q[0][1], s)],
  [lerp(P[1][0], Q[1][0], s), lerp(P[1][1], Q[1][1], s)],
];
const scaled = (M: M2, k: number): M2 => [[M[0][0] * k, M[0][1] * k], [M[1][0] * k, M[1][1] * k]];

// Stückweise Keyframes [Zeit, Wert], dazwischen weich
export const kf = (t: number, keys: [number, number][], ease = easeInOutCubic) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      return lerp(v0, v1, ease(clamp((t - t0) / (t1 - t0))));
    }
  }
  return keys[keys.length - 1][1];
};

// Determinante beim Kippen, linear zwischen den gesprochenen Zahlen
const tiltDet = (t: number) => kf(t, T.tilt, (x) => x);

// Die Matrix, die gerade auf die Ebene wirkt
export const matrixAt = (t: number): M2 => {
  if (t < T.hookGo) return I;
  if (t < T.hookHit) return mix(I, A0, Math.pow(clamp((t - T.hookGo) / (T.hookHit - T.hookGo)), 2.2));
  if (t < T.rewind) return A0;
  if (t < T.rewindEnd) return mix(A0, I, prog(t, T.rewind, T.rewindEnd - T.rewind));
  if (t < T.warp) return I;
  if (t < T.warpEnd) return mix(I, A, prog(t, T.warp, T.warpEnd - T.warp));
  if (t < T.tilt[0][0]) return A;
  if (t < T.hit) {
    // (2 1 ; 1 y) mit det = 2y − 1
    const y = (tiltDet(t) + 1) / 2;
    return [[2, 1], [1, y]];
  }
  if (t < T.cta) return A0;
  // CTA: die Linie zieht sich zu einem Punkt zusammen, danach wächst die Ebene leise wieder auf
  const shrink = prog(t, T.cta, 0.7, easeInCubic);
  if (t < T.cta + 0.7) return scaled(A0, 1 - shrink);
  return scaled(I, prog(t, T.cta + 0.9, 2.4) * 0.92);
};

export type Cam = {cx: number; cy: number; u: number; rot: number; ax: number; ay: number};

export const camAt = (t: number): Cam => ({
  u: kf(t, [[0, 150], [T.hookHit, 168], [T.rewind, 168], [T.rewindEnd, 160], [T.rewindEnd + 0.05, 160], [5.8, 300], [T.warp, 300], [T.warpEnd, 190], [T.tease, 190], [T.tilt[0][0], 215], [T.hit, 215], [T.line - 0.2, 92], [T.back, 92], [T.back + 1.1, 138]]),
  cx: kf(t, [[0, 0], [T.rewindEnd + 0.05, 0], [5.8, 0.5], [T.warp, 0.5], [T.warpEnd, 1.5], [T.tilt[0][0], 1.5], [T.hit, 1.5], [T.line - 0.2, 0]]),
  cy: kf(t, [[0, 0], [T.rewindEnd + 0.05, 0], [5.8, 0.5], [T.warp, 0.5], [T.warpEnd, 1.5], [T.tilt[0][0], 1.5], [T.hit, 0.9], [T.line - 0.2, 0]]),
  rot: kf(t, [[0, -7], [T.hookHit, -3], [T.rewind, -3], [T.rewindEnd, 0], [T.hit, 0], [T.line + 0.4, 30], [T.cta, 30], [T.cta + 0.7, 0]]),
  ax: 540,
  ay: kf(t, [[0, 880], [T.cta, 880], [T.cta + 0.7, 800]]),
});

export const toScr = (c: Cam, p: V2): V2 => {
  const r = (c.rot * Math.PI) / 180;
  const dx = p[0] - c.cx;
  const dy = p[1] - c.cy;
  const rx = dx * Math.cos(r) - dy * Math.sin(r);
  const ry = dx * Math.sin(r) + dy * Math.cos(r);
  return [c.ax + c.u * rx, c.ay - c.u * ry];
};
