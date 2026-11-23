// Klausurvideo „Bild und Urbild“: f(x) = x² − 2x − 3 auf ℝ. a) f([−1, 3]), b) f⁻¹([0, 5]), c) f(ℝ).
// Eine Bühne (Stage.tsx), darüber die Aufgabenkarte, Chips und eine Rechenleiste mit zwei Morph-Zeilen.
// Karte, Chips, Zusammenfassung und CTA nach src/aeq/Video.tsx (Branch video/aequivalenzrelation-klausur).
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C, MARGIN, W} from '../theme';
import {F, useTexFonts} from '../fonts';
import {bump, clamp, easeInCubic, easeOutExpo, lerp, prog, sec, springOS} from '../math';
import {Backdrop, Grain, Mono, Tex, useSec} from '../ui';
import {CLIPS, MUSIC, SUBTITLES, T, VOICE} from './timeline';
import {Atom, MState, Morph, glowShadow, hide, shadow, show, useTexReady} from './kit';
import {AM, CY, Note, OK, ResultBox, ease, rowBounds} from './common';
import {Stage} from './Stage';
import './fn';

const L = (id: string, tex: string, extra: Partial<Atom> = {}): Atom => ({id, tex, ...extra});
// Summand mit Vorzeichen: Abstand wie um ein Rechenzeichen
const O = (id: string, tex: string, extra: Partial<Atom> = {}): Atom => ({id, tex: /^[+-]/.test(tex) ? `{}${tex}` : tex, pad: 0.02, ...extra});
const am = (s: string) => `\\textcolor{${AM}}{${s}}`;
const cy = (s: string) => `\\textcolor{${CY}}{${s}}`;

/* ---------- Aufgabenkarte ---------- */

const BOX_HOOK = {top: 600, h: 470};
const BOX_SMALL = {top: 300, h: 200};
const compactK = (t: number) => ease(t, T.gegeben - 0.15, 0.95);
const cardOut = (t: number) => easeInCubic(clamp((t - (T.cta - 0.2)) / 0.5));
const CARD_HOOK = {cx: 540, cy: 700, size: 50};
const CARD_SMALL = {cx: 540, cy: 415, size: 38};

const cardStates = (t: number): MState[] => {
  const gT = bump(t, T.gegeben + 0.1, 1.2);
  const gV = bump(t, T.dazwischen + 0.1, 1.2) + bump(t, T.plus4 - 0.6, 1.2) + bump(t, T.nieNeg + 0.1, 1.2);
  const row1 = [
    L('fN', 'f'),
    L('col', '\\colon', {pad: 0.12}),
    L('R1', '\\mathbb{R}'),
    L('to', '\\to'),
    L('R2', '\\mathbb{R}'),
    L('cm', ',', {pad: 0.5}),
    L('fx', 'f(x)'),
    L('eq', '='),
    L('ft', 'x^2-2x-3', {glow: gT}),
  ];
  return [
    {at: -1, nodes: row1},
    {at: T.gegeben - 0.15, dur: 0.95, nodes: row1},
    {
      at: T.sMinus4 + 0.45,
      dur: 0.8,
      nodes: [],
      rows: [
        {dy: -30, nodes: row1},
        {dy: 32, nodes: [L('eq2', '='), L('vf', '(x-1)^2-4', {glow: gV + bump(t, T.sMinus4 + 0.9, 1.2)})]},
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
    a) Bestimmen Sie das Bild <Tex tex={`f(${am('[-1,3]')})`} size={36} style={{color: C.txt}} />.
  </>,
  <>
    b) Bestimmen Sie das Urbild <Tex tex={`f^{-1}(${cy('[0,5]')})`} size={36} style={{color: C.txt}} />.
  </>,
  <>
    c) Bestimmen Sie die Bildmenge <Tex tex={'f(\\mathbb{R})'} size={36} style={{color: C.txt}} />.
  </>,
];
const TASK_TOP = [788, 860, 932];

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

const CHIP_Y = 518;
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
  const spec: [string, string, number, number, number[]][] = [
    ['a', 'f([-1,3])', T.teilA, T.aOk, [T.wBild + 0.05, T.teilA, T.aOk]],
    ['b', 'f^{-1}([0,5])', T.teilB, T.bOk, [T.wUrbild + 0.05, T.teilB, T.bOk]],
    ['c', 'f(\\mathbb{R})', T.teilC, T.cOk, [T.wMenge + 0.05, T.teilC, T.cOk]],
  ];
  return (
    <>
      {spec.map(([mark, tex, on, ok, pulses], i) => {
        const p = springOS(clamp((t - (T.gegeben + 0.35 + 0.12 * i)) / 0.6));
        const st: ChipState = t >= ok ? 'ok' : t >= on ? 'active' : 'idle';
        const pulse = Math.max(...pulses.map((at) => bump(t, at, 0.7)));
        return <Chip key={mark} r={THREE_R[i]} o={clamp(p * 1.4) * out} st={st} pulse={pulse} mark={mark} label={<Tex tex={tex} size={28} style={{color: 'inherit'}} />} />;
      })}
    </>
  );
};

/* ---------- Rechenleiste: Zeile A (Ziel) und Zeile B (Rechnung) ---------- */

const RA = {cy: 636, size: 40};
const RB = {cy: 722, size: 44};

const rowAStates = (t: number): MState[] => {
  const eq = (id: string) => L(id, '=');
  return [
    {at: -1, nodes: []},
    {at: T.teilA + 0.1, nodes: [L('aL', `f(${am('[-1,3]')})`), eq('aE'), L('aQ', '?', {color: C.txt2})]},
    {at: T.beimBild + 0.15, nodes: [L('aL', `f(${am('[-1,3]')})`), eq('aE'), L('aD', `\\{\\,${cy('f(x)')} : ${am('x\\in[-1,3]')}\\,\\}`)]},
    {at: T.bildAWert + 0.1, into: {aD: 'aR'}, nodes: [L('aL', `f(${am('[-1,3]')})`), eq('aE'), L('aR', `[-4,\\,0]`, {color: CY, glow: bump(t, T.bildAWert + 0.3, 1.2)})]},
    {at: T.teilB + 0.1, nodes: [L('bL', `f^{-1}(${cy('[0,5]')})`), eq('bE'), L('bQ', '?', {color: C.txt2})]},
    {at: T.alleX + 0.15, nodes: [L('bL', `f^{-1}(${cy('[0,5]')})`), eq('bE'), L('bD', `\\{\\,${am('x')} : f(x)\\in ${cy('[0,5]')}\\,\\}`)]},
    {at: T.unten + 0.05, into: {bD: 'bR'}, nodes: [L('bL', `f^{-1}(${cy('[0,5]')})`), eq('bE'), L('bR', `[-2,-1]\\cup[3,4]`, {color: AM, glow: bump(t, T.unten + 0.3, 1.2)})]},
    {at: T.teilC + 0.1, nodes: [L('cL', 'f(\\mathbb{R})'), eq('cE'), L('cQ', '?', {color: C.txt2})]},
    {at: T.bildCWert + 0.1, into: {cQ: 'cR'}, nodes: [L('cL', 'f(\\mathbb{R})'), eq('cE'), L('cR', `[-4,\\,\\infty)`, {color: CY, glow: bump(t, T.bildCWert + 0.3, 1.2)})]},
    {at: T.sum - 0.1, nodes: []},
  ];
};

const rowBStates = (t: number): MState[] => {
  const lhs = (id: string, tex: string) => [L(id, tex), L(id + 'e', '=')];
  const hi = (at: number) => bump(t, at, 1.0);
  const F0 = lhs('fx', 'f(x)');
  return [
    {at: -1, nodes: []},
    // Scheitelform
    {at: T.sf + 0.15, nodes: [...F0, L('x2', 'x^2'), O('m2x', '-2x'), O('m3', '-3')]},
    {at: T.plus1 + 0.05, nodes: [...F0, L('x2', 'x^2'), O('m2x', '-2x'), O('p1', '+1', {color: OK, glow: hi(T.plus1 + 0.1)}), O('m3', '-3')]},
    {at: T.minus1 + 0.05, nodes: [...F0, L('x2', 'x^2'), O('m2x', '-2x'), O('p1', '+1', {color: OK}), O('q1', '-1', {color: OK, glow: hi(T.minus1 + 0.1)}), O('m3', '-3')]},
    {at: T.quadrat, dur: 0.75, into: {x2: 'sq', m2x: 'sq', p1: 'sq'}, nodes: [...F0, L('sq', '(x-1)^2', {glow: hi(T.quadrat + 0.4)}), O('q1', '-1'), O('m3', '-3')]},
    {at: T.minus4, into: {q1: 'm4', m3: 'm4'}, nodes: [...F0, L('sq', '(x-1)^2'), O('m4', '-4', {glow: hi(T.minus4 + 0.3)})]},
    {at: T.sEins, nodes: [...F0, L('sq', `(x-${am('1')})^2`, {glow: hi(T.sEins + 0.1)}), O('m4', cy('-4'), {glow: hi(T.sMinus4 + 0.1)})]},
    {at: T.sMinus4 + 0.45, nodes: []},
    // Teil a: Ränder und Scheitel
    {at: T.links + 0.05, nodes: [...lhs('l1', `f(${am('-1')})`), L('la', '(-1)^2'), O('lb', '-2\\cdot(-1)'), O('lc', '-3')]},
    {at: T.linksRech + 0.1, nodes: [...lhs('l1', `f(${am('-1')})`), L('la', '1'), O('lb', '+2'), O('lc', '-3')]},
    {at: T.linksNull, into: {la: 'lz', lb: 'lz', lc: 'lz'}, nodes: [...lhs('l1', `f(${am('-1')})`), L('lz', '0', {color: CY, glow: hi(T.linksNull + 0.3)})]},
    {at: T.rechts + 0.05, nodes: [...lhs('r1', `f(${am('3')})`), L('ra', '3^2'), O('rb', '-2\\cdot 3'), O('rc', '-3')]},
    {at: T.rechtsRech + 0.1, nodes: [...lhs('r1', `f(${am('3')})`), L('ra', '9'), O('rb', '-6'), O('rc', '-3')]},
    {at: T.rechtsNull, into: {ra: 'rz', rb: 'rz', rc: 'rz'}, nodes: [...lhs('r1', `f(${am('3')})`), L('rz', '0', {color: CY, glow: hi(T.rechtsNull + 0.3)})]},
    {at: T.dazwischen + 0.1, nodes: [...lhs('v1', `f(${am('1')})`), L('va', '(1-1)^2'), O('vb', '-4')]},
    {at: T.dazwischen + 0.75, nodes: [...lhs('v1', `f(${am('1')})`), L('va', '0'), O('vb', '-4')]},
    {at: T.dazwischen + 1.35, into: {va: 'vz', vb: 'vz'}, nodes: [...lhs('v1', `f(${am('1')})`), L('vz', '-4', {color: CY, glow: hi(T.dazwischen + 1.6)})]},
    {at: T.punkt + 0.4, nodes: []},
    // Teil b
    {at: T.diesmal + 1.6, nodes: [L('u0', '0'), L('ul1', '\\le'), L('usq', '(x-1)^2'), L('um4', '-4'), L('ul2', '\\le'), L('u5', '5')]},
    {
      at: T.plus4 + 0.1,
      dur: 0.7,
      nodes: [L('u0', '0'), O('up1', '+4', {color: OK, from: 'um4', arc: 60}), L('ul1', '\\le'), L('usq', '(x-1)^2'), L('ul2', '\\le'), L('u5', '5'), O('up2', '+4', {color: OK, from: 'um4', arc: 60})],
    },
    {at: T.vierNeun - 0.85, into: {u0: 'U4', up1: 'U4', u5: 'U9', up2: 'U9'}, nodes: [L('U4', '4', {glow: hi(T.vierNeun - 0.6)}), L('ul1', '\\le'), L('usq', '(x-1)^2'), L('ul2', '\\le'), L('U9', '9', {glow: hi(T.vierNeun)})]},
    {at: T.abstand + 0.1, nodes: [L('U4', '\\sqrt{4}'), L('ul1', '\\le'), L('usq', '|x-1|'), L('ul2', '\\le'), L('U9', '\\sqrt{9}')]},
    {at: T.zweiDrei, nodes: [L('U4', '2', {color: AM, glow: hi(T.zweiDrei + 0.1)}), L('ul1', '\\le'), L('usq', '|x-1|'), L('ul2', '\\le'), L('U9', '3', {color: AM, glow: hi(T.zweiDrei + 0.5)})]},
    {at: T.teilC, nodes: []},
    // Teil c
    {at: T.nieNeg + 0.1, nodes: [L('qsq', '(x-1)^2'), L('qge', '\\ge'), L('q0', '0')]},
    {at: T.mind + 0.1, nodes: [L('qsq', '(x-1)^2'), O('qm4', '-4', {color: CY, glow: hi(T.mind + 0.2)}), L('qge', '\\ge'), L('q0', '0'), O('qm4b', '-4', {color: CY, glow: hi(T.mind + 0.2)})]},
    {at: T.mind + 1.3, into: {qsq: 'qf', qm4: 'qf', q0: 'qr', qm4b: 'qr'}, nodes: [L('qf', 'f(x)'), L('qge', '\\ge'), L('qr', '-4', {color: CY, glow: hi(T.mind + 1.6)})]},
    {at: T.arme + 1.0, nodes: [L('qn', `y\\ge -4:\\quad f\\big(1+\\sqrt{y+4}\\,\\big) = y`, {color: C.txt2})]},
    {at: T.sum - 0.1, nodes: []},
  ];
};

const Panel: React.FC = () => {
  const t = useSec();
  const o = show(t, T.sf - 0.2, 0.4) * hide(t, T.sum - 0.15, 0.4);
  if (o <= 0.01) return null;
  const A = rowAStates(t);
  const B = rowBStates(t);
  // grüne Rahmen um die Ergebnisse
  const box = (si: number, id: string, on: number, off: number) => {
    const bo = show(t, on, 0.4) * hide(t, off, 0.3);
    if (bo <= 0.01) return null;
    const b = rowBounds(A[si], 540, RA.cy, RA.size, [id]);
    return <ResultBox key={id} cx={b.cx} cy={RA.cy} w={b.w + 34} h={62} o={bo} glow={bump(t, on + 0.05, 1.0)} />;
  };
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{position: 'absolute', left: 60, top: 594, width: W - 120, height: 172, borderRadius: 22, background: 'rgba(9,10,30,.86)', border: '1.5px solid rgba(255,255,255,.1)'}} />
      {box(3, 'aR', T.aOk - 0.3, T.teilB + 0.05)}
      {box(6, 'bR', T.bOk - 0.3, T.teilC + 0.05)}
      {box(8, 'cR', T.cOk - 0.3, T.sum - 0.15)}
      <Morph t={t} states={A} cy={RA.cy} size={RA.size} />
      <Morph t={t} states={B} cy={RB.cy} size={RB.size} />
      <Note y={RB.cy} tex={'\\text{Urbild einer Menge – keine Umkehrfunktion nötig}'} o={show(t, T.keineUmk + 0.05, 0.4) * hide(t, T.diesmal + 1.4, 0.3)} size={32} />
    </div>
  );
};

/* ---------- Zusammenfassung ---------- */

const Summary: React.FC = () => {
  const t = useSec();
  const p = springOS(clamp((t - T.sum + 0.05) / 0.6));
  const out = hide(t, T.cta - 0.2, 0.5);
  if (p <= 0 || out <= 0) return null;
  const line = (y: number, o: number, tex: string, size: number, glow = 0, col = C.txt) =>
    o > 0.01 ? (
      <div style={{position: 'absolute', left: 540, top: y, transform: `translate(-50%, -50%) translateY(${(1 - o) * 12}px)`, opacity: o, whiteSpace: 'nowrap', textShadow: glowShadow(glow, col)}}>
        <Tex tex={tex} size={size} style={{color: C.txt}} />
      </div>
    ) : null;
  const s4 = show(t, T.sumBild, 0.4);
  const s5 = show(t, T.sumUrbild, 0.4);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: clamp(p * 1.4) * out}}>
      <div style={{position: 'absolute', left: 110, top: 640, width: W - 220, height: 560, borderRadius: 28, border: '1.5px solid rgba(255,255,255,.18)', background: 'linear-gradient(180deg, rgba(20,22,52,.95), rgba(10,11,32,.93))', boxShadow: '0 30px 90px rgba(0,0,0,.45)', transform: `scale(${0.96 + 0.04 * p})`}} />
      {line(720, show(t, T.sum + 0.1, 0.4), `f(${am('[-1,3]')}) = ${cy('[-4,\\,0]')}`, 46)}
      {line(805, show(t, T.sum + 0.3, 0.4), `f^{-1}(${cy('[0,5]')}) = ${am('[-2,-1]\\cup[3,4]')}`, 46)}
      {line(890, show(t, T.sum + 0.5, 0.4), `f(\\mathbb{R}) = ${cy('[-4,\\,\\infty)')}`, 46)}
      <div style={{position: 'absolute', left: 170, right: 170, top: 945, height: 1.5, background: 'rgba(255,255,255,.12)', opacity: s4}} />
      {line(1010, s4, `\\text{Bild:}\\quad ${am('x')} \\;\\longrightarrow\\; ${cy('\\text{Werte}')}`, 42, bump(t, T.sumBild + 0.1, 1.0), AM)}
      {line(1100, s5, `\\text{Urbild:}\\quad ${cy('\\text{Werte}')} \\;\\longrightarrow\\; ${am('\\text{alle } x')}`, 42, bump(t, T.sumUrbild + 0.1, 1.0), CY)}
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
  const fl = Math.max(bump(t, T.aOk, 0.4) * 0.5, bump(t, T.unten + 0.1, 0.4) * 0.6, bump(t, T.cOk, 0.4) * 0.5);
  return fl > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.08 * fl}} /> : null;
};

/* ---------- Ton ---------- */

const SFX: [number, string, number][] = [
  [0, 'whoosh', 0.4],
  [0.1, 'click', 0.3],
  [T.gegeben - 0.1, 'whoosh', 0.28],
  [T.wBild + 0.05, 'tick', 0.24],
  [T.wUrbild + 0.05, 'tick', 0.24],
  [T.wMenge + 0.05, 'tick', 0.24],
  [T.plus1 + 0.05, 'tick', 0.24],
  [T.minus1 + 0.05, 'tick', 0.24],
  [T.quadrat, 'whoosh', 0.24],
  [T.minus4, 'collapse', 0.24],
  [T.scheitel + 0.05, 'accent', 0.24],
  [T.sMinus4 + 0.45, 'whoosh', 0.22],
  [T.teilA, 'click', 0.3],
  [T.bildVon + 0.3, 'rise', 0.2],
  [T.linksRech + 0.1, 'whoosh', 0.2],
  [T.linksNull, 'collapse', 0.22],
  [T.rechtsRech + 0.1, 'whoosh', 0.2],
  [T.rechtsNull, 'collapse', 0.22],
  [T.raender + 0.3, 'accent', 0.22],
  [T.dazwischen + 0.5, 'tick', 0.24],
  [T.punkt + 0.45, 'swell', 0.24],
  [T.hinunter + 1.1, 'tick', 0.26],
  [T.zurueckEnd + 0.4, 'tick', 0.26],
  [T.aOk, 'lock_hi', 0.4],
  [T.teilB, 'click', 0.3],
  [T.urbildVon + 0.6, 'rise', 0.2],
  [T.alleX + 0.5, 'whoosh', 0.22],
  [T.diesmal + 0.2, 'whoosh', 0.2],
  [T.diesmal + 0.8, 'swell', 0.2],
  [T.plus4 + 0.1, 'whoosh', 0.24],
  [T.vierNeun - 0.85, 'collapse', 0.22],
  [T.abstand + 0.1, 'whoosh', 0.2],
  [T.zweiDrei, 'tick', 0.24],
  [T.zweiDrei + 0.45, 'tick', 0.24],
  [T.vonEins, 'accent', 0.2],
  [T.linksB + 0.15, 'tick', 0.24],
  [T.linksB + 0.75, 'whoosh', 0.24],
  [T.rechtsB + 0.1, 'tick', 0.24],
  [T.rechtsB + 0.7, 'whoosh', 0.24],
  [T.unten + 0.05, 'lock_hi', 0.42],
  [T.unten + 0.05, 'accent', 0.28],
  [T.teilC, 'click', 0.3],
  [T.mind + 0.3, 'whoosh', 0.2],
  [T.mind + 1.3, 'collapse', 0.22],
  [T.arme + 0.1, 'swell', 0.28],
  [T.arme + 0.8, 'rise', 0.22],
  [T.cOk, 'lock_hi', 0.45],
  [T.cOk, 'accent', 0.3],
  [T.sum, 'click', 0.3],
  [T.sumBild, 'tick', 0.26],
  [T.sumUrbild, 'tick', 0.26],
  [T.cta - 0.1, 'swell', 0.34],
  ...Array.from({length: 8}, (_, i) => [T.tippt + i * 0.075, 'tick', 0.18] as [number, string, number]),
];

/* ---------- Komposition ---------- */

export type BUProps = {music: boolean; voice: boolean};

const LEAD = 0.08;
const TAIL = 0.1;

export const VideoBU: React.FC<BUProps> = ({music, voice}) => {
  useTexFonts();
  const ready = useTexReady();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={1100} strength={0.85} />
      <Stage />
      {ready ? (
        <>
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
                <Audio src={staticFile(VOICE)} trimBefore={sec(c.from - lead)} trimAfter={sec(c.to + TAIL)} />
              </Sequence>
            );
          })
        : null}
    </AbsoluteFill>
  );
};

