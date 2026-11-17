// Canvas-Bühne für das i-Video: Zahlengerade, Ebene, Marker, Pfeil und Drehbögen.
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {C, H, W} from '../theme';
import {V2, clamp, lerp} from '../math';
import {useSec} from '../ui';
import {F} from '../fonts';
import {T} from './timeline';
import {Cam, IMPACT, JUMP_H, camAt, jumpK, pulse, ripple, thetaAt, toS, vAxis, vis} from './world';

type Ctx = CanvasRenderingContext2D;

export const COL = {real: C.cyan, im: C.eig, bad: C.lam, arc: C.txt};

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const rgba = (h: string, a: number) => `rgba(${rgb(h).join(',')},${a})`;

const seg = (ctx: Ctx, a: V2, b: V2) => {
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
};

const dot = (ctx: Ctx, s: V2, color: string, r: number, a: number, glow = 0) => {
  if (a <= 0) return;
  ctx.globalAlpha = a;
  const R = r * (4 + 3 * glow);
  const g = ctx.createRadialGradient(s[0], s[1], 0, s[0], s[1], R);
  g.addColorStop(0, rgba(color, 0.55));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(s[0], s[1], R, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(s[0], s[1], r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.txt;
  ctx.beginPath();
  ctx.arc(s[0], s[1], r * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
};

const ring = (ctx: Ctx, s: V2, color: string, r: number, a: number, width = 4) => {
  if (a <= 0) return;
  ctx.globalAlpha = a;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(s[0], s[1], r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
};

/* ---------- Gitter der Ebene ---------- */

const grid = (ctx: Ctx, cam: Cam, a: number) => {
  if (a <= 0) return;
  const xs = Math.floor(-cam.ox / cam.u) - 1;
  const xe = Math.ceil((W - cam.ox) / cam.u) + 1;
  const ys = Math.floor(-(H - cam.oy) / cam.u) - 1;
  const ye = Math.ceil(cam.oy / cam.u) + 1;
  ctx.strokeStyle = C.vec;
  for (let k = 2 * xs; k <= 2 * xe; k++) {
    if (k === 0) continue;
    ctx.globalAlpha = a * (k % 2 ? 0.06 : 0.16);
    ctx.lineWidth = k % 2 ? 1 : 1.4;
    const sx = toS(cam, [k / 2, 0])[0];
    seg(ctx, [sx, 0], [sx, H]);
  }
  for (let k = 2 * ys; k <= 2 * ye; k++) {
    if (k === 0) continue;
    ctx.globalAlpha = a * (k % 2 ? 0.06 : 0.16);
    ctx.lineWidth = k % 2 ? 1 : 1.4;
    const sy = toS(cam, [0, k / 2])[1];
    seg(ctx, [0, sy], [W, sy]);
  }
  ctx.globalAlpha = 1;
};

/* ---------- Zahlengerade ---------- */

const numberLine = (ctx: Ctx, cam: Cam, t: number, a: number) => {
  const x0 = -cam.ox / cam.u - 0.2;
  const x1 = (W - cam.ox) / cam.u + 0.2;
  const N = 260;
  const glow = vis.realGlow(t);
  ctx.globalAlpha = a;
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const x = lerp(x0, x1, i / N);
    const s = toS(cam, [x, ripple(t, x)]);
    if (i === 0) ctx.moveTo(s[0], s[1]);
    else ctx.lineTo(s[0], s[1]);
  }
  ctx.strokeStyle = rgba(COL.real, 0.18 + 0.2 * glow);
  ctx.lineWidth = 18 + 10 * glow;
  ctx.stroke();
  ctx.strokeStyle = COL.real;
  ctx.lineWidth = 4;
  ctx.shadowColor = COL.real;
  ctx.shadowBlur = 16 + 20 * glow;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // negative Hälfte: hier landet nie ein Quadrat
  const neg = vis.neg(t);
  if (neg > 0) {
    const o = toS(cam, [0, 0]);
    ctx.globalAlpha = a * neg;
    ctx.strokeStyle = rgba(COL.bad, 0.85);
    ctx.lineWidth = 7;
    ctx.shadowColor = COL.bad;
    ctx.shadowBlur = 22 + 10 * pulse(t, T.kein, 1.1);
    seg(ctx, [0, o[1]], [o[0] - 6, o[1]]);
    ctx.shadowBlur = 0;
  }

  // Striche und Zahlen
  ctx.globalAlpha = a;
  ctx.fillStyle = C.txt2;
  ctx.font = `600 34px "${F.display}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const step = cam.u < 120 ? 2 : 1;
  for (let k = Math.ceil(x0); k <= x1; k++) {
    if (k % step) continue;
    const s = toS(cam, [k, ripple(t, k)]);
    ctx.strokeStyle = rgba(C.txt, 0.7);
    ctx.lineWidth = 3;
    seg(ctx, [s[0], s[1] - 14], [s[0], s[1] + 14]);
    const label = k < 0 ? `−${-k}` : `${k}`;
    ctx.fillText(label, s[0], s[1] + 26);
  }
  ctx.globalAlpha = 1;
};

/* ---------- senkrechte Achse ---------- */

const imagAxis = (ctx: Ctx, cam: Cam, t: number) => {
  const g = vAxis(t);
  if (g <= 0) return;
  ctx.globalAlpha = Math.min(1, vis.line(t));
  const o = toS(cam, [0, 0]);
  const up = o[1] * g;
  const down = (H - o[1]) * g;
  ctx.strokeStyle = rgba(COL.im, 0.18);
  ctx.lineWidth = 16;
  seg(ctx, [o[0], o[1] - up], [o[0], o[1] + down]);
  ctx.strokeStyle = COL.im;
  ctx.lineWidth = 4;
  ctx.shadowColor = COL.im;
  ctx.shadowBlur = 16;
  seg(ctx, [o[0], o[1] - up], [o[0], o[1] + down]);
  ctx.shadowBlur = 0;
  // Striche bei ±1, ±2 …
  for (let k = -4; k <= 4; k++) {
    if (k === 0) continue;
    const s = toS(cam, [0, k]);
    if (Math.abs(s[1] - o[1]) > Math.max(up, down) + 1) continue;
    ctx.strokeStyle = rgba(C.txt, 0.7);
    ctx.lineWidth = 3;
    seg(ctx, [s[0] - 14, s[1]], [s[0] + 14, s[1]]);
  }
  // rechter Winkel
  const ra = vis.rightAngle(t);
  if (ra > 0) {
    const d = 34;
    ctx.globalAlpha = ra;
    ctx.strokeStyle = C.txt;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(o[0] + d, o[1]);
    ctx.lineTo(o[0] + d, o[1] - d);
    ctx.lineTo(o[0], o[1] - d);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
};

/* ---------- Funken beim Aufprall ---------- */

const SPARKS = Array.from({length: 30}, (_, i) => {
  const r1 = Math.sin(i * 12.9898) * 43758.5453;
  const r2 = Math.sin(i * 78.233) * 12345.678;
  const f1 = r1 - Math.floor(r1);
  const f2 = r2 - Math.floor(r2);
  const ang = Math.PI * (0.08 + 0.84 * f1);
  const sp = 2.2 + 3.4 * f2;
  return {vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, c: i % 3 ? COL.bad : COL.im};
});

const sparks = (ctx: Ctx, cam: Cam, t: number) => {
  const dt = t - IMPACT;
  if (dt < 0 || dt > 1.1) return;
  for (const s of SPARKS) {
    const x = s.vx * dt;
    const y = s.vy * dt - 4.5 * dt * dt;
    const p = toS(cam, [x, Math.max(0, y)]);
    dot(ctx, p, s.c, 4.5, (1 - dt / 1.1) * 0.9);
  }
};

/* ---------- Bögen ---------- */

// Bogen um den Ursprung mit Radius r (Einheiten) von Winkel a nach b (Grad, mathematisch positiv)
const arc = (ctx: Ctx, cam: Cam, r: number, a: number, b: number) => {
  if (b <= a + 0.1) return;
  const o = toS(cam, [0, 0]);
  ctx.beginPath();
  ctx.arc(o[0], o[1], r * cam.u, (-a * Math.PI) / 180, (-b * Math.PI) / 180, true);
  ctx.stroke();
};

/* ---------- Pfeil ---------- */

const arrow = (ctx: Ctx, cam: Cam, th: number, a: number, glow: number) => {
  if (a <= 0) return;
  const o = toS(cam, [0, 0]);
  const r = (th * Math.PI) / 180;
  const tip = toS(cam, [Math.cos(r), Math.sin(r)]);
  const dx = tip[0] - o[0];
  const dy = tip[1] - o[1];
  const n = Math.hypot(dx, dy);
  const ux = dx / n;
  const uy = dy / n;
  const head = 34;
  const base: V2 = [tip[0] - ux * head, tip[1] - uy * head];
  ctx.globalAlpha = a;
  ctx.strokeStyle = rgba(C.txt, 0.2);
  ctx.lineWidth = 20;
  seg(ctx, o, base);
  ctx.strokeStyle = C.txt;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.shadowColor = COL.im;
  ctx.shadowBlur = 18 + 30 * glow;
  seg(ctx, o, base);
  ctx.fillStyle = C.txt;
  ctx.beginPath();
  ctx.moveTo(tip[0], tip[1]);
  ctx.lineTo(base[0] - uy * 19, base[1] + ux * 19);
  ctx.lineTo(base[0] + uy * 19, base[1] - ux * 19);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
};

/* ---------- Zeichnen ---------- */

const draw = (ctx: Ctx, t: number) => {
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  const cam = camAt(t);
  const o = toS(cam, [0, 0]);

  grid(ctx, cam, vis.grid(t));

  // Kreis, den die Dauerdrehung am Ende nachzeichnet
  const ca = vis.circle(t);
  if (ca > 0) {
    ctx.globalAlpha = ca * 0.55;
    ctx.strokeStyle = COL.im;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 12]);
    ctx.beginPath();
    ctx.arc(o[0], o[1], cam.u, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  imagAxis(ctx, cam, t);
  numberLine(ctx, cam, t, vis.line(t));

  // Vorgriff im Hook: gestrichelter Viertelbogen von i nach −1
  const a0 = vis.arc0(t);
  if (a0 > 0) {
    const k = clamp((t - T.bogen) / 0.6);
    ctx.globalAlpha = a0 * (0.75 + 0.25 * Math.sin(t * 22));
    ctx.strokeStyle = C.txt;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    arc(ctx, cam, 1, 90, 90 + 90 * k);
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  // Ziel −1: kein Quadrat landet hier
  const ta = vis.target(t);
  if (ta > 0) {
    const s = toS(cam, [-1, 0]);
    const hit = clamp((t - T.iMinus - 0.95) / 0.3);
    const c = hit > 0 ? COL.im : COL.bad;
    ring(ctx, s, c, 26 + 8 * pulse(t, T.kein, 1) + 10 * pulse(t, T.minus1, 1), ta * (0.85 + 0.15 * Math.sin(t * 6)));
  }

  // alle Quadrate landen rechts der 0
  const pos = vis.pos(t);
  if (pos > 0) {
    ctx.globalAlpha = pos * 0.9;
    ctx.strokeStyle = rgba(COL.im, 0.85);
    ctx.lineWidth = 8;
    ctx.shadowColor = COL.im;
    ctx.shadowBlur = 22 + 12 * pulse(t, T.kein, 1.1);
    seg(ctx, [o[0] + 6, o[1]], [W, o[1]]);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // 1² = 1: das Quadrat landet auf der 1 selbst
  const o1 = vis.one(t);
  const s1 = toS(cam, [1, 0]);
  if (o1 > 0) {
    dot(ctx, s1, COL.real, 11, o1);
    ring(ctx, s1, COL.im, 26 + 8 * pulse(t, T.eins + 0.35, 0.8) + 8 * pulse(t, T.minus + 1.3, 0.8), o1 * clamp((t - T.eins - 0.3) / 0.3));
  }

  // (−1)² = 1: ein Bogen von −1 über die 0 auf +1
  const om = vis.minusPt(t);
  if (om > 0) {
    dot(ctx, toS(cam, [-1, 0]), COL.real, 11, om);
    const k = jumpK(t);
    if (k > 0) {
      const N = 80;
      const P = (u: number): V2 => toS(cam, [-Math.cos(Math.PI * u), JUMP_H * Math.sin(Math.PI * u)]);
      ctx.globalAlpha = om;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const q = P((k * i) / N);
        if (i === 0) ctx.moveTo(q[0], q[1]);
        else ctx.lineTo(q[0], q[1]);
      }
      ctx.strokeStyle = COL.im;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.shadowColor = COL.im;
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      if (k < 1) dot(ctx, P(k), COL.im, 12, om, 0.5);
    }
  }

  sparks(ctx, cam, t);

  // Drehbögen 0→90 und 90→180
  const aa = vis.arcs(t);
  if (aa > 0) {
    const th = thetaAt(t);
    const merge = clamp((t - T.halbe) / 0.6);
    const hl = pulse(t, T.zwei, 1.4);
    ctx.lineCap = 'round';
    ctx.globalAlpha = aa;
    ctx.strokeStyle = rgba(C.txt, 0.85);
    ctx.lineWidth = 5 + 3 * hl;
    ctx.shadowColor = C.txt;
    ctx.shadowBlur = 10 + 20 * hl;
    arc(ctx, cam, 0.42, 0, Math.min(th, 90) - (merge > 0 ? 0 : 1.5));
    arc(ctx, cam, 0.42, 90 + (merge > 0 ? 0 : 1.5), Math.min(th, 180));
    // halbe Drehung als ein Bogen außen
    if (merge > 0) {
      ctx.globalAlpha = aa * merge;
      ctx.strokeStyle = COL.im;
      ctx.shadowColor = COL.im;
      ctx.lineWidth = 6;
      arc(ctx, cam, 0.62, 0, 180 * merge);
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // Punkte 1 und i
  dot(ctx, toS(cam, [1, 0]), COL.real, 12, vis.dotOne(t));
  dot(ctx, toS(cam, [0, 1]), COL.im, 13, vis.dotI(t), pulse(t, T.iSnap, 0.8) + pulse(t, T.einsI + 1.0, 0.8));

  // Pfeil
  const th = thetaAt(t);
  const glow = pulse(t, T.einsI + 0.95, 0.7) + pulse(t, T.iMinus + 1.0, 0.8);
  arrow(ctx, cam, th, vis.arrow(t), glow);

  ctx.restore();
};

export const Stage: React.FC = () => {
  const t = useSec();
  const ref = useRef<HTMLCanvasElement>(null);
  // die Zahlen auf der Geraden zeichnet die Canvas: Schrift vorher laden
  const [handle] = useState(() => delayRender('Schrift der Bühne'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    document.fonts.load(`600 34px "${F.display}"`).then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (ctx && ready) draw(ctx, t);
  }, [t, ready]);
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};

