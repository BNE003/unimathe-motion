import React, {useLayoutEffect, useRef} from 'react';
import {C, H, W} from '../theme';
import {V2, bump, clamp, prog} from '../math';
import {V3} from '../space';
import {useSec} from '../ui';
import {
  ARMS_OUTLINE,
  CELLS,
  Cam,
  F_FACES,
  F_OUTLINE,
  F_POS,
  M3,
  SPINE_OUTLINE,
  ap2,
  ap3,
  backP,
  camOf,
  cellQuad,
  fRot,
  sheetAlpha,
  sheetCam,
  sheetM,
  sheetMask,
  spaceMap,
  worldCam,
} from './world';
import {T} from './timeline';

type Ctx = CanvasRenderingContext2D;

export const COL = {
  front: C.blue,
  back: C.eig,
  side: '#4636C8',
  e1: C.eig,
  e2: C.cyan,
  A: '#9D8CFF',
  B: C.lam,
};

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const shadeCol = (h: string, k: number) => `rgb(${rgb(h).map((v) => Math.round(Math.min(255, v * k))).join(',')})`;
const LIGHT: V3 = (() => {
  const l: V3 = [0.3, -0.55, 0.78];
  const n = Math.hypot(...l);
  return [l[0] / n, l[1] / n, l[2] / n];
})();

const line = (ctx: Ctx, a: V2, b: V2) => {
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
};

export const arrow = (ctx: Ctx, a: V2, b: V2, color: string, width: number, alpha: number) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const L = Math.hypot(dx, dy);
  if (L < 2 || alpha <= 0) return;
  const ux = dx / L;
  const uy = dy / L;
  const head = Math.min(30, L * 0.45);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  line(ctx, a, [b[0] - ux * head * 0.8, b[1] - uy * head * 0.8]);
  ctx.beginPath();
  ctx.moveTo(b[0], b[1]);
  ctx.lineTo(b[0] - ux * head - uy * head * 0.45, b[1] - uy * head + ux * head * 0.45);
  ctx.lineTo(b[0] - ux * head + uy * head * 0.45, b[1] - uy * head - ux * head * 0.45);
  ctx.closePath();
  ctx.fill();
};

/* ---------- 3D-Welt: Boden, Raumgitter, die beiden Fs ---------- */

const floorGrid = (ctx: Ctx, cam: Cam, G: M3, alpha: number) => {
  if (alpha <= 0) return;
  ctx.strokeStyle = C.vec;
  ctx.lineWidth = 1.3;
  const R = 12;
  for (let k = -R; k <= R; k++) {
    for (let s = -R; s < R; s++) {
      for (const [p, q] of [
        [[k, s, 0], [k, s + 1, 0]],
        [[s, k, 0], [s + 1, k, 0]],
      ] as [V3, V3][]) {
        const mx = (p[0] + q[0]) / 2;
        const my = (p[1] + q[1]) / 2;
        const fade = clamp(1 - Math.hypot(mx, my) / R);
        if (fade <= 0) continue;
        ctx.globalAlpha = alpha * 0.32 * fade * fade;
        line(ctx, cam.p(ap3(G, p)), cam.p(ap3(G, q)));
      }
    }
  }
};

const camScale = (cam: Cam, q: V3) => 16 / Math.max(4, cam.depth(q));

const LATTICE: V3[] = [];
for (let x = -6; x <= 6; x += 2) for (let y = -4; y <= 4; y += 2) for (let z = 0; z <= 6; z += 2) LATTICE.push([x, y, z]);

const lattice = (ctx: Ctx, cam: Cam, G: M3, alpha: number) => {
  if (alpha <= 0) return;
  ctx.fillStyle = C.txt;
  for (const q of LATTICE) {
    const s = cam.p(ap3(G, q));
    const r = 5.5 * camScale(cam, q);
    ctx.globalAlpha = alpha * 0.12;
    ctx.beginPath();
    ctx.arc(s[0], s[1], r * 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = alpha * 0.75;
    ctx.beginPath();
    ctx.arc(s[0], s[1], r * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  // senkrechte Gitterlinien machen den Raum (nicht nur den Boden) sichtbar
  ctx.strokeStyle = C.vec;
  ctx.lineWidth = 1.1;
  for (let x = -6; x <= 6; x += 2) {
    for (let y = -4; y <= 4; y += 2) {
      ctx.globalAlpha = alpha * 0.14;
      line(ctx, cam.p(ap3(G, [x, y, 0])), cam.p(ap3(G, [x, y, 6])));
    }
  }
};

type Poly = {pts: V2[]; depth: number; fill: string; edge: number};

const fPolys = (cam: Cam, k: number, t: number, G: M3, scale: number): Poly[] => {
  const R = fRot(k, t);
  const pos = F_POS[k];
  const out: Poly[] = [];
  for (const f of F_FACES) {
    const n = ap3(R, f.n);
    const ws = f.v.map((v) => {
      const r = ap3(R, [v[0] * scale, v[1] * scale, v[2] * scale]);
      return ap3(G, [pos[0] + r[0], pos[1] + r[1], pos[2] + r[2]]);
    });
    const c: V3 = [0, 1, 2].map((j) => ws.reduce((s, w) => s + w[j], 0) / 4) as V3;
    const toEye: V3 = [cam.eye[0] - c[0], cam.eye[1] - c[1], cam.eye[2] - c[2]];
    if (n[0] * toEye[0] + n[1] * toEye[1] + n[2] * toEye[2] <= 0) continue;
    const lit = 0.52 + 0.56 * Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
    const base = f.kind === 'front' ? COL.front : f.kind === 'back' ? COL.back : COL.side;
    out.push({pts: ws.map(cam.p), depth: cam.depth(c), fill: shadeCol(base, lit), edge: f.kind === 'side' ? 0.22 : 0.4});
  }
  return out;
};

const drawPolys = (ctx: Ctx, polys: Poly[], alpha: number) => {
  polys.sort((a, b) => b.depth - a.depth);
  ctx.lineJoin = 'round';
  for (const p of polys) {
    ctx.beginPath();
    p.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.fill;
    ctx.fill();
    ctx.globalAlpha = alpha * p.edge;
    ctx.strokeStyle = C.txt;
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
};

// leuchtende Drehachse mit Bogenpfeil während einer Bewegung
const axisGlow = (ctx: Ctx, cam: Cam, pivot: V3, axis: 'x' | 'z', at: number, t: number) => {
  const a = bump(t, at - 0.15, MOVE_SHOW);
  if (a <= 0) return;
  const d: V3 = axis === 'x' ? [1, 0, 0] : [0, 0, 1];
  const L = 3.6;
  const p0 = cam.p([pivot[0] - d[0] * L, pivot[1] - d[1] * L, pivot[2] - d[2] * L]);
  const p1 = cam.p([pivot[0] + d[0] * L, pivot[1] + d[1] * L, pivot[2] + d[2] * L]);
  ctx.strokeStyle = C.txt;
  for (const [w, al] of [[16, 0.08], [6, 0.22], [2.2, 0.85]] as [number, number][]) {
    ctx.globalAlpha = a * al;
    ctx.lineWidth = w;
    line(ctx, p0, p1);
  }
  // Bogen: Kippen führt oben → vorne (0,0,r) → (0,−r,0); Drehen führt rechts → hinten (r,0,0) → (0,r,0)
  const ang = (Math.PI / 2) * prog(t, at, 0.9);
  const r = 3.2;
  const pt = (φ: number): V3 =>
    axis === 'x' ? [pivot[0] + L * 0.55, pivot[1] - r * Math.sin(φ), pivot[2] + r * Math.cos(φ)] : [pivot[0] + r * Math.cos(φ), pivot[1] + r * Math.sin(φ), pivot[2] - 2.7];
  const N = 28;
  const pts: V2[] = Array.from({length: N + 1}, (_, i) => cam.p(pt((ang * i) / N)));
  if (ang > 0.05) {
    ctx.strokeStyle = C.cyan;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.globalAlpha = a * 0.9;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    const b = pts[N];
    const c = pts[N - 3];
    arrow(ctx, c, b, C.cyan, 5, a * 0.9);
  }
};
const MOVE_SHOW = 1.35;

/* ---------- Ebene (Platten) ---------- */

type SheetOpts = {alpha: number; fAlpha: number; arrows: number; pull: number; hiArms: number; hiSpine: number};

const drawSheet = (ctx: Ctx, cam: Cam, M: [[number, number], [number, number]], o: SheetOpts, t: number) => {
  const P = (p: V2) => cam.p([...ap2(M, p), 0] as V3);
  const W3 = (p: V2) => cam.p([p[0], p[1], 0]);
  // Gitter: wird mit der Matrix mitbewegt
  const R = 12;
  ctx.lineWidth = 1.4;
  for (let k = -R; k <= R; k++) {
    for (const [p, q] of [
      [[k, -R], [k, R]],
      [[-R, k], [R, k]],
    ] as [V2, V2][]) {
      ctx.strokeStyle = k === 0 ? C.txt : C.vec;
      ctx.globalAlpha = o.alpha * (k === 0 ? 0.42 : 0.2);
      line(ctx, P(p), P(q));
    }
  }
  // Zuglinien von B: immer waagerecht in der Ebene, egal was vorher passiert ist
  if (o.pull > 0) {
    ctx.strokeStyle = C.lam;
    ctx.lineCap = 'round';
    ctx.lineWidth = 4;
    for (let r = -6; r <= 6; r++) {
      const y = r * 0.62;
      for (const sgn of [-1, 1]) {
        for (let k = 0; k < 2; k++) {
          const ph = (t * 0.9 + k * 0.5 + ((r * 0.37) % 1) + 1) % 1;
          const x = sgn * (0.4 + 7.5 * ph);
          ctx.globalAlpha = o.alpha * o.pull * 0.75 * Math.sin(Math.PI * ph);
          line(ctx, W3([x - sgn * 1.3, y]), W3([x, y]));
        }
      }
    }
  }
  // das F
  if (o.fAlpha > 0) {
    ctx.beginPath();
    for (const c of CELLS) {
      const q = cellQuad(c).map(P);
      q.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
    }
    ctx.globalAlpha = o.alpha * o.fAlpha * 0.88;
    ctx.fillStyle = COL.front;
    ctx.shadowColor = 'rgba(30,139,219,.9)';
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = C.txt;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.globalAlpha = o.alpha * o.fAlpha * 0.85;
    for (const [a, b] of F_OUTLINE) line(ctx, P(a), P(b));
  }
  // Teile des F, die gerade waagerecht liegen und gezogen wurden
  for (const [edges, h] of [
    [ARMS_OUTLINE, o.hiArms],
    [SPINE_OUTLINE, o.hiSpine],
  ] as [[V2, V2][], number][]) {
    if (h <= 0) continue;
    ctx.strokeStyle = C.lam;
    ctx.lineCap = 'round';
    for (const [w, al] of [[22, 0.18], [7, 0.95]] as [number, number][]) {
      ctx.lineWidth = w;
      ctx.globalAlpha = o.alpha * h * al;
      for (const [a, b] of edges) line(ctx, P(a), P(b));
    }
  }
  // Basispfeile e₁, e₂
  if (o.arrows > 0) {
    const O = P([0, 0]);
    ctx.shadowBlur = 18;
    ctx.shadowColor = 'rgba(7,8,26,.9)';
    arrow(ctx, O, P([1, 0]), COL.e1, 7, o.alpha * o.arrows);
    arrow(ctx, O, P([0, 1]), COL.e2, 7, o.alpha * o.arrows);
    ctx.shadowBlur = 0;
  }
};

/* ---------- Komponente ---------- */

const SUB = [2.5 / 120, 1.25 / 120];

export const Scene: React.FC = () => {
  const t = useSec();
  const ref = useRef<HTMLCanvasElement>(null);
  const off = useRef<HTMLCanvasElement | null>(null);

  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    const inBack = t >= T.bewegungen - 0.1;
    const cam = camOf(worldCam(t));
    const G = spaceMap(t);

    /* 3D-Welt: im Hook, beim Sturzflug ausblenden, am Ende zurück */
    const worldA = inBack ? backP(t) * (1 - prog(t, T.cta - 0.2, 0.6)) : 1 - prog(t, T.dive + 0.35, 0.6);
    const floorA = inBack ? 0.7 * worldA : 1 - prog(t, T.dive + 0.7, 0.6);
    if (worldA > 0 || floorA > 0) {
      ctx.globalCompositeOperation = 'lighter';
      floorGrid(ctx, cam, G, Math.max(0, floorA) * clamp(t / 0.8 + 0.25));
      const latA = (inBack ? 0 : prog(t, T.raum, 0.8)) * (1 - prog(t, T.dive, 0.5));
      lattice(ctx, cam, G, latA);
      // weicher Lichtfleck unter jedem F
      for (let k = 0; k < 2; k++) {
        const a = worldA * (k === 0 ? 1 : prog(t, T.anders - 0.1, 0.5));
        if (a <= 0) continue;
        const s = cam.p(ap3(G, [F_POS[k][0], F_POS[k][1], 0]));
        const rr = 3.0 * worldCam(t).u * camScale(cam, [F_POS[k][0], F_POS[k][1], 0]);
        const g = ctx.createRadialGradient(s[0], s[1], 0, s[0], s[1], rr);
        g.addColorStop(0, 'rgba(30,139,219,0.28)');
        g.addColorStop(1, 'rgba(30,139,219,0)');
        ctx.globalAlpha = a;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(s[0], s[1], rr, rr * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // die Fs: erst Bewegungsunschärfe (frühere Zeitproben schwach), dann das scharfe Bild
      const polysAt = (ts: number) => {
        const camS = camOf(worldCam(ts));
        const Gs = spaceMap(ts);
        const all: Poly[] = [];
        for (let k = 0; k < 2; k++) {
          const app = k === 0 ? 1 : prog(ts, T.anders - 0.1, 0.55);
          if (app <= 0) continue;
          all.push(...fPolys(camS, k, ts, Gs, 0.7 + 0.3 * app));
        }
        return all;
      };
      const fA = worldA;
      if (fA > 0) {
        SUB.forEach((dt, i) => drawPolys(ctx, polysAt(Math.max(0, t - dt)), fA * (i === 0 ? 0.16 : 0.26)));
        drawPolys(ctx, polysAt(t), fA);
        ctx.globalCompositeOperation = 'lighter';
        if (!inBack) {
          const piv = (k: number): V3 => F_POS[k];
          axisGlow(ctx, cam, piv(0), 'x', T.kipp1, t);
          axisGlow(ctx, cam, piv(0), 'z', T.dreh1, t);
          axisGlow(ctx, cam, piv(1), 'z', T.dreh2, t);
          axisGlow(ctx, cam, piv(1), 'x', T.kipp2, t);
        }
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    /* Ebene(n) */
    if (!off.current) {
      off.current = document.createElement('canvas');
      off.current.width = W;
      off.current.height = H;
    }
    const o = off.current.getContext('2d');
    if (!o) return;
    for (let i = 0; i < 2; i++) {
      const al = sheetAlpha(i, t);
      if (al <= 0) continue;
      o.globalCompositeOperation = 'source-over';
      o.globalAlpha = 1;
      o.clearRect(0, 0, W, H);
      const c = camOf(i === 0 && t < T.split ? worldCam(t) : sheetCam(i, t));
      const rew = prog(t, T.zieht, 0.5);
      const pull =
        i === 0 && t < T.split
          ? bump(t, T.bZieht + 0.1, 1.4)
          : bump(t, T.zieht + 0.35, 1.9) + (i === 0 ? bump(t, T.breit - 0.1, 1.2) : bump(t, T.lang - 0.55, 1.3)) * (1 - rew);
      const hiEnd = 1 - prog(t, T.wieder + 0.2, 0.5);
      drawSheet(
        o,
        c,
        sheetM(i, t),
        {
          alpha: 1,
          fAlpha: prog(t, T.dive + 0.6, 0.5),
          arrows: prog(t, T.dive + 0.9, 0.5),
          pull: clamp(pull),
          hiArms: i === 0 ? prog(t, T.reihen + 0.1, 0.4) * hiEnd : 0,
          hiSpine: i === 1 ? prog(t, T.liegt + 0.2, 0.4) * hiEnd : 0,
        },
        t,
      );
      // weiche Ränder: oben/unten nach Plattenmaske, links/rechts zum Bildrand
      const [y0, y1] = sheetMask(i, t);
      const fe = 70;
      o.globalCompositeOperation = 'destination-in';
      const gv = o.createLinearGradient(0, y0 - fe / 2, 0, y1 + fe / 2);
      const span = y1 - y0 + fe;
      gv.addColorStop(0, 'rgba(0,0,0,0)');
      gv.addColorStop(clamp(fe / span), 'rgba(0,0,0,1)');
      gv.addColorStop(clamp(1 - fe / span), 'rgba(0,0,0,1)');
      gv.addColorStop(1, 'rgba(0,0,0,0)');
      o.fillStyle = gv;
      o.fillRect(0, 0, W, H);
      const gh = o.createLinearGradient(0, 0, W, 0);
      gh.addColorStop(0, 'rgba(0,0,0,0)');
      gh.addColorStop(0.08, 'rgba(0,0,0,1)');
      gh.addColorStop(0.92, 'rgba(0,0,0,1)');
      gh.addColorStop(1, 'rgba(0,0,0,0)');
      o.fillStyle = gh;
      o.fillRect(0, 0, W, H);
      ctx.globalAlpha = al;
      ctx.drawImage(off.current, 0, 0);
    }
    ctx.globalAlpha = 1;
  }, [t]);

  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};
