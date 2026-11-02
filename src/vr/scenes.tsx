import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, H, MARGIN, W} from '../theme';
import {F} from '../fonts';
import {V2, View, add, bump, clamp, easeInOutCubic, easeOutCubic, lerp, prog, scale, springOS, toScreen} from '../math';
import {Arrow, Origin, Seg, Stage} from '../plane';
import {Backdrop, Hairline, Header, Headline, Mono, Tex, col, useSec} from '../ui';
import {CTA, ScreenWindow, WIN} from '../scenes/outro';
import {V3, add3, makeCam, sc3} from '../space';
import {cue} from './timeline';

const MAG = '#FF4FD8';
const SET = C.vec;
const I2: [[number, number], [number, number]] = [[1, 0], [0, 1]];
export const V0: View = {ox: 400, oy: 1330, u: 120};

const show = (t: number, at: number, d = 0.35) => easeOutCubic(clamp((t - at) / d));
const vecTex = (a: number | string, b: number | string, color: string = C.txt) => col(color, `\\begin{pmatrix}${a}\\\\${b}\\end{pmatrix}`);

// Linie y = x/2 + b (A: b = 0, B: b = 1), wächst von links nach rechts
const SetLine: React.FC<{view: View; b: number; grow?: number; opacity?: number; w?: number; color?: string}> = ({view, b, grow = 1, opacity = 1, w = 5, color = SET}) => {
  if (grow <= 0 || opacity <= 0) return null;
  const x0 = -6;
  const x1 = lerp(x0, 9, grow);
  return <Seg view={view} p0={[x0, x0 / 2 + b]} p1={[x1, x1 / 2 + b]} color={color} w={w} opacity={opacity} />;
};

const LineLabel: React.FC<{view: View; b: number; text: string; at: number; opacity?: number; pulse?: number}> = ({view, b, text, at, opacity = 1, pulse = 0}) => {
  const t = useSec();
  const p = springOS(clamp((t - at) / 0.6));
  if (p <= 0) return null;
  // A unterhalb ihrer Linie, B oberhalb, beide links im Bild
  const [x, y] = toScreen(view, [-2.6, -1.3 + b]);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: b === 0 ? y + 4 : y - 118,
        fontFamily: F.display,
        fontWeight: 800,
        fontSize: 96,
        color: C.txt,
        opacity: clamp(p) * opacity,
        transform: `scale(${(0.6 + 0.4 * p) * (1 + 0.18 * pulse)})`,
        textShadow: pulse > 0 ? `0 0 ${40 * pulse}px rgba(243,244,251,.8)` : undefined,
      }}
    >
      {text}
    </div>
  );
};

const TopCalc: React.FC<{tex: string; at: number; out?: number; y?: number; size?: number}> = ({tex, at, out, y = 600, size = 48}) => (
  <Mono x={MARGIN} y={y} at={at} out={out} upper={false}>
    <Tex tex={tex} size={size} />
  </Mono>
);

const Stamp: React.FC<{ok: boolean; text: string; at: number; x?: number; y?: number}> = ({ok, text, at, x = 1008, y = 610}) => {
  const t = useSec();
  const p = springOS(clamp((t - at) / 0.5));
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translateX(-100%) scale(${1.4 - 0.4 * p}) rotate(-4deg)`,
        transformOrigin: '100% 0%',
        opacity: clamp(p * 1.5),
        padding: '14px 26px',
        borderRadius: 14,
        border: `4px solid ${ok ? C.txt : MAG}`,
        color: ok ? C.txt : MAG,
        fontFamily: F.display,
        fontWeight: 800,
        fontSize: 52,
        whiteSpace: 'nowrap',
      }}
    >
      {ok ? '✓ ' : '✗ '}
      {text}
    </div>
  );
};

/* S1 · Hook: A oder B? */
export const S1: React.FC = () => {
  const t = useSec();
  const welche = cue('S1', 'welche', 4.5);
  const pa = bump(t, welche, 0.6);
  const pb = bump(t, welche + 0.45, 0.6);
  return (
    <AbsoluteFill>
      <Backdrop gx={V0.ox + 150} gy={V0.oy - 250} />
      <Stage id="r1" view={V0} M={I2}>
        <SetLine view={V0} b={0} grow={prog(t, -0.3, 1.2, easeOutCubic)} w={4 + 3 * pa} />
        <SetLine view={V0} b={1} grow={prog(t, -0.1, 1.2, easeOutCubic)} w={4 + 3 * pb} />
        <Origin view={V0} />
      </Stage>
      <LineLabel view={V0} b={0} text="A" at={0.5} pulse={pa} />
      <LineLabel view={V0} b={1} text="B" at={0.7} pulse={pb} />
      <Header index="01" label="Vektorräume" at={-0.2} />
      <Headline lines={[[['Nur eine ist ein']], [['Vektorraum.', C.txt2]]]} at={-0.15} out={welche - 0.4} size={100} />
      <Headline lines={[[['A oder B?']]]} at={welche} size={140} />
      <Hairline y={560} at={-0.2} />
    </AbsoluteFill>
  );
};

/* S2 · Vektor = Pfeil vom Nullpunkt, Linie = Menge von Vektoren */
export const S2: React.FC = () => {
  const t = useSec();
  const pfeil = cue('S2', 'pfeil', 0.3);
  const glA = cue('S2', 'gleiten', 3.5);
  const glB = cue('S2', 'linieB', 6.0);
  const menge = cue('S2', 'menge', 7.3);
  const grow = springOS(clamp((t - pfeil) / 0.7));
  // Spitze gleitet erst über A, dann kurz über B
  const onA = t < glB;
  const xa = lerp(2, 5, easeInOutCubic(clamp((t - glA) / 1.2))) - 7.5 * easeInOutCubic(clamp((t - glA - 1.2) / 1.3));
  const xb = lerp(-2, 3, easeInOutCubic(clamp((t - glB) / 1.1)));
  const tip: V2 = onA ? [xa, xa / 2] : [xb, xb / 2 + 1];
  const fan = show(t, menge, 0.8);
  const fanXs = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
  const moving = 1 - fan;
  return (
    <AbsoluteFill>
      <Backdrop gx={V0.ox + 150} gy={V0.oy - 250} />
      <Stage id="r2" view={V0} M={I2}>
        <SetLine view={V0} b={0} opacity={onA || fan > 0 ? 1 : 0.35} />
        <SetLine view={V0} b={1} opacity={!onA && fan <= 0 ? 1 : 0.25} />
        {fanXs.map((x, i) => {
          const o = clamp(fan * 10 - i);
          return o > 0 ? <Arrow key={x} view={V0} to={[x, x / 2]} color={SET} w={4} head={20} opacity={0.75 * o} /> : null;
        })}
        {grow > 0 && moving > 0 ? <Arrow view={V0} to={scale(tip, grow)} color={C.txt} w={7} head={30} opacity={moving} /> : null}
        <Origin view={V0} />
      </Stage>
      <LineLabel view={V0} b={0} text="A" at={-5} opacity={0.5} />
      <LineLabel view={V0} b={1} text="B" at={-5} opacity={0.5} />
      <Mono x={toScreen(V0, tip)[0] + 20} y={toScreen(V0, tip)[1] - 50} at={pfeil + 0.4} out={glA} upper={false} size={30} color={C.txt}>
        (2, 1)
      </Mono>
      <Header index="02" label="Grundlagen" at={0} />
      <Headline lines={[[['Vektor =']], [['Pfeil vom Nullpunkt.', C.txt2]]]} at={0.1} out={menge - 0.4} size={96} />
      <Headline lines={[[['Linie =']], [['Menge von Vektoren.', C.txt2]]]} at={menge} size={96} />
      <Mono x={MARGIN} y={600} at={0.6} upper={false} size={22}>
        im ℝ²
      </Mono>
      <Hairline y={560} at={-5} />
    </AbsoluteFill>
  );
};

/* S3 · Zwei Rechenarten: Addieren und Strecken */
export const S3: React.FC = () => {
  const t = useSec();
  const addAt = cue('S3', 'addieren', 0.3);
  const dock = cue('S3', 'dock', 3.2);
  const sumAt = cue('S3', 'summe', 5.0);
  const str = cue('S3', 'strecken', 9.0);
  const m2 = cue('S3', 'malzwei', 11.8);
  const m1 = cue('S3', 'minuseins', 13.8);
  const part2 = t >= str;
  const a: V2 = [2, 1];
  const b: V2 = [1, 2];
  const k = easeInOutCubic(clamp((t - dock) / 0.9));
  const sumP = springOS(clamp((t - sumAt) / 0.7));
  const lam = t < m2 ? 1 : t < m1 ? lerp(1, 2, easeInOutCubic(clamp((t - m2) / 0.8))) : lerp(2, -1, easeInOutCubic(clamp((t - m1) / 1.0)));
  const fmt = (x: number) => (Math.abs(x - Math.round(x)) < 0.02 ? String(Math.round(x)) : x.toFixed(1).replace('.', ','));
  return (
    <AbsoluteFill>
      <Backdrop gx={V0.ox + 150} gy={V0.oy - 250} />
      <Stage id="r3" view={V0} M={I2}>
        {!part2 ? (
          <>
            <Arrow view={V0} to={a} color={SET} w={6} head={26} opacity={show(t, addAt)} />
            <Arrow view={V0} from={scale(a, k)} to={add(scale(a, k), b)} color={SET} w={6} head={26} opacity={show(t, addAt + 0.4)} />
            {k > 0 ? <Seg view={V0} p0={[0, 0]} p1={b} color={SET} w={2} opacity={0.3} dash="8 8" /> : null}
            {sumP > 0 ? <Arrow view={V0} to={scale([3, 3], sumP)} color={C.txt} w={8} head={34} /> : null}
          </>
        ) : (
          <>
            <Seg view={V0} p0={[-6, -3]} p1={[8, 4]} color={SET} w={2} opacity={0.35} dash="14 12" />
            <Arrow view={V0} to={[2, 1]} color={SET} w={4} head={22} opacity={0.4} dash="10 9" />
            <Arrow view={V0} to={scale(a, lam)} color={C.txt} w={8} head={34} opacity={show(t, str)} />
          </>
        )}
        <Origin view={V0} />
      </Stage>
      {!part2 ? (
        <TopCalc tex={`${vecTex(2, 1, SET)} + ${vecTex(1, 2, SET)} = ${vecTex(3, 3)}`} at={sumAt - 0.2} />
      ) : (
        <>
          <TopCalc tex={`${col(C.lam, lam < 0 ? `(${fmt(lam).replace('-', '−')})` : fmt(lam))} \\cdot ${vecTex(2, 1, SET)} = ${vecTex(fmt(2 * lam).replace('-', '−'), fmt(lam).replace('-', '−'))}`} at={str} />
          <Mono x={1008} y={612} at={str + 0.2} anchor="right" upper={false} size={30} color={C.lam}>
            Zahl = Skalar
          </Mono>
        </>
      )}
      <Header index="03" label="Rechnen" at={0} />
      <Headline lines={[[['1 · Addieren']]]} at={0.1} out={str - 0.3} size={96} />
      <Headline lines={[[['2 · Strecken']]]} at={str} size={96} />
      <Hairline y={560} at={-5} />
    </AbsoluteFill>
  );
};

/* S4 · Die Regel */
export const S4: React.FC = () => {
  const t = useSec();
  const sw = prog(t, 0, 0.55);
  const s = lerp(-40, 3100, sw);
  const bleibt = cue('S4', 'bleibt', 4.2);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: sw < 1 ? `polygon(0px 0px, ${s}px 0px, 0px ${s}px)` : undefined}}>
        <Backdrop gx={540} gy={900} strength={0.7} />
        <AbsoluteFill style={{opacity: 0.22, filter: 'blur(2px)', transform: 'translateY(260px)'}}>
          <Stage id="r4" view={V0} M={I2}>
            <SetLine view={V0} b={0} />
            <SetLine view={V0} b={1} />
          </Stage>
        </AbsoluteFill>
        <Header index="04" label="Die Regel" at={0.3} />
        <Headline lines={[[['Ein Vektorraum']], [['ist eine Menge, die', C.txt2]], [['man nie verlässt.', C.txt2]]]} at={0.4} lineAt={[0.4, 0.6, 0.8]} size={92} />
        <Headline
          lines={[[['Addieren → ', C.txt2], ['bleibt drin.']], [['Strecken → ', C.txt2], ['bleibt drin.']]]}
          at={bleibt}
          lineAt={[bleibt, bleibt + 0.6]}
          y={900}
          size={84}
        />
        <Mono x={MARGIN} y={1180} at={bleibt + 1.2} upper={false} size={22}>
          Unterraum-Test im ℝ² · die Rechenregeln (Axiome) erbt die Menge vom ℝ²
        </Mono>
        <Hairline y={560} at={0.2} />
      </AbsoluteFill>
      {sw > 0 && sw < 1 ? (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <line x1={s} y1={0} x2={0} y2={s} stroke={C.txt} strokeWidth={3} strokeOpacity={0.8} />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

/* S5 · Test A */
export const S5: React.FC = () => {
  const t = useSec();
  const z = prog(t, 0, 0.6);
  const addAt = cue('S5', 'addiert', 2.6);
  const sumAt = cue('S5', 'ergebnis', 4.0);
  const strAt = cue('S5', 'gestreckt', 6.0);
  const ok = cue('S5', 'bestanden', 8.4);
  const a: V2 = [-2, -1];
  const b: V2 = [4, 2];
  const k = easeInOutCubic(clamp((t - addAt) / 0.9));
  const sumP = springOS(clamp((t - sumAt) / 0.6));
  const part2 = t >= strAt;
  const lam = 1 + 1.2 * Math.sin(Math.max(0, t - strAt) * 1.6) - 0.6 * clamp((t - strAt) / 1.5);
  return (
    <AbsoluteFill style={{transform: `scale(${1.1 - 0.1 * z})`, opacity: clamp(z * 3)}}>
      <Backdrop gx={V0.ox + 150} gy={V0.oy - 250} />
      <Stage id="r5" view={V0} M={I2}>
        <SetLine view={V0} b={0} w={6} />
        <SetLine view={V0} b={1} opacity={0.18} />
        {!part2 ? (
          <>
            <Arrow view={V0} to={a} color={SET} w={6} head={26} opacity={show(t, cue('S5', 'zwei', 1.2))} />
            <Arrow view={V0} from={scale(a, k)} to={add(scale(a, k), b)} color={SET} w={6} head={26} opacity={show(t, cue('S5', 'zwei', 1.2) + 0.25)} />
            {sumP > 0 ? <Arrow view={V0} to={scale([2, 1], sumP)} color={C.txt} w={8} head={34} glow={bump(t, sumAt + 0.4, 0.6)} glowId="r5-blur" /> : null}
          </>
        ) : (
          <Arrow view={V0} to={scale([2, 1], lam)} color={C.txt} w={8} head={34} />
        )}
        <circle cx={V0.ox} cy={V0.oy} r={14 + 6 * bump(t, 1.0, 0.8)} fill="none" stroke={C.txt} strokeWidth={3} opacity={0.8} />
        <Origin view={V0} />
      </Stage>
      <LineLabel view={V0} b={0} text="A" at={-5} />
      {!part2 ? <TopCalc tex={`${vecTex('-2', '-1', SET)} + ${vecTex(4, 2, SET)} = ${vecTex(2, 1)}`} at={sumAt - 0.1} /> : null}
      {part2 ? (
        <Mono x={MARGIN} y={612} at={strAt} upper={false} size={30} color={C.lam}>
          λ · (2, 1) bleibt auf A
        </Mono>
      ) : null}
      <Stamp ok text="Vektorraum" at={ok} y={760} />
      <Header index="05" label="Test A" at={0.1} />
      <Headline lines={[[['Linie A']], [['durch den Nullpunkt.', C.txt2]]]} at={0.2} size={96} />
      <Hairline y={560} at={0} />
    </AbsoluteFill>
  );
};

/* S6 · Test B */
export const S6: React.FC = () => {
  const t = useSec();
  const addAt = cue('S6', 'addiert', 1.2);
  const sumAt = cue('S6', 'ergebnis', 2.6);
  const fail = cue('S6', 'durchgefallen', 4.4);
  const nullAt = cue('S6', 'malnull', 6.5);
  const notB = cue('S6', 'nichtB', 8.6);
  const a: V2 = [0, 1];
  const b: V2 = [2, 2];
  const k = easeInOutCubic(clamp((t - addAt) / 0.9));
  const sumP = springOS(clamp((t - sumAt) / 0.6));
  const red = clamp((t - sumAt - 0.6) / 0.4);
  const part2 = t >= nullAt;
  const shrink = easeInOutCubic(clamp((t - nullAt - 0.3) / 1.0));
  const blink = t > notB ? 0.5 + 0.5 * Math.sin((t - notB) * 9) : 0;
  const sumColor = red > 0.5 ? MAG : C.txt;
  return (
    <AbsoluteFill>
      <Backdrop gx={V0.ox + 150} gy={V0.oy - 250} />
      <Stage id="r6" view={V0} M={I2}>
        <SetLine view={V0} b={0} opacity={0.18} />
        <SetLine view={V0} b={1} w={6} />
        {!part2 ? (
          <>
            <Arrow view={V0} to={a} color={SET} w={6} head={26} opacity={show(t, cue('S6', 'zwei', 0.3))} />
            <Arrow view={V0} from={scale(a, k)} to={add(scale(a, k), b)} color={SET} w={6} head={26} opacity={show(t, cue('S6', 'zwei', 0.3) + 0.25)} />
            {sumP > 0 ? <Arrow view={V0} to={scale([2, 3], sumP)} color={sumColor} w={8} head={34} glow={red} glowId="r6-blur" /> : null}
            {red > 0 ? <Seg view={V0} p0={[2, 3]} p1={[2, 2]} color={MAG} w={3} opacity={red} dash="6 6" /> : null}
          </>
        ) : (
          <>
            {shrink < 1 ? <Arrow view={V0} to={scale(a, 1 - shrink)} color={SET} w={6} head={26} /> : null}
            <circle cx={V0.ox} cy={V0.oy} r={16 + 6 * blink} fill={MAG} fillOpacity={0.25 * shrink} stroke={MAG} strokeWidth={4} opacity={shrink} />
          </>
        )}
        <Origin view={V0} />
      </Stage>
      <LineLabel view={V0} b={1} text="B" at={-5} />
      {!part2 ? <TopCalc tex={`${vecTex(0, 1, SET)} + ${vecTex(2, 2, SET)} = ${vecTex(2, 3, red > 0.5 ? MAG : C.txt)}`} at={sumAt - 0.1} /> : null}
      {!part2 && red > 0 ? (
        <Mono x={toScreen(V0, [2, 3])[0] + 30} y={toScreen(V0, [2, 3])[1] - 30} at={sumAt + 0.7} upper={false} size={26} color={MAG}>
          nicht auf B
        </Mono>
      ) : null}
      {part2 ? <TopCalc tex={`${col(C.lam, '0')} \\cdot ${vecTex(0, 1, SET)} = ${vecTex(0, 0, MAG)}`} at={nullAt} /> : null}
      {part2 ? (
        <Mono x={V0.ox + 34} y={V0.oy + 20} at={notB} upper={false} size={28} color={MAG}>
          Nullvektor liegt nicht auf B
        </Mono>
      ) : null}
      <Stamp ok={false} text="Durchgefallen" at={fail} y={760} />
      <Header index="06" label="Test B" at={0} />
      <Headline lines={[[['Linie B']], [['verschoben.', C.txt2]]]} at={0.1} size={96} />
      <Hairline y={560} at={-5} />
    </AbsoluteFill>
  );
};

/* S7 · Merksatz */
export const S7: React.FC = () => {
  const t = useSec();
  const glow = 0.5 + 0.5 * Math.sin(t * 3);
  return (
    <AbsoluteFill>
      <Backdrop gx={V0.ox} gy={V0.oy} strength={0.8} />
      <AbsoluteFill style={{opacity: 0.35}}>
        <Stage id="r7" view={V0} M={I2}>
          <SetLine view={V0} b={0} />
        </Stage>
      </AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <circle cx={V0.ox} cy={V0.oy} r={22 + 8 * glow} fill={C.txt} opacity={0.2 + 0.2 * glow} />
        <circle cx={V0.ox} cy={V0.oy} r={10} fill={C.txt} />
      </svg>
      <Header index="07" label="Merksatz" at={0} />
      <Headline lines={[[['Ohne Nullpunkt']], [['kein Vektorraum.', C.txt2]]]} at={cue('S7', 'ohne', 0.1)} lineAt={[cue('S7', 'ohne', 0.1), cue('S7', 'kein', 0.5)]} y={700} size={116} />
      <Hairline y={560} at={0} />
    </AbsoluteFill>
  );
};

/* S8 · Einen Pfeil mit allen Zahlen strecken = Linie A */
export const S8: React.FC = () => {
  const t = useSec();
  const strAt = cue('S8', 'strecken', 2.4);
  const lineA = cue('S8', 'lineA', 6.0);
  const sweep = easeInOutCubic(clamp((t - strAt) / (lineA - strAt)));
  const lam = t < strAt ? 1 : lerp(1, -3, clamp(sweep * 2)) + lerp(0, 6, clamp(sweep * 2 - 1));
  const lo = Math.min(1, lerp(1, -3, clamp(sweep * 2)));
  const hi = sweep > 0.5 ? lam : 1;
  const hit = bump(t, lineA, 0.9);
  const uIn = springOS(clamp((t - 0.3) / 0.7));
  return (
    <AbsoluteFill>
      <Backdrop gx={V0.ox + 150} gy={V0.oy - 250} />
      <Stage id="r8" view={V0} M={I2}>
        {t > lineA ? <SetLine view={V0} b={0} w={6 + 4 * hit} color={C.txt} opacity={0.5 + 0.5 * hit} /> : null}
        {t > strAt ? <Seg view={V0} p0={[2 * lo, lo]} p1={[2 * hi, hi]} color={C.eig} w={5} opacity={0.75} /> : null}
        {uIn > 0 ? <Arrow view={V0} to={scale([2, 1], uIn * lam)} color={C.eig} w={8} head={34} glow={0.8 + hit} glowId="r8-blur" /> : null}
        <Origin view={V0} />
      </Stage>
      {t > lineA ? <LineLabel view={V0} b={0} text="A" at={lineA} pulse={hit} /> : null}
      <Mono x={MARGIN} y={612} at={strAt} upper={false} size={34} color={C.lam}>
        λ = {lam.toFixed(1).replace('.', ',').replace('-', '−')}
      </Mono>
      <Mono x={toScreen(V0, [2, 1])[0] + 10} y={toScreen(V0, [2, 1])[1] + 14} at={0.6} out={strAt} upper={false}>
        <Tex tex={`${col(C.eig, '\\mathbf{u}')} = ${vecTex(2, 1, C.eig)}`} size={40} />
      </Mono>
      <Header index="08" label="Bauen" at={0} />
      <Headline lines={[[['Ein Pfeil.']], [['Alle Zahlen.', C.txt2]]]} at={0.1} out={lineA - 0.3} size={104} />
      <Headline lines={[[['Alle Vielfachen von ', C.txt2], ['u', C.eig]], [['= Linie A.']]]} at={lineA} size={84} />
      <Hairline y={560} at={0} />
    </AbsoluteFill>
  );
};

/* Netz aus Linien parallel zu u und w (Koordinatennetz, das u und w erzeugen) */
const Net: React.FC<{view: View; u: V2; w: V2; opacity: number; n?: number}> = ({view, u, w, opacity, n = 6}) => {
  if (opacity <= 0) return null;
  const lines: React.ReactNode[] = [];
  for (let k = -n; k <= n; k++) {
    const pu0 = add(scale(w, k), scale(u, -12));
    const pu1 = add(scale(w, k), scale(u, 12));
    const pw0 = add(scale(u, k), scale(w, -12));
    const pw1 = add(scale(u, k), scale(w, 12));
    lines.push(<Seg key={`u${k}`} view={view} p0={pu0} p1={pu1} color={C.eig} w={1.5} opacity={0.35 * opacity} />);
    lines.push(<Seg key={`w${k}`} view={view} p0={pw0} p1={pw1} color={C.cyan} w={1.5} opacity={0.35 * opacity} />);
  }
  return <g>{lines}</g>;
};

/* S9 · Zweiter Pfeil: Linearkombination und Spann */
export const S9: React.FC = () => {
  const t = useSec();
  const wAt = cue('S9', 'zweiter', 0.3);
  const ziel = cue('S9', 'ziel', 3.0);
  const route = cue('S9', 'route', 4.0);
  const lk = cue('S9', 'linkomb', 7.5);
  const alle = cue('S9', 'alle', 9.0);
  const spann = cue('S9', 'spann', 13.0);
  const u: V2 = [2, 1];
  const w: V2 = [1, 2];
  const wIn = springOS(clamp((t - wAt) / 0.7));
  const r1 = easeInOutCubic(clamp((t - route) / 0.7));
  const r2 = easeInOutCubic(clamp((t - route - 0.8) / 0.7));
  const r3 = easeInOutCubic(clamp((t - route - 1.6) / 0.7));
  const hit = bump(t, route + 2.3, 0.8);
  const routeO = 1 - prog(t, alle, 0.5);
  const fill = prog(t, alle, 3.0, (x) => x);
  // Der Punkt läuft eine Lissajous-Bahn im Bühnenbereich; λ, μ sind die dazu passenden Koeffizienten
  const path = (f: number): V2 => [1 + 3.6 * Math.sin(f * Math.PI * 2.2), 0.8 + 3.1 * Math.sin(f * Math.PI * 3.1 + 1.0)];
  const P = path(fill);
  const [tx, ty] = toScreen(V0, [4, 5]);
  return (
    <AbsoluteFill>
      <Backdrop gx={V0.ox + 150} gy={V0.oy - 250} />
      <AbsoluteFill style={{background: `rgba(75,43,230,${0.16 * prog(t, alle + 0.5, 2.5)})`}} />
      <Stage id="r9" view={V0} M={I2}>
        <Net view={V0} u={u} w={w} opacity={prog(t, alle, 2.6)} />
        {t > ziel && routeO > 0 ? <circle cx={tx} cy={ty} r={18 + 8 * Math.sin(t * 6) * (1 - clamp((t - route - 2.3) * 3))} fill="none" stroke={C.txt} strokeWidth={3} opacity={routeO} /> : null}
        {r1 > 0 && routeO > 0 ? <Arrow view={V0} to={scale(u, r1)} color={C.eig} w={6} head={26} opacity={routeO} /> : null}
        {r2 > 0 && routeO > 0 ? <Arrow view={V0} from={u} to={add(u, scale(w, r2))} color={C.cyan} w={6} head={26} opacity={routeO} /> : null}
        {r3 > 0 && routeO > 0 ? <Arrow view={V0} from={add(u, w)} to={add(add(u, w), scale(w, r3))} color={C.cyan} w={6} head={26} opacity={routeO} /> : null}
        {hit > 0 ? <circle cx={tx} cy={ty} r={30 + 40 * hit} fill={C.txt} opacity={0.25 * hit} /> : null}
        <Arrow view={V0} to={u} color={C.eig} w={8} head={34} />
        {wIn > 0 ? <Arrow view={V0} to={scale(w, wIn)} color={C.cyan} w={8} head={34} /> : null}
        {fill > 0
          ? Array.from({length: 220}, (_, i) => {
              // Spur: jeder bisher getroffene Punkt λu + μw bleibt als Punkt stehen
              const [px, py] = toScreen(V0, path((i / 220) * fill));
              return <circle key={i} cx={px} cy={py} r={5} fill={C.txt} opacity={0.55 * (1 - prog(t, spann + 0.5, 1.0))} />;
            })
          : null}
        {fill > 0 ? <Arrow view={V0} to={P} color={C.txt} w={6} head={26} opacity={clamp(fill * 8) * (1 - prog(t, spann, 0.5))} /> : null}
        <Origin view={V0} />
      </Stage>
      <Mono x={toScreen(V0, w)[0] - 70} y={toScreen(V0, w)[1] - 30} at={wAt + 0.3} upper={false}>
        <Tex tex={col(C.cyan, '\\mathbf{w}')} size={44} />
      </Mono>
      <Mono x={toScreen(V0, u)[0] + 14} y={toScreen(V0, u)[1] + 10} at={-5} upper={false}>
        <Tex tex={col(C.eig, '\\mathbf{u}')} size={44} />
      </Mono>
      {t > ziel && routeO > 0 ? (
        <Mono x={tx + 30} y={ty - 40} at={ziel} out={alle} upper={false} size={30} color={C.txt}>
          (4, 5)
        </Mono>
      ) : null}
      <TopCalc tex={`${col(C.lam, '1')}\\cdot${col(C.eig, '\\mathbf{u}')} + ${col(C.lam, '2')}\\cdot${col(C.cyan, '\\mathbf{w}')} = ${vecTex(4, 5)}`} at={route + 0.4} out={alle} />
      <Mono x={MARGIN} y={720} at={lk} out={alle} size={26} color={C.txt}>
        Linearkombination
      </Mono>
      {fill > 0 ? (
        <TopCalc
          tex={`${col(C.lam, '\\lambda')}${col(C.eig, '\\mathbf{u}')} + ${col(C.lam, '\\mu')}${col(C.cyan, '\\mathbf{w}')}\\ \\text{trifft jeden Punkt}`}
          at={alle}
          out={spann}
          size={44}
        />
      ) : null}
      <TopCalc tex={`\\text{Span}(${col(C.eig, '\\mathbf{u}')}, ${col(C.cyan, '\\mathbf{w}')}) = \\mathbb{R}^2`} at={spann} size={52} />
      <Header index="09" label="Linearkombination" at={0} />
      <Headline lines={[[['Zwei Pfeile.']], [['Jeder Punkt.', C.txt2]]]} at={0.1} out={spann - 0.3} size={104} />
      <Headline lines={[[['Das ist der Spann.']]]} at={spann} size={92} />
      <Hairline y={560} at={0} />
    </AbsoluteFill>
  );
};

/* S10 · Gleiche Richtung: nichts Neues */
export const S10: React.FC = () => {
  const t = useSec();
  const dreh = cue('S10', 'dreh', 0.4);
  const back = cue('S10', 'zurueck', 5.8);
  const p = easeInOutCubic(clamp((t - dreh) / 1.6)) * (1 - easeInOutCubic(clamp((t - back) / 0.9)));
  const u: V2 = [2, 1];
  const w: V2 = [lerp(1, 4, p), lerp(2, 2, p)];
  const flat = clamp((p - 0.85) / 0.15);
  return (
    <AbsoluteFill>
      <Backdrop gx={V0.ox + 150} gy={V0.oy - 250} />
      <AbsoluteFill style={{background: `rgba(75,43,230,${0.16 * (1 - p)})`}} />
      <Stage id="r10" view={V0} M={I2}>
        <Net view={V0} u={u} w={w} opacity={1 - flat * 0.6} />
        {flat > 0 ? <SetLine view={V0} b={0} color={C.txt} w={6} opacity={flat} /> : null}
        <Arrow view={V0} to={w} color={C.cyan} w={8} head={34} />
        <Arrow view={V0} to={u} color={C.eig} w={8} head={34} />
        <Origin view={V0} />
      </Stage>
      <TopCalc tex={`${col(C.cyan, '\\mathbf{w}')} = ${col(C.lam, '2')}\\cdot${col(C.eig, '\\mathbf{u}')}`} at={dreh + 1.4} out={back} size={52} />
      <Header index="10" label="Nichts Neues" at={0} out={back} />
      <Headline lines={[[['Gleiche Richtung?']], [['Nichts Neues.', C.txt2]]]} at={0.1} lineAt={[0.1, dreh + 1.6]} out={back} size={96} />
      <Hairline y={560} at={-5} />
    </AbsoluteFill>
  );
};

/* S11 · 3D: Ebene → ganzer Raum → nichts Neues */
export const S11: React.FC = () => {
  const t = useSec();
  const tilt = easeInOutCubic(clamp(t / 1.8));
  const cam = makeCam(lerp(90, 26, tilt), -90 + 28 * tilt + 6 * clamp(t / 13), V0.ox + 140 * tilt, V0.oy - 220 * tilt, lerp(V0.u, 95, tilt));
  const ebene = cue('S11', 'ebene', 2.0);
  const dritter = cue('S11', 'dritter', 4.2);
  const fuellt = cue('S11', 'fuellt', 5.4);
  const liegt = cue('S11', 'liegt', 8.6);
  const tIn = springOS(clamp((t - dritter) / 0.7));
  const fold = easeInOutCubic(clamp((t - liegt) / 1.4));
  const tv: V3 = add3(sc3([0, 0, 2], 1 - fold), sc3([3, 3, 0], fold));
  const layers = springOS(clamp((t - fuellt) / 1.2));
  const zAxis = prog(t, 0.9, 0.8, easeOutCubic);
  const P = cam.p;
  const line3 = (a: V3, b: V3, color: string, w: number, o: number, dash?: string, key?: string) => {
    const [x1, y1] = P(a);
    const [x2, y2] = P(b);
    return <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeOpacity={o} strokeDasharray={dash} strokeLinecap="round" />;
  };
  const arrow3 = (to: V3, color: string, w: number, o = 1, key?: string) => {
    const [x1, y1] = P([0, 0, 0]);
    const [x2, y2] = P(to);
    const L = Math.hypot(x2 - x1, y2 - y1);
    if (L < 2 || o <= 0) return null;
    const ux = (x2 - x1) / L;
    const uy = (y2 - y1) / L;
    const h = Math.min(30, L * 0.5);
    const bx = x2 - ux * h;
    const by = y2 - uy * h;
    return (
      <g key={key} opacity={o}>
        <line x1={x1} y1={y1} x2={x2 - ux * h * 0.7} y2={y2 - uy * h * 0.7} stroke={color} strokeWidth={w} strokeLinecap="round" />
        <polygon points={`${x2},${y2} ${bx - uy * h * 0.52},${by + ux * h * 0.52} ${bx + uy * h * 0.52},${by - ux * h * 0.52}`} fill={color} />
      </g>
    );
  };
  const R = 4.5;
  const sheet = (off: V3, o: number, key: string) => {
    const corners: V3[] = [
      [-R, -R, 0],
      [R, -R, 0],
      [R, R, 0],
      [-R, R, 0],
    ].map((c) => add3(c as V3, off));
    const pts = corners.map((c) => P(c).join(',')).join(' ');
    const grid: React.ReactNode[] = [];
    for (let k = -4; k <= 4; k++) {
      grid.push(line3(add3([k, -R, 0], off), add3([k, R, 0], off), C.blue, 1.2, 0.35 * o, undefined, `${key}x${k}`));
      grid.push(line3(add3([-R, k, 0], off), add3([R, k, 0], off), C.blue, 1.2, 0.35 * o, undefined, `${key}y${k}`));
    }
    return (
      <g key={key}>
        <polygon points={pts} fill={C.indigo} fillOpacity={0.14 * o} stroke={C.cyan} strokeOpacity={0.5 * o} strokeWidth={2} />
        {grid}
      </g>
    );
  };
  const offsets = [-3, -2, -1, 1, 2, 3].map((k) => ({k, off: sc3(tv, k * 0.55 * layers)}));
  offsets.sort((a, b) => cam.depth(b.off) - cam.depth(a.off));
  const sheetO = prog(t, ebene - 0.6, 0.8);
  return (
    <AbsoluteFill>
      <Backdrop gx={540} gy={1050} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {sheetO > 0 ? sheet([0, 0, 0], sheetO, 'main') : null}
        {offsets.map(({k, off}) => (layers > 0.01 && fold < 1 ? sheet(off, 0.55 * layers * (1 - fold) * (1 - Math.abs(k) * 0.12), `l${k}`) : null))}
        {line3([-6, 0, 0], [6, 0, 0], '#ffffff', 1.5, 0.35)}
        {line3([0, -6, 0], [0, 6, 0], '#ffffff', 1.5, 0.35)}
        {zAxis > 0 ? line3([0, 0, -4 * zAxis], [0, 0, 4 * zAxis], '#ffffff', 1.5, 0.45) : null}
        {arrow3([2, 1, 0], C.eig, 7)}
        {arrow3([1, 2, 0], C.cyan, 7)}
        {tIn > 0 ? arrow3(sc3(tv, tIn), C.txt, 8) : null}
        <circle cx={P([0, 0, 0])[0]} cy={P([0, 0, 0])[1]} r={7} fill={C.txt} />
      </svg>
      {zAxis > 0 ? (
        <Mono x={P([0, 0, 4.2])[0] + 12} y={P([0, 0, 4.2])[1] - 20} at={1.2} upper={false} size={30} color={C.txt2}>
          z
        </Mono>
      ) : null}
      <Mono x={MARGIN} y={612} at={ebene} out={dritter} upper={false} size={32} color={C.txt}>
        2 Pfeile → Ebene
      </Mono>
      <Mono x={MARGIN} y={612} at={fuellt} out={liegt} upper={false} size={32} color={C.txt}>
        + neue Richtung → ganzer Raum ℝ³
      </Mono>
      <Mono x={MARGIN} y={612} at={liegt + 1.2} upper={false} size={32} color={C.txt}>
        t = u + w liegt in der Ebene → nichts Neues
      </Mono>
      <Header index="11" label="Im Raum" at={0.2} />
      <Headline lines={[[['Im Raum']], [['geht es weiter.', C.txt2]]]} at={0.3} size={104} />
      <Hairline y={560} at={0} />
    </AbsoluteFill>
  );
};

/* S12 · UniMathe-Bridge: Aufgabe mit v₁, v₂, v₃ */
const SRC_A = {w: 1290, h: 2796};
const SC_A = 0.79;
const FOCUS_A: V2 = [645, 1010];
const toWinA = (p: V2): V2 => [WIN.w / 2 + SC_A * (p[0] - FOCUS_A[0]), WIN.h / 2 + SC_A * (p[1] - FOCUS_A[1])];
export const S12: React.FC = () => {
  const t = useSec();
  const bgIn = prog(t, 0, 0.45);
  const winIn = springOS(clamp((t - 0.35) / 0.8));
  const tipp = cue('S12', 'tipp', 7.0);
  const frame = (x0: number, x1: number, at: number, key: string) => {
    const p = springOS(clamp((t - at) / 0.6));
    if (p <= 0) return null;
    const [ax, ay] = toWinA([x0, 948]);
    const [bx, by] = toWinA([x1, 1182]);
    return (
      <div
        key={key}
        style={{
          position: 'absolute',
          left: ax,
          top: ay,
          width: bx - ax,
          height: by - ay,
          borderRadius: 14,
          boxShadow: `inset 0 0 0 4px ${C.lam}`,
          background: 'rgba(255,122,92,.10)',
          opacity: clamp(p),
          transform: `scale(${1.15 - 0.15 * p})`,
        }}
      />
    );
  };
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: bgIn}}>
        <Backdrop gx={540} gy={1010} strength={0.8} />
      </AbsoluteFill>
      <ScreenWindow src="screen-aufgabe-unterraeume.png" focus={FOCUS_A} srcW={SRC_A.w} srcH={SRC_A.h} sc={SC_A} opacity={clamp((t - 0.35) / 0.3)} scale={1} dy={(1 - winIn) * 90}>
        {frame(108, 362, tipp, 'v1')}
        {frame(388, 640, tipp + 0.35, 'v2')}
      </ScreenWindow>
      <Header index="12" label="UniMathe" at={0.3} />
      <Headline lines={[[['Jetzt du.']], [['Bringt jeder etwas Neues?', C.txt2]]]} at={0.4} lineAt={[0.4, 1.2]} size={84} />
      <Hairline y={560} at={0.2} />
    </AbsoluteFill>
  );
};

/* S13 · CTA */
export const S13: React.FC = () => (
  <CTA label="Lineare Algebra · Vektorräume · Unterräume" verstehen={cue('S13', 'verstehen', 1.0)} loesen={cue('S13', 'loesen', 1.25)} pillAt={cue('S13', 'pill', 1.6)} />
);
