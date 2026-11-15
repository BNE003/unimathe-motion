// Aha-Video „Warum misst die Ableitung die Steigung?“ – Overlays über der Canvas-Bühne.
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C, MARGIN, W} from '../theme';
import {F, useTexFonts} from '../fonts';
import {V2, bump, clamp, easeInOutCubic, easeOutExpo, lerp, prog, sec, springOS} from '../math';
import {Backdrop, Grain, Mono, Tex, useSec} from '../ui';
import {COL, Stage, sideColor} from './Canvas';
import {CLIPS, MUSIC, SUBTITLES, T, VOICE, VOICE_READY} from './timeline';
import {ARRIVE, COLLAPSE_AT, P, Q, SWITCH, TAN_SLOPE, camAt, corner, f, hAt, toS, vis, zoomFactor} from './world';

const show = (t: number, at: number, d = 0.4) => easeOutExpo(clamp((t - at) / d));
const hide = (t: number, at: number, d = 0.35) => 1 - easeInOutCubic(clamp((t - at) / d));
const shadow = `0 0 14px ${C.bg}, 0 0 30px ${C.bg}`;

/* ---------- Zahlen ---------- */

const de = (x: number, d: number) => x.toFixed(d).replace('.', ',');
const deTex = (x: number, d: number) => de(x, d).replace(',', '{,}');
// Nachkommastellen passend zu |h|: 1 → 0, 0,5 → 1, 0,01 → 2, darunter 3
const digits = (h: number) => {
  const a = Math.abs(h);
  if (a >= 0.999) return 0;
  if (a >= 0.0995) return 1;
  if (a >= 0.00995) return 2;
  return 3;
};
const rueber = (h: number) => Math.abs(h);
const hoch = (h: number) => Math.abs(f(P[0] + h) - f(P[0]));
const vals = (h: number) => {
  const d = digits(h);
  const dn = Math.min(4, 2 * d);
  return {num: hoch(h), den: rueber(h), slope: 2 + h, d, dn};
};

/* ---------- Hook: Frage groß im Bild ---------- */

const HX = 90;
const Hook: React.FC = () => {
  const t = useSec();
  const out = hide(t, T.zwei + 0.1, 0.45);
  if (out <= 0) return null;
  const line = (y: number, at: number, children: React.ReactNode, size = 64) => {
    const p = show(t, at, 0.5);
    return (
      <div style={{position: 'absolute', left: HX, top: y, fontFamily: F.display, fontWeight: 800, fontSize: size, letterSpacing: '-.03em', color: C.txt, opacity: p * out, transform: `translateY(${(1 - p) * 18}px)`, textShadow: shadow, whiteSpace: 'nowrap'}}>
        {children}
      </div>
    );
  };
  const hl = (s: string, c: string) => <span style={{color: c}}>{s}</span>;
  return (
    <>
      {line(312, -1, <>Warum misst</>)}
      {line(388, -1, <>die {hl('Ableitung', C.cyan)}</>)}
      {line(464, 0.9, <>die {hl('Steigung', C.eig)} –</>)}
      {line(540, T.punkt, <>genau in {hl('einem Punkt', C.eig)}?</>)}
    </>
  );
};

/* ---------- Anzeige oben links ---------- */

const RO = {labelY: 330, rowY: 455, slotRight: 400, eqX: 432, numX: 478};

const Label: React.FC<{o: number; color: string; children: React.ReactNode}> = ({o, color, children}) =>
  o > 0 ? (
    <div style={{position: 'absolute', left: HX, top: RO.labelY, fontFamily: F.mono, fontWeight: 600, fontSize: 25, letterSpacing: '.12em', color, opacity: o, textShadow: shadow, whiteSpace: 'nowrap'}}>{children}</div>
  ) : null;

const Row: React.FC<{o: number; slot: React.ReactNode; num: string; color: string; eq?: boolean; pop?: number}> = ({o, slot, num, color, eq = true, pop = 0}) =>
  o > 0 ? (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{position: 'absolute', left: HX, width: RO.slotRight - HX, top: RO.rowY, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'flex-end', color, textShadow: shadow}}>{slot}</div>
      {eq ? <div style={{position: 'absolute', left: RO.eqX - 20, top: RO.rowY, transform: 'translateY(-52%)', fontFamily: F.display, fontWeight: 600, fontSize: 70, color: C.txt2}}>=</div> : null}
      <div
        style={{
          position: 'absolute',
          left: RO.numX,
          top: RO.rowY,
          transform: `translateY(-52%) scale(${1 + 0.12 * pop})`,
          transformOrigin: 'left center',
          fontFamily: F.display,
          fontWeight: 800,
          fontSize: 132,
          letterSpacing: '-.04em',
          color,
          textShadow: `0 0 ${20 + 40 * pop}px ${color}55, ${shadow}`,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {num}
      </div>
    </div>
  ) : null;

const frac = (n: string, d: string) => `\\dfrac{${n}}{${d}}`;

// Zustände der Anzeige mit Ein- und Ausblenden
const Readout: React.FC = () => {
  const t = useSec();
  const h = hAt(t);
  const v = vals(h);
  const sc = sideColor(h);
  const FROM = T.schnitt + 0.55;

  // 1) mittlere Steigung (rechts, dann links, dann beim Zusammenrücken)
  const oMid = show(t, FROM, 0.3) * hide(t, T.links, 0.25) + show(t, SWITCH + 0.1, 0.3) * hide(t, T.beide, 0.3) + show(t, T.zusammen, 0.3) * hide(t, COLLAPSE_AT - 0.02, 0.05);
  // 2) beide Seiten
  const oBoth = show(t, T.beide, 0.35) * hide(t, T.zusammen - 0.05, 0.3);
  // 3) 0/0
  const oZero = show(t, COLLAPSE_AT, 0.1) * hide(t, T.ziel + 0.3, 0.3);
  // 4) Grenzwert = 2
  const oLim = show(t, T.ziel + 0.4, 0.4) * hide(t, T.ableitungWort - 0.1, 0.3);
  // 5) f′(1) = 2
  const oAbl = show(t, T.ableitungWort, 0.4) * hide(t, T.cta - 0.2, 0.4);

  const midLabel = t < SWITCH ? 'MITTLERE STEIGUNG' : 'MITTLERE STEIGUNG · VON LINKS';
  const tick = (at: number) => bump(t, at - 0.05, 0.5);
  const pop = t < SWITCH ? tick(T.v25) + tick(T.v21) + tick(T.v201) : 0;

  return (
    <>
      <Label o={oMid} color={sc}>
        {midLabel}
      </Label>
      <Row o={oMid} color={sc} pop={pop} slot={<Tex tex={frac(deTex(v.num, v.dn), deTex(v.den, v.d))} size={56} />} num={de(v.slope, v.d)} />

      <Label o={oBoth} color={C.txt2}>
        VON LINKS · VON RECHTS
      </Label>
      {oBoth > 0 ? (
        <div style={{position: 'absolute', left: HX, top: RO.rowY, transform: 'translateY(-52%)', display: 'flex', alignItems: 'center', gap: 22, opacity: oBoth, fontFamily: F.display, fontWeight: 800, textShadow: shadow, whiteSpace: 'nowrap'}}>
          <span style={{fontSize: 64, color: COL.left, letterSpacing: '-.03em'}}>1,99</span>
          <span style={{fontSize: 50, color: C.txt2}}>→</span>
          <span style={{fontSize: 132, color: C.eig, letterSpacing: '-.04em', textShadow: `0 0 ${30 + 40 * bump(t, T.beide + 0.9, 0.8)}px ${C.eig}66, ${shadow}`}}>2</span>
          <span style={{fontSize: 50, color: C.txt2}}>←</span>
          <span style={{fontSize: 64, color: COL.right, letterSpacing: '-.03em'}}>2,01</span>
        </div>
      ) : null}

      <Label o={oZero} color={COL.zero}>
        PUNKTE AUFEINANDER · KEINE SEKANTE
      </Label>
      <Row o={oZero} color={COL.zero} slot={<Tex tex={frac('0', '0')} size={56} />} num="?" />

      <Label o={oLim} color={C.eig}>
        STEIGUNG DER TANGENTE
      </Label>
      <Row o={oLim} color={C.eig} pop={bump(t, T.tangente - 0.1, 0.9)} slot={<Tex tex={`\\lim_{\\text{rüber}\\to 0}\\,${frac('\\text{hoch}', '\\text{rüber}')}`} size={44} />} num="2" />

      <Label o={oAbl} color={C.eig}>
        ABLEITUNG = STEIGUNG IM PUNKT
      </Label>
      <Row o={oAbl} color={C.eig} pop={bump(t, T.ableitungWort, 0.9)} slot={<Tex tex="f'(1)" size={74} />} num="2" />
    </>
  );
};

/* ---------- Beschriftungen auf der Bühne ---------- */

const Tag: React.FC<{x: number; y: number; o: number; color: string; size?: number; anchor?: 'left' | 'center'; children: React.ReactNode}> = ({x, y, o, color, size = 44, anchor = 'left', children}) =>
  o > 0 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${anchor === 'center' ? '-50%' : '0'}, -50%)`,
        fontFamily: F.display,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: '-.02em',
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

const Cap: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{fontFamily: F.mono, fontWeight: 500, fontSize: 22, letterSpacing: '.1em', color: C.txt2, marginRight: 10, verticalAlign: '0.35em'}}>{children}</span>
);

// Lage der Dreiecksbeschriftungen im Bild
const triLabels = (t: number) => {
  const h = hAt(t);
  const cam = camAt(t);
  const p = toS(cam, P);
  const q = toS(cam, Q(h));
  const c = toS(cam, corner(h));
  const r: V2 = [(c[0] + (h > 0 ? p[0] : q[0])) / 2, c[1] + 40];
  const vx = h > 0 ? q[0] : p[0];
  const vy = (c[1] + (h > 0 ? q[1] : p[1])) / 2;
  return {h, r, v: [vx + 22, vy] as V2};
};

const TriLabels: React.FC = () => {
  const t = useSec();
  const o = vis.tri(t) * vis.stage(t);
  const h = hAt(t);
  if (o <= 0 || h === 0) return null;
  const {r, v} = triLabels(t);
  const x = vals(h);
  return (
    <>
      <Tag x={r[0]} y={r[1]} o={o} color={C.txt} anchor="center">
        <Cap>rüber</Cap>
        {de(x.den, x.d)}
      </Tag>
      <Tag x={v[0]} y={v[1]} o={o} color={C.txt}>
        <Cap>hoch</Cap>
        {de(x.num, x.dn)}
      </Tag>
    </>
  );
};

// „3“ und „1“ fliegen bei „im Schnitt drei“ in den Bruch
const FlyIn: React.FC = () => {
  const t = useSec();
  const at = T.schnitt;
  if (t < at || t > at + 0.75) return null;
  const k = easeInOutCubic(clamp((t - at) / 0.6));
  const {r, v} = triLabels(at);
  const o = 1 - clamp((t - at - 0.6) / 0.15);
  const item = (from: V2, to: V2, s: string) => (
    <Tag x={lerp(from[0], to[0], k)} y={lerp(from[1], to[1], k)} o={o} color={COL.right} anchor="center" size={lerp(44, 56, k)}>
      {s}
    </Tag>
  );
  return (
    <>
      {item([v[0] + 80, v[1]], [RO.slotRight - 16, RO.rowY - 38], '3')}
      {item(r, [RO.slotRight - 16, RO.rowY + 40], '1')}
    </>
  );
};

// Gerade durch P mit Steigung m: Bildpunkt im Abstand d von P
const along = (t: number, m: number, d: number, off: number): V2 => {
  const p = toS(camAt(t), P);
  const n = Math.hypot(1, m);
  const ux = 1 / n;
  const uy = -m / n;
  return [p[0] + ux * d + uy * off, p[1] + uy * d - ux * off];
};

const LineTags: React.FC = () => {
  const t = useSec();
  const st = vis.stage(t);
  const h = hAt(t);
  const so = vis.secTag(t) * st;
  const to = vis.tanTag(t) * st;
  const a = along(t, h === 0 ? TAN_SLOPE : 2 + h, 470, 36);
  const b = along(t, TAN_SLOPE, 520, 40);
  return (
    <>
      <Tag x={a[0] - 200} y={a[1]} o={so} color={COL.right} size={40}>
        Sekante
      </Tag>
      <Tag x={b[0] - 230} y={b[1]} o={to} color={C.eig} size={44}>
        Tangente
      </Tag>
    </>
  );
};

// Steigungsdreieck der Tangente: 1 rüber, 2 hoch
const TanTriLabels: React.FC = () => {
  const t = useSec();
  const o = vis.tanTri(t) * vis.stage(t);
  if (o <= 0) return null;
  const cam = camAt(t);
  const c = toS(cam, [P[0] + 1, P[1]]);
  const p = toS(cam, P);
  const e = toS(cam, [P[0] + 1, P[1] + TAN_SLOPE]);
  return (
    <>
      <Tag x={(p[0] + c[0]) / 2} y={c[1] + 40} o={o} color={C.eig} anchor="center">
        1
      </Tag>
      <Tag x={c[0] + 22} y={(c[1] + e[1]) / 2} o={o} color={C.eig}>
        2
      </Tag>
    </>
  );
};

// Lupe: wie weit die Kamera gerade hineinzoomt
const Zoom: React.FC = () => {
  const t = useSec();
  const z = zoomFactor(t);
  const o = clamp((z - 1.6) / 1.5) * vis.stage(t);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: HX, top: 560, fontFamily: F.mono, fontWeight: 500, fontSize: 25, letterSpacing: '.1em', color: C.txt2, opacity: o * 0.9, textShadow: shadow}}>
      LUPE ×{Math.round(z)}
    </div>
  );
};

/* ---------- Logo, CTA ---------- */

const LogoMark: React.FC = () => {
  const t = useSec();
  const a = show(t, 2.2, 0.7);
  if (a <= 0) return null;
  const k = prog(t, T.cta, 0.9);
  const size = lerp(56, 248, k);
  const cx = lerp(W - MARGIN - 34 - 28, 540, k);
  const cy = lerp(336, 700, k);
  const glint = clamp((t - 2.2) / 1.1);
  return (
    <div style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, opacity: a * lerp(0.9, 1, k)}}>
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
  const fl = Math.max(bump(t, 0, 0.22) * 0.8, bump(t, T.tangente - 0.1, 0.4) * 0.6, bump(t, T.ableitungWort, 0.4) * 0.4);
  const z = bump(t, COLLAPSE_AT - 0.03, 0.35);
  return (
    <>
      {fl > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.1 * fl}} /> : null}
      {z > 0 ? <AbsoluteFill style={{background: COL.zero, opacity: 0.08 * z}} /> : null}
    </>
  );
};

/* ---------- Ton ---------- */

const SFX: [number, string, number][] = [
  [0, 'whoosh', 0.45],
  [0, 'accent_small', 0.3],
  [ARRIVE - 0.05, 'tick', 0.36],
  [T.zweiP, 'click', 0.3],
  [T.hier + 0.05, 'whoosh', 0.22],
  [T.hier + 0.75, 'tick', 0.22],
  [T.schnitt, 'whoosh', 0.2],
  [T.schnitt + 0.6, 'click', 0.3],
  [T.naeher + 0.6, 'rise', 0.2],
  [T.v25, 'tick', 0.3],
  [T.v21, 'tick', 0.3],
  [T.v201, 'tick', 0.32],
  [T.links, 'whoosh', 0.26],
  [SWITCH + 0.05, 'click', 0.26],
  [SWITCH + 1.15, 'tick', 0.22],
  [SWITCH + 1.9, 'tick', 0.22],
  [SWITCH + 2.85, 'tick', 0.24],
  [T.beide + 0.3, 'lock', 0.3],
  [T.zusammen + 0.4, 'rise', 0.16],
  [COLLAPSE_AT - 0.03, 'buzz', 0.26],
  [T.ziel + 0.35, 'swell', 0.3],
  [T.tangente - 0.1, 'lock_hi', 0.42],
  [T.ableitungWort, 'accent', 0.4],
  [T.cta - 0.1, 'swell', 0.34],
  ...Array.from({length: 8}, (_, i) => [T.tippt + i * 0.075, 'tick', 0.18] as [number, string, number]),
];

/* ---------- Komposition ---------- */

export type ABLProps = {music: boolean; voice: boolean};

export const VideoABL: React.FC<ABLProps> = ({music, voice}) => {
  useTexFonts();
  const withVoice = voice && VOICE_READY;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={560} gy={1000} strength={0.85} />
      <Stage />
      <LineTags />
      <TriLabels />
      <TanTriLabels />
      <FlyIn />
      <Hook />
      <Readout />
      <Zoom />
      <Outro />
      <LogoMark />
      <Subtitles />
      <Flash />
      <Grain />
      {SFX.map(([at, name, vol], i) => (
        <Sequence key={`sfx-${i}`} from={sec(Math.max(0, at))} durationInFrames={sec(3.5)} layout="none">
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol * (withVoice ? 0.55 : 0.8)} />
        </Sequence>
      ))}
      {music ? <Audio src={staticFile(MUSIC)} volume={withVoice ? 0.3 : 0.6} /> : null}
      {withVoice
        ? CLIPS.map((c) => (
            <Sequence key={`v${c.i}`} from={sec(c.at)} durationInFrames={sec(c.dur + 0.1)} layout="none">
              <Audio src={staticFile(VOICE)} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
