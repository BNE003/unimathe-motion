// f(x) = x² − 2x − 3 = (x − 1)² − 4. Alle Zahlen im Video kommen von hier; Assertions brechen das Rendern ab,
// wenn etwas nicht stimmt.

export const f = (x: number) => x * x - 2 * x - 3;
export const vertexForm = (x: number) => (x - 1) ** 2 - 4;
export const S = {x: 1, y: -4};

// Teil a: Intervall der x-Werte, Teil b: Intervall der Werte
export const A_INT: [number, number] = [-1, 3];
export const B_INT: [number, number] = [0, 5];
// Ergebnisse
export const IMG_A: [number, number] = [-4, 0];
export const PRE_B: [number, number][] = [
  [-2, -1],
  [3, 4],
];
// Abstände von der Symmetrieachse x = 1 in Teil b: √(0 + 4) = 2, √(5 + 4) = 3
export const D_IN = Math.sqrt(B_INT[0] + 4);
export const D_OUT = Math.sqrt(B_INT[1] + 4);

const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;
const check = (ok: boolean, msg: string) => {
  if (!ok) throw new Error(`Mathe-Prüfung: ${msg}`);
};

for (let x = -6; x <= 6; x += 0.01) check(near(f(x), vertexForm(x)), `Scheitelform bei ${x}`);
check(f(-1) === 1 + 2 - 3 && f(-1) === 0, 'f(−1)');
check(f(3) === 9 - 6 - 3 && f(3) === 0, 'f(3)');
check(f(1) === -4 && f(-2) === 5 && f(4) === 5, 'f(1), f(−2), f(4)');
check(D_IN === 2 && D_OUT === 3, 'Abstände 2 und 3');
check(S.x - D_OUT === -2 && S.x - D_IN === -1 && S.x + D_IN === 3 && S.x + D_OUT === 4, 'Grenzen 1 ± 2, 1 ± 3');

// Bild von [−1, 3] durch Abtasten
{
  let lo = Infinity;
  let hi = -Infinity;
  for (let x = A_INT[0]; x <= A_INT[1] + 1e-9; x += 0.001) {
    lo = Math.min(lo, f(x));
    hi = Math.max(hi, f(x));
  }
  check(Math.abs(lo - IMG_A[0]) < 1e-6 && Math.abs(hi - IMG_A[1]) < 1e-6, 'Bild von [−1, 3]');
}
// Urbild von [0, 5] durch Abtasten
for (let k = -6000; k <= 6000; k++) {
  const x = k / 1000;
  const inB = f(x) >= B_INT[0] - 1e-9 && f(x) <= B_INT[1] + 1e-9;
  const inPre = PRE_B.some(([a, b]) => x >= a - 1e-9 && x <= b + 1e-9);
  check(inB === inPre, `Urbild bei x = ${x.toFixed(3)}`);
}
// Bildmenge: f ≥ −4, und jedes y ≥ −4 hat das Urbild 1 + √(y + 4)
for (let x = -20; x <= 20; x += 0.01) check(f(x) >= -4 - 1e-12, 'f ≥ −4');
for (let y = -4; y <= 40; y += 0.25) check(near(f(1 + Math.sqrt(y + 4)), y), `Urbild von ${y}`);

// Zahl als TeX mit echtem Minus und Komma
export const num = (v: number) => (v < 0 ? `-${Math.abs(v)}` : `${v}`).replace('.', '{,}');
