import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import {C, MARGIN} from '../theme';
import {bump, clamp, easeOutExpo, fmtDe, prog, sec, springOS} from '../math';
import {F} from '../fonts';
import {Backdrop, Grain, Headline, MatrixView, Mono, useSec} from '../ui';
import {Plane} from './Plane';
import {apply, camAt, det, matrixAt, toScr} from './state';
import {MUSIC, SFX, SUBTITLES, T, VOICE} from './timeline';

const fade = (t: number, a: number, b: number, d = 0.3) => prog(t, a, d) * (1 - prog(t, b, d));
const nice = (x: number, digits: number) => (Math.abs(x - Math.round(x)) < 0.004 ? String(Math.round(x)) : fmtDe(x, digits));

/* Chip oben links: 2D ↔ 1D */
const DimChip: React.FC = () => {
  const t = useSec();
  const flat = (t >= T.hookHit && t < T.rewind + 0.45) || (t >= T.hit && t < T.cta + 0.7);
  const flips = [T.hookHit, T.rewind + 0.45, T.hit];
  const pop = Math.max(...flips.map((f) => bump(t, f, 0.45)));
  const o = 1 - prog(t, T.cta, 0.4);
  const color = flat ? C.lam : C.txt;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: MARGIN,
          top: 226,
          padding: '8px 18px',
          borderRadius: 12,
          border: `2px solid ${color}`,
          color,
          fontFamily: F.mono,
          fontWeight: 600,
          fontSize: 34,
          letterSpacing: '.04em',
          opacity: o,
          transform: `scale(${1 + 0.25 * pop})`,
          transformOrigin: '0% 50%',
          boxShadow: flat ? `0 0 ${24 + 30 * pop}px rgba(255,122,92,.35)` : 'none',
        }}
      >
        {flat ? '1D' : '2D'}
      </div>
      <Mono x={MARGIN + 132} y={244} at={T.rewindEnd} out={T.cta}>
        Lineare Algebra · Determinante
      </Mono>
    </>
  );
};

/* Fläche im Quadrat, wandert mit dem Parallelogramm */
const AreaLabel: React.FC = () => {
  const t = useSec();
  const o = fade(t, T.area1, T.hit - 0.25, 0.35);
  if (o <= 0) return null;
  const M = matrixAt(t);
  const [x, y] = toScr(camAt(t), apply(M, [0.5, 0.5]));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * easeOutExpo(clamp((t - T.area1) / 0.5))})`,
        fontFamily: F.display,
        fontWeight: 700,
        fontSize: 46,
        color: C.txt,
        opacity: o,
        whiteSpace: 'nowrap',
        textShadow: `0 0 14px ${C.bg}, 0 0 28px ${C.bg}`,
      }}
    >
      Fläche {nice(det(M), 2)}
    </div>
  );
};

/* Matrix und Determinanten-Zähler unten */
const DetPanel: React.FC = () => {
  const t = useSec();
  const o = fade(t, T.warp - 0.1, T.noArea, 0.4);
  if (o <= 0) return null;
  const M = matrixAt(t);
  const d = det(M);
  const tilting = t >= T.tease;
  const yEntry = tilting ? nice(M[1][1], 1) : '2';
  const cOn = prog(t, 10.4, 0.4);
  const glow = bump(t, T.det, 0.8);
  const zero = bump(t, T.hit, 0.8);
  const toZero = clamp((3 - d) / 3);
  const mx = 300;
  const my = 1290;
  const size = 40;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, height: 300, background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(7,8,26,.75), rgba(7,8,26,0))`}} />
      {tilting ? (
        <div
          style={{
            position: 'absolute',
            left: mx + size * 0.78 - 34,
            top: my + size * 0.685 - 30,
            width: 68,
            height: 60,
            borderRadius: 12,
            background: `rgba(255,122,92,${0.28 * prog(t, T.tease, 0.5)})`,
          }}
        />
      ) : null}
      <MatrixView x={mx} y={my} size={size} entries={[['2', '1'], ['1', yEntry]]} />
      <div
        style={{
          position: 'absolute',
          left: 556,
          top: my - 46,
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: 66,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          color: C.txt,
          opacity: cOn,
          whiteSpace: 'nowrap',
          transform: `scale(${1 + 0.08 * glow + 0.12 * zero})`,
          transformOrigin: '0% 50%',
          textShadow: `0 0 ${30 * glow + 40 * zero}px rgba(255,194,71,${0.7 * glow}), 0 0 ${40 * zero}px rgba(255,122,92,${0.8 * zero})`,
        }}
      >
        <span style={{color: C.txt2, fontWeight: 600}}>det = </span>
        <span style={{color: toZero > 0.99 ? C.lam : C.txt}}>{fmtDe(d, 2)}</span>
      </div>
      <Mono x={560} y={my - 92} at={T.det - 0.1} color={C.eig}>
        Determinante
      </Mono>
    </div>
  );
};

/* Abspann: Linie → Lichtpunkt → Logo */
const SearchPill: React.FC = () => {
  const t = useSec();
  const p = springOS(clamp((t - (T.search - 0.1)) / 0.7));
  if (p <= 0) return null;
  const word = 'UniMathe';
  const n = Math.max(0, Math.min(word.length, Math.floor((t - T.search - 0.35) / 0.075) + 1));
  const caret = Math.floor(t * 2.2) % 2 === 0 || n < word.length;
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - 300,
        top: 1290,
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

const Centered: React.FC<{y: number; at: number; size: number; color?: string; weight?: number; children: React.ReactNode}> = ({y, at, size, color = C.txt, weight = 800, children}) => {
  const t = useSec();
  const p = easeOutExpo(clamp((t - at) / 0.6));
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
        transform: `translateY(${(1 - p) * 30}px)`,
        filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

const Outro: React.FC = () => {
  const t = useSec();
  if (t < T.cta + 0.4) return null;
  const logo = springOS(clamp((t - (T.cta + 0.6)) / 0.9));
  const star = bump(t, T.cta + 0.55, 0.6);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 540 - 160,
          top: 800 - 160,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(243,244,251,${0.9 * star}) 0%, rgba(30,139,219,${0.35 * star}) 30%, rgba(30,139,219,0) 70%)`,
        }}
      />
      {logo > 0 ? (
        <Img
          src={staticFile('unimathe-logo.webp')}
          style={{
            position: 'absolute',
            left: 540 - 130,
            top: 800 - 130,
            width: 260,
            height: 260,
            borderRadius: 58,
            opacity: clamp(logo * 1.4),
            transform: `scale(${0.6 + 0.4 * logo})`,
            boxShadow: '0 30px 90px rgba(30,139,219,.4)',
          }}
        />
      ) : null}
      <Centered y={968} at={T.cta + 0.9} size={112}>
        UniMathe
      </Centered>
      <Centered y={1112} at={T.cta + 1.3} size={40} color={C.txt2} weight={600}>
        Mehr Aha-Momente. Klausuraufgaben zum Üben.
      </Centered>
      <Mono x={540} y={1236} at={T.search - 0.2} anchor="center" color={C.txt2}>
        Im App Store suchen
      </Mono>
      <SearchPill />
    </AbsoluteFill>
  );
};

/* Dezente Untertitel wie in Teil 2 */
const Subtitles: React.FC = () => {
  const t = useSec();
  const i = SUBTITLES.findIndex(([a], k) => t >= a - 0.05 && (k + 1 >= SUBTITLES.length || t < SUBTITLES[k + 1][0] - 0.05));
  if (i < 0) return null;
  const [a, b, text] = SUBTITLES[i];
  const end = Math.min(b + 0.35, SUBTITLES[i + 1] ? SUBTITLES[i + 1][0] - 0.05 : Infinity);
  if (t >= end) return null;
  const o = clamp((t - a + 0.05) / 0.12) * clamp((end - t) / 0.12);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 300, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div
        style={{
          maxWidth: 780,
          padding: '8px 18px',
          borderRadius: 12,
          background: 'rgba(7,8,26,.55)',
          fontFamily: F.body,
          fontWeight: 500,
          fontSize: 32,
          lineHeight: 1.3,
          color: 'rgba(243,244,251,.85)',
          textAlign: 'center',
        }}
      >
        {text}
      </div>
    </div>
  );
};

const Flash: React.FC = () => {
  const t = useSec();
  const f = Math.max(bump(t, T.hookHit - 0.02, 0.35), bump(t, T.hit - 0.02, 0.35));
  return f > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.14 * f}} /> : null;
};

export type DetProps = {music: boolean; voice: boolean};

export const VideoDet: React.FC<DetProps> = ({music, voice}) => (
  <AbsoluteFill style={{background: C.bg}}>
    <Backdrop gx={540} gy={880} strength={0.8} />
    <Plane />
    <Overlays />
    <Subtitles />
    <Flash />
    <Grain />
    {SFX.map(([at, name, vol], i) => (
      <Sequence key={`sfx-${i}`} from={sec(at)} durationInFrames={sec(3.5)} layout="none">
        <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol * (voice ? 0.55 : 0.8)} />
      </Sequence>
    ))}
    {music ? <Audio src={staticFile(MUSIC)} volume={voice ? 0.35 : 0.6} /> : null}
    {voice ? <Audio src={staticFile(VOICE)} /> : null}
  </AbsoluteFill>
);

const Overlays: React.FC = () => (
  <>
    <DimChip />
    <HookMatrix />
    <Headline lines={[[['Eine Dimension.']], [['Weg.', C.lam]]]} at={T.hookHit + 0.05} out={T.rewind - 0.15} y={1160} size={104} />
    <AreaLabel />
    <DetPanel />
    <Headline lines={[[['Fläche 0.']], [['Eine Dimension weg.', C.txt2]]]} at={T.noArea} lineAt={[T.noArea, T.line]} out={T.back - 0.2} y={330} size={76} />
    <Mono x={MARGIN} y={330} at={T.back + 0.05} out={T.cta} color={C.lam}>
      Kein Zurück
    </Mono>
    <Headline lines={[[['∞ Punkte → 1 Punkt']]]} at={T.kernel} out={T.cta} y={376} size={76} />
    <Mono x={MARGIN} y={480} at={T.land} out={T.cta} upper={false} size={28}>
      det = 0 ⇒ keine Umkehrmatrix
    </Mono>
    <Outro />
  </>
);

const HookMatrix: React.FC = () => {
  const t = useSec();
  const o = 1 - prog(t, T.rewind - 0.1, 0.35);
  if (o <= 0) return null;
  return <MatrixView x={846} y={276} size={38} entries={[['2', '1'], ['1', '0,5']]} prefix={false} opacity={o} />;
};
