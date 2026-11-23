// Graph-Bühne: Aus der Grundparabel x² entstehen f∘g (f wirkt auf die Werte: senkrecht ·2, +3) und g∘f
// (f wirkt vorher auf die Eingaben: waagrecht halb so breit, 1,5 nach links). Danach Teil b (Gegenbeispiele, Bild
// gegen Zielmenge) und in Teil c die Gerade f mit der Waagrechten, die immer genau einen Schnittpunkt hat.
import React from 'react';
import {C} from '../theme';
import {F} from '../fonts';
import {bump, clamp, easeOutExpo, lerp} from '../math';
import {Tex, useSec} from '../ui';
import {glowShadow, hide, rgba, show} from './kit';
import {AM, CO, CY, FullSvg, OK, ease} from './common';
import {f, fg, fInv, gf, num, X0} from './fn';
import {T} from './timeline';

export const OX = 640;
export const OY = 1300;
const UX = 110;
const UY = 75;
export const sx = (x: number) => OX + UX * x;
export const sy = (y: number) => OY - UY * y;
const YTOP = 9.4; // Kurven enden unter den Chips
const YBOT = -1.7;
const BASE = 'rgba(243,244,251,.55)';

// Prüfung: alle markierten Punkte liegen auf den Kurven
if (sy(YTOP) < 592) throw new Error('Kurven ragen in die Chips');
if (fg(-1) !== 5 || fg(1) !== 5 || gf(-1) !== 1 || gf(-2) !== 1) throw new Error('Gegenbeispiele');

const Lbl: React.FC<{x: number; y: number; tex: string; size: number; o: number; color?: string; glow?: number; anchor?: 'c' | 'l' | 'r'}> = ({x, y, tex, size, o, color = C.txt, glow = 0, anchor = 'c'}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${anchor === 'c' ? '-50%' : anchor === 'r' ? '-100%' : '0'}, -50%)`, opacity: o, whiteSpace: 'nowrap', textShadow: glowShadow(glow, color)}}>
      <Tex tex={tex} size={size} style={{color}} />
    </div>
  );

const Word: React.FC<{x: number; y: number; text: string; color: string; o: number; size?: number; anchor?: 'c' | 'l' | 'r'; weight?: number}> = ({x, y, text, color, o, size = 26, anchor = 'c', weight = 700}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${anchor === 'c' ? '-50%' : anchor === 'r' ? '-100%' : '0'}, -50%)`, opacity: o, fontFamily: F.display, fontWeight: weight, fontSize: size, color, whiteSpace: 'nowrap', textShadow: glowShadow(0, color)}}>
      {text}
    </div>
  );

export const arrowHead = (x: number, y: number, dx: number, dy: number, s = 15) => {
  const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l;
  const uy = dy / l;
  return `${x},${y} ${x - ux * s - uy * s * 0.55},${y - uy * s + ux * s * 0.55} ${x - ux * s + uy * s * 0.55},${y - uy * s - ux * s * 0.55}`;
};

const poly = (pts: [number, number][]) => pts.map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ');

/* ---------- Zeitverläufe ---------- */

export const graphIn = (t: number) => ease(t, T.toGraph + 0.2, 0.7);
const graphOut = (t: number) => hide(t, T.rechnet + 0.1, 0.5);
const tableDim = (t: number) => 1 - 0.85 * ease(t, T.keine, 0.5) + 0.85 * ease(t, T.teilC, 0.5);
const curvesOut = (t: number) => hide(t, T.teilC, 0.5);

// f∘g: y = a·u² + d
const aFG = (t: number) => lerp(1, 2, ease(t, T.mal2 + 0.1, 0.9));
const dFG = (t: number) => lerp(0, 3, ease(t, T.plus3 + 0.05, 0.9));
// g∘f: Punkt (u, u²) der Grundparabel wandert nach (u/b − c, u²)
const bGF = (t: number) => lerp(1, 2, ease(t, T.schmaler + 0.45, 0.85));
const cGF = (t: number) => lerp(0, 1.5, ease(t, T.links + 0.05, 0.9));
// Zielwerte prüfen
if (Math.abs(2 * 1.2 ** 2 + 3 - fg(1.2)) > 1e-9) throw new Error('f∘g-Parameter');
for (const u of [-2, -1, 0, 1, 2]) if (Math.abs(gf(u / 2 - 1.5) - u * u) > 1e-9) throw new Error('g∘f-Parameter');

// Helligkeit der beiden Kurven in Teil b
const fgDim = (t: number) => 1 - 0.82 * ease(t, T.b2, 0.5);
const gfDim = (t: number) => 1 - 0.82 * ease(t, T.b1, 0.5) + 0.82 * ease(t, T.b2, 0.5);

/* ---------- Bühne ---------- */

export const Graph: React.FC = () => {
  const t = useSec();
  const kIn = graphIn(t);
  if (kIn <= 0) return null;
  const out = graphOut(t);
  if (out <= 0.01) return null;
  const svg: React.ReactNode[] = [];
  const html: React.ReactNode[] = [];
  const dim = tableDim(t);
  const cOut = curvesOut(t);

  // Gitter, Achsen, Zahlen
  const gridO = kIn;
  for (let i = -6; i <= 4; i++) svg.push(<line key={`gx${i}`} x1={sx(i)} y1={sy(9.8)} x2={sx(i)} y2={sy(-2)} stroke="rgba(243,244,251,.07)" strokeWidth={1.5} opacity={gridO} />);
  for (let j = -2; j <= 9; j++) svg.push(<line key={`gy${j}`} x1={0} y1={sy(j)} x2={1080} y2={sy(j)} stroke="rgba(243,244,251,.07)" strokeWidth={1.5} opacity={gridO} />);
  const gX = bump(t, T.vorher + 0.1, 1.4); // Eingaben leuchten
  const gY = bump(t, T.werte + 1.4, 1.4); // Werte leuchten
  svg.push(<line key="ax" x1={0} y1={OY} x2={1080} y2={OY} stroke={gX > 0.02 ? AM : 'rgba(243,244,251,.4)'} strokeOpacity={gX > 0.02 ? 0.4 + 0.6 * gX : 1} strokeWidth={2 + 2 * gX} opacity={gridO} style={gX > 0.02 ? {filter: `drop-shadow(0 0 ${12 * gX}px ${AM})`} : undefined} />);
  svg.push(<line key="ay" x1={OX} y1={sy(9.8)} x2={OX} y2={sy(-2)} stroke={gY > 0.02 ? AM : 'rgba(243,244,251,.4)'} strokeOpacity={gY > 0.02 ? 0.4 + 0.6 * gY : 1} strokeWidth={2 + 2 * gY} opacity={gridO} style={gY > 0.02 ? {filter: `drop-shadow(0 0 ${12 * gY}px ${AM})`} : undefined} />);
  for (const i of [-3, -2, -1, 1, 2, 3]) {
    svg.push(<line key={`tx${i}`} x1={sx(i)} y1={OY - 7} x2={sx(i)} y2={OY + 7} stroke="rgba(243,244,251,.55)" strokeWidth={2} opacity={gridO} />);
    const hl = i === X0 ? bump(t, T.senk + 0.1, 1.6) : 0;
    html.push(<Lbl key={`lx${i}`} x={sx(i)} y={OY + 32} tex={num(i)} size={26} color={hl > 0.02 ? C.txt : C.txt2} o={gridO * 0.9} glow={hl} />);
  }
  for (const j of [1, 3, 5, 7, 9]) {
    svg.push(<line key={`ty${j}`} x1={OX - 7} y1={sy(j)} x2={OX + 7} y2={sy(j)} stroke="rgba(243,244,251,.55)" strokeWidth={2} opacity={gridO} />);
    html.push(<Lbl key={`ly${j}`} x={OX - 18} y={sy(j)} tex={num(j)} size={26} color={C.txt2} o={gridO * 0.9 * (1 - bOn(t) * 0.6)} anchor="r" />);
  }
  html.push(<Lbl key="xa" x={1040} y={OY - 26} tex="x" size={30} color={C.txt2} o={gridO} />);
  html.push(<Lbl key="ya" x={OX + 26} y={sy(9.7)} tex="y" size={30} color={C.txt2} o={gridO} />);

  if (cOut > 0.01) partAB(t, svg, html, dim * cOut);
  partC(t, svg, html);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: out}}>
      <FullSvg o={1}>{svg}</FullSvg>
      {html}
    </div>
  );
};

const bOn = (t: number) => ease(t, T.teilB + 0.3, 0.5) * hide(t, T.teilC, 0.5);

/* ---------- Teil a (Verformung) und Teil b ---------- */

const partAB = (t: number, svg: React.ReactNode[], html: React.ReactNode[], O: number) => {
  // Grundparabel x²
  {
    const p = ease(t, T.toGraph + 0.45, 0.9);
    const o = hide(t, T.teilB + 0.2, 0.5) * O;
    if (p > 0 && o > 0.01) {
      const pts: [number, number][] = [];
      const u0 = -Math.sqrt(YTOP);
      const u1 = lerp(u0, -u0, p);
      for (let u = u0; u <= u1 + 1e-9; u += 0.03) pts.push([u, u * u]);
      svg.push(<polyline key="base" points={poly(pts)} fill="none" stroke={BASE} strokeWidth={3} strokeDasharray="10 9" opacity={o} />);
      html.push(<Lbl key="basel" x={sx(2.2) + 16} y={sy(4.6)} tex="x^2" size={34} color={BASE} o={o * show(t, T.toGraph + 1.1, 0.4)} anchor="l" />);
    }
  }

  // f∘g, amber
  {
    const o = show(t, T.werte + 0.1, 0.5) * fgDim(t) * O;
    if (o > 0.01) {
      const a = aFG(t);
      const d = dFG(t);
      const um = Math.min(Math.sqrt(YTOP), Math.sqrt(Math.max(0, (YTOP - d) / a)));
      const pts: [number, number][] = [];
      for (let u = -um; u <= um + 1e-9; u += 0.02) pts.push([u, a * u * u + d]);
      pts.push([um, a * um * um + d]);
      const g = bump(t, T.werte + 0.15, 1.0) + bump(t, T.b1 + 0.1, 1.0);
      svg.push(<polyline key="fg" points={poly(pts)} fill="none" stroke={AM} strokeWidth={5 + 2 * g} strokeLinecap="round" strokeLinejoin="round" style={{filter: `drop-shadow(0 0 ${8 + 14 * g}px ${rgba(AM, 0.7)})`}} opacity={o} />);
      // Punkte mit senkrechten Spuren
      const dotsO = o * hide(t, T.eingaben, 0.4);
      if (dotsO > 0.01)
        [-1.5, -1, 0, 1, 1.5].forEach((u) => {
          const y = a * u * u + d;
          const y0 = u * u;
          if (y - y0 > 0.08) {
            svg.push(<line key={`fgt${u}`} x1={sx(u)} y1={sy(y0)} x2={sx(u)} y2={sy(y) + 12} stroke={AM} strokeWidth={2.5} strokeDasharray="6 6" opacity={dotsO * 0.7} />);
            svg.push(<polygon key={`fga${u}`} points={arrowHead(sx(u), sy(y) + 10, 0, -1, 12)} fill={AM} opacity={dotsO * 0.8} />);
          }
          svg.push(<circle key={`fgd${u}`} cx={sx(u)} cy={sy(y)} r={8} fill={AM} opacity={dotsO} style={{filter: `drop-shadow(0 0 6px ${AM})`}} />);
        });
      // Schritt-Etiketten an der rechten Seite
      const tagX = sx(-1.5) - 22;
      const tagY = sy(a * 2.25 + d) + 4;
      const o1 = show(t, T.mal2, 0.35) * hide(t, T.plus3, 0.3) * O;
      const o2 = show(t, T.plus3 + 0.05, 0.35) * hide(t, T.eingaben, 0.4) * O;
      html.push(<Lbl key="tag1" x={tagX} y={tagY} tex={'\\cdot 2'} size={38} color={AM} o={o1} anchor="r" glow={bump(t, T.mal2 + 0.1, 0.8)} />);
      html.push(<Lbl key="tag2" x={tagX} y={tagY} tex={'+3'} size={38} color={AM} o={o2} anchor="r" glow={bump(t, T.plus3 + 0.1, 0.8)} />);
      // Scheitel (0 | 3)
      const vo = show(t, T.plus3 + 0.95, 0.4) * hide(t, T.teilB, 0.4) * O;
      html.push(<Lbl key="v1" x={OX + 22} y={sy(3) + 34} tex={'(0\\,|\\,3)'} size={30} color={AM} o={vo} anchor="l" />);
    }
    // Beschriftung
    const lo = show(t, T.werte + 0.6, 0.5) * O * lerp(1, 0.5, 1 - fgDim(t));
    const lx = 838;
    const ly = sy(7.6);
    html.push(<Lbl key="fgl" x={lx} y={ly} tex={'f\\circ g'} size={38} color={AM} o={lo} anchor="l" />);
    html.push(<Lbl key="fgl2" x={lx} y={ly + 44} tex={'2x^2+3'} size={30} color={AM} o={lo * show(t, T.plus3 + 0.9, 0.4)} anchor="l" />);
    html.push(<Word key="fgi" x={lx} y={ly + 86} text="inj ✗" color={CO} size={26} o={lo * show(t, T.b1inj, 0.35)} anchor="l" />);
    html.push(<Word key="fgs" x={lx} y={ly + 118} text="surj ✗" color={CO} size={26} o={lo * show(t, T.b1sur, 0.35)} anchor="l" />);
  }

  // g∘f, cyan
  {
    const o = show(t, T.eingaben + 0.3, 0.5) * gfDim(t) * O;
    if (o > 0.01) {
      const b = bGF(t);
      const c = cGF(t);
      const um = Math.sqrt(YTOP);
      const pts: [number, number][] = [];
      for (let u = -um; u <= um + 1e-9; u += 0.02) pts.push([u / b - c, u * u]);
      pts.push([um / b - c, um * um]);
      const g = bump(t, T.eingaben + 0.35, 1.0) + bump(t, T.b2 + 0.1, 1.0);
      svg.push(<polyline key="gf" points={poly(pts)} fill="none" stroke={CY} strokeWidth={5 + 2 * g} strokeLinecap="round" strokeLinejoin="round" style={{filter: `drop-shadow(0 0 ${8 + 14 * g}px ${rgba(CY, 0.7)})`}} opacity={o} />);
      const dotsO = o * hide(t, T.senk, 0.4);
      if (dotsO > 0.01)
        [-2, -1, 0, 1, 2].forEach((u) => {
          const x = u / b - c;
          const y = u * u;
          if (Math.abs(x - u) > 0.08) {
            const dir = x < u ? -1 : 1;
            svg.push(<line key={`gft${u}`} x1={sx(u)} y1={sy(y)} x2={sx(x) - dir * 12} y2={sy(y)} stroke={CY} strokeWidth={2.5} strokeDasharray="6 6" opacity={dotsO * 0.7} />);
            svg.push(<polygon key={`gfa${u}`} points={arrowHead(sx(x) - dir * 10, sy(y), dir, 0, 12)} fill={CY} opacity={dotsO * 0.8} />);
          }
          svg.push(<circle key={`gfd${u}`} cx={sx(x)} cy={sy(y)} r={8} fill={CY} opacity={dotsO} style={{filter: `drop-shadow(0 0 6px ${CY})`}} />);
        });
      const tagY = sy(4) - 40;
      const o1 = show(t, T.schmaler + 0.4, 0.35) * hide(t, T.links, 0.3) * O;
      const o2 = show(t, T.links + 0.05, 0.35) * hide(t, T.senk, 0.4) * O;
      html.push(<Lbl key="tag3" x={sx(-2 / b - c) - 22} y={tagY} tex={'\\text{Breite} : 2'} size={32} color={CY} o={o1} anchor="r" glow={bump(t, T.schmaler + 0.5, 0.8)} />);
      html.push(<Lbl key="tag4" x={sx(-2 / b - c) - 22} y={tagY} tex={'1{,}5\\text{ nach links}'} size={32} color={CY} o={o2} anchor="r" glow={bump(t, T.links + 0.1, 0.8)} />);
      const vo = show(t, T.links + 0.95, 0.4) * hide(t, T.teilB, 0.4) * O;
      html.push(<Lbl key="v2" x={sx(-1.5)} y={OY + 78} tex={'(-1{,}5\\,|\\,0)'} size={30} color={CY} o={vo} />);
      if (vo > 0.01) svg.push(<circle key="v2d" cx={sx(-1.5)} cy={OY} r={9} fill={CY} opacity={vo} />);
    }
    const lo = show(t, T.eingaben + 0.8, 0.5) * O * lerp(1, 0.5, 1 - gfDim(t));
    const lx = 312;
    const ly = sy(7.6);
    html.push(<Lbl key="gfl" x={lx} y={ly} tex={'g\\circ f'} size={38} color={CY} o={lo} anchor="r" />);
    html.push(<Lbl key="gfl2" x={lx} y={ly + 44} tex={'(2x+3)^2'} size={30} color={CY} o={lo * show(t, T.links + 0.9, 0.4)} anchor="r" />);
    html.push(<Word key="gfi" x={lx} y={ly + 86} text="inj ✗" color={CO} size={26} o={lo * show(t, T.b2inj, 0.35)} anchor="r" />);
    html.push(<Word key="gfs" x={lx} y={ly + 118} text="surj ✗" color={CO} size={26} o={lo * show(t, T.b2sur, 0.35)} anchor="r" />);
  }

  // Senkrechte bei x = −1: gleiche Eingabe, verschiedene Werte
  {
    const o = show(t, T.senk, 0.4) * hide(t, T.teilB, 0.4) * O;
    if (o > 0.01) {
      const k = easeOutExpo(clamp((t - T.senk) / 0.7));
      const y5 = fg(X0);
      const y1 = gf(X0);
      svg.push(<line key="sk" x1={sx(X0)} y1={OY} x2={sx(X0)} y2={lerp(OY, sy(y5 + 0.7), k)} stroke={C.txt} strokeWidth={2.5} strokeDasharray="8 8" opacity={o * 0.75} />);
      const d1 = show(t, T.senk + 0.35, 0.3) * o;
      const d2 = show(t, T.senk + 0.6, 0.3) * o;
      svg.push(<circle key="sk1" cx={sx(X0)} cy={sy(y1)} r={10} fill={CY} opacity={d1} style={{filter: `drop-shadow(0 0 10px ${CY})`}} />);
      svg.push(<circle key="sk5" cx={sx(X0)} cy={sy(y5)} r={10} fill={AM} opacity={d2} style={{filter: `drop-shadow(0 0 10px ${AM})`}} />);
      html.push(<Lbl key="sk1l" x={sx(X0) + 20} y={sy(y1) - 26} tex={num(y1)} size={34} color={CY} o={d1} anchor="l" glow={bump(t, T.senk + 0.4, 1)} />);
      html.push(<Lbl key="sk5l" x={sx(X0) + 20} y={sy(y5) - 26} tex={num(y5)} size={34} color={AM} o={d2} anchor="l" glow={bump(t, T.senk + 0.65, 1)} />);
    }
  }

  /* ----- Teil b ----- */
  const zO = show(t, T.ziel + 0.1, 0.5) * O;
  // Zielmenge ℝ: die ganze y-Achse
  if (zO > 0.01) {
    const k = easeOutExpo(clamp((t - T.ziel - 0.1) / 0.9));
    const g = bump(t, T.ziel + 0.3, 1.4);
    svg.push(<rect key="ziel" x={OX - 6} y={lerp(sy(0), sy(YTOP), k)} width={12} height={lerp(0, sy(YBOT) - sy(YTOP), k)} rx={6} fill={`rgba(243,244,251,${0.32 + 0.3 * g})`} opacity={zO} style={{filter: `drop-shadow(0 0 ${6 + 10 * g}px rgba(243,244,251,.6))`}} />);
  }
  // f∘g: −1 und 1 landen auf 5
  pairOnto(t, svg, html, O * hide(t, T.b2, 0.4), [-1, 1], fg, T.b1pts, T.b1fuenf, T.b1inj, AM, false);
  // g∘f: −2 und −1 landen auf 1
  pairOnto(t, svg, html, O * hide(t, T.keine, 0.4), [-2, -1], gf, T.b2pts, T.b2pts + 1.3, T.b2inj, CY, true);
  // Bild gegen Zielmenge
  imageStrip(t, svg, html, O * hide(t, T.b2, 0.4), fg(0), T.b1unter, AM, 'f');
  imageStrip(t, svg, html, O * hide(t, T.keine, 0.4), gf(-1.5), T.b2neg, CY, 'g');
  // Legende
  {
    const o = zO * hide(t, T.keine, 0.4);
    if (o > 0.01) {
      const lx = 700;
      const top = 1152;
      const bo = show(t, T.b1unter + 0.2, 0.4);
      const isG = ease(t, T.b2, 0.4);
      html.push(<div key="legbg" style={{position: 'absolute', left: lx - 18, top: top - 26, width: 248, height: lerp(52, 148, Math.max(bo * (1 - isG), show(t, T.b2neg + 0.2, 0.4))), borderRadius: 14, background: 'rgba(10,11,32,.82)', border: '1px solid rgba(255,255,255,.12)', opacity: o}} />);
      html.push(<Lbl key="lz" x={lx} y={top} tex={'\\text{Zielmenge } \\mathbb{R}'} size={28} color={C.txt} o={o} anchor="l" />);
      html.push(<Lbl key="lb1" x={lx} y={top + 46} tex={'\\text{Bild } [3, \\infty)'} size={28} color={AM} o={o * bo * (1 - isG)} anchor="l" />);
      html.push(<Lbl key="lb2" x={lx} y={top + 46} tex={'\\text{Bild } [0, \\infty)'} size={28} color={CY} o={o * show(t, T.b2neg + 0.2, 0.4)} anchor="l" />);
      html.push(<Word key="ln" x={lx} y={top + 90} text="nie erreicht" color={CO} size={26} o={o * bo * (1 - isG) + o * show(t, T.b2neg + 0.2, 0.4)} anchor="l" />);
    }
  }
};

// zwei Eingaben, Lote zur Kurve, Pfeile auf denselben Wert der y-Achse, „2ד
const pairOnto = (t: number, svg: React.ReactNode[], html: React.ReactNode[], O: number, xs: number[], fn: (x: number) => number, at: number, hit: number, inj: number, col: string, bow: boolean) => {
  const o = show(t, at, 0.35) * O;
  if (o <= 0.01) return;
  const y = fn(xs[0]);
  if (fn(xs[1]) !== y) throw new Error('Paar landet nicht auf demselben Wert');
  xs.forEach((x0, i) => {
    const v = easeOutExpo(clamp((t - at - 0.35 - 0.15 * i) / 0.55));
    const h = easeOutExpo(clamp((t - hit + 0.25 - 0.12 * i) / 0.6));
    svg.push(<circle key={`p${col}${x0}`} cx={sx(x0)} cy={OY} r={9} fill={C.txt} opacity={o} style={{filter: 'drop-shadow(0 0 8px rgba(243,244,251,.8))'}} />);
    html.push(<Lbl key={`pl${col}${x0}`} x={sx(x0)} y={OY + 32} tex={num(x0)} size={28} color={C.txt} o={o} glow={0.6} />);
    if (v > 0) svg.push(<line key={`pv${col}${x0}`} x1={sx(x0)} y1={OY} x2={sx(x0)} y2={lerp(OY, sy(y), v)} stroke={C.txt} strokeWidth={2.5} strokeDasharray="7 7" opacity={o * 0.8} />);
    if (v > 0.9) svg.push(<circle key={`pc${col}${x0}`} cx={sx(x0)} cy={sy(y)} r={9} fill={col} opacity={o} />);
    if (h > 0) {
      const side = x0 < 0 ? -1 : 1;
      const xe = OX + side * 12;
      if (!bow) {
        const xh = lerp(sx(x0), xe, h);
        svg.push(<line key={`ph${col}${x0}`} x1={sx(x0)} y1={sy(y)} x2={xh} y2={sy(y)} stroke={CO} strokeWidth={3.5} opacity={o} style={{filter: `drop-shadow(0 0 6px ${CO})`}} />);
        if (h > 0.85) svg.push(<polygon key={`pa${col}${x0}`} points={arrowHead(xe, sy(y), -side, 0)} fill={CO} opacity={o} />);
      } else {
        // Bögen, damit sich die beiden Pfeile von links nicht überdecken
        const lift = 38 + 46 * (xs.length - 1 - i);
        const x1 = sx(x0);
        const y1 = sy(y);
        const mx = (x1 + xe) / 2;
        const N = 30;
        const pts: string[] = [];
        let last: [number, number] = [x1, y1];
        let prev: [number, number] = [x1, y1];
        for (let s = 0; s <= N * h; s++) {
          const u = s / N;
          const px = (1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * mx + u * u * xe;
          const py = (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * (y1 - 2 * lift) + u * u * y1;
          prev = last;
          last = [px, py];
          pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
        }
        svg.push(<polyline key={`ph${col}${x0}`} points={pts.join(' ')} fill="none" stroke={CO} strokeWidth={3.5} opacity={o} style={{filter: `drop-shadow(0 0 6px ${CO})`}} />);
        if (h > 0.9) svg.push(<polygon key={`pa${col}${x0}`} points={arrowHead(last[0], last[1], last[0] - prev[0], last[1] - prev[1])} fill={CO} opacity={o} />);
      }
    }
  });
  const o2 = show(t, hit + 0.2, 0.35) * o;
  html.push(<Lbl key={`pw${col}`} x={bow ? OX + 22 : OX - 18} y={sy(y)} tex={num(y)} size={32} color={col} o={o2} anchor={bow ? 'l' : 'r'} glow={bump(t, hit + 0.25, 0.9)} />);
  html.push(<Lbl key={`p2${col}`} x={OX + 22} y={sy(y) - 36} tex={'2\\times'} size={30} color={CO} o={o2} anchor="l" glow={bump(t, inj, 1.0)} />);
};

// Bild als Streifen neben der Achse, darunter koralle: nie erreicht
const imageStrip = (t: number, svg: React.ReactNode[], html: React.ReactNode[], O: number, low: number, at: number, col: string, key: string) => {
  const o = show(t, at, 0.4) * O;
  if (o <= 0.01) return;
  const k = easeOutExpo(clamp((t - at - 0.1) / 0.9));
  const x = OX + 14;
  svg.push(<rect key={`im${key}`} x={x} y={sy(lerp(low, YTOP, k))} width={8} height={sy(low) - sy(lerp(low, YTOP, k))} rx={4} fill={col} opacity={o} style={{filter: `drop-shadow(0 0 8px ${col})`}} />);
  const kc = easeOutExpo(clamp((t - at - 0.5) / 0.7));
  svg.push(<rect key={`no${key}`} x={x} y={sy(low)} width={8} height={(sy(YBOT) - sy(low)) * kc} rx={4} fill={CO} opacity={o * 0.9} />);
  svg.push(<rect key={`nb${key}`} x={0} y={sy(low)} width={1080} height={(sy(YBOT) - sy(low)) * kc} fill={rgba(CO, 0.075)} opacity={o} />);
  svg.push(<line key={`nl${key}`} x1={0} y1={sy(low)} x2={1080} y2={sy(low)} stroke={CO} strokeWidth={2} strokeDasharray="10 10" opacity={o * kc * 0.7} />);
  html.push(<Lbl key={`il${key}`} x={OX - 18} y={sy(low)} tex={num(low)} size={30} color={col} o={o * kc} anchor="r" glow={bump(t, at + 0.4, 1)} />);
};

/* ---------- Teil c: Gerade mit Steigung 2 ---------- */

const partC = (t: number, svg: React.ReactNode[], html: React.ReactNode[]) => {
  const o = show(t, T.teilC + 0.3, 0.4);
  if (o <= 0.01) return;
  const x0 = (YBOT - 3) / 2;
  const x1 = (YTOP - 3) / 2;
  const p = ease(t, T.gerade + 0.05, 1.0);
  const xe = lerp(x0, x1, p);
  const g = bump(t, T.gerade + 0.1, 1.2);
  if (xe > x0) svg.push(<line key="ln" x1={sx(x0)} y1={sy(f(x0))} x2={sx(xe)} y2={sy(f(xe))} stroke={AM} strokeWidth={5 + 2 * g} strokeLinecap="round" opacity={o} style={{filter: `drop-shadow(0 0 ${8 + 14 * g}px ${rgba(AM, 0.7)})`}} />);
  html.push(<Lbl key="lnl" x={sx(0.25) - 24} y={sy(6.2)} tex={'f(x) = 2x+3'} size={36} color={AM} o={o * show(t, T.gerade + 0.6, 0.4)} anchor="r" />);
  // Steigungsdreieck: 1 nach rechts, 2 nach oben
  const st = show(t, T.gerade + 1.0, 0.4) * o;
  if (st > 0.01) {
    const k1 = easeOutExpo(clamp((t - T.gerade - 1.0) / 0.4));
    const k2 = easeOutExpo(clamp((t - T.gerade - 1.35) / 0.45));
    svg.push(<line key="s1" x1={sx(0)} y1={sy(3)} x2={sx(k1)} y2={sy(3)} stroke={C.txt} strokeWidth={3} opacity={st * 0.85} />);
    if (k2 > 0) svg.push(<line key="s2" x1={sx(1)} y1={sy(3)} x2={sx(1)} y2={sy(3 + 2 * k2)} stroke={AM} strokeWidth={3.5} opacity={st} />);
    html.push(<Lbl key="s1l" x={sx(0.5)} y={sy(3) + 28} tex="1" size={30} color={C.txt} o={st * k1} />);
    html.push(<Lbl key="s2l" x={sx(1) + 22} y={sy(4)} tex="2" size={34} color={AM} o={st * k2} anchor="l" glow={bump(t, T.gerade + 1.5, 0.9)} />);
  }
  // Waagrechte: immer genau ein Schnittpunkt
  {
    const k = ease(t, T.trifft + 0.1, 2.2);
    const wo = (k > 0 ? 1 : 0) * hide(t, T.bij + 0.6, 0.5) * o;
    if (wo > 0.01) {
      const y = lerp(-1.2, 8.8, k);
      const xh = fInv(y);
      if (Math.abs(f(xh) - y) > 1e-9) throw new Error('Waagrechte trifft f nicht');
      svg.push(<line key="sw" x1={0} y1={sy(y)} x2={1080} y2={sy(y)} stroke={C.txt} strokeWidth={2.5} opacity={wo * 0.7} />);
      svg.push(<circle key="swd" cx={sx(xh)} cy={sy(y)} r={11} fill={OK} opacity={wo} style={{filter: `drop-shadow(0 0 10px ${OK})`}} />);
    }
    html.push(<Word key="bij" x={sx(0.25) - 24} y={sy(6.2) + 48} text="bijektiv ✓" color={OK} size={30} o={o * show(t, T.bij, 0.4)} anchor="r" />);
  }
};

