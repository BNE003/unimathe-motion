// Die eine Bühne des Videos: Koordinatensystem mit der Parabel f(x) = x² − 2x − 3, gleiche Einheit auf beiden Achsen.
// Teil a: Bild von [−1, 3] (Punkt läuft den Bogen ab, Spur auf der y-Achse).
// Teil b: Urbild von [0, 5] (Waagrechte bei 0 und 5, Bögen fallen als Projektion auf die x-Achse, Abstände von x = 1).
// Teil c: Bildmenge (Grenze −4, Kamera zoomt hinaus, die Arme steigen weiter).
import React from 'react';
import {C} from '../theme';
import {F} from '../fonts';
import {bump, clamp, easeInOutCubic, easeOutExpo, lerp} from '../math';
import {Tex, useSec} from '../ui';
import {glowShadow, hide, rgba, show} from './kit';
import {AM, CO, CY, OK, ease} from './common';
import {A_INT, B_INT, D_IN, D_OUT, f, IMG_A, num, PRE_B, S} from './fn';
import {T} from './timeline';

const CURVE = '#D9DBF7';
const CLIP_TOP = 772; // unter der Rechenleiste
const CLIP_BOT = 1440;

// Kamera: x = 1 bleibt mittig, der Scheitel bleibt auf seiner Höhe. Teil a zoomt auf [−4, 0] hinein,
// Teil b braucht wieder Platz bis 5, Teil c zoomt hinaus.
const zoomK = (t: number) => ease(t, T.arme + 0.1, 1.6);
export const cam = (t: number) => {
  let u = 66;
  u = lerp(u, 88, ease(t, T.teilA + 0.2, 1.0));
  u = lerp(u, 66, ease(t, T.teilB + 0.1, 1.0));
  u = lerp(u, 38, zoomK(t));
  return {u, ox: 540 - u, oy: 1390 - 4 * u};
};
const yMax = (t: number) => {
  const c = cam(t);
  return (c.oy - (CLIP_TOP + 8)) / c.u;
};

// Bühne dimmt nur für die Zusammenfassung
const stageO = (t: number) => 1 - 0.88 * ease(t, T.sum - 0.1, 0.5);

type Pt = [number, number];

const Lbl: React.FC<{x: number; y: number; tex: string; size: number; o: number; color?: string; glow?: number; anchor?: 'c' | 'l' | 'r'}> = ({x, y, tex, size, o, color = C.txt, glow = 0, anchor = 'c'}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${anchor === 'c' ? '-50%' : anchor === 'r' ? '-100%' : '0'}, -50%)`, opacity: o, whiteSpace: 'nowrap', textShadow: glowShadow(glow, color)}}>
      <Tex tex={tex} size={size} style={{color}} />
    </div>
  );

const Word: React.FC<{x: number; y: number; text: string; color: string; o: number; size?: number; anchor?: 'c' | 'l' | 'r'}> = ({x, y, text, color, o, size = 24, anchor = 'c'}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${anchor === 'c' ? '-50%' : anchor === 'r' ? '-100%' : '0'}, -50%)`, opacity: o, fontFamily: F.display, fontWeight: 700, fontSize: size, color, whiteSpace: 'nowrap', textShadow: glowShadow(0, color)}}>
      {text}
    </div>
  );

const head = (x: number, y: number, dx: number, dy: number, s = 13) => {
  const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l;
  const uy = dy / l;
  return `${x},${y} ${x - ux * s - uy * s * 0.55},${y - uy * s + ux * s * 0.55} ${x - ux * s + uy * s * 0.55},${y - uy * s - ux * s * 0.55}`;
};

export const Stage: React.FC = () => {
  const t = useSec();
  const c = cam(t);
  const X = (x: number) => c.ox + c.u * x;
  const Y = (y: number) => c.oy - c.u * y;
  const P = (pts: Pt[]) => pts.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(' ');
  const arc = (x0: number, x1: number, step = 0.02): Pt[] => {
    const pts: Pt[] = [];
    for (let x = x0; x < x1; x += step) pts.push([x, f(x)]);
    pts.push([x1, f(x1)]);
    return pts;
  };
  const svg: React.ReactNode[] = [];
  const html: React.ReactNode[] = [];
  const zk = zoomK(t);

  /* ---------- Koordinatensystem ---------- */
  const gIn = show(t, -0.4, 0.6);
  for (let i = -16; i <= 16; i++) {
    const x = X(i);
    if (x < -5 || x > 1085) continue;
    svg.push(<line key={`gx${i}`} x1={x} y1={CLIP_TOP} x2={x} y2={CLIP_BOT} stroke="rgba(243,244,251,.07)" strokeWidth={1.5} />);
  }
  for (let j = -8; j <= 22; j++) {
    const y = Y(j);
    if (y < CLIP_TOP || y > CLIP_BOT) continue;
    svg.push(<line key={`gy${j}`} x1={0} y1={y} x2={1080} y2={y} stroke="rgba(243,244,251,.07)" strokeWidth={1.5} />);
  }
  svg.push(<line key="ax" x1={0} y1={Y(0)} x2={1080} y2={Y(0)} stroke="rgba(243,244,251,.45)" strokeWidth={2} />);
  svg.push(<line key="ay" x1={X(0)} y1={CLIP_TOP} x2={X(0)} y2={CLIP_BOT} stroke="rgba(243,244,251,.45)" strokeWidth={2} />);
  html.push(<Lbl key="xa" x={1046} y={Y(0) - 24} tex="x" size={30} color={C.txt2} o={gIn} />);
  html.push(<Lbl key="ya" x={X(0) + 24} y={CLIP_TOP + 24} tex="y" size={30} color={C.txt2} o={gIn} />);

  // Zahlen an den Achsen. In Teil b sind −2, −1, 3, 4 verborgen: Diese Grenzen sollen aus der Rechnung kommen.
  const hideB = show(t, T.diesmal - 0.2, 0.4) * hide(t, T.teilC, 0.4);
  const amberX = (i: number) => (i === A_INT[0] || i === A_INT[1] ? show(t, T.bildVon + 0.3, 0.4) * hide(t, T.teilB, 0.4) : 0);
  for (let i = -3; i <= 5; i++) {
    if (i === 0) continue;
    svg.push(<line key={`tx${i}`} x1={X(i)} y1={Y(0) - 7} x2={X(i)} y2={Y(0) + 7} stroke="rgba(243,244,251,.55)" strokeWidth={2} />);
    const hb = [-2, -1, 3, 4].includes(i) ? hideB : 0;
    const a = amberX(i);
    html.push(<Lbl key={`lx${i}`} x={X(i)} y={Y(0) + 28} tex={num(i)} size={26} color={a > 0.02 ? AM : C.txt2} glow={a * bump(t, T.bildVon + 0.4, 1.0)} o={gIn * (1 - hb)} />);
  }
  const cyanY = (j: number) => {
    let v = 0;
    if (j === IMG_A[0]) v = Math.max(v, show(t, T.bildA, 0.4) * hide(t, T.teilB, 0.4), show(t, T.mind + 0.3, 0.4) * hide(t, T.sum, 0.4));
    if (j === B_INT[1]) v = Math.max(v, show(t, T.urbildVon + 0.4, 0.4) * hide(t, T.teilC, 0.4));
    return v;
  };
  for (let j = -4; j <= 12; j++) {
    if (j === 0) continue;
    const base = j <= 5 ? (j === -4 ? 1 : 1 - zk) : 0;
    const extra = j === 4 || j === 8 || j === 12 ? zk : 0;
    const o = Math.max(base, extra) * gIn;
    if (o <= 0.01) continue;
    const y = Y(j);
    if (y < CLIP_TOP + 18 || y > CLIP_BOT) continue;
    svg.push(<line key={`ty${j}`} x1={X(0) - 7} y1={y} x2={X(0) + 7} y2={y} stroke="rgba(243,244,251,.55)" strokeWidth={2} opacity={o} />);
    const cy = cyanY(j);
    html.push(<Lbl key={`ly${j}`} x={X(0) - 16} y={y} tex={num(j)} size={26} color={cy > 0.02 ? CY : C.txt2} o={o} anchor="r" glow={cy * 0.6} />);
  }

  /* ---------- Parabel ---------- */
  {
    const r = Math.sqrt(yMax(t) + 4);
    const p = easeInOutCubic(clamp((t + 0.9) / 2.1));
    const x0 = S.x - r;
    const x1 = lerp(x0, S.x + r, p);
    if (x1 > x0) {
      const g = bump(t, T.gegeben + 0.1, 1.4);
      svg.push(<polyline key="par" points={P(arc(x0, x1))} fill="none" stroke={CURVE} strokeWidth={4.5 + 2 * g} strokeLinecap="round" strokeLinejoin="round" style={{filter: `drop-shadow(0 0 ${8 + 14 * g}px rgba(217,219,247,.6))`}} />);
    }
    // Pfeilspitzen an den Armen in Teil c
    const ah = show(t, T.arme + 1.2, 0.4) * hide(t, T.sum, 0.4);
    if (ah > 0.01)
      [-1, 1].forEach((s) => {
        const x = S.x + s * r;
        // Richtung der Tangente nach außen: (s, f'(x)·s) mit f'(x) = 2(x − 1); im Bild zeigt y nach unten
        svg.push(<polygon key={`ah${s}`} points={head(X(x), Y(f(x)), s, -2 * (x - 1) * s, 18)} fill={CURVE} opacity={ah} />);
      });
  }

  /* ---------- Scheitel ---------- */
  {
    const o = show(t, T.scheitel, 0.4);
    const k1 = easeOutExpo(clamp((t - T.sEins) / 0.6));
    const k2 = easeOutExpo(clamp((t - T.sMinus4) / 0.6));
    const lo = hide(t, T.teilA + 0.2, 0.5);
    if (k1 > 0 && lo > 0.01) svg.push(<line key="s1" x1={X(S.x)} y1={Y(0)} x2={X(S.x)} y2={lerp(Y(0), Y(S.y), k1)} stroke={AM} strokeWidth={3} strokeDasharray="8 8" opacity={lo} />);
    if (k2 > 0 && lo > 0.01) svg.push(<line key="s2" x1={X(0)} y1={Y(S.y)} x2={lerp(X(0), X(S.x), k2)} y2={Y(S.y)} stroke={CY} strokeWidth={3} strokeDasharray="8 8" opacity={lo} />);
    if (o > 0.01) {
      const g = bump(t, T.scheitel + 0.05, 1.0) + bump(t, T.dazwischen + 0.1, 1.2) + bump(t, T.nieNeg + 0.6, 1.2);
      svg.push(<circle key="S" cx={X(S.x)} cy={Y(S.y)} r={10 + 3 * g} fill={CURVE} opacity={o} style={{filter: `drop-shadow(0 0 ${8 + 14 * g}px ${CURVE})`}} />);
      html.push(<Lbl key="Sl" x={X(S.x) + 22} y={Y(S.y) + 2} tex={`S(${num(S.x)}\\,|\\,${num(S.y)})`} size={30} color={CURVE} o={o * hide(t, T.punkt, 0.3) + o * show(t, T.bildA + 0.3, 0.4) * hide(t, T.arme, 0.4)} anchor="l" glow={g * 0.6} />);
    }
  }

  partA(t, svg, html, X, Y, P, arc);
  partB(t, svg, html, X, Y, P, arc);
  partC(t, svg, html, X, Y, c.u);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: stageO(t) * gIn}}>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <clipPath id="stageClip">
            <rect x={0} y={CLIP_TOP} width={1080} height={CLIP_BOT - CLIP_TOP} />
          </clipPath>
        </defs>
        <g clipPath="url(#stageClip)">{svg}</g>
      </svg>
      {html}
    </div>
  );
};

type Fx = (v: number) => number;

/* ---------- Teil a: Bild von [−1, 3] ---------- */

// Lage des laufenden Punkts: erst bis zum Scheitel, dann zurück nach oben
export const sweepX = (t: number) => {
  if (t < T.zurueck) return lerp(A_INT[0], S.x, easeInOutCubic(clamp((t - T.punkt - 0.45) / (T.hinunter + 1.2 - T.punkt - 0.45))));
  return lerp(S.x, A_INT[1], easeInOutCubic(clamp((t - T.zurueck + 0.05) / (T.zurueckEnd + 0.4 - T.zurueck + 0.05))));
};

const partA = (t: number, svg: React.ReactNode[], html: React.ReactNode[], X: Fx, Y: Fx, P: (p: Pt[]) => string, arc: (a: number, b: number) => Pt[]) => {
  const out = hide(t, T.teilB, 0.5);
  if (t < T.bildVon || out <= 0.01) return;
  // Intervall auf der x-Achse
  {
    const k = easeOutExpo(clamp((t - T.bildVon - 0.3) / 0.8));
    const g = bump(t, T.beimBild + 0.1, 1.2);
    svg.push(<rect key="aBand" x={X(A_INT[0])} y={Y(0) - 6} width={(X(A_INT[1]) - X(A_INT[0])) * k} height={12} rx={6} fill={AM} opacity={out * (0.75 + 0.25 * g)} style={{filter: `drop-shadow(0 0 ${8 + 12 * g}px ${AM})`}} />);
  }
  // Randwerte: f(−1) = 0 und f(3) = 0 landen beide auf der 0
  const ends: [number, number, number][] = [
    [A_INT[0], T.linksNull, -9],
    [A_INT[1], T.rechtsNull, 9],
  ];
  ends.forEach(([x0, at, dy], i) => {
    const o = show(t, at, 0.35) * hide(t, T.punkt + 0.1, 0.4) * out;
    if (o <= 0.01) return;
    if (f(x0) !== 0) throw new Error('Randwert nicht 0');
    const k = easeOutExpo(clamp((t - at - 0.15) / 0.6));
    svg.push(<circle key={`e${i}`} cx={X(x0)} cy={Y(f(x0))} r={10} fill={CURVE} opacity={o} style={{filter: `drop-shadow(0 0 10px ${CURVE})`}} />);
    const xe = lerp(X(x0), X(0) - Math.sign(x0) * 12, k);
    svg.push(<line key={`el${i}`} x1={X(x0)} y1={Y(0) + dy} x2={xe} y2={Y(0) + dy} stroke={CY} strokeWidth={3} opacity={o} />);
    if (k > 0.85) svg.push(<polygon key={`eh${i}`} points={head(X(0) - Math.sign(x0) * 12, Y(0) + dy, -Math.sign(x0), 0)} fill={CY} opacity={o} />);
  });
  // Treffer auf der y-Achse: nur die 0
  {
    const o = show(t, T.linksNull + 0.4, 0.3) * hide(t, T.punkt + 0.1, 0.4) * out;
    if (o > 0.01) {
      const g = bump(t, T.rechtsNull + 0.5, 0.8) + bump(t, T.raender + 0.2, 1.2);
      svg.push(<circle key="y0" cx={X(0)} cy={Y(0)} r={10 + 2 * g} fill={CY} opacity={o} style={{filter: `drop-shadow(0 0 ${8 + 12 * g}px ${CY})`}} />);
      html.push(<Lbl key="y0l" x={X(0) - 16} y={Y(0) - 22} tex="0" size={28} color={CY} o={o} anchor="r" glow={g} />);
      const r = show(t, T.raender + 0.3, 0.3) * hide(t, T.dazwischen + 0.6, 0.4);
      if (r > 0.01) svg.push(<circle key="y0r" cx={X(0)} cy={Y(0)} r={24} fill="none" stroke={CO} strokeWidth={3} strokeDasharray="7 6" opacity={o * r} />);
      html.push(<Word key="nur0" x={X(0) - 34} y={Y(0) - 58} text="nur die 0?" color={CO} o={o * r} anchor="r" size={28} />);
    }
  }
  // Scheitel dazwischen: f(1) = −4
  {
    const o = show(t, T.dazwischen + 0.5, 0.4) * hide(t, T.punkt + 0.1, 0.4) * out;
    if (o > 0.01) {
      svg.push(<line key="dz1" x1={X(S.x)} y1={Y(0)} x2={X(S.x)} y2={Y(S.y)} stroke={AM} strokeWidth={3} strokeDasharray="8 8" opacity={o} />);
      svg.push(<line key="dz2" x1={X(S.x)} y1={Y(S.y)} x2={X(0)} y2={Y(S.y)} stroke={CY} strokeWidth={3} strokeDasharray="8 8" opacity={o} />);
      svg.push(<circle key="dz3" cx={X(0)} cy={Y(S.y)} r={9} fill={CY} opacity={o} />);
    }
  }
  // Der Punkt läuft den Bogen ab
  {
    const on = show(t, T.punkt + 0.2, 0.3);
    const dotO = on * hide(t, T.bildA + 0.4, 0.4) * out;
    const x = sweepX(t);
    const y = f(x);
    const low = x <= S.x ? y : S.y; // tiefster bisher erreichter Wert
    if (on > 0.01) {
      // durchlaufener Bogen
      if (x > A_INT[0] + 0.01) svg.push(<polyline key="trail" points={P(arc(A_INT[0], x))} fill="none" stroke={CURVE} strokeWidth={8} strokeLinecap="round" opacity={0.55 * out * on} style={{filter: `drop-shadow(0 0 10px ${CURVE})`}} />);
      // Spur der Werte auf der y-Achse
      const g = bump(t, T.bildAWert + 0.05, 1.2);
      svg.push(<rect key="trace" x={X(0) - 6} y={Y(0)} width={12} height={Math.max(0, Y(low) - Y(0))} rx={6} fill={CY} opacity={out * on * (0.8 + 0.2 * g)} style={{filter: `drop-shadow(0 0 ${8 + 14 * g}px ${CY})`}} />);
      if (dotO > 0.01) {
        svg.push(<line key="sv" x1={X(x)} y1={Y(0)} x2={X(x)} y2={Y(y)} stroke={AM} strokeWidth={3} strokeDasharray="7 7" opacity={dotO} />);
        svg.push(<line key="sh" x1={X(x)} y1={Y(y)} x2={X(0)} y2={Y(y)} stroke={CY} strokeWidth={3} strokeDasharray="7 7" opacity={dotO} />);
        svg.push(<circle key="sa" cx={X(x)} cy={Y(0)} r={10} fill={AM} opacity={dotO} style={{filter: `drop-shadow(0 0 10px ${AM})`}} />);
        svg.push(<circle key="sc" cx={X(x)} cy={Y(y)} r={11} fill={CURVE} opacity={dotO} style={{filter: `drop-shadow(0 0 12px ${CURVE})`}} />);
        svg.push(<circle key="sy" cx={X(0)} cy={Y(y)} r={11} fill={CY} opacity={dotO} style={{filter: `drop-shadow(0 0 12px ${CY})`}} />);
      }
    }
  }
};

/* ---------- Teil b: Urbild von [0, 5] ---------- */

const partB = (t: number, svg: React.ReactNode[], html: React.ReactNode[], X: Fx, Y: Fx, P: (p: Pt[]) => string, arc: (a: number, b: number) => Pt[]) => {
  const out = hide(t, T.teilC, 0.5);
  if (t < T.urbildVon || out <= 0.01) return;
  const [y0, y1] = B_INT;
  // Intervall [0, 5] auf der y-Achse
  {
    const k = easeOutExpo(clamp((t - T.urbildVon - 0.6) / 0.9));
    const g = bump(t, T.oben + 0.05, 1.3) + bump(t, T.diesmal + 0.1, 1.0) * 0.6;
    svg.push(<rect key="bBand" x={X(0) - 6} y={lerp(Y(y0), Y(y1), k)} width={12} height={(Y(y0) - Y(y1)) * k} rx={6} fill={CY} opacity={out * (0.8 + 0.2 * g)} style={{filter: `drop-shadow(0 0 ${8 + 16 * g}px ${CY})`}} />);
    html.push(<Lbl key="b0" x={X(0) - 16} y={Y(0) - 22} tex="0" size={28} color={CY} o={out * show(t, T.urbildVon + 0.6, 0.4)} anchor="r" />);
  }
  // Waagrechte bei 0 und 5, Streifen dazwischen
  {
    const k = easeInOutCubic(clamp((t - T.alleX - 0.5) / 1.0));
    if (k > 0) {
      const half = 560 * k;
      svg.push(<rect key="strip" x={X(0) - half} y={Y(y1)} width={2 * half} height={Y(y0) - Y(y1)} fill={rgba(CY, 0.07)} opacity={out} />);
      [y0, y1].forEach((yy) => svg.push(<line key={`hl${yy}`} x1={X(0) - half} y1={Y(yy)} x2={X(0) + half} y2={Y(yy)} stroke={CY} strokeWidth={2.5} strokeDasharray="12 9" opacity={out * 0.85} />));
    }
  }
  // Start bei den Werten: waagrechte Pfeile vom Band zur Kurve
  {
    const o = show(t, T.diesmal + 0.15, 0.3) * hide(t, T.plus4, 0.5) * out;
    if (o > 0.01)
      [1.5, 3.5].forEach((yy, i) => {
        const k = easeOutExpo(clamp((t - T.diesmal - 0.2 - 0.15 * i) / 0.7));
        const r = Math.sqrt(yy + 4);
        [-1, 1].forEach((s) => {
          const xe = X(S.x + s * r) - s * 12;
          const xs = X(0) + (s > 0 ? 10 : -10);
          const xx = lerp(xs, xe, k);
          svg.push(<line key={`ha${i}${s}`} x1={xs} y1={Y(yy)} x2={xx} y2={Y(yy)} stroke={CY} strokeWidth={3} opacity={o} />);
          if (k > 0.85) svg.push(<polygon key={`hh${i}${s}`} points={head(xe, Y(yy), s, 0)} fill={CY} opacity={o} />);
        });
      });
  }
  // Bögen im Streifen leuchten, Lote fallen zur x-Achse
  const arcsO = show(t, T.diesmal + 0.75, 0.4) * out;
  if (arcsO > 0.01) {
    const g = bump(t, T.diesmal + 0.8, 1.2) + bump(t, T.unten + 0.05, 1.3);
    PRE_B.forEach(([a, b], i) => svg.push(<polyline key={`arc${i}`} points={P(arc(a, b))} fill="none" stroke={AM} strokeWidth={8 + 3 * g} strokeLinecap="round" opacity={arcsO * 0.95} style={{filter: `drop-shadow(0 0 ${10 + 14 * g}px ${AM})`}} />));
    const dk = easeOutExpo(clamp((t - T.diesmal - 1.15) / 0.6));
    PRE_B.flat().forEach((x0, i) => {
      if (dk > 0) svg.push(<line key={`dr${i}`} x1={X(x0)} y1={Y(f(x0))} x2={X(x0)} y2={lerp(Y(f(x0)), Y(0), dk)} stroke={AM} strokeWidth={2.5} strokeDasharray="7 7" opacity={arcsO * 0.85} />);
    });
  }
  // Abstände von x = 1: mindestens 2, höchstens 3
  {
    const axO = show(t, T.abstand + 0.1, 0.4) * out;
    if (axO > 0.01) svg.push(<line key="symm" x1={X(S.x)} y1={Y(S.y - 0.3)} x2={X(S.x)} y2={Y(5.6)} stroke={AM} strokeWidth={2.5} strokeDasharray="6 9" opacity={axO * 0.7} />);
    const lanes: [number, number, number][] = [
      [D_IN, Y(0) + 46, T.zweiDrei],
      [D_OUT, Y(0) + 86, T.zweiDrei + 0.45],
    ];
    lanes.forEach(([d, ly, at], i) => {
      const o = show(t, at, 0.3) * out;
      if (o <= 0.01) return;
      const k = easeOutExpo(clamp((t - at) / 0.7));
      [-1, 1].forEach((s) => {
        const xe = X(S.x + s * d * k);
        svg.push(<line key={`ln${i}${s}`} x1={X(S.x)} y1={ly} x2={xe} y2={ly} stroke={C.txt} strokeWidth={3} opacity={o * 0.85} />);
        if (k > 0.85) svg.push(<polygon key={`lh${i}${s}`} points={head(xe, ly, s, 0, 11)} fill={C.txt} opacity={o} />);
        html.push(<Lbl key={`ll${i}${s}`} x={X(S.x + (s * d) / 2)} y={ly - 17} tex={num(d)} size={26} color={C.txt} o={o * show(t, at + 0.35, 0.3)} />);
      });
      svg.push(<circle key={`lc${i}`} cx={X(S.x)} cy={ly} r={5} fill={C.txt} opacity={o} />);
    });
    // zu nah (koralle zwischen −1 und 3) und zu weit (außerhalb von −2 und 4)
    const cz = show(t, T.vonEins, 0.4) * out;
    if (cz > 0.01) {
      svg.push(<rect key="near" x={X(S.x - D_IN)} y={Y(0) - 4} width={X(S.x + D_IN) - X(S.x - D_IN)} height={8} rx={4} fill={CO} opacity={cz * 0.7} />);
      svg.push(<rect key="farL" x={0} y={Y(0) - 4} width={X(S.x - D_OUT)} height={8} fill={CO} opacity={cz * 0.7} />);
      svg.push(<rect key="farR" x={X(S.x + D_OUT)} y={Y(0) - 4} width={1080 - X(S.x + D_OUT)} height={8} fill={CO} opacity={cz * 0.7} />);
      html.push(<Word key="zn" x={X(S.x)} y={Y(0) - 26} text="zu nah" color={CO} o={cz} />);
      html.push(<Word key="zwL" x={X(S.x - D_OUT) - 70} y={Y(0) - 26} text="zu weit" color={CO} o={cz} />);
      html.push(<Word key="zwR" x={X(S.x + D_OUT) + 70} y={Y(0) - 26} text="zu weit" color={CO} o={cz} />);
    }
  }
  // Grenzen: 1 − 3, 1 − 2 | 1 + 2, 1 + 3, darunter die Zahlen; die Bögen fallen auf die x-Achse
  const sides: [number, number, number, string, string][] = [
    [0, PRE_B[0][0], T.linksB + 0.15, '1-3', num(PRE_B[0][0])],
    [0, PRE_B[0][1], T.linksB + 0.45, '1-2', num(PRE_B[0][1])],
    [1, PRE_B[1][0], T.rechtsB + 0.1, '1+2', num(PRE_B[1][0])],
    [1, PRE_B[1][1], T.rechtsB + 0.4, '1+3', num(PRE_B[1][1])],
  ];
  if (S.x - D_OUT !== PRE_B[0][0] || S.x - D_IN !== PRE_B[0][1] || S.x + D_IN !== PRE_B[1][0] || S.x + D_OUT !== PRE_B[1][1]) throw new Error('Grenzen passen nicht zu den Abständen');
  sides.forEach(([side, x0, at, calc, res], i) => {
    // Rechnung nach außen versetzt, damit sich die beiden Grenzen einer Seite nicht überdecken
    const outer = i === 0 || i === 3;
    const cAnchor: 'l' | 'r' = (side === 0) === outer ? 'r' : 'l';
    const cx = X(x0) + (cAnchor === 'r' ? 14 : -14);
    const q = show(t, T.diesmal + 1.5, 0.4) * out;
    const n = show(t, at, 0.35);
    const ly = Y(0) + 128;
    html.push(<Lbl key={`q${i}`} x={X(x0)} y={ly} tex="?" size={30} color={AM} o={q * (1 - n)} />);
    html.push(<Lbl key={`c${i}`} x={cx} y={ly - 4} tex={calc} size={24} color={C.txt2} o={n * out} anchor={cAnchor} />);
    html.push(<Lbl key={`r${i}`} x={X(x0)} y={ly + 32} tex={res} size={32} color={AM} o={n * out} glow={bump(t, at + 0.05, 0.9) + bump(t, T.unten + 0.05, 1.2)} />);
    // Probe: Punkt auf der passenden Waagrechten
    const pr = show(t, at + 0.15, 0.3) * out;
    svg.push(<circle key={`pr${i}`} cx={X(x0)} cy={Y(f(x0))} r={9} fill={C.txt} opacity={pr} style={{filter: 'drop-shadow(0 0 8px rgba(243,244,251,.9))'}} />);
  });
  // Projektion: Kopie jedes Bogens fällt auf die x-Achse und wird zum amber Stück
  PRE_B.forEach(([a, b], i) => {
    const at = i === 0 ? T.linksB + 0.75 : T.rechtsB + 0.7;
    const k = easeInOutCubic(clamp((t - at) / 0.8));
    if (k <= 0) return;
    const pts: Pt[] = arc(a, b).map(([x, y]) => [x, y * (1 - k)]);
    const g = bump(t, T.unten + 0.05, 1.3);
    svg.push(<polyline key={`pj${i}`} points={P(pts)} fill="none" stroke={AM} strokeWidth={lerp(5, 12, k) + 2 * g} strokeLinecap="round" opacity={out * lerp(0.6, 1, k)} style={{filter: `drop-shadow(0 0 ${10 + 16 * g}px ${AM})`}} />);
  });
};

/* ---------- Teil c: Bildmenge ---------- */

const partC = (t: number, svg: React.ReactNode[], html: React.ReactNode[], X: Fx, Y: Fx, u: number) => {
  const out = hide(t, T.sum, 0.5);
  if (t < T.mind || out <= 0.01) return;
  // Grenze −4, darunter nichts
  {
    const k = easeInOutCubic(clamp((t - T.mind - 0.3) / 0.9));
    const o = out * show(t, T.mind + 0.3, 0.3);
    svg.push(<rect key="below" x={0} y={Y(S.y)} width={1080} height={CLIP_BOT - Y(S.y)} fill={rgba(CO, 0.1)} opacity={o * k} />);
    svg.push(<line key="lim" x1={X(S.x) - 560 * k} y1={Y(S.y)} x2={X(S.x) + 560 * k} y2={Y(S.y)} stroke={CO} strokeWidth={3} strokeDasharray="12 9" opacity={o} style={{filter: `drop-shadow(0 0 6px ${CO})`}} />);
  }
  // Strahl ab −4 auf der y-Achse
  {
    const k = easeOutExpo(clamp((t - T.arme - 0.6) / 1.2));
    if (k > 0) {
      const top = lerp(Y(S.y), CLIP_TOP + 30, k);
      const g = bump(t, T.bildCWert + 0.05, 1.3);
      svg.push(<rect key="ray" x={X(0) - 6} y={top} width={12} height={Y(S.y) - top} rx={6} fill={CY} opacity={out * (0.8 + 0.2 * g)} style={{filter: `drop-shadow(0 0 ${8 + 16 * g}px ${CY})`}} />);
      if (k > 0.8) svg.push(<polygon key="rayh" points={head(X(0), top - 6, 0, -1, 18)} fill={CY} opacity={out} />);
    }
  }
  // Waagrechte steigt ab −4 und trifft beide Arme: x = 1 ± √(y + 4)
  {
    const k = easeInOutCubic(clamp((t - T.arme - 0.8) / 1.9));
    const o = (k > 0 ? 1 : 0) * hide(t, T.bildC + 0.4, 0.4) * out;
    if (o > 0.01) {
      const yy = lerp(S.y, 11, k);
      const r = Math.sqrt(yy + 4);
      if (Math.abs(f(S.x + r) - yy) > 1e-9) throw new Error('Waagrechte trifft die Kurve nicht');
      svg.push(<line key="sw" x1={0} y1={Y(yy)} x2={1080} y2={Y(yy)} stroke={CY} strokeWidth={2.5} opacity={o * 0.75} />);
      [-1, 1].forEach((s) => svg.push(<circle key={`sw${s}`} cx={X(S.x + s * r)} cy={Y(yy)} r={10} fill={OK} opacity={o} style={{filter: `drop-shadow(0 0 10px ${OK})`}} />));
    }
  }
  html.push(<Lbl key="inf" x={X(0) - 20} y={CLIP_TOP + 56} tex={'\\infty'} size={36} color={CY} o={out * show(t, T.bildCWert + 0.2, 0.4)} anchor="r" />);
  void u;
};
