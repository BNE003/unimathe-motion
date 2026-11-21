// Klausurvideo „Äquivalenzrelation“: a ∼ b ⟺ 3 ∣ (a − b) auf ℤ.
// Aufgabenkarte, Fortschritts-Chips, Beweise als Morph-Zeilen unter der Zahlengeraden, Klassen, Zusammenfassung, CTA.
// Karte, Chips, Zusammenfassung und CTA nach src/abb/Video.tsx (Branch video/abbildungen-klausur).
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C, MARGIN, W} from '../theme';
import {F, useTexFonts} from '../fonts';
import {bump, clamp, easeInCubic, easeOutExpo, lerp, prog, sec, springOS} from '../math';
import {Backdrop, Grain, Mono, Tex, useSec} from '../ui';
import {CLIPS, MUSIC, SUBTITLES, T, VOICE} from './timeline';
import {Atom, MState, Morph, Node, atomAt, hide, shadow, show, useTexReady} from './kit';
import {AM, CLASS_COL, CO, CY, OK, ResultBox, Strike, am, ease, rowBounds} from './common';
import {NumberLine, PartALine, PartBLine} from './Line';

const L = (id: string, tex: string, extra: Partial<Atom> = {}): Atom => ({id, tex, ...extra});
const SIM_A = (id: string, extra: Partial<Atom> = {}) => L(id, '\\sim', {color: CY, pad: 0.28, ...extra});

/* ---------- Aufgabenkarte ---------- */

const BOX_HOOK = {top: 600, h: 560};
const BOX_SMALL = {top: 300, h: 200};
const compactK = (t: number) => ease(t, T.frage - 0.15, 0.95);
const cardOut = (t: number) => easeInCubic(clamp((t - (T.cta - 0.2)) / 0.5));
const CARD_HOOK = {cx: 540, cy: 845, size: 58};
const CARD_SMALL = {cx: 540, cy: 425, size: 44};

const defNodes = (t: number): Node[] => {
  const g1 = bump(t, T.relation0 + 0.1, 1.0) + bump(t, T.aus, 0.8) + bump(t, T.ausT, 0.8);
  const g2 = bump(t, T.teilt0 + 0.2, 1.0) + bump(t, T.heisst + 0.1, 1.0);
  return [
    L('a', 'a'),
    SIM_A('s', {glow: g1}),
    L('b', 'b'),
    L('iff', '\\iff', {pad: 0.06}),
    L('th', '3', {color: AM, glow: g2}),
    L('mid', '\\mid', {pad: 0.22, glow: g2}),
    L('p', '(a - b)', {glow: bump(t, T.heisst + 0.4, 1.0)}),
  ];
};
const cardStates = (t: number): MState[] => [
  {at: -1, nodes: [], rows: [{dy: -104, nodes: [L('auf', '\\text{Auf}', {pad: 0.3, color: C.txt2}), L('Z', '\\mathbb{Z}', {color: C.txt2}), L('sei', '\\text{sei}', {pad: 0.3, color: C.txt2})]}, {dy: 0, nodes: defNodes(t)}]},
  {at: T.frage - 0.15, dur: 0.95, nodes: [L('Z', '\\mathbb{Z}\\colon', {pad: 0.3, color: C.txt2}), ...defNodes(t)]},
];
const cardGeo = (t: number) => {
  const k = compactK(t);
  return {cx: lerp(CARD_HOOK.cx, CARD_SMALL.cx, k), cy: lerp(CARD_HOOK.cy, CARD_SMALL.cy, k), size: lerp(CARD_HOOK.size, CARD_SMALL.size, k)};
};

const TASKS: React.ReactNode[] = [
  <>
    a) Zeigen Sie, dass <Tex tex={'\\sim'} size={36} style={{color: C.txt}} /> eine Äquivalenzrelation ist.
  </>,
  'b) Bestimmen Sie alle verschiedenen Äquivalenzklassen.',
];
const TASK_TOP = [948, 1030];

const TaskCard: React.FC = () => {
  const t = useSec();
  const appear = springOS(clamp((t + 0.05) / 0.55));
  const gone = cardOut(t);
  if (gone >= 1) return null;
  const k = compactK(t);
  const top = lerp(BOX_HOOK.top, BOX_SMALL.top, k);
  const h = lerp(BOX_HOOK.h, BOX_SMALL.h, k);
  const o = clamp(appear * 1.4) * (1 - gone);
  const g = cardGeo(t);
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
        <Morph t={t} states={cardStates(t)} cx={g.cx} cy={g.cy} size={g.size} />
      </div>
      {TASKS.map((txt, i) => {
        const fly = ease(t, T.frage - 0.1 + 0.12 * i, 0.9);
        if (fly >= 1) return null;
        const c = chipCenter2(i);
        const x = lerp(MARGIN + 50, c[0] - 150, fly);
        const y = lerp(TASK_TOP[i], c[1] - 20, fly);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 870,
              transform: `scale(${lerp(1, 0.5, fly)})`,
              transformOrigin: 'left top',
              opacity: o * show(t, 0.3 + 0.15 * i, 0.4) * (1 - easeInCubic(fly)),
              fontFamily: F.body,
              fontWeight: 500,
              fontSize: 34,
              lineHeight: 1.28,
              color: C.txt,
              textShadow: shadow,
            }}
          >
            {txt}
          </div>
        );
      })}
    </>
  );
};

/* ---------- Chips ---------- */

const CHIP_Y = 520;
const CHIP_H = 60;
type Rect = {x: number; w: number};
const TWO: Rect[] = [
  {x: MARGIN, w: 456},
  {x: W - MARGIN - 456, w: 456},
];
const THREE_R: Rect[] = [0, 1, 2].map((i) => ({x: MARGIN + i * 318, w: 300}));
const chipCenter2 = (i: number): [number, number] => [TWO[i].x + TWO[i].w / 2, CHIP_Y + CHIP_H / 2];
const mixRect = (p: Rect, q: Rect, k: number): Rect => ({x: lerp(p.x, q.x, k), w: lerp(p.w, q.w, k)});

type ChipState = 'idle' | 'active' | 'ok';
const Chip: React.FC<{r: Rect; o: number; st: ChipState; pulse: number; mark: string; label: React.ReactNode; okText: string}> = ({r, o, st, pulse, mark, label, okText}) => {
  if (o <= 0.01) return null;
  const border = st === 'ok' ? OK : st === 'active' ? AM : 'rgba(255,255,255,.22)';
  const tint = st === 'active' ? 'rgba(255,194,71,.10)' : st === 'ok' ? 'rgba(123,234,156,.08)' : 'rgba(255,255,255,0)';
  return (
    <div
      style={{
        position: 'absolute',
        left: r.x,
        top: CHIP_Y,
        width: r.w,
        height: CHIP_H,
        boxSizing: 'border-box',
        borderRadius: 18,
        border: `2.5px solid ${border}`,
        background: `linear-gradient(${tint}, ${tint}), rgba(10,11,32,.94)`,
        boxShadow: st === 'active' ? '0 0 30px rgba(255,194,71,.25)' : pulse > 0.02 ? `0 0 ${30 * pulse}px rgba(255,194,71,${0.4 * pulse})` : undefined,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        paddingLeft: 14,
        opacity: o,
        transform: `scale(${1 + 0.06 * pulse})`,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          flex: '0 0 auto',
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
        {mark}
      </span>
      <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 27, color: st === 'idle' ? C.txt2 : C.txt}}>{label}</span>
      {st === 'ok' ? <span style={{marginLeft: 'auto', marginRight: 14, fontFamily: F.display, fontWeight: 800, fontSize: 26, color: OK}}>{okText}</span> : null}
    </div>
  );
};

const PROPS = ['reflexiv', 'symmetrisch', 'transitiv'];
const propT = (): [number, number, number][] => [
  // [aktiv ab, fertig ab, Puls beim Nennen]
  [T.refl, T.reflOk, T.wR],
  [T.sym, T.symOk, T.wS],
  [T.trans, T.transOk, T.wT],
];

const Chips: React.FC = () => {
  const t = useSec();
  const out = 1 - cardOut(t);
  if (out <= 0) return null;
  const split = ease(t, T.teilA + 0.1, 0.7) * (1 - ease(t, T.relation + 0.05, 0.7));
  const items: React.ReactNode[] = [];
  // a: Äquivalenzrelation
  {
    const p = springOS(clamp((t - (T.frage + 0.35)) / 0.6));
    const st: ChipState = t >= T.relation + 0.3 ? 'ok' : t >= T.teilA ? 'active' : 'idle';
    const pulse = Math.max(bump(t, T.aeq0 + 0.1, 0.7), bump(t, T.relation + 0.3, 0.7), bump(t, T.alle, 0.6));
    items.push(<Chip key="a" r={TWO[0]} o={clamp(p * 1.4) * out * (1 - clamp(split * 3))} st={st} pulse={pulse} mark="a" label="Äquivalenzrelation" okText="Ja ✓" />);
  }
  // b: Klassen
  {
    const p = springOS(clamp((t - (T.frage + 0.47)) / 0.6));
    const st: ChipState = t >= T.bOk ? 'ok' : t >= T.teilB ? 'active' : 'idle';
    const pulse = Math.max(bump(t, T.klassen0 + 0.1, 0.7), bump(t, T.teilB, 0.6), bump(t, T.bOk, 0.7));
    const r = {x: TWO[1].x + 520 * split, w: TWO[1].w};
    items.push(<Chip key="b" r={r} o={clamp(p * 1.4) * out * (1 - split)} st={st} pulse={pulse} mark="b" label={t >= T.bOk ? '3 Klassen' : 'Klassen'} okText="✓" />);
  }
  // Eigenschaften
  if (split > 0.01)
    propT().forEach(([on, ok, hint], i) => {
      const st: ChipState = t >= ok ? 'ok' : t >= on ? 'active' : 'idle';
      const pulse = Math.max(bump(t, hint + 0.05, 0.6), bump(t, on, 0.5), bump(t, ok, 0.6));
      items.push(<Chip key={`p${i}`} r={mixRect(TWO[0], THREE_R[i], split)} o={clamp(split * 3 - 0.3) * out} st={st} pulse={pulse} mark={`${i + 1}`} label={PROPS[i]} okText="✓" />);
    });
  return <>{items}</>;
};

/* ---------- Teil a: Beweise ---------- */

const ZZ = {cy: 985, size: 40};
const R1 = {cy: 1092, size: 50};
const DY = 105;

const zuZeigen = (t: number): MState[] => {
  const lab = L('lab', '\\text{Zu zeigen:}', {color: C.txt2, pad: 0.3});
  const sim = `\\textcolor{${CY}}{\\sim}`;
  return [
    {at: T.refl + 0.15, nodes: [lab, L('r1', `a ${sim} a`)]},
    {at: T.sym + 0.1, nodes: [lab, L('r2', `a ${sim} b \\;\\Rightarrow\\; b ${sim} a`)]},
    {at: T.trans + 0.1, nodes: [lab, L('r3', `a ${sim} b \\,\\wedge\\, b ${sim} c \\;\\Rightarrow\\; a ${sim} c`)]},
  ];
};

// Reflexivität
const reflStates = (t: number): MState[] => {
  const head = [L('a1', 'a'), SIM_A('s'), L('a2', 'a'), L('iff', '\\iff', {pad: 0.06}), L('th', '3', {color: AM}), L('mid', '\\mid', {pad: 0.22})];
  const gz = bump(t, T.aa + 0.6, 1.0) + bump(t, T.null3 + 0.2, 0.9);
  const row0 = [...head, L('z', '0', {glow: gz})];
  return [
    {at: T.selbst + 0.5, nodes: [...head, L('lp', '('), L('x1', 'a'), L('m', '-'), L('x2', 'a'), L('rp', ')')]},
    {at: T.aa + 0.35, dur: 0.8, nodes: row0, into: {lp: 'z', x1: 'z', m: 'z', x2: 'z', rp: 'z'}},
    {
      at: T.null3 + 0.3,
      dur: 0.7,
      nodes: [],
      rows: [
        {dy: 0, nodes: row0},
        {dy: DY, nodes: [L('z2', '0', {from: 'z'}), L('e2', '='), L('th2', '3', {color: AM, from: 'th', glow: bump(t, T.null3 + 0.9, 0.9)}), L('dot', '\\cdot'), L('z3', '0', {delay: 0.2})]},
      ],
    },
  ];
};

// Symmetrie
const symStates = (t: number): MState[] => {
  const al: [string, number] = ['eq', 540];
  const g3 = bump(t, T.dreiK + 0.1, 0.9);
  const base = [L('a', 'a'), L('m', '-'), L('b', 'b'), L('eq', '='), L('th', '3', {color: AM, glow: g3}), L('k', 'k', {glow: g3})];
  const gNeg = bump(t, T.ba + 0.6, 1.0) + bump(t, T.ganz + 0.1, 0.9);
  const row3 = [L('b', 'b'), L('m', '-'), L('a', 'a'), L('eq', '='), L('th', '3', {color: AM, arc: 42}), L('lp', '('), L('ng', '-', {color: CO, glow: gNeg}), L('k', 'k'), L('rp', ')')];
  const row1a = [L('nk', `${'\\textcolor{' + CO + '}{-}'}k`, {from: 'k'}), L('iz', '\\in \\mathbb{Z}', {pad: 0.12})];
  return [
    {at: T.ak + 0.1, align: al, nodes: base},
    {at: T.ganzK + 0.1, align: al, nodes: [...base, L('cm', ',', {pad: 0.3, color: C.txt2}), L('kz', 'k \\in \\mathbb{Z}', {color: C.txt2})]},
    {at: T.mal + 0.1, align: al, nodes: [...base, L('op', `\\big|\\;\\cdot(${'\\textcolor{' + CO + '}{-1}'})`, {pad: 0.5, color: CO})]},
    {at: T.ba + 0.15, dur: 0.9, align: al, nodes: [L('b', 'b', {arc: 55}), L('m', '-'), L('a', 'a', {arc: -55}), L('eq', '='), L('ng', '-', {color: CO, delay: 0.3, glow: gNeg}), L('th', '3', {color: AM}), L('k', 'k')]},
    {at: T.ba + 1.55, dur: 0.7, align: al, nodes: row3},
    {at: T.ganz + 0.1, dur: 0.7, nodes: [], rows: [{dy: 0, align: al, nodes: row3}, {dy: DY, nodes: row1a}]},
    {at: T.ganz + 1.2, dur: 0.6, nodes: [], rows: [{dy: 0, align: al, nodes: row3}, {dy: DY, nodes: [...row1a, L('imp', '\\Rightarrow'), L('res', `b \\textcolor{${CY}}{\\sim} a`, {delay: 0.1, glow: bump(t, T.symOk, 1.0)})]}]},
  ];
};

// Transitivität
const TR_T = {
  t2: () => T.add + 0.15,
  t3: () => T.heben + 0.1,
  strike: () => T.heben + 0.95,
  t4: () => T.heben + 1.6,
  t5: () => T.summe + 0.2,
  t6: () => T.summe + 1.55,
};
const transStates = (t: number): MState[] => {
  const g1 = bump(t, T.abk + 0.6, 0.8);
  const gHeb = bump(t, T.heben + 0.15, 1.6);
  const row0 = [L('a1', 'a'), L('m1', '-'), L('b1', 'b'), L('e1', '='), L('t1', '3', {color: AM, glow: g1}), L('k', 'k')];
  const row1 = [L('b2', 'b'), L('m2', '-'), L('c2', 'c'), L('e2', '='), L('t2', '3', {color: AM, glow: bump(t, T.bcl + 0.6, 0.8)}), L('l', 'l')];
  const red = {color: CO, glow: gHeb};
  const fin = [L('a1', 'a'), L('m2', '-'), L('c2', 'c'), L('e1', '='), L('t1', '3', {color: AM, glow: bump(t, T.summe + 0.5, 1.0)}), L('lp3', '('), L('k', 'k'), L('pl2', '+'), L('l', 'l'), L('rp3', ')')];
  return [
    {at: T.abk + 0.15, nodes: [], rows: [{dy: 0, align: ['e1', 540], nodes: row0}]},
    {at: T.bcl + 0.15, nodes: [], rows: [{dy: 0, align: ['e1', 540], nodes: row0}, {dy: DY, align: ['e2', 540], nodes: row1}]},
    {
      at: TR_T.t2(),
      dur: 1.0,
      nodes: [L('lp1', '(', {delay: 0.5}), L('a1', 'a'), L('m1', '-'), L('b1', 'b'), L('rp1', ')', {delay: 0.5}), L('pl', '+', {delay: 0.4}), L('lp2', '(', {delay: 0.5}), L('b2', 'b'), L('m2', '-'), L('c2', 'c'), L('rp2', ')', {delay: 0.5}), L('e1', '='), L('t1', '3', {color: AM}), L('k', 'k'), L('pl2', '+', {delay: 0.4}), L('t2', '3', {color: AM}), L('l', 'l')],
      into: {e2: 'e1'},
    },
    {at: TR_T.t3(), dur: 0.7, nodes: [L('a1', 'a'), L('m1', '-', red), L('b1', 'b', red), L('pl', '+', red), L('b2', 'b', red), L('m2', '-'), L('c2', 'c'), L('e1', '='), L('t1', '3', {color: AM}), L('k', 'k'), L('pl2', '+'), L('t2', '3', {color: AM}), L('l', 'l')]},
    {at: TR_T.t4(), dur: 0.8, nodes: [L('a1', 'a'), L('m2', '-'), L('c2', 'c'), L('e1', '='), L('t1', '3', {color: AM}), L('k', 'k'), L('pl2', '+'), L('t2', '3', {color: AM}), L('l', 'l')]},
    {at: TR_T.t5(), dur: 0.9, nodes: fin, into: {t2: 't1'}},
    {
      at: TR_T.t6(),
      dur: 0.6,
      nodes: [],
      rows: [
        {dy: 0, nodes: fin},
        {dy: DY, nodes: [L('kl', 'k + l'), L('iz', '\\in \\mathbb{Z}', {pad: 0.12}), L('imp', '\\Rightarrow', {delay: 0.2}), L('res', `a \\textcolor{${CY}}{\\sim} c`, {delay: 0.3, glow: bump(t, T.transOk, 1.0)})]},
      ],
    },
  ];
};

const PartA: React.FC = () => {
  const t = useSec();
  if (t < T.refl || t > T.teilB + 0.8) return null;
  const outAll = hide(t, T.teilB - 0.1, 0.5);
  const rf = reflStates(t);
  const sy = symStates(t);
  const tr = transStates(t);
  const oR = hide(t, T.sym - 0.3, 0.4);
  const oS = hide(t, T.trans - 0.3, 0.4);
  // Ergebnisrahmen
  const bR = rowBounds({at: 0, nodes: rf[1].nodes}, 540, R1.cy, R1.size);
  const bS = rowBounds(sy[6], 540, R1.cy, R1.size, ['nk', 'iz', 'imp', 'res']);
  const bT = rowBounds(tr[6], 540, R1.cy, R1.size - 2, ['kl', 'iz', 'imp', 'res']);
  // Streichung −b und +b
  const strikes: React.ReactNode[] = [];
  if (t > TR_T.strike() - 0.1 && t < TR_T.t4() + 0.5) {
    const so = hide(t, TR_T.t4(), 0.3);
    [
      ['m1', 'b1'],
      ['pl', 'b2'],
    ].forEach(([p, q], i) => {
      const P = atomAt(tr, t, p, 540, R1.cy, R1.size - 2);
      const Q = atomAt(tr, t, q, 540, R1.cy, R1.size - 2);
      if (!P || !Q) return;
      const x0 = P.x - P.w / 2;
      const x1 = Q.x + Q.w / 2;
      strikes.push(<Strike key={i} x={(x0 + x1) / 2} y={P.y} w={(x1 - x0) * 0.85} t={t} at={TR_T.strike() + 0.08 * i} o={so} />);
    });
  }
  return (
    <AbsoluteFill style={{opacity: outAll}}>
      <Morph t={t} states={zuZeigen(t)} cy={ZZ.cy} size={ZZ.size} />
      <AbsoluteFill style={{opacity: oR}}>
        <ResultBox cx={bR.cx} cy={R1.cy} w={bR.w + 80} h={R1.size * 1.75} o={show(t, T.reflOk - 0.05, 0.45)} glow={bump(t, T.reflOk + 0.1, 1.0)} />
        <Morph t={t} states={rf} cy={R1.cy} size={R1.size} />
      </AbsoluteFill>
      <AbsoluteFill style={{opacity: oS}}>
        <ResultBox cx={bS.cx} cy={R1.cy + DY} w={bS.w + 70} h={R1.size * 1.6} o={show(t, T.symOk - 0.05, 0.45)} glow={bump(t, T.symOk + 0.1, 1.0)} />
        <Morph t={t} states={sy} cy={R1.cy} size={R1.size} />
      </AbsoluteFill>
      <ResultBox cx={bT.cx} cy={R1.cy + DY} w={bT.w + 70} h={R1.size * 1.6} o={show(t, T.transOk - 0.05, 0.45)} glow={bump(t, T.transOk + 0.1, 1.0)} />
      <Morph t={t} states={tr} cy={R1.cy} size={R1.size - 2} />
      {strikes}
    </AbsoluteFill>
  );
};

/* ---------- Zusammenfassung ---------- */

const Summary: React.FC = () => {
  const t = useSec();
  const p = springOS(clamp((t - T.summary + 0.05) / 0.6));
  const out = hide(t, T.cta - 0.2, 0.5);
  if (p <= 0 || out <= 0) return null;
  const rows: [string, number][] = [
    ['reflexiv', T.summary + 0.15],
    ['symmetrisch', T.sSym],
    ['transitiv', T.sTrans],
  ];
  const kl = show(t, T.sKl, 0.45);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: clamp(p * 1.4) * out}}>
      <div style={{position: 'absolute', left: 130, top: 660, width: W - 260, height: 620, borderRadius: 28, border: '1.5px solid rgba(255,255,255,.18)', background: 'linear-gradient(180deg, rgba(20,22,52,.95), rgba(10,11,32,.93))', boxShadow: '0 30px 90px rgba(0,0,0,.45)', transform: `scale(${0.96 + 0.04 * p})`}} />
      <div style={{position: 'absolute', left: 190, right: 190, top: 700, height: 70, display: 'flex', alignItems: 'center'}}>
        <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 46, color: C.txt}}>Äquivalenzrelation</span>
        <span style={{marginLeft: 'auto', fontFamily: F.display, fontWeight: 800, fontSize: 46, color: OK, opacity: show(t, T.sTrans + 0.4, 0.4), textShadow: `0 0 ${24 * bump(t, T.sTrans + 0.45, 0.9)}px rgba(123,234,156,.8)`}}>Ja ✓</span>
      </div>
      {rows.map(([name, at], i) => {
        const s = show(t, at, 0.4);
        const g = bump(t, at + 0.1, 0.8);
        return (
          <div key={i} style={{position: 'absolute', left: 240, right: 240, top: 790 + i * 68, height: 56, display: 'flex', alignItems: 'center', opacity: s, transform: `translateY(${(1 - s) * 12}px)`}}>
            <span style={{fontFamily: F.display, fontWeight: 600, fontSize: 38, color: C.txt}}>{name}</span>
            <span style={{marginLeft: 'auto', fontFamily: F.display, fontWeight: 800, fontSize: 38, color: OK, textShadow: g > 0.02 ? `0 0 ${20 * g}px rgba(123,234,156,.8)` : undefined}}>✓</span>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 190, right: 190, top: 1012, height: 1.5, background: 'rgba(255,255,255,.12)', opacity: kl}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1040, textAlign: 'center', fontFamily: F.display, fontWeight: 700, fontSize: 40, color: C.txt, opacity: kl}}>Drei Äquivalenzklassen</div>
      <div style={{position: 'absolute', left: 540, top: 1170, transform: 'translate(-50%, -50%)', opacity: kl, whiteSpace: 'nowrap', textShadow: shadow}}>
        <Tex tex={`${am('[0]')},\\quad \\textcolor{${CY}}{[1]},\\quad \\textcolor{${CLASS_COL[2]}}{[2]}`} size={56} style={{color: C.txt}} />
      </div>
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
  const fl = Math.max(bump(t, T.relation + 0.3, 0.4) * 0.6, bump(t, T.bOk, 0.4) * 0.5);
  return fl > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.08 * fl}} /> : null;
};

/* ---------- Ton ---------- */

const hopTicks = (at: number, n: number, vol: number) => Array.from({length: n}, (_, j) => [at + 0.28 * j + 0.2, 'tick', vol] as [number, string, number]);
const SFX: [number, string, number][] = [
  [0, 'whoosh', 0.4],
  [0.1, 'click', 0.3],
  [T.frage - 0.1, 'whoosh', 0.28],
  [T.aeq0 + 0.1, 'tick', 0.26],
  [T.klassen0 + 0.1, 'tick', 0.26],
  [T.heisst, 'swell', 0.22],
  ...hopTicks(T.vielfach + 0.1, 2, 0.2),
  [T.teilA, 'click', 0.3],
  [T.teilA + 0.1, 'whoosh', 0.22],
  [T.wR + 0.05, 'tick', 0.24],
  [T.wS + 0.05, 'tick', 0.24],
  [T.wT + 0.05, 'tick', 0.24],
  [T.selbst + 0.3, 'whoosh', 0.18],
  [T.aa + 0.35, 'collapse', 0.26],
  [T.null3 + 0.3, 'whoosh', 0.2],
  [T.reflOk, 'lock_hi', 0.36],
  [T.sym, 'click', 0.26],
  ...hopTicks(T.dreiK + 0.1, 2, 0.18),
  [T.mal + 0.1, 'click', 0.24],
  [T.ba + 0.15, 'whoosh', 0.26],
  [T.ba + 1.55, 'whoosh', 0.2],
  [T.symOk, 'lock_hi', 0.36],
  [T.trans, 'click', 0.26],
  ...hopTicks(T.abk + 0.3, 2, 0.16),
  ...hopTicks(T.bcl + 0.3, 3, 0.16),
  [TR_T.t2(), 'whoosh', 0.26],
  [TR_T.strike(), 'collapse', 0.32],
  [TR_T.t4(), 'whoosh', 0.2],
  [TR_T.t5(), 'whoosh', 0.22],
  [T.transOk, 'lock_hi', 0.36],
  [T.relation + 0.3, 'lock_hi', 0.45],
  [T.relation + 0.3, 'accent', 0.3],
  [T.teilB, 'click', 0.3],
  [T.teilB + 0.2, 'swell', 0.22],
  ...hopTicks(T.start + 0.35, 2, 0.2),
  [T.kl0 + 0.15, 'whoosh', 0.22],
  ...hopTicks(T.eins + 0.25, 2, 0.2),
  [T.kl1 + 0.1, 'whoosh', 0.22],
  ...hopTicks(T.zwei + 0.1, 2, 0.2),
  [T.zwei + 1.05, 'whoosh', 0.22],
  [T.schon + 0.2, 'accent', 0.24],
  [T.rest + 0.15, 'rise', 0.2],
  [T.genau + 0.15, 'whoosh', 0.26],
  [T.bOk, 'lock_hi', 0.45],
  [T.bOk, 'accent', 0.3],
  [T.summary, 'click', 0.3],
  [T.sSym, 'tick', 0.26],
  [T.sTrans, 'tick', 0.26],
  [T.sKl, 'accent', 0.3],
  [T.cta - 0.1, 'swell', 0.34],
  ...Array.from({length: 8}, (_, i) => [T.tippt + i * 0.075, 'tick', 0.18] as [number, string, number]),
];

/* ---------- Komposition ---------- */

export type AEQProps = {music: boolean; voice: boolean};

const LEAD = 0.08;
const TAIL = 0.1;

export const VideoAEQ: React.FC<AEQProps> = ({music, voice}) => {
  useTexFonts();
  const ready = useTexReady();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={950} strength={0.85} />
      <NumberLine />
      {ready ? (
        <>
          <PartALine />
          <PartBLine />
          <PartA />
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
                <Audio src={staticFile(VOICE)} trimBefore={sec(c.from - lead)} trimAfter={sec(c.to + TAIL)} />
              </Sequence>
            );
          })
        : null}
    </AbsoluteFill>
  );
};
