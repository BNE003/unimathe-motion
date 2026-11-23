// Klausurvideo „Verkettung von Abbildungen“, Version 2: f(x) = 2x + 3, g(x) = x² auf ℝ.
// Teil a als Rechnung Zeile für Zeile (am Gleichheitszeichen ausgerichtet, ohne Kästen): erst mit −1, dann allgemein,
// jedes Einsetzen und das Ausmultiplizieren „jeder mit jedem“ sichtbar. Teil b und c auf einer Graph-Bühne mit Rechenleiste.
// Karte, Chips und CTA wie im Äquivalenz- und Abbildungen-Video.
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C, MARGIN, W} from '../theme';
import {F, useTexFonts} from '../fonts';
import {bump, clamp, easeInCubic, easeOutExpo, lerp, prog, sec, springOS} from '../math';
import {Backdrop, Grain, Mono, Tex, useSec} from '../ui';
import {CLIPS, MUSIC, SUBTITLES, T, VOICES} from './timeline';
import {Atom, MState, Morph, atomAt, frac, glowShadow, hide, shadow, show, useTexReady} from './kit';
import {AM, CO, CY, FullSvg, Note, OK, ease, rowBounds} from './common';
import {Graph} from './Graph';
import './fn';

const L = (id: string, tex: string, extra: Partial<Atom> = {}): Atom => ({id, tex, ...extra});
// Summand mit Vorzeichen: Abstand wie um ein Rechenzeichen
const O = (id: string, tex: string, extra: Partial<Atom> = {}): Atom => ({id, tex: `{}${tex}`, pad: 0.02, ...extra});
const am = (s: string) => `\\textcolor{${AM}}{${s}}`;
const cy = (s: string) => `\\textcolor{${CY}}{${s}}`;
const co = (s: string) => `\\textcolor{${CO}}{${s}}`;
const FG = `(${am('f')}\\circ ${cy('g')})`;
const GF = `(${cy('g')}\\circ ${am('f')})`;

/* ---------- Aufgabenkarte ---------- */

const BOX_HOOK = {top: 590, h: 545};
const BOX_SMALL = {top: 300, h: 205};
const compactK = (t: number) => ease(t, T.gegeben - 0.15, 0.95);
const cardOut = (t: number) => easeInCubic(clamp((t - (T.cta - 0.2)) / 0.5));
const CARD_HOOK = {cx: 540, cy: 735, size: 54};
const CARD_SMALL = {cx: 540, cy: 412, size: 38};

const cardStates = (t: number): MState[] => {
  const gF = bump(t, T.fVerd + 0.1, 1.2) + bump(t, T.ausM1 + 0.1, 1.2) + bump(t, T.teilC + 0.2, 1.2);
  const gG = bump(t, T.gQuad + 0.1, 1.2) + bump(t, T.quadriert + 0.1, 1.2);
  const fN = L('fN', 'f', {color: AM});
  const gN = L('gN', 'g', {color: CY});
  const fx = L('fx', 'f(x)', {color: AM});
  const gx = L('gx', 'g(x)', {color: CY});
  const ft = L('ft', '2x+3', {color: AM, glow: gF});
  const gt = L('gt', 'x^2', {color: CY, glow: gG});
  const R = (id: string) => L(id, '\\mathbb{R}');
  return [
    {
      at: -1,
      nodes: [],
      rows: [
        {dy: -48, nodes: [fN, L('c1', '\\colon', {pad: 0.12}), R('R1'), L('to1', '\\to'), R('R2'), L('cm1', ',', {pad: 0.4}), fx, L('eq1', '='), ft]},
        {dy: 48, nodes: [gN, L('c2', '\\colon', {pad: 0.12}), R('R3'), L('to2', '\\to'), R('R4'), L('cm2', ',', {pad: 0.4}), gx, L('eq2', '='), gt]},
      ],
    },
    {
      at: T.gegeben - 0.15,
      dur: 0.95,
      nodes: [],
      rows: [
        {dy: -32, nodes: [fN, L('cmA', ',', {pad: 0.14}), gN, L('c1', '\\colon', {pad: 0.12}), R('R1'), L('to1', '\\to'), R('R2')]},
        {dy: 34, nodes: [fx, L('eq1', '='), ft, L('sep', ',', {pad: 0.7}), gx, L('eq2', '='), gt]},
      ],
    },
  ];
};
const cardGeo = (t: number) => {
  const k = compactK(t);
  return {cx: lerp(CARD_HOOK.cx, CARD_SMALL.cx, k), cy: lerp(CARD_HOOK.cy, CARD_SMALL.cy, k), size: lerp(CARD_HOOK.size, CARD_SMALL.size, k)};
};

const TASKS: React.ReactNode[] = [
  <>
    a) Bestimmen Sie <Tex tex={am('f') + '\\circ ' + cy('g')} size={36} style={{color: C.txt}} /> und <Tex tex={cy('g') + '\\circ ' + am('f')} size={36} style={{color: C.txt}} />.
  </>,
  'b) Untersuchen Sie beide Verkettungen auf Injektivität, Surjektivität und Bijektivität.',
  <>
    c) Bestimmen Sie die Umkehrfunktion von <Tex tex={am('f')} size={36} style={{color: C.txt}} />.
  </>,
];
const TASK_TOP = [848, 914, 1030];

const TaskCard: React.FC = () => {
  const t = useSec();
  const appear = springOS(clamp((t + 0.35) / 0.55));
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
        const fly = ease(t, T.gegeben - 0.1 + 0.12 * i, 0.9);
        if (fly >= 1) return null;
        const c = chipCenter(i);
        const x = lerp(MARGIN + 50, c[0] - 130, fly);
        const y = lerp(TASK_TOP[i], c[1] - 20, fly);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 860,
              transform: `scale(${lerp(1, 0.4, fly)})`,
              transformOrigin: 'left top',
              opacity: o * show(t, -0.4 + 0.08 * i, 0.4) * (1 - easeInCubic(fly)),
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

const CHIP_Y = 528;
const CHIP_H = 60;
type Rect = {x: number; w: number};
const THREE_R: Rect[] = [0, 1, 2].map((i) => ({x: MARGIN + i * 318, w: 300}));
const chipCenter = (i: number): [number, number] => [THREE_R[i].x + THREE_R[i].w / 2, CHIP_Y + CHIP_H / 2];

type ChipState = 'idle' | 'active' | 'ok';
const Chip: React.FC<{r: Rect; o: number; st: ChipState; pulse: number; mark: string; label: React.ReactNode}> = ({r, o, st, pulse, mark, label}) => {
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
      <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 26, color: st === 'idle' ? C.txt2 : C.txt}}>{label}</span>
      {st === 'ok' ? <span style={{marginLeft: 'auto', marginRight: 14, fontFamily: F.display, fontWeight: 800, fontSize: 26, color: OK}}>✓</span> : null}
    </div>
  );
};

const Chips: React.FC = () => {
  const t = useSec();
  const out = 1 - cardOut(t);
  if (out <= 0) return null;
  const spec: [string, React.ReactNode, number, number, number[]][] = [
    ['a', <Tex key="a" tex={'f\\circ g,\\ g\\circ f'} size={28} style={{color: 'inherit'}} />, T.teilA, T.aOk, [T.verk + 0.05, T.teilA, T.aOk]],
    ['b', 'inj · surj · bij', T.teilB, T.bOk, [T.eig + 0.05, T.teilB, T.bOk]],
    ['c', <Tex key="c" tex={'f^{-1}'} size={30} style={{color: 'inherit'}} />, T.teilC, T.cOk, [T.inv + 0.05, T.teilC, T.cOk]],
  ];
  return (
    <>
      {spec.map(([mark, label, on, ok, pulses], i) => {
        const p = springOS(clamp((t - (T.gegeben + 0.35 + 0.12 * i)) / 0.6));
        const st: ChipState = t >= ok ? 'ok' : t >= on ? 'active' : 'idle';
        const pulse = Math.max(...pulses.map((at) => bump(t, at, 0.7)));
        return <Chip key={mark} r={THREE_R[i]} o={clamp(p * 1.4) * out} st={st} pulse={pulse} mark={mark} label={label} />;
      })}
    </>
  );
};

/* ---------- Bausteine der Rechnung ---------- */

// doppelte Unterstreichung wie in einer Klausurlösung
const Underline: React.FC<{x0: number; x1: number; y: number; t: number; at: number; o?: number}> = ({x0, x1, y, t, at, o = 1}) => {
  const k = easeOutExpo(clamp((t - at) / 0.5));
  if (k <= 0 || o <= 0.01) return null;
  const w = (x1 - x0) * k;
  return (
    <>
      <div style={{position: 'absolute', left: x0, top: y, width: w, height: 3, borderRadius: 2, background: OK, opacity: o}} />
      <div style={{position: 'absolute', left: x0, top: y + 7, width: w, height: 3, borderRadius: 2, background: OK, opacity: o}} />
    </>
  );
};

const EQ_X = 360; // alle Zeilen am Gleichheitszeichen ausgerichtet
const SZ = 46;
const SZ_N = 40;

// „1.“ und „2.“ unter den Funktionen auf der rechten Seite: erst die innere
const OrderHint: React.FC<{t: number; states: MState[]; cyy: number; inner: string; outer: string; innerCol: string; outerCol: string; on1: number; on2: number; off: number}> = ({t, states, cyy, inner, outer, innerCol, outerCol, on1, on2, off}) => {
  const o1 = show(t, on1, 0.35) * hide(t, off, 0.4);
  if (o1 <= 0.01) return null;
  const o2 = show(t, on2, 0.35) * hide(t, off, 0.4);
  const I = atomAt(states, t, inner, 540, cyy, SZ);
  const Ou = atomAt(states, t, outer, 540, cyy, SZ);
  if (!I || !Ou) return null;
  return (
    <>
      <Note x={I.x} y={cyy + 48} tex={'\\text{1.}'} o={o1} size={30} color={innerCol} glow={bump(t, on1, 0.8)} />
      <Note x={Ou.x - 8} y={cyy + 48} tex={'\\text{2.}'} o={o2} size={30} color={outerCol} glow={bump(t, on2, 0.8)} />
    </>
  );
};

/* ---------- Teil a: f∘g ---------- */

const R1 = 660;
const R2 = 750;
const N1 = 850;
const R4 = 870;
const R5 = 960;
const N2 = 1055;
const E1 = 1160;
const E2 = 1250;
const NEQ = 1352;

const r1States = (t: number): MState[] => {
  const H = [L('L1', `${FG}(x)`), L('e1', '=')];
  const al: [string, number] = ['e1', EQ_X];
  const res = bump(t, T.box1 - 0.3, 1.2);
  return [
    {at: T.teilA + 0.25, align: al, nodes: [...H, L('f2', 'f', {color: AM}), L('p1', '('), L('g2', 'g', {color: CY}), L('gx', '(x)'), L('p2', ')')]},
    {at: T.liefertG + 0.35, align: al, into: {g2: 'X', gx: 'X'}, nodes: [...H, L('f2', 'f', {color: AM}), L('p1', '('), L('X', 'x^2', {color: CY, glow: bump(t, T.liefertG + 0.5, 1.0)}), L('p2', ')')]},
    {
      at: T.zweiX + 0.05,
      dur: 0.75,
      align: al,
      nodes: [...H, L('c2', '2', {color: AM, from: 'f2', glow: res}), L('X', 'x^2', {color: CY, glow: res}), O('pl', '+3', {color: AM, from: 'p2', glow: res})],
    },
  ];
};

const r2States = (t: number): MState[] => {
  const H = [L('L2', `${FG}(-1)`), L('e2', '=')];
  const al: [string, number] = ['e2', EQ_X];
  const aha = bump(t, T.einmal5 + 0.05, 1.4);
  return [
    {at: T.probieren + 0.1, align: al, nodes: [...H, L('F2', 'f', {color: AM}), L('q1', '('), L('G2', `${cy('g')}(-1)`), L('q2', ')')]},
    {at: T.gibtEins + 0.45, align: al, nodes: [...H, L('F2', 'f', {color: AM}), L('q1', '('), L('G2', cy('1'), {glow: bump(t, T.gibtEins + 0.6, 1.0)}), L('q2', ')')]},
    {at: T.gibtFuenf + 0.35, align: al, into: {F2: 'five', q1: 'five', G2: 'five', q2: 'five'}, nodes: [...H, L('five', '5', {color: aha > 0.02 || t > T.einmal5 ? CO : C.txt, glow: bump(t, T.gibtFuenf + 0.5, 1.0) + aha})]},
  ];
};

// Nebenrechnung unter f∘g: g(−1), f(1), g(x), dann die Regel von f mit x² an der Stelle von x
const n1States = (t: number): MState[] => {
  const al = (id: string): [string, number] => [id, EQ_X];
  return [
    {at: T.gQuad + 0.05, align: al('ne'), nodes: [L('nL', `${cy('g')}(-1)`), L('ne', '='), L('nv', '(-1)^2')]},
    {at: T.gibtEins, align: al('ne'), nodes: [L('nL', `${cy('g')}(-1)`), L('ne', '='), L('nv', '1', {color: CY, glow: bump(t, T.gibtEins + 0.1, 1.0)})]},
    {at: T.fVerd + 0.05, align: al('me'), nodes: [L('mL', `${am('f')}(1)`), L('me', '='), L('ma', '2\\cdot 1'), O('mb', '+3')]},
    {at: T.gibtFuenf, align: al('me'), into: {ma: 'm5', mb: 'm5'}, nodes: [L('mL', `${am('f')}(1)`), L('me', '='), L('m5', '5', {glow: bump(t, T.gibtFuenf + 0.1, 1.0)})]},
    {at: T.liefertG - 0.05, align: al('ke'), nodes: [L('kL', `${cy('g')}(x)`), L('ke', '='), L('kv', cy('x^2'))]},
    {at: T.fMacht + 0.05, align: al('je'), nodes: [L('jL', `${am('f')}(x)`), L('je', '='), L('j2', '2'), L('jx', 'x'), O('jp', '+3')]},
    {
      at: T.fMacht + 0.75,
      align: al('je'),
      nodes: [L('jL', `${am('f')}(${cy('x^2')})`, {glow: bump(t, T.fMacht + 0.9, 1.0)}), L('je', '='), L('j2', '2'), L('jx', cy('x^2'), {glow: bump(t, T.fMacht + 0.9, 1.0)}), O('jp', '+3')],
    },
    {at: T.gnachf - 0.25, nodes: []},
  ];
};

/* ---------- Teil a: g∘f ---------- */

const r4States = (t: number): MState[] => {
  const H = [L('L4', `${GF}(x)`), L('e4', '=')];
  const al: [string, number] = ['e4', EQ_X];
  return [
    {at: T.gnachf + 0.25, align: al, nodes: [...H, L('g3', 'g', {color: CY}), L('r1', '('), L('f3', 'f', {color: AM}), L('fx', '(x)'), L('r2', ')')]},
    {at: T.liefertF + 0.35, align: al, into: {f3: 'Y', fx: 'Y'}, nodes: [...H, L('g3', 'g', {color: CY}), L('r1', '('), L('Y', '2x+3', {color: AM, glow: bump(t, T.liefertF + 0.5, 1.0)}), L('r2', ')')]},
    {at: T.gQuadGanze + 0.95, align: al, nodes: [...H, L('r1', '('), L('Y', '2x+3', {color: AM}), L('r2', ')'), L('sq', '{}^{2}', {color: CY, from: 'g3', arc: 40, pad: 0, glow: bump(t, T.gQuadGanze + 1.1, 1.0)})]},
    {at: T.box2 - 0.5, align: al, into: {r1: 'R', Y: 'R', r2: 'R', sq: 'R'}, nodes: [...H, L('R', '4x^2+12x+9', {glow: bump(t, T.box2 - 0.3, 1.2)})]},
  ];
};

const r5States = (t: number): MState[] => {
  const H = [L('L5', `${GF}(-1)`), L('e5', '=')];
  const al: [string, number] = ['e5', EQ_X];
  const aha = bump(t, T.einmal1 + 0.05, 1.4);
  return [
    {at: T.ausM1 + 0.1, align: al, nodes: [...H, L('G5', 'g', {color: CY}), L('s1', '('), L('F5', `${am('f')}(-1)`), L('s2', ')')]},
    {at: T.quadriert - 0.35, align: al, nodes: [...H, L('G5', 'g', {color: CY}), L('s1', '('), L('F5', am('1'), {glow: bump(t, T.quadriert - 0.2, 1.0)}), L('s2', ')')]},
    {at: T.bleibt + 0.45, align: al, into: {G5: 'one', s1: 'one', F5: 'one', s2: 'one'}, nodes: [...H, L('one', '1', {color: aha > 0.02 || t > T.einmal1 ? CO : C.txt, glow: bump(t, T.bleibt + 0.6, 1.0) + aha})]},
  ];
};

const n2States = (t: number): MState[] => {
  const al = (id: string): [string, number] => [id, EQ_X];
  return [
    {at: T.ausM1 + 0.45, align: al('ae'), nodes: [L('aL', `${am('f')}(-1)`), L('ae', '='), L('a1', '2\\cdot(-1)'), O('a2', '+3')]},
    {at: T.m2p3, align: al('ae'), nodes: [L('aL', `${am('f')}(-1)`), L('ae', '='), L('a1', '-2'), O('a2', '+3')]},
    {at: T.quadriert - 0.6, align: al('ae'), into: {a1: 'a3', a2: 'a3'}, nodes: [L('aL', `${am('f')}(-1)`), L('ae', '='), L('a3', am('1'), {glow: bump(t, T.quadriert - 0.5, 1.0)})]},
    {at: T.quadriert + 0.05, align: al('be'), nodes: [L('bL', `${cy('g')}(1)`), L('be', '='), L('b1', '1^2')]},
    {at: T.bleibt + 0.05, align: al('be'), nodes: [L('bL', `${cy('g')}(1)`), L('be', '='), L('b1', '1', {glow: bump(t, T.bleibt + 0.15, 1.0)})]},
    {at: T.allg2 + 0.1, align: al('ce'), nodes: [L('cL', `${am('f')}(x)`), L('ce', '='), L('cv', am('2x+3'))]},
    {at: T.gQuadGanze + 0.05, align: al('de'), nodes: [L('dL', `${cy('g')}(x)`), L('de', '='), L('dv', 'x^2')]},
    {
      at: T.gQuadGanze + 0.65,
      align: al('de'),
      nodes: [L('dL', `${cy('g')}(${am('2x+3')})`, {glow: bump(t, T.gQuadGanze + 0.8, 1.0)}), L('de', '='), L('dv', `(${am('2x+3')})^2`, {glow: bump(t, T.gQuadGanze + 0.8, 1.0)})],
    },
  ];
};

// Ausmultiplizieren: (2x+3)·(2x+3), jeder mit jedem
const E1_SZ = 42;
const e1States = (): MState[] => [
  {
    at: T.jeder - 0.6,
    align: ['ee', EQ_X],
    nodes: [
      L('eL', `(${am('2x+3')})^2`),
      L('ee', '='),
      L('pa', '('),
      L('a1', '2x'),
      O('ap', '+3'),
      L('pb', ')'),
      L('dt', '\\cdot'),
      L('pc', '('),
      L('b1', '2x'),
      O('bp', '+3'),
      L('pd', ')'),
    ],
  },
];
// die vier Produkte, je mit Zeitpunkt, Farbe und Ziel-Term in E2
const PRODS: [string, string, number, string][] = [
  ['a1', 'b1', 0.05, '#C9A8FF'],
  ['a1', 'bp', 0.45, '#8FD3FF'],
  ['ap', 'b1', 0.85, '#8FD3FF'],
  ['ap', 'bp', 1.25, '#FFB3A0'],
];
const e2States = (t: number): MState[] => {
  const al: [string, number] = ['e2e', EQ_X];
  const g = (k: number) => bump(t, T.jeder + PRODS[k][2] + 0.25, 0.9);
  const t1 = L('t1', '4x^2', {glow: g(0)});
  return [
    {at: T.jeder + PRODS[0][2] + 0.2, align: al, nodes: [L('e2e', '='), t1]},
    {at: T.jeder + PRODS[1][2] + 0.2, align: al, nodes: [L('e2e', '='), t1, O('t2', '+6x', {glow: g(1)})]},
    {at: T.jeder + PRODS[2][2] + 0.2, align: al, nodes: [L('e2e', '='), t1, O('t2', '+6x'), O('t3', '+6x', {glow: g(2)})]},
    {at: T.jeder + PRODS[3][2] + 0.2, align: al, nodes: [L('e2e', '='), t1, O('t2', '+6x'), O('t3', '+6x'), O('t4', '+9', {glow: g(3)})]},
    {at: T.vier + 0.75, align: al, into: {t2: 't23', t3: 't23'}, nodes: [L('e2e', '='), L('t1', '4x^2'), O('t23', '+12x', {glow: bump(t, T.vier + 1.0, 1.0)}), O('t4', '+9')]},
  ];
};

const Products: React.FC<{t: number}> = ({t}) => {
  const S = e1States();
  const items: React.ReactNode[] = [];
  PRODS.forEach(([a, b, d, col], i) => {
    const at = T.jeder + d;
    const k = easeOutExpo(clamp((t - at) / 0.4));
    const o = (k > 0 ? 1 : 0) * hide(t, T.vier + 0.7, 0.5);
    if (o <= 0.01) return;
    const pa = atomAt(S, t, a, 540, E1, E1_SZ);
    const pb = atomAt(S, t, b, 540, E1, E1_SZ);
    if (!pa || !pb) return;
    const y = E1 - 30;
    const h = 18 + 7 * i;
    const N = 24;
    const pts: string[] = [];
    for (let s = 0; s <= N * k; s++) {
      const u = s / N;
      const x = (1 - u) * (1 - u) * pa.x + 2 * (1 - u) * u * ((pa.x + pb.x) / 2) + u * u * pb.x;
      const yy = (1 - u) * (1 - u) * y + 2 * (1 - u) * u * (y - 2 * h) + u * u * y;
      pts.push(`${x.toFixed(1)},${yy.toFixed(1)}`);
    }
    items.push(<polyline key={i} points={pts.join(' ')} fill="none" stroke={col} strokeWidth={3} strokeLinecap="round" opacity={o} />);
  });
  return <FullSvg>{items}</FullSvg>;
};

const PartA: React.FC = () => {
  const t = useSec();
  const out = hide(t, T.toGraph, 0.5);
  if (t < T.teilA || out <= 0.01) return null;
  const A1 = r1States(t);
  const A2 = r2States(t);
  const B1 = n1States(t);
  const A4 = r4States(t);
  const A5 = r5States(t);
  const B2 = n2States(t);
  const C1 = e1States();
  const C2 = e2States(t);
  const u1 = rowBounds(A1[2], 540, R1, SZ, ['c2', 'X', 'pl']);
  const u4 = rowBounds(A4[3], 540, R4, SZ, ['R']);
  const n2o = hide(t, T.jeder - 0.75, 0.35);
  const eo = hide(t, T.einmal5 - 0.1, 0.4);
  const neq = show(t, T.reihenfolge + 0.05, 0.45);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: out}}>
      <Morph t={t} states={A1} cy={R1} size={SZ} />
      <Underline x0={u1.cx - u1.w / 2 - 6} x1={u1.cx + u1.w / 2 + 6} y={R1 + 32} t={t} at={T.box1 - 0.3} />
      <OrderHint t={t} states={A1} cyy={R1} inner="g2" outer="f2" innerCol={CY} outerCol={AM} on1={T.erstG} on2={T.dannF} off={T.probieren} />
      <Morph t={t} states={A2} cy={R2} size={SZ} />
      <Morph t={t} states={B1} cy={N1} size={SZ_N} />
      <Morph t={t} states={A4} cy={R4} size={SZ} />
      <Underline x0={u4.cx - u4.w / 2 - 6} x1={u4.cx + u4.w / 2 + 6} y={R4 + 32} t={t} at={T.box2 - 0.3} />
      <OrderHint t={t} states={A4} cyy={R4} inner="f3" outer="g3" innerCol={AM} outerCol={CY} on1={T.erstF} on2={T.dannG} off={T.ausM1} />
      <Morph t={t} states={A5} cy={R5} size={SZ} />
      <Morph t={t} states={B2} cy={N2} size={SZ_N} o={n2o} />
      <Morph t={t} states={C1} cy={E1} size={E1_SZ} o={eo} />
      <Products t={t} />
      <Morph t={t} states={C2} cy={E2} size={E1_SZ} o={eo} />
      <Note x={540} y={N2 - 8} tex={'\\text{jeder mit jedem}'} o={show(t, T.jeder - 0.2, 0.4) * hide(t, T.vier + 0.9, 0.4)} size={30} />
      {neq > 0.01 ? (
        <div style={{position: 'absolute', left: 540, top: NEQ, transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * neq})`, opacity: neq, whiteSpace: 'nowrap', textShadow: shadow}}>
          <Tex tex={`${am('f')}\\circ ${cy('g')} \\;${co('\\neq')}\\; ${cy('g')}\\circ ${am('f')}`} size={60} style={{color: C.txt}} />
        </div>
      ) : null}
    </div>
  );
};

/* ---------- Teil b und c: Rechenleiste über dem Graphen ---------- */

const PA = {cy: 662, size: 40};
const PB = {cy: 748, size: 42};

const paStates = (t: number): MState[] => [
  {at: -1, nodes: []},
  {at: T.teilB + 0.1, nodes: [L('A1', `${FG}(x)`), L('Ae', '='), L('Av', '2x^2+3')]},
  {at: T.b2 + 0.1, nodes: [L('A2', `${GF}(x)`), L('Ae2', '='), L('Av2', `(${am('2x+3')})^2`)]},
  {at: T.teilC + 0.1, nodes: [L('A3', `${am('f')}(x)`), L('Ae3', '='), L('Av3', '2x+3')]},
  {at: T.sum - 0.1, nodes: []},
];

const pbStates = (t: number): MState[] => {
  const hi = (at: number) => bump(t, at, 1.0);
  return [
    {at: -1, nodes: []},
    // f∘g: zwei Stellen, ein Wert
    {at: T.b1 + 0.3, nodes: [L('u1', `${FG}(1)`), L('ue', '='), L('uv', '2\\cdot 1^2'), O('up', '+3')]},
    {at: T.b1 + 1.4, into: {uv: 'u5', up: 'u5'}, nodes: [L('u1', `${FG}(1)`), L('ue', '='), L('u5', '5', {color: CO, glow: hi(T.b1 + 1.5)})]},
    {at: T.b1fuenf + 0.1, nodes: [L('u0', `${FG}(-1)`), L('ue0', '='), L('u1', `${FG}(1)`), L('ue', '='), L('u5', '5', {color: CO})]},
    // nichts unter 3
    {at: T.b1weil + 0.15, nodes: [L('w1', 'x^2', {glow: hi(T.b1weil + 0.3)}), L('wg', '\\ge'), L('w0', '0')]},
    {at: T.b1unter - 0.35, nodes: [L('w1', '2x^2+3'), L('wg', '\\ge'), L('w0', '3', {color: CO, glow: hi(T.b1unter - 0.2)})]},
    // g∘f
    {at: T.b2 + 0.1, nodes: []},
    {at: T.b2pts - 0.3, nodes: [L('v1', `${GF}(-2)`), L('ve', '='), L('vv', '(2\\cdot(-2)+3)^2')]},
    {at: T.b2pts + 0.9, nodes: [L('v1', `${GF}(-2)`), L('ve', '='), L('vv', '(-1)^2')]},
    {at: T.b2pts + 1.5, into: {vv: 'v5'}, nodes: [L('v1', `${GF}(-2)`), L('ve', '='), L('v5', '1', {color: CO, glow: hi(T.b2pts + 1.6)})]},
    {at: T.b2eins + 0.1, nodes: [L('v0', `${GF}(-1)`), L('ve0', '='), L('v1', `${GF}(-2)`), L('ve', '='), L('v5', '1', {color: CO})]},
    {at: T.b2quad + 0.05, nodes: [L('q1', '(2x+3)^2', {glow: hi(T.b2quad + 0.2)}), L('qg', '\\ge'), L('q0', '0', {color: CO})]},
    {at: T.keine + 0.1, nodes: [L('kk', '\\text{keine von beiden ist bijektiv}', {color: CO})]},
    {at: T.teilC, nodes: []},
    // Teil c: nach x auflösen
    {at: T.loesen + 0.1, nodes: [L('y', 'y'), L('ce', '='), L('c2', '2x'), O('cp', '+3')]},
    {at: T.minus3 + 0.15, into: {cp: 'cm'}, nodes: [L('y', 'y'), O('cm', '-3', {color: AM, glow: hi(T.minus3 + 0.3)}), L('ce', '='), L('c2', '2x')]},
    {
      at: T.durch2 + 0.15,
      nodes: [frac('fr', [L('y', 'y'), O('cm', '-3')], [L('d2', '2', {color: AM, from: 'c2', glow: hi(T.durch2 + 0.3)})]), L('ce', '='), L('xx', 'x', {from: 'c2'})],
    },
    {
      at: T.soIst + 0.25,
      dur: 0.9,
      into: {xx: 'fi'},
      nodes: [L('fi', 'f^{-1}(x)', {color: AM}), L('ce', '='), frac('fr', [L('y', 'x', {glow: hi(T.soIst + 0.6)}), O('cm', '-3')], [L('d2', '2')])],
    },
    {at: T.sum - 0.1, nodes: []},
  ];
};

const Panel: React.FC = () => {
  const t = useSec();
  const o = show(t, T.toGraph + 0.1, 0.4) * hide(t, T.sum - 0.15, 0.4);
  if (o <= 0.01) return null;
  const A = paStates(t);
  const B = pbStates(t);
  const fin = B[B.length - 2];
  const ub = rowBounds(fin, 540, PB.cy, PB.size);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{position: 'absolute', left: 60, top: 612, width: W - 120, height: 182, borderRadius: 22, background: 'rgba(9,10,30,.86)', border: '1.5px solid rgba(255,255,255,.1)'}} />
      <Morph t={t} states={A} cy={PA.cy} size={PA.size} />
      <Morph t={t} states={B} cy={PB.cy} size={PB.size} />
      <Underline x0={ub.cx - ub.w / 2 - 6} x1={ub.cx + ub.w / 2 + 6} y={PB.cy + 44} t={t} at={T.cOk - 0.2} o={hide(t, T.sum - 0.15, 0.3)} />
      <Note x={880} y={PB.cy} tex={'\\,|\\,-3'} o={show(t, T.minus3 + 0.05, 0.3) * hide(t, T.durch2 + 0.1, 0.3)} size={34} color={AM} />
      <Note x={880} y={PB.cy} tex={'\\,|\\,:2'} o={show(t, T.durch2 + 0.1, 0.3) * hide(t, T.soIst + 0.2, 0.3)} size={34} color={AM} />
    </div>
  );
};

/* ---------- Zusammenfassung ---------- */

const Summary: React.FC = () => {
  const t = useSec();
  const p = springOS(clamp((t - T.sum + 0.05) / 0.6));
  const out = hide(t, T.cta - 0.2, 0.5);
  if (p <= 0 || out <= 0) return null;
  const line = (y: number, o: number, tex: string, size: number) =>
    o > 0.01 ? (
      <div style={{position: 'absolute', left: 540, top: y, transform: `translate(-50%, -50%) translateY(${(1 - o) * 12}px)`, opacity: o, whiteSpace: 'nowrap', textShadow: shadow}}>
        <Tex tex={tex} size={size} style={{color: C.txt}} />
      </div>
    ) : null;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: clamp(p * 1.4) * out}}>
      <div style={{position: 'absolute', left: 110, top: 660, width: W - 220, height: 500, borderRadius: 28, border: '1.5px solid rgba(255,255,255,.18)', background: 'linear-gradient(180deg, rgba(20,22,52,.95), rgba(10,11,32,.93))', boxShadow: '0 30px 90px rgba(0,0,0,.45)', transform: `scale(${0.96 + 0.04 * p})`}} />
      {line(735, show(t, T.sum + 0.1, 0.4), `${FG}(x) = 2x^2+3`, 44)}
      {line(815, show(t, T.sum + 0.2, 0.4), `${GF}(x) = 4x^2+12x+9`, 44)}
      {line(905, show(t, T.sum + 0.3, 0.4), `\\text{beide weder injektiv noch surjektiv}`, 36)}
      {line(1035, show(t, T.sum + 0.4, 0.4), `${am('f^{-1}')}(x) = \\dfrac{x-3}{2}`, 50)}
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
  const fl = Math.max(bump(t, T.reihenfolge + 0.05, 0.4) * 0.5, bump(t, T.bOk, 0.4) * 0.4, bump(t, T.cOk, 0.4) * 0.5);
  return fl > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.07 * fl}} /> : null;
};

/* ---------- Ton ---------- */

const SFX: [number, string, number][] = [
  [0, 'whoosh', 0.4],
  [0.1, 'click', 0.3],
  [T.gegeben - 0.1, 'whoosh', 0.28],
  [T.verk + 0.05, 'tick', 0.24],
  [T.eig + 0.05, 'tick', 0.24],
  [T.inv + 0.05, 'tick', 0.24],
  [T.teilA, 'click', 0.3],
  [T.erstG + 0.05, 'tick', 0.24],
  [T.dannF + 0.05, 'tick', 0.24],
  [T.gibtEins, 'collapse', 0.2],
  [T.gibtEins + 0.45, 'whoosh', 0.18],
  [T.gibtFuenf, 'collapse', 0.2],
  [T.gibtFuenf + 0.35, 'whoosh', 0.18],
  [T.liefertG + 0.35, 'whoosh', 0.2],
  [T.fMacht + 0.75, 'whoosh', 0.2],
  [T.zweiX + 0.05, 'whoosh', 0.22],
  [T.box1 - 0.3, 'lock_hi', 0.3],
  [T.gnachf, 'click', 0.26],
  [T.erstF + 0.05, 'tick', 0.24],
  [T.dannG + 0.05, 'tick', 0.24],
  [T.m2p3, 'whoosh', 0.18],
  [T.quadriert - 0.6, 'collapse', 0.2],
  [T.bleibt + 0.45, 'whoosh', 0.18],
  [T.liefertF + 0.35, 'whoosh', 0.2],
  [T.gQuadGanze + 0.65, 'whoosh', 0.2],
  [T.gQuadGanze + 0.95, 'whoosh', 0.2],
  ...PRODS.map(([, , d]) => [T.jeder + d + 0.2, 'tick', 0.24] as [number, string, number]),
  [T.vier + 0.75, 'collapse', 0.22],
  [T.box2 - 0.3, 'lock_hi', 0.3],
  [T.einmal5 + 0.05, 'accent', 0.22],
  [T.einmal1 + 0.05, 'accent', 0.22],
  [T.reihenfolge + 0.05, 'lock_hi', 0.4],
  [T.toGraph + 0.2, 'swell', 0.22],
  [T.teilB, 'click', 0.3],
  [T.b1 + 1.4, 'collapse', 0.2],
  [T.b1fuenf, 'whoosh', 0.2],
  [T.b1inj + 0.1, 'accent', 0.22],
  [T.b1unter - 0.3, 'whoosh', 0.2],
  [T.b1sur + 0.1, 'accent', 0.22],
  [T.b2 - 0.1, 'swell', 0.2],
  [T.b2pts + 1.5, 'collapse', 0.2],
  [T.b2eins, 'whoosh', 0.2],
  [T.b2quad, 'whoosh', 0.2],
  [T.b2weder + 0.1, 'accent', 0.22],
  [T.bOk, 'lock_hi', 0.38],
  [T.teilC, 'click', 0.3],
  [T.gerade + 0.05, 'whoosh', 0.22],
  [T.gerade + 1.55, 'tick', 0.24],
  [T.trifft + 0.05, 'rise', 0.2],
  [T.minus3 + 0.15, 'whoosh', 0.22],
  [T.durch2 + 0.15, 'whoosh', 0.22],
  [T.soIst + 0.3, 'whoosh', 0.22],
  [T.cOk, 'lock_hi', 0.45],
  [T.cOk, 'accent', 0.3],
  [T.sum, 'click', 0.3],
  [T.cta - 0.1, 'swell', 0.34],
  ...Array.from({length: 8}, (_, i) => [T.tippt + i * 0.075, 'tick', 0.18] as [number, string, number]),
];

/* ---------- Komposition ---------- */

export type VKProps = {music: boolean; voice: boolean};

const LEAD = 0.08;
const TAIL = 0.1;

export const VideoVK: React.FC<VKProps> = ({music, voice}) => {
  useTexFonts();
  const ready = useTexReady();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={950} strength={0.85} />
      {ready ? (
        <>
          <Graph />
          <PartA />
          <Panel />
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
