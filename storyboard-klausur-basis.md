# UniMathe · Klausuraufgabe „Lineare Abhängigkeit, Basis & Dimension“ · Storyboard v1 (Entwurf zur Freigabe)

**Status:** freigegeben am 2026-11-03 und gebaut in `src/kb/` (107,1 s). Stimme: 1 Take, 1.445 Credits (99,9 s), 5 eingefügte Pausen für Animationen.

Format: 9:16 · 1080×1920 · 60 fps · Ziel 1:45–1:50 (Sprechtext 210 Wörter, 1.445 Zeichen; das Unterraum-Video hatte 176 Wörter → 95 s Stimme, 101 s Video)
Stil: „Dark Swiss“ wie die Serie, 3D-Bühne aus dem Unterraum-Video weiterentwickelt
Stimme: ElevenLabs eleven_v4, Chris (iir30Q1pQmHS1AgZ2mNe), 1 Take
Branch: `video/klausur-basis`, Code später in `src/kb/`

## Idee: dasselbe Erfolgsrezept, plus eine offene Frage im Bild

Übernommen aus dem Unterraum-Video, weil es funktioniert hat:
- **Die Aufgabe bleibt immer sichtbar.** Feste Aufgabenkarte oben, darunter die Fortschrittsleiste ① Ansatz · ② Lösen · ③ Basis & Dimension.
- **Ein Rechenschritt pro Satz.** Jede Zeile bleibt stehen. Beim Einsetzen fliegt der eingesetzte Term sichtbar von seiner Zeile in die nächste, damit man jeden Schritt nachverfolgen kann.
- **Pausen nach jedem Teilschritt.**

Neu für die Zuschauerbindung:
- **Offene Schleife ab Sekunde 1:** Auf der 3D-Bühne bewegt sich v₃, während a sich ändert. Der Körper aus den drei Vektoren wird dünner, bei einem Wert ganz flach. Der Wert ist verdeckt („a = ?“). Erst die Rechnung in Schritt ② deckt ihn auf.
- **Wendepunkt in der Mitte:** „Jetzt entscheidet a.“ Die Rechnung teilt sich sichtbar in zwei Fälle.
- **Aha-Moment:** Die Rechnung liefert v₃ = v₁ + v₂. Genau das sieht man im Raum: v₃ ist die Diagonale des Parallelogramms aus v₁ und v₂. Die Kamera fährt seitlich an die Ebene heran, bis alle drei Pfeile auf einer Linie liegen. Damit schließt sich die Frage aus dem Hook.
- **Merkkarte zum Schluss:** Die fertige Antwort steht in der Aufgabenkarte und lädt zum Speichern ein.

Die 3D-Bühne ist kein Deko-Element. Sie zeigt zu Beginn die Frage, bestätigt nach Schritt ② die Antwort und zeigt in Schritt ③, was „Basis“ und „Dimension 2“ bedeuten. Während gerechnet wird, tritt sie zurück (gedimmt, klein).

## Mathematik (geprüft, alles aus Code)

v₁ = (1, 1, 0)ᵀ, v₂ = (0, 1, 1)ᵀ, v₃ = (1, 2, a)ᵀ

**Teil 1: Ansatz** λ₁v₁ + λ₂v₂ + λ₃v₃ = 0, zeilenweise:
```
I    λ₁       +  λ₃ = 0
II   λ₁ + λ₂ + 2λ₃ = 0
III       λ₂ + aλ₃ = 0
```
- Aus I folgt λ₁ = −λ₃.
- In II eingesetzt: −λ₃ + λ₂ + 2λ₃ = 0, also λ₂ = −λ₃.
- In III eingesetzt: −λ₃ + aλ₃ = 0, also (a − 1)·λ₃ = 0.

Fallunterscheidung:
- **a ≠ 1:** λ₃ = 0, also λ₁ = λ₂ = 0. Es gibt nur die triviale Lösung, die Vektoren sind linear unabhängig.
- **a = 1:** λ₃ ist frei wählbar. Mit λ₃ = 1 folgt λ₁ = λ₂ = −1, also −v₁ − v₂ + v₃ = 0 und damit **v₃ = v₁ + v₂**.
  - Probe: (1, 1, 0) + (0, 1, 1) = (1, 2, 1) = v₃ für a = 1 ✓
- **Ergebnis Teil 1:** linear abhängig genau für a = 1.

**Teil 2 (a = 1):**
- Wegen v₃ = v₁ + v₂ gilt U = span{v₁, v₂, v₃} = span{v₁, v₂}.
- v₁ und v₂ sind linear unabhängig: Aus λ₁v₁ + λ₂v₂ = (λ₁, λ₁ + λ₂, λ₂) = 0 folgt λ₁ = 0 (Zeile 1) und λ₂ = 0 (Zeile 3).
- **Basis {v₁, v₂}, dim U = 2.** U ist eine Ebene durch den Ursprung.
  - Nur zur Kontrolle, nicht im Video: Normale v₁ × v₂ = (1, −1, 1), also U: x − y + z = 0. v₁, v₂, v₃ erfüllen das alle.

Gegencheck mit der Determinante (nur zur Kontrolle, nicht im Video): det(v₁ v₂ v₃) = a − 1. Sie ist genau für a = 1 null ✓. Das Volumen des Spats ist |a − 1|, deshalb wird der Körper im Hook genau bei a = 1 flach.

## Bildaufbau

```
 y 150–470   AUFGABENKARTE (fest): „Klausuraufgabe · Lineare Algebra“
             v₁ = (1 1 0)ᵀ  v₂ = (0 1 1)ᵀ  v₃ = (1 2 a)ᵀ  als echte Spaltenvektoren
             1. Für welche a ∈ ℝ linear abhängig?
             2. Für diesen Fall: Basis und Dimension von U = span{v₁, v₂, v₃}
 y 490–545   FORTSCHRITT (fest): ① Ansatz  ② Lösen  ③ Basis & Dimension  (leer → aktiv → ✓)
 y 575–1130  ARBEITSFLÄCHE: Rechnung, Formeln ≈ 46–50 px
 y 1150–1580 3D-BÜHNE (im Hook, beim Aha und in ③ größer, beim Rechnen gedimmt)
 ab y 1600   frei für Plattform-UI, rechter Rand (x > 960) bleibt frei für die Like-Leiste
```

Farbcode, durchgehend gleich in Karte, Rechnung und 3D:
- v₁, λ₁: Amber
- v₂, λ₂: Cyan
- v₃, λ₃ und der Parameter a: Koralle
- Ebene span{v₁, v₂}: Lavendel
- Ergebnis und ✓: Weiß

## Szenen

Die Zeiten sind geschätzt. Die endgültigen Zeiten kommen aus der Stimme.

### S1 · Hook (0–12 s)
**Bild:**
- Ab Frame 1 steht die Aufgabenkarte. Darunter liegt die große 3D-Bühne.
- Die drei Pfeile wachsen aus dem Ursprung. v₁ und v₂ spannen eine zarte lavendelfarbene Ebene auf, alle drei spannen einen halbtransparenten Körper (Spat) auf.
- Die Kamera kreist langsam. Neben der Bühne läuft ein Regler „a = ?“. v₃ wandert auf und ab, und der Körper wird dicker und dünner.
- Bei einem Wert klappt er kurz ganz flach: Lichtblitz und dumpfer Ton. Danach wandert v₃ weiter. Der Wert bleibt verdeckt.
- Bei „in drei Schritten“ beschriftet sich die Fortschrittsleiste. Die Bühne schrumpft nach unten und dimmt.

> Klausuraufgabe: Für welches a sind diese drei Vektoren linear abhängig? [pause] Anschaulich: Wann kippt v drei in die Ebene der anderen beiden? [long pause] Die Lösung in drei Schritten. [long pause]

### S2 · Schritt ①: Ansatz (12–34 s)
**Bild:** ① wird aktiv.
- Die Gleichung λ₁v₁ + λ₂v₂ + λ₃v₃ = 0 erscheint mit echten Spaltenvektoren. Die λ sind in der Farbe ihres Vektors.
- Bei „Linear abhängig heißt“ erscheint darunter klein: „abhängig ⇔ Lösung mit nicht allen λᵢ = 0“.
- Bei „Zeile für Zeile“ leuchtet in allen drei Spaltenvektoren nacheinander je eine Zeile auf. Ihre Einträge gleiten mit den λ heraus und bilden Gleichung I, II, III. Dafür bekommt die Szene eine eingefügte Pause von ca. 2 s.
- Das LGS bleibt danach oben auf der Arbeitsfläche stehen.

> Schritt eins: der Ansatz. [pause] Setz eine Kombination der drei Vektoren gleich null. [pause] Linear abhängig heißt: Das klappt, ohne dass alle Lambdas null sind. [pause] Zeile für Zeile gibt das drei Gleichungen. [long pause]

### S3 · Schritt ②: Lösen (34–76 s), der Kern
**Bild:** ② wird aktiv. Rechts neben dem LGS entsteht Zeile für Zeile (alles bleibt stehen):
```
I    λ₁ + λ₃ = 0         ⇒  λ₁ = −λ₃
II   λ₁ + λ₂ + 2λ₃ = 0   ⇒  −λ₃ + λ₂ + 2λ₃ = 0  ⇒  λ₂ = −λ₃
III  λ₂ + aλ₃ = 0        ⇒  −λ₃ + aλ₃ = 0       ⇒  (a − 1)·λ₃ = 0
```
- Beim Einsetzen fliegt „−λ₃“ sichtbar aus dem Ergebnis von I an die Stelle von λ₁ in II, dann aus I und II in III. Die ersetzten Terme leuchten kurz auf.
- Ist die Zeile zu breit, wird der Zwischenschritt in eine eigene Zeile darunter gesetzt.
- (a − 1)·λ₃ = 0 wird eingerahmt.
- Bei „Jetzt entscheidet a“ teilt sich die Arbeitsfläche in zwei Spalten:
```
a ≠ 1                          a = 1
λ₃ = 0 ⇒ λ₁ = λ₂ = 0           λ₃ = 1 ⇒ λ₁ = λ₂ = −1
nur triviale Lösung            −v₁ − v₂ + v₃ = 0
⇒ unabhängig                   ⇒ v₃ = v₁ + v₂
```
- Danach wird die linke Spalte grau, die rechte hell.
- In der Aufgabenkarte erscheint bei Teil 1: „a = 1 ✓“. ② ✓

> Schritt zwei: lösen. [pause] Zeile eins nach Lambda eins umstellen. [pause] In Zeile zwei einsetzen, das gibt Lambda zwei. [pause] Beides in Zeile drei. Übrig bleibt: a minus eins, mal Lambda drei, gleich null. [long pause] Jetzt entscheidet a. [pause] Ist a nicht eins, muss Lambda drei null sein, also alle. Unabhängig. [pause] Ist a gleich eins, ist Lambda drei frei. Mit eins werden die anderen minus eins. [pause] Heißt: v drei ist v eins plus v zwei. [long pause] Linear abhängig also genau für a gleich eins. [long pause]

### S4 · Aha im Raum (76–86 s)
**Bild:**
- Die Arbeitsfläche tritt zurück, die 3D-Bühne wird groß.
- Der Regler „a = ?“ wird zu „a = 1“. v₃ sinkt in die lavendelfarbene Ebene, der Körper wird flach.
- v₂ wird an die Spitze von v₁ verschoben (gestrichelt) und landet genau auf der Spitze von v₃: das Parallelogramm v₃ = v₁ + v₂.
- Dann fährt die Kamera seitlich an die Ebene heran, bis man sie als Kante sieht. Alle drei Pfeile liegen auf einer Linie: Sie stecken in einer Ebene. Danach fährt sie zurück.

> Und im Raum: v drei kippt genau in die Ebene von v eins und v zwei. [pause] Der Körper wird flach. [long pause]

### S5 · Schritt ③: Basis & Dimension (86–106 s)
**Bild:** ③ wird aktiv.
- Arbeitsfläche: U = span{v₁, v₂, v₃} = span{v₁, v₂}. v₃ wird dabei durchgestrichen, mit dem kleinen Hinweis „= v₁ + v₂“.
- Auf der Bühne füllt sich die Ebene aus Kombinationen s·v₁ + t·v₂: ein Gitter aus Amber- und Cyan-Schritten. v₃ liegt darauf.
- Unabhängigkeit von v₁, v₂:
```
λ₁v₁ + λ₂v₂ = (λ₁, λ₁ + λ₂, λ₂) = 0
Zeile 1: λ₁ = 0     Zeile 3: λ₂ = 0   ⇒ unabhängig ✓
```
- Ergebnis: Basis {v₁, v₂}. Zwei Richtungen ⇒ dim U = 2. Auf der Bühne leuchten die beiden Richtungen und die Ebene einmal auf.
- Kleine graue Notiz ohne Ton: „auch {v₁, v₃} oder {v₂, v₃} wäre eine Basis“.
- In der Aufgabenkarte erscheint bei Teil 2: „Basis {v₁, v₂}, dim U = 2 ✓“. ③ ✓

> Schritt drei: Basis und Dimension. [pause] v drei ist überflüssig. U wird schon von v eins und v zwei aufgespannt. [pause] Und die beiden sind unabhängig, das zeigen Zeile eins und drei. [pause] Also: Basis v eins, v zwei. Dimension zwei. [long pause]

### S6 · Merkkarte (106–108 s, ohne Ton)
**Bild:** Die Aufgabenkarte mit beiden Antworten steht allein in der Mitte, ✓ ✓ ✓. Die Ebene schimmert dahinter.

### S7 · UniMathe & CTA (108–116 s)
**Bild:** Wie beim Determinante-Video:
- Die Merkkarte löst sich in einen Lichtpunkt auf, daraus blendet das Original-Logo unverändert ein, dazu „UniMathe“ und „Höhere Mathematik · Klausuraufgaben mit Schritt-für-Schritt-Erklärungen“.
- Darunter eine Suchleiste, in die „UniMathe“ getippt wird.
- Keine erfundene App-Oberfläche.

> Genau solche Klausuraufgaben übst du in UniMathe, mit Erklärungen zu jedem Schritt. [pause] Such im App Store nach UniMathe.

## Sprechtext komplett

> Klausuraufgabe: Für welches a sind diese drei Vektoren linear abhängig? [pause] Anschaulich: Wann kippt v drei in die Ebene der anderen beiden? [long pause] Die Lösung in drei Schritten. [long pause]
> Schritt eins: der Ansatz. [pause] Setz eine Kombination der drei Vektoren gleich null. [pause] Linear abhängig heißt: Das klappt, ohne dass alle Lambdas null sind. [pause] Zeile für Zeile gibt das drei Gleichungen. [long pause]
> Schritt zwei: lösen. [pause] Zeile eins nach Lambda eins umstellen. [pause] In Zeile zwei einsetzen, das gibt Lambda zwei. [pause] Beides in Zeile drei. Übrig bleibt: a minus eins, mal Lambda drei, gleich null. [long pause] Jetzt entscheidet a. [pause] Ist a nicht eins, muss Lambda drei null sein, also alle. Unabhängig. [pause] Ist a gleich eins, ist Lambda drei frei. Mit eins werden die anderen minus eins. [pause] Heißt: v drei ist v eins plus v zwei. [long pause] Linear abhängig also genau für a gleich eins. [long pause]
> Und im Raum: v drei kippt genau in die Ebene von v eins und v zwei. [pause] Der Körper wird flach. [long pause]
> Schritt drei: Basis und Dimension. [pause] v drei ist überflüssig. U wird schon von v eins und v zwei aufgespannt. [pause] Und die beiden sind unabhängig, das zeigen Zeile eins und drei. [pause] Also: Basis v eins, v zwei. Dimension zwei. [long pause]
> Genau solche Klausuraufgaben übst du in UniMathe, mit Erklärungen zu jedem Schritt. [pause] Such im App Store nach UniMathe.

## Bewusst weggelassen

- **Determinante als Abkürzung** (det = a − 1): Das wäre ein zweiter Lösungsweg und ein weiterer Begriff. Der Weg über das LGS folgt direkt der Definition und liefert v₃ = v₁ + v₂ gleich mit. Das brauchen wir für Teil 2.
- **Ebenengleichung x − y + z = 0** und **„für a ≠ 1 ist U = ℝ³“**: richtig, aber nicht gefragt.

## Sound

- Musik aus Code wie bei den bisherigen Videos: ruhiger Puls, im Hook ein Sog bis zum Flachklappen, beim Aha eine Auflösung, im CTA Dur.
- SFX: weicher Klick pro neuer Rechenzeile, „Whoosh“ beim Einsetzen, Glöckchen bei ✓, tiefer Ton beim Flachklappen.
- Untertitel dezent wie beim Unterraum-Video, im CTA keine.

## Kosten

- Stimme: 1.445 Zeichen mit Pausen-Tags, also **ca. 1.400–1.500 Credits ≈ 0,50 €** für 1 Take. Das Unterraum-Video lag bei 1.337 Credits. Die exakte Zahl lese ich vor dem Erzeugen per Schätzung ab und melde sie.
- Musik, Effekte und Animation kosten nichts.

## Offene Punkte

- Habt ihr einen echten App-Screen zu linearer Abhängigkeit oder Basis? Dann zeige ich ihn vor dem CTA ca. 3 s im Fenster, unverändert, nur Ausschnitt und Zoom. Ohne Screen bleibt der CTA reines Logo mit Suchleiste.
