import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C} from '../theme';
import {F, useTexFonts} from '../fonts';
import {V2, bump, clamp, easeInOutCubic, easeOutExpo, lerp, prog, sec, springOS} from '../math';
import {Backdrop, Grain, Mono, Tex, col, useSec} from '../ui';
import {COL, Scene} from './Canvas';
import {AB, BA, F_POS, M2, ap2, camOf, sheetPoint, worldCam} from './world';
import {MUSIC, SFX, SUBTITLES, T, V, VOICE, VOICE_GAPS} from './timeline';

const show = (t: number, at: number, d = 0.4) => easeOutExpo(clamp((t - at) / d));
const hide = (t: number, at: number, d = 0.35) => 1 - easeInOutCubic(clamp((t - at) / d));
const shadow = `0 0 14px ${C.bg}, 0 0 30px ${C.bg}`;

const A_ = col(COL.A, 'A');
const B_ = col(COL.B, 'B');

/* ---------- S1 · Pills über den Fs ---------- */

const Pill: React.FC<{x: number; y: number; o: number; children: React.ReactNode}> = ({x, y, o, children}) =>
  o <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: clamp(x, 190, 890),
        top: y,
        transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * o})`,
        opacity: o,
        padding: '10px 22px',
        borderRadius: 999,
        background: 'rgba(7,8,26,.66)',
        border: '1.5px solid rgba(243,244,251,.18)',
        fontFamily: F.body,
        fontWeight: 600,
        fontSize: 30,
        color: C.txt,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );

const Pills: React.FC = () => {
  const t = useSec();
  const cam = camOf(worldCam(t));
  const vis = (k: number) => {
    const on = k === 0 ? T.dreh1 + 0.95 : T.kipp2 + 0.9;
    const hook = show(t, on, 0.5) * hide(t, T.genau + 0.4);
    const back = show(t, T.bewegungen + 0.9, 0.5) * hide(t, T.cta - 0.4);
    return Math.max(hook, back);
  };
  return (
    <>
      {[0, 1].map((k) => {
        const o = vis(k);
        if (o <= 0) return null;
        const [x, y] = cam.p([F_POS[k][0], F_POS[k][1], F_POS[k][2] + 3.4]);
        return (
          <Pill key={k} x={x} y={Math.max(y, 330)} o={o}>
            {k === 0 ? 'kippen → drehen' : 'drehen → kippen'}
          </Pill>
        );
      })}
    </>
  );
};

/* ---------- S1/S2 · ≠ und „A·B ≠ B·A“ ---------- */

const TITLE_Y = 420;

const Title: React.FC = () => {
  const t = useSec();
  if (t < T.voellig - 0.05 || t > T.dive + 0.8) return null;
  const out = hide(t, T.dive, 0.5);
  // das ≠ springt zwischen den Fs auf und fliegt dann in den Titel
  const cam = camOf(worldCam(t));
  const mid = cam.p([0, 0, 6]);
  const fly = easeInOutCubic(clamp((t - (T.nicht - 0.3)) / 0.55));
  const pop = springOS(clamp((t - T.voellig) / 0.5));
  const nx = lerp(mid[0], 540, fly);
  const ny = lerp(mid[1], TITLE_Y, fly);
  const big = lerp(190, 120, fly);
  const ab = show(t, T.ab, 0.45);
  const ba = show(t, T.ba, 0.45);
  const word = (x: number, p: number, tex: string) =>
    p <= 0 ? null : (
      <div style={{position: 'absolute', left: x, top: TITLE_Y, transform: `translate(-50%, -50%) translateY(${(1 - p) * 24}px)`, opacity: p * out, textShadow: shadow, whiteSpace: 'nowrap'}}>
        <Tex tex={tex} size={120} />
      </div>
    );
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: nx,
          top: ny,
          transform: `translate(-50%, -50%) scale(${0.4 + 0.6 * pop})`,
          opacity: clamp(pop * 2) * out,
          textShadow: `0 0 40px rgba(255,122,92,.55), ${shadow}`,
        }}
      >
        <Tex tex={col(C.lam, '\\neq')} size={big} />
      </div>
      {word(318, ab, `${A_}\\cdot ${B_}`)}
      {word(762, ba, `${B_}\\cdot ${A_}`)}
    </AbsoluteFill>
  );
};

/* ---------- S3 · Chips für A und B ---------- */

const Chip: React.FC<{x: number; o: number; children: React.ReactNode; color: string}> = ({x, o, children, color}) =>
  o <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 360,
        transform: `translate(-50%, -50%) translateY(${(1 - o) * 18}px)`,
        opacity: o,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 28px',
        borderRadius: 22,
        background: 'rgba(7,8,26,.62)',
        border: `2px solid ${color}55`,
        fontFamily: F.body,
        fontWeight: 600,
        fontSize: 34,
        color: C.txt,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );

const Chips: React.FC = () => {
  const t = useSec();
  if (t < T.aDreht - 0.1 || t > T.split + 0.6) return null;
  const out = hide(t, T.split - 0.1, 0.4);
  const slide = easeInOutCubic(clamp((t - (T.bZieht - 0.15)) / 0.5));
  return (
    <>
      <Chip x={lerp(540, 300, slide)} o={show(t, T.aDreht) * out} color={COL.A}>
        <Tex tex={A_} size={46} /> dreht um 90°
      </Chip>
      <Chip x={770} o={show(t, T.bZieht) * out} color={COL.B}>
        <Tex tex={B_} size={46} /> zieht in die Breite
      </Chip>
    </>
  );
};

/* ---------- S4 · Beschriftung der Platten ---------- */

const LABEL = [318, 868];

const SheetLabels: React.FC = () => {
  const t = useSec();
  const p = show(t, T.split + 0.45, 0.5) * hide(t, T.bewegungen - 0.1, 0.5);
  if (p <= 0) return null;
  const sub = hide(t, T.pfeile - 0.25, 0.4);
  const items = [`${A_}\\cdot ${B_}`, `${B_}\\cdot ${A_}`];
  return (
    <>
      {items.map((tex, i) => {
        const [x1, x2] = i === 0 ? ['B', 'A'] : ['A', 'B'];
        return (
          <div key={i} style={{position: 'absolute', left: 72, top: LABEL[i], opacity: p, textShadow: shadow}}>
            <Tex tex={tex} size={64} />
            {sub > 0 ? (
              <div style={{marginTop: 10, opacity: sub, fontFamily: F.body, fontWeight: 600, fontSize: 32, color: C.txt2}}>
                erst <span style={{color: x1 === 'A' ? COL.A : COL.B}}>{x1}</span>, dann <span style={{color: x2 === 'A' ? COL.A : COL.B}}>{x2}</span>
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
};

/* ---------- S5 · Pfeilspitzen fliegen als Spalten in die Matrizen ---------- */

const ROW_Y = 1300;
const MAT = [
  {label: `${A_}${B_}`, lx: 250, cols: [306, 386], br: [266, 426], M: AB},
  {label: `${B_}${A_}`, lx: 680, cols: [736, 816], br: [696, 856], M: BA},
];
const NUM = 42;

// bg: dunkles Kärtchen, solange die Spalte noch an der Pfeilspitze über dem F steht
const ColVec: React.FC<{x: number; y: number; v: V2; color: string; size: number; o: number; bg: number}> = ({x, y, v, color, size, o, bg}) => (
  <div style={{position: 'absolute', left: x, top: y, opacity: o, textShadow: shadow}}>
    {bg > 0 ? (
      <div style={{position: 'absolute', left: -size * 0.75, top: -size * 1.45, width: size * 1.5, height: size * 2.9, borderRadius: 12, background: 'rgba(7,8,26,.8)', opacity: bg}} />
    ) : null}
    {[0, 1].map((r) => (
      <div key={r} style={{position: 'absolute', left: 0, top: (r - 0.5) * size * 1.38, transform: 'translate(-50%, -50%)'}}>
        <Tex tex={col(color, String(v[r]))} size={size} />
      </div>
    ))}
  </div>
);

const Paren: React.FC<{x: number; side: 'l' | 'r'; o: number}> = ({x, side, o}) => {
  const h = 132;
  const d = side === 'l' ? `M 22 4 Q 0 ${h / 2} 22 ${h - 4}` : `M 4 4 Q 26 ${h / 2} 4 ${h - 4}`;
  return (
    <svg width={26} height={h} style={{position: 'absolute', left: x - 13, top: ROW_Y - h / 2, opacity: o, overflow: 'visible'}}>
      <path d={d} fill="none" stroke={C.txt} strokeWidth={3.5} strokeLinecap="round" />
    </svg>
  );
};

const Matrices: React.FC = () => {
  const t = useSec();
  if (t < T.pfeile) return null;
  const out = hide(t, T.cta - 0.5, 0.45);
  const frame = show(t, T.zahlen + 0.1, 0.5) * out;
  const neq = springOS(clamp((t - T.matrix) / 0.5)) * out;
  const els: React.ReactNode[] = [];
  MAT.forEach((m, i) => {
    els.push(
      <div key={`l${i}`} style={{position: 'absolute', left: m.lx, top: ROW_Y, transform: 'translate(-100%, -50%)', opacity: frame, textShadow: shadow, whiteSpace: 'nowrap'}}>
        <Tex tex={`${m.label} =`} size={46} />
      </div>,
      <Paren key={`pl${i}`} x={m.br[0]} side="l" o={frame} />,
      <Paren key={`pr${i}`} x={m.br[1]} side="r" o={frame} />,
    );
    [0, 1].forEach((j) => {
      const v: V2 = [m.M[0][j], m.M[1][j]];
      const e: V2 = j === 0 ? [1, 0] : [0, 1];
      // Spitze des Bildpfeils auf der Platte, Etikett etwas weiter außen
      const tip = sheetPoint(i, t, ap2(m.M as M2, e));
      const o0 = sheetPoint(i, t, [0, 0]);
      const dx = tip[0] - o0[0];
      const dy = tip[1] - o0[1];
      const L = Math.hypot(dx, dy) || 1;
      const lab: V2 = [tip[0] + (dx / L) * 62, tip[1] + (dy / L) * 62];
      const appear = show(t, T.pfeile + 0.3 + 0.18 * j + 0.35 * i, 0.4);
      const fly = easeInOutCubic(clamp((t - (T.zahlen + 0.12 + 0.2 * (2 * i + j))) / 0.7));
      const x = lerp(lab[0], m.cols[j], fly);
      const y = lerp(lab[1], ROW_Y, fly);
      els.push(<ColVec key={`c${i}${j}`} x={x} y={y} v={v} color={j === 0 ? COL.e1 : COL.e2} size={lerp(34, NUM, fly)} o={appear * out} bg={1 - fly} />);
    });
  });
  return (
    <AbsoluteFill>
      {els}
      {neq > 0 ? (
        <div style={{position: 'absolute', left: 474, top: ROW_Y, transform: `translate(-50%, -50%) scale(${0.5 + 0.5 * neq})`, opacity: clamp(neq * 2), textShadow: `0 0 30px rgba(255,122,92,.5)`}}>
          <Tex tex={col(C.lam, '\\neq')} size={64} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- S7 · UniMathe & CTA ---------- */

const Centered: React.FC<{y: number; at: number; size: number; color?: string; weight?: number; children: React.ReactNode}> = ({y, at, size, color = C.txt, weight = 800, children}) => {
  const t = useSec();
  const p = easeOutExpo(clamp((t - at) / 0.6));
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y,
        textAlign: 'center',
        fontFamily: F.display,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: weight >= 800 ? '-.035em' : '-.01em',
        color,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
        filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

const SearchPill: React.FC = () => {
  const t = useSec();
  const p = springOS(clamp((t - (T.search + 0.2)) / 0.7));
  if (p <= 0) return null;
  const word = 'UniMathe';
  const n = Math.max(0, Math.min(word.length, Math.floor((t - T.tippt - 0.35) / 0.075) + 1));
  const caret = Math.floor(t * 2.2) % 2 === 0 || n < word.length;
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - 300,
        top: 1310,
        width: 600,
        height: 100,
        borderRadius: 999,
        background: 'rgba(243,244,251,.96)',
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        padding: '0 36px',
        boxSizing: 'border-box',
        opacity: clamp(p * 1.4),
        transform: `scale(${0.85 + 0.15 * p})`,
        boxShadow: '0 20px 70px rgba(30,139,219,.35)',
      }}
    >
      <svg width={40} height={40} viewBox="0 0 40 40">
        <circle cx={17} cy={17} r={11} fill="none" stroke={C.bg} strokeWidth={4} />
        <line x1={25} y1={25} x2={35} y2={35} stroke={C.bg} strokeWidth={4} strokeLinecap="round" />
      </svg>
      <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 48, color: C.bg}}>
        {word.slice(0, n)}
        <span style={{opacity: caret ? 1 : 0, color: C.blue, fontWeight: 400}}>|</span>
      </span>
    </div>
  );
};

const Outro: React.FC = () => {
  const t = useSec();
  if (t < T.cta + 0.1) return null;
  const logo = springOS(clamp((t - (T.cta + 0.3)) / 0.9));
  const star = bump(t, T.cta + 0.3, 0.6);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 540 - 160,
          top: 790 - 160,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(243,244,251,${0.9 * star}) 0%, rgba(30,139,219,${0.35 * star}) 30%, rgba(30,139,219,0) 70%)`,
        }}
      />
      {logo > 0 ? (
        <Img
          src={staticFile('unimathe-logo.webp')}
          style={{
            position: 'absolute',
            left: 540 - 130,
            top: 790 - 130,
            width: 260,
            height: 260,
            borderRadius: 58,
            opacity: clamp(logo * 1.4),
            transform: `scale(${0.6 + 0.4 * logo})`,
            boxShadow: '0 30px 90px rgba(30,139,219,.4)',
          }}
        />
      ) : null}
      <Centered y={950} at={T.cta + 0.6} size={112}>
        UniMathe
      </Centered>
      <Centered y={1094} at={T.name} size={40} color={C.txt2} weight={600}>
        Mathe verstehen.
      </Centered>
      <Centered y={1146} at={T.name + 0.35} size={40} color={C.txt2} weight={600}>
        Für die Klausur üben.
      </Centered>
      <Mono x={540} y={1258} at={T.search} anchor="center" color={C.txt2}>
        Im App Store suchen
      </Mono>
      <SearchPill />
    </AbsoluteFill>
  );
};

/* ---------- Untertitel, Blitz ---------- */

const CUES = SUBTITLES.map(([a, b, text], i) => {
  const from = V(a) - 0.05;
  const next = SUBTITLES[i + 1] ? V(SUBTITLES[i + 1][0]) - 0.1 : Infinity;
  return {from, to: Math.min(V(b) + 0.35, next), text};
});

// liegt über der Bildunterschrift von TikTok, Reels und Shorts
const SUB_TOP = 1446;

const Subtitles: React.FC = () => {
  const t = useSec();
  const c = CUES.find(({from, to}) => t >= from && t < to);
  if (!c) return null;
  const o = clamp((t - c.from) / 0.12) * clamp((c.to - t) / 0.12);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: SUB_TOP, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div
        style={{
          maxWidth: 800,
          padding: '8px 18px',
          borderRadius: 12,
          background: 'rgba(7,8,26,.62)',
          fontFamily: F.body,
          fontWeight: 500,
          fontSize: 30,
          lineHeight: 1.3,
          color: 'rgba(243,244,251,.88)',
          textAlign: 'center',
        }}
      >
        {c.text}
      </div>
    </div>
  );
};

const Flash: React.FC = () => {
  const t = useSec();
  const f = Math.max(bump(t, T.voellig, 0.45), bump(t, T.matrix + 0.05, 0.4) * 0.7);
  return f > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.1 * f}} /> : null;
};

/* ---------- Komposition ---------- */

// Die Sprachdatei in Stücke zwischen den Schnittstellen teilen; jedes Stück startet um die bisher eingefügte Stille später
const cuts = [0, ...VOICE_GAPS.map(([c]) => c), Infinity];
const PIECES = cuts.slice(0, -1).map((from, i) => ({
  from,
  to: cuts[i + 1],
  delay: VOICE_GAPS.slice(0, i).reduce((s, [, g]) => s + g, 0),
}));

export type ABProps = {music: boolean; voice: boolean};

export const VideoAB: React.FC<ABProps> = ({music, voice}) => {
  useTexFonts();
  const t = useSec();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={lerp(980, 1150, prog(t, T.dive, 1.2))} strength={0.85} />
      <Scene />
      <Pills />
      <Title />
      <Chips />
      <SheetLabels />
      <Matrices />
      <Outro />
      <Subtitles />
      <Flash />
      <Grain />
      {SFX.map(([at, name, vol], i) => (
        <Sequence key={`sfx-${i}`} from={sec(at)} durationInFrames={sec(3.5)} layout="none">
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol * (voice ? 0.55 : 0.8)} />
        </Sequence>
      ))}
      {music ? <Audio src={staticFile(MUSIC)} volume={voice ? 0.32 : 0.6} /> : null}
      {voice
        ? PIECES.map(({from, to, delay}) => (
            <Sequence key={from} from={sec(from + delay)} durationInFrames={Number.isFinite(to) ? sec(to - from) : undefined} layout="none">
              <Audio src={staticFile(VOICE)} trimBefore={sec(from)} trimAfter={Number.isFinite(to) ? sec(to) : undefined} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
