// Mathematik hinter Banach-Tarski: die freie Gruppe aus zwei Drehungen und ihre paradoxe Zerlegung.
// a = Drehung um die x-Achse, b = Drehung um die z-Achse, beide mit cos = 1/3 (Winkel arccos(1/3) ≈ 70,53°).
// Diese beiden Drehungen erzeugen eine freie Gruppe (Świerczkowski): kein nichtleeres reduziertes Wort ist die Identität.
// Großbuchstaben sind die Inversen: A = a⁻¹, B = b⁻¹. Die Assertions laufen bei jedem Render.

import {V3} from '../space';

export type Letter = 'a' | 'A' | 'b' | 'B';
export const LETTERS: Letter[] = ['a', 'A', 'b', 'B'];
export const INV: Record<Letter, Letter> = {a: 'A', A: 'a', b: 'B', B: 'b'};

type M3 = [V3, V3, V3];
const c = 1 / 3;
const s = Math.sqrt(8) / 3;
export const ROT: Record<Letter, M3> = {
  a: [[1, 0, 0], [0, c, -s], [0, s, c]],
  A: [[1, 0, 0], [0, c, s], [0, -s, c]],
  b: [[c, -s, 0], [s, c, 0], [0, 0, 1]],
  B: [[c, s, 0], [-s, c, 0], [0, 0, 1]],
};
export const AXIS: Record<'a' | 'b', V3> = {a: [1, 0, 0], b: [0, 0, 1]};
export const ANGLE = Math.acos(1 / 3);

export const apply = (M: M3, v: V3): V3 => [
  M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2],
  M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2],
  M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2],
];
const mul = (X: M3, Y: M3): M3 => X.map((r) => [0, 1, 2].map((j) => r[0] * Y[0][j] + r[1] * Y[1][j] + r[2] * Y[2][j])) as M3;
const ID: M3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

// Drehung um eine Achse um den Winkel w (Rodrigues), für die Animation zwischen Identität und a bzw. b
export const rotAxis = (k: V3, w: number, v: V3): V3 => {
  const cw = Math.cos(w);
  const sw = Math.sin(w);
  const d = k[0] * v[0] + k[1] * v[1] + k[2] * v[2];
  const x: V3 = [k[1] * v[2] - k[2] * v[1], k[2] * v[0] - k[0] * v[2], k[0] * v[1] - k[1] * v[0]];
  return [0, 1, 2].map((i) => v[i] * cw + x[i] * sw + k[i] * d * (1 - cw)) as V3;
};

/* ---------- reduzierte Wörter ---------- */

// alle reduzierten Wörter bis zur Länge n, kürzere zuerst
export const words = (n: number): string[] => {
  const out = [''];
  let level = [''];
  for (let L = 1; L <= n; L++) {
    const next: string[] = [];
    for (const w of level)
      for (const ch of LETTERS) {
        if (w && INV[w[w.length - 1] as Letter] === ch) continue;
        next.push(w + ch);
      }
    out.push(...next);
    level = next;
  }
  return out;
};

// Links mit einem Buchstaben multiplizieren und kürzen: das ist „einen Schritt weiterrücken“
export const leftMul = (ch: Letter, w: string) => (w && w[0] === INV[ch] ? w.slice(1) : ch + w);

export const rotOf = (w: string): M3 => w.split('').reduce((R, ch) => mul(R, ROT[ch as Letter]), ID);
// Bahnpunkt w·x: erst der letzte Buchstabe, zuletzt der erste
export const orbitPoint = (w: string, x: V3): V3 => apply(rotOf(w), x);

/* ---------- Baum in der Ebene: erster Schritt Länge 1, jeder weitere halb so lang ---------- */

export const DIR: Record<Letter, [number, number]> = {a: [1, 0], A: [-1, 0], b: [0, 1], B: [0, -1]};
export const treePos = (w: string): [number, number] => {
  let x = 0;
  let y = 0;
  let L = 1;
  for (const ch of w) {
    x += DIR[ch as Letter][0] * L;
    y += DIR[ch as Letter][1] * L;
    L /= 2;
  }
  return [x, y];
};
// Ast eines Worts = sein erster Buchstabe; das leere Wort ist die Mitte
export const branchOf = (w: string): Letter | '' => (w ? (w[0] as Letter) : '');

/* ---------- Prüfungen ---------- */

const fail = (m: string) => {
  throw new Error(`Banach-Tarski: ${m}`);
};

// 1. frei: kein nichtleeres Wort bis Länge 7 ergibt die Identität
for (const w of words(7)) {
  if (!w) continue;
  const R = rotOf(w);
  let d = 0;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) d += Math.abs(R[i][j] - (i === j ? 1 : 0));
  if (d < 0.1) fail(`Wort ${w} ist fast die Identität`);
}

// 2. paradoxe Zerlegung auf Wortebene: a·S(a⁻¹) = F₂ \ S(a) (bis Länge n−1 vollständig), ebenso für b
for (const [x, X] of [['a', 'A'], ['b', 'B']] as [Letter, Letter][]) {
  const n = 6;
  const shifted = new Set(words(n).filter((w) => w[0] === X).map((w) => leftMul(x, w)));
  for (const w of words(n - 1)) {
    const inS = w[0] === x;
    if (inS === shifted.has(w)) fail(`${x}·S(${X}) ≠ F₂ \\ S(${x}) bei „${w}“`);
  }
}

// 3. Baumbild: Weiterrücken mit a ist die Streckung ×2 um (−2, 0)
for (const w of words(6).filter((v) => v[0] === 'A')) {
  const p = treePos(w);
  const q = treePos(leftMul('a', w));
  if (Math.hypot(2 * p[0] + 2 - q[0], 2 * p[1] - q[1]) > 1e-12) fail(`Streckung im Baum bei ${w}`);
}

// 4. Bahn auf der Kugel: verschiedene Punkte, und Drehung um a bringt S(a⁻¹) exakt auf vorhandene Punkte
export const X0: V3 = (() => {
  const v: V3 = [-0.25, -0.85, 0.45];
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l];
})();
{
  const ws = words(4);
  const P = ws.map((w) => orbitPoint(w, X0));
  for (let i = 0; i < P.length; i++)
    for (let j = i + 1; j < P.length; j++) if (Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1], P[i][2] - P[j][2]) < 1e-6) fail('Bahnpunkte fallen zusammen');
  ws.forEach((w, i) => {
    if (w[0] !== 'A') return;
    const moved = apply(ROT.a, P[i]);
    const target = orbitPoint(leftMul('a', w), X0);
    if (Math.hypot(moved[0] - target[0], moved[1] - target[1], moved[2] - target[2]) > 1e-9) fail(`Drehung trifft nicht bei ${w}`);
    // und die animierte Drehung um die x-Achse mit arccos(1/3) ist genau a
    const r = rotAxis(AXIS.a, ANGLE, P[i]);
    if (Math.hypot(r[0] - moved[0], r[1] - moved[1], r[2] - moved[2]) > 1e-9) fail('Achsendrehung ≠ a');
  });
}
