// Erklärvideo „Mathe 1 einfach erklärt: Injektiv, surjektiv, bijektiv“.
// Serien-Intro, Status-Chips, Pfeildiagramm, Graph von x² mit Schnitt von Ziel- und Definitionsmenge, Zusammenfassung, CTA.
// LogoMark, SearchPill, Outro, Untertitel nach src/aeq/Video.tsx (Branch video/aequivalenzrelation-klausur).
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C, MARGIN, W} from '../theme';
import {F, useTexFonts} from '../fonts';
import {bump, clamp, easeOutExpo, lerp, prog, sec, springOS} from '../math';
import {Backdrop, Grain, Mono, Tex, useSec} from '../ui';
import {EinfachErklaert} from '../series/EinfachErklaert';
import {CLIPS, MUSIC, SUBTITLES, T, VOICE} from './timeline';
import {Atom, MState, Morph, hide, shadow, show, useTexReady} from './kit';
import {AM, CO, CY, OK, Note} from './common';
import {Diagram, isInjective, isSurjective, settledMap} from './Diagram';
import {Graph} from './Graph';

const L = (id: string, tex: string, extra: Partial<Atom> = {}): Atom => ({id, tex, ...extra});

/* ---------- Status-Chips ---------- */

const CHIP_Y = 470;
const CHIP_H = 60;
const CHIP_W = 300;
const chipX = (i: number) => MARGIN + i * 318;
const chipC = (i: number): [number, number] => [chipX(i) + CHIP_W / 2, CHIP_Y + CHIP_H / 2];
const NAMES = ['injektiv', 'surjektiv', 'bijektiv'];

type CS = 'idle' | 'ok' | 'bad';
const chipStates = (t: number): CS[] => {
  if (t < T.toGraph + 0.3) {
    const m = settledMap(t);
    const inj = isInjective(m);
    const sur = isSurjective(m);
    return [t >= T.injDef + 0.5 ? (inj ? 'ok' : 'bad') : 'idle', t >= T.hier ? (sur ? 'ok' : 'bad') : 'idle', t >= T.bijDef + 1.0 ? (inj && sur ? 'ok' : 'bad') : 'idle'];
  }
  const inj: CS = t >= T.bijOk2 ? 'ok' : t >= T.nichtInj2 ? 'bad' : 'idle';
  const sur: CS = t >= T.surOk2 ? 'ok' : t >= T.nichtSur2 ? 'bad' : 'idle';
  const bij: CS = t >= T.bijOk2 ? 'ok' : t >= T.nichtSur2 ? 'bad' : 'idle';
  return [inj, sur, bij];
};
const PULSES = [
  [T.injDef + 0.5, T.nichtInj, T.nichtInj2, T.bijOk2],
  [T.hier, T.surOk, T.nichtSur2, T.surOk2],
  [T.bijDef + 1.0, T.nichtSur2, T.bijOk2],
];
const SPOKEN = [
  [T.w1, T.injDef, T.sum],
  [T.w2, T.surDef, T.sumS],
  [T.w3, T.bijDef, T.sumB],
];

const Chips: React.FC = () => {
  const t = useSec();
  const out = hide(t, T.cta - 0.2, 0.4);
  const st = chipStates(t);
  return (
    <>
      {NAMES.map((name, i) => {
        const p = springOS(clamp((t - (T.fly + 0.4)) / 0.6));
        if (p <= 0 || out <= 0.01) return null;
        const s = st[i];
        const pulse = Math.max(...PULSES[i].map((a) => bump(t, a, 0.7)), ...SPOKEN[i].map((a) => bump(t, a + 0.05, 0.6) * 0.7));
        const border = s === 'ok' ? OK : s === 'bad' ? CO : 'rgba(255,255,255,.22)';
        const tint = s === 'ok' ? 'rgba(123,234,156,.09)' : s === 'bad' ? 'rgba(255,122,92,.09)' : 'rgba(255,255,255,0)';
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: chipX(i),
              top: CHIP_Y,
              width: CHIP_W,
              height: CHIP_H,
              boxSizing: 'border-box',
              borderRadius: 18,
              border: `2.5px solid ${border}`,
              background: `linear-gradient(${tint}, ${tint}), rgba(10,11,32,.94)`,
              boxShadow: pulse > 0.02 ? `0 0 ${32 * pulse}px ${s === 'bad' ? 'rgba(255,122,92,.5)' : s === 'ok' ? 'rgba(123,234,156,.45)' : 'rgba(255,194,71,.4)'}` : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: clamp(p * 1.4) * out,
              transform: `scale(${(0.92 + 0.08 * p) * (1 + 0.06 * pulse)})`,
            }}
          >
            <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 29, color: s === 'idle' ? C.txt2 : C.txt}}>{name}</span>
            {s !== 'idle' ? <span style={{position: 'absolute', right: 18, fontFamily: F.display, fontWeight: 800, fontSize: 28, color: border}}>{s === 'ok' ? '✓' : '✗'}</span> : null}
          </div>
        );
      })}
    </>
  );
};

/* ---------- Formeln ---------- */

// f(a) = f(b) ⇒ a = b unter dem Pfeildiagramm
const InjFormula: React.FC = () => {
  const t = useSec();
  const o = show(t, T.verschieden + 0.6, 0.45) * hide(t, T.surDef - 0.1, 0.4);
  return <Note y={1395} tex={'f(a) = f(b) \\;\\Rightarrow\\; a = b'} o={o} size={44} color={C.txt} glow={bump(t, T.verschieden + 1.0, 1.0) * 0.5} />;
};

// Formelzeile des Graphen: nur die Mengen ändern sich
const fStates = (t: number): MState[] => {
  const gD = bump(t, T.links2 + 0.2, 1.4);
  const gZ = bump(t, T.ziel + 0.4, 1.6);
  const R = '\\mathbb{R}';
  const H = '[0, \\infty)';
  const row = (d: string, z: string, dArc = 0, zArc = 0) => [
    L('f', 'f\\colon'),
    L('D', d, {color: CY, glow: gD, arc: dArc}),
    L('to', '\\to'),
    L('Z', z, {color: AM, glow: gZ, arc: zArc}),
    L('cm', ',', {pad: 0.04}),
    L('fx', 'f(x) = x^2', {pad: 0.5}),
  ];
  return [
    {at: T.jetzt + 0.2, nodes: row(R, R)},
    {at: T.ab + 0.15, dur: 0.8, nodes: row(R, H, 0, 34)},
    {at: T.links2 + 0.5, dur: 0.8, nodes: row(H, H, 34, 0)},
  ];
};
const GraphFormula: React.FC = () => {
  const t = useSec();
  if (t < T.jetzt) return null;
  const o = hide(t, T.sum - 0.15, 0.45);
  return (
    <>
      <div style={{position: 'absolute', left: 150, right: 150, top: 552, height: 70, borderRadius: 20, background: 'rgba(7,8,26,.7)', opacity: o * show(t, T.jetzt + 0.2, 0.5)}} />
      <Morph t={t} states={fStates(t)} cy={587} size={44} o={o} />
    </>
  );
};

/* ---------- Zusammenfassung ---------- */

const SUM: [string, string, number][] = [
  ['Injektiv', 'Keine zwei verschiedenen Eingaben liefern denselben Wert.', T.sum],
  ['Surjektiv', 'Jeder Wert der Zielmenge wird erreicht.', T.sumS],
  ['Bijektiv', 'Beides gleichzeitig.', T.sumB],
];
const Summary: React.FC = () => {
  const t = useSec();
  const p = springOS(clamp((t - T.sum + 0.1) / 0.6));
  const out = hide(t, T.cta - 0.2, 0.45);
  if (p <= 0 || out <= 0) return null;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: clamp(p * 1.4) * out}}>
      <div style={{position: 'absolute', left: 110, top: 660, width: W - 220, height: 570, borderRadius: 28, border: '1.5px solid rgba(255,255,255,.18)', background: 'linear-gradient(180deg, rgba(20,22,52,.95), rgba(10,11,32,.93))', boxShadow: '0 30px 90px rgba(0,0,0,.45)', transform: `scale(${0.96 + 0.04 * p})`}} />
      {SUM.map(([name, text, at], i) => {
        const s = show(t, at, 0.45);
        const g = bump(t, at + 0.1, 0.9);
        return (
          <div key={i} style={{position: 'absolute', left: 170, right: 170, top: 704 + i * 172, opacity: s, transform: `translateY(${(1 - s) * 14}px)`}}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 50, color: C.txt, textShadow: g > 0.02 ? `0 0 ${20 * g}px rgba(255,194,71,.6)` : undefined}}>{name}</span>
              <span style={{marginLeft: 'auto', fontFamily: F.display, fontWeight: 800, fontSize: 44, color: OK}}>✓</span>
            </div>
            <div style={{marginTop: 8, fontFamily: F.body, fontWeight: 500, fontSize: 33, lineHeight: 1.3, color: 'rgba(243,244,251,.82)'}}>{text}</div>
          </div>
        );
      })}
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
  const cy0 = lerp(336, 700, k);
  const glint = clamp((t - 3.0) / 1.1);
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
      <Centered y={846} at={T.cta + 0.3} size={104}>
        UniMathe
      </Centered>
      <Centered y={980} at={T.cta + 0.6} size={42} color={C.txt2} weight={600}>
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
  const fl = Math.max(bump(t, T.bijDef + 1.0, 0.4) * 0.5, bump(t, T.surOk2, 0.4) * 0.6, bump(t, T.bijOk2, 0.4) * 0.5);
  return fl > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.08 * fl}} /> : null;
};

/* ---------- Ton ---------- */

const SFX: [number, string, number][] = [
  [0, 'whoosh', 0.36],
  ...[0.1, 0.24, 0.38].map((a) => [a + 0.3, 'tick', 0.2] as [number, string, number]),
  [1.0, 'whoosh', 0.18],
  [1.8, 'whoosh', 0.2],
  [2.2, 'buzz', 0.18],
  [T.w1, 'tick', 0.24],
  [T.w2, 'tick', 0.24],
  [T.w3, 'tick', 0.24],
  [T.fly, 'whoosh', 0.26],
  [T.links + 0.1, 'swell', 0.18],
  [T.injDef + 0.15, 'whoosh', 0.22],
  [T.injDef + 0.6, 'lock_hi', 0.3],
  [T.auf + 0.1, 'whoosh', 0.22],
  [T.nichtInj, 'buzz', 0.26],
  [T.hier, 'buzz', 0.22],
  [T.neue + 0.25, 'whoosh', 0.24],
  [T.neue + 0.8, 'tick', 0.22],
  [T.neue + 0.95, 'tick', 0.22],
  [T.surOk, 'lock_hi', 0.36],
  [T.bijDef + 0.55, 'collapse', 0.24],
  [T.bijDef + 1.0, 'lock_hi', 0.42],
  [T.bijDef + 1.0, 'accent', 0.28],
  [T.umdrehen + 0.95, 'rise', 0.22],
  [T.toGraph, 'swell', 0.3],
  [T.toGraph + 0.2, 'whoosh', 0.26],
  [T.minus2 + 0.1, 'tick', 0.22],
  [T.vier, 'whoosh', 0.2],
  [T.nichtInj2, 'buzz', 0.26],
  [T.nichtSur2, 'buzz', 0.26],
  [T.ab - 0.1, 'collapse', 0.3],
  [T.gleiche + 0.6, 'rise', 0.22],
  [T.surOk2, 'lock_hi', 0.42],
  [T.surOk2, 'accent', 0.3],
  [T.links2 + 0.3, 'collapse', 0.28],
  [T.bijOk2, 'lock_hi', 0.45],
  [T.bijOk2, 'accent', 0.3],
  [T.sum, 'click', 0.28],
  [T.sumS, 'tick', 0.26],
  [T.sumB, 'tick', 0.26],
  [T.cta - 0.1, 'swell', 0.32],
  ...Array.from({length: 8}, (_, i) => [T.tippt + i * 0.075, 'tick', 0.18] as [number, string, number]),
];

/* ---------- Komposition ---------- */

export type ISEProps = {music: boolean; voice: boolean};

const LEAD = 0.08;
const TAIL = 0.1;

export const VideoISE: React.FC<ISEProps> = ({music, voice}) => {
  useTexFonts();
  const ready = useTexReady();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={980} strength={0.85} />
      {ready ? (
        <>
          <Graph />
          <Diagram />
          <InjFormula />
          <GraphFormula />
          <Summary />
          <Chips />
        </>
      ) : null}
      <EinfachErklaert
        words={[
          {text: 'Injektiv', at: T.w1, x: chipC(0)[0], to: chipC(0), toSize: 29},
          {text: 'Surjektiv', at: T.w2, x: chipC(1)[0], to: chipC(1), toSize: 29},
          {text: 'Bijektiv', at: T.w3, x: chipC(2)[0], to: chipC(2), toSize: 29},
        ]}
        fly={T.fly}
        out={T.cta - 0.2}
      />
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
