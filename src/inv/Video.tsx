// Klausurvideo „Inverse mit Gauß-Jordan“: (A | I) → (I | A⁻¹). Altes (dunkles) Design wie src/ki/.
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C, MARGIN, W} from '../theme';
import {F, useTexFonts} from '../fonts';
import {V2, bump, clamp, easeInCubic, easeInOutCubic, easeOutExpo, lerp, prog, sec, springOS} from '../math';
import {Backdrop, Grain, Mono, Tex, col, useSec} from '../ui';
import {CLIPS, MUSIC, SUBTITLES, T, VOICE, A as SA_, E as SE_} from './timeline';

const show = (t: number, at: number, d = 0.4) => easeOutExpo(clamp((t - at) / d));
const hide = (t: number, at: number, d = 0.35) => 1 - easeInOutCubic(clamp((t - at) / d));
const shadow = `0 0 14px ${C.bg}, 0 0 30px ${C.bg}`;
const hex2 = (k: number, max: number) => Math.round(clamp(k) * max).toString(16).padStart(2, '0');

// Zeilenfarben wie im Invertierbar-Video, rechte Hälfte (das Protokoll) in Amber
const ROWC = [C.cyan, '#4FA8FF', C.lam];
const REC = C.eig;
const GREEN = '#7BEA9C';
const Z = (n: number) => col(ROWC[n], `Z_${n + 1}`);
const RC = (s: string) => col(REC, s);
const numTex = (v: number) => (v < 0 ? `-${-v}` : `${v}`);
// Eintrag als TeX: rechte Hälfte (Spalte 3–5) in Amber
const cellTex = (v: number, j: number) => (j >= 3 ? RC(numTex(v)) : numTex(v));

/* ---------- Mathematik: (A | I) und die fünf Umformungen ---------- */

const M0 = [
  [1, 2, 1, 1, 0, 0],
  [0, 1, 1, 0, 1, 0],
  [1, 1, 1, 0, 0, 1],
];
const AINV = [
  [0, -1, 1],
  [1, 0, -1],
  [-1, 1, 1],
];
const AMAT = [
  [1, 2, 1],
  [0, 1, 1],
  [1, 1, 1],
];

type OpDef = {target: number; src: number; f: number; start: number; detail: boolean};
const OPDEF: OpDef[] = [
  {target: 2, src: 0, f: -1, start: T.op1, detail: true},
  {target: 2, src: 1, f: 1, start: T.op2, detail: true},
  {target: 1, src: 2, f: -1, start: T.op3, detail: false},
  {target: 0, src: 2, f: -1, start: T.op4, detail: false},
  {target: 0, src: 1, f: -2, start: T.op5, detail: false},
];
type Op = OpDef & {tVals: number[]; sVals: number[]; kVals?: number[]; res: number[]};
const OPS: Op[] = (() => {
  const M = M0.map((r) => [...r]);
  return OPDEF.map((d) => {
    const tVals = [...M[d.target]];
    const sVals = [...M[d.src]];
    const kVals = Math.abs(d.f) !== 1 ? sVals.map((v) => Math.abs(d.f) * v) : undefined;
    const res = tVals.map((v, j) => v + d.f * sVals[j]);
    M[d.target] = res;
    return {...d, tVals, sVals, kVals, res};
  });
})();
// Kontrolle: rechts muss am Ende A⁻¹ stehen, links I
const FINAL = (() => {
  const M = M0.map((r) => [...r]);
  OPS.forEach((op) => (M[op.target] = op.res));
  return M;
})();
FINAL.forEach((r, i) =>
  r.forEach((v, j) => {
    const want = j < 3 ? (i === j ? 1 : 0) : AINV[i][j - 3];
    if (v !== want) throw new Error(`Gauß-Jordan falsch bei (${i},${j})`);
  }),
);

const opLabel = (op: Op) => {
  const s = op.f < 0 ? '-' : '+';
  const k = Math.abs(op.f) !== 1 ? `${Math.abs(op.f)}` : '';
  return `${Z(op.target)} ${s} ${k}${Z(op.src)}`;
};

/* ---------- Zeiten der Umformungen ---------- */

const UP = 0.55;
type OpT = {down1: number; down2: number; k: number; line: number; resAt: number[]; colGlow: number[]; up: number; land: (j: number) => number};
const opTimes = (op: Op, n: number): OpT => {
  if (op.detail) {
    const down1 = op.start + 0.2;
    const down2 = op.start + 0.7;
    const line = op.start + 1.25;
    const resAt =
      n === 0
        ? [T.r1a, T.r1b, T.r1c, T.r1rechts + 0.15, T.r1rechts + 0.4, T.r1rechts + 0.65]
        : [T.r2a, T.r2b, T.r2c, SE_(21) + 0.1, SE_(21) + 0.3, SE_(21) + 0.5];
    const colGlow = n === 0 ? [SA_(13), SA_(15), SA_(17), T.r1rechts, T.r1rechts, T.r1rechts] : resAt.map((r) => r - 0.25);
    const up = resAt[5] + 0.45;
    return {down1, down2, k: -1, line, resAt, colGlow, up, land: (j) => up + 0.05 * j + UP};
  }
  const down1 = op.start + 0.1;
  const down2 = op.start + 0.45;
  const k = op.kVals ? T.zweiMal - 0.05 : -1;
  const line = op.kVals ? k + 0.5 : op.start + 0.85;
  const resAt = [0, 1, 2, 3, 4, 5].map((j) => line + 0.2 + 0.1 * j);
  const up = resAt[5] + 0.3;
  return {down1, down2, k, line, resAt, colGlow: resAt.map((r) => r - 0.2), up, land: (j) => up + 0.05 * j + UP - 0.05};
};
const OPT = OPS.map(opTimes);
const LANDED = (n: number) => OPT[n].land(5) + 0.05;

/* ---------- Geometrie ---------- */

const XS = [222, 336, 450, 606, 718, 830];
const ROWY = [700, 800, 900];
const SIZE = 60;
const MID = 528;
const TOP = 648;
const BOT = 952;
const cell = (i: number, j: number): V2 => [XS[j], ROWY[i]];
// Rechenbereich: Zeilen unter der Matrix, Spalten genau unter den Matrixspalten
const CALC = {ty: 1072, sy: 1146, line: 1188, ry: 1236, size: 50, labelX: 178};
const LABEL_Y = 610;

/* ---------- Einträge ---------- */

// [ab Zeit, TeX, Skalierung, Rolldauer]
type CState = [number, string, number?, number?];
type Cell = {states: CState[]; glow?: number; o?: number; color?: string};

const IPOP = (i: number, c: number) => T.neben + 0.4 + 0.09 * (i * 3 + c);
const BIG_STATES: CState[][][] = M0.map((row, i) =>
  row.map((v, j) => {
    const st: CState[] = j < 3 ? [[0, cellTex(v, j)]] : [[0, ''], [IPOP(i, j - 3), cellTex(v, j), 1, 0.3]];
    OPS.forEach((op, n) => {
      if (op.target !== i) return;
      st.push([OPT[n].up + 0.05 * j, '', 1, 0.2]);
      st.push([OPT[n].land(j), cellTex(op.res[j], j), 1, 0.01]);
    });
    return st;
  }),
);

const CellView: React.FC<{t: number; x: number; y: number; size: number; c: Cell}> = ({t, x, y, size, c}) => {
  let k = 0;
  c.states.forEach(([at], n) => {
    if (t >= at) k = n;
  });
  const roll = c.states[k][3] ?? 0.38;
  const p = k > 0 ? easeInOutCubic(clamp((t - c.states[k][0]) / roll)) : 1;
  const off = size * 0.5;
  const glow = c.glow ?? 0;
  const layer = (st: CState, o: number, dy: number) =>
    o > 0.01 && st[1] !== '' ? (
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
        <Tex tex={st[1]} size={size} />
      </div>
    ) : null;
  return (
    <>
      {p < 1 ? layer(c.states[k - 1], clamp(1 - 1.6 * p), -p * off) : null}
      {layer(c.states[k], clamp(1.6 * p - 0.6), (1 - p) * off)}
    </>
  );
};

// Klammer: side 1 = linke Klammer „(“, side −1 = rechte „)“
const bracketPath = (x: number, side: 1 | -1, top: number, bot: number, pw = 15) => {
  const mid = (top + bot) / 2;
  return `M ${x + side * pw} ${top} Q ${x} ${mid} ${x + side * pw} ${bot}`;
};

/* ---------- Die große erweiterte Matrix ---------- */

const bigCells = (t: number): Cell[][] => {
  const R: Cell[][] = BIG_STATES.map((row, i) => row.map((states, j) => ({states, color: j >= 3 ? REC : undefined})));
  const g = (i: number, j: number, v: number) => (R[i][j].glow = (R[i][j].glow ?? 0) + v);
  // Hook: A leuchtet bei „dieser Matrix“
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) g(i, j, bump(t, T.berechne + 0.9 + 0.06 * (i + j), 1.0) * 0.6);
  // „In Zeile zwei steht schon eine“
  g(1, 0, bump(t, T.schon + 0.3, 1.2) * 1.2);
  R[1][0].color = ROWC[1];
  // I zieht ein: Einsen leuchten
  for (let i = 0; i < 3; i++) g(i, 3 + i, bump(t, IPOP(i, i) + 0.1, 0.9));
  // gelandete Ergebnisse
  OPS.forEach((op, n) => [0, 1, 2, 3, 4, 5].forEach((j) => g(op.target, j, bump(t, OPT[n].land(j), 0.9) * 0.9)));
  // Nullen unter der Diagonale treten zurück, sobald sie stehen; links I: auch die oberen, Diagonale leuchtet
  const lowDim = prog(t, LANDED(1) + 0.2, 0.6);
  const upDim = prog(t, T.linksI + 0.2, 0.6);
  for (const [i, j] of [[1, 0], [2, 0], [2, 1]]) R[i][j].o = 1 - 0.5 * lowDim;
  for (const [i, j] of [[0, 1], [0, 2], [1, 2]]) R[i][j].o = 1 - 0.5 * upDim;
  for (let k = 0; k < 3; k++) g(k, k, bump(t, T.linksI + 0.15 + 0.12 * k, 1.1));
  // rechts: Protokoll und Inverse
  for (let i = 0; i < 3; i++)
    for (let j = 3; j < 6; j++) g(i, j, bump(t, T.undRechts + 0.05, 1.0) * 0.6 + bump(t, T.deshalb + 0.3 + 0.05 * (i + j), 1.2) + bump(t, T.probeAA, 0.8) * 0.5);
  return R;
};

const RowBands: React.FC<{t: number; op: Op; tm: OpT}> = ({t, op, tm}) => {
  const on = (at: number) => clamp((t - at) / 0.3) * (1 - clamp((t - (tm.land(5) + 0.25)) / 0.4));
  const band = (i: number, k: number, c: string) =>
    k > 0 ? (
      <div
        style={{
          position: 'absolute',
          left: 166,
          top: ROWY[i] - 44,
          width: 740,
          height: 88,
          borderRadius: 16,
          background: `${c}${hex2(k, 0x1c)}`,
          boxShadow: `inset 0 0 0 2px ${c}${hex2(k, 0x80)}`,
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

// Schriftliche Rechnung unter der Matrix (Spalten bündig, Ergebnis fliegt zurück in die Zeile)
const RowOp: React.FC<{t: number; op: Op; tm: OpT}> = ({t, op, tm}) => {
  if (t < tm.down1 || t > tm.land(5) + 0.05) return null;
  const fadeOut = 1 - clamp((t - tm.up) / 0.35);
  const sc = CALC.size / SIZE;
  const DOWN = op.detail ? 0.6 : 0.45;
  const slide = (from: number, at: number, y: number, vals: number[], color: string, keyP: string) =>
    vals.map((v, j) => {
      const a0 = at + 0.04 * j;
      if (t < a0) return null;
      const k = easeInOutCubic(clamp((t - a0) / DOWN));
      const [sx, sy] = cell(from, j);
      const gl = bump(t, tm.colGlow[j], 0.8) + bump(t, tm.resAt[j] - 0.05, 0.7) * 0.5;
      return (
        <div
          key={`${keyP}${j}`}
          style={{
            position: 'absolute',
            left: sx,
            top: lerp(sy, y, k),
            transform: `translate(-50%, -50%) scale(${lerp(1, sc, k) * (1 + 0.14 * gl)})`,
            opacity: clamp(k * 3) * fadeOut,
            whiteSpace: 'nowrap',
            textShadow: `0 0 ${10 + 22 * gl}px ${gl > 0.02 ? color : 'transparent'}, ${shadow}`,
          }}
        >
          <Tex tex={cellTex(v, j)} size={SIZE} />
        </div>
      );
    });
  const doubled = op.kVals && t >= tm.k + 0.25;
  const sVals = doubled ? op.kVals! : op.sVals;
  const kGlow = op.kVals ? bump(t, tm.k, 0.9) : 0;
  const sign = op.f < 0 ? '-' : '+';
  const sLabel = doubled ? `${sign}\\;${Math.abs(op.f)}\\cdot ${Z(op.src)}` : `${sign}\\;${Z(op.src)}`;
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
  const divP = show(t, tm.down1 + 0.2, 0.4) * fadeOut;
  return (
    <>
      {/* Trennstrich auch im Rechenbereich */}
      <div style={{position: 'absolute', left: MID - 1, top: CALC.ty - 34, width: 2, height: CALC.ry - CALC.ty + 68, background: 'rgba(243,244,251,.22)', opacity: divP}} />
      {label(CALC.ty, Z(op.target), tm.down1 + 0.3)}
      {label(CALC.sy, sLabel, tm.down2 + 0.3, kGlow)}
      {slide(op.target, tm.down1, CALC.ty, op.tVals, ROWC[op.target], 't')}
      {slide(op.src, tm.down2, CALC.sy, sVals, ROWC[op.src], 's')}
      {lineP > 0 && fadeOut > 0 ? (
        <div style={{position: 'absolute', left: CALC.labelX - 70, top: CALC.line - 1.5, width: (XS[5] + 50 - (CALC.labelX - 70)) * lineP, height: 3, borderRadius: 2, background: C.txt, opacity: 0.85 * fadeOut}} />
      ) : null}
      {op.res.map((v, j) => {
        if (t < tm.resAt[j] - 0.05 || t > tm.land(j)) return null;
        const pIn = easeOutExpo(clamp((t - (tm.resAt[j] - 0.05)) / 0.35));
        const upStart = tm.up + 0.05 * j;
        const f = easeInOutCubic(clamp((t - upStart) / UP));
        const [ex, ey] = cell(op.target, j);
        const y = lerp(CALC.ry + (1 - pIn) * 16, ey, f) - Math.sin(Math.PI * f) * 30;
        const gl = bump(t, tm.resAt[j], 0.9);
        return (
          <div
            key={`r${j}`}
            style={{
              position: 'absolute',
              left: ex,
              top: y,
              transform: `translate(-50%, -50%) scale(${lerp(sc, 1, f) * (1 + 0.16 * gl)})`,
              opacity: pIn,
              whiteSpace: 'nowrap',
              textShadow: `0 0 ${10 + 26 * gl}px ${gl > 0.02 ? (j >= 3 ? REC : 'rgba(255,255,255,.9)') : 'transparent'}, ${shadow}`,
            }}
          >
            <Tex tex={cellTex(v, j)} size={SIZE} />
          </div>
        );
      })}
    </>
  );
};

// Bereich unter bzw. über der Diagonale (gestrichelt)
const Regions: React.FC<{t: number}> = ({t}) => {
  const x01 = (XS[0] + XS[1]) / 2;
  const x12 = (XS[1] + XS[2]) / 2;
  const xL = XS[0] - 52;
  const xR = XS[2] + 52;
  const y01 = (ROWY[0] + ROWY[1]) / 2;
  const y12 = (ROWY[1] + ROWY[2]) / 2;
  const yT = ROWY[0] - 46;
  const yB = ROWY[2] + 46;
  const low = `M ${xL} ${y01} L ${x01} ${y01} L ${x01} ${y12} L ${x12} ${y12} L ${x12} ${yB} L ${xL} ${yB} Z`;
  const high = `M ${x01} ${yT} L ${xR} ${yT} L ${xR} ${y12} L ${x12} ${y12} L ${x12} ${y01} L ${x01} ${y01} Z`;
  const lo = show(t, T.unten + 0.2, 0.5) * hide(t, LANDED(1) + 0.4, 0.5);
  const hi = show(t, T.oben + 0.3, 0.5) * hide(t, T.linksI, 0.5);
  const loG = bump(t, T.unten + 0.4, 1.2) + bump(t, T.untenSteht + 0.2, 1.0);
  const hiG = bump(t, T.oben + 0.5, 1.2);
  const style = (o: number, g: number): React.SVGProps<SVGPathElement> => ({
    fill: `rgba(255,194,71,${0.07 * o})`,
    stroke: C.eig,
    strokeWidth: 3,
    strokeDasharray: '10 10',
    strokeLinejoin: 'round',
    opacity: o * (0.7 + 0.3 * g),
    style: {filter: `drop-shadow(0 0 ${4 + 12 * g}px rgba(255,194,71,.6))`},
  });
  return (
    <svg width={W} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {lo > 0 ? <path d={low} {...style(lo, loG)} /> : null}
      {hi > 0 ? <path d={high} {...style(hi, hiG)} /> : null}
    </svg>
  );
};

// Hintergrundflächen: links I (weiß), rechts Protokoll/Inverse (Amber)
const Blocks: React.FC<{t: number}> = ({t}) => {
  const leftI = show(t, T.linksI + 0.1, 0.5) * hide(t, T.undRechts + 0.3, 0.6) * 0.8 + bump(t, T.deshalb + 0.1, 1.2) * 0.4;
  const right = Math.max(bump(t, T.undRechts, 1.4) * 0.9, show(t, T.deshalb, 0.5) * 0.85, bump(t, T.rechts + 0.1, 1.0) * 0.8);
  const rect = (x0: number, x1: number, o: number, c: string) =>
    o > 0.01 ? (
      <div
        style={{
          position: 'absolute',
          left: x0,
          top: TOP - 4,
          width: x1 - x0,
          height: BOT - TOP + 8,
          borderRadius: 22,
          background: `${c}${hex2(o, 0x16)}`,
          boxShadow: `inset 0 0 0 2px ${c}${hex2(o, 0x70)}, 0 0 ${40 * o}px ${c}${hex2(o, 0x30)}`,
        }}
      />
    ) : null;
  return (
    <>
      {rect(182, 506, leftI, '#F3F4FB')}
      {rect(552, 886, right, REC)}
    </>
  );
};

// Lichtstreifen bei „rechts genauso mit“: läuft über beide Hälften
const Sweep: React.FC<{t: number}> = ({t}) => {
  const a = T.mit + 0.25;
  const x = clamp((t - a) / 1.3);
  if (t < a || x >= 1) return null;
  const cx = lerp(166, 902, easeInOutCubic(x));
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - 70,
        top: TOP,
        width: 140,
        height: BOT - TOP,
        background: 'linear-gradient(90deg, rgba(255,194,71,0), rgba(255,194,71,.28), rgba(255,194,71,0))',
        opacity: Math.sin(Math.PI * x),
      }}
    />
  );
};

const BigMatrix: React.FC = () => {
  const t = useSec();
  const o = hide(t, T.merk - 0.35, 0.5);
  if (o <= 0) return null;
  const appear = springOS(clamp((t - 0.1) / 0.6));
  const cells = bigCells(t);
  const join = prog(t, T.neben + 0.1, 0.5);
  const div = prog(t, T.neben + 0.25, 0.6);
  const q = hide(t, T.neben + 0.15, 0.35);
  const qG = bump(t, T.rechts, 1.0) + bump(t, T.berechne + 0.5, 1.0) * 0.6;
  const names = show(t, T.mit - 0.1, 0.4);
  const nameGlow = [0, 1, 2].map((i) => OPS.reduce((s, op, n) => s + (op.target === i ? bump(t, OPT[n].down1, 1.0) : 0) + (op.src === i ? bump(t, OPT[n].down2, 1.0) : 0), 0));
  return (
    <AbsoluteFill style={{opacity: o * clamp(appear * 1.3), transform: `scale(${0.95 + 0.05 * appear})`}}>
      <Blocks t={t} />
      <Regions t={t} />
      {OPS.map((op, n) => (
        <RowBands key={n} t={t} op={op} tm={OPT[n]} />
      ))}
      <Sweep t={t} />
      <svg width={W} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d={bracketPath(166, 1, TOP, BOT)} fill="none" stroke={C.txt} strokeWidth={3} strokeLinecap="round" />
        {/* Hook: A in eigener Klammer, rechts ein gestrichelter leerer Rahmen */}
        <path d={bracketPath(508, -1, TOP, BOT)} fill="none" stroke={C.txt} strokeWidth={3} strokeLinecap="round" opacity={1 - join} />
        <path d={bracketPath(548, 1, TOP, BOT)} fill="none" stroke={REC} strokeWidth={3} strokeDasharray="9 10" strokeLinecap="round" opacity={(1 - join) * 0.8} />
        <path d={bracketPath(902, -1, TOP, BOT)} fill="none" stroke={join > 0.5 ? C.txt : REC} strokeWidth={3} strokeDasharray={join > 0.5 ? undefined : '9 10'} strokeLinecap="round" opacity={join > 0.5 ? 1 : 0.8} />
        {div > 0 ? <line x1={MID} y1={TOP + 6} x2={MID} y2={lerp(TOP + 6, BOT - 6, div)} stroke="rgba(243,244,251,.55)" strokeWidth={3} strokeLinecap="round" /> : null}
      </svg>
      {q > 0 ? (
        <div style={{position: 'absolute', left: XS[4], top: ROWY[1], transform: `translate(-50%, -50%) scale(${1 + 0.12 * qG})`, opacity: q, textShadow: `0 0 ${16 + 30 * qG}px rgba(255,194,71,.7), ${shadow}`}}>
          <Tex tex={RC('?')} size={130} />
        </div>
      ) : null}
      {cells.map((row, i) => row.map((c, j) => <CellView key={`${i}${j}`} t={t} x={XS[j]} y={ROWY[i]} size={SIZE} c={c} />))}
      {/* Zeilennamen */}
      {names > 0
        ? [0, 1, 2].map((i) => (
            <div key={i} style={{position: 'absolute', left: 118, top: ROWY[i], transform: `translate(-50%, -50%) scale(${1 + 0.18 * clamp(nameGlow[i])})`, opacity: names, textShadow: `0 0 ${8 + 20 * clamp(nameGlow[i])}px ${ROWC[i]}, ${shadow}`}}>
              <Tex tex={Z(i)} size={36} />
            </div>
          ))
        : null}
      {OPS.map((op, n) => (
        <RowOp key={n} t={t} op={op} tm={OPT[n]} />
      ))}
      <Labels t={t} />
    </AbsoluteFill>
  );
};

/* ---------- Anzeigen mit Zuständen: der alte Zustand blendet aus, bevor der neue einblendet ---------- */

type SlotState = [number, ((t: number) => string) | null, ((t: number) => number)?];
const OUT_D = 0.22;
const IN_D = 0.32;
const Slot: React.FC<{t: number; x: number; y: number; size: number; states: SlotState[]; glowColor?: string}> = ({t, x, y, size, states, glowColor}) => {
  let k = -1;
  states.forEach(([at], n) => {
    if (t >= at) k = n;
  });
  if (k < 0) return null;
  const [at, tex, glow] = states[k];
  const fadeOld = clamp((t - at) / OUT_D);
  if (fadeOld < 1 && k > 0 && states[k - 1][1]) {
    const [, pt, pg] = states[k - 1];
    return <SlotView x={x} y={y} size={size} tex={pt!(t)} o={1 - fadeOld} glow={pg ? pg(t) : 0} dy={-8 * fadeOld} glowColor={glowColor} />;
  }
  if (!tex) return null;
  const p = easeOutExpo(clamp((t - at - (k > 0 ? OUT_D : 0)) / IN_D));
  if (p <= 0) return null;
  return <SlotView x={x} y={y} size={size} tex={tex(t)} o={p} glow={glow ? glow(t) : 0} dy={(1 - p) * 12} glowColor={glowColor} />;
};
const SlotView: React.FC<{x: number; y: number; size: number; tex: string; o: number; glow: number; dy: number; glowColor?: string}> = ({x, y, size, tex, o, glow, dy, glowColor = 'rgba(255,255,255,.55)'}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(-50%, -50%) translateY(${dy}px) scale(${1 + 0.08 * glow})`,
      opacity: o,
      whiteSpace: 'nowrap',
      textShadow: glow > 0.02 ? `0 0 ${10 + 26 * glow}px ${glowColor}, ${shadow}` : shadow,
    }}
  >
    <Tex tex={tex} size={size} />
  </div>
);

// Beschriftung über den beiden Hälften
const Labels: React.FC<{t: number}> = ({t}) => {
  const L: SlotState[] = [
    [0.2, () => 'A', (x) => bump(x, T.berechne + 0.9, 1.0) * 0.6],
    [T.links + 0.1, () => `A \\;\\longrightarrow\\; I`, (x) => bump(x, T.links + 1.3, 1.2)],
    [T.linksI + 0.05, () => 'I', (x) => bump(x, T.linksI + 0.3, 1.3) + bump(x, T.deshalb + 0.1, 1.2)],
  ];
  const R: SlotState[] = [
    [0.35, () => RC('?'), (x) => bump(x, T.rechts, 1.0)],
    [T.neben + 0.2, () => 'I', (x) => bump(x, T.neben + 0.5, 1.2)],
    [T.mit + 0.5, () => RC('\\text{Protokoll}'), (x) => bump(x, T.mit + 0.8, 1.2) + bump(x, T.undRechts, 1.0)],
    [T.deshalb + 0.05, () => RC('A^{-1}'), (x) => bump(x, T.deshalb + 0.3, 1.4) + bump(x, T.probeAA, 0.9)],
  ];
  return (
    <>
      <Slot t={t} x={XS[1]} y={LABEL_Y} size={46} states={L} />
      <Slot t={t} x={XS[4]} y={LABEL_Y} size={46} states={R} glowColor="rgba(255,194,71,.8)" />
    </>
  );
};

/* ---------- Formeln im Rechenbereich ---------- */

type Item = {tex: string; o: number; glow?: number; color?: string};
const FRow: React.FC<{y: number; size: number; items: Item[]; gap?: number}> = ({y, size, items, gap = 18}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap}}>
    {items.map((it, i) => (
      <div
        key={i}
        style={{
          opacity: it.o,
          transform: `translateY(${(1 - it.o) * 12}px) scale(${1 + 0.1 * (it.glow ?? 0)})`,
          whiteSpace: 'nowrap',
          textShadow: (it.glow ?? 0) > 0.02 ? `0 0 ${10 + 26 * it.glow!}px ${it.color ?? 'rgba(255,255,255,.7)'}, ${shadow}` : shadow,
        }}
      >
        <Tex tex={it.tex} size={size} />
      </div>
    ))}
  </div>
);

// Ziel: A⁻¹ · A = I
const Goal: React.FC = () => {
  const t = useSec();
  const o = hide(t, T.neben + 0.9, 0.4);
  if (o <= 0 || t < T.aInv - 0.1) return null;
  const gI = bump(t, T.einheit, 1.2) + bump(t, T.neben + 0.1, 1.0);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Mono x={540} y={996} at={T.rueck + 0.1} anchor="center" color={C.txt2} size={24}>
        A⁻¹ macht A rückgängig
      </Mono>
      <FRow
        y={1110}
        size={72}
        items={[
          {tex: RC('A^{-1}'), o: show(t, T.aInv, 0.35), glow: bump(t, T.aInv + 0.1, 1.0), color: REC},
          {tex: '\\cdot', o: show(t, T.malA - 0.1, 0.3)},
          {tex: 'A', o: show(t, T.malA, 0.35)},
          {tex: '=', o: show(t, T.ergibt, 0.3)},
          {tex: 'I', o: show(t, T.ergibt + 0.2, 0.35), glow: gI},
        ]}
      />
      <FRow y={1268} size={34} items={[{tex: '\\text{Einheitsmatrix } I = \\begin{pmatrix}1&0&0\\\\0&1&0\\\\0&0&1\\end{pmatrix}', o: show(t, T.einheit - 0.1, 0.4)}]} />
    </AbsoluteFill>
  );
};

// Warum: Zeilenumformung = Multiplikation von links, E · A = I
const Why: React.FC = () => {
  const t = useSec();
  const o = hide(t, T.probe - 0.25, 0.35);
  if (o <= 0 || t < T.multi) return null;
  const E = RC('E');
  const AI = RC('A^{-1}');
  const SA: SlotState[] = [
    [T.multi + 0.5, () => `${Z(2)} - ${Z(0)}:\\quad ${RC('E_1')} = \\begin{pmatrix}1&0&0\\\\0&1&0\\\\-1&0&1\\end{pmatrix}`, (x) => bump(x, T.multi + 2.0, 1.2)],
    [T.alleFuenf + 0.1, () => `${E} = ${RC('E_5\\,E_4\\,E_3\\,E_2\\,E_1')}`, (x) => bump(x, T.alleFuenf + 1.2, 1.2)],
    [T.rechtsHaben, () => `\\text{rechts:}\\;\\; ${E}\\cdot I = ${E}`, (x) => bump(x, T.eMalI + 0.2, 1.2)],
    [T.deshalb + 0.05, () => `(A\\,|\\,I)\\;\\longrightarrow\\;(I\\,|\\,${AI})`, (x) => bump(x, T.deshalb + 0.4, 1.4)],
  ];
  const SB: SlotState[] = [
    [T.macht + 0.1, () => `${E}\\cdot A = I`, (x) => bump(x, T.macht + 1.2, 1.1)],
    [T.eInv - 0.15, () => `${E}\\cdot A = I \\;\\;\\Rightarrow\\;\\; ${E} = ${AI}`, (x) => bump(x, T.eInv + 0.2, 1.3)],
  ];
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Slot t={t} x={540} y={1110} size={46} states={SA} glowColor="rgba(255,194,71,.7)" />
      <Slot t={t} x={540} y={1212} size={48} states={SB} glowColor="rgba(255,194,71,.7)" />
    </AbsoluteFill>
  );
};

/* ---------- Protokoll: Chips der Umformungen ---------- */

const CHIP = {y: 1336, w: 156, gap: 10, x0: 120};
const chipX = (n: number) => CHIP.x0 + CHIP.w / 2 + n * (CHIP.w + CHIP.gap);
const Protocol: React.FC = () => {
  const t = useSec();
  const out = hide(t, T.probe - 0.2, 0.35);
  if (out <= 0 || t < T.mit) return null;
  const merge = easeInOutCubic(clamp((t - (T.alleFuenf + 0.25)) / 0.75));
  const eChip = springOS(clamp((t - (T.alleFuenf + 0.8)) / 0.6));
  const eG = bump(t, T.macht + 0.2, 1.0) + bump(t, T.alsoE + 0.3, 1.0) + bump(t, T.eMalI, 1.0);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <Mono x={CHIP.x0} y={1282} at={T.mit + 0.4} out={T.alleFuenf + 0.3} color={REC} size={20}>
        Protokoll · alles, was links passiert
      </Mono>
      {OPS.map((op, n) => {
        const tm = OPT[n];
        const p = springOS(clamp((t - (op.start - 0.05)) / 0.5));
        if (p <= 0 || merge >= 1) return null;
        const active = clamp((t - (tm.down1 - 0.1)) / 0.3) * (1 - clamp((t - (tm.land(5) + 0.2)) / 0.4));
        const g = bump(t, op.start, 0.9) + (n === 0 ? bump(t, T.multi + 0.6, 1.3) : 0);
        const x = lerp(chipX(n), 540, merge);
        const tag = show(t, T.multi + 0.25 + 0.12 * n, 0.35);
        return (
          <React.Fragment key={n}>
            <div
              style={{
                position: 'absolute',
                left: x,
                top: CHIP.y,
                width: CHIP.w,
                height: 54,
                boxSizing: 'border-box',
                transform: `translate(-50%, -50%) scale(${(0.85 + 0.15 * p) * (1 + 0.08 * g)})`,
                opacity: clamp(p * 1.4) * (1 - merge),
                borderRadius: 14,
                border: `2px solid rgba(255,194,71,${0.35 + 0.55 * Math.max(active, clamp(g))})`,
                background: `rgba(255,194,71,${0.04 + 0.1 * active})`,
                boxShadow: `0 0 ${8 + 26 * clamp(g + active * 0.5)}px rgba(255,194,71,${0.15 + 0.3 * clamp(g + active)})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Tex tex={opLabel(op)} size={30} />
            </div>
            {tag > 0 ? (
              <div style={{position: 'absolute', left: x, top: CHIP.y + 54, transform: 'translate(-50%, -50%)', opacity: tag * (1 - merge), textShadow: shadow}}>
                <Tex tex={RC(`E_${n + 1}`)} size={30} />
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
      {eChip > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: 540,
            top: CHIP.y,
            transform: `translate(-50%, -50%) scale(${(0.8 + 0.2 * eChip) * (1 + 0.1 * eG)})`,
            opacity: clamp(eChip * 1.4),
            padding: '6px 34px',
            borderRadius: 16,
            border: `2.5px solid rgba(255,194,71,${0.6 + 0.4 * clamp(eG)})`,
            background: 'rgba(255,194,71,.12)',
            boxShadow: `0 0 ${16 + 34 * clamp(eG)}px rgba(255,194,71,.4)`,
            whiteSpace: 'nowrap',
          }}
        >
          <Tex tex={`${RC('E')}\\;\\text{= alle fünf Umformungen}`} size={32} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- Kleine Matrix (Aufgabenkarte, Probe) ---------- */

type Geo = {cx: number; cy: number; cw: number; rh: number; size: number};
const at3 = (g: Geo, i: number, j: number): V2 => [g.cx + (j - 1) * g.cw, g.cy + (i - 1) * g.rh];
const Brk3: React.FC<{g: Geo; o: number; color?: string}> = ({g, o, color = C.txt}) => {
  const h = g.rh * 3 + g.size * 0.1;
  const x0 = g.cx - 1.5 * g.cw - g.size * 0.3;
  const x1 = g.cx + 1.5 * g.cw + g.size * 0.3;
  const top = g.cy - h / 2;
  const pw = Math.max(9, g.size * 0.25);
  return (
    <svg width={W} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: o}}>
      <path d={bracketPath(x0, 1, top, top + h, pw)} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
      <path d={bracketPath(x1, -1, top, top + h, pw)} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    </svg>
  );
};

/* ---------- Probe: A⁻¹ · A = I ---------- */

const PG1: Geo = {cx: 262, cy: 1150, cw: 68, rh: 50, size: 40};
const PG2: Geo = {cx: 530, cy: 1150, cw: 56, rh: 50, size: 40};
const PG3: Geo = {cx: 790, cy: 1150, cw: 56, rh: 50, size: 40};
const CARD_G: Geo = {cx: 790, cy: 420, cw: 50, rh: 42, size: 32};
const FLY = 0.7;

const Probe: React.FC = () => {
  const t = useSec();
  const o = hide(t, T.merk - 0.35, 0.5);
  if (o <= 0 || t < T.probe - 0.1) return null;
  const f1 = (i: number, j: number) => T.probe + 0.25 + 0.06 * (i * 3 + j);
  const f2 = (i: number, j: number) => T.probeAA + 0.35 + 0.06 * (i * 3 + j);
  const ops = show(t, T.probeAA + 0.2, 0.4);
  // Einträge des Produkts: (0,0) mit der Stimme, die übrigen nacheinander bei „Insgesamt“
  const order: [number, number][] = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (i + j > 0) order.push([i, j]);
  const resAt = (i: number, j: number) => (i + j === 0 ? T.alsoEins + 0.15 : T.insgesamt + 0.05 + 0.13 * order.findIndex(([a, b]) => a === i && b === j));
  // gerade gerechnete Zeile i (von A⁻¹) und Spalte j (von A)
  let hi: [number, number] | null = null;
  if (t >= T.ersteZeile && t < T.alsoEins + 0.6) hi = [0, 0];
  order.forEach(([i, j]) => {
    const a = resAt(i, j);
    if (t >= a - 0.1 && t < a + 0.08) hi = [i, j];
  });
  const fly = (from: V2, to: V2, a: number, tex: string, size0: number, size1: number, key: string) => {
    const x = clamp((t - a) / FLY);
    if (t < a) return null;
    const e = easeInOutCubic(x);
    return (
      <div key={key} style={{position: 'absolute', left: lerp(from[0], to[0], e), top: lerp(from[1], to[1], e) - Math.sin(Math.PI * e) * 40, transform: `translate(-50%, -50%) scale(${lerp(size0 / size1, 1, e)})`, opacity: clamp(x * 4), textShadow: shadow, whiteSpace: 'nowrap'}}>
        <Tex tex={tex} size={size1} />
      </div>
    );
  };
  const band = (g: Geo, kind: 'row' | 'col', k: number, c: string) => (
    <div
      style={{
        position: 'absolute',
        left: kind === 'row' ? g.cx - 1.62 * g.cw : at3(g, 0, k)[0] - g.cw * 0.48,
        top: kind === 'row' ? at3(g, k, 0)[1] - g.rh * 0.46 : g.cy - 1.58 * g.rh,
        width: kind === 'row' ? g.cw * 3.24 : g.cw * 0.96,
        height: kind === 'row' ? g.rh * 0.92 : g.rh * 3.16,
        borderRadius: 10,
        background: `${c}2a`,
        boxShadow: `inset 0 0 0 2px ${c}aa`,
      }}
    />
  );
  // erster Eintrag vorgerechnet: Paare (A⁻¹)₀ₖ · A_k₀
  const pairAt = [T.p1, T.p2, T.p3];
  const pairG = (k: number) => bump(t, pairAt[k], 0.9);
  const check = show(t, T.insgesamt + 1.25, 0.4);
  const checkG = bump(t, T.insgesamt + 1.3, 1.2);
  return (
    <AbsoluteFill style={{opacity: o}}>
      {hi ? band(PG1, 'row', hi[0], REC) : null}
      {hi ? band(PG2, 'col', hi[1], C.cyan) : null}
      <Brk3 g={PG1} o={show(t, T.probe + 0.2, 0.4)} />
      <Brk3 g={PG2} o={show(t, T.probeAA + 0.3, 0.4)} />
      <Brk3 g={PG3} o={ops} color={check > 0.5 ? GREEN : C.txt} />
      <div style={{position: 'absolute', left: (PG1.cx + 1.5 * PG1.cw + PG2.cx - 1.5 * PG2.cw) / 2, top: PG1.cy, transform: 'translate(-50%, -50%)', opacity: ops}}>
        <Tex tex="\cdot" size={46} />
      </div>
      <div style={{position: 'absolute', left: (PG2.cx + 1.5 * PG2.cw + PG3.cx - 1.5 * PG3.cw) / 2, top: PG1.cy, transform: 'translate(-50%, -50%)', opacity: ops}}>
        <Tex tex="=" size={46} />
      </div>
      {/* Beschriftung */}
      <div style={{position: 'absolute', left: PG1.cx, top: 1050, transform: 'translate(-50%, -50%)', opacity: show(t, T.probe + 0.2, 0.4), textShadow: shadow}}>
        <Tex tex={RC('A^{-1}')} size={38} />
      </div>
      <div style={{position: 'absolute', left: PG2.cx, top: 1050, transform: 'translate(-50%, -50%)', opacity: show(t, T.probeAA + 0.3, 0.4), textShadow: shadow}}>
        <Tex tex="A" size={38} />
      </div>
      <div style={{position: 'absolute', left: PG3.cx, top: 1050, transform: `translate(-50%, -50%) scale(${1 + 0.15 * checkG})`, opacity: check, textShadow: `0 0 ${10 + 24 * checkG}px rgba(123,234,156,.8), ${shadow}`, whiteSpace: 'nowrap'}}>
        <Tex tex={`I\\;\\;${col(GREEN, '\\checkmark')}`} size={38} />
      </div>
      {/* A⁻¹ fliegt aus der großen Matrix, A aus der Aufgabenkarte */}
      {AINV.flatMap((r, i) => r.map((v, j) => fly(cell(i, 3 + j), at3(PG1, i, j), f1(i, j), RC(numTex(v)), SIZE, PG1.size, `a${i}${j}`)))}
      {AMAT.flatMap((r, i) => r.map((v, j) => fly(at3(CARD_G, i, j), at3(PG2, i, j), f2(i, j), numTex(v), CARD_G.size, PG2.size, `b${i}${j}`)))}
      {/* Paare des ersten Eintrags leuchten */}
      {[0, 1, 2].map((k) => {
        const g = pairG(k);
        if (g <= 0.02) return null;
        return (
          <React.Fragment key={`pg${k}`}>
            {[at3(PG1, 0, k), at3(PG2, k, 0)].map(([x, y], m) => (
              <div key={m} style={{position: 'absolute', left: x, top: y, width: 50, height: 50, transform: `translate(-50%, -50%) scale(${1 + 0.2 * g})`, borderRadius: 25, boxShadow: `0 0 0 3px rgba(255,255,255,${0.8 * g}), 0 0 ${20 * g}px rgba(255,255,255,.6)`}} />
            ))}
          </React.Fragment>
        );
      })}
      {/* Ergebnis I */}
      {[0, 1, 2].flatMap((i) =>
        [0, 1, 2].map((j) => {
          const a = resAt(i, j);
          const p = easeOutExpo(clamp((t - a) / 0.3));
          if (p <= 0) return null;
          const [x, y] = at3(PG3, i, j);
          const g = bump(t, a, 0.7) + checkG * (i === j ? 1 : 0.3);
          return (
            <div key={`c${i}${j}`} style={{position: 'absolute', left: x, top: y + (1 - p) * 10, transform: `translate(-50%, -50%) scale(${1 + 0.18 * g})`, opacity: p, textShadow: `0 0 ${8 + 22 * g}px ${check > 0.5 ? GREEN : 'rgba(255,255,255,.8)'}, ${shadow}`}}>
              <Tex tex={i === j ? '1' : '0'} size={PG3.size} />
            </div>
          );
        }),
      )}
      {/* Rechnung zum ersten Eintrag */}
      <FRow
        y={1292}
        size={40}
        gap={10}
        items={[
          {tex: `${RC('0')}\\cdot 1`, o: show(t, T.p1, 0.3), glow: pairG(0)},
          {tex: `+\\;(${RC('-1')})\\cdot 0`, o: show(t, T.p2, 0.3), glow: pairG(1)},
          {tex: `+\\;${RC('1')}\\cdot 1`, o: show(t, T.p3, 0.3), glow: pairG(2)},
          {tex: '=\\;1', o: show(t, T.alsoEins, 0.3), glow: bump(t, T.alsoEins + 0.1, 1.0)},
        ].map((it) => ({...it, o: it.o * hide(t, T.insgesamt + 1.0, 0.4)}))}
      />
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
  const qG = bump(t, T.berechne + 0.2, 1.4);
  const ok = bump(t, T.insgesamt + 1.3, 1.4);
  const cells: Cell[][] = AMAT.map((r) => r.map((v) => ({states: [[0, numTex(v)]] as CState[], glow: bump(t, T.probeAA + 0.3, 0.9) * 0.8})));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: clamp(appear * 1.4) * (1 - gone), transform: `translateY(${(1 - appear) * 24}px)`}}>
      <div
        style={{
          position: 'absolute',
          left: MARGIN,
          top: CARD.top,
          width: W - 2 * MARGIN,
          height: CARD.h,
          boxSizing: 'border-box',
          borderRadius: 26,
          border: `1.5px solid rgba(255,255,255,${0.18 + 0.4 * ok})`,
          background: 'linear-gradient(180deg, rgba(20,22,52,.86), rgba(10,11,32,.82))',
          boxShadow: `0 30px 90px rgba(0,0,0,.35)${ok > 0 ? `, 0 0 60px rgba(123,234,156,${0.25 * ok})` : ''}`,
        }}
      >
        <div style={{position: 'absolute', left: 34, top: 24, fontFamily: F.mono, fontWeight: 600, fontSize: 24, letterSpacing: '.1em', color: C.eig}}>MATHE 1 · KLAUSUR</div>
        <div style={{position: 'absolute', left: 34, top: 74, whiteSpace: 'nowrap', textShadow: qG > 0.02 ? `0 0 ${20 * qG}px rgba(255,194,71,${0.6 * qG})` : undefined}}>
          <Tex tex={`\\text{Berechne } ${RC('A^{-1}')}`} size={42} />
        </div>
        <div style={{position: 'absolute', left: 34, top: 128, whiteSpace: 'nowrap'}}>
          <Tex tex="\text{mit Gauß-Jordan.}" size={36} style={{color: C.txt2}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: CARD_G.cx - 1.5 * CARD_G.cw - 26, top: CARD_G.cy, transform: 'translate(-100%, -50%)', whiteSpace: 'nowrap'}}>
        <Tex tex="A =" size={34} />
      </div>
      <Brk3 g={CARD_G} o={1} />
      {cells.map((row, i) => row.map((c, j) => <CellView key={`${i}${j}`} t={t} x={at3(CARD_G, i, j)[0]} y={at3(CARD_G, i, j)[1]} size={CARD_G.size} c={c} />))}
    </div>
  );
};

const STEPS = ['Ansatz', 'Nullen unten', 'Nullen oben', 'Probe'];
const STEP_T = (): [number, number][] => [
  [T.neben, T.unten],
  [T.unten, T.oben],
  [T.oben, T.probe],
  [T.probe, T.insgesamt + 1.25],
];
const STEP_W = (W - 2 * MARGIN - 3 * 14) / 4;
const PROGRESS_Y = 516;
const Progress: React.FC = () => {
  const t = useSec();
  const out = hide(t, T.merk - 0.3, 0.45);
  if (out <= 0) return null;
  const ST = STEP_T();
  return (
    <>
      {STEPS.map((name, i) => {
        const p = springOS(clamp((t - (T.neben - 0.5 + 0.12 * i)) / 0.6));
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
              left: MARGIN + i * (STEP_W + 14),
              top: PROGRESS_Y,
              width: STEP_W,
              height: 54,
              boxSizing: 'border-box',
              borderRadius: 16,
              border: `2.5px solid ${border}`,
              background: st === 'active' ? 'rgba(255,194,71,.10)' : st === 'ok' ? 'rgba(243,244,251,.06)' : 'rgba(255,255,255,.02)',
              boxShadow: st === 'active' ? '0 0 30px rgba(255,194,71,.25)' : undefined,
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              paddingLeft: 11,
              opacity: clamp(p * 1.4) * out,
              transform: `scale(${(0.9 + 0.1 * p) * (1 + 0.06 * pulse)})`,
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                flex: 'none',
                borderRadius: 14,
                border: `2px solid ${st === 'idle' ? C.txt2 : border}`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: F.mono,
                fontWeight: 600,
                fontSize: 17,
                color: st === 'idle' ? C.txt2 : border,
              }}
            >
              {st === 'ok' ? '✓' : i + 1}
            </span>
            <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 24, whiteSpace: 'nowrap', color: st === 'idle' ? C.txt2 : C.txt}}>{name}</span>
          </div>
        );
      })}
    </>
  );
};

/* ---------- Merksatz ---------- */

const Merksatz: React.FC = () => {
  const t = useSec();
  const p = springOS(clamp((t - (T.merk - 0.1)) / 0.7));
  const out = hide(t, T.cta - 0.2, 0.4);
  if (p <= 0 || out <= 0) return null;
  const lines: [string, string | null, number][] = [
    ['A und I nebeneinander', '(A\\,|\\,I)', T.m1],
    ['Zeilenumformungen, bis links I steht', null, T.m2],
    ['rechts ablesen', `(I\\,|\\,${RC('A^{-1}')})`, T.m3],
  ];
  return (
    <div
      style={{
        position: 'absolute',
        left: MARGIN,
        width: W - 2 * MARGIN,
        top: 650,
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
      <div style={{fontFamily: F.mono, fontWeight: 600, fontSize: 22, letterSpacing: '.1em', color: C.eig}}>FÜR DIE KLAUSUR · INVERSE MIT GAUSS-JORDAN</div>
      {lines.map(([s, tex, at], i) => {
        const g = bump(t, at, 1.4);
        const k = show(t, T.merk + 0.25 + 0.2 * i, 0.4);
        return (
          <div
            key={i}
            style={{
              marginTop: i === 0 ? 28 : 18,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              fontFamily: F.display,
              fontWeight: 700,
              fontSize: 37,
              color: C.txt,
              opacity: k,
              transform: `translateX(${(1 - k) * -16}px) scale(${1 + 0.04 * g})`,
              transformOrigin: 'left center',
              textShadow: g > 0.02 ? `0 0 ${24 * g}px rgba(255,194,71,${0.7 * g})` : undefined,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{width: 40, height: 40, flex: 'none', borderRadius: 20, background: C.eig, color: C.bg, fontSize: 24, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</span>
            <span>{s}</span>
            {tex ? <Tex tex={tex} size={40} /> : null}
          </div>
        );
      })}
      <div style={{marginTop: 26, display: 'flex', alignItems: 'center', gap: 10, fontFamily: F.body, fontWeight: 500, fontSize: 27, color: C.txt2, opacity: show(t, T.merk + 0.9, 0.4), whiteSpace: 'nowrap'}}>
        <span>Pivot ≠ 1? Zeile teilen. Probe:</span>
        <Tex tex={`${RC('A^{-1}')}\\cdot A = I`} size={30} />
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

const CUES = SUBTITLES.map(([a, b, text], i) => {
  const next = SUBTITLES[i + 1] ? SUBTITLES[i + 1][0] - 0.1 : Infinity;
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
      <div style={{maxWidth: 820, padding: '8px 18px', borderRadius: 12, background: 'rgba(7,8,26,.62)', fontFamily: F.body, fontWeight: 500, fontSize: 30, lineHeight: 1.3, color: 'rgba(243,244,251,.88)', textAlign: 'center'}}>{c.text}</div>
    </div>
  );
};

const Flash: React.FC = () => {
  const t = useSec();
  const f = Math.max(bump(t, 0, 0.22) * 0.8, bump(t, T.linksI + 0.1, 0.4) * 0.5, bump(t, T.deshalb + 0.1, 0.4) * 0.6, bump(t, T.insgesamt + 1.25, 0.4) * 0.5);
  return f > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.1 * f}} /> : null;
};

/* ---------- Ton ---------- */

const SFX: [number, string, number][] = [
  [0, 'whoosh', 0.5],
  [0, 'accent_small', 0.35],
  [T.berechne - 0.1, 'whoosh', 0.26],
  [T.rechts, 'tick', 0.3],
  [T.aInv, 'tick', 0.26],
  [T.ergibt + 0.2, 'click', 0.26],
  [T.neben + 0.1, 'swell', 0.26],
  ...[0, 1, 2].map((i) => [IPOP(i, i), 'click', 0.22] as [number, string, number]),
  [T.mit + 0.25, 'whoosh', 0.22],
  [T.unten + 0.2, 'tick', 0.26],
  [T.schon + 0.3, 'tick', 0.28],
  ...OPS.flatMap((op, n) => {
    const tm = OPT[n];
    const out: [number, string, number][] = [
      [tm.down1, 'whoosh', 0.2],
      ...tm.resAt.map((r, j) => [r, 'click', j < 3 || op.detail ? 0.24 : 0.18] as [number, string, number]),
      [tm.land(0), 'lock', 0.3],
    ];
    if (op.kVals) out.push([tm.k, 'tick', 0.3]);
    return out;
  }),
  [T.oben + 0.3, 'tick', 0.26],
  [T.linksI + 0.1, 'accent', 0.4],
  [T.undRechts, 'swell', 0.26],
  [T.multi + 0.5, 'tick', 0.26],
  [T.alleFuenf + 0.3, 'whoosh', 0.24],
  [T.alleFuenf + 0.8, 'lock', 0.3],
  [T.macht + 0.1, 'tick', 0.26],
  [T.eInv, 'lock', 0.32],
  [T.eMalI, 'tick', 0.26],
  [T.deshalb + 0.1, 'lock_hi', 0.42],
  [T.probe + 0.25, 'whoosh', 0.24],
  [T.probeAA + 0.35, 'whoosh', 0.2],
  [T.p1, 'tick', 0.24],
  [T.p2, 'tick', 0.24],
  [T.p3, 'tick', 0.24],
  [T.alsoEins + 0.15, 'click', 0.28],
  ...Array.from({length: 8}, (_, i) => [T.insgesamt + 0.05 + 0.13 * i, 'tick', 0.16] as [number, string, number]),
  [T.insgesamt + 1.25, 'accent', 0.45],
  [T.merk - 0.1, 'whoosh', 0.3],
  [T.m1, 'tick', 0.26],
  [T.m2, 'tick', 0.26],
  [T.m3, 'tick', 0.26],
  [T.cta - 0.1, 'swell', 0.34],
  ...Array.from({length: 8}, (_, i) => [T.tippt + i * 0.075, 'tick', 0.18] as [number, string, number]),
];

/* ---------- Komposition ---------- */

const LEAD = 0.08;
const TAIL = 0.1;

export type INVProps = {music: boolean; voice: boolean};

export const VideoINV: React.FC<INVProps> = ({music, voice}) => {
  useTexFonts();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={1000} strength={0.9} />
      <BigMatrix />
      <Goal />
      <Why />
      <Protocol />
      <Probe />
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
              <Sequence key={`v${c.i}`} from={sec(c.at - lead)} durationInFrames={sec(c.to - c.from + lead + TAIL)} layout="none">
                <Audio src={staticFile(VOICE)} trimBefore={sec(c.from - lead)} trimAfter={sec(c.to + TAIL)} />
              </Sequence>
            );
          })
        : null}
    </AbsoluteFill>
  );
};
