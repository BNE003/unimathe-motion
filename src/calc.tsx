import React from 'react';
import {C, H, W} from './theme';
import {F} from './fonts';

// Matrix mal Vektor als Rechnung mit eigener Geometrie:
//   (2 1; 1 2)(x1; x2) = (2⋅x1 + 1⋅x2; 1⋅x1 + 2⋅x2) = (r1; r2) [= Zusatz]
// Jeder Teil hat eine eigene Sichtbarkeit 0..1, damit sich die Rechnung Zeile für Zeile aufbaut.
export type CalcShow = {
  mat: number;
  vec: number;
  eq1: number;
  row: [number, number]; // Zeilen-Highlight
  mid: [number, number];
  eq2: number;
  res: [number, number];
  tail: number;
};

export const CALC_HIDDEN: CalcShow = {mat: 0, vec: 0, eq1: 0, row: [0, 0], mid: [0, 0], eq2: 0, res: [0, 0], tail: 0};

export const CalcMV: React.FC<{
  x: number;
  yc: number;
  size: number;
  vec: [string, string];
  vecColor: string;
  mid: [string, string];
  res: [string, string];
  resColor: string;
  tail?: React.ReactNode;
  tailW?: number;
  show: CalcShow;
  opacity?: number;
  prefix?: boolean;
}> = ({x, yc, size: s, vec, vecColor, mid, res, resColor, tail, tailW = 0, show, opacity = 1, prefix = false}) => {
  const pw = 0.42 * s;
  const rdy = 1.32 * s;
  const ph = rdy + 1.15 * s;
  const colDx = 1.35 * s;
  const blocks: {key: string; inner: number; gap: number}[] = [
    ...(prefix ? [{key: 'pa', inner: 0.8 * s, gap: 0}, {key: 'peq', inner: 0.95 * s, gap: 0.1 * s}] : []),
    {key: 'mat', inner: colDx + 0.75 * s, gap: 0.12 * s},
    {key: 'vec', inner: 0.62 * s, gap: 0.2 * s},
    {key: 'eq1', inner: 0.95 * s, gap: 0.2 * s},
    {key: 'mid', inner: 4.25 * s, gap: 0.2 * s},
    {key: 'eq2', inner: 0.95 * s, gap: 0.2 * s},
    {key: 'res', inner: 0.62 * s, gap: 0.25 * s},
  ];
  const pos: Record<string, {l: number; r: number; c: number}> = {};
  let cx = x;
  for (const b of blocks) {
    const bracket = !['eq1', 'eq2', 'pa', 'peq'].includes(b.key);
    const l = cx;
    const w = b.inner + (bracket ? 2 * pw : 0);
    pos[b.key] = {l, r: l + w, c: l + w / 2};
    cx = l + w + b.gap;
  }
  const tailX = cx;
  const glyph = (txt: string, gx: number, gy: number, o: number, color = C.txt, extra: React.CSSProperties = {}) =>
    o > 0 ? (
      <div
        style={{
          position: 'absolute',
          left: gx,
          top: gy,
          transform: `translate(-50%, -50%) translateY(${(1 - o) * 0.25 * s}px)`,
          fontFamily: F.texMain,
          fontSize: s,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          color,
          opacity: o,
          ...extra,
        }}
      >
        {txt}
      </div>
    ) : null;
  const parens = (k: string, o: number, color = C.txt) => {
    if (o <= 0) return null;
    const {l, r} = pos[k];
    const bw = 0.17 * s;
    const top = yc - ph / 2;
    const bot = yc + ph / 2;
    return (
      <g opacity={o} key={k}>
        <path d={`M${l + bw * 1.6},${top} Q${l - bw * 0.4},${yc} ${l + bw * 1.6},${bot}`} fill="none" stroke={color} strokeWidth={0.06 * s} strokeLinecap="round" />
        <path d={`M${r - bw * 1.6},${top} Q${r + bw * 0.4},${yc} ${r - bw * 1.6},${bot}`} fill="none" stroke={color} strokeWidth={0.06 * s} strokeLinecap="round" />
      </g>
    );
  };
  const rowY = (i: number) => yc + (i === 0 ? -rdy / 2 : rdy / 2);
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      {[0, 1].map((i) =>
        show.row[i] > 0 ? (
          <div
            key={`hl${i}`}
            style={{
              position: 'absolute',
              left: pos.mat.l - 0.1 * s,
              top: rowY(i) - 0.52 * s,
              width: (pos.mid.r - pos.mat.l + 0.2 * s) * Math.min(1, show.row[i] * 1.4),
              height: 1.04 * s,
              borderRadius: 0.2 * s,
              background: `rgba(166,173,211,${0.16 * show.row[i]})`,
            }}
          />
        ) : null,
      )}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {parens('mat', show.mat)}
        {parens('vec', show.vec, vecColor)}
        {parens('mid', Math.max(show.mid[0], show.mid[1]))}
        {parens('res', Math.max(show.res[0], show.res[1]), resColor)}
      </svg>
      {prefix ? glyph('A', pos.pa.c, yc, show.mat, C.cyan, {fontFamily: F.texMath, fontStyle: 'italic'}) : null}
      {prefix ? glyph('=', pos.peq.c, yc, show.mat) : null}
      {glyph('2', pos.mat.c - colDx / 2, rowY(0), show.mat)}
      {glyph('1', pos.mat.c + colDx / 2, rowY(0), show.mat)}
      {glyph('1', pos.mat.c - colDx / 2, rowY(1), show.mat)}
      {glyph('2', pos.mat.c + colDx / 2, rowY(1), show.mat)}
      {glyph(vec[0], pos.vec.c, rowY(0), show.vec, vecColor)}
      {glyph(vec[1], pos.vec.c, rowY(1), show.vec, vecColor)}
      {glyph('=', pos.eq1.c, yc, show.eq1)}
      {glyph(mid[0], pos.mid.c, rowY(0), show.mid[0], C.txt2)}
      {glyph(mid[1], pos.mid.c, rowY(1), show.mid[1], C.txt2)}
      {glyph('=', pos.eq2.c, yc, show.eq2)}
      {glyph(res[0], pos.res.c, rowY(0), show.res[0], resColor)}
      {glyph(res[1], pos.res.c, rowY(1), show.res[1], resColor)}
      {tail && show.tail > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: tailX,
            top: yc,
            width: tailW,
            transform: `translateY(-50%) translateX(${(1 - show.tail) * 0.3 * s}px)`,
            opacity: show.tail,
            fontFamily: F.texMain,
            fontSize: s,
            whiteSpace: 'nowrap',
          }}
        >
          {tail}
        </div>
      ) : null}
    </div>
  );
};
