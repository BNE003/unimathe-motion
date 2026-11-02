import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';
import {A, V2, View, angleDeg, bump, clamp, easeOutCubic, fmtDe, lerpM, lerpView, mul, prog, scale, springOS, toScreen} from '../math';
import {AngleArc, Arrow, Origin, Seg, SpanLine, Stage} from '../plane';
import {Backdrop, Hairline, Header, Headline, MatrixView, Mono, Tex, col, useSec} from '../ui';

export const V1: View = {ox: 540, oy: 1150, u: 110};
const V2: View = {ox: 420, oy: 1250, u: 125};
export const V3: View = {ox: 380, oy: 1300, u: 165};
const R = 1.5;
const FAN: V2[] = Array.from({length: 12}, (_, i) => {
  // 0°, 30°, …, 330°: keine dieser Richtungen ist eine Eigenrichtung von A (45°, 135°, 225°, 315°)
  const a = (i * 30 * Math.PI) / 180;
  return [R * Math.cos(a), R * Math.sin(a)];
});

/* S1 · Hook: alle kippen, einer nicht */
export const S1: React.FC = () => {
  const t = useSec();
  const k = 0.06 + 0.94 * easeOutCubic(clamp(t / 1.9));
  const back = prog(t, 2.45, 0.55);
  const tt = k * (1 - back);
  const M = lerpM(A, tt);
  const fanO = 1 - prog(t, 2.72, 0.25);
  const lock = bump(t, 1.25, 0.8);
  const v = mul(M, [R / Math.SQRT2, R / Math.SQRT2]);
  return (
    <AbsoluteFill>
      <Backdrop gx={V1.ox} gy={V1.oy} />
      <Stage id="s1" view={V1} M={M}>
        <SpanLine view={V1} d={[1, 1]} color={C.eig} grow={prog(t, 0.4, 0.9, easeOutCubic)} opacity={0.42 * fanO} />
        {FAN.map((p, i) => {
          const q = mul(M, p);
          return (
            <g key={i}>
              <Seg view={V1} p0={p} p1={q} color={C.vec} w={3} opacity={0.22 * fanO} />
              <Arrow view={V1} to={q} color={C.vec} w={5} head={22} opacity={0.9 * fanO} />
            </g>
          );
        })}
        <Arrow view={V1} to={v} color={C.eig} w={8 + 3 * lock} head={34} glow={0.8 + 1.2 * lock} glowId="s1-blur" opacity={fanO} />
        <Origin view={V1} />
      </Stage>
      <Header index="01" label="Lineare Abbildung" at={-0.1} out={2.45} />
      <Headline lines={[[['Alle kippen weg.']], [['Dieser nicht.', C.eig]]]} at={-0.12} lineAt={[-0.12, 1.2]} out={2.12} />
      <Headline lines={[[['Warum?']]]} at={2.5} size={140} />
      <Hairline y={560} at={0.05} />
    </AbsoluteFill>
  );
};

/* S2 · Was eine Matrix tut: Spalten = Ziele der Basisvektoren */
export const S2: React.FC = () => {
  const t = useSec();
  const z = prog(t, 5.15, 0.85);
  const view = lerpView(lerpView(V1, V2, prog(t, 0.2, 1.2)), V3, z);
  const tt = prog(t, 3.0, 1.6);
  const M = lerpM(A, tt);
  const grow = springOS(clamp((t - 0.6) / 0.7));
  const e1 = mul(M, [1, 0]);
  const e2 = mul(M, [0, 1]);
  const e1o = 1 - z;
  const glow1 = clamp((t - 2.0) / 0.3) * (1 - clamp((t - 4.9) / 0.3));
  const glow2 = clamp((t - 2.35) / 0.3) * (1 - clamp((t - 4.9) / 0.3));
  const ring = (p: V2, at: number, o: number) => {
    const a = springOS(clamp((t - at) / 0.6));
    const hit = bump(t, 4.55, 0.6);
    if (a <= 0 || o <= 0) return null;
    const [x, y] = toScreen(view, p);
    return <circle cx={x} cy={y} r={(18 + 14 * hit) * a} fill="none" stroke={C.vec} strokeWidth={2.5} strokeDasharray="6 6" opacity={(0.85 - 0.5 * clamp((t - 4.6) / 0.4)) * o} />;
  };
  const matIn = springOS(clamp((t - 0.3) / 0.7));
  const matOut = prog(t, 5.05, 0.35);
  const [l1x, l1y] = toScreen(view, e1);
  const [l2x, l2y] = toScreen(view, e2);
  return (
    <AbsoluteFill>
      <Backdrop gx={view.ox} gy={view.oy} />
      <Stage id="s2" view={view} M={M}>
        {ring([2, 1], 2.2, e1o)}
        {ring([1, 2], 2.55, 1)}
        <Arrow view={view} to={scale(e1, grow)} color={C.vec} w={6} head={26} opacity={0.95 * e1o} />
        <Arrow view={view} to={scale(e2, grow)} color={C.vec} w={6} head={26} opacity={0.95} />
        <Origin view={view} />
      </Stage>
      <Mono x={l1x + 22} y={l1y + 8} at={0.9} out={5.05} color={C.vec} upper={false} size={30}>
        <Tex tex={col(C.vec, '\\mathbf{e}_1')} size={38} />
      </Mono>
      <Mono x={l2x - 84} y={l2y - 12} at={1.0} color={C.vec} upper={false} size={30}>
        <Tex tex={col(C.vec, '\\mathbf{e}_2')} size={38} />
      </Mono>
      <Mono x={toScreen(view, [2, 1])[0] + 30} y={toScreen(view, [2, 1])[1] - 50} at={2.3} out={4.4} color={C.vec} upper={false} size={28}>
        (2, 1)
      </Mono>
      <Mono x={toScreen(view, [1, 2])[0] + 30} y={toScreen(view, [1, 2])[1] - 50} at={2.65} out={4.4} color={C.vec} upper={false} size={28}>
        (1, 2)
      </Mono>
      <div style={{position: 'absolute', inset: 0, opacity: matIn * (1 - matOut), transform: `translateY(${(1 - matIn) * 30}px)`}}>
        <MatrixView x={290} y={690} size={56} colGlow={[glow1, glow2]} />
      </div>
      <Mono x={MARGIN_X} y={800} at={2.6} out={5.05}>
        Spalten = Ziele der Basis
      </Mono>
      <Header index="02" label="Was eine Matrix tut" at={0} out={5.05} />
      <Headline lines={[[['Eine Matrix']], [['bewegt den Raum.', C.txt2]]]} at={0.1} out={5.05} size={104} />
      <Hairline y={560} at={-5} />
    </AbsoluteFill>
  );
};
const MARGIN_X = 72;

/* S3 · Der Normalfall: e2 kippt von seiner Linie */
export const S3: React.FC = () => {
  const t = useSec();
  const view: View = {ox: V3.ox - 6 * prog(t, 0, 6, (x) => x), oy: V3.oy, u: V3.u + 8 * prog(t, 0, 6, (x) => x)};
  const rew = prog(t, 0.15, 0.6);
  const fwd = prog(t, 1.3, 1.7);
  const tt = t < 1.3 ? 1 - rew : fwd;
  const M = lerpM(A, tt);
  const e2 = mul(M, [0, 1]);
  const ang = angleDeg(e2);
  const tilt = 90 - ang;
  const arcO = clamp((t - 1.35) / 0.2);
  const settle = bump(t, 3.0, 0.5);
  const [l2x, l2y] = toScreen(view, e2);
  return (
    <AbsoluteFill>
      <Backdrop gx={view.ox} gy={view.oy} />
      <Stage id="s3" view={view} M={M}>
        <SpanLine view={view} d={[0, 1]} color={C.vec} grow={prog(t, 0.6, 0.7, easeOutCubic)} opacity={0.5} />
        <Arrow view={view} to={[0, 1]} color={C.vec} w={4} head={22} opacity={0.4 * clamp((t - 0.8) / 0.3)} dash="10 9" />
        <AngleArc view={view} r={120} a0={90} a1={ang} color={C.vec} opacity={0.9 * arcO} />
        <Arrow view={view} to={e2} color={C.vec} w={7 + 2 * settle} head={30} />
        <Origin view={view} />
      </Stage>
      <Mono x={l2x - 84} y={l2y - 12} at={-1} color={C.vec} upper={false} size={30}>
        <Tex tex={col(C.vec, '\\mathbf{e}_2')} size={38} />
      </Mono>
      {arcO > 0 ? (
        <Mono x={view.ox - 34} y={view.oy - 96} at={1.35} anchor="right" color={C.vec} size={28}>
          kippt {fmtDe(Math.max(0, tilt))}°
        </Mono>
      ) : null}
      <Header index="03" label="Der Normalfall" at={0.1} />
      <Headline lines={[[['Fast jeder Vektor']], [['kippt weg.', C.txt2]]]} at={0.2} size={104} />
      <Hairline y={560} at={-5} />
    </AbsoluteFill>
  );
};
