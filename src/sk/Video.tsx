import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C} from '../theme';
import {F, useTexFonts} from '../fonts';
import {bump, clamp, easeInOutCubic, easeOutExpo, fmtDe, lerp, prog, sec, springOS} from '../math';
import {Backdrop, Grain, Mono, Tex, col, useSec} from '../ui';
import {V3} from '../space';
import {COL, Scene} from './Canvas';
import {alphaAt, cosDeg, dotValue, lenA, lenB, project, shadowLen, tipA, vis} from './world';
import {MUSIC, SFX, SUBTITLES, T, TOTAL, V, VOICE, VOICE_CUTS} from './timeline';

const show = (t: number, at: number, d = 0.4) => easeOutExpo(clamp((t - at) / d));
const hide = (t: number, at: number, d = 0.35) => 1 - easeInOutCubic(clamp((t - at) / d));
const shadow = `0 0 14px ${C.bg}, 0 0 30px ${C.bg}`;

const A_ = col(COL.a, 'a');
const B_ = col(COL.b, 'b');
const AB = `${A_}\\cdot ${B_}`;

const fmtVal = (x: number) => (x < 0.05 ? '0' : fmtDe(x, 1));

/* ---------- Beschriftungen auf der Bühne ---------- */

const Label3: React.FC<{t: number; q: V3; dx?: number; dy?: number; o: number; children: React.ReactNode}> = ({t, q, dx = 0, dy = 0, o, children}) => {
  if (o <= 0) return null;
  const [x, y] = project(t, q);
  return (
    <div style={{position: 'absolute', left: clamp(x + dx, 90, 880), top: clamp(y + dy, 310, 1400), transform: 'translate(-50%, -50%)', opacity: o, textShadow: shadow, whiteSpace: 'nowrap'}}>
      {children}
    </div>
  );
};

const StageLabels: React.FC = () => {
  const t = useSec();
  const tip = tipA(t);
  const stage = hide(t, T.cta - 0.3, 0.4);
  const names = hide(t, T.egal - 0.1, 0.3) * stage + show(t, T.nennt + 0.2, 0.4) * stage * (t > T.nennt ? 1 : 0);
  const top = prog(t, T.bei90 + 0.3, 0.5) * (1 - prog(t, T.senk - 0.1, 0.5));
  const lenTag = (at: number) => show(t, at, 0.35) * hide(t, T.warum - 0.2, 0.3);
  const arc = vis.arc(t) * (1 - top) * stage;
  const sh = vis.shadow(t) * clamp(shadowLen(t) - 0.9) * (1 - top) * hide(t, T.egal - 0.3, 0.3) * stage * (t < T.formel ? 1 : show(t, T.dieser, 0.4));
  const a = alphaAt(t);
  const m = (a * Math.PI) / 360;
  return (
    <AbsoluteFill>
      <Label3 t={t} q={tip} dx={lerp(26, 62, a / 90)} dy={lerp(-54, 8, a / 90)} o={names * (1 - top)}>
        <Tex tex={A_} size={68} />
      </Label3>
      <Label3 t={t} q={[lenB(t) - 0.2, 0, 0]} dy={-54} dx={8} o={names}>
        <Tex tex={B_} size={68} />
      </Label3>
      <Label3 t={t} q={[Math.cos(m) * 1.95, 0, Math.sin(m) * 1.95]} o={arc * clamp(a / 8)}>
        <Tex tex="\alpha" size={50} />
      </Label3>
      <Label3 t={t} q={[tip[0] / 2, 0, tip[2] / 2]} dx={118} dy={-10} o={lenTag(T.obwohl)}>
        <Tex tex={`|${A_}|=4`} size={46} />
      </Label3>
      <Label3 t={t} q={[3, 0, 0]} dy={58} o={lenTag(T.verschw1 - 0.2)}>
        <Tex tex={`|${B_}|=6`} size={46} />
      </Label3>
      <Label3 t={t} q={[shadowLen(t) / 2, -1.05, 0]} o={sh * (t < T.formel ? 1 : hide(t, T.malb, 0.3))}>
        <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 40, color: COL.sh}}>Schatten</div>
      </Label3>
      <Label3 t={t} q={[shadowLen(t) / 2, -lenB(t) * vis.rectDepth(t) * 0.55, 0]} o={show(t, T.flaeche, 0.4) * hide(t, T.bei90b + 0.3, 0.3)}>
        <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 44, color: C.txt}}>Fläche</div>
      </Label3>
    </AbsoluteFill>
  );
};

/* ---------- Oben: Live-Zahl, „Warum?“, Formel ---------- */

const CX = 510;

const Readout: React.FC = () => {
  const t = useSec();
  const o = hide(t, T.warum - 0.1, 0.2) + show(t, T.sk, 0.3) * hide(t, T.formel - 0.2, 0.3) * (t > T.warum + 0.3 ? 1 : 0);
  if (o <= 0) return null;
  const v = dotValue(t);
  const zero = Math.max(bump(t, T.null1, 0.9), bump(t, T.verschw2 + 0.32, 0.9));
  return (
    <div
      style={{
        position: 'absolute',
        left: CX,
        top: 470,
        transform: `translate(-50%, -50%) scale(${1 + 0.16 * zero})`,
        opacity: o,
        textShadow: `0 0 ${30 + 40 * zero}px rgba(243,244,251,${0.2 + 0.5 * zero}), ${shadow}`,
        whiteSpace: 'nowrap',
      }}
    >
      <Tex tex={`${AB}=\\;${fmtVal(v).replace(',', '{,}')}`} size={92} />
    </div>
  );
};

const Warum: React.FC = () => {
  const t = useSec();
  const o = show(t, T.warum - 0.05, 0.25) * hide(t, T.sk - 0.15, 0.25);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: CX, top: 470, transform: `translate(-50%, -50%) scale(${0.94 + 0.06 * o})`, opacity: o, fontFamily: F.display, fontWeight: 800, fontSize: 118, letterSpacing: '-.03em', color: C.txt, textShadow: shadow}}>
      Warum?
    </div>
  );
};

const ROW1 = 432;
const ROW2 = 548;
const FS = 64;
// Formelteile: Mitte in x und Zeitpunkt, an dem sie von ihrem Objekt in die Zeile fliegen
const PIECES = [
  {key: 'a', x: 382, at: T.fzeile},
  {key: 'b', x: 520, at: T.fzeile + 0.3},
  {key: 'c', x: 748, at: T.fzeile + 0.6},
];

const FormulaRow: React.FC = () => {
  const t = useSec();
  const start = T.formel + 0.2;
  const o = hide(t, T.nennt - 0.25, 0.3);
  if (t < start || o <= 0) return null;
  const tip = tipA(t);
  const srcs: Record<string, [number, number]> = {
    a: project(t, [tip[0] / 2, 0, tip[2] / 2]),
    b: project(t, [3, 0, 0]),
    c: project(t, [1.6, 0, 0.9]),
  };
  const glowShadow = prog(t, T.betrag - 0.05, 0.35) * hide(t, T.malb - 0.1, 0.4);
  const glowB = prog(t, T.malb, 0.35) * hide(t, T.bei90b, 0.4);
  const texOf = (k: string) => {
    if (k === 'a') return `|${A_}|`;
    if (k === 'b') return `|${B_}|`;
    return '\\cos(\\alpha)';
  };
  const row2 = show(t, T.bei90b + 0.1, 0.35);
  const c = cosDeg(alphaAt(t));
  const cTxt = c < 0.005 ? '0' : fmtDe(c, 2).replace(',', '{,}');
  const va = Math.round(lenA(t));
  const vb = Math.round(lenB(t));
  const zero = bump(t, T.null3, 0.9);
  const under = show(t, T.dieser - 0.1, 0.5) * hide(t, T.malb - 0.1, 0.35);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 92, top: ROW1, transform: 'translateY(-50%)', opacity: show(t, start, 0.4), textShadow: shadow}}>
        <Tex tex={`${AB}=`} size={FS} />
      </div>
      {[0, 1].map((k) => (
        <div key={k} style={{position: 'absolute', left: k ? 594 : 452, top: ROW1, transform: 'translate(-50%, -50%)', opacity: show(t, PIECES[k + 1].at + 0.5, 0.3), textShadow: shadow}}>
          <Tex tex="\cdot" size={FS} />
        </div>
      ))}
      {PIECES.map(({key, x, at}) => {
        const fly = easeInOutCubic(clamp((t - at) / 0.65));
        const p = show(t, at, 0.2);
        if (p <= 0) return null;
        const [sx, sy] = srcs[key];
        const g = key === 'b' ? glowB : glowShadow;
        const color = key === 'b' ? COL.b : COL.sh;
        const glow = `0 0 ${10 + 24 * g}px ${color}${g > 0.01 ? 'CC' : '00'}`;
        return (
          <div key={key} style={{position: 'absolute', left: lerp(sx, x, fly), top: lerp(sy, ROW1, fly), transform: `translate(-50%, -50%) scale(${1 + 0.1 * g})`, opacity: p, textShadow: `${glow}, ${shadow}`}}>
            <Tex tex={key === 'c' && g > 0.5 ? col(COL.sh, texOf(key)) : texOf(key)} size={FS} />
          </div>
        );
      })}
      {under > 0 ? (
        <>
          <svg width={500} height={70} style={{position: 'absolute', left: 340, top: ROW1 + 44, opacity: under, overflow: 'visible'}}>
            <path d="M 42 2 Q 42 34 80 34 L 368 34 Q 408 34 408 2" fill="none" stroke={COL.sh} strokeWidth={4} strokeLinecap="round" />
          </svg>
          <div style={{position: 'absolute', left: 565, top: ROW1 + 112, transform: 'translate(-50%, -50%)', opacity: under, fontFamily: F.display, fontWeight: 700, fontSize: 42, color: COL.sh, textShadow: shadow}}>
            der Schatten
          </div>
        </>
      ) : null}
      {row2 > 0 ? (
        <div style={{position: 'absolute', left: 226, top: ROW2, transform: `translateY(-50%) scale(${1 + 0.06 * zero})`, transformOrigin: 'left center', opacity: row2, textShadow: `0 0 ${20 + 40 * zero}px rgba(243,244,251,${0.5 * zero}), ${shadow}`, whiteSpace: 'nowrap'}}>
          <Tex tex={`=\\;${va}\\cdot ${vb}\\cdot ${col(COL.sh, cTxt)}\\;=\\;${fmtVal(dotValue(t)).replace(',', '{,}')}`} size={60} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const Ortho: React.FC = () => {
  const t = useSec();
  const p = springOS(clamp((t - (T.nennt + 0.1)) / 0.7));
  const o = clamp(p * 1.4) * hide(t, T.cta - 0.25, 0.3);
  if (o <= 0) return null;
  const w = show(t, T.ortho, 0.5);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: CX, top: 448, transform: `translate(-50%, -50%) scale(${0.8 + 0.2 * p})`, textShadow: `0 0 34px rgba(243,244,251,.3), ${shadow}`, whiteSpace: 'nowrap'}}>
        <Tex tex={`${A_}\\perp ${B_}`} size={124} />
      </div>
      <div style={{position: 'absolute', left: CX, top: 580, transform: `translate(-50%, -50%) translateY(${(1 - w) * 22}px)`, opacity: w, fontFamily: F.display, fontWeight: 800, fontSize: 76, letterSpacing: '-.025em', color: C.txt, textShadow: shadow}}>
        Orthogonalität
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Logo: ab Sekunde 3 dezent, im CTA in die Mitte ---------- */

const LOGO_AT = 3;
const LogoMark: React.FC = () => {
  const t = useSec();
  const a = show(t, LOGO_AT, 0.7);
  if (a <= 0) return null;
  const k = prog(t, T.cta, 0.9);
  const size = lerp(60, 248, k);
  const cx = lerp(72 + 30, 540, k);
  const cy = lerp(342, 700, k);
  const glint = clamp((t - LOGO_AT) / 1.1);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, opacity: a * lerp(0.86, 1, k)}}>
        <Img
          src={staticFile('unimathe-logo.webp')}
          style={{width: size, height: size, borderRadius: size * 0.223, boxShadow: `0 ${10 + 20 * k}px ${30 + 60 * k}px rgba(30,139,219,${0.25 + 0.2 * k})`, display: 'block'}}
        />
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
      <div style={{position: 'absolute', left: 148, top: 342, transform: 'translateY(-50%)', opacity: a * hide(t, T.cta, 0.35) * 0.82, fontFamily: F.display, fontWeight: 700, fontSize: 32, letterSpacing: '-.01em', color: C.txt, textShadow: shadow}}>
        UniMathe
      </div>
    </AbsoluteFill>
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
  const n = Math.max(0, Math.min(word.length, Math.floor((t - T.tippt - 0.2) / 0.075) + 1));
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
  const from = V(a) - 0.05;
  const next = SUBTITLES[i + 1] ? V(SUBTITLES[i + 1][0]) - 0.1 : Infinity;
  return {from, to: Math.min(V(b) + 0.3, next), text};
});

// liegt über der Bildunterschrift von TikTok, Reels und Shorts
const SUB_TOP = 1446;

const Subtitles: React.FC = () => {
  const t = useSec();
  const c = CUES.find(({from, to}) => t >= from && t < to);
  if (!c) return null;
  const o = (t < 0.1 ? 1 : clamp((t - c.from) / 0.12)) * clamp((c.to - t) / 0.12);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: SUB_TOP, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div
        style={{
          maxWidth: 800,
          padding: '8px 18px',
          borderRadius: 12,
          background: 'rgba(7,8,26,.62)',
          fontFamily: F.body,
          fontWeight: 500,
          fontSize: 30,
          lineHeight: 1.3,
          color: 'rgba(243,244,251,.88)',
          textAlign: 'center',
        }}
      >
        {c.text}
      </div>
    </div>
  );
};

const Flash: React.FC = () => {
  const t = useSec();
  const f = Math.max(bump(t, 0, 0.22) * 0.8, bump(t, T.null1, 0.42), bump(t, T.verschw2 + 0.32, 0.4) * 0.8, bump(t, T.kosnull, 0.4) * 0.7, bump(t, T.ortho + 0.3, 0.4) * 0.5);
  return f > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.11 * f}} /> : null;
};

/* ---------- Komposition ---------- */

// Die Sprachdatei in Stücke zwischen den Schnitten teilen; jedes Stück startet um die bisher entfernte Stille früher
const PARTS = [[0, 0] as [number, number], ...VOICE_CUTS].map(([c, d], i) => ({
  from: c + d,
  to: VOICE_CUTS[i] ? VOICE_CUTS[i][0] : Infinity,
  shift: VOICE_CUTS.slice(0, i).reduce((s, [, g]) => s + g, 0),
}));

export type SKProps = {music: boolean; voice: boolean};

export const VideoSK: React.FC<SKProps> = ({music, voice}) => {
  useTexFonts();
  const t = useSec();
  const inLight = vis.light(t);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={500} gy={1040} strength={0.8 + 0.3 * inLight} />
      <Scene />
      <StageLabels />
      <Readout />
      <Warum />
      <FormulaRow />
      <Ortho />
      <Outro />
      <LogoMark />
      <Subtitles />
      <Flash />
      <Grain />
      {SFX.map(([at, name, vol], i) => (
        <Sequence key={`sfx-${i}`} from={sec(at)} durationInFrames={sec(3.5)} layout="none">
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol * (voice ? 0.55 : 0.8)} />
        </Sequence>
      ))}
      {music ? <Audio src={staticFile(MUSIC)} volume={voice ? 0.32 : 0.6} /> : null}
      {voice
        ? PARTS.map(({from, to, shift}) => (
            <Sequence key={from} from={sec(from - shift)} durationInFrames={Number.isFinite(to) ? sec(to - from) : sec(TOTAL - (from - shift))} layout="none">
              <Audio src={staticFile(VOICE)} trimBefore={sec(from)} trimAfter={Number.isFinite(to) ? sec(to) : undefined} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
