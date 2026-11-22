// Gemeinsame Bausteine (Farben, Notiz, Vollbild-SVG), übernommen aus src/aeq/common.tsx (Branch video/aequivalenzrelation-klausur).
import React from 'react';
import {C, W} from '../theme';
import {F} from '../fonts';
import {clamp, easeInOutCubic, easeOutExpo} from '../math';
import {Tex} from '../ui';
import {glowShadow, layoutState, MState, shadow} from './kit';

export const CY = C.cyan;
export const AM = C.eig;
export const CO = C.lam;
export const OK = '#7BEA9C';
export const VI = '#B78CFF';
export const CLASS_COL = [AM, CY, VI];

export const cy = (s: string) => `\\textcolor{${CY}}{${s}}`;
export const am = (s: string) => `\\textcolor{${AM}}{${s}}`;
export const co = (s: string) => `\\textcolor{${CO}}{${s}}`;
export const ease = (t: number, at: number, d: number) => easeInOutCubic(clamp((t - at) / d));
export const SIM = cy('\\sim');
export const THREE = am('3');

export const Note: React.FC<{x?: number; y: number; tex: string; o: number; size?: number; color?: string; glow?: number}> = ({x = 540, y, tex, o, size = 36, color = C.txt2, glow = 0}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) translateY(${(1 - o) * 10}px)`, opacity: o, whiteSpace: 'nowrap', textShadow: glowShadow(glow, color)}}>
      <Tex tex={tex} size={size} style={{color}} />
    </div>
  );

// grüner Rahmen um eine Zeile
export const ResultBox: React.FC<{cx: number; cy: number; w: number; h: number; o: number; glow: number; check?: boolean}> = ({cx, cy: y, w, h, o, glow, check = true}) =>
  o <= 0.01 ? null : (
    <>
      <div
        style={{
          position: 'absolute',
          left: cx - w / 2,
          top: y - h / 2,
          width: w,
          height: h,
          boxSizing: 'border-box',
          borderRadius: 22,
          border: `2.5px solid rgba(123,234,156,${0.5 + 0.4 * glow})`,
          background: 'rgba(12,30,30,.45)',
          boxShadow: `0 0 ${20 + 50 * glow}px rgba(123,234,156,${0.18 + 0.3 * glow})`,
          opacity: o,
          transform: `scale(${0.96 + 0.04 * o})`,
        }}
      />
      {check ? <div style={{position: 'absolute', left: cx + w / 2 + 18, top: y, transform: 'translateY(-50%)', opacity: o, fontFamily: F.display, fontWeight: 800, fontSize: 44, color: OK, textShadow: shadow}}>✓</div> : null}
    </>
  );

export const rowBounds = (s: MState, cx: number, y: number, size: number, ids?: string[]) => {
  const L = layoutState(s, cx, y, size);
  let a = Infinity;
  let b = -Infinity;
  Object.entries(L.atoms).forEach(([id, p]) => {
    if (ids && !ids.includes(id)) return;
    a = Math.min(a, p.x - p.w / 2);
    b = Math.max(b, p.x + p.w / 2);
  });
  return {cx: (a + b) / 2, w: b - a};
};

// koralle Streichung über einer Stelle (x, y, Breite w)
export const Strike: React.FC<{x: number; y: number; w: number; t: number; at: number; o: number}> = ({x, y, w, t, at, o}) => {
  const k = easeOutExpo(clamp((t - at) / 0.3));
  if (k <= 0 || o <= 0.01) return null;
  return <div style={{position: 'absolute', left: x - w / 2 - 6, top: y - 3 + 6, width: (w + 12) * k, height: 5, borderRadius: 3, background: CO, boxShadow: `0 0 12px ${CO}`, opacity: o, transform: 'rotate(-12deg)', transformOrigin: 'left center'}} />;
};

export const FullSvg: React.FC<{o?: number; children: React.ReactNode}> = ({o = 1, children}) =>
  o <= 0.01 ? null : (
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: o}}>
      {children}
    </svg>
  );
