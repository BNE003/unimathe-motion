import React, {useLayoutEffect, useRef} from 'react';
import {C, H, W} from '../theme';
import {V2, clamp, lerp} from '../math';
import {V3} from '../space';
import {useSec} from '../ui';
import {T} from './timeline';
import {DIST, KCam, R1, addV, aAt, camAt, cross, dot, pulse, rowsAt, rowsT, s2At, s3At, sub, toWorld, vis} from './world';

type Ctx = CanvasRenderingContext2D;

// Z₁ cyan, Z₂ blau, Z₃ koralle, a amber, Grundfläche hellgelb
export const COL = {r1: C.cyan, r2: '#4FA8FF', r3: C.lam, a: C.eig, face: '#C9CEF0', base: '#FFD98A'};

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const rgba = (h: string, a: number) => `rgba(${rgb(h).join(',')},${a})`;
const mix = (a: string, b: string, k: number, al: number) => {
  const A = rgb(a);
  const B = rgb(b);
  return `rgba(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')},${al})`;
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
// Größenfaktor eines Punktes gegenüber dem Blickpunkt (Perspektive)
const scaleAt = (cam: KCam, q: V3) => DIST / Math.max(1.5, cam.depth(q));

/* ---------- Glasboden, Licht, Staub (Welt: z nach oben) ---------- */

const floorFade = (x: number, y: number) => clamp(1.15 - Math.hypot(x / 6.5, y / 6.5));
const floor = (ctx: Ctx, cam: KCam, a: number) => {
  if (a <= 0) return;
  ctx.strokeStyle = C.vec;
  ctx.lineWidth = 1.1;
  for (let x = -7; x <= 7; x++) {
    for (let y = -7; y < 7; y++) {
      const f = floorFade(x, y + 0.5);
      if (f <= 0) continue;
      ctx.globalAlpha = a * 0.24 * f;
      line(ctx, cam.p([x, y, 0]), cam.p([x, y + 1, 0]));
    }
  }
  for (let y = -7; y <= 7; y++) {
    for (let x = -7; x < 7; x++) {
      const f = floorFade(x + 0.5, y);
      if (f <= 0) continue;
      ctx.globalAlpha = a * 0.24 * f;
      line(ctx, cam.p([x, y, 0]), cam.p([x + 1, y, 0]));
    }
  }
};

const pool = (ctx: Ctx, cam: KCam, c: V2, R: number, color: string, a: number) => {
  if (a <= 0) return;
  const N = 48;
  const o = cam.p([c[0], c[1], 0]);
  ctx.save();
  ctx.globalAlpha = a;
  const pts = Array.from({length: N}, (_, k) => cam.p([c[0] + R * Math.cos((k / N) * Math.PI * 2), c[1] + R * Math.sin((k / N) * Math.PI * 2), 0]));
  const rr = Math.max(...pts.map((p) => Math.hypot(p[0] - o[0], p[1] - o[1])));
  const g = ctx.createRadialGradient(o[0], o[1], 0, o[0], o[1], rr);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  poly(ctx, pts);
  ctx.fill();
  ctx.restore();
};

const RAYS = Array.from({length: 30}, (_, i) => ({
  x: -5 + ((i * 0.6180339) % 1) * 10,
  y: -5 + ((i * 0.7548776) % 1) * 10,
  ph: (i * 0.5698403) % 1,
}));
const rays = (ctx: Ctx, cam: KCam, t: number, a: number) => {
  if (a <= 0) return;
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgb(205,222,255)';
  ctx.lineCap = 'round';
  const Z = 6;
  for (const r of RAYS) {
    ctx.lineWidth = 6;
    ctx.globalAlpha = a * 0.012;
    line(ctx, cam.p([r.x, r.y, Z]), cam.p([r.x, r.y, 0]));
    const z = Z * (1 - ((t * 0.15 + r.ph) % 1));
    ctx.lineWidth = 1.3;
    ctx.globalAlpha = a * 0.05;
    line(ctx, cam.p([r.x, r.y, Math.min(Z, z + 1.6)]), cam.p([r.x, r.y, z]));
  }
  ctx.globalCompositeOperation = 'source-over';
};

const DUST: V3[] = Array.from({length: 90}, (_, i) => [-5 + ((i * 0.3819) % 1) * 10, -5 + ((i * 0.6823) % 1) * 10, ((i * 0.2451) % 1) * 5.5]);
const dust = (ctx: Ctx, cam: KCam, u: number, t: number, a: number) => {
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgb(200,215,255)';
  DUST.forEach((d, i) => {
    const z = ((d[2] - t * 0.11 + 55) % 5.5) + 0.05;
    const q: V3 = [d[0] + 0.3 * Math.sin(t * 0.3 + i), d[1] + 0.2 * Math.cos(t * 0.21 + i * 1.7), z];
    if (cam.depth(q) < 2) return;
    const s = cam.p(q);
    const k = scaleAt(cam, q);
    const r = Math.min(7, 0.018 * u * k);
    ctx.globalAlpha = a * (0.07 + 0.14 * (0.5 + 0.5 * Math.sin(t * 0.9 + i * 2.1))) * clamp(2.2 - k);
    ctx.beginPath();
    ctx.arc(s[0], s[1], r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalCompositeOperation = 'source-over';
};

/* ---------- Pfeile ---------- */

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
  const head = Math.min(0.36 * u * s * wk, L * 0.45);
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

/* ---------- Der Körper der drei Zeilen: ein Glasblock ---------- */

// Mathe-Punkt → Bildschirm
const P = (cam: KCam, p: V3) => cam.p(toWorld(p));

// Hauptlicht fest zur Kamera: von vorn oben links. So sind die sichtbaren Flächen immer verschieden hell.
const lightFor = (cam: KCam): V3 => {
  const l = addV(addV(cam.fw.map((x) => 0.5 * x) as V3, cam.up, 0.72), cam.right, -0.48);
  const n = Math.hypot(...l);
  return [l[0] / n, l[1] / n, l[2] / n];
};

const shoelace = (pts: V2[]) =>
  pts.reduce((s, p, i) => {
    const q = pts[(i + 1) % pts.length];
    return s + p[0] * q[1] - q[0] * p[1];
  }, 0) / 2;

// Konvexe Hülle (Monotone Chain) für den Schatten am Boden
const hull = (pts: V2[]): V2[] => {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o: V2, a: V2, b: V2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: V2[] = [];
  for (const q of p) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  const up: V2[] = [];
  for (const q of [...p].reverse()) {
    while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
};

type Face = {id: string; sp: V2[]; front: boolean; lit: number; depth: number};
// Flächen-IDs: „i0“ = Fläche aus Z₂, Z₃ am Ursprung, „j0“ = aus Z₁, Z₃, „k0“ = aus Z₁, Z₂; „i1“ usw. gegenüber
const faceSet = (cam: KCam, rows: [V3, V3, V3]) => {
  const [a, b, c] = rows;
  const v = (i: number, j: number, k: number): V3 => addV(addV(addV([0, 0, 0], a, i), b, j), c, k);
  const center = v(0.5, 0.5, 0.5);
  const raw: [string, V3[]][] = [
    ['i0', [v(0, 0, 0), v(0, 1, 0), v(0, 1, 1), v(0, 0, 1)]],
    ['i1', [v(1, 0, 0), v(1, 1, 0), v(1, 1, 1), v(1, 0, 1)]],
    ['j0', [v(0, 0, 0), v(1, 0, 0), v(1, 0, 1), v(0, 0, 1)]],
    ['j1', [v(0, 1, 0), v(1, 1, 0), v(1, 1, 1), v(0, 1, 1)]],
    ['k0', [v(0, 0, 0), v(1, 0, 0), v(1, 1, 0), v(0, 1, 0)]],
    ['k1', [v(0, 0, 1), v(1, 0, 1), v(1, 1, 1), v(0, 1, 1)]],
  ];
  const faces: Face[] = [];
  const front: Record<string, boolean> = {};
  const LIGHT = lightFor(cam);
  for (const [id, f0] of raw) {
    const mid = f0.reduce((s, p) => addV(s, p, 0.25), [0, 0, 0] as V3);
    let n = cross(sub(f0[1], f0[0]), sub(f0[3], f0[0]));
    const nl = Math.hypot(...n);
    if (nl < 1e-4) {
      front[id] = true;
      continue;
    }
    let f = f0;
    if (dot(n, sub(mid, center)) < 0) {
      f = [...f0].reverse();
      n = [-n[0], -n[1], -n[2]];
    }
    const nw = toWorld([n[0] / nl, n[1] / nl, n[2] / nl]);
    const sp = f.map((p) => P(cam, p));
    // nach außen zeigende Normale zeigt zur Kamera → Vorderseite
    const toCam = sub(cam.fw.map((x) => x * DIST) as V3, toWorld(mid));
    const isFront = dot(nw, toCam) > 0;
    front[id] = isFront;
    if (Math.abs(shoelace(sp)) < 2) continue;
    faces.push({id, sp, front: isFront, lit: Math.max(0, dot(nw, LIGHT)), depth: f.reduce((s, p) => s + cam.depth(toWorld(p)), 0) / 4});
  }
  faces.sort((f, g) => g.depth - f.depth);
  const all = [0, 1].flatMap((i) => [0, 1].flatMap((j) => [0, 1].map((k) => v(i, j, k))));
  // Pfeil Z₁ liegt an den Flächen j0 und k0, Z₂ an i0 und k0, Z₃ an i0 und j0
  const arrowFront = [front.j0 || front.k0, front.i0 || front.k0, front.i0 || front.j0];
  return {faces, front, all, arrowFront};
};

const shadow = (ctx: Ctx, cam: KCam, all: V3[], alpha: number) => {
  const sh = hull(all.map((p) => [p[1], p[2]] as V2));
  if (sh.length < 3) return;
  ctx.save();
  ctx.filter = 'blur(18px)';
  ctx.globalAlpha = alpha * 0.6;
  ctx.fillStyle = 'rgb(2,3,12)';
  poly(ctx, sh.map(([y, z]) => P(cam, [0, y, z])));
  ctx.fill();
  ctx.restore();
};

// Rückseiten sieht man nur durch das Glas, also dunkel
const backFaces = (ctx: Ctx, faces: Face[], alpha: number) => {
  for (const f of faces.filter((x) => !x.front)) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = mix('#090B2A', '#1C2270', 0.2 + 0.5 * f.lit, 0.7);
    poly(ctx, f.sp);
    ctx.fill();
    ctx.strokeStyle = COL.face;
    ctx.lineWidth = 1.3;
    ctx.globalAlpha = alpha * 0.18;
    poly(ctx, f.sp);
    ctx.stroke();
  }
};

// Vorderseiten: je nach Licht deutlich verschieden hell (oben hell, Seiten mittel und dunkel), Deckkraft `glass`
const frontFaces = (ctx: Ctx, faces: Face[], alpha: number, glass: number) => {
  for (const f of faces.filter((x) => x.front)) {
    const k = Math.pow(f.lit, 0.9);
    const [p0, p1, p2, p3] = f.sp;
    // Verlauf von der hellsten zur dunkelsten Ecke der Fläche (oben heller)
    const top = [p0, p1, p2, p3].reduce((m, p) => (p[1] < m[1] ? p : m));
    const bot = [p0, p1, p2, p3].reduce((m, p) => (p[1] > m[1] ? p : m));
    const g = ctx.createLinearGradient(top[0], top[1], bot[0], bot[1]);
    g.addColorStop(0, mix('#30368E', '#F4F5FF', 0.1 + 0.9 * k, glass));
    g.addColorStop(1, mix('#1D2163', '#B7BDF2', 0.08 + 0.85 * k, glass));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    poly(ctx, f.sp);
    ctx.fill();
  }
  // Kanten der Vorderseiten: hell, mit leichtem Leuchten
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = '#E6E9FF';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const f of faces.filter((x) => x.front)) {
    for (const [w, al] of [[8, 0.04], [2.2, 0.4]] as [number, number][]) {
      ctx.lineWidth = w;
      ctx.globalAlpha = alpha * al;
      poly(ctx, f.sp);
      ctx.stroke();
    }
  }
  ctx.globalCompositeOperation = 'source-over';
};

// Eine Fläche aus zwei Kanten am Ursprung hervorheben (z. B. Grundfläche)
const highlight = (ctx: Ctx, cam: KCam, e1: V3, e2: V3, color: string, alpha: number, edge = 1) => {
  if (alpha <= 0.003) return;
  const pts = [[0, 0, 0], e1, addV(e1, e2), e2].map((p) => P(cam, p as V3));
  ctx.globalAlpha = alpha * 0.34;
  ctx.fillStyle = color;
  poly(ctx, pts);
  ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = color;
  ctx.lineJoin = 'round';
  for (const [w, al] of [[16, 0.1], [3.4, 0.85]] as [number, number][]) {
    ctx.lineWidth = w;
    ctx.globalAlpha = alpha * al * edge;
    poly(ctx, pts);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
};

const outline = (ctx: Ctx, cam: KCam, e1: V3, e2: V3, color: string, alpha: number) => {
  const pts = [[0, 0, 0], e1, addV(e1, e2), e2].map((p) => P(cam, p as V3));
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = color;
  ctx.lineJoin = 'round';
  for (const [w, al] of [[14, 0.08], [3.2, 0.8]] as [number, number][]) {
    ctx.lineWidth = w;
    ctx.globalAlpha = alpha * al;
    poly(ctx, pts);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
};

// Lot von der Spitze `tip` auf die Ebene durch 0 mit den Richtungen e1, e2
export const footOn = (tip: V3, e1: V3, e2: V3): V3 => {
  const n = cross(e1, e2);
  if (dot(n, n) < 1e-9) return tip;
  const k = dot(tip, n) / dot(n, n);
  return sub(tip, n, k);
};
const heightLine = (ctx: Ctx, cam: KCam, tip: V3, e1: V3, e2: V3, alpha: number, glow: number) => {
  if (alpha <= 0.003) return;
  const f = footOn(tip, e1, e2);
  const a = P(cam, tip);
  const b = P(cam, f);
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgb(255,255,255)';
  ctx.lineCap = 'round';
  ctx.lineWidth = 18;
  ctx.globalAlpha = alpha * (0.06 + 0.2 * glow);
  line(ctx, a, b);
  ctx.globalCompositeOperation = 'source-over';
  dashed(ctx, a, b, 'rgb(255,255,255)', alpha, 4, [12, 9]);
  // Fußpunkt und rechter Winkel
  const len1 = Math.hypot(...e1);
  const d = sub(tip, f);
  const dl = Math.hypot(...d);
  if (dl < 0.05 || len1 < 0.05) return;
  const s = 0.24;
  const u1: V3 = [(e1[0] / len1) * s, (e1[1] / len1) * s, (e1[2] / len1) * s];
  const u2: V3 = [(d[0] / dl) * s, (d[1] / dl) * s, (d[2] / dl) * s];
  ctx.strokeStyle = 'rgb(255,255,255)';
  ctx.lineWidth = 3;
  ctx.globalAlpha = alpha * 0.9;
  ctx.beginPath();
  const p1 = P(cam, addV(f, u1));
  const p2 = P(cam, addV(addV(f, u1), u2));
  const p3 = P(cam, addV(f, u2));
  ctx.moveTo(p1[0], p1[1]);
  ctx.lineTo(p2[0], p2[1]);
  ctx.lineTo(p3[0], p3[1]);
  ctx.stroke();
  ctx.fillStyle = 'rgb(255,255,255)';
  ctx.beginPath();
  ctx.arc(b[0], b[1], 5, 0, Math.PI * 2);
  ctx.fill();
};

// Einheitsraster im Quadrat am Boden (Seiten a−1)
const squareGrid = (ctx: Ctx, cam: KCam, side: number, alpha: number) => {
  if (alpha <= 0.003 || Math.abs(side) < 0.05) return;
  const n = Math.floor(Math.abs(side) + 1e-6);
  const sg = Math.sign(side);
  ctx.strokeStyle = COL.base;
  ctx.lineWidth = 2;
  ctx.globalAlpha = alpha * 0.55;
  for (let k = 1; k <= n; k++) {
    if (Math.abs(k - Math.abs(side)) < 0.05) continue;
    line(ctx, P(cam, [0, sg * k, 0]), P(cam, [0, sg * k, side]));
    line(ctx, P(cam, [0, 0, sg * k]), P(cam, [0, side, sg * k]));
  }
};

const bump2 = (t: number, at: number) => {
  const x = (t - at) / 1.0;
  return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x);
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
    if (st <= 0.003) return;
    const a = aAt(t);
    const s2 = s2At(t);
    const s3 = s3At(t);
    const rows = rowsT(t);
    const [r1, r2, r3] = rows;
    const bodyA = vis.body(t) * st;

    ctx.globalCompositeOperation = 'lighter';
    pool(ctx, cam, [0, 0], 6.5, 'rgba(110,130,255,.16)', st);
    pool(ctx, cam, [0, 0], 2.4, 'rgba(255,214,150,.07)', st);
    ctx.globalCompositeOperation = 'source-over';
    floor(ctx, cam, st);
    rays(ctx, cam, t, st);

    const {faces, front, all, arrowFront} = faceSet(cam, rows);
    shadow(ctx, cam, all, bodyA);

    // Quadrat am Boden (Seiten Z₂′ und Z₃′), liegt unter dem Körper
    const sq = vis.square(t) * st;
    if (sq > 0.003) {
      highlight(ctx, cam, r2, r3, COL.base, sq, 1 + bump2(t, T.zweiMal));
      squareGrid(ctx, cam, a - 1, sq);
    }
    // Durchsichtige Phase: Grundflächen und alle Pfeile liegen über dem Glas, damit man ins Innere sieht
    const glass = vis.glass(t);
    const seeInside = glass < 0.75;

    backFaces(ctx, faces, bodyA);

    // Grundflächen: hinten liegend durch das Glas sichtbar, vorn liegend über dem Glas
    const b2 = vis.base2(t) * st;
    const b2e = 1 + bump2(t, T.basis + 0.3) + bump2(t, T.parallel + 0.3) + bump2(t, T.gfGleich);
    const b3 = vis.base3(t) * st;
    if (!front.j0 && !seeInside) highlight(ctx, cam, r1, r3, COL.base, b2, b2e);
    if (!front.k0 && !seeInside) highlight(ctx, cam, r1, r2, COL.base, b3);

    // Pfeile hinter dem Glas
    const O: V3 = [0, 0, 0];
    const wO = toWorld(O);
    const arrows: [V3, string, number][] = [
      [r1, COL.r1, pulse.r1(t)],
      [r2, COL.r2, pulse.r2(t)],
      [r3, COL.r3, pulse.r3(t)],
    ];
    arrows.forEach(([r, c, p], i) => {
      if (!arrowFront[i] && !seeInside) arrow(ctx, cam, u, wO, toWorld(r), c, st, p);
    });

    frontFaces(ctx, faces, bodyA, glass);
    if (front.j0 || seeInside) highlight(ctx, cam, r1, r3, COL.base, b2, b2e);
    if (front.k0 || seeInside) highlight(ctx, cam, r1, r2, COL.base, b3);
    // Umriss des Quadrats über dem Körper (es ist seine Bodenfläche)
    if (sq > 0.003) outline(ctx, cam, r2, r3, COL.base, sq);

    // Pfeile vor dem Glas
    arrows.forEach(([r, c, p], i) => {
      if (arrowFront[i] || seeInside) arrow(ctx, cam, u, wO, toWorld(r), c, st, p);
    });

    // Weg der Spitze: genau −Z₁, also in Richtung des ersten Pfeils
    const g2 = vis.guide2(t) * st;
    if (g2 > 0) {
      const from = rowsAt(a, 0, s3)[1];
      const to = rowsAt(a, 1, s3)[1];
      dashed(ctx, P(cam, from), P(cam, to), COL.r1, g2 * 0.9, 3.5, [5, 9]);
      arrow(ctx, cam, u, toWorld(from), toWorld(to), COL.r1, g2 * 0.45, 0, 0.55);
    }
    const g3 = vis.guide3(t) * st;
    if (g3 > 0) {
      const from = rowsAt(a, s2, 0)[2];
      const to = rowsAt(a, s2, 1)[2];
      dashed(ctx, P(cam, from), P(cam, to), COL.r1, g3 * 0.9, 3.5, [5, 9]);
      arrow(ctx, cam, u, toWorld(from), toWorld(to), COL.r1, g3 * 0.45, 0, 0.55);
    }

    // Höhe über der Grundfläche
    heightLine(ctx, cam, r2, r1, r3, vis.height2(t) * st, bump2(t, T.abstand + 0.4) + bump2(t, T.bleibt) + bump2(t, T.hoeheGleich));
    heightLine(ctx, cam, r3, r1, r2, vis.height3(t) * st, 0);
    const h1 = vis.height1(t) * st;
    if (h1 > 0.003) heightLine(ctx, cam, R1, r2, r3, h1, bump2(t, T.einsHoch + 0.1));

    // Ursprung
    const o = cam.p(wO);
    ctx.globalAlpha = st;
    ctx.fillStyle = C.txt;
    ctx.beginPath();
    ctx.arc(o[0], o[1], 6, 0, Math.PI * 2);
    ctx.fill();

    // bei a = 1 (Hook und Schieberegler): Lichtblitz am Pfeil
    const flat = Math.max(0, 1 - Math.abs(a - 1) / 0.12);
    if (flat > 0) {
      const e = P(cam, R1);
      ctx.globalCompositeOperation = 'lighter';
      const rg = ctx.createRadialGradient(e[0], e[1], 0, e[0], e[1], 90);
      rg.addColorStop(0, 'rgba(255,255,255,.5)');
      rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = st * flat;
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(e[0], e[1], 90, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }

    dust(ctx, cam, u, t, st);
    ctx.globalAlpha = 1;
  }, [t]);

  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};
