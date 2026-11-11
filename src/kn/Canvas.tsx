import React, {useLayoutEffect, useRef} from 'react';
import {C, H, W} from '../theme';
import {V2, bump, clamp, lerp} from '../math';
import {V3} from '../space';
import {useSec} from '../ui';
import {T} from './timeline';
import {
  BEADS,
  BEADS_SLIDE,
  HOOK,
  OTHER_SLIDE,
  PAIR_SLIDE,
  beadIn,
  DOTS,
  KCam,
  KVECS,
  Ms,
  OTHERS,
  PAIR,
  PAIR_HIT,
  V_SLIDE,
  VV,
  camAt,
  flat,
  sBeads,
  sDots,
  sHook,
  sK,
  sOther,
  sPair,
  sV,
  vis,
  zeroGlow,
} from './world';

type Ctx = CanvasRenderingContext2D;

const HOOK_END = HOOK[0] + HOOK[1];
const OTHER_LAND = OTHER_SLIDE[0] + OTHER_SLIDE[1];
const PAIR_LAND = PAIR_SLIDE[0] + PAIR_SLIDE[1];

// Vektoren vor der Abbildung amber, ihre Bilder cyan, der Kern warmweiß
export const COL = {v: C.eig, img: C.cyan, kern: '#FFE6B8', rail: '#AEB6FF'};

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const rgba = (h: string, a: number) => `rgba(${rgb(h).join(',')},${a})`;
export const mixHex = (a: string, b: string, k: number) => {
  const X = rgb(a);
  const Y = rgb(b);
  return `#${X.map((v, i) => Math.round(lerp(v, Y[i], clamp(k))).toString(16).padStart(2, '0')).join('')}`;
};

const line = (ctx: Ctx, a: V2, b: V2) => {
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
};
const scaleAt = (cam: KCam, q: V3) => 16 / Math.max(3, cam.depth(q));

/* ---------- Glasboden, Licht, Staub ---------- */

const fade = (x: number, y: number) => clamp(1.2 - Math.hypot((x - 1) / 9, (y - 0.5) / 6.2));

// ruhiges Gitter der Ebene (Ausgangsraum)
const floor = (ctx: Ctx, cam: KCam, a: number) => {
  if (a <= 0) return;
  ctx.strokeStyle = C.vec;
  ctx.lineWidth = 1.1;
  for (let x = -9; x <= 11; x++) {
    for (let y = -6; y < 8; y++) {
      const f = fade(x, y + 0.5);
      if (f <= 0) continue;
      ctx.globalAlpha = a * 0.22 * f;
      line(ctx, cam.p([x, y, 0]), cam.p([x, y + 1, 0]));
    }
  }
  for (let y = -6; y <= 8; y++) {
    for (let x = -9; x < 11; x++) {
      const f = fade(x + 0.5, y);
      if (f <= 0) continue;
      ctx.globalAlpha = a * 0.22 * f;
      line(ctx, cam.p([x, y, 0]), cam.p([x + 1, y, 0]));
    }
  }
};

const pool = (ctx: Ctx, cam: KCam, c: V2, R: number, color: string, a: number) => {
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

const DUST: V3[] = Array.from({length: 110}, (_, i) => [-8 + ((i * 0.3819) % 1) * 18, -5 + ((i * 0.6823) % 1) * 12, ((i * 0.2451) % 1) * 7.5]);
const dust = (ctx: Ctx, cam: KCam, u: number, t: number, a: number) => {
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

// leuchtende Linie (mehrere Breiten übereinander)
const glowLine = (ctx: Ctx, a: V2, b: V2, color: string, alpha: number, widths: [number, number][]) => {
  if (alpha <= 0.003) return;
  ctx.lineCap = 'round';
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = color;
  for (const [w, al] of widths) {
    ctx.lineWidth = w;
    ctx.globalAlpha = alpha * al;
    line(ctx, a, b);
  }
  ctx.globalCompositeOperation = 'source-over';
};

const glowDot = (ctx: Ctx, p: V2, R: number, color: string, alpha: number) => {
  if (alpha <= 0.003 || R <= 0) return;
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], R);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(p[0], p[1], R, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
};

/* ---------- Achsen ---------- */

const axes = (ctx: Ctx, cam: KCam, t: number, a: number) => {
  // x-Achse: hier landet alles, deshalb kräftiger und leicht cyan
  const land = clamp(Math.max(sHook(t), sDots(t) * vis.dots(t) * 1.4, sOther(t) * 0.8, sPair(t) * vis.pair(t)));
  const P = (x: number, y: number) => cam.p([x, y, 0.005]);
  glowLine(ctx, P(-7.5, 0), P(9.5, 0), mixHex('#C9CEF0', COL.img, land), a, [
    [16, 0.05 + 0.08 * land],
    [3, 0.45 + 0.25 * land],
  ]);
  // y-Achse dezent
  glowLine(ctx, P(0, -5), P(0, 6.5), '#C9CEF0', a, [[2, 0.28]]);
  // Teilstriche auf der x-Achse
  ctx.strokeStyle = C.txt;
  for (let k = -6; k <= 8; k++) {
    if (k === 0) continue;
    ctx.lineWidth = 2;
    ctx.globalAlpha = a * 0.45 * fade(k, 0);
    line(ctx, P(k, -0.12), P(k, 0.12));
  }
};

/* ---------- Pfeile ---------- */

export const arrow = (ctx: Ctx, cam: KCam, u: number, from: V3, to: V3, color: string, alpha: number, pulse = 0, wk = 1) => {
  if (alpha <= 0.003) return;
  const o = cam.p(from);
  const e = cam.p(to);
  const dx = e[0] - o[0];
  const dy = e[1] - o[1];
  const L = Math.hypot(dx, dy);
  if (L < 1) return;
  const s = Math.min(1.3, scaleAt(cam, to));
  const k = clamp(L / 40); // sehr kurze Pfeile werden schmaler, statt nur aus der Spitze zu bestehen
  const hw = 0.17 * u * s * wk * (0.4 + 0.6 * k);
  const head = Math.min(0.42 * u * s * wk, L * 0.5);
  const w = (8 + 3 * pulse) * s * wk * (0.5 + 0.5 * k);
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

// gestrichelter Umriss eines Vektors (sein Platz vor der Abbildung)
const ghost = (ctx: Ctx, cam: KCam, v: V2, color: string, alpha: number) => {
  if (alpha <= 0.003) return;
  const o = cam.p([0, 0, 0.01]);
  const e = cam.p(flat(v, 0.01));
  const dx = e[0] - o[0];
  const dy = e[1] - o[1];
  const L = Math.hypot(dx, dy);
  const ux = dx / L;
  const uy = dy / L;
  ctx.setLineDash([12, 12]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha * 0.7;
  line(ctx, o, [e[0] - ux * 18, e[1] - uy * 18]);
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(e[0], e[1]);
  ctx.lineTo(e[0] - ux * 30 - uy * 15, e[1] - uy * 30 + ux * 15);
  ctx.lineTo(e[0] - ux * 30 + uy * 15, e[1] - uy * 30 - ux * 15);
  ctx.closePath();
  ctx.lineWidth = 2.5;
  ctx.stroke();
};

/* ---------- Schienen ---------- */

// Schiene y − x = c, gezeichnet zwischen y = −5 und y = 6
const railPts = (c: number): [V2, V2] => [
  [-5 - c, -5],
  [6 - c, 6],
];
const rails = (ctx: Ctx, cam: KCam, a: number) => {
  if (a <= 0.003) return;
  ctx.setLineDash([6, 10]);
  ctx.strokeStyle = COL.rail;
  ctx.lineWidth = 1.6;
  for (let c = -9; c <= 7; c++) {
    if (c === 0) continue;
    const [p, q] = railPts(c);
    // in kurzen Stücken, damit das Ausblenden am Rand wirkt
    for (let k = 0; k < 22; k++) {
      const m0: V2 = [lerp(p[0], q[0], k / 22), lerp(p[1], q[1], k / 22)];
      const m1: V2 = [lerp(p[0], q[0], (k + 1) / 22), lerp(p[1], q[1], (k + 1) / 22)];
      const f = fade((m0[0] + m1[0]) / 2, (m0[1] + m1[1]) / 2);
      if (f <= 0) continue;
      ctx.globalAlpha = a * 0.42 * f;
      line(ctx, cam.p(flat(m0, 0.004)), cam.p(flat(m1, 0.004)));
    }
  }
  ctx.setLineDash([]);
};

// die Schiene durch den Nullpunkt: die Diagonale y = x
const kernRail = (ctx: Ctx, cam: KCam, t: number, a: number) => {
  if (a <= 0.003) return;
  const pulse = bump(t, T.schiene + 0.1, 1.2) + bump(t, T.jeder + 0.2, 1.4) + bump(t, T.kern + 0.1, 1.4);
  const N = 30;
  for (let k = 0; k < N; k++) {
    const x0 = lerp(-6.5, 7, k / N);
    const x1 = lerp(-6.5, 7, (k + 1) / N);
    const f = clamp(fade((x0 + x1) / 2, (x0 + x1) / 2) * 1.3);
    if (f <= 0) continue;
    glowLine(ctx, cam.p([x0, x0, 0.006]), cam.p([x1, x1, 0.006]), COL.kern, a * f, [
      [26, 0.05 + 0.08 * pulse],
      [10, 0.12 + 0.12 * pulse],
      [3, 0.75],
    ]);
  }
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
    const {cam, u} = camAt(t);
    const st = vis.stage(t);
    const P = (p: V2, z = 0.01) => cam.p(flat(p, z));
    const O: V3 = [0, 0, 0.02];

    // Boden
    ctx.globalCompositeOperation = 'lighter';
    pool(ctx, cam, [1, 0.5], 8, 'rgba(110,130,255,.15)', st);
    ctx.globalCompositeOperation = 'source-over';
    floor(ctx, cam, st);
    axes(ctx, cam, t, st);

    // Hook: das ganze Gitter wird abgebildet und fällt auf die x-Achse
    const sh = sHook(t);
    const lg = vis.liveGrid(t) * st;
    if (lg > 0.003) {
      ctx.strokeStyle = '#B9C2F2';
      ctx.lineWidth = 1.8;
      for (let c = -5; c <= 6; c++) {
        // waagerechte Linie y = c und senkrechte Linie x = c, beide abgebildet
        for (const [p, q] of [
          [
            [-8, c],
            [10, c],
          ],
          [
            [c, -5],
            [c, 6],
          ],
        ] as [V2, V2][]) {
          for (let k = 0; k < 18; k++) {
            const m0: V2 = [lerp(p[0], q[0], k / 18), lerp(p[1], q[1], k / 18)];
            const m1: V2 = [lerp(p[0], q[0], (k + 1) / 18), lerp(p[1], q[1], (k + 1) / 18)];
            const f = fade((m0[0] + m1[0]) / 2, (m0[1] + m1[1]) / 2);
            if (f <= 0) continue;
            ctx.globalAlpha = lg * 0.5 * f;
            line(ctx, P(Ms(m0, sh), 0.003), P(Ms(m1, sh), 0.003));
          }
        }
      }
    }

    // Schienen
    rails(ctx, cam, vis.rails(t) * st);
    kernRail(ctx, cam, t, vis.kernRail(t) * st);

    // Punkte des Gitters: fahren auf ihren Schienen und ziehen eine Spur
    const da = vis.dots(t) * st;
    if (da > 0.003) {
      const s = sDots(t);
      for (const p of DOTS) {
        const f = fade(p[0], p[1]);
        if (f <= 0) continue;
        const q = Ms(p, s);
        if (p[1] !== 0 && s > 0.01) {
          glowLine(ctx, P(p, 0.006), P(q, 0.006), COL.rail, da * f, [[6, 0.1], [2, 0.5]]);
        }
        const c = mixHex('#DDE3FF', COL.img, s);
        glowDot(ctx, P(q, 0.01), 22, rgba(c, 0.9), da * f * 0.7);
        ctx.globalAlpha = da * f;
        ctx.fillStyle = c;
        const pp = P(q, 0.01);
        ctx.beginPath();
        ctx.arc(pp[0], pp[1], 5.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // andere Pfeile: rutschen auf ihren Schienen auf die x-Achse und werden cyan
    const so = sOther(t);
    OTHERS.forEach((p, i) => {
      const a = vis.other(t, i) * st;
      if (a <= 0.003) return;
      if (so > 0.02) ghost(ctx, cam, p, COL.v, a * 0.8);
      const q = Ms(p, so);
      if (so > 0.01) glowLine(ctx, P(p, 0.008), P(q, 0.008), COL.rail, a, [[8, 0.12], [2.5, 0.55]]);
      arrow(ctx, cam, u, O, flat(q, 0.02), mixHex(COL.v, COL.img, so), a, bump(t, OTHER_LAND + i * 0.05, 0.8), 0.9);
    });

    // v
    const sv = sV(t);
    ghost(ctx, cam, VV, COL.v, vis.vGhost(t) * st);
    const vq = Ms(VV, sv);
    const va = vis.v(t) * st;
    arrow(ctx, cam, u, O, flat(vq, 0.02), COL.v, va, bump(t, T.aber + 0.3, 1.0) + bump(t, T.vektor, 0.9), 1.05);
    // Spur von v auf der Schiene während der Fahrt in den Nullpunkt
    if (t > V_SLIDE[0] && t < V_SLIDE[0] + V_SLIDE[1] + 0.8) {
      const k = 1 - clamp((t - (V_SLIDE[0] + V_SLIDE[1])) / 0.8);
      glowLine(ctx, P(VV, 0.012), P(vq, 0.012), '#FFFFFF', st * k, [[14, 0.12], [4, 0.6]]);
    }

    // der doppelte, der halbe, der umgedrehte
    KVECS.forEach(({v}, i) => {
      const a = vis.kvec(t, i) * st;
      if (a <= 0.003) return;
      const s = sK(t, i);
      arrow(ctx, cam, u, O, flat(Ms(v, s), 0.02), mixHex(COL.v, '#FFFFFF', s * 0.6), a, bump(t, KVECS[i].at + 0.15, 0.8), 0.95);
    });

    // viele Vektoren der Geraden: leuchtende Spitzen mit feinem Schaft
    const ba = vis.beads(t) * st;
    const sb = sBeads(t);
    BEADS.forEach((k) => {
      const a = ba * beadIn(t, k);
      if (a <= 0.003) return;
      const p: V2 = [k, k];
      const q = Ms(p, sb);
      const f = clamp(fade(k, k) * 1.4);
      glowLine(ctx, P([0, 0], 0.012), P(q, 0.012), COL.v, a * f * 0.5, [[3, 0.6]]);
      glowDot(ctx, P(q, 0.014), 26, 'rgba(255,214,140,.9)', a * f * 0.8);
      ctx.globalAlpha = a * f;
      ctx.fillStyle = COL.v;
      const pp = P(q, 0.014);
      ctx.beginPath();
      ctx.arc(pp[0], pp[1], 6.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // zwei Vektoren auf derselben Schiene: landen beide auf (2, 0)
    const pa = vis.pair(t) * st;
    if (pa > 0.003) {
      const s = sPair(t);
      const railA = clamp((t - (T.zwei + 0.1)) / 0.5);
      glowLine(ctx, P([1, -1], 0.008), P([5.5, 3.5], 0.008), COL.rail, pa * railA, [[14, 0.08], [3, 0.6]]);
      PAIR.forEach((p, i) => {
        if (s > 0.02) ghost(ctx, cam, p, COL.v, pa * 0.85);
        arrow(ctx, cam, u, O, flat(Ms(p, s), 0.02 + i * 0.004), mixHex(COL.v, COL.img, s), pa * (i === 0 ? 1 : 0.92), bump(t, T.zwei + 0.2 + i * 0.3, 0.8), 0.95);
      });
      const hit = clamp((t - (PAIR_LAND - 0.1)) / 0.3);
      glowDot(ctx, P(PAIR_HIT, 0.02), 40 + 30 * bump(t, PAIR_LAND, 1.0), 'rgba(0,200,200,.9)', pa * hit);
      // Rückweg: zwei gestrichelte Pfeile mit Fragezeichen (im Overlay)
      const ask = vis.ask(t) * st;
      if (ask > 0.003) {
        const grow = clamp((t - (T.dort + 0.2)) / 0.7);
        PAIR.forEach((p) => {
          const e: V2 = [lerp(PAIR_HIT[0], p[0], grow), lerp(PAIR_HIT[1], p[1], grow)];
          ctx.setLineDash([10, 10]);
          ctx.lineWidth = 3;
          ctx.strokeStyle = C.txt;
          ctx.globalAlpha = ask * 0.75;
          line(ctx, P(PAIR_HIT, 0.03), P(e, 0.03));
          ctx.setLineDash([]);
        });
      }
    }

    // Nullpunkt
    const zg = zeroGlow(t) * st;
    const o = cam.p(O);
    glowDot(ctx, o, 30 + 60 * Math.min(2, zg), 'rgba(255,255,255,.95)', clamp(zg * 0.8));
    glowDot(ctx, o, 120 + 80 * Math.min(2, zg), 'rgba(255,214,140,.5)', clamp(zg * 0.35));
    ctx.globalAlpha = st;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(o[0], o[1], 7 + 3 * Math.min(1.5, zg), 0, Math.PI * 2);
    ctx.fill();

    // Druckwelle, wenn v im Hook verschwindet
    for (const at of [HOOK_END, V_SLIDE[0] + V_SLIDE[1], BEADS_SLIDE[0] + BEADS_SLIDE[1]]) {
      if (t > at && t < at + 1.1) {
        const x = (t - at) / 1.1;
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgb(255,236,200)';
        ctx.lineWidth = 3;
        ctx.globalAlpha = st * (1 - x) * 0.6;
        const R = 0.3 + x * 2.6;
        ctx.beginPath();
        for (let k = 0; k <= 64; k++) {
          const w = (k / 64) * Math.PI * 2;
          const p = cam.p([R * Math.cos(w), R * Math.sin(w), 0.02]);
          if (k) ctx.lineTo(p[0], p[1]);
          else ctx.moveTo(p[0], p[1]);
        }
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    dust(ctx, cam, u, t, st);
    ctx.globalAlpha = 1;
  }, [t]);

  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};
