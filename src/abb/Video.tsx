// Klausurvideo „Injektiv, surjektiv, bijektiv“: f: ℝ∖{−1} → ℝ∖{2}, f(x) = (2x+3)/(x+1).
// Aufgabenkarte, Schritt-Chips, Rechnungen als Morph-Zeilen über der Graph-Bühne, Zusammenfassung, CTA.
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C, MARGIN, W} from '../theme';
import {F, useTexFonts} from '../fonts';
import {bump, clamp, easeInCubic, easeInOutCubic, easeOutExpo, lerp, prog, sec, springOS} from '../math';
import {Backdrop, Grain, Mono, Tex, useSec} from '../ui';
import {Stage} from './Graph';
import {CLIPS, MUSIC, SUBTITLES, T, VOICES} from './timeline';
import {Atom, MState, Morph, Node, atomAt, frac, glowShadow, hide, layoutState, rgba, shadow, show, useTexReady} from './kit';

const CY = C.cyan;
const AM = C.eig;
const CO = C.lam;
const OK = '#7BEA9C';
const cy = (s: string) => `\\textcolor{${CY}}{${s}}`;
const am = (s: string) => `\\textcolor{${AM}}{${s}}`;
const co = (s: string) => `\\textcolor{${CO}}{${s}}`;
const ease = (t: number, at: number, d: number) => easeInOutCubic(clamp((t - at) / d));

/* ---------- Aufgabenkarte ---------- */

const X = cy('x');
const BOX_HOOK = {top: 600, h: 540};
const BOX_SMALL = {top: 300, h: 200};
const compactK = (t: number) => ease(t, T.frage - 0.15, 0.95);
const cardOut = (t: number) => easeInCubic(clamp((t - (T.cta - 0.2)) / 0.5));

// Kartenzeilen: Mengen und Funktionsterm, im Einstieg untereinander, danach nebeneinander (Mengen sind Quelle für Teil c)
const cardSets = (t: number): MState[] => [
  {
    at: -1,
    nodes: [
      {id: 'f', tex: 'f\\colon'},
      {id: 'D', tex: `\\mathbb{R}\\setminus\\{${co('-1')}\\}`, glow: bump(t, T.minusEins, 1.0) + bump(t, T.nieMinus1, 1.2), color: C.txt},
      {id: 'to', tex: '\\to'},
      {id: 'Z', tex: `\\mathbb{R}\\setminus\\{${co('2')}\\}`, glow: bump(t, T.zwei0, 1.0) + bump(t, T.deshalb, 1.2)},
    ],
  },
];
const cardFunc: MState[] = [{at: -1, nodes: [{id: 'fx', tex: `f(${X})`}, {id: 'eq', tex: '='}, frac('F', [{id: 'n', tex: `2${X}+3`}], [{id: 'd', tex: `${X}+1`}])]}];
const SETS_HOOK = {cx: 540, cy: 735, size: 52};
const SETS_SMALL = {cx: 322, cy: 418, size: 38};
const FUNC_HOOK = {cx: 540, cy: 850, size: 52};
const FUNC_SMALL = {cx: 778, cy: 418, size: 38};
const mixGeo = (p: {cx: number; cy: number; size: number}, q: {cx: number; cy: number; size: number}, k: number) => ({cx: lerp(p.cx, q.cx, k), cy: lerp(p.cy, q.cy, k), size: lerp(p.size, q.size, k)});
const setsGeo = (t: number) => mixGeo(SETS_HOOK, SETS_SMALL, compactK(t));
const funcGeo = (t: number) => mixGeo(FUNC_HOOK, FUNC_SMALL, compactK(t));

const TASKS = [
  `\\text{a) Ist } f \\text{ injektiv?}`,
  `\\text{b) Ist } f \\text{ surjektiv?}`,
  `\\text{c) Ist } f \\text{ bijektiv? Bestimmen Sie ggf. } f^{-1}.`,
];
const TASK_Y = [960, 1030, 1100];

const TaskCard: React.FC = () => {
  const t = useSec();
  const appear = springOS(clamp((t + 0.05) / 0.55));
  const gone = cardOut(t);
  if (gone >= 1) return null;
  const k = compactK(t);
  const top = lerp(BOX_HOOK.top, BOX_SMALL.top, k);
  const h = lerp(BOX_HOOK.h, BOX_SMALL.h, k);
  const o = clamp(appear * 1.4) * (1 - gone);
  const sg = setsGeo(t);
  const fg = funcGeo(t);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: MARGIN,
          top,
          width: W - 2 * MARGIN,
          height: h,
          boxSizing: 'border-box',
          borderRadius: 26,
          border: '1.5px solid rgba(255,255,255,.18)',
          background: 'linear-gradient(180deg, rgba(20,22,52,.96), rgba(10,11,32,.94))',
          boxShadow: '0 30px 90px rgba(0,0,0,.4)',
          opacity: o,
          transform: `translateY(${(1 - appear) * 24}px) scale(${0.97 + 0.03 * appear})`,
        }}
      >
        <div style={{position: 'absolute', left: 34, top: 24, fontFamily: F.mono, fontWeight: 600, fontSize: 24, letterSpacing: '.1em', color: C.eig}}>MATHE 1 · KLAUSUR</div>
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: o, transform: `translateY(${(1 - appear) * 24}px)`}}>
        <Morph t={t} states={cardSets(t)} cx={sg.cx} cy={sg.cy} size={sg.size} />
        <Morph t={t} states={cardFunc} cx={fg.cx} cy={fg.cy} size={fg.size} />
      </div>
      {TASKS.map((tex, i) => {
        const fly = ease(t, T.frage - 0.1 + 0.12 * i, 0.9);
        if (fly >= 1) return null;
        const c = chipCenter(i);
        const x = lerp(MARGIN + 60, c[0] - 110, fly);
        const y = lerp(TASK_Y[i], c[1], fly);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `translateY(-50%) scale(${lerp(1, 0.62, fly)})`,
              transformOrigin: 'left center',
              opacity: o * show(t, 0.35 + 0.15 * i, 0.4) * (1 - easeInCubic(fly)),
              whiteSpace: 'nowrap',
              textShadow: shadow,
            }}
          >
            <Tex tex={tex} size={38} />
          </div>
        );
      })}
    </>
  );
};

/* ---------- Schritt-Chips ---------- */

const CHIP_Y = 520;
const CHIP_W = 300;
const CHIP_GAP = (W - 2 * MARGIN - 3 * CHIP_W) / 2;
const chipCenter = (i: number): [number, number] => [MARGIN + i * (CHIP_W + CHIP_GAP) + CHIP_W / 2, CHIP_Y + 30];
const CHIPS: React.ReactNode[] = ['injektiv', 'surjektiv', <>bijektiv, f<sup style={{fontSize: '.62em'}}>−1</sup></>];
const chipT = (): [number, number, number][] => [
  // [aktiv ab, fertig ab, Hinweis-Puls im Einstieg]
  [T.teilA, T.injektiv + 0.25, T.injektiv0],
  [T.teilB, T.surjektiv + 0.25, T.surjektiv0],
  [T.teilC, T.bijektiv + 0.2, T.bijektiv0],
];
const Chips: React.FC = () => {
  const t = useSec();
  const out = 1 - cardOut(t);
  if (out <= 0) return null;
  return (
    <>
      {chipT().map(([on, ok, hint], i) => {
        const p = springOS(clamp((t - (T.frage + 0.35 + 0.12 * i)) / 0.6));
        if (p <= 0) return null;
        const st = t >= ok ? 'ok' : t >= on ? 'active' : 'idle';
        const pulse = Math.max(bump(t, on, 0.5), bump(t, ok, 0.6), bump(t, hint + 0.1, 0.7), i === 2 ? bump(t, T.umkehr0, 0.7) : 0);
        const border = st === 'ok' ? OK : st === 'active' ? AM : 'rgba(255,255,255,.22)';
        const [cx] = chipCenter(i);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: cx - CHIP_W / 2,
              top: CHIP_Y,
              width: CHIP_W,
              height: 60,
              boxSizing: 'border-box',
              borderRadius: 18,
              border: `2.5px solid ${border}`,
              background: `linear-gradient(${st === 'active' ? 'rgba(255,194,71,.10)' : st === 'ok' ? 'rgba(123,234,156,.08)' : 'rgba(255,255,255,0)'}, ${st === 'active' ? 'rgba(255,194,71,.10)' : st === 'ok' ? 'rgba(123,234,156,.08)' : 'rgba(255,255,255,0)'}), rgba(10,11,32,.94)`,
              boxShadow: st === 'active' ? '0 0 30px rgba(255,194,71,.25)' : pulse > 0.02 ? `0 0 ${30 * pulse}px rgba(255,194,71,${0.4 * pulse})` : undefined,
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
              {'abc'[i]}
            </span>
            <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 27, color: st === 'idle' ? C.txt2 : C.txt}}>{CHIPS[i]}</span>
            {st === 'ok' ? <span style={{marginLeft: 'auto', marginRight: 14, fontFamily: F.display, fontWeight: 800, fontSize: 26, color: OK}}>Ja ✓</span> : null}
          </div>
        );
      })}
    </>
  );
};

/* ---------- Gemeinsame Bausteine der Rechnung ---------- */

const Note: React.FC<{x?: number; y: number; tex: string; o: number; size?: number; color?: string; glow?: number}> = ({x = 540, y, tex, o, size = 36, color = C.txt2, glow = 0}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) translateY(${(1 - o) * 10}px)`, opacity: o, whiteSpace: 'nowrap', textShadow: glowShadow(glow, color)}}>
      <Tex tex={tex} size={size} style={{color}} />
    </div>
  );

// grüner Rahmen um eine Zeile
const ResultBox: React.FC<{cx: number; cy: number; w: number; h: number; o: number; glow: number}> = ({cx, cy: y, w, h, o, glow}) =>
  o <= 0.01 ? null : (
    <>
      <div
        style={{
          position: 'absolute',
          left: cx - w / 2,
          top: y - h / 2,
          width: w,
          height: h,
          boxSizing: 'border-box',
          borderRadius: 22,
          border: `2.5px solid rgba(123,234,156,${0.5 + 0.4 * glow})`,
          background: 'rgba(12,30,30,.45)',
          boxShadow: `0 0 ${20 + 50 * glow}px rgba(123,234,156,${0.18 + 0.3 * glow})`,
          opacity: o,
          transform: `scale(${0.96 + 0.04 * o})`,
        }}
      />
      <div style={{position: 'absolute', left: cx + w / 2 + 18, top: y, transform: 'translateY(-50%)', opacity: o, fontFamily: F.display, fontWeight: 800, fontSize: 44, color: OK, textShadow: shadow}}>✓</div>
    </>
  );

const rowBounds = (s: MState, cx: number, y: number, size: number) => {
  const L = layoutState(s, cx, y, size);
  let a = Infinity;
  let b = -Infinity;
  Object.values(L.atoms).forEach((p) => {
    a = Math.min(a, p.x - p.w / 2);
    b = Math.max(b, p.x + p.w / 2);
  });
  return {cx: (a + b) / 2, w: b - a};
};

// Bogen über einer Zeile von p nach q (Bildschirmpunkte), wird in `d` Sekunden gezeichnet
const Arc: React.FC<{p: [number, number]; q: [number, number]; lift: number; t: number; at: number; d?: number; o: number; color?: string}> = ({p, q, lift, t, at, d = 0.35, o, color = AM}) => {
  const k = easeOutExpo(clamp((t - at) / d));
  if (k <= 0 || o <= 0.01) return null;
  const mx = (p[0] + q[0]) / 2;
  const my = Math.min(p[1], q[1]) - lift;
  const len = Math.hypot(q[0] - p[0], q[1] - p[1]) + 2 * lift;
  return (
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: o}}>
      <path d={`M ${p[0]} ${p[1]} Q ${mx} ${my} ${q[0]} ${q[1]}`} fill="none" stroke={color} strokeWidth={3.5} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - k)} style={{filter: `drop-shadow(0 0 6px ${color})`}} />
    </svg>
  );
};

const Strike: React.FC<{x: number; y: number; w: number; t: number; at: number; o: number}> = ({x, y, w, t, at, o}) => {
  const k = easeOutExpo(clamp((t - at) / 0.3));
  if (k <= 0 || o <= 0.01) return null;
  return <div style={{position: 'absolute', left: x - w / 2 - 6, top: y - 3 + 6, width: (w + 12) * k, height: 5, borderRadius: 3, background: CO, boxShadow: `0 0 12px ${CO}`, opacity: o, transform: 'rotate(-12deg)', transformOrigin: 'left center'}} />;
};

/* ---------- Teil a: injektiv ---------- */

const a = cy('a');
const b = cy('b');
const RA = {cy: 980, size: 52, eqX: 540};
const ZZ = {cy: 690, size: 40};

const zuZeigen = (t: number): MState[] => [
  {at: T.zeigen + 0.05, nodes: [{id: 'lab', tex: '\\text{Zu zeigen:}', color: C.txt2}]},
  {at: T.haben + 0.1, nodes: [{id: 'lab', tex: '\\text{Zu zeigen:}', color: C.txt2}, {id: 'l', tex: `f(${a}) = f(${b})`, glow: bump(t, T.haben + 0.4, 1.0)}]},
  {
    at: T.dann,
    nodes: [
      {id: 'lab', tex: '\\text{Zu zeigen:}', color: C.txt2},
      {id: 'l', tex: `f(${a}) = f(${b})`},
      {id: 'imp', tex: '\\Rightarrow', delay: 0.4},
      {id: 'r', tex: `${a} = ${b}`, delay: 0.5, glow: bump(t, T.dann + 0.4, 1.0) + bump(t, T.injektiv, 1.0), color: C.txt},
    ],
  },
];

const L = (id: string, tex: string, extra: Partial<Atom> = {}): Atom => ({id, tex, ...extra});
const A0 = T.haben + 0.35;
const A1 = T.nenner - 0.75;
const A2 = T.kreuz;
const A3 = T.aus + 1.5;
const A4 = T.weg + 0.3;
const A5 = T.minus2a + 0.15;
const A6 = T.minus2b + 0.15;
const A7 = T.bleibt + 1.6;

// Schriftgröße der Rechnung a: lange Zeilen (Produkte, ausmultipliziert) kleiner
const sizeA = (t: number) => lerp(lerp(RA.size, 44, ease(t, A2, 1.0)), RA.size, ease(t, A5, 0.8));

const statesA = (t: number): MState[] => {
  const gAB = bump(t, T.zweiAB + 0.1, 1.6);
  const g3 = bump(t, T.drei + 0.05, 1.4);
  const g2a = bump(t, T.minus2a - 0.05, 0.9);
  const g2b = bump(t, T.minus2b - 0.05, 0.9);
  const gRes = bump(t, T.bleibt + 0.5, 1.0) + bump(t, T.injektiv, 1.0);
  const fracL = frac('FL', [L('L2a', `2${a}`), L('Lp', '+'), L('L3', '3')], [L('La', a), L('Lp1', '+'), L('L1', '1')]);
  const fracR = frac('FR', [L('R2b', `2${b}`), L('Rp', '+'), L('R3', '3')], [L('Rb', b), L('Rp1', '+'), L('R1', '1')]);
  const eq = L('eq', '=');
  const al: [string, number] = ['eq', RA.eqX];
  return [
    {at: A0, align: al, nodes: [L('fa', `f(${a})`), eq, L('fb', `f(${b})`)]},
    {
      at: A1,
      dur: 0.8,
      align: al,
      nodes: [
        frac('FL', [L('L2a', `2${a}`, {from: 'fa'}), L('Lp', '+', {from: 'fa'}), L('L3', '3', {from: 'fa'})], [L('La', a, {from: 'fa'}), L('Lp1', '+', {from: 'fa'}), L('L1', '1', {from: 'fa'})]),
        eq,
        frac('FR', [L('R2b', `2${b}`, {from: 'fb'}), L('Rp', '+', {from: 'fb'}), L('R3', '3', {from: 'fb'})], [L('Rb', b, {from: 'fb'}), L('Rp1', '+', {from: 'fb'}), L('R1', '1', {from: 'fb'})]),
      ],
      into: {fa: 'L2a', fb: 'R2b'},
    },
    {
      at: A2,
      dur: 1.0,
      align: al,
      nodes: [
        L('Lo', '(', {delay: 0.75}), L('L2a', `2${a}`), L('Lp', '+'), L('L3', '3'), L('Lc', ')', {delay: 0.75}),
        L('Ro2', '(', {delay: 0.75}), L('Rb', b, {arc: -24}), L('Rp1', '+', {arc: -24}), L('R1', '1', {arc: -24}), L('Rc2', ')', {delay: 0.75}),
        eq,
        L('Ro', '(', {delay: 0.75}), L('R2b', `2${b}`), L('Rp', '+'), L('R3', '3'), L('Rc', ')', {delay: 0.75}),
        L('Lo2', '(', {delay: 0.75}), L('La', a, {arc: -24}), L('Lp1', '+', {arc: -24}), L('L1', '1', {arc: -24}), L('Lc2', ')', {delay: 0.75}),
      ],
    },
    {
      at: A3,
      dur: 0.8,
      align: al,
      nodes: [
        L('L2ab', `2${a}${b}`, {from: 'L2a', glow: gAB, color: C.txt}),
        L('Lq1', '+', {delay: 0.05}),
        L('L2a', `2${a}`, {delay: 0.12}),
        L('Lp', '+', {delay: 0.18}),
        L('L3b', `3${b}`, {from: 'L3', delay: 0.24}),
        L('Lq3', '+', {delay: 0.3}),
        L('L3', '3', {delay: 0.36, glow: g3}),
        eq,
        L('R2ab', `2${a}${b}`, {from: 'R2b', glow: gAB}),
        L('Rq1', '+', {delay: 0.05}),
        L('R2b', `2${b}`, {delay: 0.12}),
        L('Rp', '+', {delay: 0.18}),
        L('R3a', `3${a}`, {from: 'R3', delay: 0.24}),
        L('Rq3', '+', {delay: 0.3}),
        L('R3', '3', {delay: 0.36, glow: g3}),
      ],
      into: {Rb: 'L2ab', R1: 'L2a', La: 'R2ab', L1: 'R2b'},
    },
    {
      at: A4,
      dur: 0.7,
      align: al,
      nodes: [L('L2a', `2${a}`, {glow: g2a, arc: 55}), L('Lp', '+'), L('L3b', `3${b}`), eq, L('R2b', `2${b}`, {glow: g2b}), L('Rp', '+'), L('R3a', `3${a}`)],
    },
    {
      at: A5,
      dur: 0.8,
      align: al,
      nodes: [L('L3b', `3${b}`), eq, L('R2b', `2${b}`, {glow: g2b, arc: 55}), L('Rp', '+'), L('R3a', a)],
      into: {L2a: 'R3a'},
    },
    {
      at: A6,
      dur: 0.8,
      align: al,
      nodes: [L('L3b', b, {glow: gRes}), eq, L('R3a', a, {glow: gRes})],
      into: {R2b: 'L3b'},
    },
    {
      at: A7,
      dur: 0.7,
      align: al,
      nodes: [L('R3a', a, {arc: 46, glow: gRes}), eq, L('L3b', b, {arc: -46, glow: gRes})],
    },
  ];
};
// Bögen des Ausmultiplizierens: [linkes Atom, rechtes Atom] in Zustand A2
const EXP_ARCS: [string, string][] = [
  ['L2a', 'Rb'],
  ['R2b', 'La'],
  ['L2a', 'R1'],
  ['R2b', 'L1'],
  ['L3', 'Rb'],
  ['R3', 'La'],
  ['L3', 'R1'],
  ['R3', 'L1'],
];

const PartA: React.FC = () => {
  const t = useSec();
  if (t < T.zeigen - 0.1 || t > T.teilB + 0.8) return null;
  const o = hide(t, T.teilB - 0.15, 0.55);
  const st = statesA(t);
  const z = zuZeigen(t);
  const sa = sizeA(t);
  // Kreuz der Kreuzmultiplikation
  const L1 = layoutState(st[1], 540, RA.cy, sa);
  const cross = show(t, T.nenner + 0.75, 0.5) * hide(t, A2 + 0.2, 0.4);
  const L2 = layoutState(st[2], 540, RA.cy, sa);
  const arcO = hide(t, A3 + 0.1, 0.4);
  const L3 = layoutState(st[3], 540, RA.cy, sa);
  const strikeO = hide(t, A4, 0.35);
  const fin = rowBounds(st[7], 540, RA.cy, sa);
  const box = show(t, T.injektiv - 0.05, 0.45);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Morph t={t} states={z} cy={ZZ.cy} size={ZZ.size} />
      {cross > 0
        ? [
            [L1.atoms.La, L1.atoms.R3],
            [L1.atoms.Rb, L1.atoms.L2a],
          ].map(([p, q], i) => (
            <svg key={i} width={W} height={1920} style={{position: 'absolute', inset: 0, opacity: cross * 0.85}}>
              <line x1={p.x} y1={p.y} x2={lerp(p.x, q.x, cross)} y2={lerp(p.y, q.y, cross)} stroke={AM} strokeWidth={3.5} strokeLinecap="round" style={{filter: `drop-shadow(0 0 6px ${AM})`}} />
            </svg>
          ))
        : null}
      {t > T.aus && t < A3 + 0.6
        ? EXP_ARCS.map(([p, q], i) => {
            const P = L2.atoms[p];
            const Q = L2.atoms[q];
            return <Arc key={i} t={t} at={T.aus + 0.15 + 0.17 * i} p={[P.x, P.y - sa * 0.45]} q={[Q.x, Q.y - sa * 0.45]} lift={26 + Math.abs(Q.x - P.x) * 0.12} o={arcO} />;
          })
        : null}
      {t > T.weg - 0.3 && t < A4 + 0.5
        ? ['L2ab', 'R2ab', 'L3', 'R3'].map((id, i) => {
            const p = L3.atoms[id];
            return <Strike key={id} x={p.x} y={p.y} w={p.w * 0.8} t={t} at={T.weg - 0.25 + 0.06 * i} o={strikeO} />;
          })
        : null}
      <ResultBox cx={fin.cx} cy={RA.cy} w={fin.w + 90} h={sa * 1.9} o={box} glow={bump(t, T.injektiv + 0.1, 1.0)} />
      <Morph t={t} states={st} cy={RA.cy} size={sa} />
      <Note y={RA.cy + 115} tex={`${a},\\ ${b} \\neq ${co('-1')}`} o={show(t, T.nenner + 0.15, 0.4) * hide(t, T.aus - 0.2, 0.4)} size={36} />
      <Note y={RA.cy + 110} tex={`\\big|\\; -2${a}`} x={470} o={show(t, T.minus2a - 0.1, 0.35) * hide(t, A7 - 0.2, 0.4)} size={36} />
      <Note y={RA.cy + 110} tex={`-2${b}`} x={600} o={show(t, T.minus2b - 0.1, 0.35) * hide(t, A7 - 0.2, 0.4)} size={36} />
      <Note y={RA.cy + 120} tex={'\\text{gleicher Wert} \\Rightarrow \\text{gleiche Eingabe: } f \\text{ ist injektiv}'} o={show(t, T.injektiv + 0.2, 0.45)} size={34} color={C.txt} />
    </AbsoluteFill>
  );
};

/* ---------- Teil b: surjektiv, Teil c: Umkehrfunktion ---------- */

const x = cy('x');
const y = am('y');
const RB = {cy: 960, size: 54, eqX: 500};
const B0 = T.suchen + 0.75;
const B1 = T.mal + 0.3;
const B2 = T.klammer + 0.45;
const B3 = T.links + 0.1;
const B4 = T.ausklammern + 0.1;
const B5 = T.teilen + 0.1;
const C1 = T.steht + 0.35;
const C2 = T.variable + 0.15;
const UP = T.graph - 0.25; // Rechnung rückt nach oben, Graph kommt

const statesB = (t: number): MState[] => {
  const eq = L('eq', '=');
  const al: [string, number] = ['eq', RB.eqX];
  const gx = bump(t, T.links + 0.1, 1.2);
  const gy = bump(t, T.rest + 0.05, 1.2);
  const gDen = bump(t, T.nie2 + 0.2, 1.2) + bump(t, T.teilen + 0.6, 0.8);
  const gRes = bump(t, T.urbild + 0.4, 1.0);
  const gInv = bump(t, C1 + 0.4, 1.0);
  const s5 = (X: string, nY: string, dY: string, colorDen?: string, extra: (id: string) => Partial<Atom> = () => ({})): Node[] => [
    L('X', X, {glow: gRes + gInv, ...extra('X')}),
    eq,
    frac('FX', [L('N3', '3', extra('N3')), L('Dp', '-', extra('Dp')), L('Y', nY, extra('Y'))], [L('Yy', dY, {glow: gDen, color: colorDen, ...extra('Yy')}), L('Np', '-', extra('Np')), L('N2', '2', extra('N2'))]),
  ];
  return [
    {at: B0, align: al, nodes: [L('Y', y), eq, frac('F1', [L('N2x', `2${x}`), L('Np', '+'), L('N3', '3')], [L('Dx', x), L('Dp', '+'), L('D1', '1')])]},
    {
      at: B1,
      dur: 0.9,
      align: al,
      nodes: [L('Y', y), L('Po', '('), L('Dx', x), L('Dp', '+'), L('D1', '1'), L('Pc', ')'), eq, L('N2x', `2${x}`), L('Np', '+'), L('N3', '3')],
    },
    {
      at: B2,
      dur: 0.8,
      align: al,
      nodes: [L('YX', `${y}${x}`, {from: 'Y'}), L('Dp', '+'), L('Y', y), eq, L('N2x', `2${x}`), L('Np', '+'), L('N3', '3')],
      into: {Dx: 'YX', D1: 'Y'},
    },
    {
      at: B3,
      dur: 0.9,
      align: al,
      nodes: [
        L('YX', `${y}${x}`, {glow: gx, color: C.txt}),
        L('Np', '-', {arc: 70}),
        L('N2x', `2${x}`, {arc: 70, glow: gx, color: C.txt}),
        eq,
        L('N3', '3', {delay: 0.2}),
        L('Dp', '-', {arc: -70, delay: 0.3}),
        L('Y', y, {arc: -70, delay: 0.3, glow: gy, color: C.txt}),
      ],
    },
    {
      at: B4,
      dur: 0.9,
      align: al,
      nodes: [L('X', x, {from: 'YX'}), L('Po2', '('), L('Yy', y, {from: 'YX'}), L('Np', '-'), L('N2', '2', {from: 'N2x'}), L('Pc2', ')'), eq, L('N3', '3'), L('Dp', '-'), L('Y', y)],
      into: {YX: 'X', N2x: 'X'},
    },
    {
      at: B5,
      dur: 1.0,
      align: al,
      nodes: s5(x, y, y, undefined, (id) => (['Yy', 'Np', 'N2'].includes(id) ? {arc: -40} : {})),
    },
    {at: C1, dur: 0.7, align: al, nodes: s5(`f^{-1}(${y})`, y, y)},
    {
      at: C2,
      dur: 0.8,
      align: al,
      nodes: s5('f^{-1}(x)', 'x', 'x', undefined, (id) => ({delay: id === 'X' ? 0 : id === 'Y' ? 0.18 : id === 'Yy' ? 0.32 : 0})),
    },
  ];
};

// Lage der Rechnung b/c: steht bei RB, rückt für die Spiegelung nach oben und wird kleiner
const geoB = (t: number) => {
  const k = ease(t, UP, 0.8);
  return {cy: lerp(RB.cy, 680, k), size: lerp(RB.size, 44, k)};
};

// Nebenrechnungen
const FB = {cy: 1185, size: 44};
const f1States = (t: number): MState[] => {
  const lab = L('lab', `\\text{Für } ${y} = 2\\colon`, {color: C.txt2});
  return [
    {at: T.beiY2 + 0.35, align: ['eq', 640], nodes: [lab, L('X', x), L('Po', '('), L('T2a', '2'), L('Mi', '-'), L('T2b', '2'), L('Pc', ')'), L('eq', '='), L('F3', '3'), L('Mi2', '-'), L('F2', '2')]},
    {
      at: T.nullEins,
      dur: 0.7,
      align: ['eq', 640],
      nodes: [lab, L('Z0', '0', {from: 'T2a', color: CO, glow: bump(t, T.nullEins + 0.6, 1.0)}), L('eq', '=', {color: CO}), L('O1', '1', {from: 'F3', color: CO, glow: bump(t, T.nullEins + 0.6, 1.0)})],
      into: {X: 'Z0', Po: 'Z0', T2b: 'Z0', Mi: 'Z0', Pc: 'Z0', Mi2: 'O1', F2: 'O1'},
    },
  ];
};
const G1 = T.dreiZwei - 0.95;
const f2States = (t: number): MState[] => {
  const lab = L('lab', `\\text{Für } ${x} = -1\\colon`, {color: C.txt2});
  const gc = bump(t, T.dreiZwei + 0.6, 1.0);
  return [
    {at: T.nieMinus1 + 0.3, align: ['eq', 700], nodes: [lab, frac('GF', [L('g3', '3'), L('gm', '-'), L('gy', y)], [L('hy', y), L('hm', '-'), L('h2', '2')]), L('eq', '='), L('m1', '-1')]},
    {
      at: G1,
      dur: 0.8,
      align: ['eq', 700],
      nodes: [lab, L('g3', '3'), L('gm', '-'), L('gy', y), L('eq', '='), L('k2', '2', {from: 'h2'}), L('km', '-', {from: 'hm'}), L('ky', y, {from: 'hy'})],
      into: {m1: 'km'},
    },
    {
      at: T.dreiZwei + 0.1,
      dur: 0.7,
      align: ['eq', 700],
      nodes: [lab, L('g3', '3', {color: CO, glow: gc}), L('eq', '=', {color: CO}), L('k2', '2', {color: CO, glow: gc})],
    },
  ];
};
const Cross: React.FC<{x: number; y: number; o: number}> = ({x: X, y: Y, o}) =>
  o <= 0.01 ? null : <div style={{position: 'absolute', left: X, top: Y, transform: `translate(-50%, -50%) scale(${0.8 + 0.2 * o})`, opacity: o, fontFamily: F.display, fontWeight: 800, fontSize: 48, color: CO, textShadow: `0 0 18px ${CO}`}}>✗</div>;

const Panel: React.FC<{y: number; h: number; o: number}> = ({y: Y, h, o}) =>
  o <= 0.01 ? null : <div style={{position: 'absolute', left: 110, top: Y - h / 2, width: W - 220, height: h, borderRadius: 22, background: 'rgba(16,17,44,.82)', border: `1.5px solid ${rgba(CO, 0.35)}`, opacity: o}} />;

const PartBC: React.FC = () => {
  const t = useSec();
  if (t < B0 - 0.1 || t > T.summary + 0.8) return null;
  const o = hide(t, T.summary - 0.05, 0.5);
  const st = statesB(t);
  const geo = geoB(t);
  const L5 = layoutState(st[5], 540, RB.cy, RB.size);
  // Bögen beim Auflösen der Klammer
  const L1 = layoutState(st[1], 540, RB.cy, RB.size);
  const klO = hide(t, B2 + 0.1, 0.35);
  // frühere Zeile x(y−2) = 3−y bleibt gedimmt stehen
  const ghostY = lerp(RB.cy, 800, ease(t, B5, 0.8));
  const ghostO = show(t, B5, 0.3) * hide(t, T.urbild, 0.5) * (0.42 + 0.5 * bump(t, T.beiY2 + 0.1, 1.2));
  const box = show(t, T.urbild + 0.2, 0.45) * hide(t, C1 - 0.1, 0.35);
  const fin = rowBounds(st[5], 540, RB.cy, RB.size);
  const p1 = show(t, T.beiY2 + 0.2, 0.4) * hide(t, T.nieMinus1 - 0.05, 0.35);
  const p2 = show(t, T.nieMinus1 + 0.15, 0.4) * hide(t, T.urbild - 0.1, 0.4);
  return (
    <AbsoluteFill style={{opacity: o}}>
      {t > B2 - 0.5 && t < B2 + 0.6
        ? [L1.atoms.Dx, L1.atoms.D1].map((q, i) => {
            const P = L1.atoms.Y;
            return <Arc key={i} t={t} at={T.klammer + 0.02 + 0.18 * i} p={[P.x, P.y - RB.size * 0.45]} q={[q.x, q.y - RB.size * 0.45]} lift={30 + 0.15 * (q.x - P.x)} o={klO} />;
          })
        : null}
      {ghostO > 0.01 ? (
        <div style={{position: 'absolute', inset: 0, opacity: ghostO}}>
          <Morph t={t} states={[{...st[4], at: -1}]} cy={ghostY} size={RB.size * 0.85} />
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 230, top: 612, width: 620, height: 236, borderRadius: 24, background: 'rgba(9,10,30,.84)', border: '1.5px solid rgba(255,255,255,.1)', opacity: ease(t, UP + 0.3, 0.6)}} />
      <ResultBox cx={fin.cx} cy={RB.cy} w={fin.w + 90} h={RB.size * 3.1} o={box} glow={bump(t, T.urbild + 0.3, 1.0)} />
      <Morph t={t} states={st} cy={geo.cy} size={geo.size} />
      <Note y={RB.cy + 105} x={800} tex={`\\big|\\; \\cdot (${x}+1)`} o={show(t, T.mal, 0.35) * hide(t, T.klammer, 0.35)} />
      <Note y={RB.cy + 105} x={800} tex={`\\big|\\; :(${y}-2)`} o={show(t, T.teilen, 0.35) * hide(t, T.nie2 - 0.1, 0.35)} />
      <Note y={L5.atoms.Yy.y + 70} x={L5.bars.FX.x} tex={`${y} \\neq ${co('2')}`} o={show(t, T.nie2 + 0.15, 0.4) * hide(t, T.beiY2, 0.35)} size={38} />
      <Panel y={FB.cy} h={190} o={Math.max(p1, p2)} />
      <div style={{position: 'absolute', inset: 0, opacity: p1}}>
        <Morph t={t} states={f1States(t)} cy={FB.cy} size={FB.size} />
        <Cross x={820} y={FB.cy} o={show(t, T.nullEins + 0.6, 0.35)} />
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: p2}}>
        <Morph t={t} states={f2States(t)} cy={FB.cy} size={FB.size} />
        <Cross x={840} y={FB.cy} o={show(t, T.dreiZwei + 0.7, 0.35)} />
      </div>
      <Note y={RB.cy + 175} tex={'\\text{Jedes } y \\neq 2 \\text{ hat ein Urbild: } f \\text{ ist surjektiv}'} o={show(t, T.surjektiv + 0.1, 0.45) * hide(t, C1 - 0.1, 0.4)} size={34} color={C.txt} />
      <Note y={RB.cy + 140} tex={`${y} \\;\\longmapsto\\; ${x}`} o={show(t, T.bringt + 0.3, 0.45) * hide(t, C2 - 0.1, 0.4)} size={52} glow={bump(t, T.bringt + 0.6, 1.0)} color={C.txt} />
      <SetsSwap />
    </AbsoluteFill>
  );
};

/* ---------- Teil c: Definitions- und Zielmenge tauschen ---------- */

const SetsSwap: React.FC = () => {
  const t = useSec();
  const at = T.mengen + 0.2;
  if (t < at) return null;
  const k = ease(t, at + 0.35, 1.1);
  const up = ease(t, UP, 0.8);
  const yRow = lerp(1110, 790, up);
  const size = lerp(46, 38, up);
  const card = cardSets(t);
  const sg = setsGeo(t);
  const D = atomAt(card, t, 'D', sg.cx, sg.cy, sg.size)!;
  const Z = atomAt(card, t, 'Z', sg.cx, sg.cy, sg.size)!;
  // Zielzeile f⁻¹: ℝ∖{2} → ℝ∖{−1}
  const target: MState = {
    at: -1,
    nodes: [L('f', 'f^{-1}\\colon'), L('Z', `\\mathbb{R}\\setminus\\{${co('2')}\\}`), L('to', '\\to'), L('D', `\\mathbb{R}\\setminus\\{${co('-1')}\\}`)],
  };
  const T1 = layoutState(target, 540, yRow, size);
  const fo = show(t, at + 0.9, 0.5);
  const piece = (id: 'D' | 'Z', src: {x: number; y: number}, sign: number) => {
    const q = T1.atoms[id];
    const px = lerp(src.x, q.x, k);
    const py = lerp(src.y, q.y, k) - Math.sin(Math.PI * k) * 60 * sign;
    const sc = lerp(SETS_SMALL.size, size, k) / size;
    return (
      <div key={id} style={{position: 'absolute', left: px, top: py, transform: `translate(-50%, -50%) scale(${sc})`, whiteSpace: 'nowrap', opacity: clamp((t - at) / 0.2), textShadow: glowShadow(bump(t, at + 1.5, 1.0), CO)}}>
        <Tex tex={target.nodes.find((n) => (n as Atom).id === id) ? (target.nodes.find((n) => (n as Atom).id === id) as Atom).tex : ''} size={size} />
      </div>
    );
  };
  const o = hide(t, T.summary - 0.05, 0.5);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      {piece('D', D, 1)}
      {piece('Z', Z, -1)}
      {(['f', 'to'] as const).map((id) => {
        const q = T1.atoms[id];
        return (
          <div key={id} style={{position: 'absolute', left: q.x, top: q.y, transform: 'translate(-50%, -50%)', opacity: fo, whiteSpace: 'nowrap', textShadow: shadow}}>
            <Tex tex={(target.nodes.find((n) => (n as Atom).id === id) as Atom).tex} size={size} />
          </div>
        );
      })}
    </div>
  );
};

/* ---------- Zusammenfassung ---------- */

const Summary: React.FC = () => {
  const t = useSec();
  const p = springOS(clamp((t - T.summary + 0.05) / 0.6));
  const out = hide(t, T.cta - 0.2, 0.5);
  if (p <= 0 || out <= 0) return null;
  const rows: [string, number][] = [
    ['Injektiv', T.summary + 0.1],
    ['Surjektiv', T.sSur],
    ['Bijektiv', T.sBij],
  ];
  return (
    <div style={{position: 'absolute', inset: 0, opacity: clamp(p * 1.4) * out}}>
      <div style={{position: 'absolute', left: 130, top: 690, width: W - 260, height: 560, borderRadius: 28, border: '1.5px solid rgba(255,255,255,.18)', background: 'linear-gradient(180deg, rgba(20,22,52,.95), rgba(10,11,32,.93))', boxShadow: '0 30px 90px rgba(0,0,0,.45)', transform: `scale(${0.96 + 0.04 * p})`}} />
      {rows.map(([name, at], i) => {
        const s = show(t, at, 0.4);
        const g = bump(t, at + 0.1, 0.8) + bump(t, T.sJa, 0.9);
        return (
          <div key={i} style={{position: 'absolute', left: 200, right: 200, top: 760 + i * 100, height: 70, display: 'flex', alignItems: 'center', opacity: s, transform: `translateY(${(1 - s) * 12}px)`}}>
            <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 46, color: C.txt}}>{name}</span>
            <span style={{marginLeft: 'auto', fontFamily: F.display, fontWeight: 800, fontSize: 46, color: OK, textShadow: g > 0.02 ? `0 0 ${24 * g}px rgba(123,234,156,.8)` : undefined}}>Ja ✓</span>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 200, right: 200, top: 1072, height: 1.5, background: 'rgba(255,255,255,.12)', opacity: show(t, T.sJa - 0.1, 0.4)}} />
      <Note y={1160} tex={'f^{-1}(x) = \\dfrac{3-x}{x-2}'} o={show(t, T.sJa - 0.05, 0.45)} size={50} color={C.txt} glow={bump(t, T.sJa + 0.2, 1.0)} />
    </div>
  );
};

/* ---------- Logo, CTA ---------- */

const LogoMark: React.FC = () => {
  const t = useSec();
  const a = show(t, 3.2, 0.7);
  if (a <= 0) return null;
  const k = prog(t, T.cta, 0.9);
  const size = lerp(56, 248, k);
  const cx = lerp(W - MARGIN - 34 - 28, 540, k);
  const cy0 = lerp(336, 700, k);
  const glint = clamp((t - 3.2) / 1.1);
  return (
    <div style={{position: 'absolute', left: cx - size / 2, top: cy0 - size / 2, width: size, height: size, opacity: a * lerp(0.85, 1, k)}}>
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

const Centered: React.FC<{y: number; at: number; size: number; color?: string; weight?: number; children: React.ReactNode}> = ({y: Y, at, size, color = C.txt, weight = 800, children}) => {
  const t = useSec();
  const p = easeOutExpo(clamp((t - at) / 0.5));
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: Y, textAlign: 'center', fontFamily: F.display, fontWeight: weight, fontSize: size, letterSpacing: weight >= 800 ? '-.035em' : '-.01em', color, opacity: p, transform: `translateY(${(1 - p) * 24}px)`, textShadow: shadow}}>
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

const CUES = SUBTITLES.map(([s0, s1, text], i) => {
  const next = SUBTITLES[i + 1] ? SUBTITLES[i + 1][0] - 0.1 : Infinity;
  return {from: s0 - 0.05, to: Math.min(s1 + 0.3, next), text};
});
const Subtitles: React.FC = () => {
  const t = useSec();
  const c = CUES.find(({from, to}) => t >= from && t < to);
  if (!c) return null;
  const o = clamp((t - c.from) / 0.12) * clamp((c.to - t) / 0.12);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1446, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{maxWidth: 820, padding: '8px 18px', borderRadius: 12, background: 'rgba(7,8,26,.62)', fontFamily: F.body, fontWeight: 500, fontSize: 30, lineHeight: 1.3, color: 'rgba(243,244,251,.88)', textAlign: 'center'}}>{c.text}</div>
    </div>
  );
};

const Flash: React.FC = () => {
  const t = useSec();
  const fl = Math.max(bump(t, T.injektiv, 0.4) * 0.5, bump(t, T.surjektiv, 0.4) * 0.5, bump(t, T.bijektiv, 0.4) * 0.5);
  return fl > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.08 * fl}} /> : null;
};

/* ---------- Ton ---------- */

const SFX: [number, string, number][] = [
  [0, 'whoosh', 0.4],
  [0.1, 'click', 0.3],
  [T.frage - 0.1, 'whoosh', 0.28],
  [T.injektiv0, 'tick', 0.26],
  [T.surjektiv0, 'tick', 0.26],
  [T.bijektiv0, 'tick', 0.26],
  [T.vorne, 'swell', 0.24],
  [T.minusEins, 'buzz', 0.16],
  [T.zwei0, 'buzz', 0.16],
  [T.teilA, 'click', 0.3],
  [T.verschieden + 0.15, 'tick', 0.28],
  [T.verschieden + 0.95, 'tick', 0.28],
  [A1, 'whoosh', 0.24],
  [A2, 'whoosh', 0.26],
  ...Array.from({length: 8}, (_, i) => [T.aus + 0.15 + 0.17 * i, 'tick', 0.16] as [number, string, number]),
  [A3, 'whoosh', 0.22],
  [T.weg - 0.25, 'collapse', 0.34],
  [A5, 'whoosh', 0.2],
  [A6, 'whoosh', 0.2],
  [A7, 'click', 0.3],
  [T.injektiv, 'lock_hi', 0.45],
  [T.injektiv, 'accent', 0.3],
  [T.teilB, 'click', 0.3],
  [T.jede + 0.3, 'rise', 0.2],
  [T.ausserZwei, 'buzz', 0.22],
  [B0, 'click', 0.26],
  [B1, 'whoosh', 0.24],
  [B2, 'whoosh', 0.22],
  [B3, 'whoosh', 0.22],
  [T.rest + 0.05, 'whoosh', 0.2],
  [B4, 'whoosh', 0.22],
  [B5, 'whoosh', 0.24],
  [T.nullEins + 0.6, 'buzz', 0.24],
  [T.dreiZwei + 0.7, 'buzz', 0.24],
  [T.surjektiv, 'lock_hi', 0.45],
  [T.surjektiv, 'accent', 0.3],
  [T.teilC, 'click', 0.3],
  [T.bijektiv, 'lock', 0.4],
  [C1, 'click', 0.26],
  [C2, 'whoosh', 0.22],
  [T.mengen + 0.55, 'whoosh', 0.26],
  [T.spiegel - 0.5, 'swell', 0.26],
  [T.summary, 'click', 0.3],
  [T.sSur, 'tick', 0.28],
  [T.sBij, 'tick', 0.28],
  [T.sJa, 'accent', 0.32],
  [T.cta - 0.1, 'swell', 0.34],
  ...Array.from({length: 8}, (_, i) => [T.tippt + i * 0.075, 'tick', 0.18] as [number, string, number]),
];

/* ---------- Komposition ---------- */

export type ABBProps = {music: boolean; voice: boolean};

const LEAD = 0.08;
const TAIL = 0.1;

export const VideoABB: React.FC<ABBProps> = ({music, voice}) => {
  useTexFonts();
  const ready = useTexReady();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={950} strength={0.85} />
      <Stage />
      {ready ? (
        <>
          <PartA />
          <PartBC />
          <Summary />
          <TaskCard />
          <Chips />
        </>
      ) : null}
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
                <Audio src={staticFile(VOICES[c.src])} trimBefore={sec(c.from - lead)} trimAfter={sec(c.to + TAIL)} />
              </Sequence>
            );
          })
        : null}
    </AbsoluteFill>
  );
};
