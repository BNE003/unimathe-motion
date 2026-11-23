// Die Funktionen der Aufgabe und ihre Verkettungen. Alle Zahlen im Video (Maschinen, Graph, Gegenbeispiele) kommen von hier.
// Beim Laden prüfen Assertions die Mathematik; ein Fehler bricht das Rendern ab.

export const f = (x: number) => 2 * x + 3;
export const g = (x: number) => x * x;
export const fg = (x: number) => f(g(x)); // f∘g: erst g, dann f
export const gf = (x: number) => g(f(x)); // g∘f: erst f, dann g
export const fInv = (x: number) => (x - 3) / 2;

// Beispielwert, der durch alle drei Teile läuft
export const X0 = -1;

const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;
const check = (ok: boolean, msg: string) => {
  if (!ok) throw new Error(`Mathe-Prüfung: ${msg}`);
};

for (let x = -6; x <= 6; x += 0.05) {
  check(near(fg(x), 2 * x * x + 3), `(f∘g)(${x}) ≠ 2x²+3`);
  check(near(gf(x), 4 * x * x + 12 * x + 9), `(g∘f)(${x}) ≠ 4x²+12x+9`);
  check(near(gf(x), 4 * (x + 1.5) ** 2), `(g∘f)(${x}) ≠ 4(x+1,5)²`);
  check(near(fInv(f(x)), x) && near(f(fInv(x)), x), `f⁻¹ falsch bei ${x}`);
  check(fg(x) >= 3 - 1e-12 && gf(x) >= -1e-12, 'Bildgrenzen');
}
check(fg(0) === 3 && gf(-1.5) === 0, 'Scheitel');
check(fg(-1) === 5 && fg(1) === 5, 'Gegenbeispiel f∘g');
check(gf(-1) === 1 && gf(-2) === 1, 'Gegenbeispiel g∘f');
check(g(X0) === 1 && f(g(X0)) === 5 && f(X0) === 1 && g(f(X0)) === 1, 'Maschinen mit −1');
check(2 * X0 === -2 && 2 * X0 + 3 === 1 && 1 - 3 === -2 && -2 / 2 === X0 && fInv(1) === X0, 'Maschine von f mit −1');

// Zahl als TeX mit echtem Minus
export const num = (v: number) => (v < 0 ? `-${Math.abs(v)}` : `${v}`).replace('.', '{,}');
