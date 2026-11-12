// Serienrahmen „Mathe 1 – So geht's“: Kopf, Schrittleiste, Aufgabe, Rezeptkarte, CTA, Untertitel.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C} from '../theme';
import {F} from '../fonts';
import {bump, clamp, easeOutExpo, lerp, prog, springOS} from '../math';
import {Mono, Tex, col, useSec} from '../ui';
import {Pill, hide, shadow, show} from './kit';
import {K} from './world';
import {SUBTITLES, T} from './timeline';

const L = col(K.lam, '\\lambda');
const HEAD_Y = 372;

/* ---------- Kopf: Logo, Serien-Badge, Thema, Aufgabe ---------- */

const LOGO_AT = 3;
export const LogoMark: React.FC = () => {
  const t = useSec();
  const a = show(t, LOGO_AT, 0.7);
  if (a <= 0) return null;
  const k = prog(t, T.cta, 0.9);
  const size = lerp(60, 248, k);
  const cx = lerp(102, 540, k);
  const cy = lerp(HEAD_Y, 700, k);
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

export const Header: React.FC = () => {
  const t = useSec();
  const o = hide(t, T.cta - 0.2, 0.4);
  if (o <= 0) return null;
  const a = show(t, 0, 0.35);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o * a}}>
      <div
        style={{
          position: 'absolute',
          left: 150,
          top: HEAD_Y,
          transform: 'translateY(-50%)',
          padding: '7px 16px',
          borderRadius: 999,
          background: `${K.mint}22`,
          boxShadow: `inset 0 0 0 2px ${K.mint}`,
          fontFamily: F.mono,
          fontWeight: 600,
          fontSize: 22,
          letterSpacing: '.08em',
          color: K.mint,
          whiteSpace: 'nowrap',
        }}
      >
        MATHE 1 · SO GEHT'S
      </div>
      <div style={{position: 'absolute', left: 458, top: HEAD_Y, transform: 'translateY(-50%)', fontFamily: F.display, fontWeight: 700, fontSize: 30, color: C.txt, whiteSpace: 'nowrap', textShadow: shadow}}>
        Eigenvektoren
      </div>
    </div>
  );
};

// die Aufgabe bleibt klein oben rechts stehen, sobald die große Matrix umgeformt wird
export const MiniA: React.FC = () => {
  const t = useSec();
  const o = show(t, T.lambdaSteht, 0.6) * hide(t, T.rezept - 0.3, 0.4);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 838, top: HEAD_Y, transform: 'translate(-50%, -50%)', opacity: o * 0.92, whiteSpace: 'nowrap', textShadow: shadow}}>
      <Tex tex={'A=\\begin{pmatrix}2&1&0\\\\1&2&0\\\\0&0&3\\end{pmatrix}'} size={21} />
    </div>
  );
};

/* ---------- Schrittleiste ---------- */

export const RAIL_Y = 462;
export const RES_Y = 508;
export const NODE_X = [112, 322, 532, 742];
const LABELS = [`A-${L} I`, '\\det = 0', '\\text{Gauß}', '\\text{Basis}'];
// aktive Abschnitte je Schritt
const ACTIVE: [number, number][][] = [
  [[T.gesucht, T.loesung]],
  [[T.loesung, T.l1 - 0.3]],
  [
    [T.l1 - 0.3, T.spalteY],
    [T.l3 - 0.3, T.jetzt],
  ],
  [
    [T.spalteY, T.l3 - 0.3],
    [T.jetzt, T.rezept - 0.2],
  ],
];
const DONE = [T.loesung, T.l1 - 0.3, T.linear, T.ebene];

export const Rail: React.FC = () => {
  const t = useSec();
  const o = hide(t, T.rezept - 0.3, 0.4);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      {NODE_X.map((x, n) => {
        const pop = springOS(clamp((t - (T.vier - 0.15 + 0.17 * n)) / 0.5));
        if (pop <= 0) return null;
        const act = Math.max(...ACTIVE[n].map(([a, b]) => clamp((t - a) / 0.3) * (1 - clamp((t - b) / 0.3))));
        const done = clamp((t - DONE[n]) / 0.3);
        const flash = bump(t, DONE[n], 0.8);
        const c = done > 0.5 || act > 0.5 ? K.mint : 'rgba(243,244,251,.55)';
        const next = NODE_X[n + 1];
        return (
          <React.Fragment key={n}>
            {next ? <div style={{position: 'absolute', left: x + 150, top: RAIL_Y - 1, width: next - x - 172, height: 2, background: 'rgba(243,244,251,.18)', opacity: pop}} /> : null}
            <div
              style={{
                position: 'absolute',
                left: x - 21,
                top: RAIL_Y - 21,
                width: 42,
                height: 42,
                borderRadius: 21,
                background: done > 0.5 ? K.mint : act > 0.5 ? `${K.mint}33` : 'rgba(7,8,26,.8)',
                boxShadow: `inset 0 0 0 2px ${c}, 0 0 ${8 + 24 * Math.max(act, flash)}px ${act > 0.3 || flash > 0.1 ? K.mint : 'transparent'}`,
                transform: `scale(${pop * (1 + 0.12 * act + 0.2 * flash)})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: F.display,
                fontWeight: 800,
                fontSize: 22,
                color: done > 0.5 ? C.bg : c,
              }}
            >
              {done > 0.5 ? '✓' : n + 1}
            </div>
            <div
              style={{
                position: 'absolute',
                left: x + 32,
                top: RAIL_Y,
                transform: 'translateY(-50%)',
                opacity: pop * (act > 0.5 || done > 0.5 ? 1 : 0.6),
                whiteSpace: 'nowrap',
                textShadow: shadow,
              }}
            >
              <Tex tex={LABELS[n]} size={27} />
            </div>
          </React.Fragment>
        );
      })}
      <RailResults t={t} />
    </div>
  );
};

const Chip: React.FC<{color: string; active: boolean; label: string}> = ({color, active, label}) => (
  <span
    style={{
      padding: '4px 12px',
      borderRadius: 999,
      background: `${color}${active ? '40' : '14'}`,
      boxShadow: `inset 0 0 0 2px ${color}${active ? '' : '88'}`,
      fontFamily: F.display,
      fontWeight: 700,
      fontSize: 22,
      color,
      opacity: active ? 1 : 0.6,
    }}
  >
    {label}
  </span>
);

// Ergebnisse unter der Leiste: Eigenwerte unter ②, unter ③④ die Schleife „für jedes λ“
const RailResults: React.FC<{t: number}> = ({t}) => {
  const ev = show(t, T.l1 - 0.2, 0.4);
  const loop = show(t, T.l1 - 0.1, 0.4);
  const on3 = clamp((t - (T.l3 - 0.3)) / 0.3);
  const done3 = clamp((t - T.ebene) / 0.3);
  return (
    <>
      {ev > 0 ? (
        <div style={{position: 'absolute', left: NODE_X[1] + 32, top: RES_Y, transform: 'translateY(-50%)', opacity: ev, whiteSpace: 'nowrap', textShadow: shadow}}>
          <Tex tex={`${L} = ${col(K.l1, '1')},\\ ${col(K.l3, '3')}`} size={26} />
        </div>
      ) : null}
      {loop > 0 ? (
        <div style={{position: 'absolute', left: (NODE_X[2] + NODE_X[3]) / 2 + 40, top: RES_Y, transform: 'translate(-50%, -50%)', opacity: loop, display: 'flex', gap: 10, alignItems: 'center', whiteSpace: 'nowrap'}}>
          <span style={{fontFamily: F.mono, fontSize: 20, color: C.txt2, letterSpacing: '.04em'}}>FÜR JEDES</span>
          <Chip color={K.l1} active={on3 < 0.5} label={`λ = 1${on3 > 0.5 ? ' ✓' : ''}`} />
          <Chip color={K.l3} active={on3 > 0.5} label={`λ = 3${done3 > 0.5 ? ' ✓' : ''}`} />
        </div>
      ) : null}
    </>
  );
};

/* ---------- Rezeptkarte zum Speichern ---------- */

export const Recipe: React.FC = () => {
  const t = useSec();
  const a = show(t, T.rezept, 0.5) * hide(t, T.cta - 0.05, 0.35);
  if (a <= 0) return null;
  const step = (n: number, tex: string, y: number, sub?: string) => (
    <div style={{position: 'absolute', left: 120, top: y, display: 'flex', alignItems: 'center', gap: 22, whiteSpace: 'nowrap'}}>
      <div style={{width: 46, height: 46, borderRadius: 23, background: K.mint, color: C.bg, fontFamily: F.display, fontWeight: 800, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{n}</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
        <Tex tex={tex} size={36} />
        {sub ? <Tex tex={sub} size={28} style={{color: C.txt2}} /> : null}
      </div>
    </div>
  );
  return (
    <div style={{position: 'absolute', inset: 0, opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>
      <div style={{position: 'absolute', left: 80, top: 450, width: 860, height: 960, borderRadius: 36, background: 'rgba(12,14,38,.94)', boxShadow: `inset 0 0 0 2px ${K.mint}55, 0 30px 90px rgba(0,0,0,.5)`}} />
      <div style={{position: 'absolute', left: 120, top: 510, transform: 'translateY(-50%)', fontFamily: F.mono, fontWeight: 600, fontSize: 24, letterSpacing: '.08em', color: K.mint}}>MATHE 1 · SO GEHT'S</div>
      <div style={{position: 'absolute', left: 120, top: 566, transform: 'translateY(-50%)', fontFamily: F.display, fontWeight: 800, fontSize: 48, letterSpacing: '-.02em', color: C.txt}}>Eigenvektoren berechnen</div>
      {step(1, `A-${L} I \\text{ aufstellen}`, 630)}
      {step(2, `\\det(A-${L} I)=0 \\;\\Rightarrow\\; \\text{Eigenwerte}`, 716)}
      {step(3, `\\text{Für jedes } ${L}\\text{: } (A-${L} I)\\,v=0 \\text{ mit Gauß}`, 802)}
      {step(4, '\\text{Freie Variablen} \\;\\Rightarrow\\; \\text{Basis}', 888, `\\dim E_{${L}} = \\text{Anzahl freier Variablen}`)}
      <div style={{position: 'absolute', left: 120, top: 1010, width: 780, height: 2, background: 'rgba(243,244,251,.14)'}} />
      <div style={{position: 'absolute', left: 120, top: 1040, fontFamily: F.mono, fontSize: 22, letterSpacing: '.06em', color: C.txt2}}>HIER</div>
      <div style={{position: 'absolute', left: 120, top: 1110, transform: 'translateY(-50%)', whiteSpace: 'nowrap'}}>
        <Tex tex={`${col(K.l1, '\\lambda=1')}:\\quad E_1=\\operatorname{span}\\{(-1,\\,1,\\,0)^T\\}`} size={34} />
      </div>
      <div style={{position: 'absolute', left: 120, top: 1182, transform: 'translateY(-50%)', whiteSpace: 'nowrap'}}>
        <Tex tex={`${col(K.l3, '\\lambda=3')}:\\quad E_3=\\operatorname{span}\\{(1,\\,1,\\,0)^T\\!,\\ (0,\\,0,\\,1)^T\\}`} size={34} />
      </div>
      <div style={{position: 'absolute', left: 120, top: 1300, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap', fontFamily: F.body, fontWeight: 600, fontSize: 30, color: K.warn}}>
        <span>⚠</span>
        <span>Vielfache ≠ 0 sind genauso richtig.</span>
      </div>
    </div>
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

export const Outro: React.FC = () => {
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

/* ---------- Untertitel ---------- */

const CUES = SUBTITLES.map(([a, b, text], i) => {
  const next = SUBTITLES[i + 1] ? SUBTITLES[i + 1][0] - 0.1 : Infinity;
  return {from: a - 0.05, to: Math.min(b + 0.3, next), text};
});
const SUB_TOP = 1446;

export const Subtitles: React.FC = () => {
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
