# Storyboard: Mathe 1 Klausuraufgabe – Bild und Urbild

## Status

- v1 gebaut am 2026-11-23 in `src/bu/` (88,3 s), Branch `video/bild-urbild-klausur`, am 2026-11-23 committet.
- Stimme: Chris, eleven_v4, 1 Take, 1.299 Credits (98,2 s roh, 50 Abschnitte).
- Im Stimmtext stehen „iks“, „Eff“ und „Teil A/B/C“.

## Format

9:16, 1080 × 1920, 60 fps, Deutsch. Altes dunkles Design. Text nur in y 300–1500 und x < 940.

## Aufgabe

f: ℝ → ℝ, f(x) = x² − 2x − 3. Bestimmen Sie:
- a) das Bild f([−1, 3])
- b) das Urbild f⁻¹([0, 5])
- c) die Bildmenge f(ℝ)

## Leitlinien (nach dem abgelehnten Verkettungs-Video)

- Eine Bühne: Die Parabel bleibt das ganze Video stehen. Die Kamera zoomt nur: Teil a hinein, Teil b zurück, Teil c hinaus.
- Jede Zahl wird erst gerechnet, dann gezeigt. In Teil b sind die x-Beschriftungen −2, −1, 3, 4 verborgen, bis die Rechnung sie liefert.
- Ein Rechenweg: die Scheitelform (x − 1)² − 4, hergeleitet am Anfang und danach in der Karte stehend.

## Mathematik

Auch im Code geprüft: `src/bu/fn.ts` wirft beim Laden, wenn etwas nicht stimmt. Geprüft werden die Scheitelform, die Werte, Bild und Urbild per Abtastung und die Urbilder 1 + √(y + 4).

- **Scheitelform:** x² − 2x − 3 = x² − 2x + 1 − 1 − 3 = (x − 1)² − 4. S(1 | −4).
- **a)**
  - f(−1) = 1 + 2 − 3 = 0 und f(3) = 9 − 6 − 3 = 0. Beide Ränder liefern nur die 0.
  - Der Scheitel liegt dazwischen: f(1) = 0² − 4 = −4.
  - Ergebnis: f([−1, 3]) = [−4, 0].
- **b)**
  - Ansatz: 0 ≤ (x−1)² − 4 ≤ 5, also │+4: 4 ≤ (x−1)² ≤ 9, also 2 ≤ |x − 1| ≤ 3.
  - Grenzen: 1 − 3 = −2, 1 − 2 = −1, 1 + 2 = 3, 1 + 3 = 4.
  - Ergebnis: f⁻¹([0, 5]) = [−2, −1] ∪ [3, 4].
- **c)**
  - (x − 1)² ≥ 0, also f(x) ≥ −4.
  - Zu jedem y ≥ −4 ist f(1 + √(y + 4)) = y.
  - Ergebnis: f(ℝ) = [−4, ∞).

## Farben

| Farbe | Bedeutung |
|---|---|
| Amber | x-Werte: [−1, 3], die gefundenen Urbild-Stücke, x = 1 |
| Cyan | Werte: Bild [−4, 0], [0, 5], [−4, ∞) |
| Weiß (lavendel getönt) | Parabel, Scheitel |
| Koralle | „nur die 0?“, „zu nah“, „zu weit“, Grenze −4 |
| Grün | Ergebnisrahmen, Chips ✓, Ergänzung +1 − 1, +4 |

## Szenen (Zeiten im Video)

| Zeit | Sprechtext | Bild |
|---|---|---|
| 0–1,7 | Mathe 1 Klausuraufgabe. | Die Karte steht mittig mit Aufgabe a) b) c). Gitter und Parabel laufen dahinter ein. |
| 2–7,4 | Gegeben ist diese Parabel. Gesucht: ein Bild, ein Urbild und die ganze Bildmenge. | Die Karte gleitet hoch, die Teilaufgaben fliegen in die Chips. Die Parabel liegt frei. |
| 7,8–16,6 | Zuerst die Scheitelform: plus eins, minus eins. So wird daraus x minus eins zum Quadrat, minus vier. Scheitel: eins, minus vier. | In der Rechenleiste erscheinen +1 und −1. x² − 2x + 1 verschmilzt zu (x − 1)², und −1 − 3 wird zu −4. Lote zeigen S(1 \| −4). Die Scheitelform wandert in die Karte. |
| 17,8–21 | Teil a: das Bild von minus eins bis drei. | Die Kamera zoomt auf den Bereich unter der x-Achse. Das amber Band [−1, 3] erscheint, oben f([−1, 3]) = ?. |
| 20,9–23 | Beim Bild starten wir bei den x-Werten. | f([−1, 3]) = { f(x) : x ∈ [−1, 3] }. |
| 23,2–30 | Links … also null. Rechts … auch null. | f(−1) = (−1)² − 2·(−1) − 3 → 1 + 2 − 3 → 0. Erst dann gehen die Punkte und Pfeile auf die 0 der y-Achse. Für f(3) genauso. |
| 30,2–33,6 | Die Ränder liefern nur die Null. Doch dazwischen liegt der Scheitel. | Ein koralle Ring an der 0 mit „nur die 0?“. f(1) = (1 − 1)² − 4 → −4, Lote zum Scheitel. |
| 33,9–38,4 | Der Punkt läuft den Bogen ab: hinunter bis minus vier und zurück auf null. | Ein amber Punkt läuft auf der x-Achse von −1 nach 3. Lote führen zur Kurve und waagrecht zur y-Achse. Die cyan Spur wächst bis −4 und bleibt stehen. |
| 38,7–40,7 | Das Bild: minus vier bis null. | f([−1, 3]) = [−4, 0] mit grünem Rahmen. Chip a ✓. |
| 41,3–49,5 | Teil b: das Urbild von null bis fünf. Gesucht sind alle x mit einem Wert zwischen null und fünf. Dafür braucht man keine Umkehrfunktion. | Die Kamera zoomt zurück. Das cyan Band [0, 5] und die Waagrechten y = 0 und y = 5 erscheinen. Oben f⁻¹([0, 5]) = { x : f(x) ∈ [0, 5] }. Notiz: „Urbild einer Menge – keine Umkehrfunktion nötig“. |
| 49,8–51,7 | Diesmal starten wir also bei den Werten. | Pfeile laufen von der y-Achse waagrecht zur Kurve. Die zwei Bögen im Streifen leuchten amber, Lote fallen zur x-Achse, an den Enden steht „?“. |
| 52,2–56,1 | Plus vier: x minus eins zum Quadrat liegt zwischen vier und neun. | 0 ≤ (x−1)² − 4 ≤ 5 → 0 + 4 ≤ (x−1)² ≤ 5 + 4 → 4 ≤ (x−1)² ≤ 9. |
| 56,8–59,7 | Also liegt x zwei bis drei von der Eins entfernt. | √4 ≤ \|x − 1\| ≤ √9 → 2 ≤ \|x − 1\| ≤ 3. Die Achse x = 1 und die Abstandsklammern 2 und 3 erscheinen, dazu koralle „zu nah“ und „zu weit“. |
| 60,3–64,4 | Links gibt das minus zwei bis minus eins, rechts drei bis vier. | Die „?“ werden zu 1 − 3 = −2, 1 − 2 = −1, 1 + 2 = 3, 1 + 3 = 4. Probepunkte liegen auf den Waagrechten. Die Bögen fallen als Projektion auf die x-Achse. |
| 64,8–67,1 | Ein Intervall oben, zwei Stücke unten. | Das cyan Band und die zwei amber Stücke leuchten. f⁻¹([0, 5]) = [−2, −1] ∪ [3, 4] mit grünem Rahmen. Chip b ✓. |
| 67,8–73,9 | Teil c: die ganze Bildmenge. Ein Quadrat ist nie negativ, also ist f mindestens minus vier. | (x−1)² ≥ 0 → (x−1)² − 4 ≥ 0 − 4 → f(x) ≥ −4. Koralle Grenze bei −4. |
| 74,3–76,4 | Nach oben wachsen die Arme unbegrenzt. | Die Kamera zoomt hinaus, die Arme bekommen Pfeilspitzen. Ein cyan Strahl wächst ab −4. Eine steigende Waagrechte trifft immer beide Arme. Notiz: y ≥ −4: f(1 + √(y + 4)) = y. |
| 77–79,4 | Das Bild: minus vier bis unendlich. | f(ℝ) = [−4, ∞) mit grünem Rahmen. Chip c ✓. |
| 79,9–84,3 | Bild: von x zu den Werten. Urbild: von den Werten zurück zu x. | Zusammenfassung mit den drei Ergebnissen. Darunter: „Bild: x → Werte“ und „Urbild: Werte → alle x“. |
| 84,8–88,3 | Mehr davon? Such im App Store nach UniMathe. | CTA wie üblich. |

## Technik

- `src/bu/fn.ts`: f, Scheitelform, Intervalle, Assertions.
- `src/bu/Stage.tsx`: SVG-Bühne mit Kamera `cam(t)`. Der Scheitel bleibt fest, x = 1 mittig. Dazu Teil a (laufender Punkt, Spur), Teil b (Streifen, Bögen, Projektion, Abstandsklammern) und Teil c (Grenze, Zoom, Strahl, Waagrechte).
- `src/bu/Video.tsx`: Karte mit Scheitelform, Chips, Rechenleiste (Zeile A Ziel, Zeile B Rechnung, beide Morph), Zusammenfassung, CTA, Ton.
- `src/bu/kit.tsx`: Morph aus `src/aeq`, zusätzlich Abstände für ≤ und ≥.
- `tools/music-bu.mjs` → `public/music-bu.wav`.
