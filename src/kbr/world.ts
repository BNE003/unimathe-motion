// Geometrie, Kamera und Bühnenzustand für „Kern, Bild und Rang“. Canvas und Overlays lesen beide nur von hier.
import {V2, clamp, easeInOutCubic, lerp, prog} from '../math';
import {V3, add3, dot3, makeCam, sc3} from '../space';
import {T} from './timeline';

/* ---------- Mathematik ---------- */

export const A: [V3, V3, V3] = [[1, 1, 0], [0, 1, 1], [1, 2, 1]];
export const COLS: V3[] = [0, 1, 2].map((j) => [A[0][j], A[1][j], A[2][j]] as V3); // a₁ = (1,0,1), a₂ = (1,1,2), a₃ = (0,1,1)
export const KER: V3 = [1, -1, 1];
export const N_IMG: V3 = [-1, -1, 1]; // Normale der Bildebene z = x + y (a₁ × a₃)
export const ROWS: V3[] = A; // Normalen der Gleichungsebenen I, II, III

export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const unit = (a: V3): V3 => sc3(a, 1 / Math.hypot(...a));
export const apA = (v: V3): V3 => [dot3(A[0], v), dot3(A[1], v), dot3(A[2], v)];
// M(s) = (1 − s)·I + s·A: alle Eigenwerte von A sind ≥ 0, der Raum klappt also nie um
export const apM = (s: number, v: V3): V3 => {
  const w = apA(v);
  return [lerp(v[0], w[0], s), lerp(v[1], w[1], s), lerp(v[2], w[2], s)];
};

export const KH = unit(KER);
// Bildebene: zwei orthonormale Richtungen darin
export const P1 = unit(COLS[0]);
export const P2 = unit(cross(N_IMG, P1));
export const onImg = (a: number, b: number): V3 => add3(sc3(P1, a), sc3(P2, b));
// Gleichungsebene i: Richtung entlang der Kern-Geraden und quer dazu
export const EQ_DIR: V3[] = ROWS.map((n) => unit(cross(n, KER)));
export const onEq = (i: number, a: number, b: number): V3 => add3(sc3(KH, a), sc3(EQ_DIR[i], b));

/* ---------- Gitter 7 × 7 × 7 ---------- */

export const SP = 0.38;
const N = 3;
export type LPoint = {q: V3; ker: boolean; c: number};
export const LATTICE: LPoint[] = [];
for (let i = -N; i <= N; i++)
  for (let j = -N; j <= N; j++)
    for (let k = -N; k <= N; k++) LATTICE.push({q: [i * SP, j * SP, k * SP], ker: i === k && j === -i, c: (i + j + k + 3 * N) / (6 * N)});
// Nachbarn entlang der Achsen für die feinen Gitterlinien
export const LAT_EDGES: [V3, V3][] = [];
for (let i = -N; i <= N; i++)
  for (let j = -N; j <= N; j++)
    for (let k = -N; k < N; k++) {
      LAT_EDGES.push([[i * SP, j * SP, k * SP], [i * SP, j * SP, (k + 1) * SP]]);
      LAT_EDGES.push([[i * SP, k * SP, j * SP], [i * SP, (k + 1) * SP, j * SP]]);
      LAT_EDGES.push([[k * SP, i * SP, j * SP], [(k + 1) * SP, i * SP, j * SP]]);
    }

/* ---------- Ketten von Übergängen ---------- */

// ab Zeit `at` in `dur` Sekunden weich auf den Wert `to`
export const chain = (t: number, v0: number, keys: [number, number, number][], ease = easeInOutCubic) =>
  keys.reduce((v, [at, dur, to]) => lerp(v, to, ease(clamp((t - at) / dur))), v0);

// Flachdrücken: Punkte auf der Kern-Geraden und der Rest getrennt, damit „was auf null landet“ allein laufen kann
export const sKer = (t: number) =>
  chain(t, 0, [
    [T.platt, 1.3, 1],
    [T.gerade, 0.45, 0],
    [T.nochmal, 1.5, 1],
    [T.ende + 1.2, 0.3, 0],
    [T.kernIs + 0.3, 1.2, 1],
    [T.s1 + 0.8, 0.3, 0],
    [T.verloren - 0.3, 1.6, 1],
  ]);
export const sRest = (t: number) =>
  chain(t, 0, [
    [T.platt, 1.3, 1],
    [T.gerade, 0.45, 0],
    [T.nochmal, 1.5, 1],
    [T.ende + 1.2, 0.3, 0],
    [T.bildIs + 0.2, 1.4, 1],
    [T.s1 + 0.8, 0.3, 0],
    [T.verloren - 0.3, 1.6, 1],
  ]);

export const vis = {
  lattice: (t: number) => chain(t, 1, [[T.ende, 0.6, 0], [T.idee - 0.1, 0.5, 1], [T.s1 + 0.1, 0.6, 0], [T.von - 0.2, 0.6, 1], [T.merk, 0.6, 0.3], [T.cta, 0.4, 0]]),
  kerHi: (t: number) => chain(t, 0, [[T.gerade, 0.3, 1], [T.ende, 0.5, 0], [T.kernIs - 0.2, 0.4, 1], [T.bildIs + 1.4, 0.5, 0.5], [T.s1, 0.5, 0], [T.von, 0.4, 1]]),
  restDim: (t: number) => chain(t, 0, [[T.gerade, 0.3, 0.6], [T.klausur, 0.4, 0], [T.kernIs - 0.2, 0.4, 0.6], [T.bildIs, 0.4, 0]]),
  kerLine: (t: number) =>
    chain(t, 0, [[T.gerade + 0.2, 0.5, 1], [T.ende, 0.5, 0], [T.kernIs - 0.2, 0.5, 1], [T.s1, 0.5, 0], [T.kernIst, 0.8, 1], [T.s2 + 0.3, 0.6, 0], [T.dimk, 0.5, 1], [T.merk, 0.5, 0]]),
  img: (t: number) =>
    chain(t, 0, [
      [T.platt + 1.0, 0.6, 0.55],
      [T.gerade, 0.3, 0],
      [T.nochmal + 1.2, 0.5, 0.55],
      [T.ende, 0.5, 0],
      [T.bildIs + 1.0, 0.6, 1],
      [T.s1, 0.5, 0],
      [T.basis + 0.2, 1.2, 1],
      [T.von - 0.3, 0.5, 0],
      [T.zweiB - 0.3, 0.6, 1],
      [T.merk, 0.5, 0.3],
      [T.cta, 0.4, 0],
    ]),
  // Gleichungsebenen I, II, III
  eq: (i: number, t: number) =>
    chain(t, 0, [
      [T.loese + 0.1 + 0.4 * i, 0.6, 1],
      ...(i === 2 ? ([[T.weg + 0.1, 0.6, 0.12]] as [number, number, number][]) : []),
      [T.s2 + 0.2, 0.6, 0],
    ]),
  cols: (t: number) => chain(t, 0, [[T.ende + 0.1, 0.6, 1], [T.idee - 0.2, 0.5, 0], [T.spalten + 0.6, 0.6, 1], [T.s3 + 0.2, 0.6, 0]]),
  point: (t: number) => chain(t, 0, [[T.nenn, 0.4, 1], [T.kernIst + 1.4, 0.5, 0]]),
  // Dreieck a₁, −a₂, +a₃: Fortschritt der drei Kanten
  tri: (t: number): [number, number, number] => [prog(t, T.sp1, 0.7), prog(t, T.sp2, 0.7), prog(t, T.sp3, 0.8)],
  triOut: (t: number) => prog(t, T.zwei, 0.6),
  para: (t: number) => chain(t, 0, [[T.zwei + 0.3, 0.9, 1], [T.basis + 0.6, 0.8, 0]]),
  grey2: (t: number) => prog(t, T.ueberfl2, 0.5),
};
export const tParam = (t: number) => 1.25 * Math.sin((t - T.nenn) * 1.2);

/* ---------- Bühne: Position, Größe, Helligkeit ---------- */

const kf = (t: number, keys: [number, number][]) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      return lerp(v0, v1, easeInOutCubic(clamp((t - t0) / (t1 - t0))));
    }
  }
  return keys[keys.length - 1][1];
};

export const stageAt = (t: number) => ({
  cy: kf(t, [[0, 960], [T.glide, 960], [T.glide + 1.2, 1110], [T.s1 + 0.2, 1110], [T.s1 + 1.2, 1280], [T.s2, 1280], [T.s2 + 1, 1265], [T.s3, 1265], [T.s3 + 1, 1190]]),
  // im Hook nah am Würfel, beim Flachdrücken weiter weg (das Bild ist größer als der Würfel)
  u: kf(t, [
    [0, 200],
    [T.platt, 190],
    [T.platt + 1.5, 92],
    [T.gerade, 92],
    [T.gerade + 0.45, 170],
    [T.nochmal, 165],
    [T.nochmal + 1.5, 92],
    [T.glide, 92],
    [T.glide + 1.2, 132],
    [T.idee - 0.6, 132],
    [T.idee, 104],
    [T.bildIs, 104],
    [T.bildIs + 1.4, 76],
    [T.s1 + 0.2, 76],
    [T.s1 + 1.2, 64],
    [T.s2, 64],
    [T.s2 + 1, 124],
    [T.s3, 124],
    [T.s3 + 1, 66],
  ]),
  o: kf(t, [[0, 1], [T.klausur - 0.2, 1], [T.klausur + 0.4, 0.28], [T.glide, 0.28], [T.glide + 1.0, 1], [T.merk, 1], [T.merk + 0.6, 0.35], [T.cta, 0.35], [T.cta + 0.5, 0]]),
});

/* ---------- Kamera ---------- */

const deg = (r: number) => (r * 180) / Math.PI;
const angOf = (f: V3) => ({th: deg(Math.asin(f[2])), ph: deg(Math.atan2(f[1], f[0]))});
// Blick auf die Kante der Bildebene (leicht von oben, innerhalb der Ebene)
const EDGE_IMG = angOf(unit(add3(sc3(unit([1, -1, 0]), Math.cos(0.42)), sc3(unit([1, 1, 2]), Math.sin(0.42)))));
// Blick genau entlang der Kern-Geraden: alle drei Gleichungsebenen werden zu Strichen
const EDGE_KER = angOf(KH);

const toward = (from: number, to: number) => {
  let d = to - from;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return from + d;
};

export const camAt = (t: number) => {
  const st = stageAt(t);
  const th0 = 23 + 3 * Math.sin(t / 9);
  const ph0 = -105 + 0.3 * t + 7 * Math.sin(t / 6.5);
  const eImg = Math.max(prog(t, T.edge - 0.3, 1.0) * (1 - prog(t, T.gerade, 0.8)), prog(t, T.vorhin - 0.3, 1.3) * (1 - prog(t, T.s3 - 0.3, 1.1)));
  const eKer = prog(t, T.weg + 0.6, 1.3) * (1 - prog(t, T.frei - 0.2, 1.1));
  let th = th0;
  let ph = ph0;
  if (eImg > 0) {
    th = lerp(th, EDGE_IMG.th, eImg);
    ph = lerp(ph, toward(ph, EDGE_IMG.ph), eImg);
  }
  if (eKer > 0) {
    th = lerp(th, EDGE_KER.th, eKer);
    ph = lerp(ph, toward(ph, EDGE_KER.ph), eKer);
  }
  return {cam: makeCam(th, ph, 540, st.cy, st.u), st, th, ph};
};

export const project = (t: number, q: V3): V2 => camAt(t).cam.p(q);
