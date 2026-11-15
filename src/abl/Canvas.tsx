import React, {useLayoutEffect, useRef} from 'react';
import {C, H, W} from '../theme';
import {V2, clamp, lerp} from '../math';
import {useSec} from '../ui';
import {
  ARRIVE,
  CURVE_X,
  Cam,
  P,
  COLLAPSE_AT,
  SWITCH,
  TAN_SLOPE,
  Q,
  camAt,
  collapsed,
  corner,
  curveDraw,
  f,
  fromSx,
  hAt,
  pPulse,
  riderX,
  secSlope,
  tanPulse,
  toS,
  vis,
  zeroPulse,
} from './world';
import {T} from './timeline';

type Ctx = CanvasRenderingContext2D;

export const COL = {curve: C.cyan, right: C.lam, left: '#4FA8FF', tan: C.eig, zero: '#FF4D6D'};
export const sideColor = (h: number) => (h >= 0 ? COL.right : COL.left);

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const rgba = (h: string, a: number) => `rgba(${rgb(h).join(',')},${a})`;

const seg = (ctx: Ctx, a: V2, b: V2) => {
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
};

// Gerade durch P mit Steigung m, im Bild von Rand zu Rand (oder nur bis Länge len in beide Richtungen)
const lineThroughP = (ctx: Ctx, cam: Cam, m: number, len = 3000) => {
  const p = toS(cam, P);
  const d = [1, -m];
  const n = Math.hypot(d[0], d[1]);
  const ux = d[0] / n;
  const uy = d[1] / n;
  seg(ctx, [p[0] - ux * len, p[1] - uy * len], [p[0] + ux * len, p[1] + uy * len]);
};

/* ---------- Gitter in Zehnerstufen ---------- */

const smooth = (a: number, b: number, x: number) => clamp((x - a) / (b - a));

const grid = (ctx: Ctx, cam: Cam, alpha: number) => {
  const x0 = fromSx(cam, 0);
  const x1 = fromSx(cam, W);
  const yTop = P[1] + cam.py / cam.u;
  const yBot = P[1] - (H - cam.py) / cam.u;
  const kMin = Math.floor(Math.log10(20 / cam.u));
  ctx.lineWidth = 1.3;
  ctx.strokeStyle = C.vec;
  for (let k = kMin; k <= kMin + 3; k++) {
    const step = Math.pow(10, k);
    const px = step * cam.u;
    const a = smooth(22, 110, px) * (1 - smooth(900, 2400, px)) * 0.2 * alpha;
    if (a < 0.004) continue;
    ctx.globalAlpha = a;
    for (let i = Math.ceil(x0 / step); i * step <= x1; i++) {
      const sx = toS(cam, [i * step, 0])[0];
      seg(ctx, [sx, 0], [sx, H]);
    }
    for (let j = Math.ceil(yBot / step); j * step <= yTop; j++) {
      const sy = toS(cam, [0, j * step])[1];
      seg(ctx, [0, sy], [W, sy]);
    }
  }
  // Achsen
  ctx.globalAlpha = 0.45 * alpha;
  ctx.lineWidth = 2;
  const o = toS(cam, [0, 0]);
  if (o[0] > -10 && o[0] < W + 10) seg(ctx, [o[0], 0], [o[0], H]);
  if (o[1] > -10 && o[1] < H + 10) seg(ctx, [0, o[1]], [W, o[1]]);
  ctx.globalAlpha = 1;
};

/* ---------- Kurve ---------- */

const curve = (ctx: Ctx, cam: Cam, t: number) => {
  const xa = Math.max(CURVE_X[0], fromSx(cam, -40));
  const xEnd = lerp(CURVE_X[0], CURVE_X[1], curveDraw(t));
  const xb = Math.min(xEnd, fromSx(cam, W + 40));
  if (xb <= xa) return;
  const N = 420;
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const x = lerp(xa, xb, i / N);
    const s = toS(cam, [x, f(x)]);
    if (i === 0) ctx.moveTo(s[0], s[1]);
    else ctx.lineTo(s[0], s[1]);
  }
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = rgba(COL.curve, 0.22);
  ctx.lineWidth = 22;
  ctx.shadowBlur = 0;
  ctx.stroke();
  ctx.strokeStyle = COL.curve;
  ctx.lineWidth = 7;
  ctx.shadowColor = COL.curve;
  ctx.shadowBlur = 24;
  ctx.stroke();
  ctx.shadowBlur = 0;
};

/* ---------- Punkte ---------- */

const dot = (ctx: Ctx, s: V2, color: string, r: number, a: number, glow = 0) => {
  if (a <= 0) return;
  ctx.globalAlpha = a;
  const g = ctx.createRadialGradient(s[0], s[1], 0, s[0], s[1], r * (4 + 3 * glow));
  g.addColorStop(0, rgba(color, 0.55));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(s[0], s[1], r * (4 + 3 * glow), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(s[0], s[1], r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.txt;
  ctx.beginPath();
  ctx.arc(s[0], s[1], r * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
};

const ring = (ctx: Ctx, s: V2, color: string, k: number) => {
  if (k <= 0) return;
  ctx.globalAlpha = (1 - k) * 0.8;
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(s[0], s[1], 18 + 90 * k, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
};

/* ---------- Fächer der bisherigen Sekanten ---------- */

// Exponenten log10|h|, die bis t schon durchlaufen wurden, in festen Schritten
const fanSlopes = (t: number): {m: number; c: string}[] => {
  const out: {m: number; c: string}[] = [];
  const step = 0.11;
  const rightMin = t < SWITCH ? Math.log10(hAt(t)) : -2;
  if (t > T.naeher) for (let L = 0; L >= rightMin - 1e-9; L -= step) out.push({m: TAN_SLOPE + Math.pow(10, L), c: COL.right});
  if (t > SWITCH + 0.5) {
    const h = hAt(t);
    const leftMin = h === 0 ? -2 : Math.max(-2, Math.log10(-h));
    for (let L = 0; L >= leftMin - 1e-9; L -= step) out.push({m: TAN_SLOPE - Math.pow(10, L), c: COL.left});
  }
  return out;
};

/* ---------- Bühne ---------- */

const draw = (ctx: Ctx, t: number) => {
  ctx.clearRect(0, 0, W, H);
  const cam = camAt(t);
  const stage = vis.stage(t);
  ctx.save();
  ctx.globalAlpha = 1;

  grid(ctx, cam, stage);
  ctx.globalAlpha = stage;

  // Fächer
  const fa = vis.fan(t) * stage;
  if (fa > 0) {
    const k = vis.fanClose(t);
    ctx.lineWidth = 2;
    for (const {m, c} of fanSlopes(t)) {
      ctx.strokeStyle = rgba(c, 0.2 * fa);
      lineThroughP(ctx, cam, TAN_SLOPE + (m - TAN_SLOPE) * (1 - k));
    }
  }

  curve(ctx, cam, t);

  const h = hAt(t);
  const pS = toS(cam, P);

  // Steigungsdreieck
  const ta = vis.tri(t) * stage;
  if (ta > 0 && h !== 0) {
    const q = toS(cam, Q(h));
    const c = toS(cam, corner(h));
    const col = sideColor(h);
    ctx.globalAlpha = ta;
    ctx.fillStyle = rgba(col, 0.1);
    ctx.beginPath();
    ctx.moveTo(pS[0], pS[1]);
    ctx.lineTo(c[0], c[1]);
    ctx.lineTo(q[0], q[1]);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rgba(C.txt, 0.85);
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 9]);
    const a0: V2 = h > 0 ? pS : q;
    const a2: V2 = h > 0 ? q : pS;
    seg(ctx, a0, c);
    seg(ctx, c, a2);
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  // Sekante: wächst erst von P nach Q, dann als ganze Gerade
  const sa = vis.sec(t) * stage;
  if (sa > 0 && h !== 0) {
    const col = sideColor(h);
    const q = toS(cam, Q(h));
    const g = vis.secGrow(t);
    ctx.globalAlpha = sa;
    ctx.strokeStyle = col;
    ctx.lineWidth = 5;
    ctx.shadowColor = col;
    ctx.shadowBlur = 16;
    ctx.lineCap = 'round';
    if (g < 1) {
      seg(ctx, pS, [lerp(pS[0], q[0], clamp(g / 0.6)), lerp(pS[1], q[1], clamp(g / 0.6))]);
      if (g > 0.6) {
        ctx.globalAlpha = sa * clamp((g - 0.6) / 0.4);
        lineThroughP(ctx, cam, secSlope(h));
      }
    } else {
      lineThroughP(ctx, cam, secSlope(h));
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // 0/0: kurzes Flackern der Sekante, roter Ring
  const z = zeroPulse(t);
  if (z > 0) {
    ctx.globalAlpha = z * stage * (Math.floor(t * 30) % 2 ? 0.75 : 0.25);
    ctx.strokeStyle = COL.zero;
    ctx.lineWidth = 4;
    lineThroughP(ctx, cam, TAN_SLOPE);
    ctx.globalAlpha = 1;
  }

  // Tangente
  const tna = vis.tan(t) * stage;
  if (tna > 0) {
    const tp = tanPulse(t);
    ctx.globalAlpha = tna;
    ctx.strokeStyle = COL.tan;
    ctx.lineWidth = 6 + 3 * tp;
    ctx.shadowColor = COL.tan;
    ctx.shadowBlur = 20 + 30 * tp;
    ctx.lineCap = 'round';
    lineThroughP(ctx, cam, TAN_SLOPE, lerp(0, 2600, vis.tanGrow(t)));
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // Steigungsdreieck der Tangente: 1 rüber, 2 hoch
  const tt = vis.tanTri(t) * stage;
  if (tt > 0) {
    const c = toS(cam, [P[0] + 1, P[1]]);
    const e = toS(cam, [P[0] + 1, P[1] + TAN_SLOPE]);
    ctx.globalAlpha = tt;
    ctx.fillStyle = rgba(COL.tan, 0.1);
    ctx.beginPath();
    ctx.moveTo(pS[0], pS[1]);
    ctx.lineTo(c[0], c[1]);
    ctx.lineTo(e[0], e[1]);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rgba(COL.tan, 0.9);
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 9]);
    seg(ctx, pS, c);
    seg(ctx, c, e);
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  // Lichtpunkt im Hook mit Schweif
  const ra = vis.rider(t) * stage;
  if (ra > 0) {
    for (let i = 14; i >= 1; i--) {
      const x = riderX(t - i * 0.035);
      dot(ctx, toS(cam, [x, f(x)]), C.txt, 7 * (1 - i / 16), ra * 0.35 * (1 - i / 15));
    }
    const x = riderX(t);
    dot(ctx, toS(cam, [x, f(x)]), C.txt, 10, ra, 0.4);
  }

  // Q
  const qa = vis.q(t) * stage;
  if (qa > 0 && !collapsed(t)) dot(ctx, toS(cam, Q(h)), sideColor(h), 11, qa);

  // P
  const pa = vis.p(t) * stage;
  const pp = pPulse(t);
  ring(ctx, pS, C.eig, clamp((t - ARRIVE + 0.05) / 0.9));
  ring(ctx, pS, COL.zero, t > COLLAPSE_AT ? clamp((t - COLLAPSE_AT) / 0.9) : 0);
  dot(ctx, pS, C.eig, 12 + 3 * pp, pa, pp);

  ctx.restore();
};

export const Stage: React.FC = () => {
  const t = useSec();
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (ctx) draw(ctx, t);
  }, [t]);
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};
