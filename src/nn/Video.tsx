// Aha-Video „Warum ist 0,999… = 1?“ (Reihe WARUM?, Folge 2) – Ziffernreihen, Rechnung und Beschriftungen über der Canvas-Bühne.
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C, MARGIN, W} from '../theme';
import {F, useTexFonts} from '../fonts';
import {bump, clamp, easeInOutCubic, easeOutExpo, lerp, prog, sec, springOS} from '../math';
import {Backdrop, Grain, Mono, useSec} from '../ui';
import {COL, Stage} from './Canvas';
import {CLIPS, MUSIC, SUBTITLES, T, VOICE} from './timeline';
import {
  EQ_DX,
  FINAL_SHIFT,
  FULL,
  LINE_Y,
  ONE_DX,
  PROOF,
  RowPose,
  TAIL_N,
  X1,
  cancelAt,
  fade,
  finalPose,
  growN,
  hookPose,
  nullAt,
  partnerAt,
  pulse,
  riseA,
  shiftA,
  shimmer,
  show,
  slot,
  tailEnd,
  vis,
} from './world';

const hide = (t: number, at: number, d = 0.35) => 1 - easeInOutCubic(clamp((t - at) / d));
const shadow = `0 0 14px ${C.bg}, 0 0 30px ${C.bg}`;

/* ---------- ein Zeichen an fester Stelle ---------- */

type G = {x: number; y: number; size: number; ch: string; color: string; o: number; k?: number; glow?: number; math?: boolean};
const Ch: React.FC<G> = ({x, y, size, ch, color, o, k = 1, glow = 0, math = false}) =>
  o > 0.003 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${k})`,
        fontFamily: math ? 'KaTeX_Math' : F.display,
        fontStyle: math ? 'italic' : 'normal',
        fontWeight: math ? 400 : 800,
        fontSize: size,
        lineHeight: 1,
        color,
        opacity: o,
        whiteSpace: 'pre',
        fontVariantNumeric: 'tabular-nums',
        textShadow: glow > 0.01 ? `0 0 ${12 + 34 * glow}px ${color}cc, ${shadow}` : shadow,
      }}
    >
      {ch}
    </div>
  ) : null;

// rechtsbündige Beschriftung wie „10x“: Ziffern in Inter Tight, x kursiv
const Label: React.FC<{right: number; y: number; size: number; num?: string; o: number; color?: string; glow?: number}> = ({right, y, size, num = '', o, color = COL.num, glow = 0}) =>
  o > 0.003 ? (
    <div style={{position: 'absolute', left: right, top: y, transform: 'translate(-100%, -50%)', fontSize: size, lineHeight: 1, opacity: o, whiteSpace: 'nowrap', textShadow: glow > 0.01 ? `0 0 ${12 + 30 * glow}px ${color}cc, ${shadow}` : shadow}}>
      <span style={{fontFamily: F.display, fontWeight: 800, color: C.txt}}>{num}</span>
      <span style={{fontFamily: 'KaTeX_Math', fontStyle: 'italic', color}}>x</span>
    </div>
  ) : null;

// Nachkommastellen 0..FULL+TAIL_N: winzige Stellen im Schweif blenden weich aus
const tinyFade = (k: number) => clamp((k - 0.02) / 0.06);

/* ---------- Zahl „0,999…“ mit optionalem „= 1“ in einer Pose ---------- */

const NumberRow: React.FC<{pose: RowPose; o: number; t: number; typing?: boolean; glow?: number; cancel?: boolean}> = ({pose, o, t, typing = false, glow = 0, cancel = false}) => {
  if (o <= 0) return null;
  const {cx, y, size} = pose;
  const items: React.ReactNode[] = [];
  items.push(<Ch key="i" x={cx + slot(-1, size).x} y={y} size={size} ch="0" color={COL.num} o={o} glow={glow} />);
  items.push(<Ch key="c" x={cx} y={y} size={size} ch="," color={COL.num} o={o * (cancel ? 1 - clamp((t - T.tilgen - 0.7) / 0.3) : 1)} glow={glow} />);
  for (let i = 0; i < FULL + TAIL_N; i++) {
    const s = slot(i, size);
    const at = i < FULL ? 0.1 + 0.12 * i : 0.45 + 0.6 * (1 - Math.pow(0.72, i - FULL + 1));
    const ap = typing ? show(t, at, 0.18) : 1;
    const c = cancel ? clamp((t - cancelAt(i)) / 0.3) : 0;
    const oo = o * ap * tinyFade(s.k) * (1 - c);
    items.push(
      <Ch key={`d${i}`} x={cx + s.x} y={y - 26 * c} size={size} k={s.k * (0.7 + 0.3 * ap) * (1 - 0.4 * c)} ch="9" color={COL.num} o={oo} glow={glow + 0.8 * shimmer(t, i) * (i >= 2 ? 1 : 0.3)} />,
    );
  }
  // „<“ kippt in „=“, dahinter die Eins
  const ex = cx + tailEnd(size) + EQ_DX * size;
  const one = cx + tailEnd(size) + ONE_DX * size;
  const m = easeInOutCubic(clamp((t - T.aber) / 0.35));
  const lt = typing ? show(t, T.kleiner, 0.25) * (1 - m) : 0;
  const eq = typing ? (t < T.aber ? 0 : springOS(clamp((t - T.aber) / 0.5))) : 1;
  const oneO = (typing ? show(t, 0.25, 0.3) : 1) * pose.eq * o;
  items.push(<Ch key="lt" x={ex} y={y} size={size} k={1 - 0.4 * m} ch="<" color={COL.gap} o={lt * pose.eq * o} glow={0.4} />);
  items.push(<Ch key="eq" x={ex} y={y} size={size} k={lerp(1.5, 1, clamp(eq))} ch="=" color={C.txt} o={clamp(eq) * pose.eq * o} glow={glow} />);
  items.push(<Ch key="one" x={one} y={y} size={size} ch="1" color={COL.one} o={oneO} glow={glow} />);
  return <>{items}</>;
};

/* ---------- Hook, Anker, Zeile x der Rechnung ---------- */

const RowX: React.FC = () => {
  const t = useSec();
  if (t > T.zurueck + 1) return null;
  const pose = hookPose(t);
  const o = t < T.nennen ? 1 : vis.proof(t);
  const glow = pulse(t, T.exakt, 1.0) + 0.6 * pulse(t, T.aber, 0.7) + 0.5 * pulse(t, T.unendlich, 1.0);
  const lab = show(t, T.nennen + 0.05, 0.4) * vis.proof(t);
  return (
    <>
      <NumberRow pose={pose} o={o} t={t} typing glow={glow} cancel />
      <Label right={PROOF.label} y={PROOF.yB} size={PROOF.size} o={lab} glow={pulse(t, T.nennen + 0.1, 0.8)} />
      <Ch x={PROOF.eqX} y={PROOF.yB} size={PROOF.size} ch="=" color={C.txt} o={lab} />
      <Ch x={130} y={PROOF.yB} size={PROOF.size} ch="−" color={C.txt} o={vis.minus(t) * vis.proof(t)} />
    </>
  );
};

/* ---------- Zeile 10x: Ziffern rücken eine Stelle, von hinten kommen Neunen nach ---------- */

const RowA: React.FC = () => {
  const t = useSec();
  const o = show(t, T.zehn, 0.3) * vis.proof(t);
  if (o <= 0) return null;
  const size = PROOF.size;
  const cx = PROOF.comma;
  const y = lerp(PROOF.yB, PROOF.yA, riseA(t));
  const s = shiftA(t);
  const items: React.ReactNode[] = [];
  // die führende 0 rückt vor das Komma hinaus und verschwindet
  items.push(<Ch key="i0" x={cx + slot(-1, size).x - s * 0.6 * size} y={y} size={size} ch="0" color={C.txt} o={o * (1 - clamp(s * 1.6))} />);
  items.push(<Ch key="c" x={cx} y={y} size={size} ch="," color={C.txt} o={o * (1 - clamp((t - T.tilgen - 0.7) / 0.3))} glow={0.5 * pulse(t, T.schiebt + 0.2, 1.0)} />);
  for (let j = 0; j <= FULL + TAIL_N; j++) {
    const at = j - s; // aktueller Platz
    const p = at < 0 ? {x: lerp(slot(0, size).x, slot(-1, size).x, clamp(-at)), k: 1} : slot(at, size);
    const i = j - 1; // Nachkommastelle nach dem Rücken
    const c = j >= 1 ? clamp((t - cancelAt(i)) / 0.3) : 0;
    const oo = o * tinyFade(p.k) * (1 - c);
    items.push(<Ch key={`d${j}`} x={cx + p.x} y={y + 26 * c} size={size} k={p.k * (1 - 0.4 * c)} ch="9" color={C.txt} o={oo} glow={0.7 * shimmer(t, j) * (j >= 2 ? 1 : 0.3) + (j === 0 ? 0.6 * pulse(t, T.schiebt + 0.6, 0.9) : 0)} />);
  }
  // Partnerlinien: jede Neun oben hat ihre Neun unten
  for (let i = 0; i < FULL + TAIL_N - 1; i++) {
    const p = slot(i, size);
    const a = show(t, partnerAt(i), 0.25) * (1 - clamp((t - cancelAt(i)) / 0.3)) * tinyFade(p.k) * o;
    if (a <= 0.003) continue;
    const top = PROOF.yA + 44 * p.k;
    const bot = PROOF.yB - 44 * p.k;
    items.push(
      <div
        key={`p${i}`}
        style={{position: 'absolute', left: cx + p.x - 2.5 * p.k, top, width: 5 * p.k, height: bot - top, borderRadius: 4, background: COL.one, opacity: a, boxShadow: `0 0 ${14 * p.k}px ${COL.one}`}}
      />,
    );
  }
  const lab = show(t, T.zehn + 0.25, 0.4) * vis.proof(t);
  return (
    <>
      {items}
      <Label right={PROOF.label} y={PROOF.yA} size={size} num="10" o={lab} />
      <Ch x={PROOF.eqX} y={PROOF.yA} size={size} ch="=" color={C.txt} o={lab} />
    </>
  );
};

/* ---------- Strich, Ergebnis 9x = 9, dann x = 1 ---------- */

const Result: React.FC = () => {
  const t = useSec();
  const size = PROOF.size;
  const rule = vis.rule(t);
  const grow = easeInOutCubic(clamp((t - T.ziehen - 0.2) / 0.6));
  const r9 = vis.res9(t);
  const rx = vis.resX1(t);
  const xInt = PROOF.comma + slot(-1, size).x;
  const g9 = pulse(t, T.gleichNeun, 0.9) + 0.6 * pulse(t, T.uebrig + 0.2, 0.8);
  const slide = FINAL_SHIFT * easeInOutCubic(clamp((t - T.zurueck) / 0.75));
  const gx = pulse(t, T.xEins + 0.1, 1.0);
  const right = PROOF.comma + tailEnd(size) + 20;
  return (
    <>
      {rule > 0 ? <div style={{position: 'absolute', left: 110, top: PROOF.yRule - 2, width: (right - 110) * grow, height: 4, borderRadius: 2, background: C.txt2, opacity: rule}} /> : null}
      <Label right={PROOF.label} y={PROOF.yRes} size={size} num="9" o={r9} color={COL.num} glow={g9} />
      <Ch x={PROOF.eqX} y={PROOF.yRes} size={size} ch="=" color={C.txt} o={r9} />
      <Ch x={xInt} y={PROOF.yRes - 30 * (1 - show(t, T.uebrig + 0.1, 0.45))} size={size} ch="9" color={C.txt} o={r9} glow={g9} />
      <Label right={PROOF.label + slide} y={PROOF.yRes} size={size} o={rx * (1 - clamp((t - T.zurueck) / 0.35))} glow={gx} />
      <Ch x={PROOF.eqX + slide} y={PROOF.yRes} size={size} ch="=" color={C.txt} o={rx} />
      <Ch x={xInt + slide} y={PROOF.yRes} size={size} ch="1" color={COL.one} o={rx} glow={gx} />
    </>
  );
};

// „0,999… = 1“ als Ergebnis, danach oben als Anker und zur Auflösung groß
const FinalRow: React.FC = () => {
  const t = useSec();
  const o = vis.final(t);
  if (o <= 0) return null;
  const glow = 0.8 * pulse(t, T.zurueck + 0.5, 1.2) + pulse(t, T.dieEins, 1.3) + 0.5 * pulse(t, T.anders, 1.0);
  return <NumberRow pose={finalPose(t)} o={o} t={t} glow={glow} />;
};

/* ---------- Paradox: alle endlichen Näherungen sind kleiner ---------- */

const ParaReadout: React.FC = () => {
  const t = useSec();
  const o = vis.readout(t);
  if (o <= 0) return null;
  const lt = <span style={{color: COL.gap}}> &lt; </span>;
  const n = (s: string) => <span style={{color: COL.num}}>{s}</span>;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 640, transform: `translateY(-50%) translateY(${(1 - o) * 14}px)`, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 54, opacity: o, whiteSpace: 'pre', textShadow: shadow, fontVariantNumeric: 'tabular-nums'}}>
      <span style={{background: 'radial-gradient(closest-side, rgba(7,8,26,.85) 60%, rgba(7,8,26,0) 100%)', padding: '14px 40px'}}>
        {n('0,9')}
        {lt}
        {n('0,99')}
        {lt}
        {n('0,999')}
        {lt}
        <span style={{color: C.txt2}}>…</span>
        {lt}
        <span style={{color: COL.one}}>1</span>
      </span>
    </div>
  );
};

/* ---------- Abstand: 1 − 0,9 = 0,1 usw., die letzte Zeile wächst ins Unendliche ---------- */

const RS = 56; // Schriftgröße der Abstandszeilen
const CL = 380; // Komma links
const CR = 690; // Komma rechts
const GapLine: React.FC<{y: number; n: number; grow?: boolean; at: number}> = ({y, n, grow = false, at}) => {
  const t = useSec();
  const o = show(t, at, 0.4) * hide(t, T.unterwegs + 0.05, 0.45);
  if (o <= 0) return null;
  const g = grow && t > T.winzig ? growN(t) : n;
  const z = grow ? show(t, nullAt, 0.45) : 0; // „= 0“
  const items: React.ReactNode[] = [];
  const glowNew = pulse(t, at, 0.8);
  items.push(<Ch key="one" x={CL + slot(-1, RS).x - 1.55 * RS} y={y} size={RS} ch="1" color={COL.one} o={o} />);
  items.push(<Ch key="mi" x={CL + slot(-1, RS).x - 0.85 * RS} y={y} size={RS} ch="−" color={C.txt} o={o} />);
  items.push(<Ch key="li" x={CL + slot(-1, RS).x} y={y} size={RS} ch="0" color={COL.num} o={o} />);
  items.push(<Ch key="lc" x={CL} y={y} size={RS} ch="," color={COL.num} o={o} />);
  for (let j = 0; j < FULL + TAIL_N; j++) {
    const s = slot(j, RS);
    const a = clamp(g - j) * tinyFade(s.k);
    items.push(<Ch key={`l${j}`} x={CL + s.x} y={y} size={RS} k={s.k} ch="9" color={COL.num} o={o * a} glow={grow ? 0.6 * shimmer(t, j) * clamp(g - 3) : glowNew * 0.5} />);
  }
  items.push(<Ch key="eq" x={(CL + tailEnd(RS) + CR + slot(-1, RS).x - 0.3 * RS) / 2} y={y} size={RS} ch="=" color={C.txt} o={o} />);
  // rechte Seite 0,00…01: die 1 wandert mit jeder neuen Neun eine Stelle weiter
  items.push(<Ch key="ri" x={CR + slot(-1, RS).x} y={y} size={RS * lerp(1, 1.25, z)} ch="0" color={z > 0.5 ? COL.one : COL.gap} o={o} glow={glowNew * 0.6 + 1.2 * pulse(t, nullAt, 1.2)} />);
  items.push(<Ch key="rc" x={CR} y={y} size={RS} ch="," color={COL.gap} o={o * (1 - z)} />);
  for (let j = 0; j < FULL + TAIL_N; j++) {
    const s = slot(j, RS);
    const a = clamp(g - 1 - j) * tinyFade(s.k);
    items.push(<Ch key={`r${j}`} x={CR + s.x} y={y} size={RS} k={s.k} ch="0" color={COL.gap} o={o * a * (1 - z)} />);
  }
  const s1 = slot(g - 1, RS);
  items.push(<Ch key="r1" x={CR + s1.x} y={y} size={RS} k={s1.k} ch="1" color={COL.gap} o={o * tinyFade(s1.k) * (1 - z)} glow={glowNew * 0.6} />);
  return <>{items}</>;
};

const GapLines: React.FC = () => (
  <>
    <GapLine y={560} n={1} at={T.zehntel} />
    <GapLine y={650} n={2} at={T.hundertstel} />
    <GapLine y={740} n={3} at={T.tausendstel} grow />
  </>
);

/* ---------- Auflösung: „0,999…“ landet auf der Eins ---------- */

const OneLabel: React.FC = () => {
  const t = useSec();
  const o = vis.label999(t);
  if (o <= 0) return null;
  const k = easeInOutCubic(clamp((t - T.dieEins + 0.25) / 0.8));
  const y = LINE_Y - lerp(200, 74, k);
  const g = pulse(t, T.dieEins + 0.45, 1.0) + 0.5 * pulse(t, T.anders, 1.0);
  return (
    <div style={{position: 'absolute', left: X1, top: y, transform: 'translate(-50%, -50%)', fontFamily: F.display, fontWeight: 800, fontSize: 44, color: COL.num, opacity: o, whiteSpace: 'nowrap', textShadow: `0 0 ${12 + 30 * g}px ${COL.num}cc, ${shadow}`}}>
      0,999…
    </div>
  );
};

/* ---------- Logo, CTA ---------- */

const LogoMark: React.FC = () => {
  const t = useSec();
  const a = show(t, 3.0, 0.7);
  if (a <= 0) return null;
  const k = prog(t, T.cta, 0.9);
  const size = lerp(56, 248, k);
  const cx = lerp(W - MARGIN - 34 - 28, 540, k);
  const cy = lerp(336, 700, k);
  const glint = clamp((t - 3.0) / 1.1);
  return (
    <div style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, opacity: a * lerp(0.85, 1, k)}}>
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

const Centered: React.FC<{y: number; at: number; size: number; color?: string; weight?: number; children: React.ReactNode}> = ({y, at, size, color = C.txt, weight = 800, children}) => {
  const t = useSec();
  const p = easeOutExpo(clamp((t - at) / 0.5));
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: F.display, fontWeight: weight, fontSize: size, letterSpacing: weight >= 800 ? '-.035em' : '-.01em', color, opacity: p, transform: `translateY(${(1 - p) * 24}px)`, textShadow: shadow}}>
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
  const fl = Math.max(bump(t, T.aber, 0.35) * 0.6, bump(t, T.xEins + 0.05, 0.4) * 0.5, bump(t, nullAt, 0.4) * 0.45, bump(t, T.dieEins + 0.4, 0.45) * 0.5);
  return fl > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.1 * fl}} /> : null;
};

/* ---------- Ton ---------- */

const SFX: [number, string, number][] = [
  [0, 'whoosh', 0.4],
  [0.1, 'tick', 0.3],
  [0.22, 'tick', 0.28],
  [0.34, 'tick', 0.26],
  [T.kleiner, 'buzz', 0.2],
  [T.aber, 'lock_hi', 0.45],
  [T.exakt, 'accent_small', 0.3],
  [T.egal - 0.05, 'whoosh', 0.26],
  [T.egal + 0.25, 'click', 0.28],
  [T.egal + 0.75, 'whoosh', 0.2],
  [T.fehlt + 0.25, 'whoosh', 0.2],
  [T.stimmt - 0.05, 'whoosh', 0.2],
  [T.jede + 0.15, 'tick', 0.3],
  [T.jede + 0.75, 'whoosh', 0.2],
  [T.hier + 0.05, 'swell', 0.3],
  [T.nennen + 0.1, 'click', 0.32],
  [T.zehn, 'whoosh', 0.24],
  [T.schiebt, 'whoosh', 0.26],
  [T.schiebt + 0.6, 'click', 0.3],
  [T.ziehen + 0.2, 'tick', 0.32],
  [T.partner + 0.3, 'rise', 0.26],
  [T.tilgen, 'collapse', 0.4],
  [T.uebrig + 0.15, 'lock', 0.38],
  [T.gleichNeun, 'click', 0.3],
  [T.xEins + 0.05, 'lock_hi', 0.5],
  [T.xEins + 0.05, 'accent', 0.35],
  [T.zurueck, 'whoosh', 0.26],
  [T.abstand - 0.1, 'whoosh', 0.24],
  [T.zehntel, 'tick', 0.32],
  [T.hundertstel, 'tick', 0.3],
  [T.tausendstel, 'tick', 0.28],
  [T.winzig + 0.35, 'rise', 0.24],
  [nullAt, 'lock_hi', 0.45],
  [T.unterwegs + 0.2, 'swell', 0.26],
  [T.dieEins + 0.4, 'lock', 0.42],
  [T.dieEins + 0.4, 'accent', 0.35],
  [T.cta - 0.1, 'swell', 0.34],
  ...Array.from({length: 8}, (_, i) => [T.tippt + i * 0.075, 'tick', 0.18] as [number, string, number]),
];

/* ---------- Komposition ---------- */

export type NNProps = {music: boolean; voice: boolean};

const LEAD = 0.08;
const TAIL = 0.1;

export const VideoNN: React.FC<NNProps> = ({music, voice}) => {
  useTexFonts();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={900} strength={0.85} />
      <Stage />
      <ParaReadout />
      <GapLines />
      <OneLabel />
      <RowA />
      <RowX />
      <Result />
      <FinalRow />
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
