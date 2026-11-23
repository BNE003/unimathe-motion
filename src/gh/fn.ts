// Mathematik von Gabriels Horn: Rotation von f(x) = 1/x (x ≥ 1) um die x-Achse.
// Alle Zahlen im Bild kommen von hier; die Assertions laufen bei jedem Render.

export const f = (x: number) => 1 / x;

// Volumen von 1 bis X: π∫₁^X dx/x² = π(1 − 1/X)
export const volTo = (X: number) => Math.PI * (1 - 1 / X);

// Oberfläche von 1 bis X: 2π∫₁^X (1/x)·√(1 + 1/x⁴) dx, geschlossen über u = x²:
// = π[asinh(u) − √(u² + 1)/u] von 1 bis X²
const G = (u: number) => Math.asinh(u) - Math.sqrt(u * u + 1) / u;
export const areaTo = (X: number) => Math.PI * (G(X * X) - G(1));

// abgerollte Haut ohne Schräge: ∫ 2π/x dx
export const flatTo = (X: number) => 2 * Math.PI * Math.log(X);

// Stück [a, 2a]
export const pieceVol = (a: number) => volTo(2 * a) - volTo(a);
export const pieceArea = (a: number) => areaTo(2 * a) - areaTo(a);
export const BAND = 2 * Math.PI * Math.log(2); // abgerollter Streifen, für jedes Stück gleich

/* ---------- Prüfungen ---------- */

const simpson = (g: (x: number) => number, a: number, b: number, n = 4000) => {
  const h = (b - a) / n;
  let s = g(a) + g(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * g(a + i * h);
  return (s * h) / 3;
};
const close = (a: number, b: number, tol: number, what: string) => {
  if (!(Math.abs(a - b) <= tol)) throw new Error(`Gabriels Horn: ${what}: ${a} ≠ ${b}`);
};

for (const a of [1, 2, 4, 8, 16, 1024]) {
  // Volumen eines Stücks: genau π/(2a), also π/2, π/4, π/8, …
  close(pieceVol(a), Math.PI / (2 * a), 1e-12, `Stückvolumen a=${a}`);
  close(simpson((x) => Math.PI / (x * x), a, 2 * a), Math.PI / (2 * a), 1e-9, `Stückvolumen Simpson a=${a}`);
  // Haut: geschlossene Form = numerisches Integral, immer über 4 und über dem abgerollten Streifen
  close(pieceArea(a), simpson((x) => ((2 * Math.PI) / x) * Math.sqrt(1 + x ** -4), a, 2 * a), 1e-7, `Stückhaut a=${a}`);
  close(simpson((x) => (2 * Math.PI) / x, a, 2 * a), BAND, 1e-9, `Streifen a=${a}`);
}
for (let k = 0; k <= 20; k++) {
  const a = 2 ** k;
  if (!(pieceArea(a) > BAND - 1e-9 && pieceArea(a) > 4 && BAND > 4)) throw new Error(`Gabriels Horn: Haut von Stück ${a} nicht über 4`);
  // Selbstähnlichkeit: f(2x) = f(x)/2
  close(f(2 * a * 1.37), f(a * 1.37) / 2, 1e-15, 'f(2x) = f(x)/2');
}
// Teilsummen π/2 + π/4 + … → π, Oberfläche wächst über jede Schranke
close(Array.from({length: 60}, (_, k) => pieceVol(2 ** k)).reduce((s, v) => s + v, 0), Math.PI, 1e-12, 'Summe der Stückvolumen');
close(volTo(1e12), Math.PI, 1e-9, 'Volumen gesamt');
if (!(areaTo(1e6) > 80 && areaTo(1e12) > 170)) throw new Error('Gabriels Horn: Oberfläche wächst nicht');
close(areaTo(1), 0, 1e-12, 'Oberfläche bei 1');
