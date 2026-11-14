// Logo, Schluss (114 Übungen, Link in Bio) und Untertitel.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C} from '../theme';
import {F} from '../fonts';
import {clamp, easeOutExpo, lerp, prog, springOS} from '../math';
import {useSec} from '../ui';
import {SUBTITLES, T} from './timeline';

const shadow = `0 0 14px ${C.bg}, 0 0 30px ${C.bg}`;
const LOGO_AT = 3;

export const LogoMark: React.FC = () => {
  const t = useSec();
  const a = easeOutExpo(clamp((t - LOGO_AT) / 0.7));
  if (a <= 0) return null;
  const k = prog(t, T.cta, 0.9);
  const size = lerp(60, 248, k);
  const cx = lerp(102, 540, k);
  const cy = lerp(372, 660, k);
  const glint = clamp((t - LOGO_AT) / 1.1);
  return (
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
  );
};

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

const LinkPill: React.FC = () => {
  const t = useSec();
  const p = springOS(clamp((t - (T.link - 0.15)) / 0.6));
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 540,
        top: 1150,
        transform: `translate(-50%, 0) scale(${0.85 + 0.15 * p})`,
        opacity: clamp(p * 1.4),
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '22px 40px',
        borderRadius: 999,
        background: 'rgba(243,244,251,.96)',
        boxShadow: '0 20px 70px rgba(30,139,219,.35)',
      }}
    >
      <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
      <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 46, color: C.bg}}>Link in Bio</span>
    </div>
  );
};

export const Outro: React.FC = () => {
  const t = useSec();
  if (t < T.cta) return null;
  return (
    <AbsoluteFill>
      <Centered y={820} at={T.cta + 0.35} size={104}>
        UniMathe
      </Centered>
      <Centered y={966} at={T.cta + 0.75} size={46} color={C.txt} weight={700}>
        114 kostenlose Übungen in der App
      </Centered>
      <LinkPill />
    </AbsoluteFill>
  );
};

const CUES = SUBTITLES.map(([a, b, text], i) => {
  const next = SUBTITLES[i + 1] ? SUBTITLES[i + 1][0] - 0.1 : Infinity;
  return {from: a - 0.05, to: Math.min(b + 0.3, next), text};
});

export const Subtitles: React.FC = () => {
  const t = useSec();
  const c = CUES.find(({from, to}) => t >= from && t < to);
  if (!c) return null;
  const o = (t < 0.1 ? 1 : clamp((t - c.from) / 0.12)) * clamp((c.to - t) / 0.12);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1446, display: 'flex', justifyContent: 'center', opacity: o}}>
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
