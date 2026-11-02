import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, MARGIN, W} from '../theme';
import {F} from '../fonts';
import {V2, bump, clamp, easeInOutCubic, easeOutCubic, lerp, prog, springOS} from '../math';
import {Backdrop, Hairline, Header, Headline, Mono, Tex, col, useSec} from '../ui';
import {CTA, ScreenWindow, WIN} from '../scenes/outro';
import {Cam, V3, add3, makeCam, sc3} from '../space';
import {cue} from './timeline';

const PLANE = C.vec;

const show = (t: number, at: number, d = 0.35) => easeOutCubic(clamp((t - at) / d));
// deterministische Zufallszahl in [0, 1)
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/* ---------- Mathematik der Aufgabe ---------- */

// U = { x + y = 2z } = Span{(1, 1, 1), (1, −1, 0)}: Punkte der Ebene über Koordinaten (s, r)
const B1: V3 = [1, 1, 1];
const B2: V3 = [1, -1, 0];
const onU = (s: number, r: number): V3 => add3(sc3(B1, s), sc3(B2, r));
const P: V3 = [1, 1, 1];
const PATCH = {s: [-1.8, 2.6], r: [-1.8, 1.8]};
// feste Beispielvektoren für die Bestätigung auf der Bühne (beide in U)
const UV: V3 = onU(1.2, -0.4);
const VV: V3 = onU(0.4, 1.0);

// Blick schräg von oben auf die Ebene, langsame Drift über das ganze Video
const camAt = (t: number, cy: number, u: number, cx = 480) => makeCam(34, -104 + 0.3 * t, cx, cy, u);

/* ---------- 3D-Bausteine (SVG) ---------- */

const ln3 = (cam: Cam, a: V3, b: V3, color: string, w: number, o: number, dash?: string, key?: string) => {
  const [x1, y1] = cam.p(a);
  const [x2, y2] = cam.p(b);
  return <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeOpacity={o} strokeDasharray={dash} strokeLinecap="round" />;
};

const arrow3 = (cam: Cam, to: V3, color: string, w: number, o = 1, key?: string) => {
  const [x1, y1] = cam.p([0, 0, 0]);
  const [x2, y2] = cam.p(to);
  const L = Math.hypot(x2 - x1, y2 - y1);
  if (L < 2 || o <= 0) return null;
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const h = Math.min(28, L * 0.5);
  const bx = x2 - ux * h;
  const by = y2 - uy * h;
  return (
    <g key={key} opacity={o}>
      <line x1={x1} y1={y1} x2={x2 - ux * h * 0.7} y2={y2 - uy * h * 0.7} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${bx - uy * h * 0.52},${by + ux * h * 0.52} ${bx + uy * h * 0.52},${by - ux * h * 0.52}`} fill={color} />
    </g>
  );
};

const pt3 = (cam: Cam, q: V3, color: string, r: number, o = 1, key?: string) => {
  const [x, y] = cam.p(q);
  return <circle key={key} cx={x} cy={y} r={r} fill={color} opacity={o} />;
};

const plane3 = (cam: Cam, o: number) => {
  if (o <= 0) return null;
  const [s0, s1] = PATCH.s;
  const [r0, r1] = PATCH.r;
  const pts = [onU(s0, r0), onU(s1, r0), onU(s1, r1), onU(s0, r1)].map((q) => cam.p(q).join(',')).join(' ');
  const grid: React.ReactNode[] = [];
  for (let k = -1.5; k <= 2.51; k += 0.5) grid.push(ln3(cam, onU(k, r0), onU(k, r1), C.blue, 1.2, 0.32 * o, undefined, `s${k}`));
  for (let k = -1.5; k <= 1.51; k += 0.5) grid.push(ln3(cam, onU(s0, k), onU(s1, k), C.blue, 1.2, 0.32 * o, undefined, `r${k}`));
  return (
    <g>
      <polygon points={pts} fill={C.indigo} fillOpacity={0.2 * o} stroke={C.cyan} strokeOpacity={0.55 * o} strokeWidth={2} />
      {grid}
    </g>
  );
};

const axes3 = (cam: Cam, o = 1) => (
  <g>
    {ln3(cam, [-0.6, 0, 0], [3.6, 0, 0], '#ffffff', 1.5, 0.38 * o)}
    {ln3(cam, [0, -0.6, 0], [0, 3.4, 0], '#ffffff', 1.5, 0.38 * o)}
    {ln3(cam, [0, 0, -1.4], [0, 0, 3.0], '#ffffff', 1.5, 0.38 * o)}
  </g>
);

// Bühne mit weichem Rand oben und unten, damit nichts in Text oder Plattform-UI läuft
const Stage3D: React.FC<{top: number; bottom?: number; opacity?: number; children: React.ReactNode}> = ({top, bottom = 1720, opacity = 1, children}) => {
  const mask = `linear-gradient(to bottom, transparent ${top}px, black ${top + 80}px, black ${bottom - 140}px, transparent ${bottom}px)`;
  return (
    <AbsoluteFill style={{WebkitMaskImage: mask, maskImage: mask, opacity}}>
      <svg width={W} height={1920} style={{position: 'absolute', inset: 0}}>
        {children}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- Aufgabenkarte und Fortschrittsleiste (ab S2 fest oben) ---------- */

// m = 0: groß in der Bildmitte (Hook), m = 1: feste Position oben
const TaskCard: React.FC<{m: number; appear?: number; glow?: number; answer?: number}> = ({m, appear = 1, glow = 0, answer = 0}) => {
  const top = lerp(640, 170, m);
  const h = lerp(400, 206, m);
  const fs = lerp(48, 44, m);
  const qs = lerp(38, 29, m);
  const cond = glow > 0.5 ? col(C.eig, 'x + y = 2z') : 'x + y = 2z';
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
        border: `1.5px solid rgba(255,255,255,${0.16 + 0.3 * answer})`,
        background: 'linear-gradient(180deg, rgba(255,255,255,.065), rgba(255,255,255,.025))',
        opacity: clamp(appear * 1.4),
        transform: `translateY(${(1 - appear) * 30}px)`,
      }}
    >
      <div style={{position: 'absolute', left: 32, top: lerp(30, 20, m), fontFamily: F.mono, fontSize: lerp(24, 20, m), letterSpacing: '.08em', color: C.txt2}}>AUFGABE</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: lerp(116, 54, m), display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', textShadow: glow > 0 ? `0 0 ${24 * glow}px rgba(255,194,71,${0.6 * glow})` : undefined}}>
        <Tex tex={`U = \\{\\, (x, y, z) \\in \\mathbb{R}^3 \\mid ${cond} \\,\\}`} size={fs} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: lerp(250, 134, m),
          textAlign: 'center',
          fontFamily: F.body,
          fontWeight: 500,
          fontSize: qs,
          color: C.txt2,
          opacity: 1 - clamp(answer * 2),
        }}
      >
        Ist U ein Untervektorraum von ℝ³?
      </div>
      {answer > 0 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 128, display: 'flex', justifyContent: 'center', opacity: clamp(answer * 2 - 0.6)}}>
          <Tex tex={`\\Rightarrow\\ U \\text{ ist ein Untervektorraum von } \\mathbb{R}^3\\ \\checkmark`} size={32} />
        </div>
      ) : null}
    </div>
  );
};

type StepState = 'idle' | 'active' | 'ok';
const STEP_NAMES = ['Nullvektor', 'Summe', 'Vielfaches'];
const STEP_W = 300;
// labels: wie weit die Namen schon eingeblendet sind (0..1 je Feld)
const Progress: React.FC<{m: number; states: StepState[]; labels: number[]; appear?: number[]; flips?: number[]}> = ({m, states, labels, appear = [-5, -5, -5], flips = []}) => {
  const t = useSec();
  const top = lerp(1090, 396, m);
  return (
    <>
      {states.map((st, i) => {
        const p = springOS(clamp((t - appear[i]) / 0.6));
        if (p <= 0) return null;
        const pulse = bump(t, flips[i] ?? -9, 0.5);
        const border = st === 'ok' ? C.txt : st === 'active' ? C.eig : 'rgba(255,255,255,.22)';
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: MARGIN + i * (STEP_W + 18),
              top,
              width: STEP_W,
              height: 76,
              boxSizing: 'border-box',
              borderRadius: 18,
              border: `2.5px solid ${border}`,
              background: st === 'active' ? 'rgba(255,194,71,.10)' : st === 'ok' ? 'rgba(243,244,251,.06)' : 'rgba(255,255,255,.02)',
              boxShadow: st === 'active' ? '0 0 30px rgba(255,194,71,.25)' : undefined,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              paddingLeft: 18,
              opacity: clamp(p * 1.4),
              transform: `scale(${(0.9 + 0.1 * p) * (1 + 0.06 * pulse)})`,
            }}
          >
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                border: `2px solid ${st === 'idle' ? C.txt2 : border}`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: F.mono,
                fontWeight: 600,
                fontSize: 22,
                color: st === 'idle' ? C.txt2 : border,
              }}
            >
              {i + 1}
            </span>
            <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 30, color: st === 'idle' ? C.txt2 : C.txt, opacity: labels[i]}}>{STEP_NAMES[i]}</span>
            {st === 'ok' ? <span style={{marginLeft: 'auto', marginRight: 18, fontFamily: F.display, fontWeight: 800, fontSize: 34, color: C.txt}}>✓</span> : null}
          </div>
        );
      })}
    </>
  );
};

/* ---------- Arbeitsfläche: Abschnittsmarken, Formelzeilen, Notizen ---------- */

const Title: React.FC<{text: string; at: number}> = ({text, at}) => <Headline lines={[[[text]]]} at={at} y={500} size={60} />;

const Label: React.FC<{text: string; y: number; at: number}> = ({text, y, at}) => (
  <Mono x={MARGIN} y={y} at={at} size={21} color={C.txt2}>
    {text}
  </Mono>
);

// Formelzeile; box = Rahmen (Ziel), hl = Hinterlegung (wird gerade benutzt)
const Row: React.FC<{tex: string; y: number; at: number; x?: number; size?: number; box?: number; hl?: number; hlColor?: string}> = ({tex, y, at, x = 250, size = 42, box = 0, hl = 0, hlColor = '255,194,71'}) => {
  const t = useSec();
  const p = show(t, at, 0.45);
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 14,
        top: y - 8,
        padding: '6px 14px',
        borderRadius: 12,
        border: `2.5px solid rgba(243,244,251,${0.85 * box})`,
        background: `rgba(${hlColor},${0.16 * hl})`,
        boxShadow: box > 0 ? `0 0 ${30 * box}px rgba(243,244,251,${0.25 * box})` : undefined,
        opacity: p,
        transform: `translateY(${(1 - p) * 14}px)`,
      }}
    >
      <Tex tex={tex} size={size} />
    </div>
  );
};

const Note: React.FC<{text: string; x: number; y: number; at: number; color?: string}> = ({text, x, y, at, color = C.txt2}) => (
  <Mono x={x} y={y} at={at} upper={false} size={24} color={color}>
    {text}
  </Mono>
);

// x₁, y₁, z₁ in Amber (u), x₂, y₂, z₂ in Cyan (v), λ in Koralle
const a1 = (s: string) => col(C.eig, s);
const c2 = (s: string) => col(C.cyan, s);
const lm = col(C.lam, '\\lambda');
const X1 = a1('x_1');
const Y1 = a1('y_1');
const Z1 = a1('z_1');
const X2 = c2('x_2');
const Y2 = c2('y_2');
const Z2 = c2('z_2');

/* S1 · Hook: die Aufgabe, Lösung in 3 Schritten */
export const S1: React.FC = () => {
  const t = useSec();
  const drei = cue('S1', 'drei', 6.3);
  const move = cue('S1', 'move', 7.6);
  const m = easeInOutCubic(clamp((t - move) / 0.9));
  return (
    <AbsoluteFill>
      <Backdrop gx={540} gy={lerp(1000, 900, m)} strength={0.9} />
      <TaskCard m={m} appear={springOS(clamp((t - 0.05) / 0.7))} />
      <Progress m={m} states={['idle', 'idle', 'idle']} labels={[0, 0, 0]} appear={[drei, drei + 0.2, drei + 0.4]} />
      <Header index="01" label="Klausuraufgabe · Lineare Algebra" at={-0.2} out={move} />
      <Headline lines={[[['Klausuraufgabe.']], [['Lösung in 3 Schritten.', C.txt2]]]} at={-0.15} lineAt={[-0.15, drei - 0.2]} out={move - 0.1} size={80} />
      <Hairline y={560} at={-0.2} out={move} />
    </AbsoluteFill>
  );
};

/* S2 · Was bedeutet U? Beispielpunkt, dann die Ebene */
export const S2: React.FC = () => {
  const t = useSec();
  const was = cue('S2', 'was', 0.5);
  const punkte = cue('S2', 'punkte', 2.7);
  const beispiel = cue('S2', 'beispiel', 7.8);
  const calc = cue('S2', 'calc', 10.5);
  const passt = cue('S2', 'passt', 13.0);
  const ebene = cue('S2', 'ebene', 14.6);
  const flaeche = cue('S2', 'flaeche', 16.6);
  const cam = camAt(t, 1380, 104);
  const dots = prog(t, ebene, 1.6, (x) => x);
  const planeO = prog(t, flaeche - 0.6, 1.0);
  const pIn = springOS(clamp((t - beispiel) / 0.5));
  const N = 120;
  const [px, py] = cam.p(P);
  return (
    <AbsoluteFill>
      <Backdrop gx={500} gy={1300} />
      <Stage3D top={930} opacity={show(t, 0, 0.8)}>
        {axes3(cam)}
        {plane3(cam, planeO)}
        {Array.from({length: N}, (_, i) => {
          const o = clamp(dots * N - i);
          if (o <= 0) return null;
          const q = onU(lerp(PATCH.s[0] + 0.1, PATCH.s[1] - 0.1, rnd(i, 1)), lerp(PATCH.r[0] + 0.1, PATCH.r[1] - 0.1, rnd(i, 2)));
          return pt3(cam, q, C.txt, 4.5, 0.75 * o * (1 - 0.6 * planeO), `d${i}`);
        })}
        {pIn > 0 ? pt3(cam, P, C.eig, 12 * pIn + 10 * bump(t, passt, 0.5)) : null}
        {pt3(cam, [0, 0, 0], C.txt, 6)}
      </Stage3D>
      {pIn > 0 ? (
        <Mono x={px + 20} y={py - 58} at={beispiel} upper={false} size={30} color={C.eig}>
          (1, 1, 1)
        </Mono>
      ) : null}
      <TaskCard m={1} glow={bump(t, punkte + 0.6, 3.0)} />
      <Progress m={1} states={['idle', 'idle', 'idle']} labels={[0, 0, 0]} />
      <Title text="Was bedeutet U?" at={was - 0.2} />
      <Row x={MARGIN} tex={`U = \\text{alle Punkte mit } ${col(C.eig, 'x + y = 2z')}`} y={600} at={punkte} />
      <Label text="Beispiel" y={706} at={beispiel} />
      <Row tex={`(x, y, z) = (${a1('1')}, ${a1('1')}, ${a1('1')})`} y={696} at={beispiel} />
      <Row tex={`${a1('1')} + ${a1('1')} = 2 \\cdot ${a1('1')}`} y={770} at={calc} />
      <Row tex={`2 = 2\\ \\checkmark`} y={844} at={passt} />
      <Note text="liegt in U" x={520} y={858} at={passt + 0.2} color={C.txt} />
    </AbsoluteFill>
  );
};

/* S3 · Der Plan: drei Bedingungen */
const PlanRow: React.FC<{n: number; name: string; tex: string; y: number; at: number}> = ({n, name, tex, y, at}) => {
  const t = useSec();
  const p = show(t, at, 0.45);
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: MARGIN, top: y, display: 'flex', alignItems: 'center', gap: 26, opacity: p, transform: `translateX(${(1 - p) * 24}px)`}}>
      <span style={{width: 56, height: 56, borderRadius: 28, border: `2.5px solid ${C.eig}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontWeight: 600, fontSize: 28, color: C.eig}}>{n}</span>
      <span style={{width: 300, fontFamily: F.display, fontWeight: 800, fontSize: 52, color: C.txt}}>{name}</span>
      <Tex tex={tex} size={46} />
    </div>
  );
};

export const S3: React.FC = () => {
  const t = useSec();
  const drei = cue('S3', 'drei', 0.5);
  const nul = cue('S3', 'null', 4.0);
  const sum = cue('S3', 'summe', 5.1);
  const vie = cue('S3', 'vielf', 6.1);
  const cam = camAt(t + 18.2, 1420, 96);
  return (
    <AbsoluteFill>
      <Backdrop gx={500} gy={1300} />
      <Stage3D top={1080} opacity={0.35}>
        {axes3(cam)}
        {plane3(cam, 1)}
        {pt3(cam, [0, 0, 0], C.txt, 6)}
      </Stage3D>
      <TaskCard m={1} />
      <Progress m={1} states={['idle', 'idle', 'idle']} labels={[show(t, nul), show(t, sum), show(t, vie)]} flips={[nul, sum, vie]} />
      <Title text="Der Plan: drei Bedingungen" at={drei - 0.2} />
      <PlanRow n={1} name="Nullvektor" tex={`\\mathbf{0} \\in U`} y={620} at={nul} />
      <PlanRow n={2} name="Summe" tex={`\\mathbf{u} + \\mathbf{v} \\in U`} y={720} at={sum} />
      <PlanRow n={3} name="Vielfaches" tex={`${lm}\\mathbf{u} \\in U`} y={820} at={vie} />
      <Note text="alle drei erfüllt ⇒ Untervektorraum" x={MARGIN} y={940} at={vie + 0.6} color={C.txt} />
    </AbsoluteFill>
  );
};

/* S4 · Schritt 1: Nullvektor */
export const S4: React.FC = () => {
  const t = useSec();
  const erstens = cue('S4', 'erstens', 0.4);
  const nullv = cue('S4', 'nullv', 1.3);
  const setz = cue('S4', 'setz', 3.1);
  const calc1 = cue('S4', 'calc1', 4.3);
  const calc2 = cue('S4', 'calc2', 6.2);
  const passt = cue('S4', 'passt', 8.1);
  const liegt = cue('S4', 'liegt', 8.9);
  const cam = camAt(t + 25.6, 1420, 96);
  const glow = t > liegt - 0.3 ? 0.5 + 0.5 * Math.sin((t - liegt) * 6) : 0;
  const lock = bump(t, liegt, 0.6);
  const stageO = lerp(0.35, 1, prog(t, liegt - 0.6, 0.6));
  return (
    <AbsoluteFill>
      <Backdrop gx={500} gy={1300} />
      <Stage3D top={1080} opacity={stageO}>
        {axes3(cam)}
        {plane3(cam, 1)}
        {t > liegt - 0.3 ? pt3(cam, [0, 0, 0], C.eig, 22 + 10 * glow + 30 * lock, 0.25 + 0.2 * glow) : null}
        {pt3(cam, [0, 0, 0], t > liegt - 0.3 ? C.eig : C.txt, 9 + 4 * lock)}
      </Stage3D>
      <TaskCard m={1} glow={bump(t, setz, 2.6)} />
      <Progress m={1} states={[t >= passt ? 'ok' : 'active', 'idle', 'idle']} labels={[1, 1, 1]} flips={[passt]} />
      <Title text="Schritt 1 · Nullvektor" at={erstens - 0.2} />
      <Label text="Zu zeigen" y={616} at={nullv} />
      <Row tex={`(0, 0, 0) \\text{ erfüllt } x + y = 2z`} y={606} at={nullv} />
      <Label text="Rechnung" y={720} at={calc1} />
      <Row tex={`0 + 0 = 0`} y={710} at={calc1} />
      <Note text="links" x={560} y={724} at={calc1 + 0.2} />
      <Row tex={`2 \\cdot 0 = 0`} y={784} at={calc2} />
      <Note text="rechts" x={560} y={798} at={calc2 + 0.2} />
      <Row tex={`\\Rightarrow\\ 0 + 0 = 2 \\cdot 0\\ \\checkmark`} y={858} at={passt} box={bump(t, passt, 1.2)} />
      <Note text="0 liegt in U" x={MARGIN} y={950} at={liegt} color={C.txt} />
    </AbsoluteFill>
  );
};

/* S5 · Schritt 2: Summe (der Kern) */
export const S5: React.FC = () => {
  const t = useSec();
  const zweitens = cue('S5', 'zweitens', 0.4);
  const wichtig = cue('S5', 'wichtig', 2.2);
  const nimm = cue('S5', 'nimm', 4.7);
  const gegeben = cue('S5', 'gegeben', 8.4);
  const zuzeigen = cue('S5', 'zuzeigen', 10.6);
  const uplusv = cue('S5', 'uplusv', 11.6);
  const sortier = cue('S5', 'sortier', 15.5);
  const allesv = cue('S5', 'allesv', 17.9);
  const einsetzen = cue('S5', 'einsetzen', 20.4);
  const ausklammern = cue('S5', 'ausklammern', 23.6);
  const rechte = cue('S5', 'rechte', 25.6);
  const cam = camAt(t + 36.6, 1460, 92);
  const stageO = lerp(0.3, 1, prog(t, rechte - 0.4, 0.6));
  const uIn = show(t, nimm, 0.6);
  const sumIn = springOS(clamp((t - rechte) / 0.7));
  const hl = clamp((t - einsetzen) / 0.3) * (1 - clamp((t - einsetzen - 2.6) / 0.4));
  const goal = Math.max(show(t, uplusv, 0.4) * (1 - clamp((t - uplusv - 2.5) / 0.6)), bump(t, rechte, 1.6));
  const [ux, uy] = cam.p(UV);
  const [vx, vy] = cam.p(VV);
  const [sx, sy] = cam.p(add3(UV, VV));
  return (
    <AbsoluteFill>
      <Backdrop gx={500} gy={1350} />
      <Stage3D top={1150} opacity={stageO}>
        {axes3(cam, 0.8)}
        {plane3(cam, 1)}
        {sumIn > 0 ? ln3(cam, UV, add3(UV, VV), C.cyan, 2.5, 0.5 * sumIn, '8 8') : null}
        {sumIn > 0 ? ln3(cam, VV, add3(UV, VV), C.eig, 2.5, 0.5 * sumIn, '8 8') : null}
        {arrow3(cam, UV, C.eig, 7, uIn)}
        {arrow3(cam, VV, C.cyan, 7, uIn)}
        {sumIn > 0 ? arrow3(cam, sc3(add3(UV, VV), sumIn), C.txt, 8) : null}
        {pt3(cam, [0, 0, 0], C.txt, 6)}
      </Stage3D>
      {uIn > 0 ? (
        <>
          <div style={{position: 'absolute', left: ux + 12, top: uy - 8, opacity: uIn * stageO}}>
            <Tex tex={col(C.eig, '\\mathbf{u}')} size={38} />
          </div>
          <div style={{position: 'absolute', left: vx + 12, top: vy - 50, opacity: uIn * stageO}}>
            <Tex tex={col(C.cyan, '\\mathbf{v}')} size={38} />
          </div>
        </>
      ) : null}
      {sumIn > 0 ? (
        <div style={{position: 'absolute', left: sx + 14, top: sy - 50, opacity: sumIn}}>
          <Tex tex={`\\mathbf{u} + \\mathbf{v} \\in U`} size={38} />
        </div>
      ) : null}
      <TaskCard m={1} />
      <Progress m={1} states={['ok', t >= rechte ? 'ok' : 'active', 'idle']} labels={[1, 1, 1]} flips={[-9, rechte]} />
      <Title text="Schritt 2 · Summe" at={zweitens - 0.2} />
      <Mono x={W - MARGIN} y={526} at={wichtig} anchor="right" upper={false} size={26} color={C.lam}>
        der wichtigste Schritt
      </Mono>
      <Label text="Gegeben" y={612} at={nimm} />
      <Row tex={`\\mathbf{u} = (${X1}, ${Y1}, ${Z1}),\\ \\mathbf{v} = (${X2}, ${Y2}, ${Z2}) \\in U`} y={602} at={nimm} size={38} />
      <Row tex={`${X1} + ${Y1} = 2${Z1}`} y={666} at={gegeben} hl={hl} />
      <Row tex={`${X2} + ${Y2} = 2${Z2}`} x={640} y={666} at={gegeben + 0.4} hl={hl} hlColor="0,200,200" />
      <Label text="Zu zeigen" y={760} at={zuzeigen} />
      <Row tex={`(${X1} + ${X2}) + (${Y1} + ${Y2}) = 2(${Z1} + ${Z2})`} y={750} at={uplusv} box={goal} />
      <Label text="Rechnung" y={864} at={sortier} />
      <Row tex={`(${X1} + ${X2}) + (${Y1} + ${Y2})`} y={854} at={sortier} />
      <Row tex={`= (${X1} + ${Y1}) + (${X2} + ${Y2})`} y={922} at={allesv} />
      <Note text="umsortiert" x={790} y={936} at={allesv + 0.3} />
      <Row tex={`= 2${Z1} + 2${Z2}`} y={990} at={einsetzen + 0.5} hl={hl} hlColor="243,244,251" />
      <Note text="eingesetzt" x={790} y={1004} at={einsetzen + 0.8} />
      <Row tex={`= 2(${Z1} + ${Z2})\\ \\checkmark`} y={1058} at={ausklammern} box={bump(t, rechte, 1.6)} />
      <Note text="ausgeklammert" x={790} y={1072} at={ausklammern + 0.3} />
    </AbsoluteFill>
  );
};

/* S6 · Schritt 3: Vielfaches (gleiches Muster) */
export const S6: React.FC = () => {
  const t = useSec();
  const drittens = cue('S6', 'drittens', 0.4);
  const muster = cue('S6', 'muster', 2.5);
  const zuzeigen = cue('S6', 'zuzeigen', 4.1);
  const gleichung = cue('S6', 'gleichung', 5.1);
  const ausk = cue('S6', 'ausklammern', 7.9);
  const eins = cue('S6', 'einsetzen', 9.8);
  const umst = cue('S6', 'umstellen', 11.3);
  const wieder = cue('S6', 'wieder', 12.6);
  const cam = camAt(t + 64.7, 1440, 96);
  const stageO = lerp(0.3, 1, prog(t, wieder - 0.4, 0.6));
  const sweep = easeInOutCubic(clamp((t - wieder) / 2.0));
  const L = lerp(1, -1.3, sweep) + 0.9 * Math.sin(Math.PI * sweep);
  const hl = clamp((t - eins) / 0.3) * (1 - clamp((t - eins - 2.2) / 0.4));
  const goal = Math.max(show(t, gleichung, 0.4) * (1 - clamp((t - gleichung - 2.2) / 0.6)), bump(t, wieder, 1.6));
  const tip = sc3(UV, L);
  const [tx, ty] = cam.p(tip);
  return (
    <AbsoluteFill>
      <Backdrop gx={500} gy={1350} />
      <Stage3D top={1100} opacity={stageO}>
        {axes3(cam, 0.8)}
        {plane3(cam, 1)}
        {ln3(cam, sc3(UV, -1.5), sc3(UV, 1.8), C.eig, 2, 0.35, '10 10')}
        {arrow3(cam, UV, C.eig, 5, 0.5)}
        {t > wieder ? arrow3(cam, tip, C.txt, 8) : null}
        {pt3(cam, [0, 0, 0], C.txt, 6)}
      </Stage3D>
      {t > wieder ? (
        <div style={{position: 'absolute', left: tx + (L < 0 ? -90 : 14), top: ty + (L < 0 ? 4 : -50)}}>
          <Tex tex={`${lm}\\mathbf{u}`} size={38} />
        </div>
      ) : null}
      <TaskCard m={1} />
      <Progress m={1} states={['ok', 'ok', t >= wieder ? 'ok' : 'active']} labels={[1, 1, 1]} flips={[-9, -9, wieder]} />
      <Title text="Schritt 3 · Vielfaches" at={drittens - 0.2} />
      <Mono x={W - MARGIN} y={526} at={muster} anchor="right" upper={false} size={26} color={C.lam}>
        gleiches Muster
      </Mono>
      <Label text="Gegeben" y={612} at={muster} />
      <Row tex={`${X1} + ${Y1} = 2${Z1}, \\quad ${lm} \\in \\mathbb{R}`} y={602} at={muster} hl={hl} />
      <Label text="Zu zeigen" y={706} at={zuzeigen} />
      <Row tex={`${lm}${X1} + ${lm}${Y1} = 2(${lm}${Z1})`} y={696} at={gleichung} box={goal} />
      <Label text="Rechnung" y={810} at={ausk - 0.5} />
      <Row tex={`${lm}${X1} + ${lm}${Y1}`} y={800} at={ausk - 0.5} />
      <Row tex={`= ${lm}(${X1} + ${Y1})`} y={868} at={ausk} />
      <Note text="ausgeklammert" x={790} y={882} at={ausk + 0.3} />
      <Row tex={`= ${lm} \\cdot 2${Z1}`} y={936} at={eins} hl={hl} hlColor="243,244,251" />
      <Note text="eingesetzt" x={790} y={950} at={eins + 0.3} />
      <Row tex={`= 2(${lm}${Z1})\\ \\checkmark`} y={1004} at={umst} box={bump(t, wieder, 1.6)} />
      <Note text="umgestellt" x={790} y={1018} at={umst + 0.3} />
    </AbsoluteFill>
  );
};

/* S7 · Ergebnis */
export const S7: React.FC = () => {
  const t = useSec();
  const alle = cue('S7', 'alle', 0.5);
  const uvr = cue('S7', 'uvr', 2.6);
  const cam = camAt(t + 79.8, 1440, 96);
  const glow = bump(t, uvr, 1.2);
  const S = add3(UV, VV);
  return (
    <AbsoluteFill>
      <Backdrop gx={500} gy={1350} strength={1 + 0.4 * glow} />
      <Stage3D top={1080}>
        {axes3(cam, 0.8)}
        {plane3(cam, 1 + 0.8 * glow)}
        {ln3(cam, UV, S, C.cyan, 2.5, 0.4, '8 8')}
        {ln3(cam, VV, S, C.eig, 2.5, 0.4, '8 8')}
        {arrow3(cam, UV, C.eig, 7)}
        {arrow3(cam, VV, C.cyan, 7)}
        {arrow3(cam, S, C.txt, 8)}
        {pt3(cam, [0, 0, 0], C.eig, 9)}
      </Stage3D>
      <TaskCard m={1} answer={prog(t, uvr, 0.7)} />
      <Progress m={1} states={['ok', 'ok', 'ok']} labels={[1, 1, 1]} flips={[alle, alle + 0.15, alle + 0.3]} />
      <Title text="Ergebnis" at={0} />
      <Row x={MARGIN} tex={`\\mathbf{0} \\in U\\ \\checkmark \\qquad \\mathbf{u} + \\mathbf{v} \\in U\\ \\checkmark \\qquad ${lm}\\mathbf{u} \\in U\\ \\checkmark`} y={620} at={alle} size={40} />
      <Row x={MARGIN} tex={`\\Rightarrow\\ U \\text{ ist ein Untervektorraum.}`} y={730} at={uvr} size={56} box={glow} />
    </AbsoluteFill>
  );
};

/* S8 · UniMathe: dieselbe Art Aufgabe, Schritt für Schritt */
const SRC_K = {w: 1290, h: 2796};
const SC_K = 0.72;
const WIN_K = {y: 640, h: 840};
const toWinK = (p: V2, focus: V2): V2 => [WIN.w / 2 + SC_K * (p[0] - focus[0]), WIN_K.h / 2 + SC_K * (p[1] - focus[1])];
// Karten im Original-Screen (Pixel des Screenshots): Schritt 1, 2, 3
const STEPS: [number, number][] = [
  [1162, 1554],
  [1603, 2058],
  [2107, 2632],
];
export const S8: React.FC = () => {
  const t = useSec();
  const bgIn = prog(t, 0, 0.45);
  const winIn = springOS(clamp((t - 0.3) / 0.8));
  const schritt = cue('S8', 'schritt', 2.1);
  const focus: V2 = [645, lerp(870, 1640, prog(t, 0.9, 2.2))];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: bgIn}}>
        <Backdrop gx={540} gy={1100} strength={0.8} />
      </AbsoluteFill>
      <ScreenWindow
        src="screen-aufgabe-unterraum-r3.png"
        focus={focus}
        srcW={SRC_K.w}
        srcH={SRC_K.h}
        sc={SC_K}
        y={WIN_K.y}
        h={WIN_K.h}
        opacity={clamp((t - 0.3) / 0.3)}
        scale={1}
        dy={(1 - winIn) * 90}
      >
        {STEPS.map(([y0, y1], i) => {
          const p = springOS(clamp((t - schritt - 0.4 * i) / 0.6));
          if (p <= 0) return null;
          const [ax, ay] = toWinK([49, y0], focus);
          const [bx, by] = toWinK([1243, y1], focus);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: ax,
                top: ay,
                width: bx - ax,
                height: by - ay,
                borderRadius: 22,
                boxShadow: `inset 0 0 0 4px ${C.lam}`,
                background: 'rgba(255,122,92,.07)',
                opacity: clamp(p),
                transform: `scale(${1.08 - 0.08 * p})`,
              }}
            />
          );
        })}
      </ScreenWindow>
      <Header index="UniMathe" label="Mehr Klausuraufgaben" at={0.2} />
      <Headline lines={[[['Genau so.']], [['Schritt für Schritt.', C.txt2]]]} at={0.3} lineAt={[0.3, schritt - 0.2]} size={88} />
      <Hairline y={560} at={0.1} />
    </AbsoluteFill>
  );
};

/* S9 · CTA */
export const S9: React.FC = () => (
  <CTA label="Lineare Algebra · Untervektorräume" verstehen={cue('S9', 'verstehen', 1.0)} loesen={cue('S9', 'loesen', 1.3)} pillAt={cue('S9', 'pill', 0.44)} />
);
