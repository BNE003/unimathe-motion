# Storyboard: Mathe 1 Klausuraufgabe – Äquivalenzrelation 3 ∣ (a − b)

## Status

- v1 gebaut am 2026-11-20 in `src/aeq/` (107,3 s), Branch `video/aequivalenzrelation-klausur`, abgenommen am 2026-11-21.
- Stimme: Chris, eleven_v4, 1 Take, 1.339 Credits (99,6 s roh, 49 Abschnitte).
- Im Stimmtext stehen die Buchstaben groß („A“, „B“, „C“, „K“, „L“), „3k“ heißt „drei mal K“.

## Format

9:16, 1080 × 1920, 60 fps, Deutsch. Altes dunkles Design. Text nur in y 300–1500 und x < 940.

## Aufgabe

Auf ℤ gilt a ∼ b ⟺ 3 ∣ (a − b).

- a) Zeigen Sie, dass ∼ eine Äquivalenzrelation ist.
- b) Bestimmen Sie alle verschiedenen Äquivalenzklassen.

## Mathematik

Auch im Code geprüft: `Line.tsx` wirft, wenn Klassen oder Restkriterium nicht stimmen.

- **Reflexiv:** a − a = 0 = 3 · 0.
- **Symmetrisch:**
  - a − b = 3k mit k ∈ ℤ.
  - Mal (−1): b − a = −3k = 3(−k).
  - −k ∈ ℤ, also b ∼ a.
- **Transitiv:**
  - a − b = 3k und b − c = 3l.
  - Addition: (a − b) + (b − c) = 3k + 3l.
  - −b und +b heben sich auf: a − c = 3(k + l).
  - k + l ∈ ℤ, also a ∼ c.
- **Klassen:**
  - [0] = {…, −6, −3, 0, 3, 6, …}
  - [1] = {…, −5, −2, 1, 4, 7, …}
  - [2] = {…, −4, −1, 2, 5, 8, …}
  - ℤ/∼ = {[0], [1], [2]}
  - a ∼ b gilt genau dann, wenn a und b bei Division durch 3 denselben Rest haben.

## Bildidee: Dreiersprünge auf der Zahlengeraden

„3 teilt a − b“ heißt: Von a kommt man in Sprüngen der Länge 3 zu b.

- **Reflexiv:** Schleife, 0 Sprünge.
- **Symmetrisch:** Die Sprünge laufen rückwärts.
- **Transitiv:** Die Sprünge hängen sich aneinander. b dimmt, sobald sich −b und +b aufheben.
- **Klassen:** Sprünge von 0, 1 und 2 aus färben jede Zahl genau einmal.

## Farben

| Farbe | Bedeutung |
|---|---|
| Amber | die 3, die Vielfachen 3k und 3l, Sprünge; Klasse [0] |
| Cyan | ∼ und Relationspfeile (gestrichelt = noch zu zeigen); Klasse [1] |
| Violett `#B78CFF` | Klasse [2] |
| Koralle | ·(−1), −k, Streichung von −b + b |
| Grün | Ergebnisrahmen, ✓ |

## Szenen (Zeiten im Video)

| Zeit | Sprechtext | Bild |
|---|---|---|
| 0–1,7 | Mathe-eins-Klausuraufgabe. | Die Karte steht mittig: „Auf ℤ sei“, a ∼ b ⟺ 3 ∣ (a − b), a), b). |
| 2,1–8 | Auf den ganzen Zahlen gilt: A steht in Relation zu B, wenn drei A minus B teilt. | Die Karte gleitet nach oben (300–500). a) und b) fliegen in die Chips „Äquivalenzrelation“ und „Klassen“. ∼ und 3 ∣ leuchten. |
| 8–12,5 | Zeige: Das ist eine Äquivalenzrelation. Und bestimme alle Klassen. | Die Chips leuchten nacheinander. |
| 12,8–17,6 | Drei teilt A minus B heißt: A minus B ist ein Vielfaches von drei. | Die Zahlengerade zeichnet sich. a, b, ein cyan Pfeil a → b, zwei amber Dreiersprünge, darunter die Klammer „a − b = 3k“. |
| 18,1–22,5 | Teil A: Äquivalenzrelation heißt reflexiv, symmetrisch und transitiv. | Chip a teilt sich in drei Chips. |
| 23,7–31 | Reflexiv … A minus A ist null, und null ist drei mal null. | Schleife an a. Zeile a ∼ a ⟺ 3 ∣ (a − a), daraus wird 3 ∣ 0. Darunter 0 = 3 · 0. Grüner Rahmen. |
| 31,6–46,5 | Symmetrisch … Mal minus eins … Minus K ist wieder eine ganze Zahl. | a − b = 3k, k ∈ ℤ, dann „│·(−1)“. b und a tauschen im Bogen, ein korallenes Minus entsteht, dann 3(−k). Auf der Geraden laufen die Sprünge rückwärts, die Klammer zeigt b − a = −3k. Unten: −k ∈ ℤ ⇒ b ∼ a, grüner Rahmen. |
| 47,1–65,5 | Transitiv … Wir addieren. Minus B und plus B heben sich auf. Es bleibt … | Zwei Zeilen am „=“ ausgerichtet. Sie fließen zusammen zu (a − b) + (b − c) = 3k + 3l. −b und +b werden koralle und gestrichen, b auf der Geraden dimmt. Es bleibt a − c = 3(k + l), die Klammern verschmelzen. Unten: k + l ∈ ℤ ⇒ a ∼ c, grüner Rahmen. |
| 66,3–69 | Alle drei gelten: Das ist eine Äquivalenzrelation. | Die drei Chips fließen zu „Äquivalenzrelation Ja ✓“, kurzer Blitz. |
| 70,3–74 | Teil B: Die Klasse einer Zahl … | Die Gerade weitet sich auf −6 … 8 mit Zahlen. Darunter [a] = {b ∈ ℤ : b ∼ a}. |
| 75,3–80 | Wir starten bei null … Das ist die Klasse der Null. | Amber Sprünge von 0 aus, dann sinken die Zahlen in Reihe [0] und behalten ihre x-Position. |
| 80,8–86 | Die Eins ist noch frei … Dann die Zwei. | Dasselbe in Cyan von 1 aus und in Violett von 2 aus. |
| 86,2–88,7 | Und die Drei? Die liegt schon in der Klasse der Null. | Sprünge von 3 aus landen auf amber Zahlen, „[3] = [0]“. |
| 89,4–97,2 | Jede Zahl landet in genau einer Klasse … Also gibt es genau drei Äquivalenzklassen. | Unter der Geraden erscheinen die Reste 0 1 2 0 1 2 … Die Reihen rücken zu Mengen zusammen, darunter ℤ/∼ = {[0], [1], [2]} mit grünem Rahmen. Chip b: „3 Klassen ✓“. |
| 98,5–102,5 | Reflexiv, symmetrisch, transitiv, und genau drei Klassen. | Zusammenfassung. |
| 103,5–107,3 | Mehr davon? Such im App Store nach UniMathe. | CTA wie üblich. |

## Technik

- `src/aeq/kit.tsx`: `Morph` aus `src/abb/kit.tsx`, neu mit mehrzeiligen Zuständen (`rows`).
- `src/aeq/Line.tsx`: Zahlengerade, Sprünge, Relationspfeile, Klammern und Klassen-Tokens (Gerade → Reihe → Mengenzeile).
- `src/aeq/Video.tsx`: Karte, Chips, Beweise, Zusammenfassung, CTA.
- `src/aeq/timeline.ts`: Zeiten aus der Aufnahme.
- `tools/music-aeq.mjs` → `public/music-aeq.wav`.
