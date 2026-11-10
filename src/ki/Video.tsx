import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C, MARGIN, W} from '../theme';
import {F, useTexFonts} from '../fonts';
import {V2, bump, clamp, easeInCubic, easeInOutCubic, easeOutExpo, fmtDe, lerp, prog, sec, springOS} from '../math';
import {Backdrop, Grain, Mono, Tex, col, useSec} from '../ui';
import {V3} from '../space';
import {COL, Scene, footOn} from './Canvas';
import {A_BACK, A_HOOK, R1, SHEAR2, SHEAR3, SLIDE1, SLIDE2, aAt, addV, camAt, project, rowsAt, rowsT, s2At, s3At, vis, volume} from './world';
import {CLIPS, MUSIC, SUBTITLES, T, VOICES} from './timeline';

const show = (t: number, at: number, d = 0.4) => easeOutExpo(clamp((t - at) / d));
const hide = (t: number, at: number, d = 0.35) => 1 - easeInOutCubic(clamp((t - at) / d));
const shadow = `0 0 14px ${C.bg}, 0 0 30px ${C.bg}`;
const AM = (s: string) => col(COL.a, s);
const Z = (n: 1 | 2 | 3) => col(n === 1 ? COL.r1 : n === 2 ? COL.r2 : COL.r3, `Z_${n}`);
const ROWC = [COL.r1, COL.r2, COL.r3];

// Zahl für eine Matrix: ganze Zahlen ohne Komma, sonst eine Nachkommastelle
const num = (v: number) => {
  const r = Math.round(v);
  if (Math.abs(v - r) < 0.04) return r < 0 ? `-${-r}` : `${r}`;
  const s = fmtDe(Math.abs(v), 1).replace(',', '{,}');
  return v < 0 ? `-${s}` : s;
};

/* ---------- Matrix mit eigener Geometrie: jeder Eintrag lässt sich einzeln bewegen ---------- */

type Geo = {cx: number; cy: number; cw: number; rh: number; size: number};
const cellAt = (g: Geo, i: number, j: number): V2 => [g.cx + (j - 1) * g.cw, g.cy + (i - 1) * g.rh];

// Eintrag mit Zuständen [ab Zeit, TeX]; Wechsel rollen nach oben aus und von unten ein
type Cell = {states: [number, string][]; glow?: number; o?: number; color?: string};
const ROLL = 0.38;

const CellView: React.FC<{t: number; g: Geo; i: number; j: number; c: Cell}> = ({t, g, i, j, c}) => {
  const [x, y] = cellAt(g, i, j);
  let k = 0;
  c.states.forEach(([at], n) => {
    if (t >= at) k = n;
  });
  const p = k > 0 ? easeInOutCubic(clamp((t - c.states[k][0]) / ROLL)) : 1;
  const off = g.rh * 0.3;
  const glow = c.glow ?? 0;
  const layer = (tex: string, o: number, dy: number) =>
    o > 0.01 ? (
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y + dy,
          transform: `translate(-50%, -50%) scale(${1 + 0.14 * glow})`,
          opacity: o * (c.o ?? 1),
          whiteSpace: 'nowrap',
          textShadow: glow > 0.02 ? `0 0 ${10 + 26 * glow}px ${c.color ?? 'rgba(255,255,255,.8)'}, ${shadow}` : shadow,
        }}
      >
        <Tex tex={tex} size={g.size} />
      </div>
    ) : null;
  return (
    <>
      {p < 1 ? layer(c.states[k - 1][1], clamp(1 - 1.6 * p), -p * off) : null}
      {layer(c.states[k][1], clamp(1.6 * p - 0.6), (1 - p) * off)}
    </>
  );
};

const Brackets: React.FC<{g: Geo; o: number; dots?: number; dotGlow?: number[]}> = ({g, o, dots = 0, dotGlow = [0, 0, 0]}) => {
  const h = g.rh * 3 + g.size * 0.15;
  const w = g.cw * 3 + g.size * 0.5;
  const left = g.cx - w / 2;
  const top = g.cy - h / 2;
  const pw = Math.max(14, g.size * 0.22);
  const sw = Math.max(2.6, g.size * 0.045);
  return (
    <>
      <svg width={w} height={h} style={{position: 'absolute', left, top, overflow: 'visible', opacity: o}}>
        <path d={`M ${pw} 4 Q 0 ${h / 2} ${pw} ${h - 4}`} fill="none" stroke={C.txt} strokeWidth={sw} strokeLinecap="round" />
        <path d={`M ${w - pw} 4 Q ${w} ${h / 2} ${w - pw} ${h - 4}`} fill="none" stroke={C.txt} strokeWidth={sw} strokeLinecap="round" />
      </svg>
      {dots > 0
        ? [0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: left - g.size * 0.32 - 7,
                top: g.cy + (i - 1) * g.rh - 7,
                width: 14,
                height: 14,
                borderRadius: 7,
                background: ROWC[i],
                opacity: dots * o,
                boxShadow: `0 0 ${10 + 20 * dotGlow[i]}px ${ROWC[i]}`,
                transform: `scale(${1 + 0.5 * dotGlow[i]})`,
              }}
            />
          ))
        : null}
    </>
  );
};

/* ---------- Die große Matrix: Hook und Klausurlösung ---------- */

const GEO_HOOK: Geo = {cx: 600, cy: 690, cw: 150, rh: 92, size: 64};
const GEO_CALC: Geo = {cx: 615, cy: 860, cw: 205, rh: 120, size: 78};
const bigGeo = (t: number): Geo => {
  const k = easeInOutCubic(clamp((t - (T.ueberall - 0.5)) / 1.0));
  return {
    cx: lerp(GEO_HOOK.cx, GEO_CALC.cx, k),
    cy: lerp(GEO_HOOK.cy, GEO_CALC.cy, k),
    cw: lerp(GEO_HOOK.cw, GEO_CALC.cw, k),
    rh: lerp(GEO_HOOK.rh, GEO_CALC.rh, k),
    size: lerp(GEO_HOOK.size, GEO_CALC.size, k),
  };
};

// Zeiten der Umformungen
const F2 = T.ab - 0.25; // Kopie von Z₁ fliegt auf Z₂
const F3 = T.unten - 0.15; // … und auf Z₃
const FLYD = 0.6;
const land = (f: number, j: number, st = 0.12) => f + FLYD + st * j;
const RES2 = [T.null1 - 0.05, -1, T.null2 - 0.05];
const RES3 = [0, 1, 2].map((j) => T.unten + 0.95 + 0.14 * j);

const ONE = '1';
const MIN1 = col(COL.r1, '{-}1');
const A_1 = `${AM('a')}{-}1`;

const bigCells = (t: number): Cell[][] => {
  const aState = (): [number, string][] => [
    [0, AM('a')],
    [A_HOOK[0] + 0.2, AM('1')],
    [A_BACK[0], AM('a')],
  ];
  const r0: Cell[] = [0, 1, 2].map(() => ({states: [[0, ONE]]}));
  const r1: Cell[] = [0, 1, 2].map((j) => {
    if (j === 1)
      return {
        states: [...aState(), [land(F2, 1), `${AM('a')}${MIN1}`], [T.m2 + 0.15, A_1]],
        color: COL.a,
      };
    return {states: [[0, ONE], [land(F2, j), `1${MIN1}`], [RES2[j], '0']]};
  });
  const r2: Cell[] = [0, 1, 2].map((j) => {
    if (j === 2) return {states: [...aState(), [land(F3, 2, 0.1), `${AM('a')}${MIN1}`], [RES3[2], A_1]], color: COL.a};
    return {states: [[0, ONE], [land(F3, j, 0.1), `1${MIN1}`], [RES3[j], '0']]};
  });
  // Hervorhebungen
  const allRows = [0, 1, 2].map((i) => bump(t, T.zeilen + 0.2 * i, 1.0));
  const ones = bump(t, T.ueberall + 0.1, 1.2);
  const diag = bump(t, T.diag + 0.6, 1.2);
  const hookA = bump(t, T.frage + 0.9, 1.0) + bump(t, A_HOOK[0] + 0.3, 1.0);
  const R = [r0, r1, r2];
  R.forEach((row, i) =>
    row.forEach((c, j) => {
      const isA = (i === 1 && j === 1) || (i === 2 && j === 2);
      c.glow = (isA ? diag + hookA : ones) + allRows[i] * 0.8;
      if (isA) c.color = COL.a;
    }),
  );
  // Spalten, die gerade gerechnet werden
  R[1][0].glow = (R[1][0].glow ?? 0) + bump(t, T.m1, 1.4) * 0.9;
  R[1][1].glow = (R[1][1].glow ?? 0) + bump(t, T.m2, 1.3) * 0.9;
  R[1][2].glow = (R[1][2].glow ?? 0) + bump(t, T.null2 - 0.3, 1.0) * 0.9;
  // Nullen treten zurück, die Diagonale leuchtet
  const zeroDim = prog(t, T.dreieck, 0.6);
  const diagGlow = bump(t, T.dreieck + 0.4, 1.0) * 0.5 + bump(t, T.produkt + 0.8, 1.2) + bump(t, T.quadrat - 0.2, 1.0) * 0.5;
  for (const [i, j] of [[1, 0], [2, 0], [2, 1]]) R[i][j].o = 1 - 0.55 * zeroDim;
  for (const k of [0, 1, 2]) R[k][k].glow = (R[k][k].glow ?? 0) + diagGlow;
  return R;
};

const BigMatrix: React.FC = () => {
  const t = useSec();
  const o = hide(t, T.warum + 0.1, 0.5);
  if (o <= 0) return null;
  const g = bigGeo(t);
  const cells = bigCells(t);
  const appear = springOS(clamp((t - 0.05) / 0.6));
  const prefix = hide(t, T.ueberall - 0.6, 0.35);
  // Dreieck aus Nullen
  const tri = prog(t, T.dreieck, 0.6);
  const [x0, y0] = cellAt(g, 1, 0);
  const [x2, y2] = cellAt(g, 2, 1);
  const pad = g.cw * 0.42;
  const triPts = `${x0 - pad},${y0 - g.rh * 0.5} ${x2 + pad},${y2 + g.rh * 0.5} ${x0 - pad},${y2 + g.rh * 0.5}`;
  // Diagonale als Lichtband
  const dg = prog(t, T.dreieck + 0.3, 0.7);
  const [d0x, d0y] = cellAt(g, 0, 0);
  const [d2x, d2y] = cellAt(g, 2, 2);
  return (
    <AbsoluteFill style={{opacity: o * clamp(appear * 1.3)}}>
      {tri > 0 ? (
        <svg width={W} height={1920} style={{position: 'absolute', inset: 0}}>
          <polygon points={triPts} fill={`rgba(126,132,173,${0.16 * tri})`} stroke={`rgba(126,132,173,${0.55 * tri})`} strokeWidth={2.5} strokeLinejoin="round" />
          {dg > 0 ? (
            <line
              x1={d0x - 40}
              y1={d0y - 30}
              x2={lerp(d0x - 40, d2x + 40, dg)}
              y2={lerp(d0y - 30, d2y + 30, dg)}
              stroke="rgba(255,226,168,.16)"
              strokeWidth={g.rh * 0.5}
              strokeLinecap="round"
            />
          ) : null}
        </svg>
      ) : null}
      <Brackets g={g} o={1} dots={hide(t, F2 - 0.5, 0.3)} dotGlow={[0, 1, 2].map((i) => bump(t, T.zeilen + 0.2 * i, 1.0) + (i === 1 ? bump(t, F2, 1) : i === 2 ? bump(t, F3, 1) : bump(t, F2 - 0.3, 1) + bump(t, F3 - 0.3, 1)))} />
      {cells.map((row, i) => row.map((c, j) => <CellView key={`${i}${j}`} t={t} g={g} i={i} j={j} c={c} />))}
      {/* Kopien von Z₁ fliegen auf Z₂ und Z₃ */}
      {[F2, F3].map((f, n) =>
        [0, 1, 2].map((j) => {
          const st = n === 0 ? 0.12 : 0.1;
          const a = f + st * j;
          const x = clamp((t - a) / FLYD);
          if (t < a || x >= 1) return null;
          const e = easeInOutCubic(x);
          const [sx, sy] = cellAt(g, 0, j);
          const [ex, ey] = cellAt(g, n + 1, j);
          return (
            <div
              key={`f${n}${j}`}
              style={{
                position: 'absolute',
                left: lerp(sx, ex + g.size * 0.42, e),
                top: lerp(sy, ey, e) - Math.sin(Math.PI * e) * 26,
                transform: 'translate(-50%, -50%)',
                opacity: clamp(x * 5) * clamp((1 - x) * 6),
                padding: '2px 10px',
                borderRadius: 12,
                background: 'rgba(0,200,200,.16)',
                boxShadow: '0 0 26px rgba(0,200,200,.4)',
              }}
            >
              <Tex tex={MIN1} size={g.size * 0.8} />
            </div>
          );
        }),
      )}
      {/* A(a) = vor der Matrix */}
      {prefix > 0 ? (
        <div style={{position: 'absolute', left: g.cx - g.cw * 1.5 - g.size * 0.6, top: g.cy, transform: 'translate(-100%, -50%)', opacity: prefix, textShadow: shadow}}>
          <Tex tex={`A(${AM('a')}) =`} size={g.size * 0.85} />
        </div>
      ) : null}
      {/* Klausurnotation am Rand */}
      {[
        {n: 2 as const, at: F2 - 0.15, i: 1},
        {n: 3 as const, at: F3 - 0.15, i: 2},
      ].map(({n, at, i}) => {
        const p = show(t, at, 0.4);
        if (p <= 0) return null;
        const [, y] = cellAt(g, i, 0);
        return (
          <div key={n} style={{position: 'absolute', left: 92, top: y, transform: `translate(${(1 - p) * -20}px, -50%)`, opacity: p, textShadow: shadow}}>
            <Tex tex={`${Z(n)} - ${Z(1)}`} size={42} />
          </div>
        );
      })}
      <DetStays g={g} />
    </AbsoluteFill>
  );
};

// „Das ändert die Determinante nicht“
const DetStays: React.FC<{g: Geo}> = ({g}) => {
  const t = useSec();
  const p = show(t, T.aendert - 0.05, 0.45) * hide(t, T.dreieck - 0.3, 0.4);
  if (p <= 0) return null;
  const glow = bump(t, T.aendert + 0.1, 1.1);
  return (
    <div
      style={{
        position: 'absolute',
        left: g.cx,
        top: g.cy + g.rh * 1.5 + 70,
        transform: `translate(-50%, ${(1 - p) * 14}px) scale(${1 + 0.06 * glow})`,
        opacity: p,
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '10px 24px',
        borderRadius: 18,
        border: `2px solid rgba(243,244,251,${0.25 + 0.45 * glow})`,
        background: 'rgba(12,14,40,.6)',
      }}
    >
      <span style={{fontFamily: F.body, fontWeight: 600, fontSize: 32, color: C.txt}}>Zeile abziehen:</span>
      <Tex tex={'\\det\\ \\text{bleibt gleich}'} size={38} />
    </div>
  );
};

/* ---------- Rechnung ② und ③ ---------- */

type Piece = {tex: string; w: number; at: number; from?: V2; glow?: number; color?: string};
const layout = (ps: Piece[], cx = 540) => {
  let x = cx - ps.reduce((a, p) => a + p.w, 0) / 2;
  return ps.map((p) => {
    const c = x + p.w / 2;
    x += p.w;
    return c;
  });
};
const FLY = 0.7;
const Pieces: React.FC<{t: number; x: number; y: number; pieces: Piece[]; size: number}> = ({t, x: cx, y, pieces, size}) => {
  const xs = layout(pieces, cx);
  return (
    <>
      {pieces.map((p, i) => {
        const fly = p.from ? easeInOutCubic(clamp((t - p.at) / FLY)) : 1;
        const a = p.from ? clamp((t - p.at) / 0.1) : show(t, p.at, 0.35);
        if (a <= 0) return null;
        const x = p.from ? lerp(p.from[0], xs[i], fly) : xs[i];
        const yy = p.from ? lerp(p.from[1], y, fly) - Math.sin(Math.PI * fly) * 50 : y + (1 - a) * 12;
        const g = p.glow ?? 0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: yy,
              transform: `translate(-50%, -50%) scale(${1 + 0.16 * g})`,
              opacity: a,
              whiteSpace: 'nowrap',
              textShadow: `0 0 ${8 + 28 * g}px ${g > 0.02 ? p.color ?? C.txt : 'transparent'}, ${shadow}`,
            }}
          >
            <Tex tex={p.tex} size={size} />
          </div>
        );
      })}
    </>
  );
};

const ROW = {det: 1150, inv: 1250, null: 1340, ans: 1290};
const Calc: React.FC = () => {
  const t = useSec();
  const o = hide(t, T.warum + 0.1, 0.5);
  if (o <= 0 || t < T.produkt - 0.3) return null;
  const g = GEO_CALC;
  const dA = T.diagonale - 0.15;
  const sq = bump(t, T.quadrat + 0.1, 1.2) + bump(t, T.nur + 0.2, 1.0);
  const r3 = hide(t, T.antwort - 0.1, 0.4);
  const ans = show(t, T.antwort, 0.5);
  const ansG = bump(t, T.antwort + 0.4, 1.3);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pieces
        t={t}
        x={540}
        y={ROW.det}
        size={44}
        pieces={[
          // Breiten mit KaTeX (Schriften geladen) in Chrome gemessen, bei 44 px; dazu Abstände um = und ·
          {tex: '\\det A', w: 123, at: T.produkt},
          {tex: '=', w: 69, at: T.produkt},
          {tex: '1', w: 27, at: dA, from: cellAt(g, 0, 0)},
          {tex: '\\cdot', w: 35, at: dA + 0.4},
          {tex: `(${A_1})`, w: 138, at: dA + 0.3, from: cellAt(g, 1, 1)},
          {tex: '\\cdot', w: 35, at: dA + 0.7},
          {tex: `(${A_1})`, w: 138, at: dA + 0.6, from: cellAt(g, 2, 2)},
          {tex: '=', w: 69, at: T.quadrat - 0.1},
          {tex: `(${A_1})^2`, w: 159, at: T.quadrat, glow: sq, color: COL.a},
        ]}
      />
      <div style={{opacity: r3}}>
        <Pieces
          t={t}
          x={540}
          y={ROW.inv}
          size={46}
          pieces={[
            {tex: '\\text{invertierbar}', w: 287, at: T.inv},
            {tex: '\\iff', w: 176, at: T.inv + 0.5},
            {tex: '\\det A \\neq 0', w: 231, at: T.ungleich - 0.6, glow: bump(t, T.ungleich, 1.0)},
          ]}
        />
        <Pieces
          t={t}
          x={540}
          y={ROW.null}
          size={46}
          pieces={[
            {tex: `(${A_1})^2 = 0`, w: 269, at: T.nur + 0.2},
            {tex: '\\iff', w: 176, at: T.eins2 - 0.5},
            {tex: `${AM('a')} = 1`, w: 132, at: T.eins2 - 0.2, glow: bump(t, T.eins2, 1.0), color: COL.a},
          ]}
        />
      </div>
      {ans > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: 540,
            top: ROW.ans,
            transform: `translate(-50%, -50%) translateY(${(1 - ans) * 18}px) scale(${1 + 0.07 * ansG})`,
            opacity: ans,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            padding: '16px 34px',
            borderRadius: 24,
            border: `2.5px solid rgba(123,234,156,${0.45 + 0.45 * ansG})`,
            background: 'rgba(12,30,30,.62)',
            boxShadow: `0 0 ${20 + 50 * ansG}px rgba(123,234,156,${0.18 + 0.3 * ansG})`,
          }}
        >
          <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 40, color: C.txt}}>invertierbar</span>
          <Tex tex={`\\iff ${AM('a')} \\neq 1`} size={52} />
          <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 44, color: '#7BEA9C'}}>✓</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- Aufgabenkarte und Fortschritt ---------- */

const CARD = {top: 300, h: 196};
const TaskCard: React.FC = () => {
  const t = useSec();
  const appear = springOS(clamp((t + 0.05) / 0.5));
  const gone = easeInCubic(clamp((t - (T.cta - 0.2)) / 0.5));
  if (gone >= 1) return null;
  const s1 = show(t, T.nicht, 0.4) * hide(t, T.antwort + 0.15, 0.3);
  const s2 = show(t, T.einzige + 0.1, 0.4);
  const s3 = show(t, T.antwort + 0.3, 0.5);
  const g3 = bump(t, T.antwort + 0.4, 1.2);
  const qG = bump(t, T.frage + 0.2, 1.4);
  return (
    <div
      style={{
        position: 'absolute',
        left: MARGIN,
        top: CARD.top,
        width: W - 2 * MARGIN,
        height: CARD.h,
        boxSizing: 'border-box',
        borderRadius: 26,
        border: `1.5px solid rgba(255,255,255,${0.18 + 0.4 * g3})`,
        background: 'linear-gradient(180deg, rgba(20,22,52,.86), rgba(10,11,32,.82))',
        boxShadow: `0 30px 90px rgba(0,0,0,.35)${g3 > 0 ? `, 0 0 60px rgba(123,234,156,${0.25 * g3})` : ''}`,
        opacity: clamp(appear * 1.4) * (1 - gone),
        transform: `translateY(${(1 - appear) * 24}px) scale(${0.97 + 0.03 * appear})`,
      }}
    >
      <div style={{position: 'absolute', left: 34, top: 24, fontFamily: F.mono, fontWeight: 600, fontSize: 24, letterSpacing: '.1em', color: C.eig}}>
        MATHE 1 · KLAUSUR
      </div>
      <div style={{position: 'absolute', left: 34, top: 70, whiteSpace: 'nowrap', textShadow: qG > 0.02 ? `0 0 ${20 * qG}px rgba(255,194,71,${0.6 * qG})` : undefined}}>
        <Tex tex={`\\text{Für welche } ${AM('a')} \\in \\mathbb{R} \\text{ ist } A(${AM('a')}) \\text{ invertierbar?}`} size={40} />
      </div>
      <div style={{position: 'absolute', left: 34, right: 34, top: 132, height: 1.5, background: 'rgba(255,255,255,.1)', opacity: Math.max(s1, s3)}} />
      {s1 > 0 ? (
        <div style={{position: 'absolute', left: 34, top: 146, display: 'flex', alignItems: 'center', gap: 12, opacity: s1, whiteSpace: 'nowrap'}}>
          <Tex tex={`${AM('a')} = 1:`} size={32} />
          <span style={{fontFamily: F.body, fontWeight: 600, fontSize: 28, color: C.lam}}>nicht invertierbar ✗</span>
          {s2 > 0 ? <span style={{fontFamily: F.body, fontWeight: 600, fontSize: 28, color: C.eig, opacity: s2, marginLeft: 10}}>· weitere Werte?</span> : null}
        </div>
      ) : null}
      {s3 > 0 ? (
        <div style={{position: 'absolute', left: 34, top: 144, display: 'flex', alignItems: 'center', gap: 14, opacity: s3, whiteSpace: 'nowrap', transform: `translateY(${(1 - s3) * 10}px)`}}>
          <span style={{fontFamily: F.body, fontWeight: 600, fontSize: 28, color: C.txt2}}>Antwort:</span>
          <Tex tex={`\\text{invertierbar} \\iff ${AM('a')} \\neq 1`} size={34} />
          <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 32, color: '#7BEA9C'}}>✓</span>
        </div>
      ) : null}
    </div>
  );
};

const STEPS = ['Umformen', 'Determinante', 'Antwort'];
const STEP_T = (): [number, number][] => [
  [T.ueberall, T.dreieck],
  [T.dreieck, T.inv],
  [T.inv, T.antwort + 0.3],
];
const STEP_W = 290;
const PROGRESS_Y = 516;
const Progress: React.FC = () => {
  const t = useSec();
  const out = hide(t, T.warum, 0.45);
  if (out <= 0) return null;
  const ST = STEP_T();
  return (
    <>
      {STEPS.map((name, i) => {
        const p = springOS(clamp((t - (T.ueberall - 0.4 + 0.15 * i)) / 0.6));
        if (p <= 0) return null;
        const [on, ok] = ST[i];
        const st = t >= ok ? 'ok' : t >= on ? 'active' : 'idle';
        const pulse = Math.max(bump(t, on, 0.5), bump(t, ok, 0.5));
        const border = st === 'ok' ? C.txt : st === 'active' ? C.eig : 'rgba(255,255,255,.22)';
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: MARGIN + i * (STEP_W + 18),
              top: PROGRESS_Y,
              width: STEP_W,
              height: 58,
              boxSizing: 'border-box',
              borderRadius: 18,
              border: `2.5px solid ${border}`,
              background: st === 'active' ? 'rgba(255,194,71,.10)' : st === 'ok' ? 'rgba(243,244,251,.06)' : 'rgba(255,255,255,.02)',
              boxShadow: st === 'active' ? '0 0 30px rgba(255,194,71,.25)' : undefined,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              paddingLeft: 14,
              opacity: clamp(p * 1.4) * out,
              transform: `scale(${(0.9 + 0.1 * p) * (1 + 0.06 * pulse)})`,
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                border: `2px solid ${st === 'idle' ? C.txt2 : border}`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: F.mono,
                fontWeight: 600,
                fontSize: 19,
                color: st === 'idle' ? C.txt2 : border,
              }}
            >
              {i + 1}
            </span>
            <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 27, color: st === 'idle' ? C.txt2 : C.txt}}>{name}</span>
            {st === 'ok' ? <span style={{marginLeft: 'auto', marginRight: 14, fontFamily: F.display, fontWeight: 800, fontSize: 28, color: C.txt}}>✓</span> : null}
          </div>
        );
      })}
    </>
  );
};

/* ---------- Warum-Teil: kleine Matrix, a und Volumen ---------- */

const GEO_MINI: Geo = {cx: 782, cy: 660, cw: 94, rh: 62, size: 40};
// Im Bild steht a mit einer Nachkommastelle; Matrix, Seiten und Volumen werden aus genau diesem Wert gerechnet
const aShown = (t: number) => Math.round(aAt(t) * 10) / 10;
const dec2 = (v: number) => (Math.abs(v - Math.round(v)) < 0.005 ? `${Math.round(v)}` : fmtDe(v, 2).replace(',', '{,}'));

const MiniMatrix: React.FC = () => {
  const t = useSec();
  const o = show(t, T.pfeil - 0.2, 0.5) * hide(t, T.merk - 0.2, 0.45);
  if (o <= 0) return null;
  const g = GEO_MINI;
  const a = aShown(t);
  const rows = rowsAt(a, s2At(t), s3At(t));
  const live = t > T.drei + 1.1;
  const aToNum = T.drei + 0.6;
  const cells: Cell[][] = [0, 1, 2].map((i) =>
    [0, 1, 2].map((j) => {
      const isA = i > 0 && i === j;
      const v = rows[i][j];
      if (isA && !live) return {states: [[0, AM('a')], [aToNum, AM('-1')]], color: COL.a};
      const tex = isA ? AM(num(v)) : num(v);
      return {states: [[0, tex]], color: isA ? COL.a : undefined};
    }),
  );
  // Hervorhebung der Zeile, die gerade abgezogen wird, und der Diagonale
  const row2 = clamp((t - (T.zieh - 0.1)) / 0.4) * (1 - clamp((t - (SHEAR2[0] + SHEAR2[1] + 0.6)) / 0.4));
  const row3 = clamp((t - (T.dritten - 0.1)) / 0.4) * (1 - clamp((t - (SHEAR3[0] + SHEAR3[1] + 0.4)) / 0.4));
  const dg = bump(t, T.diagonale2 + 0.6, 1.2) + bump(t, T.diagZahlen, 1.0) + bump(t, T.diagZahlen + 0.6, 1.0) + bump(t, T.diagProd, 1.2);
  for (const k of [0, 1, 2]) cells[k][k].glow = dg;
  cells[1][1].glow = (cells[1][1].glow ?? 0) + bump(t, T.drei + 0.6, 1.0) + bump(t, T.seiten, 1.0);
  cells[2][2].glow = (cells[2][2].glow ?? 0) + bump(t, T.drei + 0.6, 1.0) + bump(t, T.seiten, 1.0);
  const band = (i: number, k: number, c: string) =>
    k > 0 ? (
      <div
        style={{
          position: 'absolute',
          left: g.cx - g.cw * 1.7,
          top: g.cy + (i - 1) * g.rh - g.rh * 0.46,
          width: g.cw * 3.4,
          height: g.rh * 0.92,
          borderRadius: 12,
          background: `${c}${Math.round(0x22 * k).toString(16).padStart(2, '0')}`,
          boxShadow: `inset 0 0 0 2px ${c}${Math.round(0x88 * k).toString(16).padStart(2, '0')}`,
        }}
      />
    ) : null;
  const sh = (i: number, k: number) =>
    k > 0 ? (
      <div style={{position: 'absolute', left: g.cx - g.cw * 1.85 - 28, top: g.cy + (i - 1) * g.rh, transform: 'translate(-100%, -50%)', opacity: k, textShadow: shadow, whiteSpace: 'nowrap'}}>
        <Tex tex={`${Z(i === 1 ? 2 : 3)} - ${Z(1)}`} size={32} />
      </div>
    ) : null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      {band(1, row2, COL.r2)}
      {band(2, row3, COL.r3)}
      {sh(1, row2)}
      {sh(2, row3)}
      <Brackets g={g} o={1} dots={1} dotGlow={[0, 1, 2].map((i) => bump(t, T.pfeil + 0.1 + 0.25 * i, 0.9))} />
      {cells.map((row, i) => row.map((c, j) => <CellView key={`${i}${j}`} t={t} g={g} i={i} j={j} c={c} />))}
      <ATag t={t} a={a} />
    </AbsoluteFill>
  );
};

const ATag: React.FC<{t: number; a: number}> = ({t, a}) => {
  const o = show(t, T.drei - 0.05, 0.4);
  if (o <= 0) return null;
  const g = bump(t, T.drei + 0.1, 1.0) + bump(t, SLIDE1[0] + SLIDE1[1] - 0.1, 1.0) * 0.8;
  return (
    <div style={{position: 'absolute', left: 96, top: 600, transform: `translateY(-50%) scale(${1 + 0.1 * g})`, transformOrigin: 'left center', opacity: o, textShadow: `0 0 ${12 + 26 * g}px rgba(255,194,71,${0.3 + 0.5 * g}), ${shadow}`}}>
      <Tex tex={`${AM('a')} = ${AM(num(a))}`} size={50} />
    </div>
  );
};

// Eine Anzeigezeile mit Zuständen: der alte Zustand blendet ganz aus, bevor der neue einblendet (nie zwei übereinander)
type SlotState = [number, ((t: number) => string) | null, ((t: number) => number)?];
const OUT_D = 0.22;
const IN_D = 0.32;
const Slot: React.FC<{t: number; y: number; size: number; states: SlotState[]}> = ({t, y, size, states}) => {
  let k = -1;
  states.forEach(([at], n) => {
    if (t >= at) k = n;
  });
  if (k < 0) return null;
  const [at, tex, glow] = states[k];
  const fadeOld = clamp((t - at) / OUT_D);
  // Ausblenden des vorherigen Zustands
  if (fadeOld < 1 && k > 0 && states[k - 1][1]) {
    const [, pt, pg] = states[k - 1];
    return <SlotView y={y} size={size} tex={pt!(t)} o={1 - fadeOld} glow={pg ? pg(t) : 0} dy={-8 * fadeOld} />;
  }
  if (!tex) return null;
  const p = easeOutExpo(clamp((t - at - (k > 0 ? OUT_D : 0)) / IN_D));
  if (p <= 0) return null;
  return <SlotView y={y} size={size} tex={tex(t)} o={p} glow={glow ? glow(t) : 0} dy={(1 - p) * 12} />;
};
const SlotView: React.FC<{y: number; size: number; tex: string; o: number; glow: number; dy: number}> = ({y, size, tex, o, glow, dy}) => (
  <div
    style={{
      position: 'absolute',
      left: 96,
      top: y,
      transform: `translateY(-50%) translateY(${dy}px) scale(${1 + 0.07 * glow})`,
      transformOrigin: 'left center',
      opacity: o,
      whiteSpace: 'nowrap',
      padding: '6px 16px',
      marginLeft: -16,
      borderRadius: 16,
      background: 'rgba(7,8,26,.55)',
      textShadow: glow > 0.02 ? `0 0 ${10 + 24 * glow}px rgba(255,255,255,${0.5 * glow})` : undefined,
    }}
  >
    <Tex tex={tex} size={size} />
  </div>
);

const GF = col(COL.base, '\\text{Grundfläche}');
const HO = '\\text{Höhe}';
const FLY3 = (): number => T.vierCalc + 1.0;
const VolumeReadout: React.FC = () => {
  const t = useSec();
  const o = hide(t, T.merk - 0.2, 0.45);
  if (o <= 0 || t < T.volumen) return null;
  const a = aShown(t);
  const fly3 = FLY3();
  const volLive = () => `\\text{Volumen} = (${AM('a')}-1)^2 = ${dec2(volume(aShown(t)))}`;
  const A_STATES: SlotState[] = [
    [T.volumen + 1.4, () => '\\det A = \\text{Volumen}', (x) => bump(x, T.volumen + 1.6, 1.1)],
    [T.vierCalc - 0.2, (x) => `\\text{Volumen} = (${x < fly3 + FLY ? '\\phantom{-1}' : AM('-1')}-1)^2 = ${x < T.vier2 ? '\\phantom{4}' : '4'}`, (x) => bump(x, T.vier2, 1.0) + bump(x, T.vier3, 1.2) + bump(x, SHEAR2[0] + SHEAR2[1], 0.9) + bump(x, SHEAR3[0] + SHEAR3[1], 0.9)],
    [T.laeuft + 0.3, volLive, (x) => bump(x, SLIDE1[0] + SLIDE1[1], 1.2)],
  ];
  const B_STATES: SlotState[] = [
    [T.gxh - 0.1, () => `\\text{Volumen} = ${GF} \\cdot ${HO}`, (x) => bump(x, T.gf, 0.9) * 0.6 + bump(x, T.hoehe, 0.9) * 0.6 + bump(x, T.hoeheGleich, 1.0) + bump(x, T.gfGleich, 1.0)],
    [T.produkt2 - 0.1, () => `${GF} \\cdot ${HO} = 2 \\cdot 2 \\cdot 1 = 4`, (x) => bump(x, T.produkt2 + 1.2, 1.2)],
    [T.diagProd - 0.1, () => `\\text{Diagonale: } 1 \\cdot (${AM('-2')}) \\cdot (${AM('-2')}) = 4`, (x) => bump(x, T.diagProd + 0.5, 1.2)],
    [T.laeuft + 0.3, null],
    [T.volNull - 0.1, (x) => `\\text{Volumen } 0 \\;\\Rightarrow\\; \\det A = 0${x < T.keineInv - 0.1 ? '' : ' \\;\\Rightarrow\\; \\text{keine Inverse}'}`, (x) => bump(x, T.detNull, 1.0) + bump(x, T.keineInv, 1.2)],
    [T.waechst + 0.2, null],
  ];
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Slot t={t} y={782} size={46} states={A_STATES} />
      <Slot t={t} y={858} size={40} states={B_STATES} />
      {/* „3“ fliegt aus a = 3 in die Rechnung */}
      {t > fly3 && t < fly3 + FLY ? (
        <div
          style={{
            position: 'absolute',
            left: lerp(96 + 125, 96 + 349, easeInOutCubic(clamp((t - fly3) / FLY))),
            top: lerp(600, 782, easeInOutCubic(clamp((t - fly3) / FLY))) - Math.sin(Math.PI * clamp((t - fly3) / FLY)) * 40,
            transform: 'translate(-50%, -50%)',
            textShadow: shadow,
          }}
        >
          <Tex tex={AM('-1')} size={46} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const WarumLabel: React.FC = () => (
  <Mono x={MARGIN} y={524} at={T.warum + 0.1} out={T.merk - 0.3} color={C.eig} size={24}>
    Warum darf man Zeilen abziehen?
  </Mono>
);

/* ---------- Beschriftungen an Punkten im Raum ---------- */

const Label3: React.FC<{t: number; q: V3; dx?: number; dy?: number; o: number; style?: React.CSSProperties; children: React.ReactNode}> = ({t, q, dx = 0, dy = 0, o, style, children}) => {
  if (o <= 0.005) return null;
  const [x, y] = project(t, q);
  return (
    <div style={{position: 'absolute', left: clamp(x + dx, 110, 930), top: clamp(y + dy, 930, 1400), transform: 'translate(-50%, -50%)', opacity: o, textShadow: shadow, whiteSpace: 'nowrap', ...style}}>
      {children}
    </div>
  );
};

const Chip: React.FC<{text: string; color: string; glow: number}> = ({text, color, glow}) => (
  <div
    style={{
      padding: '4px 14px',
      borderRadius: 12,
      background: 'rgba(7,8,26,.72)',
      border: `2px solid ${color}`,
      fontFamily: F.display,
      fontWeight: 800,
      fontSize: 30,
      color,
      transform: `scale(${1 + 0.14 * glow})`,
      boxShadow: `0 0 ${8 + 26 * glow}px ${color}`,
    }}
  >
    {text}
  </div>
);

const mid = (p: V3, q: V3): V3 => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];
const SpaceLabels: React.FC = () => {
  const t = useSec();
  const st = vis.stage(t);
  const rows = rowsT(t);
  const [r1, r2, r3] = rows;
  const a = aShown(t);
  const names = st * show(t, T.pfeil, 0.4) * hide(t, T.quadrat2 - 0.2, 0.4);
  const base = vis.base2(t) * st * show(t, T.basis + 0.5, 0.4);
  const h2 = vis.height2(t) * st * show(t, T.abstand + 0.5, 0.4);
  const sq = vis.square(t) * st;
  const sides = sq * show(t, T.zweiMal - 0.1, 0.4) * hide(t, T.laeuft + 0.2, 0.3);
  const live = sq * show(t, T.seiten, 0.35) * clamp((Math.abs(a - 1) - 0.15) / 0.15);
  const one = vis.height1(t) * st * show(t, T.einsHoch + 0.45, 0.3);
  const foot2 = footOn(r2, r1, r3);
  // Seitenlängen und Höhe fliegen aus der Diagonale der kleinen Matrix
  const g = GEO_MINI;
  const flyFrom = (i: number): V2 => cellAt(g, i, i);
  const fly = (from: V2, to: V2, at: number, tex: string, key: string) => {
    const x = clamp((t - at) / FLY);
    if (t < at || x >= 1) return null;
    const e = easeInOutCubic(x);
    return (
      <div key={key} style={{position: 'absolute', left: lerp(from[0], to[0], e), top: lerp(from[1], to[1], e) - Math.sin(Math.PI * e) * 40, transform: 'translate(-50%, -50%)', textShadow: shadow}}>
        <Tex tex={tex} size={46} />
      </div>
    );
  };
  const sideA = mid([0, 0, 0], r2);
  const sideB = mid([0, 0, 0], r3);
  const hMid: V3 = [0.5, 1, 1];
  const pA = project(t, sideA);
  const pB = project(t, sideB);
  const pH = project(t, hMid);
  const sideTex = num(Math.abs(a - 1));
  return (
    <AbsoluteFill>
      <Label3 t={t} q={addV(r1, [0.25, 0, 0])} dy={-34} o={names}>
        <Tex tex={Z(1)} size={44} />
      </Label3>
      <Label3 t={t} q={r2} dx={40} dy={-30} o={names}>
        <Tex tex={Z(2)} size={44} />
      </Label3>
      <Label3 t={t} q={r3} dx={-36} dy={-34} o={names}>
        <Tex tex={Z(3)} size={44} />
      </Label3>
      <Label3 t={t} q={mid(r1, r3)} dy={64} o={base}>
        <Chip text="Grundfläche" color={COL.base} glow={bump(t, T.basis + 0.6, 1.0) + bump(t, T.parallel + 0.3, 1.0) + bump(t, T.gfGleich, 1.0)} />
      </Label3>
      <Label3 t={t} q={mid(r2, foot2)} dx={84} o={h2}>
        <Chip text="Höhe" color={C.txt} glow={bump(t, T.abstand + 0.6, 1.0) + bump(t, T.bleibt, 1.0) + bump(t, T.hoeheGleich, 1.0)} />
      </Label3>
      <Label3 t={t} q={sideA} dy={36} o={sides}>
        <Tex tex="2" size={46} />
      </Label3>
      <Label3 t={t} q={sideB} dy={36} o={sides}>
        <Tex tex="2" size={46} />
      </Label3>
      <Label3 t={t} q={sideA} dy={36} o={live}>
        <Tex tex={sideTex} size={44} />
      </Label3>
      <Label3 t={t} q={sideB} dy={36} o={live}>
        <Tex tex={sideTex} size={44} />
      </Label3>
      <Label3 t={t} q={hMid} dx={-40} o={one}>
        <Tex tex="1" size={46} />
      </Label3>
      {fly(flyFrom(0), [pH[0] - 40, pH[1]], T.einsHoch - 0.25, '1', 'fh')}
      <HookTag />
    </AbsoluteFill>
  );
};

// Im Hook: welcher Wert von a gerade im Raum gezeigt wird
const HookTag: React.FC = () => {
  const t = useSec();
  const o = show(t, 0.6, 0.5) * hide(t, T.ueberall - 0.3, 0.4);
  if (o <= 0) return null;
  const a = aShown(t);
  const g = bump(t, A_HOOK[0] + A_HOOK[1] - 0.1, 1.0);
  return (
    <div style={{position: 'absolute', left: 110, top: 930, opacity: o, transform: `scale(${1 + 0.12 * g})`, transformOrigin: 'left center', textShadow: `0 0 ${10 + 24 * g}px rgba(255,194,71,${0.3 + 0.5 * g}), ${shadow}`}}>
      <Tex tex={`${AM('a')} = ${AM(num(a))}`} size={44} />
    </div>
  );
};

/* ---------- Merksatz ---------- */

const Merksatz: React.FC = () => {
  const t = useSec();
  const p = springOS(clamp((t - (T.merk - 0.1)) / 0.7));
  const out = hide(t, T.cta - 0.2, 0.4);
  if (p <= 0 || out <= 0) return null;
  const lines: [string, number][] = [
    ['① Zeilen abziehen → Nullen unter der Diagonale', T.nullen],
    ['② Diagonale multiplizieren', T.dann],
    ['③ det = 0 setzen → Ausnahmen', T.dann + 1.3],
  ];
  return (
    <div
      style={{
        position: 'absolute',
        left: MARGIN,
        width: W - 2 * MARGIN,
        top: 640,
        boxSizing: 'border-box',
        padding: '34px 40px 30px',
        borderRadius: 30,
        border: '1.5px solid rgba(255,255,255,.22)',
        background: 'linear-gradient(180deg, rgba(24,26,62,.92), rgba(12,13,36,.9))',
        boxShadow: '0 30px 90px rgba(0,0,0,.4), 0 0 80px rgba(30,139,219,.18)',
        opacity: clamp(p * 1.4) * out,
        transform: `translateY(${(1 - p) * 30}px) scale(${0.96 + 0.04 * p})`,
      }}
    >
      <div style={{fontFamily: F.mono, fontWeight: 600, fontSize: 22, letterSpacing: '.1em', color: C.eig}}>FÜR DIE KLAUSUR · DETERMINANTE MIT PARAMETER</div>
      {lines.map(([s, at], i) => {
        const g = bump(t, at, 1.4);
        const k = show(t, T.merk + 0.25 + 0.2 * i, 0.4);
        return (
          <div
            key={i}
            style={{
              marginTop: i === 0 ? 26 : 16,
              fontFamily: F.display,
              fontWeight: 700,
              fontSize: 38,
              color: C.txt,
              opacity: k,
              transform: `translateX(${(1 - k) * -16}px) scale(${1 + 0.04 * g})`,
              transformOrigin: 'left center',
              textShadow: g > 0.02 ? `0 0 ${24 * g}px rgba(255,194,71,${0.7 * g})` : undefined,
            }}
          >
            {s}
          </div>
        );
      })}
      <div style={{marginTop: 24, fontFamily: F.body, fontWeight: 500, fontSize: 26, color: C.txt2, opacity: show(t, T.merk + 0.9, 0.4)}}>
        Nur Abziehen lässt det gleich. Zeilen tauschen dreht das Vorzeichen.
      </div>
    </div>
  );
};

/* ---------- Logo: klein in der Karte, im CTA in die Mitte ---------- */

const LogoMark: React.FC = () => {
  const t = useSec();
  const a = show(t, 2.2, 0.7);
  if (a <= 0) return null;
  const k = prog(t, T.cta, 0.9);
  const size = lerp(56, 248, k);
  const cx = lerp(W - MARGIN - 34 - 28, 540, k);
  const cy = lerp(CARD.top + 36, 700, k);
  const glint = clamp((t - 2.2) / 1.1);
  return (
    <div style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, opacity: a * lerp(0.9, 1, k)}}>
      <Img src={staticFile('unimathe-logo.webp')} style={{width: size, height: size, borderRadius: size * 0.223, boxShadow: `0 ${10 + 20 * k}px ${30 + 60 * k}px rgba(30,139,219,${0.25 + 0.2 * k})`, display: 'block'}} />
      {glint > 0 && glint < 1 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: size * 0.223,
            background: `linear-gradient(115deg, rgba(255,255,255,0) ${glint * 140 - 40}%, rgba(255,255,255,.55) ${glint * 140 - 20}%, rgba(255,255,255,0) ${glint * 140}%)`,
          }}
        />
      ) : null}
    </div>
  );
};

/* ---------- CTA ---------- */

const Centered: React.FC<{y: number; at: number; size: number; color?: string; weight?: number; children: React.ReactNode}> = ({y, at, size, color = C.txt, weight = 800, children}) => {
  const t = useSec();
  const p = easeOutExpo(clamp((t - at) / 0.5));
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y,
        textAlign: 'center',
        fontFamily: F.display,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: weight >= 800 ? '-.035em' : '-.01em',
        color,
        opacity: p,
        transform: `translateY(${(1 - p) * 24}px)`,
        textShadow: shadow,
      }}
    >
      {children}
    </div>
  );
};

const SearchPill: React.FC = () => {
  const t = useSec();
  const p = springOS(clamp((t - (T.such - 0.1)) / 0.6));
  if (p <= 0) return null;
  const word = 'UniMathe';
  const n = Math.max(0, Math.min(word.length, Math.floor((t - T.tippt) / 0.075) + 1));
  const caret = Math.floor(t * 2.2) % 2 === 0 || n < word.length;
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - 300,
        top: 1180,
        width: 600,
        height: 100,
        borderRadius: 999,
        background: 'rgba(243,244,251,.96)',
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        padding: '0 36px',
        boxSizing: 'border-box',
        opacity: clamp(p * 1.4),
        transform: `scale(${0.85 + 0.15 * p})`,
        boxShadow: '0 20px 70px rgba(30,139,219,.35)',
      }}
    >
      <svg width={40} height={40} viewBox="0 0 40 40">
        <circle cx={17} cy={17} r={11} fill="none" stroke={C.bg} strokeWidth={4} />
        <line x1={25} y1={25} x2={35} y2={35} stroke={C.bg} strokeWidth={4} strokeLinecap="round" />
      </svg>
      <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 48, color: C.bg}}>
        {word.slice(0, n)}
        <span style={{opacity: caret ? 1 : 0, color: C.blue, fontWeight: 400}}>|</span>
      </span>
    </div>
  );
};

const Outro: React.FC = () => {
  const t = useSec();
  if (t < T.cta) return null;
  return (
    <AbsoluteFill>
      <Centered y={846} at={T.cta + 0.35} size={104}>
        UniMathe
      </Centered>
      <Centered y={980} at={T.cta + 0.7} size={42} color={C.txt2} weight={600}>
        Mathe verstehen und üben.
      </Centered>
      <Mono x={540} y={1120} at={T.such - 0.2} anchor="center" color={C.txt2}>
        Im App Store suchen
      </Mono>
      <SearchPill />
    </AbsoluteFill>
  );
};

/* ---------- Untertitel, Blitz ---------- */

const RAW = SUBTITLES;
const CUES = RAW.map(([a, b, text], i) => {
  const next = RAW[i + 1] ? RAW[i + 1][0] - 0.1 : Infinity;
  return {from: a - 0.05, to: Math.min(b + 0.3, next), text};
});
const SUB_TOP = 1446;
const Subtitles: React.FC = () => {
  const t = useSec();
  const c = CUES.find(({from, to}) => t >= from && t < to);
  if (!c) return null;
  const o = (t < 0.1 ? 1 : clamp((t - c.from) / 0.12)) * clamp((c.to - t) / 0.12);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: SUB_TOP, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{maxWidth: 820, padding: '8px 18px', borderRadius: 12, background: 'rgba(7,8,26,.62)', fontFamily: F.body, fontWeight: 500, fontSize: 30, lineHeight: 1.3, color: 'rgba(243,244,251,.88)', textAlign: 'center'}}>
        {c.text}
      </div>
    </div>
  );
};

const FLAT_HOOK = A_HOOK[0] + A_HOOK[1];
const FLAT_SLIDE = SLIDE1[0] + SLIDE1[1];
const Flash: React.FC = () => {
  const t = useSec();
  const f = Math.max(bump(t, 0, 0.22) * 0.8, bump(t, FLAT_HOOK - 0.05, 0.4) * 0.6, bump(t, T.antwort + 0.3, 0.4) * 0.6, bump(t, FLAT_SLIDE - 0.05, 0.4) * 0.6);
  return f > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.1 * f}} /> : null;
};

/* ---------- Ton ---------- */

const SFX: [number, string, number][] = [
  [0, 'whoosh', 0.5],
  [0, 'accent_small', 0.35],
  [T.frage + 0.9, 'tick', 0.28],
  [A_HOOK[0], 'rise', 0.26],
  [FLAT_HOOK - 0.05, 'collapse', 0.45],
  [T.nicht, 'click', 0.3],
  [A_BACK[0], 'whoosh', 0.22],
  [T.einzige + 0.1, 'tick', 0.32],
  [T.ueberall - 0.5, 'whoosh', 0.26],
  [T.diag + 0.6, 'tick', 0.26],
  [F2, 'whoosh', 0.22],
  [land(F2, 0), 'click', 0.26],
  [T.aendert, 'tick', 0.28],
  [RES2[0], 'lock', 0.34],
  [T.m2 + 0.15, 'tick', 0.28],
  [RES2[2], 'lock', 0.34],
  [F3, 'whoosh', 0.22],
  ...RES3.map((r) => [r, 'click', 0.28] as [number, string, number]),
  [T.dreieck, 'swell', 0.28],
  [T.diagonale - 0.15, 'tick', 0.26],
  [T.diagonale + 0.15, 'tick', 0.26],
  [T.diagonale + 0.45, 'tick', 0.26],
  [T.quadrat, 'lock', 0.38],
  [T.ungleich, 'tick', 0.28],
  [T.eins2 - 0.2, 'click', 0.3],
  [T.antwort + 0.3, 'accent', 0.5],
  [T.warum, 'whoosh', 0.32],
  [T.pfeil + 0.1, 'click', 0.24],
  [T.pfeil + 0.35, 'click', 0.24],
  [T.pfeil + 0.6, 'click', 0.24],
  [T.drei + 0.15, 'tick', 0.3],
  [FLY3() + FLY, 'click', 0.28],
  [T.vier2, 'lock', 0.34],
  [T.gxh, 'swell', 0.22],
  [T.basis + 0.3, 'tick', 0.26],
  [T.abstand + 0.2, 'tick', 0.26],
  [T.zieh + 0.2, 'swell', 0.24],
  [SHEAR2[0], 'rise', 0.26],
  [T.hoeheGleich, 'tick', 0.26],
  [T.gfGleich, 'tick', 0.26],
  [T.vier3, 'lock', 0.34],
  [SHEAR2[0] + SHEAR2[1] - 0.05, 'lock', 0.36],
  [SHEAR3[0], 'rise', 0.24],
  [SHEAR3[0] + SHEAR3[1] - 0.05, 'lock', 0.36],
  [T.quadrat2 + 0.2, 'swell', 0.26],
  [T.zweiMal, 'tick', 0.3],
  [T.einsHoch + 0.3, 'tick', 0.3],
  [T.produkt2 + 1.2, 'lock', 0.34],
  [T.diagZahlen, 'tick', 0.28],
  [T.diagProd, 'lock_hi', 0.4],
  [SLIDE1[0], 'rise', 0.3],
  [FLAT_SLIDE - 0.05, 'collapse', 0.5],
  [T.keineInv, 'accent', 0.4],
  [SLIDE2[0] + 0.4, 'rise', 0.22],
  [T.merk - 0.1, 'whoosh', 0.3],
  [T.nullen, 'tick', 0.26],
  [T.dann, 'tick', 0.26],
  [T.cta - 0.1, 'swell', 0.34],
  ...Array.from({length: 8}, (_, i) => [T.tippt + i * 0.075, 'tick', 0.18] as [number, string, number]),
];

/* ---------- Komposition ---------- */

// Jeder Sprechabschnitt als eigener Clip, mit kurzem Vor- und Nachlauf aus der Stille der Aufnahme
const LEAD = 0.08;
const TAIL = 0.1;

export type KIProps = {music: boolean; voice: boolean};

export const VideoKI: React.FC<KIProps> = ({music, voice}) => {
  useTexFonts();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={1100} strength={0.9} />
      <Scene />
      <SpaceLabels />
      <BigMatrix />
      <Calc />
      <MiniMatrix />
      <VolumeReadout />
      <WarumLabel />
      <Progress />
      <TaskCard />
      <Merksatz />
      <Outro />
      <LogoMark />
      <Subtitles />
      <Flash />
      <Grain />
      {SFX.map(([at, name, vol], i) => (
        <Sequence key={`sfx-${i}`} from={sec(Math.max(0, at))} durationInFrames={sec(3.5)} layout="none">
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol * (voice ? 0.55 : 0.8)} />
        </Sequence>
      ))}
      {music ? <Audio src={staticFile(MUSIC)} volume={voice ? 0.3 : 0.6} /> : null}
      {voice
        ? CLIPS.map((c) => {
            const lead = Math.min(LEAD, c.from, c.at);
            return (
              <Sequence key={c.key} from={sec(c.at - lead)} durationInFrames={sec(c.to - c.from + lead + TAIL)} layout="none">
                <Audio src={staticFile(VOICES[c.take])} trimBefore={sec(c.from - lead)} trimAfter={sec(c.to + TAIL)} />
              </Sequence>
            );
          })
        : null}
    </AbsoluteFill>
  );
};

export {camAt, R1, s2At, s3At};
