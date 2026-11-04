import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C, MARGIN} from '../theme';
import {F} from '../fonts';
import {useTexFonts} from '../fonts';
import {bump, clamp, easeOutExpo, sec, springOS} from '../math';
import {Backdrop, Grain, Mono, Tex, useSec} from '../ui';
import {ASlider, Stage} from './Stage';
import {AA, Band, ColVec, Fly, Fx, L1, L2, L3, Progress, Tag, TaskCard, hide, show, v1, v2, v3} from './parts';
import {MUSIC, SFX, SUBTITLES, T, V, VOICE, VOICE_GAPS} from './timeline';

const R = 40; // Schriftgröße der Rechenzeilen

/* ---------- S2 · Schritt 1: Ansatz ---------- */

const COMB = {top: 640, rowH: 56};
const combMid = COMB.top + (COMB.rowH * 3) / 2 - 24;
const LGS = [`${L1} + ${L3} = 0`, `${L1} + ${L2} + 2${L3} = 0`, `${L2} + ${AA}${L3} = 0`];
const ROMAN = ['I', 'II', 'III'];
const S2_EQ_Y = (k: number) => 910 + k * 62;
const S3_EQ_Y = (k: number) => 640 + k * 60;

const Ansatz: React.FC = () => {
  const t = useSec();
  const out = T.s2;
  const q = hide(t, out);
  if (t < T.s1 - 0.2 || q <= 0) return null;
  const nullAt = V(19.4);
  const vec = (e: string[], x: number, at: number) => <ColVec entries={e} x={x} y={COMB.top} w={78} rowH={COMB.rowH} size={40} opacity={show(t, at, 0.45) * q} />;
  return (
    <>
      <Tag text="SCHRITT 1 · ANSATZ" x={MARGIN} y={596} at={T.s1} out={out} color={C.eig} />
      {T.rows.map((r, k) => (
        <Band key={k} x={118} y={COMB.top + k * COMB.rowH + 2} w={610} h={COMB.rowH - 4} o={show(t, r - 0.25, 0.25) * hide(t, r + 1.0, 0.4)} />
      ))}
      <Fx tex={L1} x={72} y={combMid} at={T.setz} out={out} size={44} />
      {vec(['1', '1', '0'], 126, T.setz)}
      <Fx tex="+" x={214} y={combMid} at={T.setz + 0.3} out={out} size={44} />
      <Fx tex={L2} x={256} y={combMid} at={T.setz + 0.3} out={out} size={44} />
      {vec(['0', '1', '1'], 310, T.setz + 0.3)}
      <Fx tex="+" x={398} y={combMid} at={T.setz + 0.6} out={out} size={44} />
      <Fx tex={L3} x={440} y={combMid} at={T.setz + 0.6} out={out} size={44} />
      {vec(['1', '2', AA], 494, T.setz + 0.6)}
      <Fx tex="=" x={590} y={combMid} at={nullAt} out={out} size={44} />
      {vec(['0', '0', '0'], 640, nullAt)}
      <Fx
        tex={`\\text{linear abhängig} \\iff \\text{Lösung mit nicht allen } \\lambda_i = 0`}
        x={72}
        y={838}
        at={T.def + 0.3}
        out={out}
        size={32}
        box={bump(t, T.nichtAlle, 1.4)}
      />
      {LGS.map((tex, k) => (
        <React.Fragment key={k}>
          <Tag text={ROMAN[k]} x={MARGIN} y={S2_EQ_Y(k) + 10} at={T.rows[k] + 0.3} out={out} size={24} />
          <Fx tex={tex} x={150} y={S2_EQ_Y(k)} at={T.rows[k]} out={out} size={R} from={[150, COMB.top + k * COMB.rowH + 6]} />
        </React.Fragment>
      ))}
    </>
  );
};

/* ---------- S3 · Schritt 2: Lösen ---------- */

const Y_A = 852;
const Y_B = 928;
const Y_C = 1004;
const X_EQ = 230;

const Loesen: React.FC = () => {
  const t = useSec();
  const out = T.raum - 0.3;
  if (t < T.s2 - 0.1 || t > out + 0.5) return null;
  const leftDim = show(t, T.heisst, 0.6);
  const rightHi = show(t, T.heisst, 0.6);
  const panelIn = show(t, T.entscheidet, 0.5) * hide(t, out);
  const lgsBand = (k: number, a: number, b: number) => (
    <Band x={140} y={S3_EQ_Y(k) - 6} w={420} h={56} o={show(t, a, 0.3) * hide(t, b, 0.4)} />
  );
  const panel = (x: number, w: number, label: string, dim: number, hi: number) => (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 1080,
        width: w,
        height: 316,
        boxSizing: 'border-box',
        borderRadius: 20,
        border: `2px solid rgba(${hi > 0 ? '243,244,251' : '255,255,255'},${0.18 + 0.5 * hi})`,
        background: 'rgba(255,255,255,.03)',
        boxShadow: hi > 0 ? `0 0 ${36 * hi}px rgba(243,244,251,${0.15 * hi})` : undefined,
        opacity: panelIn * (1 - 0.6 * dim),
        transform: `translateY(${(1 - panelIn) * 20}px)`,
      }}
    >
      <div style={{position: 'absolute', left: 22, top: 16}}>
        <Tex tex={label} size={36} />
      </div>
    </div>
  );
  return (
    <>
      <Tag text="SCHRITT 2 · LÖSEN" x={MARGIN} y={596} at={T.s2} out={out} color={C.eig} />
      {lgsBand(0, T.umstellen, T.r1 + 1.4)}
      {lgsBand(1, T.einsetzen, T.r2 + 1.2)}
      {lgsBand(2, T.beides, T.r3 + 1.2)}
      {LGS.map((tex, k) => (
        <React.Fragment key={k}>
          <Tag text={ROMAN[k]} x={MARGIN} y={S3_EQ_Y(k) + 8} at={T.s2} out={out} size={24} />
          <Fx tex={tex} x={150} y={S3_EQ_Y(k)} at={T.s2} out={out} size={R} from={[150, S2_EQ_Y(k)]} />
        </React.Fragment>
      ))}
      <div style={{position: 'absolute', left: MARGIN, top: 820, width: 936, height: 1.5, background: 'rgba(255,255,255,.12)', opacity: show(t, T.umstellen) * hide(t, out)}} />

      {/* aus I */}
      <Tag text="aus I" x={MARGIN} y={Y_A + 10} at={T.r1} out={out} />
      <Fx tex={`${L1} =`} x={X_EQ} y={Y_A} at={T.r1} out={out} size={R} />
      <Fx tex={`-${L3}`} x={X_EQ + 112} y={Y_A} at={T.r1} out={out} size={R} />

      {/* in II */}
      <Tag text="in II" x={MARGIN} y={Y_B + 10} at={T.einsetzen} out={out} />
      <Fx tex={LGS[1]} x={X_EQ} y={Y_B} at={T.einsetzen} out={T.fly2 + 0.6} size={R} />
      <Band x={X_EQ - 8} y={Y_B - 6} w={56} h={56} o={show(t, T.einsetzen + 0.4, 0.3) * hide(t, T.fly2 + 0.6, 0.2)} rgb="255,122,92" />
      <Fly tex={`-${L3}`} from={[X_EQ + 112, Y_A]} to={[X_EQ, Y_B]} at={T.fly2} />
      <Fx tex={`-${L3} + ${L2} + 2${L3} = 0`} x={X_EQ} y={Y_B} at={T.fly2 + 0.62} out={out} size={R} />
      <Fx tex={`\\Rightarrow\\ ${L2} =`} x={690} y={Y_B} at={T.r2} out={out} size={R} />
      <Fx tex={`-${L3}`} x={868} y={Y_B} at={T.r2} out={out} size={R} />

      {/* in III */}
      <Tag text="in III" x={MARGIN} y={Y_C + 10} at={T.beides} out={out} />
      <Fx tex={LGS[2]} x={X_EQ} y={Y_C} at={T.beides} out={T.fly3 + 0.6} size={R} />
      <Band x={X_EQ - 8} y={Y_C - 6} w={56} h={56} o={show(t, T.beides + 0.3, 0.3) * hide(t, T.fly3 + 0.6, 0.2)} rgb="0,200,200" />
      <Fly tex={`-${L3}`} from={[868, Y_B]} to={[X_EQ, Y_C]} at={T.fly3} />
      <Fx tex={`-${L3} + ${AA}${L3} = 0`} x={X_EQ} y={Y_C} at={T.fly3 + 0.62} out={out} size={R} />
      <Fx tex={`\\Rightarrow\\ (${AA} - 1)\\cdot ${L3} = 0`} x={572} y={Y_C} at={T.r3} out={out} size={38} box={0.9 * show(t, T.boxA, 0.4)} />

      {/* Fallunterscheidung */}
      {panel(MARGIN, 400, `${AA} \\neq 1`, leftDim, 0)}
      {panel(488, 464, `${AA} = 1`, 0, rightHi)}
      <Fx tex={`(${AA} - 1) \\neq 0 \\ \\Rightarrow\\ ${L3} = 0`} x={94} y={1150} at={T.nicht + 0.3} out={out} size={32} dim={leftDim} />
      <Fx tex={`\\Rightarrow\\ ${L1} = ${L2} = 0`} x={94} y={1212} at={T.nicht2} out={out} size={32} dim={leftDim} />
      <Fx tex={`\\Rightarrow\\ \\text{unabhängig}`} x={94} y={1290} at={T.unab} out={out} size={36} dim={leftDim} />
      <Fx tex={`0 \\cdot ${L3} = 0 \\ \\Rightarrow\\ ${L3} \\text{ frei}`} x={510} y={1150} at={T.frei} out={out} size={32} />
      <Fx tex={`${L3} = 1 \\ \\Rightarrow\\ ${L1} = ${L2} = -1`} x={510} y={1212} at={T.miteins + 0.4} out={out} size={32} />
      <Fx tex={`-${v1} - ${v2} + ${v3} = 0`} x={510} y={1274} at={T.heisst} out={out} size={32} />
      <Fx tex={`\\Rightarrow\\ ${v3} = ${v1} + ${v2}`} x={510} y={1332} at={T.v3sum} out={out} size={36} box={0.9 * show(t, T.v3sum + 0.2, 0.4)} />
      <Fx tex={`\\text{linear abhängig} \\iff ${AA} = 1`} x={MARGIN + 6} y={1426} at={T.linear + 0.4} out={out} size={44} box={bump(t, T.aEins, 1.4)} />
    </>
  );
};

/* ---------- S4 · Aha im Raum ---------- */

const Aha: React.FC = () => (
  <>
    <Tag text="IM RAUM" x={MARGIN} y={596} at={T.raum} out={T.s3} color={C.eig} />
    <Fx tex={`${v3} = ${v1} + ${v2}\\ \\ \\Rightarrow\\ \\ \\text{alle drei in einer Ebene}`} x={MARGIN + 6} y={700} at={T.flach} out={T.s3} size={34} />
  </>
);

/* ---------- S5 · Schritt 3: Basis & Dimension ---------- */

const Basis: React.FC = () => {
  const t = useSec();
  const out = T.merk;
  if (t < T.s3 - 0.1 || t > out + 0.5) return null;
  const rows = {top: 830, rowH: 52};
  const vecO = show(t, T.unab2 + 0.3, 0.45) * hide(t, out);
  return (
    <>
      <Tag text="SCHRITT 3 · BASIS & DIMENSION" x={MARGIN} y={596} at={T.s3} out={out} color={C.eig} />
      <Fx tex={`U = \\operatorname{span}\\{${v1}, ${v2}, ${v3}\\}`} x={MARGIN + 6} y={650} at={T.s3 + 0.6} out={T.ueber + 0.2} size={44} />
      <Fx tex={`U = \\operatorname{span}\\{${v1}, ${v2}, \\cancel{${v3}}\\}`} x={MARGIN + 6} y={650} at={T.ueber} out={out} size={44} />
      <Fx tex={`= \\operatorname{span}\\{${v1}, ${v2}\\}`} x={584} y={650} at={T.spannt} out={out} size={44} box={bump(t, T.spannt + 0.5, 1.4)} />
      <Tag text="weil v₃ = v₁ + v₂" x={MARGIN + 6} y={722} at={T.ueber + 0.3} out={out} color={C.lam} />

      <Tag text="v₁, v₂ UNABHÄNGIG?" x={MARGIN} y={786} at={T.unab2} out={out} />
      <Band x={378} y={rows.top + 2} w={182} h={rows.rowH - 4} o={show(t, T.zeile1 - 0.1, 0.25) * hide(t, T.zeile1 + 1.1, 0.4)} />
      <Band x={378} y={rows.top + 2 * rows.rowH + 2} w={182} h={rows.rowH - 4} o={show(t, T.zeile3 - 0.1, 0.25) * hide(t, T.zeile3 + 1.1, 0.4)} rgb="0,200,200" />
      <Fx tex={`${L1}${v1} + ${L2}${v2} =`} x={MARGIN + 6} y={rows.top + 56} at={T.unab2 + 0.3} out={out} size={R} />
      <ColVec entries={[L1, `${L1} + ${L2}`, L2]} x={384} y={rows.top} w={170} rowH={rows.rowH} size={34} opacity={vecO} />
      <Fx tex="=" x={582} y={rows.top + 56} at={T.unab2 + 0.3} out={out} size={R} />
      <ColVec entries={['0', '0', '0']} x={628} y={rows.top} w={60} rowH={rows.rowH} size={34} opacity={vecO} />
      <Fx tex={`\\Rightarrow\\ ${L1} = 0`} x={716} y={rows.top + 4} at={T.zeile1} out={out} size={34} />
      <Fx tex={`\\Rightarrow\\ ${L2} = 0`} x={716} y={rows.top + 2 * rows.rowH + 4} at={T.zeile3} out={out} size={34} />
      <Fx tex={`\\Rightarrow\\ ${v1}, ${v2} \\text{ unabhängig}\\ \\checkmark`} x={MARGIN + 6} y={1004} at={T.zeile3 + 0.7} out={out} size={36} />

      <Fx tex={`\\text{Basis } \\{${v1}, ${v2}\\}`} x={MARGIN + 6} y={1076} at={T.basis} out={out} size={50} box={bump(t, T.basis + 0.2, 1.2)} />
      <Fx tex={`\\dim U = 2`} x={600} y={1076} at={T.dim} out={out} size={50} box={0.9 * show(t, T.dim + 0.2, 0.4)} />
    </>
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
  const p = springOS(clamp((t - (T.search - 0.1)) / 0.7));
  if (p <= 0) return null;
  const word = 'UniMathe';
  const n = Math.max(0, Math.min(word.length, Math.floor((t - T.search - 0.35) / 0.075) + 1));
  const caret = Math.floor(t * 2.2) % 2 === 0 || n < word.length;
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - 300,
        top: 1330,
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
  if (t < T.cta + 0.3) return null;
  const logo = springOS(clamp((t - (T.cta + 0.55)) / 0.9));
  const star = bump(t, T.cta + 0.5, 0.6);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 540 - 160,
          top: 800 - 160,
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
            top: 800 - 130,
            width: 260,
            height: 260,
            borderRadius: 58,
            opacity: clamp(logo * 1.4),
            transform: `scale(${0.6 + 0.4 * logo})`,
            boxShadow: '0 30px 90px rgba(30,139,219,.4)',
          }}
        />
      ) : null}
      <Centered y={968} at={T.cta + 0.85} size={112}>
        UniMathe
      </Centered>
      <Centered y={1112} at={T.name} size={40} color={C.txt2} weight={600}>
        Höhere Mathematik verstehen.
      </Centered>
      <Centered y={1164} at={T.name + 0.35} size={40} color={C.txt2} weight={600}>
        Klausuraufgaben Schritt für Schritt.
      </Centered>
      <Mono x={540} y={1278} at={T.search - 0.2} anchor="center" color={C.txt2}>
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

const Subtitles: React.FC = () => {
  const t = useSec();
  const c = CUES.find(({from, to}) => t >= from && t < to);
  if (!c) return null;
  const o = clamp((t - c.from) / 0.12) * clamp((c.to - t) / 0.12);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 300, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div
        style={{
          maxWidth: 780,
          padding: '8px 18px',
          borderRadius: 12,
          background: 'rgba(7,8,26,.55)',
          fontFamily: F.body,
          fontWeight: 500,
          fontSize: 32,
          lineHeight: 1.3,
          color: 'rgba(243,244,251,.85)',
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
  const f = Math.max(bump(t, T.hookFlat - 0.1, 0.4), bump(t, T.flach - 0.05, 0.4));
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

export type KBProps = {music: boolean; voice: boolean};

export const VideoKB: React.FC<KBProps> = ({music, voice}) => {
  useTexFonts();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={1150} strength={0.9} />
      <Stage />
      <ASlider />
      <TaskCard />
      <Progress />
      <Ansatz />
      <Loesen />
      <Aha />
      <Basis />
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
