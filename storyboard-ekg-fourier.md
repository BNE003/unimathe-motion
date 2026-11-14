# Storyboard: „Was hat dein Herzschlag mit Vektoren zu tun?“ (EKG, Basiswechsel, Fourier)

Status: v2 „Zacken oder Wellen“ in `src/ekg/`, mit Stimme ekg-v2.mp3 (922 Credits, 61,04 s) gerendert: 68,6 s, abgenommen. v1 (Mini-Signal, Matrix; ekg-take1.mp3) wurde abgelehnt: zu komplex, EKG-Bezug fehlte.

## v2 Sprechtext

Was hat dein Herzschlag mit Vektoren zu tun? Dieses EKG zittert: Brummen aus der Steckdose.
Digital ist es nur eine Liste von Messwerten, hier tausend. Also ein Vektor.
Jeder Wert sagt: so hoch an dieser Stelle. Man baut das EKG aus tausend schmalen Zacken, das sind die Basisvektoren.
Das Brummen steckt in jeder einzelnen Zacke. Löschen kann man es so nicht.
Aber dieselbe Kurve lässt sich auch aus Wellen bauen: langsame, schnellere, immer schnellere. Jede mit einem Gewicht. Zusammen: wieder genau dieses EKG.
Und in dieser Liste ist das Brummen nur eine einzige Welle, fünfzig Schwingungen pro Sekunde. Gewicht auf null, Wellen addieren: sauberes EKG.
Derselbe Vektor, zwei Listen. Wie ein Pfeil im gedrehten Koordinatensystem: Der Pfeil bleibt, die Zahlen ändern sich. Das ist die Fourier-Transformation: ein Basiswechsel von Zacken zu Wellen.
Hundertvierzehn kostenlose Übungen in der App UniMathe. Link in der Bio.

Mathe v2: Brummen 0,045 mV bei genau 50 Schwingungen pro Fenster (1 s) → liegt nur auf Welle 50; ohne sie ist die Rekonstruktion bis auf 3·10⁻¹⁴ das saubere EKG plus dessen winzigen 50er-Anteil (< 0,001 mV). Gedrehtes Gitter: e₁ → (1, −1), e₂ → (1, 1), (3, 1) = 1·(1, −1) + 2·(1, 1).

## v1 (abgelehnt)

- Aha-Video, Ziel: „Fourier ist ein Basiswechsel – nur sind die neuen Basisvektoren Schwingungen.“
- Brücke: Ein Signal mit zwei Messwerten (3, 1) ist ein Pfeil in der Ebene. Die Schwingungsbasis für N = 2 ist
  g = (1, 1) (flach) und w = (1, −1) (springt hin und her) – das sind die Diagonalen. Der Basiswechsel in der Ebene
  ist also schon die diskrete Fourier-Transformation für N = 2.
- Mehr Mathe (Wunsch Fassung 3): Gewichte = ⟨s, Muster⟩ / ⟨Muster, Muster⟩, klappt wegen Orthogonalität;
  Muster als Zeilen einer Matrix = DFT-Matrix (N = 2), dann 1000 × 1000.
- Schluss: „114 kostenlose Übungen in der App“ und „Link in Bio“ statt App-Store-Suche.
- Musik: `tools/music-ekg.mjs` (übliches Schema wie music-kr, Zeiten aus der Timeline, Start mit `npx tsx`).
- Compositions: `EKG-Fourier`, `EKG-Fourier-ohneMusik`, `EKG-Fourier-stumm` (für Standbilder).

## Mathematik

- Synthetisches, periodisches EKG aus fünf Glockenkurven (P, Q, R, S, T), N = 1000 Messwerte über einen Herzschlag (`src/ekg/signal.ts`).
- Reelle Basis für gerades N: Konstante, cos k und sin k für k = 1 … 499, cos(πn). 1 + 2 · 499 + 1 = 1000 Vektoren,
  paarweise orthogonal, Normquadrate N, N/2, N.
- Gewichte: C0 = X₀/N, a_k = 2 Re X_k / N, b_k = −2 Im X_k / N, a₅₀₀ = X₅₀₀/N mit X_k = Σ sₙ e^{−2πikn/N}.
- N = 2: ⟨s, g⟩/⟨g, g⟩ = 4/2 = 2, ⟨s, w⟩/⟨w, w⟩ = 2/2 = 1; (1 1; 1 −1)(3, 1)ᵀ = (4, 2)ᵀ = (X₀, X₁).
- Näherung: Fehler 20 % (41 Bausteine), 2,3 % (61), 0,2 % (101); mit allen 1000 exakt (3 · 10⁻¹⁴).
- Die Matrix im Video ist die reelle Fourier-Matrix (Zeilen 1, cos 1, sin 1, …); die komplexe Formel steht am Ende.

## Sprechtext

Was hat dein Herzschlag mit Vektoren zu tun?
Digital ist ein EKG eine Liste von Messwerten, hier tausend. Also ein Vektor mit tausend Komponenten.
Zeichnen kann das niemand. Also nehmen wir nur zwei Messwerte: drei und eins. Das ist ein Pfeil in der Ebene.
Drei nach rechts, eins nach oben: drei e eins plus ein e zwei. Als Signal: dreimal ein Impuls vorne, einmal ein Impuls hinten.
Jetzt andere Bausteine: ein flaches Signal und eins, das hin und her springt, die einfachste Schwingung. Der Pfeil bleibt, wo er ist. Aber jetzt heißt er: zweimal flach plus einmal Schwingung.
Und die Gewichte? Skalarprodukt mit dem Muster, geteilt durch seine Länge zum Quadrat. Drei plus eins, halbiert: zwei. Drei minus eins, halbiert: eins. Das klappt, weil die neuen Achsen senkrecht stehen.
Schreibt man die Muster als Zeilen in eine Matrix, ist das schon die diskrete Fourier-Transformation, für zwei Messwerte.
Mehr Messwerte, mehr Muster: immer schnellere Schwingungen. Bei tausend Messwerten ist die Matrix tausend mal tausend, jede Zeile eine Schwingung.
Matrix mal EKG liefert tausend Gewichte. Damit addiert ergeben die Schwingungen wieder das EKG, erst grob, dann immer genauer. Mit allen tausend: exakt.
Das EKG bleibt derselbe Vektor. Die Fourier-Transformation wechselt nur die Basis: von Impulsen zu Schwingungen.
Hundertvierzehn kostenlose Übungen warten in der App UniMathe. Link in der Bio.
