import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W} from '../theme';
import {bump, clamp, easeInOutCubic, fmtDe, lerp, prog} from '../math';
import {Tex, col, useSec} from '../ui';
import {Cam, V3, add3, makeCam, sc3} from '../space';
import {T} from './timeline';

/* ---------- Mathematik ---------- */

const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: V3): V3 => sc3(a, 1 / Math.hypot(...a));

export const N_U: V3 = [1, 1, 1]; // U: x + y + z = 0
export const N_V: V3 = [1, -1, 2]; // V: x − y + 2z = 0
export const WV: V3 = [-3, 1, 2]; // Basis von U ∩ V
const WH = unit(WV);
// zweite Richtung in jeder Ebene, senkrecht zu w: u = n_U × w = (1, −5, 4), v = −(n_V × w) = (4, 8, 2)
const EU = unit(cross(N_U, WV));
const EV = unit(sc3(cross(N_V, WV), -1));
const onU = (a: number, b: number): V3 => add3(sc3(WH, a), sc3(EU, b));
const onV = (a: number, b: number): V3 => add3(sc3(WH, a), sc3(EV, b));

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

/* ---------- Bühne: Position, Größe, Sichtbarkeit je Phase ---------- */

const PH = {
  calc: T.s1 + 0.2, // Schritt 1: klein unten
  big2: T.blick - 0.6, // Blick entlang der Geraden: groß
  small2: T.edgeBack + 0.2,
  s3: T.beide - 0.6,
};

const stageAt = (t: number) => ({
  cx: 540,
  cy: kf(t, [[0, 900], [T.glide, 900], [T.glide + 1.2, 1130], [T.bild, 1130], [T.bild + 1, 1100], [PH.calc, 1100], [PH.calc + 1, 1305], [PH.big2, 1305], [PH.big2 + 1, 1170], [PH.small2, 1170], [PH.small2 + 1, 1305], [PH.s3, 1305], [PH.s3 + 1, 1340], [T.raum, 1340], [T.raum + 1.2, 1310]]),
  u: kf(t, [[0, 96], [T.glide, 100], [T.glide + 1.2, 104], [PH.calc, 108], [PH.calc + 1, 46], [PH.big2, 46], [PH.big2 + 1, 92], [PH.small2, 92], [PH.small2 + 1, 46], [PH.s3, 46], [PH.s3 + 1, 54], [T.raum, 54], [T.raum + 1.2, 60]]),
  o: kf(t, [[0, 0.75], [T.glide, 0.75], [T.glide + 1.2, 1], [PH.calc, 1], [PH.calc + 1, 0.55], [PH.big2, 0.55], [PH.big2 + 1, 1], [PH.small2, 1], [PH.small2 + 1, 0.6], [PH.s3, 0.6], [PH.s3 + 1, 1], [T.merk, 1], [T.merk + 0.6, 0.4], [T.cta, 0.4], [T.cta + 0.5, 0]]),
  top: kf(t, [[0, 0], [T.glide, 0], [T.glide + 1.2, 600], [T.bild, 600], [T.bild + 1, 640], [PH.calc, 640], [PH.calc + 1, 1150], [PH.big2, 1150], [PH.big2 + 1, 830], [PH.small2, 830], [PH.small2 + 1, 1150], [PH.s3, 1150], [T.merk, 1150], [T.merk + 0.8, 0]]),
});

// Blick genau entlang w: Kamera auf der +w-Seite, beide Ebenen erscheinen als Striche
const TH_EDGE = (Math.asin(WH[2]) * 180) / Math.PI;
const PHI_EDGE = (Math.atan2(WH[1], WH[0]) * 180) / Math.PI;

export const camAt = (t: number) => {
  const st = stageAt(t);
  // schräg von oben auf die „Buchkante“: beide Ebenen klar getrennt, die Gerade läuft diagonal
  const phiB = 228 + 9 * Math.sin(t / 7) - 6 * prog(t, 0, 14);
  const thB = 29 + 3 * Math.sin(t / 11);
  const e = prog(t, T.blick, 1.6) * (1 - prog(t, T.edgeBack, 1.4));
  // auf dem kürzeren Weg zur Kantenansicht drehen
  let dphi = PHI_EDGE - phiB;
  while (dphi > 180) dphi -= 360;
  while (dphi < -180) dphi += 360;
  const phi = phiB + dphi * e;
  const th = lerp(thB, TH_EDGE, e);
  return {cam: makeCam(th, phi, st.cx, st.cy, st.u), st, edge: e};
};

/* ---------- SVG-Bausteine ---------- */

const ln3 = (cam: Cam, a: V3, b: V3, color: string, w: number, o: number, key?: string, dash?: string) => {
  const [x1, y1] = cam.p(a);
  const [x2, y2] = cam.p(b);
  return <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeOpacity={o} strokeDasharray={dash} strokeLinecap="round" />;
};

const arrow3 = (cam: Cam, from: V3, to: V3, color: string, w: number, o = 1, key?: string, glow = 0) => {
  const [x1, y1] = cam.p(from);
  const [x2, y2] = cam.p(to);
  const L = Math.hypot(x2 - x1, y2 - y1);
  if (L < 6 || o <= 0) return null;
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

// Ebenen-Ausschnitt: |a| ≤ A entlang w, |b| ≤ B quer dazu
const A = 4.8;
const B = 3.3;

// Gitterpunkte i·w + j·u + k·v für U + V = ℝ³
const STEPS = [-2, -1, 0, 1, 2];
const LATTICE = STEPS.flatMap((i) => STEPS.flatMap((j) => STEPS.map((k) => add3(add3(sc3(WH, i * 1.5), sc3(EU, j * 1.5)), sc3(EV, k * 1.5)))))
  .map((q) => ({q, r: Math.hypot(...q)}))
  .sort((p, q) => p.r - q.r);

// Punkt auf der Schnittgeraden ab „nenn es t“
export const tParam = (t: number) => 0.85 * Math.sin((t - T.nennt) * 1.15);

/* ---------- Bühne ---------- */

export const Stage: React.FC = () => {
  const t = useSec();
  const {cam, st, edge} = camAt(t);
  if (st.o <= 0.001) return null;
  const labO = 1 - clamp(edge * 2.5);

  const uIn = prog(t, -0.3, 0.9);
  const vIn = prog(t, 0.1, 0.9);
  // Ebenen leuchten auf, wenn sie genannt werden
  const hiU = 1.6 * bump(t, T.uu - 0.1, 1.2) + 0.6 * bump(t, T.inU + 0.6, 1.2);
  const hiV = 1.6 * bump(t, T.vv - 0.1, 1.2) + 0.6 * bump(t, T.inV + 0.6, 1.2);
  // Schnittgerade: im Hook nur ein Glimmen, ab „Geraden“ zeichnet sie sich von der Mitte nach außen
  const lineGrow = prog(t, T.linie - 0.3, 1.4);
  const lineGlow = 0.25 * prog(t, 0.4, 1) * (1 - lineGrow) + lineGrow;
  const lineHi = bump(t, T.schnitt + 0.5, 1.4) + bump(t, T.steckt + 0.4, 1.6) + bump(t, T.merge, 1.4);
  const wIn = prog(t, T.ausklammern + 0.6, 0.8);
  const uvIn = prog(t, T.beide - 0.2, 0.9);
  const lattice = prog(t, T.raum, 2.4, (x) => x);
  const latticeOut = 1 - prog(t, T.merk + 0.4, 0.6);
  const pointO = prog(t, T.nennt, 0.4) * (1 - prog(t, T.s2 + 0.4, 0.5));

  // Vier Halbflächen (jede Ebene an der Geraden geteilt), nach Tiefe sortiert
  type Half = {pts: V3[]; color: string; o: number; key: string};
  const halves: Half[] = [];
  const addPlane = (on: (a: number, b: number) => V3, color: string, o: number, name: string) => {
    if (o <= 0) return;
    halves.push({pts: [on(-A, 0), on(A, 0), on(A, B), on(-A, B)], color, o, key: `${name}+`});
    halves.push({pts: [on(-A, 0), on(A, 0), on(A, -B), on(-A, -B)], color, o, key: `${name}-`});
  };
  addPlane(onU, C.eig, uIn * (1 + 1.2 * hiU), 'U');
  addPlane(onV, C.cyan, vIn * (1 + 1.2 * hiV), 'V');
  const planes = halves
    .map((h) => ({h, d: h.pts.reduce((s, q) => s + cam.depth(q), 0) / 4}))
    .sort((p, q) => q.d - p.d)
    .map(({h}, i, all) => {
      // Tiefe: hintere Halbflächen dunkler, vordere heller
      const near = all.length > 1 ? i / (all.length - 1) : 1;
      return (
        <polygon
          key={h.key}
          points={poly(cam, h.pts)}
          fill={h.color}
          fillOpacity={(0.07 + 0.12 * near) * h.o}
          stroke={h.color}
          strokeOpacity={(0.3 + 0.4 * near) * Math.min(1, h.o)}
          strokeWidth={2 + near}
          strokeLinejoin="round"
        />
      );
    });

  // feines Raster auf beiden Ebenen
  const grid: React.ReactNode[] = [];
  for (const [on, color, o, name] of [[onU, C.eig, uIn, 'U'], [onV, C.cyan, vIn, 'V']] as const) {
    if (o <= 0) continue;
    for (let b = -3; b <= 3.01; b += 1) if (Math.abs(b) > 0.01) grid.push(ln3(cam, on(-A, b), on(A, b), color, 1, 0.14 * o, `${name}b${b}`));
    for (let a = -4; a <= 4.01; a += 1) grid.push(ln3(cam, on(a, -B), on(a, B), color, 1, 0.14 * o, `${name}a${a}`));
  }

  const L = A * lineGrow;
  const [ox, oy] = cam.p([0, 0, 0]);
  const at = (q: V3, dx: number, dy: number) => {
    const [x, y] = cam.p(q);
    return {left: x + dx, top: y + dy};
  };
  const tp = tParam(t);
  const pt = sc3(WV, tp);
  // in der Kantenansicht zeigt w direkt auf die Kamera: dann ein Ring statt Pfeil
  const ring = clamp((edge - 0.75) * 4);

  const mask = st.top > 0 ? `linear-gradient(to bottom, transparent ${st.top}px, black ${st.top + 90}px, black 1560px, transparent 1700px)` : undefined;
  return (
    <AbsoluteFill style={{WebkitMaskImage: mask, maskImage: mask, opacity: st.o}}>
      <svg width={W} height={1920} style={{position: 'absolute', inset: 0}}>
        {ln3(cam, [-2.5, 0, 0], [2.5, 0, 0], '#ffffff', 1.2, 0.16)}
        {ln3(cam, [0, -2.5, 0], [0, 2.5, 0], '#ffffff', 1.2, 0.16)}
        {ln3(cam, [0, 0, -2.5], [0, 0, 2.5], '#ffffff', 1.2, 0.16)}
        {grid}
        {planes}
        {lattice > 0 && latticeOut > 0
          ? LATTICE.map(({q}, k) => {
              const o = clamp(lattice * LATTICE.length * 1.1 - k);
              if (o <= 0) return null;
              const [x, y] = cam.p(q);
              const near = clamp(1.3 - (cam.depth(q) - 12) / 8);
              return <circle key={`p${k}`} cx={x} cy={y} r={3 + 3 * near} fill={C.txt} opacity={(0.35 + 0.5 * near) * o * latticeOut} />;
            })
          : null}
        {lineGlow > 0 ? (
          <g style={{filter: `drop-shadow(0 0 ${10 + 14 * lineHi}px ${C.lam})`}}>
            {ln3(cam, sc3(WH, lineGrow > 0 ? -L : -A), sc3(WH, lineGrow > 0 ? L : A), C.lam, 4 + 2 * lineHi, Math.min(1, lineGlow * (0.75 + 0.25 * lineHi)), 'line')}
          </g>
        ) : null}
        {uvIn > 0 ? (
          <>
            {arrow3(cam, [0, 0, 0], sc3(EU, 3 * uvIn), C.eig, 6, uvIn, 'u')}
            {arrow3(cam, [0, 0, 0], sc3(EV, 3 * uvIn), C.cyan, 6, uvIn, 'v')}
          </>
        ) : null}
        {wIn > 0 ? arrow3(cam, [0, 0, 0], sc3(WV, wIn), C.lam, 7, 1 - ring, 'w', 0.6 + lineHi) : null}
        {ring > 0 ? <circle cx={ox} cy={oy} r={22} fill="none" stroke={C.lam} strokeWidth={5} opacity={ring} style={{filter: `drop-shadow(0 0 12px ${C.lam})`}} /> : null}
        {pointO > 0 ? (
          <circle cx={cam.p(pt)[0]} cy={cam.p(pt)[1]} r={11} fill={C.txt} opacity={pointO} style={{filter: `drop-shadow(0 0 10px ${C.lam})`}} />
        ) : null}
        <circle cx={ox} cy={oy} r={5} fill={C.txt} opacity={0.9} />
      </svg>
      {/* U und V bleiben auch in der Kantenansicht beschriftet: dort sind sie die beiden Striche */}
      <div style={{position: 'absolute', ...at(onU(0.6, B), 8, -50), opacity: uIn}}>
        <Tex tex={col(C.eig, 'U')} size={44} />
      </div>
      <div style={{position: 'absolute', ...at(onV(A * 0.82, -B), 6, -22), opacity: vIn}}>
        <Tex tex={col(C.cyan, 'V')} size={44} />
      </div>
      {labO > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: labO}}>
          {lineGrow > 0.8 && t < T.s1 + 0.6 ? (
            <div style={{position: 'absolute', ...at(sc3(WH, -A), -40, 8), opacity: prog(t, T.schnitt, 0.5) * (1 - prog(t, T.s1, 0.5))}}>
              <Tex tex={col(C.lam, 'U \\cap V')} size={38} />
            </div>
          ) : null}
          {wIn > 0.6 ? (
            <div style={{position: 'absolute', ...at(WV, 10, -50), opacity: wIn}}>
              <Tex tex={col(C.lam, 'w')} size={42} />
            </div>
          ) : null}
          {uvIn > 0.6 ? (
            <>
              <div style={{position: 'absolute', ...at(sc3(EU, 3), 8, -44), opacity: uvIn}}>
                <Tex tex={col(C.eig, 'u')} size={40} />
              </div>
              <div style={{position: 'absolute', ...at(sc3(EV, 3), 8, -44), opacity: uvIn}}>
                <Tex tex={col(C.cyan, 'v')} size={40} />
              </div>
            </>
          ) : null}
          {pointO > 0 ? (
            <div style={{position: 'absolute', ...at(pt, 18, -12), opacity: pointO, fontFamily: 'monospace'}}>
              <Tex tex={`${col(C.lam, 't')} = ${fmtDe(tp)}`} size={30} />
            </div>
          ) : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
