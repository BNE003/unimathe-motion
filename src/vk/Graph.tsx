// Graph-Bühne für Teil b und c (Version 2): immer nur ein Graph zur Zeit, jeder markierte Wert ist vorher
// in der Rechenleiste ausgerechnet. Teil b: f∘g, dann g∘f (Kamera fährt mit). Teil c: die Gerade f.
import React from 'react';
import {C} from '../theme';
import {F} from '../fonts';
import {bump, clamp, easeInOutCubic, easeOutExpo, lerp} from '../math';
import {Tex, useSec} from '../ui';
import {glowShadow, hide, rgba, show} from './kit';
import {AM, CO, OK, ease} from './common';
import {f, fg, fInv, gf, num} from './fn';
import {T} from './timeline';

const CURVE = '#D9DBF7';
const CLIP_TOP = 798;
const CLIP_BOT = 1425;
const YMAX = 9.6;

// Kamera: f∘g mittig um x = 0, g∘f mittig um x = −1,5, f mittig um x = 0,5
const U = 56;
const cam = (t: number) => {
  let cx = 0;
  cx = lerp(cx, -1.5, ease(t, T.b2 - 0.1, 0.9));
  cx = lerp(cx, 0.5, ease(t, T.teilC + 0.1, 0.9));
  return {ox: 540 - cx * U, oy: 1338};
};

const Lbl: React.FC<{x: number; y: number; tex: string; size: number; o: number; color?: string; glow?: number; anchor?: 'c' | 'l' | 'r'}> = ({x, y, tex, size, o, color = C.txt, glow = 0, anchor = 'c'}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${anchor === 'c' ? '-50%' : anchor === 'r' ? '-100%' : '0'}, -50%)`, opacity: o, whiteSpace: 'nowrap', textShadow: glowShadow(glow, color)}}>
      <Tex tex={tex} size={size} style={{color}} />
    </div>
  );

const Word: React.FC<{x: number; y: number; text: string; color: string; o: number; size?: number; anchor?: 'c' | 'l' | 'r'}> = ({x, y, text, color, o, size = 28, anchor = 'c'}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${anchor === 'c' ? '-50%' : anchor === 'r' ? '-100%' : '0'}, -50%)`, opacity: o, fontFamily: F.display, fontWeight: 700, fontSize: size, color, whiteSpace: 'nowrap', textShadow: glowShadow(0, color)}}>
      {text}
    </div>
  );

export const Graph: React.FC = () => {
  const t = useSec();
  const kIn = show(t, T.toGraph + 0.1, 0.6);
  const out = hide(t, T.sum - 0.1, 0.5);
  if (kIn <= 0.01 || out <= 0.01) return null;
  const c = cam(t);
  const X = (x: number) => c.ox + U * x;
  const Y = (y: number) => c.oy - U * y;
  const svg: React.ReactNode[] = [];
  const html: React.ReactNode[] = [];

  // Gitter und Achsen
  for (let i = -14; i <= 14; i++) {
    const x = X(i);
    if (x < -5 || x > 1085) continue;
    svg.push(<line key={`gx${i}`} x1={x} y1={CLIP_TOP} x2={x} y2={CLIP_BOT} stroke="rgba(243,244,251,.07)" strokeWidth={1.5} />);
  }
  for (let j = -1; j <= 10; j++) svg.push(<line key={`gy${j}`} x1={0} y1={Y(j)} x2={1080} y2={Y(j)} stroke="rgba(243,244,251,.07)" strokeWidth={1.5} />);
  svg.push(<line key="ax" x1={0} y1={Y(0)} x2={1080} y2={Y(0)} stroke="rgba(243,244,251,.45)" strokeWidth={2} />);
  svg.push(<line key="ay" x1={X(0)} y1={CLIP_TOP} x2={X(0)} y2={CLIP_BOT} stroke="rgba(243,244,251,.45)" strokeWidth={2} />);
  for (let i = -4; i <= 5; i++) {
    if (i === 0) continue;
    svg.push(<line key={`tx${i}`} x1={X(i)} y1={Y(0) - 7} x2={X(i)} y2={Y(0) + 7} stroke="rgba(243,244,251,.55)" strokeWidth={2} />);
    html.push(<Lbl key={`lx${i}`} x={X(i)} y={Y(0) + 28} tex={num(i)} size={24} color={C.txt2} o={0.9} />);
  }
  for (const j of [1, 3, 5, 7, 9]) {
    svg.push(<line key={`ty${j}`} x1={X(0) - 7} y1={Y(j)} x2={X(0) + 7} y2={Y(j)} stroke="rgba(243,244,251,.55)" strokeWidth={2} />);
    html.push(<Lbl key={`ly${j}`} x={X(0) - 14} y={Y(j)} tex={num(j)} size={24} color={C.txt2} o={0.9} anchor="r" />);
  }

  // Kurve zeichnen: von links nach rechts, nur bis YMAX
  const curve = (key: string, fn: (x: number) => number, x0: number, x1: number, at: number, o: number, color = CURVE, glowAt: number[] = []) => {
    if (o <= 0.01) return;
    const p = easeInOutCubic(clamp((t - at) / 1.1));
    if (p <= 0) return;
    const xe = lerp(x0, x1, p);
    const pts: string[] = [];
    for (let x = x0; x <= xe + 1e-9; x += 0.02) if (fn(x) <= YMAX) pts.push(`${X(x).toFixed(1)},${Y(fn(x)).toFixed(1)}`);
    const g = glowAt.reduce((s, a) => s + bump(t, a, 1.2), 0);
    svg.push(<polyline key={key} points={pts.join(' ')} fill="none" stroke={color} strokeWidth={5 + 2 * g} strokeLinecap="round" strokeLinejoin="round" opacity={o} style={{filter: `drop-shadow(0 0 ${8 + 12 * g}px ${rgba(color, 0.6)})`}} />);
  };

  /* ---------- f∘g ---------- */
  const oFG = hide(t, T.b2 - 0.2, 0.4);
  if (oFG > 0.01) {
    curve('fg', fg, -2.6, 2.6, T.teilB + 0.25, oFG, CURVE, [T.b1 + 0.1]);
    html.push(<Lbl key="fgl" x={X(1.9)} y={Y(8.4)} tex={'2x^2+3'} size={32} color={CURVE} o={oFG * show(t, T.teilB + 1.1, 0.4)} anchor="l" />);
    pair(t, svg, html, X, Y, [-1, 1], fg, T.b1 + 0.6, T.b1fuenf, oFG);
    tag(html, X(2.3), Y(5) - 2, 'nicht injektiv', show(t, T.b1inj + 0.1, 0.35) * oFG);
    // nichts unter 3
    floor(t, svg, html, X, Y, fg(0), T.b1unter - 0.3, oFG, 'nie unter 3');
    tag(html, X(2.3), Y(1.5), 'nicht surjektiv', show(t, T.b1sur + 0.1, 0.35) * oFG);
  }

  /* ---------- g∘f ---------- */
  const oGF = show(t, T.b2 + 0.1, 0.3) * hide(t, T.teilC, 0.4);
  if (oGF > 0.01) {
    curve('gf', gf, -3.05, 0.05, T.b2 + 0.2, oGF, CURVE, [T.b2pts + 0.1]);
    html.push(<Lbl key="gfl" x={X(0.15)} y={Y(8.4)} tex={'(2x+3)^2'} size={32} color={CURVE} o={oGF * show(t, T.b2 + 1.0, 0.4)} anchor="l" />);
    pair(t, svg, html, X, Y, [-2, -1], gf, T.b2pts + 0.3, T.b2eins, oGF);
    floor(t, svg, html, X, Y, gf(-1.5), T.b2quad, oGF, 'nie negativ');
    const w = show(t, T.b2weder + 0.1, 0.35) * oGF;
    tag(html, X(1.0), Y(5.5), 'nicht injektiv', w);
    tag(html, X(1.0), Y(4.7), 'nicht surjektiv', w);
  }

  /* ---------- Teil c: die Gerade f ---------- */
  const oF = show(t, T.teilC + 0.2, 0.3);
  if (oF > 0.01) {
    curve('f', f, -2.35, 3.3, T.gerade + 0.05, oF, AM, [T.gerade + 0.1]);
    html.push(<Lbl key="fl" x={X(-0.3)} y={Y(6.4)} tex={'f(x) = 2x+3'} size={34} color={AM} o={oF * show(t, T.gerade + 0.7, 0.4)} anchor="r" />);
    // Steigungsdreieck: 1 nach rechts, 2 nach oben
    const k1 = easeOutExpo(clamp((t - T.gerade - 1.2) / 0.45));
    const k2 = easeOutExpo(clamp((t - T.gerade - 1.55) / 0.5));
    if (k1 > 0) {
      svg.push(<line key="s1" x1={X(0)} y1={Y(3)} x2={X(k1)} y2={Y(3)} stroke={C.txt} strokeWidth={3} opacity={oF * 0.85} />);
      html.push(<Lbl key="s1l" x={X(0.5)} y={Y(3) + 24} tex="1" size={28} color={C.txt} o={oF * k1} />);
    }
    if (k2 > 0) {
      svg.push(<line key="s2" x1={X(1)} y1={Y(3)} x2={X(1)} y2={Y(3 + 2 * k2)} stroke={AM} strokeWidth={3.5} opacity={oF} />);
      html.push(<Lbl key="s2l" x={X(1) + 20} y={Y(4)} tex="2" size={32} color={AM} o={oF * k2} anchor="l" glow={bump(t, T.gerade + 1.7, 0.9)} />);
    }
    // Waagrechte: genau ein Schnittpunkt
    const k = ease(t, T.trifft + 0.05, 2.1);
    const wo = (k > 0 ? 1 : 0) * hide(t, T.umkehrbar + 0.9, 0.4) * oF;
    if (wo > 0.01) {
      const y = lerp(-0.8, 9.2, k);
      const xh = fInv(y);
      if (Math.abs(f(xh) - y) > 1e-9) throw new Error('Waagrechte trifft f nicht');
      svg.push(<line key="sw" x1={0} y1={Y(y)} x2={1080} y2={Y(y)} stroke={C.txt} strokeWidth={2.5} opacity={wo * 0.7} />);
      svg.push(<circle key="swd" cx={X(xh)} cy={Y(y)} r={11} fill={OK} opacity={wo} style={{filter: `drop-shadow(0 0 10px ${OK})`}} />);
    }
    html.push(<Word key="ein" x={X(-0.3)} y={Y(6.4) + 46} text="jeder Wert genau einmal" color={OK} size={26} o={oF * show(t, T.umkehrbar, 0.4)} anchor="r" />);
  }

  return (
    <div style={{position: 'absolute', inset: 0, opacity: kIn * out}}>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <clipPath id="vkClip">
            <rect x={0} y={CLIP_TOP} width={1080} height={CLIP_BOT - CLIP_TOP} />
          </clipPath>
        </defs>
        <g clipPath="url(#vkClip)">{svg}</g>
      </svg>
      {html}
    </div>
  );
};

type Fx = (v: number) => number;

const tag = (html: React.ReactNode[], x: number, y: number, text: string, o: number) => html.push(<Word key={`tag${text}${Math.round(x)}${Math.round(y)}`} x={x} y={y} text={text} color={CO} o={o} size={28} anchor="l" />);

// zwei Eingaben, Lote zur Kurve, gemeinsame Waagrechte auf denselben Wert
const pair = (t: number, svg: React.ReactNode[], html: React.ReactNode[], X: Fx, Y: Fx, xs: number[], fn: (x: number) => number, at: number, hit: number, O: number) => {
  const y = fn(xs[0]);
  if (fn(xs[1]) !== y) throw new Error('Paar landet nicht auf demselben Wert');
  const o = show(t, at, 0.3) * O;
  if (o <= 0.01) return;
  xs.forEach((x0, i) => {
    const v = easeOutExpo(clamp((t - at - 0.2 - 0.15 * i) / 0.6));
    svg.push(<circle key={`pd${x0}`} cx={X(x0)} cy={Y(0)} r={9} fill={C.txt} opacity={o} />);
    if (v > 0) svg.push(<line key={`pv${x0}`} x1={X(x0)} y1={Y(0)} x2={X(x0)} y2={lerp(Y(0), Y(y), v)} stroke={C.txt} strokeWidth={2.5} strokeDasharray="7 7" opacity={o * 0.8} />);
    if (v > 0.9) svg.push(<circle key={`pc${x0}`} cx={X(x0)} cy={Y(y)} r={10} fill={CO} opacity={o} style={{filter: `drop-shadow(0 0 8px ${CO})`}} />);
  });
  const k = easeOutExpo(clamp((t - hit) / 0.6));
  if (k > 0) {
    const xa = Math.min(X(0), X(xs[0]));
    const xb = Math.max(X(0), X(xs[1]));
    svg.push(<line key={`ph${xs[0]}`} x1={xa} y1={Y(y)} x2={lerp(xa, xb, k)} y2={Y(y)} stroke={CO} strokeWidth={2.5} strokeDasharray="10 8" opacity={o * 0.9} />);
    html.push(<Lbl key={`pw${xs[0]}`} x={X(0) - 14} y={Y(y) - 18} tex={num(y)} size={28} color={CO} o={o * k} anchor="r" glow={bump(t, hit + 0.1, 0.9)} />);
  }
};

// nie erreichter Bereich unterhalb des kleinsten Werts
const floor = (t: number, svg: React.ReactNode[], html: React.ReactNode[], X: Fx, Y: Fx, low: number, at: number, O: number, text: string) => {
  const k = easeInOutCubic(clamp((t - at) / 0.8));
  const o = (k > 0 ? 1 : 0) * O;
  if (o <= 0.01) return;
  svg.push(<rect key={`fl${text}`} x={0} y={Y(low)} width={1080} height={Math.max(0, (CLIP_BOT - Y(low)) * k)} fill={rgba(CO, 0.1)} opacity={o} />);
  svg.push(<line key={`fll${text}`} x1={0} y1={Y(low)} x2={1080 * k} y2={Y(low)} stroke={CO} strokeWidth={2.5} strokeDasharray="12 9" opacity={o} />);
  html.push(<Word key={`flw${text}`} x={X(0) + 26} y={Y(low) + 30} text={text} color={CO} o={o * k} size={26} anchor="l" />);
};
