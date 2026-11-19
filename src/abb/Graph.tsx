// Canvas-Bühne: Koordinatensystem über den ganzen Bildschirm, Hyperbel f(x) = 2 + 1/(x+1), Asymptoten,
// zwei Eingaben (Teil a), wandernde Waagrechte (Teil b) und Spiegelung an y = x (Teil c).
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {C, H, W} from '../theme';
import {bump, clamp, easeInOutCubic, lerp} from '../math';
import {useSec} from '../ui';
import {F} from '../fonts';
import {T} from './timeline';
import {hide, mix, rgba, show} from './kit';

type Ctx = CanvasRenderingContext2D;

export const OX = 470;
export const OY = 1040;
export const U = 90;
export const sx = (x: number) => OX + x * U;
export const sy = (y: number) => OY - y * U;

export const f = (x: number) => (2 * x + 3) / (x + 1);
export const g = (y: number) => (3 - y) / (y - 2);

// Kontrolle der Mathematik: bricht ab, wenn etwas nicht stimmt
[-7, -3, -1.5, -0.5, 0, 1, 4.2].forEach((x) => {
  if (Math.abs(g(f(x)) - x) > 1e-9) throw new Error('g ist nicht die Umkehrung von f');
  if (Math.abs(f(x) - (2 + 1 / (x + 1))) > 1e-9) throw new Error('f ≠ 2 + 1/(x+1)');
});
[-3, 0, 1.5, 2.5, 3.5, 9].forEach((y) => {
  if (Math.abs(f(g(y)) - y) > 1e-9 || Math.abs(g(y) + 1) < 1e-9) throw new Error('Urbild falsch');
});
if (f(-3) !== 1.5 || f(1) !== 2.5) throw new Error('Beispielwerte falsch');

const COL = {curve: C.vec, inv: C.eig, asym: C.lam, x: C.cyan, y: C.eig};

/* ---------- Sichtbarkeit ---------- */

// Deckkraft der ganzen Bühne: voll in den Graph-Momenten, gedimmt während der Rechnung
export const stage = (t: number) => {
  const dims: [number, number, number][] = [
    [T.zeigen + 0.1, 0.6, 0.13],
    [T.teilB + 0.2, 0.6, 1],
    [T.suchen + 0.8, 0.6, 0.13],
    [T.graph - 0.1, 0.6, 1],
    [T.summary - 0.1, 0.6, 0.1],
    [T.cta - 0.2, 0.5, 0],
  ];
  let v = 1;
  dims.forEach(([at, d, to]) => (v = lerp(v, to, easeInOutCubic(clamp((t - at) / d)))));
  return v;
};
const drawIn = (t: number) => easeInOutCubic(clamp((t - T.vorne - 0.1) / 1.3));

// Waagrechte in Teil b: von oben bis knapp unter die Zwei, an der Zwei kurz stehen, weiter nach unten, dann bei 3,5 halten
export const yLine = (t: number) => {
  const a = T.jede + 0.3;
  const b = T.ausserZwei;
  if (t < b) return lerp(4.6, 2, easeInOutCubic(clamp((t - a) / (b - a))));
  const c = b + 0.45;
  if (t < c) return 2;
  const d = T.nehmen - 0.1;
  if (t < d) return lerp(2, -2.6, easeInOutCubic(clamp((t - c) / (d - c - 0.15))));
  return lerp(-2.6, 3.5, easeInOutCubic(clamp((t - d) / 0.9)));
};
const lineVis = (t: number) => show(t, T.jede + 0.1, 0.4) * hide(t, T.suchen + 0.9, 0.5);

// Spiegelung: Winkel der Faltung um y = x
const fold = (t: number) => Math.PI * easeInOutCubic(clamp((t - T.spiegel + 0.5) / 2.2));
const foldP = (x: number, y: number, th: number): [number, number] => {
  const s = (x + y) / 2;
  const c = Math.cos(th);
  return [s + c * (x - s), s + c * (y - s)];
};

/* ---------- Zeichnen ---------- */

const seg = (ctx: Ctx, x0: number, y0: number, x1: number, y1: number) => {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
};

const dot = (ctx: Ctx, x: number, y: number, color: string, r: number, a: number, glow = 0) => {
  if (a <= 0) return;
  ctx.globalAlpha = a;
  const R = r * (3.5 + 3 * glow);
  const gr = ctx.createRadialGradient(x, y, 0, x, y, R);
  gr.addColorStop(0, rgba(color, 0.55));
  gr.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = gr;
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.txt;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
};

const label = (ctx: Ctx, text: string, x: number, y: number, color: string, a: number, size = 34, align: CanvasTextAlign = 'center', math = false) => {
  if (a <= 0.01) return;
  ctx.globalAlpha = a;
  ctx.font = math ? `italic ${size}px KaTeX_Math` : `700 ${size}px "${F.display}"`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 8;
  ctx.strokeStyle = C.bg;
  ctx.lineJoin = 'round';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.globalAlpha = 1;
};

// Kurve aus Punkten (Weltkoordinaten), an Sprüngen unterbrochen; nur bis zum Anteil `upTo` gezeichnet
const curve = (ctx: Ctx, pts: [number, number][], color: string, a: number, width = 5) => {
  if (a <= 0.01 || pts.length < 2) return;
  ctx.globalAlpha = a;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(sx(x), sy(y)) : ctx.lineTo(sx(x), sy(y))));
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
};

const YMIN = -5;
const YMAX = 9;
const branch = (x0: number, x1: number, upTo = 1): [number, number][] => {
  const out: [number, number][] = [];
  const n = 220;
  for (let i = 0; i <= n * upTo; i++) {
    const x = lerp(x0, x1, i / n);
    const y = f(x);
    if (y >= YMIN && y <= YMAX) out.push([x, y]);
  }
  return out;
};
// linker Ast: x von −7 bis zur Asymptote, rechter Ast von der Asymptote bis 7,5 (Abstand 0,06, dort ist |y| > 9 sowieso abgeschnitten)
const LEFT: [number, number] = [-7, -1.06];
const RIGHT: [number, number] = [-0.94, 7.5];

const dashed = (ctx: Ctx, x0: number, y0: number, x1: number, y1: number, color: string, a: number, w = 3.5) => {
  if (a <= 0.01) return;
  ctx.globalAlpha = a;
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.setLineDash([16, 12]);
  seg(ctx, x0, y0, x1, y1);
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
};

const draw = (ctx: Ctx, t: number) => {
  ctx.clearRect(0, 0, W, H);
  const A = stage(t) * show(t, T.vorne - 0.3, 0.6);
  if (A <= 0.005) return;

  // Gitter
  ctx.globalAlpha = A;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(166,173,211,.10)';
  for (let i = -6; i <= 8; i++) seg(ctx, sx(i), 0, sx(i), H);
  for (let j = -10; j <= 12; j++) seg(ctx, 0, sy(j), W, sy(j));
  // Achsen: x cyan getönt, y amber getönt
  ctx.lineWidth = 3;
  ctx.strokeStyle = rgba(COL.x, 0.75);
  seg(ctx, 0, OY, W, OY);
  ctx.strokeStyle = rgba(COL.y, 0.75);
  seg(ctx, OX, 0, OX, H);
  ctx.lineWidth = 2.5;
  for (let i = -5; i <= 6; i++) if (i) {
    ctx.strokeStyle = rgba(COL.x, 0.6);
    seg(ctx, sx(i), OY - 9, sx(i), OY + 9);
  }
  for (let j = -4; j <= 9; j++) if (j) {
    ctx.strokeStyle = rgba(COL.y, 0.6);
    seg(ctx, OX - 9, sy(j), OX + 9, sy(j));
  }
  ctx.globalAlpha = 1;
  label(ctx, 'x', W - 50, OY - 34, COL.x, A, 40, 'center', true);
  label(ctx, 'y', OX + 32, sy(4.72), COL.y, A, 40, 'center', true);

  // Asymptoten und ausgeschlossene Werte
  const th = fold(t);
  const asX = show(t, T.minusEins - 0.1, 0.5);
  const asY = show(t, T.zwei0 - 0.1, 0.5);
  const gx = bump(t, T.minusEins, 1.0) + bump(t, T.nieMinus1, 1.2);
  const gy = bump(t, T.zwei0, 1.0) + bump(t, T.ausserZwei, 1.0) + bump(t, T.deshalb, 1.2);
  dashed(ctx, sx(-1), 0, sx(-1), H, COL.asym, A * asX * (0.75 + 0.25 * gx), 3.5 + 2 * gx);
  dashed(ctx, 0, sy(2), W, sy(2), COL.asym, A * asY * (0.75 + 0.25 * gy), 3.5 + 2 * gy);
  label(ctx, '−1', sx(-1) - 30, OY + 36, COL.asym, A * asX * (1 - clamp(th)), 32);
  label(ctx, '2', W - 40, sy(2) - 26, COL.asym, A * asY, 32);

  // Graph von f
  const di = drawIn(t);
  const faint = th > 0 ? lerp(1, 0.4, clamp(th / 1.2)) : 1;
  curve(ctx, branch(LEFT[0], LEFT[1], di), COL.curve, A * faint);
  curve(ctx, branch(RIGHT[0], RIGHT[1], di), COL.curve, A * faint);
  label(ctx, 'f', sx(4.6), sy(f(4.6)) - 40, COL.curve, A * di, 42, 'center', true);

  // Teil a: zwei verschiedene Eingaben, zwei verschiedene Werte
  const pa = hide(t, T.zeigen, 0.4);
  [
    [-3, T.verschieden + 0.15],
    [1, T.verschieden + 0.95],
  ].forEach(([x, at]) => {
    const s = show(t, at, 0.4) * pa;
    if (s <= 0) return;
    const up = easeInOutCubic(clamp((t - at - 0.2) / 0.5));
    const side = easeInOutCubic(clamp((t - at - 0.65) / 0.5));
    const y = f(x);
    dot(ctx, sx(x), OY, COL.x, 10, A * s, bump(t, at, 0.6));
    label(ctx, x < 0 ? '−3' : '1', sx(x), OY + 40, COL.x, A * s, 34);
    dashed(ctx, sx(x), OY, sx(x), lerp(OY, sy(y), up), C.txt, A * s * 0.7, 3);
    if (up > 0.98) dot(ctx, sx(x), sy(y), C.txt, 8, A * s);
    if (side > 0) {
      dashed(ctx, sx(x), sy(y), lerp(sx(x), OX, side), sy(y), C.txt, A * s * 0.7, 3);
      dot(ctx, OX, sy(y), COL.y, 10, A * s * side, bump(t, at + 0.9, 0.6));
      label(ctx, y === 1.5 ? '1,5' : '2,5', OX + (x < 0 ? 52 : -52), sy(y), COL.y, A * s * side, 32);
    }
  });

  // Teil b: Waagrechte auf Höhe y, Schnittpunkt und Lot auf die x-Achse
  const lv = lineVis(t);
  if (lv > 0) {
    const yl = yLine(t);
    const near = clamp(1 - Math.abs(yl - 2) / 0.12);
    const lc = mix(COL.y, COL.asym, near);
    ctx.globalAlpha = A * lv;
    ctx.strokeStyle = lc;
    ctx.lineWidth = 4 + 2 * near;
    ctx.shadowColor = lc;
    ctx.shadowBlur = 16;
    seg(ctx, 0, sy(yl), W, sy(yl));
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    dot(ctx, OX, sy(yl), lc, 9, A * lv);
    if (Math.abs(yl - 2) > 0.004) {
      const x = g(yl);
      const X = sx(x);
      if (X > -40 && X < W + 40) {
        dashed(ctx, X, sy(yl), X, OY, COL.x, A * lv * 0.85, 3);
        dot(ctx, X, OY, COL.x, 10, A * lv);
        dot(ctx, X, sy(yl), C.txt, 9, A * lv, 0.4);
        label(ctx, 'x', X, OY + 40, COL.x, A * lv * show(t, T.suchen - 0.3, 0.4), 38, 'center', true);
      }
    }
    label(ctx, 'y', 40, sy(yl) - 28, lc, A * lv * show(t, T.nehmen - 0.1, 0.4), 38, 'center', true);
    const k = show(t, T.ausserZwei - 0.15, 0.25) * hide(t, T.ausserZwei + 0.6, 0.3);
    label(ctx, 'kein Urbild', sx(3.2), sy(2) + 44, COL.asym, A * k, 34);
  }

  // Teil c: Spiegelung an y = x
  const dg = show(t, T.graph + 0.15, 0.6) * hide(t, T.summary - 0.1, 0.5);
  if (dg > 0) {
    dashed(ctx, sx(-5.5), sy(-5.5), sx(9), sy(9), C.txt, A * dg * 0.75, 3);
    label(ctx, 'y = x', sx(3.6) + 112, sy(3.6) + 24, C.txt, A * dg * 0.9, 34, 'center', true);
  }
  if (th > 0) {
    const fp = (pts: [number, number][]) => pts.map(([x, y]) => foldP(x, y, th));
    const ca = A * clamp(th * 3);
    // gespiegelte Asymptoten
    const [a1, b1] = [foldP(-1, -12, th), foldP(-1, 14, th)];
    const [a2, b2] = [foldP(-12, 2, th), foldP(14, 2, th)];
    dashed(ctx, sx(a1[0]), sy(a1[1]), sx(b1[0]), sy(b1[1]), COL.asym, ca * 0.8);
    dashed(ctx, sx(a2[0]), sy(a2[1]), sx(b2[0]), sy(b2[1]), COL.asym, ca * 0.8);
    curve(ctx, fp(branch(LEFT[0], LEFT[1])), COL.inv, ca);
    curve(ctx, fp(branch(RIGHT[0], RIGHT[1])), COL.inv, ca);
    const done = clamp((th - 2.9) / 0.24);
    label(ctx, 'f', sx(1.5) + 46, sy(-3), COL.inv, A * done, 42, 'center', true);
    label(ctx, '−1', sx(1.5) + 82, sy(-3) - 18, COL.inv, A * done, 26);
    label(ctx, '2', sx(2) + 24, OY + 36, COL.asym, A * done, 32);
    label(ctx, '−1', OX - 34, sy(-1) + 26, COL.asym, A * done, 32);
  }
};

export const Stage: React.FC = () => {
  const t = useSec();
  const ref = useRef<HTMLCanvasElement>(null);
  // Schrift der Canvas erst nach dem Anmelden der Google-Schrift laden (sonst Serifenschrift)
  const [handle] = useState(() => delayRender('Schrift der Bühne'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const specs = [`700 34px "${F.display}"`, 'italic 40px KaTeX_Math'];
    let alive = true;
    const tryLoad = async () => {
      for (let n = 0; n < 200 && alive; n++) {
        const got = await Promise.all(specs.map((s) => document.fonts.load(s)));
        if (got.every((x) => x.length > 0)) break;
        await new Promise((r) => setTimeout(r, 50));
      }
      if (!alive) return;
      setReady(true);
      continueRender(handle);
    };
    tryLoad();
    return () => {
      alive = false;
    };
  }, [handle]);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (ctx && ready) draw(ctx, t);
  }, [t, ready]);
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};
