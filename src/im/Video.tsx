// Aha-Video „Kann man sich eine Zahl ausdenken? – die imaginäre Zahl i“ – Overlays über der Canvas-Bühne.
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C, MARGIN, W} from '../theme';
import {F, useTexFonts} from '../fonts';
import {bump, clamp, easeInOutCubic, easeOutExpo, lerp, prog, sec, springOS} from '../math';
import {Backdrop, Grain, Mono, Tex, useSec} from '../ui';
import {COL, Stage} from './Canvas';
import {CLIPS, MUSIC, SUBTITLES, T, VOICE} from './timeline';
import {A, IMPACT, camAt, iHeight, pulse, toS, vis} from './world';

const show = (t: number, at: number, d = 0.4) => easeOutExpo(clamp((t - at) / d));
const hide = (t: number, at: number, d = 0.35) => 1 - easeInOutCubic(clamp((t - at) / d));
const shadow = `0 0 14px ${C.bg}, 0 0 30px ${C.bg}`;
const tc = (hex: string, s: string) => `\\textcolor{${hex}}{${s}}`;
const I = tc(C.eig, 'i');

/* ---------- Bausteine ---------- */

// zentrierte Formelzeile mit Ein- und Ausblenden
const Line: React.FC<{y: number; at: number; out?: number; size: number; tex: string; glow?: number; x?: number}> = ({y, at, out = Infinity, size, tex, glow = 0, x = 540}) => {
  const t = useSec();
  const p = show(t, at, 0.45) * hide(t, out, 0.3);
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translateY(${(1 - p) * 16}px) scale(${1 + 0.06 * glow})`,
        opacity: p,
        color: C.txt,
        whiteSpace: 'nowrap',
        filter: `drop-shadow(0 0 ${10 + 26 * glow}px ${glow > 0 ? C.eig + '99' : C.bg})`,
        padding: `${size * 0.18}px ${size * 0.5}px`,
        background: 'radial-gradient(closest-side, rgba(7,8,26,.9) 55%, rgba(7,8,26,0) 100%)',
      }}
    >
      <Tex tex={tex} size={size} />
    </div>
  );
};

const Caption: React.FC<{y: number; at: number; out?: number; color?: string; children: React.ReactNode}> = ({y, at, out = Infinity, color = C.txt2, children}) => {
  const t = useSec();
  const p = show(t, at, 0.4) * hide(t, out, 0.3);
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, transform: 'translateY(-50%)', textAlign: 'center', fontFamily: F.mono, fontWeight: 600, fontSize: 25, letterSpacing: '.12em', color, opacity: p, textShadow: shadow, whiteSpace: 'nowrap'}}>
      <span style={{background: 'rgba(7,8,26,.85)', padding: '4px 14px', borderRadius: 8}}>{children}</span>
    </div>
  );
};

const Tag: React.FC<{x: number; y: number; o: number; color: string; size?: number; anchor?: 'left' | 'center' | 'right'; children: React.ReactNode; font?: string; weight?: number}> = ({x, y, o, color, size = 40, anchor = 'center', children, font = F.display, weight = 800}) =>
  o > 0 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0'}, -50%)`,
        fontFamily: font,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: '-.01em',
        color,
        opacity: o,
        textShadow: shadow,
        whiteSpace: 'nowrap',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {children}
    </div>
  ) : null;

/* ---------- das große i ---------- */

const GLYPH = 220;
const Glyph: React.FC = () => {
  const t = useSec();
  const o = vis.glyph(t);
  if (o <= 0) return null;
  const cam = camAt(t);
  const h = iHeight(t);
  const snap = easeInOutCubic(clamp((t - T.iSnap) / 0.45));
  const size = lerp(GLYPH, 74, snap);
  const p = toS(cam, [0, h]);
  // unten auf der Geraden beim Aufprall, später mittig über der 0, nach dem Einrasten links oben neben dem Punkt
  const lift = (GLYPH / 2) * 0.82 * (1 - clamp(h));
  const bob = t > A(9) && snap < 1 ? 8 * Math.sin((t - A(9)) * 3.2) * (1 - snap) : 0;
  const x = p[0] + lerp(0, -56, snap);
  const y = p[1] - lift + bob + lerp(0, -46, snap);
  const sq = bump(t, IMPACT - 0.02, 0.32);
  const glow = pulse(t, T.iSnap, 0.8) + pulse(t, IMPACT, 0.6);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${1 + 0.18 * sq}, ${1 - 0.22 * sq})`,
        fontFamily: 'KaTeX_Math',
        fontStyle: 'italic',
        fontSize: size,
        lineHeight: 1,
        color: C.eig,
        opacity: o,
        textShadow: `0 0 ${24 + 40 * glow}px ${C.eig}aa, 0 0 70px ${C.eig}44`,
      }}
    >
      i
    </div>
  );
};

/* ---------- Problem: Beschriftung der Marker ---------- */

// 1² = 1 unter der 1, (−1)² = 1 unter der −1
const MarkerTags: React.FC = () => {
  const t = useSec();
  const cam = camAt(t);
  const s1 = toS(cam, [1, 0]);
  const sm = toS(cam, [-1, 0]);
  const o1 = vis.one(t) * show(t, T.eins + 0.35, 0.4);
  const om = vis.minusPt(t) * show(t, T.minus + 1.3, 0.4);
  return (
    <>
      <Tag x={s1[0]} y={s1[1] + 112} o={o1} color={COL.im} size={48}>
        1² = 1
      </Tag>
      <Tag x={sm[0]} y={sm[1] + 112} o={om} color={COL.im} size={48}>
        (−1)² = 1
      </Tag>
    </>
  );
};

/* ---------- Geschichte: (2 + i) + (2 − i) = 4 ---------- */

const BIG = 92;
const measure = (() => {
  let ctx: CanvasRenderingContext2D | null = null;
  return (s: string, font: string) => {
    if (!ctx) ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return s.length * BIG * 0.5;
    ctx.font = font;
    return ctx.measureText(s).width;
  };
})();

const Bombelli: React.FC = () => {
  const t = useSec();
  const o = show(t, T.bombelli + 0.05, 0.4) * hide(t, A(9) - 0.3, 0.35);
  const fontN = `800 ${BIG}px ${F.display}`;
  const fontI = `italic ${BIG}px KaTeX_Math`;
  // Teile: „(2 “ „+ i“ „) + (2 “ „− i“ „)“
  const w = useMemo(() => {
    const a = measure('(2 ', fontN);
    const b1 = measure('+ ', fontN) + measure('i', fontI);
    const c = measure(') + (2 ', fontN);
    const b2 = measure('− ', fontN) + measure('i', fontI);
    const d = measure(')', fontN);
    return {a, b1, c, b2, d, total: a + b1 + c + b2 + d};
  }, [fontN, fontI]);
  if (o <= 0) return null;
  const k = easeInOutCubic(clamp((t - T.echte) / 0.45));
  const gone = clamp((t - T.echte - 0.32) / 0.15);
  const left = 540 - w.total / 2;
  const c1 = left + w.a + w.b1 / 2;
  const c2 = left + w.a + w.b1 + w.c + w.b2 / 2;
  const mid = (c1 + c2) / 2;
  const y = 890;
  const lift = -45 * Math.sin(Math.PI * k);
  const ia = 1 - gone;
  const rest = 1 - clamp((t - T.echte - 0.45) / 0.25);
  const res = show(t, T.echte + 0.55, 0.45);
  const span = (s: string, color = C.txt) => <span style={{color}}>{s}</span>;
  const iSpan = (sign: string) => (
    <>
      {sign} <span style={{fontFamily: 'KaTeX_Math', fontStyle: 'italic', fontWeight: 400, color: C.eig}}>i</span>
    </>
  );
  const flash = bump(t, T.echte + 0.35, 0.5);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      {rest > 0 ? (
        <div style={{position: 'absolute', left, top: y, transform: 'translateY(-50%)', fontFamily: F.display, fontWeight: 800, fontSize: BIG, whiteSpace: 'pre', color: C.txt, textShadow: shadow, display: 'flex', opacity: rest}}>
          {span('(2 ')}
          <span style={{display: 'inline-block', transform: `translate(${(mid - c1) * k}px, ${lift}px)`, opacity: ia, color: C.eig}}>{iSpan('+')}</span>
          {span(') + (2 ')}
          <span style={{display: 'inline-block', transform: `translate(${(mid - c2) * k}px, ${lift}px)`, opacity: ia, color: C.eig}}>{iSpan('−')}</span>
          {span(')')}
        </div>
      ) : null}
      {flash > 0 ? <div style={{position: 'absolute', left: mid - 120, top: y - 120 - 45, width: 240, height: 240, borderRadius: 999, background: `radial-gradient(circle, ${C.eig}cc 0%, ${C.eig}00 70%)`, opacity: flash}} /> : null}
      {res > 0 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: y, transform: `translateY(-50%) scale(${0.9 + 0.1 * res})`, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: BIG, color: C.txt, opacity: res, textShadow: shadow, whiteSpace: 'nowrap'}}>
          2 + 2 = <span style={{color: COL.real, textShadow: `0 0 ${30 + 40 * pulse(t, T.echte + 0.55, 1)}px ${COL.real}88, ${shadow}`}}>4</span>
        </div>
      ) : null}
    </div>
  );
};

// √−121 flackert als „unmögliche“ Zahl in der Lösungsformel
const Root121: React.FC = () => {
  const t = useSec();
  const o = show(t, T.formel, 0.3) * hide(t, T.bombelli - 0.05, 0.25);
  if (o <= 0) return null;
  const fl = 0.8 + 0.2 * Math.sin(t * 31) * Math.sin(t * 7);
  return (
    <div style={{position: 'absolute', left: 540, top: 890, transform: `translate(-50%, -50%) translateX(${2 * Math.sin(t * 47)}px)`, opacity: o * fl, color: COL.bad, filter: `drop-shadow(0 0 18px ${COL.bad}aa)`}}>
      <Tex tex="\sqrt{-121}" size={96} />
    </div>
  );
};

/* ---------- Ebene: Achsenbeschriftung, Bögen, Paare ---------- */

const PlaneTags: React.FC = () => {
  const t = useSec();
  const cam = camAt(t);
  const o = toS(cam, [0, 0]);
  const la = vis.axisLabels(t);
  const arcs = vis.arcs(t) * show(t, T.zwei, 0.4) * hide(t, A(19), 0.3);
  const r = 0.27 * cam.u;
  const pairs = show(t, T.paar, 0.4) * hide(t, A(21) - 0.1, 0.4);
  const p1 = toS(cam, [1, 0]);
  const pm = toS(cam, [-1, 0]);
  const pi = toS(cam, [0, 1]);
  const pp = (at: number) => pulse(t, at, 0.8);
  return (
    <>
      <Tag x={W - MARGIN - 40} y={o[1] - 44} o={la} color={COL.real} size={30} anchor="right" font={F.body} weight={600}>
        reell
      </Tag>
      <Tag x={o[0] + 26} y={o[1] + 0.75 * cam.u} o={la} color={COL.im} size={30} anchor="left" font={F.body} weight={600}>
        imaginär
      </Tag>
      <Tag x={o[0] + r * Math.cos(Math.PI / 4)} y={o[1] - r * Math.sin(Math.PI / 4)} o={arcs} color={C.txt} size={30}>
        90°
      </Tag>
      <Tag x={o[0] - r * Math.cos(Math.PI / 4)} y={o[1] - r * Math.sin(Math.PI / 4)} o={arcs} color={C.txt} size={30}>
        90°
      </Tag>
      <Tag x={p1[0]} y={p1[1] + 100} o={pairs} color={COL.real} size={38 * (1 + 0.15 * pp(T.paar + 0.2))}>
        (1, 0)
      </Tag>
      <Tag x={pi[0] + 30} y={pi[1] - 46} o={pairs} color={COL.im} size={38 * (1 + 0.15 * pp(T.regeln))} anchor="left">
        (0, 1)
      </Tag>
      <Tag x={pm[0]} y={pm[1] + 100} o={pairs} color={COL.real} size={38 * (1 + 0.15 * pp(T.regeln + 0.6))}>
        (−1, 0)
      </Tag>
    </>
  );
};

/* ---------- Formeln oben ---------- */

const Texts: React.FC = () => {
  const t = useSec();
  const quarter = `${tc(C.txt2, '\\cdot')}\\,${I}\\;=\\;\\text{Drehung um }90^\\circ`;
  return (
    <>
      {/* Hook */}
      <Line y={420} at={T.imag} out={A(2) - 0.1} size={130} tex={`${I}^2 = ${tc(COL.bad, '-1')}`} glow={pulse(t, T.imag, 0.8)} />
      {/* Problem */}
      <Caption y={318} at={A(2) + 0.1} out={T.kein - 0.1}>
        GESUCHT: EINE REELLE ZAHL x MIT
      </Caption>
      <Line y={450} at={A(2) + 0.15} out={T.kein - 0.1} size={120} tex={`${tc(COL.real, 'x')}^2 = ${tc(COL.bad, '-1')}\\;${tc(COL.bad, '?')}`} />
      <Caption y={318} at={T.kein} out={A(6) - 0.15} color={COL.im}>
        FÜR JEDE REELLE ZAHL x
      </Caption>
      <Line y={450} at={T.kein} out={A(6) - 0.15} size={120} tex={`${tc(COL.real, 'x')}^2 \\ge 0`} glow={pulse(t, T.kein, 0.9)} />
      <Line y={580} at={T.kein + 0.3} out={A(6) - 0.15} size={44} tex={`${tc(C.txt2, '+\\cdot+=+\\qquad -\\cdot-=+')}`} />
      {/* Geschichte */}
      <Caption y={560} at={T.jh} out={A(9) - 0.3}>
        16. JAHRHUNDERT
      </Caption>
      <Line y={665} at={T.jh + 0.35} out={A(9) - 0.3} size={84} tex="x^3 = 15x + 4" />
      <Caption y={790} at={T.formel - 0.25} out={T.bombelli - 0.1} color={COL.bad}>
        IN DER LÖSUNGSFORMEL:
      </Caption>
      <Caption y={790} at={T.bombelli} out={A(9) - 0.3} color={C.eig}>
        BOMBELLI RECHNET WEITER:
      </Caption>
      <Caption y={1010} at={T.echte + 0.9} out={A(9) - 0.3} color={COL.real}>
        4 IST EINE LÖSUNG: 4³ = 64 = 15 · 4 + 4
      </Caption>
      {/* Drehung */}
      <Line y={335} at={T.mult + 0.1} out={T.zwei - 0.05} size={54} tex={quarter} />
      <Line y={335} at={T.zwei} out={A(19) - 0.1} size={60} tex="90^\circ + 90^\circ = 180^\circ" glow={pulse(t, T.halbe, 0.9)} />
      <Line y={432} at={T.einsI + 0.95} out={A(19) - 0.1} size={66} tex={`${tc(COL.real, '1')}\\cdot ${I} = ${I}`} />
      <Line y={530} at={T.iMinus + 1.0} out={T.minus1 - 0.05} size={66} tex={`${I}\\cdot ${I} = ${tc(COL.real, '-1')}`} />
      <Line y={540} at={T.minus1} out={A(19) - 0.1} size={96} tex={`${I}^2 = -1`} glow={pulse(t, T.minus1, 1.1)} />
      {/* Paare */}
      <Caption y={330} at={T.paar} out={A(21) - 0.2}>
        JEDER PUNKT = PAAR REELLER ZAHLEN
      </Caption>
      <Caption y={420} at={T.regeln - 0.1} out={A(21) - 0.2} color={C.eig}>
        RECHENREGEL FÜR PAARE
      </Caption>
      <Line y={500} at={T.regeln} out={A(21) - 0.2} size={62} tex={`${tc(C.eig, '(0,\\,1)')}\\cdot${tc(C.eig, '(0,\\,1)')} = ${tc(COL.real, '(-1,\\,0)')}`} />
      <Caption y={585} at={T.widerspruch} out={A(21) - 0.2} color={COL.real}>
        ✓ OHNE WIDERSPRUCH
      </Caption>
    </>
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
  const fl = Math.max(bump(t, IMPACT - 0.02, 0.3) * 0.9, bump(t, T.echte + 0.35, 0.4) * 0.5, bump(t, T.minus1, 0.45) * 0.6, bump(t, T.iSnap, 0.35) * 0.35);
  return fl > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.1 * fl}} /> : null;
};

/* ---------- Ton ---------- */

const SFX: [number, string, number][] = [
  [0, 'whoosh', 0.45],
  [IMPACT - 0.02, 'collapse', 0.5],
  [IMPACT, 'lock', 0.35],
  [T.imag, 'tick', 0.35],
  [T.bogen, 'whoosh', 0.18],
  [A(2) - 0.1, 'whoosh', 0.24],
  [T.minusEins, 'buzz', 0.18],
  [T.eins + 0.35, 'click', 0.3],
  [T.minus + 0.3, 'whoosh', 0.22],
  [T.minus + 1.3, 'click', 0.32],
  [T.kein, 'lock', 0.4],
  [A(6) - 0.1, 'whoosh', 0.28],
  [T.jh + 0.35, 'tick', 0.3],
  [T.formel, 'buzz', 0.22],
  [T.bombelli, 'click', 0.3],
  [T.echte + 0.3, 'lock_hi', 0.45],
  [A(9) - 0.25, 'whoosh', 0.3],
  [T.achse, 'rise', 0.24],
  [T.senkrecht + 0.1, 'tick', 0.3],
  [T.iSnap, 'lock', 0.4],
  [T.mult + 0.2, 'tick', 0.3],
  [T.einsI + 0.15, 'whoosh', 0.28],
  [T.einsI + 0.95, 'click', 0.35],
  [T.iMinus + 0.15, 'whoosh', 0.28],
  [T.iMinus + 1.0, 'click', 0.35],
  [T.halbe, 'swell', 0.3],
  [T.minus1, 'lock_hi', 0.5],
  [T.minus1, 'accent', 0.4],
  [T.paar, 'tick', 0.3],
  [T.regeln, 'tick', 0.3],
  [T.widerspruch, 'lock', 0.35],
  [T.also, 'swell', 0.28],
  [T.cta - 0.1, 'swell', 0.34],
  ...Array.from({length: 8}, (_, i) => [T.tippt + i * 0.075, 'tick', 0.18] as [number, string, number]),
];

/* ---------- Komposition ---------- */

export type IMProps = {music: boolean; voice: boolean};

const LEAD = 0.08;
const TAIL = 0.1;

export const VideoIM: React.FC<IMProps> = ({music, voice}) => {
  useTexFonts();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={1000} strength={0.85} />
      <Stage />
      <MarkerTags />
      <PlaneTags />
      <Glyph />
      <Texts />
      <Root121 />
      <Bombelli />
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

