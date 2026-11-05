import React, {useLayoutEffect, useRef} from 'react';
import {C, H, W} from '../theme';
import {V2, bump, clamp} from '../math';
import {V3, add3, sc3} from '../space';
import {useSec} from '../ui';
import {COLS, KH, LATTICE, LAT_EDGES, apM, camAt, onEq, onImg, sKer, sRest, tParam, vis} from './world';
import {T} from './timeline';

type Ctx = CanvasRenderingContext2D;
type Cam = ReturnType<typeof camAt>['cam'];

export const COL = {
  ker: C.lam,
  img: C.eig,
  a: ['#7FB2FF', '#C79CFF', C.cyan],
  eq: [C.blue, C.cyan, '#9D8CFF'],
};

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixHex = (a: string, b: string, s: number) => {
  const x = rgb(a);
  const y = rgb(b);
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * s)).join(',')})`;
};
const STOPS = [C.indigo, C.blue, C.cyan];
const latColor = (c: number) => {
  const x = c * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(x));
  return mixHex(STOPS[i], STOPS[i + 1], x - i);
};
const LAT_COL = LATTICE.map((p) => latColor(p.c));

const line = (ctx: Ctx, a: V2, b: V2) => {
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
};

export const arrow2 = (ctx: Ctx, a: V2, b: V2, color: string, width: number, alpha: number) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const L = Math.hypot(dx, dy);
  if (L < 3 || alpha <= 0) return;
  const ux = dx / L;
  const uy = dy / L;
  const head = Math.min(28, L * 0.42);
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

const glowLine = (ctx: Ctx, a: V2, b: V2, color: string, alpha: number, w = 4) => {
  if (alpha <= 0) return;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  for (const [k, al] of [[5, 0.12], [2.2, 0.3], [1, 0.95]] as [number, number][]) {
    ctx.globalAlpha = alpha * al;
    ctx.lineWidth = w * k;
    line(ctx, a, b);
  }
};

const quad = (ctx: Ctx, cam: Cam, pts: V3[]) => {
  ctx.beginPath();
  pts.forEach((q, i) => {
    const [x, y] = cam.p(q);
    if (i) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  });
  ctx.closePath();
};

/* ---------- Bildebene z = x + y ---------- */

const IMG_R = 3.3;
const imagePlane = (ctx: Ctx, cam: Cam, alpha: number, scale: number) => {
  if (alpha <= 0) return;
  const R = IMG_R * scale;
  const g = ctx.createRadialGradient(...cam.p([0, 0, 0]), 0, ...cam.p([0, 0, 0]), R * 140);
  g.addColorStop(0, 'rgba(255,194,71,0.26)');
  g.addColorStop(1, 'rgba(255,194,71,0.05)');
  quad(ctx, cam, [onImg(-R, -R), onImg(R, -R), onImg(R, R), onImg(-R, R)]);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = C.eig;
  ctx.lineWidth = 1.2;
  for (let k = -3; k <= 3; k++) {
    const s = (k / 3) * R;
    ctx.globalAlpha = alpha * (k === 0 ? 0.4 : 0.18);
    line(ctx, cam.p(onImg(s, -R)), cam.p(onImg(s, R)));
    line(ctx, cam.p(onImg(-R, s)), cam.p(onImg(R, s)));
  }
  ctx.globalAlpha = alpha * 0.7;
  ctx.lineWidth = 2;
  quad(ctx, cam, [onImg(-R, -R), onImg(R, -R), onImg(R, R), onImg(-R, R)]);
  ctx.stroke();
};

/* ---------- Gleichungsebenen: je zwei Hälften an der Kern-Geraden, nach Tiefe sortiert ---------- */

const EA = 2.6;
const EB = 2.1;
const eqPlanes = (ctx: Ctx, cam: Cam, t: number) => {
  type Half = {pts: V3[]; depth: number; i: number; a: number};
  const halves: Half[] = [];
  for (let i = 0; i < 3; i++) {
    const a = vis.eq(i, t);
    if (a <= 0) continue;
    for (const sg of [-1, 1]) {
      const pts = [onEq(i, -EA, 0), onEq(i, EA, 0), onEq(i, EA, sg * EB), onEq(i, -EA, sg * EB)];
      const c = onEq(i, 0, sg * EB * 0.5);
      halves.push({pts, depth: cam.depth(c), i, a});
    }
  }
  halves.sort((p, q) => q.depth - p.depth);
  for (const h of halves) {
    const flash = h.i === 1 ? bump(t, T.genau + 0.6, 1.0) : h.i === 2 ? bump(t, T.weg - 0.1, 0.8) : 0;
    quad(ctx, cam, h.pts);
    ctx.globalAlpha = h.a * (0.2 + 0.25 * flash);
    ctx.fillStyle = COL.eq[h.i];
    ctx.fill();
    ctx.globalAlpha = h.a * (0.75 + 0.25 * flash);
    ctx.strokeStyle = COL.eq[h.i];
    ctx.lineWidth = 2 + 2 * flash;
    ctx.stroke();
  }
};

/* ---------- Komponente ---------- */

const SUB = [2.4 / 120, 1.2 / 120];

export const Scene: React.FC = () => {
  const t = useSec();
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    const {cam, st} = camAt(t);
    if (st.o <= 0.001) return;
    const O = st.o;
    const P = (q: V3) => cam.p(q);

    // feine Achsen zur Orientierung
    ctx.strokeStyle = C.vec;
    ctx.lineWidth = 1.3;
    for (const d of [[1, 0, 0], [0, 1, 0], [0, 0, 1]] as V3[]) {
      ctx.globalAlpha = 0.16 * O;
      line(ctx, P(sc3(d, -3.2)), P(sc3(d, 3.2)));
    }

    imagePlane(ctx, cam, vis.img(t) * O, t > T.basis - 0.5 && t < T.s3 ? 0.45 + 0.55 * clamp((t - T.basis) / 1.4) : 1);
    ctx.save();
    ctx.globalAlpha = O;
    eqPlanes(ctx, cam, t);
    ctx.restore();

    /* Gitter: Linien, dann Punkte mit Bewegungsunschärfe */
    const la = vis.lattice(t) * O;
    if (la > 0) {
      const kerHi = vis.kerHi(t);
      const restDim = vis.restDim(t);
      ctx.globalCompositeOperation = 'lighter';
      const sR = sRest(t);
      ctx.strokeStyle = C.vec;
      ctx.lineWidth = 1;
      ctx.globalAlpha = la * 0.07 * (1 - restDim);
      for (const [p, q] of LAT_EDGES) line(ctx, P(apM(sR, p)), P(apM(sR, q)));
      for (const [k, dt] of [0, ...SUB].entries()) {
        const ts = Math.max(0, t - dt);
        const sk = sKer(ts);
        const sr = sRest(ts);
        const c = camAt(ts).cam;
        const w = k === 0 ? 1 : 0.35;
        LATTICE.forEach((pt, n) => {
          const s = pt.ker ? sk : sr;
          const [x, y] = c.p(apM(s, pt.q));
          const big = pt.ker ? kerHi : 0;
          const col = pt.ker && kerHi > 0 ? mixHex(C.blue, C.lam, kerHi) : LAT_COL[n];
          const a = la * w * (pt.ker ? 1 : 1 - restDim);
          const r = (pt.ker ? 4.5 + 3 * big : 3.8) * Math.sqrt(st.u / 100);
          ctx.fillStyle = col;
          ctx.globalAlpha = a * 0.12;
          ctx.beginPath();
          ctx.arc(x, y, r * 2.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = a * 0.9;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    /* Kern-Gerade: schrumpft beim Flachdrücken mit in den Ursprung */
    const kl = vis.kerLine(t) * O;
    if (kl > 0) {
      const L = 3.6 * (1 - sKer(t));
      ctx.globalCompositeOperation = 'lighter';
      glowLine(ctx, P(sc3(KH, -L)), P(sc3(KH, L)), COL.ker, kl, 3);
      ctx.globalCompositeOperation = 'source-over';
    }
    const pa = vis.point(t) * O;
    if (pa > 0) {
      const [x, y] = P(sc3(KH, tParam(t) * Math.sqrt(3) * 0.75));
      ctx.globalAlpha = pa;
      ctx.fillStyle = C.txt;
      ctx.shadowColor = C.lam;
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    /* Spalten a₁, a₂, a₃, das Dreieck a₁ − a₂ + a₃ = 0 und das Parallelogramm */
    const ca = vis.cols(t) * O;
    if (ca > 0) {
      const [p1, p2, p3] = vis.tri(t);
      const triOn = t >= T.sp1 && vis.triOut(t) < 1;
      const triA = triOn ? 1 - vis.triOut(t) : 0;
      const para = vis.para(t);
      const g2 = vis.grey2(t);
      const O3: V3 = [0, 0, 0];
      // Parallelogramm aus a₁ und a₃, a₂ ist seine Diagonale
      if (para > 0) {
        quad(ctx, cam, [O3, COLS[0], add3(COLS[0], COLS[2]), COLS[2]]);
        ctx.globalAlpha = ca * para * 0.18;
        ctx.fillStyle = C.eig;
        ctx.fill();
        ctx.globalAlpha = ca * para * 0.7;
        ctx.strokeStyle = C.eig;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 9]);
        line(ctx, P(COLS[0]), P(add3(COLS[0], COLS[2])));
        line(ctx, P(COLS[2]), P(add3(COLS[0], COLS[2])));
        ctx.setLineDash([]);
      }
      ctx.shadowColor = 'rgba(7,8,26,.9)';
      ctx.shadowBlur = 16;
      const dimBase = 1 - 0.7 * triA;
      COLS.forEach((a, j) => {
        const color = j === 1 && g2 > 0 ? mixHex(COL.a[1], '#7E84AD', g2) : COL.a[j];
        const al = ca * dimBase * (j === 1 ? 1 - 0.45 * g2 : 1);
        arrow2(ctx, P(O3), P(a), color, 6, al);
      });
      if (triA > 0) {
        const t1 = sc3(COLS[0], p1);
        const b1 = COLS[0];
        const b2: V3 = add3(b1, sc3(COLS[1], -p2));
        const e2: V3 = add3(b1, sc3(COLS[1], -1));
        const b3: V3 = add3(e2, sc3(COLS[2], p3));
        if (p1 > 0) arrow2(ctx, P(O3), P(t1), COL.a[0], 8, ca * triA);
        if (p2 > 0) arrow2(ctx, P(b1), P(b2), COL.a[1], 8, ca * triA);
        if (p3 > 0) arrow2(ctx, P(e2), P(b3), COL.a[2], 8, ca * triA);
      }
      ctx.shadowBlur = 0;
    }

    /* Lichtblitze im Ursprung */
    const f = Math.max(bump(t, T.nullpunkt + 0.25, 0.7), bump(t, T.close, 0.8), bump(t, T.verloren + 1.2, 0.7));
    if (f > 0) {
      const [x, y] = P([0, 0, 0]);
      const g = ctx.createRadialGradient(x, y, 0, x, y, 120);
      g.addColorStop(0, `rgba(243,244,251,${0.9 * f})`);
      g.addColorStop(0.25, `rgba(255,122,92,${0.45 * f})`);
      g.addColorStop(1, 'rgba(255,122,92,0)');
      ctx.globalAlpha = O;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 120, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, [t]);

  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};
