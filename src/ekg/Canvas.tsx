// Alle Grafiken des EKG-Videos (v2) auf einem Canvas: Monitor mit Brummen, Lupen, Zacken, Wellen, Filter, gedrehtes Gitter.
import React, {useLayoutEffect, useRef} from 'react';
import {C, H, W} from '../theme';
import {V2, bump, clamp, easeOutCubic, lerp, prog} from '../math';
import {useSec} from '../ui';
import {T} from './timeline';
import {C0, HUM_K, N, NOISY, R_PEAK, SAMPLES, ampNoisy, ecg, harmonic, hum, noisy, partialNoisy} from './signal';
import {
  FAN,
  HX,
  K,
  LENS1,
  LENS2,
  N0,
  P,
  PHI0,
  PO,
  PU,
  REC,
  STRIP,
  X0,
  X1,
  ZOOM,
  ex,
  ey,
  headPhase,
  humBar,
  humCurve,
  kAt,
  pe,
  stage,
  turn,
  vis,
} from './world';

type Ctx = CanvasRenderingContext2D;
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const rgba = (h: string, a: number) => `rgba(${rgb(h).join(',')},${a})`;

const line = (ctx: Ctx, a: V2, b: V2) => {
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
};

// Leuchtende Linie: breiter weicher Schein + Kern
const glowPath = (ctx: Ctx, pts: V2[], color: string, a: number, w = 4, glow = 1) => {
  if (a <= 0 || pts.length < 2) return;
  const path = () => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  };
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (glow > 0) {
    ctx.globalAlpha = a * 0.22 * glow;
    ctx.strokeStyle = color;
    ctx.lineWidth = w * 4.5;
    path();
    ctx.stroke();
  }
  ctx.globalAlpha = a;
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  path();
  ctx.stroke();
  ctx.globalAlpha = 1;
};

const dot = (ctx: Ctx, p: V2, r: number, color: string, a: number) => {
  if (a <= 0) return;
  ctx.globalAlpha = a;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
};

const glowDot = (ctx: Ctx, p: V2, r: number, color: string, a: number) => {
  if (a <= 0) return;
  const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
  g.addColorStop(0, rgba(color, 0.55 * a));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(p[0] - r, p[1] - r, 2 * r, 2 * r);
};

// Pfeil mit Spitze
const arrow = (ctx: Ctx, a: V2, b: V2, color: string, al: number, w = 6, glow = 0) => {
  if (al <= 0) return;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const L = Math.hypot(dx, dy);
  if (L < 2) return;
  const ux = dx / L;
  const uy = dy / L;
  const hl = Math.min(26, L * 0.45);
  const hw = hl * 0.62;
  const base: V2 = [b[0] - ux * hl, b[1] - uy * hl];
  glowPath(ctx, [a, [base[0] + ux * 2, base[1] + uy * 2]], color, al, w, 0.6 + glow);
  ctx.globalAlpha = al;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(b[0], b[1]);
  ctx.lineTo(base[0] - uy * hw, base[1] + ux * hw);
  ctx.lineTo(base[0] + uy * hw, base[1] - ux * hw);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  if (glow > 0) glowDot(ctx, b, 40, color, glow);
};

const dashed = (ctx: Ctx, a: V2, b: V2, color: string, al: number, w = 2.5, dash: number[] = [8, 9]) => {
  if (al <= 0) return;
  ctx.globalAlpha = al;
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.setLineDash(dash);
  line(ctx, a, b);
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
};

// Balken eines diskreten Signals: Stiel + Kopf
const stem = (ctx: Ctx, x: number, y0: number, y1: number, color: string, a: number, w = 12) => {
  if (a <= 0 || Math.abs(y1 - y0) < 0.5) return;
  glowPath(ctx, [[x, y0], [x, y1]], color, a, w, 0.5);
  dot(ctx, [x, y1], w * 0.85, color, a);
};

/* ---------- Hook: Monitor mit Brummen, Zoom auf einen Herzschlag ---------- */

const phaseX = (phi: number, ph: number, z: number) => lerp(HX + (phi - ph) * P, X0 + (phi - PHI0) * (X1 - X0), z);

// Kurve des Monitors bzw. des gewählten Herzschlags; liefert die gezeichneten Punkte
const monitor = (ctx: Ctx, t: number) => {
  const a = vis.monitor(t);
  if (a <= 0) return;
  const ph = headPhase(t);
  const z = prog(t, ZOOM[0], ZOOM[1]);
  const dots = prog(t, T.liste - 0.15, 1.0, (x) => x);
  const stemsA = vis.stems(t);

  // Raster wie EKG-Papier, nur im Hook
  const ga = a * (1 - z) * 0.5;
  if (ga > 0) {
    ctx.strokeStyle = C.vec;
    ctx.lineWidth = 1;
    for (let x = 60; x <= 1020; x += 42) {
      ctx.globalAlpha = ga * 0.08;
      line(ctx, [x, 470], [x, 960]);
    }
    for (let y = 470; y <= 960; y += 42) {
      ctx.globalAlpha = ga * 0.06;
      line(ctx, [60, y], [1020, y]);
    }
    ctx.globalAlpha = 1;
  }

  // Kurve: links vom Kopf, ältere Teile blasser; nach dem Zoom nur der gewählte Herzschlag
  const curveA = a * (1 - 0.7 * dots) * (1 - 0.6 * stemsA);
  const phiStart = ph - (HX - 40) / P;
  const step = 1 / 700;
  let seg: V2[] = [];
  let segFade = 1;
  for (let phi = phiStart; phi <= ph + 1e-9; phi += step) {
    const inWin = phi >= PHI0 - 1e-9 && phi <= PHI0 + 1 + 1e-9;
    const fade = (1 - z) * clamp(1 - (ph - phi) / 2.4) + (inWin ? z : 0);
    const x = phaseX(phi, ph, z);
    if (fade <= 0.02 || x < 30 || x > 1050) {
      if (seg.length > 1) glowPath(ctx, seg, K.sig, curveA * segFade, 3.6, 1);
      seg = [];
      continue;
    }
    seg.push([x, ey(noisy(phi))]);
    segFade = fade;
    if (seg.length > 14) {
      glowPath(ctx, seg, K.sig, curveA * segFade, 3.6, 1);
      seg = [seg[seg.length - 1]];
    }
  }
  if (seg.length > 1) glowPath(ctx, seg, K.sig, curveA * segFade, 3.6, 1);

  // Kopf des Monitors
  const headA = a * (1 - z);
  if (headA > 0) {
    const hp: V2 = [HX, ey(noisy(ph))];
    glowDot(ctx, hp, 70, K.sig, headA);
    dot(ctx, hp, 7, '#E8FFFF', headA);
  }

  // Lupe auf das Zittern: zeigt den Bereich um Bildschirm-x = LENS1.sx, mit dem glatten EKG gestrichelt dahinter
  const la = vis.lens1(t);
  if (la > 0) {
    const L = LENS1;
    const phiC = ph + (L.sx - HX) / P;
    const yC = ey(ecg(phiC));
    const src: V2 = [L.sx, yC];
    ctx.save();
    ctx.globalAlpha = la * 0.8;
    ctx.strokeStyle = C.txt;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(src[0], src[1], 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = la * 0.35;
    line(ctx, [src[0] - 24, src[1] + 24], [L.cx - L.r * 0.7, L.cy - L.r * 0.7]);
    line(ctx, [src[0] + 24, src[1] + 24], [L.cx + L.r * 0.7, L.cy - L.r * 0.7]);
    ctx.globalAlpha = la;
    ctx.fillStyle = 'rgba(10,10,32,.92)';
    ctx.beginPath();
    ctx.arc(L.cx, L.cy, L.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.clip();
    const zoomX = (2 * L.r) / (2 * L.span);
    const clean: V2[] = [];
    const raw: V2[] = [];
    for (let i = 0; i <= 220; i++) {
      const sx = L.sx - L.span + (2 * L.span * i) / 220;
      const phi = ph + (sx - HX) / P;
      const X = L.cx + (sx - L.sx) * zoomX;
      clean.push([X, L.cy + (ey(ecg(phi)) - yC) * L.zy]);
      raw.push([X, L.cy + (ey(noisy(phi)) - yC) * L.zy]);
    }
    ctx.setLineDash([8, 8]);
    glowPath(ctx, clean, C.txt, la * 0.4, 2, 0);
    ctx.setLineDash([]);
    glowPath(ctx, raw, K.sig, la, 3.4, 0.8);
    // das Brummen rot hervorheben, sobald es benannt wird
    const red = la * prog(t, T.steckdose, 0.5);
    if (red > 0) {
      ctx.globalAlpha = red * 0.35;
      ctx.fillStyle = K.err;
      ctx.beginPath();
      clean.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      for (let i = raw.length - 1; i >= 0; i--) ctx.lineTo(raw[i][0], raw[i][1]);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = la * 0.9;
    ctx.strokeStyle = 'rgba(243,244,251,.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(L.cx, L.cy, L.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Messpunkte: 1000 Werte, von links nach rechts
  if (dots > 0) {
    const da = a * (1 - 0.5 * stemsA);
    ctx.fillStyle = '#C8FFFF';
    for (let n = 0; n < N; n++) {
      const appear = clamp((dots - n / N) * 12);
      if (appear <= 0) break;
      ctx.globalAlpha = da * appear * 0.95;
      ctx.beginPath();
      ctx.arc(ex(n / N), ey(NOISY[n]), 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Strom aus Messpunkten in die Spalte
  const fl = prog(t, T.vektor - 0.15, 1.1, (x) => x);
  if (fl > 0 && fl < 1) {
    for (let j = 0; j < 140; j++) {
      const n = Math.floor((j / 140) * N);
      const delay = ((j % 35) / 35) * 0.45;
      const u = easeOutCubic(clamp((fl - delay) / 0.55));
      if (u <= 0 || u >= 1) continue;
      const from: V2 = [ex(n / N), ey(NOISY[n])];
      const to: V2 = [COLUMN.x, COLUMN.y0 + (COLUMN.y1 - COLUMN.y0) * (n / N)];
      const p: V2 = [lerp(from[0], to[0], u), lerp(from[1], to[1], u) - 60 * Math.sin(Math.PI * u)];
      dot(ctx, p, 2.6, '#C8FFFF', a * (1 - u) * 0.9);
    }
  }

  // Zacken: jeder Messwert als schmale Zacke von der Nulllinie
  if (stemsA > 0) {
    const sw = prog(t, T.jeder + 0.15, 1.1, (x) => x);
    const redA = prog(t, T.brummen + 0.1, 0.5);
    ctx.lineWidth = 1.2;
    for (let n = 0; n < N; n++) {
      if (n / N > sw) break;
      const x = ex(n / N);
      const yClean = ey(SAMPLES[n]);
      const yRaw = ey(NOISY[n]);
      ctx.globalAlpha = stemsA * 0.55;
      ctx.strokeStyle = K.imp;
      line(ctx, [x, ey(0)], [x, lerp(yRaw, yClean, redA)]);
      if (redA > 0) {
        ctx.globalAlpha = stemsA * redA * 0.9;
        ctx.strokeStyle = K.err;
        line(ctx, [x, yClean], [x, yRaw]);
      }
    }
    ctx.globalAlpha = 1;
    // Markierung des Lupenbereichs
    const l2 = vis.lens2(t);
    if (l2 > 0) {
      const xa = ex((N0 - 6) / N);
      const xb = ex((N0 + 6) / N);
      ctx.globalAlpha = l2 * 0.85;
      ctx.strokeStyle = C.txt;
      ctx.lineWidth = 2;
      ctx.strokeRect(xa, ey(0.36) - 6, xb - xa, ey(-0.02) - ey(0.36) + 12);
      ctx.globalAlpha = l2 * 0.3;
      line(ctx, [xa, ey(-0.02) + 6], [LENS2.cx - LENS2.r * 0.75, LENS2.cy - LENS2.r * 0.66]);
      line(ctx, [xb, ey(-0.02) + 6], [LENS2.cx + LENS2.r * 0.75, LENS2.cy - LENS2.r * 0.66]);
      ctx.globalAlpha = 1;
    }
  }
};

// Spaltenvektor (Text im Overlay)
export const COLUMN = {x: 560, y0: 975, y1: 1335};
export const MARKED = [0, 200, R_PEAK, 650, 999];

/* ---------- Lupe auf die Zacken ---------- */

export const lensStemX = (i: number) => LENS2.cx + (i - (LENS2.n - 1) / 2) * LENS2.dx;

const zackenLens = (ctx: Ctx, t: number) => {
  const a = vis.lens2(t);
  if (a <= 0) return;
  const L = LENS2;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(10,10,32,.92)';
  ctx.beginPath();
  ctx.arc(L.cx, L.cy, L.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.clip();
  // Nulllinie
  ctx.globalAlpha = a * 0.4;
  ctx.strokeStyle = C.txt2;
  ctx.lineWidth = 2;
  line(ctx, [L.cx - L.r, L.base], [L.cx + L.r, L.base]);
  const redA = prog(t, T.brummen + 0.1, 0.5);
  const fix = prog(t, T.loeschen + 0.15, 0.5);
  const mid = (L.n - 1) / 2;
  for (let i = 0; i < L.n; i++) {
    const n = N0 - mid + i;
    const x = lensStemX(i);
    const yc = L.base - SAMPLES[n] * L.gain;
    const yr = L.base - NOISY[n] * L.gain;
    const isMid = i === mid;
    const hl = isMid ? prog(t, T.zacken, 0.4) : 0;
    const grow = clamp((prog(t, T.stelle - 0.05, 0.9) - i * 0.04) * 2);
    const yTop = lerp(L.base, lerp(yr, yc, redA), grow);
    glowPath(ctx, [[x, L.base], [x, yTop]], K.imp, a * (0.75 + 0.25 * hl), isMid ? 7 : 5, 0.4 + hl);
    dot(ctx, [x, yTop], isMid ? 8 : 6, K.imp, a);
    // rote Spitze = Anteil des Brummens
    const tip = redA * (isMid ? 1 - fix : 1);
    if (tip > 0.01) {
      glowPath(ctx, [[x, yc], [x, lerp(yc, yr, grow)]], K.err, a * tip, isMid ? 7 : 5, 0.6);
      dot(ctx, [x, lerp(yc, yr, grow)], 6, K.err, a * tip);
    }
    if (isMid && fix > 0) glowDot(ctx, [x, yc], 50, K.sig, a * bump(t, T.loeschen + 0.5, 0.8));
  }
  ctx.restore();
  ctx.globalAlpha = a * 0.9;
  ctx.strokeStyle = 'rgba(243,244,251,.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(L.cx, L.cy, L.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
};

/* ---------- Wellen: Fächer, Rekonstruktion, Filter ---------- */

const waves = (ctx: Ctx, t: number) => {
  const a = vis.rec(t);
  if (a <= 0) return;
  const {by, g} = stage(t);
  const Y = (v: number) => by - g * v;

  // Fächer: dieselbe Kurve als Stapel einfacher Wellen
  const fanO = prog(t, FAN.open, 0.8);
  const fanC = prog(t, FAN.close, 0.7);
  const fan = fanO * (1 - fanC);
  if (fan > 0) {
    const rows = [0, 1, 2, 3, 5, 8, 13];
    rows.forEach((k, j) => {
      const yRow = 470 + j * 130;
      const yk = lerp(lerp(by, yRow, fanO), by, fanC);
      const gain = lerp(g, 1100, fanO);
      const pts: V2[] = [];
      for (let i = 0; i <= 260; i++) {
        const x = i / 260;
        pts.push([ex(x), yk - gain * harmonic(k, x)]);
      }
      const hl = j === 1 ? bump(t, T.langsam, 0.7) : j === 3 ? bump(t, T.schneller, 0.7) : j === 6 ? bump(t, T.immer, 0.7) : 0;
      glowPath(ctx, pts, j % 2 ? K.wave2 : K.wave, fan * (0.85 + 0.15 * hl), 3 + 2 * hl, 0.8 + hl);
    });
  }

  // Ziel: das zitternde EKG (gestrichelt, blass), solange gebaut wird
  const started = t >= REC.start;
  const Kc = kAt(t);
  const hb = humCurve(t);
  const tgtA = a * (1 - fan) * (1 - prog(t, T.zusammen + 1.0, 0.6)) * (started ? 1 : 0);
  const target: V2[] = [];
  const approx: V2[] = [];
  const M = 700;
  for (let i = 0; i <= M; i++) {
    const x = i / M;
    target.push([ex(x), Y(noisy(x))]);
    approx.push([ex(x), Y(started ? partialNoisy(x, Kc, hb) : 0)]);
  }
  if (tgtA > 0) {
    ctx.setLineDash([7, 8]);
    glowPath(ctx, target, C.txt, tgtA * 0.32, 2, 0);
    ctx.setLineDash([]);
    ctx.globalAlpha = tgtA * 0.26;
    ctx.fillStyle = K.err;
    ctx.beginPath();
    target.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    for (let i = approx.length - 1; i >= 0; i--) ctx.lineTo(approx[i][0], approx[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (started) {
    const clean = prog(t, T.sauber - 0.1, 0.5);
    const col = clean > 0.5 ? K.sig : K.wave;
    glowPath(ctx, approx, col, a * prog(t, REC.start - 0.2, 0.4), 3.8, 1 + bump(t, T.sauber + 0.1, 1.0) * 1.5);
  }

  // die zuletzt hinzugekommene Welle
  const kNew = Math.ceil(Kc);
  const na = a * (started ? 1 : 0) * (1 - prog(t, REC.end - 0.2, 0.4));
  if (na > 0 && kNew >= 1) {
    const pts: V2[] = [];
    for (let i = 0; i <= 500; i++) {
      const x = i / 500;
      pts.push([ex(x), 985 - 900 * (kNew === HUM_K ? harmonic(kNew, x) + hum(x) : harmonic(kNew, x))]);
    }
    glowPath(ctx, pts, kNew === HUM_K ? K.err : K.wave2, na * 0.75, 2.2, 0.5);
  }

  // das Brummen allein: eine einzige Welle
  const ha = a * prog(t, T.fuenfzig - 0.1, 0.4) * (1 - prog(t, T.null + 0.2, 0.5));
  if (ha > 0) {
    const pts: V2[] = [];
    for (let i = 0; i <= 900; i++) {
      const x = i / 900;
      pts.push([ex(x), 985 - 900 * hum(x)]);
    }
    glowPath(ctx, pts, K.err, ha, 2.6, 0.8);
  }

  // Gewichte je Welle als Balkenleiste
  const sa = vis.strip(t);
  if (sa > 0) {
    const n = STRIP.kMax + 1;
    const bw = (X1 - X0) / n;
    ctx.globalAlpha = sa * 0.35;
    ctx.strokeStyle = C.txt2;
    ctx.lineWidth = 1.5;
    line(ctx, [X0, STRIP.y], [X1, STRIP.y]);
    for (let k = 0; k < n; k++) {
      const isHum = k === HUM_K;
      const h = ampNoisy(k) * STRIP.gain * (isHum ? humBar(t) : 1);
      const on = k <= Kc + 0.5;
      const col = isHum ? K.err : k % 2 ? K.wave2 : K.wave;
      ctx.globalAlpha = sa * (on ? 1 : 0.18);
      ctx.fillStyle = col;
      const hh = Math.max(2, h);
      ctx.fillRect(X0 + k * bw + bw * 0.16, STRIP.y - hh, bw * 0.68, hh);
      if (isHum && on) glowDot(ctx, [X0 + (k + 0.5) * bw, STRIP.y - hh], 60, K.err, sa * (bump(t, T.einzige, 1.0) + bump(t, T.fuenfzig + 0.3, 1.0)));
    }
    ctx.globalAlpha = 1;
  }
};

/* ---------- Auflösung: Pfeil im gedrehten Gitter ---------- */

const plane = (ctx: Ctx, t: number) => {
  const a = vis.plane(t);
  if (a <= 0) return;
  const k = turn(t);
  // Das Gitter dreht sich um −45° und wächst um √2: e₁ → (1, −1), e₂ → (1, 1). Der Pfeil (3, 1) = 1·(1, −1) + 2·(1, 1).
  const ang = (-k * Math.PI) / 4;
  const sc = lerp(1, Math.SQRT2, k);
  const uu: V2 = [sc * Math.cos(ang), sc * Math.sin(ang)];
  const vv: V2 = [-sc * Math.sin(ang), sc * Math.cos(ang)];
  const xMin = 200;
  const xMax = 880;
  const yMin = 1040;
  const yMax = 1430;
  const inBox = (p: V2) => p[0] > xMin - 40 && p[0] < xMax + 40 && p[1] > yMin - 40 && p[1] < yMax + 40;
  const fadeAt = (p: V2) => clamp((p[1] - yMin) / 60) * clamp((yMax - p[1]) / 40) * clamp((p[0] - xMin) / 60) * clamp((xMax - p[0]) / 60);
  const col = (c: number) => (c < 0.5 ? K.imp : K.wave);
  const drawFamily = (dir: V2, off: V2, color: string) => {
    for (let i = -8; i <= 8; i++) {
      const base: V2 = [off[0] * i, off[1] * i];
      for (let s = -10; s < 10; s++) {
        const p = pe([base[0] + dir[0] * s * 0.5, base[1] + dir[1] * s * 0.5]);
        const q = pe([base[0] + dir[0] * (s + 1) * 0.5, base[1] + dir[1] * (s + 1) * 0.5]);
        if (!inBox(p) && !inBox(q)) continue;
        const f = fadeAt([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]);
        if (f <= 0) continue;
        ctx.globalAlpha = a * f * (i === 0 ? 0.5 : 0.2);
        ctx.strokeStyle = color;
        line(ctx, p, q);
      }
    }
  };
  ctx.lineWidth = 1.4;
  drawFamily(uu, vv, col(k));
  drawFamily(vv, uu, col(k));
  ctx.globalAlpha = 1;
  // Basisvektoren
  arrow(ctx, PO, pe(uu), col(k), a * 0.9, 5);
  arrow(ctx, PO, pe(vv), col(k), a * 0.9, 5);
  // der Pfeil bleibt
  const sk = prog(t, T.pfeil + 0.1, 0.5);
  if (sk > 0) arrow(ctx, PO, pe([3 * sk, 1 * sk]), K.sig, a, 7, bump(t, T.bleibt + 0.6, 1.2) * 0.8);
  // Weg über die Koordinaten
  const path = prog(t, T.zahlen, 0.6);
  if (path > 0) {
    dashedPath(ctx, PO, pe([path, -path]), K.wave, a * 0.9);
    const p2 = prog(t, T.zahlen + 0.5, 0.6);
    if (p2 > 0) dashedPath(ctx, pe([1, -1]), pe([1 + 2 * p2, -1 + 2 * p2]), K.wave, a * 0.9);
  } else {
    const p0 = prog(t, T.pfeil + 0.7, 0.6) * (1 - prog(t, T.bleibt, 0.3));
    if (p0 > 0) {
      dashedPath(ctx, PO, pe([3 * p0, 0]), K.imp, a * p0);
      dashedPath(ctx, pe([3, 0]), pe([3, p0]), K.imp, a * p0);
    }
  }
  dot(ctx, PO, 5, C.txt, a);
};

const dashedPath = (ctx: Ctx, p: V2, q: V2, color: string, a: number) => dashed(ctx, p, q, color, a, 3, [7, 7]);

/* ---------- Staub ---------- */

const dust = (ctx: Ctx, t: number) => {
  for (let i = 0; i < 46; i++) {
    const sx = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const sy = (Math.sin(i * 78.233) * 12345.678) % 1;
    const x = (Math.abs(sx) * W + t * (6 + (i % 5) * 3)) % W;
    const y = (Math.abs(sy) * H - t * (4 + (i % 7) * 2) + H) % H;
    const a = 0.1 + 0.12 * Math.sin(t * 0.9 + i);
    dot(ctx, [x, y], 1.3 + (i % 3) * 0.5, C.vec, a);
  }
};

export const Scene: React.FC = () => {
  const t = useSec();
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current!.getContext('2d')!;
    ctx.clearRect(0, 0, W, H);
    dust(ctx, t);
    monitor(ctx, t);
    zackenLens(ctx, t);
    waves(ctx, t);
    plane(ctx, t);
  }, [t]);
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};

export {C0, PU};
