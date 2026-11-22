// Graph von f(x) = x² mit Definitionsmenge als cyan Band auf der x-Achse und Zielmenge als amber Band auf der y-Achse.
// Die Parabel bleibt unverändert; geschnitten werden nur die Bänder (erst die Zielmenge, dann die Definitionsmenge).
import React from 'react';
import {C} from '../theme';
import {F} from '../fonts';
import {bump, clamp, easeInOutCubic, easeOutExpo, lerp} from '../math';
import {Tex, useSec} from '../ui';
import {glowShadow, hide, mix, rgba, show} from './kit';
import {AM, CO, CY, FullSvg, OK} from './common';
import {ARROW, graphK} from './Diagram';
import {BAND, OX, OY, U, XP, XR, YB, YT, sx, sy} from './geo';
import {T} from './timeline';

const f = (x: number) => x * x;
// Mathe-Prüfung
if (f(-2) !== 4 || f(2) !== 4) throw new Error('f(±2) ≠ 4');
if (f(XP) >= YT) throw new Error('Parabel ragt über das Band');
for (let y = 0; y <= YT; y += 0.25) if (Math.abs(f(Math.sqrt(y)) - y) > 1e-9) throw new Error('kein Urbild für y ≥ 0');

// Schnitte
export const zCut = (t: number) => easeInOutCubic(clamp((t - (T.ab - 0.1)) / 1.2)); // Zielmenge: unten bis 0
export const dCut = (t: number) => easeInOutCubic(clamp((t - (T.links2 + 0.3)) / 1.3)); // Definitionsmenge: links bis 0
const zBottom = (t: number) => lerp(YB, 0, zCut(t));
const dLeft = (t: number) => lerp(-XR, 0, dCut(t));

const Lbl: React.FC<{x: number; y: number; tex: string; size: number; o: number; color?: string; glow?: number; anchor?: 'c' | 'l' | 'r'}> = ({x, y, tex, size, o, color = C.txt, glow = 0, anchor = 'c'}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${anchor === 'c' ? '-50%' : anchor === 'r' ? '-100%' : '0'}, -50%)`, opacity: o, whiteSpace: 'nowrap', textShadow: glowShadow(glow, color)}}>
      <Tex tex={tex} size={size} style={{color}} />
    </div>
  );

const Word: React.FC<{x: number; y: number; text: string; color: string; o: number; size?: number; anchor?: 'c' | 'l' | 'r'}> = ({x, y, text, color, o, size = 26, anchor = 'c'}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${anchor === 'c' ? '-50%' : anchor === 'r' ? '-100%' : '0'}, -50%)`, opacity: o, fontFamily: F.display, fontWeight: 700, fontSize: size, color, whiteSpace: 'nowrap', textShadow: glowShadow(0, color)}}>
      {text}
    </div>
  );

const arrowHead = (x: number, y: number, dx: number, dy: number, s = 15) => {
  const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l;
  const uy = dy / l;
  return `${x},${y} ${x - ux * s - uy * s * 0.55},${y - uy * s + ux * s * 0.55} ${x - ux * s + uy * s * 0.55},${y - uy * s - ux * s * 0.55}`;
};

export const Graph: React.FC = () => {
  const t = useSec();
  const kG = graphK(t);
  if (kG <= 0) return null;
  const out = hide(t, T.sum - 0.15, 0.5);
  if (out <= 0.01) return null;
  const svg: React.ReactNode[] = [];
  const html: React.ReactNode[] = [];
  const gridO = clamp((kG - 0.3) / 0.7);

  // Gitter und Achsen
  for (let i = -5; i <= 5; i++) svg.push(<line key={`gx${i}`} x1={sx(i)} y1={sy(YT + 0.4)} x2={sx(i)} y2={sy(YB - 0.4)} stroke="rgba(243,244,251,.07)" strokeWidth={1.5} opacity={gridO} />);
  for (let j = -3; j <= 6; j++) svg.push(<line key={`gy${j}`} x1={sx(-5.2)} y1={sy(j)} x2={sx(5.2)} y2={sy(j)} stroke="rgba(243,244,251,.07)" strokeWidth={1.5} opacity={gridO} />);
  svg.push(<line key="ax" x1={sx(-5.2)} y1={OY} x2={sx(5.2)} y2={OY} stroke="rgba(243,244,251,.35)" strokeWidth={2} opacity={gridO} />);
  svg.push(<line key="ay" x1={OX} y1={sy(YT + 0.4)} x2={OX} y2={sy(YB - 0.4)} stroke="rgba(243,244,251,.35)" strokeWidth={2} opacity={gridO} />);
  for (let i = -4; i <= 4; i++) if (i) svg.push(<line key={`tx${i}`} x1={sx(i)} y1={OY - 8} x2={sx(i)} y2={OY + 8} stroke="rgba(243,244,251,.5)" strokeWidth={2} opacity={gridO * (i < dLeft(t) - 0.01 ? 0.3 : 1)} />);
  for (let j = -2; j <= 5; j++) if (j) svg.push(<line key={`ty${j}`} x1={OX - 8} y1={sy(j)} x2={OX + 8} y2={sy(j)} stroke="rgba(243,244,251,.5)" strokeWidth={2} opacity={gridO * (j < zBottom(t) - 0.01 ? 0.3 : 1)} />);

  // Bänder: Definitionsmenge (x) und Zielmenge (y); Diagram übergibt sie bei kG = 1
  if (kG >= 1) {
    const dl = dLeft(t);
    const zb = zBottom(t);
    const gD = bump(t, T.links2 + 0.2, 1.4);
    const gZ = bump(t, T.ziel + 0.3, 1.4) + bump(t, T.gleiche + 0.7, 1.6) * 0.6;
    svg.push(<rect key="bx" x={sx(dl)} y={OY - BAND / 2} width={sx(XR) - sx(dl)} height={BAND} rx={BAND / 2} fill={rgba(CY, 0.38 + 0.25 * gD)} style={{filter: `drop-shadow(0 0 ${8 + 14 * gD}px ${rgba(CY, 0.6)})`}} />);
    svg.push(<rect key="by" x={OX - BAND / 2} y={sy(YT)} width={BAND} height={sy(zb) - sy(YT)} rx={BAND / 2} fill={rgba(AM, 0.38 + 0.25 * gZ)} style={{filter: `drop-shadow(0 0 ${8 + 14 * gZ}px ${rgba(AM, 0.6)})`}} />);
    // leuchtende Schnittkanten
    const eZ = bump(t, T.ab + 0.5, 1.6);
    if (eZ > 0.02) svg.push(<rect key="ez" x={OX - 30} y={sy(zb) - 2.5} width={60} height={5} rx={2.5} fill={AM} opacity={eZ} style={{filter: `drop-shadow(0 0 12px ${AM})`}} />);
    const eD = bump(t, T.links2 + 0.95, 1.7);
    if (eD > 0.02) svg.push(<rect key="ed" x={sx(dl) - 2.5} y={OY - 30} width={5} height={60} rx={2.5} fill={CY} opacity={eD} style={{filter: `drop-shadow(0 0 12px ${CY})`}} />);
  }

  // Bereich ohne Treffer (unter 0), schrumpft mit der Zielmenge
  {
    const o = show(t, T.negativ + 0.8, 0.5) * (1 - zCut(t));
    const zb = zBottom(t);
    if (o > 0.01) {
      svg.push(<rect key="neg" x={sx(-XR)} y={OY + 10} width={sx(XR) - sx(-XR)} height={Math.max(0, sy(zb) - OY - 10)} fill={rgba(CO, 0.1)} opacity={o} />);
      if (zb < -1) svg.push(<line key="m1" x1={sx(-4.3)} y1={sy(-1)} x2={sx(4.3)} y2={sy(-1)} stroke={CO} strokeWidth={3} strokeDasharray="12 10" opacity={o * 0.9} style={{filter: `drop-shadow(0 0 6px ${CO})`}} />);
      html.push(<Word key="kt" x={sx(2.4)} y={sy(-1.75)} text="kein Treffer" color={CO} o={o * clamp((-1.4 - zb) / 0.4)} />);
    }
  }

  // Parabel: zeichnet sich von links nach rechts, der linke Ast verschwindet mit dem Schnitt
  {
    const p = easeInOutCubic(clamp((t - (T.jetzt + 0.15)) / 1.3));
    const xa = Math.max(-XP, dLeft(t));
    const xb = Math.min(XP, -XP + 2 * XP * p);
    if (xb > xa) {
      const pts: string[] = [];
      for (let x = xa; x <= xb + 1e-9; x += 0.02) pts.push(`${sx(x).toFixed(1)},${sy(f(x)).toFixed(1)}`);
      pts.push(`${sx(xb).toFixed(1)},${sy(f(xb)).toFixed(1)}`);
      const g = bump(t, T.gleiche + 0.05, 1.2);
      svg.push(<polyline key="par" points={pts.join(' ')} fill="none" stroke={ARROW} strokeWidth={4.5 + 2 * g} strokeLinecap="round" strokeLinejoin="round" style={{filter: `drop-shadow(0 0 ${8 + 14 * g}px rgba(201,204,240,.7))`}} />);
    }
    html.push(<Lbl key="flab" x={sx(-2.95)} y={sy(5.3)} tex={'x^2'} size={34} color={ARROW} o={show(t, T.jetzt + 1.2, 0.5) * (1 - dCut(t))} />);
  }

  // −2 und 2 → 4
  {
    const dim = 1 - 0.65 * easeInOutCubic(clamp((t - T.negativ) / 0.5)) + 0.65 * easeInOutCubic(clamp((t - T.links2) / 0.5));
    const oL = 1 - easeInOutCubic(clamp((t - (T.links2 + 0.3 + 0.55 * 1.3 - 0.15)) / 0.4)); // −2 verschwindet, wenn die Kante vorbei ist
    const dbl = oL; // solange beide da sind: koralle
    [-2, 2].forEach((x0) => {
      const o = show(t, T.minus2 + 0.1, 0.4) * dim * (x0 < 0 ? oL : 1);
      if (o <= 0.01) return;
      const v = easeOutExpo(clamp((t - (T.minus2 + 0.6)) / 0.55));
      const h = easeOutExpo(clamp((t - (T.vier - 0.15)) / 0.55));
      const col = mix(OK, CO, dbl);
      svg.push(<circle key={`p${x0}`} cx={sx(x0)} cy={OY} r={9} fill={CY} opacity={o} style={{filter: `drop-shadow(0 0 8px ${CY})`}} />);
      if (v > 0) svg.push(<line key={`v${x0}`} x1={sx(x0)} y1={OY} x2={sx(x0)} y2={lerp(OY, sy(4), v)} stroke={CY} strokeWidth={3} strokeDasharray="8 8" opacity={o * 0.85} />);
      if (v > 0.9) svg.push(<circle key={`c${x0}`} cx={sx(x0)} cy={sy(4)} r={8} fill={ARROW} opacity={o} />);
      if (h > 0) {
        const xe = lerp(sx(x0), OX + (x0 < 0 ? -12 : 12), h);
        svg.push(<line key={`h${x0}`} x1={sx(x0)} y1={sy(4)} x2={xe} y2={sy(4)} stroke={col} strokeWidth={3.5} opacity={o} style={{filter: `drop-shadow(0 0 6px ${col})`}} />);
        if (h > 0.85) svg.push(<polygon key={`ah${x0}`} points={arrowHead(OX + (x0 < 0 ? -12 : 12), sy(4), x0 < 0 ? 1 : -1, 0)} fill={col} opacity={o} />);
      }
      html.push(<Lbl key={`lx${x0}`} x={sx(x0)} y={OY + 38} tex={x0 < 0 ? '-2' : '2'} size={32} color={CY} o={o} />);
    });
    const o4 = show(t, T.vier + 0.3, 0.4) * dim;
    html.push(<Lbl key="l4" x={OX - 26} y={sy(4) - 30} tex={'4'} size={32} color={AM} o={o4} anchor="r" />);
    html.push(<Lbl key="x2" x={OX + 26} y={sy(4) - 32} tex={'2\\times'} size={30} color={CO} o={o4 * dbl} glow={bump(t, T.nichtInj2, 1.0)} anchor="l" />);
  }

  // erreichte Werte (lavendel, neben der y-Achse)
  {
    const k = easeOutExpo(clamp((t - (T.negativ + 0.1)) / 0.9));
    const o = (1 - easeInOutCubic(clamp((t - T.links2) / 0.5)) * 0.5) * (k > 0 ? 1 : 0);
    if (k > 0) {
      const yTop = lerp(0, f(XP), k);
      const g = bump(t, T.gleiche + 0.7, 1.6);
      svg.push(<rect key="reach" x={OX + 14} y={sy(yTop)} width={6} height={sy(0) - sy(yTop)} rx={3} fill={ARROW} opacity={o} style={{filter: `drop-shadow(0 0 ${6 + 10 * g}px rgba(201,204,240,.8))`}} />);
      html.push(<Word key="er" x={OX + 34} y={sy(5.2)} text="erreicht" color={ARROW} o={o * show(t, T.negativ + 0.6, 0.4)} anchor="l" size={24} />);
    }
  }
  // Namen der Mengen
  html.push(<Word key="zm" x={OX - 26} y={sy(5.55)} text="Zielmenge" color={AM} o={show(t, T.toGraph + 1.0, 0.5)} anchor="r" size={26} />);
  html.push(<Word key="dm" x={sx(XR) - 20} y={OY - 34} text="Definitionsmenge" color={CY} o={show(t, T.toGraph + 1.0, 0.5)} anchor="r" size={26} />);

  // Waagrechte prüft jede Höhe ab 0
  {
    const k = easeInOutCubic(clamp((t - (T.gleiche + 0.6)) / 1.8));
    const o = (k > 0 ? 1 : 0) * hide(t, T.gleiche + 2.5, 0.5);
    if (o > 0.01) {
      const y = lerp(0.04, 5.7, k);
      svg.push(<line key="sw" x1={sx(-4.3)} y1={sy(y)} x2={sx(4.3)} y2={sy(y)} stroke={AM} strokeWidth={3} opacity={o * 0.85} style={{filter: `drop-shadow(0 0 6px ${AM})`}} />);
      [-1, 1].forEach((s) => svg.push(<circle key={`sw${s}`} cx={sx(s * Math.sqrt(y))} cy={sy(y)} r={9} fill={OK} opacity={o} style={{filter: `drop-shadow(0 0 8px ${OK})`}} />));
    }
  }

  return (
    <div style={{position: 'absolute', inset: 0, opacity: out}}>
      <FullSvg>{svg}</FullSvg>
      {html}
    </div>
  );
};
