import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C, MARGIN, W} from '../theme';
import {F, useTexFonts} from '../fonts';
import {V2, bump, clamp, easeInCubic, easeInOutCubic, easeOutExpo, fmtDe, lerp, prog, sec, springOS} from '../math';
import {Backdrop, Grain, Mono, Tex, col, useSec} from '../ui';
import {V3} from '../space';
import {COL, Scene} from './Canvas';
import {FLAT, SLIDE, STEP_A, STEP_B, STEP_C, aAt, addV, footOf, project, rowsT, vis} from './world';
import {CLIPS, MUSIC, SUBTITLES, T, VOICE} from './timeline';

const show = (t: number, at: number, d = 0.4) => easeOutExpo(clamp((t - at) / d));
const hide = (t: number, at: number, d = 0.35) => 1 - easeInOutCubic(clamp((t - at) / d));
const shadow = `0 0 14px ${C.bg}, 0 0 30px ${C.bg}`;
const AM = (s: string) => col(COL.a, s);
const CY = (s: string) => col(COL.r1, s);
const BL = (s: string) => col(COL.r2, s);
const Z = (n: 1 | 2 | 3) => col(n === 1 ? COL.r1 : n === 2 ? COL.r2 : COL.r3, `Z_${n}`);
const ROWC = [COL.r1, COL.r2, COL.r3];
const GREEN = '#7BEA9C';
const RED = '#FF6B6B';

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

// Eintrag mit Zuständen [ab Zeit, TeX, Skalierung, Rolldauer]; Wechsel rollen nach oben aus und von unten ein
type CState = [number, string, number?, number?];
type Cell = {states: CState[]; glow?: number; o?: number; color?: string; roll?: number};

const CellView: React.FC<{t: number; g: Geo; i: number; j: number; c: Cell}> = ({t, g, i, j, c}) => {
  const [x, y] = cellAt(g, i, j);
  let k = 0;
  c.states.forEach(([at], n) => {
    if (t >= at) k = n;
  });
  const roll = c.states[k][3] ?? c.roll ?? 0.38;
  const p = k > 0 ? easeInOutCubic(clamp((t - c.states[k][0]) / roll)) : 1;
  const off = g.rh * 0.3;
  const glow = c.glow ?? 0;
  const layer = (st: CState, o: number, dy: number) =>
    o > 0.01 ? (
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y + dy,
          transform: `translate(-50%, -50%) scale(${(st[2] ?? 1) * (1 + 0.14 * glow)})`,
          opacity: o * (c.o ?? 1),
          whiteSpace: 'nowrap',
          textShadow: glow > 0.02 ? `0 0 ${10 + 26 * glow}px ${c.color ?? 'rgba(255,255,255,.8)'}, ${shadow}` : shadow,
        }}
      >
        <Tex tex={st[1]} size={g.size} />
      </div>
    ) : null;
  return (
    <>
      {p < 1 ? layer(c.states[k - 1], clamp(1 - 1.6 * p), -p * off) : null}
      {layer(c.states[k], clamp(1.6 * p - 0.6), (1 - p) * off)}
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
                left: left - g.size * 0.3 - 7,
                top: g.cy + (i - 1) * g.rh - 7,
                width: 14,
                height: 14,
                borderRadius: 7,
                background: ROWC[i],
                opacity: dots * o,
                boxShadow: `0 0 ${10 + 20 * dotGlow[i]}px ${ROWC[i]}`,
                transform: `scale(${1 + 0.6 * dotGlow[i]})`,
              }}
            />
          ))
        : null}
    </>
  );
};

/* ---------- Die große Matrix: Hook und Gauß ---------- */

const GEO: Geo = {cx: 470, cy: 850, cw: 232, rh: 124, size: 76};

// Zählrad im Eintrag a: 0, 5, −3 (✓), dann dreht es und bleibt bei „?“ stehen
const SPIN_D = 0.17;
const SPIN = (() => {
  const vals = ['7', '-1', '4', '9', '-6', '3', '8', '-4', '6', '-2'];
  const out: CState[] = [];
  const n = Math.max(3, Math.floor((T.findest - 0.1 - (T.wert + 0.05)) / SPIN_D));
  for (let k = 0; k < n; k++) out.push([T.wert + 0.05 + k * SPIN_D, AM(vals[k % vals.length])]);
  out.push([T.findest - 0.1, col(RED, '?')]);
  return out;
})();
const A_BACK = T.rang - 0.2;

// Die drei Umformungen als schriftliche Subtraktion im Rechenbereich unter der Matrix:
// Zielzeile und abzuziehende Zeile rutschen als Kopien nach unten, Strich, Ergebnis Spalte für Spalte mit der Stimme,
// dann fliegt das Ergebnis zurück in die Matrix. In der Matrix liegen dabei nie zwei Zahlen übereinander.
const A_1 = `${AM('a')}{-}1`;
const A_2 = `${AM('a')}{-}2`;
type Op = {
  start: number;
  target: number;
  src: number;
  tVals: string[];
  sVals: string[];
  sLabel: string;
  kVals?: string[];
  kLabel?: string;
  res: string[];
  resAt: number[];
};
const OPS: Op[] = [
  {start: T.op2, target: 1, src: 0, tVals: ['2', '5', '3'], sVals: ['1', '2', '1'], sLabel: Z(1), kVals: ['2', '4', '2'], kLabel: `${CY('2')}\\cdot ${Z(1)}`, res: ['0', '1', '1'], resAt: [T.r2a, T.r2b, T.r2c]},
  {start: T.op3, target: 2, src: 0, tVals: ['1', '3', AM('a')], sVals: ['1', '2', '1'], sLabel: Z(1), res: ['0', '1', A_1], resAt: [T.r3a, T.r3b, T.r3c]},
  {start: T.op4, target: 2, src: 1, tVals: ['0', '1', A_1], sVals: ['0', '1', '1'], sLabel: Z(2), res: ['0', '0', A_2], resAt: [T.r4a, T.r4b, T.r4c]},
];
const DOWN = 0.6;
const UP = 0.6;
const opTimes = (op: Op) => {
  const down1 = op.start + 0.25;
  const down2 = op.start + 0.8;
  const k = op.kVals ? Math.max(T.zweimal, op.start + 1.45) : -1;
  const line = op.kVals ? k + 0.45 : op.start + 1.4;
  const up = op.resAt[2] + 0.5;
  return {down1, down2, k, line, up, land: (j: number) => up + 0.08 * j + UP};
};
const OPT = OPS.map(opTimes);
// Rechenbereich: Zeilen unter der Matrix, Spalten genau unter den Matrixspalten
const CALC = {ty: 1150, sy: 1236, line: 1284, ry: 1338, size: 60, labelX: 192};

// Fallunterscheidung im letzten Eintrag
const CASE = {five: T.fuerA + 0.35, three: T.drei, two: T.beiA2 + 0.35, zero: T.letzte, gray: T.komplett};
// Matrix, Treppe und Fallunterscheidung bleiben bis zu den Pfeilen im Raum stehen
const BIG_OUT = T.pfeile - 0.5;

const bigCells = (t: number): Cell[][] => {
  const r0: Cell[] = ['1', '2', '1'].map((s) => ({states: [[0, s]]}));
  // Zeile i der Matrix nach den Umformungen: leer, sobald das Ergebnis losfliegt, neuer Wert bei der Landung
  const opStates = (i: number, j: number): CState[] =>
    OPS.flatMap((op, n) =>
      op.target === i
        ? ([
            [OPT[n].up + 0.08 * j, '', 1, 0.25],
            [OPT[n].land(j), op.res[j], 1, 0.01],
          ] as CState[])
        : [],
    );
  const r1: Cell[] = ['2', '5', '3'].map((v, j) => ({states: [[0, v], ...opStates(1, j)]}));
  const r2: Cell[] = [
    {states: [[0, '1'], ...opStates(2, 0)]},
    {states: [[0, '3'], ...opStates(2, 1)]},
    {
      states: [
        [0, AM('a')],
        [T.null - 0.12, AM('0')],
        [T.fuenf - 0.05, AM('5')],
        [T.minus3 - 0.05, AM('-3')],
        ...SPIN,
        [A_BACK, AM('a')],
        ...opStates(2, 2),
        [CASE.five, `${AM('5')}{-}2`],
        [CASE.three, AM('3')],
        [CASE.two, `${AM('2')}{-}2`],
        [CASE.zero, '0'],
        [T.faelle + 0.2, A_2],
      ],
      color: COL.a,
    },
  ];
  // Zählrad dreht schnell
  r2[2].roll = t > T.wert && t < T.findest + 0.2 ? 0.14 : 0.36;
  const R = [r0, r1, r2];
  // Zeilen leuchten bei „wie viele Zeilen“, Pivot-Einträge bei „Pivot“
  const rows = [0, 1, 2].map((i) => bump(t, T.zeilen + 0.25 * i, 1.0));
  R.forEach((row, i) => row.forEach((c) => (c.glow = rows[i] * 0.8)));
  R[0][0].glow = (R[0][0].glow ?? 0) + bump(t, T.einsOben, 1.1) + bump(t, T.pivots, 0.9);
  R[1][1].glow = (R[1][1].glow ?? 0) + bump(t, T.mitte, 1.1) + bump(t, T.pivots + 0.25, 0.9);
  R[2][2].glow = (R[2][2].glow ?? 0) + bump(t, T.pivots + 0.5, 0.9) + bump(t, CASE.three, 1.0) + bump(t, T.matrix + 0.6, 1.2);
  R[2][2].color = COL.a;
  // gelandete Ergebnisse leuchten kurz auf
  OPS.forEach((op, n) => [0, 1, 2].forEach((j) => (R[op.target][j].glow = (R[op.target][j].glow ?? 0) + bump(t, OPT[n].land(j), 0.9) * 0.9)));
  // Nullen unter den Pivots treten zurück, sobald die Treppe steht
  const zeroDim = prog(t, T.zahl - 0.2, 0.6);
  for (const [i, j] of [[1, 0], [2, 0], [2, 1]]) R[i][j].o = 1 - 0.5 * zeroDim;
  // Ergebnis von Z₂ fliegt an Zeile 3 vorbei nach oben: Zeile 3 tritt währenddessen zurück
  const pass = clamp((t - (OPT[0].up - 0.1)) / 0.2) * (1 - clamp((t - (OPT[0].land(2) + 0.05)) / 0.25));
  for (const j of [0, 1, 2]) R[2][j].o = (R[2][j].o ?? 1) * (1 - 0.8 * pass);
  // a = 2: die ganze letzte Zeile wird grau, bis die Fallunterscheidung steht
  const gray = prog(t, CASE.gray, 0.5) * hide(t, T.faelle + 0.2, 0.4);
  for (const j of [0, 1, 2]) R[2][j].o = (R[2][j].o ?? 1) * (1 - 0.55 * gray);
  return R;
};

// Pivot-Ringe und Treppe
const Staircase: React.FC<{t: number; g: Geo}> = ({t, g}) => {
  const ghost = show(t, T.stufenform, 0.5) * hide(t, T.pivot - 0.2, 0.4);
  const solid = prog(t, T.zahl - 0.3, 0.9);
  const xL = g.cx - 1.5 * g.cw;
  const x01 = g.cx - 0.5 * g.cw;
  const x12 = g.cx + 0.5 * g.cw;
  const yT = g.cy - 1.5 * g.rh;
  const y01 = g.cy - 0.5 * g.rh;
  const y12 = g.cy + 0.5 * g.rh;
  const yB = g.cy + 1.5 * g.rh;
  const path = `M ${xL} ${y01} L ${x01} ${y01} L ${x01} ${y12} L ${x12} ${y12} L ${x12} ${yB}`;
  const zeros = `M ${xL} ${y01} L ${x01} ${y01} L ${x01} ${y12} L ${x12} ${y12} L ${x12} ${yB} L ${xL} ${yB} Z`;
  const L = g.cw * 2 + g.rh * 2;
  // Ringe: Pivot 1 ab „Eins oben links“, Pivot 2 ab „Eins in der Mitte“, Pivot 3 gestrichelt ab der Treppe
  const ring1 = show(t, T.einsOben, 0.4) * hide(t, BIG_OUT, 0.4);
  const ring2 = show(t, T.mitte, 0.4) * hide(t, BIG_OUT, 0.4);
  const ring3 = show(t, T.zahl + 0.3, 0.4) * hide(t, CASE.zero, 0.3);
  const solid3 = prog(t, CASE.three, 0.3) * hide(t, CASE.two, 0.3);
  const [p0x, p0y] = cellAt(g, 0, 0);
  const [p1x, p1y] = cellAt(g, 1, 1);
  const [p2x, p2y] = cellAt(g, 2, 2);
  const nums = show(t, T.pivots - 0.1, 0.4) * hide(t, BIG_OUT, 0.4);
  const ringStyle = (o: number, c: string, glow: number): React.SVGProps<SVGEllipseElement> => ({
    fill: 'none',
    stroke: c,
    strokeWidth: 4,
    opacity: o,
    style: {filter: `drop-shadow(0 0 ${6 + 16 * glow}px ${c})`},
  });
  const badge = (x: number, y: number, n: string, c: string, o: number) =>
    o > 0 ? (
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          transform: 'translate(-50%, -50%)',
          width: 38,
          height: 38,
          borderRadius: 19,
          background: c,
          color: C.bg,
          fontFamily: F.display,
          fontWeight: 800,
          fontSize: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: o,
        }}
      >
        {n}
      </div>
    ) : null;
  return (
    <>
      <svg width={W} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {solid > 0 ? <path d={zeros} fill={`rgba(126,132,173,${0.12 * solid})`} /> : null}
        {ghost > 0 ? <path d={path} fill="none" stroke={C.eig} strokeWidth={3} strokeDasharray="10 12" opacity={ghost * 0.85} strokeLinecap="round" /> : null}
        {solid > 0 ? (
          <path
            d={path}
            fill="none"
            stroke={C.eig}
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={L}
            strokeDashoffset={L * (1 - solid)}
            opacity={hide(t, BIG_OUT, 0.4)}
            style={{filter: 'drop-shadow(0 0 8px rgba(255,194,71,.7))'}}
          />
        ) : null}
        {ring1 > 0 ? <ellipse cx={p0x} cy={p0y} rx={56} ry={54} {...ringStyle(ring1, COL.r1, bump(t, T.einsOben, 1) + bump(t, T.pivots, 0.9))} /> : null}
        {ring2 > 0 ? <ellipse cx={p1x} cy={p1y} rx={56} ry={54} {...ringStyle(ring2, COL.r2, bump(t, T.mitte, 1) + bump(t, T.pivots + 0.25, 0.9))} /> : null}
        {ring3 > 0 ? (
          <ellipse cx={p2x} cy={p2y} rx={104} ry={56} {...ringStyle(ring3, COL.a, bump(t, CASE.three, 1))} strokeDasharray={solid3 > 0.5 ? undefined : '9 9'} />
        ) : null}
      </svg>
      {badge(p0x - 52, p0y - 50, '1', COL.r1, nums)}
      {badge(p1x - 52, p1y - 50, '2', COL.r2, nums)}
      {badge(p2x - 98, p2y - 50, '3', COL.a, nums * solid3)}
    </>
  );
};

// Hook: rote Umrandung um das „?“
const QFrame: React.FC<{t: number; g: Geo}> = ({t, g}) => {
  const o = show(t, T.findest - 0.1, 0.3) * hide(t, A_BACK, 0.3);
  if (o <= 0) return null;
  const [x, y] = cellAt(g, 2, 2);
  const gl = bump(t, T.findest - 0.05, 0.9);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 62,
        top: y - 60,
        width: 124,
        height: 120,
        borderRadius: 22,
        border: `4px solid ${RED}`,
        boxShadow: `0 0 ${16 + 30 * gl}px rgba(255,107,107,.6)`,
        opacity: o,
        transform: `scale(${1 + 0.08 * gl})`,
      }}
    />
  );
};

// Hervorhebung der beteiligten Matrixzeilen während einer Umformung
const RowBands: React.FC<{t: number; g: Geo; op: Op; tm: ReturnType<typeof opTimes>}> = ({t, g, op, tm}) => {
  const on = (at: number) => clamp((t - at) / 0.3) * (1 - clamp((t - (tm.land(2) + 0.3)) / 0.4));
  const band = (i: number, k: number, c: string) =>
    k > 0 ? (
      <div
        style={{
          position: 'absolute',
          left: g.cx - g.cw * 1.62,
          top: g.cy + (i - 1) * g.rh - g.rh * 0.44,
          width: g.cw * 3.24,
          height: g.rh * 0.88,
          borderRadius: 16,
          background: `${c}${Math.round(0x1c * k).toString(16).padStart(2, '0')}`,
          boxShadow: `inset 0 0 0 2px ${c}${Math.round(0x80 * k).toString(16).padStart(2, '0')}`,
        }}
      />
    ) : null;
  return (
    <>
      {band(op.target, on(tm.down1), ROWC[op.target])}
      {band(op.src, on(tm.down2) * (1 - clamp((t - tm.up) / 0.4)), ROWC[op.src])}
    </>
  );
};

// Schriftliche Subtraktion unter der Matrix
const RowOp: React.FC<{t: number; g: Geo; op: Op; tm: ReturnType<typeof opTimes>}> = ({t, g, op, tm}) => {
  if (t < tm.down1 || t > tm.land(2) + 0.05) return null;
  const fadeOut = 1 - clamp((t - tm.up) / 0.35);
  const sc = CALC.size / g.size;
  const xs = [0, 1, 2].map((j) => cellAt(g, 0, j)[0]);
  // Kopie einer Matrixzeile rutscht nach unten an ihren Platz im Rechenbereich
  const slide = (from: number, at: number, y: number, vals: string[], color: string, keyP: string, glowAt: number[]) =>
    vals.map((v, j) => {
      const k = easeInOutCubic(clamp((t - (at + 0.06 * j)) / DOWN));
      if (t < at + 0.06 * j) return null;
      const [sx, sy] = cellAt(g, from, j);
      const x = lerp(sx, xs[j], k);
      const yy = lerp(sy, y, k);
      const s2 = lerp(1, sc, k);
      const gl = Math.max(...glowAt.map((a) => bump(t, a - 0.05, 0.8)));
      return (
        <div
          key={`${keyP}${j}`}
          style={{
            position: 'absolute',
            left: x,
            top: yy,
            transform: `translate(-50%, -50%) scale(${s2 * (1 + 0.12 * gl)})`,
            opacity: clamp(k * 3) * fadeOut,
            whiteSpace: 'nowrap',
            textShadow: `0 0 ${10 + 22 * gl}px ${gl > 0.02 ? color : 'transparent'}, ${shadow}`,
          }}
        >
          <Tex tex={v} size={g.size} />
        </div>
      );
    });
  const sVals = op.kVals && t >= tm.k + 0.2 ? op.kVals : op.sVals;
  const kGlow = op.kVals ? bump(t, tm.k, 0.9) : 0;
  const label = (y: number, tex: string, at: number, glow = 0) => {
    const p = show(t, at, 0.35) * fadeOut;
    if (p <= 0) return null;
    return (
      <div style={{position: 'absolute', left: CALC.labelX, top: y, transform: `translate(-100%, -50%) scale(${1 + 0.12 * glow})`, transformOrigin: 'right center', opacity: p, whiteSpace: 'nowrap', textShadow: shadow}}>
        <Tex tex={tex} size={34} />
      </div>
    );
  };
  const lineP = prog(t, tm.line, 0.4);
  return (
    <>
      {label(CALC.ty, Z((op.target + 1) as 1 | 2 | 3), tm.down1 + 0.3)}
      {label(CALC.sy, `-\\;${op.kVals && t >= tm.k + 0.2 ? op.kLabel! : op.sLabel}`, tm.down2 + 0.3, kGlow)}
      {slide(op.target, tm.down1, CALC.ty, op.tVals, ROWC[op.target], 't', op.resAt)}
      {slide(op.src, tm.down2, CALC.sy, sVals, ROWC[op.src], 's', op.resAt)}
      {/* ·2: die Zeile wird verdoppelt, bevor abgezogen wird */}
      {op.kVals && t > tm.k - 0.1 ? (
        <div
          style={{
            position: 'absolute',
            left: xs[2] + 130,
            top: CALC.sy,
            transform: `translate(-50%, -50%) scale(${1 + 0.2 * kGlow})`,
            opacity: show(t, tm.k - 0.1, 0.3) * hide(t, tm.line + 0.6, 0.4),
            textShadow: shadow,
          }}
        >
          <Tex tex={col(COL.r1, '\\cdot 2')} size={44} />
        </div>
      ) : null}
      {lineP > 0 && fadeOut > 0 ? (
        <div style={{position: 'absolute', left: CALC.labelX - 70, top: CALC.line - 1.5, width: (xs[2] + 90 - (CALC.labelX - 70)) * lineP, height: 3, borderRadius: 2, background: C.txt, opacity: 0.85 * fadeOut}} />
      ) : null}
      {/* Ergebnis: Spalte für Spalte mit der Stimme, dann Flug zurück in die Matrix */}
      {op.res.map((v, j) => {
        if (t < op.resAt[j] - 0.05) return null;
        const pIn = easeOutExpo(clamp((t - (op.resAt[j] - 0.05)) / 0.35));
        const upStart = tm.up + 0.08 * j;
        const f = easeInOutCubic(clamp((t - upStart) / UP));
        if (t > tm.land(j)) return null;
        const [ex, ey] = cellAt(g, op.target, j);
        const x = lerp(xs[j], ex, f);
        const y = lerp(CALC.ry + (1 - pIn) * 16, ey, f) - Math.sin(Math.PI * f) * 30;
        const gl = bump(t, op.resAt[j], 0.9);
        return (
          <div
            key={`r${j}`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `translate(-50%, -50%) scale(${lerp(sc, 1, f) * (1 + 0.16 * gl)})`,
              opacity: pIn,
              whiteSpace: 'nowrap',
              textShadow: `0 0 ${10 + 26 * gl}px ${gl > 0.02 ? 'rgba(255,255,255,.9)' : 'transparent'}, ${shadow}`,
            }}
          >
            <Tex tex={v} size={g.size} />
          </div>
        );
      })}
    </>
  );
};

const BigMatrix: React.FC = () => {
  const t = useSec();
  const o = hide(t, BIG_OUT, 0.6);
  if (o <= 0) return null;
  const g = GEO;
  const cells = bigCells(t);
  const appear = springOS(clamp((t - 0.02) / 0.6));
  const dotGlow = [0, 1, 2].map((i) => bump(t, T.zeilen + 0.25 * i, 1.0));
  OPS.forEach((op, n) => {
    dotGlow[op.target] += bump(t, OPT[n].down1, 1.0);
    dotGlow[op.src] += bump(t, OPT[n].down2, 1.0);
  });
  return (
    <AbsoluteFill style={{opacity: o * clamp(appear * 1.3), transform: `scale(${0.94 + 0.06 * appear})`}}>
      <Staircase t={t} g={g} />
      {OPS.map((op, n) => (
        <RowBands key={n} t={t} g={g} op={op} tm={OPT[n]} />
      ))}
      <Brackets g={g} o={1} dots={show(t, T.zeilen - 0.2, 0.4)} dotGlow={dotGlow} />
      {cells.map((row, i) => row.map((c, j) => <CellView key={`${i}${j}`} t={t} g={g} i={i} j={j} c={c} />))}
      <QFrame t={t} g={g} />
      {OPS.map((op, n) => (
        <RowOp key={n} t={t} g={g} op={op} tm={OPT[n]} />
      ))}
    </AbsoluteFill>
  );
};

/* ---------- Zeilen unter der Matrix: Hook-Werte, Begriffe, Umformungen, Fälle ---------- */

const PILL_Y = 1120;
const HookPills: React.FC = () => {
  const t = useSec();
  const out = hide(t, A_BACK, 0.35);
  if (out <= 0 || t < T.null - 0.2) return null;
  const vals: [string, number][] = [
    ['0', T.null - 0.1],
    ['5', T.fuenf],
    ['-3', T.minus3],
  ];
  const red = show(t, T.findest - 0.05, 0.4);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <div style={{position: 'absolute', left: 106, top: PILL_Y - 66, fontFamily: F.mono, fontWeight: 500, fontSize: 22, letterSpacing: '.08em', color: C.txt2, opacity: show(t, T.null - 0.1, 0.4), textShadow: shadow}}>
        INVERTIERBAR
      </div>
      {vals.map(([v, at], i) => {
        const p = springOS(clamp((t - at) / 0.5));
        if (p <= 0) return null;
        const g = bump(t, at + 0.05, 0.8);
        return (
          <div
            key={v}
            style={{
              position: 'absolute',
              left: 106 + i * 250,
              top: PILL_Y,
              transform: `translateY(-50%) scale(${(0.85 + 0.15 * p) * (1 + 0.08 * g)})`,
              transformOrigin: 'left center',
              opacity: clamp(p * 1.4),
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '8px 22px',
              borderRadius: 999,
              border: `2.5px solid rgba(123,234,156,${0.5 + 0.4 * g})`,
              background: 'rgba(12,30,30,.62)',
              boxShadow: `0 0 ${10 + 30 * g}px rgba(123,234,156,${0.15 + 0.3 * g})`,
              whiteSpace: 'nowrap',
            }}
          >
            <Tex tex={`${AM('a')} = ${AM(v)}`} size={40} />
            <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 36, color: GREEN}}>✓</span>
          </div>
        );
      })}
      {red > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: 106,
            top: PILL_Y + 96,
            transform: `translateY(-50%) scale(${0.9 + 0.1 * red})`,
            transformOrigin: 'left center',
            opacity: red,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '8px 24px',
            borderRadius: 999,
            border: `2.5px solid ${RED}`,
            background: 'rgba(40,12,20,.62)',
            boxShadow: '0 0 30px rgba(255,107,107,.3)',
            whiteSpace: 'nowrap',
          }}
        >
          <Tex tex={`${AM('a')} = ${col(RED, '?')}`} size={40} />
          <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 32, color: RED}}>nicht invertierbar ✗</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// Eine Anzeigezeile mit Zuständen: der alte Zustand blendet ganz aus, bevor der neue einblendet (nie zwei übereinander)
type SlotState = [number, ((t: number) => string) | null, ((t: number) => number)?];
const OUT_D = 0.22;
const IN_D = 0.32;
const Slot: React.FC<{t: number; x?: number; y: number; size: number; states: SlotState[]; center?: boolean}> = ({t, x = 96, y, size, states, center}) => {
  let k = -1;
  states.forEach(([at], n) => {
    if (t >= at) k = n;
  });
  if (k < 0) return null;
  const [at, tex, glow] = states[k];
  const fadeOld = clamp((t - at) / OUT_D);
  if (fadeOld < 1 && k > 0 && states[k - 1][1]) {
    const [, pt, pg] = states[k - 1];
    return <SlotView x={x} y={y} size={size} tex={pt!(t)} o={1 - fadeOld} glow={pg ? pg(t) : 0} dy={-8 * fadeOld} center={center} />;
  }
  if (!tex) return null;
  const p = easeOutExpo(clamp((t - at - (k > 0 ? OUT_D : 0)) / IN_D));
  if (p <= 0) return null;
  return <SlotView x={x} y={y} size={size} tex={tex(t)} o={p} glow={glow ? glow(t) : 0} dy={(1 - p) * 12} center={center} />;
};
const SlotView: React.FC<{x: number; y: number; size: number; tex: string; o: number; glow: number; dy: number; center?: boolean}> = ({x, y, size, tex, o, glow, dy, center}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(${center ? '-50%' : '0'}, -50%) translateY(${dy}px) scale(${1 + 0.07 * glow})`,
      transformOrigin: center ? 'center' : 'left center',
      opacity: o,
      whiteSpace: 'nowrap',
      padding: '8px 20px',
      marginLeft: center ? 0 : -20,
      borderRadius: 16,
      background: 'rgba(7,8,26,.6)',
      textShadow: glow > 0.02 ? `0 0 ${10 + 24 * glow}px rgba(255,255,255,${0.5 * glow})` : undefined,
    }}
  >
    <Tex tex={tex} size={size} />
  </div>
);

const TX = (s: string) => `\\text{${s}}`;
const CalcLine: React.FC = () => {
  const t = useSec();
  const o = hide(t, BIG_OUT, 0.5);
  if (o <= 0) return null;
  const g1 = (at: number, d = 1.1) => (x: number) => bump(x, at, d);
  const states: SlotState[] = [
    [T.zaehlt, () => `${TX('Rang = Anzahl Zeilen, die')}\\ ${AM(TX('Neues'))}\\ ${TX('beitragen')}`, g1(T.neues)],
    [T.stufenform - 0.1, () => `${TX('Ziel:')}\\ ${col(C.eig, TX('Stufenform'))}\\ ${TX('(Gauß)')}`, g1(T.gauss)],
    [T.pivot, () => `${TX('Pivot = erster Eintrag')} \\neq 0`, g1(T.ungleichNull)],
    [T.darunter, () => `${TX('darunter:')}\\ ${TX('Nullen erzeugen')}`, g1(T.nullen)],
    [T.op2 - 0.1, null],
    [T.pivot2 - 0.1, () => `${TX('neues Pivot: die')}\\ ${BL('1')}\\ ${TX('in der Mitte')}`, g1(T.mitte)],
    [T.op4 - 0.1, null],
    [T.zahl - 0.1, () => `\\operatorname{rang} A = ${TX('Anzahl der Pivots')}`, g1(T.pivots)],
    [CASE.five - 0.3, () => `${AM('a')} \\neq 2,\\ ${TX('z. B.')}\\ ${AM('a')} = ${AM('5')}`, g1(CASE.five)],
    [CASE.three, () => `${AM('a')} = ${AM('5')}:\\ ${TX('3 Pivots')} \\;\\Rightarrow\\; \\operatorname{rang} A = 3`, g1(CASE.three + 0.2)],
    [T.beiA2 - 0.05, () => `${AM('a')} = ${AM('2')}:\\ ${TX('letzte Zeile wird null')}`, g1(CASE.zero)],
    [T.rangZwei - 0.15, () => `${AM('a')} = ${AM('2')}:\\ ${TX('Nullzeile')} \\;\\Rightarrow\\; \\operatorname{rang} A = 2`, g1(T.rangZwei)],
    [T.faelle + 0.1, null],
  ];
  // Fallunterscheidung bleibt bis zum Raum stehen
  const cs = show(t, T.faelle + 0.3, 0.5);
  const csG = bump(t, T.faelle + 0.5, 1.2);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Slot t={t} x={470} y={1118} size={40} states={states} center />
      {cs > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: 470,
            top: 1150,
            transform: `translate(-50%, -50%) translateY(${(1 - cs) * 16}px) scale(${1 + 0.05 * csG})`,
            opacity: cs,
            padding: '16px 34px',
            borderRadius: 24,
            border: `2px solid rgba(255,194,71,${0.35 + 0.45 * csG})`,
            background: 'rgba(14,14,36,.7)',
            boxShadow: `0 0 ${20 + 40 * csG}px rgba(255,194,71,${0.12 + 0.25 * csG})`,
            whiteSpace: 'nowrap',
          }}
        >
          <Tex tex={`\\operatorname{rang} A(${AM('a')}) = \\begin{cases} 3, & ${AM('a')} \\neq 2 \\\\ 2, & ${AM('a')} = 2 \\end{cases}`} size={46} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- Aufgabenkarte mit Fortschritt a) und b) ---------- */

const CARD = {top: 300, h: 214};
const TaskCard: React.FC = () => {
  const t = useSec();
  const appear = springOS(clamp((t + 0.05) / 0.5));
  const gone = easeInCubic(clamp((t - (T.cta - 0.2)) / 0.5));
  if (gone >= 1) return null;
  const doneA = show(t, T.faelle + 0.4, 0.4);
  const doneB = show(t, T.also + 0.6, 0.4);
  const actA = clamp((t - T.rang) / 0.4) * (1 - doneA);
  const actB = clamp((t - (T.drueckt - 0.2)) / 0.4) * (1 - doneB);
  const gA = bump(t, T.faelle + 0.4, 1.2);
  const gB = bump(t, T.also + 0.6, 1.2);
  const qG = bump(t, T.matrix + 0.2, 1.4);
  const line = (y: number, label: string, tex: string, act: number, done: number, g: number) => (
    <div
      style={{
        position: 'absolute',
        left: 372,
        top: y,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        whiteSpace: 'nowrap',
        padding: '4px 12px',
        marginLeft: -12,
        borderRadius: 12,
        background: act > 0 ? `rgba(255,194,71,${0.1 * act})` : undefined,
        boxShadow: act > 0 ? `inset 0 0 0 2px rgba(255,194,71,${0.55 * act})` : undefined,
        textShadow: g > 0.02 ? `0 0 ${20 * g}px rgba(123,234,156,${0.7 * g})` : undefined,
      }}
    >
      <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 28, color: act > 0.5 ? C.eig : C.txt}}>{label}</span>
      <Tex tex={tex} size={29} />
      <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 30, color: GREEN, opacity: done, marginLeft: 4}}>✓</span>
    </div>
  );
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
        border: `1.5px solid rgba(255,255,255,${0.18 + 0.35 * Math.max(gA, gB)})`,
        background: 'linear-gradient(180deg, rgba(20,22,52,.88), rgba(10,11,32,.84))',
        boxShadow: `0 30px 90px rgba(0,0,0,.35)${gB > 0 ? `, 0 0 60px rgba(123,234,156,${0.25 * gB})` : ''}`,
        opacity: clamp(appear * 1.4) * (1 - gone),
        transform: `translateY(${(1 - appear) * 24}px) scale(${0.97 + 0.03 * appear})`,
      }}
    >
      <div style={{position: 'absolute', left: 34, top: 22, fontFamily: F.mono, fontWeight: 600, fontSize: 24, letterSpacing: '.1em', color: C.eig}}>MATHE 1 · KLAUSUR</div>
      <div style={{position: 'absolute', left: 30, top: 64, whiteSpace: 'nowrap', textShadow: qG > 0.02 ? `0 0 ${18 * qG}px rgba(255,194,71,${0.5 * qG})` : undefined}}>
        <Tex tex={`A(${AM('a')}) = \\begin{pmatrix} 1 & 2 & 1 \\\\ 2 & 5 & 3 \\\\ 1 & 3 & ${AM('a')} \\end{pmatrix}`} size={28} />
      </div>
      {line(76, 'a)', `\\text{Rang in Abhängigkeit von } ${AM('a')}`, actA, doneA, gA)}
      {line(136, 'b)', `\\text{Für welche } ${AM('a')} \\text{ invertierbar?}`, actB, doneB, gB)}
    </div>
  );
};

/* ---------- Raum: kleine Matrix, a, Aussagen ---------- */

const GEO_MINI: Geo = {cx: 770, cy: 642, cw: 92, rh: 58, size: 38};
// Im Bild steht a mit einer Nachkommastelle; Matrix und Höhe werden aus genau diesem Wert gerechnet
const aShown = (t: number) => Math.round(aAt(t) * 10) / 10;

const MiniMatrix: React.FC = () => {
  const t = useSec();
  const o = show(t, BIG_OUT + 0.45, 0.5) * hide(t, T.merk - 0.2, 0.45);
  if (o <= 0) return null;
  const g = GEO_MINI;
  const a = aShown(t);
  const rows = rowsT(t).map((r, i) => (i === 2 ? ([r[0], r[1], r[2] - aAt(t) + a] as V3) : r));
  const cells: Cell[][] = [0, 1, 2].map((i) =>
    [0, 1, 2].map((j) => {
      const v = rows[i][j];
      const isA = i === 2 && j === 2;
      return {states: [[0, isA ? AM(num(v)) : num(v)]], color: isA ? COL.a : undefined};
    }),
  );
  cells[2][2].glow = bump(t, T.aMinus2, 1.2) + bump(t, SLIDE[0] + SLIDE[1], 1.0);
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
  const win = (s: [number, number]) => clamp((t - (s[0] - 0.4)) / 0.3) * (1 - clamp((t - (s[0] + s[1] + 0.3)) / 0.3));
  return (
    <AbsoluteFill style={{opacity: o}}>
      {band(1, win(STEP_A), COL.r2)}
      {band(2, Math.max(win(STEP_B), win(STEP_C)), COL.r3)}
      <Brackets g={g} o={1} dots={1} dotGlow={[0, 1, 2].map((i) => bump(t, T.pfeile + 0.1 + 0.25 * i, 0.9))} />
      {cells.map((row, i) => row.map((c, j) => <CellView key={`${i}${j}`} t={t} g={g} i={i} j={j} c={c} />))}
      <ATag t={t} a={a} />
    </AbsoluteFill>
  );
};

const ATag: React.FC<{t: number; a: number}> = ({t, a}) => {
  const o = show(t, T.pfeile - 0.1, 0.4);
  if (o <= 0) return null;
  const g = bump(t, T.pfeile, 1.0) + bump(t, SLIDE[0] + SLIDE[1] - 0.1, 1.0) * 0.8;
  return (
    <div style={{position: 'absolute', left: 96, top: 642, transform: `translateY(-50%) scale(${1 + 0.1 * g})`, transformOrigin: 'left center', opacity: o, textShadow: `0 0 ${12 + 26 * g}px rgba(255,194,71,${0.3 + 0.5 * g}), ${shadow}`}}>
      <Tex tex={`${AM('a')} = ${AM(num(a))}`} size={50} />
    </div>
  );
};

const SpaceText: React.FC = () => {
  const t = useSec();
  const o = hide(t, T.merk - 0.2, 0.45);
  if (o <= 0 || t < T.warum) return null;
  const g1 = (at: number, d = 1.1) => (x: number) => bump(x, at, d);
  const A_STATES: SlotState[] = [
    [T.ebene - 0.1, () => `${Z(1)}, ${Z(2)}\\ ${TX('spannen eine Ebene auf')}`, g1(T.ebene + 0.3)],
    [T.gaussSchritt, () => `${TX('Gauß-Schritt: Pfeil gleitet')}\\ ${TX('parallel zur Ebene')}`, g1(T.parallel)],
    [T.deshalb, () => `${TX('Ebene bleibt')} \\;\\Rightarrow\\; ${TX('Rang bleibt')}`, g1(T.deshalb + 0.4)],
    [T.dritte, () => `${TX('Höhe von')}\\ ${Z(3)}\\ ${TX('über der Ebene bleibt gleich')}`, g1(T.hoch)],
    [T.amEnde, () => `${Z(3)} = (0,\\,0,\\,${AM('a')}-2)`, g1(T.aMinus2)],
    [T.beiA2b, () => `${AM('a')} \\to ${AM('2')}:\\ ${TX('Höhe')} \\to 0`, g1(T.schrumpft + 0.4)],
    [T.keine - 0.1, () => `${TX('keine neue Richtung')} \\;\\Rightarrow\\; \\operatorname{rang} A = 2`, g1(T.keine + 0.2)],
    [T.drueckt - 0.1, () => `A\\,x\\ ${TX('landet immer in der Ebene')}`, g1(T.ebene2)],
    [T.ecken, () => `${col(COL.a, TX('2 Ecken'))} \\;\\to\\; ${TX('derselbe Punkt')}\\ 0`, g1(T.punkt)],
    [T.zurueck - 0.1, () => `${TX('zurückrechnen unmöglich')}\\ ${col(RED, '\\times')}`, g1(T.zurueck + 0.2)],
    [T.inv - 0.15, null],
  ];
  const foot = show(t, T.drueckt + 0.4, 0.4) * hide(t, T.inv - 0.15, 0.3);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Slot t={t} y={770} size={40} states={A_STATES} />
      {foot > 0 ? (
        <div style={{position: 'absolute', left: 96, top: 832, opacity: foot * 0.9, fontFamily: F.body, fontWeight: 500, fontSize: 26, color: C.txt2, textShadow: shadow, whiteSpace: 'nowrap'}}>
          Hier dieselbe Ebene: A ist symmetrisch, Spalten = Zeilen.
        </div>
      ) : null}
      <Answer />
    </AbsoluteFill>
  );
};

const Answer: React.FC = () => {
  const t = useSec();
  const p = show(t, T.inv, 0.5) * hide(t, T.merk - 0.2, 0.4);
  if (p <= 0) return null;
  const g = bump(t, T.also + 0.5, 1.3);
  const step = show(t, T.also - 0.1, 0.4);
  return (
    <div
      style={{
        position: 'absolute',
        left: 470,
        top: 820,
        transform: `translate(-50%, -50%) translateY(${(1 - p) * 18}px) scale(${1 + 0.06 * g})`,
        opacity: p,
        whiteSpace: 'nowrap',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        padding: '18px 36px',
        borderRadius: 24,
        border: `2.5px solid rgba(123,234,156,${0.45 + 0.45 * g})`,
        background: 'rgba(12,30,30,.78)',
        boxShadow: `0 0 ${20 + 50 * g}px rgba(123,234,156,${0.18 + 0.3 * g})`,
      }}
    >
      <Tex tex={`\\text{invertierbar} \\iff \\operatorname{rang} A = 3`} size={42} />
      <span style={{opacity: step, display: 'flex', alignItems: 'center', gap: 16}}>
        <Tex tex={`\\iff ${AM('a')} \\neq 2`} size={46} />
        <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 40, color: GREEN}}>✓</span>
      </span>
    </div>
  );
};

const WarumLabel: React.FC = () => (
  <Mono x={MARGIN} y={532} at={T.warum + 0.1} out={T.merk - 0.3} color={C.eig} size={26} upper={false}>
    Warum gerade a = 2?
  </Mono>
);

/* ---------- Beschriftungen an Punkten im Raum ---------- */

const Label3: React.FC<{t: number; q: V3; dx?: number; dy?: number; o: number; children: React.ReactNode}> = ({t, q, dx = 0, dy = 0, o, children}) => {
  if (o <= 0.005) return null;
  const [x, y] = project(t, q);
  return (
    <div style={{position: 'absolute', left: clamp(x + dx, 110, 920), top: clamp(y + dy, 900, 1410), transform: 'translate(-50%, -50%)', opacity: o, textShadow: shadow, whiteSpace: 'nowrap'}}>
      {children}
    </div>
  );
};

const Chip: React.FC<{tex: string; color: string; glow: number}> = ({tex, color, glow}) => (
  <div
    style={{
      padding: '4px 14px',
      borderRadius: 12,
      background: 'rgba(7,8,26,.74)',
      border: `2px solid ${color}`,
      transform: `scale(${1 + 0.14 * glow})`,
      boxShadow: `0 0 ${8 + 26 * glow}px ${color}`,
    }}
  >
    <Tex tex={tex} size={34} />
  </div>
);

const mid = (p: V3, q: V3): V3 => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];
const SpaceLabels: React.FC = () => {
  const t = useSec();
  const st = vis.stage(t);
  if (st <= 0.01) return null;
  const [r1, r2, r3] = rowsT(t);
  const a = aShown(t);
  const ar = vis.arrows(t) * st;
  const names = ar * show(t, T.pfeile + 0.2, 0.4);
  const n3 = ar * show(t, T.pfeile + 0.7, 0.4) * clamp((Math.abs(a - 2) - 0.25) / 0.3);
  const plane = vis.plane(t) * st * show(t, T.ebene + 0.2, 0.4) * hide(t, T.gaussSchritt, 0.4);
  const hText = t < T.aMinus2 - 0.1 ? TX('Höhe') : `${AM('a')} - 2 = ${num(a - 2)}`;
  // Beschriftung bleibt voll sichtbar, auch wenn die gestrichelte Linie nach dem letzten Schritt zurücktritt
  const hO = st * show(t, T.deshalb, 0.4) * hide(t, SLIDE[0] + SLIDE[1] - 0.3, 0.3) * clamp((Math.abs(a - 2) - 0.12) / 0.2);
  const hdx = t > STEP_C[0] + STEP_C[1] ? -150 : 110;
  const hMid = mid(r3, footOf(r3));
  return (
    <AbsoluteFill>
      <Label3 t={t} q={r1} dx={-44} dy={26} o={names}>
        <Tex tex={Z(1)} size={42} />
      </Label3>
      <Label3 t={t} q={r2} dx={44} dy={-24} o={names}>
        <Tex tex={Z(2)} size={42} />
      </Label3>
      <Label3 t={t} q={r3} dx={-46} dy={-30} o={n3}>
        <Tex tex={Z(3)} size={42} />
      </Label3>
      <Label3 t={t} q={addV([0.6, 1.6, 1.0], [1, 1, 0], 1.6)} o={plane}>
        <Chip tex={TX('Ebene')} color={COL.plane} glow={bump(t, T.ebene + 0.3, 1.0)} />
      </Label3>
      <Label3 t={t} q={hMid} dx={hdx} o={hO}>
        <Chip tex={hText} color={C.txt} glow={bump(t, T.hoch, 1.0) + bump(t, T.aMinus2, 1.2)} />
      </Label3>
    </AbsoluteFill>
  );
};

/* ---------- Merksatz ---------- */

const Merksatz: React.FC = () => {
  const t = useSec();
  const p = springOS(clamp((t - (T.merk - 0.1)) / 0.7));
  const out = hide(t, T.cta - 0.2, 0.4);
  if (p <= 0 || out <= 0) return null;
  const lines = ['① Gauß bis zur Stufenform', '② Rang = Anzahl der Pivots', '③ Parameter im letzten Pivot → Fälle', '④ invertierbar ⇔ voller Rang'];
  return (
    <div
      style={{
        position: 'absolute',
        left: MARGIN,
        width: W - 2 * MARGIN - 40,
        top: 640,
        boxSizing: 'border-box',
        padding: '34px 40px 30px',
        borderRadius: 30,
        border: '1.5px solid rgba(255,255,255,.22)',
        background: 'linear-gradient(180deg, rgba(24,26,62,.94), rgba(12,13,36,.92))',
        boxShadow: '0 30px 90px rgba(0,0,0,.4), 0 0 80px rgba(30,139,219,.18)',
        opacity: clamp(p * 1.4) * out,
        transform: `translateY(${(1 - p) * 30}px) scale(${0.96 + 0.04 * p})`,
      }}
    >
      <div style={{fontFamily: F.mono, fontWeight: 600, fontSize: 22, letterSpacing: '.1em', color: C.eig}}>FÜR DIE KLAUSUR · RANG MIT PARAMETER</div>
      {lines.map((s, i) => {
        const k = show(t, T.merk + 0.25 + 0.4 * i, 0.4);
        const g = bump(t, T.merk + 0.25 + 0.4 * i, 1.0);
        return (
          <div
            key={i}
            style={{
              marginTop: i === 0 ? 26 : 16,
              fontFamily: F.display,
              fontWeight: 700,
              fontSize: 35,
              color: C.txt,
              opacity: k,
              transform: `translateX(${(1 - k) * -16}px)`,
              textShadow: g > 0.02 ? `0 0 ${24 * g}px rgba(255,194,71,${0.6 * g})` : undefined,
            }}
          >
            {s}
          </div>
        );
      })}
      <div style={{marginTop: 24, fontFamily: F.body, fontWeight: 500, fontSize: 26, color: C.txt2, opacity: show(t, T.merk + 1.9, 0.4)}}>
        Zeilenumformungen ändern den Rang nicht.
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

const FLAT_END = FLAT[0] + FLAT[1];
const SLIDE_END = SLIDE[0] + SLIDE[1];
const Flash: React.FC = () => {
  const t = useSec();
  const f = Math.max(
    bump(t, 0, 0.22) * 0.8,
    bump(t, T.findest - 0.1, 0.4) * 0.5,
    bump(t, CASE.gray, 0.4) * 0.5,
    bump(t, SLIDE_END - 0.05, 0.4) * 0.6,
    bump(t, FLAT_END - 0.1, 0.4) * 0.5,
    bump(t, T.also + 0.5, 0.4) * 0.6,
  );
  return f > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.1 * f}} /> : null;
};

/* ---------- Ton ---------- */

const SFX: [number, string, number][] = [
  [0, 'whoosh', 0.5],
  [0, 'accent_small', 0.35],
  [T.null - 0.1, 'click', 0.3],
  [T.fuenf, 'click', 0.3],
  [T.minus3, 'click', 0.3],
  ...SPIN.slice(0, -1).map(([at]) => [at, 'tick', 0.14] as [number, string, number]),
  [T.findest - 0.1, 'buzz', 0.3],
  [A_BACK, 'whoosh', 0.22],
  [T.zeilen, 'tick', 0.22],
  [T.stufenform, 'swell', 0.22],
  [T.einsOben, 'tick', 0.3],
  ...OPS.flatMap((op, n) => {
    const m = OPT[n];
    const out: [number, string, number][] = [
      [m.down1, 'whoosh', 0.2],
      [m.down2, 'whoosh', 0.18],
      [m.line, 'tick', 0.22],
      ...op.resAt.map((a) => [a, 'click', 0.28] as [number, string, number]),
      [m.up, 'rise', 0.2],
      [m.land(2), 'lock', 0.32],
    ];
    if (op.kVals) out.push([m.k, 'tick', 0.3]);
    return out;
  }),
  [T.mitte, 'tick', 0.3],
  [T.zahl - 0.3, 'swell', 0.26],
  [T.pivots, 'tick', 0.26],
  [T.pivots + 0.25, 'tick', 0.26],
  [CASE.five, 'click', 0.28],
  [CASE.three, 'lock', 0.34],
  [CASE.two, 'click', 0.28],
  [CASE.gray, 'collapse', 0.4],
  [T.faelle + 0.3, 'accent', 0.4],
  [T.warum, 'whoosh', 0.32],
  [T.pfeile, 'click', 0.24],
  [T.pfeile + 0.25, 'click', 0.24],
  [T.pfeile + 0.5, 'click', 0.24],
  [T.ebene, 'swell', 0.24],
  [STEP_A[0], 'rise', 0.24],
  [STEP_A[0] + STEP_A[1] - 0.05, 'lock', 0.3],
  [STEP_B[0], 'rise', 0.22],
  [STEP_B[0] + STEP_B[1] - 0.05, 'lock', 0.3],
  [STEP_C[0], 'rise', 0.22],
  [STEP_C[0] + STEP_C[1] - 0.05, 'lock', 0.3],
  [T.aMinus2, 'tick', 0.3],
  [SLIDE[0], 'rise', 0.28],
  [SLIDE_END - 0.05, 'collapse', 0.45],
  [FLAT[0], 'rise', 0.28],
  [FLAT_END - 0.1, 'lock_hi', 0.38],
  [T.zurueck, 'buzz', 0.22],
  [T.also + 0.5, 'accent', 0.45],
  [T.merk - 0.1, 'whoosh', 0.3],
  [T.cta - 0.1, 'swell', 0.34],
  ...Array.from({length: 8}, (_, i) => [T.tippt + i * 0.075, 'tick', 0.18] as [number, string, number]),
];

/* ---------- Komposition ---------- */

const LEAD = 0.08;
const TAIL = 0.1;

export type KRProps = {music: boolean; voice: boolean};

export const VideoKR: React.FC<KRProps> = ({music, voice}) => {
  useTexFonts();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={1000} strength={0.9} />
      <Scene />
      <SpaceLabels />
      <BigMatrix />
      <HookPills />
      <CalcLine />
      <MiniMatrix />
      <SpaceText />
      <WarumLabel />
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
              <Sequence key={c.i} from={sec(c.at - lead)} durationInFrames={sec(c.to - c.from + lead + TAIL)} layout="none">
                <Audio src={staticFile(VOICE)} trimBefore={sec(c.from - lead)} trimAfter={sec(c.to + TAIL)} />
              </Sequence>
            );
          })
        : null}
    </AbsoluteFill>
  );
};
