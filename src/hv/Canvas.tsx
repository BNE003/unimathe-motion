import React, {useLayoutEffect, useRef} from 'react';
import {C, H, W} from '../theme';
import {M2, V2, clamp, lerp, lerpM, mul} from '../math';
import {useSec} from '../ui';
import {
  AM, BM, P32, Q1_DEG, Q1_LEN, RING_PX, RIPPLES, SCAN_FROM, SCAN_LEN, V_TILT, View, W_LONG, W_SHORT, allFall, allFan, arrow32, axisLit, dir, dotsA, dropStep, gridA, holdOn, lit1, litW, newOn, panels, pW, planeM, q1Line, q1Lit, q1On, q1Shrink, q2On, q2Step, ring1, ring2, ringW, ruleDim, scanDeg, scanOn, scanShrink, smul, stage, step1, step2, tiltLine, tiltOn, tipStep, toS, viewAt,
} from './world';

type Ctx = CanvasRenderingContext2D;

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgba = (h: string, a: number) => `rgba(${rgb(h).join(',')},${a})`;
const mix = (a: string, b: string, k: number) => {
  const [p, q] = [rgb(a), rgb(b)];
  return `rgb(${p.map((v, i) => Math.round(lerp(v, q[i], k))).join(',')})`;
};

const line = (ctx: Ctx, a: V2, b: V2) => {
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
};

/* ---------- Gitter: läuft über das ganze Bild ---------- */

const grid = (ctx: Ctx, v: View, M: M2, o: number) => {
  if (o <= 0) return;
  const seg = (a: V2, b: V2, axis: boolean) => {
    ctx.strokeStyle = axis ? `rgba(166,173,211,${0.5 * o})` : `rgba(30,139,219,${0.3 * o})`;
    ctx.lineWidth = axis ? 2.5 : 1.5;
    line(ctx, toS(v, mul(M, a)), toS(v, mul(M, b)));
  };
  for (let x = -24; x <= 24; x++) seg([x, -34], [x, 34], x === 0);
  for (let y = -34; y <= 34; y++) seg([-24, y], [24, y], y === 0);
};

// Punktwolke: Farbe nach Höhe y, denn y entscheidet, wo der Punkt auf der x-Achse landet
const DOTS: V2[] = [];
for (let x = -4.5; x <= 4.5; x += 0.5) for (let y = -6.5; y <= 6.5; y += 0.5) DOTS.push([x, y]);

const dots = (ctx: Ctx, v: View, t: number, o: number) => {
  if (o <= 0) return;
  ctx.globalCompositeOperation = 'lighter';
  for (const p of DOTS) {
    const k = clamp((p[1] + 4) / 8);
    ctx.fillStyle = mix(C.cyan, C.eig, k);
    for (let g = 2; g >= 0; g--) {
      const [x, y] = toS(v, mul(planeM(t - g * 0.03), p));
      ctx.globalAlpha = o * (g === 0 ? 0.9 : 0.16);
      ctx.beginPath();
      ctx.arc(x, y, g === 0 ? 3.8 : 3, 0, 7);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
};

/* ---------- Pfeile ---------- */

const arrow = (ctx: Ctx, a: V2, b: V2, color: string, o: number, w = 6, glow = 0) => {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (o <= 0 || d < 2) return;
  const h = Math.min(w * 3.6, d * 0.6);
  const ux = (b[0] - a[0]) / d;
  const uy = (b[1] - a[1]) / d;
  const e: V2 = [b[0] - ux * h * 0.9, b[1] - uy * h * 0.9];
  ctx.save();
  ctx.globalAlpha = o;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  if (glow > 0) {
    ctx.shadowColor = color;
    ctx.shadowBlur = glow;
  }
  line(ctx, a, e);
  ctx.beginPath();
  ctx.moveTo(b[0], b[1]);
  ctx.lineTo(e[0] - uy * h * 0.55, e[1] + ux * h * 0.55);
  ctx.lineTo(e[0] + uy * h * 0.55, e[1] - ux * h * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

const fullLine = (ctx: Ctx, v: View, deg: number, color: string, o: number, w = 3, dash?: number[], r = 40) => {
  if (o <= 0) return;
  ctx.save();
  ctx.globalAlpha = o;
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  if (dash) ctx.setLineDash(dash);
  line(ctx, toS(v, dir(deg, -r)), toS(v, dir(deg, r)));
  ctx.restore();
};

/* ---------- Richtungs-Ring ---------- */

const ringBase = (ctx: Ctx, c: V2, r: number, o: number) => {
  if (o <= 0) return;
  ctx.save();
  ctx.globalAlpha = o;
  ctx.strokeStyle = 'rgba(166,173,211,.26)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(c[0], c[1], r, 0, 7);
  ctx.stroke();
  for (let d = 0; d < 360; d += 7.5) {
    const a = (d * Math.PI) / 180;
    ctx.fillStyle = 'rgba(166,173,211,.3)';
    ctx.beginPath();
    ctx.arc(c[0] + r * Math.cos(a), c[1] - r * Math.sin(a), 2.4, 0, 7);
    ctx.fill();
  }
  ctx.restore();
};

const lamp = (ctx: Ctx, c: V2, r: number, deg: number, color: string, o: number, size = 11, blur = 26) => {
  if (o <= 0) return;
  const a = (deg * Math.PI) / 180;
  ctx.save();
  ctx.globalAlpha = o;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.beginPath();
  ctx.arc(c[0] + r * Math.cos(a), c[1] - r * Math.sin(a), size, 0, 7);
  ctx.fill();
  ctx.restore();
};

const ripple = (ctx: Ctx, c: V2, t: number, at: number) => {
  const x = (t - at) / 1.2;
  if (x <= 0 || x >= 1) return;
  for (const [k, w] of [[1, 5], [0.72, 3]] as const) {
    ctx.strokeStyle = `rgba(243,244,251,${0.55 * (1 - x) * k})`;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.arc(c[0], c[1], (1 - Math.pow(1 - x, 2.4)) * 1100 * k, 0, 7);
    ctx.stroke();
  }
};

const origin = (ctx: Ctx, c: V2, o: number, r = 8) => {
  if (o <= 0) return;
  ctx.save();
  ctx.globalAlpha = o;
  ctx.fillStyle = C.txt;
  ctx.shadowColor = C.txt;
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.arc(c[0], c[1], r, 0, 7);
  ctx.fill();
  ctx.restore();
};

/* ---------- Rückschau: A und A² nebeneinander ---------- */

const panel = (ctx: Ctx, t: number, c: V2, r: number, full: boolean, o: number) => {
  if (o <= 0) return;
  ctx.save();
  ctx.globalAlpha = o;
  ringBase(ctx, c, r, 1);
  const px = (x: number, y: number): V2 => [c[0] + x * r, c[1] - y * r];
  ctx.strokeStyle = 'rgba(166,173,211,.4)';
  ctx.lineWidth = 2;
  line(ctx, px(-1, 0), px(1, 0));
  line(ctx, px(0, -1), px(0, 1));
  if (!full) {
    lamp(ctx, c, r, 0, C.eig, o);
    lamp(ctx, c, r, 180, C.eig, o);
    const p = tipStep(t);
    const tip = mul(lerpM(AM, p), [0, 0.74]);
    arrow(ctx, c, px(0, 0.74), C.vec, o * 0.3, 5);
    arrow(ctx, c, px(tip[0], tip[1]), p > 0.98 ? C.lam : C.cyan, o, 7, 16);
    if (p > 0.02) {
      ctx.save();
      ctx.strokeStyle = C.lam;
      ctx.lineWidth = 3;
      ctx.setLineDash([9, 9]);
      ctx.globalAlpha = o * 0.8;
      ctx.beginPath();
      ctx.moveTo(...px(0, 0.74));
      ctx.lineTo(...px(tip[0], tip[1]));
      ctx.stroke();
      ctx.restore();
    }
  } else {
    for (let d = 0; d < 360; d += 7.5) lamp(ctx, c, r, d, C.eig, o, 6, 16);
    const p = dropStep(t);
    arrow(ctx, c, px(0, 0.74 * (1 - p)), C.cyan, o * (1 - p * 0.3), 7, 16);
    ctx.fillStyle = C.txt;
    ctx.shadowColor = C.txt;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(c[0], c[1], 7 + 4 * p, 0, 7);
    ctx.fill();
  }
  ctx.restore();
};

export const P_L: V2 = [275, 900];
export const P_R: V2 = [695, 900];
export const P_R0 = 195;

/* ---------- Szene ---------- */

const dashed = (ctx: Ctx, a: V2, b: V2, color: string, o: number) => {
  if (o <= 0) return;
  ctx.save();
  ctx.globalAlpha = o;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.setLineDash([9, 9]);
  line(ctx, a, b);
  ctx.restore();
};

export const Scene: React.FC = () => {
  const t = useSec();
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    const st = stage(t);
    if (st > 0) {
      ctx.save();
      const v = viewAt(t);
      const c = toS(v, [0, 0]);
      const S = (p: V2) => toS(v, p);
      grid(ctx, v, planeM(t), st * gridA(t));
      dots(ctx, v, t, dotsA(t) * st);
      for (const at of RIPPLES) ripple(ctx, c, t, at);
      ctx.globalAlpha = 1;

      /* Teil 1 */
      const pw = pW(t);
      const MB = lerpM(BM, pw);
      const dim = ruleDim(t);
      const ti = tiltOn(t);
      if (ti > 0) {
        fullLine(ctx, v, 118.3, C.txt, tiltLine(t) * 0.45, 2.5, [12, 12], 3);
        arrow(ctx, c, S(V_TILT), C.txt, ti * lerp(1, 0.4, newOn(t)), 7, 10);
        arrow(ctx, c, S(mul(MB, V_TILT)), C.cyan, newOn(t), 8, 16);
        origin(ctx, c, ti, 7);
      }
      const ho = holdOn(t) * dim;
      if (ho > 0) {
        fullLine(ctx, v, 45, C.eig, ho * 0.7, 3.5, undefined, 3.2);
        fullLine(ctx, v, 0, C.eig, ho * 0.7, 3.5);
        ringBase(ctx, c, RING_PX, ringW(t));
        for (const d of [0, 45, 180, 225]) lamp(ctx, c, RING_PX, d, C.eig, litW(t), 14, 34);
        arrow(ctx, c, S(mul(MB, W_LONG)), C.eig, ho, 8, 18);
        arrow(ctx, c, S(mul(MB, W_SHORT)), C.eig, ho, 8, 18);
        origin(ctx, c, ho, 7);
      }

      /* Teil 2: Pfeil (3, 2) */
      const a32 = arrow32(t);
      if (a32 > 0) {
        const p1 = step1(t);
        const p2 = step2(t);
        const tip = mul(smul(lerpM(AM, p1), 1 - p2), P32);
        arrow(ctx, c, S(P32), C.txt, a32 * lerp(1, 0.28, p1), 7, 10);
        dashed(ctx, S(P32), S([2, 0]), C.lam, a32 * p1 * (1 - p2) * 0.7);
        arrow(ctx, c, S(tip), p1 > 0.02 ? C.cyan : C.txt, a32, 8, 16);
        origin(ctx, c, a32, 7 + 5 * p2);
      }

      /* Teil 4: erste Frage */
      const r1 = ring1(t);
      if (r1 > 0) {
        fullLine(ctx, v, Q1_DEG, C.eig, q1Line(t) * 0.75, 3.5, undefined, RING_PX / v.u);
        ringBase(ctx, c, RING_PX, r1);
        lamp(ctx, c, RING_PX, Q1_DEG, C.eig, q1Lit(t), 13, 32);
        lamp(ctx, c, RING_PX, Q1_DEG + 180, C.eig, q1Lit(t), 13, 32);
        for (let d = 0; d < 360; d += 7.5) lamp(ctx, c, RING_PX, d, C.eig, lit1(t, d), 8, 20);
        arrow(ctx, c, S(dir(Q1_DEG, Q1_LEN * (1 - q1Shrink(t)))), C.txt, q1On(t), 8, 14);
        const af = allFan(t);
        for (let d = 0; d < 360; d += 22.5) arrow(ctx, c, S(dir(d, Q1_LEN * (1 - allFall(t)))), C.txt, af, 5, 10);
        origin(ctx, c, r1, 8 + 4 * q1Shrink(t));
      }

      /* Teil 5: zweite Frage */
      const r2 = ring2(t);
      if (r2 > 0) {
        const ax = axisLit(t);
        fullLine(ctx, v, 0, C.eig, ax * 0.85, 4.5);
        ringBase(ctx, c, RING_PX, r2);
        const q2 = q2On(t);
        if (q2 > 0) {
          const p = q2Step(t);
          fullLine(ctx, v, 33.69, C.txt, q2 * 0.45, 2.5, [12, 12], RING_PX / v.u);
          arrow(ctx, c, S(P32), C.txt, q2 * lerp(1, 0.4, p), 7, 10);
          dashed(ctx, S(P32), S([2, 0]), C.lam, q2 * p * 0.75);
          arrow(ctx, c, S(mul(lerpM(AM, p), P32)), p > 0.02 ? C.lam : C.txt, q2, 8, 16);
        }
        const so = scanOn(t);
        if (so > 0) {
          const sd = scanDeg(t);
          for (let d = SCAN_FROM; d > 4; d -= 7.5) {
            if (d >= sd) {
              lamp(ctx, c, RING_PX, d, C.lam, r2 * 0.7, 5, 8);
              lamp(ctx, c, RING_PX, d + 180, C.lam, r2 * 0.7, 5, 8);
            }
          }
          const k = 1 - scanShrink(t);
          const u = dir(sd, SCAN_LEN * k);
          const w = mul(AM, dir(sd, SCAN_LEN));
          fullLine(ctx, v, sd, C.txt, so * 0.45 * (1 - ax), 2.5, [12, 12], RING_PX / v.u);
          dashed(ctx, S(dir(sd, SCAN_LEN)), S(w), C.lam, so * 0.7 * (1 - ax));
          arrow(ctx, c, S(u), ax > 0.5 ? C.eig : C.txt, so, 8, 14);
          arrow(ctx, c, S(w), C.lam, so * (1 - ax), 8, 16);
        }
        lamp(ctx, c, RING_PX, 0, C.eig, ax, 14, 34);
        lamp(ctx, c, RING_PX, 180, C.eig, ax, 14, 34);
        origin(ctx, c, r2, 8);
      }
      ctx.restore();

      // gesamte Bühne gemeinsam ein- und ausblenden, ohne Beschnitt
      ctx.globalCompositeOperation = 'destination-in';
      ctx.fillStyle = `rgba(0,0,0,${st})`;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    }
    const po = panels(t);
    if (po > 0) {
      panel(ctx, t, P_L, P_R0, false, po);
      panel(ctx, t, P_R, P_R0, true, po);
    }
  }, [t]);

  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};
