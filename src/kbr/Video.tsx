import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C, MARGIN} from '../theme';
import {F, useTexFonts} from '../fonts';
import {bump, clamp, easeOutExpo, prog, sec, springOS} from '../math';
import {V3, add3, sc3} from '../space';
import {Backdrop, Grain, Mono, Tex, col, useSec} from '../ui';
import {COL, Scene} from './Canvas';
import {CARD, CELL_X, CELL_Y, Band, Fly, Fx, Progress, Tag, TaskCard, hide, show} from './parts';
import {COLS, KH, onEq, onImg, project, sKer, vis} from './world';
import {MUSIC, SFX, SUBTITLES, T, V, VOICE, VOICE_GAPS} from './timeline';

const KC = (s: string) => col(COL.ker, s);
const IC = (s: string) => col(C.eig, s);
const AC = (j: number, s: string) => col(COL.a[j], s);
const R = 40; // Schriftgröße der Rechenzeilen
const cardCell = (i: number): [number, number] => [MARGIN + CELL_X[i], CARD.top + CELL_Y];

/* ---------- Beschriftungen in der 3D-Bühne ---------- */

const Label3: React.FC<{q: V3; o: number; children: React.ReactNode; color?: string; size?: number; dy?: number}> = ({q, o, children, color = C.txt, size = 30, dy = 0}) => {
  const t = useSec();
  if (o <= 0) return null;
  const [x, y] = project(t, q);
  return (
    <div
      style={{
        position: 'absolute',
        left: Math.min(880, Math.max(140, x)),
        top: y + dy,
        transform: 'translate(-50%, -50%)',
        opacity: o,
        fontFamily: F.display,
        fontWeight: 700,
        fontSize: size,
        color,
        whiteSpace: 'nowrap',
        textShadow: `0 0 12px ${C.bg}, 0 0 26px ${C.bg}`,
      }}
    >
      {children}
    </div>
  );
};

const StageLabels: React.FC = () => {
  const t = useSec();
  const win = (a: number, b: number, d = 0.4) => show(t, a, d) * hide(t, b, d);
  const kerTag = Math.max(win(T.kernIs, T.s1), win(T.kernIst + 0.4, T.s2), win(T.dimk + 0.2, T.merk)) * vis.kerLine(t);
  const imgTag = Math.max(win(T.bildIs + 1.0, T.s1), win(T.basis + 0.8, T.von - 0.3), win(T.zweiB, T.merk));
  const triOn = t >= T.sp1 ? 1 - vis.triOut(t) : 0;
  const colTag = vis.cols(t) * (1 - triOn);
  const eqTag = (i: number) => vis.eq(i, t) * hide(t, T.weg + 0.6, 0.5);
  const q2 = win(T.ueberfl, T.idee - 0.2, 0.3);
  return (
    <>
      <Label3 q={sc3(KH, 3.3 * (1 - sKer(t)) + 0.4)} o={kerTag} color={COL.ker}>
        Kern{t > T.dimk ? <span style={{fontWeight: 500, fontSize: 24, color: C.txt2}}>{'  ·  1 Dimension'}</span> : null}
      </Label3>
      <Label3 q={onImg(2.9, -2.9)} o={imgTag} color={C.eig}>
        Bild{t > T.rang ? <span style={{fontWeight: 500, fontSize: 24, color: C.txt2}}>{'  ·  2 Dimensionen'}</span> : null}
      </Label3>
      {COLS.map((a, j) => (
        <Label3 key={j} q={sc3(a, 1.18)} o={colTag * (j === 1 ? 1 - 0.5 * vis.grey2(t) : 1)} color={COL.a[j]}>
          <Tex tex={AC(j, `a_${j + 1}`)} size={36} />
        </Label3>
      ))}
      <Label3 q={add3(COLS[1], [0, 0, 0.8])} o={q2} color={C.lam} size={56}>
        ?
      </Label3>
      {[0, 1, 2].map((i) => (
        <Label3 key={i} q={onEq(i, 2.5, 1.75)} o={eqTag(i)} color={COL.eq[i]}>
          {['I', 'II', 'III'][i]}
        </Label3>
      ))}
      <Label3 q={[0, 0, 0]} o={win(T.close + 0.1, T.zwei, 0.3)} dy={-50}>
        <Tex tex={'= 0'} size={38} />
      </Label3>
    </>
  );
};

/* ---------- S2 · Idee ---------- */

const Idee: React.FC = () => {
  const t = useSec();
  if (t < T.kernIs - 0.2 || t > T.s1 + 0.6) return null;
  return (
    <>
      <Fx tex={`${KC('\\operatorname{Kern} f')} = \\{\\, x \\mid A\\,x = 0 \\,\\}`} x={90} y={680} at={T.kernIs} out={T.s1 - 0.1} size={38} />
      <Fx tex={`${IC('\\operatorname{Bild} f')} = \\{\\, A\\,x \\mid x \\in \\mathbb{R}^3 \\,\\}`} x={90} y={754} at={T.bildIs} out={T.s1 - 0.1} size={38} />
    </>
  );
};

/* ---------- S3 · Schritt 1: Kern ---------- */

const Y_I = 690;
const Y_II = 760;
const Y_III = 830;
const Y_D = 912;
const Y_V = 976;
const EQX = 170;

const KernSchritt: React.FC = () => {
  const t = useSec();
  if (t < T.loese - 0.2 || t > T.s2 + 0.6) return null;
  const out = T.s2 - 0.2;
  const strike = prog(t, T.weg, 0.4);
  const dim3 = prog(t, T.weg + 0.2, 0.4);
  const romans = ['I', 'II', 'III'];
  const eqs = ['x + y = 0', 'y + z = 0', 'x + 2y + z = 0'];
  return (
    <>
      <Band x={80} y={Y_I - 12} w={330} h={62} o={bump(t, T.xy, 1.4)} />
      <Band x={80} y={Y_II - 12} w={330} h={62} o={Math.max(bump(t, T.yz, 1.4), bump(t, T.genau + 1.0, 1.2))} rgb="0,200,200" />
      {[Y_I, Y_II, Y_III].map((y, i) => (
        <React.Fragment key={i}>
          <Fx tex={col(COL.eq[i], `\\text{${romans[i]}}`)} x={90} y={y} at={T.loese + 0.1 + 0.4 * i} out={out} size={R} dim={i === 2 ? dim3 * 0.6 : 0} />
          <Fx tex={eqs[i]} x={EQX} y={y} at={T.loese + 0.1 + 0.4 * i} out={out} size={R} dim={i === 2 ? dim3 : 0} />
        </React.Fragment>
      ))}
      {strike > 0 && t < out + 0.4 ? (
        <div style={{position: 'absolute', left: EQX - 4, top: Y_III + 24, width: 300 * strike, height: 4, borderRadius: 2, background: C.lam, opacity: hide(t, out)}} />
      ) : null}
      <Fx tex={`${col(COL.eq[2], '\\text{III}')} - ${col(COL.eq[0], '\\text{I}')}\\colon\\quad y + z = 0`} x={90} y={Y_D} at={T.zeile3 + 0.4} out={T.weg + 0.3} size={R} />
      <Fly tex={'y + z = 0'} from={[392, Y_D]} to={[EQX, Y_II]} at={T.genau + 0.15} dur={0.8} size={R} />
      <Tag text="= II" x={640} y={Y_D + 10} at={T.genau + 0.9} out={T.weg + 0.3} color={C.cyan} size={28} />
      <Tag text="fällt weg" x={500} y={Y_III + 10} at={T.weg + 0.3} out={out} color={C.lam} size={26} />
      {/* z frei, dann rückwärts einsetzen */}
      <Fx tex={`z = ${KC('t')}`} x={EQX} y={Y_D} at={T.frei} out={out} size={R} />
      <Tag text="frei" x={EQX + 150} y={Y_D + 10} at={T.nenn} out={out} color={C.lam} size={26} />
      <Fly tex={KC('t')} from={[EQX + 88, Y_D]} to={[EQX + 104, Y_II]} at={T.ymt} dur={0.6} size={R} />
      <Fx tex={`\\Rightarrow\\ y = -${KC('t')}`} x={430} y={Y_II} at={T.ymt + 0.5} out={out} size={R} />
      <Fly tex={`-${KC('t')}`} from={[556, Y_II]} to={[EQX + 98, Y_I]} at={T.xt} dur={0.6} size={R} />
      <Fx tex={`\\Rightarrow\\ x = ${KC('t')}`} x={430} y={Y_I} at={T.xt + 0.5} out={out} size={R} />
      <Fx tex={`\\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix} = ${KC('t')} \\begin{pmatrix} 1 \\\\ -1 \\\\ 1 \\end{pmatrix}`} x={90} y={Y_V} at={T.kernIst + 0.1} out={out} size={34} />
      <Fx
        tex={`${KC('\\operatorname{Kern} f')} = \\operatorname{span}\\{(1,-1,1)^T\\}`}
        x={440}
        y={Y_V + 44}
        at={T.kernIst + 1.6}
        out={out}
        size={32}
        box={prog(t, T.kernCard - 0.6, 0.4)}
      />
      <Fly tex={'\\{(1,-1,1)^T\\}'} from={[680, Y_V + 44]} to={cardCell(0)} at={T.kernCard} dur={0.8} size={26} />
    </>
  );
};

/* ---------- S4 · Schritt 2: Bild und der Spalten-Trick ---------- */

const Y_M = 684;
const Y_K = 858;
const Y_P = 898;
const ENTRIES = [[1, 1, 0], [0, 1, 1], [1, 2, 1]];
const MAT_COL = `A = \\begin{pmatrix} ${ENTRIES.map((r) => r.map((v, c) => AC(c, String(v))).join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;

const BildSchritt: React.FC = () => {
  const t = useSec();
  if (t < T.spalten - 0.2 || t > T.s3 + 0.6) return null;
  const out = T.s3 - 0.2;
  return (
    <>
      <Fx tex={MAT_COL} x={90} y={Y_M} at={T.spalten} out={T.zwei - 0.2} size={38} />
      <Fx tex={`= \\big(\\, ${AC(0, 'a_1')} \\;\\; ${AC(1, 'a_2')} \\;\\; ${AC(2, 'a_3')} \\,\\big)`} x={432} y={Y_M + 50} at={T.spalten + 0.5} out={T.zwei - 0.2} size={38} />
      <Fx tex={'A \\begin{pmatrix} 1 \\\\ -1 \\\\ 1 \\end{pmatrix} = 0'} x={90} y={Y_K} at={T.amal} out={T.basis - 0.2} size={32} />
      <Fx tex={`\\Leftrightarrow\\ 1 \\cdot ${AC(0, 'a_1')}`} x={334} y={Y_P} at={T.sp1} out={T.basis - 0.2} size={36} />
      <Fx tex={`-\\, 1 \\cdot ${AC(1, 'a_2')}`} x={500} y={Y_P} at={T.sp2} out={T.basis - 0.2} size={36} />
      <Fx tex={`+\\, 1 \\cdot ${AC(2, 'a_3')}`} x={648} y={Y_P} at={T.sp3} out={T.basis - 0.2} size={36} />
      <Fx tex={'= 0'} x={806} y={Y_P} at={T.ergibt} out={T.basis - 0.2} size={36} box={bump(t, T.close, 1.4)} />
      <Fx tex={`${AC(1, 'a_2')} = ${AC(0, 'a_1')} + ${AC(2, 'a_3')}`} x={90} y={Y_M + 20} at={T.zwei + 0.2} out={out} size={R} box={bump(t, T.zwei + 1.4, 1.6)} />
      <Tag text="überflüssig" x={420} y={Y_M + 32} at={T.ueberfl2} out={out} color={C.lam} size={28} />
      <Fx
        tex={`${IC('\\operatorname{Bild} f')} = \\operatorname{span}\\{(1,0,1)^T,\\,(0,1,1)^T\\}`}
        x={90}
        y={Y_K - 30}
        at={T.basis + 0.2}
        out={out}
        size={34}
        box={prog(t, T.bildCard - 0.6, 0.4)}
      />
      <Fly tex={'\\{(1,0,1)^T,\\,(0,1,1)^T\\}'} from={[420, Y_K - 30]} to={cardCell(1)} at={T.bildCard} dur={0.8} size={26} />
    </>
  );
};

/* ---------- S5 · Schritt 3: Rang und Dimensionsformel ---------- */

const RangSchritt: React.FC = () => {
  const t = useSec();
  if (t < T.rang - 0.2 || t > T.merk + 0.6) return null;
  const out = T.merk - 0.1;
  return (
    <>
      <Fx tex={`\\operatorname{rg} f = \\dim ${IC('\\operatorname{Bild} f')} =`} x={90} y={690} at={T.rang} out={out} size={R} />
      <Fx tex={IC('2')} x={526} y={690} at={T.also2} out={out} size={R} box={bump(t, T.also2 + 0.2, 1.4)} />
      <Fx tex={`\\dim ${KC('\\operatorname{Kern} f')} = ${KC('1')}`} x={90} y={764} at={T.dimk} out={out} size={R} box={bump(t, T.dimk + 0.2, 1.4)} />
      <Fx
        tex={`\\dim ${KC('\\operatorname{Kern} f')} + \\operatorname{rg} f = ${KC('1')} + ${IC('2')} = 3`}
        x={90}
        y={862}
        at={T.formel}
        out={out}
        size={44}
        box={prog(t, T.formel + 1.0, 0.5)}
      />
    </>
  );
};

/* ---------- S6 · UniMathe & CTA ---------- */

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
  if (t < T.cta + 0.3) return null;
  const logo = springOS(clamp((t - (T.cta + 0.55)) / 0.9));
  const star = bump(t, T.cta + 0.5, 0.6);
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
      <Centered y={950} at={T.cta + 0.85} size={112}>
        UniMathe
      </Centered>
      <Centered y={1094} at={T.name} size={40} color={C.txt2} weight={600}>
        Höhere Mathematik verstehen.
      </Centered>
      <Centered y={1146} at={T.name + 0.35} size={40} color={C.txt2} weight={600}>
        Klausuraufgaben Schritt für Schritt.
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
  const f = Math.max(bump(t, T.nullpunkt + 0.25, 0.45), bump(t, T.close, 0.45), bump(t, T.formel + 1.0, 0.4) * 0.7);
  return f > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.09 * f}} /> : null;
};

/* ---------- Komposition ---------- */

// Die Sprachdatei in Stücke zwischen den Schnittstellen teilen; jedes Stück startet um die bisher eingefügte Stille später
const cuts = [0, ...VOICE_GAPS.map(([c]) => c), Infinity];
const PIECES = cuts.slice(0, -1).map((from, i) => ({
  from,
  to: cuts[i + 1],
  delay: VOICE_GAPS.slice(0, i).reduce((s, [, g]) => s + g, 0),
}));

export type KBRProps = {music: boolean; voice: boolean};

export const VideoKBR: React.FC<KBRProps> = ({music, voice}) => {
  useTexFonts();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={1150} strength={0.9} />
      <Scene />
      <StageLabels />
      <TaskCard />
      <Progress />
      <Idee />
      <KernSchritt />
      <BildSchritt />
      <RangSchritt />
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
