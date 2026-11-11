# Storyboard: Mathe 1 Klausur – Rang und Invertierbarkeit

Status: v3 in `src/kr/` (101 s), Branch `video/klausur-rang`, am 2026-11-11 abgenommen.
- v1 (95,8 s) bekam Feedback: alles zu schnell, bei den Zeilenumformungen lagen Zahlen übereinander, die Fallunterscheidung stand zu kurz.
- v2 (130,4 s) hatte deutlich längere Pausen, die Zeilenumformungen liefen als schriftliche Subtraktion unter der Matrix, und die Fallunterscheidung stand etwa 7 s. Feedback: jetzt zu langsam, „normale Geschwindigkeit wie die letzten Videos“.
- v3: Pausen wieder wie in den letzten Videos (Standard 0,32 s), die schriftliche Subtraktion bleibt, läuft aber schneller. Die Fallunterscheidung steht etwa 4 s.
- Stimme: `public/voice/kr-take1.mp3`, Chris, eleven_v4, 1.343 Credits, 94,24 s, ein Take.
- Musik: `tools/music-kr.mjs` → `public/music-kr.wav`.

Format: 9:16, 1080 × 1920, 60 fps, Deutsch. Text nur in y 300–1500 und x < 940.

## Aufgabe

A(a) = (1 2 1; 2 5 3; 1 3 a), a ∈ ℝ.

- a) Bestimme den Rang in Abhängigkeit von a.
- b) Für welche a ist A(a) invertierbar?

## Mathematik (mit Code geprüft)

- Z₂ ← Z₂ − 2Z₁: (2, 5, 3) − (2, 4, 2) = (0, 1, 1).
- Z₃ ← Z₃ − Z₁: (1, 3, a) − (1, 2, 1) = (0, 1, a−1).
- Z₃ ← Z₃ − Z₂: (0, 1, a−1) − (0, 1, 1) = (0, 0, a−2).
- rang A = 3 für a ≠ 2, rang A = 2 für a = 2. Invertierbar ⇔ voller Rang ⇔ a ≠ 2 (det = a − 2).
- Hook-Werte: det A(0) = −2, det A(5) = 3, det A(−3) = −5, alle invertierbar.
- Raum:
  - Z₁ und Z₂ spannen die Ebene x − y + z = 0 auf (Normale Z₁ × Z₂ = (1, −1, 1)).
  - Die Höhe über der Ebene, in z-Richtung gemessen, ist h(v) = x − y + z.
  - Gauß-Schritte addieren nur Vektoren der Ebene, h bleibt also gleich: h(1, 3, a) = a − 2 = h(0, 0, a − 2).
  - Achtung: Das ist die Höhe in z-Richtung, nicht der senkrechte Abstand zur Ebene ((a−2)/√3). Im Text heißt es deshalb „gleich hoch über der Ebene“.
- Würfel:
  - [−0,6; 0,6]³ wird mit A(2) abgebildet und landet in derselben Ebene, weil A symmetrisch ist (Spalten = Zeilen).
  - Die Ecken ±(0,6; −0,6; 0,6) liegen auf der Kernrichtung (1, −1, 1): A(2)·(1, −1, 1) = 0, also landen beide in 0.

## Szenen

Die Zeiten in der Tabelle stammen aus v1. In v3 ergeben sie sich aus `GAP` in `src/kr/timeline.ts`.

| Abschnitt | Szene | Bild |
|---|---|---|
| 0–10,7 | Hook | Karte oben (Badge, kleine Aufgabenmatrix, a) und b)). Große Matrix. Im Eintrag a läuft ein Zählrad: 0 ✓, 5 ✓, −3 ✓, dann dreht es und bleibt bei „?“ in rotem Rahmen stehen. |
| 10,7–18,5 | Strategie | Zeilenpunkte leuchten, „Rang = Anzahl Zeilen, die Neues beitragen“, gestrichelte Ziel-Treppe. |
| Gauß | Gauß | Pivot-Ring um die Eins oben links. Jede Umformung als schriftliche Subtraktion im Rechenbereich (y 1150–1340), Spalten genau unter den Matrixspalten. Erst rutscht die Zielzeile als Kopie nach unten, dann die abzuziehende Zeile (bei Z₂ − 2Z₁ mit ·2: 1 2 1 → 2 4 2). Dann folgen der Strich und das Ergebnis Spalte für Spalte mit der Stimme. Zuletzt fliegt das Ergebnis in die Matrix: Die alte Zeile wird leer, der neue Wert erscheint bei der Landung. In der Matrix liegen nie zwei Zahlen übereinander. |
| 41,5–52,3 | Treppe und Fälle | Treppe, Pivot-Ringe ① ② und ein gestrichelter Ring um a−2. a = 5: 5−2 wird 3, ③, Rang 3. a = 2: 2−2 wird 0, die Zeile wird grau, Rang 2. Fallunterscheidung, a) ✓. |
| 52,3–75,5 | Raum | Kleine Matrix (live) und a = 5. Ebene mit Raster, Pfeile Z₁, Z₂, Z₃. Z₂ gleitet in der Ebene nach (0, 1, 1). Z₃ gleitet zweimal parallel, die Höhenlinie behält ihre Länge. Am Ende ist Z₃ = (0, 0, a−2), senkrecht. a läuft von 5 auf 2, der Pfeil schrumpft auf 0, Lichtblitz, „Rang 2“. |
| 75,5–88 | Invertierbar | Punktwürfel wird mit A(2) platt gedrückt, zwei amberfarbene Ecken landen in 0. Hinweis zur Symmetrie. Antwortfeld: invertierbar ⇔ rang A = 3 ⇔ a ≠ 2 ✓, b) ✓. |
| 88–91,4 | Merksatz | Vier Zeilen zum Speichern. |
| 91,4–95,8 | CTA | Logo, „UniMathe“, Suchfeld im App Store. |

## Sprechtext

> Mathe-eins-Klausur. Diese Matrix ist fast immer invertierbar: für a gleich null, fünf, minus drei. Aber bei genau einem Wert nicht. Findest du ihn?
> Erst der Rang. Er zählt, wie viele Zeilen wirklich etwas Neues beitragen. Ablesen kann man ihn in Stufenform – also Gauß.
> Das Pivot einer Zeile ist ihr erster Eintrag ungleich null, hier die Eins oben links. Darunter brauchen wir Nullen.
> Zeile zwei minus zweimal Zeile eins: null, eins, eins.
> Zeile drei minus Zeile eins: null, eins, a minus eins.
> Neues Pivot: die Eins in der Mitte. Zeile drei minus Zeile zwei: null, null – und a minus zwei.
> Der Rang ist die Zahl der Pivots. Für a ungleich zwei sind es drei. Bei a gleich zwei wird die letzte Zeile komplett null: Rang zwei.
> Warum gerade zwei? Die Zeilen sind Pfeile im Raum, die ersten beiden spannen eine Ebene auf. Jeder Gauß-Schritt schiebt einen Pfeil nur parallel zu dieser Ebene. Deshalb ändert sich der Rang nicht. Der dritte Pfeil bleibt immer gleich hoch über der Ebene – am Ende zeigt er gerade nach oben, genau a minus zwei lang. Bei a gleich zwei schrumpft er auf null. Keine neue Richtung.
> Dann drückt A den ganzen Raum in diese Ebene. Zwei Ecken dieses Würfels landen am selben Punkt – zurück geht es nicht. Invertierbar heißt: voller Rang. Also genau für a ungleich zwei.
> Mehr Klausuraufgaben: Such im App Store nach UniMathe.

## Kamera im Raum

- Blick von der Seite oberhalb der Ebene: θ ≈ 30°, φ ≈ 34–46°, fw · n ≈ 0,37.
- Z₁ und Z₂ stehen im Bild etwa 16° auseinander, obwohl sie im Raum nur 6,6° auseinanderliegen.
- Beim Würfel zoomt die Kamera heraus und zielt auf (0,7; 1,8; 1,1), weil die vordere Ecke sonst durch die Perspektive aus dem Bild ragt.
