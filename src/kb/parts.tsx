import React from 'react';
import {C, MARGIN, W} from '../theme';
import {F} from '../fonts';
import {bump, clamp, easeInCubic, easeInOutCubic, easeOutCubic, lerp, springOS} from '../math';
import {Tex, col, useSec} from '../ui';
import {T} from './timeline';

export const show = (t: number, at: number, d = 0.4) => easeOutCubic(clamp((t - at) / d));
export const hide = (t: number, at: number, d = 0.35) => 1 - easeInCubic(clamp((t - at) / d));

// Farben: v₁/λ₁ Amber, v₂/λ₂ Cyan, v₃/λ₃/a Koralle
export const L1 = col(C.eig, '\\lambda_1');
export const L2 = col(C.cyan, '\\lambda_2');
export const L3 = col(C.lam, '\\lambda_3');
export const AA = col(C.lam, 'a');
export const v1 = col(C.eig, 'v_1');
export const v2 = col(C.cyan, 'v_2');
export const v3 = col(C.lam, 'v_3');

/* ---------- Spaltenvektor mit eigener Geometrie: Zeilen lassen sich hervorheben ---------- */

export const ColVec: React.FC<{entries: string[]; x: number; y: number; w: number; rowH: number; size: number; color?: string; opacity?: number}> = ({
  entries,
  x,
  y,
  w,
  rowH,
  size,
  color = C.txt,
  opacity = 1,
}) => {
  const h = rowH * entries.length;
  const pw = 14;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity}}>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d={`M ${pw} 4 Q 2 ${h / 2} ${pw} ${h - 4}`} fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
        <path d={`M ${w - pw} 4 Q ${w - 2} ${h / 2} ${w - pw} ${h - 4}`} fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
      </svg>
      {entries.map((e, i) => (
        <div key={i} style={{position: 'absolute', left: 0, width: w, top: i * rowH, height: rowH, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Tex tex={e} size={size} />
        </div>
      ))}
    </div>
  );
};

/* ---------- Formel an fester Stelle, mit Ein-/Ausblenden, Rahmen und Hinterlegung ---------- */

export const Fx: React.FC<{
  tex: string;
  x: number;
  y: number;
  at: number;
  out?: number;
  size?: number;
  box?: number;
  dim?: number;
  from?: [number, number];
}> = ({tex, x, y, at, out, size = 40, box = 0, dim = 0, from}) => {
  const t = useSec();
  const p = show(t, at, 0.45);
  const q = out !== undefined ? hide(t, out) : 1;
  if (p <= 0 || q <= 0) return null;
  const fx = from ? lerp(from[0], x, easeInOutCubic(clamp((t - at) / 0.7))) : x;
  const fy = from ? lerp(from[1], y, easeInOutCubic(clamp((t - at) / 0.7))) : y + (1 - p) * 14;
  return (
    <div
      style={{
        position: 'absolute',
        left: fx - 12,
        top: fy - 8,
        padding: '6px 12px',
        borderRadius: 12,
        border: `2.5px solid rgba(243,244,251,${0.85 * box})`,
        boxShadow: box > 0 ? `0 0 ${30 * box}px rgba(243,244,251,${0.25 * box})` : undefined,
        opacity: (from ? clamp(p * 2) : p) * q * (1 - 0.65 * dim),
        whiteSpace: 'nowrap',
      }}
    >
      <Tex tex={tex} size={size} />
    </div>
  );
};

// Kleine Beschriftung (Mono)
export const Tag: React.FC<{text: string; x: number; y: number; at: number; out?: number; color?: string; size?: number; dim?: number}> = ({
  text,
  x,
  y,
  at,
  out,
  color = C.txt2,
  size = 22,
  dim = 0,
}) => {
  const t = useSec();
  const p = show(t, at, 0.4);
  const q = out !== undefined ? hide(t, out) : 1;
  if (p <= 0 || q <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        fontFamily: F.mono,
        fontWeight: 500,
        fontSize: size,
        letterSpacing: '.06em',
        color,
        opacity: p * q * (1 - 0.65 * dim),
        whiteSpace: 'nowrap',
        transform: `translateY(${(1 - p) * 10}px)`,
        textShadow: `0 0 10px ${C.bg}, 0 0 22px ${C.bg}`,
      }}
    >
      {text}
    </div>
  );
};

// Hinterlegung, z. B. für eine Zeile, die gerade benutzt wird
export const Band: React.FC<{x: number; y: number; w: number; h: number; o: number; rgb?: string}> = ({x, y, w, h, o, rgb = '255,194,71'}) =>
  o > 0 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 12,
        background: `rgba(${rgb},${0.16 * o})`,
        boxShadow: `inset 0 0 0 2px rgba(${rgb},${0.5 * o})`,
      }}
    />
  ) : null;

// Ein Term fliegt von einer Stelle zur nächsten (Einsetzen)
export const Fly: React.FC<{tex: string; from: [number, number]; to: [number, number]; at: number; dur?: number; size?: number}> = ({tex, from, to, at, dur = 0.7, size = 40}) => {
  const t = useSec();
  const x = clamp((t - at) / dur);
  if (t < at || t > at + dur + 0.05) return null;
  const e = easeInOutCubic(x);
  const lift = Math.sin(Math.PI * e) * 46;
  return (
    <div
      style={{
        position: 'absolute',
        left: lerp(from[0], to[0], e) - 10,
        top: lerp(from[1], to[1], e) - lift - 6,
        padding: '4px 10px',
        borderRadius: 10,
        background: 'rgba(255,122,92,.18)',
        boxShadow: '0 0 26px rgba(255,122,92,.45)',
        whiteSpace: 'nowrap',
      }}
    >
      <Tex tex={tex} size={size} />
    </div>
  );
};

/* ---------- Aufgabenkarte (immer sichtbar) ---------- */

export const CARD = {top: 160, h: 322};

export const TaskCard: React.FC = () => {
  const t = useSec();
  const appear = springOS(clamp((t + 0.35) / 0.6));
  const ans1 = show(t, T.aEins, 0.6);
  const ans2 = show(t, T.dim + 0.3, 0.6);
  // Merkkarte: Karte gleitet in die Mitte, danach zieht sie sich im CTA zu einem Lichtpunkt zusammen
  const merk = easeInOutCubic(clamp((t - T.merk) / 0.9));
  const gone = easeInCubic(clamp((t - T.cta) / 0.55));
  if (gone >= 1) return null;
  const top = lerp(CARD.top, 800 - CARD.h / 2, merk);
  const scale = lerp(1, 1.06, merk) * (1 - gone);
  const glow = Math.max(bump(t, T.aEins, 1.0), bump(t, T.dim + 0.3, 1.0));
  const vec = (name: string, e: string[], x: number) => (
    <>
      <div style={{position: 'absolute', left: x, top: 100}}>
        <Tex tex={`${name} =`} size={38} />
      </div>
      <ColVec entries={e} x={x + 96} y={52} w={66} rowH={44} size={34} />
    </>
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: MARGIN,
        top,
        width: W - 2 * MARGIN,
        height: CARD.h,
        boxSizing: 'border-box',
        borderRadius: 24,
        border: `1.5px solid rgba(255,255,255,${0.16 + 0.25 * Math.max(ans2, glow)})`,
        background: 'linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.025))',
        boxShadow: merk > 0 ? `0 30px 90px rgba(30,139,219,${0.25 * merk})` : undefined,
        opacity: clamp(appear * 1.4) * (1 - gone * 0.6),
        transform: `translateY(${(1 - appear) * 30}px) scale(${scale})`,
      }}
    >
      <div style={{position: 'absolute', left: 30, top: 20, fontFamily: F.mono, fontSize: 20, letterSpacing: '.08em', color: C.txt2}}>KLAUSURAUFGABE · LINEARE ALGEBRA</div>
      {vec(v1, ['1', '1', '0'], 64)}
      {vec(v2, ['0', '1', '1'], 354)}
      {vec(v3, ['1', '2', AA], 644)}
      <div style={{position: 'absolute', left: 30, right: 30, top: 208, height: 42}}>
        <div style={{position: 'absolute', inset: 0, opacity: 1 - ans1, fontFamily: F.body, fontWeight: 500, fontSize: 27, color: C.txt2}}>
          1. Für welche a ∈ ℝ sind v₁, v₂, v₃ linear abhängig?
        </div>
        {ans1 > 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: ans1, transform: `translateY(${(1 - ans1) * 10}px)`}}>
            <Tex tex={`\\text{1.}\\ \\ \\text{abhängig} \\iff ${AA} = 1\\ \\checkmark`} size={31} />
          </div>
        ) : null}
      </div>
      <div style={{position: 'absolute', left: 30, right: 30, top: 258, height: 42}}>
        <div style={{position: 'absolute', inset: 0, opacity: 1 - ans2, fontFamily: F.body, fontWeight: 500, fontSize: 27, color: C.txt2}}>
          2. Dann: Basis und Dimension von U = span{'{'}v₁, v₂, v₃{'}'}
        </div>
        {ans2 > 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: ans2, transform: `translateY(${(1 - ans2) * 10}px)`}}>
            <Tex tex={`\\text{2.}\\ \\ \\text{Basis } \\{${v1}, ${v2}\\},\\ \\ \\dim U = 2\\ \\checkmark`} size={31} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* ---------- Fortschrittsleiste ---------- */

const STEP_NAMES = ['Ansatz', 'Lösen', 'Basis & Dim.'];
const STEP_W = 300;
// [aktiv ab, erledigt ab]
const STEP_T: [number, number][] = [
  [T.s1, T.s2],
  [T.s2, T.aEins],
  [T.s3, T.dim + 0.3],
];

export const Progress: React.FC = () => {
  const t = useSec();
  const out = hide(t, T.merk, 0.5);
  if (out <= 0) return null;
  return (
    <>
      {STEP_NAMES.map((name, i) => {
        const p = springOS(clamp((t - (T.drei + 0.2 * i - 0.1)) / 0.6));
        if (p <= 0) return null;
        const [on, ok] = STEP_T[i];
        const st = t >= ok ? 'ok' : t >= on ? 'active' : 'idle';
        const pulse = Math.max(bump(t, on, 0.5), bump(t, ok, 0.5));
        const border = st === 'ok' ? C.txt : st === 'active' ? C.eig : 'rgba(255,255,255,.22)';
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: MARGIN + i * (STEP_W + 18),
              top: 500,
              width: STEP_W,
              height: 66,
              boxSizing: 'border-box',
              borderRadius: 18,
              border: `2.5px solid ${border}`,
              background: st === 'active' ? 'rgba(255,194,71,.10)' : st === 'ok' ? 'rgba(243,244,251,.06)' : 'rgba(255,255,255,.02)',
              boxShadow: st === 'active' ? '0 0 30px rgba(255,194,71,.25)' : undefined,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              paddingLeft: 16,
              opacity: clamp(p * 1.4) * out,
              transform: `scale(${(0.9 + 0.1 * p) * (1 + 0.06 * pulse)})`,
            }}
          >
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                border: `2px solid ${st === 'idle' ? C.txt2 : border}`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: F.mono,
                fontWeight: 600,
                fontSize: 20,
                color: st === 'idle' ? C.txt2 : border,
              }}
            >
              {i + 1}
            </span>
            <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 28, color: st === 'idle' ? C.txt2 : C.txt}}>{name}</span>
            {st === 'ok' ? <span style={{marginLeft: 'auto', marginRight: 16, fontFamily: F.display, fontWeight: 800, fontSize: 30, color: C.txt}}>✓</span> : null}
          </div>
        );
      })}
    </>
  );
};
