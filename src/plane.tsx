import React from 'react';
import {C, H, W} from './theme';
import {M2, V2, View, mul, toScreen} from './math';

// SVG-Bühne mit Koordinatengitter: Original als Geist, transformiertes Gitter im Logo-Verlauf
export const Stage: React.FC<{
  id: string;
  view: View;
  M: M2;
  gridAlpha?: number;
  ghostAlpha?: number;
  mask?: {cx: number; cy: number; r: number};
  children?: React.ReactNode;
}> = ({id, view, M, gridAlpha = 1, ghostAlpha = 1, mask, children}) => {
  const mk = mask ?? {cx: view.ox, cy: view.oy, r: 900};
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id={`${id}-space`} x1="0" y1={H} x2={W} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={C.indigo} />
          <stop offset=".5" stopColor={C.blue} />
          <stop offset="1" stopColor={C.cyan} />
        </linearGradient>
        <radialGradient id={`${id}-mg`} cx={mk.cx} cy={mk.cy} r={mk.r} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".6" stopColor="#fff" stopOpacity=".7" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-m`}>
          <rect width={W} height={H} fill={`url(#${id}-mg)`} />
        </mask>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <g mask={`url(#${id}-m)`}>
        <Grid view={view} M={[[1, 0], [0, 1]]} stroke="#ffffff" w={1} axisW={1.5} alpha={0.05 * ghostAlpha} axisAlpha={0.12 * ghostAlpha} />
        {gridAlpha > 0 ? (
          <Grid view={view} M={M} stroke={`url(#${id}-space)`} w={1.6} axisW={3} alpha={0.55 * gridAlpha} axisAlpha={0.95 * gridAlpha} />
        ) : null}
      </g>
      {children}
    </svg>
  );
};

const Grid: React.FC<{view: View; M: M2; stroke: string; w: number; axisW: number; alpha: number; axisAlpha: number}> = ({
  view,
  M,
  stroke,
  w,
  axisW,
  alpha,
  axisAlpha,
}) => {
  const N = 16;
  const lines: React.ReactNode[] = [];
  for (let k = -N; k <= N; k++) {
    const pairs: [V2, V2][] = [
      [[k, -N], [k, N]],
      [[-N, k], [N, k]],
    ];
    pairs.forEach(([a, b], j) => {
      const [x1, y1] = toScreen(view, mul(M, a));
      const [x2, y2] = toScreen(view, mul(M, b));
      const ax = k === 0;
      lines.push(
        <line key={`${k}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={ax ? axisW : w} strokeOpacity={ax ? axisAlpha : alpha} />,
      );
    });
  }
  return <g>{lines}</g>;
};

export const Arrow: React.FC<{
  view: View;
  from?: V2;
  to: V2;
  color: string;
  w?: number;
  head?: number;
  opacity?: number;
  dash?: string;
  glow?: number;
  glowId?: string;
}> = ({view, from = [0, 0], to, color, w = 7, head = 30, opacity = 1, dash, glow = 0, glowId}) => {
  const [x1, y1] = toScreen(view, from);
  const [x2, y2] = toScreen(view, to);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const L = Math.hypot(dx, dy);
  if (L < 1 || opacity <= 0) return null;
  const h = Math.min(head, L * 0.55);
  const ux = dx / L;
  const uy = dy / L;
  const bx = x2 - ux * h;
  const by = y2 - uy * h;
  const hw = h * 0.52;
  const px = -uy;
  const py = ux;
  const ex = x2 - ux * h * 0.7;
  const ey = y2 - uy * h * 0.7;
  const pts = `${x2},${y2} ${bx + px * hw},${by + py * hw} ${bx - px * hw},${by - py * hw}`;
  const body = (
    <>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} />
      {dash ? (
        <polygon points={pts} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" />
      ) : (
        <polygon points={pts} fill={color} stroke={color} strokeWidth={2} strokeLinejoin="round" />
      )}
    </>
  );
  return (
    <g opacity={opacity}>
      {glow > 0 && glowId ? (
        <g filter={`url(#${glowId})`} opacity={0.75 * glow}>
          {body}
        </g>
      ) : null}
      {body}
    </g>
  );
};

export const Seg: React.FC<{view: View; p0: V2; p1: V2; color: string; w?: number; opacity?: number; dash?: string}> = ({
  view,
  p0,
  p1,
  color,
  w = 2,
  opacity = 1,
  dash,
}) => {
  if (opacity <= 0) return null;
  const [x1, y1] = toScreen(view, p0);
  const [x2, y2] = toScreen(view, p1);
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeOpacity={opacity} strokeDasharray={dash} strokeLinecap="round" />;
};

// Spannlinie durch den Ursprung in Richtung d, wächst von innen nach außen
export const SpanLine: React.FC<{view: View; d: V2; color: string; grow: number; opacity?: number; w?: number}> = ({
  view,
  d,
  color,
  grow,
  opacity = 0.45,
  w = 2.5,
}) => {
  if (grow <= 0) return null;
  const k = 12 * grow;
  return <Seg view={view} p0={[-d[0] * k, -d[1] * k]} p1={[d[0] * k, d[1] * k]} color={color} w={w} opacity={opacity} dash="14 12" />;
};

// Kippwinkel als Bogen um den Ursprung (Winkel in Grad, mathematisch positiv)
export const AngleArc: React.FC<{view: View; r: number; a0: number; a1: number; color: string; opacity?: number}> = ({
  view,
  r,
  a0,
  a1,
  color,
  opacity = 0.9,
}) => {
  if (Math.abs(a1 - a0) < 0.5 || opacity <= 0) return null;
  const P = (a: number): V2 => {
    const rad = (a * Math.PI) / 180;
    return [view.ox + r * Math.cos(rad), view.oy - r * Math.sin(rad)];
  };
  const [x0, y0] = P(a0);
  const [x1, y1] = P(a1);
  const sweep = a1 > a0 ? 0 : 1;
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const dir = a1 > a0 ? 1 : -1;
  const rad1 = (a1 * Math.PI) / 180;
  const tx = -Math.sin(rad1) * dir;
  const ty = -Math.cos(rad1) * dir;
  const h = 14;
  const nx = -ty;
  const ny = tx;
  return (
    <g opacity={opacity}>
      <path d={`M${x0},${y0} A${r},${r} 0 ${large} ${sweep} ${x1},${y1}`} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
      <polygon
        points={`${x1 + tx * h * 0.6},${y1 + ty * h * 0.6} ${x1 - tx * h * 0.6 + nx * h * 0.55},${y1 - ty * h * 0.6 + ny * h * 0.55} ${
          x1 - tx * h * 0.6 - nx * h * 0.55
        },${y1 - ty * h * 0.6 - ny * h * 0.55}`}
        fill={color}
      />
    </g>
  );
};

export const Origin: React.FC<{view: View; opacity?: number}> = ({view, opacity = 1}) => (
  <circle cx={view.ox} cy={view.oy} r={7} fill={C.txt} opacity={opacity} />
);

// Maßmarken k·v entlang der Eigenlinie
export const Ticks: React.FC<{view: View; d: V2; ks: number[]; show: number; color: string}> = ({view, d, ks, show, color}) => (
  <g>
    {ks.map((k, i) => {
      const o = Math.max(0, Math.min(1, show * ks.length - i));
      if (o <= 0) return null;
      const [x, y] = toScreen(view, [d[0] * k, d[1] * k]);
      // senkrecht zur Linie in Bildschirmkoordinaten
      const L = Math.hypot(d[0], d[1]);
      const nx = d[1] / L;
      const ny = d[0] / L;
      return <line key={k} x1={x + nx * 10} y1={y + ny * 10} x2={x + nx * 24} y2={y + ny * 24} stroke={color} strokeOpacity={0.8 * o} strokeWidth={2.5} />;
    })}
  </g>
);
