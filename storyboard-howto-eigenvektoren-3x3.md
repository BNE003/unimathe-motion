# Storyboard: Mathe 1 – So geht's: Eigenvektoren einer 3×3-Matrix

Status: v1 in `src/hev/` (112,6 s), Branch `video/howto-eigenvektoren-3x3`, abgenommen (2026-11-12), committet und gepusht.
- Erstes Video der How-to-Serie „Mathe 1 – So geht's“. Ein Video statt zwei Teilen, 110–115 s freigegeben.
- Stimme: `public/voice/hev-take1.mp3`, Chris, eleven_v4, 1.416 Credits, 99,92 s, ein Take. 60 Sprechabschnitte, Pausen auf 0,4 s gekürzt, `EXTRA` in `src/hev/timeline.ts` verlängert dort, wo eine Animation läuft.
- Musik: `tools/music-hev.mjs` → `public/music-hev.wav` (übliche UniMathe-Musik wie music-kr: D-Moll, 92 BPM, Akzent je Kapitel, Dur ab der Rezeptkarte).
- Compositions: `HowTo-Eigenvektoren-3x3` und `HowTo-Eigenvektoren-3x3-ohneMusik`.

Format: 9:16, 1080 × 1920, 60 fps, Deutsch. Text nur in y 300–1500 und x < 940.

## Aufgabe

A = (2 1 0; 1 2 0; 0 0 3). Bestimme alle Eigenwerte, die Eigenräume und je eine Basis.

## Mathematik (mit node geprüft)

- det(A − λI) = (3 − λ)·[(2 − λ)² − 1] = (1 − λ)(3 − λ)², für sieben Testwerte gleich der direkt berechneten Determinante.
- λ = 1: A − I = (1 1 0; 1 1 0; 0 0 2). Z₂ − Z₁ = 0, Z₃ : 2, Nullzeile nach unten. Pivots in x und z, y frei. y = t: v = t·(−1, 1, 0). rang(A − I) = 2, dim E₁ = 1.
- λ = 3: A − 3I = (−1 1 0; 1 −1 0; 0 0 0). Z₂ + Z₁ = 0. Bleibt −x + y = 0, also x = y. Pivot nur in x, y und z frei. v = s·(1, 1, 0) + t·(0, 0, 1). rang(A − 3I) = 1, dim E₃ = 2.
- Probe: A·(−1, 1, 0) = (−1, 1, 0); A·(1, 1, 0) = 3·(1, 1, 0); A·(0, 0, 1) = 3·(0, 0, 1); auch (2, 2, 1) und (1, 1, −2) werden verdreifacht.
- E₁ ⟂ E₃ (A symmetrisch). E₃ ist die senkrechte Wand x = y, sie enthält die z-Achse.
- Allgemein: doppelter Eigenwert ⇒ 1 ≤ dim E ≤ 2; hier entscheidet Gauß (zwei freie Variablen).

## Serienformat „Mathe 1 – So geht's“

- Kopf: Logo (ab 3 s), Badge „MATHE 1 · SO GEHT'S“ in Mint, Thema, kleine Aufgabenmatrix oben rechts.
- Schrittleiste ① A − λI · ② det = 0 · ③ Gauß · ④ Basis; aktiver Schritt leuchtet, erledigte bekommen ✓. Darunter Ergebnisse (λ = 1, 3) und die Schleife „für jedes λ“.
- Regler: jede freie Variable ist ein Schieberegler, der Formel und Raum gleichzeitig steuert.
- Formelzeilen (`MagicRow` in `src/hev/kit.tsx`): Teile gleiten beim Umformen an ihren Platz; Breiten werden im Browser mit KaTeX gemessen.
- Rechenbereich: schriftliche Zeilenumformung unter der Matrix wie im Rang-Video.
- Farben: λ allgemein Amber, λ = 1 Cyan, λ = 3 Violett, zweiter Regler Pink, Serie Mint.
- Rezeptkarte am Ende (3,1 s stumm) zum Speichern, dann CTA.

## Szenen (Videozeit)

| Zeit | Bild |
|---|---|
| 0–7 | A groß, „Gesucht: alle Eigenwerte, die Eigenräume und je eine Basis“. Bei „vier Schritten“ baut sich die Leiste auf. |
| 7–19 | v, v ≠ 0, A·v = λ·v, λ·v gleitet nach links, (A − λI)·v = 0. λ fällt dreimal aus der Formel auf die Diagonale: 2 − λ, 2 − λ, 3 − λ. |
| 19–25 | Lösung v ≠ 0 ⇔ A − λI singulär ⇔ det(A − λI) = 0 im Kasten. |
| 25–42 | Zeile 3 leuchtet, Nullen treten zurück, „+“ an (3,3), Zeile 3 und Spalte 3 gestrichen, 2×2-Block mit Kreuzlinien. det = (3 − λ)·[(2 − λ)² − 1], Teile fliegen aus der Matrix. „Nicht ausmultiplizieren“, a² − b² mit a = 2 − λ, b = 1. = (1 − λ)(3 − λ)². λ₁ = 1, λ₂ = 3 doppelt, fliegen in die Leiste. |
| 42–64 | λ = 1: 2 − 1, 2 − 1, 3 − 1 → 1, 1, 2. Z₂ − Z₁ als schriftliche Rechnung, Z₃ : 2, Nullzeile nach unten, Pivot-Ringe, Gleichungen rechts. Spalte y „frei“, Regler t, v = (−t, t, 0) = t·(−1, 1, 0). |
| 64–68 | Raum: Regler fährt, der Pfeil zeichnet die Gerade E₁. E₁ = span{(−1, 1, 0)}, dim = 1. |
| 68–90 | λ = 3: 2 − 3, 2 − 3, 3 − 3 → −1, −1, 0. Z₂ + Z₁ = 0, −x + y = 0 → x = y. Spalten y und z frei, Regler s und t. v = (s, s, t) = s·(1, 1, 0) + t·(0, 0, 1). Einsen an der Stelle des eigenen Reglers leuchten: linear unabhängig. |
| 90–106 | Raum: s fährt (Linie), t fährt (Wand füllt sich), Zerlegung als gestrichelter Weg. E₃ = span{…}, dim = 2. A wirkt: drei Vektoren der Ebene ·3, der Vektor der Geraden ·1. „λ = 3 doppelt ⇒ dim E₃ = 1 oder 2“, „Gauß: zwei freie Variablen ⇒ dim E₃ = 2“. |
| 106–109 | Rezeptkarte. |
| 109–112,6 | CTA. |

## Sprechtext

> Eigenvektoren einer Drei-mal-drei-Matrix: Klausur-Standard. Hier ist das ganze Verfahren, in vier Schritten.
> Gesucht: v, nicht null, mit A mal v gleich Lambda mal v. Umgestellt: A minus Lambda I, mal v, gleich null. Lambda steht also nur auf der Diagonale.
> Eine Lösung außer null gibt es nur, wenn diese Matrix singulär ist, ihre Determinante also null.
> Entwickle nach der letzten Zeile: drei minus Lambda, mal zwei minus Lambda zum Quadrat, minus eins.
> Nicht ausmultiplizieren, dritte binomische Formel: eins minus Lambda, mal drei minus Lambda. Eigenwerte: eins, und drei, doppelt.
> Lambda gleich eins: Eins von der Diagonale abziehen, dann Gauß. Zeile zwei minus Zeile eins wird null, Zeile drei durch zwei.
> Spalte y hat kein Pivot, also ist y frei: ein Regler, den du beliebig wählst. y gleich t, dann x gleich minus t, z gleich null.
> Ein Regler, eine Richtung: eine Gerade.
> Lambda gleich drei: Zeile zwei plus Zeile eins wird null. Bleibt nur: x gleich y.
> Jetzt sind y und z frei, zwei Regler. Zerleg den Vektor nach ihnen: s mal eins, eins, null, plus t mal null, null, eins.
> Jeder hat seine Eins beim eigenen Regler: linear unabhängig.
> Zwei Regler, zwei Richtungen: Der Eigenraum ist eine Ebene. Jeder Vektor darin, außer null, wird von A nur verdreifacht.
> Ein doppelter Eigenwert kann so eine Ebene liefern, muss aber nicht. Das entscheidet Gauß.
> Such im App Store nach UniMathe.
