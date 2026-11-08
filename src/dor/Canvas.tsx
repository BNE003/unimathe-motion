import React, {useLayoutEffect, useRef} from 'react';
import {C, H, W} from '../theme';
import {V2, bump, clamp, lerp} from '../math';
import {V3} from '../space';
import {useSec} from '../ui';
import {T} from './timeline';
import {
  A,
  ARC_R,
  B,
  DCam,
  FLIP_AT,
  FLIP_D,
  FLOW_D,
  FLOW_L,
  FLOW_R,
  O1,
  SWEEP_L,
  SWEEP_R,
  TILES,
  camAt,
  flat,
  flipMap,
  flipPhi,
  handAt,
  pulseA,
  pulseB,
  sweep,
  tileLight,
  vis,
  O2,
  LANDED2,
  ghostTip,
  ghostX,
} from './world';

type Ctx = CanvasRenderingContext2D;

// a amber, b cyan, positive Orientierung grün, negative korallenrot, Fläche helles Lavendel
export const COL = {a: C.eig, b: C.cyan, pos: '#7BEA9C', neg: C.lam, face: '#C9CEF0'};

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const rgba = (h: string, a: number) => `rgba(${rgb(h).join(',')},${a})`;
const mixHex = (a: string, b: string, k: number) => {
  const X = rgb(a);
  const Y = rgb(b);
  return `rgb(${X.map((v, i) => Math.round(lerp(v, Y[i], k))).join(',')})`;
};

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
const scaleAt = (cam: DCam, q: V3) => 16 / Math.max(3, cam.depth(q));
const add = (p: V2, q: V2, k = 1): V2 => [p[0] + q[0] * k, p[1] + q[1] * k];

/* ---------- Glasboden, Licht, Staub ---------- */

const floorFade = (x: number, y: number) => clamp(1.15 - Math.hypot(x / 9.5, (y - 1) / 6.5));
const floor = (ctx: Ctx, cam: DCam, a: number) => {
  if (a <= 0) return;
  ctx.strokeStyle = C.vec;
  ctx.lineWidth = 1.1;
  for (let x = -10; x <= 10; x++) {
    for (let y = -6; y < 8; y++) {
      const f = floorFade(x, y + 0.5);
      if (f <= 0) continue;
      ctx.globalAlpha = a * 0.3 * f;
      line(ctx, cam.p([x, y, 0]), cam.p([x, y + 1, 0]));
    }
  }
  for (let y = -6; y <= 8; y++) {
    for (let x = -10; x < 10; x++) {
      const f = floorFade(x + 0.5, y);
      if (f <= 0) continue;
      ctx.globalAlpha = a * 0.3 * f;
      line(ctx, cam.p([x, y, 0]), cam.p([x + 1, y, 0]));
    }
  }
};

const pool = (ctx: Ctx, cam: DCam, c: V2, R: number, color: string, a: number) => {
  if (a <= 0) return;
  const o = cam.p([c[0], c[1], 0]);
  const p0 = cam.p([c[0] + 1, c[1], 0]);
  const p1 = cam.p([c[0], c[1] + 1, 0]);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.transform(p0[0] - o[0], p0[1] - o[1], p1[0] - o[0], p1[1] - o[1], o[0], o[1]);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const RAYS = Array.from({length: 34}, (_, i) => ({
  x: -7 + ((i * 0.6180339) % 1) * 14,
  y: -2 + ((i * 0.7548776) % 1) * 7,
  ph: (i * 0.5698403) % 1,
}));
const rays = (ctx: Ctx, cam: DCam, t: number, a: number) => {
  if (a <= 0) return;
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgb(205,222,255)';
  ctx.lineCap = 'round';
  const Z = 8;
  for (const r of RAYS) {
    ctx.lineWidth = 7;
    ctx.globalAlpha = a * 0.014;
    line(ctx, cam.p([r.x, r.y, Z]), cam.p([r.x, r.y, 0]));
    const z = Z * (1 - ((t * 0.15 + r.ph) % 1));
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = a * 0.06;
    line(ctx, cam.p([r.x, r.y, Math.min(Z, z + 2)]), cam.p([r.x, r.y, z]));
  }
  ctx.globalCompositeOperation = 'source-over';
};

const DUST: V3[] = Array.from({length: 110}, (_, i) => [-8 + ((i * 0.3819) % 1) * 16, -4 + ((i * 0.6823) % 1) * 10, ((i * 0.2451) % 1) * 7.5]);
const dust = (ctx: Ctx, cam: DCam, u: number, t: number, a: number) => {
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgb(200,215,255)';
  DUST.forEach((d, i) => {
    const z = ((d[2] - t * 0.11 + 75) % 7.5) + 0.05;
    const q: V3 = [d[0] + 0.3 * Math.sin(t * 0.3 + i), d[1] + 0.2 * Math.cos(t * 0.21 + i * 1.7), z];
    const s = cam.p(q);
    const k = scaleAt(cam, q);
    const r = Math.min(9, 0.02 * u * k);
    ctx.globalAlpha = a * (0.08 + 0.17 * (0.5 + 0.5 * Math.sin(t * 0.9 + i * 2.1))) * clamp(2.2 - k);
    ctx.beginPath();
    ctx.arc(s[0], s[1], r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalCompositeOperation = 'source-over';
};

/* ---------- Pfeile ---------- */

const arrow = (ctx: Ctx, cam: DCam, u: number, from: V3, to: V3, color: string, alpha: number, pulse: number, wk = 1) => {
  if (alpha <= 0.003) return;
  const o = cam.p(from);
  const e = cam.p(to);
  const dx = e[0] - o[0];
  const dy = e[1] - o[1];
  const L = Math.hypot(dx, dy);
  if (L < 0.5) return;
  const s = Math.min(1.3, scaleAt(cam, to));
  const hw = 0.17 * u * s * wk;
  const head = Math.min(0.42 * u * s * wk, L * 0.45);
  const w = (8 + 3 * pulse) * s * wk;
  const ux = dx / L;
  const uy = dy / L;
  const b: V2 = [e[0] - ux * head * 0.82, e[1] - uy * head * 0.82];
  ctx.lineCap = 'round';
  ctx.globalCompositeOperation = 'lighter';
  for (const [wd, al] of [[w * 3.6, 0.09 + 0.14 * pulse], [w * 1.9, 0.18 + 0.16 * pulse]]) {
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

/* ---------- Spiegelachse ---------- */

const mirrorAxis = (ctx: Ctx, cam: DCam, t: number, a: number, grow: number) => {
  if (a <= 0) return;
  const y0 = -1.4;
  const y1 = lerp(y0, 3.6, grow);
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (const [w, al] of [[30, 0.06], [12, 0.14], [3, 0.75]] as [number, number][]) {
    ctx.lineWidth = w;
    ctx.globalAlpha = a * al;
    ctx.strokeStyle = 'rgb(214,226,255)';
    line(ctx, cam.p([0, y0, 0.01]), cam.p([0, y1, 0.01]));
  }
  // feiner Lichtvorhang über der Achse
  for (let k = 0; k <= 10; k++) {
    const y = lerp(y0, y1, k / 10);
    ctx.lineWidth = 2;
    ctx.globalAlpha = a * 0.05;
    line(ctx, cam.p([0, y, 0]), cam.p([0, y, 1.6]));
  }
  ctx.globalCompositeOperation = 'source-over';
};

/* ---------- Eine Fläche mit ihren Vektoren ---------- */

type Fig = {
  map: (p: V2) => V3;
  alpha: number;
  face: number; // Deckkraft der Füllung
  span: number; // 0…1: die Fläche wird von a entlang b aufgespannt
  vecA: number; // Länge 0…1
  vecB: number;
  pA: number;
  pB: number;
  sweep: number; // Aufbau der Pfeilspur 0…1
  arcCol: string;
  flows: number[];
  tile: (k: number) => number;
  aA?: number; // Deckkraft von a allein
};

const figure = (ctx: Ctx, cam: DCam, u: number, t: number, f: Fig) => {
  const {map, alpha} = f;
  if (alpha <= 0.003) return;
  const P = (p: V2) => cam.p(map(p));
  const o = O1;
  const corners = [o, add(o, A), add(add(o, A), B), add(o, B)];

  // Füllung: schwach die ganze Fläche, hell der bereits aufgespannte Teil
  const fill = (pts: V2[], a: number) => {
    if (a <= 0) return;
    const sp = pts.map(P);
    const g = ctx.createLinearGradient(sp[0][0], sp[0][1], sp[2][0], sp[2][1]);
    g.addColorStop(0, rgba(COL.face, 0.24));
    g.addColorStop(1, rgba(COL.face, 0.11));
    ctx.globalAlpha = alpha * a;
    ctx.fillStyle = g;
    poly(ctx, sp);
    ctx.fill();
  };
  const s = f.span;
  if (s < 1) {
    fill(corners, f.face * 0.35);
    // Umriss der ganzen Fläche gestrichelt, solange sie noch nicht aufgespannt ist
    ctx.setLineDash([10, 12]);
    ctx.strokeStyle = COL.face;
    ctx.lineWidth = 2;
    ctx.globalAlpha = alpha * 0.35;
    poly(ctx, corners.map(P));
    ctx.stroke();
    ctx.setLineDash([]);
  }
  fill([o, add(o, A), add(add(o, A), B, s), add(o, B, s)], f.face);

  // Einheitsquadrate
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = COL.face;
  for (let i = 1; i < 3; i++) {
    ctx.globalAlpha = alpha * 0.2 * f.face;
    line(ctx, P(add(o, [i, 0])), P(add(o, [i, 2 * s])));
  }
  if (s > 0.5) {
    ctx.globalAlpha = alpha * 0.2 * f.face * clamp((s - 0.5) * 4);
    line(ctx, P(add(o, [0, 1])), P(add(o, [3, 1])));
  }
  ctx.globalCompositeOperation = 'lighter';
  TILES.forEach(([i, j], k) => {
    const l = f.tile(k);
    if (l <= 0.01) return;
    ctx.globalAlpha = alpha * l * 0.32;
    ctx.fillStyle = 'rgb(255,240,214)';
    poly(ctx, [add(o, [i + 0.06, j + 0.06]), add(o, [i + 0.94, j + 0.06]), add(o, [i + 0.94, j + 0.94]), add(o, [i + 0.06, j + 0.94])].map(P));
    ctx.fill();
  });
  ctx.globalCompositeOperation = 'source-over';

  // Kanten mit leichtem Leuchten
  const edge = (a: V2, b: V2, k: number) => {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = COL.face;
    ctx.lineCap = 'round';
    for (const [w, al] of [[10, 0.08], [3, 0.55]] as [number, number][]) {
      ctx.lineWidth = w;
      ctx.globalAlpha = alpha * al * k;
      line(ctx, P(a), P(b));
    }
    ctx.globalCompositeOperation = 'source-over';
  };
  const top = add(add(o, A), B, s);
  edge(o, add(o, A), 1);
  edge(add(o, A), top, 1);
  edge(top, add(o, B, s), s < 1 ? 1.6 : 1);
  edge(add(o, B, s), o, 1);
  if (s < 1) edge(top, add(o, B, s), 2.2 * Math.sin(Math.PI * s));

  // Pfeilspur und Zeiger
  arc(ctx, cam, map, f.sweep, f.arcCol, alpha, f.flows.map((p) => (t - p) / FLOW_D), u);
  if (f.sweep > 0 && f.sweep < 1) {
    const h = handAt(f.sweep);
    const k = Math.sin(Math.PI * f.sweep);
    arrow(ctx, cam, u, map(o), map(add(o, h)), mixHex(COL.a, COL.b, f.sweep), alpha * 0.75 * k, 0.4, 0.85);
  }

  // Vektoren
  arrow(ctx, cam, u, map(o), map(add(o, A, f.vecA)), COL.a, alpha * clamp(f.vecA * 4) * (f.aA ?? 1), f.pA, 1);
  arrow(ctx, cam, u, map(o), map(add(o, B, f.vecB)), COL.b, alpha * clamp(f.vecB * 4), f.pB, 1);
};

// Bogen um den Ursprung von a (0°) bis zum aktuellen Zeiger, abgebildet wie die Fläche
const arc = (ctx: Ctx, cam: DCam, map: (p: V2) => V3, s: number, color: string, alpha: number, flows: number[], u: number) => {
  if (s <= 0.002) return;
  const N = 40;
  const pts: V2[] = [];
  for (let k = 0; k <= N; k++) {
    const w = ((k / N) * s * Math.PI) / 2;
    pts.push(cam.p(map(add(O1, [ARC_R * Math.cos(w), ARC_R * Math.sin(w)]))));
  }
  const path = (from: number, to: number) => {
    ctx.beginPath();
    for (let k = Math.max(0, Math.floor(from * N)); k <= Math.min(N, Math.ceil(to * N)); k++) {
      if (k === Math.max(0, Math.floor(from * N))) ctx.moveTo(pts[k][0], pts[k][1]);
      else ctx.lineTo(pts[k][0], pts[k][1]);
    }
  };
  const k = u / 200;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = color;
  for (const [w, al] of [[34, 0.07], [16, 0.16]] as [number, number][]) {
    ctx.lineWidth = w * k;
    ctx.globalAlpha = alpha * al;
    path(0, 1);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineWidth = 7 * k;
  ctx.globalAlpha = alpha;
  path(0, 1);
  ctx.stroke();

  // Pfeilspitze in Drehrichtung
  const e = pts[N];
  const d = pts[N - 3];
  const dx = e[0] - d[0];
  const dy = e[1] - d[1];
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L;
  const uy = dy / L;
  const hl = 42 * k;
  const hw = 27 * k;
  const tip: V2 = [e[0] + ux * hl * 0.55, e[1] + uy * hl * 0.55];
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(tip[0], tip[1]);
  ctx.lineTo(tip[0] - ux * hl - uy * hw, tip[1] - uy * hl + ux * hw);
  ctx.lineTo(tip[0] - ux * hl + uy * hw, tip[1] - uy * hl - ux * hw);
  ctx.closePath();
  ctx.fill();

  // Kopf beim Aufbau
  if (s < 1) {
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(e[0], e[1], 0, e[0], e[1], 46 * k);
    g.addColorStop(0, 'rgba(255,255,255,.9)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(e[0], e[1], 46 * k, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  // Lichtimpulse in Drehrichtung
  if (s >= 1) {
    ctx.globalCompositeOperation = 'lighter';
    for (const x of flows) {
      if (x <= 0 || x >= 1) continue;
      const head = x * 1.25;
      const a = Math.sin(Math.PI * x);
      ctx.strokeStyle = 'rgb(255,255,255)';
      for (const [w, al] of [[20, 0.18], [6, 0.85]] as [number, number][]) {
        ctx.lineWidth = w * k;
        ctx.globalAlpha = alpha * a * al;
        path(clamp(head - 0.3), clamp(head));
        ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }
};

/* ---------- x-Komponente: lokale Achsen und die gespiegelte Kopie von a ---------- */

const compScene = (ctx: Ctx, cam: DCam, u: number, t: number, st: number) => {
  const a = vis.compAxis(t) * st;
  if (a <= 0.003) return;
  const ox = O2[0];
  const P = (x: number, y: number, z = 0.012) => cam.p([ox + x, y, z]);
  ctx.lineCap = 'round';

  // x-Achse mit Pfeil
  ctx.globalCompositeOperation = 'lighter';
  for (const [w, al] of [[12, 0.08], [3, 0.8]] as [number, number][]) {
    ctx.lineWidth = w;
    ctx.globalAlpha = a * al;
    ctx.strokeStyle = C.txt;
    line(ctx, P(-4.1, 0), P(4.1, 0));
  }
  ctx.globalCompositeOperation = 'source-over';
  const e = P(4.3, 0);
  const d = P(3.9, 0);
  const ux = (e[0] - d[0]) / Math.hypot(e[0] - d[0], e[1] - d[1]);
  const uy = (e[1] - d[1]) / Math.hypot(e[0] - d[0], e[1] - d[1]);
  ctx.globalAlpha = a * 0.85;
  ctx.fillStyle = C.txt;
  ctx.beginPath();
  ctx.moveTo(e[0], e[1]);
  ctx.lineTo(e[0] - ux * 26 - uy * 13, e[1] - uy * 26 + ux * 13);
  ctx.lineTo(e[0] - ux * 26 + uy * 13, e[1] - uy * 26 - ux * 13);
  ctx.closePath();
  ctx.fill();
  // Teilstriche
  ctx.strokeStyle = C.txt;
  for (let k = -3; k <= 3; k++) {
    const big = k === 0 || Math.abs(k) === 3;
    ctx.lineWidth = big ? 3.5 : 2.2;
    ctx.globalAlpha = a * (big ? 0.9 : 0.55);
    line(ctx, P(k, -0.16), P(k, 0.16));
  }

  // y-Achse: an ihr wird gespiegelt, sie leuchtet während des Umklappens
  const mirrorGlow = clamp((t - (T.flip - 0.4)) / 0.4) * (1 - clamp((t - (LANDED2 + 0.3)) / 0.6));
  ctx.setLineDash([12, 10]);
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = a * 0.6;
  ctx.strokeStyle = C.txt;
  line(ctx, P(0, -0.6), P(0, 2.75));
  ctx.setLineDash([]);
  if (mirrorGlow > 0) {
    ctx.globalCompositeOperation = 'lighter';
    for (const [w, al] of [[26, 0.08], [9, 0.2], [3, 0.7]] as [number, number][]) {
      ctx.lineWidth = w;
      ctx.globalAlpha = a * al * mirrorGlow;
      ctx.strokeStyle = 'rgb(214,226,255)';
      line(ctx, P(0, -0.6), P(0, 2.75));
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  // Die x-Komponente als Schatten auf der x-Achse: von 0 bis zum Fußpunkt der Spitze
  const g = vis.ghost(t) * st;
  const sx = t < T.flip ? 3 : ghostX(t);
  const showShadow = a * clamp((t - T.comp) / 0.4) * (1 - clamp((t - (T.calc + 0.3)) / 0.8));
  if (showShadow > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = COL.a;
    for (const [w, al] of [[22, 0.12], [9, 0.35]] as [number, number][]) {
      ctx.lineWidth = w;
      ctx.globalAlpha = showShadow * al;
      line(ctx, P(0, 0, 0.02), P(sx, 0, 0.02));
    }
    const dot = P(sx, 0, 0.02);
    const pulse = bump(t, T.minus3, 1.0) + bump(t, T.comp + 0.3, 1.0);
    const rg = ctx.createRadialGradient(dot[0], dot[1], 0, dot[0], dot[1], 34 + 20 * pulse);
    rg.addColorStop(0, 'rgba(255,214,120,.95)');
    rg.addColorStop(1, 'rgba(255,214,120,0)');
    ctx.globalAlpha = showShadow;
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(dot[0], dot[1], 34 + 20 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = showShadow;
    ctx.fillStyle = COL.a;
    ctx.beginPath();
    ctx.arc(dot[0], dot[1], 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Kopie von a: startet bei x = +3, klappt um die y-Achse und landet auf a′
  if (g > 0.003) {
    const tip = ghostTip(t);
    if (tip[2] > 0.03) {
      ctx.setLineDash([8, 9]);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = COL.a;
      ctx.globalAlpha = g * 0.75;
      line(ctx, cam.p(tip), P(ghostX(t), 0, 0.02));
      ctx.setLineDash([]);
    }
    arrow(ctx, cam, u, [ox, 0, 0.03], [tip[0], tip[1], tip[2] + 0.03], COL.a, g, 0.5 + bump(t, T.drei, 1.0), 1.0);
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
    const {cam, u} = camAt(t);
    const st = vis.stage(t);
    const phi = flipPhi(t);
    const right = vis.right(t) * st;
    const landed = t > FLIP_AT + FLIP_D;

    // Boden mit Licht unter beiden Flächen
    ctx.globalCompositeOperation = 'lighter';
    pool(ctx, cam, [0, 1], 8, 'rgba(110,130,255,.15)', st);
    pool(ctx, cam, [O1[0] + 1.5, 1], 3.4, 'rgba(255,214,150,.08)', st);
    pool(ctx, cam, [-O1[0] - 1.5, 1], 3.4, `rgba(255,214,150,${0.08 * right})`, st);
    ctx.globalCompositeOperation = 'source-over';
    floor(ctx, cam, st);
    rays(ctx, cam, t, st);
    mirrorAxis(ctx, cam, t, vis.mirrorAxis(t) * st, vis.axisGrow(t));

    // Original links
    figure(ctx, cam, u, t, {
      map: flat,
      alpha: st * vis.leftDim(t),
      face: vis.faceL(t),
      span: vis.span(t),
      vecA: vis.vecA(t),
      vecB: vis.vecB(t),
      pA: pulseA(t),
      pB: pulseB(t),
      sweep: sweep(t, SWEEP_L),
      arcCol: COL.pos,
      flows: FLOW_L,
      tile: (k) => tileLight(t, k),
    });

    // Spiegelbild: Spiegelung im Glas während des Umklappens, dann die Kopie selbst
    const m = flipMap(phi);
    const lift = Math.sin(phi);
    if (lift > 0.01 && t > FLIP_AT) {
      const mm = (p: V2): V3 => {
        const q = m(p);
        return [q[0], q[1], -q[2]];
      };
      figure(ctx, cam, u, t, {map: mm, alpha: right * 0.12 * lift, face: 1, span: 1, vecA: 1, vecB: 1, pA: 0, pB: 0, sweep: 0, arcCol: COL.neg, flows: [], tile: () => 0});
    }
    figure(ctx, cam, u, t, {
      map: m,
      alpha: right,
      face: 1,
      span: 1,
      vecA: t > FLIP_AT ? 1 : 0,
      vecB: t > FLIP_AT ? 1 : 0,
      pA: landed ? pulseA(t) : 0,
      pB: landed ? pulseB(t) : 0,
      sweep: sweep(t, SWEEP_R),
      arcCol: COL.neg,
      flows: FLOW_R,
      tile: (k) => (t < T.grund ? tileLight(t, k) : t > T.undGenau ? tileLight(t, k) : 0),
      aA: vis.aR(t),
    });

    compScene(ctx, cam, u, t, st);

    // Landung: Lichtring auf dem Boden
    const land = FLIP_AT + FLIP_D;
    if (t > land && t < land + 1.2) {
      const x = (t - land) / 1.2;
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgb(214,226,255)';
      ctx.lineWidth = 3;
      ctx.globalAlpha = st * (1 - x) * 0.6;
      const c: V2 = [-O1[0] - 1.5, 1];
      const R = 1.8 + x * 2.2;
      ctx.beginPath();
      for (let k = 0; k <= 64; k++) {
        const w = (k / 64) * Math.PI * 2;
        const p = cam.p([c[0] + R * Math.cos(w), c[1] + R * Math.sin(w) * 0.8, 0]);
        if (k) ctx.lineTo(p[0], p[1]);
        else ctx.moveTo(p[0], p[1]);
      }
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }

    dust(ctx, cam, u, t, st);
    ctx.globalAlpha = 1;
  }, [t]);

  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};

export {bump};
