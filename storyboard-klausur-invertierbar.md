# Storyboard: Mathe 1 Klausur – Für welche a ist A(a) invertierbar?

Status: v1 (93,7 s) und v2 (129,2 s) mit Feedback. v3 in `src/ki/` (133,7 s): Warum-Teil mit dem Beispiel a = −1 neu gesprochen (`ki-take3-warum.mp3`, 1.218 Credits, 79,12 s), weil der Körper bei a = 3 eine dünne Platte ist (Zeilen nur 29° auseinander) und flach wirkte. Bei a = −1 stehen die Zeilen 70° auseinander, der Körper ist fast ein Würfel. Glaskörper mit kameragebundenem Licht, starke Perspektive (Abstand 7,5), Schatten am Boden. Take 2 (`ki-take2-warum.mp3`, 1.149 Credits) wird nicht mehr verwendet. Stimme Take 1: `ki-take1.mp3`, 1.413 Credits. Branch `video/klausur-invertierbar`. Musik aus `tools/music-ki.mjs`.

## Schnitt der Aufnahme

Die Stimme wird aus Clips zusammengesetzt (`CLIPS` in `src/ki/timeline.ts`): Take 1 bis „…einfach abziehen?“, dann Take 2 (Warum-Teil), dann Merksatz und CTA aus Take 1. Der alte Warum-Teil aus Take 1 (49,8–87,0 s) wird nicht verwendet. Pausen zwischen den Sätzen ca. 0,32 s, länger nach „einzige Wert?“, „Unten genauso.“, (a−1)², der Antwort, „Genauso beim dritten Pfeil.“, „verschwindet er.“ und dem Merksatz. Antwort steht bei 41,6 s.

## Warum-Teil v2 (Take 2, ersetzt)

> Jede Zeile ist ein Pfeil im Raum. Zusammen spannen die drei Pfeile einen schiefen Körper auf, und die Determinante ist hier genau sein Volumen.
> Nehmen wir a gleich drei. Dann ist das Volumen drei minus eins zum Quadrat, also vier.
> Das Volumen ist Grundfläche mal Höhe.
> Die Grundfläche bilden der erste und der dritte Pfeil. Die Höhe ist der Abstand der zweiten Pfeilspitze von dieser Fläche.
> Jetzt ziehen wir die erste Zeile von der zweiten ab. Die Spitze des zweiten Pfeils rutscht dabei genau entlang des ersten Pfeils, also parallel zur Grundfläche.
> Ihr Abstand bleibt gleich. Höhe gleich, Grundfläche gleich, also bleibt das Volumen vier.
> Mit dem dritten Pfeil passiert genau dasselbe.
> Am Ende steht der Körper auf einem Quadrat, zwei mal zwei, und ist eins hoch. Zwei mal zwei mal eins ist vier: genau die Zahlen auf der Diagonale.
> Und jetzt lassen wir a gegen eins laufen. Die Seiten des Quadrats, a minus eins, werden immer kürzer.
> Bei a gleich eins ist das Quadrat nur noch ein Punkt, und der Körper ist platt. Volumen null heißt Determinante null, also keine Inverse.
> Danach wächst er wieder. Nur bei a gleich eins verschwindet das Volumen.

## Warum-Teil v3 (Take 3, a = −1)

Wie v2, aber: „Nehmen wir a gleich minus eins. Dann ist das Volumen minus eins minus eins zum Quadrat, also vier.“ und „Am Ende steht der Körper auf einem Quadrat mit der Seitenlänge zwei und ist eins hoch. Zwei mal zwei mal eins ist vier. Und in der Matrix steht auf der Diagonale eins, minus zwei, minus zwei. Ihr Produkt ist auch vier.“ sowie „Die Seiten des Quadrats werden immer kürzer.“ Der Schieberegler läuft −1 → 1 → 3.

Mathe a = −1 (geprüft): Zeilen (1,1,1), (1,−1,1), (1,1,−1), det = (−1−1)² = 4. Grundfläche aus Z₁, Z₃: |Z₁ × Z₃| = |(−2, 2, 0)| = 2√2, Abstand der Spitze von Z₂ √2, Volumen 4. Nach den Scherungen (1,1,1), (0,−2,0), (0,0,−2): Quadrat mit Seitenlänge 2, Höhe 1, Diagonale 1 · (−2) · (−2) = 4.

Kamera bei den Scherungen: Blick 30° schräg auf die Grundfläche, Z₁ quer im Bild, Höhe senkrecht dazu. Grundfläche aus Z₁, Z₃: φ = −90°, θ = 45°. Aus Z₁, Z₂′: φ = 180°, θ = 45°.

Mathe der Scherung (geprüft): Grundfläche aus Z₁ = (1,1,1) und Z₃ = (1,1,3) hat Inhalt |Z₁ × Z₃| = 2√2, Abstand der Spitze von Z₂ = (1,3,1) zur Ebene √2, Volumen 2√2 · √2 = 4. Z₂ − t·Z₁ ändert den Abstand nicht, weil Z₁ in der Ebene liegt.

## Zahlen im Bild

Im Schieberegler steht a mit einer Nachkommastelle. Kleine Matrix und Volumen werden aus genau diesem gerundeten Wert gerechnet, z. B. a = −0,8 → −1,8 → (−1,8)² = 3,24.

Format: 9:16, 1080 × 1920, 60 fps, Deutsch, Ziel ca. 90 s. Text nur in y 300–1500 und x < 940.

## Aufgabe

A(a) = (1 1 1; 1 a 1; 1 1 a), a ∈ ℝ. Für welche a ist A(a) invertierbar?

## Mathematik (geprüft)

- Z₂ ← Z₂ − Z₁: (1, a, 1) − (1, 1, 1) = (0, a−1, 0). Z₃ ← Z₃ − Z₁: (0, 0, a−1).
- Das Addieren eines Vielfachen einer anderen Zeile ändert die Determinante nicht.
- Obere Dreiecksmatrix diag(1, a−1, a−1): det A = 1 · (a−1) · (a−1) = (a−1)². Probe mit Sarrus: a² − 2a + 1.
- Invertierbar ⇔ det ≠ 0 ⇔ a ≠ 1. Bei a = 1 sind alle Zeilen (1, 1, 1), Rang 1.
- Volumen: |det| ist das Volumen des Spats der drei Zeilen (det A = det Aᵀ). Hier ist det = (a−1)² ≥ 0, also ist das Volumen genau die Determinante.
- Scherung: Z₂ − t·Z₁ verschiebt die Spitze von Z₂ parallel zu Z₁, also parallel zur Grundfläche aus Z₁ und Z₃. Die Höhe bleibt, das Volumen auch (numerisch für t ∈ [0, 1] geprüft).
- a = 3: Zeilen (1,1,1), (1,3,1), (1,1,3), Volumen (3−1)² = 4. Nach beiden Schritten (1,1,1), (0,2,0), (0,0,2): Grundfläche 2 × 2 in der y-z-Ebene, Höhe 1 (x-Komponente von Z₁), 2 · 2 · 1 = 4.
- a von 3 bis −1: Die Seiten des Quadrats sind a−1, das Volumen ist (a−1)². Bei a = 1 ist es 0, bei a = −1 wieder 4.

## Bühne

Dunkler Glasboden, Raster, Licht, Staub wie im Orientierungs-Video. Die Welt ist so gedreht, dass die mathematische x-Achse nach oben zeigt und die y-z-Ebene der Boden ist. Z₁ cyan, Z₂ blau, Z₃ koralle, a amber, Körper helles Lavendel.

## Szenen

| Szene | Bild |
|---|---|
| Hook | Karte oben mit Badge MATHE 1 · KLAUSUR, Matrix, Frage. Darunter der Körper der Zeilen bei a = 3. Bei „a gleich eins“ rollen die a auf 1, die Pfeile fallen zu einem zusammen. Notiz „a = 1 ✗“, Frage „der einzige?“ |
| ① Umformen | Matrix groß. Einsen gleich gefärbt, a amber. Kopie von Zeile 1 gleitet über Zeile 2 bzw. 3, Spalten verschmelzen. Am Rand Z₂ − Z₁, Z₃ − Z₁. |
| ② Dreiecksmatrix | Nullen-Dreieck schattiert, Diagonale leuchtet, det A = 1·(a−1)·(a−1) = (a−1)² |
| ③ Antwort | invertierbar ⇔ det ≠ 0, (a−1)² = 0 ⇔ a = 1, Antwortfeld „a ≠ 1 ✓“ |
| Warum? | Raum. Kleine Matrix a = 3 oben. Volumen 4. Grundfläche, Höhe, Spitze gleitet. Danach Quadrat 2 × 2, Höhe 1, Diagonale fliegt an die Kanten |
| a → 1 | Zähler a von 3 bis −1, Quadrat schrumpft, Körper platt, wächst wieder |
| Merksatz | Karte zum Speichern |
| CTA | Logo, Suchfeld UniMathe |

## Sprechtext

> Mathe-eins-Klausur: Für welche a ist diese Matrix invertierbar?
> Bei a gleich eins sind alle drei Zeilen gleich. Dann ist sie sicher nicht invertierbar.
> Aber ist das der einzige Wert?
> Überall steht eins, nur auf der Diagonale steht a.
> Also ziehen wir die erste Zeile von den anderen ab. Das ändert die Determinante nicht.
> Eins minus eins: null. a minus eins bleibt. Und wieder null.
> Unten genauso.
> Jetzt ist es eine Dreiecksmatrix. Ihre Determinante ist das Produkt der Diagonale: a minus eins zum Quadrat.
> Invertierbar heißt: Determinante ungleich null. Und a minus eins zum Quadrat ist nur bei a gleich eins null.
> Also: invertierbar für alle a ungleich eins.
> Aber warum darf man Zeilen einfach abziehen?
> Jede Zeile ist ein Pfeil im Raum. Zusammen spannen sie einen Körper auf, und die Determinante ist hier sein Volumen.
> Für a gleich drei: drei minus eins zum Quadrat, also vier.
> Ziehst du eine Zeile ab, gleitet die Pfeilspitze parallel zur Grundfläche. Die Höhe bleibt gleich, also auch das Volumen.
> Genauso beim dritten Pfeil.
> Jetzt steht der Körper auf einem Quadrat, zwei mal zwei, und ist eins hoch. Genau die Diagonale.
> Jetzt läuft a gegen eins.
> Das Quadrat schrumpft zu einem Punkt, der Körper wird platt. Kein Volumen, keine Inverse.
> Nur bei a gleich eins verschwindet er.
> Für deine Klausur: erst Nullen erzeugen, dann die Diagonale multiplizieren.
> Mehr Klausuraufgaben? Such im App Store nach UniMathe.
