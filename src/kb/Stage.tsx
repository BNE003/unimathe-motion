import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W} from '../theme';
import {F} from '../fonts';
import {bump, clamp, easeInOutCubic, easeOutCubic, lerp, prog, springOS} from '../math';
import {Tex, col, useSec} from '../ui';
import {Cam, V3, add3, makeCam, sc3} from '../space';
import {T} from './timeline';

/* ---------- Mathematik ---------- */

export const V1: V3 = [1, 1, 0];
export const V2: V3 = [0, 1, 1];
export const v3 = (a: number): V3 => [1, 2, a];
const onPlane = (s: number, r: number): V3 => add3(sc3(V1, s), sc3(V2, r));
// Kombinationen s·v₁ + r·v₂ für das Gitter in Teil 2
const STEPS = [-0.5, 0, 0.5, 1, 1.5, 2];
const LATTICE = STEPS.flatMap((s) => STEPS.map((r) => [s, r] as [number, number]));

// Stückweise Keyframes [Zeit, Wert], dazwischen weich
export const kf = (t: number, keys: [number, number][], ease = easeInOutCubic) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      return lerp(v0, v1, ease(clamp((t - t0) / (t1 - t0))));
    }
  }
  return keys[keys.length - 1][1];
};

// Parameter a: im Hook einmal durch a = 1 (Körper flach), danach bis zum Aha nie mehr bei 1
export const aAt = (t: number) => {
  if (t < T.loesung + 1.4) return kf(t, [[0, 3.0], [3.4, 1.8], [6.5, 2.7], [T.hookFlat, 1.0], [T.hookFlat + 1.6, 0.15], [T.loesung + 1.4, 2.2]]);
  const wobble = 2.2 + 0.25 * Math.sin((t - T.loesung - 1.4) * 0.5);
  if (t < T.kippt) return wobble;
  return lerp(wobble, 1, prog(t, T.kippt, 1.8));
};

/* ---------- Bühne: Position, Größe, Sichtbarkeit je Phase ---------- */

const PH = {
  hookEnd: T.drei + 0.3,
  ahaIn: T.raum - 0.3,
  s5: T.s3 + 0.2,
};

const stageAt = (t: number) => ({
  cx: 500,
  cy: kf(t, [[0, 1420], [PH.hookEnd, 1410], [PH.hookEnd + 1, 1510], [PH.ahaIn, 1510], [PH.ahaIn + 1, 1400], [PH.s5, 1400], [PH.s5 + 1, 1490]]),
  u: kf(t, [[0, 124], [2.2, 132], [PH.hookEnd, 136], [PH.hookEnd + 1, 62], [PH.ahaIn, 62], [PH.ahaIn + 1, 130], [PH.s5, 130], [PH.s5 + 1, 74]]),
  o: kf(t, [[0, 1], [PH.hookEnd, 1], [PH.hookEnd + 1, 0.4], [T.entscheidet - 0.3, 0.4], [T.entscheidet + 0.3, 0.14], [PH.ahaIn, 0.14], [PH.ahaIn + 1, 1], [PH.s5, 1], [PH.s5 + 1, 0.95], [T.merk, 0.95], [T.merk + 0.6, 0.35], [T.cta, 0.35], [T.cta + 0.5, 0]]),
  top: kf(t, [[0, 560], [PH.hookEnd, 560], [PH.hookEnd + 1, 1150], [PH.ahaIn, 1150], [PH.ahaIn + 1, 560], [PH.s5, 560], [PH.s5 + 1, 1130]]),
});

// Blick auf die Ebene von der Kante: Blickrichtung in der Ebene, senkrecht zum Fächer v₁, v₃, v₂
const PHI_EDGE = 180;
const edgeTheta = (phi: number) => {
  const p = (phi * Math.PI) / 180;
  return (Math.atan(Math.sin(p) - Math.cos(p)) * 180) / Math.PI;
};

export const camAt = (t: number) => {
  const st = stageAt(t);
  // schräg auf die Ebene (ca. 55° zur Normalen): v₁ nach rechts, v₂ nach links oben, v₃ nach oben
  const phiB = 262 - 12 * easeOutCubic(clamp(t / 12)) + 0.06 * Math.sin(t / 9) * 60;
  const thB = 30;
  const e = prog(t, T.flach + 0.4, 1.5) * (1 - prog(t, T.edgeBack, 1.3));
  const phi = lerp(phiB, PHI_EDGE, e);
  const th = lerp(thB, edgeTheta(PHI_EDGE), e);
  return {cam: makeCam(th, phi, st.cx + 170 * e, st.cy, st.u), st, edge: e};
};

/* ---------- SVG-Bausteine ---------- */

const ln3 = (cam: Cam, a: V3, b: V3, color: string, w: number, o: number, dash?: string, key?: string) => {
  const [x1, y1] = cam.p(a);
  const [x2, y2] = cam.p(b);
  return <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeOpacity={o} strokeDasharray={dash} strokeLinecap="round" />;
};

const arrow3 = (cam: Cam, from: V3, to: V3, color: string, w: number, o = 1, key?: string, glow = 0) => {
  const [x1, y1] = cam.p(from);
  const [x2, y2] = cam.p(to);
  const L = Math.hypot(x2 - x1, y2 - y1);
  if (L < 2 || o <= 0) return null;
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const h = Math.min(30, L * 0.45);
  const bx = x2 - ux * h;
  const by = y2 - uy * h;
  return (
    <g key={key} opacity={o} style={glow > 0 ? {filter: `drop-shadow(0 0 ${14 * glow}px ${color})`} : undefined}>
      <line x1={x1} y1={y1} x2={x2 - ux * h * 0.7} y2={y2 - uy * h * 0.7} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${bx - uy * h * 0.5},${by + ux * h * 0.5} ${bx + uy * h * 0.5},${by - ux * h * 0.5}`} fill={color} />
    </g>
  );
};

const poly = (cam: Cam, pts: V3[]) => pts.map((q) => cam.p(q).join(',')).join(' ');

/* ---------- Bühne ---------- */

export const Stage: React.FC = () => {
  const t = useSec();
  const {cam, st, edge} = camAt(t);
  // Beschriftungen würden sich in der Kantenansicht überlagern
  const labO = 1 - clamp(edge * 2.5);
  if (st.o <= 0.001) return null;
  const a = aAt(t);
  const w3 = v3(a);

  // Aufbau im Hook
  const g1 = springOS(clamp((t + 0.5) / 0.8));
  const g2 = springOS(clamp((t + 0.35) / 0.8));
  const g3 = springOS(clamp((t + 0.2) / 0.8));
  const planeO = prog(t, -0.2, 0.8);
  const spatO = prog(t, 0.1, 0.8) * (1 - prog(t, T.s3, 0.8));
  // Lichtblitz beim Flachklappen (Hook und Aha)
  const flash = Math.max(bump(t, T.hookFlat - 0.15, 0.9), bump(t, T.flach - 0.1, 1.1));
  // Teil 3: Gitter aus Kombinationen s·v₁ + t·v₂
  const lattice = prog(t, T.spannt, 2.2, (x) => x);
  const gridBoost = prog(t, T.spannt, 1.0) * (1 - prog(t, T.merk, 0.6));
  const dimGlow = bump(t, T.dim, 1.4);

  const plane: React.ReactNode[] = [];
  if (planeO > 0) {
    const [s0, s1, r0, r1] = [-0.7, 2.1, -0.7, 2.1];
    plane.push(
      <polygon
        key="pl"
        points={poly(cam, [onPlane(s0, r0), onPlane(s1, r0), onPlane(s1, r1), onPlane(s0, r1)])}
        fill={C.indigo}
        fillOpacity={(0.2 + 0.12 * gridBoost + 0.15 * dimGlow) * planeO}
        stroke={C.vec}
        strokeOpacity={0.4 * planeO}
        strokeWidth={2}
      />,
    );
    for (let k = -0.5; k <= 2.01; k += 0.5) {
      const major = Math.abs(k - Math.round(k)) < 0.01;
      const o = (major ? 0.2 + 0.35 * gridBoost : 0.1 + 0.05 * gridBoost) * planeO;
      plane.push(ln3(cam, onPlane(s0, k), onPlane(s1, k), gridBoost > 0.05 ? C.eig : C.vec, major ? 1.6 : 1, o, undefined, `a${k}`));
      plane.push(ln3(cam, onPlane(k, r0), onPlane(k, r1), gridBoost > 0.05 ? C.cyan : C.vec, major ? 1.6 : 1, o, undefined, `b${k}`));
    }
  }

  // Spat aus v₁, v₂, v₃: Flächen nach Tiefe sortiert (hinten zuerst)
  const spat: React.ReactNode[] = [];
  if (spatO > 0) {
    const O: V3 = [0, 0, 0];
    const A = V1;
    const B = V2;
    const Cc = w3;
    const AB = add3(A, B);
    const AC = add3(A, Cc);
    const BC = add3(B, Cc);
    const ABC = add3(AB, Cc);
    const faces: V3[][] = [
      [O, A, AB, B],
      [Cc, AC, ABC, BC],
      [O, A, AC, Cc],
      [B, AB, ABC, BC],
      [O, B, BC, Cc],
      [A, AB, ABC, AC],
    ];
    const thick = clamp(Math.abs(a - 1) / 1.2);
    faces
      .map((f) => ({f, d: f.reduce((s, q) => s + cam.depth(q), 0) / 4}))
      .sort((p, q) => q.d - p.d)
      .forEach(({f}, i) => {
        spat.push(
          <polygon
            key={`f${i}`}
            points={poly(cam, f)}
            fill={flash > 0.05 ? C.txt : C.lam}
            fillOpacity={(0.05 + 0.04 * thick + 0.3 * flash) * spatO}
            stroke={C.txt}
            strokeOpacity={(0.22 + 0.5 * flash) * spatO}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />,
        );
      });
  }

  // Aha: v₂ an die Spitze von v₁ schieben, landet auf der Spitze von v₃
  const para = prog(t, T.para, 1.0);
  const paraO = prog(t, T.para - 0.1, 0.3) * (1 - 0.6 * prog(t, T.s3, 0.6)) * (1 - prog(t, T.merk, 0.5));
  const tipGlow = bump(t, T.para + 0.95, 0.9);

  const [ox, oy] = cam.p([0, 0, 0]);
  const tip = (q: V3) => cam.p(q);
  const lab = (q: V3, dx: number, dy: number) => {
    const [x, y] = tip(q);
    return {left: x + dx, top: y + dy};
  };

  const mask = `linear-gradient(to bottom, transparent ${st.top}px, black ${st.top + 80}px, black 1540px, transparent 1660px)`;
  return (
    <AbsoluteFill style={{WebkitMaskImage: mask, maskImage: mask, opacity: st.o}}>
      <svg width={W} height={1920} style={{position: 'absolute', inset: 0}}>
        {ln3(cam, [-0.8, 0, 0], [2.6, 0, 0], '#ffffff', 1.4, 0.3 * planeO)}
        {ln3(cam, [0, -0.8, 0], [0, 4.4, 0], '#ffffff', 1.4, 0.3 * planeO)}
        {ln3(cam, [0, 0, -0.8], [0, 0, 3.4], '#ffffff', 1.4, 0.3 * planeO)}
        {plane}
        {spat}
        {lattice > 0
          ? LATTICE.map(([s, r], k) => {
              const o = clamp(lattice * LATTICE.length * 0.9 - k * 0.8);
              if (o <= 0) return null;
              const [x, y] = cam.p(onPlane(s, r));
              return <circle key={`p${k}`} cx={x} cy={y} r={5} fill={C.txt} opacity={0.75 * o * (1 - prog(t, T.merk, 0.5))} />;
            })
          : null}
        {paraO > 0 ? (
          <>
            {arrow3(cam, sc3(V1, para), add3(sc3(V1, para), V2), C.cyan, 5, 0.75 * paraO, 'pv2')}
            {para >= 1 ? ln3(cam, V2, add3(V1, V2), C.eig, 3, 0.45 * paraO, '9 9') : null}
          </>
        ) : null}
        {arrow3(cam, [0, 0, 0], sc3(V1, g1), C.eig, 7, 1, 'v1', dimGlow)}
        {arrow3(cam, [0, 0, 0], sc3(V2, g2), C.cyan, 7, 1, 'v2', dimGlow)}
        {arrow3(cam, [0, 0, 0], sc3(w3, g3), C.lam, 7, 1 - 0.5 * prog(t, T.s3 + 2.5, 0.8), 'v3', tipGlow)}
        {tipGlow > 0 ? <circle cx={tip(w3)[0]} cy={tip(w3)[1]} r={14 + 34 * tipGlow} fill="none" stroke={C.txt} strokeWidth={3} strokeOpacity={0.8 * tipGlow} /> : null}
        <circle cx={ox} cy={oy} r={6} fill={C.txt} />
      </svg>
      {g3 > 0.5 && labO > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: labO}}>
          <div style={{position: 'absolute', ...lab(V1, 10, -6)}}>
            <Tex tex={col(C.eig, 'v_1')} size={42} />
          </div>
          <div style={{position: 'absolute', ...lab(V2, -56, -50)}}>
            <Tex tex={col(C.cyan, 'v_2')} size={42} />
          </div>
          <div style={{position: 'absolute', ...lab(w3, 12, -48)}}>
            <Tex tex={col(C.lam, 'v_3')} size={42} />
          </div>
        </div>
      ) : null}
      {para >= 1 && paraO > 0 && t < T.s3 ? (
        <div style={{position: 'absolute', ...lab(w3, 12, 4), opacity: paraO * labO * (1 - prog(t, T.s3 - 0.4, 0.4))}}>
          <Tex tex={`= ${col(C.eig, 'v_1')} + ${col(C.cyan, 'v_2')}`} size={36} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- Regler „a = ?“ ---------- */

const A_MIN = -0.4;
const A_MAX = 3.2;

export const ASlider: React.FC = () => {
  const t = useSec();
  const st = stageAt(t);
  // während der Fallunterscheidung ausgeblendet, damit nichts in die Rechnung läuft
  const show = prog(t, 0.6, 0.6) * (1 - prog(t, T.s3 + 0.2, 0.6)) * (1 - prog(t, T.entscheidet - 0.3, 0.4) * (1 - prog(t, T.raum, 0.6)));
  if (show <= 0) return null;
  const a = aAt(t);
  const solved = t > T.kippt + 1.8;
  const m = kf(t, [[0, 0], [PH.hookEnd, 0], [PH.hookEnd + 1, 1], [PH.ahaIn, 1], [PH.ahaIn + 1, 0]]);
  const x = 660;
  const y = lerp(600, 1180, m);
  const w = 280;
  const kx = x + ((a - A_MIN) / (A_MAX - A_MIN)) * w;
  const oneX = x + ((1 - A_MIN) / (A_MAX - A_MIN)) * w;
  const flat = Math.max(bump(t, T.hookFlat - 0.15, 0.9), bump(t, T.kippt + 1.8, 0.9));
  const o = show * lerp(1, 0.6, m) * (st.o > 0.2 ? 1 : 0.5);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: 80, opacity: o}}>
      <div style={{fontFamily: F.mono, fontWeight: 600, fontSize: 30, color: C.lam, marginBottom: 14, textShadow: `0 0 12px ${C.bg}`}}>
        a = {solved ? '1' : '?'}
      </div>
      <div style={{position: 'absolute', left: 0, top: 58, width: w, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.22)'}} />
      {solved ? (
        <div style={{position: 'absolute', left: oneX - x - 1, top: 50, width: 2, height: 20, background: C.txt, opacity: 0.8}} />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: kx - x - 13,
          top: 47,
          width: 26,
          height: 26,
          borderRadius: 13,
          background: C.lam,
          boxShadow: `0 0 ${16 + 30 * flat}px rgba(255,122,92,${0.5 + 0.5 * flat})`,
        }}
      />
    </div>
  );
};
