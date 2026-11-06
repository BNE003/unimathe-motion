import React, {useLayoutEffect, useRef} from 'react';
import {C, H, W} from '../theme';
import {V2, clamp} from '../math';
import {Cam, V3} from '../space';
import {useSec} from '../ui';
import {RIPPLES, alphaAt, camAt, lenB, pulseA, pulseB, shadowLen, tipA, vis} from './world';

type Ctx = CanvasRenderingContext2D;

export const COL = {a: C.eig, b: C.cyan, sh: C.lam};

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgba = (h: string, a: number) => `rgba(${rgb(h).join(',')},${a})`;

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
const scaleAt = (cam: Cam, q: V3) => 16 / Math.max(3, cam.depth(q));

/* ---------- Boden ---------- */

const GX = [-7, 13];
const GY = [-10, 7];
const grid = (ctx: Ctx, cam: Cam, alpha: number) => {
  ctx.strokeStyle = C.vec;
  ctx.lineWidth = 1.2;
  const fadeAt = (x: number, y: number) => clamp(1 - Math.hypot((x - 3) / 10, (y + 1.5) / 8.5));
  for (let x = GX[0]; x <= GX[1]; x++) {
    for (let y = GY[0]; y < GY[1]; y++) {
      const f = fadeAt(x, y + 0.5);
      if (f <= 0) continue;
      ctx.globalAlpha = alpha * 0.3 * f;
      line(ctx, cam.p([x, y, 0]), cam.p([x, y + 1, 0]));
    }
  }
  for (let y = GY[0]; y <= GY[1]; y++) {
    for (let x = GX[0]; x < GX[1]; x++) {
      const f = fadeAt(x + 0.5, y);
      if (f <= 0) continue;
      ctx.globalAlpha = alpha * 0.3 * f;
      line(ctx, cam.p([x, y, 0]), cam.p([x + 1, y, 0]));
    }
  }
};

// Lichtkegel von oben: helle Fläche auf dem Boden, nur sie macht den Schatten als Schatten lesbar
const pool = (ctx: Ctx, cam: Cam, a: number) => {
  if (a <= 0) return;
  const c = cam.p([2.6, -0.4, 0]);
  const p0 = cam.p([2.6 + 1, -0.4, 0]);
  const p1 = cam.p([2.6, -0.4 + 1, 0]);
  ctx.save();
  ctx.globalAlpha = a;
  // Ellipse über die projizierten Achsen des Bodens
  ctx.transform(p0[0] - c[0], p0[1] - c[1], p1[0] - c[0], p1[1] - c[1], c[0], c[1]);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 6.2);
  g.addColorStop(0, 'rgba(190,214,255,.34)');
  g.addColorStop(0.55, 'rgba(120,150,235,.15)');
  g.addColorStop(1, 'rgba(90,110,220,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, 6.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

/* ---------- Rechteck: Schatten × Länge von b ---------- */

const rectangle = (ctx: Ctx, cam: Cam, s: number, depth: number, a: number) => {
  if (a <= 0 || depth <= 0.001) return;
  const c: V2[] = [cam.p([0, 0, 0]), cam.p([s, 0, 0]), cam.p([s, -depth, 0]), cam.p([0, -depth, 0])];
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = a;
  const g = ctx.createLinearGradient(c[0][0], c[0][1], c[3][0], c[3][1]);
  g.addColorStop(0, rgba(COL.sh, 0.62));
  g.addColorStop(1, rgba(COL.a, 0.36));
  ctx.fillStyle = g;
  poly(ctx, c);
  ctx.fill();
  // Einheitsquadrate: Bei |a| = 4 und |b| = 6 sind es 24
  ctx.strokeStyle = C.txt;
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = a * 0.3;
  for (let x = 1; x < s; x++) line(ctx, cam.p([x, 0, 0]), cam.p([x, -depth, 0]));
  for (let y = 1; y < depth; y++) line(ctx, cam.p([0, -y, 0]), cam.p([s, -y, 0]));
  // Ränder
  ctx.globalAlpha = a * 0.95;
  ctx.lineWidth = 3;
  ctx.strokeStyle = COL.sh;
  line(ctx, c[2], c[3]);
  line(ctx, c[1], c[2]);
  ctx.strokeStyle = COL.b;
  line(ctx, c[0], c[3]);
  ctx.globalCompositeOperation = 'source-over';
};

/* ---------- Schatten von a auf b ---------- */

const HALF = 0.34;
const shadowStrip = (ctx: Ctx, cam: Cam, s: number, a: number) => {
  if (a <= 0 || s <= 0.001) return;
  const c: V2[] = [cam.p([0, HALF, 0]), cam.p([s, HALF, 0]), cam.p([s, -HALF, 0]), cam.p([0, -HALF, 0])];
  // echte Abdunklung auf dem beleuchteten Boden, dazu eine warme Kante
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = a * 0.92;
  ctx.fillStyle = '#04040F';
  poly(ctx, c);
  ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = a * 0.3;
  ctx.fillStyle = COL.sh;
  poly(ctx, c);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = a;
  ctx.strokeStyle = COL.sh;
  ctx.lineWidth = 5;
  poly(ctx, c);
  ctx.stroke();
};

// Lichtvorhang zwischen a und seinem Schatten, dazu das Lot von der Spitze
const curtain = (ctx: Ctx, cam: Cam, tip: V3, a: number) => {
  if (a <= 0) return;
  const O = cam.p([0, 0, 0]);
  const P = cam.p(tip);
  const Q = cam.p([tip[0], 0, 0]);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = a * 0.16;
  ctx.fillStyle = COL.a;
  poly(ctx, [O, P, Q]);
  ctx.fill();
  ctx.globalAlpha = a * 0.9;
  ctx.strokeStyle = C.txt;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([12, 12]);
  line(ctx, P, Q);
  ctx.setLineDash([]);
  ctx.globalCompositeOperation = 'source-over';
};

const RAYS: {x: number; y: number; ph: number}[] = Array.from({length: 46}, (_, i) => ({
  x: -1.5 + ((i * 0.6180339) % 1) * 10,
  y: -5.5 + ((i * 0.7548776) % 1) * 9,
  ph: (i * 0.5698403) % 1,
}));

const rays = (ctx: Ctx, cam: Cam, t: number, a: number) => {
  if (a <= 0) return;
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgb(205,222,255)';
  ctx.lineCap = 'round';
  const Z = 6.5;
  for (const r of RAYS) {
    ctx.lineWidth = 7;
    ctx.globalAlpha = a * 0.022;
    line(ctx, cam.p([r.x, r.y, Z]), cam.p([r.x, r.y, 0]));
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = a * 0.06;
    line(ctx, cam.p([r.x, r.y, Z]), cam.p([r.x, r.y, 0]));
    // heller Lichtpuls läuft nach unten
    const z = Z * (1 - ((t * 0.16 + r.ph) % 1));
    ctx.lineWidth = 1.6;
    ctx.globalAlpha = a * 0.13;
    line(ctx, cam.p([r.x, r.y, Math.min(Z, z + 2)]), cam.p([r.x, r.y, z]));
  }
  ctx.globalCompositeOperation = 'source-over';
};

const DUST: V3[] = Array.from({length: 70}, (_, i) => [-3 + ((i * 0.3819) % 1) * 13, -7 + ((i * 0.6823) % 1) * 11, ((i * 0.2451) % 1) * 7]);
const dust = (ctx: Ctx, cam: Cam, u: number, t: number, a: number) => {
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgb(200,215,255)';
  DUST.forEach((d, i) => {
    const z = ((d[2] - t * 0.12 + 7 * 10) % 7) + 0.1;
    const q: V3 = [d[0] + 0.25 * Math.sin(t * 0.3 + i), d[1], z];
    const s = cam.p(q);
    const r = 0.022 * u * scaleAt(cam, q);
    ctx.globalAlpha = a * (0.12 + 0.2 * (0.5 + 0.5 * Math.sin(t * 0.9 + i * 2.1)));
    ctx.beginPath();
    ctx.arc(s[0], s[1], r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalCompositeOperation = 'source-over';
};

/* ---------- Vektoren ---------- */

const vector = (ctx: Ctx, cam: Cam, u: number, to: V3, color: string, alpha: number, pulse: number) => {
  const o = cam.p([0, 0, 0]);
  const e = cam.p(to);
  const dx = e[0] - o[0];
  const dy = e[1] - o[1];
  const L = Math.hypot(dx, dy);
  const s = scaleAt(cam, to);
  const hw = 0.2 * u * s; // halbe Breite der Spitze in Pixeln
  const head = Math.min(0.56 * u * s, L * 0.5);
  const w = (9 + 3 * pulse) * Math.min(1.25, s);
  const ux = L > 0.01 ? dx / L : 1;
  const uy = L > 0.01 ? dy / L : 0;
  const b: V2 = [e[0] - ux * head * 0.82, e[1] - uy * head * 0.82];
  ctx.lineCap = 'round';
  ctx.globalCompositeOperation = 'lighter';
  for (const [wd, al] of [[w * 3.6, 0.1 + 0.12 * pulse], [w * 1.9, 0.2 + 0.15 * pulse]]) {
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
  // Blick genau längs des Vektors: nur noch ein leuchtender Punkt
  const dotA = clamp(1 - L / (hw * 1.4));
  if (dotA > 0) {
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(e[0], e[1], 0, e[0], e[1], hw * 3.4);
    g.addColorStop(0, rgba(color, 0.9));
    g.addColorStop(0.3, rgba(color, 0.32));
    g.addColorStop(1, rgba(color, 0));
    ctx.globalAlpha = alpha * dotA;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(e[0], e[1], hw * 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(e[0], e[1], hw * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
};

const angleArc = (ctx: Ctx, cam: Cam, alphaDeg: number, a: number) => {
  if (a <= 0 || alphaDeg < 0.5) return;
  const R = 1.25;
  const pts: V2[] = [cam.p([0, 0, 0])];
  for (let k = 0; k <= 24; k++) {
    const w = ((k / 24) * alphaDeg * Math.PI) / 180;
    pts.push(cam.p([R * Math.cos(w), 0, R * Math.sin(w)]));
  }
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = a * 0.16;
  ctx.fillStyle = C.txt;
  poly(ctx, pts);
  ctx.fill();
  ctx.globalAlpha = a * 0.85;
  ctx.strokeStyle = C.txt;
  ctx.lineWidth = 3;
  ctx.beginPath();
  pts.slice(1).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
};

const rightMark = (ctx: Ctx, cam: Cam, a: number) => {
  if (a <= 0) return;
  const d = 0.72;
  ctx.globalAlpha = a;
  ctx.strokeStyle = C.txt;
  ctx.lineWidth = 4.5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  const p = [cam.p([d, 0, 0]), cam.p([d, 0, d]), cam.p([0, 0, d])];
  p.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  const m = cam.p([d * 0.5, 0, d * 0.5]);
  ctx.fillStyle = C.txt;
  ctx.beginPath();
  ctx.arc(m[0], m[1], 5.5, 0, Math.PI * 2);
  ctx.fill();
};

const ripple = (ctx: Ctx, cam: Cam, t: number, at: number) => {
  const x = (t - at) / 1.3;
  if (x <= 0 || x >= 1) return;
  const r = 0.4 + 9 * (1 - Math.pow(1 - x, 3));
  const pts: V2[] = [];
  for (let k = 0; k < 64; k++) {
    const w = (k / 64) * Math.PI * 2;
    pts.push(cam.p([r * Math.cos(w), r * Math.sin(w), 0]));
  }
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.8 * (1 - x) * (1 - x);
  ctx.strokeStyle = C.txt;
  ctx.lineWidth = 5 * (1 - x) + 1;
  poly(ctx, pts);
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
};

/* ---------- Bewegungsunschärfe von a ---------- */

const SUB = [3 / 180, 2 / 180, 1 / 180];

export const Scene: React.FC = () => {
  const t = useSec();
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    const {cam, u, top} = camAt(t);
    const st = vis.stage(t);
    const light = vis.light(t);
    const al = alphaAt(t);
    const s = shadowLen(t);
    const tip = tipA(t);
    const bTip: V3 = [lenB(t), 0, 0];

    ctx.globalCompositeOperation = 'lighter';
    pool(ctx, cam, light * st);
    grid(ctx, cam, st * (1 + 0.5 * light));
    ctx.globalCompositeOperation = 'source-over';

    dust(ctx, cam, u, t, st * (0.5 + 0.5 * light));

    rectangle(ctx, cam, s, lenB(t) * vis.rectDepth(t), vis.rect(t) * st);
    shadowStrip(ctx, cam, s, vis.shadow(t) * st);
    rays(ctx, cam, t, light * st * (1 - top));
    curtain(ctx, cam, tip, vis.shadow(t) * st * clamp(tip[0] * 3) * (1 - top));

    for (const at of RIPPLES) ripple(ctx, cam, t, at);

    vector(ctx, cam, u, bTip, COL.b, st, pulseB(t));
    angleArc(ctx, cam, al, vis.arc(t) * st * (1 - top));
    rightMark(ctx, cam, vis.right(t) * st * (1 - top));

    SUB.forEach((dt, i) => {
      const ts = Math.max(0, t - dt);
      const c = camAt(ts);
      if (Math.abs(alphaAt(ts) - al) < 0.4) return;
      vector(ctx, c.cam, c.u, tipA(ts), COL.a, st * 0.14 * (i + 1), 0);
    });
    vector(ctx, cam, u, tip, COL.a, st, pulseA(t));
    ctx.globalAlpha = 1;
  }, [t]);

  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};
