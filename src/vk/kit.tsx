// Bausteine des Verkettungs-Klausurvideos, übernommen aus src/aeq/kit.tsx (Branch video/aequivalenzrelation-klausur), dort aus src/abb/kit.tsx (Branch video/abbildungen-klausur):
// gemessene KaTeX-Breiten und „Morph“, eine Formelzeile mit echten Brüchen, deren Teile beim Umformen an ihren neuen
// Platz gleiten, aus anderen Teilen entstehen oder in sie einfließen. Neu: Zustände mit mehreren Zeilen (`rows`),
// zwischen denen Atome mit gleicher id wandern.
import React, {useEffect, useState} from 'react';
import katex from 'katex';
import {continueRender, delayRender} from 'remotion';
import {C} from '../theme';
import {clamp, easeInOutCubic, easeOutExpo, lerp} from '../math';
import {Tex} from '../ui';

export const shadow = `0 0 14px ${C.bg}, 0 0 30px ${C.bg}`;
export const show = (t: number, at: number, d = 0.4) => easeOutExpo(clamp((t - at) / d));
export const hide = (t: number, at: number, d = 0.35) => 1 - easeInOutCubic(clamp((t - at) / d));
export const glowShadow = (g: number, color: string) => (g > 0.02 ? `0 0 ${10 + 26 * g}px ${color}, ${shadow}` : shadow);

/* ---------- Farben mischen ---------- */

const hex = (h: string) => (h.startsWith('rgb') ? (h.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number) : [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
export const mix = (a: string, b: string, k: number) => {
  if (a === b || k <= 0) return a;
  if (k >= 1) return b;
  const p = hex(a);
  const q = hex(b);
  return `rgb(${p.map((v, i) => Math.round(lerp(v, q[i], k))).join(',')})`;
};
export const rgba = (h: string, a: number) => `rgba(${hex(h).join(',')},${a})`;

/* ---------- Breite einer Formel, im Browser gemessen ---------- */

const texCache = new Map<string, number>();
let fontsLoaded = false;
const fontsP: Promise<unknown> =
  typeof document === 'undefined'
    ? Promise.resolve()
    : Promise.all(['48px KaTeX_Main', 'bold 48px KaTeX_Main', 'italic 48px KaTeX_Math', '48px KaTeX_Size1', '48px KaTeX_Size2', '48px KaTeX_AMS'].map((f) => document.fonts.load(f))).then(() => {
        fontsLoaded = true;
        texCache.clear();
      });
export const useTexReady = () => {
  const [ready, setReady] = useState(fontsLoaded);
  const [handle] = useState(() => (fontsLoaded ? null : delayRender('KaTeX-Breiten')));
  useEffect(() => {
    if (!ready) fontsP.then(() => setReady(true));
  }, [ready]);
  useEffect(() => {
    if (ready && handle !== null) continueRender(handle);
  }, [ready, handle]);
  return ready;
};
export const texW = (tex: string, size: number) => {
  const key = `${size}|${tex}`;
  const hit = texCache.get(key);
  if (hit !== undefined) return hit;
  if (typeof document === 'undefined') return size * 0.6 * tex.length;
  const span = document.createElement('span');
  span.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font-size:${size}px;line-height:1;left:-9999px;top:0`;
  span.innerHTML = katex.renderToString(tex, {throwOnError: false, strict: false});
  document.body.appendChild(span);
  const w = span.getBoundingClientRect().width;
  document.body.removeChild(span);
  if (fontsLoaded) texCache.set(key, w);
  return w;
};

/* ---------- Morph: Formelzeile aus Atomen und Brüchen ---------- */

export type Atom = {
  id: string;
  tex: string;
  color?: string; // CSS-Farbe des Atoms
  glow?: number;
  delay?: number; // eigener Versatz beim Übergang in diesen Zustand
  arc?: number; // Bogenhöhe beim Gleiten (negativ = nach unten)
  from?: string; // neu: entsteht an der alten Stelle dieses Atoms
  o?: number; // Deckkraft
  pad?: number; // Abstand rechts und links in Schriftgrößen (überschreibt den Standard)
};
export type Frac = {id: string; num: Node[]; den: Node[]; color?: string; o?: number};
export type Node = Atom | Frac;
export type Row = {nodes: Node[]; dy: number; align?: [string, number]};
export type MState = {
  at: number;
  nodes: Node[];
  rows?: Row[]; // statt `nodes`: mehrere Zeilen, je um dy versetzt
  dur?: number;
  into?: Record<string, string>; // altes Atom → fließt in dieses neue Atom
  align?: [string, number]; // Mitte dieses Atoms liegt bei x
};

const isFrac = (n: Node): n is Frac => (n as Frac).num !== undefined;

// Abstand um Operatoren (KaTeX setzt bei einzeln stehenden Zeichen keinen Zwischenraum)
const PAD: Record<string, number> = {'=': 0.32, '-': 0.24, '+': 0.24, '\\cdot': 0.12, '\\Rightarrow': 0.36, '\\Leftrightarrow': 0.36, ',': 0.16, '\\neq': 0.3, '\\mapsto': 0.3, '\\to': 0.3};
const FRAC_K = 0.9; // Schriftgröße in Zähler und Nenner
const atomW = (a: Atom, size: number) => texW(a.tex, size) + 2 * size * (a.pad ?? PAD[a.tex] ?? 0.02);

export type Placed = {x: number; y: number; w: number; a: Atom; k: number};
export type Bar = {x: number; y: number; w: number; color?: string; o: number};
export type Layout = {atoms: Record<string, Placed>; bars: Record<string, Bar>; width: number};

const rowW = (nodes: Node[], size: number): number =>
  nodes.reduce((s, n) => s + (isFrac(n) ? Math.max(rowW(n.num, size * FRAC_K), rowW(n.den, size * FRAC_K)) + size * 0.36 : atomW(n, size)), 0);

const place = (nodes: Node[], x0: number, y: number, size: number, k: number, out: Layout) => {
  let x = x0;
  nodes.forEach((n) => {
    if (isFrac(n)) {
      const fs = size * FRAC_K;
      const wn = rowW(n.num, fs);
      const wd = rowW(n.den, fs);
      const w = Math.max(wn, wd) + size * 0.36;
      const cx = x + w / 2;
      out.bars[n.id] = {x: cx, y: y + size * 0.02, w: w - size * 0.12, color: n.color, o: n.o ?? 1};
      place(n.num, cx - wn / 2, y - size * 0.6, fs, k * FRAC_K, out);
      place(n.den, cx - wd / 2, y + size * 0.66, fs, k * FRAC_K, out);
      x += w;
    } else {
      const w = atomW(n, size);
      out.atoms[n.id] = {x: x + w / 2, y, w, a: n, k};
      x += w;
    }
  });
};

export const MAX_W = 880;
export const layoutState = (s: MState, cx: number, cy: number, size: number, check = false): Layout => {
  if (s.rows) {
    const all: Layout = {atoms: {}, bars: {}, width: 0};
    s.rows.forEach((r) => {
      const L = layoutState({at: s.at, nodes: r.nodes, align: r.align}, cx, cy + r.dy, size, check);
      Object.assign(all.atoms, L.atoms);
      Object.assign(all.bars, L.bars);
      all.width = Math.max(all.width, L.width);
    });
    return all;
  }
  const out: Layout = {atoms: {}, bars: {}, width: rowW(s.nodes, size)};
  place(s.nodes, cx - out.width / 2, cy, size, 1, out);
  if (s.align) {
    const p = out.atoms[s.align[0]];
    if (p) {
      const dx = s.align[1] - p.x;
      Object.values(out.atoms).forEach((q) => (q.x += dx));
      Object.values(out.bars).forEach((q) => (q.x += dx));
    }
  }
  if (check && fontsLoaded && out.width > MAX_W) throw new Error(`Formelzeile zu breit: ${Math.round(out.width)} px (${s.nodes.map((n) => (isFrac(n) ? 'frac' : n.tex)).join(' ')})`);
  return out;
};

export const stateIndex = (states: MState[], t: number) => {
  let k = -1;
  states.forEach((s, n) => {
    if (t >= s.at) k = n;
  });
  return k;
};

// aktuelle Lage eines Atoms (für Markierungen, Striche, Bögen)
export const atomAt = (states: MState[], t: number, id: string, cx: number, cy: number, size: number): Placed | null => {
  const k = stateIndex(states, t);
  if (k < 0) return null;
  const L = layoutState(states[k], cx, cy, size);
  const q = L.atoms[id];
  if (!q) return null;
  if (k === 0) return q;
  const P = layoutState(states[k - 1], cx, cy, size);
  const p = P.atoms[id];
  if (!p) return q;
  const e = easeInOutCubic(clamp((t - states[k].at - (q.a.delay ?? 0)) / (states[k].dur ?? 0.6)));
  return {...q, x: lerp(p.x, q.x, e), y: lerp(p.y, q.y, e), k: lerp(p.k, q.k, e)};
};

const Glyph: React.FC<{x: number; y: number; size: number; k: number; tex: string; color: string; o: number; glow: number; glowColor?: string}> = ({x, y, size, k, tex, color, o, glow, glowColor}) =>
  o <= 0.01 ? null : (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${k * (1 + 0.12 * glow)})`,
        opacity: o,
        whiteSpace: 'nowrap',
        textShadow: glowShadow(glow, glowColor ?? color),
      }}
    >
      <Tex tex={tex} size={size} style={{color}} />
    </div>
  );

const BarView: React.FC<{b: Bar; size: number; o: number}> = ({b, size, o}) =>
  o * b.o <= 0.01 || b.w < 1 ? null : (
    <div
      style={{
        position: 'absolute',
        left: b.x - b.w / 2,
        top: b.y - size * 0.022,
        width: b.w,
        height: Math.max(2.5, size * 0.044),
        borderRadius: 2,
        background: b.color ?? C.txt,
        opacity: o * b.o,
        boxShadow: shadow,
      }}
    />
  );

export const Morph: React.FC<{t: number; states: MState[]; cx?: number; cy: number; size: number; o?: number}> = ({t, states, cx = 540, cy, size, o = 1}) => {
  if (o <= 0.005) return null;
  const k = stateIndex(states, t);
  if (k < 0) return null;
  const cur = states[k];
  const prev = k > 0 ? states[k - 1] : null;
  const dur = cur.dur ?? 0.6;
  const L = layoutState(cur, cx, cy, size, t > cur.at + dur + 0.3);
  const P = prev ? layoutState(prev, cx, cy, size) : null;
  const pe = (delay = 0) => easeInOutCubic(clamp((t - cur.at - delay) / dur));
  const pin = (delay = 0) => easeOutExpo(clamp((t - cur.at - delay) / 0.45));
  const items: React.ReactNode[] = [];
  const col = (a: Atom) => a.color ?? C.txt;

  Object.entries(L.atoms).forEach(([id, q]) => {
    const a = q.a;
    const oa = a.o ?? 1;
    const p = P?.atoms[id];
    const src = !p && a.from && P ? P.atoms[a.from] : undefined;
    const g = a.glow ?? 0;
    if (p) {
      const e = pe(a.delay);
      const x = lerp(p.x, q.x, e);
      const y = lerp(p.y, q.y, e) - Math.sin(Math.PI * e) * (a.arc ?? 0);
      const kk = lerp(p.k, q.k, e);
      const oo = lerp(p.a.o ?? 1, oa, e);
      const c = mix(col(p.a), col(a), e);
      if (p.a.tex === a.tex) items.push(<Glyph key={id} x={x} y={y} size={size} k={kk} tex={a.tex} color={c} o={oo * o} glow={g} glowColor={col(a)} />);
      else {
        items.push(<Glyph key={id + '~'} x={x} y={y} size={size} k={kk} tex={p.a.tex} color={c} o={clamp(1 - 1.8 * e) * oo * o} glow={g} glowColor={col(a)} />);
        items.push(<Glyph key={id} x={x} y={y} size={size} k={kk} tex={a.tex} color={c} o={clamp(1.8 * e - 0.8) * oo * o} glow={g} glowColor={col(a)} />);
      }
    } else if (src) {
      const e = pe(a.delay);
      const x = lerp(src.x, q.x, e);
      const y = lerp(src.y, q.y, e) - Math.sin(Math.PI * e) * (a.arc ?? 0);
      items.push(<Glyph key={id} x={x} y={y} size={size} k={lerp(src.k, q.k, e)} tex={a.tex} color={col(a)} o={clamp(e * 3) * oa * o} glow={g} />);
    } else {
      const e = pin(a.delay);
      items.push(<Glyph key={id} x={q.x} y={q.y + (1 - e) * 14} size={size} k={q.k} tex={a.tex} color={col(a)} o={e * oa * o} glow={g} />);
    }
  });
  if (P) {
    Object.entries(P.atoms).forEach(([id, p]) => {
      if (L.atoms[id]) return;
      const target = cur.into?.[id] ? L.atoms[cur.into[id]] : undefined;
      const e = pe(p.a.delay);
      if (target) {
        items.push(
          <Glyph key={id + '>'} x={lerp(p.x, target.x, e)} y={lerp(p.y, target.y, e) - Math.sin(Math.PI * e) * (p.a.arc ?? 0)} size={size} k={lerp(p.k, target.k, e)} tex={p.a.tex} color={mix(col(p.a), col(target.a), e)} o={clamp((1 - e) * 2.2) * (p.a.o ?? 1) * o} glow={0} />,
        );
      } else {
        const f = clamp((t - cur.at) / 0.35);
        items.push(<Glyph key={id + '-'} x={p.x} y={p.y - 10 * f} size={size} k={p.k} tex={p.a.tex} color={col(p.a)} o={(1 - f) * (p.a.o ?? 1) * o} glow={p.a.glow ?? 0} />);
      }
    });
  }
  // Bruchstriche
  const bars: React.ReactNode[] = [];
  const e = pe();
  Object.entries(L.bars).forEach(([id, b]) => {
    const pb = P?.bars[id];
    if (pb) bars.push(<BarView key={id} b={{...b, x: lerp(pb.x, b.x, e), y: lerp(pb.y, b.y, e), w: lerp(pb.w, b.w, e), o: lerp(pb.o, b.o, e)}} size={size} o={o} />);
    else if (P) bars.push(<BarView key={id} b={{...b, w: b.w * e}} size={size} o={o} />);
    else bars.push(<BarView key={id} b={{...b, w: b.w * pin()}} size={size} o={o} />);
  });
  if (P)
    Object.entries(P.bars).forEach(([id, b]) => {
      if (!L.bars[id]) bars.push(<BarView key={id + '-'} b={{...b, w: b.w * (1 - e)}} size={size} o={o} />);
    });
  return (
    <>
      {bars}
      {items}
    </>
  );
};

/* ---------- Kleine Helfer zum Bauen von Zuständen ---------- */

// Atome aus einer Liste [id, tex] mit gemeinsamer Farbe
export const atoms = (list: [string, string, string?][], extra: Partial<Atom> = {}): Atom[] => list.map(([id, tex, color]) => ({id, tex, color, ...extra}));
export const frac = (id: string, num: Node[], den: Node[], extra: Partial<Frac> = {}): Frac => ({id, num, den, ...extra});
