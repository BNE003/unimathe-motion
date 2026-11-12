// Rechnung: Matrix A → A − λI → A − 1·I / A − 3·I, Determinante, Gauß, Regler, Vektoren und Beschriftungen im Raum.
import React from 'react';
import {C} from '../theme';
import {F} from '../fonts';
import {V2, bump, clamp, easeInOutCubic, easeOutExpo, lerp, prog, springOS} from '../math';
import {Tex, col, useSec} from '../ui';
import {V3, add3, sc3} from '../space';
import {CState, Chunk, ColVec, colVecW, MagicRow, Parens, Pill, Regler, Roll, RowState, chunkW, glowShadow, hide, rowLayout, shadow, show} from './kit';
import {NODE_X, RES_Y} from './Hud';
import {B1, B2, E1, K, STAGE1, STAGE1_OUT, STAGE2, TRIPLE, W1, W3, kTriple, project, sReg3, tReg1, tReg3, vis} from './world';
import {T, V} from './timeline';

const L = col(K.lam, '\\lambda');
const C1 = (s: string) => col(K.l1, s);
const C3 = (s: string) => col(K.l3, s);
const CT = (s: string) => col(K.t3, s);
const GRAY = 'rgba(243,244,251,.42)';

/* ---------- Geometrie der großen Matrix ---------- */

type Geo = {cx: number; cy: number; cw: number; rh: number; size: number};
const G_HOOK: Geo = {cx: 580, cy: 800, cw: 150, rh: 110, size: 84};
const G_M1: Geo = {cx: 540, cy: 792, cw: 196, rh: 96, size: 60};
const G_M2: Geo = {cx: 400, cy: 792, cw: 150, rh: 96, size: 60};
const mixGeo = (a: Geo, b: Geo, k: number): Geo => ({cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), cw: lerp(a.cw, b.cw, k), rh: lerp(a.rh, b.rh, k), size: lerp(a.size, b.size, k)});
const kM1 = (t: number) => prog(t, T.gesucht - 0.25, 0.7);
// schmaler erst, wenn nur noch Zahlen in der Matrix stehen
const kM2 = (t: number) => (t < T.l3 - 1.0 ? prog(t, T.abziehen + 0.45, 0.6) : prog(t, T.l3 + 1.65, 0.6));
const geoAt = (t: number) => mixGeo(mixGeo(G_HOOK, G_M1, kM1(t)), G_M2, kM2(t));

// λ = 1: Zeile 3 rutscht nach der Division über die Nullzeile; bei λ = 3 (Matrix neu) wieder in Ausgangslage
const SWAP: [number, number] = [T.durch2 + 0.55, 0.6];
const RESET3 = T.l3 - 1.2;
const rowPos = (t: number, i: number) => {
  const s = t < RESET3 ? prog(t, SWAP[0], SWAP[1]) : 0;
  return i === 1 ? lerp(1, 2, s) : i === 2 ? lerp(2, 1, s) : 0;
};
const cellXY = (g: Geo, pos: number, j: number): V2 => [g.cx + (j - 1) * g.cw, g.cy + (pos - 1) * g.rh];

const M_OUT1 = STAGE1[0] - 0.15;
const M_BACK = T.l3 - 0.75;
const M_OUT2 = STAGE2[0] - 0.15;
const matO = (t: number) => (t < M_BACK - 0.1 ? hide(t, M_OUT1, 0.45) : show(t, M_BACK, 0.5) * hide(t, M_OUT2, 0.45));

/* ---------- Zeiten ---------- */

// λ fällt aus λI auf die Diagonale
const FALL = [0, 1, 2].map((i) => T.lambdaSteht + 0.1 + 0.25 * i);
const FALL_D = 0.75;
const LAND = FALL.map((f) => f + FALL_D);
// Einsetzen
const SUB1 = T.einsVon + 0.15;
const RES1 = T.abziehen - 0.05;
const SUB3 = T.l3 + 0.5;
const RES3 = T.l3 + 1.15;
const SCALE = T.durch2 + 0.1;

type Op = {target: number; src: number; sign: '-' | '+'; tVals: string[]; sVals: string[]; res: string[]; down1: number; down2: number; line: number; resAt: number[]};
const OP1: Op = {target: 1, src: 0, sign: '-', tVals: ['1', '1', '0'], sVals: ['1', '1', '0'], res: ['0', '0', '0'], down1: T.op1 + 0.05, down2: T.op1 + 1.0, line: T.op1 + 1.5, resAt: [T.op1Null - 0.05, T.op1Null + 0.1, T.op1Null + 0.25]};
const OP3: Op = {target: 1, src: 0, sign: '+', tVals: ['1', '-1', '0'], sVals: ['-1', '1', '0'], res: ['0', '0', '0'], down1: T.op3 + 0.05, down2: T.op3 + 1.0, line: T.op3 + 1.55, resAt: [T.op3Null - 0.05, T.op3Null + 0.1, T.op3Null + 0.25]};
const DOWN = 0.6;
const UP = 0.6;
const upAt = (op: Op) => op.resAt[2] + 0.45;
const landAt = (op: Op, j: number) => upAt(op) + 0.08 * j + UP;
const CALC = {ty: 1012, sy: 1089, line: 1130, ry: 1177, size: 52, labelX: 168};

const EQ1 = SWAP[0] + SWAP[1] + 0.1;
const BAND1 = T.spalteY + 0.25;
const BAND3Y = V(70.95);
const BAND3Z = V(71.6);
// Determinante: Entwicklung nach Zeile 3
const STRIKE = T.drei + 0.45;
const LAP_OUT = T.ew1;

/* ---------- Matrix-Einträge ---------- */

const lm = (n: string) => `${n}-${L}`;
const cellStates = (i: number, j: number): CState[] => {
  const A0 = [
    ['2', '1', '0'],
    ['1', '2', '0'],
    ['0', '0', '3'],
  ][i][j];
  const st: CState[] = [[0, A0]];
  const d = i === j;
  const dg = 0.15 * i;
  if (d) {
    st.push([LAND[i], lm(A0)]);
    st.push([SUB1 + dg, `${A0}-${C1('1')}`]);
    st.push([RES1 + dg, `${Number(A0) - 1}`]);
  }
  if (i === 1) st.push([upAt(OP1) + 0.08 * j, ''], [landAt(OP1, j), OP1.res[j]]);
  if (i === 2 && j === 2) st.push([SCALE + 0.3, '1']);
  // λ = 3: neu aufgebaut, solange die Matrix unsichtbar ist
  st.push([RESET3, d ? lm(A0) : A0]);
  if (d) {
    st.push([SUB3 + dg, `${A0}-${C3('3')}`]);
    st.push([RES3 + dg, `${Number(A0) - 3}`]);
  }
  if (i === 1) st.push([upAt(OP3) + 0.08 * j, ''], [landAt(OP3, j), OP3.res[j]]);
  return st.sort((a, b) => a[0] - b[0]);
};
const CELLS = [0, 1, 2].map((i) => [0, 1, 2].map((j) => cellStates(i, j)));

const cellGlow = (t: number, i: number, j: number) => {
  let g = 0;
  if (i === j) g += bump(t, LAND[i], 0.9) + bump(t, RES1 + 0.15 * i, 0.8) * 0.7 + bump(t, RES3 + 0.15 * i, 0.8) * 0.7;
  if (i === 2 && j === 2) g += bump(t, T.drei, 1.1) + bump(t, SCALE + 0.3, 0.9);
  if ((i === 0 && j === 0) || (i === 1 && j === 1)) g += bump(t, T.malZwei + 0.2, 1.1) * 0.8;
  if ((i === 0 && j === 1) || (i === 1 && j === 0)) g += bump(t, T.minusEins, 1.0) * 0.8;
  if (i === 1) g += bump(t, landAt(OP1, j), 0.9) * 0.8 + bump(t, landAt(OP3, j), 0.9) * 0.8;
  return g;
};
const cellOpacity = (t: number, i: number, j: number) => {
  // Laplace: Nullen der letzten Zeile treten zurück
  if (i === 2 && j < 2) return 1 - 0.65 * prog(t, T.letzte, 0.4) * hide(t, LAP_OUT, 0.4);
  return 1;
};

const MatrixLabel: React.FC<{t: number; g: Geo; o: number}> = ({t, g, o}) => {
  const states: CState[] = [
    [0, 'A ='],
    [T.gesucht - 0.2, 'A'],
    [T.lambdaSteht + 0.25, `A-${L} I`],
    [SUB1 - 0.1, `A-${C1('1')}\\cdot I`],
    [RESET3, `A-${L} I`],
    [SUB3 - 0.1, `A-${C3('3')}\\cdot I`],
  ];
  const k = kM1(t);
  const left = cellXY(g, 1, 0)[0] - g.cw * 0.5 - 70;
  const x = lerp(left - 70, g.cx, k);
  const y = lerp(g.cy, g.cy - 1.5 * g.rh - 66, k);
  return <Roll t={t} states={states} size={lerp(g.size, 52, k)} x={x} y={y} o={o} glow={bump(t, T.lambdaSteht + 0.3, 1) + bump(t, SUB1, 0.9) + bump(t, SUB3, 0.9)} color={K.lam} />;
};

const Matrix: React.FC = () => {
  const t = useSec();
  const o = matO(t);
  if (o <= 0.005) return null;
  const g = geoAt(t);
  const appear = t < 1 ? springOS(clamp(t / 0.6)) : 1;
  const w = g.cw * 3 + g.size * 0.45;
  const h = g.rh * 3 + g.size * 0.15;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o * clamp(appear * 1.3), transform: `scale(${0.9 + 0.1 * appear})`, transformOrigin: `${g.cx}px ${g.cy}px`}}>
      <Laplace t={t} g={g} />
      <FreeBands t={t} g={g} />
      <Parens cx={g.cx} cy={g.cy} w={w} h={h} size={g.size} o={1} />
      {[0, 1, 2].map((i) =>
        [0, 1, 2].map((j) => {
          const [x, y] = cellXY(g, rowPos(t, i), j);
          return <Roll key={`${i}${j}`} t={t} states={CELLS[i][j]} size={g.size} x={x} y={y} glow={cellGlow(t, i, j)} color={i === j ? K.lam : 'rgba(255,255,255,.85)'} o={cellOpacity(t, i, j)} />;
        }),
      )}
      <MatrixLabel t={t} g={g} o={1} />
      <ColLabels t={t} g={g} />
      <Pivots t={t} g={g} />
      <Equations t={t} g={g} />
      <ScaleTag t={t} g={g} />
    </div>
  );
};

// Spaltennamen x, y, z über der Matrix, sobald Gleichungen gelesen werden
const ColLabels: React.FC<{t: number; g: Geo}> = ({t, g}) => {
  const o = show(t, T.l1, 0.5);
  if (o <= 0) return null;
  return (
    <>
      {['x', 'y', 'z'].map((s, j) => {
        const [x] = cellXY(g, 0, j);
        const free = j === 1 ? bump(t, T.spalteY + 0.2, 1.2) + bump(t, BAND3Y, 1.0) : j === 2 ? bump(t, BAND3Z, 1.0) : 0;
        return (
          <div key={s} style={{position: 'absolute', left: x, top: g.cy - 1.5 * g.rh - 6, transform: `translate(-50%, -50%) scale(${1 + 0.2 * free})`, opacity: o * 0.75, textShadow: glowShadow(free, C.txt)}}>
            <Tex tex={s} size={32} style={{color: C.txt2}} />
          </div>
        );
      })}
    </>
  );
};

// Entwicklung nach der letzten Zeile: Zeile 3 und Spalte 3 gestrichen, 2×2-Block, Kreuz-Produkte
const Laplace: React.FC<{t: number; g: Geo}> = ({t, g}) => {
  const band = show(t, T.entwickle, 0.4) * hide(t, STRIKE, 0.4);
  const strike = prog(t, STRIKE, 0.45) * hide(t, LAP_OUT, 0.4);
  const block = show(t, STRIKE + 0.2, 0.4) * hide(t, LAP_OUT, 0.4);
  const diag = prog(t, T.malZwei, 0.5) * hide(t, LAP_OUT, 0.4);
  const anti = prog(t, T.minusEins - 0.1, 0.5) * hide(t, LAP_OUT, 0.4);
  const sign = show(t, T.drei - 0.1, 0.4) * hide(t, LAP_OUT, 0.4);
  if (band + strike + block + sign <= 0) return null;
  const [x00, y00] = cellXY(g, 0, 0);
  const [x11, y11] = cellXY(g, 1, 1);
  const [x22, y22] = cellXY(g, 2, 2);
  const W3 = g.cw * 3 + g.size * 0.2;
  const H3 = g.rh * 3;
  const ln = (x1: number, y1: number, x2: number, y2: number, c: string, k: number, wd = 4) => (
    <line x1={x1} y1={y1} x2={lerp(x1, x2, k)} y2={lerp(y1, y2, k)} stroke={c} strokeWidth={wd} strokeLinecap="round" />
  );
  return (
    <>
      {band > 0 ? <div style={{position: 'absolute', left: g.cx - W3 / 2, top: y22 - g.rh * 0.42, width: W3, height: g.rh * 0.84, borderRadius: 16, background: `${K.lam}22`, boxShadow: `inset 0 0 0 2px ${K.lam}88`, opacity: band}} /> : null}
      {block > 0 ? (
        <div style={{position: 'absolute', left: x00 - g.cw * 0.5, top: y00 - g.rh * 0.46, width: g.cw * 2, height: g.rh * 1.92, borderRadius: 18, boxShadow: `inset 0 0 0 3px ${K.lam}`, background: `${K.lam}10`, opacity: block}} />
      ) : null}
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <g opacity={0.55 * (strike > 0 ? 1 : 0)}>
          {ln(g.cx - W3 / 2, y22, g.cx + W3 / 2, y22, K.lam, strike)}
          {ln(x22, g.cy - H3 / 2, x22, g.cy + H3 / 2, K.lam, strike)}
        </g>
        {diag > 0 ? ln(x00 - 30, y00 - 22, x11 + 30, y11 + 22, K.lam, diag, 3) : null}
        {anti > 0 ? ln(x11 + 30, y00 - 22, x00 - 30, y11 + 22, C.txt2, anti, 3) : null}
      </svg>
      {sign > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: x22 + g.cw * 0.36,
            top: y22 - g.rh * 0.52,
            width: 34,
            height: 34,
            borderRadius: 17,
            transform: `translate(-50%, -50%) scale(${sign})`,
            background: K.lam,
            color: C.bg,
            fontFamily: F.display,
            fontWeight: 800,
            fontSize: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          +
        </div>
      ) : null}
    </>
  );
};

// freie Spalten: gestrichelter Rahmen über die ganze Spalte, darunter „frei“
const FreeBands: React.FC<{t: number; g: Geo}> = ({t, g}) => {
  const bands: [number, string, number][] = [
    [1, K.l1, show(t, BAND1, 0.45) * hide(t, M_OUT1, 0.3) * (t < M_BACK ? 1 : 0)],
    [1, K.l3, show(t, BAND3Y, 0.45) * (t > M_BACK ? 1 : 0)],
    [2, K.t3, show(t, BAND3Z, 0.45) * (t > M_BACK ? 1 : 0)],
  ];
  return (
    <>
      {bands.map(([j, c, o], n) => {
        if (o <= 0) return null;
        const [x] = cellXY(g, 0, j);
        return (
          <React.Fragment key={n}>
            <div style={{position: 'absolute', left: x - g.cw * 0.44, top: g.cy - g.rh * 1.5, width: g.cw * 0.88, height: g.rh * 3, borderRadius: 18, border: `3px dashed ${c}`, background: `${c}14`, opacity: o}} />
            <div style={{position: 'absolute', left: x, top: g.cy + g.rh * 1.5 + 30, transform: 'translate(-50%, -50%)', opacity: o, fontFamily: F.display, fontWeight: 700, fontSize: 28, color: c, textShadow: shadow}}>frei</div>
          </React.Fragment>
        );
      })}
    </>
  );
};

const Ring: React.FC<{x: number; y: number; r: number; p: number; color?: string}> = ({x, y, r, p, color = K.mint}) =>
  p > 0 ? <div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: r, boxShadow: `inset 0 0 0 3px ${color}, 0 0 18px ${color}`, transform: `scale(${p})`, opacity: clamp(p)}} /> : null;

const Pivots: React.FC<{t: number; g: Geo}> = ({t, g}) => {
  const r = g.size * 0.62;
  const p1 = t < M_BACK ? springOS(clamp((t - (EQ1 + 0.1)) / 0.5)) : 0;
  const p3 = t > M_BACK ? springOS(clamp((t - (T.bleibt - 0.2)) / 0.5)) : 0;
  const [a, b] = cellXY(g, 0, 0);
  const [c, d] = cellXY(g, 1, 2);
  return (
    <>
      <Ring x={a} y={b} r={r} p={Math.max(p1, p3)} />
      <Ring x={c} y={d} r={r} p={p1} />
    </>
  );
};

// Gleichungen rechts neben den Zeilen
const Equations: React.FC<{t: number; g: Geo}> = ({t, g}) => {
  const x = g.cx + 1.5 * g.cw + 60;
  const rows: [number, CState[], number, boolean][] =
    t < M_BACK
      ? [
          [0, [[0, 'x+y=0']], show(t, EQ1, 0.4), false],
          [1, [[0, 'z=0']], show(t, EQ1 + 0.12, 0.4), false],
          [2, [[0, '0=0']], show(t, EQ1 + 0.24, 0.4), true],
        ]
      : [
          [
            0,
            [
              [0, '-x+y=0'],
              [T.xGleichY + 0.05, 'x=y'],
            ],
            show(t, T.bleibt - 0.15, 0.4),
            false,
          ],
          [1, [[0, '0=0']], show(t, landAt(OP3, 2) + 0.2, 0.4), true],
          [2, [[0, '0=0']], show(t, landAt(OP3, 2) + 0.32, 0.4), true],
        ];
  return (
    <>
      {rows.map(([pos, st, o, gray]) => {
        if (o <= 0) return null;
        const y = g.cy + (pos - 1) * g.rh;
        const k = st.length > 1 && t > st[1][0] ? 1 : 0;
        const p = easeInOutCubic(clamp((t - st[k][0]) / 0.38));
        const glow = pos === 0 ? bump(t, T.xGleichY + 0.2, 1.1) : 0;
        return (
          <div key={pos} style={{position: 'absolute', left: x, top: y, transform: `translateY(-50%) scale(${1 + 0.1 * glow})`, transformOrigin: 'left center', opacity: o * (gray ? 0.45 : 1), whiteSpace: 'nowrap', textShadow: glowShadow(glow, K.l3)}}>
            {k === 1 && p < 1 ? (
              <span style={{position: 'absolute', opacity: 1 - p}}>
                <Tex tex={st[0][1]} size={44} />
              </span>
            ) : null}
            <span style={{opacity: k === 1 ? p : 1}}>
              <Tex tex={st[k][1]} size={44} />
            </span>
          </div>
        );
      })}
    </>
  );
};

// Zeile 3 durch 2
const ScaleTag: React.FC<{t: number; g: Geo}> = ({t, g}) => {
  const o = show(t, T.op2 - 0.05, 0.4) * hide(t, SWAP[0] - 0.05, 0.3);
  if (o <= 0) return null;
  const [, y] = cellXY(g, 2, 2);
  return (
    <div style={{position: 'absolute', left: g.cx + 1.5 * g.cw + 60, top: y, transform: 'translateY(-50%)', opacity: o, whiteSpace: 'nowrap', textShadow: shadow}}>
      <Tex tex={`\\,:\\,2`} size={46} style={{color: K.lam}} />
    </div>
  );
};

/* ---------- Schriftliche Rechnung unter der Matrix ---------- */

const RowOp: React.FC<{op: Op; label: [string, string]}> = ({op, label}) => {
  const t = useSec();
  if (t < op.down1 || t > landAt(op, 2) + 0.05) return null;
  const g = geoAt(t);
  const fadeOut = 1 - clamp((t - upAt(op)) / 0.35);
  const sc = CALC.size / g.size;
  const xs = [0, 1, 2].map((j) => cellXY(g, 0, j)[0]);
  const band = (i: number, k: number, c: string) =>
    k > 0 ? (
      <div
        style={{
          position: 'absolute',
          left: g.cx - g.cw * 1.62,
          top: cellXY(g, rowPos(t, i), 0)[1] - g.rh * 0.44,
          width: g.cw * 3.24,
          height: g.rh * 0.88,
          borderRadius: 16,
          background: `${c}1c`,
          boxShadow: `inset 0 0 0 2px ${c}80`,
          opacity: k,
        }}
      />
    ) : null;
  const slide = (from: number, at: number, y: number, vals: string[], keyP: string) =>
    vals.map((v, j) => {
      if (t < at + 0.06 * j) return null;
      const k = easeInOutCubic(clamp((t - (at + 0.06 * j)) / DOWN));
      const [sx, sy] = cellXY(g, rowPos(t, from), j);
      const gl = bump(t, op.resAt[j] - 0.05, 0.8);
      return (
        <div
          key={`${keyP}${j}`}
          style={{
            position: 'absolute',
            left: lerp(sx, xs[j], k),
            top: lerp(sy, y, k),
            transform: `translate(-50%, -50%) scale(${lerp(1, sc, k) * (1 + 0.12 * gl)})`,
            opacity: (keyP === 's' ? clamp((k - 0.55) * 4) : clamp(k * 3)) * fadeOut,
            whiteSpace: 'nowrap',
            textShadow: glowShadow(gl, 'rgba(255,255,255,.8)'),
          }}
        >
          <Tex tex={v} size={g.size} />
        </div>
      );
    });
  const lab = (y: number, tex: string, at: number) => {
    const p = show(t, at, 0.35) * fadeOut;
    return p > 0 ? (
      <div style={{position: 'absolute', left: CALC.labelX, top: y, transform: 'translate(-100%, -50%)', opacity: p, whiteSpace: 'nowrap', textShadow: shadow}}>
        <Tex tex={tex} size={34} />
      </div>
    ) : null;
  };
  const lineP = prog(t, op.line, 0.4);
  const on = (at: number) => clamp((t - at) / 0.3) * (1 - clamp((t - (landAt(op, 2) + 0.2)) / 0.3));
  return (
    <>
      {band(op.target, on(op.down1), C.txt)}
      {band(op.src, on(op.down2) * (1 - clamp((t - upAt(op)) / 0.4)), C.txt2)}
      {lab(CALC.ty, label[0], op.down1 + 0.3)}
      {lab(CALC.sy, label[1], op.down2 + 0.3)}
      {slide(op.target, op.down1, CALC.ty, op.tVals, 't')}
      {slide(op.src, op.down2, CALC.sy, op.sVals, 's')}
      {lineP > 0 && fadeOut > 0 ? (
        <div style={{position: 'absolute', left: CALC.labelX - 80, top: CALC.line - 1.5, width: (xs[2] + 80 - (CALC.labelX - 80)) * lineP, height: 3, borderRadius: 2, background: C.txt, opacity: 0.85 * fadeOut}} />
      ) : null}
      {op.res.map((v, j) => {
        if (t < op.resAt[j] - 0.05 || t > landAt(op, j)) return null;
        const pIn = easeOutExpo(clamp((t - (op.resAt[j] - 0.05)) / 0.35));
        const f = easeInOutCubic(clamp((t - (upAt(op) + 0.08 * j)) / UP));
        const [ex, ey] = cellXY(g, rowPos(t, op.target), j);
        const gl = bump(t, op.resAt[j], 0.9);
        return (
          <div
            key={`r${j}`}
            style={{
              position: 'absolute',
              left: lerp(xs[j], ex, f),
              top: lerp(CALC.ry + (1 - pIn) * 16, ey, f) - Math.sin(Math.PI * f) * 30,
              transform: `translate(-50%, -50%) scale(${lerp(sc, 1, f) * (1 + 0.16 * gl)})`,
              opacity: pIn,
              whiteSpace: 'nowrap',
              textShadow: glowShadow(gl, 'rgba(255,255,255,.9)'),
            }}
          >
            <Tex tex={v} size={g.size} />
          </div>
        );
      })}
    </>
  );
};

export const RowOps: React.FC = () => (
  <>
    <RowOp op={OP1} label={['Z_2', '-\\;Z_1']} />
    <RowOp op={OP3} label={['Z_2', '+\\;Z_1']} />
  </>
);

/* ---------- Hook: was gesucht ist ---------- */

const Task: React.FC = () => {
  const t = useSec();
  const o = show(t, 0.15, 0.5) * hide(t, T.gesucht - 0.3, 0.35);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 140, right: 140, top: 1110, textAlign: 'center', opacity: o, fontFamily: F.body, fontWeight: 500, fontSize: 40, lineHeight: 1.35, color: C.txt, textShadow: shadow}}>
      <span style={{color: C.txt2}}>Gesucht:</span> alle Eigenwerte, die Eigenräume und je eine Basis.
    </div>
  );
};

/* ---------- ① Ansatz ---------- */

const AY = 1037;
const ch = (id: string, w: number, tex: string, extra: Partial<Chunk> = {}): Chunk => ({id, w, tex, ...extra});
const ROW_A_END = T.entwickle - 0.55;
const ROW_A: RowState[] = [
  {at: T.vNicht - 0.05, chunks: [ch('v1', 34, 'v')]},
  {at: T.nichtNull - 0.05, chunks: [ch('v1', 34, 'v'), ch('neq', 92, '\\neq 0')]},
  {
    at: T.av - 0.05,
    chunks: [ch('A', 46, 'A'), ch('d1', 30, '\\cdot'), ch('v1', 34, 'v'), ch('eq', 58, '='), ch('lam', 36, L), ch('d2', 30, '\\cdot'), ch('v2', 34, 'v'), ch('cm', 40, ','), ch('vv', 34, 'v'), ch('neq', 92, '\\neq 0')],
    dur: 0.7,
  },
  {
    at: T.umgestellt + 0.15,
    chunks: [ch('A', 46, 'A'), ch('d1', 30, '\\cdot'), ch('v1', 34, 'v'), ch('mi', 52, '-'), ch('lam', 36, L), ch('d2', 30, '\\cdot'), ch('v2', 34, 'v'), ch('eq', 58, '='), ch('zero', 36, '0'), ch('cm', 40, ','), ch('vv', 34, 'v'), ch('neq', 92, '\\neq 0')],
    dur: 0.7,
  },
  {
    at: T.aMinus + 0.05,
    chunks: [
      ch('lp', 24, '('),
      ch('A', 46, 'A'),
      ch('mi', 52, '-'),
      ch('lam', 36, L),
      ch('I', 28, 'I', {color: K.lam}),
      ch('rp', 24, ')'),
      ch('d1', 30, '\\cdot'),
      ch('v1', 34, 'v'),
      ch('eq', 58, '='),
      ch('zero', 36, '0'),
      ch('cm', 40, ','),
      ch('vv', 34, 'v'),
      ch('neq', 92, '\\neq 0'),
    ],
    dur: 0.7,
  },
];

const AnsatzRow: React.FC = () => {
  const t = useSec();
  const o = hide(t, ROW_A_END, 0.4);
  // I leuchtet auf, wenn es eingeführt wird
  const states = ROW_A.map((s) => ({...s, chunks: s.chunks.map((c) => (c.id === 'I' ? {...c, glow: bump(t, T.aMinus + 0.6, 1.1)} : c.id === 'lam' ? {...c, glow: bump(t, T.lambdaSteht, 1.2), color: K.lam} : c))}));
  return <MagicRow t={t} y={AY} size={58} states={states} o={o} />;
};

// λ fällt aus der Formel auf die Diagonale der Matrix
const LambdaDrops: React.FC = () => {
  const t = useSec();
  return (
    <>
      {FALL.map((f, i) => {
        if (t < f || t > LAND[i] + 0.05) return null;
        const k = easeInOutCubic(clamp((t - f) / FALL_D));
        const g = geoAt(t);
        const [ex, ey] = cellXY(g, i, i);
        const x = lerp(rowLayout(ROW_A[4].chunks, 540, 58).lam, ex + g.size * 0.88, k);
        const y = lerp(AY, ey, k) - Math.sin(Math.PI * k) * 90;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${1 + 0.2 * Math.sin(Math.PI * k)})`, textShadow: glowShadow(1, K.lam)}}>
            <Tex tex={L} size={58} />
          </div>
        );
      })}
    </>
  );
};

// Lösung v ≠ 0 ⇔ singulär ⇔ det = 0
const CY_ROW = 1139;
const ROW_C: RowState[] = [
  {at: T.loesung - 0.05, chunks: [ch('c1', 300, `\\text{Lösung } v\\neq 0`)]},
  {at: T.singulaer - 0.55, chunks: [ch('c1', 300, `\\text{Lösung } v\\neq 0`), ch('c2', 410, `\\;\\Leftrightarrow\\; A-${L} I\\ \\text{singulär}`)]},
];
const ReasonRow: React.FC = () => {
  const t = useSec();
  return <MagicRow t={t} y={CY_ROW} size={42} states={ROW_C} o={hide(t, ROW_A_END, 0.4)} />;
};

/* ---------- ② Determinante ---------- */

// Determinante: kleinere Schrift, damit die ausgeschriebene Entwicklung in den sicheren Bereich passt
const DS = 46;
const DCX = 512;
const DY0 = 1242;
const DY1 = 1037;
const DET_UP: [number, number] = [ROW_A_END + 0.1, 0.65];
const detY = (t: number) => lerp(DY0, DY1, prog(t, DET_UP[0], DET_UP[1]));
const DET = `\\det(A-${L} I)`;
const ROW_D = (t: number): RowState[] => {
  const g = geoAt(t);
  const p22 = cellXY(g, 2, 2);
  const pBlock: V2 = [(cellXY(g, 0, 0)[0] + cellXY(g, 1, 1)[0]) / 2, (cellXY(g, 0, 0)[1] + cellXY(g, 1, 1)[1]) / 2];
  const pAnti: V2 = cellXY(g, 0, 1);
  return [
    {at: T.determinante - 0.15, chunks: [ch('iff', 70, '\\Leftrightarrow'), ch('det', 245, DET, {glow: bump(t, T.determinante + 0.3, 1.2), color: K.lam}), ch('eq', 56, '='), ch('zero', 40, '0')]},
    {at: T.drei - 0.1, chunks: [ch('det', 245, DET), ch('eq', 56, '='), ch('f3', 128, '(3-' + L + ')', {from: p22, glow: bump(t, T.drei + 0.5, 1)})]},
    {
      at: T.malZwei - 0.1,
      chunks: [ch('det', 245, DET), ch('eq', 56, '='), ch('f3', 128, '(3-' + L + ')'), ch('dot', 26, '\\cdot'), ch('lb', 22, '\\big['), ch('sq', 150, '(2-' + L + ')^2', {from: pBlock, glow: bump(t, T.quadrat, 1)})],
    },
    {
      at: T.minusEins - 0.1,
      chunks: [
        ch('det', 245, DET),
        ch('eq', 56, '='),
        ch('f3', 128, '(3-' + L + ')'),
        ch('dot', 26, '\\cdot'),
        ch('lb', 22, '\\big['),
        ch('sq', 150, '(2-' + L + ')^2'),
        ch('m1', 66, '-\\,1', {from: pAnti}),
        ch('rb', 22, '\\big]'),
      ],
    },
  ];
};
const DetRow: React.FC = () => {
  const t = useSec();
  const o = hide(t, T.l1 - 0.45, 0.4);
  if (o <= 0) return null;
  const states = ROW_D(t);
  const y = detY(t);
  // Kasten um det(A − λI) = 0, bis die Entwicklung beginnt
  const box = show(t, T.determinante, 0.4) * hide(t, T.drei - 0.25, 0.3);
  const lay = rowLayout(states[0].chunks, DCX, DS);
  const xl = lay.det - chunkW(states[0].chunks[1], DS) / 2 - 22;
  const xr = lay.zero + chunkW(states[0].chunks[3], DS) / 2 + 22;
  const wBox = xr - xl;
  return (
    <>
      {box > 0 ? <div style={{position: 'absolute', left: xl, top: y - 44, width: wBox, height: 88, borderRadius: 22, boxShadow: `inset 0 0 0 3px ${K.lam}, 0 0 30px ${K.lam}55`, background: `${K.lam}12`, opacity: box * o}} /> : null}
      <MagicRow t={t} y={y} cx={DCX} size={DS} states={states} o={o} />
    </>
  );
};

const EY = 1139;
const FactorRow: React.FC = () => {
  const t = useSec();
  const o = hide(t, T.l1 - 0.45, 0.4);
  if (o <= 0) return null;
  const sqX = rowLayout(ROW_D(t)[3].chunks, DCX, DS).sq;
  const states: RowState[] = [
    {
      at: T.einsMinus - 0.05,
      chunks: [ch('eq', 56, '='), ch('f3b', 128, '(3-' + L + ')'), ch('dot', 26, '\\cdot'), ch('f1', 128, C1('(1-\\lambda)'), {from: [sqX - 30, DY1], glow: bump(t, T.einsMinus + 0.5, 1), color: K.l1}), ch('f3c', 128, C3('(3-\\lambda)'), {from: [sqX + 30, DY1], glow: bump(t, T.malDrei + 0.2, 1), color: K.l3})],
      dur: 0.7,
    },
    {
      at: T.eigenwerte - 0.2,
      chunks: [ch('eq', 56, '='), ch('f1', 128, C1('(1-\\lambda)')), ch('f3c', 150, C3('(3-\\lambda)^2'), {glow: bump(t, T.doppelt, 1.2) + bump(t, T.ew3, 0.9) * 0.5, color: K.l3})],
      dur: 0.6,
    },
  ];
  return <MagicRow t={t} y={EY} cx={DCX} size={DS} states={states} o={o} />;
};

const TIP_Y = 1340;
const Tips: React.FC = () => {
  const t = useSec();
  const a = show(t, T.nichtAus - 0.05, 0.4) * hide(t, T.eigenwerte - 0.3, 0.35);
  const b = show(t, T.binom - 0.05, 0.4) * hide(t, T.eigenwerte - 0.3, 0.35);
  return (
    <>
      <Pill x={540} y={TIP_Y} o={a} color={K.warn} size={30} scale={0.9 + 0.1 * a}>
        <span>⚠</span>
        <span>Nicht ausmultiplizieren</span>
      </Pill>
      {b > 0 ? (
        <div style={{position: 'absolute', left: 540, top: TIP_Y + 72, transform: 'translate(-50%, -50%)', opacity: b, whiteSpace: 'nowrap', textShadow: shadow}}>
          <Tex tex={`a^2-b^2=(a-b)(a+b),\\quad a=2-${L},\\ b=1`} size={34} style={{color: 'rgba(243,244,251,.75)'}} />
        </div>
      ) : null}
    </>
  );
};

// Eigenwerte als Marken, die danach in die Schrittleiste fliegen
const EV_Y = 1259;
const EV_FLY: [number, number] = [T.l1 - 0.6, 0.5];
const EigenChips: React.FC = () => {
  const t = useSec();
  const f = easeInOutCubic(clamp((t - EV_FLY[0]) / EV_FLY[1]));
  if (t > EV_FLY[0] + EV_FLY[1] + 0.05) return null;
  const dst: V2 = [NODE_X[1] + 110, RES_Y];
  const chip = (x: number, at: number, color: string, label: string) => {
    const a = springOS(clamp((t - at) / 0.5));
    if (a <= 0) return null;
    return (
      <Pill x={lerp(x, dst[0], f)} y={lerp(EV_Y, dst[1], f) - Math.sin(Math.PI * f) * 60} o={clamp(a * 1.3) * (1 - f * 0.6)} color={color} size={40} scale={lerp(0.85 + 0.15 * a, 0.5, f)} fill={0.18}>
        <span>{label}</span>
      </Pill>
    );
  };
  const dop = show(t, T.doppelt - 0.05, 0.35) * (1 - f);
  return (
    <>
      {chip(400, T.ew1 - 0.08, K.l1, 'λ₁ = 1')}
      {chip(680, T.ew3 - 0.05, K.l3, 'λ₂ = 3')}
      {dop > 0 ? (
        <div style={{position: 'absolute', left: 680, top: EV_Y + 62, transform: 'translate(-50%, -50%)', opacity: dop, fontFamily: F.display, fontWeight: 700, fontSize: 28, color: K.l3, textShadow: shadow}}>
          doppelt
        </div>
      ) : null}
    </>
  );
};

/* ---------- ③④ λ = 1: Regler t, Vektor, Gerade ---------- */

const REG_Y = 1068;
const TOP_REG_Y = 612;
const regY = (t: number, stage: [number, number]) => lerp(REG_Y, TOP_REG_Y, prog(t, stage[0] - 0.2, 0.7));
const VEC_Y = 1240;
const TOP_VEC_Y = 790;
const TOP_VEC_Y3 = 752;
const vecY = (t: number, stage: [number, number]) => lerp(VEC_Y, TOP_VEC_Y, prog(t, stage[0] - 0.2, 0.7));
const vecS = (t: number, stage: [number, number], s: number) => lerp(1, s, prog(t, stage[0] - 0.2, 0.7));

const Regler1: React.FC = () => {
  const t = useSec();
  const o = show(t, T.regler - 0.1, 0.45) * hide(t, STAGE1_OUT, 0.4);
  const glow = bump(t, T.beliebig, 1.4) + bump(t, T.yGleichT + 0.3, 1) + bump(t, T.einRegler, 1);
  return <Regler t={t} x={100} y={regY(t, STAGE1)} w={560} label={`y=${C1('t')}`} name="t" color={K.l1} value={tReg1(t)} o={o} glow={glow} />;
};

const vecChunk = (id: string, _w: number, size: number, entries: CState[][], t: number, glows?: number[], colors?: string[]): Chunk => ({
  id,
  w: colVecW(entries, size) + size * 0.12,
  render: (x, y, o) => <ColVec t={t} x={x} y={y} size={size} entries={entries} o={o} glows={glows} colors={colors} />,
});

const Vec1: React.FC = () => {
  const t = useSec();
  const o = show(t, T.yGleichT - 0.2, 0.4) * hide(t, STAGE1_OUT, 0.4);
  if (o <= 0) return null;
  const S = 50;
  const xyz: CState[][] = [
    [
      [0, 'x'],
      [T.xMinusT + 0.1, C1('-t')],
    ],
    [
      [0, 'y'],
      [T.yGleichT + 0.35, C1('t')],
    ],
    [
      [0, 'z'],
      [T.zNull + 0.25, '0'],
    ],
  ];
  const glowXYZ = [bump(t, T.xMinusT + 0.2, 1), bump(t, T.yGleichT + 0.45, 1), bump(t, T.zNull + 0.35, 1)];
  const dirE: CState[][] = [[[0, C1('-1')]], [[0, C1('1')]], [[0, C1('0')]]];
  const dirGlow = bump(t, T.eineRichtung, 1.2);
  const states: RowState[] = [
    {at: T.yGleichT - 0.2, chunks: [ch('v', 40, 'v'), ch('eq', 56, '='), vecChunk('cv', 110, S, xyz, t, glowXYZ, [K.l1, K.l1, C.txt])]},
    {at: T.einRegler - 0.15, chunks: [ch('v', 40, 'v'), ch('eq', 56, '='), vecChunk('cv', 110, S, xyz, t), ch('eq2', 56, '='), ch('tt', 30, C1('t'), {glow: bump(t, T.einRegler + 0.2, 1), color: K.l1}), ch('dot', 26, '\\cdot'), vecChunk('dir', 100, S, dirE, t, [dirGlow, dirGlow, dirGlow], [K.l1, K.l1, K.l1])], dur: 0.6},
    {
      at: T.gerade + 0.1,
      chunks: [ch('v', 64, 'E_1'), ch('eq', 56, '='), ch('span', 118, '\\operatorname{span}'), ch('lb', 30, '\\Big\\{'), vecChunk('dir', 100, S, dirE, t, [dirGlow, dirGlow, dirGlow]), ch('rb', 30, '\\Big\\}')],
      dur: 0.6,
    },
  ];
  const dim = show(t, T.gerade + 0.6, 0.4) * o;
  return (
    <>
      <MagicRow t={t} y={vecY(t, STAGE1)} size={S} states={states} o={o} scale={vecS(t, STAGE1, 0.92)} />
      <Pill x={540} y={TOP_VEC_Y + 118} o={dim} color={K.l1} size={30} scale={0.9 + 0.1 * dim}>
        <span>dim = 1</span>
      </Pill>
    </>
  );
};

/* ---------- ③④ λ = 3: zwei Regler, Zerlegung, Ebene ---------- */

const REG3: [number, number] = [T.zweiRegler - 0.2, T.zweiRegler + 0.05];
const REG3_OUT = TRIPLE[0] - 0.9;
const Regler3: React.FC = () => {
  const t = useSec();
  const y = regY(t, STAGE2);
  const os = show(t, REG3[0], 0.45) * hide(t, REG3_OUT, 0.4);
  const ot = show(t, REG3[1], 0.45) * hide(t, REG3_OUT, 0.4);
  const gs = bump(t, T.eigene - 0.35, 1.1) + bump(t, SWEEP_GLOW_S, 1.2);
  const gt = bump(t, T.eigene + 0.45, 1.1) + bump(t, SWEEP_GLOW_T, 1.2);
  return (
    <>
      <Regler t={t} x={70} y={y} w={262} label={`y=${C3('s')}`} name="s" color={K.l3} value={sReg3(t)} o={os} glow={gs} />
      <Regler t={t} x={530} y={y} w={262} label={`z=${CT('t')}`} name="t" color={K.t3} value={tReg3(t)} o={ot} glow={gt} />
    </>
  );
};
const SWEEP_GLOW_S = T.zwei2;
const SWEEP_GLOW_T = T.richtungen2 + 0.3;

const B1_AT = [T.b1 - 0.1, V(76.62), V(77.0)];
const B2_AT = [V(78.4), V(79.04), V(79.56)];
const G_Y = T.eigene - 0.35;
const G_Z = T.eigene + 0.45;

const Vec3: React.FC = () => {
  const t = useSec();
  const o = show(t, T.frei3 + 0.1, 0.4) * hide(t, T.doppelter - 0.3, 0.4);
  if (o <= 0) return null;
  const S = 48;
  const gy = bump(t, G_Y, 1.3);
  const gz = bump(t, G_Z, 1.3);
  const xyz: CState[][] = [
    [
      [0, 'x'],
      [T.zweiRegler + 0.75, C3('s')],
    ],
    [
      [0, 'y'],
      [T.zweiRegler + 0.15, C3('s')],
    ],
    [
      [0, 'z'],
      [T.zweiRegler + 0.4, CT('t')],
    ],
  ];
  const b1: CState[][] = ['1', '1', '0'].map((v, i) => [
    [0, ''],
    [B1_AT[i], C3(v)],
  ]);
  const b2: CState[][] = ['0', '0', '1'].map((v, i) => [
    [0, ''],
    [B2_AT[i], CT(v)],
  ]);
  const xyzG = [bump(t, T.zweiRegler + 0.85, 0.9), bump(t, T.zweiRegler + 0.25, 0.9) + gy, bump(t, T.zweiRegler + 0.5, 0.9) + gz];
  const bG = (i: number) => (i === 1 ? gy : i === 2 ? gz : 0) + bump(t, T.ebene, 1) * 0.5;
  const colsY = [K.l3, K.l3, K.t3];
  const base = [ch('v', 40, 'v'), ch('eq', 56, '='), vecChunk('cv', 100, S, xyz, t, xyzG, colsY)];
  const b1c = vecChunk('b1', 96, S, b1, t, [0, 1, 2].map(bG), [K.l3, K.l3, K.l3]);
  const b2c = vecChunk('b2', 96, S, b2, t, [0, 1, 2].map(bG), [K.t3, K.t3, K.t3]);
  const states: RowState[] = [
    {at: T.frei3 + 0.1, chunks: base},
    {at: T.sMal - 0.15, chunks: [...base, ch('eq2', 56, '='), ch('ss', 28, C3('s')), ch('d1', 26, '\\cdot'), b1c]},
    {at: T.plusT - 0.12, chunks: [...base, ch('eq2', 56, '='), ch('ss', 28, C3('s')), ch('d1', 26, '\\cdot'), b1c, ch('pl', 52, '+'), ch('tt', 26, CT('t')), ch('d2', 26, '\\cdot'), b2c]},
    {at: T.ebene + 0.1, chunks: [ch('v', 64, 'E_3'), ch('eq', 56, '='), ch('span', 118, '\\operatorname{span}'), ch('lb', 30, '\\Big\\{'), b1c, ch('cm', 34, ','), b2c, ch('rb', 30, '\\Big\\}')], dur: 0.6},
  ];
  const dim = show(t, T.ebene + 0.6, 0.4) * o;
  const lin = show(t, T.linear - 0.05, 0.4) * hide(t, STAGE2[0], 0.35);
  return (
    <>
      <MagicRow t={t} y={lerp(VEC_Y, TOP_VEC_Y3, prog(t, STAGE2[0] - 0.2, 0.7))} size={S} states={states} o={o} scale={vecS(t, STAGE2, 0.8)} />
      <Pill x={540} y={1372} o={lin} color={K.mint} size={34} scale={0.9 + 0.1 * lin}>
        <span>✓</span>
        <span>linear unabhängig</span>
      </Pill>
      <Pill x={540} y={TOP_VEC_Y3 + 96} o={dim} color={K.l3} size={30} scale={0.9 + 0.1 * dim}>
        <span>dim = 2</span>
      </Pill>
    </>
  );
};

// „muss aber nicht“: allgemein 1 ≤ dim ≤ 2, hier entscheidet Gauß
const Note: React.FC = () => {
  const t = useSec();
  const a = show(t, T.doppelter - 0.1, 0.45) * hide(t, T.rezept - 0.2, 0.35);
  const b = show(t, T.entscheidet - 0.1, 0.45) * hide(t, T.rezept - 0.2, 0.35);
  if (a <= 0) return null;
  return (
    <>
      <div style={{position: 'absolute', left: 540, top: 650, transform: 'translate(-50%, -50%)', opacity: a, whiteSpace: 'nowrap', textShadow: shadow}}>
        <Tex tex={`${C3('\\lambda=3')}\\text{ doppelt}\\;\\Rightarrow\\;\\dim E_3 = 1 \\text{ oder } 2`} size={42} />
      </div>
      {b > 0 ? (
        <div style={{position: 'absolute', left: 540, top: 745, transform: 'translate(-50%, -50%)', opacity: b, whiteSpace: 'nowrap', textShadow: shadow}}>
          <Tex tex={`\\text{Gauß: zwei freie Variablen}\\;\\Rightarrow\\;\\dim E_3 = 2`} size={38} style={{color: K.mint}} />
        </div>
      ) : null}
    </>
  );
};

/* ---------- Beschriftungen im Raum ---------- */

const Label3: React.FC<{t: number; q: V3; o: number; dx?: number; dy?: number; children: React.ReactNode; scale?: number}> = ({t, q, o, dx = 0, dy = 0, children, scale = 1}) => {
  if (o <= 0.005) return null;
  const [x, y] = project(t, q);
  return (
    <div style={{position: 'absolute', left: clamp(x + dx, 90, 940), top: clamp(y + dy, 330, 1395), transform: `translate(-50%, -50%) scale(${scale})`, opacity: o, whiteSpace: 'nowrap', textShadow: shadow}}>
      {children}
    </div>
  );
};

const SpaceLabels: React.FC = () => {
  const t = useSec();
  const st = vis.stage(t) * hide(t, T.rezept - 0.3, 0.3);
  if (st <= 0.005) return null;
  const ax = vis.axes(t) * st * 0.8;
  const e1 = show(t, T.gerade + 0.3, 0.45) * st * (t < STAGE2[0] ? 1 : 0.7);
  const e3 = show(t, T.eigenraum + 0.2, 0.45) * st;
  const tri = show(t, TRIPLE[0] + TRIPLE[1] - 0.2, 0.4) * vis.samples(t);
  const k = kTriple(t);
  return (
    <>
      {(['x', 'y', 'z'] as const).map((s, i) => {
        const d: V3 = [i === 0 ? 1 : 0, i === 1 ? 1 : 0, i === 2 ? 1 : 0];
        return (
          <Label3 key={s} t={t} q={sc3(d, 2.85)} o={ax}>
            <Tex tex={s} size={30} style={{color: C.txt2}} />
          </Label3>
        );
      })}
      <Label3 t={t} q={sc3(E1, t < STAGE2[0] ? 2.2 : 2.0)} dy={-40} o={e1}>
        <Tex tex={C1('E_1')} size={44} />
      </Label3>
      <Label3 t={t} q={add3(sc3(B1, -1.55), sc3(B2, 1.25))} o={e3}>
        <Tex tex={C3('E_3')} size={48} />
      </Label3>
      {W3.map((w, i) => (
        <Label3 key={i} t={t} q={sc3(w, k)} dx={34} dy={-26} o={tri}>
          <Tex tex={C3('\\cdot 3')} size={36} />
        </Label3>
      ))}
      <Label3 t={t} q={W1} dx={30} dy={-28} o={tri}>
        <Tex tex={C1('\\cdot 1')} size={36} />
      </Label3>
    </>
  );
};

export const Work: React.FC = () => (
  <>
    <Task />
    <Matrix />
    <RowOps />
    <LambdaDrops />
    <AnsatzRow />
    <ReasonRow />
    <DetRow />
    <FactorRow />
    <Tips />
    <EigenChips />
    <Regler1 />
    <Vec1 />
    <Regler3 />
    <Vec3 />
    <Note />
    <SpaceLabels />
  </>
);

export {OP1, OP3, landAt, LAND, SWAP, EQ1, EV_FLY, SUB1, SUB3, RES1, RES3, SCALE, STRIKE};
