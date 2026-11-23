import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C} from '../theme';
import {F, useTexFonts} from '../fonts';
import {bump, clamp, easeInOutCubic, easeOutExpo, lerp, prog, sec, springOS} from '../math';
import {V3} from '../space';
import {Backdrop, Grain, Mono, Tex, useSec} from '../ui';
import {PART, Scene} from './Canvas';
import {LEFT, RIGHT, TREE_C, TREE_L, axisVis, lenLabels, project} from './world';
import {CLIPS, MUSIC, SUBTITLES, T, TOTAL, VOICES} from './timeline';

const show = (t: number, at: number, d = 0.4) => easeOutExpo(clamp((t - at) / d));
const hide = (t: number, at: number, d = 0.35) => 1 - easeInOutCubic(clamp((t - at) / d));
const shadow = `0 0 14px ${C.bg}, 0 0 30px ${C.bg}`;
const glowOf = (color: string, g: number) => `0 0 ${12 + 30 * g}px ${color}${g > 0.01 ? 'CC' : '00'}, ${shadow}`;

const HEAD_Y = 345;
const LINE_Y = 486;

/* ---------- große Zeile oben ---------- */

const Line: React.FC<{from: number; to: number; y?: number; size?: number; pulseAt?: number; color?: string; children: React.ReactNode}> = ({from, to, y = LINE_Y, size = 80, pulseAt = -9, color = C.txt, children}) => {
  const t = useSec();
  const o = (from <= 0 ? 1 : show(t, from, 0.4)) * hide(t, to, 0.35);
  if (o <= 0.01) return null;
  const p = bump(t, pulseAt, 0.9);
  return (
    <div
      style={{
        position: 'absolute',
        left: 540,
        top: y,
        transform: `translate(-50%, -50%) translateY(${(1 - o) * 14}px) scale(${1 + 0.08 * p})`,
        opacity: o,
        fontFamily: F.display,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: '-.03em',
        color,
        textShadow: glowOf(color, p),
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );
};

const Hook: React.FC = () => {
  const t = useSec();
  const two = t >= T.zweiKugeln;
  const o = hide(t, T.wie, 0.35);
  if (o <= 0.01) return null;
  const p = bump(t, T.zweiKugeln + 0.1, 1.0);
  return (
    <div style={{position: 'absolute', left: 540, top: LINE_Y, transform: `translate(-50%, -50%) scale(${1 + 0.1 * p})`, opacity: o, fontFamily: F.display, fontWeight: 800, fontSize: 84, letterSpacing: '-.03em', whiteSpace: 'nowrap', textShadow: glowOf(PART[1], p)}}>
      <span style={{color: C.txt}}>1 Kugel</span>
      {two ? <span style={{color: C.txt2}}> → </span> : null}
      {two ? <span style={{color: PART[1]}}>2 Kugeln</span> : null}
    </div>
  );
};

const At: React.FC<{t: number; q: V3; dx?: number; dy?: number; o: number; children: React.ReactNode}> = ({t, q, dx = 0, dy = 0, o, children}) => {
  if (o <= 0.01) return null;
  const [x, y] = project(t, q);
  return <div style={{position: 'absolute', left: clamp(x + dx, 80, 900), top: clamp(y + dy, 310, 1420), transform: 'translate(-50%, -50%)', opacity: o, textShadow: shadow, whiteSpace: 'nowrap'}}>{children}</div>;
};

const Labels: React.FC = () => {
  const t = useSec();
  const r = show(t, T.ohneHinzu + 0.2, 0.4) * hide(t, T.wie, 0.35);
  return (
    <AbsoluteFill>
      {[LEFT, RIGHT].map((c, i) => (
        <At key={i} t={t} q={[c[0], c[1], c[2] + 0.5]} dx={30} o={r}>
          <Tex tex="r" size={52} />
        </At>
      ))}
    </AbsoluteFill>
  );
};

// Baum: Längen 1 und ½; Kugel: welche Achse zu welchen Schritten gehört
const TreeText: React.FC = () => {
  const t = useSec();
  const l = lenLabels(t);
  const ax = axisVis(t);
  const lab = (x: number, y: number, tex: string, o: number) =>
    o > 0.01 ? (
      <div style={{position: 'absolute', left: TREE_C[0] + x * TREE_L, top: TREE_C[1] - y * TREE_L, transform: 'translate(-50%, -50%)', opacity: o, textShadow: shadow}}>
        <Tex tex={tex} size={44} />
      </div>
    ) : null;
  const axisLabel = (q: V3, a: string, b: string, ca: string, cb: string, o: number) => (
    <At t={t} q={q} o={o}>
      <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 36, textAlign: 'center', lineHeight: 1.15}}>
        <span style={{color: ca}}>{a}</span>
        <br />
        <span style={{color: cb}}>{b}</span>
      </div>
    </At>
  );
  return (
    <AbsoluteFill>
      {lab(0.5, -0.2, '1', l)}
      {lab(1.25, -0.2, '\\tfrac12', l)}
      {axisLabel([1.9, 0, 0], 'rechts', 'links', PART[0], PART[1], ax.a * hide(t, T.weg, 0.4))}
      {axisLabel([0, 0, 1.95], 'oben', 'unten', PART[2], PART[3], ax.b * hide(t, T.weg, 0.4))}
    </AbsoluteFill>
  );
};

/* ---------- Hinweis „symbolisch“ ---------- */

const Note: React.FC = () => {
  const t = useSec();
  const o = show(t, T.staub, 0.5) * hide(t, T.gold - 0.2, 0.4);
  if (o <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 540, top: 1392, transform: 'translate(-50%, -50%)', opacity: o * 0.85, fontFamily: F.mono, fontSize: 24, color: C.txt2, textShadow: shadow, whiteSpace: 'nowrap'}}>
      Darstellung symbolisch – die echten Teile kann man nicht zeichnen
    </div>
  );
};

/* ---------- Logo, CTA, Untertitel ---------- */

const LOGO_AT = 3;
const LogoMark: React.FC = () => {
  const t = useSec();
  const a = show(t, LOGO_AT, 0.7);
  if (a <= 0) return null;
  const k = prog(t, T.cta, 0.9);
  const size = lerp(60, 248, k);
  const cx = lerp(72 + 30, 540, k);
  const cy = lerp(HEAD_Y, 700, k);
  const glint = clamp((t - LOGO_AT) / 1.1);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, opacity: a * lerp(0.86, 1, k)}}>
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
      <div style={{position: 'absolute', left: 148, top: HEAD_Y, transform: 'translateY(-50%)', opacity: a * hide(t, T.cta, 0.35) * 0.82, fontFamily: F.display, fontWeight: 700, fontSize: 32, letterSpacing: '-.01em', color: C.txt, textShadow: shadow}}>
        UniMathe
      </div>
    </AbsoluteFill>
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

const CUES = SUBTITLES.map(([a, b, text], i) => {
  const next = SUBTITLES[i + 1] ? SUBTITLES[i + 1][0] - 0.1 : Infinity;
  return {from: a - 0.05, to: Math.min(b + 0.3, next), text};
});
const SUB_TOP = 1446;
const Subtitles: React.FC = () => {
  const t = useSec();
  const c = CUES.find(({from, to}) => t >= from && t < to);
  if (!c) return null;
  const o = (t < 0.1 ? 1 : clamp((t - c.from) / 0.12)) * clamp((c.to - t) / 0.12);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: SUB_TOP, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{maxWidth: 800, padding: '8px 18px', borderRadius: 12, background: 'rgba(7,8,26,.62)', fontFamily: F.body, fontWeight: 500, fontSize: 30, lineHeight: 1.3, color: 'rgba(243,244,251,.88)', textAlign: 'center'}}>{c.text}</div>
    </div>
  );
};

const LOCK = T.drehung + 0.5;
const Flash: React.FC = () => {
  const t = useSec();
  const f = Math.max(bump(t, 0, 0.22) * 0.6, bump(t, T.zerlege, 0.35) * 0.6, bump(t, T.zweiKugeln + 0.1, 0.45), bump(t, T.ganzer + 0.05, 0.4) * 0.6, bump(t, T.genauso + 0.6, 0.4) * 0.5, bump(t, LOCK, 0.4) * 0.6, bump(t, T.zweiK + 0.1, 0.45) * 0.9);
  return f > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.1 * f}} /> : null;
};

/* ---------- Ton ---------- */

const SFX: [number, string, number][] = [
  [0, 'accent_small', 0.35],
  [T.zerlege, 'collapse', 0.45],
  [T.zerlege + 0.05, 'whoosh', 0.4],
  [T.aber, 'rise', 0.26],
  [T.zweiKugeln + 0.05, 'lock_hi', 0.5],
  [T.zweiKugeln + 0.1, 'accent', 0.4],
  [T.satz, 'tick', 0.3],
  [T.wie - 0.05, 'whoosh', 0.28],
  [T.punkt, 'click', 0.3],
  [T.rechts - 0.1, 'tick', 0.3],
  [T.links - 0.05, 'tick', 0.3],
  [T.oben, 'tick', 0.3],
  [T.unten, 'tick', 0.3],
  [T.drei + 0.15, 'tick', 0.3],
  [T.zurueck, 'buzz', 0.16],
  [T.baum - 0.2, 'rise', 0.24],
  [T.schritt, 'whoosh', 0.28],
  [T.ganzer + 0.05, 'lock_hi', 0.48],
  [T.zusammen, 'click', 0.3],
  [T.genauso + 0.6, 'lock', 0.42],
  [T.kugel - 0.5, 'whoosh', 0.28],
  [T.achse1 + 0.15, 'whoosh', 0.2],
  [T.achse2 + 0.15, 'whoosh', 0.2],
  [T.weg + 0.1, 'rise', 0.22],
  [T.verschieben + 0.3, 'swell', 0.28],
  [LOCK, 'lock_hi', 0.45],
  [T.waehlt + 0.3, 'tick', 0.32],
  [T.axiom, 'accent_small', 0.4],
  [T.staub, 'collapse', 0.35],
  [T.drehen, 'rise', 0.3],
  [T.zweiK + 0.1, 'lock_hi', 0.5],
  [T.zweiK + 0.12, 'accent', 0.42],
  [T.volumen, 'buzz', 0.22],
  [T.gold, 'click', 0.3],
  [T.cta - 0.1, 'swell', 0.34],
  ...Array.from({length: 8}, (_, i) => [T.tippt + 0.2 + i * 0.075, 'tick', 0.18] as [number, string, number]),
];

const LEAD = 0.08;
const TAIL = 0.1;

export type BTProps = {music: boolean; voice: boolean};

export const VideoBT: React.FC<BTProps> = ({music, voice}) => {
  useTexFonts();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={930} strength={0.85} />
      <Scene />
      <Labels />
      <TreeText />
      <Hook />
      <Line from={T.trick} to={T.wie} y={LINE_Y + 92} size={40} color={C.txt2}>
        Satz von Banach–Tarski, 1924
      </Line>
      <Line from={T.satz + 0.4} to={T.wie} y={LINE_Y + 146} size={40} color={C.txt2}>
        5 Teile genügen
      </Line>
      <Line from={T.genauso + 0.55} to={T.kugel - 0.5} pulseAt={T.genauso + 0.6}>
        4 Äste <span style={{color: C.txt2}}>→</span> 2 Bäume
      </Line>
      <Line from={T.verschieben} to={T.jederPunkt + 0.2} size={58}>
        Ast verschieben = Kugel drehen
      </Line>
      <Line from={T.axiom - 0.1} to={T.staub + 0.3} pulseAt={T.axiom} color={PART[0]}>
        Auswahlaxiom
      </Line>
      <Line from={T.zweiK} to={T.haken - 0.1} pulseAt={T.zweiK + 0.1} color={PART[1]}>
        2 Kugeln
      </Line>
      <VolumeLine />
      <Line from={T.gold + 0.1} to={T.cta - 0.3} size={60}>
        Mathematik ja, <span style={{color: PART[0]}}>Physik nein</span>
      </Line>
      <Note />
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

// „Volumen = ?“ flackert
const VolumeLine: React.FC = () => {
  const t = useSec();
  const o = show(t, T.volumen + 0.3, 0.4) * hide(t, T.gold - 0.1, 0.35);
  if (o <= 0.01) return null;
  const flick = 0.75 + 0.25 * Math.sin(t * 23) * Math.sin(t * 7.3);
  return (
    <div style={{position: 'absolute', left: 540, top: LINE_Y, transform: 'translate(-50%, -50%)', opacity: o, whiteSpace: 'nowrap', fontFamily: F.display, fontWeight: 800, fontSize: 84, letterSpacing: '-.03em', color: C.txt, textShadow: shadow}}>
      Volumen = <span style={{color: PART[1], opacity: flick, textShadow: glowOf(PART[1], 0.6)}}>?</span>
    </div>
  );
};

export const TOTAL_BT = TOTAL;
