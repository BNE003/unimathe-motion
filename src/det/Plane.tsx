import React, {useLayoutEffect, useRef} from 'react';
import {C, H, W} from '../theme';
import {V2, bump, clamp, easeOutCubic, prog} from '../math';
import {useSec} from '../ui';
import {A0, Cam, I, KERNEL, apply, camAt, matrixAt, mix, toScr} from './state';
import {T} from './timeline';

/* ---------- Sonnenblume: Phyllotaxis mit goldenem Winkel ---------- */

const N = 1400;
const R = 2.7;
const GOLDEN = (137.508 * Math.PI) / 180;
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const STOPS = [C.indigo, C.blue, C.cyan, C.eig].map(hex);
const COLORS = Array.from({length: N}, (_, k) => {
  const x = (k / (N - 1)) * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(x));
  const f = x - i;
  return STOPS[i].map((v, j) => Math.round(v + (STOPS[i + 1][j] - v) * f)).join(',');
});
const flowerPoint = (k: number, t: number): V2 => {
  const r = R * Math.sqrt((k + 0.5) / N);
  const a = k * GOLDEN + 0.1 * t; // dreht sich langsam, damit nie Stillstand ist
  return [r * Math.cos(a), r * Math.sin(a)];
};

/* ---------- Kern-Geraden: (c, 0) + s · (1, −2) landen alle auf A0 · (c, 0) = (2c, c) ---------- */

const KERNEL_LINES = [-1, 0, 1];
const KS = Array.from({length: 11}, (_, j) => -0.85 + (1.7 * j) / 10);
const kernelPoint = (c: number, s: number): V2 => [c + s * KERNEL[0], s * KERNEL[1]];

const arrow = (ctx: CanvasRenderingContext2D, a: V2, b: V2, color: string, width: number, alpha: number) => {
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
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0] - ux * head * 0.8, b[1] - uy * head * 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(b[0], b[1]);
  ctx.lineTo(b[0] - ux * head - uy * head * 0.45, b[1] - uy * head + ux * head * 0.45);
  ctx.lineTo(b[0] - ux * head + uy * head * 0.45, b[1] - uy * head - ux * head * 0.45);
  ctx.closePath();
  ctx.fill();
};

// Bewegungsunschärfe: drei Zeitproben pro Frame, additiv gemischt
const SUB = [0, 1 / 180, 2 / 180];

export const Plane: React.FC = () => {
  const t = useSec();
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    const cam: Cam = camAt(t);
    const M = matrixAt(t);
    const S = (p: V2) => toScr(cam, apply(M, p));
    const inCta = t >= T.cta;

    /* Gitter */
    const gridA = inCta ? 0.13 * (1 - prog(t, T.cta, 0.6)) + 0.05 * prog(t, T.cta + 1, 1.5) : 0.13;
    ctx.globalCompositeOperation = 'lighter';
    for (let k = -16; k <= 16; k++) {
      for (const [p, q] of [[[k, -16], [k, 16]], [[-16, k], [16, k]]] as [V2, V2][]) {
        const a = S(p);
        const b = S(q);
        ctx.globalAlpha = k === 0 ? gridA * 2.2 : gridA;
        ctx.strokeStyle = k === 0 ? C.txt : C.vec;
        ctx.lineWidth = k === 0 ? 2 : 1.2;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
      }
    }

    /* Sonnenblume */
    const dim = 1 - 0.65 * prog(t, T.back + 0.1, 0.6);
    const flowerA = inCta ? 0.3 * prog(t, T.cta + 0.9, 1.6) : dim;
    const pr = 2.2 + cam.u / 120;
    for (const dt of SUB) {
      const ts = Math.max(0, t - dt);
      const Ms = matrixAt(ts);
      const cs = camAt(ts);
      for (let k = 0; k < N; k++) {
        const s = toScr(cs, apply(Ms, flowerPoint(k, ts)));
        if (s[0] < -40 || s[0] > W + 40 || s[1] < -40 || s[1] > H + 40) continue;
        ctx.fillStyle = `rgb(${COLORS[k]})`;
        ctx.globalAlpha = (flowerA * 0.07) / SUB.length;
        ctx.beginPath();
        ctx.arc(s[0], s[1], pr * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = (flowerA * 0.85) / SUB.length;
        ctx.beginPath();
        ctx.arc(s[0], s[1], pr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* Lichtblitz und Druckwelle beim Kollaps */
    for (const hit of [T.hookHit, T.hit]) {
      const f = bump(t, hit - 0.02, 0.7);
      const x = (t - hit) / 0.9;
      if (f <= 0 && (x < 0 || x > 1)) continue;
      const d = apply(A0, [1, 0]);
      const a = toScr(cam, [d[0] * -9, d[1] * -9]);
      const b = toScr(cam, [d[0] * 9, d[1] * 9]);
      ctx.strokeStyle = C.txt;
      for (const [w, al] of [[46, 0.18], [14, 0.45], [4, 0.9]]) {
        ctx.globalAlpha = al * f;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
      }
      if (x >= 0 && x <= 1) {
        // zwei Wellen laufen senkrecht zur Linie weg: dort, wo die verlorene Dimension war
        const nx = -(b[1] - a[1]);
        const ny = b[0] - a[0];
        const nl = Math.hypot(nx, ny);
        const off = 30 + 1100 * easeOutCubic(x);
        for (const sgn of [-1, 1]) {
          const ox = (sgn * off * nx) / nl;
          const oy = (sgn * off * ny) / nl;
          ctx.globalAlpha = 0.35 * (1 - x);
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(a[0] + ox, a[1] + oy);
          ctx.lineTo(b[0] + ox, b[1] + oy);
          ctx.stroke();
        }
      }
    }
    ctx.globalCompositeOperation = 'source-over';

    /* Einheitsquadrat und Basispfeile */
    const sqA = prog(t, T.square, 0.5) * (1 - 0.6 * prog(t, T.back, 0.5)) * (1 - prog(t, T.cta, 0.4));
    if (sqA > 0) {
      const sq = ([[0, 0], [1, 0], [1, 1], [0, 1]] as V2[]).map(S);
      ctx.globalAlpha = sqA;
      ctx.fillStyle = 'rgba(255,194,71,.24)';
      ctx.strokeStyle = C.eig;
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      sq.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    const arA = prog(t, T.square + 0.15, 0.5) * (1 - prog(t, T.back, 0.5));
    if (arA > 0) {
      const o = S([0, 0]);
      // Neckerei vor dem Kippen: Ziel-Gerade der Amber-Spalte und der Weg der Cyan-Spitze
      const tease = prog(t, T.tease + 0.2, 0.8) * (1 - prog(t, T.hit, 0.3));
      if (tease > 0) {
        ctx.setLineDash([10, 14]);
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = 0.55 * tease;
        ctx.strokeStyle = C.eig;
        const la = toScr(cam, [-0.8, -0.4]);
        const lb = toScr(cam, [4.4, 2.2]);
        ctx.beginPath();
        ctx.moveTo(la[0], la[1]);
        ctx.lineTo(lb[0], lb[1]);
        ctx.stroke();
        ctx.strokeStyle = C.cyan;
        const pa = toScr(cam, apply(M, [0, 1]));
        const pb = toScr(cam, [1, 0.5]);
        ctx.beginPath();
        ctx.moveTo(pa[0], pa[1]);
        ctx.lineTo(pb[0], pb[1]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      const glow = t > T.tease && t < T.hit ? 0.5 + 0.5 * Math.sin((t - T.tease) * 7) : 0;
      ctx.shadowColor = C.cyan;
      ctx.shadowBlur = 24 * glow * tease;
      arrow(ctx, o, S([0, 1]), C.cyan, 7, arA);
      ctx.shadowBlur = 0;
      arrow(ctx, o, S([1, 0]), C.eig, 7, arA);
    }

    /* Kern-Geraden: viele Punkte → ein Punkt */
    if (t > T.back && t < T.cta + 0.5) {
      const out = 1 - prog(t, T.cta, 0.4);
      const e = prog(t, T.kernel - 0.1, T.land - T.kernel + 0.1);
      const Mk = mix(I, A0, e);
      KERNEL_LINES.forEach((c, li) => {
        const app = prog(t, T.back + 0.25 + li * 0.25, 0.5);
        if (app <= 0) return;
        const P = (s: number) => toScr(cam, apply(Mk, kernelPoint(c, s)));
        const a = P(-1.15);
        const b = P(1.15);
        ctx.globalAlpha = 0.5 * app * out;
        ctx.strokeStyle = C.lam;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 12]);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
        ctx.setLineDash([]);
        KS.forEach((s, j) => {
          const pj = clamp(app * 1.6 - (j / KS.length) * 0.6);
          const p = P(s);
          ctx.globalAlpha = pj * out;
          ctx.fillStyle = C.lam;
          ctx.beginPath();
          ctx.arc(p[0], p[1], 9, 0, Math.PI * 2);
          ctx.fill();
        });
        // Ziel-Punkt (2c, c) auf der Linie
        const land = bump(t, T.land - 0.05, 0.9);
        const target = toScr(cam, apply(A0, [c, 0]));
        if (t > T.land - 0.05) {
          ctx.globalAlpha = out;
          ctx.fillStyle = C.txt;
          ctx.beginPath();
          ctx.arc(target[0], target[1], 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 0.8 * land * out;
          ctx.strokeStyle = C.txt;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(target[0], target[1], 14 + 50 * clamp((t - T.land) / 0.9), 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    }
    ctx.globalAlpha = 1;
  }, [t]);

  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};
