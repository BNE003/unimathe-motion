# UniMathe · „Die Matrix, die eine Dimension löscht“ · Storyboard v1 (Entwurf zur Freigabe)

**Status:** freigegeben und gebaut in `src/det/` (Branch `video/determinante`), gerendert als `out/determinante-mit-musik.mp4` und `-ohne-musik.mp4` (31,2 s). Stimme: 1 Take, 515 Credits, roh in `public/voice/det-take1-raw.mp3` (34,4 s). Mit `tools/tighten.mjs` sind sechs Pausen gekürzt und das Tempo ist ×1,08, Ergebnis `det-take1.mp3` (30,3 s). Musik kommt aus `tools/music-det.mjs`.

Format: 9:16 · 1080×1920 · 60 fps · **ca. 30 s** (Sprechtext 73 Wörter ≈ 28–31 s)
Stil: Serien-Look „Dark Swiss“ (Hintergrund #07081A), aber deutlich mehr Bewegung: Die Ebene ist ein leuchtendes Kunstwerk, das sich die ganze Zeit verformt.
Stimme: ElevenLabs eleven_v4, Chris (iir30Q1pQmHS1AgZ2mNe), 1 Take
Neuer Ansatz: kurz, kein Erklärfolien-Look, ein einziger Gedanke: **Determinante = Flächenfaktor. Null heißt: Fläche weg, also Dimension weg.**

## Das visuelle Motiv: die Sonnenblume in der Ebene

- Ein Koordinatengitter, darauf eine Sonnenblumen-Spirale aus ca. 1.500 leuchtenden Punkten (Phyllotaxis, goldener Winkel 137,5°). Die Farbe läuft von innen nach außen: Indigo → Blau → Cyan → Amber.
- Das Einheitsquadrat leuchtet amber gefüllt. Die beiden Basispfeile sind ê₁ in Amber und ê₂ in Cyan.
- Jede Matrix wirkt live auf alles: Gitter, Spirale, Quadrat. Nichts wird „ausgetauscht“, alles wird wirklich mit der Matrix gerechnet.
- Beim Kollaps stapeln sich alle Punkte auf einer Linie. Wo viele übereinanderliegen, wird es heller (additive Überblendung). Dadurch entsteht ein gleißender Strich.
- Im Bild links oben steht ein kleiner Chip **2D**, der im Moment des Kollapses zu **1D** umspringt. So versteht man das Video auch ohne Ton.

## Mathematik (fix, alles aus Code)

- Start: Einheitsmatrix, Quadrat mit Fläche 1.
- **A = (2 1 ; 1 2)**, Spalten (2, 1) und (1, 2), det A = 2·2 − 1·1 = **3**.
  - Übergang I → A linear: M(s) = (1−s)·I + s·A. Dann ist det M(s) = (1+s)² − s² = 1 + 2s. Die Determinante steigt also monoton von 1 auf 3, ohne Umklappen.
- **Kippen:** Nur der rechte untere Eintrag ändert sich, y: 2 → ½. Die Matrix ist dabei (2 1 ; 1 y).
  - det = 2y − 1, das ergibt 3 → 2 → 1 → 0 bei y = 2; 1,5; 1; ½. Die Zahlen im Sprechtext („drei, zwei, eins, null“) liegen genau auf diesen y-Werten.
- **A₀ = (2 1 ; 1 ½)**, det A₀ = 2·½ − 1·1 = **0**.
  - Die Spalten (2, 1) und (1, ½) = ½·(2, 1) sind parallel. Das Bild der ganzen Ebene ist die Gerade y = x/2.
- **Kein Zurück:** A₀·(1, −2) = (0, 0). Alle Punkte einer Geraden p + t·(1, −2) landen auf demselben Punkt A₀p. Deshalb gibt es keine Umkehrmatrix.
- **Hook nutzt dieselbe Matrix A₀**, Übergang I → A₀ linear. Dabei ist det M(s) = 1 + 0,5s − 1,5s², also positiv auf [0, 1) und erst bei s = 1 gleich null. Kein Umklappen, nur Zusammendrücken.
- Anzeige mit deutschem Komma: „det = 3,00“.

## Sprechtext (73 Wörter, 1 Take)

| # | Text | Bild |
|---|------|------|
| 1 | Diese Matrix lässt eine ganze Dimension verschwinden. | Kollaps der Spirale |
| 2 | Aber wie? | Zurückspulen |
| 3 | Ein Quadrat. Fläche eins. | Quadrat leuchtet |
| 4 | Die Matrix verzerrt es – die Fläche wird dreimal so groß. | I → A |
| 5 | Genau dieser Faktor ist die Determinante. | Zähler „det = 3,00“ |
| 6 | Jetzt kippt eine Seite auf die andere zu. Drei … zwei … eins … | Zähler läuft runter |
| 7 | null. | Kollaps |
| 8 | Keine Fläche mehr. Die ganze Ebene liegt auf einer Linie. | Totale auf die Linie |
| 9 | Und zurück geht’s nie mehr: Ganze Linien landen auf einem Punkt. | Kern-Geraden |
| 10 | Mehr Aha-Momente und Klausurübungen: Such im App Store nach UniMathe. | Logo |

## Storyboard und Timing

### S1 · Hook (0,0–3,0 s)

- **Erster Frame:** Die Sonnenblume steht schon voll leuchtend im Bild, leicht schräg, die Kamera schwebt langsam heran. Oben rechts ist klein die Matrix (2 1 ; 1 ½) eingeblendet, links oben der Chip „2D“.
- **0,3 s:** Die Ebene wird zusammengedrückt. Gitterlinien laufen zusammen, die Spirale wird flach.
- **1,8 s:** Alles liegt auf einer Linie, es gibt einen Lichtblitz und eine feine Druckwelle. Der Chip springt auf „1D“.
- **Text groß:** „Eine Dimension. Weg.“
- **Ton:** dumpfer Impact (collapse), danach kurz Stille.
- **Stimme:** 1, dann 2.

### S2 · Zurückspulen und Quadrat (3,0–5,5 s)

- Die Linie springt rückwärts auf: Die Ebene entfaltet sich in 0,8 s wieder (Rewind-Effekt mit leichtem Bewegungsverwischen, Ton: Whoosh rückwärts).
- Die Kamera fährt auf das Einheitsquadrat. Es leuchtet amber auf.
- **Text:** „Fläche 1“
- **Stimme:** 3.

### S3 · Verzerren (5,5–11,0 s)

- Die Matrix wandert von I nach A = (2 1 ; 1 2). Das Quadrat wird zum Parallelogramm, die Spirale zu einer gedehnten, gedrehten Blüte.
- Die Kamera zieht mit, damit das Parallelogramm groß im Bild bleibt.
- Unten erscheint der Zähler **det = 1,00**. Er läuft synchron zur Fläche auf **3,00**, und im Parallelogramm steht „Fläche 3“.
- Bei „Determinante“ leuchtet der Zähler kurz auf (Ton: Akzent). Sonst steht keine Formel im Bild.
- **Stimme:** 4, 5.

### S4 · Kippen (11,0–17,5 s)

- Der Cyan-Pfeil (2. Spalte) kippt auf den Amber-Pfeil zu. In der Matrix ändert sich sichtbar nur eine Zahl: 2 → ½.
- Das Parallelogramm wird immer flacher, die Blüte immer dünner. Der Zähler läuft 3,00 → 0,00.
- Bei jeder ganzen Zahl gibt es einen leisen Tick. Der Musik-Drone sinkt mit der Determinante in der Tonhöhe.
- Die Kamera rotiert langsam, sodass die Linie am Ende diagonal durchs Bild läuft.
- **Stimme:** 6, Zahlen synchron zum Zähler.

### S5 · Aha (17,5–21,5 s)

- **Bei „null“:** derselbe Kollaps wie im Hook (Match Cut zum Anfang), jetzt mit Verständnis. Die Pfeile liegen aufeinander, das Quadrat ist ein Strich, der Chip springt auf „1D“.
- **Kamera:** großer Zug zurück. Die ganze Ebene ist ein einziger leuchtender Strich.
- **Text:** „det = 0 → Fläche 0 → eine Dimension weg“
- **Stimme:** 7, 8.

### S6 · Kein Zurück (21,5–25,5 s)

- Die Kamera fährt nah an die Linie. Ein Geisterbild der Ebene zeigt drei schräge Geraden aus Punkten, Richtung (1, −2).
- Jede Gerade schnurrt auf einen einzigen Punkt der Linie zusammen.
- **Text:** „∞ Punkte → 1 Punkt · keine Umkehrung“
- **Stimme:** 9.

### S7 · CTA (25,5–30,5 s)

- Der leuchtende Strich zieht sich zu einem Lichtpunkt zusammen. An seiner Stelle blendet das **Original-Logo** weich ein, unverändert, nur Einblendung und Skalierung.
- Darunter steht „UniMathe“ und „Im App Store suchen“. Die Spirale baut sich dahinter ganz leise wieder auf.
- **Ton:** Swell.
- **Stimme:** 10.

## Bildaufbau und Safe Areas

```
 y 0–220      frei (Plattform-Statusleiste, Suchleiste)
 y 230–330    Schlagwort-Text (groß, max. 4 Wörter) · Chip 2D/1D links
 y 360–1400   BÜHNE: Ebene mit Spirale, Gitter, Quadrat, Pfeile
 y 1180–1300  det-Zähler + kleine Matrix (S3–S5)
 y ~1560      Untertitel (dezent wie in Teil 2: 32 px, halbtransparente Fläche)
 ab y 1640    frei für Plattform-UI (Caption, Buttons)
 x > 940      rechts keine wichtigen Inhalte (Like-/Share-Leiste)
```

## Sound

- **Musik:** synthetischer, ruhiger Puls aus `tools/audio.mjs`, an die Szenenzeiten gekoppelt. In S4 steigt die Spannung, bei „null“ setzt die Musik 0,4 s aus, danach kommt ein weicher Ausklang.
- **Effekte** aus dem bestehenden Satz: collapse (S1, S5), whoosh (S2), tick (S4), accent (S3), swell (S7).
- Der Drone folgt in S4 der Determinante (die Tonhöhe sinkt mit ihr).

## Kosten

- Stimme: 1 Take ≈ 450 Zeichen ≈ **ca. 450 Credits ≈ 0,15 €**. Die genaue Zahl lese ich vor dem Erzeugen ab und melde sie.
- Musik und Effekte werden aus Code erzeugt und kosten nichts.

## Offene Punkte

- Habt ihr einen echten App-Screen zur Determinante? Dann zeige ich ihn im CTA ca. 2 s im Fenster, unverändert, nur Ausschnitt und Zoom. Ohne Screen bleibt der CTA reines Logo, kein erfundenes UI.
