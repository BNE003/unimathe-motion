import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C} from '../theme';
import {F, useTexFonts} from '../fonts';
import {V2, bump, clamp, easeInOutCubic, easeOutExpo, lerp, prog, sec, springOS} from '../math';
import {Grain, Backdrop, Mono, Tex, col, useSec} from '../ui';
import {V3} from '../space';
import {COL, Scene} from './Canvas';
import {A, B, FLIP_AT, FLIP_D, LANDED2, O1, O2, SWEEP_L, SWEEP_R, camAt, flat, flipMap, flipPhi, ghostTip, project, vis} from './world';
import {MUSIC, SUBTITLES, SUBTITLES2, T, TOTAL, V, VOICE, VOICE2, VOICE2_AT, VOICE_CUTS} from './timeline';

const show = (t: number, at: number, d = 0.4) => easeOutExpo(clamp((t - at) / d));
const hide = (t: number, at: number, d = 0.35) => 1 - easeInOutCubic(clamp((t - at) / d));
const shadow = `0 0 14px ${C.bg}, 0 0 30px ${C.bg}`;
const add = (p: V2, q: V2, k = 1): V2 => [p[0] + q[0] * k, p[1] + q[1] * k];

/* ---------- Beschriftungen an Punkten der Welt ---------- */

const Label3: React.FC<{t: number; q: V3; dx?: number; dy?: number; o: number; style?: React.CSSProperties; children: React.ReactNode}> = ({t, q, dx = 0, dy = 0, o, style, children}) => {
  if (o <= 0.005) return null;
  const [x, y] = project(t, q);
  return (
    <div style={{position: 'absolute', left: clamp(x + dx, 90, 990), top: clamp(y + dy, 400, 1395), transform: 'translate(-50%, -50%)', opacity: o, textShadow: shadow, whiteSpace: 'nowrap', ...style}}>
      {children}
    </div>
  );
};

// Punkt der rechten Fläche (in Koordinaten des Originals), so wie er gerade umgeklappt ist
const mapR = (t: number) => flipMap(flipPhi(t));

/* ---------- det-Schilder über den Flächen ---------- */

const Sign: React.FC<{v: string; size: number; glow?: number}> = ({v, size, glow = 0}) => {
  const color = v === '+6' ? COL.pos : v === '−6' ? COL.neg : C.txt;
  const tex = v === '+6' ? col(COL.pos, '+6') : v === '−6' ? col(COL.neg, '-6') : '\\,?';
  return (
    <span style={{display: 'inline-block', textShadow: `0 0 ${10 + 30 * glow}px ${glow > 0.02 ? color : 'transparent'}, ${shadow}`, transform: `scale(${1 + 0.12 * glow})`}}>
      <Tex tex={tex} size={size} />
    </span>
  );
};

const DetPlate: React.FC<{t: number; q: V3; o: number; v: string; size: number; turn?: number; glow?: number}> = ({t, q, o, v, size, turn = 0, glow = 0}) => (
  <Label3 t={t} q={q} dy={-size * 1.05} o={o}>
    <div style={{display: 'flex', alignItems: 'baseline', gap: size * 0.22, transform: `perspective(800px) rotateX(${turn * 90}deg)`}}>
      <Tex tex="\det =" size={size} />
      <Sign v={v} size={size} glow={glow} />
    </div>
  </Label3>
);

const DetLabels: React.FC = () => {
  const t = useSec();
  const st = vis.stage(t);
  const size = lerp(66, 54, prog(t, T.grund, 1.2));
  const topL = flat(add(O1, [1.5, 2]));
  const glowL = bump(t, T.positiv - 0.1, 1.1) + bump(t, T.gegen + 0.2, 1.3) + bump(t, T.determinante, 1.1) + bump(t, T.andereO, 1.1);
  const glowR = bump(t, T.negativ - 0.1, 1.1) + bump(t, T.imUhr + 0.15, 1.3) + bump(t, T.determinante + 0.3, 1.1) + bump(t, T.andereO + 0.2, 1.1);

  // rechts: im Hook −6; die Kopie hebt mit +6 ab (sie ist dann noch das Original), wird beim Umklappen zu „?“ und bei „Im Uhrzeigersinn“ zu −6
  let v = '−6';
  let turn = 0;
  const qR = mapR(t)(add(O1, [1.5, 2]));
  let oR = vis.right(t);
  if (t >= FLIP_AT - 0.05) {
    const toQ = FLIP_AT + 0.45;
    const toNeg = T.imUhr + 0.05;
    if (t < toQ) {
      v = '+6';
      turn = clamp((t - (toQ - 0.15)) / 0.15);
    } else if (t < toNeg) {
      v = '?';
      turn = 1 - clamp((t - toQ) / 0.15) + clamp((t - (toNeg - 0.15)) / 0.15);
    } else {
      v = '−6';
      turn = 1 - clamp((t - toNeg) / 0.18);
    }
    oR = show(t, FLIP_AT, 0.3);
  }
  const off = (hide(t, T.comp - 0.6, 0.4) + show(t, T.gleicheF - 0.1, 0.5)) * hide(t, T.cta - 0.3, 0.4);
  return (
    <AbsoluteFill style={{opacity: st * clamp(off)}}>
      <DetPlate t={t} q={topL} o={1} v="+6" size={size} glow={glowL} />
      <DetPlate t={t} q={qR} o={oR} v={v} size={size} turn={turn} glow={v === '−6' ? glowR : 0} />
    </AbsoluteFill>
  );
};

/* ---------- Vektornamen mit Reihenfolge ---------- */

const Badge: React.FC<{n: number; o: number; pop: number}> = ({n, o, pop}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 34,
      height: 34,
      borderRadius: 17,
      marginLeft: 8,
      border: `2.5px solid ${C.txt}`,
      fontFamily: F.display,
      fontWeight: 800,
      fontSize: 21,
      color: C.txt,
      opacity: o,
      transform: `scale(${(0.6 + 0.4 * o) * (1 + 0.25 * pop)}) translateY(-4px)`,
      background: 'rgba(7,8,26,.6)',
    }}
  >
    {n}
  </span>
);

const VecName: React.FC<{t: number; q: V3; o: number; name: string; color: string; n: number; at: number}> = ({t, q, o, name, color, n, at}) => (
  <Label3 t={t} q={q} o={o}>
    <div style={{display: 'flex', alignItems: 'center'}}>
      <Tex tex={col(color, name)} size={50} />
      <Badge n={n} o={show(t, at, 0.35)} pop={bump(t, at, 0.8)} />
    </div>
  </Label3>
);

const VecLabels: React.FC = () => {
  const t = useSec();
  const st = vis.stage(t) * hide(t, T.comp - 0.6, 0.4);
  const oL = st * clamp(vis.vecA(t) * 1.5);
  const oLb = st * clamp(vis.vecB(t) * 1.5);
  const m = mapR(t);
  const oR = st * show(t, FLIP_AT + FLIP_D - 0.1, 0.4);
  return (
    <AbsoluteFill>
      <VecName t={t} q={flat(add(O1, [2.55, 0.42]))} o={oL} name="a" color={COL.a} n={1} at={T.ersten} />
      <VecName t={t} q={flat(add(O1, [0.5, 1.62]))} o={oLb} name="b" color={COL.b} n={2} at={T.zweiten} />
      <VecName t={t} q={m(add(O1, [2.55, 0.42]))} o={oR} name="a'" color={COL.a} n={1} at={T.ersten2} />
      <VecName t={t} q={m(add(O1, [0.5, 1.62]))} o={oR} name="b'" color={COL.b} n={2} at={T.ersten2 + 0.6} />
    </AbsoluteFill>
  );
};

/* ---------- Drehrichtung in Worten ---------- */

// Kreispfeil: ccw = gegen den Uhrzeigersinn
const Turn: React.FC<{ccw: boolean; color: string; size: number; spin: number}> = ({ccw, color, size, spin}) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{transform: `rotate(${(ccw ? -1 : 1) * spin * 360}deg)`}}>
    <g transform={ccw ? 'scale(-1,1)' : undefined}>
      <path d="M 0 -34 A 34 34 0 1 1 -34 0" fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" />
      <path d="M -34 -16 L -34 4 L -50 -8 Z" fill={color} transform="rotate(0)" />
    </g>
  </svg>
);

const Caption: React.FC<{t: number; q: V3; o: number; text: string; ccw: boolean; color: string; size: number; pop: number}> = ({t, q, o, text, ccw, color, size, pop}) => (
  <Label3 t={t} q={q} dy={size * 1.7} o={o}>
    <div style={{display: 'flex', alignItems: 'center', gap: 12, transform: `scale(${1 + 0.08 * pop})`}}>
      <Turn ccw={ccw} color={color} size={size * 1.3} spin={easeInOutCubic(clamp(pop))} />
      <span style={{fontFamily: F.display, fontWeight: 800, fontSize: size, letterSpacing: '-.01em', color}}>{text}</span>
    </div>
  </Label3>
);

const Captions: React.FC = () => {
  const t = useSec();
  const st = vis.stage(t);
  const size = lerp(44, 34, prog(t, T.doch, 1.2));
  const away = Math.max(hide(t, T.comp - 0.6, 0.4), show(t, T.calc + 0.7, 0.5));
  const oL = st * show(t, T.gegen - 0.05, 0.4) * hide(t, T.cta - 0.3) * away;
  const oR = st * show(t, T.imUhr - 0.05, 0.4) * hide(t, T.cta - 0.3) * away;
  return (
    <AbsoluteFill>
      <Caption t={t} q={flat(add(O1, [1.5, 0]))} o={oL} text="gegen den Uhrzeigersinn" ccw color={COL.pos} size={size} pop={bump(t, T.gegen, 1.0) + bump(t, T.orientierung, 1.0) + bump(t, T.andereO, 1.0)} />
      <Caption t={t} q={mapR(t)(add(O1, [1.5, 0]))} o={oR} text="im Uhrzeigersinn" ccw={false} color={COL.neg} size={size} pop={bump(t, T.imUhr, 1.0) + bump(t, T.orientierung + 0.2, 1.0) + bump(t, T.umgekehrt, 1.0) + bump(t, T.andereO + 0.2, 1.0)} />
    </AbsoluteFill>
  );
};


/* ---------- Fläche = 6 in beiden Flächen ---------- */

const AreaLabels: React.FC = () => {
  const t = useSec();
  const o = vis.stage(t) * Math.max(show(t, T.groesse2, 0.4) * hide(t, T.comp - 0.6, 0.4), show(t, T.gleicheF, 0.4) * hide(t, T.cta - 0.3, 0.4));
  if (o <= 0) return null;
  const q: V2 = add(O1, [1.95, 1.2]);
  const el = (
    <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 36, color: C.txt, transform: `scale(${1 + 0.1 * (bump(t, T.groesse2, 1) + bump(t, T.gleicheF, 1))})`}}>Fläche = 6</div>
  );
  return (
    <AbsoluteFill>
      <Label3 t={t} q={flat(q)} o={o}>
        {el}
      </Label3>
      <Label3 t={t} q={mapR(t)(q)} o={o}>
        {el}
      </Label3>
    </AbsoluteFill>
  );
};

/* ---------- x-Komponente: x = +3 → x = −3, Länge bleibt 3 ---------- */

const Tag: React.FC<{tex: string; glow: number; color?: string}> = ({tex, glow, color = COL.a}) => (
  <div
    style={{
      padding: '4px 16px',
      borderRadius: 14,
      background: 'rgba(7,8,26,.72)',
      border: `2px solid ${rgbaHex(color, 0.35 + 0.5 * glow)}`,
      boxShadow: `0 0 ${10 + 30 * glow}px ${rgbaHex(color, 0.15 + 0.4 * glow)}`,
      transform: `scale(${1 + 0.14 * glow})`,
    }}
  >
    <Tex tex={tex} size={44} />
  </div>
);
const rgbaHex = (h: string, a: number) => `rgba(${[1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(',')},${a})`;

const XLABEL_DY = 62;
const CompLabels: React.FC = () => {
  const t = useSec();
  const ax = vis.compAxis(t) * vis.stage(t);
  if (ax <= 0.005) return null;
  const strong = clamp((ax - 0.22) / 0.78);
  const ox = O2[0];
  const plus = show(t, T.comp + 0.25, 0.4) * hide(t, T.flip + 0.15, 0.3);
  const minus = show(t, LANDED2 - 0.05, 0.4) * hide(t, T.calc + 0.5, 0.5);
  const len = show(t, T.comp + 0.5, 0.4) * hide(t, T.calc - 0.1, 0.4);
  const tip = ghostTip(t);
  const mid: V3 = [(ox + tip[0]) / 2, 0, tip[2] / 2];
  const lenG = bump(t, T.drei - 0.05, 1.1);
  return (
    <AbsoluteFill>
      <Label3 t={t} q={[ox, 0, 0]} dy={XLABEL_DY} o={strong * 0.9}>
        <Tex tex="0" size={38} />
      </Label3>
      <Label3 t={t} q={[ox + 4.3, 0, 0]} dx={34} dy={-4} o={strong * 0.9}>
        <Tex tex="x" size={42} />
      </Label3>
      <Label3 t={t} q={[ox, 2.75, 0]} dx={34} dy={-10} o={strong * 0.9}>
        <Tex tex="y" size={42} />
      </Label3>
      <Label3 t={t} q={[ox + 3, 0, 0]} dy={XLABEL_DY} o={plus}>
        <Tag tex={`x=${col(COL.a, '+3')}`} glow={bump(t, T.comp + 0.3, 1.0)} />
      </Label3>
      <Label3 t={t} q={[ox - 3, 0, 0]} dy={XLABEL_DY} o={minus}>
        <Tag tex={`x=${col(COL.a, '-3')}`} glow={bump(t, LANDED2, 0.8) + bump(t, T.minus3 - 0.05, 1.1)} />
      </Label3>
      <Label3 t={t} q={mid} dy={-48} o={len}>
        <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 38, color: C.txt, transform: `scale(${1 + 0.15 * lenG})`, textShadow: `0 0 ${10 + 26 * lenG}px rgba(255,255,255,${0.2 + 0.5 * lenG}), ${shadow}`}}>
          Länge 3
        </div>
      </Label3>
    </AbsoluteFill>
  );
};

/* ---------- Komponenten und Rechnung: die Zahlen kommen aus den Vektoren ---------- */

type Piece = {tex: string; w: number; at: number; from?: V2; glow?: number; color?: string};
const layout = (ps: Piece[], cx = 540) => {
  let x = cx - ps.reduce((a, p) => a + p.w, 0) / 2;
  return ps.map((p) => {
    const c = x + p.w / 2;
    x += p.w;
    return c;
  });
};

const FLY = 0.6;
const Pieces: React.FC<{t: number; x: number; y: number; pieces: Piece[]; size: number}> = ({t, x: cx, y, pieces, size}) => {
  const xs = layout(pieces, cx);
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

const A_ = (s: string) => col(COL.a, s);
const B_ = (s: string) => col(COL.b, s);

// Komponentenschilder über den Flächen: a = (3, 0), b = (0, 2) bzw. a′ = (−3, 0), b′ = (0, 2)
const PS = 44;
const aPlate = (name: string, xs: string, xw: number, nameW: number, at: number, glow: number, from?: V2): Piece[] => [
  {tex: A_(name), w: nameW, at},
  {tex: '=', w: 50, at},
  {tex: '(', w: 18, at},
  {tex: A_(xs), w: xw, at: from ? at + 0.05 : at, from, glow, color: COL.a},
  {tex: ',', w: 26, at},
  {tex: A_('0'), w: 28, at},
  {tex: ')', w: 18, at},
];
const bPlate = (name: string, nameW: number, at: number, glow: number): Piece[] => [
  {tex: B_(name), w: nameW, at},
  {tex: '=', w: 50, at},
  {tex: '(', w: 18, at},
  {tex: B_('0'), w: 28, at},
  {tex: ',', w: 26, at},
  {tex: B_('2'), w: 28, at, glow, color: COL.b},
  {tex: ')', w: 18, at},
];
const PLATE_DY = [-118, -58];
const plateAnchor = (t: number, right: boolean): V2 => {
  const top = add(O1, [1.5, 2]);
  return project(t, right ? mapR(t)(top) : flat(top));
};
// Bildschirmposition des n-ten Stücks eines Schildes
const pieceAt = (ps: Piece[], n: number, anchor: V2, dy: number): V2 => [layout(ps, anchor[0])[n], anchor[1] + dy];

const R1 = T.calc + 0.75;
const R2 = R1 + 0.5;
const FS = 50;
const ROW_Y = {r1: 476, r2: 578, abs: 700};

const Formula: React.FC = () => {
  const t = useSec();
  const end = hide(t, T.gleicheF - 0.25, 0.4) * vis.stage(t);
  if (t < T.minus3 - 0.3 || end <= 0) return null;
  const aL = plateAnchor(t, false);
  const aR = plateAnchor(t, true);
  const xTag: V2 = project(t, [O2[0] - 3, 0, 0]);
  const g3 = bump(t, R1 + 0.05, 1.0);
  const gm3 = bump(t, T.minus3 + 0.4, 1.0) + bump(t, R2 + 0.05, 1.0);
  const g2 = bump(t, R1 + 0.25, 1.0);
  const g2r = bump(t, R2 + 0.25, 1.0);
  const plA = aPlate('a', '3', 28, 30, T.calc + 0.3, g3);
  const plB = bPlate('b', 30, T.calc + 0.45, g2);
  const plA2 = aPlate("a'", '-3', 54, 40, T.minus3 - 0.1, gm3, [xTag[0], xTag[1] + XLABEL_DY]);
  const plB2 = bPlate("b'", 40, T.calc + 0.45, g2r);
  const minusG = bump(t, T.minus - 0.05, 1.0) + bump(t, T.umgekehrt - 0.1, 1.2);
  const abs = show(t, T.negativ2 - 0.15, 0.45);
  const absG = bump(t, T.negativ2 + 0.3, 1.1);
  const plateO = hide(t, T.gleicheF - 0.4, 0.4);
  return (
    <AbsoluteFill style={{opacity: end}}>
      <AbsoluteFill style={{opacity: plateO}}>
        <Pieces t={t} x={aL[0]} y={aL[1] + PLATE_DY[0]} pieces={plA} size={PS} />
        <Pieces t={t} x={aL[0]} y={aL[1] + PLATE_DY[1]} pieces={plB} size={PS} />
        <Pieces t={t} x={aR[0]} y={aR[1] + PLATE_DY[0]} pieces={plA2} size={PS} />
        <Pieces t={t} x={aR[0]} y={aR[1] + PLATE_DY[1]} pieces={plB2} size={PS} />
      </AbsoluteFill>
      <Pieces
        t={t}
        x={540}
        y={ROW_Y.r1}
        size={FS}
        pieces={[
          {tex: `\\det(${A_('a')},${B_('b')})`, w: 214, at: R1},
          {tex: '=', w: 70, at: R1},
          {tex: A_('3'), w: 36, at: R1 + 0.05, from: pieceAt(plA, 3, aL, PLATE_DY[0])},
          {tex: '\\cdot', w: 34, at: R1 + 0.4},
          {tex: B_('2'), w: 36, at: R1 + 0.25, from: pieceAt(plB, 5, aL, PLATE_DY[1])},
          {tex: '=', w: 80, at: R1 + 0.8},
          {tex: col(COL.pos, '+6'), w: 80, at: R1 + 0.85, glow: bump(t, R1 + 0.9, 1), color: COL.pos},
        ]}
      />
      <Pieces
        t={t}
        x={540}
        y={ROW_Y.r2}
        size={FS}
        pieces={[
          {tex: `\\det(${A_("a'")},${B_("b'")})`, w: 236, at: R2},
          {tex: '=', w: 70, at: R2},
          {tex: `(${A_('-3')})`, w: 118, at: R2 + 0.05, from: pieceAt(plA2, 3, aR, PLATE_DY[0])},
          {tex: '\\cdot', w: 34, at: R2 + 0.4},
          {tex: B_('2'), w: 36, at: R2 + 0.25, from: pieceAt(plB2, 5, aR, PLATE_DY[1])},
          {tex: '=', w: 80, at: R2 + 0.8},
          {tex: col(COL.neg, '-6'), w: 80, at: R2 + 0.85, glow: bump(t, R2 + 0.9, 1) + minusG, color: COL.neg},
        ]}
      />
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: ROW_Y.abs,
          transform: `translate(-50%, -50%) translateY(${(1 - abs) * 14}px) scale(${1 + 0.08 * absG})`,
          opacity: abs,
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: 26,
          padding: '10px 30px',
          borderRadius: 22,
          border: `2px solid rgba(243,244,251,${0.25 + 0.4 * absG})`,
          background: 'rgba(12,14,40,.55)',
        }}
      >
        <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 40, color: C.txt}}>Fläche</span>
        <Tex tex={`F=|\\det|=6`} size={FS} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Schluss ---------- */

const Final: React.FC = () => {
  const t = useSec();
  const o = vis.stage(t) * hide(t, T.cta - 0.3, 0.4);
  const p1 = springOS(clamp((t - (T.gleicheF - 0.05)) / 0.7));
  const p2 = springOS(clamp((t - (T.andereO - 0.05)) / 0.7));
  if (p1 <= 0 || o <= 0) return null;
  const base: React.CSSProperties = {position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 92, letterSpacing: '-.035em'};
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{...base, top: 470, color: C.txt, opacity: clamp(p1 * 1.4), transform: `translateY(${(1 - p1) * 30}px)`, textShadow: shadow}}>Gleiche Fläche.</div>
      <div
        style={{
          ...base,
          top: 590,
          opacity: clamp(p2 * 1.4),
          transform: `translateY(${(1 - p2) * 30}px)`,
          background: `linear-gradient(90deg, ${COL.pos} 0%, ${COL.pos} 38%, ${COL.neg} 62%, ${COL.neg} 100%)`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          filter: 'drop-shadow(0 0 18px rgba(7,8,26,.9))',
        }}
      >
        Andere Orientierung.
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

// beide Listen in Videozeit, sortiert; jeder Untertitel endet spätestens kurz vor dem nächsten
const RAW = [...SUBTITLES.map(([a, b, text]) => [V(a), V(b), text] as [number, number, string]), ...SUBTITLES2.map(([a, b, text]) => [VOICE2_AT + a, VOICE2_AT + b, text] as [number, number, string])].sort((p, q) => p[0] - q[0]);
const CUES = RAW.map(([a, b, text], i) => {
  const next = RAW[i + 1] ? RAW[i + 1][0] - 0.1 : Infinity;
  return {from: a - 0.05, to: Math.min(b + 0.3, next), text};
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
  const f = Math.max(bump(t, 0, 0.22) * 0.8, bump(t, FLIP_AT + FLIP_D, 0.35) * 0.5, bump(t, T.imUhr + 0.05, 0.4) * 0.6);
  return f > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.1 * f}} /> : null;
};

/* ---------- Ton ---------- */

const SFX: [number, string, number][] = [
  [0, 'whoosh', 0.5],
  [0, 'accent_small', 0.35],
  ...[0, 1, 2, 3, 4, 5].map((k) => [0.3 + k * 0.15, 'tick', 0.2] as [number, string, number]),
  [T.positiv - 0.1, 'click', 0.3],
  [T.negativ - 0.1, 'click', 0.34],
  [T.grund - 0.1, 'whoosh', 0.28],
  [T.vektoren, 'click', 0.32],
  [T.vektoren + 0.45, 'click', 0.32],
  [T.aufspannen, 'swell', 0.3],
  [T.achte - 0.1, 'whoosh', 0.26],
  [SWEEP_L[0], 'rise', 0.24],
  [SWEEP_L[0] + SWEEP_L[1] - 0.05, 'lock', 0.4],
  [T.gegen, 'tick', 0.32],
  [T.doch, 'whoosh', 0.3],
  [FLIP_AT, 'rise', 0.3],
  [FLIP_AT + FLIP_D - 0.03, 'collapse', 0.45],
  [SWEEP_R[0], 'rise', 0.24],
  [SWEEP_R[0] + SWEEP_R[1] - 0.05, 'lock_hi', 0.45],
  [T.imUhr, 'accent', 0.45],
  [T.groesse2, 'tick', 0.3],
  [T.orientierung, 'click', 0.32],
  [T.comp - 0.6, 'whoosh', 0.24],
  [T.comp + 0.3, 'click', 0.32],
  [T.flip, 'rise', 0.26],
  [LANDED2 - 0.03, 'lock', 0.4],
  [T.minus3, 'tick', 0.36],
  [T.calc + 0.3, 'tick', 0.28],
  [R1 + 0.6, 'tick', 0.32],
  [R1 + 0.85, 'lock', 0.36],
  [R2 + 0.6, 'tick', 0.32],
  [R2 + 0.85, 'lock_hi', 0.42],
  [T.negativ2 - 0.15, 'click', 0.32],
  [T.umgekehrt, 'tick', 0.3],
  [T.gleicheF - 0.1, 'whoosh', 0.28],
  [T.andereO, 'accent', 0.5],
  [T.cta - 0.1, 'swell', 0.34],
  ...Array.from({length: 8}, (_, i) => [T.tippt + 0.2 + i * 0.075, 'tick', 0.18] as [number, string, number]),
];

/* ---------- Komposition ---------- */

// Die Sprachdatei in Stücke zwischen den Schnitten teilen; jedes Stück startet um die bisher entfernte Zeit früher
const PARTS = [[0, 0] as [number, number], ...VOICE_CUTS].map(([c, d], i) => ({
  from: c + Math.max(0, d),
  to: VOICE_CUTS[i] ? VOICE_CUTS[i][0] : Infinity,
  shift: VOICE_CUTS.slice(0, i).reduce((s, [, g]) => s + g, 0),
}));

export type DORProps = {music: boolean; voice: boolean};

export const VideoDOR: React.FC<DORProps> = ({music, voice}) => {
  useTexFonts();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={1050} strength={0.9} />
      <Scene />
      <VecLabels />
      <Captions />
      <DetLabels />
      <AreaLabels />
      <CompLabels />
      <Formula />
      <Final />
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
      {voice ? (
        <Sequence from={sec(VOICE2_AT)} durationInFrames={sec(7.2)} layout="none">
          <Audio src={staticFile(VOICE2)} volume={0.94} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

export {camAt};
