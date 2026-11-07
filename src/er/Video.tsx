import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C} from '../theme';
import {F, useTexFonts} from '../fonts';
import {V2, bump, clamp, easeInOutCubic, easeOutExpo, fmtDe, lerp, prog, sec, springOS} from '../math';
import {Backdrop, Grain, Mono, Tex, col, useSec} from '../ui';
import {V3} from '../space';
import {COL, Scene} from './Canvas';
import {EIG_V0, HOOK_P, M_ANCHOR, REV_P, SINGLE_P, W3, camAt, eigH, project, singleN, singleVec, vis} from './world';
import {MUSIC, SUBTITLES, T, TOTAL, V, VOICE, VOICE_CUTS} from './timeline';

const show = (t: number, at: number, d = 0.4) => easeOutExpo(clamp((t - at) / d));
const hide = (t: number, at: number, d = 0.35) => 1 - easeInOutCubic(clamp((t - at) / d));
const shadow = `0 0 14px ${C.bg}, 0 0 30px ${C.bg}`;

const H_ = (s: string) => col(COL.h, s);
const V_ = (s: string) => col(COL.v, s);
const fmtN = (x: number, d = 1) => (Math.abs(x - Math.round(x)) < 0.02 ? String(Math.round(x)) : fmtDe(x, d));

/* ---------- Beschriftungen an Punkten der Welt ---------- */

const Label3: React.FC<{t: number; q: V3; dx?: number; dy?: number; o: number; children: React.ReactNode}> = ({t, q, dx = 0, dy = 0, o, children}) => {
  if (o <= 0.005) return null;
  const [x, y] = project(t, q);
  return (
    <div style={{position: 'absolute', left: clamp(x + dx, 110, 900), top: clamp(y + dy, 310, 1395), transform: 'translate(-50%, -50%)', opacity: o, textShadow: shadow, whiteSpace: 'nowrap'}}>
      {children}
    </div>
  );
};

/* ---------- Die schwebende Matrix ---------- */

// Geometrie der Matrix in Pixeln (Skala 1, relativ zur Mitte der Tafel)
const MX = {w: 420, h: 236, label: -128, c1: 22, c2: 120, r1: -46, r2: 46, bl: -18, br: 160};
const SLOT: V2 = [540, 540];
const ALL_P = [...HOOK_P, ...REV_P, ...SINGLE_P.map(([p]) => p)];

const matrixPose = (t: number) => {
  const {cam, u, ph, th} = camAt(t);
  const k = vis.mSlot(t);
  const w = cam.p(M_ANCHOR);
  const sw = clamp(((u * 16) / Math.max(4, cam.depth(M_ANCHOR)) / 150) * 0.95, 0.7, 1.25);
  return {
    x: lerp(w[0], SLOT[0], k),
    y: Math.max(lerp(w[1], SLOT[1], k), t > T.warum - 0.3 && t < T.genau ? SLOT[1] : 440),
    s: Math.min(lerp(sw, 0.95, k), t > T.warum - 0.3 && t < T.genau ? 1 : 9),
    ry: lerp((ph + 90) * 0.45, 0, k),
    rx: lerp(-(th - 8) * 0.5, 0, k),
  };
};
// Bildschirmposition eines Eintrags (nur in der festen Position oben genau, dort ohne Drehung)
const entryAt = (t: number, cx: number, cy: number): V2 => {
  const p = matrixPose(t);
  return [p.x + cx * p.s, p.y + cy * p.s];
};

const Bracket: React.FC<{x: number; flip?: boolean}> = ({x, flip}) => (
  <svg width={30} height={200} style={{position: 'absolute', left: x - 15, top: -100, overflow: 'visible', transform: flip ? 'scaleX(-1)' : undefined}}>
    <path d="M 22 4 Q 4 100 22 196" fill="none" stroke={C.txt} strokeWidth={5} strokeLinecap="round" />
  </svg>
);

const Entry: React.FC<{x: number; y: number; v: string; glow: number; color: string}> = ({x, y, v, glow, color}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(-50%, -50%) scale(${1 + 0.18 * glow})`,
      textShadow: `0 0 ${8 + 26 * glow}px ${glow > 0.02 ? color : 'transparent'}`,
    }}
  >
    <Tex tex={glow > 0.4 ? col(color, v) : v} size={78} />
  </div>
);

const MatrixObject: React.FC = () => {
  const t = useSec();
  const o = vis.matrix(t);
  if (o <= 0) return null;
  const p = matrixPose(t);
  const fire = Math.max(...ALL_P.map((q) => bump(t, q, 0.7)));
  const g2 = Math.max(bump(t, T.verdoppelt + 0.1, 1.4), show(t, T.hAnteil - 0.1, 0.4) * hide(t, T.genau, 0.6), ...SINGLE_P.map(([q]) => bump(t, q, 0.8)) , show(t, T.eigen, 0.4) * hide(t, T.cta - 0.3, 0.4));
  const g1 = Math.max(bump(t, T.vertikal, 1.4), show(t, T.andere - 0.1, 0.4) * hide(t, T.genau, 0.6), show(t, T.vertR - 0.2, 0.4) * hide(t, T.cta - 0.3, 0.4));
  return (
    <div
      style={{
        position: 'absolute',
        left: p.x,
        top: p.y,
        width: 0,
        height: 0,
        opacity: o,
        transform: `perspective(1400px) rotateX(${p.rx}deg) rotateY(${p.ry}deg) scale(${p.s * (1 + 0.04 * fire)})`,
      }}
    >
      {/* Glastafel */}
      <div
        style={{
          position: 'absolute',
          left: -MX.w / 2,
          top: -MX.h / 2,
          width: MX.w,
          height: MX.h,
          borderRadius: 34,
          background: `linear-gradient(160deg, rgba(60,66,140,${0.34 + 0.12 * fire}) 0%, rgba(16,18,48,.5) 100%)`,
          border: `1.5px solid rgba(205,214,255,${0.22 + 0.4 * fire})`,
          boxShadow: `0 0 ${40 + 80 * fire}px rgba(255,214,150,${0.08 + 0.35 * fire}), inset 0 1px 0 rgba(255,255,255,.12)`,
        }}
      />
      <div style={{position: 'absolute', left: MX.label, top: 0, transform: 'translate(-50%, -50%)'}}>
        <Tex tex="A=" size={70} />
      </div>
      <Bracket x={MX.bl} />
      <Bracket x={MX.br} flip />
      <Entry x={MX.c1} y={MX.r1} v="2" glow={g2} color={COL.h} />
      <Entry x={MX.c2} y={MX.r1} v="0" glow={0} color={C.txt} />
      <Entry x={MX.c1} y={MX.r2} v="0" glow={0} color={C.txt} />
      <Entry x={MX.c2} y={MX.r2} v="1" glow={g1} color={COL.v} />
    </div>
  );
};

/* ---------- Hook: „Warum?“ ---------- */

const Warum: React.FC = () => {
  const t = useSec();
  const o = show(t, T.warum - 0.05, 0.3) * hide(t, T.schauen - 0.65, 0.35);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 540, top: 384, transform: `translate(-50%, -50%) scale(${0.94 + 0.06 * o})`, opacity: o, fontFamily: F.display, fontWeight: 800, fontSize: 112, letterSpacing: '-.03em', color: C.txt, textShadow: shadow}}>
      Warum?
    </div>
  );
};

/* ---------- Ein Vektor: Anteile, Zahlen, Folge ---------- */

const SingleLabels: React.FC = () => {
  const t = useSec();
  const end = hide(t, T.genau, 0.5);
  if (t < T.warum || end <= 0) return null;
  const sv = singleVec(t);
  const n = singleN(t);
  const settled = 1 - Math.max(...SINGLE_P.map(([p, d]) => clamp(Math.min((t - p + 0.1) / 0.15, (p + d + 0.05 - t) / 0.15))));
  const tipO = show(t, T.einzigen - 0.1, 0.4) * hide(t, T.hAnteil - 0.2, 0.4) * settled * end;
  const cA = vis.compA(t) * end;
  const cC = vis.compC(t) * end;
  const deg = (Math.atan2(sv[1], sv[0]) * 180) / Math.PI;
  const angO = show(t, T.einzigen, 0.5) * hide(t, T.hAnteil - 0.2, 0.4) * end;
  const halfA = (deg * Math.PI) / 360;
  const twice = Math.max(...SINGLE_P.map(([p]) => bump(t, p + 0.35, 1.1)));
  return (
    <AbsoluteFill>
      <Label3 t={t} q={W3(sv)} dx={58} dy={-46} o={tipO}>
        <Tex tex={`(${H_(fmtN(sv[0]))},\\,${V_('1')})`} size={54} />
      </Label3>
      <Label3 t={t} q={W3([sv[0] / 2, 0])} dy={64} o={cA * clamp((t - T.anteilen - 0.4) / 0.3)}>
        <Tex tex={H_(fmtN(sv[0]))} size={52} />
      </Label3>
      <Label3 t={t} q={W3([sv[0], 0.5])} dx={40} o={cC * clamp((t - T.anteilen - 0.9) / 0.3)}>
        <Tex tex={V_('1')} size={52} />
      </Label3>
      <Label3 t={t} q={W3([sv[0], 0])} dx={20} dy={112} o={twice * end}>
        <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 46, color: COL.h}}>× 2</div>
      </Label3>
      <Label3 t={t} q={W3([Math.cos(halfA) * 0.6, Math.sin(halfA) * 0.6])} dx={46} o={angO * clamp(1 - Math.abs(n - Math.round(n)) * 6)}>
        <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 34, color: C.txt2}}>{fmtN(deg)}°</div>
      </Label3>
    </AbsoluteFill>
  );
};

const SEQ_Y = 790;
const Sequence4: React.FC = () => {
  const t = useSec();
  const o = hide(t, T.hAnteil - 0.25, 0.35);
  if (t < T.aus11 - 0.2 || o <= 0) return null;
  const items: [string, number][] = [
    ['1', T.aus11 - 0.05],
    ['2', T.wird21 + 0.2],
    ['4', T.vier],
    ['8', T.acht],
  ];
  return (
    <div style={{position: 'absolute', left: 540, top: SEQ_Y, transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: 14, opacity: o, textShadow: shadow, whiteSpace: 'nowrap'}}>
      {items.map(([x, at], i) => {
        const p = show(t, at, 0.4);
        const now = bump(t, at + 0.2, 1.2);
        return (
          <React.Fragment key={i}>
            {i ? (
              <span style={{opacity: p}}>
                <Tex tex="\to" size={44} />
              </span>
            ) : null}
            <span style={{opacity: p, transform: `translateY(${(1 - p) * 14}px) scale(${1 + 0.12 * now})`, display: 'inline-block'}}>
              <Tex tex={`(${H_(x)},${V_('1')})`} size={52} />
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Verbindung von einem Matrixeintrag zu seinem Anteil
const Link: React.FC<{t: number; from: V2; to: V2; color: string; p: number}> = ({from, to, color, p}) => {
  if (p <= 0) return null;
  const mx = (from[0] + to[0]) / 2 + 60;
  const my = (from[1] + to[1]) / 2;
  const d = `M ${from[0]} ${from[1]} Q ${mx} ${my} ${to[0]} ${to[1]}`;
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]) * 1.15;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <path d={d} fill="none" stroke={color} strokeWidth={10} strokeOpacity={0.18} strokeDasharray={len} strokeDashoffset={len * (1 - p)} strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={3.5} strokeDasharray={len} strokeDashoffset={len * (1 - p)} strokeLinecap="round" />
      {p > 0.98 ? <circle cx={to[0]} cy={to[1]} r={9} fill={color} /> : null}
    </svg>
  );
};

const MatrixMeaning: React.FC = () => {
  const t = useSec();
  const end = hide(t, T.genau - 0.1, 0.5);
  if (t < T.hAnteil - 0.2 || end <= 0) return null;
  const sv = singleVec(t);
  const linkO = hide(t, T.deshalb - 0.15, 0.4);
  const p2 = easeInOutCubic(clamp((t - T.hAnteil) / 0.8));
  const p1 = easeInOutCubic(clamp((t - T.andere) / 0.8));
  const from2 = entryAt(t, MX.c1, MX.r1 + 40);
  const from1 = entryAt(t, MX.c2 + 24, MX.r2 + 40);
  const to2 = project(t, W3([sv[0] * 0.5, 0], -0.03));
  const to1 = project(t, W3([sv[0], 0.5], -0.03));
  const r1 = show(t, T.deshalb, 0.45);
  const r2 = show(t, T.rechts2 - 0.35, 0.45);
  const vec = (a: string, b: string) => `\\begin{pmatrix}${a}\\\\${b}\\end{pmatrix}`;
  return (
    <AbsoluteFill style={{opacity: end}}>
      <AbsoluteFill style={{opacity: linkO}}>
        <Link t={t} from={from2} to={to2} color={COL.h} p={p2} />
        <Link t={t} from={from1} to={to1} color={COL.v} p={p1} />
        <Label3 t={t} q={W3([sv[0] * 0.5, 0])} dy={70} o={show(t, T.hAnteil + 0.7, 0.4)}>
          <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 40, color: COL.h}}>verdoppelt</div>
        </Label3>
        <Label3 t={t} q={W3([sv[0], 0.5])} dx={-150} dy={-80} o={show(t, T.andere + 0.7, 0.4)}>
          <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 40, color: COL.v}}>bleibt</div>
        </Label3>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 540, top: SEQ_Y, transform: `translate(-50%, -50%) translateY(${(1 - r1) * 16}px)`, opacity: r1, textShadow: shadow, whiteSpace: 'nowrap'}}>
        <Tex tex={`A${vec(H_('x'), V_('y'))}=${vec(H_('2x'), V_('y'))}`} size={60} />
      </div>
      <div style={{position: 'absolute', left: 540, top: SEQ_Y + 170, transform: `translate(-50%, -50%) translateY(${(1 - r2) * 16}px)`, opacity: r2, textShadow: shadow, whiteSpace: 'nowrap'}}>
        <Tex tex={`A^{n}${vec(H_('x'), V_('y'))}=${vec(H_('2^{n}x'), V_('y'))}`} size={60} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Reveal: Eigenrichtung ---------- */

const Reveal: React.FC = () => {
  const t = useSec();
  const end = hide(t, T.cta - 0.3, 0.4);
  if (t < T.eigen - 0.2 || end <= 0) return null;
  const word = springOS(clamp((t - (T.eigen - 0.05)) / 0.7));
  const eh = eigH(t);
  const pop = Math.max(...REV_P.map((p) => bump(t, p + 0.3, 0.9)));
  return (
    <AbsoluteFill style={{opacity: end}}>
      <Label3 t={t} q={[1.6, 0, 0]} dy={78} o={clamp(word * 1.4)}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 22, transform: `scale(${0.85 + 0.15 * word})`}}>
          <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 62, letterSpacing: '-.02em', color: COL.h, textShadow: `0 0 30px rgba(255,194,71,.35), ${shadow}`}}>Eigenrichtung</span>
          <span style={{opacity: show(t, T.dominiert - 0.1, 0.4)}}>
            <Tex tex={H_('\\lambda=2')} size={50} />
          </span>
        </div>
      </Label3>
      <Label3 t={t} q={W3([Math.min(eh[0], 3.2), 0])} dy={-58} o={pop * vis.eigH(t)}>
        <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 44, color: COL.h}}>× 2</div>
      </Label3>
      <Label3 t={t} q={W3([0, EIG_V0])} dx={-74} dy={-24} o={vis.eigV(t) * show(t, T.vertR - 0.1, 0.4)}>
        <Tex tex={V_('\\lambda=1')} size={46} />
      </Label3>
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
  const f = Math.max(bump(t, 0, 0.22) * 0.8, bump(t, HOOK_P[0], 0.3) * 0.5, bump(t, T.linie + 0.2, 0.45) * 0.6, bump(t, T.eigen, 0.4) * 0.6, bump(t, T.linie2 + 0.2, 0.4) * 0.5);
  return f > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.1 * f}} /> : null;
};

/* ---------- Ton ---------- */

const SFX: [number, string, number][] = [
  [0, 'whoosh', 0.5],
  [0, 'accent_small', 0.35],
  [T.matrix + 0.3, 'swell', 0.26],
  ...HOOK_P.map((p, i) => [p, i < 3 ? 'click' : 'tick', i < 3 ? 0.42 : 0.3] as [number, string, number]),
  [HOOK_P[0] - 0.2, 'rise', 0.24],
  [T.linie + 0.2, 'lock', 0.42],
  [T.warum - 0.1, 'whoosh', 0.3],
  [T.einzigen, 'tick', 0.3],
  [T.anteilen + 0.15, 'click', 0.32],
  [T.anteilen + 0.65, 'click', 0.32],
  ...SINGLE_P.map(([p]) => [p, 'rise', 0.22] as [number, string, number]),
  ...SINGLE_P.map(([p, d]) => [p + d - 0.05, 'lock', 0.4] as [number, string, number]),
  [T.aus11, 'tick', 0.3],
  [T.wird21 + 0.2, 'tick', 0.3],
  [T.hAnteil, 'swell', 0.28],
  [T.andere, 'click', 0.3],
  [T.deshalb, 'tick', 0.35],
  [T.rechts2 - 0.35, 'tick', 0.35],
  [T.genau, 'whoosh', 0.28],
  [T.eigen, 'accent', 0.5],
  ...REV_P.map((p) => [p, 'tick', 0.28] as [number, string, number]),
  [T.linie2 + 0.2, 'lock_hi', 0.45],
  [T.cta - 0.1, 'swell', 0.34],
  ...Array.from({length: 8}, (_, i) => [T.tippt + 0.2 + i * 0.075, 'tick', 0.18] as [number, string, number]),
];

/* ---------- Komposition ---------- */

// Die Sprachdatei in Stücke zwischen den Schnitten teilen; jedes Stück startet um die bisher entfernte Zeit früher
const PARTS = [[0, 0] as [number, number], ...VOICE_CUTS].map(([c, d], i) => ({
  from: c + d,
  to: VOICE_CUTS[i] ? VOICE_CUTS[i][0] : Infinity,
  shift: VOICE_CUTS.slice(0, i).reduce((s, [, g]) => s + g, 0),
}));

export type ERProps = {music: boolean; voice: boolean};

export const VideoER: React.FC<ERProps> = ({music, voice}) => {
  useTexFonts();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={1000} strength={0.9} />
      <Scene />
      <SingleLabels />
      <MatrixMeaning />
      <Sequence4 />
      <Reveal />
      <MatrixObject />
      <Warum />
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
