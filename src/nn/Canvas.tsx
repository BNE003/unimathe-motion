// Canvas-Bühne für das 0,999…-Video: Zahlengerade mit Zoom in die Lücke, Näherungen, Abstände.
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {C, H, W} from '../theme';
import {clamp} from '../math';
import {useSec} from '../ui';
import {F} from '../fonts';
import {T} from './timeline';
import {GAPS, LINE_Y, PARA, X1, fade, paraVis, pulse, show, toX, vis, zoomAt} from './world';

type Ctx = CanvasRenderingContext2D;

export const COL = {num: C.cyan, one: C.eig, gap: C.lam};

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const rgba = (h: string, a: number) => `rgba(${rgb(h).join(',')},${a})`;

const seg = (ctx: Ctx, x0: number, y0: number, x1: number, y1: number) => {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
};

const dot = (ctx: Ctx, x: number, y: number, color: string, r: number, a: number, glow = 0) => {
  if (a <= 0) return;
  ctx.globalAlpha = a;
  const R = r * (4 + 3 * glow);
  const g = ctx.createRadialGradient(x, y, 0, x, y, R);
  g.addColorStop(0, rgba(color, 0.55));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.txt;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
};

const nines = (n: number) => `0,${'9'.repeat(n)}`;

// Lücke von x bis zur Eins
const gap = (ctx: Ctx, x: number, a: number, glow = 0) => {
  if (a <= 0 || X1 - x < 0.3) return;
  ctx.globalAlpha = a;
  ctx.strokeStyle = COL.gap;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.shadowColor = COL.gap;
  ctx.shadowBlur = 20 + 20 * glow;
  seg(ctx, x + 8, LINE_Y, X1 - 8, LINE_Y);
  ctx.shadowBlur = 0;
  ctx.lineCap = 'butt';
  ctx.globalAlpha = 1;
};

const draw = (ctx: Ctx, t: number) => {
  ctx.clearRect(0, 0, W, H);
  const a = vis.line(t);
  if (a <= 0) return;
  const z = zoomAt(t);
  const y = LINE_Y;

  // Gerade
  ctx.globalAlpha = a;
  ctx.strokeStyle = rgba(COL.num, 0.18);
  ctx.lineWidth = 18;
  seg(ctx, 0, y, W, y);
  ctx.strokeStyle = COL.num;
  ctx.lineWidth = 4;
  ctx.shadowColor = COL.num;
  ctx.shadowBlur = 16;
  seg(ctx, 0, y, W, y);
  ctx.shadowBlur = 0;

  // Striche: Hauptabstand so, dass sie auf dem Bildschirm 70–700 px auseinander liegen; feinere blenden mit dem Zoom ein
  const fz = Math.floor(z + 1e-9);
  const d = Math.pow(10, -fz - 1);
  const u = 700 * Math.pow(10, z);
  const fr = z - fz;
  const ticks = (step: number, h: number, alpha: number) => {
    if (alpha <= 0.01) return;
    const kMin = Math.floor(-(W - X1) / (u * step)) - 1;
    const kMax = Math.ceil(X1 / (u * step)) + 1;
    ctx.strokeStyle = rgba(C.txt, 0.55 * alpha);
    ctx.lineWidth = 2.5;
    for (let k = kMin; k <= kMax; k++) {
      if (k === 0) continue;
      const sx = X1 - k * step * u;
      seg(ctx, sx, y - h, sx, y + h);
    }
  };
  ticks(d, 13, 1);
  ticks(d / 10, 7, clamp(fr * 1.4));

  // die Null, solange sie im Bild ist
  ctx.font = `600 36px "${F.display}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const x0 = toX(0, z);
  if (x0 > -40) {
    ctx.strokeStyle = rgba(C.txt, 0.8);
    ctx.lineWidth = 3;
    seg(ctx, x0, y - 20, x0, y + 20);
    ctx.fillStyle = C.txt2;
    ctx.fillText('0', x0, y + 34);
  }

  // Paradox: Näherungen und die scheinbar bleibende Lücke
  if (t < T.hier + 0.6) {
    PARA.forEach((p, i) => {
      const v = paraVis(t, i);
      const nxt = i + 1 < PARA.length ? paraVis(t, i + 1) : 0;
      const x = toX(1 - Math.pow(10, -p.n), z);
      gap(ctx, x, v * (1 - nxt), pulse(t, p.at, 0.8));
    });
    PARA.forEach((p, i) => {
      const v = paraVis(t, i);
      const x = toX(1 - Math.pow(10, -p.n), z);
      const edge = clamp((x - 40) / 120);
      if (v * edge <= 0) return;
      dot(ctx, x, y, COL.num, 11, v * edge, pulse(t, p.at, 0.7));
      ctx.globalAlpha = v * edge * clamp((X1 - x - 40) / 20);
      ctx.fillStyle = COL.num;
      ctx.font = `700 38px "${F.display}"`;
      ctx.fillText(nines(p.n), x, y + 34);
    });
  }

  // Abstand: drei Näherungen im festen Maßstab
  if (t > T.abstand) {
    const ga = vis.gaps(t);
    GAPS.forEach((g, i) => {
      const v = show(t, g.at, 0.35) * ga;
      const nxt = i + 1 < GAPS.length ? show(t, GAPS[i + 1].at, 0.35) : 0;
      const x = toX(1 - Math.pow(10, -g.n), 0);
      gap(ctx, x, v * (1 - nxt) + (i === GAPS.length - 1 ? 0 : 0), pulse(t, g.at, 0.7));
      dot(ctx, x, y, COL.num, 10, v * (i === 0 ? 1 : 0.9), pulse(t, g.at, 0.7));
    });
    // nur 0,9 hat Platz für eine Beschriftung
    const l = show(t, GAPS[0].at, 0.35) * ga;
    if (l > 0) {
      ctx.globalAlpha = l;
      ctx.fillStyle = COL.num;
      ctx.font = `700 38px "${F.display}"`;
      ctx.fillText('0,9', toX(0.9, 0), y + 34);
    }
  }

  // die Eins: Strich, Punkt, Beschriftung
  ctx.globalAlpha = a;
  const glow1 = pulse(t, T.dieEins, 1.2) + pulse(t, T.aber, 0.8);
  ctx.strokeStyle = COL.one;
  ctx.lineWidth = 4;
  ctx.shadowColor = COL.one;
  ctx.shadowBlur = 14;
  seg(ctx, X1, y - 24, X1, y + 24);
  ctx.shadowBlur = 0;
  ctx.fillStyle = COL.one;
  ctx.font = `800 40px "${F.display}"`;
  ctx.fillText('1', X1, y + 34);
  const merged = fade(t, [[T.dieEins - 0.05, 0.4, 1], [T.cta - 0.2, 0.5, 0]]);
  dot(ctx, X1, y, COL.one, 12 + 4 * merged, a * (0.55 + 0.45 * merged), glow1 + merged * 0.4);
  ctx.globalAlpha = 1;
};

export const Stage: React.FC = () => {
  const t = useSec();
  const ref = useRef<HTMLCanvasElement>(null);
  // die Zahlen auf der Geraden zeichnet die Canvas: Schrift vorher laden
  const [handle] = useState(() => delayRender('Schrift der Bühne'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // die Google-Schrift meldet sich erst nach dem Laden an: so lange warten, bis sie wirklich da ist
    const specs = [`600 36px "${F.display}"`, `800 40px "${F.display}"`, `700 38px "${F.display}"`];
    let alive = true;
    const tryLoad = async () => {
      for (let n = 0; n < 200 && alive; n++) {
        const got = await Promise.all(specs.map((s) => document.fonts.load(s)));
        if (got.every((g) => g.length > 0)) break;
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
