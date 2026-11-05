# UniMathe · Klausuraufgabe „Schnitt zweier Untervektorräume“ · Storyboard v1 (Entwurf zur Freigabe)

**Status:** freigegeben am 2026-11-04 und gebaut in `src/ks/` (108,7 s). Stimme: 1 Take, 1.446 Credits (100,5 s), 5 eingefügte Pausen für Animationen.

Format: 9:16 · 1080×1920 · 60 fps · Ziel 1:40–1:50 (Sprechtext 217 Wörter, 1.454 Zeichen; das Basis-Video hatte 210 Wörter → 100 s Stimme, 107 s Video). Erwartet: ca. 103 s Stimme + ca. 5 s eingefügte Pausen → **ca. 1:47–1:50**
Stil: „Dark Swiss“ wie die Serie, 3D-Bühne aus dem Basis-Video weiterentwickelt
Stimme: ElevenLabs eleven_v4, Chris (iir30Q1pQmHS1AgZ2mNe), 1 Take
Branch: `video/klausur-schnitt` (von main), Code später in `src/ks/`. Die 3D-Bausteine aus `src/kb/` (nur auf dem Branch video/klausur-basis) kopiere ich in den neuen Ordner, damit das Basis-Video unberührt bleibt.

## Idee: ein Rätsel, das erst die letzte Zeile auflöst

**Hook „2 + 2 = 3?“:**
- Beide Ebenen haben Dimension 2. Zusammen also 4? Der ℝ³ hat aber nur 3.
- Diese Frage steht ab Sekunde 3 im Raum und bleibt offen. Als kleines „?“ wartet sie an Schritt ③ der Fortschrittsleiste.
- Aufgelöst wird sie erst ganz am Ende mit der Dimensionsformel: Die Schnittgerade wäre doppelt gezählt.
- So hat man bis Teil 3 einen Grund zu bleiben. Die Frage ist keine Deko, sie ist genau Aufgabe 3.

**Übernommen aus den erfolgreichen Klausurvideos:**
- Die Aufgabe bleibt immer sichtbar.
- Fortschrittsleiste ① ② ③.
- Ein Rechenschritt pro Satz, und jede Zeile bleibt stehen.
- Eingesetzte Terme fliegen sichtbar an ihre neue Stelle.
- Pausen nach jedem Teilschritt.

**Neu für die Zuschauerbindung:**
- **Erst das Bild, dann die Rechnung:**
  - Bevor gerechnet wird, sieht man die beiden Ebenen im Raum und ihre leuchtende Schnittgerade, also das Ergebnis, das die Rechnung gleich liefert.
  - Während der Rechnung läuft unten ein Punkt auf genau dieser Geraden mit, sobald t frei ist.
- **Zwei Kamerafahrten mit Bedeutung:**
  1. Bei der Probe blickt die Kamera entlang der Schnittgeraden. Beide Ebenen werden zu Strichen, die sich in einem Punkt kreuzen. Man sieht: Die Gerade liegt in beiden.
  2. In Teil 3 fliegt die Kamera zurück. Aus den drei Richtungen w, u, v füllt sich der ganze Raum mit einem Gitter: U + V = ℝ³.
- **Aha-Moment (Teil 3):**
  - Unter U stehen die Richtungen [w][u], unter V die Richtungen [w][v].
  - Die beiden w-Kärtchen gleiten aufeinander und verschmelzen mit einem Lichtblitz zu einem.
  - Übrig bleiben 3 Richtungen. Die Formel 2 + 2 − 1 = 3 entsteht direkt aus dieser Bewegung.
- **Bewegungswechsel ungefähr alle 4–6 s:** neue Zeile, Flug, Kamera, Kärtchen. Es gibt keine statische Phase, die länger als ca. 6 s dauert.

## Mathematik (geprüft, alles aus Code)

U = {(x, y, z) ∈ ℝ³ | x + y + z = 0}, V = {(x, y, z) ∈ ℝ³ | x − y + 2z = 0}

**Teil 1: Schnitt**

(x, y, z) ∈ U ∩ V genau dann, wenn beide Gleichungen gelten:
```
I    x + y +  z = 0
II   x − y + 2z = 0
```
- II − I: −2y + z = 0, also z = 2y.
- In I eingesetzt: x + y + 2y = 0, also x = −3y.
- y ist frei, setze y = t: (x, y, z) = (−3t, t, 2t) = t · (−3, 1, 2).
- U ∩ V = span{w} mit w = (−3, 1, 2)ᵀ.
- Probe:
  - In U: −3 + 1 + 2 = 0 ✓
  - In V: −3 − 1 + 4 = 0 ✓

**Teil 2: Basis und Dimension**
- w ≠ 0 ist linear unabhängig und spannt U ∩ V auf.
- **Basis {(−3, 1, 2)ᵀ}, dim(U ∩ V) = 1.** Geometrisch ist das eine Gerade durch den Ursprung.

**Teil 3: Dimension der Summe**
- dim U = dim V = 2. Jede ist die Lösungsmenge einer Gleichung (≠ 0) in 3 Unbekannten, also bleiben 2 Variablen frei.
- Dimensionsformel: dim(U + V) = dim U + dim V − dim(U ∩ V) = 2 + 2 − 1 = **3**.
- U + V ⊆ ℝ³ mit Dimension 3, also **U + V = ℝ³**.

Kontrollen (nicht im Video):
- Kreuzprodukt der Normalen: (1, 1, 1) × (1, −1, 2) = (3, −1, −2) = −w ✓
- Die beiden Normalen sind nicht parallel. Die Ebenen sind also verschieden und schneiden sich in einer Geraden.
- Hilfsrichtungen für die 3D-Bühne:
  - u = (1, −5, 4) ∈ U, v = (−4, −8, −2) ∈ V, beide senkrecht zu w.
  - det(w, u, v) = −196 ≠ 0. Damit spannen w, u, v wirklich den ℝ³ auf, so wie es das Gitter am Ende zeigt.
  - Koordinaten von u und v erscheinen nicht im Video, nur als Pfeile.

## Bildaufbau und Safe Areas

Im letzten Video lag die Karte bei y 160 und wurde von der TikTok-Suchleiste verdeckt. Neue Grenzen für Text und Formeln, für alle drei Plattformen:

| Zone | Bereich | Was dort liegt |
|---|---|---|
| oben | y 0–280 | **nichts Wichtiges**: TikTok-Reiter und Suchleiste, Reels- und Shorts-Kopfzeile. Nur Hintergrund oder 3D. |
| unten | ab y 1520 | **nichts Wichtiges**: Bildunterschrift, Musikzeile, Shorts-Abo-Leiste. Nur 3D-Ausläufer. |
| rechts | x > 940 (zwischen y 900 und 1700) | frei für die Like-, Kommentar- und Teilen-Leiste |
| links | x < 60 | Rand |

**Hook (0–12 s): Karte mittig.**
- Die vollständige Aufgabenkarte steht von Frame 1 an groß in der Mitte des sichtbaren Bereichs, ca. y 560–1100, mit Formeln ca. 50 px.
- Sie ist eine dunkle Glasfläche mit Unschärfe dahinter. Hinter ihr schneiden sich die beiden Ebenen durch das ganze Bild, damit sofort 3D zu sehen ist.
- Unter der Karte (y 1140–1380) erscheint das Rätsel „2 + 2 = 4 ?“.

**Ab „Die Lösung in drei Schritten“: Die Karte gleitet nach oben.**
- Die Bewegung dauert ca. 1,2 s, sanft abgebremst. Sie schrumpft dabei auf die kompakte Form.
- Danach gilt dieses Raster:
```
 y 300–560   AUFGABENKARTE (kompakt): U = {… | x + y + z = 0}   V = {… | x − y + 2z = 0}
             ① Basis von U ∩ V   ② dim(U ∩ V)   ③ dim(U + V)   → werden nacheinander durch die Antworten ersetzt
 y 580–630   FORTSCHRITT: ① Schnitt  ② Basis & Dim.  ③ U + V   (③ trägt bis zum Ende ein kleines „?“)
 y 660–1180  ARBEITSFLÄCHE: Rechnung, Formeln ≈ 46–50 px
 y 1180–1500 3D-BÜHNE (beim Rechnen gedimmt; beim Bild, bei der Probe und in ③ groß, dann bis y 660 hinauf)
 y 1440–1500 UNTERTITEL, dezent, mit dunkler Pille. Höher als bisher (bisher y ≈ 1600, das lag in der TikTok-Bildunterschrift).
```

**Farbcode**, durchgehend gleich in Karte, Rechnung und 3D:
- U, Gleichung I, Richtung u: Amber
- V, Gleichung II, Richtung v: Cyan
- Schnittgerade U ∩ V, Vektor w, Parameter t: Koralle
- Ergebnis und ✓: Weiß

## Szenen

Die Zeiten sind geschätzt. Die endgültigen Zeiten kommen aus der Stimme.

### S1 · Hook (0–12 s)
**Bild:**
- Frame 1:
  - Aufgabenkarte groß und mittig, sofort lesbar: „Klausuraufgabe · Lineare Algebra“, U, V und die drei Teilfragen.
  - Dahinter drehen sich zwei große halbtransparente Ebenen (Amber, Cyan) langsam.
  - Ihre Schnittkante glimmt koralle.
- „U und V“: Die beiden Zeilen der Karte leuchten nacheinander in ihrer Ebenenfarbe auf, und die passende Ebene dahinter auch.
- „Jede hat Dimension zwei“: Unter der Karte erscheinen „dim U = 2“ (Amber) und „dim V = 2“ (Cyan).
- „Zusammen also vier?“: Die beiden Kärtchen gleiten zusammen zu „2 + 2 = 4 ?“.
- „nur drei“:
  - Daneben erscheint „dim ℝ³ = 3“.
  - Die 4 flackert rot, und es kommt ein kurzer dumpfer Ton.
- „Wo ist eine Dimension geblieben?“: Stille, das „?“ pulsiert.
- „Die Lösung in drei Schritten“:
  - Die Karte gleitet nach oben und wird kompakt.
  - Die Fortschrittsleiste baut sich auf.
  - Das Rätsel schrumpft zu einem kleinen „?“ und fliegt an Schritt ③.

> Klausuraufgabe: zwei Ebenen im Raum, U und V. [pause] Jede hat Dimension zwei. Zusammen also vier? [pause] Der Raum hat aber nur drei. Wo ist eine Dimension geblieben? [long pause] Die Lösung in drei Schritten. [long pause]

### S2 · Erst das Bild (12–20 s)
**Bild:**
- Die 3D-Bühne wird groß.
- Die Kamera kreist um die beiden Ebenen.
- Die Schnittgerade zeichnet sich von der Mitte nach außen als leuchtende Linie, Beschriftung „U ∩ V“.

> Erst das Bild: Zwei verschiedene Ebenen durch den Ursprung schneiden sich in einer Geraden. [pause] Das ist U geschnitten V. [long pause]

### S3 · Schritt ①: Schnitt (20–50 s), der Kern
**Bild:** ① wird aktiv. Die Bühne schrumpft nach unten und wird gedimmt.

1. Die Gleichungen aus der Karte gleiten als LGS auf die Arbeitsfläche:
```
I    x + y +  z = 0     (Amber)
II   x − y + 2z = 0     (Cyan)
```
2. „Zieh Gleichung eins von zwei ab“:
   - Eine Kopie von I legt sich über II, Spalte für Spalte.
   - x − x = 0 wird durchgestrichen, dann −y − y = −2y und 2z − z = z.
   - Es entsteht die Zeile `II − I:  −2y + z = 0   ⇒  z = 2y`.
3. „In Gleichung eins eingesetzt“:
   - „2y“ fliegt an die Stelle von z in I, das ersetzte z leuchtet auf.
   - Es entsteht `x + y + 2y = 0  ⇒  x + 3y = 0  ⇒  x = −3y`.
4. „y ist frei, nenn es t“:
   - Es entsteht `y = t` (koralle).
   - Unten auf der Bühne beginnt ein Punkt auf der Schnittgeraden hin und her zu laufen, mit „t = 0,8 … −1,2 …“.
5. Ergebnisvektor als echte Spaltenvektoren:
   - (x, y, z)ᵀ = (−3t, t, 2t)ᵀ = t · (−3, 1, 2)ᵀ
   - Das t gleitet sichtbar aus allen drei Einträgen nach vorne („ausklammern“).
   - Der Vektor (−3, 1, 2)ᵀ bekommt den Namen w und einen Rahmen.

> Schritt eins: Im Schnitt liegt alles, was beide Gleichungen erfüllt. [pause] Zieh Gleichung eins von zwei ab. [pause] Das x fällt weg: z gleich zwei y. [pause] In Gleichung eins eingesetzt: x plus drei y gleich null, also x gleich minus drei y. [pause] y ist frei, nenn es t. [pause] Jeder Punkt im Schnitt ist also t mal minus drei, eins, zwei. [long pause]

### S4 · Schritt ②: Probe, Basis & Dimension (50–70 s)
**Bild:** ① ✓, ② wird aktiv.

**Probe** als zwei Zeilen. Die Zahlen von w fliegen einzeln in die Gleichungen. Die Stimme liest sie nicht vor, das Bild zeigt jede Zahl:
```
U:  −3 + 1 + 2 = 0  ✓
V:  −3 − 1 + 4 = 0  ✓
```

**Kamerafahrt:**
- Die Bühne wird groß.
- Die Kamera dreht sich, bis sie genau entlang der Geraden blickt.
- Beide Ebenen klappen zu zwei Strichen zusammen, die sich in einem Punkt kreuzen. Der Pfeil w zeigt direkt auf uns.
- Danach fährt sie zurück.
- Für diese Fahrt füge ich ca. 2 s Pause in die Stimme ein.

**Ergebnis:**
- Es erscheint `Basis von U ∩ V: {(−3, 1, 2)ᵀ}` und `dim(U ∩ V) = 1`.
- Kleine graue Notiz ohne Ton: „ein Vektor ≠ 0 ist linear unabhängig“.
- In der Karte werden ① und ② durch die Antworten ersetzt, mit ✓. ② ✓

> Schritt zwei, zuerst die Probe: Eingesetzt in U gibt das null, in V auch. [pause] Blick entlang der Geraden: Sie steckt in beiden Ebenen. [long pause] Und w ist nicht null, also eine Basis von U geschnitten V. Dimension eins. [long pause]

### S5 · Schritt ③: U + V, Auflösung des Rätsels (70–94 s)
**Bild:** ③ wird aktiv, das „?“ an ③ pulsiert.

1. **Dimension der Ebenen:**
   - `dim U = dim V = 2`.
   - Darunter klein: „1 Gleichung, 3 Unbekannte ⇒ 2 frei“.
2. **Richtungen auf der Bühne:**
   - In U erscheint zusätzlich zu w ein Amber-Pfeil u, in V ein Cyan-Pfeil v.
   - Auf der Arbeitsfläche stehen zwei Kärtchenreihen:
```
U:  [ w ][ u ]
V:  [ w ][ v ]
```
3. **Aha:**
   - „zählt sie doppelt“: Die beiden w-Kärtchen leuchten auf und gleiten aufeinander.
   - Mit einem Blitz verschmelzen sie zu einem.
   - Es bleibt eine Reihe `[ w ][ u ][ v ]` mit der Zahl 3.
4. **Formel** baut sich darunter auf, die Zahlen in ihren Farben:
```
dim(U + V) = dim U + dim V − dim(U ∩ V)
           =   2   +   2   −     1       = 3
```
5. **„der ganze Raum“:**
   - Auf der Bühne wachsen aus w, u, v Gitterpunkte in alle Richtungen, bis das ganze Bild ein Raumgitter ist.
   - Es erscheint `U + V = ℝ³`.
   - Das „?“ an ③ wird zu ✓. In der Karte steht bei ③ die Antwort.

> Schritt drei: das Rätsel vom Anfang. [pause] U und V haben je Dimension zwei: eine Gleichung, drei Unbekannte, zwei bleiben frei. [pause] Aber beide enthalten die Gerade. Wer zwei plus zwei rechnet, zählt sie doppelt. [long pause] Also: zwei plus zwei minus eins, gleich drei. [pause] Die vierte Dimension gab es nie. U plus V ist der ganze Raum. [long pause]

### S6 · Merkkarte (94–96 s, ohne Ton)
**Bild:**
- Die Aufgabenkarte mit allen drei Antworten gleitet in die Mitte (y ca. 700–1100), ✓ ✓ ✓.
- Dahinter schimmern die Ebenen und die Gerade.
- Das ist der Moment zum Speichern.

### S7 · UniMathe & CTA (96–104 s)
**Bild:** wie beim Basis-Video, zurückhaltend.
- Die Merkkarte löst sich in einen Lichtpunkt auf. Daraus blendet das **Original-Logo** ein (unverändert, `unimathe-logo.webp`).
- Darunter stehen „UniMathe“ und „Höhere Mathematik verstehen · Klausuraufgaben Schritt für Schritt“.
- Darunter eine Suchleiste „Im App Store suchen“, in die „UniMathe“ getippt wird.
- Alles liegt zwischen y 600 und 1400, also im sicheren Bereich.
- Keine erfundene App-Oberfläche.

> Solche Klausuraufgaben übst du in UniMathe, mit Erklärungen zu jedem Schritt. [pause] Such im App Store einfach nach UniMathe.

## Sprechtext komplett

> Klausuraufgabe: zwei Ebenen im Raum, U und V. [pause] Jede hat Dimension zwei. Zusammen also vier? [pause] Der Raum hat aber nur drei. Wo ist eine Dimension geblieben? [long pause] Die Lösung in drei Schritten. [long pause]
> Erst das Bild: Zwei verschiedene Ebenen durch den Ursprung schneiden sich in einer Geraden. [pause] Das ist U geschnitten V. [long pause]
> Schritt eins: Im Schnitt liegt alles, was beide Gleichungen erfüllt. [pause] Zieh Gleichung eins von zwei ab. [pause] Das x fällt weg: z gleich zwei y. [pause] In Gleichung eins eingesetzt: x plus drei y gleich null, also x gleich minus drei y. [pause] y ist frei, nenn es t. [pause] Jeder Punkt im Schnitt ist also t mal minus drei, eins, zwei. [long pause]
> Schritt zwei, zuerst die Probe: Eingesetzt in U gibt das null, in V auch. [pause] Blick entlang der Geraden: Sie steckt in beiden Ebenen. [long pause] Und w ist nicht null, also eine Basis von U geschnitten V. Dimension eins. [long pause]
> Schritt drei: das Rätsel vom Anfang. [pause] U und V haben je Dimension zwei: eine Gleichung, drei Unbekannte, zwei bleiben frei. [pause] Aber beide enthalten die Gerade. Wer zwei plus zwei rechnet, zählt sie doppelt. [long pause] Also: zwei plus zwei minus eins, gleich drei. [pause] Die vierte Dimension gab es nie. U plus V ist der ganze Raum. [long pause]
> Solche Klausuraufgaben übst du in UniMathe, mit Erklärungen zu jedem Schritt. [pause] Such im App Store einfach nach UniMathe.

## Bewusst weggelassen

- **Kreuzprodukt der Normalen** als Abkürzung für w: Das wäre schneller, steht aber in vielen Klausuren nicht als erlaubter Weg. Das LGS ist der Standardweg und folgt direkt der Definition des Schnitts.
- **Explizite Basis von U + V** (w, u, v mit Determinante): Gefragt ist nur die Dimension. Die Formel ist der klausurübliche Weg. u und v erscheinen nur als Pfeile, damit das „doppelt gezählt“ sichtbar wird.

## Sound

- Musik aus Code wie bei den bisherigen Videos:
  - Im Hook Spannung bis zu „nur drei“, dann ein Moment Stille.
  - In Teil 1 und 2 ein ruhiger Puls.
  - Bei der Kamerafahrt entlang der Geraden ein Sog.
  - Beim Verschmelzen der w-Kärtchen die Auflösung nach Dur.
  - Im CTA ein Arpeggio.
- SFX:
  - weicher Klick pro neuer Rechenzeile
  - „Whoosh“ beim Einsetzen
  - Glöckchen bei ✓
  - tiefer Ton bei der falschen 4
  - heller Akzent beim Verschmelzen
  - leise Tipp-Klicks in der Suchleiste
- Untertitel dezent mit dunkler Pille, jetzt bei y ≈ 1440–1500 statt 1600. Im CTA keine.

## Kosten

- Stimme: 1.454 Zeichen mit Pausen-Tags, also **ca. 1.450–1.550 Credits ≈ 0,50 €** für 1 Take.
  - Das Basis-Video lag bei 1.445 Credits.
  - Vor dem Erzeugen lese ich die exakte Zahl per Schätzung ab und melde sie dir, bevor Credits verbraucht werden.
- Musik, Effekte und Animation kosten nichts.

## Offene Punkte

- Hast du einen echten App-Screen zu Untervektorräumen oder zum Schnitt? Dann zeige ich ihn vor dem CTA ca. 3 s im Fenster, unverändert, nur Ausschnitt und Zoom. Ohne Screen bleibt der CTA wie beim Basis-Video: Logo und Suchleiste.
