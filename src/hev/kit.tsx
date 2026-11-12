// Bausteine der Serie „Mathe 1 – So geht's“: rollende Einträge, Spaltenvektoren, Formelzeilen mit gleitenden Teilen, Regler.
import React, {useEffect, useState} from 'react';
import katex from 'katex';
import {continueRender, delayRender} from 'remotion';
import {C} from '../theme';
import {F} from '../fonts';
import {V2, bump, clamp, easeInOutCubic, easeOutExpo, fmtDe, lerp} from '../math';
import {Tex} from '../ui';

export const shadow = `0 0 14px ${C.bg}, 0 0 30px ${C.bg}`;
export const show = (t: number, at: number, d = 0.4) => easeOutExpo(clamp((t - at) / d));
export const hide = (t: number, at: number, d = 0.35) => 1 - easeInOutCubic(clamp((t - at) / d));
export const glowShadow = (g: number, color: string) => (g > 0.02 ? `0 0 ${10 + 26 * g}px ${color}, ${shadow}` : shadow);

// Zahl mit deutschem Komma: ganze Zahlen ohne Nachkommastelle
export const num = (v: number) => {
  const r = Math.round(v);
  if (Math.abs(v - r) < 0.05) return r < 0 ? `-${-r}` : `${r}`;
  const s = fmtDe(Math.abs(v), 1).replace(',', '{,}');
  return v < 0 ? `-${s}` : s;
};

/* ---------- Rollender Eintrag: Wechsel rollen nach oben aus und von unten ein ---------- */

export type CState = [number, string];
export const stateAt = (states: CState[], t: number) => {
  let k = 0;
  states.forEach(([at], n) => {
    if (t >= at) k = n;
  });
  return k;
};

export const Roll: React.FC<{
  t: number;
  states: CState[];
  size: number;
  x: number;
  y: number;
  glow?: number;
  color?: string;
  o?: number;
  dur?: number;
  scale?: number;
}> = ({t, states, size, x, y, glow = 0, color = 'rgba(255,255,255,.85)', o = 1, dur = 0.38, scale = 1}) => {
  if (o <= 0.005) return null;
  const k = stateAt(states, t);
  const p = k > 0 ? easeInOutCubic(clamp((t - states[k][0]) / dur)) : 1;
  const off = size * 0.45;
  const layer = (tex: string, a: number, dy: number, key: string) =>
    a > 0.01 && tex ? (
      <div
        key={key}
        style={{
          position: 'absolute',
          left: x,
          top: y + dy,
          transform: `translate(-50%, -50%) scale(${scale * (1 + 0.14 * glow)})`,
          opacity: a * o,
          whiteSpace: 'nowrap',
          textShadow: glowShadow(glow, color),
        }}
      >
        <Tex tex={tex} size={size} />
      </div>
    ) : null;
  return (
    <>
      {p < 1 ? layer(states[k - 1][1], clamp(1 - 1.6 * p), -p * off, 'a') : null}
      {layer(states[k][1], clamp(1.6 * p - 0.6), (1 - p) * off, 'b')}
    </>
  );
};

/* ---------- Runde Klammern einer Matrix oder eines Spaltenvektors ---------- */

export const Parens: React.FC<{cx: number; cy: number; w: number; h: number; size: number; o: number; color?: string}> = ({cx, cy, w, h, size, o, color = C.txt}) => {
  const pw = Math.max(12, size * 0.22);
  const sw = Math.max(2.4, size * 0.045);
  return (
    <svg width={w} height={h} style={{position: 'absolute', left: cx - w / 2, top: cy - h / 2, overflow: 'visible', opacity: o}}>
      <path d={`M ${pw} 3 Q 0 ${h / 2} ${pw} ${h - 3}`} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <path d={`M ${w - pw} 3 Q ${w} ${h / 2} ${w - pw} ${h - 3}`} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
};

// Breite eines Spaltenvektors: breitester Eintrag aller Zustände plus Klammern
export const colVecW = (entries: CState[][], size: number) => Math.max(size * 1.5, ...entries.flat().map(([, tex]) => (tex ? texW(tex, size) : 0))) + size * 0.95;

// Spaltenvektor mit drei einzeln steuerbaren Einträgen
export const ColVec: React.FC<{
  t: number;
  x: number;
  y: number;
  size: number;
  entries: CState[][];
  glows?: number[];
  colors?: string[];
  w?: number;
  o?: number;
}> = ({t, x, y, size, entries, glows = [0, 0, 0], colors = [], w, o = 1}) => {
  const rh = size * 1.08;
  const width = Math.max(w ?? 0, colVecW(entries, size));
  return (
    <>
      <Parens cx={x} cy={y} w={width} h={rh * 3 + size * 0.15} size={size} o={o} />
      {entries.map((st, i) => (
        <Roll key={i} t={t} states={st} size={size} x={x} y={y + (i - 1) * rh} glow={glows[i]} color={colors[i]} o={o} />
      ))}
    </>
  );
};

/* ---------- Formelzeile: Teile gleiten beim Umformen an ihren neuen Platz ---------- */

export type Chunk = {
  id: string;
  w: number;
  tex?: string;
  // eigener Inhalt (z. B. Spaltenvektor), gezeichnet um die Mitte (x, y)
  render?: (x: number, y: number, o: number) => React.ReactNode;
  // erscheint fliegend von diesem Bildschirmpunkt
  from?: V2;
  glow?: number;
  color?: string;
};
export type RowState = {at: number; chunks: Chunk[]; dur?: number};

// Breite einer Formel, im Browser gemessen. Erst wenn die KaTeX-Schriften geladen sind, wird gespeichert;
// useTexReady rendert danach noch einmal neu, damit kein Bild mit Breiten der Ersatzschrift entsteht.
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
// Abstand um Operatoren, die allein in einem Teil stehen (KaTeX setzt dort keinen Zwischenraum)
const PAD: Record<string, number> = {'=': 0.72, '-': 0.56, '+': 0.56, '\\cdot': 0.34, '\\Leftrightarrow': 0.8, ',': 0.36};
export const chunkW = (c: Chunk, size: number) => (c.tex !== undefined ? texW(c.tex, size) + size * (PAD[c.tex] ?? 0.14) : c.w);

export const rowLayout = (chunks: Chunk[], cx: number, size: number) => {
  const ws = chunks.map((c) => chunkW(c, size));
  const total = ws.reduce((a, w) => a + w, 0);
  let x = cx - total / 2;
  const out: Record<string, number> = {};
  chunks.forEach((c, i) => {
    out[c.id] = x + ws[i] / 2;
    x += ws[i];
  });
  return out;
};
export const rowWidth = (chunks: Chunk[], size: number) => chunks.reduce((a, c) => a + chunkW(c, size), 0);

export const MagicRow: React.FC<{t: number; y: number; cx?: number; size: number; states: RowState[]; o?: number; scale?: number}> = ({
  t,
  y,
  cx = 540,
  size,
  states,
  o = 1,
  scale = 1,
}) => {
  if (o <= 0.005 || t < states[0].at) return null;
  let k = 0;
  states.forEach((s, n) => {
    if (t >= s.at) k = n;
  });
  const cur = states[k];
  const prev = k > 0 ? states[k - 1] : null;
  const p = easeInOutCubic(clamp((t - cur.at) / (cur.dur ?? 0.55)));
  const pIn = easeOutExpo(clamp((t - cur.at) / 0.45));
  const xc = rowLayout(cur.chunks, cx, size);
  const xp = prev ? rowLayout(prev.chunks, cx, size) : {};
  const prevById: Record<string, Chunk> = {};
  prev?.chunks.forEach((c) => (prevById[c.id] = c));
  const curIds = new Set(cur.chunks.map((c) => c.id));

  const draw = (c: Chunk, x: number, yy: number, a: number, sc: number, key: string) => {
    if (a <= 0.01) return null;
    const g = c.glow ?? 0;
    if (c.render) return <React.Fragment key={key}>{c.render(x, yy, a)}</React.Fragment>;
    return (
      <div
        key={key}
        style={{
          position: 'absolute',
          left: x,
          top: yy,
          transform: `translate(-50%, -50%) scale(${sc * (1 + 0.12 * g)})`,
          opacity: a,
          whiteSpace: 'nowrap',
          textShadow: glowShadow(g, c.color ?? 'rgba(255,255,255,.85)'),
        }}
      >
        <Tex tex={c.tex ?? ''} size={size} />
      </div>
    );
  };

  const items: React.ReactNode[] = [];
  cur.chunks.forEach((c) => {
    const q = prevById[c.id];
    if (q) {
      const x = lerp(xp[c.id], xc[c.id], p);
      if ((q.tex ?? '') === (c.tex ?? '') && !c.render === !q.render) items.push(draw(c, x, y, 1, 1, c.id));
      else {
        items.push(draw(q, x, y, 1 - p, 1, c.id + '-old'));
        items.push(draw(c, x, y, p, 1, c.id));
      }
    } else if (c.from) {
      const f = easeInOutCubic(clamp((t - cur.at) / 0.7));
      const x = lerp(c.from[0], xc[c.id], f);
      const yy = lerp(c.from[1], y, f) - Math.sin(Math.PI * f) * 40;
      items.push(draw(c, x, yy, clamp(f * 4), lerp(1.1, 1, f), c.id));
    } else items.push(draw(c, xc[c.id], y + (1 - pIn) * 14, pIn, 1, c.id));
  });
  prev?.chunks.forEach((q) => {
    if (!curIds.has(q.id)) items.push(draw(q, xp[q.id], y, 1 - p, 1, q.id + '-gone'));
  });
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o, transformOrigin: '0 0', transform: `translate(${cx}px, ${y}px) scale(${scale}) translate(${-cx}px, ${-y}px)`}}>{items}</div>
  );
};

/* ---------- Regler: eine freie Variable, frei wählbar ---------- */

export const Regler: React.FC<{
  t: number;
  x: number; // linker Rand
  y: number;
  w: number; // Länge der Schiene
  label: string; // TeX, z. B. „y = t“
  name: string; // TeX des Parameters
  color: string;
  value: number;
  o: number;
  glow?: number;
  range?: number;
}> = ({x, y, w, label, name, color, value, o, glow = 0, range = 2.5}) => {
  if (o <= 0.005) return null;
  const lw = 128;
  const x0 = x + lw;
  const px = (v: number) => x0 + ((v + range) / (2 * range)) * w;
  const kx = px(value);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{position: 'absolute', left: x, top: y, transform: 'translateY(-50%)', whiteSpace: 'nowrap', textShadow: shadow}}>
        <Tex tex={label} size={40} />
      </div>
      {/* Schiene mit Skala */}
      <div style={{position: 'absolute', left: x0, top: y - 3, width: w, height: 6, borderRadius: 3, background: 'rgba(243,244,251,.18)'}} />
      <div style={{position: 'absolute', left: Math.min(px(0), kx), top: y - 3, width: Math.abs(kx - px(0)), height: 6, borderRadius: 3, background: color, opacity: 0.75, boxShadow: `0 0 ${8 + 14 * glow}px ${color}`}} />
      {[-2, -1, 0, 1, 2].map((v) => (
        <React.Fragment key={v}>
          <div style={{position: 'absolute', left: px(v) - 1, top: y + 8, width: 2, height: v === 0 ? 14 : 9, background: 'rgba(243,244,251,.45)'}} />
          <div style={{position: 'absolute', left: px(v), top: y + 34, transform: 'translate(-50%, -50%)', fontFamily: F.mono, fontSize: 20, color: C.txt2}}>
            {v < 0 ? `−${-v}` : v}
          </div>
        </React.Fragment>
      ))}
      {/* Knopf mit aktuellem Wert */}
      <div
        style={{
          position: 'absolute',
          left: kx - 17,
          top: y - 17,
          width: 34,
          height: 34,
          borderRadius: 17,
          background: color,
          boxShadow: `0 0 ${14 + 26 * glow}px ${color}, 0 0 0 4px rgba(7,8,26,.8)`,
          transform: `scale(${1 + 0.25 * glow})`,
        }}
      />
      <div style={{position: 'absolute', left: kx, top: y - 46, transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap', textShadow: shadow}}>
        <Tex tex={`\\textcolor{${color}}{${name}} = ${num(value)}`} size={30} />
      </div>
    </div>
  );
};

/* ---------- Pille mit Text ---------- */

export const Pill: React.FC<{x: number; y: number; o: number; color: string; children: React.ReactNode; size?: number; anchor?: 'center' | 'left'; scale?: number; fill?: number}> = ({
  x,
  y,
  o,
  color,
  children,
  size = 30,
  anchor = 'center',
  scale = 1,
  fill = 0.14,
}) =>
  o > 0.005 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${anchor === 'center' ? '-50%' : '0'}, -50%) scale(${scale})`,
        transformOrigin: anchor === 'center' ? 'center' : 'left center',
        opacity: o,
        padding: `${size * 0.28}px ${size * 0.55}px`,
        borderRadius: 999,
        background: `${color}${Math.round(255 * fill)
          .toString(16)
          .padStart(2, '0')}`,
        boxShadow: `inset 0 0 0 2px ${color}`,
        whiteSpace: 'nowrap',
        fontFamily: F.display,
        fontWeight: 700,
        fontSize: size,
        color,
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.3,
      }}
    >
      {children}
    </div>
  ) : null;

export {bump};
