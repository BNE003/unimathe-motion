// Klausurvideo „Verkettung von Abbildungen“: f(x) = 2x + 3, g(x) = x² auf ℝ.
// a) f∘g und g∘f (Maschinen mit −1, Formel-Morphs, ≠, Graph-Verformung), b) injektiv/surjektiv/bijektiv, c) f⁻¹.
// Karte, Chips, Zusammenfassung und CTA nach src/aeq/Video.tsx (Branch video/aequivalenzrelation-klausur).
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C, MARGIN, W} from '../theme';
import {F, useTexFonts} from '../fonts';
import {bump, clamp, easeInCubic, easeOutExpo, lerp, prog, sec, springOS} from '../math';
import {Backdrop, Grain, Mono, Tex, useSec} from '../ui';
import {CLIPS, MUSIC, SUBTITLES, T, VOICE} from './timeline';
import {Atom, MState, Morph, atomAt, frac, glowShadow, hide, shadow, show, useTexReady} from './kit';
import {AM, CO, CY, FullSvg, Note, OK, ResultBox, ease, rowBounds} from './common';
import {Graph} from './Graph';
import {MachineC, MachinesA} from './Machines';
import './fn';

const L = (id: string, tex: string, extra: Partial<Atom> = {}): Atom => ({id, tex, ...extra});
const am = (s: string) => `\\textcolor{${AM}}{${s}}`;
const cy = (s: string) => `\\textcolor{${CY}}{${s}}`;
const co = (s: string) => `\\textcolor{${CO}}{${s}}`;

/* ---------- Aufgabenkarte ---------- */

const BOX_HOOK = {top: 590, h: 545};
const BOX_SMALL = {top: 300, h: 205};
const compactK = (t: number) => ease(t, T.gegeben - 0.15, 0.95);
const cardOut = (t: number) => easeInCubic(clamp((t - (T.cta - 0.2)) / 0.5));
const CARD_HOOK = {cx: 540, cy: 735, size: 54};
const CARD_SMALL = {cx: 540, cy: 412, size: 38};

const cardStates = (t: number): MState[] => {
  const gF = bump(t, T.gibt + 0.1, 1.2) + bump(t, T.rechnet + 0.1, 1.2);
  const gG = bump(t, T.xq + 0.1, 1.2);
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

/* ---------- Teil a: Formelzeilen ---------- */

const SZ = 48;
const EQ_X = 400;
const FA = 690;
const FB = 1020;

const lhs = (outer: 'f' | 'g', t: number, g1: number, g2: number): Atom[] => {
  const inner = outer === 'f' ? 'g' : 'f';
  const col = (n: string) => (n === 'f' ? AM : CY);
  const p = outer === 'f' ? '' : '2';
  return [
    L('lp' + p, '('),
    L('O' + p, outer, {color: col(outer), glow: g2}),
    L('o' + p, '\\circ', {pad: 0.08}),
    L('I' + p, inner, {color: col(inner), glow: g1}),
    L('rp' + p, ')(x)'),
    L('eq' + p, '='),
  ];
};

const rowA = (t: number): MState[] => {
  const g1 = bump(t, T.erstG + 0.05, 0.9);
  const g2 = bump(t, T.dannF + 0.05, 0.9);
  const res = bump(t, T.ergebnis + 0.05, 1.2);
  const H = lhs('f', t, g1, g2);
  return [
    {at: T.teilA + 0.25, align: ['eq', EQ_X], nodes: [...H, L('f2', 'f', {color: AM}), L('p1', '('), L('g2', 'g', {color: CY}), L('gx', '(x)'), L('p2', ')')]},
    {at: T.xq + 0.15, align: ['eq', EQ_X], into: {g2: 'X', gx: 'X'}, nodes: [...H, L('f2', 'f', {color: AM}), L('p1', '('), L('X', 'x^2', {color: CY, glow: bump(t, T.xq + 0.3, 1.0)}), L('p2', ')')]},
    {
      at: T.gibt + 0.1,
      dur: 0.75,
      align: ['eq', EQ_X],
      nodes: [...H, L('c2', '2', {color: AM, from: 'f2', glow: res}), L('X', 'x^2', {color: C.txt, glow: res}), L('pl', '+', {from: 'p2', glow: res}), L('c3', '3', {color: AM, from: 'p2', glow: res})],
    },
  ];
};

const rowB = (t: number): MState[] => {
  const g1 = bump(t, T.erstF + 0.05, 0.9);
  const g2 = bump(t, T.dannG + 0.05, 0.9);
  const res = bump(t, T.ergebnis + 0.05, 1.2);
  const H = lhs('g', t, g1, g2);
  const head = [...H];
  return [
    {at: T.gnachf + 0.25, align: ['eq2', EQ_X], nodes: [...head, L('g3', 'g', {color: CY}), L('q1', '('), L('f3', 'f', {color: AM}), L('fx2', '(x)'), L('q2', ')')]},
    {at: T.allg2 + 0.6, align: ['eq2', EQ_X], into: {f3: 'Y', fx2: 'Y'}, nodes: [...head, L('g3', 'g', {color: CY}), L('q1', '('), L('Y', '2x+3', {color: AM, glow: bump(t, T.allg2 + 0.8, 1.0)}), L('q2', ')')]},
    {at: T.allg2 + 1.9, align: ['eq2', EQ_X], nodes: [...head, L('q1', '('), L('Y', '2x+3', {color: AM}), L('q2', ')'), L('sq', '{}^{2}', {color: CY, from: 'g3', arc: 50, pad: 0, glow: bump(t, T.allg2 + 2.2, 1.0)})]},
    {
      at: T.allg2 + 2.95,
      dur: 0.7,
      align: ['eq2', EQ_X],
      into: {q1: 'B1', q2: 'B3', sq: 'B3', Y: 'B2'},
      nodes: [...head, L('B1', `(${am('2x')})^2`), L('pa', '+'), L('B2', `2\\cdot ${am('2x')}\\cdot ${am('3')}`), L('pb', '+'), L('B3', `${am('3')}^2`)],
    },
    {
      at: T.vier + 0.05,
      dur: 0.6,
      align: ['eq2', EQ_X],
      nodes: [...head, L('B1', '4x^2', {glow: res}), L('pa', '+', {glow: res}), L('B2', '12x', {glow: res}), L('pb', '+', {glow: res}), L('B3', '9', {glow: res})],
    },
  ];
};

// „1.“ und „2.“ unter der linken Seite, Pfeil von rechts nach links: erst die innere Funktion
const OrderHint: React.FC<{t: number; states: MState[]; cyy: number; p: string; on1: number; on2: number; off: number}> = ({t, states, cyy, p, on1, on2, off}) => {
  const o1 = show(t, on1, 0.35) * hide(t, off, 0.4);
  if (o1 <= 0.01) return null;
  const o2 = show(t, on2, 0.35) * hide(t, off, 0.4);
  const I = atomAt(states, t, 'I' + p, 540, cyy, SZ);
  const O = atomAt(states, t, 'O' + p, 540, cyy, SZ);
  if (!I || !O) return null;
  const inner = p === '' ? CY : AM;
  const outer = p === '' ? AM : CY;
  const k = easeOutExpo(clamp((t - on2) / 0.5));
  const y = cyy + 98;
  return (
    <>
      <Note x={I.x} y={cyy + 60} tex={'1.'} o={o1} size={34} color={inner} glow={bump(t, on1, 0.8)} />
      <Note x={O.x} y={cyy + 60} tex={'2.'} o={o2} size={34} color={outer} glow={bump(t, on2, 0.8)} />
      <FullSvg o={o2}>
        <path d={`M ${I.x + 6} ${y - 12} Q ${(I.x + O.x) / 2} ${y + 22} ${lerp(I.x + 6, O.x - 4, k)} ${y - 12 + 0 * k}`} fill="none" stroke={C.txt} strokeWidth={3} opacity={0.8} />
        {k > 0.85 ? <polygon points={`${O.x - 8},${y - 22} ${O.x - 10},${y - 6} ${O.x + 6},${y - 12}`} fill={C.txt} opacity={0.8} /> : null}
      </FullSvg>
    </>
  );
};

const FormulasA: React.FC = () => {
  const t = useSec();
  const out = hide(t, T.toGraph, 0.5);
  if (t < T.teilA || out <= 0.01) return null;
  const A1 = rowA(t);
  const B1 = rowB(t);
  const bx1 = rowBounds(A1[2], 540, FA, SZ, ['c2', 'X', 'pl', 'c3']);
  const bx2 = rowBounds(B1[4], 540, FB, SZ, ['B1', 'pa', 'B2', 'pb', 'B3']);
  const neq = show(t, T.ergebnis, 0.45);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: out}}>
      <ResultBox cx={bx1.cx + 6} cy={FA} w={bx1.w + 30} h={84} o={show(t, T.box1 - 0.35, 0.4)} glow={bump(t, T.box1 - 0.3, 1.0)} check={false} />
      <ResultBox cx={bx2.cx + 6} cy={FB} w={bx2.w + 30} h={84} o={show(t, T.box2 - 0.35, 0.4)} glow={bump(t, T.box2 - 0.3, 1.0)} check={false} />
      <Morph t={t} states={A1} cy={FA} size={SZ} />
      <Morph t={t} states={B1} cy={FB} size={SZ} />
      <OrderHint t={t} states={A1} cyy={FA} p="" on1={T.erstG} on2={T.dannF} off={T.xq} />
      <OrderHint t={t} states={B1} cyy={FB} p="2" on1={T.erstF} on2={T.dannG} off={T.allg2 + 0.3} />
      <Note y={FB + 64} tex={'(a+b)^2 = a^2 + 2ab + b^2'} o={show(t, T.allg2 + 2.95, 0.4) * hide(t, T.vier + 1.4, 0.4)} size={30} />
      {neq > 0.01 ? (
        <div style={{position: 'absolute', left: 540, top: 1352, transform: `translate(-50%, -50%) scale(${0.85 + 0.15 * neq})`, opacity: neq, whiteSpace: 'nowrap', textShadow: glowShadow(bump(t, T.ergebnis + 0.1, 1.4), CO)}}>
          <Tex tex={`${am('f')}\\circ ${cy('g')} \\;${co('\\neq')}\\; ${cy('g')}\\circ ${am('f')}`} size={66} style={{color: C.txt}} />
        </div>
      ) : null}
    </div>
  );
};

/* ---------- Teil b: Tabelle ---------- */

const Table: React.FC = () => {
  const t = useSec();
  const p = springOS(clamp((t - T.keine) / 0.6));
  const out = hide(t, T.teilC, 0.45);
  if (p <= 0 || out <= 0.01) return null;
  const rows = ['injektiv', 'surjektiv', 'bijektiv'];
  const colX = [640, 820];
  return (
    <div style={{position: 'absolute', inset: 0, opacity: clamp(p * 1.4) * out}}>
      <div style={{position: 'absolute', left: 150, top: 720, width: W - 300, height: 430, borderRadius: 26, border: '1.5px solid rgba(255,255,255,.18)', background: 'linear-gradient(180deg, rgba(20,22,52,.96), rgba(10,11,32,.94))', boxShadow: '0 30px 90px rgba(0,0,0,.45)', transform: `scale(${0.96 + 0.04 * p})`}} />
      {[`${am('f')}\\circ ${cy('g')}`, `${cy('g')}\\circ ${am('f')}`].map((tex, i) => (
        <Note key={i} x={colX[i]} y={790} tex={tex} o={1} size={42} color={C.txt} />
      ))}
      <div style={{position: 'absolute', left: 200, right: 200, top: 832, height: 1.5, background: 'rgba(255,255,255,.14)'}} />
      {rows.map((name, r) => {
        const at = T.keine + 0.15 + 0.22 * r + (r === 2 ? 0.45 : 0);
        const s = show(t, at, 0.35);
        const y = 885 + r * 78;
        return (
          <React.Fragment key={r}>
            <div style={{position: 'absolute', left: 210, top: y, transform: 'translateY(-50%)', fontFamily: F.display, fontWeight: 600, fontSize: 38, color: C.txt, opacity: s}}>{name}</div>
            {colX.map((x, c) => (
              <div key={c} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${0.8 + 0.2 * s})`, fontFamily: F.display, fontWeight: 800, fontSize: 36, color: CO, opacity: show(t, at + 0.1 + 0.08 * c, 0.3), textShadow: glowShadow(bump(t, at + 0.15, 0.8), CO)}}>
                Nein
              </div>
            ))}
          </React.Fragment>
        );
      })}
      <Note y={1102} tex={'\\text{Bild} \\neq \\text{Zielmenge } \\mathbb{R}'} o={show(t, T.keine + 1.1, 0.4)} size={32} />
    </div>
  );
};

/* ---------- Teil c: Umstellen ---------- */

const FC = {cy: 1075, size: 56};

const rowC = (t: number): MState[] => {
  const y = (tex = 'y', glow = 0) => L('y', tex, {glow});
  return [
    {at: T.rueck + 0.1, nodes: [y(), L('eq', '='), L('c2', '2', {color: AM}), L('x', 'x'), L('pl', '+'), L('c3', '3', {color: AM})]},
    {at: T.minus3 + 0.2, into: {pl: 'mi'}, nodes: [y(), L('mi', '-', {color: AM}), L('c3', '3', {color: AM, arc: 60}), L('eq', '='), L('c2', '2', {color: AM}), L('x', 'x')]},
    {at: T.durch2 + 0.25, nodes: [frac('fr', [y(), L('mi', '-', {color: AM}), L('c3', '3', {color: AM})], [L('c2', '2', {color: AM, arc: -50})]), L('eq', '='), L('x', 'x')]},
    {at: T.umgestellt + 0.15, nodes: [L('x', 'x', {arc: 120}), L('eq', '='), frac('fr', [y(), L('mi', '-'), L('c3', '3')], [L('c2', '2')])]},
    {
      at: T.finv + 0.25,
      dur: 0.7,
      into: {x: 'fi'},
      nodes: [L('fi', 'f^{-1}(x)', {color: AM}), L('eq', '='), frac('fr', [y('x', bump(t, T.finv + 0.5, 1.0)), L('mi', '-'), L('c3', '3')], [L('c2', '2')])],
    },
  ];
};

const AlgebraC: React.FC = () => {
  const t = useSec();
  const o = hide(t, T.summary - 0.1, 0.5);
  if (t < T.rueck || o <= 0.01) return null;
  const S = rowC(t);
  const bx = rowBounds(S[4], 540, FC.cy, FC.size);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <ResultBox cx={bx.cx} cy={FC.cy + 8} w={bx.w + 60} h={150} o={show(t, T.cOk - 0.25, 0.4)} glow={bump(t, T.cOk - 0.2, 1.0)} />
      <Morph t={t} states={S} cy={FC.cy} size={FC.size} />
      <Note x={850} y={FC.cy} tex={'\\,|\\,-3'} o={show(t, T.minus3 + 0.05, 0.3) * hide(t, T.durch2 + 0.15, 0.3)} size={36} color={AM} />
      <Note x={850} y={FC.cy} tex={'\\,|\\,:2'} o={show(t, T.durch2 + 0.15, 0.3) * hide(t, T.umgestellt + 0.1, 0.3)} size={36} color={AM} />
      <Note y={FC.cy + 150} tex={'\\text{für jedes } y \\text{ genau ein } x'} o={show(t, T.umgestellt + 0.4, 0.4) * hide(t, T.cOk + 1.2, 0.4)} size={32} />
    </div>
  );
};

/* ---------- Zusammenfassung ---------- */

const Summary: React.FC = () => {
  const t = useSec();
  const p = springOS(clamp((t - T.summary + 0.05) / 0.6));
  const out = hide(t, T.cta - 0.2, 0.5);
  if (p <= 0 || out <= 0) return null;
  const s1 = show(t, T.summary + 0.15, 0.4);
  const s2 = show(t, T.summary + 0.35, 0.4);
  const s3 = show(t, T.summary + 0.6, 0.4);
  const s4 = show(t, T.sKeine, 0.4);
  const s5 = show(t, T.sUmk, 0.4);
  const line = (y: number, o: number, tex: string, size: number, glow = 0, col = C.txt) =>
    o > 0.01 ? (
      <div style={{position: 'absolute', left: 540, top: y, transform: `translate(-50%, -50%) translateY(${(1 - o) * 12}px)`, opacity: o, whiteSpace: 'nowrap', textShadow: glowShadow(glow, col)}}>
        <Tex tex={tex} size={size} style={{color: C.txt}} />
      </div>
    ) : null;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: clamp(p * 1.4) * out}}>
      <div style={{position: 'absolute', left: 110, top: 650, width: W - 220, height: 590, borderRadius: 28, border: '1.5px solid rgba(255,255,255,.18)', background: 'linear-gradient(180deg, rgba(20,22,52,.95), rgba(10,11,32,.93))', boxShadow: '0 30px 90px rgba(0,0,0,.45)', transform: `scale(${0.96 + 0.04 * p})`}} />
      {line(725, s1, `(${am('f')}\\circ ${cy('g')})(x) = 2x^2+3`, 46)}
      {line(805, s2, `(${cy('g')}\\circ ${am('f')})(x) = 4x^2+12x+9`, 46)}
      {line(885, s3, `${am('f')}\\circ ${cy('g')} \\;${co('\\neq')}\\; ${cy('g')}\\circ ${am('f')}`, 40, bump(t, T.summary + 0.7, 1.0), CO)}
      <div style={{position: 'absolute', left: 170, right: 170, top: 937, height: 1.5, background: 'rgba(255,255,255,.12)', opacity: s4}} />
      {s4 > 0.01 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 995, transform: 'translateY(-50%)', textAlign: 'center', opacity: s4, fontFamily: F.display, fontWeight: 700, fontSize: 38, color: C.txt}}>
          Beide: weder injektiv noch surjektiv <span style={{color: CO, textShadow: glowShadow(bump(t, T.sKeine + 0.1, 1), CO)}}>✗</span>
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 170, right: 170, top: 1052, height: 1.5, background: 'rgba(255,255,255,.12)', opacity: s5}} />
      {line(1142, s5, `${am('f^{-1}')}(x) = \\dfrac{x-3}{2}`, 52, bump(t, T.sUmk + 0.1, 1.0), OK)}
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
  const fl = Math.max(bump(t, T.ergebnis + 0.05, 0.4) * 0.6, bump(t, T.bOk, 0.4) * 0.4, bump(t, T.cOk, 0.4) * 0.5);
  return fl > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.08 * fl}} /> : null;
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
  [T.erstG + 0.05, 'tick', 0.26],
  [T.dannF + 0.05, 'tick', 0.26],
  [T.m1 + 0.12, 'whoosh', 0.16],
  [T.m1 + 0.55, 'tick', 0.24],
  [T.zuFuenf - 0.3, 'whoosh', 0.16],
  [T.zuFuenf + 0.1, 'tick', 0.24],
  [T.xq + 0.15, 'whoosh', 0.22],
  [T.gibt + 0.1, 'whoosh', 0.24],
  [T.box1 - 0.35, 'lock_hi', 0.32],
  [T.gnachf + 0.2, 'whoosh', 0.3],
  [T.erstF + 0.05, 'tick', 0.26],
  [T.dannG + 0.05, 'tick', 0.26],
  [T.m2 + 0.12, 'whoosh', 0.16],
  [T.m2 + 0.55, 'tick', 0.24],
  [T.bleibt - 0.3, 'whoosh', 0.16],
  [T.bleibt + 0.1, 'tick', 0.24],
  [T.allg2 + 0.6, 'whoosh', 0.22],
  [T.allg2 + 1.9, 'whoosh', 0.22],
  [T.allg2 + 2.95, 'whoosh', 0.24],
  [T.vier + 0.05, 'collapse', 0.24],
  [T.box2 - 0.35, 'lock_hi', 0.32],
  [T.andere + 0.1, 'accent', 0.26],
  [T.ergebnis, 'lock_hi', 0.42],
  [T.toGraph + 0.2, 'swell', 0.24],
  [T.werte + 0.1, 'whoosh', 0.2],
  [T.mal2 + 0.1, 'rise', 0.2],
  [T.plus3 + 0.05, 'rise', 0.2],
  [T.eingaben + 0.3, 'whoosh', 0.2],
  [T.schmaler + 0.45, 'whoosh', 0.22],
  [T.links + 0.05, 'whoosh', 0.22],
  [T.senk + 0.35, 'tick', 0.26],
  [T.senk + 0.6, 'tick', 0.26],
  [T.teilB, 'click', 0.3],
  [T.ziel + 0.1, 'swell', 0.2],
  [T.b1pts + 0.35, 'tick', 0.22],
  [T.b1fuenf - 0.2, 'whoosh', 0.2],
  [T.b1inj, 'accent', 0.24],
  [T.b1unter + 0.1, 'rise', 0.2],
  [T.b1sur, 'accent', 0.24],
  [T.b2pts + 0.35, 'tick', 0.22],
  [T.b2pts + 1.1, 'whoosh', 0.2],
  [T.b2inj, 'accent', 0.24],
  [T.b2neg + 0.1, 'rise', 0.2],
  [T.b2sur, 'accent', 0.24],
  [T.keine, 'whoosh', 0.26],
  [T.bOk, 'lock_hi', 0.4],
  [T.teilC, 'click', 0.3],
  [T.gerade + 0.05, 'whoosh', 0.22],
  [T.gerade + 1.35, 'tick', 0.24],
  [T.trifft + 0.1, 'rise', 0.2],
  [T.bij, 'lock_hi', 0.3],
  [T.rechnet + 0.45, 'whoosh', 0.16],
  [T.rechnet + 0.9, 'tick', 0.24],
  [T.plus3c, 'whoosh', 0.16],
  [T.plus3c + 0.45, 'tick', 0.24],
  [T.rueck + 0.05, 'whoosh', 0.28],
  [T.minus3 + 0.05, 'whoosh', 0.16],
  [T.minus3 + 0.2, 'whoosh', 0.22],
  [T.durch2, 'whoosh', 0.16],
  [T.durch2 + 0.85, 'accent', 0.3],
  [T.umgestellt + 0.15, 'whoosh', 0.22],
  [T.finv + 0.25, 'whoosh', 0.22],
  [T.cOk, 'lock_hi', 0.45],
  [T.cOk, 'accent', 0.3],
  [T.summary, 'click', 0.3],
  [T.sKeine, 'tick', 0.26],
  [T.sUmk, 'accent', 0.3],
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
          <MachinesA />
          <FormulasA />
          <Table />
          <MachineC />
          <AlgebraC />
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

