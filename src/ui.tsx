import React, {useMemo} from 'react';
import katex from 'katex';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FPS, H, MARGIN, W} from './theme';
import {F} from './fonts';
import {clamp, easeInCubic, easeOutCubic, easeOutExpo, springOS} from './math';

export const useSec = () => useCurrentFrame() / FPS;

/* ---------- Hintergrund, Korn, Vignette ---------- */

export const Backdrop: React.FC<{gx?: number; gy?: number; strength?: number}> = ({gx = 540, gy = 1100, strength = 1}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle 900px at ${gx}px ${gy}px, rgba(75,43,230,${0.3 * strength}) 0%, rgba(75,43,230,${0.06 * strength}) 55%, rgba(75,43,230,0) 100%), ${C.bg}`,
    }}
  />
);

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 97;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: 0.5}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter="url(#grain)" opacity={0.5} />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 65% at 50% 48%, transparent 55%, rgba(0,0,0,.6) 100%)'}} />
    </AbsoluteFill>
  );
};

/* ---------- Swiss-Elemente ---------- */

export const Header: React.FC<{index: string; label: string; at: number; out?: number}> = ({index, label, at, out}) => {
  const t = useSec();
  const p = easeOutExpo(clamp((t - at) / 0.6));
  const q = out !== undefined ? easeInCubic(clamp((t - out) / 0.35)) : 0;
  if (p <= 0 || q >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: MARGIN,
        top: 236,
        display: 'flex',
        gap: 18,
        alignItems: 'center',
        fontFamily: F.mono,
        fontWeight: 500,
        fontSize: 24,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: C.txt2,
        opacity: p * (1 - q),
        transform: `translateY(${(1 - p) * 14 - q * 14}px)`,
      }}
    >
      <span style={{color: C.txt}}>{index}</span>
      <span style={{width: 44 * p, height: 3, background: C.eig, display: 'inline-block'}} />
      <span>{label}</span>
    </div>
  );
};

export const Hairline: React.FC<{y: number; at: number; out?: number}> = ({y, at, out}) => {
  const t = useSec();
  const p = easeOutExpo(clamp((t - at) / 0.8));
  const q = out !== undefined ? easeInCubic(clamp((t - out) / 0.35)) : 0;
  if (p <= 0 || q >= 1) return null;
  const x2 = MARGIN + (W - 2 * MARGIN) * p;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 1 - q}}>
      <line x1={MARGIN} y1={y} x2={x2} y2={y} stroke="#fff" strokeOpacity={0.16} />
      <line x1={MARGIN} y1={y - 10} x2={MARGIN} y2={y + 10} stroke="#fff" strokeOpacity={0.4} strokeWidth={1.5} />
      {p > 0.98 ? <line x1={W - MARGIN} y1={y - 10} x2={W - MARGIN} y2={y + 10} stroke="#fff" strokeOpacity={0.4} strokeWidth={1.5} /> : null}
    </svg>
  );
};

export type Seg = [string, string?];

// Headline: Wort für Wort, 70 ms versetzt
export const Headline: React.FC<{
  lines: Seg[][];
  at: number;
  out?: number;
  x?: number;
  y?: number;
  size?: number;
  lineAt?: number[];
  weight?: number;
  lineHeight?: number;
}> = ({lines, at, out, x = MARGIN - 6, y = 300, size = 108, lineAt, weight = 800, lineHeight = 0.98}) => {
  const t = useSec();
  let wi = 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        fontFamily: F.display,
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        letterSpacing: weight >= 800 ? '-.035em' : '-.02em',
        whiteSpace: 'nowrap',
      }}
    >
      {lines.map((line, li) => {
        const start = lineAt?.[li] ?? at;
        let lw = 0;
        return (
          <div key={li}>
            {line.flatMap(([text, color], si) =>
              text.split(/(\s+)/).map((word, k) => {
                if (word.trim() === '') return <span key={`${si}-${k}`}>{word}</span>;
                const i = lw++;
                const g = wi++;
                const p = easeOutExpo(clamp((t - start - i * 0.07) / 0.55));
                const q = out !== undefined ? easeInCubic(clamp((t - out - g * 0.03) / 0.35)) : 0;
                return (
                  <span
                    key={`${si}-${k}`}
                    style={{
                      display: 'inline-block',
                      color: color ?? C.txt,
                      opacity: p * (1 - q),
                      transform: `translateY(${(1 - p) * 0.42 * size - q * 0.3 * size}px)`,
                      filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
                    }}
                  >
                    {word}
                  </span>
                );
              }),
            )}
          </div>
        );
      })}
    </div>
  );
};

export const Mono: React.FC<{x: number; y: number; at: number; out?: number; color?: string; size?: number; children: React.ReactNode; anchor?: 'left' | 'center' | 'right'; upper?: boolean}> = ({
  x,
  y,
  at,
  out,
  color = C.txt2,
  size = 22,
  children,
  anchor = 'left',
  upper = true,
}) => {
  const t = useSec();
  const p = easeOutCubic(clamp((t - at) / 0.4));
  const q = out !== undefined ? easeInCubic(clamp((t - out) / 0.3)) : 0;
  if (p <= 0 || q >= 1) return null;
  const tx = anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${tx}, ${(1 - p) * 10}px)`,
        fontFamily: F.mono,
        fontWeight: 500,
        fontSize: size,
        letterSpacing: upper ? '.08em' : '.02em',
        textTransform: upper ? 'uppercase' : 'none',
        color,
        opacity: p * (1 - q),
        whiteSpace: 'nowrap',
        textShadow: `0 0 10px ${C.bg}, 0 0 22px ${C.bg}`,
      }}
    >
      {children}
    </div>
  );
};

/* ---------- Formeln ---------- */

export const Tex: React.FC<{tex: string; size: number; style?: React.CSSProperties}> = ({tex, size, style}) => {
  const html = useMemo(() => katex.renderToString(tex, {throwOnError: true, strict: false}), [tex]);
  return <span style={{fontSize: size, lineHeight: 1, color: C.txt, ...style}} dangerouslySetInnerHTML={{__html: html}} />;
};

export const col = (hex: string, s: string) => `\\textcolor{${hex}}{${s}}`;

// 2×2-Matrix mit eigener Geometrie, damit Spalten hervorgehoben und Einträge bewegt werden können.
// (x, y) = Mitte des Eintragsblocks
export const MatrixView: React.FC<{
  x: number;
  y: number;
  size: number;
  entries?: [[string, string], [string, string]];
  prefix?: boolean;
  colGlow?: [number, number];
  opacity?: number;
  entryColor?: string;
}> = ({x, y, size, entries = [['2', '1'], ['1', '2']], prefix = true, colGlow = [0, 0], opacity = 1, entryColor = C.txt}) => {
  const cdx = size * 1.56;
  const rdy = size * 1.37;
  const parenH = rdy + size * 1.25;
  const lp = x - cdx / 2 - size * 0.78;
  const rp = x + cdx / 2 + size * 0.78;
  const top = y - parenH / 2;
  const bot = y + parenH / 2;
  const bw = size * 0.2;
  const sw = size * 0.065;
  const glyph = (txt: string, cx: number, cy: number, extra: React.CSSProperties = {}) => (
    <div
      style={{
        position: 'absolute',
        left: cx,
        top: cy,
        transform: 'translate(-50%, -50%)',
        fontFamily: F.texMain,
        fontSize: size,
        lineHeight: 1,
        color: entryColor,
        ...extra,
      }}
    >
      {txt}
    </div>
  );
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      {[0, 1].map((c) =>
        colGlow[c] > 0 ? (
          <div
            key={c}
            style={{
              position: 'absolute',
              left: x + (c === 0 ? -cdx / 2 : cdx / 2) - size * 0.55,
              top: y - rdy / 2 - size * 0.62,
              width: size * 1.1,
              height: rdy + size * 1.24,
              borderRadius: size * 0.22,
              background: `rgba(166,173,211,${0.22 * colGlow[c]})`,
              transform: `scale(${0.9 + 0.1 * colGlow[c]})`,
            }}
          />
        ) : null,
      )}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <path d={`M${lp + bw},${top} Q${lp - bw},${y} ${lp + bw},${bot}`} fill="none" stroke={entryColor} strokeWidth={sw} strokeLinecap="round" />
        <path d={`M${rp - bw},${top} Q${rp + bw},${y} ${rp - bw},${bot}`} fill="none" stroke={entryColor} strokeWidth={sw} strokeLinecap="round" />
      </svg>
      {glyph(entries[0][0], x - cdx / 2, y - rdy / 2)}
      {glyph(entries[0][1], x + cdx / 2, y - rdy / 2)}
      {glyph(entries[1][0], x - cdx / 2, y + rdy / 2)}
      {glyph(entries[1][1], x + cdx / 2, y + rdy / 2)}
      {prefix ? (
        <>
          {glyph('=', lp - size * 0.86, y)}
          {glyph('A', lp - size * 1.9, y, {fontFamily: F.texMath, fontStyle: 'italic', color: C.cyan})}
        </>
      ) : null}
    </div>
  );
};

// A v = 3 v  →  A v = λ v  (feste Boxbreiten in em, damit Beschriftungen exakt sitzen)
export const FORMULA_BOX = {A: [0, 0.8], v1: [0.8, 1.46], eq: [1.46, 2.76], k: [2.76, 3.42], v2: [3.42, 4.08]} as const;
export const formulaCenter = (key: keyof typeof FORMULA_BOX) => (FORMULA_BOX[key][0] + FORMULA_BOX[key][1]) / 2;

export const EigenFormula: React.FC<{
  x: number;
  y: number;
  size: number;
  morph?: number;
  vGlow?: number;
  opacity?: number;
}> = ({x, y, size, morph = 0, vGlow = 0, opacity = 1}) => {
  const box = (key: keyof typeof FORMULA_BOX, content: React.ReactNode) => (
    <div
      style={{
        position: 'absolute',
        left: FORMULA_BOX[key][0] * size,
        width: (FORMULA_BOX[key][1] - FORMULA_BOX[key][0]) * size,
        top: 0,
        height: size * 1.2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {content}
    </div>
  );
  const v = (
    <span
      style={{
        fontFamily: F.texMain,
        fontWeight: 700,
        color: C.eig,
        textShadow: vGlow > 0 ? `0 0 ${24 * vGlow}px rgba(255,194,71,${0.9 * vGlow})` : undefined,
      }}
    >
      v
    </span>
  );
  const m = springOS(morph);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 4.1 * size, height: size * 1.2, fontSize: size, lineHeight: 1, opacity}}>
      {box('A', <span style={{fontFamily: F.texMath, fontStyle: 'italic', color: C.cyan}}>A</span>)}
      {box('v1', v)}
      {box('eq', <span style={{fontFamily: F.texMain, color: C.txt}}>=</span>)}
      {box(
        'k',
        <div style={{position: 'relative', width: '100%', height: '100%'}}>
          <span
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              fontFamily: F.texMain,
              color: C.lam,
              opacity: 1 - clamp(morph * 1.6),
              transform: `translate(-50%, ${-50 - 60 * morph}%)`,
            }}
          >
            3
          </span>
          <span
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              fontFamily: F.texMath,
              fontStyle: 'italic',
              color: C.lam,
              opacity: clamp(morph * 1.6 - 0.2),
              transform: `translate(-50%, ${-50 + 70 * (1 - m)}%) scale(${0.6 + 0.4 * m})`,
            }}
          >
            λ
          </span>
        </div>,
      )}
      {box('v2', v)}
    </div>
  );
};
