// Maschinenzeilen: Eine Zahl läuft als Lichtpunkt durch die Boxen der Funktionen.
// Teil a: −1 → g → f (Zeile 1) und −1 → f → g (Zeile 2, dieselben Boxen in getauschter Reihenfolge).
// Teil c: −1 → ×2 → +3 und zurück: Die Boxen kippen zu −3 und ÷2, der Lichtpunkt läuft von rechts nach links.
// Alle Zahlen kommen aus fn.ts.
import React from 'react';
import {C} from '../theme';
import {F} from '../fonts';
import {bump, clamp, easeInOutCubic, easeOutExpo, lerp} from '../math';
import {Tex, useSec} from '../ui';
import {glowShadow, hide, mix, rgba, shadow, show} from './kit';
import {AM, CO, CY, FullSvg, OK, ease} from './common';
import {f, g, num, X0} from './fn';
import {T} from './timeline';

export const MX = {in: 100, b1: 290, mid: 500, b2: 710, out: 900};
const BW = 170;
const BH = 112;
const R = 40;
export const Y1 = 860;
export const Y2 = 1180;
export const YC = 880;

/* ---------- Bausteine ---------- */

const MachineBox: React.FC<{x: number; y: number; color: string; name: string; sub?: string; o: number; glow: number; flip?: number; name2?: string; sub2?: string}> = ({x, y, color, name, sub, o, glow, flip = 0, name2, sub2}) => {
  if (o <= 0.01) return null;
  const second = flip >= 0.5;
  const sy = Math.max(0.03, Math.abs(1 - 2 * flip));
  const nm = second ? name2 ?? name : name;
  const sb = second ? sub2 ?? sub : sub;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - BW / 2,
        top: y - BH / 2,
        width: BW,
        height: BH,
        boxSizing: 'border-box',
        borderRadius: 20,
        border: `2.5px solid ${color}`,
        background: `linear-gradient(180deg, ${rgba(color, 0.16 + 0.18 * glow)}, rgba(10,11,32,.94))`,
        boxShadow: `0 0 ${18 + 40 * glow}px ${rgba(color, 0.25 + 0.45 * glow)}`,
        opacity: o,
        transform: `scaleY(${sy}) scale(${1 + 0.07 * glow})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <Tex tex={nm} size={sb ? 46 : 50} style={{color, textShadow: shadow}} />
      {sb ? <span style={{fontFamily: F.display, fontWeight: 600, fontSize: 22, color: C.txt2}}>{sb}</span> : null}
    </div>
  );
};

const Bubble: React.FC<{x: number; y: number; tex: string; o: number; color?: string; glow?: number}> = ({x, y, tex, o, color = 'rgba(243,244,251,.45)', glow = 0}) =>
  o <= 0.01 ? null : (
    <div
      style={{
        position: 'absolute',
        left: x - R,
        top: y - R,
        width: 2 * R,
        height: 2 * R,
        boxSizing: 'border-box',
        borderRadius: R,
        border: `2.5px solid ${color}`,
        background: 'rgba(10,11,32,.92)',
        boxShadow: glow > 0.02 ? `0 0 ${14 + 34 * glow}px ${color}` : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: o,
        transform: `scale(${(0.7 + 0.3 * easeOutExpo(o)) * (1 + 0.1 * glow)})`,
      }}
    >
      <Tex tex={tex} size={36} style={{color: C.txt, textShadow: glowShadow(glow, color)}} />
    </div>
  );

// Pfeilstrecken zwischen den Stationen
const SEG: [number, number][] = [
  [MX.in + R + 6, MX.b1 - BW / 2 - 6],
  [MX.b1 + BW / 2 + 6, MX.mid - R - 6],
  [MX.mid + R + 6, MX.b2 - BW / 2 - 6],
  [MX.b2 + BW / 2 + 6, MX.out - R - 6],
];
const head = (x: number, y: number, dir: number, s = 13) => `${x},${y} ${x - dir * s},${y - s * 0.6} ${x - dir * s},${y + s * 0.6}`;

const Arrows: React.FC<{y: number; t: number; at: number; o: number; rev?: number; color?: string}> = ({y, t, at, o, rev = 0, color = 'rgba(243,244,251,.6)'}) => {
  if (o <= 0.01) return null;
  return (
    <FullSvg>
      {SEG.map(([a, b], i) => {
        const p = easeOutExpo(clamp((t - at - 0.08 * i) / 0.45));
        if (p <= 0) return null;
        const xe = lerp(a, b, p);
        // Spitze wandert bei der Umkehr ans andere Ende
        const hx = lerp(b, a, rev);
        const dir = rev < 0.5 ? 1 : -1;
        const ho = p > 0.9 ? Math.abs(1 - 2 * rev) : 0;
        return (
          <g key={i} opacity={o}>
            <line x1={a} y1={y} x2={xe} y2={y} stroke={color} strokeWidth={3} strokeLinecap="round" />
            {ho > 0.02 ? <polygon points={head(hx + dir * 2, y, dir)} fill={color} opacity={ho} /> : null}
          </g>
        );
      })}
    </FullSvg>
  );
};

// Lichtpunkt: Liste von [Start, Ende, x von, x nach]
const Token: React.FC<{y: number; t: number; legs: [number, number, number, number][]; color?: string}> = ({y, t, legs, color = C.txt}) => {
  const leg = legs.find(([a, b]) => t >= a && t <= b);
  if (!leg) return null;
  const [a, b, x0, x1] = leg;
  const k = easeInOutCubic(clamp((t - a) / (b - a)));
  const o = clamp(Math.min((t - a) / 0.08, (b - t) / 0.08));
  return (
    <FullSvg>
      <circle cx={lerp(x0, x1, k)} cy={y} r={11} fill={color} opacity={o} style={{filter: `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 22px ${color})`}} />
    </FullSvg>
  );
};

// die vier Wege einer Zeile
const fwdLegs = (s1: number, s2: number): [number, number, number, number][] => [
  [s1, s1 + 0.35, SEG[0][0], SEG[0][1] + 20],
  [s1 + 0.5, s1 + 0.8, SEG[1][0] - 20, SEG[1][1]],
  [s2, s2 + 0.35, SEG[2][0], SEG[2][1] + 20],
  [s2 + 0.47, s2 + 0.8, SEG[3][0] - 20, SEG[3][1]],
];
const revLegs = (s1: number, s2: number): [number, number, number, number][] => [
  [s1, s1 + 0.35, SEG[3][1], SEG[3][0] - 20],
  [s1 + 0.47, s1 + 0.8, SEG[2][1] + 20, SEG[2][0]],
  [s2, s2 + 0.35, SEG[1][1], SEG[1][0] - 20],
  [s2 + 0.47, s2 + 0.8, SEG[0][1] + 20, SEG[0][0]],
];

/* ---------- Teil a ---------- */

const G_BOX = {name: 'g', sub: 'quadrieren', color: CY};
const F_BOX = {name: 'f', sub: '·2, dann +3', color: AM};

// Werte der beiden Zeilen, aus den Funktionen
const ROW1 = [X0, g(X0), f(g(X0))];
const ROW2 = [X0, f(X0), g(f(X0))];

export const MachinesA: React.FC = () => {
  const t = useSec();
  const out = hide(t, T.toGraph, 0.5);
  if (t < T.erstG - 0.2 || out <= 0.01) return null;
  const aha = bump(t, T.andere + 0.1, 1.4) * 0.6 + ease(t, T.andere, 0.4) * 0.4;
  const outCol = mix('rgba(243,244,251,.45)', CO, ease(t, T.andere, 0.4));

  // Zeile 1: erst g, dann f
  const s1a = T.m1 + 0.12;
  const s1b = T.zuFuenf - 0.35;
  // Zeile 2: Boxen fliegen getauscht herunter
  const fly = (d: number) => easeInOutCubic(clamp((t - T.gnachf - 0.2 - d) / 1.0));
  const kf = fly(0);
  const kg = fly(0.1);
  const s2a = T.m2 + 0.12;
  const s2b = T.bleibt - 0.35;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: out}}>
      {/* Zeile 1 */}
      <Arrows y={Y1} t={t} at={T.dannF + 0.25} o={1} />
      <MachineBox x={MX.b1} y={Y1} {...G_BOX} o={show(t, T.erstG - 0.05, 0.35)} glow={bump(t, T.erstG + 0.05, 0.8) + bump(t, s1a + 0.4, 0.6)} />
      <MachineBox x={MX.b2} y={Y1} {...F_BOX} o={show(t, T.dannF - 0.05, 0.35)} glow={bump(t, T.dannF + 0.05, 0.8) + bump(t, s1b + 0.4, 0.6)} />
      <Bubble x={MX.in} y={Y1} tex={num(ROW1[0])} o={show(t, T.m1 - 0.08, 0.3)} glow={bump(t, T.m1, 0.6)} />
      <Bubble x={MX.mid} y={Y1} tex={num(ROW1[1])} o={show(t, s1a + 0.75, 0.3)} color={CY} glow={bump(t, s1a + 0.8, 0.7)} />
      <Bubble x={MX.out} y={Y1} tex={num(ROW1[2])} o={show(t, s1b + 0.75, 0.3)} color={t >= T.andere ? outCol : AM} glow={bump(t, s1b + 0.8, 0.7) + aha} />
      <Token y={Y1} t={t} legs={fwdLegs(s1a, s1b)} />

      {/* Zeile 2 */}
      <Arrows y={Y2} t={t} at={T.dannG + 0.2} o={1} />
      {kf > 0 ? (
        <MachineBox x={lerp(MX.b2, MX.b1, kf)} y={lerp(Y1, Y2, kf) - Math.sin(Math.PI * kf) * 70} {...F_BOX} o={1} glow={bump(t, T.erstF + 0.05, 0.8) + bump(t, s2a + 0.4, 0.6)} />
      ) : null}
      {kg > 0 ? (
        <MachineBox x={lerp(MX.b1, MX.b2, kg)} y={lerp(Y1, Y2, kg) + Math.sin(Math.PI * kg) * 70} {...G_BOX} o={1} glow={bump(t, T.dannG + 0.05, 0.8) + bump(t, s2b + 0.4, 0.6)} />
      ) : null}
      <Bubble x={MX.in} y={Y2} tex={num(ROW2[0])} o={show(t, T.m2 - 0.08, 0.3)} glow={bump(t, T.m2, 0.6)} />
      <Bubble x={MX.mid} y={Y2} tex={num(ROW2[1])} o={show(t, s2a + 0.75, 0.3)} color={AM} glow={bump(t, s2a + 0.8, 0.7)} />
      <Bubble x={MX.out} y={Y2} tex={num(ROW2[2])} o={show(t, s2b + 0.75, 0.3)} color={t >= T.andere ? outCol : CY} glow={bump(t, s2b + 0.8, 0.7) + aha} />
      <Token y={Y2} t={t} legs={fwdLegs(s2a, s2b)} />
    </div>
  );
};

/* ---------- Teil c ---------- */

const ROWC = [X0, 2 * X0, f(X0)];
if (ROWC[2] - 3 !== ROWC[1] || ROWC[1] / 2 !== ROWC[0]) throw new Error('Umkehrmaschine stimmt nicht');

export const MachineC: React.FC = () => {
  const t = useSec();
  const o = show(t, T.rechnet + 0.25, 0.4) * hide(t, T.summary - 0.1, 0.5);
  if (o <= 0.01) return null;
  const s1 = T.rechnet + 0.45;
  const s2 = T.plus3c - 0.05;
  const r1 = T.minus3 + 0.05;
  const r2 = T.durch2;
  const rev = ease(t, T.rueck, 0.5);
  const fl2 = ease(t, T.rueck + 0.05, 0.5);
  const fl1 = ease(t, T.rueck + 0.25, 0.5);
  const back = bump(t, r2 + 0.85, 1.2);
  const ttl = ease(t, T.rueck + 0.1, 0.5);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{position: 'absolute', left: MX.mid, top: YC - 128, transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap', opacity: 1 - ttl, textShadow: shadow}}>
        <Tex tex={'f'} size={52} style={{color: AM}} />
      </div>
      <div style={{position: 'absolute', left: MX.mid, top: YC - 128, transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap', opacity: ttl, textShadow: glowShadow(bump(t, T.rueck + 0.3, 1), AM)}}>
        <Tex tex={'f^{-1}'} size={52} style={{color: AM}} />
      </div>
      <Arrows y={YC} t={t} at={T.rechnet + 0.3} o={1} rev={rev} />
      <MachineBox x={MX.b1} y={YC} color={AM} name={'\\times 2'} name2={'\\div 2'} o={show(t, T.rechnet + 0.3, 0.35)} glow={bump(t, s1 + 0.4, 0.7) + bump(t, r2 + 0.4, 0.7)} flip={fl1} />
      <MachineBox x={MX.b2} y={YC} color={AM} name={'+3'} name2={'-3'} o={show(t, T.plus3c - 0.15, 0.35)} glow={bump(t, s2 + 0.4, 0.7) + bump(t, r1 + 0.4, 0.7)} flip={fl2} />
      <Bubble x={MX.in} y={YC} tex={num(ROWC[0])} o={show(t, T.rechnet + 0.35, 0.3)} color={back > 0.02 || t > r2 + 0.85 ? OK : undefined} glow={bump(t, T.rechnet + 0.4, 0.6) + back} />
      <Bubble x={MX.mid} y={YC} tex={num(ROWC[1])} o={show(t, s1 + 0.75, 0.3)} glow={bump(t, s1 + 0.8, 0.7) + bump(t, r1 + 0.85, 0.7)} />
      <Bubble x={MX.out} y={YC} tex={num(ROWC[2])} o={show(t, s2 + 0.75, 0.3)} color={AM} glow={bump(t, s2 + 0.8, 0.7) + bump(t, r1 - 0.05, 0.6)} />
      <Token y={YC} t={t} legs={[...fwdLegs(s1, s2), ...revLegs(r1, r2)]} />
    </div>
  );
};
