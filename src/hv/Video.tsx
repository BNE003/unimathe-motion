import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C} from '../theme';
import {F, useTexFonts} from '../fonts';
import {V2, bump, clamp, easeOutCubic, easeOutExpo, lerp, lerpM, mul, prog, sec, springOS} from '../math';
import {Backdrop, Grain, Mono, Tex, col, useSec} from '../ui';
import {Scene} from './Canvas';
import {BM, COLLAPSED, P32, Q1_DEG, V_TILT, W_LONG, W_SHORT, dir, hide, holdOn, newOn, arrow32, pW, show, step1, tiltLine, tiltOn, toS, viewAt} from './world';
import {MUSIC, SFX, SUBTITLES, T, TOTAL, V, VOICE, VOICE_GAPS} from './timeline';

const shadow = `0 0 14px ${C.bg}, 0 0 30px ${C.bg}`;
const A_ = col(C.cyan, 'A');
const A2 = col(C.eig, 'A^2');
const pm = (a: string, b: string, c: string, d: string) => `\\begin{pmatrix}${a}&${b}\\\\${c}&${d}\\end{pmatrix}`;
const MAT_A = pm('0', '1', '0', '0');
const MAT_0 = pm('0', '0', '0', '0');
const SOURCE = 'abel.math.harvard.edu/archive/21b_spring_03';

/* ---------- Originalblatt ---------- */

const PAPER = '#F5F2EA';
// Das PDF ist die Lösungsfassung: clip schneidet das Blatt oberhalb von „Solution. False.“ ab
const CLIP_QUESTION = 1610;
const CLIP_FULL = 2014;

const Sheet: React.FC<{clip: number; children?: React.ReactNode}> = ({clip, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 2300, height: clip, background: PAPER, overflow: 'hidden', isolation: 'isolate'}}>
    <Img src={staticFile('harvard-math21b-2003.png')} style={{position: 'absolute', left: 0, top: 0, width: 2300, height: 2100, mixBlendMode: 'multiply'}} />
    {children}
  </div>
);

// Hook: Kamera gleitet über die Originalzeile, zieht auf, das Blatt schrumpft zum Streifen
const PaperHook: React.FC = () => {
  const t = useSec();
  const o = hide(t, T.eineM - 0.25, 0.35);
  if (o <= 0) return null;
  const pull = prog(t, 1.55, 1.9);
  const pan = easeOutCubic(clamp(t / 1.7));
  const s0 = lerp(1.3, 0.41, pull);
  const fx = lerp(lerp(1000, 1720, pan), 1150, pull);
  const fy = lerp(1460, 805, pull);
  const sy0 = lerp(160, 390, pull);
  const k = prog(t, T.wenn - 0.1, 0.8);
  const s = lerp(s0, 0.498, k);
  const tx = lerp(540 - fx * s0, -230 * 0.498, k);
  const ty = lerp(sy0 - fy * s0, -1400 * 0.498, k);
  const top = lerp(lerp(720, 590, pull), 912, k);
  const h = lerp(lerp(650, 780, pull), 104, k);
  const left = lerp(0, 72, k);
  const w = lerp(1080, 936, k);
  const tilt = (1 - pull) * (1 - k);
  const wash = show(t, 2.5, 0.7);
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: w,
        height: h,
        overflow: 'hidden',
        borderRadius: lerp(0, 12, k),
        opacity: o,
        perspective: 1500,
        maskImage: k < 0.99 ? `linear-gradient(to bottom, rgba(0,0,0,${k}) 0, #000 ${lerp(70, 1, k)}px, #000 ${h - lerp(70, 1, k)}px, rgba(0,0,0,${k}) 100%)` : undefined,
      }}
    >
      <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 40%', transform: `rotateX(${10 * tilt}deg) rotateZ(${-3.5 * tilt}deg)`, transformStyle: 'preserve-3d'}}>
        <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})`}}>
          <Sheet clip={CLIP_QUESTION}>
            <div style={{position: 'absolute', left: 230, top: 1400, width: 1880, height: 190, background: `rgba(255,194,71,${0.38 * wash})`, borderRadius: 12}} />
          </Sheet>
        </div>
      </div>
    </div>
  );
};

// Auflösung: dasselbe Blatt, F eingekreist, die Lösungszeile rollt auf
const V_L = 60;
const V_T = 716;
const V_S = 0.5;
const vx = (x: number) => V_L + (x - 190) * V_S;
const vy = (y: number) => V_T + (y - 1400) * V_S;

const PaperVerdict: React.FC = () => {
  const t = useSec();
  const inn = easeOutExpo(clamp((t - (T.falsch - 0.55)) / 0.6));
  const o = clamp((t - (T.falsch - 0.55)) / 0.2) * hide(t, T.grund - 0.15, 0.4);
  if (o <= 0) return null;
  const open = prog(t, T.genau, 0.9);
  const h = lerp(114, 312, open);
  const circle = prog(t, T.falsch, 0.55, (x) => x * (2 - x));
  const box = show(t, T.genau + 1.1, 0.4);
  const up = (1 - inn) * 90 - prog(t, T.grund - 0.15, 0.4) * 60;
  // handgezogener Kreis um das F der Klausur
  const cx = vx(416);
  const cy = vy(1457);
  const d = `M ${cx + 2} ${cy - 27} C ${cx + 26} ${cy - 29}, ${cx + 34} ${cy - 6}, ${cx + 29} ${cy + 10} C ${cx + 22} ${cy + 27}, ${cx - 12} ${cy + 30}, ${cx - 26} ${cy + 15} C ${cx - 38} ${cy - 2}, ${cx - 22} ${cy - 29}, ${cx + 8} ${cy - 29}`;
  return (
    <AbsoluteFill style={{opacity: o, transform: `translateY(${up}px)`}}>
      <div style={{position: 'absolute', left: V_L, top: V_T, width: 960, height: h, overflow: 'hidden', borderRadius: 14, boxShadow: '0 30px 90px rgba(0,0,0,.55)'}}>
        <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${-190 * V_S}px, ${-1400 * V_S}px) scale(${V_S})`}}>
          <Sheet clip={CLIP_FULL} />
        </div>
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d={d} fill="none" stroke={C.lam} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - circle} />
        {box > 0 ? <rect x={vx(1000)} y={vy(1716)} width={(1345 - 1000) * V_S} height={(1878 - 1716) * V_S} rx={10} fill={`rgba(255,194,71,${0.22 * box})`} stroke={C.eig} strokeWidth={4} opacity={box} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

const Verdict: React.FC = () => {
  const t = useSec();
  const p = springOS(clamp((t - T.falsch) / 0.7));
  const o = clamp(p * 1.5) * hide(t, T.grund - 0.15, 0.4);
  if (t < T.a2ist) return null;
  const rec = (at: number) => show(t, at, 0.5) * hide(t, T.grund - 0.15, 0.4);
  const row = (y: number, at: number, tex: string, text: string, color: string) => (
    <div style={{position: 'absolute', left: 90, top: y, display: 'flex', alignItems: 'center', gap: 26, opacity: rec(at), transform: `translateY(${(1 - show(t, at, 0.5)) * 18}px)`}}>
      <Tex tex={tex} size={54} />
      <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 46, color}}>{text}</span>
    </div>
  );
  return (
    <>
      <div style={{position: 'absolute', left: 540, top: 548, transform: `translate(-50%, -50%) scale(${0.8 + 0.2 * p})`, opacity: o, fontFamily: F.display, fontWeight: 800, fontSize: 176, letterSpacing: '-.04em', color: C.lam, textShadow: `0 0 50px ${C.lam}66, ${shadow}`}}>
        Falsch.
      </div>
      {row(1076, T.a2ist + 0.1, `${A2}=0`, 'diagonalisierbar', C.txt)}
      {row(1156, T.a2ist + 2.2, `${A_}`, 'nicht diagonalisierbar', C.lam)}
      <Mono x={90} y={1276} at={T.genau + 0.9} out={T.grund - 0.2} upper={false} size={24}>
        {`Quelle: ${SOURCE}`}
      </Mono>
    </>
  );
};

/* ---------- Hook: Herkunft ---------- */

const Origin: React.FC = () => {
  const t = useSec();
  const o = hide(t, T.wenn - 0.15, 0.35);
  if (o <= 0) return null;
  const y = (1 - easeOutCubic(clamp(t / 0.5))) * 18;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 72, top: 384, transform: `translateY(${y}px)`, fontFamily: F.display, fontWeight: 800, fontSize: 100, letterSpacing: '-.035em', lineHeight: 1, color: C.txt, textShadow: shadow, whiteSpace: 'nowrap'}}>
        Harvard University
      </div>
      <div style={{position: 'absolute', left: 74, top: 496, transform: `translateY(${y * 1.4}px)`, fontFamily: F.display, fontWeight: 600, fontSize: 40, color: C.eig, textShadow: shadow, whiteSpace: 'nowrap'}}>
        Math 21b – Final Exam
      </div>
      <div style={{position: 'absolute', left: 74, top: 546, transform: `translateY(${y * 1.8}px)`, fontFamily: F.mono, fontWeight: 500, fontSize: 28, color: C.txt, textShadow: shadow, whiteSpace: 'nowrap'}}>
        15. Mai 2003 · Aufgabe 1(c)
      </div>
      <Mono x={72} y={1378} at={0.8} upper={false} size={24} color={C.txt}>
        {SOURCE}
      </Mono>
      <Mono x={72} y={1410} at={1.2} upper={false} size={22}>
        Unabhängiges Video, nicht von Harvard
      </Mono>
    </AbsoluteFill>
  );
};

const Eyebrow: React.FC = () => {
  const t = useSec();
  const k = show(t, T.eineM, 0.4);
  const out = hide(t, T.a2ist - 0.25, 0.3) + show(t, T.grund, 0.4) * hide(t, T.cta - 0.2, 0.3);
  return (
    <>
      <div style={{position: 'absolute', right: 150, top: 330, opacity: (1 - k) * 0.95, fontFamily: F.mono, fontWeight: 500, fontSize: 24, letterSpacing: '.08em', color: C.eig, whiteSpace: 'nowrap', textShadow: shadow}}>ECHTE UNI-KLAUSUR</div>
      <div style={{position: 'absolute', right: 150, top: 330, opacity: k * clamp(out), fontFamily: F.mono, fontWeight: 500, fontSize: 24, letterSpacing: '.04em', color: C.txt2, whiteSpace: 'nowrap', textShadow: shadow}}>Harvard · Math 21b · 2003 · 1(c)</div>
    </>
  );
};

/* ---------- Aussage: groß im Hook, danach eine Zeile oben ---------- */

const Statement: React.FC = () => {
  const t = useSec();
  const o = show(t, T.wenn - 0.1, 0.4) * hide(t, T.eineM - 0.25, 0.35);
  if (o <= 0) return null;
  const size = 60;
  const line2 = lerp(0.28, 1, prog(t, T.dann - 0.1, 0.3));
  const style: React.CSSProperties = {fontFamily: F.display, fontWeight: 700, fontSize: size, letterSpacing: '-.015em', lineHeight: 1.24, color: C.txt, whiteSpace: 'nowrap', textShadow: shadow};
  return (
    <div style={{position: 'absolute', left: 72, top: 690, opacity: o}}>
      <div style={style}>
        Wenn <Tex tex={A2} size={size} /> diagonalisierbar ist,
      </div>
      <div style={{...style, opacity: line2}}>
        dann ist auch <Tex tex={A_} size={size} /> diagonalisierbar.
      </div>
    </div>
  );
};

const TaskLine: React.FC = () => {
  const t = useSec();
  const o = show(t, T.eineM, 0.5) * (hide(t, T.a2ist - 0.2, 0.3) + show(t, T.grund, 0.4)) * hide(t, T.cta - 0.2, 0.3);
  if (o <= 0) return null;
  const done = t > T.grund - 0.2;
  const size = 40;
  return (
    <div style={{position: 'absolute', left: 72, top: 374, display: 'flex', alignItems: 'center', gap: 14, opacity: o, fontFamily: F.display, fontWeight: 700, fontSize: size, letterSpacing: '-.015em', color: C.txt, whiteSpace: 'nowrap', textShadow: shadow}}>
      <Tex tex={A2} size={size} />
      <span>diagonalisierbar</span>
      <Tex tex={done ? col(C.lam, '\\not\\Rightarrow') : '\\Rightarrow'} size={size} />
      <Tex tex={A_} size={size} />
      <span>diagonalisierbar</span>
    </div>
  );
};

// T und F der Klausur in der Frage
const TF: React.FC = () => {
  const t = useSec();
  const o = show(t, T.wenn + 0.6, 0.5) * hide(t, T.eineM - 0.25, 0.35);
  if (o <= 0) return null;
  const beat = T.oderF + 0.5;
  const thinking = t > beat && t < T.eineM ? 0.5 + 0.5 * Math.sin((t - beat) * 9) : 0;
  const box = (letter: string, word: string, x: number, pulse: number) => {
    const s = 210;
    return (
      <div key={letter} style={{position: 'absolute', left: x - s / 2, top: 1190 - s / 2, width: s, height: s, borderRadius: s * 0.17, border: `3px solid rgba(243,244,251,${0.3 + 0.6 * pulse})`, background: `rgba(243,244,251,${0.04 + 0.1 * pulse})`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.07 * pulse})`, boxShadow: `0 0 ${50 * pulse}px rgba(243,244,251,${0.3 * pulse})`}}>
        <span style={{fontFamily: F.texMain, fontWeight: 700, fontSize: s * 0.62, color: C.txt, lineHeight: 1, marginTop: -s * 0.08}}>{letter}</span>
        <span style={{position: 'absolute', bottom: 16, fontFamily: F.display, fontWeight: 600, fontSize: 34, color: C.txt2}}>{word}</span>
      </div>
    );
  };
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      {box('T', 'wahr', 330, Math.max(bump(t, T.wahr - 0.05, 0.75), thinking))}
      {box('F', 'falsch', 700, Math.max(bump(t, T.oderF - 0.05, 0.75), t > beat && t < T.eineM ? 1 - thinking : 0))}
    </div>
  );
};

const OriginalTag: React.FC = () => {
  const t = useSec();
  const o = show(t, T.wenn + 0.7, 0.4) * hide(t, T.eineM - 0.25, 0.3);
  if (o <= 0) return null;
  return <div style={{position: 'absolute', left: 72, top: 1024, opacity: o, fontFamily: F.mono, fontWeight: 500, fontSize: 22, color: C.txt2, textShadow: shadow}}>Originalzeile aus der Klausur</div>;
};

/* ---------- Beschriftungen auf der Bühne ---------- */

const Tag: React.FC<{q: V2; dx?: number; dy?: number; o: number; color?: string; size?: number; children: React.ReactNode}> = ({q, dx = 0, dy = 0, o, color = C.txt, size = 40, children}) => {
  const t = useSec();
  if (o <= 0) return null;
  const [x, y] = toS(viewAt(t), q);
  return (
    <div style={{position: 'absolute', left: clamp(x + dx, 170, 790), top: clamp(y + dy, 470, 1410), transform: 'translate(-50%, -50%)', opacity: o, fontFamily: F.display, fontWeight: 700, fontSize: size, letterSpacing: '-.01em', color, textShadow: shadow, whiteSpace: 'nowrap'}}>
      {children}
    </div>
  );
};

const P_TEX = (a: string, b: string) => `\\begin{pmatrix}${a}\\\\${b}\\end{pmatrix}`;

const WordLabels: React.FC = () => {
  const t = useSec();
  const b = mul(lerpM(BM, 1), V_TILT);
  const L1 = mul(lerpM(BM, pW(t)), W_LONG);
  const L2 = mul(lerpM(BM, pW(t)), W_SHORT);
  const hold = holdOn(t) * hide(t, T.regel, 0.4);
  const eig = show(t, T.eigen, 0.5) * hide(t, T.regel, 0.4);
  return (
    <>
      <Tag q={V_TILT} dx={-30} dy={-46} o={tiltOn(t) * hide(t, T.neu + 0.1, 0.3)}>Pfeil</Tag>
      <Tag q={b} dx={40} dy={-46} o={newOn(t) * hide(t, T.aber - 0.25, 0.4)} color={C.cyan}>neuer Pfeil</Tag>
      <Tag q={[-1.25, 2.3]} dx={-10} dy={-30} o={tiltLine(t)} color={C.lam} size={38}>gekippt</Tag>
      <Tag q={[0, -1.6]} dy={30} o={show(t, T.aber + 0.1, 0.4) * hide(t, T.sie - 0.1, 0.3)} color={C.eig} size={42}>bleiben auf ihrer Linie</Tag>
      <Tag q={L1} dx={78} dy={-38} o={show(t, T.sie + 0.5, 0.4) * hold} color={C.eig}>länger</Tag>
      <Tag q={[Math.max(L2[0], 1.3), 0]} dx={70} dy={44} o={show(t, T.sie + 1.0, 0.4) * hold} color={C.eig}>kürzer</Tag>
      <div style={{position: 'absolute', left: 500, top: 1290, transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * eig})`, opacity: eig, fontFamily: F.display, fontWeight: 800, fontSize: 84, letterSpacing: '-.03em', color: C.eig, textShadow: `0 0 34px ${C.eig}55, ${shadow}`}}>Eigenvektoren</div>
    </>
  );
};

/* ---------- Die Regel ---------- */

const Rule: React.FC = () => {
  const t = useSec();
  const end = hide(t, T.plan - 0.25, 0.35);
  const head = show(t, T.regel + 0.2, 0.5);
  if (head <= 0 || end <= 0) return null;
  const row = (y: number, at: number, a: React.ReactNode, b: string, color: string) => {
    const o = show(t, at, 0.5);
    return (
      <div style={{position: 'absolute', left: 72, top: y, transform: `translateY(${(1 - o) * 16}px)`, opacity: o, fontFamily: F.display, fontWeight: 700, fontSize: 36, letterSpacing: '-.015em', color: C.txt, whiteSpace: 'nowrap', textShadow: shadow}}>
        {a} <span style={{color}}>{b}</span>
      </div>
    );
  };
  return (
    <div style={{position: 'absolute', inset: 0, opacity: end}}>
      <Mono x={72} y={1262} at={T.regel + 0.2} color={C.eig} size={24}>Die einzige Regel</Mono>
      {row(1298, T.findest + 0.1, <span>2 Richtungen auf ihrer Linie →</span>, 'diagonalisierbar', C.eig)}
      {row(1352, T.weniger, <span>weniger als 2 →</span>, 'nicht diagonalisierbar', C.lam)}
    </div>
  );
};

// kurze Regel während der beiden Fragen
const RuleLine: React.FC = () => {
  const t = useSec();
  const o = show(t, T.f1 + 0.2, 0.5) * hide(t, T.a2ist - 0.2, 0.3);
  if (o <= 0) return null;
  return <div style={{position: 'absolute', left: 72, top: 432, opacity: o, fontFamily: F.body, fontWeight: 500, fontSize: 28, color: C.txt2, whiteSpace: 'nowrap', textShadow: shadow}}>Regel: 2 Richtungen auf ihrer Linie = diagonalisierbar</div>;
};

/* ---------- Plan ---------- */

const Plan: React.FC = () => {
  const t = useSec();
  const o = show(t, T.plan, 0.5) * hide(t, T.probieren - 0.5, 0.4);
  if (o <= 0) return null;
  const row = (y: number, at: number, tex: string, text: string, color: string) => {
    const p = show(t, at, 0.5);
    return (
      <div style={{position: 'absolute', left: 92, top: y, display: 'flex', alignItems: 'center', gap: 24, opacity: p, transform: `translateY(${(1 - p) * 20}px)`, whiteSpace: 'nowrap', textShadow: shadow}}>
        <Tex tex={tex} size={78} />
        <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 62, letterSpacing: '-.015em', color}}>{text}</span>
      </div>
    );
  };
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{position: 'absolute', left: 92, top: 670, fontFamily: F.display, fontWeight: 800, fontSize: 82, letterSpacing: '-.03em', color: C.txt, textShadow: shadow, whiteSpace: 'nowrap'}}>Ein Beispiel reicht:</div>
      {row(830, T.bsp + 0.7, A2, 'diagonalisierbar', C.eig)}
      {row(950, T.aberA, A_, 'nicht diagonalisierbar', C.lam)}
    </div>
  );
};

/* ---------- Matrix und Zahlen ---------- */

const DIGITS = '2 5 3 7 1 4 6 9 8 0'.split(' ');
const spin = (t: number, i: number) => DIGITS[(Math.floor(t * 17) * (i * 2 + 3) + i * 5) % 10];
const SETTLE = [T.probieren + 0.05, T.probieren + 0.2, T.probieren + 0.35, T.probieren + 0.45];
const FINAL = ['0', '1', '0', '0'];

const MatrixFly: React.FC = () => {
  const t = useSec();
  const inn = show(t, T.probieren - 0.45, 0.4);
  const fly = prog(t, T.macht - 0.15, 0.8);
  const o = inn * hide(t, T.jedem - 0.3, 0.35);
  if (o <= 0) return null;
  const e = FINAL.map((v, i) => (t >= SETTLE[i] ? v : spin(t, i)));
  const lock = bump(t, T.probieren + 0.45, 0.5);
  return (
    <div style={{position: 'absolute', left: lerp(500, 72, fly), top: lerp(900, 560, fly), transform: `translate(${lerp(-50, 0, fly)}%, -50%) scale(${1 + 0.06 * lock})`, transformOrigin: 'left center', opacity: o, textShadow: shadow, whiteSpace: 'nowrap'}}>
      <Tex tex={`${A_}=${pm(e[0], e[1], e[2], e[3])}`} size={lerp(116, 56, fly)} />
    </div>
  );
};

// Spaltenvektor: die untere Zahl rutscht nach oben, unten erscheint die Null
const SlideVec: React.FC<{a: string; b: string; s: number; z: number; o: number}> = ({a, b, s, z, o}) => {
  if (o <= 0) return null;
  const X = 740;
  const Y = 570;
  const D = 58;
  const size = 88;
  const cell = (txt: string, y: number, op: number, color = C.txt, sc = 1) => (
    <div style={{position: 'absolute', left: X, top: y, transform: `translate(-50%, -50%) scale(${sc})`, opacity: op, fontFamily: F.texMain, fontStyle: /[xy]/.test(txt) ? 'italic' : 'normal', fontSize: size, lineHeight: 1, color, textShadow: shadow}}>{txt}</div>
  );
  const h = D + size * 0.72;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d={`M ${X - 58} ${Y - h} Q ${X - 92} ${Y} ${X - 58} ${Y + h}`} fill="none" stroke={C.txt} strokeWidth={5} strokeLinecap="round" />
        <path d={`M ${X + 58} ${Y - h} Q ${X + 92} ${Y} ${X + 58} ${Y + h}`} fill="none" stroke={C.txt} strokeWidth={5} strokeLinecap="round" />
      </svg>
      {cell(a, Y - D - s * 30, 1 - s)}
      {cell(b, lerp(Y + D, Y - D, s), 1, C.eig, 1 + 0.12 * bump(s, 0, 1))}
      {cell('0', Y + D, z, C.cyan, 0.7 + 0.3 * z)}
    </div>
  );
};

const Steps: React.FC = () => {
  const t = useSec();
  const end = hide(t, T.jedem - 0.3, 0.35);
  const ph1 = show(t, T.untere - 0.4, 0.4) * hide(t, T.aus3 - 0.2, 0.2);
  const ph2 = show(t, T.aus3, 0.3) * hide(t, T.aq + 2.9, 0.2);
  const ph3 = show(t, T.beim - 0.05, 0.3);
  const a2 = show(t, T.aq, 0.5) * end;
  const c1 = show(t, T.wird + 0.7, 0.4);
  const c2 = show(t, T.aus2 + 1.0, 0.4);
  const a32 = arrow32(t);
  const p1 = step1(t);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: end}}>
      <SlideVec a="x" b="y" s={prog(t, T.untere + 0.2, 0.8)} z={show(t, T.undNull, 0.4)} o={ph1} />
      <SlideVec a="3" b="2" s={prog(t, T.wird, 0.8)} z={show(t, T.wird + 0.5, 0.4)} o={ph2 * (t > T.aus3 - 0.1 ? 1 : 0)} />
      <SlideVec a="2" b="0" s={prog(t, T.beim + 0.9, 0.8)} z={show(t, T.aus2 + 0.5, 0.4)} o={ph3} />
      <div style={{position: 'absolute', left: 72, top: 690, transform: 'translateY(-50%)', opacity: a2, textShadow: shadow, whiteSpace: 'nowrap'}}>
        <Tex tex={`${A2}=${A_}\\cdot ${A_}`} size={56} />
        <div style={{fontFamily: F.display, fontWeight: 600, fontSize: 34, color: C.txt2, marginTop: 6, opacity: show(t, T.zweimal, 0.4)}}>zweimal hintereinander</div>
      </div>
      <Tag q={P32} dx={-16} dy={-66} o={a32 * lerp(1, 0.45, p1)}><Tex tex={P_TEX('3', '2')} size={46} /></Tag>
      <Tag q={[2, 0]} dy={74} o={a32 * show(t, T.wird + 0.7, 0.4) * hide(t, T.aus2 + 0.2, 0.3)} color={C.cyan}><Tex tex={col(C.cyan, P_TEX('2', '0'))} size={46} /></Tag>
      <div style={{position: 'absolute', left: 72, top: 1362, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 16, whiteSpace: 'nowrap', textShadow: shadow, opacity: c1}}>
        <Tex tex={P_TEX('3', '2')} size={56} />
        <Tex tex={`\\xrightarrow{${A_}}`} size={56} />
        <Tex tex={col(C.cyan, P_TEX('2', '0'))} size={56} />
        <span style={{display: 'flex', alignItems: 'center', gap: 16, opacity: c2}}>
          <Tex tex={`\\xrightarrow{${A_}}`} size={56} />
          <Tex tex={col(C.eig, P_TEX('0', '0'))} size={56} />
        </span>
      </div>
    </div>
  );
};

const BigNull: React.FC = () => {
  const t = useSec();
  const big = springOS(clamp((t - (T.nullm - 0.1)) / 0.7));
  const k = prog(t, T.f1 - 0.1, 0.8);
  const o = clamp(big * 1.5) * hide(t, T.f2 - 0.2, 0.3);
  const o3 = show(t, T.f2, 0.4) * hide(t, T.a2ist - 0.3, 0.3);
  return (
    <>
      {o > 0 ? (
        <div style={{position: 'absolute', left: lerp(500, 72, k), top: lerp(940, 530, k), transform: `translate(${lerp(-50, 0, k)}%, -50%) scale(${lerp(0.75 + 0.25 * big, 1, k)})`, transformOrigin: 'left center', opacity: o, textShadow: `0 0 ${40 * (1 - k)}px rgba(255,194,71,.4), ${shadow}`, whiteSpace: 'nowrap'}}>
          <Tex tex={`${A2}=${MAT_0}`} size={lerp(120, 48, k)} />
        </div>
      ) : null}
      {o3 > 0 ? (
        <div style={{position: 'absolute', left: 72, top: 530, transform: 'translateY(-50%)', opacity: o3, textShadow: shadow, whiteSpace: 'nowrap'}}>
          <Tex tex={`${A_}=${MAT_A}`} size={48} />
        </div>
      ) : null}
    </>
  );
};

/* ---------- Die zwei Fragen ---------- */

const Question: React.FC<{at: number; out: number; n: string; tex: string; answerAt: number; answer: string; good: boolean}> = ({at, out, n, tex, answerAt, answer, good}) => {
  const t = useSec();
  const o = show(t, at, 0.5) * hide(t, out, 0.3);
  if (o <= 0) return null;
  const p = springOS(clamp((t - answerAt) / 0.6));
  return (
    <div style={{position: 'absolute', left: 72, top: 1388, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 16, opacity: o, fontFamily: F.display, fontWeight: 700, fontSize: 42, letterSpacing: '-.015em', color: C.txt, whiteSpace: 'nowrap', textShadow: shadow}}>
      <span style={{color: C.txt2}}>{n}</span>
      <Tex tex={tex} size={44} />
      <span>diagonalisierbar?</span>
      {t > answerAt ? <span style={{marginLeft: 8, fontWeight: 800, color: good ? C.eig : C.lam, transform: `scale(${0.7 + 0.3 * p})`, opacity: clamp(p * 1.5)}}>{answer}</span> : null}
    </div>
  );
};

const QLabels: React.FC = () => {
  const t = useSec();
  const lbl = show(t, T.gesch, 0.4) * hide(t, T.gilt - 0.1, 0.3);
  const tip = dir(Q1_DEG, 2.2);
  const tag2 = show(t, T.gesch2, 0.4) * hide(t, T.eineR - 0.1, 0.3);
  const n1 = show(t, T.aus32 - 0.1, 0.3) * hide(t, T.jedesA - 0.1, 0.3);
  const n2 = show(t, T.aus32 + 1.5, 0.3) * hide(t, T.jedesA - 0.1, 0.3);
  const n3 = show(t, T.aus30 - 0.1, 0.3) * hide(t, T.aus30 + 0.5, 0.3);
  const r1 = show(t, T.eineR, 0.4) * hide(t, T.a2ist - 0.2, 0.3);
  const all = show(t, T.gilt + 0.9, 0.4) * hide(t, T.f2 - 0.2, 0.3);
  return (
    <>
      <Tag q={tip} dx={40} dy={-60} o={lbl} color={C.eig} size={38}>geschrumpft, nicht gekippt</Tag>
      <Tag q={[0, 0]} dy={-90} o={all} color={C.eig} size={48}>alle Richtungen</Tag>
      <Tag q={P32} dx={-12} dy={-64} o={n1}><Tex tex={P_TEX('3', '2')} size={44} /></Tag>
      <Tag q={[2, 0]} dy={72} o={n2} color={C.lam}><Tex tex={col(C.lam, P_TEX('2', '0'))} size={44} /></Tag>
      <Tag q={[0.4, 1.9]} o={show(t, T.wegk, 0.4) * hide(t, T.jedesA - 0.1, 0.3)} color={C.lam} size={44}>weggekippt</Tag>
      <Tag q={[3, 0]} dy={-72} o={n3}><Tex tex={P_TEX('3', '0')} size={44} /></Tag>
      <Tag q={[1.2, 0]} dy={-58} o={tag2} color={C.eig} size={38}>geschrumpft, nicht gekippt</Tag>
      <Tag q={[0, 0]} dy={-90} o={r1} color={C.lam} size={48}>nur 1 Richtung</Tag>
      <Tag q={[0, 0]} dy={90} o={show(t, T.brauchen, 0.4) * hide(t, T.a2ist - 0.2, 0.3)} size={40}>nötig: 2</Tag>
    </>
  );
};

/* ---------- Grund ---------- */

const Reason: React.FC = () => {
  const t = useSec();
  const o = show(t, T.grund + 0.1, 0.5) * hide(t, T.cta - 0.2, 0.4);
  if (o <= 0) return null;
  const tag = (x: number, tex: string, text: string, color: string, at: number) => (
    <>
      <div style={{position: 'absolute', left: x, top: 650, transform: 'translate(-50%, -50%)', opacity: o, textShadow: shadow}}>
        <Tex tex={tex} size={64} />
      </div>
      <div style={{position: 'absolute', left: x, top: 1136, transform: 'translate(-50%, -50%)', opacity: o * show(t, at, 0.4), fontFamily: F.display, fontWeight: 700, fontSize: 40, color, textShadow: shadow, whiteSpace: 'nowrap'}}>{text}</div>
    </>
  );
  const m = show(t, T.kippen, 0.5);
  return (
    <>
      {tag(275, A_, 'kippt weg', C.lam, T.kippt + 0.3)}
      {tag(695, A2, 'macht alles zu null', C.eig, T.a2k + 1.2)}
      <div style={{position: 'absolute', left: 72, top: 1200, opacity: o * m, transform: `translateY(${(1 - m) * 18}px)`, fontFamily: F.display, fontWeight: 800, fontSize: 58, letterSpacing: '-.025em', lineHeight: 1.14, color: C.txt, textShadow: shadow, whiteSpace: 'nowrap'}}>
        Das Kippen ist im Ergebnis
        <br />
        nicht mehr zu sehen.
      </div>
    </>
  );
};

/* ---------- Logo ---------- */

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
        <Img src={staticFile('unimathe-logo.webp')} style={{width: size, height: size, borderRadius: size * 0.223, boxShadow: `0 ${10 + 20 * k}px ${30 + 60 * k}px rgba(30,139,219,${0.25 + 0.2 * k})`, display: 'block'}} />
        {glint > 0 && glint < 1 ? (
          <div style={{position: 'absolute', inset: 0, borderRadius: size * 0.223, background: `linear-gradient(115deg, rgba(255,255,255,0) ${glint * 140 - 40}%, rgba(255,255,255,.55) ${glint * 140 - 20}%, rgba(255,255,255,0) ${glint * 140}%)`}} />
        ) : null}
      </div>
      <div style={{position: 'absolute', left: 148, top: 342, transform: 'translateY(-50%)', opacity: a * hide(t, T.cta, 0.35) * 0.82, fontFamily: F.display, fontWeight: 700, fontSize: 32, letterSpacing: '-.01em', color: C.txt, textShadow: shadow}}>UniMathe</div>
    </AbsoluteFill>
  );
};

/* ---------- CTA ---------- */

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
  const n = Math.max(0, Math.min(word.length, Math.floor((t - T.tippt - 0.1) / 0.075) + 1));
  const caret = Math.floor(t * 2.2) % 2 === 0 || n < word.length;
  return (
    <div style={{position: 'absolute', left: 240, top: 1180, width: 600, height: 100, borderRadius: 999, background: 'rgba(243,244,251,.96)', display: 'flex', alignItems: 'center', gap: 22, padding: '0 36px', boxSizing: 'border-box', opacity: clamp(p * 1.4), transform: `scale(${0.85 + 0.15 * p})`, boxShadow: '0 20px 70px rgba(30,139,219,.35)'}}>
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
      <Centered y={846} at={T.cta + 0.35} size={104}>UniMathe</Centered>
      <Centered y={980} at={T.cta + 0.7} size={42} color={C.txt2} weight={600}>Mathe verstehen und üben.</Centered>
      <Mono x={540} y={1120} at={T.such - 0.2} anchor="center" color={C.txt2}>Im App Store suchen</Mono>
      <SearchPill />
      <Mono x={540} y={1338} at={T.cta + 0.8} anchor="center" upper={false} size={22}>Unabhängiges Video, nicht von Harvard</Mono>
    </AbsoluteFill>
  );
};

/* ---------- Untertitel, Blitz ---------- */

const CUES = SUBTITLES.map(([a, b, text], i) => {
  const from = V(a) - 0.05;
  const next = SUBTITLES[i + 1] ? V(SUBTITLES[i + 1][0]) - 0.1 : Infinity;
  return {from, to: Math.min(V(b) + 0.3, next), text};
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

const Flash: React.FC = () => {
  const t = useSec();
  const f = Math.max(bump(t, 0, 0.22) * 0.8, bump(t, COLLAPSED, 0.42), bump(t, T.gilt + 1.1, 0.4) * 0.5, bump(t, T.falsch, 0.42));
  return f > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.11 * f}} /> : null;
};

/* ---------- Komposition ---------- */

// Stimme in Stücke zwischen den eingefügten Pausen teilen; jedes Stück startet um die bisher eingefügte Stille später
const PARTS = VOICE_GAPS.concat([[Infinity, 0]]).map(([c], i, all) => ({
  from: i ? all[i - 1][0] : 0,
  to: c,
  shift: VOICE_GAPS.slice(0, i).reduce((s, [, g]) => s + g, 0),
}));

export type HVProps = {music: boolean; voice: boolean};

export const VideoHV: React.FC<HVProps> = ({music, voice}) => {
  useTexFonts();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={1010} strength={0.9} />
      <Scene />
      <Origin />
      <PaperHook />
      <OriginalTag />
      <Statement />
      <TF />
      <TaskLine />
      <WordLabels />
      <Rule />
      <Plan />
      <MatrixFly />
      <Steps />
      <BigNull />
      <RuleLine />
      <Question at={T.f1} out={T.f2 - 0.2} n="1." tex={A2} answerAt={T.ja} answer="Ja" good />
      <Question at={T.f2} out={T.a2ist - 0.2} n="2." tex={A_} answerAt={T.nein} answer="Nein" good={false} />
      <QLabels />
      <PaperVerdict />
      <Verdict />
      <Reason />
      <Eyebrow />
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
            <Sequence key={from} from={sec(from + shift)} durationInFrames={Number.isFinite(to) ? sec(to - from) : sec(TOTAL - (from + shift))} layout="none">
              <Audio src={staticFile(VOICE)} trimBefore={sec(from)} trimAfter={Number.isFinite(to) ? sec(to) : undefined} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
