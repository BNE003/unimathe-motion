// Raum-Szenen: Gerade E₁ entsteht aus dem Regler t, Ebene E₃ (Wand x = y) aus den Reglern s und t.
import React, {useLayoutEffect, useRef} from 'react';
import {C, H, W} from '../theme';
import {V2, bump, clamp, lerp} from '../math';
import {V3, add3, sc3} from '../space';
import {useSec} from '../ui';
import {T} from './timeline';
import {B1, B2, E1, HCam, K, SWEEP_S, SWEEP_T, STAGE2, TRIPLE, W1, W3, camAt, kTriple, planeFlash, sReg3, tReg1, tReg3, trace1, traceS, traceT, vis} from './world';

type Ctx = CanvasRenderingContext2D;

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const rgba = (h: string, a: number) => `rgba(${rgb(h).join(',')},${a})`;

const line = (ctx: Ctx, a: V2, b: V2) => {
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
};
const poly = (ctx: Ctx, pts: V2[]) => {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
};
const scaleAt = (cam: HCam, q: V3) => 16 / Math.max(1.5, cam.depth(q));

/* ---------- Boden z = 0, Achsen, Staub ---------- */

const floor = (ctx: Ctx, cam: HCam, a: number) => {
  if (a <= 0) return;
  ctx.strokeStyle = C.vec;
  ctx.lineWidth = 1.1;
  const R = 4;
  const fade = (x: number, y: number) => clamp(1.05 - Math.hypot(x, y) / R);
  for (let x = -4; x <= 4; x++) {
    for (let y = -4; y < 4; y++) {
      const f = fade(x, y + 0.5);
      if (f <= 0) continue;
      ctx.globalAlpha = a * 0.14 * f;
      line(ctx, cam.p([x, y, 0]), cam.p([x, y + 1, 0]));
    }
  }
  for (let y = -4; y <= 4; y++) {
    for (let x = -4; x < 4; x++) {
      const f = fade(x + 0.5, y);
      if (f <= 0) continue;
      ctx.globalAlpha = a * 0.14 * f;
      line(ctx, cam.p([x, y, 0]), cam.p([x + 1, y, 0]));
    }
  }
};

const axes = (ctx: Ctx, cam: HCam, a: number) => {
  if (a <= 0) return;
  ctx.strokeStyle = C.txt2;
  ctx.lineWidth = 2;
  const L = 2.6;
  for (const d of [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ] as V3[]) {
    ctx.globalAlpha = a * 0.55;
    line(ctx, cam.p(sc3(d, -L * 0.6)), cam.p(sc3(d, L)));
  }
};

const DUST: V3[] = Array.from({length: 70}, (_, i) => [-4 + ((i * 0.3819) % 1) * 8, -4 + ((i * 0.6823) % 1) * 8, -1 + ((i * 0.2451) % 1) * 4]);
const dust = (ctx: Ctx, cam: HCam, u: number, t: number, a: number) => {
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgb(200,215,255)';
  DUST.forEach((d, i) => {
    const z = -1 + ((d[2] + 1 - t * 0.1 + 40) % 4);
    const q: V3 = [d[0] + 0.3 * Math.sin(t * 0.3 + i), d[1] + 0.2 * Math.cos(t * 0.21 + i * 1.7), z];
    if (cam.depth(q) < 2) return;
    const s = cam.p(q);
    const k = scaleAt(cam, q);
    ctx.globalAlpha = a * (0.06 + 0.1 * (0.5 + 0.5 * Math.sin(t * 0.9 + i * 2.1))) * clamp(2.2 - k);
    ctx.beginPath();
    ctx.arc(s[0], s[1], Math.min(5, 0.016 * u * k), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalCompositeOperation = 'source-over';
};

const glowDot = (ctx: Ctx, p: V2, r: number, color: string, a: number) => {
  if (a <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = a;
  const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

/* ---------- Gerade, Ebene, Pfeile ---------- */

// leuchtende Linie im Raum
const glowLine = (ctx: Ctx, a: V2, b: V2, color: string, alpha: number, w: number) => {
  if (alpha <= 0.003) return;
  ctx.lineCap = 'round';
  ctx.globalCompositeOperation = 'lighter';
  for (const [wd, al] of [[w * 4, 0.1], [w * 2, 0.22]]) {
    ctx.globalAlpha = alpha * al;
    ctx.strokeStyle = color;
    ctx.lineWidth = wd;
    line(ctx, a, b);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  line(ctx, a, b);
};

// Wand x = y: Punkte s·b₁ + t·b₂
const inWall = (s: number, r: number): V3 => add3(sc3(B1, s), sc3(B2, r));
const wall = (ctx: Ctx, cam: HCam, a: number, s: [number, number], r: [number, number], flash: number) => {
  if (a <= 0.003) return;
  const corners = [inWall(s[0], r[0]), inWall(s[1], r[0]), inWall(s[1], r[1]), inWall(s[0], r[1])].map((q) => cam.p(q));
  ctx.save();
  ctx.globalAlpha = a * (0.2 + 0.12 * flash);
  ctx.fillStyle = rgba(K.l3, 1);
  poly(ctx, corners);
  ctx.fill();
  ctx.restore();
  // Raster
  ctx.strokeStyle = K.l3;
  ctx.lineWidth = 1.4;
  const step = 0.5;
  ctx.globalAlpha = a * (0.4 + 0.3 * flash);
  for (let k = Math.ceil(s[0] / step) * step; k <= s[1] + 1e-6; k += step) line(ctx, cam.p(inWall(k, r[0])), cam.p(inWall(k, r[1])));
  for (let k = Math.ceil(r[0] / step) * step; k <= r[1] + 1e-6; k += step) line(ctx, cam.p(inWall(s[0], k)), cam.p(inWall(s[1], k)));
  // Rand
  ctx.globalAlpha = a * (0.7 + 0.3 * flash);
  ctx.lineWidth = 2.4;
  poly(ctx, corners);
  ctx.stroke();
};

const arrow = (ctx: Ctx, cam: HCam, u: number, from: V3, to: V3, color: string, alpha: number, pls: number, wk = 1) => {
  if (alpha <= 0.003) return;
  const o = cam.p(from);
  const e = cam.p(to);
  const dx = e[0] - o[0];
  const dy = e[1] - o[1];
  const L = Math.hypot(dx, dy);
  if (L < 0.5) return;
  const s = Math.min(1.5, scaleAt(cam, to));
  const hw = 0.15 * u * s * wk;
  const head = Math.min(0.34 * u * s * wk, L * 0.45);
  const w = (7 + 3 * pls) * s * wk;
  const ux = dx / L;
  const uy = dy / L;
  const b: V2 = [e[0] - ux * head * 0.82, e[1] - uy * head * 0.82];
  ctx.lineCap = 'round';
  ctx.globalCompositeOperation = 'lighter';
  for (const [wd, al] of [[w * 3.6, 0.09 + 0.14 * pls], [w * 1.9, 0.18 + 0.16 * pls]]) {
    ctx.globalAlpha = alpha * al;
    ctx.strokeStyle = color;
    ctx.lineWidth = wd;
    line(ctx, o, b);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = w;
  if (L > head * 0.5) line(ctx, o, b);
  ctx.beginPath();
  ctx.moveTo(e[0], e[1]);
  ctx.lineTo(e[0] - ux * head - uy * hw, e[1] - uy * head + ux * hw);
  ctx.lineTo(e[0] - ux * head + uy * hw, e[1] - uy * head - ux * hw);
  ctx.closePath();
  ctx.fill();
};

const dashed = (ctx: Ctx, a: V2, b: V2, color: string, alpha: number, w: number, dash: number[]) => {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.setLineDash(dash);
  line(ctx, a, b);
  ctx.restore();
};

/* ---------- Szene ---------- */

export const Scene: React.FC = () => {
  const t = useSec();
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    const st = vis.stage(t);
    if (st <= 0.003) return;
    const {cam, u} = camAt(t);
    const O3: V3 = [0, 0, 0];
    const room2 = t >= STAGE2[0] - 1;

    floor(ctx, cam, st);
    axes(ctx, cam, vis.axes(t) * st);

    // Ebene E₃: erst eine Linie (s fährt), dann füllt sie sich mit t
    if (room2) {
      const pa = vis.plane(t) * st;
      const [s0, s1] = traceS(t);
      const [r0, r1] = traceT(t);
      const tNow = tReg3(t);
      const full = clamp((t - (SWEEP_T[0] + SWEEP_T[1] + 0.1)) / 0.8);
      const S0 = lerp(s0, Math.min(s0, -1.8), full);
      const S1 = lerp(s1, Math.max(s1, 1.8), full);
      const [q0, q1] = t < SWEEP_T[0] ? [tNow, tNow] : [r0, r1];
      const R0 = lerp(q0, Math.min(q0, -1.2), full);
      const R1 = lerp(q1, Math.max(q1, 1.8), full);
      if (R1 - R0 > 0.02) wall(ctx, cam, pa, [S0, S1], [R0, R1], planeFlash(t));
      else glowLine(ctx, cam.p(inWall(S0, R0)), cam.p(inWall(S1, R0)), K.l3, pa, 3);
    }

    // Gerade E₁
    const la = vis.line1(t) * st;
    if (la > 0) {
      const [lo, hi] = trace1(t);
      const grow = room2 ? 1 : clamp((t - (T.gerade + 0.1)) / 0.7);
      const a0 = Math.min(lo, -2.4 * grow + lo * (1 - grow));
      const a1 = Math.max(hi, 2.4 * grow + hi * (1 - grow));
      glowLine(ctx, cam.p(sc3(E1, a0)), cam.p(sc3(E1, a1)), K.l1, la * 0.95, 3.2);
    }

    // Raum 1: Pfeil t·(−1, 1, 0)
    const a1 = vis.arrow1(t) * st;
    if (a1 > 0) arrow(ctx, cam, u, O3, sc3(E1, tReg1(t)), K.l1, a1, bump(t, T.eineRichtung, 1) + bump(t, T.gerade, 1));

    // Raum 2: Pfeil s·b₁ + t·b₂ mit seinen Anteilen
    const a3 = vis.arrow3(t) * st;
    if (a3 > 0) {
      const s = sReg3(t);
      const r = tReg3(t);
      const ps = vis.parts(t) * st;
      const sb = sc3(B1, s);
      const tip = add3(sb, sc3(B2, r));
      arrow(ctx, cam, u, O3, sb, K.l3, ps * 0.55, 0, 0.62);
      dashed(ctx, cam.p(sb), cam.p(tip), K.t3, ps * 0.85, 3.5, [7, 9]);
      dashed(ctx, cam.p(O3), cam.p(sc3(B2, r)), K.t3, ps * 0.35, 2.5, [5, 9]);
      dashed(ctx, cam.p(sc3(B2, r)), cam.p(tip), K.l3, ps * 0.35, 2.5, [5, 9]);
      arrow(ctx, cam, u, O3, tip, C.txt, a3, bump(t, T.ebene, 1.1));
    }

    // A wirkt: Vektoren der Ebene werden dreimal so lang, der Vektor der Geraden bleibt
    const sa = vis.samples(t) * st;
    if (sa > 0) {
      const k = kTriple(t);
      W3.forEach((w) => {
        dashed(ctx, cam.p(O3), cam.p(w), K.l3, sa * 0.5 * clamp((t - TRIPLE[0]) / 0.3), 2.5, [5, 8]);
        arrow(ctx, cam, u, O3, sc3(w, k), K.l3, sa, bump(t, TRIPLE[0] + TRIPLE[1], 1));
      });
      arrow(ctx, cam, u, O3, W1, K.l1, sa, bump(t, TRIPLE[0] + TRIPLE[1] + 0.2, 1));
    }

    // Ursprung
    const o = cam.p(O3);
    ctx.globalAlpha = st;
    ctx.fillStyle = C.txt;
    ctx.beginPath();
    ctx.arc(o[0], o[1], 6, 0, Math.PI * 2);
    ctx.fill();
    glowDot(ctx, o, 80, 'rgba(180,155,255,.45)', st * bump(t, T.ebene, 1.3));

    dust(ctx, cam, u, t, st);
    ctx.globalAlpha = 1;
  }, [t]);

  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};

export {inWall};
