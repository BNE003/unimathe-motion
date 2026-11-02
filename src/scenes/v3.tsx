import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, H, W} from '../theme';
import {F} from '../fonts';
import {A, V2, View, bump, clamp, easeInOutCubic, easeOutCubic, fmtDe, lerp, lerpM, lerpView, mul, prog, springOS, toScreen} from '../math';
import {AngleArc, Arrow, Origin, SpanLine, Stage, Ticks} from '../plane';
import {Backdrop, EigenFormula, Hairline, Header, Headline, MatrixView, Mono, Tex, col, formulaCenter, useSec} from '../ui';
import {CALC_HIDDEN, CalcMV, CalcShow} from '../calc';
import {cue} from '../timeline';

// Bühne für S1–S8: ruhiges Koordinatensystem, Ursprung unten links
export const VP: View = {ox: 360, oy: 1360, u: 170};
const VW: View = {ox: 540, oy: 1180, u: 130};
export const MAT_TL = {x: 290, y: 690, size: 46};
const I2: [[number, number], [number, number]] = [[1, 0], [0, 1]];
const CALC = {x: 72, yc: 690};

const deg = (a: number) => (a * Math.PI) / 180;
const dir = (a: number): V2 => [Math.cos(deg(a)), Math.sin(deg(a))];
const angleBetween = (p: V2, q: V2) => {
  const c = (p[0] * q[0] + p[1] * q[1]) / (Math.hypot(p[0], p[1]) * Math.hypot(q[0], q[1]));
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
};
const angleOf = (p: V2) => (Math.atan2(p[1], p[0]) * 180) / Math.PI;
const mixHex = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * clamp(t))).join(',')})`;
};
const show = (t: number, at: number, d = 0.35) => easeOutCubic(clamp((t - at) / d));

// x (grau) und A·x (cyan); werden amber, sobald sie auf einer Linie liegen
const ProbePair: React.FC<{view: View; x: V2; ax: V2; eigen: number; id: string; arc?: number; glow?: number}> = ({view, x, ax, eigen, id, arc = 1, glow = 0}) => {
  const cx = mixHex(C.vec, C.eig, eigen);
  const cax = mixHex(C.cyan, C.eig, eigen);
  const a0 = angleOf(x);
  let a1 = angleOf(ax);
  if (a1 - a0 > 180) a1 -= 360;
  if (a0 - a1 > 180) a1 += 360;
  return (
    <>
      <AngleArc view={view} r={72} a0={a0} a1={a1} color={C.txt2} opacity={0.9 * arc * (1 - eigen)} />
      <Arrow view={view} to={ax} color={cax} w={7} head={30} glow={eigen * (0.8 + glow)} glowId={`${id}-blur`} />
      <Arrow view={view} to={x} color={cx} w={6} head={26} />
    </>
  );
};

const VecLabel: React.FC<{view: View; p: V2; tex: string; at: number; out?: number; dx?: number; dy?: number; size?: number}> = ({view, p, tex, at, out, dx = 18, dy = -10, size = 40}) => {
  const [x, y] = toScreen(view, p);
  return (
    <Mono x={x + dx} y={y + dy} at={at} out={out} upper={false}>
      <Tex tex={tex} size={size} />
    </Mono>
  );
};

const AngleCounter: React.FC<{value: number; at: number; out?: number; found: number}> = ({value, at, out, found}) => (
  <>
    <Mono x={1008} y={604} at={at} out={out} anchor="right" upper={false} size={24}>
      Winkel zwischen <span style={{color: C.vec}}>x</span> und <span style={{color: C.cyan}}>Ax</span>
    </Mono>
    <Mono x={1008} y={644} at={at} out={out} anchor="right" upper={false} size={92} color={mixHex(C.txt, C.eig, found)}>
      {fmtDe(Math.max(0, value))}°
    </Mono>
  </>
);

// Maske entlang einer Rasterlinie (Bildschirmrichtung (1,-2))
const maskWipe = (p: number) => {
  const n: V2 = [2 / Math.sqrt(5), 1 / Math.sqrt(5)];
  const d: V2 = [1 / Math.sqrt(5), -2 / Math.sqrt(5)];
  const c = lerp(-80, 1900, p);
  const P0: V2 = [n[0] * c, n[1] * c];
  const pts = [
    [P0[0] + d[0] * 5000, P0[1] + d[1] * 5000],
    [P0[0] - d[0] * 5000, P0[1] - d[1] * 5000],
    [P0[0] - d[0] * 5000 - n[0] * 5000, P0[1] - d[1] * 5000 - n[1] * 5000],
    [P0[0] + d[0] * 5000 - n[0] * 5000, P0[1] + d[1] * 5000 - n[1] * 5000],
  ];
  return {
    clip: p < 1 ? `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(', ')})` : undefined,
    edge: p > 0 && p < 1 ? [P0[0] + d[0] * 3000, P0[1] + d[1] * 3000, P0[0] - d[0] * 3000, P0[1] - d[1] * 3000] : null,
  };
};

/* S1 · Hook: ein Vektor kreist, A·x läuft schief hinterher */
export const S1: React.FC = () => {
  const t = useSec();
  const th = lerp(-40, 44, easeInOutCubic(clamp((t + 0.25) / 4.5)));
  const x = dir(th);
  const ax = mul(A, x);
  const flash = bump(t, cue('S1', 'flash', 3.9), 0.6);
  const calc: CalcShow = {...CALC_HIDDEN, mat: clamp((t + 0.2) / 0.3)};
  return (
    <AbsoluteFill>
      <Backdrop gx={VP.ox + 150} gy={VP.oy - 200} />
      <Stage id="v1" view={VP} M={I2}>
        <SpanLine view={VP} d={[1, 1]} color={C.eig} grow={1} opacity={0.6 * flash} />
        <ProbePair view={VP} x={x} ax={ax} eigen={0.6 * flash} id="v1" />
        <Origin view={VP} />
      </Stage>
      <CalcMV x={CALC.x} yc={CALC.yc} size={46} prefix vec={['', '']} vecColor={C.vec} mid={['', '']} res={['', '']} resColor={C.cyan} show={calc} />
      <Header index="01" label="Eigenvektoren" at={-0.2} />
      <Headline lines={[[['Fast jeder wird gedreht.']], [['Aber nicht jeder.', C.eig]]]} at={-0.15} lineAt={[-0.15, cue('S1', 'aber', 2.6)]} size={80} />
      <Hairline y={560} at={-0.2} />
    </AbsoluteFill>
  );
};

/* S2 · Matrix mal Vektor: erst rechnen, dann sehen */
export const S2: React.FC = () => {
  const t = useSec();
  const cx = cue('S2', 'x', 2.8);
  const r1 = cue('S2', 'row1', 5.0);
  const r2 = cue('S2', 'row2', 6.0);
  const ax = cue('S2', 'ax', 7.0);
  const calc: CalcShow = {
    mat: 1,
    vec: show(t, cx),
    eq1: show(t, cx + 0.2),
    row: [show(t, r1, 0.3) * (1 - show(t, r2, 0.3)), show(t, r2, 0.3) * (1 - show(t, ax + 0.4, 0.4))],
    mid: [show(t, r1 + 0.15), show(t, r2 + 0.15)],
    eq2: show(t, r1 + 0.4),
    res: [show(t, r1 + 0.55), show(t, r2 + 0.55)],
    tail: 0,
  };
  const xg = springOS(clamp((t - cx) / 0.7));
  const ag = springOS(clamp((t - ax) / 0.8));
  return (
    <AbsoluteFill>
      <Backdrop gx={VP.ox + 150} gy={VP.oy - 200} />
      <Stage id="v2" view={VP} M={I2}>
        {xg > 0 ? <Arrow view={VP} to={[xg, 0]} color={C.vec} w={6} head={26} /> : null}
        {ag > 0 ? <Arrow view={VP} to={[2 * ag, 1 * ag]} color={C.cyan} w={7} head={30} /> : null}
        <Origin view={VP} />
      </Stage>
      <VecLabel view={VP} p={[1, 0]} tex={col(C.vec, '\\mathbf{x}')} at={cx + 0.3} dx={-14} dy={18} />
      <VecLabel view={VP} p={[2, 1]} tex={`${col(C.cyan, 'A\\mathbf{x}')}`} at={ax + 0.5} />
      <CalcMV
        x={CALC.x}
        yc={CALC.yc}
        size={46}
        prefix
        vec={['1', '0']}
        vecColor={C.vec}
        mid={['2⋅1 + 1⋅0', '1⋅1 + 2⋅0']}
        res={['2', '1']}
        resColor={C.cyan}
        show={calc}
      />
      <Header index="02" label="Rechnen" at={0} />
      <Headline lines={[[['Matrix mal Vektor.']]]} at={0.1} size={92} />
      <Hairline y={560} at={-5} />
    </AbsoluteFill>
  );
};

/* S3 · Gedreht: A·x verlässt die Linie von x */
export const S3: React.FC = () => {
  const t = useSec();
  const ln = cue('S3', 'line', 2.6);
  const gd = cue('S3', 'gedreht', 5.0);
  const arcP = prog(t, gd, 1.0, easeOutCubic);
  const calcO = 1 - prog(t, 0.1, 0.5);
  return (
    <AbsoluteFill>
      <Backdrop gx={VP.ox + 150} gy={VP.oy - 200} />
      <Stage id="v3" view={VP} M={I2}>
        <SpanLine view={VP} d={[1, 0]} color={C.vec} grow={prog(t, ln, 0.9, easeOutCubic)} opacity={0.55} />
        <AngleArc view={VP} r={190} a0={0} a1={26.565 * arcP} color={C.txt2} opacity={arcP > 0 ? 0.95 : 0} />
        <Arrow view={VP} to={[2, 1]} color={C.cyan} w={7} head={30} />
        <Arrow view={VP} to={[1, 0]} color={C.vec} w={6} head={26} />
        <Origin view={VP} />
      </Stage>
      <VecLabel view={VP} p={[1, 0]} tex={col(C.vec, '\\mathbf{x}')} at={-5} dx={-14} dy={18} />
      <VecLabel view={VP} p={[2, 1]} tex={`${col(C.cyan, 'A\\mathbf{x}')}`} at={-5} />
      {arcP > 0 ? (
        <Mono x={VP.ox + 200} y={VP.oy - 62} at={gd} color={C.txt} upper={false} size={30}>
          {fmtDe(26.565 * arcP)}°
        </Mono>
      ) : null}
      <CalcMV
        x={CALC.x}
        yc={CALC.yc}
        size={46}
        prefix
        vec={['1', '0']}
        vecColor={C.vec}
        mid={['2⋅1 + 1⋅0', '1⋅1 + 2⋅0']}
        res={['2', '1']}
        resColor={C.cyan}
        show={{mat: 1, vec: 1, eq1: 1, row: [0, 0], mid: [1, 1], eq2: 1, res: [1, 1], tail: 0}}
        opacity={calcO}
      />
      <Header index="03" label="Sehen" at={0} />
      <Headline lines={[[['Andere Richtung.']], [['Gedreht.', C.txt2]]]} at={0.3} lineAt={[0.3, gd + 0.4]} size={92} />
      <Hairline y={560} at={-5} />
    </AbsoluteFill>
  );
};

/* S4 · Die Frage (Maske herein, Bühne gedimmt) */
export const S4: React.FC = () => {
  const t = useSec();
  const wipe = maskWipe(prog(t, 0, 0.6));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: wipe.clip}}>
        <Backdrop gx={VP.ox + 150} gy={VP.oy - 200} strength={0.7} />
        <AbsoluteFill style={{opacity: 0.22, filter: 'blur(3px)'}}>
          <Stage id="v4" view={VP} M={I2}>
            <Arrow view={VP} to={[2, 1]} color={C.cyan} w={7} head={30} />
            <Arrow view={VP} to={[1, 0]} color={C.vec} w={6} head={26} />
          </Stage>
        </AbsoluteFill>
        <Header index="04" label="Die Frage" at={0.4} />
        <Headline
          lines={[[['Gibt es einen,']], [['der ', C.txt], ['nicht', C.eig]], [['gedreht wird?']]]}
          at={0.5}
          lineAt={[0.5, 0.75, 1.0]}
          y={700}
          size={116}
        />
        <Mono x={72} y={1110} at={cue('S4', 'linie', 3.0)} upper={false} size={30} color={C.txt2}>
          … der auf seiner eigenen Linie bleibt?
        </Mono>
        <Hairline y={560} at={0.3} />
      </AbsoluteFill>
      {wipe.edge ? (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <line x1={wipe.edge[0]} y1={wipe.edge[1]} x2={wipe.edge[2]} y2={wipe.edge[3]} stroke={C.eig} strokeWidth={3} strokeOpacity={0.9} />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

/* S5 · Die Suche: x dreht, A·x folgt, Winkel → 0 bei 45° */
export const S5: React.FC = () => {
  const t = useSec();
  const z = prog(t, 0, 0.6);
  const found = cue('S5', 'hier', 6.1);
  const th = 45 * easeInOutCubic(clamp((t - 0.9) / (found - 0.9)));
  const x = dir(th);
  const ax = mul(A, x);
  const ang = angleBetween(x, ax);
  const lock = clamp((t - found) / 0.25);
  const glow = bump(t, found, 0.7);
  return (
    <AbsoluteFill style={{transform: `scale(${1.12 - 0.12 * z})`, opacity: clamp(z * 3)}}>
      <Backdrop gx={VP.ox + 150} gy={VP.oy - 200} />
      <Stage id="v5" view={VP} M={I2}>
        <circle cx={VP.ox} cy={VP.oy} r={VP.u} fill="none" stroke={C.vec} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="6 8" />
        <SpanLine view={VP} d={[1, 1]} color={C.eig} grow={prog(t, found, 0.8, easeOutCubic)} opacity={0.5} />
        <ProbePair view={VP} x={x} ax={ax} eigen={lock} id="v5" glow={glow} />
        <Origin view={VP} />
      </Stage>
      <AngleCounter value={ang} at={0.5} found={lock} />
      <Header index="05" label="Die Suche" at={0.1} />
      <Headline lines={[[['Wir suchen.']]]} at={0.2} out={found - 0.55} size={110} />
      <Headline lines={[[['Hier!', C.eig]]]} at={found} size={140} />
      <Hairline y={560} at={0} />
    </AbsoluteFill>
  );
};

/* S6 · Nachrechnen: A·(1,1) = (3,3) = 3·(1,1) */
export const S6: React.FC = () => {
  const t = useSec();
  const grow = prog(t, 0.2, 0.8);
  const vLen = lerp(1, Math.SQRT2, grow);
  const v = [vLen / Math.SQRT2, vLen / Math.SQRT2] as V2;
  const calcAt = cue('S6', 'calc', 2.2);
  const r1 = cue('S6', 'row1', 2.6);
  const r2 = cue('S6', 'row2', 3.2);
  const tailAt = cue('S6', 'dreimal', 4.9);
  const stretchAt = cue('S6', 'stretch', 5.1);
  const k = 1 + 2 * prog(t, stretchAt, 1.6);
  const settle = bump(t, stretchAt + 1.6, 0.6);
  const oldAx = 1 - prog(t, 0, 0.4);
  const calc: CalcShow = {
    mat: show(t, calcAt),
    vec: show(t, calcAt),
    eq1: show(t, calcAt + 0.1),
    row: [show(t, r1, 0.3) * (1 - show(t, r2, 0.3)), show(t, r2, 0.3) * (1 - show(t, tailAt, 0.3))],
    mid: [show(t, r1 + 0.15), show(t, r2 + 0.15)],
    eq2: show(t, r1 + 0.4),
    res: [show(t, r1 + 0.55), show(t, r2 + 0.55)],
    tail: show(t, tailAt, 0.5),
  };
  const [tx, ty] = toScreen(VP, [k, k]);
  return (
    <AbsoluteFill>
      <Backdrop gx={VP.ox + 150} gy={VP.oy - 200} />
      <Stage id="v6" view={VP} M={I2}>
        <SpanLine view={VP} d={[1, 1]} color={C.eig} grow={1} opacity={0.5} />
        <Ticks view={VP} d={[1, 1]} ks={[1, 2, 3]} show={show(t, tailAt, 0.6)} color={C.eig} />
        {oldAx > 0 ? <Arrow view={VP} to={mul(A, dir(45))} color={C.eig} w={7} head={30} opacity={oldAx} /> : null}
        {k > 1.001 ? <Arrow view={VP} to={[1, 1]} color={C.eig} w={5} head={24} opacity={0.55} dash="10 9" /> : null}
        <Arrow view={VP} to={k > 1.001 ? [k, k] : v} color={C.eig} w={8 + 2 * settle} head={34} glow={0.8 + settle} glowId="v6-blur" />
        <Origin view={VP} />
      </Stage>
      <VecLabel view={VP} p={[1, 1]} tex={`${col(C.eig, '\\mathbf{v}')} = ${col(C.eig, '\\begin{pmatrix}1\\\\1\\end{pmatrix}')}`} at={0.9} out={stretchAt} dx={24} dy={4} />
      {[1, 2].map((m) => {
        const [x, y] = toScreen(VP, [m, m]);
        return (
          <Mono key={m} x={x + 26} y={y + 14} at={tailAt + m * 0.15} color={C.eig} upper={false} size={22}>
            {m}·v
          </Mono>
        );
      })}
      {k > 1.001 ? (
        <div
          style={{
            position: 'absolute',
            left: tx - 40,
            top: ty - 70,
            transform: 'translateX(-100%)',
            fontFamily: F.mono,
            fontWeight: 600,
            fontSize: 38 + 10 * settle,
            color: C.lam,
            textShadow: `0 0 12px ${C.bg}`,
          }}
        >
          ×{k >= 2.999 ? '3' : fmtDe(k)}
        </div>
      ) : null}
      <CalcMV
        x={CALC.x}
        yc={CALC.yc}
        size={42}
        prefix
        vec={['1', '1']}
        vecColor={C.eig}
        mid={['2⋅1 + 1⋅1', '1⋅1 + 2⋅1']}
        res={['3', '3']}
        resColor={C.eig}
        tail={<Tex tex={`= ${col(C.lam, '3')}\\cdot${col(C.eig, '\\begin{pmatrix}1\\\\1\\end{pmatrix}')}`} size={42} />}
        tailW={220}
        show={calc}
      />
      <Header index="06" label="Nachrechnen" at={0} />
      <Headline
        lines={[[['Gleiche Richtung.']], [['Nur ', C.txt2], ['3×', C.lam], [' so lang.', C.txt2]]]}
        at={cue('S6', 'richtung', 6.9)}
        lineAt={[cue('S6', 'richtung', 6.9), cue('S6', 'lang', 7.7)]}
        size={92}
      />
      <Hairline y={560} at={-5} />
    </AbsoluteFill>
  );
};

/* S7 · Definition (Aha): Av = 3v → Av = λv */
const FX = 66;
const FY = 1432;
const FS = 124;
export const S7: React.FC = () => {
  const t = useSec();
  const fly = prog(t, 0.1, 0.9);
  const ev = cue('S7', 'eigenvektor', 2.2);
  const ew = cue('S7', 'eigenwert', 5.8);
  const am = cue('S7', 'amalv', 7.4);
  const lam = cue('S7', 'lambda', 8.4);
  const vPulse = bump(t, ev, 0.9);
  const morph = clamp((t - lam) / 0.7);
  const quiet = cue('S7', 'stille', 9.6);
  const breathe = t > quiet ? 1 + 0.012 * Math.sin((t - quiet) * 2.4) : 1;
  const size = lerp(42, FS, fly) * breathe;
  const leaderTop = FY + FS * 1.2 + 6;
  const label = (key: 'A' | 'k' | 'v2', text: string, color: string, at: number, anchor: 'center' | 'right' | 'left') => {
    const p = easeOutCubic(clamp((t - at) / 0.4));
    if (p <= 0) return null;
    const cx = FX + formulaCenter(key) * FS;
    const tr = anchor === 'center' ? '-50%' : anchor === 'right' ? 'calc(-100% + 10px)' : '-10px';
    return (
      <>
        <div style={{position: 'absolute', left: cx - 1, top: leaderTop, width: 2, height: 34 * p, background: color, opacity: 0.7}} />
        <div
          style={{
            position: 'absolute',
            left: cx,
            top: leaderTop + 44,
            transform: `translate(${tr}, ${(1 - p) * 10}px)`,
            opacity: p,
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 24,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            color,
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </div>
      </>
    );
  };
  return (
    <AbsoluteFill>
      <Backdrop gx={VP.ox + 150} gy={VP.oy - 200} />
      <Stage id="v7" view={VP} M={I2}>
        <SpanLine view={VP} d={[1, 1]} color={C.eig} grow={1} opacity={0.5} />
        <Ticks view={VP} d={[1, 1]} ks={[1, 2, 3]} show={1} color={C.eig} />
        <Arrow view={VP} to={[1, 1]} color={C.eig} w={5} head={24} opacity={0.55} dash="10 9" />
        <Arrow view={VP} to={[3, 3]} color={C.eig} w={8 + 2 * vPulse} head={34} glow={0.8 + vPulse} glowId="v7-blur" />
        <Origin view={VP} />
      </Stage>
      <div style={{position: 'absolute', left: 0, top: 1400, width: W, height: 360, background: `linear-gradient(180deg, rgba(7,8,26,.92), rgba(7,8,26,.92) 80%, rgba(7,8,26,0))`, opacity: fly}} />
      <EigenFormula x={lerp(600, FX, fly)} y={lerp(650, FY, fly)} size={size} morph={morph} vGlow={vPulse} />
      {label('v2', 'Eigenvektor', C.eig, ev, 'left')}
      {label('k', 'Eigenwert', C.lam, ew, 'right')}
      {label('A', 'Matrix', C.cyan, am, 'center')}
      <Mono x={FX + 4.1 * FS + 40} y={FY + 44} at={lam + 0.8} upper={false}>
        <Tex tex={`${col(C.eig, '\\mathbf{v}')} \\neq ${col(C.txt2, '\\mathbf{0}')}`} size={44} style={{color: C.txt2}} />
      </Mono>
      <Header index="07" label="Definition" at={0} />
      <Headline lines={[[['Eigenvektor']], [['und Eigenwert.', C.txt2]]]} at={ev - 0.3} lineAt={[ev - 0.3, ew - 0.3]} size={104} />
      <Hairline y={560} at={-5} />
      <Hairline y={1400} at={0.3} />
    </AbsoluteFill>
  );
};

/* S8 · Der zweite: Suche im Uhrzeigersinn bis −45°, A·(1,−1) = (1,−1) */
export const S8: React.FC = () => {
  const t = useSec();
  const found = cue('S8', 'gefunden', 2.6);
  const th = 45 - 90 * easeInOutCubic(clamp((t - 0.3) / (found - 0.3)));
  const lock = clamp((t - found) / 0.25);
  const grow = prog(t, cue('S8', 'eins', found + 0.6), 0.7);
  const len = lerp(1, Math.SQRT2, grow);
  const x = [len * Math.cos(deg(th)), len * Math.sin(deg(th))] as V2;
  const ax = mul(A, x);
  const ang = angleBetween(x, ax);
  const eigen = th > 40 ? 1 - clamp((45 - th) / 3) : Math.max(lock, 0);
  const glow = bump(t, found, 0.7);
  const same = show(t, cue('S8', 'unveraendert', 4.2), 0.5);
  const lamAt = cue('S8', 'eigenwert', 6.3);
  const [vx, vy] = toScreen(VP, [1, -1]);
  return (
    <AbsoluteFill>
      <Backdrop gx={VP.ox + 150} gy={VP.oy - 150} />
      <Stage id="v8" view={VP} M={I2}>
        <circle cx={VP.ox} cy={VP.oy} r={VP.u} fill="none" stroke={C.vec} strokeOpacity={0.35 * (1 - grow)} strokeWidth={2} strokeDasharray="6 8" />
        <SpanLine view={VP} d={[1, 1]} color={C.eig} grow={1} opacity={0.4} />
        <Arrow view={VP} to={[1, 1]} color={C.eig} w={5} head={22} opacity={0.4} />
        <SpanLine view={VP} d={[1, -1]} color={C.eig} grow={prog(t, found, 0.8, easeOutCubic)} opacity={0.5} />
        {same > 0 ? <Arrow view={VP} to={x} color={C.eig} w={14} head={40} opacity={0.25 * same} /> : null}
        <ProbePair view={VP} x={x} ax={ax} eigen={eigen} id="v8" glow={glow} />
        <Origin view={VP} />
      </Stage>
      <AngleCounter value={ang} at={0.2} out={found + 1.2} found={lock} />
      {lock > 0 ? (
        <>
          <Mono x={vx + 34} y={vy - 30} at={found + 0.5} upper={false}>
            <Tex tex={`A${col(C.eig, '\\begin{pmatrix}1\\\\-1\\end{pmatrix}')} = ${col(C.eig, '\\begin{pmatrix}1\\\\-1\\end{pmatrix}')}`} size={40} style={{color: C.cyan}} />
          </Mono>
          <Mono x={vx + 34} y={vy + 128} at={lamAt} upper={false}>
            <Tex tex={`${col(C.lam, '\\lambda')} = ${col(C.lam, '1')}`} size={44} />
          </Mono>
        </>
      ) : null}
      <Header index="08" label="Der zweite" at={0} />
      <Headline lines={[[['Noch einer.']], [['Bleibt, wie er ist.', C.txt2]]]} at={0.2} lineAt={[found - 0.2, cue('S8', 'unveraendert', 4.2)]} size={104} />
      <Hairline y={560} at={0} />
    </AbsoluteFill>
  );
};

/* S9 · Das große Bild: Kreis → Ellipse, Achsen auf den Eigenlinien */
export const S9: React.FC = () => {
  const t = useSec();
  const view = lerpView(VP, VW, prog(t, 0, 1.0));
  const gridIn = prog(t, 0.2, 0.8);
  const trAt = cue('S9', 'streckt', 4.6);
  const tt = prog(t, trAt, 2.2);
  const M = lerpM(A, tt);
  const pts: string[] = [];
  for (let i = 0; i <= 96; i++) {
    const p = mul(M, dir((i / 96) * 360));
    const [sx, sy] = toScreen(view, p);
    pts.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
  }
  const u1 = dir(45);
  const u2 = dir(-45);
  const e1 = mul(M, u1);
  const e2 = mul(M, u2);
  const [l1x, l1y] = toScreen(view, e1);
  const [l2x, l2y] = toScreen(view, e2);
  const matIn = show(t, 0.3, 0.5);
  return (
    <AbsoluteFill>
      <Backdrop gx={view.ox} gy={view.oy} />
      <Stage id="v9" view={view} M={M} gridAlpha={lerp(1, 1, gridIn)}>
        <SpanLine view={view} d={[1, 1]} color={C.eig} grow={1} opacity={0.5} />
        <SpanLine view={view} d={[1, -1]} color={C.eig} grow={1} opacity={0.5} />
        <polygon points={pts.join(' ')} fill={C.cyan} fillOpacity={0.08 * tt} stroke={mixHex(C.vec, C.cyan, tt)} strokeWidth={3} strokeOpacity={0.85} strokeDasharray={tt < 0.02 ? '6 8' : undefined} />
        <Arrow view={view} to={e1} color={C.eig} w={7} head={30} glow={0.8} glowId="v9-blur" />
        <Arrow view={view} to={e2} color={C.eig} w={7} head={30} glow={0.8} glowId="v9-blur" />
        <Origin view={view} />
      </Stage>
      <Mono x={l1x + 26} y={l1y - 30} at={cue('S9', 'dreifach', 5.9)} color={C.lam} upper={false} size={40}>
        ×3
      </Mono>
      <Mono x={l2x + 26} y={l2y - 6} at={cue('S9', 'garnicht', 7.5)} color={C.lam} upper={false} size={40}>
        ×1
      </Mono>
      <div style={{position: 'absolute', inset: 0, opacity: matIn}}>
        <MatrixView x={MAT_TL.x} y={MAT_TL.y} size={MAT_TL.size} />
      </div>
      <Header index="09" label="Das große Bild" at={0.2} />
      <Headline lines={[[['Kein Drehen.']], [['Nur Strecken.', C.txt2]]]} at={cue('S9', 'nichts', 2.4)} lineAt={[cue('S9', 'nichts', 2.4), trAt]} size={104} />
      <Hairline y={560} at={0} />
    </AbsoluteFill>
  );
};
