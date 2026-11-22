# Storyboard: Mathe 1 einfach erklärt – Injektiv, surjektiv, bijektiv

## Status

- v1 gebaut am 2026-11-22 in `src/ise/` (67,9 s), Branch `video/injektiv-surjektiv-bijektiv`, abgenommen am 2026-11-23.
- Erstes Video der Serie „Mathe 1 einfach erklärt“, Intro-Komponente `src/series/EinfachErklaert.tsx`.
- Stimme: Chris, eleven_v4, 1 Take, 957 Credits (72,0 s roh, 40 Abschnitte, Pausen im Video gekürzt).

## Format

9:16, 1080 × 1920, 60 fps, Deutsch. Dunkles Design. Text nur in y 300–1500.

## Farben

| Farbe | Bedeutung |
|---|---|
| Cyan | Definitionsmenge, x-Achse, x-Werte |
| Amber | Zielmenge, y-Achse; Umkehrpfeile |
| Lavendel/Weiß | Pfeile der Abbildung, Parabel, „erreicht“ |
| Koralle | Ziel doppelt getroffen, Ziel leer, kein Treffer |
| Grün | ✓ |

## Mathematik

Auch im Code geprüft:
- `Diagram.tsx` berechnet injektiv und surjektiv aus jeder Zuordnung und wirft bei Abweichung. Es prüft auch die Umkehrung.
- `Graph.tsx` prüft f(±2) = 4, dass die Parabel im Band bleibt, und Urbilder für y ≥ 0.

| Zuordnung | Eigenschaft |
|---|---|
| {1→A, 2→C, 3→D} | injektiv, nicht surjektiv |
| {1→A, 2→C, 3→C} | weder noch |
| {1→A, 2→C, 3→C, 4→B, 5→D} | surjektiv, nicht injektiv |
| {1→A, 2→C, 4→B, 5→D} | bijektiv, Umkehrung A→1, B→4, C→2, D→5 |

Für x²:
- **ℝ → ℝ:** weder injektiv (f(−2) = f(2) = 4) noch surjektiv (keine negativen Werte).
- **ℝ → [0, ∞):** surjektiv.
- **[0, ∞) → [0, ∞):** bijektiv.

## Szenen (Zeiten im Video)

| Zeit | Sprechtext | Bild |
|---|---|---|
| 0–4,3 | Mathe 1 einfach erklärt: Injektiv, surjektiv, bijektiv. | Ab Frame 0: Mengen {1, 2, 3} und {A, B, C, D}. Pfeile schießen und schwenken, bei 1,8 s treffen zwei Pfeile C (koralle, „2×“), B und D bleiben leer. Serienzeile, Titelwörter im Takt. |
| 4,3–6,9 | Links die Definitionsmenge, rechts die Zielmenge. | Die Titelwörter fliegen in die Status-Chips. Die Mengennamen erscheinen. |
| 7,8–13 | Injektiv … Ein Ziel darf leer bleiben. | Pfeil 3 schwenkt zurück auf D, Chip injektiv ✓. f(a) = f(b) ⇒ a = b. „leer: erlaubt“ an B. |
| 13,3–16 | Zeigen zwei Pfeile auf dasselbe Ziel: nicht injektiv. | Pfeil 3 schwenkt auf C, koralle „2×“, Chip injektiv ✗. |
| 16,8–26,5 | Surjektiv … Hier bleiben B und D leer. Zwei neue Elemente füllen die Lücken … | Chip surjektiv ✗, B und D mit koralle Ringen. 4 und 5 kommen dazu, ihre Pfeile treffen B und D. Chip surjektiv ✓, injektiv ✗. |
| 26,9–31,9 | Bijektiv heißt beides … Die Reihenfolge ist egal. | 3 löst sich auf: 1→A, 2→C, 4→B, 5→D, alle Chips ✓. Die gekreuzten Pfeile leuchten. |
| 32,3–35,2 | Und jeder Pfeil lässt sich umdrehen: die Umkehrfunktion. | Lichtpunkte laufen zurück, amber Spitzen an der Quelle, f⁻¹. |
| 35,2–38,8 | Jetzt x Quadrat, von R nach R. | Die linke Menge wird zum cyan Band auf der x-Achse, die rechte zum amber Band auf der y-Achse. Parabel, Formel f: ℝ → ℝ, f(x) = x². |
| 39,6–42,8 | Minus zwei und zwei landen beide auf vier: nicht injektiv. | −2 und 2, Lote, zwei Pfeile auf 4, koralle „2×“. |
| 43,4–46,3 | Negative Werte erreicht die Parabel nie: nicht surjektiv. | Lavendel „erreicht“ ab 0, koralle Bereich „kein Treffer“ unter 0. |
| 47,2–50 | Jetzt ändern wir nur die Zielmenge: ab null. | Das amber Band wird unten bis 0 geschnitten, ℝ → [0, ∞) in der Formel. |
| 50,6–53,8 | Gleiche Parabel, und jeder Wert wird getroffen: surjektiv. | Die Parabel pulsiert unverändert, eine Waagrechte prüft jede Höhe. Chip surjektiv ✓. |
| 54,4–57,8 | Nehmen wir links auch nur x ab null, ist f bijektiv. | Das cyan Band wird links bis 0 geschnitten, der linke Ast und −2 verschwinden. Der Pfeil auf 4 wird grün. Alle Chips ✓. |
| 58,3–63,9 | Injektiv: kein Ziel doppelt. Surjektiv: kein Ziel leer. Bijektiv: beides. | Zusammenfassung mit drei Zeilen. |
| 64,3–67,9 | Mehr davon? Such im App Store nach UniMathe. | CTA. |

## Technik

- `src/series/EinfachErklaert.tsx`: Serienzeile ab Frame 0, Titelwörter mit Cue-Zeiten, optionaler Flug in Zielpunkte. Nach Abnahme nach `main`.
- `src/ise/Diagram.tsx`: Zuordnungs-Zustände, schwenkende Pfeile, berechnete Eigenschaften, Umkehrung, Übergang der Mengen in die Achsen-Bänder.
- `src/ise/Graph.tsx`: Gitter, Bänder, Parabel, Schnitte der Ziel- und Definitionsmenge.
- `src/ise/Video.tsx`: Chips, Formeln, Zusammenfassung, CTA.
- `src/ise/kit.tsx`: Morph aus `src/aeq`.
- `tools/music-ise.mjs` → `public/music-ise.wav`.
