# Storyboard: Warum ist AB ≠ BA?

Status: freigegeben am 2026-11-05 und gebaut in `src/ab/` (49,2 s). Branch `video/matrix-reihenfolge`. Stimme: 1 Take, 632 Credits (44,2 s, ohne Pausen-Tags erzeugt), 5 eingefügte Pausen für Animationen.

Format: 9:16, 1080 × 1920, 60 fps, Deutsch, Ziel 45–50 s.
Testet ein kurzes, rein visuelles Format: kaum Formeln, keine Aufgabenkarte, jede Szene ist Bewegung.

## Idee in einem Satz

Erst sieht man es an einem Gegenstand (ein 3D-„F“ kippen und drehen: andere Reihenfolge, andere Lage), dann versteht man es an der Ebene. Die Streckung zieht immer waagerecht, und die Reihenfolge entscheidet, was gerade waagerecht liegt.

**Warum ein F:** Das F hat keine Symmetrie. Jede Lage ist auf einen Blick lesbar („liegt auf dem Gesicht“, „steht auf der Seite“), auch für Leute ohne Mathe.

## Mathematik (geprüft)

**3D-Hook:** Drehungen um feste Raumachsen (z = senkrecht, x = waagerecht quer zur Kamera), je 90°.

Das F steht anfangs in der xz-Ebene, die Vorderseite zeigt zur Kamera (−y).

- Kippen nach vorne: Rx(90°).
- Drehen zur Seite: Rz(90°).
- Erst kippen, dann drehen: Rz·Rx = (0 0 1; 1 0 0; 0 1 0).
  - Die Vorderseite zeigt nach unten (0,0,−1), das F liegt auf dem Gesicht.
- Erst drehen, dann kippen: Rx·Rz = (0 −1 0; 0 0 −1; 1 0 0).
  - Die Vorderseite zeigt zur Seite (1,0,0), oben zeigt zur Kamera, das F steht hochkant auf der Seite.
- Ergebnis: Rz·Rx ≠ Rx·Rz, deutlich andere Lagen.
  - Rz·Rx ist eine 120°-Drehung um (1,1,1). Deshalb darf die Figur keine Dreh-Symmetrie haben, und das F hat keine.

**2D-Teil:**

- A = Drehung um 90° = (0 −1; 1 0).
- B = waagerechte Streckung ×2 = (2 0; 0 1).
- AB = (0 −1; 2 0), also erst B, dann A.
  - Spalten: e₁ → (0, 2), e₂ → (−1, 0).
- BA = (0 −2; 1 0), also erst A, dann B.
  - Spalten: e₁ → (0, 1), e₂ → (−2, 0).
- AB ≠ BA. Lesart: AB·x = A(B·x), man liest von rechts nach links.

**Was mit dem F passiert** (F ist 3 Einheiten breit und 4 hoch):

- AB: erst 6 breit und 4 hoch, dann gedreht, also 4 breit und 6 hoch.
- BA: erst gedreht (4 breit, 3 hoch, liegt quer), dann gestreckt, also 8 breit und 3 hoch.

## Bildsprache

- **Look:** UniMathe-Farben aus src/theme.ts.
  - Dunkles Blau-Schwarz als Hintergrund.
  - F-Vorderseite amber, Seiten indigo/blau, Rückseite cyan. So sieht man sofort, ob das F „auf dem Gesicht“ liegt.
  - Coral für ≠ und für die Zugrichtung von B.
  - e₁ amber, e₂ cyan.
- **3D:** eigene Projektion (src/space.ts) auf Canvas.
  - Würfelflächen mit Licht und Tiefensortierung, leuchtende Kanten.
  - Bewegungsunschärfe über Unterframes, wie im Determinanten-Video.
  - Keine neuen Abhängigkeiten.
- **Kamera:** nie stillstehend.
  - Langsame Orbit-Drift, große Schwenks an den Schnittstellen.
  - Höhepunkt: der Sturzflug von der 3D-Szene senkrecht auf den Boden, wo das Bodengitter zur Ebene wird.
- **Safe Areas:**
  - Alles Wichtige liegt zwischen y 300 und 1440 und bei x < 940.
  - Untertitel dezent bei y ≈ 1440–1500.
  - Oben (Suchleiste) und unten (Bedienelemente) bleiben frei.

## Szenen und Zeitplan (grob)

### S1 · Hook „Gleiche Bewegungen“ (0–6,5 s)

Das erste Bild ist schon in Bewegung, es gibt keine Titelkarte.

1. Die Kamera fliegt von schräg oben auf ein großes 3D-F herunter, darunter blendet ein leuchtendes Bodengitter auf.
2. „Kipp dieses F nach vorne“: Die waagerechte Achse leuchtet mit Bogenpfeil, das F kippt 90° und liegt auf dem Gesicht.
3. „dann dreh es zur Seite“: Die senkrechte Achse leuchtet, das F dreht 90°.
4. „Und jetzt andersrum.“: Rechts daneben erscheint ein zweites F in der Startlage und macht dieselben Bewegungen in umgekehrter Reihenfolge.
5. „Gleiche Bewegungen. Völlig anderes Ergebnis.“:
   - Die Kamera umkreist beide Fs um etwa 40°: das eine liegt auf dem Gesicht, das andere steht hochkant.
   - Ein Coral-„≠“ erscheint dazwischen, mit Schlag und kurzem Lichtblitz.
   - Kleine Pills über den Fs: „kippen → drehen“ und „drehen → kippen“.

### S2 · Brücke „AB ≠ BA“ (6,5–12 s)

1. „Genau deshalb ist A mal B nicht B mal A.“: Groß „A·B ≠ B·A“ über den beiden Fs, mit Parallaxe zur Kamera.
2. „Denn jede Matrix bewegt den ganzen Raum.“:
   - Nicht nur das F, sondern das ganze Raumgitter schwingt einmal mit.
   - Danach der Sturzflug: Die Kamera kippt auf senkrecht von oben und taucht ins Bodengitter.
   - Die 3D-Fs lösen sich auf, übrig bleibt ein flaches F auf der Ebene mit e₁ und e₂.

### S3 · Die zwei Bewegungen (12–17 s)

Die Ebene ist leicht schräg im Raum, die Kamera driftet.

1. „A dreht um neunzig Grad.“:
   - Das ganze Gitter dreht sich mit F und Pfeilen.
   - Ein Chip zeigt „A“ mit Drehpfeil, dann spult das Bild schnell zurück.
2. „B zieht alles in die Breite.“:
   - Das Gitter wird waagerecht auf das Doppelte gezogen, Coral-Zuggriffe links und rechts.
   - Chip „B ↔“, dann zurückspulen.

### S4 · Das Duell (17–26 s)

Die Ebene teilt sich in zwei schwebende Platten übereinander, jede leicht im Raum gekippt, mit Parallaxe.

- **Oben:** „A·B: erst B, dann A“, mit einem kleinen Pfeil unter „AB“, der von rechts nach links zeigt („von rechts lesen“).
- **Unten:** „B·A: erst A, dann B“.

1. „Erst B, dann A: Das F wird breit, dann gedreht.“: Die obere Platte spielt ab.
2. „Erst A, dann B: Das F liegt schon quer und wird richtig lang.“: Die untere Platte spielt ab.
3. Ende der Szene: oben ein hohes gedrehtes F (4 × 6), unten ein langes flaches F (8 × 3).

### S5 · Aha (26–33 s)

1. „Denn B zieht immer waagerecht.“:
   - Auf beiden Platten fließen Coral-Zuglinien waagerecht durch das ganze Gitter.
   - Der B-Schritt läuft auf beiden Platten gleichzeitig noch einmal als Geist ab.
2. „Die Reihenfolge entscheidet, was gerade waagerecht liegt.“:
   - Oben leuchten die Querbalken des F auf, sie werden gezogen.
   - Unten leuchtet der Längsbalken (Rücken) des F auf, er liegt waagerecht und wird gezogen.
   - Das ist der Kern.
3. „Andere Pfeile, andere Zahlen in der Matrix.“:
   - Beide Platten drehen sich flach zur Kamera, e₁ und e₂ zeigen ihre Spitzen.
   - Die Koordinaten fliegen als Spalten in die Matrizen AB = (0 −1; 2 0) und BA = (0 −2; 1 0).
   - Dazwischen steht ein Coral-„≠“.

### S6 · Rückschluss (33–37 s)

„Matrizen sind Bewegungen. Und bei Bewegungen zählt die Reihenfolge.“

- Das flache F wächst wieder zum 3D-F.
- Die Kamera zieht in großem Bogen zurück, die beiden Fs aus dem Hook stehen wieder in ihren verschiedenen Lagen.
- Alles löst sich in Licht auf und geht ins Outro über.

### S7 · App (37–48 s)

„Mehr davon, zum Verstehen und Üben: Such im App Store nach UniMathe.“

- Originales Logo (public/unimathe-logo.webp, nur skaliert und eingeblendet).
- Ruhige Zeile „Mathe verstehen. Für die Klausur üben.“
- Suchfeld, in das „UniMathe“ getippt wird, darunter „Im App Store suchen“. Aufbau wie in den bisherigen Videos, zurückhaltend.

## Sprechtext komplett

Stimme Chris (iir30Q1pQmHS1AgZ2mNe), eleven_v4, 1 Take, sympathisch, eher zügig. Insgesamt 631 Zeichen, 110 Wörter.

> Kipp dieses F nach vorne – dann dreh es zur Seite. Und jetzt andersrum. Gleiche Bewegungen. Völlig anderes Ergebnis.
> Genau deshalb ist A mal B nicht B mal A. Denn jede Matrix bewegt den ganzen Raum.
> A dreht um neunzig Grad. B zieht alles in die Breite.
> Erst B, dann A: Das F wird breit, dann gedreht. Erst A, dann B: Das F liegt schon quer und wird richtig lang.
> Denn B zieht immer waagerecht. Die Reihenfolge entscheidet, was gerade waagerecht liegt. Andere Pfeile, andere Zahlen in der Matrix.
> Matrizen sind Bewegungen. Und bei Bewegungen zählt die Reihenfolge.
> Mehr davon, zum Verstehen und Üben: Such im App Store nach UniMathe.

## Ton

**Musik:** eigener Synth-Track (tools/music-ab.mjs), treibender Puls.

- Kurzer Drop bei „Völlig anderes Ergebnis“.
- Ruhiger in S3.
- Spannungsaufbau im Duell, Auflösung beim Aha.
- Weich ins Outro.

**Effekte:**

- Whoosh und dumpfer Aufschlag bei jedem Kippen und Drehen.
- Schlag beim ≠.
- Riser beim Sturzflug.
- Gedehnter „Zug“-Ton bei B.
- Ticks bei den Pfeilspitzen, „Lock“ bei den Matrizen.

Untertitel sind dezent (zwei Zeilen max., Schlüsselwörter farbig) und entfallen im CTA.

## Kosten

- Etwa 630 Credits (631 Zeichen, eleven_v4, 1 Take), ca. 0,23 $ ≈ 0,20 €.
- Wird die Stimme länger als ~48 s, kürze ich nur Pausen. Es gibt dann keine neue Erzeugung.
