import React, {useLayoutEffect, useRef} from 'react';
import {C, H, W} from '../theme';
import {F} from '../fonts';
import {V2, bump, clamp, lerp} from '../math';
import {V3} from '../space';
import {useSec} from '../ui';
import {T} from './timeline';
import {
  ECam,
  EIG_V0,
  FAN_DIR,
  HL,
  HOOK_P,
  M_ANCHOR,
  REWIND,
  REWIND_D,
  REV_P,
  STATES,
  W3,
  WAVE_SPEED,
  camAt,
  eigH,
  fanVec,
  singleN,
  singleVec,
  vis,
} from './world';

type Ctx = CanvasRenderingContext2D;

// horizontaler Anteil amber, vertikaler cyan, Fächer helles Lavendel, Einzelvektor weiß
export const COL = {h: C.eig, v: C.cyan, fan: '#C9CEF0', one: C.txt};

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgba = (h: string, a: number) => `rgba(${rgb(h).join(',')},${a})`;
const mixHex = (a: string, b: string, k: number) => {
  const A = rgb(a);
  const B = rgb(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`;
};

const line = (ctx: Ctx, a: V2, b: V2) => {
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
};
const scaleAt = (cam: ECam, q: V3) => 16 / Math.max(3, cam.depth(q));

/* ---------- Glasboden und Ebene ---------- */

const floorFade = (x: number, y: number) => clamp(1.1 - Math.hypot(x / 9, (y - 2) / 8));
const floor = (ctx: Ctx, cam: ECam, a: number) => {
  if (a <= 0) return;
  ctx.strokeStyle = C.vec;
  ctx.lineWidth = 1.2;
  for (let x = -10; x <= 12; x++) {
    for (let y = -4; y < 10; y++) {
      const f = floorFade(x, y + 0.5);
      if (f <= 0) continue;
      ctx.globalAlpha = a * 0.4 * f;
      line(ctx, cam.p([x, y, 0]), cam.p([x, y + 1, 0]));
    }
  }
  for (let y = -4; y <= 10; y++) {
    for (let x = -10; x < 12; x++) {
      const f = floorFade(x + 0.5, y);
      if (f <= 0) continue;
      ctx.globalAlpha = a * 0.4 * f;
      line(ctx, cam.p([x, y, 0]), cam.p([x + 1, y, 0]));
    }
  }
};

// Koordinatengitter in der senkrechten Ebene der Matrix (ruhige Einzelerklärung)
const plane = (ctx: Ctx, cam: ECam, a: number) => {
  if (a <= 0) return;
  ctx.strokeStyle = C.vec;
  ctx.lineWidth = 1.3;
  for (let x = -1; x <= 10; x++) {
    ctx.globalAlpha = a * 0.22 * clamp(1.2 - Math.abs(x - 4) / 7);
    line(ctx, cam.p([x, 0, 0]), cam.p([x, 0, 3]));
  }
  for (let z = 1; z <= 3; z++) {
    ctx.globalAlpha = a * 0.22 * (1 - z / 4.5);
    line(ctx, cam.p([-1, 0, z]), cam.p([10, 0, z]));
  }
};

// x-Achse auf dem Boden: feine Referenzlinie, im Reveal die leuchtende Eigenrichtung
const axis = (ctx: Ctx, cam: ECam, t: number, a: number, glow: number) => {
  if (a <= 0) return;
  const L = 14;
  const p0 = cam.p([-L, 0, 0.005]);
  const p1 = cam.p([L, 0, 0.005]);
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  const col = mixHex(C.vec, COL.h, glow);
  for (const [w, al] of [[34, 0.06], [14, 0.13], [4, 0.6]] as [number, number][]) {
    ctx.lineWidth = w * (0.5 + 0.5 * glow);
    ctx.globalAlpha = a * al * (w > 5 ? glow : 1);
    ctx.strokeStyle = col;
    line(ctx, p0, p1);
  }
  // Lichtpuls läuft die Linie entlang
  if (glow > 0.3) {
    const x = ((t * 3.2) % 16) - 8;
    ctx.lineWidth = 8;
    ctx.globalAlpha = a * glow * 0.5;
    ctx.strokeStyle = 'rgb(255,236,190)';
    line(ctx, cam.p([x - 1.2, 0, 0.01]), cam.p([x, 0, 0.01]));
  }
  ctx.globalCompositeOperation = 'source-over';
};

const pool = (ctx: Ctx, cam: ECam, c: V2, R: number, color: string, a: number) => {
  if (a <= 0) return;
  const o = cam.p([c[0], c[1], 0]);
  const p0 = cam.p([c[0] + 1, c[1], 0]);
  const p1 = cam.p([c[0], c[1] + 1, 0]);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.transform(p0[0] - o[0], p0[1] - o[1], p1[0] - o[0], p1[1] - o[1], o[0], o[1]);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

/* ---------- Licht und Staub ---------- */

const RAYS = Array.from({length: 34}, (_, i) => ({
  x: -6 + ((i * 0.6180339) % 1) * 12,
  y: -1 + ((i * 0.7548776) % 1) * 7,
  ph: (i * 0.5698403) % 1,
}));
const rays = (ctx: Ctx, cam: ECam, t: number, a: number) => {
  if (a <= 0) return;
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgb(205,222,255)';
  ctx.lineCap = 'round';
  const Z = 8;
  for (const r of RAYS) {
    ctx.lineWidth = 7;
    ctx.globalAlpha = a * 0.016;
    line(ctx, cam.p([r.x, r.y, Z]), cam.p([r.x, r.y, 0]));
    const z = Z * (1 - ((t * 0.15 + r.ph) % 1));
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = a * 0.07;
    line(ctx, cam.p([r.x, r.y, Math.min(Z, z + 2)]), cam.p([r.x, r.y, z]));
  }
  ctx.globalCompositeOperation = 'source-over';
};

// Staub vor und hinter der Ebene: nahe Teilchen größer, so wird die Tiefe sichtbar
const DUST: V3[] = Array.from({length: 110}, (_, i) => [-7 + ((i * 0.3819) % 1) * 15, -3.5 + ((i * 0.6823) % 1) * 9, ((i * 0.2451) % 1) * 7.5]);
const dust = (ctx: Ctx, cam: ECam, u: number, t: number, a: number) => {
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgb(200,215,255)';
  DUST.forEach((d, i) => {
    const z = ((d[2] - t * 0.11 + 75) % 7.5) + 0.05;
    const q: V3 = [d[0] + 0.3 * Math.sin(t * 0.3 + i), d[1] + 0.2 * Math.cos(t * 0.21 + i * 1.7), z];
    const s = cam.p(q);
    const k = scaleAt(cam, q);
    const r = Math.min(9, 0.02 * u * k);
    ctx.globalAlpha = a * (0.08 + 0.17 * (0.5 + 0.5 * Math.sin(t * 0.9 + i * 2.1))) * clamp(2.2 - k);
    ctx.beginPath();
    ctx.arc(s[0], s[1], r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalCompositeOperation = 'source-over';
};

/* ---------- Pfeile ---------- */

const arrow = (ctx: Ctx, cam: ECam, u: number, from: V3, to: V3, color: string, alpha: number, pulse: number, wk = 1) => {
  if (alpha <= 0.003) return;
  const o = cam.p(from);
  const e = cam.p(to);
  const dx = e[0] - o[0];
  const dy = e[1] - o[1];
  const L = Math.hypot(dx, dy);
  if (L < 0.5) return;
  const s = Math.min(1.3, scaleAt(cam, to));
  const hw = 0.17 * u * s * wk;
  const head = Math.min(0.46 * u * s * wk, L * 0.45);
  const w = (8 + 3 * pulse) * s * wk;
  const ux = dx / L;
  const uy = dy / L;
  const b: V2 = [e[0] - ux * head * 0.82, e[1] - uy * head * 0.82];
  ctx.lineCap = 'round';
  ctx.globalCompositeOperation = 'lighter';
  for (const [wd, al] of [[w * 3.6, 0.09 + 0.14 * pulse], [w * 1.9, 0.18 + 0.16 * pulse]]) {
    ctx.globalAlpha = alpha * al;
    ctx.strokeStyle = color;
    ctx.lineWidth = wd;
    line(ctx, o, b);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = w;
  if (L > head * 0.5) line(ctx, o, b);
  ctx.beginPath();
  ctx.moveTo(e[0], e[1]);
  ctx.lineTo(e[0] - ux * head - uy * hw, e[1] - uy * head + ux * hw);
  ctx.lineTo(e[0] - ux * head + uy * hw, e[1] - uy * head - ux * hw);
  ctx.closePath();
  ctx.fill();
};

// Spiegelbild im Glasboden
const mirror = (q: V3): V3 => [q[0], q[1], -q[2]];

/* ---------- Transformationswelle ---------- */

// Ring in der Ebene der Matrix, läuft von der Matrix nach außen über den Fächer
const wave = (ctx: Ctx, cam: ECam, t: number, at: number, a: number) => {
  const r = (t - at) * WAVE_SPEED + 0.6;
  if (t < at || r > 9.5 || a <= 0) return;
  const f = clamp(1 - (r - 0.6) / 8.9);
  const pts: V2[] = [];
  for (let k = 0; k <= 96; k++) {
    const w = (k / 96) * Math.PI * 2;
    const z = M_ANCHOR[2] + r * Math.sin(w);
    if (z < -0.02) {
      pts.push([NaN, NaN]);
      continue;
    }
    pts.push(cam.p([M_ANCHOR[0] + r * Math.cos(w), 0, z]));
  }
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (const [wd, al] of [[22, 0.05], [8, 0.16], [2.2, 0.55]] as [number, number][]) {
    ctx.lineWidth = wd;
    ctx.globalAlpha = a * al * f;
    ctx.strokeStyle = 'rgb(255,226,170)';
    ctx.beginPath();
    let pen = false;
    for (const [x, y] of pts) {
      if (Number.isNaN(x)) {
        pen = false;
        continue;
      }
      if (pen) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
      pen = true;
    }
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
};

/* ---------- Beschriftungen im Canvas: Achsenmarken ---------- */

const ticks = (ctx: Ctx, cam: ECam, a: number) => {
  if (a <= 0) return;
  ctx.font = `700 30px ${F.display}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let x = 1; x <= 8; x++) {
    const p = cam.p([x, 0, 0]);
    const q = cam.p([x, 0, -0.12]);
    const big = x === 1 || x === 2 || x === 4 || x === 8;
    ctx.globalAlpha = a * (big ? 0.8 : 0.35);
    ctx.strokeStyle = C.txt2;
    ctx.lineWidth = 2;
    line(ctx, p, q);
    if (big) {
      ctx.fillStyle = C.txt2;
      ctx.fillText(String(x), q[0], q[1] + 8);
    }
  }
};

// Winkelbogen zwischen Vektor und x-Achse
const angleArc = (ctx: Ctx, cam: ECam, v: V2, a: number) => {
  if (a <= 0) return;
  const ang = Math.atan2(v[1], v[0]);
  const R = 0.62;
  const pts: V2[] = [];
  for (let k = 0; k <= 24; k++) {
    const w = (k / 24) * ang;
    pts.push(cam.p([R * Math.cos(w), 0, R * Math.sin(w)]));
  }
  ctx.globalAlpha = a * 0.85;
  ctx.strokeStyle = C.txt;
  ctx.lineWidth = 3;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
};

/* ---------- Szene ---------- */

export const Scene: React.FC = () => {
  const t = useSec();
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    const {cam, u, kS} = camAt(t);
    const st = vis.stage(t);
    const fanA = vis.fan(t) * st;
    const axisGlow = vis.axis(t) > 0.4 ? clamp((vis.axis(t) - 0.35) / 0.65) : 0;

    // Boden mit Licht
    ctx.globalCompositeOperation = 'lighter';
    pool(ctx, cam, [0, 0.6], 7, 'rgba(110,130,255,.17)', st);
    pool(ctx, cam, [0, 0], 2.6, `rgba(255,214,150,${0.1 + 0.12 * axisGlow})`, st);
    ctx.globalCompositeOperation = 'source-over';
    floor(ctx, cam, vis.floor(t) * st);
    rays(ctx, cam, t, st * (1 - kS * 0.6));
    plane(ctx, cam, vis.plane(t) * st);
    axis(ctx, cam, t, vis.axis(t) * st, axisGlow);
    ticks(ctx, cam, vis.plane(t) * st * clamp((t - T.anteilen) / 0.6));

    // Wellen von der Matrix
    for (const p of [...HOOK_P, ...REV_P]) wave(ctx, cam, t, p, st * (p > T.genau ? 0.8 : 1));

    const O: V3 = [0, 0, 0];

    // Fächer: erst die Spiegelbilder im Glas, dann die Pfeile
    const fan = FAN_DIR.map((_, i) => fanVec(i, t));
    fan.forEach((v, i) => {
      const a = i === HL && t < HANDOFF ? Math.max(fanA, vis.hl(t) * st) : fanA;
      arrow(ctx, cam, u, O, mirror(W3(v)), COL.fan, a * 0.13, 0, 0.8);
    });
    // je flacher ein Vektor liegt, desto wärmer leuchtet er
    fan.forEach((v, i) => {
      const flat = clamp(1 - Math.abs(v[1] / Math.hypot(v[0], v[1])) / 0.35);
      const isHL = i === HL && t < HANDOFF;
      const a = isHL ? Math.max(fanA, vis.hl(t) * st) : fanA;
      const col = isHL && t > T.warum ? COL.one : mixHex(COL.fan, COL.h, flat * 0.55);
      const hit = Math.max(...[...HOOK_P, ...REV_P].map((p) => bump(t, p + 0.25, 0.5))) * 0.6;
      arrow(ctx, cam, u, O, W3(v), col, a, hit + (isHL ? bump(t, T.warum + 0.1, 1.2) : 0), 0.8);
    });

    // Eigenvektoren im Reveal: horizontal (Faktor 2) und vertikal (Faktor 1)
    const eh = eigH(t);
    arrow(ctx, cam, u, O, W3(eh, -0.02), COL.h, vis.eigH(t) * st, 0.6 + 0.6 * Math.max(...REV_P.map((p) => bump(t, p + 0.25, 0.6))), 1.15);
    arrow(ctx, cam, u, O, W3([0, EIG_V0], -0.02), COL.v, vis.eigV(t) * st, 0.4, 1.0);

    // Einzelvektor mit Komponenten und Geistern der früheren Zustände
    if (kS > 0.01 || (t > T.warum && t < T.genau + 1)) {
      const sv = singleVec(t);
      const n = singleN(t);
      const ga = vis.ghosts(t) * st;
      STATES.slice(0, 3).forEach((s, k) => {
        const a = clamp(n - k) * ga * 0.32;
        arrow(ctx, cam, u, O, W3(s), COL.one, a, 0, 0.75);
      });
      const cA = vis.compA(t) * st;
      const cC = vis.compC(t) * st;
      const grow = (p: number) => clamp(p * 1.3);
      const pulseA = bump(t, T.rechts, 0.9) + Math.max(...SINGLE_PULSES.map((p) => bump(t, p, 0.9))) + bump(t, T.hAnteil, 1.2);
      const pulseC = bump(t, T.oben, 0.9) + bump(t, T.vertikal, 1.0) + bump(t, T.andere, 1.2);
      if (cA > 0) arrow(ctx, cam, u, O, W3([sv[0] * grow(cA), 0], -0.03), COL.h, clamp(cA * 3), pulseA, 0.85);
      if (cC > 0) arrow(ctx, cam, u, W3([sv[0], 0], -0.03), W3([sv[0], sv[1] * grow(cC)], -0.03), COL.v, clamp(cC * 3), pulseC, 0.85);
      if (t >= HANDOFF && t < T.genau + 0.6) {
        const a = vis.hl(t) * st * (t >= HANDOFF ? 1 : 0);
        angleArc(ctx, cam, sv, a * clamp((t - T.einzigen) / 0.5) * (1 - clamp((t - T.hAnteil) / 0.5)));
        arrow(ctx, cam, u, O, W3(sv), COL.one, a, bump(t, T.einzigen, 1.0), 1.0);
      }
    }
    ctx.globalAlpha = 1;
  }, [t]);

  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};

const SINGLE_PULSES = [T.verdoppelt + 0.5, T.vier + 0.2, T.acht + 0.2];
// ab hier ist der hervorgehobene Fächervektor genau (1, 1) und wird zum Einzelvektor
const HANDOFF = REWIND + REWIND_D;
export {rgba};
