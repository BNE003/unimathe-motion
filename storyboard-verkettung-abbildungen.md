# Storyboard: Mathe 1 Klausuraufgabe – Verkettung von Abbildungen

## Status

- **v1** (2026-11-23, 96,5 s, Commit f60e3a1) abgelehnt.
  - Werte ohne sichtbare Rechnung.
  - Maschinen-Kästen sahen nach KI aus.
  - Graph-Verformung unverständlich.
  - Abgehackte Sätze „Nicht injektiv. Nicht surjektiv.“
- **v2** (2026-11-23, 97,1 s), neue Stimme vk-take2.mp3 (1.376 Credits, 96,4 s roh, 41 Abschnitte). Die Sätze mit x kommen aus vk-take3-x.mp3 (404 Credits, „X“ statt „iks“, das wie „ix“ klang). Fazit des Nutzers: auch v2 zu durcheinander. Ohne Abnahme committet.
  - Keine Kästen. Die Rechnung steht Zeile für Zeile am Gleichheitszeichen ausgerichtet, Ergebnisse sind doppelt unterstrichen.
  - Jedes Einsetzen ist sichtbar, zum Beispiel f(x²) = 2x² + 3 und g(2x+3) = (2x+3)².
  - Ausmultiplizieren „jeder mit jedem“ mit vier Bögen.
  - Teil b mit je einem Graphen und gerechneten Werten.
  - Sprechtext in ganzen Sätzen.

## v2: Ablauf

| Zeit | Sprechtext | Bild |
|---|---|---|
| 0–8 | Mathe 1 Klausuraufgabe. Gegeben sind f und g. Gesucht … | Die Karte steht mittig, gleitet hoch, Chips a b c. |
| 8,8–12,8 | Teil a. f nach g heißt: erst g, dann f. | (f∘g)(x) = f(g(x)), unter g „1.“, unter f „2.“. |
| 12,6–18,6 | Probieren wir minus eins … Das gibt fünf. | (f∘g)(−1) = f(g(−1)). Nebenrechnung g(−1) = (−1)² = 1, daraus f(1). Dann f(1) = 2·1 + 3 = 5, daraus (f∘g)(−1) = 5. |
| 19,2–25,5 | Allgemein liefert g x², und f macht daraus 2x² + 3. | g(x) = x², f(g(x)) wird zu f(x²). Die Regel f(x) = 2x + 3 wird zu f(x²) = 2x² + 3. Ergebnis unterstrichen. |
| 25,6–34,6 | g nach f … Quadriert bleibt das eins. | (g∘f)(x) = g(f(x)) mit „1./2.“. (g∘f)(−1): f(−1) = 2·(−1) + 3 → −2 + 3 → 1, dann g(1) = 1² = 1. |
| 35,1–39,2 | Allgemein liefert f 2x + 3, und g quadriert das Ganze. | f(x) = 2x + 3, also g(2x+3). Die Regel g(x) = x² wird zu g(2x+3) = (2x+3)². |
| 40,2–44,6 | Jeder mit jedem multipliziert … | (2x+3)² = (2x+3)·(2x+3). Vier Bögen ergeben 4x², 6x, 6x, 9, daraus 4x² + 12x + 9. Ergebnis unterstrichen. |
| 45,3–48,9 | Einmal fünf, einmal eins: Die Reihenfolge ändert das Ergebnis. | 5 und 1 werden koralle, darunter f∘g ≠ g∘f. |
| 50,1–62,6 | Teil b. Bei f nach g … Sie ist auch nicht surjektiv. | Graph 2x² + 3. Gerechnet: (f∘g)(1) = 2·1² + 3 = 5, also (f∘g)(−1) = (f∘g)(1) = 5. Zwei Lote auf die 5. Dann x² ≥ 0, also 2x² + 3 ≥ 3, darunter koralle „nie unter 3“. |
| 62,9–74,7 | Genauso bei g nach f … keine von beiden bijektiv. | Graph (2x+3)². Gerechnet: (g∘f)(−2) = (2·(−2)+3)² = (−1)² = 1. Lote von −2 und −1 auf die 1. (2x+3)² ≥ 0, darunter „nie negativ“. |
| 75,7–81,7 | Teil c. f ist eine Gerade mit Steigung zwei … umkehrbar. | Gerade f mit Steigungsdreieck 1/2. Eine Waagrechte hat immer genau einen Schnittpunkt. |
| 82,2–89,3 | Wir lösen nach x auf … | y = 2x + 3 │−3 → y − 3 = 2x │:2 → (y−3)/2 = x → f⁻¹(x) = (x−3)/2, unterstrichen. |
| 90,2–95,8 | Mehr davon? … | Zusammenfassung, dann CTA. |

## v1 (abgelehnt)

## Format

9:16, 1080 × 1920, 60 fps, Deutsch. Altes dunkles Design. Text nur in y 300–1500 und x < 940.

## Aufgabe

f, g: ℝ → ℝ mit f(x) = 2x + 3 und g(x) = x².

- a) Bestimmen Sie f∘g und g∘f.
- b) Untersuchen Sie beide Verkettungen auf Injektivität, Surjektivität und Bijektivität.
- c) Bestimmen Sie die Umkehrfunktion von f.

## Mathematik

Auch im Code geprüft: `src/vk/fn.ts` wirft beim Laden, wenn etwas nicht stimmt.

- (f∘g)(x) = f(x²) = 2x² + 3, Scheitel (0 | 3), Bild [3, ∞).
- (g∘f)(x) = (2x + 3)² = 4x² + 12x + 9 = 4(x + 1,5)², Scheitel (−1,5 | 0), Bild [0, ∞).
- Nicht injektiv:
  - (f∘g)(−1) = (f∘g)(1) = 5
  - (g∘f)(−1) = (g∘f)(−2) = 1
- Nicht surjektiv: Die Zielmenge ist ℝ, das Bild nicht. Also ist keine der beiden bijektiv.
- f ist bijektiv: y = 2x + 3 ⇔ x = (y − 3)/2, für jedes y genau ein x. f⁻¹(x) = (x − 3)/2.
- **Zahl, die durch alle Teile läuft: x = −1.**
  - f∘g: −1 → 1 → 5
  - g∘f: −1 → 1 → 1
  - f: −1 → −2 → 1 und zurück 1 → −2 → −1

## Farben

| Farbe | Bedeutung |
|---|---|
| Amber | f, Graph von f∘g (zuletzt wirkt f) |
| Cyan | g, Graph von g∘f (zuletzt wirkt g) |
| Grau gestrichelt | Grundparabel x² |
| Koralle | ≠, „2ד, nie erreichte Werte, „Nein“ |
| Grün | Ergebnisrahmen, ✓ |

## Szenen (Zeiten im Video)

| Zeit | Sprechtext | Bild |
|---|---|---|
| 0–1,9 | Mathe 1 Klausuraufgabe. | Die Karte steht mittig: f, g, a) b) c). |
| 2,2–9 | Gegeben sind f und g. Gesucht: beide Verkettungen, ihre Eigenschaften und f hoch minus eins. | Die Karte gleitet hoch, a) b) c) fliegen in die Chips. |
| 9,2–13 | Teil a. f nach g heißt: erst g, dann f. | (f∘g)(x) = f(g(x)). Unter g „1.“, unter f „2.“, dazu ein Pfeil von rechts nach links. Maschinen g und f erscheinen. |
| 13,1–15,3 | Minus eins wird zu eins, dann zu fünf. | Ein Lichtpunkt läuft −1 → g → 1 → f → 5. |
| 15,8–20,6 | Allgemein: x Quadrat in f eingesetzt gibt zwei x Quadrat plus drei. | g(x) wird zu x², daraus wird 2x² + 3. Grüner Rahmen. |
| 21,5–23,8 | g nach f heißt: erst f, dann g. | Die Boxen fliegen getauscht in die zweite Zeile. (g∘f)(x) = g(f(x)) mit „1./2.“. |
| 24,4–26,8 | Minus eins wird zu eins, und bleibt eins. | −1 → f → 1 → g → 1. |
| 27,2–33,5 | Allgemein wird zwei x plus drei quadriert: vier x Quadrat plus zwölf x plus neun. | g(2x+3) → (2x+3)² → (2x)² + 2·2x·3 + 3² (binomische Formel) → 4x² + 12x + 9. Grüner Rahmen. |
| 34,3–36,5 | Andere Reihenfolge, anderes Ergebnis. | Die Ausgänge 5 und 1 werden koralle, f∘g ≠ g∘f. Chip a ✓. |
| 37,8–42,9 | Bei f nach g wirkt f auf die Werte: mal zwei, plus drei. | Gitter und Grundparabel x². Die amber Kopie wird senkrecht ·2 gestreckt und um +3 gehoben, Punkte mit Spuren nach oben. Scheitel (0 \| 3). |
| 43,1–48,8 | Bei g nach f wirkt f vorher auf die Eingaben: Die Parabel wird schmaler und rutscht nach links. | Die x-Achse leuchtet. Die cyan Kopie rückt waagrecht auf halbe Breite und 1,5 nach links, Scheitel (−1,5 \| 0). Eine Senkrechte bei −1 zeigt 5 und 1. |
| 49,4–52 | Teil b. Die Zielmenge ist jeweils R. | Die ganze y-Achse wird zum Streifen „Zielmenge ℝ“. |
| 52,2–58 | f nach g: minus eins und eins landen auf fünf. Nicht injektiv. Unter drei kommt nichts an. Nicht surjektiv. | Lote und Pfeile auf 5, „2ד. Bild-Streifen ab 3, darunter koralle „nie erreicht“. „inj ✗“, „surj ✗“. |
| 59,4–65,6 | g nach f: minus eins und minus zwei landen auf eins. Nicht injektiv. Negative Werte fehlen. Nicht surjektiv. | Bögen von −2 und −1 auf 1, „2ד. Bild-Streifen ab 0, darunter koralle. |
| 66,8–68,2 | Also ist keine bijektiv. | Tabelle mit sechs „Nein“, „Bild ≠ Zielmenge ℝ“. Chip b ✓. |
| 69,6–75,4 | Teil c. f ist eine Gerade mit Steigung zwei, trifft jeden Wert genau einmal und ist bijektiv. | Gerade y = 2x + 3 mit Steigungsdreieck 1/2. Eine Waagrechte läuft hoch und hat immer genau einen grünen Schnittpunkt. „bijektiv ✓“. |
| 75,9–80,8 | f rechnet mal zwei, dann plus drei. Rückwärts: minus drei, dann durch zwei. | Maschine −1 → ×2 → −2 → +3 → 1. Die Pfeile drehen sich um, die Boxen kippen zu −3 und ÷2, und der Lichtpunkt läuft zurück zur −1. Darunter y = 2x + 3 → y − 3 = 2x → (y − 3)/2 = x. |
| 81,6–86,4 | Umgestellt: f hoch minus eins von x gleich x minus drei, durch zwei. | x = (y − 3)/2, „für jedes y genau ein x“, dann f⁻¹(x) = (x − 3)/2 mit grünem Rahmen. Chip c ✓. |
| 87,3–91,1 | Die Reihenfolge zählt, keine Verkettung ist injektiv oder surjektiv, und f ist umkehrbar. | Zusammenfassung. |
| 91,7–96,5 | Mehr davon? Such im App Store nach UniMathe. | CTA wie üblich. |

## Technik

- `src/vk/fn.ts`: Funktionen, Verkettungen, f⁻¹, Assertions.
- `src/vk/Machines.tsx`: Maschinenzeilen (Teil a und c), Lichtpunkt, Umkehr der Boxen.
- `src/vk/Graph.tsx`: Gitter, parametrische Verformung der Grundparabel, Teil b (Lote, Bögen, Bild-Streifen, Legende), Gerade mit Waagrechter.
- `src/vk/Video.tsx`: Karte, Chips, Formel-Morphs, Tabelle, Umstellen, Zusammenfassung, CTA, Ton.
- `src/vk/kit.tsx`: Morph aus `src/aeq`.
- `tools/music-vk.mjs` → `public/music-vk.wav`. Stille bei „f∘g ≠ g∘f“, Dur ab „bijektiv“ in Teil c.
