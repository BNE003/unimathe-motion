import React from 'react';
import {C, MARGIN, W} from '../theme';
import {F} from '../fonts';
import {bump, clamp, easeInCubic, easeInOutCubic, easeOutCubic, lerp, springOS} from '../math';
import {Tex, col, useSec} from '../ui';
import {T} from './timeline';

export const show = (t: number, at: number, d = 0.4) => easeOutCubic(clamp((t - at) / d));
export const hide = (t: number, at: number, d = 0.35) => 1 - easeInCubic(clamp((t - at) / d));

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
        textShadow: `0 0 12px ${C.bg}, 0 0 24px ${C.bg}`,
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

/* ---------- Aufgabenkarte: groß in der Mitte, solange die Aufgabe genannt wird, danach kompakt oben (unterhalb der Plattform-Kopfzeilen) ---------- */

export const CARD = {topHook: 640, hHook: 640, top: 300, h: 250};
export const cardM = (t: number) => easeInOutCubic(clamp((t - T.glide) / 1.2));

const MAT_A = 'A = \\begin{pmatrix} 1 & 1 & 0 \\\\ 0 & 1 & 1 \\\\ 1 & 2 & 1 \\end{pmatrix}';
const QUESTIONS = ['1.  Bestimme eine Basis des Kerns von f.', '2.  Bestimme eine Basis des Bildes von f.', '3.  Bestimme den Rang von f und dim Kern f.'];
const CELLS = ['1.  Basis Kern', '2.  Basis Bild', '3.  Rang, dim Kern'];
export const CELL_X = [28, 300, 624];
export const CELL_Y = 186;
const ANS = [
  `\\text{1.}\\ \\{(1,-1,1)^T\\}\\ \\checkmark`,
  `\\text{2.}\\ \\{(1,0,1)^T,\\,(0,1,1)^T\\}\\ \\checkmark`,
  `\\text{3.}\\ \\operatorname{rg} = 2,\\ \\dim \\operatorname{Kern} = 1\\ \\checkmark`,
];
export const ANS_T = () => [T.kernCard + 0.6, T.bildCard + 0.6, T.dimk + 0.6];

export const TaskCard: React.FC = () => {
  const t = useSec();
  const appear = springOS(clamp((t - (T.klausur - 0.15)) / 0.6));
  if (appear <= 0) return null;
  const m = cardM(t);
  const at = ANS_T();
  const ans = at.map((a) => show(t, a, 0.6));
  // Merkkarte: Karte gleitet in die Mitte, im CTA zieht sie sich zu einem Lichtpunkt zusammen
  const merk = easeInOutCubic(clamp((t - T.merk) / 0.9));
  const gone = easeInCubic(clamp((t - T.cta) / 0.55));
  if (gone >= 1) return null;
  const top = lerp(lerp(CARD.topHook, CARD.top, m), 860 - CARD.h / 2, merk);
  const h = lerp(CARD.hHook, CARD.h, m);
  const scale = lerp(1, 1.04, merk) * (1 - gone);
  const glow = Math.max(...at.map((a) => bump(t, a, 1.0)));
  const hookO = 1 - clamp(m * 2.2);
  const cO = clamp(m * 2.2 - 1.2);
  const qHi = [T.qKern, T.qBild, T.qRang].map((q) => bump(t, q - 0.1, 1.2));
  return (
    <div
      style={{
        position: 'absolute',
        left: MARGIN,
        top,
        width: W - 2 * MARGIN,
        height: h,
        boxSizing: 'border-box',
        borderRadius: lerp(28, 22, m),
        border: `1.5px solid rgba(255,255,255,${0.18 + 0.3 * Math.max(ans[2], glow)})`,
        background: 'linear-gradient(180deg, rgba(20,22,52,.84), rgba(10,11,32,.8))',
        backdropFilter: 'blur(14px)',
        boxShadow: `0 30px 90px rgba(0,0,0,.35)${merk > 0 ? `, 0 30px 90px rgba(30,139,219,${0.25 * merk})` : ''}`,
        opacity: clamp(appear * 1.4) * (1 - gone * 0.6),
        transform: `translateY(${(1 - appear) * 30}px) scale(${scale * (0.96 + 0.04 * appear)})`,
      }}
    >
      <div style={{position: 'absolute', left: 36, top: lerp(34, 20, m), fontFamily: F.mono, fontSize: lerp(23, 19, m), letterSpacing: '.08em', color: C.txt2}}>KLAUSURAUFGABE · LINEARE ALGEBRA</div>
      {hookO > 0 ? (
        <div style={{position: 'absolute', left: 36, top: 92, whiteSpace: 'nowrap', opacity: hookO}}>
          <Tex tex={'\\text{Gegeben: }\\ f\\colon \\mathbb{R}^3 \\to \\mathbb{R}^3,\\ \\ f(x) = A\\,x'} size={38} />
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 36, top: lerp(158, 52, m), whiteSpace: 'nowrap'}}>
        <Tex tex={MAT_A} size={lerp(42, 27, m)} />
      </div>
      {cO > 0 ? (
        <div style={{position: 'absolute', left: 300, top: 92, whiteSpace: 'nowrap', opacity: cO}}>
          <Tex tex={'f\\colon \\mathbb{R}^3 \\to \\mathbb{R}^3,\\ \\ f(x) = A\\,x'} size={30} />
        </div>
      ) : null}
      {hookO > 0 ? (
        <>
          <div style={{position: 'absolute', left: 36, right: 36, top: 372, height: 1.5, background: 'rgba(255,255,255,.12)', opacity: hookO}} />
          {QUESTIONS.map((q, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 36,
                top: 398 + i * 70,
                fontFamily: F.body,
                fontWeight: 500,
                fontSize: 34,
                color: C.txt,
                opacity: hookO,
                textShadow: qHi[i] > 0 ? `0 0 ${22 * qHi[i]}px rgba(255,194,71,${0.8 * qHi[i]})` : undefined,
              }}
            >
              {q}
            </div>
          ))}
        </>
      ) : null}
      {cO > 0
        ? CELLS.map((c, i) => (
            <div key={i} style={{position: 'absolute', left: CELL_X[i], top: CELL_Y, height: 44, opacity: cO}}>
              <div style={{position: 'absolute', left: 0, top: 4, whiteSpace: 'nowrap', fontFamily: F.body, fontWeight: 500, fontSize: 25, color: C.txt2, opacity: 1 - ans[i]}}>
                {c}
              </div>
              {ans[i] > 0 ? (
                <div style={{position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap', opacity: ans[i], transform: `translateY(${(1 - ans[i]) * 10}px)`}}>
                  <Tex tex={ANS[i]} size={22} />
                </div>
              ) : null}
            </div>
          ))
        : null}
    </div>
  );
};

/* ---------- Fortschrittsleiste ---------- */

const STEP_NAMES = ['Kern', 'Bild', 'Rang'];
const STEP_W = 300;
export const PROGRESS_Y = 574;
// [aktiv ab, erledigt ab]
const stepT = (): [number, number][] => [
  [T.s1, T.kernCard + 0.6],
  [T.s2, T.bildCard + 0.6],
  [T.s3, T.dimk + 0.6],
];

export const Progress: React.FC = () => {
  const t = useSec();
  const out = hide(t, T.merk, 0.5);
  if (out <= 0) return null;
  const ST = stepT();
  return (
    <>
      {STEP_NAMES.map((name, i) => {
        const p = springOS(clamp((t - (T.steps + 0.3 + 0.18 * i)) / 0.6));
        if (p <= 0) return null;
        const [on, ok] = ST[i];
        const st = t >= ok ? 'ok' : t >= on ? 'active' : 'idle';
        const pulse = Math.max(bump(t, on, 0.5), bump(t, ok, 0.5), i === 1 ? bump(t, T.close, 0.7) : 0);
        const border = st === 'ok' ? C.txt : st === 'active' ? C.eig : 'rgba(255,255,255,.22)';
        // die offene Frage aus dem Hook („welche Spalte ist überflüssig?“) wartet als „?“ an Schritt 2
        const q = i === 1 && st !== 'ok' ? clamp((t - (T.steps + 1.05)) / 0.2) : 0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: MARGIN + i * (STEP_W + 18),
              top: PROGRESS_Y,
              width: STEP_W,
              height: 62,
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
            {q > 0 ? (
              <span style={{marginLeft: 'auto', marginRight: 18, fontFamily: F.display, fontWeight: 800, fontSize: 32, color: C.lam, opacity: q, textShadow: `0 0 ${10 + 20 * pulse}px rgba(255,122,92,.7)`}}>?</span>
            ) : null}
          </div>
        );
      })}
    </>
  );
};
