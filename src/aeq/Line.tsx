// Zahlengerade des Äquivalenzrelation-Videos: in Teil a die Punkte a, b, c mit Dreiersprüngen, Relationspfeilen und
// Abstandsklammern; in Teil b die Zahlen −6 … 8, die in Dreierschritten in drei Klassen zerfallen.
import React from 'react';
import {C} from '../theme';
import {bump, clamp, easeOutExpo, lerp} from '../math';
import {F} from '../fonts';
import {Tex, useSec} from '../ui';
import {glowShadow, hide, layoutState, mix, MState, Node, shadow, show} from './kit';
import {AM, CLASS_COL, CO, CY, FullSvg, Note, ResultBox, am, co, ease, rowBounds} from './common';
import {T} from './timeline';

/* ---------- Geometrie ---------- */

export const kB = (t: number) => ease(t, T.teilB + 0.15, 1.4); // 0 = Teil a, 1 = Teil b
export const lineY = (t: number) => lerp(780, 730, kB(t));
const xa = (v: number) => 520 + 40 * v;
const xb = (v: number) => 466 + 58 * v; // −6 bei 118, 8 bei 930
export const lx = (v: number, t: number) => lerp(xa(v), xb(v), kB(t));

export const mod3 = (n: number) => ((n % 3) + 3) % 3;
export const NUMS = Array.from({length: 15}, (_, i) => i - 6); // −6 … 8
export const CLASSES = [0, 1, 2].map((r) => NUMS.filter((n) => mod3(n) === r));
// Mathe-Prüfung: genau die Mengen der Aufgabe
const EXPECT = ['-6,-3,0,3,6', '-5,-2,1,4,7', '-4,-1,2,5,8'];
CLASSES.forEach((c, r) => {
  if (c.join(',') !== EXPECT[r]) throw new Error(`Klasse [${r}] falsch: ${c.join(',')}`);
});
NUMS.forEach((a) =>
  NUMS.forEach((b) => {
    if (((a - b) % 3 === 0) !== (mod3(a) === mod3(b))) throw new Error('Relation ≠ gleicher Rest');
  }),
);

/* ---------- Zeichenbausteine ---------- */

const Head: React.FC<{x: number; y: number; dx: number; dy: number; color: string; o: number; s?: number}> = ({x, y, dx, dy, color, o, s = 15}) => {
  if (o <= 0.01) return null;
  const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l;
  const uy = dy / l;
  const p = `${x},${y} ${x - ux * s - uy * s * 0.55},${y - uy * s + ux * s * 0.55} ${x - ux * s + uy * s * 0.55},${y - uy * s - ux * s * 0.55}`;
  return <polygon points={p} fill={color} opacity={o} style={{filter: `drop-shadow(0 0 5px ${color})`}} />;
};

// Bogen von (x0, y0) nach (x1, y1), Scheitel `lift` über der Geraden, zu k gezeichnet
const Bow: React.FC<{x0: number; y0: number; x1: number; y1: number; lift: number; k: number; color: string; o: number; w?: number; dashed?: boolean; head?: boolean}> = ({x0, y0, x1, y1, lift, k, color, o, w = 3.5, dashed = false, head = true}) => {
  if (k <= 0 || o <= 0.01) return null;
  const mx = (x0 + x1) / 2;
  const cy0 = Math.min(y0, y1) - 2 * lift;
  return (
    <g opacity={o}>
      <path
        d={`M ${x0} ${y0} Q ${mx} ${cy0} ${x1} ${y1}`}
        fill="none"
        stroke={color}
        strokeWidth={w}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={dashed ? '0.035 0.03' : '1'}
        strokeDashoffset={dashed ? 0 : 1 - k}
        style={{filter: `drop-shadow(0 0 6px ${color})`}}
      />
      {head ? <Head x={x1} y={y1} dx={x1 - mx} dy={y1 - cy0} color={color} o={clamp((k - 0.8) / 0.2)} /> : null}
    </g>
  );
};

const Label: React.FC<{x: number; y: number; tex: string; size: number; o: number; color?: string; glow?: number}> = ({x, y, tex, size, o, color = C.txt, glow = 0}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', opacity: o, whiteSpace: 'nowrap', textShadow: glowShadow(glow, color)}}>
      <Tex tex={tex} size={size} style={{color}} />
    </div>
  );

/* ---------- Gerade ---------- */

const lineIn = (t: number) => ease(t, T.heisst - 0.1, 0.9);
const lineOut = (t: number) => hide(t, T.summary - 0.2, 0.5);

const Axis: React.FC<{t: number}> = ({t}) => {
  const k = lineIn(t);
  const o = lineOut(t);
  if (k <= 0 || o <= 0.01) return null;
  const Y = lineY(t);
  const half = 470 * k;
  const ticks = [];
  for (let v = -11; v <= 12; v++) {
    const inA = v >= -10 && v <= 11 ? 1 : 0;
    const inB = v >= -7 && v <= 9 ? 1 : 0;
    const x = lx(v, t);
    const vis = lerp(inA, inB, kB(t)) * clamp((half - Math.abs(x - 540) + 20) / 40);
    if (vis > 0.01) ticks.push(<line key={v} x1={x} y1={Y - 8} x2={x} y2={Y + 8} stroke="rgba(243,244,251,.5)" strokeWidth={2.5} opacity={vis} />);
  }
  return (
    <FullSvg o={o}>
      <defs>
        <linearGradient id="axfade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#F3F4FB" stopOpacity="0" />
          <stop offset=".08" stopColor="#F3F4FB" stopOpacity=".55" />
          <stop offset=".92" stopColor="#F3F4FB" stopOpacity=".55" />
          <stop offset="1" stopColor="#F3F4FB" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={540 - half} y={Y - 1.5} width={2 * half} height={3} fill="url(#axfade)" />
      {ticks}
    </FullSvg>
  );
};

/* ---------- Teil a: Punkte, Sprünge, Pfeile, Klammern ---------- */

const VA = -6;
const VB = 0;
const VC = 9;
const partAOut = (t: number) => hide(t, T.teilB - 0.1, 0.5);
const bDim = (t: number) => lerp(1, 0.22, ease(t, T.heben + 1.2, 0.6)) * (t > T.teilB ? 0 : 1);

const pointO = (t: number, id: 'a' | 'b' | 'c') => {
  const out = partAOut(t);
  if (id === 'a') return show(t, T.heisst + 0.5) * out;
  if (id === 'c') return show(t, T.ausT + 0.2) * out;
  const vis = t < T.sym - 0.2 ? hide(t, T.refl, 0.4) : show(t, T.sym - 0.1, 0.4);
  return show(t, T.heisst + 0.65) * vis * out * (t > T.trans ? bDim(t) : 1);
};

type HopSet = {v0: number; v1: number; at: number; color: string; o: (t: number) => number};
const hops = (t: number): HopSet[] => [
  {v0: VA, v1: VB, at: T.vielfach + 0.1, color: AM, o: (s) => hide(s, T.refl - 0.2, 0.4)},
  {v0: VA, v1: VB, at: T.dreiK + 0.1, color: AM, o: (s) => show(s, T.sym) * hide(s, T.mal + 0.3, 0.4)},
  {v0: VB, v1: VA, at: T.mal + 0.6, color: mix(AM, CO, 0.6), o: (s) => hide(s, T.trans - 0.2, 0.4)},
  {v0: VA, v1: VB, at: T.abk + 0.3, color: AM, o: (s) => partAOut(s)},
  {v0: VB, v1: VC, at: T.bcl + 0.3, color: AM, o: (s) => partAOut(s)},
];

const HopChain: React.FC<{t: number; v0: number; v1: number; at: number; color: string; o: number; lift?: number; step?: number; dur?: number; stagger?: number}> = ({t, v0, v1, at, color, o, lift, step = 3, dur = 0.32, stagger = 0.28}) => {
  if (o <= 0.01 || t < at) return null;
  const Y = lineY(t) - 5;
  const dir = Math.sign(v1 - v0);
  const n = Math.round(Math.abs(v1 - v0) / step);
  const out = [];
  for (let j = 0; j < n; j++) {
    const p = v0 + dir * step * j;
    const q = p + dir * step;
    const k = easeOutExpo(clamp((t - at - stagger * j) / dur));
    const x0 = lx(p, t);
    const x1 = lx(q, t);
    out.push(<Bow key={j} x0={x0 + dir * 4} y0={Y} x1={x1 - dir * 4} y1={Y} lift={lift ?? Math.abs(x1 - x0) * 0.24} k={k} color={color} o={o} w={3} />);
  }
  return <>{out}</>;
};

type Rel = {v0: number; v1: number; lift: number; at: number; o: (t: number) => number; dashedUntil?: number};
const rels: Rel[] = [
  {v0: VA, v1: VB, lift: 72, at: T.heisst + 0.9, o: (s) => hide(s, T.refl - 0.2, 0.4)},
  {v0: VA, v1: VB, lift: 72, at: T.aus + 0.15, o: (s) => hide(s, T.trans - 0.2, 0.4)},
  {v0: VB, v1: VA, lift: 118, at: T.folgt + 0.1, o: (s) => hide(s, T.trans - 0.2, 0.4), dashedUntil: T.symOk - 0.35},
  {v0: VA, v1: VB, lift: 66, at: T.ausT + 0.15, o: (s) => partAOut(s) * lerp(1, 0.25, ease(s, T.heben + 1.2, 0.6))},
  {v0: VB, v1: VC, lift: 78, at: T.ausT + 0.7, o: (s) => partAOut(s) * lerp(1, 0.25, ease(s, T.heben + 1.2, 0.6))},
  {v0: VA, v1: VC, lift: 140, at: T.folgtT + 0.1, o: (s) => partAOut(s), dashedUntil: T.transOk - 0.35},
];

const Loop: React.FC<{t: number}> = ({t}) => {
  const at = T.selbst + 0.3;
  const k = easeOutExpo(clamp((t - at) / 0.6));
  const o = hide(t, T.sym - 0.2, 0.4) * partAOut(t);
  if (k <= 0 || o <= 0.01) return null;
  const x = lx(VA, t);
  const Y = lineY(t) - 12;
  return (
    <g opacity={o}>
      <path d={`M ${x - 6} ${Y} C ${x - 70} ${Y - 120}, ${x + 70} ${Y - 120}, ${x + 6} ${Y}`} fill="none" stroke={CY} strokeWidth={3.5} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - k} style={{filter: `drop-shadow(0 0 6px ${CY})`}} />
      <Head x={x + 6} y={Y} dx={-64} dy={120} color={CY} o={clamp((k - 0.8) / 0.2)} />
    </g>
  );
};

type Brk = {v0: number; v1: number; tex: string; on: number; off: (t: number) => number};
const brackets: Brk[] = [
  {v0: VA, v1: VB, tex: `a - b = ${am('3')}k`, on: T.vielfach + 0.5, off: (s) => hide(s, T.refl - 0.2, 0.4)},
  {v0: VA, v1: VA, tex: 'a - a = 0', on: T.aa + 0.2, off: (s) => hide(s, T.sym - 0.2, 0.4)},
  {v0: VA, v1: VB, tex: `a - b = ${am('3')}k`, on: T.dreiK + 0.5, off: (s) => hide(s, T.ba + 0.35, 0.4)},
  {v0: VA, v1: VB, tex: `b - a = ${co('-')}${am('3')}k`, on: T.ba + 0.45, off: (s) => hide(s, T.trans - 0.2, 0.4)},
  {v0: VA, v1: VB, tex: `${am('3')}k`, on: T.abk + 0.6, off: (s) => hide(s, T.summe + 0.1, 0.4)},
  {v0: VB, v1: VC, tex: `${am('3')}l`, on: T.bcl + 0.6, off: (s) => hide(s, T.summe + 0.1, 0.4)},
  {v0: VA, v1: VC, tex: `a - c = ${am('3')}(k + l)`, on: T.summe + 0.3, off: (s) => partAOut(s)},
];

export const PartALine: React.FC = () => {
  const t = useSec();
  if (t > T.teilB + 0.7 || t < T.heisst - 0.2) return null;
  const Y = lineY(t);
  return (
    <>
      <FullSvg>
        {hops(t).map((h, i) => (
          <HopChain key={i} t={t} v0={h.v0} v1={h.v1} at={h.at} color={h.color} o={h.o(t)} />
        ))}
        {rels.map((r, i) => {
          const k = easeOutExpo(clamp((t - r.at) / 0.55));
          const dashed = r.dashedUntil !== undefined && t < r.dashedUntil;
          return <Bow key={i} x0={lx(r.v0, t)} y0={Y - 14} x1={lx(r.v1, t)} y1={Y - 14} lift={r.lift} k={dashed ? 1 : k} o={r.o(t) * (dashed ? 0.75 * clamp((t - r.at) / 0.4) : 1)} color={CY} dashed={dashed} />;
        })}
        <Loop t={t} />
        {brackets.map((b, i) => {
          const o = show(t, b.on, 0.4) * b.off(t);
          if (o <= 0.01 || b.v0 === b.v1) return null;
          const x0 = lx(Math.min(b.v0, b.v1), t);
          const x1 = lx(Math.max(b.v0, b.v1), t);
          const y = Y + 76;
          const k = easeOutExpo(clamp((t - b.on) / 0.5));
          const m = (x0 + x1) / 2;
          return (
            <g key={i} opacity={o} stroke="rgba(243,244,251,.55)" strokeWidth={2.5} fill="none" strokeLinecap="round">
              <path d={`M ${lerp(m, x0, k)} ${y - 10} L ${lerp(m, x0, k)} ${y} L ${lerp(m, x1, k)} ${y} L ${lerp(m, x1, k)} ${y - 10}`} />
            </g>
          );
        })}
        {(['a', 'b', 'c'] as const).map((id) => {
          const o = pointO(t, id);
          if (o <= 0.01) return null;
          const v = id === 'a' ? VA : id === 'b' ? VB : VC;
          return <circle key={id} cx={lx(v, t)} cy={Y} r={9} fill={C.txt} opacity={o} style={{filter: 'drop-shadow(0 0 8px rgba(243,244,251,.8))'}} />;
        })}
      </FullSvg>
      {(['a', 'b', 'c'] as const).map((id) => {
        const v = id === 'a' ? VA : id === 'b' ? VB : VC;
        return <Label key={id} x={lx(v, t)} y={Y + 40} tex={id} size={40} o={pointO(t, id)} />;
      })}
      {rels.map((r, i) => {
        const o = r.o(t) * show(t, r.at + 0.3, 0.4);
        return <Label key={`s${i}`} x={(lx(r.v0, t) + lx(r.v1, t)) / 2} y={Y - 14 - r.lift - 22} tex={'\\sim'} size={34} color={CY} o={o} />;
      })}
      {brackets.map((b, i) => {
        const o = show(t, b.on + 0.15, 0.4) * b.off(t);
        return <Label key={`b${i}`} x={(lx(b.v0, t) + lx(b.v1, t)) / 2} y={Y + 114} tex={b.tex} size={34} o={o} />;
      })}
    </>
  );
};

/* ---------- Teil b: Klassen ---------- */

export const ROW_Y = [905, 1010, 1115];
const SET_SIZE = 40;
const NUM_SIZE = 32;
const hopStart = [T.start + 0.35, T.eins + 0.25, T.zwei + 0.1];
const dropAt = [T.kl0 + 0.15, T.kl1 + 0.1, T.zwei + 1.05];
const setAt = (r: number) => T.genau + 0.15 + 0.18 * r;
const landAt = (v: number) => {
  const r = mod3(v);
  return hopStart[r] + 0.28 * (Math.abs(v - r) / 3 - 1) + 0.3;
};
const assigned = (v: number, t: number) => (v === mod3(v) ? t >= hopStart[mod3(v)] - 0.15 : t >= landAt(v));
const numTex = (v: number) => (v < 0 ? `-${-v}` : `${v}`);

// Mengenzeile [r] = {…, x, y, …}
const setState = (r: number): MState => {
  const col = CLASS_COL[r];
  const nodes: Node[] = [
    {id: 'lab', tex: `[${r}]`, color: col},
    {id: 'eq', tex: '='},
    {id: 'lb', tex: '\\{', pad: 0.06},
    {id: 'd1', tex: '\\dots', pad: 0.06},
    {id: 'c0', tex: ',', pad: 0.03},
  ];
  CLASSES[r].forEach((v, j) => {
    nodes.push({id: `n${v}`, tex: numTex(v), color: col, pad: 0.2});
    nodes.push({id: `c${j + 1}`, tex: ',', pad: 0.03});
  });
  nodes.push({id: 'd2', tex: '\\dots', pad: 0.2}, {id: 'rb', tex: '\\}', pad: 0.06});
  return {at: 0, nodes};
};
const SETS = [0, 1, 2].map(setState);

const resultState: MState = {
  at: 0,
  nodes: [
    {id: 'z', tex: '\\mathbb{Z}/{\\sim}'},
    {id: 'eq', tex: '='},
    {id: 'v', tex: `\\{${am('[0]')},\\ \\textcolor{${CY}}{[1]},\\ \\textcolor{${CLASS_COL[2]}}{[2]}\\}`},
  ],
};

export const PartBLine: React.FC = () => {
  const t = useSec();
  if (t < T.teilB || t > T.summary + 0.6) return null;
  const Y = lineY(t);
  const out = hide(t, T.summary - 0.1, 0.5);
  if (out <= 0.01) return null;
  const items: React.ReactNode[] = [];
  const svg: React.ReactNode[] = [];
  // Sprünge je Klasse
  [0, 1, 2].forEach((r) => {
    const o = hide(t, dropAt[r] + 0.7, 0.5);
    const col = CLASS_COL[r];
    svg.push(<HopChain key={`hr${r}`} t={t} v0={r} v1={r + 6} at={hopStart[r]} color={col} o={o} lift={26} />);
    svg.push(<HopChain key={`hl${r}`} t={t} v0={r} v1={r - 6} at={hopStart[r]} color={col} o={o} lift={26} />);
  });
  // „Und die Drei?“: Sprünge von 3 aus landen nur auf schon gefärbten Zahlen
  {
    const o = hide(t, T.jede, 0.4);
    svg.push(<HopChain key="h3r" t={t} v0={3} v1={6} at={T.drei + 0.3} color={AM} o={o * 0.9} lift={26} />);
    svg.push(<HopChain key="h3l" t={t} v0={3} v1={0} at={T.drei + 0.3} color={AM} o={o * 0.9} lift={26} />);
  }
  // Punkte auf den Strichen
  NUMS.forEach((v) => {
    if (!assigned(v, t)) return;
    const r = mod3(v);
    const k = easeOutExpo(clamp((t - (v === r ? hopStart[r] - 0.15 : landAt(v))) / 0.3));
    svg.push(<circle key={`d${v}`} cx={lx(v, t)} cy={Y} r={7 * k} fill={CLASS_COL[r]} style={{filter: `drop-shadow(0 0 6px ${CLASS_COL[r]})`}} />);
  });
  // Zahlen auf der Geraden
  NUMS.forEach((v, i) => {
    const r = mod3(v);
    const ap = show(t, T.teilB + 0.75 + 0.035 * i, 0.35);
    const on = assigned(v, t);
    const left = t >= dropAt[r];
    const col = on ? CLASS_COL[r] : C.txt;
    const g = on ? bump(t, v === r ? hopStart[r] - 0.15 : landAt(v), 0.6) + (v === 3 ? bump(t, T.drei + 0.05, 0.9) : 0) : 0;
    items.push(<Label key={`l${v}`} x={lx(v, t)} y={Y + 44} tex={numTex(v)} size={NUM_SIZE} color={col} o={ap * (left ? 0.42 : on ? 1 : 0.85)} glow={g} />);
  });
  // Reste unter der Geraden
  const restO = hide(t, T.summary - 0.3, 0.4);
  NUMS.forEach((v, i) => {
    const o = show(t, T.rest + 0.15 + 0.04 * i, 0.35) * restO;
    items.push(<Label key={`r${v}`} x={lx(v, t)} y={Y + 86} tex={`${mod3(v)}`} size={27} color={CLASS_COL[mod3(v)]} o={o} />);
  });
  items.push(
    <div key="restlab" style={{position: 'absolute', left: 52, top: Y + 86, transform: 'translate(-50%, -50%)', opacity: show(t, T.rest + 0.05, 0.35) * restO, fontFamily: F.display, fontWeight: 600, fontSize: 24, color: C.txt2, textShadow: shadow}}>
      Rest
    </div>,
  );
  // Definition der Klasse
  items.push(<Note key="def" y={1010} tex={'[a] = \\{\\, b \\in \\mathbb{Z} : b \\sim a \\,\\}'.replace('\\sim', `\\textcolor{${CY}}{\\sim}`)} o={show(t, T.klasse + 0.5, 0.45) * hide(t, T.start + 0.1, 0.4)} size={46} color={C.txt} />);
  // Tokens: Gerade → Reihe → Mengenzeile
  [0, 1, 2].forEach((r) => {
    const col = CLASS_COL[r];
    const L = layoutState(SETS[r], 540, ROW_Y[r], SET_SIZE, t > setAt(r) + 1.2);
    const ks = ease(t, setAt(r), 0.9);
    CLASSES[r].forEach((v, j) => {
      const kd = ease(t, dropAt[r] + 0.05 * j, 0.7);
      if (kd <= 0) return;
      const q = L.atoms[`n${v}`];
      const x1 = lx(v, t);
      const y1 = lerp(Y + 44, ROW_Y[r], kd);
      const x = lerp(x1, q.x, ks);
      const y = y1 - Math.sin(Math.PI * ks) * 18;
      const size = lerp(NUM_SIZE, SET_SIZE, ks);
      const g = (v === 3 ? bump(t, T.schon + 0.2, 1.1) : 0) + bump(t, T.bOk, 0.8) * 0.5;
      items.push(<Label key={`t${v}`} x={x} y={y} tex={numTex(v)} size={size} color={col} o={1} glow={g} />);
    });
    // Klassenname
    const kl = show(t, dropAt[r] + 0.45, 0.4);
    if (kl > 0.01) {
      const q = L.atoms.lab;
      items.push(<Label key={`lab${r}`} x={lerp(48, q.x, ks)} y={ROW_Y[r]} tex={`[${r}]`} size={lerp(36, SET_SIZE, ks)} color={col} o={kl} glow={bump(t, dropAt[r] + 0.5, 0.8)} />);
    }
    // feste Teile der Mengenzeile
    const fo = show(t, setAt(r) + 0.55, 0.4);
    if (fo > 0.01)
      ['eq', 'lb', 'd1', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'd2', 'rb'].forEach((id) => {
        const q = L.atoms[id];
        if (q) items.push(<Label key={`f${r}${id}`} x={q.x} y={q.y} tex={q.a.tex} size={SET_SIZE} color={C.txt} o={fo} />);
      });
  });
  // „[3] = [0]“
  items.push(<Note key="n3" x={lx(3, t)} y={Y - 74} tex={`${am('[3]')} = ${am('[0]')}`} o={show(t, T.schon + 0.35, 0.4) * hide(t, T.jede + 0.4, 0.4)} size={38} color={C.txt} />);
  // Ergebnis ℤ/∼
  const R = rowBounds(resultState, 540, 1255, 46);
  const ro = show(t, T.genau + 1.3, 0.45);
  items.push(<ResultBox key="box" cx={R.cx} cy={1255} w={R.w + 80} h={92} o={show(t, T.bOk - 0.05, 0.45)} glow={bump(t, T.bOk + 0.1, 1.0)} />);
  items.push(<Note key="res" y={1255} tex={'\\mathbb{Z}/{\\sim} \\;=\\; ' + (resultState.nodes[2] as {tex: string}).tex} o={ro} size={46} color={C.txt} glow={bump(t, T.bOk + 0.1, 1.0) * 0.6} />);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: out}}>
      <FullSvg>{svg}</FullSvg>
      {items}
    </div>
  );
};

export const NumberLine: React.FC = () => {
  const t = useSec();
  return <Axis t={t} />;
};
