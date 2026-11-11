# Storyboard: Wie kann eine Matrix einen Vektor verschwinden lassen? (Kern)

Status: v2 in `src/kn/` (50,2 s), Branch `video/kern-verschwindet`, abgenommen.
- v1 (49,2 s): Feedback „erster Satz gefällt überhaupt nicht“, und die Matrix stand unauffällig oben rechts.
- v2: neuer Hook-Satz als eigene Aufnahme `public/voice/kn-hook2.mp3` (109 Credits, 6,96 s). Die Matrix steht im Hook groß in der Mitte. Die (2; 2) fliegt vom Pfeil heran, die Matrix schickt einen Lichtstrahl auf v, bei „nichts!“ steht A · (2; 2) = (0; 0) da. Ab „Spul zurück“ ist die Matrix ein Schild oben in der Mitte.
- Stimme: `public/voice/kn-take1.mp3`, Chris, eleven_v4, 760 Credits, 49,12 s, ein Take. Clips mit Pausen aus `GAP` in `src/kn/timeline.ts`.
- Musik: `tools/music-kn.mjs` → `public/music-kn.wav`.
- Compositions: `Kern-Verschwindet` und `Kern-Verschwindet-ohneMusik`.

Format: 9:16, 1080 × 1920, 60 fps, Deutsch. Text nur in y 300–1500 und x < 940.

## Leitidee „Die Schiene ins Nichts“

A = (1 −1; 0 0), A·(x, y) = (x − y, 0). A² = A: schräge Projektion auf die x-Achse.
Animation von I nach A: M(s) = (1 −s; 0 1−s), M(s)·p = p − s·y·(1, 1). Jeder Punkt fährt parallel zu (1, 1) auf seiner Schiene y − x = c bis zur x-Achse. det M(s) = 1 − s > 0.
Die Schiene durch den Nullpunkt ist y = x: alles darauf landet in 0. Das ist ker A.

## Mathematik (mit node geprüft)

- A·(2, 2) = 0, ebenso (1, 1), (4, 4), (−2, −2), (−2,5; −2,5), (0, 0).
- (3, 1) → (2, 0), (−1, 2) → (−3, 0).
- (3, 1) und (4, 2) liegen auf derselben Schiene y = x − 2 und landen beide auf (2, 0).

## Szenen

Die Zeiten der Tabelle ab „Schienen“ stammen aus v1; in v2 liegt alles danach etwa 1,6 s später.

| Zeit | Bild |
|---|---|
| 0–7,5 | Große Matrix in der Mitte, v = (2, 2) mit „v ≠ 0“. Die (2; 2) fliegt neben die Matrix, Lichtstrahl von der Matrix auf v, das Gitter fällt auf die x-Achse, v ist bei „nichts!“ (3,7 s) im Nullpunkt. A · (2; 2) = (0; 0), „Nullvektor“, „?“. |
| 5,9–11,4 | Zurückspulen. Gitterpunkte leuchten, rutschen auf ihren Schienen auf die x-Achse, Spuren werden zu Schienen. |
| 11,4–18,7 | (3, 1) und (−1, 2) landen als cyanfarbene Pfeile auf der Achse. v = (2, 2) auf der Schiene in den Nullpunkt, fährt hinein, Blitz. |
| 18,7–29,4 | 2v, ½v, −v fahren nacheinander in den Nullpunkt. Die ganze Gerade füllt sich mit Vektoren, alle landen zugleich: „unendlich viele → ein Punkt“. |
| 29,4–37,9 | Zurückspulen: Gerade „Kern von A – Vektoren vor der Abbildung“. Formel ker(A) = {v ∣ A·v = 0} aus der Szene (v von (2, 2), A aus der Matrix, 0 aus dem Nullpunkt). A·0 = 0. |
| 37,9–44,9 | (3, 1) und (4, 2) landen beide auf (2, 0), gestrichelte Rückwege mit „?“. |
| 44,9–49,2 | CTA mit Logo und Suchfeld. |

## Sprechtext

> Ich schicke diesen Vektor durch eine Matrix. Heraus kommt: … nichts! Nur der Nullvektor. Was ist da passiert?
> Spul zurück und schau auf alle Punkte: Jeder rutscht schräg, bis er auf der x-Achse liegt.
> Die anderen Pfeile landen irgendwo auf der Achse. Aber unser Pfeil liegt genau auf der Schiene, die im Nullpunkt endet.
> Moment. Dann verschwindet nicht nur er. Der doppelte, der halbe, der umgedrehte – jeder Vektor auf dieser Geraden. Unendlich viele, in einem einzigen Punkt.
> Alle Vektoren auf dieser Geraden zusammen heißen der Kern von A: alle v, für die A mal v null ist. Der Nullvektor gehört immer dazu.
> Deshalb gibt es kein Zurück: Diese zwei Vektoren landen auf demselben Punkt. Von dort weiß niemand mehr, welcher es war.
> Mehr Aha-Momente: Such im App Store nach UniMathe.
