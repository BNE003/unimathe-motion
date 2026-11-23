// Die Funktionen der Aufgabe und ihre Verkettungen. Alle Zahlen im Video (Rechnungen mit −1, Graph, Gegenbeispiele) kommen von hier.
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
check(g(X0) === (-1) ** 2 && g(X0) === 1 && f(1) === 2 * 1 + 3 && f(g(X0)) === 5, '(f∘g)(−1): g(−1) = 1, f(1) = 5');
check(f(X0) === -2 + 3 && f(X0) === 1 && g(1) === 1 ** 2 && g(f(X0)) === 1, '(g∘f)(−1): f(−1) = 1, g(1) = 1');
// Ausmultiplizieren (2x + 3)·(2x + 3): die vier Produkte
for (let x = -4; x <= 4; x += 0.25) check(near((2 * x) * (2 * x) + 2 * x * 3 + 3 * (2 * x) + 3 * 3, 4 * x * x + 12 * x + 9), 'jeder mit jedem');
check(fg(1) === 2 * 1 ** 2 + 3 && (2 * -2 + 3) ** 2 === (-1) ** 2 && gf(-2) === 1, 'Werte in Teil b');
check(fInv(1) === (1 - 3) / 2 && fInv(1) === X0, 'Probe f⁻¹(1) = −1');

// Zahl als TeX mit echtem Minus
export const num = (v: number) => (v < 0 ? `-${Math.abs(v)}` : `${v}`).replace('.', '{,}');
