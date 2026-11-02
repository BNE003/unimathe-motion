import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, H, W} from '../theme';
import {A, V2, View, bump, clamp, easeOutCubic, fmtDe, lerp, lerpM, mul, prog, springOS, toScreen} from '../math';
import {Arrow, Origin, Seg, SpanLine, Stage, Ticks} from '../plane';
import {F} from '../fonts';
import {Backdrop, EigenFormula, Hairline, Header, Headline, MatrixView, Mono, Tex, col, formulaCenter, useSec} from '../ui';

export const VH: View = {ox: 330, oy: 1200, u: 118};
const FX = 66;
const FY = 1432;
const FS = 124;
const tipLabel = (): [number, number] => {
  const [x, y] = toScreen(VH, [3, 3]);
  return [x + 44, y + 4];
};

const HeroStage: React.FC<{
  id: string;
  tt: number;
  spanGrow: number;
  ticks: number;
  ghostO: number;
  vGlow: number;
  para: number;
}> = ({id, tt, spanGrow, ticks, ghostO, vGlow, para}) => {
  const M = lerpM(A, tt);
  return (
    <Stage id={id} view={VH} M={M} mask={{cx: VH.ox + 170, cy: VH.oy - 170, r: 860}}>
      <SpanLine view={VH} d={[1, 1]} color={C.eig} grow={spanGrow} opacity={0.42} />
      <Ticks view={VH} d={[1, 1]} ks={[1, 2, 3]} show={ticks} color={C.eig} />
      <Arrow view={VH} to={[1, 0]} color={C.vec} w={4} head={22} opacity={0.38 * ghostO} dash="10 9" />
      <Arrow view={VH} to={[0, 1]} color={C.vec} w={4} head={22} opacity={0.38 * ghostO} dash="10 9" />
      <Arrow view={VH} to={[1, 1]} color={C.eig} w={5} head={24} opacity={0.55 * ghostO} dash="10 9" />
      <Seg view={VH} p0={[2, 1]} p1={[2 + para, 1 + 2 * para]} color={C.vec} w={2.5} opacity={0.65 * Math.min(1, para * 3)} dash="8 8" />
      <Seg view={VH} p0={[1, 2]} p1={[1 + 2 * para, 2 + para]} color={C.vec} w={2.5} opacity={0.65 * Math.min(1, para * 3)} dash="8 8" />
      <Arrow view={VH} to={mul(M, [1, 0])} color={C.vec} w={6} head={26} opacity={0.95} />
      <Arrow view={VH} to={mul(M, [0, 1])} color={C.vec} w={6} head={26} opacity={0.95} />
      <Arrow view={VH} to={mul(M, [1, 1])} color={C.eig} w={8 + 2 * vGlow} head={34} glow={0.8 + vGlow} glowId={`${id}-blur`} />
      <Origin view={VH} />
    </Stage>
  );
};

const TickLabels: React.FC<{at: number}> = ({at}) => (
  <>
    {[1, 2].map((k) => {
      const [x, y] = toScreen(VH, [k, k]);
      return (
        <Mono key={k} x={x + 26} y={y + 14} at={at + k * 0.15} color={C.eig} upper={false} size={22}>
          {k}·v
        </Mono>
      );
    })}
  </>
);

/* S4 · Der Eigenvektor bleibt auf seiner Linie und wird gestreckt */
export const S4: React.FC = () => {
  const t = useSec();
  const wipe = prog(t, 0, 0.6);
  const tt = prog(t, 2.0, 2.0);
  const para = prog(t, 5.9, 0.8);
  const settle = bump(t, 4.0, 0.6);
  const v = mul(lerpM(A, tt), [1, 1]);
  const [vx, vy] = toScreen(VH, v);
  const counterOut = prog(t, 6.85, 0.25);
  const [tx, ty] = tipLabel();
  const tipIn = springOS(clamp((t - 7.0) / 0.6));
  // Maske entlang einer Rasterlinie (Richtung (1,2) im Raum, auf dem Bildschirm (1,-2))
  const n: V2 = [2 / Math.sqrt(5), 1 / Math.sqrt(5)];
  const d: V2 = [1 / Math.sqrt(5), -2 / Math.sqrt(5)];
  const c = lerp(-80, 1900, wipe);
  const P0: V2 = [n[0] * c, n[1] * c];
  const poly = [
    [P0[0] + d[0] * 5000, P0[1] + d[1] * 5000],
    [P0[0] - d[0] * 5000, P0[1] - d[1] * 5000],
    [P0[0] - d[0] * 5000 - n[0] * 5000, P0[1] - d[1] * 5000 - n[1] * 5000],
    [P0[0] + d[0] * 5000 - n[0] * 5000, P0[1] + d[1] * 5000 - n[1] * 5000],
  ]
    .map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`)
    .join(', ');
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: wipe < 1 ? `polygon(${poly})` : undefined}}>
        <Backdrop gx={VH.ox + 150} gy={VH.oy - 150} />
        <HeroStage id="s4" tt={tt} spanGrow={prog(t, 0.5, 0.8, easeOutCubic)} ticks={prog(t, 1.0, 0.8)} ghostO={clamp((t - 2.0) / 0.3)} vGlow={settle} para={para} />
        <TickLabels at={1.1} />
        <Mono x={vx + 22} y={vy + 6} at={0.9} out={1.9} color={C.eig} upper={false}>
          <Tex tex={`${col(C.eig, '\\mathbf{v}')} = ${col(C.eig, '\\begin{pmatrix}1\\\\1\\end{pmatrix}')}`} size={40} />
        </Mono>
        {t > 2.0 && counterOut < 1 ? (
          <div
            style={{
              position: 'absolute',
              left: vx - 40,
              top: vy - 70,
              transform: 'translateX(-100%)',
              fontFamily: F.mono,
              fontWeight: 600,
              fontSize: 34 + 10 * settle,
              color: C.lam,
              opacity: clamp((t - 2.0) / 0.2) * (1 - counterOut),
              textShadow: `0 0 12px ${C.bg}`,
            }}
          >
            ×{tt >= 0.999 ? '3' : fmtDe(1 + 2 * tt)}
          </div>
        ) : null}
        <Mono x={72} y={1436} at={6.1} out={7.7} upper={false}>
          <Tex
            tex={`${col(C.cyan, 'A')}${col(C.eig, '\\mathbf{v}')} = ${col(C.vec, '\\begin{pmatrix}2\\\\1\\end{pmatrix}')} + ${col(
              C.vec,
              '\\begin{pmatrix}1\\\\2\\end{pmatrix}',
            )} = ${col(C.eig, '\\begin{pmatrix}3\\\\3\\end{pmatrix}')}`}
            size={60}
          />
        </Mono>
        {tipIn > 0 ? <EigenFormula x={tx} y={ty} size={52} opacity={clamp(tipIn * 1.5)} /> : null}
        <Header index="04" label="Eigenvektor" at={0.6} />
        <Headline lines={[[['Gleiche Linie.']], [['Nur ', C.txt2], ['3×', C.lam], [' so lang.', C.txt2]]]} at={2.4} lineAt={[2.4, 5.0]} />
        <Hairline y={560} at={-5} />
        <Hairline y={1400} at={0.6} />
      </AbsoluteFill>
      {wipe > 0 && wipe < 1 ? (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <line x1={P0[0] + d[0] * 3000} y1={P0[1] + d[1] * 3000} x2={P0[0] - d[0] * 3000} y2={P0[1] - d[1] * 3000} stroke={C.eig} strokeWidth={3} strokeOpacity={0.9} />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

/* S5 · Aha: aus Av = 3v wird Av = λv */
export const S5: React.FC = () => {
  const t = useSec();
  const [tx, ty] = tipLabel();
  const fly = prog(t, 0.1, 0.85);
  const vPulse = bump(t, 3.55, 0.9);
  const morph = clamp((t - 5.1) / 0.7);
  const breathe = t > 6.9 ? 1 + 0.012 * Math.sin((t - 6.9) * 2.4) : 1;
  const size = lerp(52, FS, fly) * breathe;
  const leaderTop = FY + FS * 1.2 + 6;
  const label = (key: 'A' | 'k' | 'v2', text: string, color: string, at: number, anchor: 'center' | 'right' | 'left') => {
    const p = easeOutCubic(clamp((t - at) / 0.4));
    if (p <= 0) return null;
    const cx = FX + formulaCenter(key) * FS;
    const tx2 = anchor === 'center' ? '-50%' : anchor === 'right' ? 'calc(-100% + 10px)' : '-10px';
    return (
      <>
        <div style={{position: 'absolute', left: cx - 1, top: leaderTop, width: 2, height: 34 * p, background: color, opacity: 0.7}} />
        <div
          style={{
            position: 'absolute',
            left: cx,
            top: leaderTop + 44,
            transform: `translate(${tx2}, ${(1 - p) * 10}px)`,
            opacity: p,
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 22,
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
      <Backdrop gx={VH.ox + 150} gy={VH.oy - 150} />
      <HeroStage id="s5" tt={1} spanGrow={1} ticks={1} ghostO={1} vGlow={vPulse} para={1 - prog(t, 0, 0.5)} />
      <TickLabels at={-5} />
      <EigenFormula x={lerp(tx, FX, fly)} y={lerp(ty, FY, fly)} size={size} morph={morph} vGlow={vPulse} />
      {label('A', 'Matrix', C.cyan, 1.0, 'center')}
      {label('v2', 'Eigenvektor', C.eig, 3.6, 'left')}
      {label('k', 'Eigenwert', C.lam, 5.9, 'right')}
      <Mono x={FX + 4.1 * FS + 40} y={FY + 44} at={3.9} upper={false}>
        <Tex tex={`${col(C.eig, '\\mathbf{v}')} \\neq ${col(C.txt2, '\\mathbf{0}')}`} size={44} style={{color: C.txt2}} />
      </Mono>
      <Header index="04" label="Eigenvektor" at={-5} out={4.9} />
      <Header index="05" label="Eigenwert" at={5.0} />
      <Headline lines={[[['Gleiche Linie.']], [['Nur ', C.txt2], ['3×', C.lam], [' so lang.', C.txt2]]]} at={-5} />
      <Hairline y={560} at={-5} />
      <Hairline y={1400} at={-5} />
    </AbsoluteFill>
  );
};

/* S6 · Überblick: Richtungen, die auf ihrer Linie bleiben, und die zweite Eigenrichtung */
export const V6: View = {ox: 540, oy: 1150, u: 92};
export const S6_MATRIX = {x: 230, y: 650, size: 46};
const R6 = 1.5;
const FAN6: V2[] = Array.from({length: 12}, (_, i) => {
  const a = (i * 30 * Math.PI) / 180;
  return [R6 * Math.cos(a), R6 * Math.sin(a)];
});
export const S6: React.FC = () => {
  const t = useSec();
  const tt1 = prog(t, 0.3, 1.6);
  const tt = t < 2.9 ? tt1 : t < 3.5 ? 1 - prog(t, 2.9, 0.4) : prog(t, 3.5, 1.4);
  const M = lerpM(A, tt);
  const b1: V2 = [R6 / Math.SQRT2, R6 / Math.SQRT2];
  const b2: V2 = [R6 / Math.SQRT2, -R6 / Math.SQRT2];
  const v1 = mul(M, b1);
  const v2 = mul(M, b2); // = b2, da λ = 1
  const show2 = springOS(clamp((t - 3.1) / 0.6));
  const lock1 = bump(t, 1.8, 0.6);
  const lock2 = bump(t, 4.85, 0.6);
  const [x1, y1] = toScreen(V6, v1);
  const [x2, y2] = toScreen(V6, v2);
  const trailO = t < 2.9 ? 0.2 : t < 3.5 ? 0.2 * (1 - prog(t, 2.9, 0.3)) : 0.2;
  return (
    <AbsoluteFill>
      <Backdrop gx={V6.ox} gy={V6.oy} />
      <Stage id="s6" view={V6} M={M}>
        <SpanLine view={V6} d={[1, 1]} color={C.eig} grow={1} opacity={0.42} />
        <SpanLine view={V6} d={[1, -1]} color={C.eig} grow={prog(t, 3.1, 0.7, easeOutCubic)} opacity={0.42} />
        {FAN6.map((p, i) => {
          const q = mul(M, p);
          return (
            <g key={i}>
              <Seg view={V6} p0={p} p1={q} color={C.vec} w={3} opacity={trailO} />
              <Arrow view={V6} to={q} color={C.vec} w={5} head={22} opacity={0.9} />
            </g>
          );
        })}
        <Arrow view={V6} to={v1} color={C.eig} w={8 + 3 * lock1} head={34} glow={0.8 + lock1} glowId="s6-blur" />
        {show2 > 0 ? (
          <Arrow view={V6} to={[v2[0] * show2, v2[1] * show2]} color={C.eig} w={8 + 3 * lock2} head={34} glow={0.8 + lock2} glowId="s6-blur" />
        ) : null}
        <Origin view={V6} />
      </Stage>
      <Mono x={x1 - 170} y={y1 - 70} at={1.9} upper={false}>
        <Tex tex={`${col(C.lam, '\\lambda')} = ${col(C.lam, '3')}`} size={44} />
      </Mono>
      <Mono x={x2 + 30} y={y2 - 10} at={4.3} upper={false}>
        <Tex tex={`${col(C.eig, '\\begin{pmatrix}1\\\\-1\\end{pmatrix}')}\\!:\\ ${col(C.lam, '\\lambda')} = ${col(C.lam, '1')}`} size={40} />
      </Mono>
      <MatrixView x={S6_MATRIX.x} y={S6_MATRIX.y} size={S6_MATRIX.size} />
      <Header index="06" label="Überblick" at={0.05} out={5.5} />
      <Headline lines={[[['Richtungen, die auf']], [['ihrer Linie bleiben.', C.txt2]]]} at={0.1} out={5.5} size={92} />
      <Hairline y={560} at={0} />
    </AbsoluteFill>
  );
};
