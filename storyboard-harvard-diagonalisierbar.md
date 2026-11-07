# Storyboard: Echte Uni-Klausur, Harvard Math 21b, Aufgabe 1(c)

Status: Fassung 2, freigegeben am 2026-11-06, gebaut und am 2026-11-07 abgenommen in `src/hv/` (143,7 s). Branch `video/harvard-diagonalisierbar`. Stimme: `hv-take2.mp3`, 1 Take, 2.021 Credits (136,08 s), 12 Sprechpausen um zusammen 6,8 s verlängert. Fassung 1 (73,6 s, 1.087 Credits) wurde abgelehnt: zu schnell, Animationsfläche zu klein.

Format: 9:16, 1080 × 1920, 60 fps, Deutsch, Ziel 60–90 s.

## Quelle (gelesen und geprüft)

https://abel.math.harvard.edu/archive/21b_spring_03/exams/finalspr03sol.pdf

- Kopf: „Math 21b Final Exam—Thursday, May 15, 2003—Solutions“.
- Aufgabe 1: „(20 points) True or False. No justification is necessary, simply circle T or F for each statement.“ Zehn Aussagen (a)–(j).
- (c): „If the matrix A² is diagonalizable, then A is diagonalizable.“ Lösung: „False. If A = [0 1; 0 0], then A² is the zero matrix which is diagonalizable.“
- Das PDF ist die Lösungsfassung, die Antwort steht direkt unter der Frage. Ausschnitte im Hook enden deshalb davor.
- Das Wort „Harvard“ steht nur in der Adresse, nicht im Dokument. Darum ist die Adresse als Quelle im Bild.

## Mathematik (eigenständig geprüft)

- A = [[0, 1], [0, 0]], A · (x, y) = (y, 0), A² = 0.
- Für y ≠ 0 ist (y, 0) nicht null und liegt nicht auf der Linie von (x, y). Nur die x-Achse bleibt, mit Eigenwert 0. Eine Eigenrichtung, gebraucht werden zwei, also nicht diagonalisierbar.
- A² · v = 0 = 0 · v für jedes v: Jede Richtung ist Eigenrichtung. Die Nullmatrix ist außerdem schon diagonal.
- Beispiel für „zwei Richtungen“: B = [[0,6; 0,9], [0; 1,5]] mit Eigenrichtungen (1, 0) (Faktor 0,6, kürzer) und (1, 1) (Faktor 1,5, länger).
- Der Eigenvektor darf nicht 0 sein, der Eigenwert schon.

## Leitidee

Richtungs-Ring: Um den Nullpunkt liegt ein feiner Ring, jeder Punkt steht für eine Richtung. Bleibt eine Richtung auf ihrer Linie, leuchtet sie auf. Normale Matrix: zwei Richtungen. A: eine. A²: der ganze Ring.

Format-Kennung „Echte Uni-Klausur“: Das Original liegt als Blatt im Dunkeln, die Kamera fährt über die echte Klausurschrift, T und F werden groß, am Ende wird das F eingekreist, wie es die Klausur verlangt.

Kein Wappen, kein Harvard-Rot. Herkunft als Quellenzeile, dazu klein „Unabhängiges Video, nicht von Harvard“.

## Aufbau Fassung 2

Bühne über den ganzen Bildschirm, keine Ausblendung. Text in y 300–1500 und x < 940, Pfeile, Ring und Beschriftungen ebenfalls.

| Video | Inhalt |
|---|---|
| 0–12,4 s | Herkunft, Originalzeile, Aussage, T und F |
| 12,4–43,2 s | Ein Pfeil kippt, zwei halten, Eigenvektoren, die einzige Regel |
| 43,2–51,2 s | Ein Beispiel reicht |
| 51,2–62,8 s | A, die untere Zahl rutscht nach oben, (3, 2) → (2, 0) |
| 62,8–79,9 s | A² ist zweimal A, (2, 0) → (0, 0), alle Pfeile fallen, Nullmatrix |
| 79,9–93,2 s | Erste Frage: ein Pfeil schrumpft, alle Richtungen, Ja |
| 93,2–116,1 s | Zweite Frage: (3, 2) kippt, Rundlauf, x-Achse schrumpft, nur 1 Richtung, Nein |
| 116,1–125,8 s | Falsch (ab 120,2 s), F eingekreist, echte Lösungszeile |
| 125,8–138,7 s | A kippt, A² macht alles zu null |
| 138,7–143,7 s | CTA |

## Sprechtext

Stimme Chris (iir30Q1pQmHS1AgZ2mNe), eleven_v4, 1 Take, ohne Pausen-Tags.

> Das ist eine echte Frage aus einer Harvard-Abschlussklausur von 2003.
> Wenn A Quadrat diagonalisierbar ist, dann ist auch A diagonalisierbar.
> Wahr oder falsch?
> Klären wir zuerst, was das Wort bedeutet.
> Eine Matrix nimmt einen Pfeil und macht daraus einen neuen Pfeil.
> Meistens kippt er dabei in eine andere Richtung.
> Aber manche Pfeile bleiben auf ihrer Linie. Sie werden nur länger oder kürzer.
> Das sind die Eigenvektoren.
> Und jetzt die einzige Regel, die du brauchst:
> Findest du in der Ebene zwei verschiedene Richtungen, die auf ihrer Linie bleiben, ist die Matrix diagonalisierbar.
> Findest du weniger als zwei, ist sie es nicht.
> Um den Satz zu widerlegen, reicht ein einziges Beispiel: eine Matrix, bei der A Quadrat diagonalisierbar ist, aber A nicht.
> Probieren wir diese hier.
> Sie macht etwas ganz Einfaches: Die untere Zahl rutscht nach oben, und unten steht eine Null.
> Aus drei, zwei wird also zwei, null.
> A Quadrat heißt: das Ganze zweimal hintereinander.
> Beim zweiten Mal rutscht die Null nach oben. Aus zwei, null wird null, null.
> Das passiert mit jedem Pfeil. Nach zwei Schritten ist alles null.
> A Quadrat ist also die Nullmatrix.
> Erste Frage: Ist die Nullmatrix diagonalisierbar?
> Sie schrumpft jeden Pfeil auf null. Geschrumpft, nicht gekippt. Er bleibt also auf seiner Linie.
> Das gilt für jede Richtung. Also ja.
> Zweite Frage: Ist A diagonalisierbar?
> Aus drei, zwei wird zwei, null. Der Pfeil ist weggekippt.
> Das passiert jedem Pfeil, der nicht auf der x-Achse liegt.
> Nur die x-Achse selbst bleibt: Aus drei, null wird null, null. Geschrumpft, nicht gekippt.
> Das ist nur eine Richtung. Wir brauchen zwei. Also nein.
> A Quadrat ist diagonalisierbar, A nicht. Die Aussage ist falsch.
> Genau diese Matrix steht auch in der Lösung zur Klausur.
> Warum geht das? A kippt Pfeile weg, und genau deshalb ist sie nicht diagonalisierbar.
> A Quadrat kippt nichts mehr, sondern macht alles zu null. Das Kippen ist im Ergebnis nicht mehr zu sehen.
> Mehr Uni-Mathe verstehen und üben? Such im App Store nach UniMathe.

## Ton

Eigener Synth-Track (`tools/music-hv.mjs`), Fassungen mit und ohne Musik. Spannung bis zum Einkreisen, Stille vor „falsch“.

## Kosten

Fassung 2: 2.021 Credits (40,42 ¢, 1 Take). Fassung 1: 1.087 Credits (21,74 ¢).
