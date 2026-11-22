// Pfeildiagramm: Definitionsmenge links, Zielmenge rechts. Die Zuordnung ist ein Zustand; wechselt ein Ziel,
// schwenkt der Pfeil im Bogen dorthin. Injektiv/surjektiv werden aus der Zuordnung berechnet (und geprüft).
// Am Ende werden die Mengen zu den Achsen-Bändern des Graphen.
import React from 'react';
import {C} from '../theme';
import {bump, clamp, easeInOutCubic, easeOutExpo, lerp} from '../math';
import {Tex, useSec} from '../ui';
import {F} from '../fonts';
import {glowShadow, mix, rgba, shadow} from './kit';
import {AM, CO, CY, FullSvg, OK} from './common';
import {T} from './timeline';
import {BAND, OX, OY, U, XR, YB, YT} from './geo';

export const ARROW = '#C9CCF0';
const LX = 250;
const RX = 830;
const CYD = 1000;
const GAPN = 145;
const NR = 42;
const RIGHT = ['A', 'B', 'C', 'D'];

type DState = {at: number; dur: number; left: string[]; map: Record<string, string>; stagger?: number; drawDelay?: number; expect: [boolean, boolean]};
export const STATES: DState[] = [
  {at: 0.1, dur: 0.5, stagger: 0.14, left: ['1', '2', '3'], map: {1: 'A', 2: 'B', 3: 'D'}, expect: [true, false]},
  {at: 1.0, dur: 0.55, left: ['1', '2', '3'], map: {1: 'A', 2: 'C', 3: 'D'}, expect: [true, false]},
  {at: 1.8, dur: 0.55, left: ['1', '2', '3'], map: {1: 'A', 2: 'C', 3: 'C'}, expect: [false, false]},
  {at: T.injDef + 0.15, dur: 0.7, left: ['1', '2', '3'], map: {1: 'A', 2: 'C', 3: 'D'}, expect: [true, false]},
  {at: T.auf + 0.1, dur: 0.7, left: ['1', '2', '3'], map: {1: 'A', 2: 'C', 3: 'C'}, expect: [false, false]},
  {at: T.neue + 0.25, dur: 0.9, drawDelay: 0.55, left: ['1', '2', '3', '4', '5'], map: {1: 'A', 2: 'C', 3: 'C', 4: 'B', 5: 'D'}, expect: [false, true]},
  {at: T.bijDef + 0.55, dur: 0.9, left: ['1', '2', '4', '5'], map: {1: 'A', 2: 'C', 4: 'B', 5: 'D'}, expect: [true, true]},
];

export const isInjective = (map: Record<string, string>) => {
  const v = Object.values(map);
  return new Set(v).size === v.length;
};
export const isSurjective = (map: Record<string, string>) => RIGHT.every((r) => Object.values(map).includes(r));
// Mathe-Prüfung: jeder Zustand hat die im Storyboard behauptete Eigenschaft
STATES.forEach((s, i) => {
  if (isInjective(s.map) !== s.expect[0] || isSurjective(s.map) !== s.expect[1]) throw new Error(`Zustand ${i}: Eigenschaften stimmen nicht`);
  if (s.left.some((l) => !s.map[l]) || Object.keys(s.map).some((l) => !s.left.includes(l))) throw new Error(`Zustand ${i}: keine Abbildung`);
});
// Umkehrung der Bijektion
{
  const m = STATES[STATES.length - 1].map;
  const inv = Object.fromEntries(Object.entries(m).map(([a, b]) => [b, a]));
  if (Object.keys(inv).length !== RIGHT.length || Object.entries(m).some(([a, b]) => inv[b] !== a)) throw new Error('Umkehrung falsch');
}

const settledIndex = (t: number) => {
  let k = 0;
  STATES.forEach((s, i) => {
    if (t >= s.at + s.dur * 0.6) k = i;
  });
  return k;
};
export const settledMap = (t: number) => STATES[settledIndex(t)].map;

const stateIndex = (t: number) => {
  let k = 0;
  STATES.forEach((s, i) => {
    if (t >= s.at) k = i;
  });
  return k;
};
const leftY = (s: DState, id: string) => {
  const i = s.left.indexOf(id);
  return i < 0 ? null : CYD + (i - (s.left.length - 1) / 2) * GAPN;
};
const rightY = (id: string) => CYD + (RIGHT.indexOf(id) - 1.5) * GAPN;
export const rightPos = (id: string): [number, number] => [RX, rightY(id)];

export const graphK = (t: number) => easeInOutCubic(clamp((t - T.toGraph) / 1.5));
const revK = (t: number) => easeInOutCubic(clamp((t - (T.umdrehen + 0.95)) / 1.1));

const Head: React.FC<{x: number; y: number; dx: number; dy: number; color: string; o: number; s?: number}> = ({x, y, dx, dy, color, o, s = 17}) => {
  if (o <= 0.01) return null;
  const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l;
  const uy = dy / l;
  const p = `${x},${y} ${x - ux * s - uy * s * 0.55},${y - uy * s + ux * s * 0.55} ${x - ux * s + uy * s * 0.55},${y - uy * s - ux * s * 0.55}`;
  return <polygon points={p} fill={color} opacity={o} style={{filter: `drop-shadow(0 0 5px ${color})`}} />;
};

const Lbl: React.FC<{x: number; y: number; tex: string; size: number; o: number; color?: string; glow?: number}> = ({x, y, tex, size, o, color = C.txt, glow = 0}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', opacity: o, whiteSpace: 'nowrap', textShadow: glowShadow(glow, color)}}>
      <Tex tex={tex} size={size} style={{color}} />
    </div>
  );

// leere Ziele: im Einstieg koralle, bei „darf leer bleiben“ neutral, ab „surjektiv“ koralle
const emptyMode = (t: number): 'bad' | 'none' | 'ok' => (t < 1.7 ? 'none' : t < T.links + 0.4 ? 'bad' : t < T.leer ? 'none' : t < T.surDef + 0.6 ? 'ok' : 'bad');

type Rect = {x0: number; x1: number; y0: number; y1: number; r: number};
const mixR = (a: Rect, b: Rect, k: number): Rect => ({x0: lerp(a.x0, b.x0, k), x1: lerp(a.x1, b.x1, k), y0: lerp(a.y0, b.y0, k), y1: lerp(a.y1, b.y1, k), r: lerp(a.r, b.r, k)});
export const X_BAND: Rect = {x0: OX - XR * U, x1: OX + XR * U, y0: OY - BAND / 2, y1: OY + BAND / 2, r: BAND / 2};
export const Y_BAND: Rect = {x0: OX - BAND / 2, x1: OX + BAND / 2, y0: OY - YT * U, y1: OY - YB * U, r: BAND / 2};

export const Diagram: React.FC = () => {
  const t = useSec();
  const kG = graphK(t);
  if (kG >= 1) return null;
  const fade = 1 - clamp(kG * 1.8);
  const k = stateIndex(t);
  const cur = STATES[k];
  const prev = k > 0 ? STATES[k - 1] : null;
  const e = prev ? easeInOutCubic(clamp((t - cur.at) / cur.dur)) : 1;
  const ids = Array.from(new Set([...(prev?.left ?? []), ...cur.left])).sort();

  // Lage und Sichtbarkeit der linken Elemente
  const left: Record<string, {y: number; o: number}> = {};
  ids.forEach((id) => {
    const py = prev ? leftY(prev, id) : null;
    const cy0 = leftY(cur, id);
    const y = lerp(py ?? cy0!, cy0 ?? py!, e);
    const o = py !== null && cy0 !== null ? 1 : cy0 !== null ? (prev ? clamp(e * 1.6) : easeOutExpo(clamp((t + 0.12) / 0.3))) : 1 - clamp(e * 1.4);
    left[id] = {y, o};
  });

  // Pfeile
  type Arr = {id: string; ys: number; ye: number; xe: number; draw: number; tgt: string};
  const arrows: Arr[] = [];
  ids.forEach((id, i) => {
    const pT = prev?.map[id];
    const cT = cur.map[id];
    let draw = 1;
    if (!pT && cT) draw = prev ? easeOutExpo(clamp((t - cur.at - (cur.drawDelay ?? 0)) / 0.5)) : easeOutExpo(clamp((t - cur.at - (cur.stagger ?? 0) * i) / 0.5));
    else if (pT && !cT) draw = 1 - e;
    let ye: number;
    let xe = RX;
    if (pT && cT && pT !== cT) {
      ye = lerp(rightY(pT), rightY(cT), e);
      xe = RX + 46 * Math.sin(Math.PI * e);
    } else ye = rightY(cT ?? pT!);
    const tgt = pT && cT ? (e > 0.5 ? cT : pT) : (cT ?? pT!);
    arrows.push({id, ys: left[id].y, ye, xe, draw, tgt});
  });
  const hits: Record<string, number> = {};
  arrows.forEach((a) => {
    if (a.draw > 0.6) hits[a.tgt] = (hits[a.tgt] ?? 0) + 1;
  });

  const rk = revK(t);
  const em = emptyMode(t);
  const svg: React.ReactNode[] = [];
  const html: React.ReactNode[] = [];

  // Mengen (werden zu den Achsen-Bändern)
  const ys = Object.values(left).filter((p) => p.o > 0.05).map((p) => p.y);
  const lRect: Rect = {x0: LX - 110, x1: LX + 110, y0: Math.min(...ys) - NR - 34, y1: Math.max(...ys) + NR + 34, r: 48};
  const rRect: Rect = {x0: RX - 110, x1: RX + 110, y0: rightY('A') - NR - 34, y1: rightY('D') + NR + 34, r: 48};
  const setIn = easeOutExpo(clamp((t + 0.12) / 0.35));
  const gL = bump(t, T.links + 0.1, 1.0);
  const gR = bump(t, T.rechts + 0.05, 1.0);
  [
    [mixR(lRect, X_BAND, kG), CY, gL],
    [mixR(rRect, Y_BAND, kG), AM, gR],
  ].forEach(([r, col, g], i) => {
    const R = r as Rect;
    const c = col as string;
    svg.push(
      <rect
        key={`set${i}`}
        x={R.x0}
        y={R.y0}
        width={R.x1 - R.x0}
        height={R.y1 - R.y0}
        rx={R.r}
        fill={rgba(c, lerp(0.06 + 0.06 * (g as number), 0.38, kG))}
        stroke={rgba(c, lerp(0.75, 0, kG))}
        strokeWidth={2.5}
        opacity={setIn}
        style={{filter: `drop-shadow(0 0 ${8 + 18 * (g as number)}px ${rgba(c, 0.35 + 0.4 * (g as number))})`}}
      />,
    );
  });

  // Pfeile zeichnen
  arrows.forEach((a) => {
    if (a.draw <= 0.001) return;
    const x0 = LX + NR + 6;
    const x1 = a.xe - NR - 8;
    const mx = (x0 + x1) / 2;
    const my = (a.ys + a.ye) / 2 - 26;
    const double = (hits[a.tgt] ?? 0) >= 2 && a.draw > 0.6;
    const cross = (a.id === '2' || a.id === '4') && k === STATES.length - 1 ? bump(t, T.reihe + 0.05, 1.2) : 0;
    let col = double ? CO : ARROW;
    col = mix(col, AM, Math.max(rk, cross));
    const o = fade;
    svg.push(
      <path
        key={`a${a.id}`}
        d={`M ${x0} ${a.ys} Q ${mx} ${my} ${x1} ${a.ye}`}
        fill="none"
        stroke={col}
        strokeWidth={3.5 + 1.5 * cross}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - a.draw}
        opacity={o}
        style={{filter: `drop-shadow(0 0 ${6 + 8 * cross}px ${col})`}}
      />,
    );
    svg.push(<Head key={`h${a.id}`} x={x1} y={a.ye} dx={x1 - mx} dy={a.ye - my} color={col} o={o * clamp((a.draw - 0.8) / 0.2) * (1 - clamp(rk * 3))} />);
    if (rk > 0 && rk < 1) {
      // Lichtpunkt läuft vom Ziel zurück zur Quelle
      const u = 1 - rk;
      const px = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1;
      const py = (1 - u) * (1 - u) * a.ys + 2 * (1 - u) * u * my + u * u * a.ye;
      svg.push(<circle key={`p${a.id}`} cx={px} cy={py} r={7} fill={AM} opacity={o} style={{filter: `drop-shadow(0 0 10px ${AM})`}} />);
    }
    svg.push(<Head key={`r${a.id}`} x={x0} y={a.ys} dx={x0 - mx} dy={a.ys - my} color={AM} o={o * clamp((rk - 0.85) / 0.15)} />);
  });

  // Elemente
  const node = (key: string, x: number, y: number, label: string, stroke: string, o: number, ring?: {color: string; dashed: boolean; o: number}, glow = 0) => {
    if (o <= 0.01) return;
    svg.push(<circle key={`n${key}`} cx={x} cy={y} r={NR} fill="#0D0F2A" stroke={stroke} strokeWidth={3} opacity={o * fade} style={{filter: `drop-shadow(0 0 ${6 + 16 * glow}px ${rgba(stroke, 0.5 + 0.4 * glow)})`}} />);
    if (ring && ring.o > 0.01) svg.push(<circle key={`ring${key}`} cx={x} cy={y} r={NR + 12} fill="none" stroke={ring.color} strokeWidth={3} strokeDasharray={ring.dashed ? '7 7' : undefined} opacity={ring.o * o * fade} style={{filter: `drop-shadow(0 0 8px ${ring.color})`}} />);
    html.push(<Lbl key={`l${key}`} x={x} y={y} tex={label} size={44} o={o * fade} />);
  };
  ids.forEach((id) => node(id, LX, left[id].y, id, CY, left[id].o * setIn, undefined, bump(t, T.links + 0.1, 1.0) * 0.6));
  RIGHT.forEach((id) => {
    const h = hits[id] ?? 0;
    const [x, y] = rightPos(id);
    let ring: {color: string; dashed: boolean; o: number} | undefined;
    if (h >= 2) ring = {color: CO, dashed: false, o: 1};
    else if (h === 0 && em !== 'none') ring = {color: em === 'bad' ? CO : C.txt2, dashed: true, o: em === 'bad' ? 0.95 : 0.8};
    // frisch gefüllte Ziele (B, D) blinken grün, im bijektiven Zustand alle nacheinander
    const fill = id === 'B' || id === 'D' ? bump(t, T.neue + 0.25 + 0.55 + 0.45, 1.0) : 0;
    const once = bump(t, T.genau + 0.1 + 0.22 * RIGHT.indexOf(id), 0.8);
    if (!ring && (fill > 0.02 || once > 0.02)) ring = {color: OK, dashed: false, o: Math.max(fill, once)};
    const g = h >= 2 ? 0.5 + 0.5 * bump(t, T.nichtInj, 1.0) : bump(t, T.rechts + 0.05, 1.0) * 0.6;
    node(id, x, y, id, AM, setIn, ring, g);
    if (h >= 2) html.push(<Lbl key={`x${id}`} x={x + 74} y={y - 40} tex={'2\\times'} size={30} color={CO} o={fade} glow={0.4} />);
  });

  // „darf leer bleiben“
  const leerO = show2(t, T.leer + 0.1) * (1 - easeInOutCubic(clamp((t - T.zeigen) / 0.35)));
  if (leerO > 0.01)
    html.push(
      <div key="leer" style={{position: 'absolute', left: RX, top: (rightY('A') + rightY('B')) / 2, transform: 'translate(-50%, -50%)', opacity: leerO * fade, whiteSpace: 'nowrap', textShadow: shadow}}>
        <span style={{fontFamily: F.display, fontWeight: 600, fontSize: 25, color: C.txt2}}>leer: erlaubt</span>
      </div>,
    );

  // Mengennamen (fliegen im Übergang an die Achsen)
  const nameL = show2(t, T.links + 0.05) * (1 - clamp(kG * 2));
  const nameR = show2(t, T.rechts) * (1 - clamp(kG * 2));
  html.push(<Name key="nl" x={LX} y={lRect.y0 - 30} text="Definitionsmenge" color={CY} o={nameL} glow={gL} />);
  html.push(<Name key="nr" x={RX} y={rRect.y0 - 30} text="Zielmenge" color={AM} o={nameR} glow={gR} />);
  // f⁻¹
  const fo = show2(t, T.umkehr + 0.1) * fade;
  html.push(<Lbl key="finv" x={540} y={Math.min(lRect.y0, rRect.y0) - 30} tex={'f^{-1}'} size={44} color={AM} o={fo} glow={bump(t, T.umkehr + 0.2, 1.0)} />);

  return (
    <>
      <FullSvg>{svg}</FullSvg>
      {html}
    </>
  );
};

const show2 = (t: number, at: number, d = 0.4) => easeOutExpo(clamp((t - at) / d));

const Name: React.FC<{x: number; y: number; text: string; color: string; o: number; glow: number}> = ({x, y, text, color, o, glow}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${1 + 0.06 * glow})`, opacity: o, fontFamily: F.display, fontWeight: 700, fontSize: 30, color, whiteSpace: 'nowrap', textShadow: glowShadow(glow, color)}}>{text}</div>
  );
