# Storyboard: Mathe 1 Klausur – Inverse mit Gauß-Jordan

Status: Konzept B „Das Protokoll“ am 2026-11-14 freigegeben, altes (dunkles) Design wie `video/klausur-invertierbar`.
- Branch `video/klausur-inverse` (abgezweigt von `video/klausur-invertierbar`), Code in `src/inv/`.
- Stimme: `public/voice/inv-take1.mp3`, Chris, eleven_v4, 1.328 Credits, ein Take.
- Musik: `tools/music-inv.mjs` → `public/music-inv.wav`, übliches Schema wie music-kr.

Format: 9:16, 1080 × 1920, 60 fps, Deutsch. Text nur in y 300–1500 und x < 940.

## Aufgabe

A = (1 2 1; 0 1 1; 1 1 1). Berechne A⁻¹ mit dem Gauß-Jordan-Verfahren.

## Mathematik (mit Code geprüft)

| Schritt | Umformung | neue Zeile (A-Teil · I-Teil) |
|---|---|---|
| Start | – | Z₁ = (1 2 1 · 1 0 0), Z₂ = (0 1 1 · 0 1 0), Z₃ = (1 1 1 · 0 0 1) |
| ① | Z₃ ← Z₃ − Z₁ | (0 −1 0 · −1 0 1) |
| ② | Z₃ ← Z₃ + Z₂ | (0 0 1 · −1 1 1) |
| ③ | Z₂ ← Z₂ − Z₃ | (0 1 0 · 1 0 −1) |
| ④ | Z₁ ← Z₁ − Z₃ | (1 2 0 · 2 −1 −1) |
| ⑤ | Z₁ ← Z₁ − 2·Z₂ | (1 0 0 · 0 −1 1) |

- A⁻¹ = (0 −1 1; 1 0 −1; −1 1 1). A·A⁻¹ = A⁻¹·A = I (node).
- Warum: Jede Umformung ist Multiplikation mit einer Elementarmatrix von links. E = E₅E₄E₃E₂E₁ erfüllt E·A = I, also E = A⁻¹. Rechts steht E·I = E.
- Probe-Eintrag: (0, −1, 1)·(1, 0, 1) = 1.

## Layout

| Bereich | Inhalt |
|---|---|
| y 300–496 | Aufgabenkarte (bleibt stehen), Logo rechts oben |
| y 516–574 | Fortschritt: ① Ansatz ② Unten ③ Oben ④ Ablesen |
| y 640–1000 | (A \| I) groß, Spalten 6 × 128 px, Trennstrich |
| y 1060–1300 | Rechenbereich (schriftlich, Spalten bündig unter der Matrix) |
| y 1340–1400 | Protokoll: Chips der Umformungen |
| y 1446 | Untertitel |

## Ablauf

| Abschnitt | Bild |
|---|---|
| Hook | „Mathe-1-Klausur“: Karte mittig, gleitet hoch. A erscheint groß, rechts leerer Rahmen mit „?“. |
| Ziel | A⁻¹·A = I unter der Matrix. |
| Ansatz | I gleitet rechts neben A, Trennstrich, Pfeil „links → I“. |
| Unten | ① ausführlich (Spalte für Spalte mit der Stimme), ② zügig. Nullen unter der Diagonale treten zurück. |
| Oben | ③ ④ ⑤, ⑤ mit Zwischenzeile 2·Z₂. Links steht I. |
| Warum | Chips verschmelzen zu E. E·A = I ⇒ E = A⁻¹, E·I = E. Rechte Hälfte leuchtet, Etikett A⁻¹. |
| Probe | A⁻¹·A = I, Zeile 1 × Spalte 1 vorgerechnet, übrige Einträge folgen. |
| Merksatz | Drei Zeilen, dazu „Pivot ≠ 1? Zeile teilen.“ |
| CTA | Logo, UniMathe, Suchfeld. |

## Sprechtext

> Mathe-eins-Klausur: Berechne die Inverse dieser Matrix. Mit Gauß-Jordan – und die Lösung schreibt sich dabei rechts von selbst.
> Die Inverse macht A rückgängig: A hoch minus eins mal A ergibt die Einheitsmatrix I. Also schreiben wir A und I nebeneinander. Links bringen wir A mit Zeilenumformungen auf I. Und jede Umformung machen wir rechts genauso mit.
> Zuerst Nullen unter der Diagonale. In Zeile zwei steht schon eine. Also: dritte Zeile minus erste. Eins minus eins: null. Eins minus zwei: minus eins. Eins minus eins: null. Rechts genauso.
> Dann dritte Zeile plus zweite. Unten steht jetzt null, null, eins.
> Jetzt Nullen über der Diagonale, von unten nach oben. Zweite Zeile minus dritte. Erste Zeile minus dritte. Und erste Zeile minus zwei mal zweite. Links steht jetzt I.
> Und rechts? Jede Zeilenumformung ist eine Multiplikation mit einer Matrix von links. Alle fünf zusammen ergeben eine Matrix E, und E macht aus A die Einheitsmatrix. Also ist E gleich A hoch minus eins. Rechts haben wir E auf I angewendet, und E mal I ist E. Deshalb steht rechts die Inverse.
> Probe: A hoch minus eins mal A. Erste Zeile mal erste Spalte: null plus null plus eins, also eins. Insgesamt kommt I heraus.
> Für deine Klausur: A und I nebeneinander, links auf I bringen, rechts ablesen. Mehr Klausuraufgaben? Such im App Store nach UniMathe.
