import React, {useLayoutEffect, useRef} from 'react';
import {C, H, W} from '../theme';
import {V2, bump, clamp, lerp} from '../math';
import {V3} from '../space';
import {useSec} from '../ui';
import {ANGLE, AXIS, Letter, X0, branchOf, orbitPoint, rotAxis, words} from './group';
import {
  Cam,
  DUST,
  LEFT,
  OTHER_STARTS,
  RIGHT,
  TREE_C,
  camAt,
  choicePulse,
  dustAlpha,
  dustPos,
  arrowVis,
  axisVis,
  backVis,
  demo,
  floorVis,
  goldBall,
  growOf,
  INSET_C,
  insetScreen,
  insetVis,
  sortFlash,
  sortTint,
  oneBall,
  orbitGrow,
  orbitLock,
  orbitMain,
  orbitOthers,
  orbitRot,
  otherBranches,
  radiusMarks,
  sphereGlass,
  stageVis,
  startVis,
  TREE_L,
  treeScreen,
  treeVis,
  treeWordScreen,
  twoBallsBuild,
  twoBallsHook,
} from './world';
import {treePos} from './group';
import {T} from './timeline';

type Ctx = CanvasRenderingContext2D;

// Farben der fünf Teile: a, a⁻¹, b, b⁻¹, Rest
export const PART = ['#FFC247', '#FF7A5C', '#00C8C8', '#B7A6FF', '#F3F4FB'];
export const PART_OF: Record<Letter | '', string> = {a: PART[0], A: PART[1], b: PART[2], B: PART[3], '': PART[4]};

const line = (ctx: Ctx, a: V2, b: V2) => {
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
};

/* ---------- Boden ---------- */

const FZ = -1.4;
const floor = (ctx: Ctx, cam: Cam, a: number) => {
  if (a <= 0.01) return;
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = C.vec;
  ctx.lineWidth = 1.1;
  const fade = (x: number, y: number) => clamp(1 - Math.hypot(x / 6.5, y / 5));
  for (let x = -7; x <= 7; x++)
    for (let y = -6; y < 6; y++) {
      const f = fade(x, y + 0.5);
      if (f <= 0) continue;
      ctx.globalAlpha = a * 0.22 * f;
      line(ctx, cam.p([x, y, FZ]), cam.p([x, y + 1, FZ]));
    }
  for (let y = -6; y <= 6; y++)
    for (let x = -7; x < 7; x++) {
      const f = fade(x + 0.5, y);
      if (f <= 0) continue;
      ctx.globalAlpha = a * 0.22 * f;
      line(ctx, cam.p([x, y, FZ]), cam.p([x + 1, y, FZ]));
    }
  ctx.globalCompositeOperation = 'source-over';
};

// weicher Schatten unter einer Kugel
const ballShadow = (ctx: Ctx, cam: Cam, c: V3, a: number) => {
  if (a <= 0.01) return;
  const o = cam.p([c[0], c[1], FZ]);
  const px = cam.p([c[0] + 1, c[1], FZ]);
  const py = cam.p([c[0], c[1] + 1, FZ]);
  ctx.save();
  ctx.globalAlpha = a * 0.55;
  ctx.transform(px[0] - o[0], px[1] - o[1], py[0] - o[0], py[1] - o[1], o[0], o[1]);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1.25);
  g.addColorStop(0, 'rgba(2,2,14,.9)');
  g.addColorStop(1, 'rgba(2,2,14,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, 1.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

/* ---------- Kugel: Glas oder Gold, Licht von links oben ---------- */

type BallStyle = 'glass' | 'solid' | 'gold';
const ball = (ctx: Ctx, cam: Cam, c: V3, a: number, style: BallStyle, t: number) => {
  if (a <= 0.01) return;
  const [x, y] = cam.p(c);
  const R = cam.scale(c);
  const hx = x - 0.38 * R;
  const hy = y - 0.42 * R;
  const pal =
    style === 'gold'
      ? ['#FFF1C9', '#FFC247', '#B9741A', '#3A1F05']
      : style === 'solid'
        ? ['#F4F4FF', '#A9ABEA', '#4B4DA8', '#12123A']
        : ['#E9EAFF', '#8F92DD', '#2E2F7A', '#0B0B2A'];
  const g = ctx.createRadialGradient(hx, hy, 0, x, y, R * 1.05);
  g.addColorStop(0, pal[0]);
  g.addColorStop(0.28, pal[1]);
  g.addColorStop(0.75, pal[2]);
  g.addColorStop(1, pal[3]);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = a * (style === 'glass' ? 0.34 : 0.97);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fill();
  // Randlicht
  const rim = ctx.createRadialGradient(x, y, R * 0.7, x, y, R * 1.02);
  rim.addColorStop(0, 'rgba(0,200,200,0)');
  rim.addColorStop(1, style === 'gold' ? 'rgba(255,214,140,.55)' : 'rgba(120,230,255,.5)');
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = a;
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fill();
  // Glanzpunkt
  const s = ctx.createRadialGradient(hx, hy, 0, hx, hy, R * 0.32);
  s.addColorStop(0, 'rgba(255,255,255,.85)');
  s.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.globalAlpha = a * (style === 'glass' ? 0.35 : 0.8);
  ctx.fillStyle = s;
  ctx.beginPath();
  ctx.arc(hx, hy, R * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = style === 'gold' ? '#FFD98A' : '#C9F4FF';
  ctx.lineWidth = 2;
  ctx.globalAlpha = a * 0.55;
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  // Gold: Atome als feines Raster auf der Oberfläche
  if (style === 'gold') {
    ctx.fillStyle = 'rgba(255,236,190,.9)';
    const n = 26;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n * 2; j++) {
        const th = ((i + 0.5) / n) * Math.PI;
        const ph = (j / (n * 2)) * Math.PI * 2 + t * 0.15;
        const q: V3 = [c[0] + Math.sin(th) * Math.cos(ph), c[1] + Math.sin(th) * Math.sin(ph), c[2] + Math.cos(th)];
        const v = [q[0] - c[0], q[1] - c[1], q[2] - c[2]];
        const facing = v[0] * (cam.pos[0] - q[0]) + v[1] * (cam.pos[1] - q[1]) + v[2] * (cam.pos[2] - q[2]);
        if (facing <= 0) continue;
        const p = cam.p(q);
        ctx.globalAlpha = a * 0.35;
        ctx.beginPath();
        ctx.arc(p[0], p[1], 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
  }
};

/* ---------- Staub ---------- */

const hexRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const tint = (from: string, to: string, k: number) => {
  if (k >= 1) return to;
  const a = hexRgb(from);
  const b = hexRgb(to);
  return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',')})`;
};

const dust = (ctx: Ctx, cam: Cam, t: number, st: number) => {
  const pts: {p: V2; d: number; a: number; col: string; r: number}[] = [];
  for (const d of DUST) {
    const a = dustAlpha(d, t) * st;
    if (a <= 0.01) continue;
    const q = dustPos(d, t);
    const dep = cam.depth(q);
    if (dep < 0.4) continue;
    const f = sortFlash(d.k, t);
    pts.push({p: cam.p(q), d: dep, a: Math.min(1, a * (1 + 0.6 * f)), col: tint(PART[4], PART[d.k], sortTint(d.k, t)), r: Math.min(5.5, 0.019 * cam.scale(q)) * (1 + 0.35 * f)});
  }
  if (!pts.length) return;
  pts.sort((x, y) => y.d - x.d);
  const dmin = Math.min(...pts.map((p) => p.d));
  const dmax = Math.max(...pts.map((p) => p.d));
  for (const p of pts) {
    const near = 1 - (p.d - dmin) / Math.max(1e-3, dmax - dmin);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = p.a * 0.07;
    ctx.fillStyle = p.col;
    ctx.beginPath();
    ctx.arc(p.p[0], p.p[1], p.r * 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = p.a * (0.45 + 0.55 * near);
    ctx.beginPath();
    ctx.arc(p.p[0], p.p[1], p.r, 0, Math.PI * 2);
    ctx.fill();
  }
};

/* ---------- Baum ---------- */

const TREE_WORDS = words(7).slice(1);
const glowLine = (ctx: Ctx, a: V2, b: V2, col: string, w: number, al: number) => {
  if (al <= 0.005) return;
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = col;
  ctx.lineCap = 'round';
  ctx.globalAlpha = al * 0.22;
  ctx.lineWidth = w * 3;
  line(ctx, a, b);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = al;
  ctx.lineWidth = w;
  line(ctx, a, b);
};
const arrowHead = (ctx: Ctx, tip: V2, dir: V2, col: string, size: number, al: number) => {
  if (al <= 0.01) return;
  const [dx, dy] = dir;
  ctx.globalAlpha = al;
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(tip[0] + dx * size, tip[1] + dy * size);
  ctx.lineTo(tip[0] - dy * size * 0.62, tip[1] + dx * size * 0.62);
  ctx.lineTo(tip[0] + dy * size * 0.62, tip[1] - dx * size * 0.62);
  ctx.closePath();
  ctx.fill();
};
const SCREEN_DIR: Record<Letter, V2> = {a: [1, 0], A: [-1, 0], b: [0, -1], B: [0, 1]};

const tree = (ctx: Ctx, t: number, st: number) => {
  const vis = treeVis(t) * st;
  if (vis <= 0.01) return;
  const others = otherBranches(t);
  for (const w of TREE_WORDS) {
    const grow = growOf(w, t);
    if (grow <= 0) continue;
    const k = w.length;
    const br = branchOf(w);
    const p0 = treeScreen(treePos(w.slice(0, -1)), br, t);
    const p1full = treeScreen(treePos(w), br, t);
    const p1: V2 = [lerp(p0[0], p1full[0], grow), lerp(p0[1], p1full[1], grow)];
    const pulse = br === 'a' ? bump(t, T.ohneRechts + 0.2, 1.0) : 0;
    const dim = br === 'b' || br === 'B' ? others : 1;
    glowLine(ctx, p0, p1, PART_OF[br], Math.max(1.2, 6.5 * Math.pow(0.7, k - 1)) * (1 + 0.6 * pulse), vis * dim);
    if (k <= 3 && grow >= 1) {
      ctx.globalAlpha = vis * dim;
      ctx.fillStyle = PART_OF[br];
      ctx.beginPath();
      ctx.arc(p1[0], p1[1], 6 * Math.pow(0.7, k - 1), 0, Math.PI * 2);
      ctx.fill();
    }
    // Pfeilspitze genau auf der Achse am Ende der ersten vier Schritte
    if (k === 1) arrowHead(ctx, p1, SCREEN_DIR[w as Letter], PART_OF[br], 22, vis * arrowVis(t) * clamp(grow * 3 - 2));
  }
  // „nie zurück“: Rückweg am rechten Ende, durchgestrichen
  const bv = backVis(t) * vis;
  if (bv > 0.01) {
    const tip = treeScreen([1, 0], 'a', t);
    const y = tip[1] - 46;
    const x0 = tip[0] - 12;
    const x1 = tip[0] - 0.66 * TREE_L;
    ctx.globalAlpha = bv * 0.95;
    ctx.strokeStyle = '#C9CCF2';
    ctx.lineWidth = 5;
    ctx.setLineDash([14, 10]);
    line(ctx, [x0, y], [x1 + 20, y]);
    ctx.setLineDash([]);
    arrowHead(ctx, [x1 + 20, y], [-1, 0], '#C9CCF2', 24, bv * 0.95);
    const mx = (x0 + x1) / 2;
    ctx.strokeStyle = PART[1];
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    line(ctx, [mx - 24, y - 24], [mx + 24, y + 24]);
    line(ctx, [mx - 24, y + 24], [mx + 24, y - 24]);
  }
  // Mitte (leeres Wort)
  const c = treeWordScreen('', t);
  ctx.globalAlpha = vis * growOf('', t) * (1 - clamp((t - T.zusammen) / 0.6));
  ctx.fillStyle = PART[4];
  ctx.beginPath();
  ctx.arc(c[0], c[1], 11, 0, Math.PI * 2);
  ctx.fill();
  // Einrasten des verschobenen Asts
  const lock = Math.max(bump(t, T.ganzer + 0.05, 0.8), bump(t, T.genauso + 0.6, 0.8));
  if (lock > 0) {
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(TREE_C[0], TREE_C[1], 0, TREE_C[0], TREE_C[1], 520);
    g.addColorStop(0, 'rgba(255,255,255,.18)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = lock * vis;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }
};

// kleiner Baum neben der Kugel: zeigt, welcher Schritt gerade passiert
const INSET_WORDS = words(5).slice(1);
const insetTree = (ctx: Ctx, t: number, st: number) => {
  const vis = insetVis(t) * st;
  if (vis <= 0.01) return;
  const d = demo(t);
  const g = orbitGrow(t);
  const rot = orbitRot(t);
  const focus = clamp((t - (T.verschieben - 0.2)) / 0.4) * (1 - clamp((t - T.jederPunkt) / 0.5));
  // Rahmen
  ctx.globalAlpha = vis * 0.5;
  ctx.fillStyle = 'rgba(7,8,26,.65)';
  ctx.strokeStyle = 'rgba(166,173,211,.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(INSET_C[0] - 150, INSET_C[1] - 150, 300, 300, 22);
  ctx.fill();
  ctx.stroke();
  for (const w of INSET_WORDS) {
    const k = w.length;
    const br = branchOf(w);
    // Ebene 1 leuchtet mit ihrer Drehung auf, tiefere Ebenen mit der Bahn
    const on = k === 1 ? d[w as Letter] : clamp(g - (k - 1));
    let al = 0.25 + 0.75 * on;
    if (br === 'b' || br === 'B') al *= 1 - 0.85 * focus;
    if (br === 'A') al = Math.max(al, focus);
    const p0 = insetScreen(w.slice(0, -1), t);
    const p1 = insetScreen(w, t);
    glowLine(ctx, p0, p1, PART_OF[br], Math.max(1, 3.4 * Math.pow(0.72, k - 1)), vis * al);
  }
  const c = insetScreen('', t);
  ctx.globalAlpha = vis;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(c[0], c[1], 5, 0, Math.PI * 2);
  ctx.fill();
  void rot;
};

/* ---------- Bahn auf der Kugel ---------- */

const ORBIT = words(3);
const SMALL = words(2);
const arc = (ctx: Ctx, cam: Cam, p: V3, q: V3, col: string, a: number, w: number) => {
  const pts: V3[] = [];
  for (let i = 0; i <= 12; i++) {
    const s = i / 12;
    const v: V3 = [lerp(p[0], q[0], s), lerp(p[1], q[1], s), lerp(p[2], q[2], s)];
    const l = Math.hypot(...v) || 1;
    pts.push([v[0] / l, v[1] / l, v[2] / l]);
  }
  pathOnSphere(ctx, cam, pts, col, a, w);
};
// Linie auf der Kugeloberfläche, Rückseite blass
const pathOnSphere = (ctx: Ctx, cam: Cam, pts: V3[], col: string, a: number, w: number) => {
  if (a <= 0.01 || pts.length < 2) return;
  ctx.strokeStyle = col;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  for (let i = 0; i < pts.length - 1; i++) {
    const m: V3 = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2, (pts[i][2] + pts[i + 1][2]) / 2];
    const front = m[0] * cam.fw[0] + m[1] * cam.fw[1] + m[2] * cam.fw[2] > 0;
    ctx.globalAlpha = a * (front ? 1 : 0.28);
    line(ctx, cam.p(sc(pts[i], 1.004)), cam.p(sc(pts[i + 1], 1.004)));
  }
};
const sc = (v: V3, k: number): V3 => [v[0] * k, v[1] * k, v[2] * k];
const dot = (ctx: Ctx, cam: Cam, p: V3, col: string, a: number, r: number) => {
  if (a <= 0.01) return;
  const front = p[0] * cam.fw[0] + p[1] * cam.fw[1] + p[2] * cam.fw[2] > 0;
  const s = cam.p(p);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = a * (front ? 0.3 : 0.1);
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(s[0], s[1], r * 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = a * (front ? 1 : 0.35);
  ctx.beginPath();
  ctx.arc(s[0], s[1], r, 0, Math.PI * 2);
  ctx.fill();
};
// Weg eines Punkts bei einer Drehung um die Achse k (Kleinkreis), Anteil f des Winkels
const rotPath = (k: V3, sign: number, x: V3, f: number): V3[] => Array.from({length: 25}, (_, i) => rotAxis(k, sign * ANGLE * f * (i / 24), x));

const orbit = (ctx: Ctx, cam: Cam, t: number, st: number) => {
  const a = orbitMain(t) * st;
  const g = orbitGrow(t);
  const rot = orbitRot(t);
  const d = demo(t);
  const ax = axisVis(t);
  if (a > 0.01) {
    // die beiden Drehachsen
    if (ax.a > 0.01) {
      ctx.globalAlpha = ax.a * st * 0.85;
      ctx.strokeStyle = PART[0];
      ctx.lineWidth = 3.5;
      ctx.setLineDash([14, 10]);
      line(ctx, cam.p([-1.6, 0, 0]), cam.p([1.6, 0, 0]));
      ctx.setLineDash([]);
    }
    if (ax.b > 0.01) {
      ctx.globalAlpha = ax.b * st * 0.85;
      ctx.strokeStyle = PART[2];
      ctx.lineWidth = 3.5;
      ctx.setLineDash([14, 10]);
      line(ctx, cam.p([0, 0, -1.6]), cam.p([0, 0, 1.6]));
      ctx.setLineDash([]);
    }
    // während der Drehung steht nur der a⁻¹-Ast im Vordergrund
    const focus = clamp((t - (T.verschieben - 0.2)) / 0.4) * (1 - clamp((t - T.jederPunkt) / 0.5));
    const pos = (w: string): V3 => {
      const p = orbitPoint(w, X0);
      return w[0] === 'A' ? rotAxis(AXIS.a, ANGLE * rot, p) : p;
    };
    // Ebene 1: der echte Drehweg vom Startpunkt
    const L1: [Letter, V3, number][] = [
      ['a', AXIS.a, 1],
      ['A', AXIS.a, -1],
      ['b', AXIS.b, 1],
      ['B', AXIS.b, -1],
    ];
    for (const [ch, k, sign] of L1) {
      const f = d[ch];
      if (f <= 0) continue;
      const al = ch === 'A' ? 1 + focus : 1 - 0.65 * focus;
      let path = rotPath(k, sign, X0, f);
      if (ch === 'A' && rot > 0) path = path.map((p) => rotAxis(AXIS.a, ANGLE * rot, p));
      pathOnSphere(ctx, cam, path, PART_OF[ch], a * Math.min(1, al), 5);
      // wandernder Punkt
      dot(ctx, cam, path[path.length - 1], PART_OF[ch], a * Math.min(1, al), f < 1 ? 11 : 8);
    }
    for (const w of ORBIT) {
      if (w.length < 2) continue;
      const grow = clamp(g - (w.length - 1));
      if (grow <= 0) continue;
      const br = branchOf(w);
      const f = br === 'A' ? 1 + focus : 1 - 0.65 * focus;
      arc(ctx, cam, pos(w.slice(0, -1)), pos(w), PART_OF[br], a * grow * 0.9 * Math.min(1, f), Math.max(2.2, 5.6 - 1.1 * w.length) * (br === 'A' ? 1 + 0.4 * focus : 1));
    }
    for (const w of ORBIT) {
      if (w.length < 2) continue;
      const grow = clamp(g - (w.length - 1) - 0.4);
      if (grow <= 0) continue;
      const f = branchOf(w) === 'A' ? 1 : 1 - 0.5 * focus;
      dot(ctx, cam, pos(w), PART_OF[branchOf(w)], a * grow * f, Math.max(4, 10 - 2 * w.length));
    }
    // Startpunkt
    dot(ctx, cam, X0, '#FFFFFF', a * startVis(t), 12);
    // Einrasten: die gedrehten Punkte treffen genau vorhandene Bahnpunkte
    const lock = bump(t, orbitLock(), 0.8);
    if (lock > 0)
      for (const w of ORBIT.filter((v) => v[0] === 'A')) {
        const s = cam.p(pos(w));
        ctx.globalAlpha = lock * a;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(s[0], s[1], 10 + 14 * (1 - lock), 0, Math.PI * 2);
        ctx.stroke();
      }
  }
  // weitere Bahnen: unendlich viele, jede ein eigener Baum
  const o = orbitOthers(t) * st;
  if (o > 0.01) {
    OTHER_STARTS.forEach((x, i) => {
      const col = ['#DCDDF5', '#B7A6FF', '#9FE8E8', '#FFD9A0', '#FFB4A0', '#C9CCF2'][i];
      for (const w of SMALL) {
        if (!w) continue;
        arc(ctx, cam, orbitPoint(w.slice(0, -1), x), orbitPoint(w, x), col, o * 0.55, 1.6);
      }
      for (const w of SMALL) if (w) dot(ctx, cam, orbitPoint(w, x), col, o * 0.6, 2.6);
      const cp = choicePulse(t);
      dot(ctx, cam, x, '#FFFFFF', o * (0.5 + 0.5 * cp), 5 + 4 * cp);
      if (cp > 0) {
        const s = cam.p(x);
        const ring = (t * 1.3 + i * 0.17) % 1;
        ctx.globalAlpha = cp * o * (1 - ring);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s[0], s[1], 8 + 26 * ring, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    const cp = choicePulse(t);
    if (cp > 0) {
      const s = cam.p(X0);
      const ring = (t * 1.3) % 1;
      ctx.globalAlpha = cp * o * (1 - ring);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(s[0], s[1], 10 + 26 * ring, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
};

/* ---------- Radius-Marken ---------- */

const radius = (ctx: Ctx, cam: Cam, c: V3, a: number) => {
  if (a <= 0.01) return;
  const p0 = cam.p(c);
  const p1 = cam.p([c[0], c[1], c[2] + 1]);
  ctx.globalAlpha = a;
  ctx.strokeStyle = C.txt;
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  line(ctx, p0, p1);
  ctx.setLineDash([]);
  ctx.fillStyle = C.txt;
  ctx.beginPath();
  ctx.arc(p0[0], p0[1], 5, 0, Math.PI * 2);
  ctx.fill();
};

/* ---------- Szene ---------- */

export const Scene: React.FC = () => {
  const t = useSec();
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    const {cam} = camAt(t);
    const st = stageVis(t);
    const fl = floorVis(t) * st;
    floor(ctx, cam, fl);

    const b1 = oneBall(t) * st;
    const b2 = twoBallsHook(t) * st;
    const b3 = twoBallsBuild(t) * st;
    const gl = sphereGlass(t) * st;
    const gold = goldBall(t) * st;
    ballShadow(ctx, cam, [0, 0, 0], Math.max(b1, gl, gold) * fl);
    ballShadow(ctx, cam, LEFT, Math.max(b2, b3) * fl);
    ballShadow(ctx, cam, RIGHT, Math.max(b2, b3) * fl);

    ball(ctx, cam, [0, 0, 0], b1, 'solid', t);
    ball(ctx, cam, [0, 0, 0], gl, 'glass', t);
    orbit(ctx, cam, t, st);
    // Drehachsen beim Zusammensetzen: a⁻¹-Staub dreht um die x-Achse, b⁻¹-Staub um die z-Achse
    const axA = clamp((t - T.drehen) / 0.3) * (1 - clamp((t - T.zweiK) / 0.4)) * st;
    if (axA > 0.01) {
      const m = clamp((t - T.drehen) / (T.zweiK - T.drehen));
      const cl: V3 = [LEFT[0] * m, 0, 0];
      const cr: V3 = [RIGHT[0] * m, 0, 0];
      ctx.globalAlpha = axA * 0.9;
      ctx.lineWidth = 3;
      ctx.setLineDash([14, 10]);
      ctx.strokeStyle = PART[1];
      line(ctx, cam.p([cl[0] - 1.45, 0, 0]), cam.p([cl[0] + 1.45, 0, 0]));
      ctx.strokeStyle = PART[3];
      line(ctx, cam.p([cr[0], 0, -1.45]), cam.p([cr[0], 0, 1.45]));
      ctx.setLineDash([]);
    }
    dust(ctx, cam, t, st);
    for (const c of [LEFT, RIGHT]) {
      ball(ctx, cam, c, b2, 'solid', t);
      ball(ctx, cam, c, b3, 'solid', t);
      radius(ctx, cam, c, radiusMarks(t) * st);
    }
    ball(ctx, cam, [0, 0, 0], gold, 'gold', t);
    tree(ctx, t, st);
    insetTree(ctx, t, st);
    ctx.globalAlpha = 1;
  }, [t]);

  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};
