import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C} from '../theme';
import {F, useTexFonts} from '../fonts';
import {V2, bump, clamp, easeInOutCubic, easeOutExpo, lerp, prog, sec, springOS} from '../math';
import {Backdrop, Grain, Mono, Tex, col, useSec} from '../ui';
import {V3} from '../space';
import {COL, Scene} from './Canvas';
import {BEADS_SLIDE, HOOK, KVECS, OTHER_SLIDE, PAIR, PAIR_HIT, PAIR_SLIDE, V_SLIDE, VV, Ms, flat, kIn, kSlideAt, project, sV, vis} from './world';
import {CLIPS, MUSIC, SUBTITLES, T, TOTAL, VOICE, VOICE_HOOK} from './timeline';

const show = (t: number, at: number, d = 0.4) => easeOutExpo(clamp((t - at) / d));
const hide = (t: number, at: number, d = 0.35) => 1 - easeInOutCubic(clamp((t - at) / d));
const shadow = `0 0 14px ${C.bg}, 0 0 30px ${C.bg}`;
const AM = (s: string) => col(COL.v, s);
const CY = (s: string) => col(COL.img, s);
const KE = (s: string) => col(COL.kern, s);
const HOOK_END = HOOK[0] + HOOK[1];

/* ---------- Beschriftungen an Punkten der Welt ---------- */

const Label3: React.FC<{t: number; q: V3; dx?: number; dy?: number; o: number; style?: React.CSSProperties; children: React.ReactNode}> = ({t, q, dx = 0, dy = 0, o, style, children}) => {
  if (o <= 0.005) return null;
  const [x, y] = project(t, q);
  return (
    <div style={{position: 'absolute', left: clamp(x + dx, 90, 940), top: clamp(y + dy, 330, 1395), transform: 'translate(-50%, -50%)', opacity: o, textShadow: shadow, whiteSpace: 'nowrap', ...style}}>
      {children}
    </div>
  );
};

const Glow: React.FC<{g: number; color?: string; children: React.ReactNode}> = ({g, color = C.txt, children}) => (
  <span style={{display: 'inline-block', transform: `scale(${1 + 0.14 * g})`, textShadow: `0 0 ${8 + 28 * g}px ${g > 0.02 ? color : 'transparent'}, ${shadow}`}}>{children}</span>
);

/* ---------- Matrix: im Hook groß in der Mitte, danach als Schild oben ---------- */

// Im Hook entsteht aus der Matrix die Rechnung A · (2; 2) = (0; 0). Die (2; 2) fliegt vom Pfeil v herein,
// die Matrix schickt einen Lichtstrahl auf v, und bei „nichts!“ steht das Ergebnis da. Ab „Spul zurück“ wird sie zum Schild.
const HERO_Y = 525;
const CHIP: V2 = [560, 372];
const HS = 56;
// gemessene Breiten bei 56 px (Matrix samt Rahmen)
const ROW = {A: 450, dot: 42, v: 118, eq: 84, z: 118};
const rowX = (n: number) => {
  const ws = [ROW.A, ROW.dot, ROW.v, ROW.eq, ROW.z].slice(0, n);
  let x = 540 - ws.reduce((a, w) => a + w, 0) / 2;
  return ws.map((w) => {
    const c = x + w / 2;
    x += w;
    return c;
  });
};
const L0 = [540];
const L1 = rowX(3);
const L2 = rowX(5);
const FLY_V: [number, number] = [T.matrix + 0.35, 0.55];
const kFly = (t: number) => easeInOutCubic(clamp((t - FLY_V[0]) / FLY_V[1]));
const kRes = (t: number) => easeInOutCubic(clamp((t - (T.nichts - 0.5)) / 0.4)); // Platz machen in der Pause vor „nichts!“
const kChip = (t: number) => easeInOutCubic(clamp((t - T.spul) / 0.8));
const heroX = (t: number, i: number) => {
  const a = i === 0 ? lerp(L0[0], L1[0], kFly(t)) : L1[i] ?? L2[i];
  return i < 3 ? lerp(a, L2[i], kRes(t)) : L2[i];
};

const MatrixHero: React.FC = () => {
  const t = useSec();
  const o = vis.stage(t) * hide(t, T.cta - 0.3, 0.4);
  const kc = kChip(t);
  const g = bump(t, T.matrix, 1.1) + bump(t, HOOK[0], 1.2) + bump(t, T.amal, 1.0);
  const ax = lerp(heroX(t, 0), CHIP[0], kc);
  const ay = lerp(HERO_Y, CHIP[1], kc);
  const sc = lerp(1, 0.58, kc) * (1 + 0.05 * g);
  const rest = hide(t, T.spul, 0.4);
  const vTip = project(t, flat(VV));
  const fv = kFly(t);
  const vx = fv < 1 ? lerp(vTip[0] + 60, heroX(t, 2), fv) : heroX(t, 2);
  const vy = fv < 1 ? lerp(vTip[1] - 70, HERO_Y, fv) - Math.sin(Math.PI * fv) * 60 : HERO_Y;
  const ra = clamp((t - (T.nichts - 0.08)) / 0.25);
  const gz = bump(t, T.nichts + 0.05, 0.9) + bump(t, T.nullvektor0 + 0.1, 1.1);
  const item = (x: number, y: number, a: number, child: React.ReactNode, scale = 1): React.ReactNode =>
    a > 0.005 ? (
      <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${scale})`, opacity: a, whiteSpace: 'nowrap', textShadow: shadow}}>{child}</div>
    ) : null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div
        style={{
          position: 'absolute',
          left: ax,
          top: ay,
          transform: `translate(-50%, -50%) scale(${sc})`,
          padding: '12px 26px',
          whiteSpace: 'nowrap',
          borderRadius: 26,
          background: `rgba(12,14,40,${0.35 + 0.3 * kc})`,
          border: `2px solid rgba(243,244,251,${0.12 + 0.12 * kc + 0.4 * g})`,
          boxShadow: `0 0 ${16 + 50 * g}px rgba(174,182,255,${0.12 + 0.35 * g})`,
        }}
      >
        <Tex tex={'A=\\begin{pmatrix}1&-1\\\\0&0\\end{pmatrix}'} size={HS} />
      </div>
      {item(heroX(t, 1), HERO_Y, clamp((t - (FLY_V[0] + FLY_V[1] - 0.2)) / 0.25) * rest, <Tex tex={'\\cdot'} size={HS} />)}
      {item(vx, vy, clamp((t - FLY_V[0]) / 0.1) * rest, <Tex tex={AM('\\begin{pmatrix}2\\\\2\\end{pmatrix}')} size={HS} />)}
      {item(L2[3], HERO_Y, ra * rest, <Tex tex={'='} size={HS} />)}
      {item(L2[4], HERO_Y, ra * rest, <Glow g={gz} color={COL.kern}><Tex tex={KE('\\begin{pmatrix}0\\\\0\\end{pmatrix}')} size={HS} /></Glow>, 1)}
      {item(L2[4], HERO_Y + 100, show(t, T.nullvektor0, 0.35) * rest, <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 34, color: COL.kern}}>Nullvektor</span>)}
    </AbsoluteFill>
  );
};

// Lichtstrahl von der Matrix auf den Vektor: zeigt, dass A auf v wirkt
const Beam: React.FC = () => {
  const t = useSec();
  const a = show(t, FLY_V[0] + FLY_V[1] - 0.15, 0.25) * hide(t, T.nichts + 0.1, 0.35) * vis.stage(t);
  if (a <= 0.005) return null;
  const top: V2 = [heroX(t, 0) + 40, HERO_Y + 80];
  const s = sV(t);
  const mid = project(t, flat(Ms([1, 1], s)));
  const half = 150;
  const ph = (t * 1.6) % 1;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: a, mixBlendMode: 'screen'}}>
      <defs>
        <linearGradient id="beam" x1="0" y1={top[1]} x2="0" y2={mid[1]} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgb(190,200,255)" stopOpacity={0.5} />
          <stop offset="1" stopColor="rgb(255,236,200)" stopOpacity={0.12} />
        </linearGradient>
      </defs>
      <polygon points={`${top[0] - half},${top[1]} ${top[0] + half},${top[1]} ${mid[0] + 26},${mid[1]} ${mid[0] - 26},${mid[1]}`} fill="url(#beam)" />
      {[0, 0.33, 0.66].map((o) => {
        const k = (ph + o) % 1;
        const y = lerp(top[1], mid[1], k);
        const w = lerp(half, 26, k);
        const x = lerp(top[0], mid[0], k);
        return <line key={o} x1={x - w} y1={y} x2={x + w} y2={y} stroke="white" strokeOpacity={0.55 * Math.sin(Math.PI * k)} strokeWidth={4} strokeLinecap="round" />;
      })}
    </svg>
  );
};

const TOP_Y = 560;
const FORMULA_Y = 1290;

const VLabel: React.FC = () => {
  const t = useSec();
  const sv = sV(t);
  const o = vis.v(t) * vis.stage(t) * clamp((1 - sv) * 3) * hide(t, T.doppelte, 0.3);
  const tip = Ms(VV, sv);
  const neq = show(t, 0, 0.3) * hide(t, FLY_V[0], 0.3);
  const coords = show(t, T.aber + 0.1, 0.4) * hide(t, V_SLIDE[0] + 0.2, 0.3);
  return (
    <Label3 t={t} q={flat(tip)} dx={coords > 0.01 ? 150 : 40} dy={coords > 0.01 ? 20 : -62} o={o}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
        <Tex tex={AM('v')} size={60} />
        {neq > 0.01 ? (
          <span style={{opacity: neq}}>
            <Tex tex={'\\neq \\vec{0}'} size={50} />
          </span>
        ) : null}
        {coords > 0.01 ? (
          <span style={{opacity: coords}}>
            <Tex tex={`=${AM('(2,\\,2)')}`} size={46} />
          </span>
        ) : null}
      </div>
    </Label3>
  );
};

// beim Hook-Gitter zeigt „?“ die Frage
const Question: React.FC = () => {
  const t = useSec();
  const o = show(t, T.was, 0.35) * hide(t, T.spul, 0.3);
  if (o <= 0) return null;
  const p = springOS(clamp((t - T.was) / 0.6));
  return (
    <div style={{position: 'absolute', left: 540, top: HERO_Y + 250, transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * p})`, opacity: o, fontFamily: F.display, fontWeight: 800, fontSize: 90, color: COL.v, textShadow: shadow}}>
      ?
    </div>
  );
};

/* ---------- Schiene benennen ---------- */

const RailTag: React.FC = () => {
  const t = useSec();
  const o = show(t, T.schiene, 0.4) * hide(t, T.moment, 0.4) * vis.stage(t);
  return (
    <Label3 t={t} q={[-0.5, 2.3, 0]} o={o}>
      <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 38, color: COL.kern, transform: `scale(${1 + 0.1 * bump(t, T.schiene, 1)})`}}>Schiene in den Nullpunkt</div>
    </Label3>
  );
};

/* ---------- der doppelte, der halbe, der umgedrehte ---------- */

const K_TEX = ['2' + 'v', '\\tfrac{1}{2}v', '-v'];
const KLabels: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill>
      {KVECS.map(({v}, i) => {
        const o = show(t, kIn(i), 0.3) * hide(t, kSlideAt(i) + 0.15, 0.3) * vis.stage(t);
        const side = v[0] < 0 ? -1 : 1;
        return (
          <Label3 key={i} t={t} q={flat(v)} dx={side * 70} dy={-30} o={o}>
            <Glow g={bump(t, KVECS[i].at + 0.1, 0.8)} color={COL.v}>
              <Tex tex={AM(K_TEX[i])} size={56} />
            </Glow>
          </Label3>
        );
      })}
    </AbsoluteFill>
  );
};

const InfLine: React.FC = () => {
  const t = useSec();
  const o = show(t, T.unendlich - 0.05, 0.4) * hide(t, T.alle, 0.35);
  if (o <= 0) return null;
  const one = show(t, BEADS_SLIDE[0] + BEADS_SLIDE[1] - 0.15, 0.4);
  return (
    <div style={{position: 'absolute', left: 540, top: TOP_Y, transform: `translate(-50%, -50%) translateY(${(1 - o) * 16}px)`, opacity: o, display: 'flex', alignItems: 'center', gap: 26, whiteSpace: 'nowrap', fontFamily: F.display, fontWeight: 800, fontSize: 62, color: C.txt, textShadow: shadow}}>
      <span style={{color: COL.v}}>unendlich viele</span>
      <span style={{opacity: one}}>→</span>
      <span style={{opacity: one, transform: `scale(${1 + 0.12 * bump(t, BEADS_SLIDE[0] + BEADS_SLIDE[1], 1)})`, display: 'inline-block'}}>ein Punkt</span>
    </div>
  );
};

/* ---------- Kern: Name an der Geraden und Formel aus der Szene ---------- */

const KernTag: React.FC = () => {
  const t = useSec();
  const o = show(t, T.kern - 0.05, 0.4) * hide(t, T.cta - 0.3, 0.4) * vis.stage(t) * lerp(1, 0.55, prog(t, T.deshalb, 0.6));
  const pre = show(t, T.kern + 0.6, 0.4) * hide(t, T.deshalb, 0.4);
  return (
    <Label3 t={t} q={[0.4, 3.0, 0]} o={o}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
        <Glow g={bump(t, T.kern, 1.2)} color={COL.kern}>
          <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 52, color: COL.kern, letterSpacing: '-.02em'}}>Kern von A</span>
        </Glow>
        <span style={{opacity: pre, fontFamily: F.mono, fontSize: 26, letterSpacing: '.08em', textTransform: 'uppercase', color: C.txt2}}>Vektoren vor der Abbildung</span>
      </div>
    </Label3>
  );
};

type Piece = {tex: string; w: number; at: number; from?: V2; glow?: number; color?: string};
const FLY = 0.6;
const Pieces: React.FC<{t: number; y: number; pieces: Piece[]; size: number}> = ({t, y, pieces, size}) => {
  let x0 = 540 - pieces.reduce((a, p) => a + p.w, 0) / 2;
  const xs = pieces.map((p) => {
    const c = x0 + p.w / 2;
    x0 += p.w;
    return c;
  });
  return (
    <>
      {pieces.map((p, i) => {
        const fly = p.from ? easeInOutCubic(clamp((t - p.at) / FLY)) : 1;
        const a = p.from ? clamp((t - p.at) / 0.1) : show(t, p.at, 0.35);
        if (a <= 0) return null;
        const x = p.from ? lerp(p.from[0], xs[i], fly) : xs[i];
        const yy = p.from ? lerp(p.from[1], y, fly) - Math.sin(Math.PI * fly) * 50 : y + (1 - a) * 12;
        const g = p.glow ?? 0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: yy,
              transform: `translate(-50%, -50%) scale(${1 + 0.16 * g})`,
              opacity: a,
              whiteSpace: 'nowrap',
              textShadow: `0 0 ${8 + 28 * g}px ${g > 0.02 ? p.color ?? C.txt : 'transparent'}, ${shadow}`,
            }}
          >
            <Tex tex={p.tex} size={size} />
          </div>
        );
      })}
    </>
  );
};

const Formula: React.FC = () => {
  const t = useSec();
  const o = hide(t, T.deshalb - 0.1, 0.5);
  if (t < T.kern || o <= 0) return null;
  const vFrom = project(t, flat([2, 2]));
  const zFrom = project(t, [0, 0, 0]);
  const aV = T.alleV;
  const aA = T.amal;
  const a0 = T.nullIst + 0.15;
  const pieces: Piece[] = [
    {tex: `\\ker(A)`, w: 220, at: T.kern + 0.1, glow: bump(t, T.kern + 0.2, 1), color: COL.kern},
    {tex: '=', w: 76, at: aV - 0.1},
    {tex: '\\{', w: 34, at: aV - 0.1},
    {tex: AM('v'), w: 42, at: aV, from: [vFrom[0], vFrom[1] - 30], glow: bump(t, aV + 0.6, 0.9), color: COL.v},
    {tex: '\\mid', w: 48, at: aV + 0.35},
    {tex: 'A', w: 44, at: aA - 0.1, from: [CHIP[0] - 70, CHIP[1]], glow: bump(t, aA + 0.5, 0.9)},
    {tex: '\\cdot', w: 32, at: aA + 0.25},
    {tex: AM('v'), w: 38, at: aA + 0.3},
    {tex: '=', w: 72, at: a0 - 0.1},
    {tex: '\\vec{0}', w: 44, at: a0, from: [zFrom[0], zFrom[1] - 20], glow: bump(t, a0 + 0.6, 1) + bump(t, T.nullvektor + 0.2, 1.1), color: COL.kern},
    {tex: '\\}', w: 34, at: a0 + 0.1},
  ];
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 540 - 380, top: FORMULA_Y - 62, width: 760, height: 124, borderRadius: 30, background: 'rgba(7,8,26,.6)', opacity: show(t, T.kern, 0.4)}} />
      <Pieces t={t} y={FORMULA_Y} pieces={pieces} size={64} />
    </AbsoluteFill>
  );
};

// Der Nullvektor gehört immer dazu: A · 0 = 0
const ZeroTag: React.FC = () => {
  const t = useSec();
  const o = show(t, T.nullvektor + 0.1, 0.4) * hide(t, T.deshalb, 0.4) * vis.stage(t);
  return (
    <Label3 t={t} q={[0, 0, 0]} dx={-30} dy={78} o={o}>
      <Glow g={bump(t, T.dazu, 1.0)} color={COL.kern}>
        <Tex tex={`A\\cdot\\vec{0}=\\vec{0}`} size={46} />
      </Glow>
    </Label3>
  );
};

/* ---------- kein Zurück ---------- */

const PAIR_LAND = PAIR_SLIDE[0] + PAIR_SLIDE[1];
const PairLabels: React.FC = () => {
  const t = useSec();
  const st = vis.pair(t) * vis.stage(t);
  if (st <= 0.005) return null;
  const tags = ['(3,\\,1)', '(4,\\,2)'];
  const lab = hide(t, PAIR_SLIDE[0] + 0.1, 0.3) + show(t, T.dort + 0.6, 0.4);
  const hit = show(t, PAIR_LAND - 0.1, 0.4);
  const ask = vis.ask(t) * clamp((t - (T.dort + 0.6)) / 0.4);
  return (
    <AbsoluteFill style={{opacity: st}}>
      {PAIR.map((p, i) => (
        <Label3 key={i} t={t} q={flat(p)} dx={i === 0 ? 70 : 60} dy={i === 0 ? 34 : -40} o={clamp(lab) * show(t, T.deshalb + 0.2 + i * 0.2, 0.35)}>
          <Glow g={bump(t, T.zwei + 0.2 + i * 0.3, 0.8)} color={COL.v}>
            <Tex tex={AM(tags[i])} size={46} />
          </Glow>
        </Label3>
      ))}
      <Label3 t={t} q={flat(PAIR_HIT)} dy={70} o={hit}>
        <Glow g={bump(t, PAIR_LAND, 1.0) + bump(t, T.demselben, 1.0)} color={COL.img}>
          <Tex tex={CY('(2,\\,0)')} size={50} />
        </Glow>
      </Label3>
      <Label3 t={t} q={[2.6, 0.9, 0]} dx={-40} dy={-30} o={ask}>
        <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 84, color: C.txt, transform: `scale(${1 + 0.15 * bump(t, T.welcher, 1)})`}}>?</div>
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
  const cy = lerp(372, 700, k);
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
      <div style={{position: 'absolute', left: 148, top: 372, transform: 'translateY(-50%)', opacity: a * hide(t, T.cta, 0.35) * 0.82, fontFamily: F.display, fontWeight: 700, fontSize: 32, letterSpacing: '-.01em', color: C.txt, textShadow: shadow}}>
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
  const f = Math.max(bump(t, 0, 0.22) * 0.8, bump(t, HOOK_END, 0.35) * 0.7, bump(t, V_SLIDE[0] + V_SLIDE[1], 0.35) * 0.5, bump(t, BEADS_SLIDE[0] + BEADS_SLIDE[1], 0.4) * 0.8);
  return f > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.1 * f}} /> : null;
};

/* ---------- Ton ---------- */

const OTHER_LAND = OTHER_SLIDE[0] + OTHER_SLIDE[1];
const SFX: [number, string, number][] = [
  [0, 'whoosh', 0.45],
  [HOOK[0] - 0.2, 'rise', 0.32],
  [HOOK_END - 0.03, 'collapse', 0.5],
  [T.nichts, 'tick', 0.32],
  [FLY_V[0], 'whoosh', 0.26],
  [T.matrix, 'click', 0.3],
  [T.spul, 'whoosh', 0.34],
  [T.punkte - 0.2, 'swell', 0.24],
  [T.rutscht + 0.15, 'rise', 0.22],
  [T.anderen + 0.1, 'click', 0.28],
  [T.anderen + 0.32, 'click', 0.28],
  [OTHER_LAND - 0.03, 'lock', 0.34],
  [T.schiene, 'accent_small', 0.34],
  [V_SLIDE[0], 'rise', 0.26],
  [V_SLIDE[0] + V_SLIDE[1] - 0.03, 'collapse', 0.42],
  [T.moment, 'tick', 0.3],
  ...KVECS.map((_, i) => [kSlideAt(i) + 0.8, 'tick', 0.32] as [number, string, number]),
  [T.jeder - 0.1, 'swell', 0.3],
  [BEADS_SLIDE[0], 'rise', 0.32],
  [BEADS_SLIDE[0] + BEADS_SLIDE[1] - 0.03, 'collapse', 0.55],
  [T.alle + 0.1, 'whoosh', 0.3],
  [T.kern, 'accent', 0.45],
  [T.alleV, 'tick', 0.28],
  [T.amal - 0.1, 'tick', 0.28],
  [T.nullIst + 0.15, 'lock', 0.36],
  [T.nullvektor + 0.2, 'click', 0.3],
  [T.deshalb + 0.1, 'whoosh', 0.26],
  [PAIR_LAND - 0.03, 'lock_hi', 0.42],
  [T.dort + 0.2, 'buzz', 0.2],
  [T.cta - 0.1, 'swell', 0.34],
  ...Array.from({length: 8}, (_, i) => [T.tippt + 0.2 + i * 0.075, 'tick', 0.18] as [number, string, number]),
];

/* ---------- Komposition ---------- */

const LEAD = 0.03;
const TAIL = 0.08;

export type KNProps = {music: boolean; voice: boolean};

export const VideoKN: React.FC<KNProps> = ({music, voice}) => {
  useTexFonts();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={1000} strength={0.9} />
      <Scene />
      <VLabel />
      <RailTag />
      <KLabels />
      <KernTag />
      <ZeroTag />
      <PairLabels />
      <Question />
      <InfLine />
      <Formula />
      <Beam />
      <MatrixHero />
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
      {music ? <Audio src={staticFile(MUSIC)} volume={voice ? 0.32 : 0.6} /> : null}
      {voice
        ? CLIPS.map((c, i) => {
            const lead = Math.min(LEAD, c.from, c.at);
            return (
              <Sequence key={i} from={sec(c.at - lead)} durationInFrames={sec(c.to - c.from + lead + TAIL)} layout="none">
                <Audio src={staticFile(c.src ? VOICE_HOOK : VOICE)} trimBefore={sec(c.from - lead)} trimAfter={sec(c.to + TAIL)} />
              </Sequence>
            );
          })
        : null}
    </AbsoluteFill>
  );
};

export {TOTAL};
