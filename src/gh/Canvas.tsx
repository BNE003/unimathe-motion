import React, {useLayoutEffect, useRef} from 'react';
import {C, H, W} from '../theme';
import {V2, bump, clamp, lerp} from '../math';
import {V3, dot3} from '../space';
import {useSec} from '../ui';
import {
  BANDS,
  Cam,
  CopyState,
  axisVis,
  camAt,
  coatAlpha,
  coatX,
  copies,
  copyPoint,
  curveVis,
  cutGap,
  discSlide,
  discVis,
  fillAlpha,
  fillX,
  floorVis,
  heroGlow,
  hornAlpha,
  lenVis1,
  lenVis2,
  pieceOf,
  pieceVis,
  ringVis,
  shiftX,
  slotPoint,
  stageVis,
  sweepAt,
  unroll,
  unrollPoint,
} from './world';
import {T} from './timeline';

type Ctx = CanvasRenderingContext2D;

export const COL = {vol: C.eig, skin: C.cyan, glass: '#C9CCF2', inf: C.lam};

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgba = (h: string, a: number) => `rgba(${rgb(h).join(',')},${a})`;
const mixRgb = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k);
const css = (c: number[], a: number) => `rgba(${c.map((v) => Math.round(clamp(v, 0, 255))).join(',')},${a})`;

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
const norm = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

/* ---------- Licht an der Kamera ---------- */

const lightOf = (cam: Cam): V3 => norm([0, 1, 2].map((i) => cam.fw[i] * 0.5 + cam.up[i] * 0.72 - cam.r[i] * 0.48) as V3);

/* ---------- Ringe: geometrischer Abstand, Schnitte bei 1, 2, 4, 8, … ---------- */

const PER_OCT = 16;
const XS = Array.from({length: PER_OCT * 15 + 1}, (_, k) => Math.pow(2, k / PER_OCT));
const SEG = 64;
const TH = Array.from({length: SEG + 1}, (_, j) => (j / SEG) * Math.PI * 2);

/* ---------- Boden ---------- */

const FZ = -1.45;
const floor = (ctx: Ctx, cam: Cam, a: number) => {
  if (a <= 0.01) return;
  ctx.globalCompositeOperation = 'lighter';
  // Lichtfleck unter der Glocke
  const c = cam.p([2.2, 0, FZ]);
  const p0 = cam.p([3.2, 0, FZ]);
  const p1 = cam.p([2.2, 1, FZ]);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.transform(p0[0] - c[0], p0[1] - c[1], p1[0] - c[0], p1[1] - c[1], c[0], c[1]);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 5.5);
  g.addColorStop(0, 'rgba(190,214,255,.26)');
  g.addColorStop(0.55, 'rgba(120,150,235,.1)');
  g.addColorStop(1, 'rgba(90,110,220,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = C.vec;
  ctx.lineWidth = 1.1;
  const fade = (x: number, y: number) => clamp(1 - Math.hypot((x - 3) / 9, y / 5.5));
  for (let x = -4; x <= 14; x++) {
    for (let y = -6; y < 6; y++) {
      const f = fade(x, y + 0.5);
      if (f <= 0) continue;
      ctx.globalAlpha = a * 0.26 * f;
      line(ctx, cam.p([x, y, FZ]), cam.p([x, y + 1, FZ]));
    }
  }
  for (let y = -6; y <= 6; y++) {
    for (let x = -4; x < 14; x++) {
      const f = fade(x + 0.5, y);
      if (f <= 0) continue;
      ctx.globalAlpha = a * 0.26 * f;
      line(ctx, cam.p([x, y, FZ]), cam.p([x + 1, y, FZ]));
    }
  }
  ctx.globalCompositeOperation = 'source-over';
};

// Schatten des Horns auf dem Boden: weiche dunkle Bahn
const floorShadow = (ctx: Ctx, cam: Cam, a: number) => {
  if (a <= 0.01) return;
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < XS.length - 1; i += 2) {
    const x0 = XS[i];
    const x1 = XS[i + 2] ?? XS[i + 1];
    if (x0 > 300) break;
    const w0 = 1.15 / x0;
    const w1 = 1.15 / x1;
    ctx.globalAlpha = a * 0.32;
    ctx.fillStyle = '#020210';
    poly(ctx, [cam.p([x0, -w0, FZ]), cam.p([x1, -w1, FZ]), cam.p([x1, w1, FZ]), cam.p([x0, w0, FZ])]);
    ctx.fill();
  }
};

const DUST: V3[] = Array.from({length: 80}, (_, i) => [-2 + ((i * 0.3819) % 1) * 16, -6 + ((i * 0.6823) % 1) * 9, -1.4 + ((i * 0.2451) % 1) * 6]);
const dust = (ctx: Ctx, cam: Cam, t: number, a: number) => {
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgb(200,215,255)';
  DUST.forEach((d, i) => {
    const q: V3 = [d[0] + 0.25 * Math.sin(t * 0.3 + i), d[1], -1.4 + ((d[2] + 1.4 + t * 0.1) % 6)];
    if (cam.depth(q) < 0.5) return;
    const s = cam.p(q);
    const r = Math.min(5, 0.02 * cam.scale(q));
    ctx.globalAlpha = a * (0.1 + 0.18 * (0.5 + 0.5 * Math.sin(t * 0.9 + i * 2.1)));
    ctx.beginPath();
    ctx.arc(s[0], s[1], r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalCompositeOperation = 'source-over';
};

/* ---------- Horn als tiefensortierte Flächen ---------- */

type Face = {pts: V2[]; depth: number; back: boolean; shade: number; spec: number; rim: number; kind: 0 | 1; x: number; piece: number};

type HornOpts = {
  map: (q: V3) => V3; // Welt nach Verschiebung/Kopie
  nmap?: (n: V3) => V3;
  xmax: number;
  sweep: number;
  rScale?: number; // Füllung: innere Hülle
  pieces?: [number, number]; // nur dieser x-Bereich
  th0?: number; // Startwinkel der Rotation
};

// Flächen eines Rotationskörpers r = 1/x; bricht ab, wo der Radius unter einen halben Pixel fällt
const hornFaces = (cam: Cam, L: V3, o: HornOpts, kind: 0 | 1, out: Face[]) => {
  const rs = o.rScale ?? 1;
  const [xa, xb] = o.pieces ?? [1, o.xmax];
  let lastX = xa;
  for (let i = 0; i < XS.length - 1; i++) {
    let x0 = XS[i];
    let x1 = XS[i + 1];
    if (x1 <= xa + 1e-9) continue;
    if (x0 >= Math.min(xb, o.xmax) - 1e-9) break;
    x0 = Math.max(x0, xa);
    x1 = Math.min(x1, xb, o.xmax);
    const r0 = rs / x0;
    const r1 = rs / x1;
    const c0 = o.map([x0, 0, 0]);
    if (cam.depth(c0) < 0.3) continue;
    const pxR = r1 * cam.scale(c0);
    if (pxR < 0.5) break;
    lastX = x1;
    const xm = (x0 + x1) / 2;
    const dr = -1 / (xm * xm);
    const seg = pxR < 6 ? 16 : pxR < 30 ? 32 : SEG;
    const step = SEG / seg;
    for (let j = 0; j < SEG; j += step) {
      if (TH[j] >= o.sweep - 1e-6) break;
      const t0 = o.th0 ?? 0;
      const a0 = TH[j] + t0;
      const b1 = Math.min(TH[Math.min(SEG, j + step)], o.sweep) + t0;
      const am = (a0 + b1) / 2;
      const q = [
        o.map([x0, r0 * Math.cos(a0), r0 * Math.sin(a0)]),
        o.map([x1, r1 * Math.cos(a0), r1 * Math.sin(a0)]),
        o.map([x1, r1 * Math.cos(b1), r1 * Math.sin(b1)]),
        o.map([x0, r0 * Math.cos(b1), r0 * Math.sin(b1)]),
      ];
      let n = norm([-dr, Math.cos(am), Math.sin(am)]);
      if (o.nmap) n = norm(o.nmap(n));
      const ctr = o.map([xm, ((r0 + r1) / 2) * Math.cos(am), ((r0 + r1) / 2) * Math.sin(am)]);
      const vdir = norm(sub(cam.pos, ctr));
      const facing = dot3(n, vdir);
      const back = facing < 0;
      const nn: V3 = back ? [-n[0], -n[1], -n[2]] : n;
      const diff = Math.max(0, dot3(nn, L));
      const h = norm([L[0] + vdir[0], L[1] + vdir[1], L[2] + vdir[2]]);
      const spec = Math.pow(Math.max(0, dot3(nn, h)), 28);
      out.push({
        pts: q.map((p) => cam.p(p)),
        depth: cam.depth(ctr),
        back,
        shade: diff,
        spec,
        rim: Math.pow(1 - Math.abs(facing), 3),
        kind,
        x: xm,
        piece: pieceOf(xm),
      });
    }
  }
  return lastX;
};

const GLASS = rgb('#C9CCF2');
const GLASS_DARK = rgb('#2A2C5C');
const AMBER = rgb(C.eig);
const CYAN = rgb(C.cyan);

const drawFace = (ctx: Ctx, f: Face, alpha: number, cx: number, coatA: number, tint: number) => {
  if (f.kind === 1) {
    // Farbe innen: warm leuchtend, Licht nur leicht
    const c = mixRgb(AMBER.map((v) => v * 0.55), AMBER, 0.35 + 0.65 * f.shade);
    const col = mixRgb(c, [255, 240, 200], f.spec * 0.6);
    ctx.fillStyle = css(col, 1);
    ctx.strokeStyle = css(col, 1);
    ctx.globalAlpha = alpha;
  } else if (f.back) {
    const col = mixRgb(GLASS_DARK.map((v) => v * 0.6), GLASS_DARK, 0.3 + 0.7 * f.shade);
    ctx.fillStyle = css(col, 1);
    ctx.strokeStyle = css(col, 1);
    ctx.globalAlpha = alpha * 0.95;
  } else {
    const coat = f.x <= cx ? coatA : 0;
    const base = mixRgb(GLASS, CYAN, coat * 0.85);
    let col = mixRgb(base.map((v) => v * 0.16), base, 0.12 + 0.88 * f.shade);
    col = col.map((v) => v * (1 - 0.12 * tint * (f.piece % 2)));
    col = mixRgb(col, [255, 255, 255], f.spec * 0.75);
    col = mixRgb(col, CYAN, f.rim * 0.22);
    ctx.fillStyle = css(col, 1);
    ctx.strokeStyle = css(col, 1);
    // Anstrich ist deckend
    ctx.globalAlpha = Math.min(1, alpha + coat * 0.55);
  }
  poly(ctx, f.pts);
  ctx.fill();
  ctx.lineWidth = 0.8;
  ctx.stroke();
};

// dünner Faden, wo das Horn schmaler als ein Pixel wird
const thread = (ctx: Ctx, cam: Cam, map: (q: V3) => V3, from: number, a: number, color: string) => {
  if (a <= 0 || from >= XS[XS.length - 1]) return;
  const pts: V2[] = [];
  for (let x = from; x <= 1e5; x *= 1.25) {
    const q = map([x, 0, 0]);
    if (cam.depth(q) < 0.3) continue;
    pts.push(cam.p(q));
  }
  if (pts.length < 2) return;
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (const [w, al] of [[6, 0.12], [2.2, 0.5]]) {
    ctx.globalAlpha = a * al;
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
};

// Rand eines Rings (Öffnung, Schnitt, Front)
const ringPath = (cam: Cam, map: (q: V3) => V3, x: number, r: number): V2[] =>
  Array.from({length: 48}, (_, k) => {
    const w = (k / 48) * Math.PI * 2;
    return cam.p(map([x, r * Math.cos(w), r * Math.sin(w)]));
  });

const glowStroke = (ctx: Ctx, pts: V2[], color: string, a: number, w: number, closed = true) => {
  if (a <= 0) return;
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const [k, al] of [[3.2, 0.14], [1.8, 0.28], [1, 0.95]]) {
    ctx.globalAlpha = a * al;
    ctx.strokeStyle = color;
    ctx.lineWidth = w * k;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    if (closed) ctx.closePath();
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
};

/* ---------- Kurve und Achse (2D-Ansicht vor der Rotation) ---------- */

const curveAndAxis = (ctx: Ctx, cam: Cam, t: number, gap: number) => {
  const ax = axisVis(t);
  if (ax > 0) {
    ctx.globalAlpha = ax * 0.75;
    ctx.strokeStyle = C.vec;
    ctx.lineWidth = 2.5;
    line(ctx, cam.p([-0.2, 0, 0]), cam.p([40, 0, 0]));
    // Marken bei 1, 2, 4, 8 (mit der Lücke der Stücke)
    for (const x of [1, 2, 4, 8]) {
      const p = cam.p([x + shiftX(x, gap), 0, 0]);
      ctx.globalAlpha = ax * 0.9;
      ctx.lineWidth = 3;
      line(ctx, [p[0], p[1] - 10], [p[0], p[1] + 10]);
    }
  }
  const cv = curveVis(t);
  if (cv > 0) {
    // y = 1/x in der Ebene der Kamera, ab x = 1; bei der Rotation dreht sie mit
    const sw = sweepAt(t);
    const draw = Math.min(1, (t - (T.wie + 0.5)) / 1.1);
    const xEnd = Math.pow(2, 14 * clamp(draw));
    // vor der Rotation liegt die Kurve oben (z = 1/x), danach dreht sie mit der Fläche
    const up: V2[] = [];
    const ang = t < T.rotiert ? Math.PI / 2 : Math.PI / 2 + sw;
    for (let x = 1; x <= xEnd; x *= 1.03) up.push(cam.p([x, (1 / x) * Math.cos(ang), (1 / x) * Math.sin(ang)]));
    glowStroke(ctx, up, C.txt, cv, 4, false);
    // Lot von x = 1 auf die Achse
    ctx.globalAlpha = cv * 0.6;
    ctx.strokeStyle = C.txt;
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    line(ctx, cam.p([1, 0, 0]), cam.p([1, Math.cos(ang), Math.sin(ang)]));
    ctx.setLineDash([]);
  }
};

/* ---------- Querschnitte, Umfänge, Längen ---------- */

const discFill = (ctx: Ctx, cam: Cam, map: (q: V3) => V3, x: number, r: number, color: string, a: number) => {
  if (a <= 0) return;
  const pts = ringPath(cam, map, x, r);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = a * 0.5;
  ctx.fillStyle = color;
  poly(ctx, pts);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  glowStroke(ctx, pts, color, a, 3.5);
};

const lengthBar = (ctx: Ctx, cam: Cam, x0: number, x1: number, z: number, a: number) => {
  if (a <= 0) return;
  const p0 = cam.p([x0, 0, z]);
  const p1 = cam.p([x1, 0, z]);
  glowStroke(ctx, [p0, p1], C.txt, a * 0.9, 3, false);
  ctx.globalAlpha = a;
  ctx.strokeStyle = C.txt;
  ctx.lineWidth = 3;
  for (const p of [p0, p1]) line(ctx, [p[0], p[1] - 12], [p[0], p[1] + 12]);
};

// Farboberfläche in der Öffnung
const paintCap = (ctx: Ctx, cam: Cam, map: (q: V3) => V3, a: number) => {
  const pts = ringPath(cam, map, 1, 0.92);
  const c = cam.p(map([1, 0, 0]));
  const g = ctx.createRadialGradient(c[0], c[1] - 30, 0, c[0], c[1], Math.max(...pts.map((p) => Math.hypot(p[0] - c[0], p[1] - c[1]))));
  g.addColorStop(0, '#FFE3A1');
  g.addColorStop(0.6, C.eig);
  g.addColorStop(1, '#D9921C');
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = a * 0.95;
  ctx.fillStyle = g;
  poly(ctx, pts);
  ctx.fill();
  glowStroke(ctx, pts, C.eig, a, 3);
};

/* ---------- Abgerollte Haut ---------- */

const UTH = Array.from({length: 33}, (_, j) => -Math.PI + (j / 32) * Math.PI * 2);
const bandFaces = (cam: Cam, L: V3, i: number, b: number, m: number, gap: number) => {
  const {a} = BANDS[i];
  const faces: {pts: V2[]; depth: number; shade: number}[] = [];
  const xs = XS.filter((x) => x >= a - 1e-9 && x <= 2 * a + 1e-9);
  const sh = shiftX(a, gap);
  for (let k = 0; k < xs.length - 1; k++) {
    for (let j = 0; j < UTH.length - 1; j++) {
      const P = (x: number, th: number): V3 => {
        const q = unrollPoint(x, 1 / x, th, b);
        return slotPoint(i, [q[0] + sh * (1 - m), q[1], q[2]], m);
      };
      const q = [P(xs[k], UTH[j]), P(xs[k + 1], UTH[j]), P(xs[k + 1], UTH[j + 1]), P(xs[k], UTH[j + 1])];
      const ctr: V3 = [(q[0][0] + q[2][0]) / 2, (q[0][1] + q[2][1]) / 2, (q[0][2] + q[2][2]) / 2];
      const e1 = sub(q[1], q[0]);
      const e2 = sub(q[3], q[0]);
      const n = norm([e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]);
      const sd = Math.abs(dot3(n, L));
      faces.push({pts: q.map((p) => cam.p(p)), depth: cam.depth(ctr), shade: sd});
    }
  }
  return faces;
};

const drawBand = (ctx: Ctx, cam: Cam, L: V3, i: number, b: number, m: number, o: number, gap: number) => {
  if (o <= 0) return;
  const faces = bandFaces(cam, L, i, b, m, gap).sort((p, q) => q.depth - p.depth);
  for (const f of faces) {
    const col = mixRgb(CYAN.map((v) => v * 0.35), CYAN, 0.45 + 0.55 * f.shade);
    ctx.globalAlpha = o * 0.92;
    ctx.fillStyle = css(col, 1);
    ctx.strokeStyle = css(col, 1);
    ctx.lineWidth = 0.8;
    poly(ctx, f.pts);
    ctx.fill();
    ctx.stroke();
  }
  // Umriss des Streifens
  const {a} = BANDS[i];
  const sh = shiftX(a, gap);
  const P = (x: number, th: number): V2 => {
    const q = unrollPoint(x, 1 / x, th, b);
    return cam.p(slotPoint(i, [q[0] + sh * (1 - m), q[1], q[2]], m));
  };
  const xs = XS.filter((x) => x >= a - 1e-9 && x <= 2 * a + 1e-9);
  const outline: V2[] = [...xs.map((x) => P(x, Math.PI)), ...xs.slice().reverse().map((x) => P(x, -Math.PI))];
  glowStroke(ctx, outline, C.cyan, o * clamp(b * 2 - 1), 2.5);
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
    const {cam} = camAt(t);
    const L = lightOf(cam);
    const st = stageVis(t);
    const fl = floorVis(t) * st;
    const gap = cutGap(t);
    const map = (q: V3): V3 => [q[0] + shiftX(q[0], gap), q[1], q[2]];

    floor(ctx, cam, fl);
    floorShadow(ctx, cam, fl);
    dust(ctx, cam, t, st * 0.8);

    const ha = hornAlpha(t) * st;
    const sweep = sweepAt(t);
    const fX = fillX(t);
    const fA = fillAlpha(t) * st * (fX > 1.001 ? 1 : 0);
    const cX = coatX(t);
    const cA = coatAlpha(t);
    const glow = heroGlow(t);

    if (ha > 0.01) {
      const faces: Face[] = [];
      const lastX = hornFaces(cam, L, {map, xmax: 1e5, sweep, th0: t < T.rotiert ? 0 : Math.PI / 2}, 0, faces);
      const liquid: Face[] = [];
      if (fA > 0.01) hornFaces(cam, L, {map, xmax: fX, sweep: Math.PI * 2, rScale: 0.92}, 1, liquid);
      const backs = faces.filter((f) => f.back).sort((p, q) => q.depth - p.depth);
      const fronts = faces.filter((f) => !f.back).sort((p, q) => q.depth - p.depth);
      const tint = pieceVis(t);
      const frontA = lerp(0.86, 0.34, clamp(fA * 1.5));
      for (const f of backs) drawFace(ctx, f, ha, cX, cA, tint);
      if (liquid.length) {
        liquid.sort((p, q) => q.depth - p.depth);
        for (const f of liquid) if (!f.back) drawFace(ctx, f, fA * ha, cX, cA, tint);
        // Füllfront als leuchtender Ring
        if (fX < 3000) glowStroke(ctx, ringPath(cam, map, fX, 0.92 / fX), C.eig, fA * ha, 3);
      }
      for (const f of fronts) drawFace(ctx, f, ha * frontA, cX, cA, tint);
      // Öffnung bei x = 1 und Schnittkanten
      if (sweep >= Math.PI * 2 - 1e-6) {
        glowStroke(ctx, ringPath(cam, map, 1, 1), C.txt, ha * 0.55, 2);
        if (fA > 0.01) paintCap(ctx, cam, map, fA * ha);
      }
      const pv = pieceVis(t);
      for (const x of [2, 4, 8, 16]) {
        if (pv <= 0) break;
        glowStroke(ctx, ringPath(cam, map, x - 1e-6, 1 / x), C.txt, pv * ha * 0.6, 1.6);
        glowStroke(ctx, ringPath(cam, map, x + 1e-6, 1 / x), C.txt, pv * ha * 0.6, 1.6);
      }
      thread(ctx, cam, map, lastX, ha * (1 - 0.6 * pv), cA > 0.5 && cX > lastX ? C.cyan : '#C9CCF2');
      // Front des Anstrichs
      if (cA > 0.01 && cX < lastX) glowStroke(ctx, ringPath(cam, map, cX, 1 / cX), C.cyan, cA, 3);
      // Heldenaufnahme: Haut schimmert
      if (glow > 0) {
        for (let k = 0; k < 6; k++) {
          const x = Math.pow(2, ((t * 0.9 + k * 0.5) % 3) + 0.02);
          glowStroke(ctx, ringPath(cam, map, x, 1 / x), C.cyan, glow * 0.35 * Math.sin((((t * 0.9 + k * 0.5) % 3) / 3) * Math.PI), 2);
        }
      }
    }

    curveAndAxis(ctx, cam, t, gap);

    // Querschnitte (Volumen) und Umfänge (Haut)
    const dv = discVis(t) * st;
    discFill(ctx, cam, map, 1, 1, C.eig, dv);
    discFill(ctx, cam, map, 2 + 1e-6, 0.5, C.eig, dv * prog01(t, T.viertel - 0.1, 0.4));
    const ds = discSlide(t);
    if (ds > 0) discFill(ctx, cam, map, lerp(2 + 1e-6, 1 - 1e-3, ds), 0.5, '#FFE3A1', dv);
    const rv = ringVis(t) * st;
    glowStroke(ctx, ringPath(cam, map, 1, 1), C.cyan, rv, 3.5);
    glowStroke(ctx, ringPath(cam, map, 2 + 1e-6, 0.5), C.cyan, rv, 3.5);
    // Längen 1 und 2 unter den Stücken
    const lv = Math.max(lenVis1(t), lenVis2(t)) * st;
    lengthBar(ctx, cam, 1 + 0.04, 2 - 0.04, -1.15, lv);
    lengthBar(ctx, cam, 2 + shiftX(2.5, gap) + 0.04, 4 + shiftX(2.5, gap) - 0.04, -1.15, lv);

    // Streck-Kopien
    for (const c of copies(t)) drawCopy(ctx, cam, L, c, gap, st, t);

    // abgerollte Haut
    for (let i = 0; i < BANDS.length; i++) {
      const u = unroll(t, i);
      drawBand(ctx, cam, L, i, u.b, u.m, u.o * st, gap);
    }

    ctx.globalAlpha = 1;
  }, [t]);

  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};

const prog01 = (t: number, at: number, d: number) => clamp((t - at) / d);

const drawCopy = (ctx: Ctx, cam: Cam, L: V3, c: CopyState, gap: number, st: number, t: number) => {
  if (c.o <= 0.01) return;
  const map = (q: V3) => copyPoint(c, gap, q);
  const nmap = (n: V3): V3 => [n[0] / c.sx, n[1] / c.sr, n[2] / c.sr];
  const faces: Face[] = [];
  hornFaces(cam, L, {map, nmap, xmax: 2 * c.a, sweep: Math.PI * 2, pieces: [c.a, 2 * c.a]}, 0, faces);
  const lock = bump(t, c.lock, 0.7);
  faces.sort((p, q) => q.depth - p.depth);
  ctx.globalCompositeOperation = 'lighter';
  for (const f of faces) {
    if (f.back) continue;
    const col = mixRgb(CYAN.map((v) => v * 0.25), [205, 245, 255], 0.2 + 0.8 * f.shade);
    ctx.globalAlpha = c.o * st * (0.32 + 0.4 * lock);
    ctx.fillStyle = css(col, 1);
    poly(ctx, f.pts);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  // Umriss: Silhouette oben und unten plus Endringe
  const top: V2[] = [];
  const bot: V2[] = [];
  for (let x = c.a; x <= 2 * c.a + 1e-9; x += c.a / 24) {
    const r = 1 / x;
    top.push(cam.p(map([x, 0, r])));
    bot.push(cam.p(map([x, 0, -r])));
  }
  const a = c.o * st * (0.85 + 0.15 * lock);
  glowStroke(ctx, top, '#DDF8FF', a, 2.6 + 2 * lock, false);
  glowStroke(ctx, bot, '#DDF8FF', a, 2.6 + 2 * lock, false);
  glowStroke(ctx, ringPath(cam, map, c.a, 1 / c.a), '#DDF8FF', a, 2.2);
  glowStroke(ctx, ringPath(cam, map, 2 * c.a, 1 / (2 * c.a)), '#DDF8FF', a, 2.2);
};

export {rgba};
