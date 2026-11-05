import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C, MARGIN} from '../theme';
import {F} from '../fonts';
import {useTexFonts} from '../fonts';
import {bump, clamp, easeInOutCubic, easeOutExpo, lerp, sec, springOS} from '../math';
import {Backdrop, Grain, Mono, Tex, col, useSec} from '../ui';
import {Stage} from './Stage';
import {Band, CAP, ColVec, Fly, Fx, Progress, Q_TARGET, SUM, TT, Tag, TaskCard, UU, VV, WW, hide, show} from './parts';
import {MUSIC, SFX, SUBTITLES, T, V, VOICE, VOICE_GAPS} from './timeline';

const R = 40; // Schriftgröße der Rechenzeilen
const TAG_Y = 656;

/* ---------- S1 · Hook: 2 + 2 = 4? ---------- */

const Paradox: React.FC = () => {
  const t = useSec();
  const out = hide(t, T.steps, 0.45);
  if (t < T.jede - 0.1) return null;
  // über der 3D-Bühne, die Karte ist zu diesem Zeitpunkt schon oben
  const y = 676;
  const toF = easeInOutCubic(clamp((t - (T.vier - 0.2)) / 0.6));
  const a = show(t, T.jede, 0.45);
  const b = show(t, T.jede + 0.35, 0.45);
  const lab = 1 - toF;
  const eq = show(t, T.vier + 0.15, 0.4);
  const wrong = clamp((t - T.drei3) / 0.25);
  const shake = t > T.drei3 && t < T.drei3 + 0.5 ? Math.sin((t - T.drei3) * 60) * 8 * (1 - (t - T.drei3) / 0.5) : 0;
  const qp = 1 + 0.18 * bump(t, T.wo + 0.2, 0.8) + 0.06 * Math.sin(t * 5) * clamp(t - T.wo);
  const r3 = show(t, T.nurDrei + 0.2, 0.5);
  const piece = (x: number, tex: string, o: number, size = 60, extra?: React.CSSProperties) =>
    o > 0 ? (
      <div style={{position: 'absolute', left: x, top: y, opacity: o * out, whiteSpace: 'nowrap', ...extra}}>
        <Tex tex={tex} size={size} />
      </div>
    ) : null;
  // das Fragezeichen fliegt beim Aufbruch an Schritt 3 der Fortschrittsleiste
  const fq = clamp((t - (T.steps + 0.2)) / 0.85);
  const fe = easeInOutCubic(fq);
  return (
    <>
      {piece(96, `\\dim ${UU} =`, a * lab)}
      {piece(lerp(384, 372, toF), col(C.eig, '2'), a)}
      {piece(540, `\\dim ${VV} =`, b * lab)}
      {piece(lerp(828, 512, toF), col(C.cyan, '2'), b)}
      {piece(436, '+', eq)}
      {piece(586, '=', eq)}
      {piece(664, wrong > 0 ? col(C.lam, '4') : '4', eq, 60, {transform: `translateX(${shake}px)`})}
      {piece(726, col(C.lam, '?'), eq * (t < T.steps + 0.2 ? 1 : 0), 60, {transform: `scale(${qp})`, transformOrigin: 'left center'})}
      {r3 > 0 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: y + 100, display: 'flex', justifyContent: 'center', opacity: r3 * out}}>
          <Tex tex={`\\text{aber}\\ \\ \\dim \\mathbb{R}^3 = 3`} size={46} />
        </div>
      ) : null}
      {fq > 0 && fq < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: lerp(726, Q_TARGET[0], fe),
            top: lerp(y, Q_TARGET[1], fe) - Math.sin(Math.PI * fe) * 60,
            transform: `scale(${lerp(1, 0.55, fe)})`,
            transformOrigin: 'left top',
          }}
        >
          <Tex tex={col(C.lam, '?')} size={60} />
        </div>
      ) : null}
    </>
  );
};

/* ---------- S2 · Erst das Bild ---------- */

const Bild: React.FC = () => (
  <>
    <Tag text="ERST DAS BILD" x={MARGIN} y={TAG_Y} at={T.bild} out={T.s1} color={C.lam} />
    <Fx tex={`${CAP} = \\text{Gerade durch } 0`} x={MARGIN + 6} y={716} at={T.schnitt + 0.3} out={T.s1} size={44} />
  </>
);

/* ---------- S3 · Schritt 1: Schnitt ---------- */

const Y_I = 712;
const Y_II = 778;
const Y_D = 866;
const Y_Z = 936;
const Y_X = 1008;
const Y_X2 = 1078;
const X0 = 150;
const VEC = {top: 866, rowH: 54};
const vecMid = VEC.top + (VEC.rowH * 3) / 2 - 26;

const Schnitt: React.FC = () => {
  const t = useSec();
  const out = T.s2;
  if (t < T.s1 - 0.2 || t > out + 0.5) return null;
  const q = hide(t, out);
  const derivOut = T.jeder; // die Herleitung macht Platz für den Ergebnisvektor
  const vA = show(t, T.jeder, 0.45) * q;
  const vC = show(t, T.tmal + 0.75, 0.45) * q;
  const bRow = (k: number) => (k === 0 ? Y_I : Y_II);
  return (
    <>
      <Tag text="SCHRITT 1 · SCHNITT BERECHNEN" x={MARGIN} y={TAG_Y} at={T.s1} out={out} color={C.eig} />
      <Band x={X0 - 12} y={Y_I - 8} w={300} h={58} o={show(t, T.zieh, 0.3) * hide(t, T.weg + 0.6, 0.4)} />
      <Band x={X0 - 12} y={Y_II - 8} w={300} h={58} o={show(t, T.zieh, 0.3) * hide(t, T.weg + 0.6, 0.4)} rgb="0,200,200" />
      {[0, 1].map((k) => (
        <React.Fragment key={k}>
          <Tag text={k === 0 ? 'I' : 'II'} x={MARGIN + 8} y={bRow(k) + 10} at={T.erfuellt + 0.3 * k} out={out} size={26} color={k === 0 ? C.eig : C.cyan} />
          <Fx tex={k === 0 ? 'x + y + z = 0' : 'x - y + 2z = 0'} x={X0} y={bRow(k)} at={T.erfuellt + 0.3 * k} out={out} size={R} from={[440, k === 0 ? 354 : 410]} />
        </React.Fragment>
      ))}
      <div style={{position: 'absolute', left: MARGIN, top: 844, width: 860, height: 1.5, background: 'rgba(255,255,255,.12)', opacity: show(t, T.zieh) * q}} />

      {/* II − I, Spalte für Spalte */}
      <Fly tex="-(x + y + z)" from={[X0, Y_I]} to={[X0 + 60, Y_D]} at={T.zieh + 0.25} dur={0.9} size={36} />
      <Tag text="II−I" x={MARGIN - 4} y={Y_D + 10} at={T.zieh + 1.1} out={derivOut} size={22} />
      <Fx tex={`(x - x) + (-y - y) + (2z - z) = 0`} x={X0} y={Y_D} at={T.zieh + 1.1} out={T.weg} size={36} />
      <Fx tex={`\\cancel{(x - x)} + (-y - y) + (2z - z) = 0`} x={X0} y={Y_D} at={T.weg} out={derivOut} size={36} />
      <Fx tex={`\\Rightarrow\\ -2y + z = 0`} x={X0} y={Y_Z} at={T.z2y - 0.3} out={derivOut} size={R} />
      <Fx tex={`\\Rightarrow\\ z = 2y`} x={540} y={Y_Z} at={T.z2y + 0.5} out={derivOut} size={R} box={0.8 * show(t, T.z2y + 0.8, 0.4)} />

      {/* in I einsetzen */}
      <Tag text="in I" x={MARGIN - 4} y={Y_X + 10} at={T.einsetzen} out={derivOut} size={22} />
      <Fx tex={`x + y + \\phantom{2y} = 0`} x={X0} y={Y_X} at={T.einsetzen} out={T.fly + 0.68} size={R} />
      <Fly tex={col(C.lam, '2y')} from={[638, Y_Z]} to={[X0 + 108, Y_X]} at={T.fly} size={R} />
      <Fx tex={`x + y + ${col(C.lam, '2y')} = 0`} x={X0} y={Y_X} at={T.fly + 0.66} out={derivOut} size={R} />
      <Fx tex={`\\Rightarrow\\ x + 3y = 0`} x={500} y={Y_X} at={T.x3y + 0.3} out={derivOut} size={R} />
      <Fx tex={`\\Rightarrow\\ x = -3y`} x={X0} y={Y_X2} at={T.xm3y} out={derivOut} size={R} box={0.8 * show(t, T.xm3y + 0.4, 0.4)} />
      <Fx tex={`y = ${TT}\\ \\ \\text{(frei)}`} x={540} y={Y_X2} at={T.nennt} out={derivOut} size={R} box={0.8 * bump(t, T.nennt + 0.3, 1.2)} />

      {/* Ergebnisvektor: t ausklammern */}
      <ColVec entries={['x', 'y', 'z']} x={X0} y={VEC.top} w={76} rowH={VEC.rowH} size={R} opacity={vA} />
      <Fx tex="=" x={246} y={vecMid} at={T.jeder + 0.2} out={out} size={R} />
      <ColVec entries={[`-3${TT}`, TT, `2${TT}`]} x={296} y={VEC.top} w={136} rowH={VEC.rowH} size={R} opacity={show(t, T.jeder + 0.35, 0.45) * q} />
      <Fx tex="=" x={452} y={vecMid} at={T.tmal + 0.75} out={out} size={R} />
      {[0, 1, 2].map((k) => (
        <Fly key={k} tex={TT} from={[k === 1 ? 356 : 382, VEC.top + k * VEC.rowH + 4]} to={[504, vecMid]} at={T.tmal + 0.05 + 0.1 * k} dur={0.7} size={R} />
      ))}
      <Fx tex={`${TT}\\,\\cdot`} x={500} y={vecMid} at={T.tmal + 0.75} out={out} size={R} />
      <ColVec entries={['-3', '1', '2']} x={566} y={VEC.top} w={96} rowH={VEC.rowH} size={R} color={C.lam} opacity={vC} />
      <Band x={556} y={VEC.top - 6} w={116} h={VEC.rowH * 3 + 12} o={show(t, T.ausklammern, 0.35) * q} rgb="255,122,92" />
      <Fx tex={`=: ${WW}`} x={690} y={vecMid} at={T.ausklammern + 0.2} out={out} size={44} />
      <Fx tex={`\\Rightarrow\\ ${CAP} = \\operatorname{span}\\{${WW}\\}`} x={MARGIN + 6} y={1062} at={T.ausklammern + 0.7} out={out} size={R} />
    </>
  );
};

/* ---------- S4 · Schritt 2: Probe, Basis & Dimension ---------- */

const W_VEC = {x: 150, top: 720, rowH: 44};
const Y_PU = 726;
const Y_PV = 800;

const Probe: React.FC = () => {
  const t = useSec();
  const out = T.s3;
  if (t < T.s2 - 0.2 || t > out + 0.5) return null;
  const q = hide(t, out);
  const entry = (k: number): [number, number] => [W_VEC.x + 30, W_VEC.top + k * W_VEC.rowH + 2];
  const fl = (row: number, at: number, targets: number[]) =>
    ['-3', '1', '2'].map((e, k) => <Fly key={`${row}${k}`} tex={col(C.lam, e)} from={entry(k)} to={[targets[k], row]} at={at + 0.12 * k} dur={0.65} size={34} />);
  return (
    <>
      <Tag text="SCHRITT 2 · PROBE, BASIS & DIMENSION" x={MARGIN} y={TAG_Y} at={T.s2} out={out} color={C.eig} />
      <Fx tex={`${WW} =`} x={MARGIN} y={W_VEC.top + 44} at={T.s2 + 0.3} out={out} size={R} />
      <ColVec entries={['-3', '1', '2']} x={W_VEC.x} y={W_VEC.top} w={84} rowH={W_VEC.rowH} size={34} color={C.lam} opacity={show(t, T.s2 + 0.3, 0.45) * q} />

      {fl(Y_PU, T.inU, [402, 486, 560])}
      <Fx tex={`${UU}:\\ \\ ${col(C.lam, '(-3)')} + ${col(C.lam, '1')} + ${col(C.lam, '2')} = 0\\ \\checkmark`} x={290} y={Y_PU} at={T.inU + 0.7} out={out} size={36} />
      {fl(Y_PV, T.inV, [402, 486, 590])}
      <Fx tex={`${VV}:\\ \\ ${col(C.lam, '(-3)')} - ${col(C.lam, '1')} + 2 \\cdot ${col(C.lam, '2')} = 0\\ \\checkmark`} x={290} y={Y_PV} at={T.inV + 0.7} out={out} size={36} />

      <Fx tex={`${WW} \\neq 0 \\ \\Rightarrow\\ \\{${WW}\\} \\text{ linear unabhängig}`} x={MARGIN + 6} y={884} at={T.w0 + 0.2} out={out} size={36} />
      <Fx tex={`\\text{Basis von } ${CAP}:\\ \\ \\{(-3, 1, 2)^T\\}`} x={MARGIN + 6} y={956} at={T.basis} out={out} size={42} box={bump(t, T.basis + 0.3, 1.4)} />
      <Fx tex={`\\dim(${CAP}) = 1`} x={MARGIN + 6} y={1040} at={T.dim1} out={out} size={48} box={0.9 * show(t, T.dim1 + 0.3, 0.4)} />
    </>
  );
};

/* ---------- S5 · Schritt 3: U + V, das Rätsel ---------- */

const Chip: React.FC<{tex: string; color: string; x: number; y: number; o: number; glow?: number; scale?: number}> = ({tex, color, x, y, o, glow = 0, scale = 1}) =>
  o > 0 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 84,
        height: 64,
        boxSizing: 'border-box',
        borderRadius: 14,
        border: `2.5px solid ${color}`,
        background: 'rgba(7,8,26,.7)',
        boxShadow: glow > 0 ? `0 0 ${10 + 30 * glow}px ${color}` : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: o,
        transform: `scale(${scale})`,
      }}
    >
      <Tex tex={tex} size={40} />
    </div>
  ) : null;

const ROW_U = 852;
const ROW_V = 934;
const CHIP_X = [156, 252, 348];

const Summe: React.FC = () => {
  const t = useSec();
  const out = T.merk;
  if (t < T.s3 - 0.2 || t > out + 0.5) return null;
  const q = hide(t, out);
  const cU = show(t, T.beide, 0.4) * q;
  const cV = show(t, T.beide + 0.3, 0.4) * q;
  const dbl = bump(t, T.doppelt + 0.9, 1.4);
  // Verschmelzen: w aus V gleitet auf w aus U, danach rückt v in die obere Reihe
  const m1 = easeInOutCubic(clamp((t - T.merge) / 0.7));
  const m2 = easeInOutCubic(clamp((t - (T.merge + 0.55)) / 0.7));
  const flash = bump(t, T.merge + 0.65, 0.7);
  const vLab = 1 - clamp((t - T.merge) / 0.4);
  return (
    <>
      <Tag text="SCHRITT 3 · DIMENSION VON U + V" x={MARGIN} y={TAG_Y} at={T.s3} out={out} color={C.eig} />
      <Fx tex={`\\dim ${UU} = \\dim ${VV} = 2`} x={MARGIN + 6} y={712} at={T.dimUV} out={out} size={44} />
      <Fx tex={`\\textcolor{${C.txt2}}{\\text{1 Gleichung, 3 Unbekannte}\\ \\Rightarrow\\ \\text{2 frei}}`} x={MARGIN + 6} y={782} at={T.frei2} out={out} size={30} />

      {cU > 0 ? (
        <div style={{position: 'absolute', left: MARGIN + 6, top: ROW_U + 6, opacity: cU}}>
          <Tex tex={`${UU}:`} size={42} />
        </div>
      ) : null}
      {cV > 0 ? (
        <div style={{position: 'absolute', left: MARGIN + 6, top: ROW_V + 6, opacity: cV * vLab}}>
          <Tex tex={`${VV}:`} size={42} />
        </div>
      ) : null}
      <Chip tex={WW} color={C.lam} x={CHIP_X[0]} y={ROW_U} o={cU} glow={dbl + 2 * flash} scale={1 + 0.12 * flash} />
      <Chip tex={col(C.eig, 'u')} color={C.eig} x={CHIP_X[1]} y={ROW_U} o={cU} />
      {m1 < 1 ? <Chip tex={WW} color={C.lam} x={CHIP_X[0]} y={lerp(ROW_V, ROW_U, m1)} o={cV} glow={dbl} /> : null}
      <Chip tex={col(C.cyan, 'v')} color={C.cyan} x={lerp(CHIP_X[1], CHIP_X[2], m2)} y={lerp(ROW_V, ROW_U, m2)} o={cV} />
      <Fx tex={`2 + 2 = 4\\ ${col(C.lam, '?')}`} x={520} y={ROW_U + 40} at={T.doppelt + 0.3} out={T.merge} size={42} />
      <Fx tex={`\\text{3 Richtungen}`} x={470} y={ROW_U + 8} at={T.merge + 1.1} out={out} size={40} />

      <Fx tex={`\\dim(${SUM}) = \\dim ${UU} + \\dim ${VV} - \\dim(${CAP})`} x={MARGIN + 6} y={962} at={T.also} out={out} size={36} />
      <Fx tex={`= ${col(C.eig, '2')} + ${col(C.cyan, '2')} - ${col(C.lam, '1')} = 3`} x={250} y={1030} at={T.also + 0.6} out={out} size={44} box={0.9 * show(t, T.also + 1.2, 0.4)} />
      <Fx tex={`\\Rightarrow\\ ${SUM} = \\mathbb{R}^3`} x={MARGIN + 6} y={1104} at={T.raum + 0.5} out={out} size={44} box={bump(t, T.raum + 1.2, 1.6)} />
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
      <Mono x={540} y={1258} at={T.search - 0.2} anchor="center" color={C.txt2}>
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
  const f = Math.max(bump(t, T.merge + 0.6, 0.45), bump(t, T.raum + 1.2, 0.5));
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

export type KSProps = {music: boolean; voice: boolean};

export const VideoKS: React.FC<KSProps> = ({music, voice}) => {
  useTexFonts();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={1100} strength={0.9} />
      <Stage />
      <TaskCard />
      <Progress />
      <Paradox />
      <Bild />
      <Schnitt />
      <Probe />
      <Summe />
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
