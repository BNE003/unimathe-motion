import React from 'react';
import {C, MARGIN, W} from '../theme';
import {F} from '../fonts';
import {bump, clamp, easeInCubic, easeInOutCubic, easeOutCubic, lerp, springOS} from '../math';
import {Tex, col, useSec} from '../ui';
import {T} from './timeline';

export const show = (t: number, at: number, d = 0.4) => easeOutCubic(clamp((t - at) / d));
export const hide = (t: number, at: number, d = 0.35) => 1 - easeInCubic(clamp((t - at) / d));

// Farben: U und I Amber, V und II Cyan, Schnittgerade, w und t Koralle
export const UU = col(C.eig, 'U');
export const VV = col(C.cyan, 'V');
export const WW = col(C.lam, 'w');
export const TT = col(C.lam, 't');
export const CAP = `${UU} \\cap ${VV}`;
export const SUM = `${UU} + ${VV}`;

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

/* ---------- Aufgabenkarte: im Hook groß in der Mitte, ab „drei Schritten“ kompakt oben (unterhalb der Plattform-Kopfzeilen) ---------- */

export const CARD = {topHook: 560, hHook: 540, top: 300, h: 250};
export const cardM = (t: number) => easeInOutCubic(clamp((t - T.glide) / 1.2));

const SET_U = `${UU} = \\{\\, (x, y, z) \\in \\mathbb{R}^3 \\mid x + y + z = 0 \\,\\}`;
const SET_V = `${VV} = \\{\\, (x, y, z) \\in \\mathbb{R}^3 \\mid x - y + 2z = 0 \\,\\}`;
const QUESTIONS = ['1.  Bestimme eine Basis von U ∩ V.', '2.  Bestimme dim(U ∩ V).', '3.  Bestimme dim(U + V).'];
const CELLS = ['1.  Basis von U ∩ V', '2.  dim(U ∩ V)', '3.  dim(U + V)'];
const CELL_X = [28, 310, 614];

export const TaskCard: React.FC = () => {
  const t = useSec();
  const appear = springOS(clamp((t + 0.35) / 0.6));
  const m = cardM(t);
  const ans = [show(t, T.basis + 0.4, 0.6), show(t, T.dim1 + 0.4, 0.6), show(t, T.raum + 1.2, 0.6)];
  const ANS = [
    `\\text{1.}\\ \\{(-3, 1, 2)^T\\}\\ \\checkmark`,
    `\\text{2.}\\ \\dim(${CAP}) = 1\\ \\checkmark`,
    `\\text{3.}\\ \\dim(${SUM}) = 3\\ \\checkmark`,
  ];
  // Merkkarte: Karte gleitet in die Mitte, im CTA zieht sie sich zu einem Lichtpunkt zusammen
  const merk = easeInOutCubic(clamp((t - T.merk) / 0.9));
  const gone = easeInCubic(clamp((t - T.cta) / 0.55));
  if (gone >= 1) return null;
  const hiU = bump(t, T.uu - 0.1, 1.1);
  const hiV = bump(t, T.vv - 0.1, 1.1);
  const top = lerp(lerp(CARD.topHook, CARD.top, m), 820 - CARD.h / 2, merk);
  const h = lerp(CARD.hHook, CARD.h, m);
  const scale = lerp(1, 1.04, merk) * (1 - gone);
  const glow = Math.max(...ans.map((a, i) => bump(t, [T.basis, T.dim1, T.raum + 0.8][i] + 0.4, 1.0)));
  const setSize = lerp(44, 34, m);
  const qO = 1 - clamp(m * 2.2);
  const cO = clamp(m * 2.2 - 1.2);
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
        background: 'linear-gradient(180deg, rgba(20,22,52,.82), rgba(10,11,32,.78))',
        backdropFilter: 'blur(14px)',
        boxShadow: `0 30px 90px rgba(0,0,0,.35)${merk > 0 ? `, 0 30px 90px rgba(30,139,219,${0.25 * merk})` : ''}`,
        opacity: clamp(appear * 1.4) * (1 - gone * 0.6),
        transform: `translateY(${(1 - appear) * 30}px) scale(${scale})`,
      }}
    >
      <div style={{position: 'absolute', left: 36, top: lerp(34, 20, m), fontFamily: F.mono, fontSize: lerp(23, 19, m), letterSpacing: '.08em', color: C.txt2}}>KLAUSURAUFGABE · LINEARE ALGEBRA</div>
      <div style={{position: 'absolute', left: 36, top: lerp(100, 54, m), whiteSpace: 'nowrap', textShadow: hiU > 0 ? `0 0 ${26 * hiU}px rgba(255,194,71,${0.7 * hiU})` : undefined}}>
        <Tex tex={SET_U} size={setSize} />
      </div>
      <div style={{position: 'absolute', left: 36, top: lerp(178, 110, m), whiteSpace: 'nowrap', textShadow: hiV > 0 ? `0 0 ${26 * hiV}px rgba(0,200,200,${0.7 * hiV})` : undefined}}>
        <Tex tex={SET_V} size={setSize} />
      </div>
      {qO > 0 ? (
        <>
          <div style={{position: 'absolute', left: 36, right: 36, top: 270, height: 1.5, background: 'rgba(255,255,255,.12)', opacity: qO}} />
          {QUESTIONS.map((q, i) => (
            <div key={i} style={{position: 'absolute', left: 36, top: 300 + i * 70, fontFamily: F.body, fontWeight: 500, fontSize: 36, color: C.txt, opacity: qO}}>
              {q}
            </div>
          ))}
        </>
      ) : null}
      {cO > 0
        ? CELLS.map((c, i) => (
            <div key={i} style={{position: 'absolute', left: CELL_X[i], top: 180, height: 44, opacity: cO}}>
              <div style={{position: 'absolute', left: 0, top: 4, whiteSpace: 'nowrap', fontFamily: F.body, fontWeight: 500, fontSize: 26, color: C.txt2, opacity: 1 - ans[i]}}>
                {c}
              </div>
              {ans[i] > 0 ? (
                <div style={{position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap', opacity: ans[i], transform: `translateY(${(1 - ans[i]) * 10}px)`}}>
                  <Tex tex={ANS[i]} size={25} />
                </div>
              ) : null}
            </div>
          ))
        : null}
    </div>
  );
};

/* ---------- Fortschrittsleiste ---------- */

const STEP_NAMES = ['Schnitt', 'Basis & Dim.', 'U + V'];
const STEP_W = 300;
export const PROGRESS_Y = 574;
export const Q_TARGET: [number, number] = [MARGIN + 2 * (STEP_W + 18) + STEP_W - 50, PROGRESS_Y + 8];
// [aktiv ab, erledigt ab]
const STEP_T: [number, number][] = [
  [T.s1, T.s2],
  [T.s2, T.dim1 + 0.4],
  [T.s3, T.raum + 1.2],
];

export const Progress: React.FC = () => {
  const t = useSec();
  const out = hide(t, T.merk, 0.5);
  if (out <= 0) return null;
  return (
    <>
      {STEP_NAMES.map((name, i) => {
        const p = springOS(clamp((t - (T.steps + 0.3 + 0.18 * i)) / 0.6));
        if (p <= 0) return null;
        const [on, ok] = STEP_T[i];
        const st = t >= ok ? 'ok' : t >= on ? 'active' : 'idle';
        const pulse = Math.max(bump(t, on, 0.5), bump(t, ok, 0.5), i === 2 ? bump(t, T.raetsel, 0.7) : 0);
        const border = st === 'ok' ? C.txt : st === 'active' ? C.eig : 'rgba(255,255,255,.22)';
        // das offene Rätsel aus dem Hook wartet als „?“ an Schritt 3
        const q = i === 2 && st !== 'ok' ? clamp((t - (T.steps + 1.05)) / 0.2) : 0;
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
