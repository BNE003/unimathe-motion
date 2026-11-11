import React, {useLayoutEffect, useRef} from 'react';
import {C, H, W} from '../theme';
import {V2, bump, clamp} from '../math';
import {V3} from '../space';
import {useSec} from '../ui';
import {T} from './timeline';
import {
  CUBE_H,
  DIST,
  E1,
  E2,
  FLAT,
  KCam,
  KERN_CORNERS,
  R2,
  SLIDE,
  STEP_A,
  STEP_B,
  STEP_C,
  Z2,
  aAt,
  addV,
  camAt,
  cubeMap,
  footOf,
  hOf,
  rowsAt,
  rowsT,
  sAt,
  vis,
} from './world';

type Ctx = CanvasRenderingContext2D;

// Z₁ cyan, Z₂ blau, Z₃ koralle, a amber, Ebene lavendel
export const COL = {r1: C.cyan, r2: '#4FA8FF', r3: C.lam, a: C.eig, plane: '#AEB6FF', cube: '#D6DAF6'};

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
const scaleAt = (cam: KCam, q: V3) => DIST / Math.max(1.5, cam.depth(q));

/* ---------- Boden (z = −1), Licht, Staub ---------- */

const FZ = -1;
const floorFade = (x: number, y: number, cx: number, cy: number) => clamp(1.1 - Math.hypot((x - cx) / 6, (y - cy) / 6));
const floor = (ctx: Ctx, cam: KCam, a: number) => {
  if (a <= 0) return;
  ctx.strokeStyle = C.vec;
  ctx.lineWidth = 1.1;
  const cx = 0.5;
  const cy = 2;
  for (let x = -6; x <= 7; x++) {
    for (let y = -5; y < 9; y++) {
      const f = floorFade(x, y + 0.5, cx, cy);
      if (f <= 0) continue;
      ctx.globalAlpha = a * 0.16 * f;
      line(ctx, cam.p([x, y, FZ]), cam.p([x, y + 1, FZ]));
    }
  }
  for (let y = -5; y <= 9; y++) {
    for (let x = -6; x < 7; x++) {
      const f = floorFade(x + 0.5, y, cx, cy);
      if (f <= 0) continue;
      ctx.globalAlpha = a * 0.16 * f;
      line(ctx, cam.p([x, y, FZ]), cam.p([x + 1, y, FZ]));
    }
  }
};

const pool = (ctx: Ctx, cam: KCam, c: V2, R: number, color: string, a: number) => {
  if (a <= 0) return;
  const N = 48;
  const o = cam.p([c[0], c[1], FZ]);
  ctx.save();
  ctx.globalAlpha = a;
  const pts = Array.from({length: N}, (_, k) => cam.p([c[0] + R * Math.cos((k / N) * Math.PI * 2), c[1] + R * Math.sin((k / N) * Math.PI * 2), FZ]));
  const rr = Math.max(...pts.map((p) => Math.hypot(p[0] - o[0], p[1] - o[1])));
  const g = ctx.createRadialGradient(o[0], o[1], 0, o[0], o[1], rr);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  poly(ctx, pts);
  ctx.fill();
  ctx.restore();
};

const DUST: V3[] = Array.from({length: 80}, (_, i) => [-4 + ((i * 0.3819) % 1) * 9, -3 + ((i * 0.6823) % 1) * 10, FZ + ((i * 0.2451) % 1) * 6]);
const dust = (ctx: Ctx, cam: KCam, u: number, t: number, a: number) => {
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgb(200,215,255)';
  DUST.forEach((d, i) => {
    const z = FZ + ((d[2] - FZ - t * 0.11 + 60) % 6) + 0.05;
    const q: V3 = [d[0] + 0.3 * Math.sin(t * 0.3 + i), d[1] + 0.2 * Math.cos(t * 0.21 + i * 1.7), z];
    if (cam.depth(q) < 2) return;
    const s = cam.p(q);
    const k = scaleAt(cam, q);
    const r = Math.min(6, 0.016 * u * k);
    ctx.globalAlpha = a * (0.06 + 0.12 * (0.5 + 0.5 * Math.sin(t * 0.9 + i * 2.1))) * clamp(2.2 - k);
    ctx.beginPath();
    ctx.arc(s[0], s[1], r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalCompositeOperation = 'source-over';
};

/* ---------- Ebene x − y + z = 0 ---------- */

const PC: V3 = [0.6, 1.6, 1.0]; // Mitte des Ausschnitts (liegt in der Ebene)
const PR = 4.4;
const inPlane = (s: number, r: number): V3 => addV(addV(PC, E1, s), E2, r);
const planeSheet = (ctx: Ctx, cam: KCam, a: number, flash: number) => {
  if (a <= 0.003) return;
  const corners = [inPlane(-PR, -PR), inPlane(PR, -PR), inPlane(PR, PR), inPlane(-PR, PR)].map((q) => cam.p(q));
  const c = cam.p(PC);
  const rr = Math.max(...corners.map((p) => Math.hypot(p[0] - c[0], p[1] - c[1])));
  ctx.save();
  poly(ctx, corners);
  ctx.clip();
  const g = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], rr * 0.85);
  g.addColorStop(0, `rgba(150,160,255,${0.2 + 0.18 * flash})`);
  g.addColorStop(0.6, `rgba(110,120,240,${0.1 + 0.08 * flash})`);
  g.addColorStop(1, 'rgba(90,100,220,0)');
  ctx.globalAlpha = a;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  // Raster in der Ebene, zum Rand hin ausgeblendet
  ctx.strokeStyle = COL.plane;
  ctx.lineWidth = 1.5;
  const fade = (s: number, r: number) => clamp(1.05 - Math.hypot(s, r) / PR);
  const step = 0.55;
  for (let k = -8; k <= 8; k++) {
    for (let m = -8; m < 8; m++) {
      const s = k * step;
      const r0 = m * step;
      const f1 = fade(s, r0 + step / 2);
      if (f1 > 0) {
        ctx.globalAlpha = a * (0.3 + 0.25 * flash) * f1;
        line(ctx, cam.p(inPlane(s, r0)), cam.p(inPlane(s, r0 + step)));
      }
      const f2 = fade(r0 + step / 2, s);
      if (f2 > 0) {
        ctx.globalAlpha = a * (0.3 + 0.25 * flash) * f2;
        line(ctx, cam.p(inPlane(r0, s)), cam.p(inPlane(r0 + step, s)));
      }
    }
  }
};

/* ---------- Pfeile, Linien ---------- */

const arrow = (ctx: Ctx, cam: KCam, u: number, from: V3, to: V3, color: string, alpha: number, pls: number, wk = 1) => {
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

const dashed = (ctx: Ctx, a: V2, b: V2, color: string, alpha: number, w = 3, dash: [number, number] = [10, 10]) => {
  if (alpha <= 0.003) return;
  ctx.setLineDash(dash);
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.globalAlpha = alpha;
  line(ctx, a, b);
  ctx.setLineDash([]);
};

// Höhe der Pfeilspitze über der Ebene: senkrechte Linie bis zum Punkt der Ebene darunter
const heightLine = (ctx: Ctx, cam: KCam, tip: V3, alpha: number, glow: number) => {
  if (alpha <= 0.003) return;
  const f = footOf(tip);
  if (Math.abs(hOf(tip)) < 0.03) return;
  const a = cam.p(tip);
  const b = cam.p(f);
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgb(255,255,255)';
  ctx.lineCap = 'round';
  ctx.lineWidth = 20;
  ctx.globalAlpha = alpha * (0.05 + 0.22 * glow);
  line(ctx, a, b);
  ctx.globalCompositeOperation = 'source-over';
  dashed(ctx, a, b, 'rgb(255,255,255)', alpha * 0.95, 4, [12, 9]);
  // Fußpunkt in der Ebene: kleiner Ring
  ctx.strokeStyle = 'rgb(255,255,255)';
  ctx.lineWidth = 3;
  ctx.globalAlpha = alpha * 0.9;
  ctx.beginPath();
  const pts = Array.from({length: 24}, (_, k) => cam.p(addV(addV(f, E1, 0.14 * Math.cos((k / 24) * Math.PI * 2)), E2, 0.14 * Math.sin((k / 24) * Math.PI * 2))));
  poly(ctx, pts);
  ctx.stroke();
};

const glowDot = (ctx: Ctx, p: V2, r: number, color: string, alpha: number) => {
  if (alpha <= 0.003) return;
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
};

/* ---------- Würfel aus Punkten ---------- */

const GRID = [-1, -0.5, 0, 0.5, 1].map((v) => v * CUBE_H);
const CUBE_PTS: V3[] = GRID.flatMap((x) => GRID.flatMap((y) => GRID.map((z) => [x, y, z] as V3)));
const CORNERS: V3[] = [-1, 1].flatMap((x) => [-1, 1].flatMap((y) => [-1, 1].map((z) => [x * CUBE_H, y * CUBE_H, z * CUBE_H] as V3)));
const EDGES: [number, number][] = [];
CORNERS.forEach((p, i) =>
  CORNERS.forEach((q, j) => {
    if (j > i && [0, 1, 2].filter((k) => p[k] !== q[k]).length === 1) EDGES.push([i, j]);
  }),
);
const isKern = (p: V3) => KERN_CORNERS.some((q) => q.every((v, k) => Math.abs(v - p[k]) < 1e-9));

const cubeDraw = (ctx: Ctx, cam: KCam, u: number, t: number, alpha: number, below: boolean) => {
  if (alpha <= 0.003) return;
  const pts = CUBE_PTS.map((p) => ({p, q: cubeMap(t, p)})).filter(({q}) => (hOf(q) < -0.01) === below);
  // Kanten (die Abbildung ist linear, Kanten bleiben Strecken)
  if (!below) {
    ctx.strokeStyle = COL.cube;
    ctx.lineWidth = 2.2;
    ctx.globalAlpha = alpha * 0.55;
    for (const [i, j] of EDGES) line(ctx, cam.p(cubeMap(t, CORNERS[i])), cam.p(cubeMap(t, CORNERS[j])));
  }
  for (const {p, q} of pts) {
    if (isKern(p)) continue;
    const s = cam.p(q);
    const r = Math.max(2.5, 0.032 * u * scaleAt(cam, q));
    ctx.globalAlpha = alpha * (below ? 0.5 : 0.9);
    ctx.fillStyle = COL.cube;
    ctx.beginPath();
    ctx.arc(s[0], s[1], r, 0, Math.PI * 2);
    ctx.fill();
  }
};
const kernCorners = (ctx: Ctx, cam: KCam, u: number, t: number, alpha: number) => {
  if (alpha <= 0.003) return;
  for (const p of KERN_CORNERS) {
    const q = cubeMap(t, p);
    const s = cam.p(q);
    const r = 0.07 * u * scaleAt(cam, q);
    glowDot(ctx, s, r * 3.2, 'rgba(255,194,71,.55)', alpha);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = COL.a;
    ctx.beginPath();
    ctx.arc(s[0], s[1], r, 0, Math.PI * 2);
    ctx.fill();
  }
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
    const a = aAt(t);
    const [sA, sB, sC] = sAt(t);
    const [r1, r2, r3] = rowsT(t);
    const O3: V3 = [0, 0, 0];

    ctx.globalCompositeOperation = 'lighter';
    pool(ctx, cam, [0.5, 2], 6.5, 'rgba(110,130,255,.14)', st);
    ctx.globalCompositeOperation = 'source-over';
    floor(ctx, cam, st);

    // Würfelpunkte unter der Ebene liegen hinter dem Glas
    const cu = vis.cube(t) * st;
    cubeDraw(ctx, cam, u, t, cu, true);

    // Ebene; blitzt, wenn der dritte Pfeil verschwindet und wenn der Würfel platt ist
    const flatEnd = FLAT[0] + FLAT[1];
    const flash = bump(t, SLIDE[0] + SLIDE[1] - 0.2, 1.2) + bump(t, T.ebene, 1.2) * 0.6 + bump(t, flatEnd - 0.1, 1.2);
    planeSheet(ctx, cam, vis.plane(t) * st, flash);

    cubeDraw(ctx, cam, u, t, cu, false);

    // Wege der Gauß-Schritte (gestrichelt) und Geister der Pfeile vor dem Schritt
    const win = (s: [number, number]) => clamp((t - (s[0] - 0.4)) / 0.4) * (1 - clamp((t - (s[0] + s[1] + 0.5)) / 0.5));
    const gA = win(STEP_A) * st;
    if (gA > 0) {
      dashed(ctx, cam.p(Z2), cam.p(R2), COL.r1, gA * 0.9, 3.5, [5, 9]);
      arrow(ctx, cam, u, O3, Z2, COL.r2, gA * 0.25 * (sA > 0 ? 1 : 0), 0, 0.7);
    }
    const gB = win(STEP_B) * st;
    if (gB > 0) {
      const from = rowsAt(a, 1, 0, 0)[2];
      const to = rowsAt(a, 1, 1, 0)[2];
      dashed(ctx, cam.p(from), cam.p(to), COL.r1, gB * 0.9, 3.5, [5, 9]);
      arrow(ctx, cam, u, O3, from, COL.r3, gB * 0.25 * (sB > 0 ? 1 : 0), 0, 0.7);
    }
    const gC = win(STEP_C) * st;
    if (gC > 0) {
      const from = rowsAt(a, 1, 1, 0)[2];
      const to = rowsAt(a, 1, 1, 1)[2];
      dashed(ctx, cam.p(from), cam.p(to), COL.r2, gC * 0.9, 3.5, [5, 9]);
      arrow(ctx, cam, u, O3, from, COL.r3, gC * 0.25 * (sC > 0 ? 1 : 0), 0, 0.7);
    }

    // Pfeile
    const ar = vis.arrows(t) * st;
    const show = (at: number) => clamp((t - at) / 0.45);
    const p1 = bump(t, T.pfeile + 0.1, 0.9) + bump(t, T.ebene, 1.0);
    const p2 = bump(t, T.pfeile + 0.35, 0.9) + bump(t, T.ebene + 0.2, 1.0) + bump(t, STEP_A[0] + STEP_A[1] - 0.2, 1.0);
    const p3 = bump(t, T.pfeile + 0.6, 0.9) + bump(t, T.dritte, 1.0) + bump(t, T.aMinus2, 1.2);
    arrow(ctx, cam, u, O3, r1, COL.r1, ar * show(T.pfeile - 0.1), p1);
    arrow(ctx, cam, u, O3, r2, COL.r2, ar * show(T.pfeile + 0.15), p2);
    arrow(ctx, cam, u, O3, r3, COL.r3, ar * show(T.pfeile + 0.4), p3);

    // Höhe des dritten Pfeils über der Ebene
    heightLine(ctx, cam, r3, vis.height(t) * st, bump(t, T.dritte + 0.2, 1.2) + bump(t, T.hoch, 1.2) + bump(t, STEP_B[0] + STEP_B[1] - 0.3, 1.0));

    kernCorners(ctx, cam, u, t, cu);

    // Ursprung
    const o = cam.p(O3);
    ctx.globalAlpha = st;
    ctx.fillStyle = C.txt;
    ctx.beginPath();
    ctx.arc(o[0], o[1], 6, 0, Math.PI * 2);
    ctx.fill();
    // Lichtblitz im Ursprung, wenn der dritte Pfeil auf null schrumpft und wenn die Würfelecken dort ankommen
    const f = Math.max(0, 1 - Math.abs(a - 2) / 0.15) * clamp((t - SLIDE[0]) / 0.3) * (1 - clamp((t - (SLIDE[0] + SLIDE[1] + 1.2)) / 0.6));
    glowDot(ctx, o, 90, 'rgba(255,255,255,.5)', st * f);
    glowDot(ctx, o, 110, 'rgba(255,194,71,.5)', st * bump(t, flatEnd - 0.15, 1.3));

    dust(ctx, cam, u, t, st);
    ctx.globalAlpha = 1;
  }, [t]);

  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};
