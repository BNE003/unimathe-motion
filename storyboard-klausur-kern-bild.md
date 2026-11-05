# Storyboard: Klausurvideo Kern, Bild und Rang

Status: freigegeben am 2026-11-05 und gebaut in `src/kbr/` (104,8 s). Branch `video/klausur-kern-bild`. Stimme: 1 Take, 1.284 Credits (84,9 s, schneller als geschätzt), 18 eingefügte Pausen für Animationen.

Format: 9:16, 1080 × 1920, 60 fps, Deutsch, Ziel 1:40–1:50. Gleiches Klausurformat wie das Schnitt-Video: Aufgabenkarte, drei Schritte und Fortschrittsleiste, die Antworten füllen sich in der Karte.

## Aufgabe

f: ℝ³ → ℝ³, f(x) = A·x mit A = (1 1 0; 0 1 1; 1 2 1).

1. Bestimme eine Basis des Kerns von f.
2. Bestimme eine Basis des Bildes von f.
3. Bestimme den Rang von f und die Dimension des Kerns.

## Lösung (nachgerechnet)

**Kern:** A·x = 0.

- Gleichungen: I: x + y = 0, II: y + z = 0, III: x + 2y + z = 0.
- III − I = (0, 1, 1) = II. Also ist III = I + II und fällt weg.
- z = t ist frei. Dann gilt y = −t und x = −y = t.
- Kern f = span{(1, −1, 1)ᵀ}, dim Kern = 1.
- Probe: A·(1, −1, 1)ᵀ = (0, 0, 0)ᵀ.

**Bild:** Es wird von den Spalten a₁ = (1,0,1), a₂ = (1,1,2), a₃ = (0,1,1) aufgespannt.

- A·(1, −1, 1)ᵀ = 0 heißt a₁ − a₂ + a₃ = 0, also a₂ = a₁ + a₃.
- a₁ und a₃ sind nicht parallel und damit linear unabhängig.
- Bild f = span{(1,0,1)ᵀ, (0,1,1)ᵀ}. Das ist die Ebene z = x + y, ihr Normalenvektor ist a₁ × a₃ = (−1, −1, 1).

**Rang:**

- rg f = dim Bild f = 2, dim Kern f = 1.
- Dimensionsformel: dim Kern + rg = 1 + 2 = 3 = dim ℝ³.
- det A = 0, passt zum Rang 2.

**Für die Animation:**

- Der Raum wird über M(s) = (1 − s)·I + s·A flachgedrückt.
- Die Eigenwerte von A sind 0, (3 ± √5)/2, alle ≥ 0. Deshalb ist det M(s) > 0 für s < 1: Der Raum klappt nie um, er wird erst bei s = 1 flach.
- Der Kern liegt nicht in der Bildebene, denn für (1, −1, 1) ist z − x − y = 1 ≠ 0. Er durchsticht sie sichtbar im Ursprung.

## Idee

Das Video zeigt erst das Bild und rechnet dann.

**Hook:** Ein leuchtendes 3D-Punktgitter wird von A flachgedrückt, und eine ganze Punktreihe schrumpft in den Nullpunkt.

**Drei Höhepunkte:**

1. **Drei Ebenen wie Buchseiten:** Jede Gleichung ist eine Ebene durch den Ursprung. Alle drei drehen sich um eine gemeinsame Gerade, und das ist der Kern.
2. **Der Spalten-Trick (Aha):** Die Zahlen des Kernvektors (1, −1, 1) sind das Rezept, mit dem sich die Spalten zu null addieren.
   - In 3D: a₁, dann −a₂, dann +a₃ aneinandergehängt, und der Weg schließt sich zum Dreieck zurück in den Ursprung.
   - a₂ ist die Diagonale im Parallelogramm aus a₁ und a₃, also überflüssig.
3. **1 + 2 = 3:** Noch einmal flachdrücken. Die Kern-Gerade (1 Dimension) verschwindet im Punkt, die Ebene (2 Dimensionen) bleibt.

## Mehr Wiedergabedauer (12–17 s bisher)

- **Kein Standbild am Anfang:** Frame 0 ist schon Bewegung. Das Flachdrücken des Raums kommt vor der Karte, das Bild hält die Leute, bevor die Aufgabe kommt.
- **Offene Schleife bei 0:10:** „Am Ende verrät dir der Kern sogar, warum eine Spalte überflüssig ist.“ Aufgelöst wird sie erst bei etwa 1:05.
- **Etwa alle 6–8 s ein Bildwechsel:** Kamerafahrt, neue 3D-Szene oder Übergang. Rechnungen stehen höchstens zwei, drei Zeilen gleichzeitig und verwandeln sich, statt sich zu stapeln.
- **Belohnung pro Schritt:**
  - Die Antwort fliegt in die Karte oben und rastet mit Ton ein.
  - Die Fortschrittsleiste Kern · Bild · Rang zeigt, wie weit es noch ist.
- **Jede Rechnung hat ein 3D-Gegenstück**, das gleichzeitig läuft. Die Zahlen sind nie allein auf dem Bildschirm.

## Layout und Safe Areas

Übernommen aus dem Schnitt-Video, das die Abnahme bestanden hat.

- **Aufgabenkarte:**
  - Sie erscheint mittig (y ≈ 520–1180), groß und vollständig lesbar, und steht dort, solange die Stimme die Aufgabe nennt (etwa 0:04–0:08).
  - Dahinter ist die Bühne in dieser Zeit abgedunkelt. Dort wird nichts markiert, was die Karte verdecken könnte.
  - Danach gleitet sie nach oben (y 300–550) und wird kompakt: drei Antwortfelder Kern | Bild | Rang.
- **Bereiche:**
  - Wichtiges liegt nur zwischen y 300 und 1500 und bei x < 940.
  - Untertitel dezent bei y ≈ 1446.
  - Die Rechnung steht zwischen Karte und 3D-Bühne (y ≈ 700–1100), die Bühne darunter beziehungsweise dahinter.

## Farben

UniMathe-Farben aus src/theme.ts.

- **Kern:** Coral, eine Gerade.
- **Bild:** Amber, eine Ebene.
- **Spalten:** a₁ amber-hell, a₂ violett, a₃ cyan.
- **Gleichungsebenen I, II, III:** blau, cyan, indigo (halbtransparent).

## Szenen und Zeitplan (grob)

### S1 · Hook (0–0:12)

1. **„Diese Matrix drückt den ganzen Raum platt.“**
   - Ein 5×5×5-Gitter aus leuchtenden Punkten im Raum, die Kamera fliegt schräg heran.
   - Das Gitter fällt in etwa 1,5 s auf eine Ebene zusammen, mit Bewegungsunschärfe.
   - Die Kamera schwenkt auf die Kante der Ebene: Von dort ist alles ein einziger Strich.
2. **„Und eine ganze Gerade verschwindet dabei im Nullpunkt.“**
   - Kurz zurückspulen. Nur die fünf Punkte auf der Kern-Geraden leuchten coral, beim erneuten Flachdrücken schrumpfen sie in den Ursprung.
   - Kleiner Lichtblitz im Nullpunkt.
3. **„Klausuraufgabe: Bestimme Kern, Bild und Rang.“**
   - Die Aufgabenkarte erscheint mittig, mit Abbildung, Matrix A und den drei Fragen. Die Bühne ist dahinter abgedunkelt.
   - Nach dem Satz gleitet die Karte nach oben und wird kompakt.
4. **„Und am Ende verrät dir der Kern sogar, warum eine Spalte überflüssig ist.“**
   - Auf der freien Bühne erscheinen die drei Spaltenpfeile a₁, a₂, a₃, über a₂ schwebt ein „?“.
   - Die Fortschrittsleiste Kern · Bild · Rang baut sich auf.

### S2 · Erst die Idee (0:12–0:19)

- **„Der Kern ist alles, was auf null landet.“:** Die Kern-Gerade leuchtet als coral Linie durch den Raum, Tag „Kern“. Ihre Punkte fliegen in den Nullpunkt.
- **„Das Bild ist alles, was getroffen wird.“:** Das Gitter drückt sich erneut flach, die Ebene leuchtet amber, Tag „Bild“.
- Die Kamera umrundet beide Objekte einmal.

### S3 · Schritt 1: Kern (0:19–0:47)

1. **„Löse A mal x gleich null.“:**
   - Die Bühne rutscht nach unten.
   - Die drei Gleichungen erscheinen als Zeilen I, II, III.
   - Gleichzeitig erscheint in 3D zu jeder Gleichung ihre Ebene durch den Ursprung.
2. **„Zeile drei minus Zeile eins ist genau Zeile zwei.“:**
   - Zeile I fliegt unter Zeile III, x hebt sich weg, es bleibt y + z = 0.
   - Das Ergebnis legt sich deckungsgleich auf Zeile II und leuchtet auf.
3. **„Sie fällt also weg.“:**
   - Zeile III wird durchgestrichen und verblasst.
   - In 3D dreht sich Ebene III um die gemeinsame Gerade und zeigt: Sie enthält nichts Neues.
4. **„Übrig bleibt …“:** Zwei Zeilen. Die Kamera schaut genau entlang der gemeinsamen Geraden, und alle drei Ebenen erscheinen als Striche durch einen Punkt.
5. **„z ist frei, nenn es t. Dann ist y = −t und x = t.“:**
   - Die Werte fliegen von Zeile zu Zeile.
   - Ein Punkt t·(1,−1,1) wandert auf der Geraden hin und her.
6. **„Der Kern ist die Gerade durch (1, −1, 1).“:**
   - Die Gerade leuchtet coral.
   - Die Antwort „Kern = span{(1,−1,1)}“ fliegt in die Karte und rastet ein.

### S4 · Schritt 2: Bild und Aha (0:47–1:16)

1. **„Es wird von den Spalten aufgespannt.“:**
   - Die Ebenen blenden aus.
   - Die Matrix A erscheint, ihre drei Spalten lösen sich als Spaltenvektoren und werden in 3D zu Pfeilen a₁, a₂, a₃.
2. **„A mal (1,−1,1) gleich null heißt: Spalte eins minus Spalte zwei plus Spalte drei ergibt null.“:**
   - Die Einträge des Kernvektors fliegen als Faktoren vor die Spalten: 1·a₁ − 1·a₂ + 1·a₃ = 0.
   - In 3D hängen sich die Pfeile aneinander, und der Weg schließt sich zum Dreieck zurück in den Ursprung (Aha mit Schlag).
3. **„Spalte zwei ist also nur Spalte eins plus Spalte drei. Sie ist überflüssig.“:**
   - Ein Parallelogramm aus a₁ und a₃ entsteht, a₂ ist genau seine Diagonale.
   - a₂ wird grau, das „?“ aus dem Hook löst sich auf.
4. **„Die anderen beiden sind eine Basis des Bildes, genau die Ebene von vorhin.“:**
   - Das Parallelogramm wächst zur amber Ebene.
   - Kamera auf die Kante: Alle drei Spalten liegen im Strich.
   - Die Antwort „Bild = span{(1,0,1), (0,1,1)}“ fliegt in die Karte.

### S5 · Schritt 3: Rang (1:16–1:35)

1. **„Der Rang ist die Dimension des Bildes, also zwei. Der Kern hat Dimension eins.“:** Zwei Chips „rg f = 2“ (amber) und „dim Kern = 1“ (coral), die Antworten rasten in die Karte.
2. **„Von drei Dimensionen geht eine im Kern verloren, zwei bleiben im Bild.“:**
   - Das Gitter steht wieder voll im Raum und drückt sich ein letztes Mal flach.
   - Die coral Gerade fällt in den Punkt, die amber Ebene bleibt.
3. **„Zwei plus eins gleich drei, das passt immer.“:** Die Gleichung „dim Kern + rg = 1 + 2 = 3“ baut sich auf, mit Lichtblitz.
4. **Merkkarte (kurz):** Kern: A·x = 0 lösen. Bild: unabhängige Spalten. dim Kern + rg = n.

### S6 · App (1:35–1:47)

„Solche Klausuraufgaben übst du in UniMathe, mit Erklärungen zu jedem Schritt. Such im App Store einfach nach UniMathe.“

Das originale Logo, darunter der Name und ein Suchfeld, in das „UniMathe“ getippt wird. Zurückhaltend wie in den bisherigen Videos.

## Sprechtext komplett

Stimme Chris (iir30Q1pQmHS1AgZ2mNe), eleven_v4, 1 Take.

- Keine [pause]-Tags, weil sie Credits kosten. Pausen für Animationen füge ich beim Schnitt ein.
- 1.284 Zeichen, 227 Wörter. Geschätzt etwa 98–102 s Stimme, mit Pausen etwa 1:45–1:48.

> Diese Matrix drückt den ganzen Raum platt. Und eine ganze Gerade verschwindet dabei im Nullpunkt. Klausuraufgabe: Bestimme Kern, Bild und Rang. Und am Ende verrät dir der Kern sogar, warum eine Spalte überflüssig ist.
> Erst die Idee: Der Kern ist alles, was auf null landet. Das Bild ist alles, was getroffen wird.
> Schritt eins, der Kern: Löse A mal x gleich null. Zeile drei minus Zeile eins ist genau Zeile zwei. Sie fällt also weg. Übrig bleibt: x plus y gleich null, und y plus z gleich null. z ist frei, nenn es t. Dann ist y gleich minus t, und x gleich t. Der Kern ist die Gerade durch eins, minus eins, eins.
> Schritt zwei, das Bild: Es wird von den Spalten aufgespannt. Und jetzt der Trick: A mal eins, minus eins, eins gleich null heißt: Spalte eins minus Spalte zwei plus Spalte drei ergibt null. Spalte zwei ist also nur Spalte eins plus Spalte drei. Sie ist überflüssig. Die anderen beiden sind eine Basis des Bildes, genau die Ebene von vorhin.
> Schritt drei: Der Rang ist die Dimension des Bildes, also zwei. Der Kern hat Dimension eins. Von drei Dimensionen geht eine im Kern verloren, zwei bleiben im Bild. Zwei plus eins gleich drei, das passt immer.
> Solche Klausuraufgaben übst du in UniMathe, mit Erklärungen zu jedem Schritt. Such im App Store einfach nach UniMathe.

## Ton

**Musik:** eigener Synth-Track (tools/music-kbr.mjs).

- Sog beim Flachdrücken im Hook.
- Ruhiger Puls in der Rechnung.
- Spannung zum Spalten-Trick, kurze Stille, dann ein Dur-Wechsel, wenn sich das Dreieck schließt.
- Weich ins Outro.

**Effekte:**

- „Collapse“ beim Flachdrücken.
- Whoosh, wenn die Karte hochgleitet.
- Ticks bei den Zeilen.
- „Lock“, wenn eine Antwort in der Karte einrastet.
- Akzent beim Aha.

## Technik

- Gleiche Bausteine wie im Schnitt-Video (Karte, Fortschrittsleiste, Rechenzeilen, Outro) und wie im AB-Video (Canvas-3D mit Tiefensortierung und Bewegungsunschärfe).
- Keine neuen Abhängigkeiten.

## Kosten

ElevenLabs-Schätzung: 1.284 Credits (1 Take, eleven_v4), ca. 0,26 $ ≈ 0,24 €. Ohne Freigabe wird nichts erzeugt.
