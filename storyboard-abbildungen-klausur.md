# Storyboard: Mathe 1 Klausuraufgabe – injektiv, surjektiv, bijektiv

Status: v1 gebaut am 2026-11-19 in `src/abb/` (104,1 s). v2 (103,9 s) abgenommen am 2026-11-19: Die Sätze mit b kommen aus `abb-take2-b.mp3` (200 Credits, „B“ statt „be“), weil Take 1 „be“ wie ein Wort sprach. Branch `video/abbildungen-klausur`. Stimme: Chris, eleven_v4, 1 Take, 1.433 Credits (100,56 s roh, 45 Abschnitte). „x“ steht im Stimmtext als „iks“, „y“ als „üpsilon“, „b“ als „be“, „f“ als „Eff“, „2ab“ als „zwei a mal be“.

Format: 9:16, 1080 × 1920, 60 fps, Deutsch. Altes dunkles Design. Text nur in y 300–1500 und x < 940.

## Aufgabe

f: ℝ∖{−1} → ℝ∖{2}, f(x) = (2x+3)/(x+1).
a) Ist f injektiv? b) Ist f surjektiv? c) Ist f bijektiv? Bestimmen Sie ggf. f⁻¹.

## Mathematik (geprüft, auch im Code: Graph.tsx wirft bei Fehler)

- f(x) = 2 + 1/(x+1): Hyperbel mit den Asymptoten x = −1 und y = 2.
- Injektiv: f(a) = f(b) mit a, b ≠ −1 ⇒ (2a+3)(b+1) = (2b+3)(a+1) ⇒ 2ab+2a+3b+3 = 2ab+2b+3a+3 ⇒ 2a+3b = 2b+3a ⇒ b = a.
- Surjektiv: Für y ≠ 2 sind alle Schritte Äquivalenzen: y(x+1) = 2x+3 ⇔ yx+y = 2x+3 ⇔ yx−2x = 3−y ⇔ x(y−2) = 3−y ⇔ x = (3−y)/(y−2).
  - Dieses x ist nie −1, denn sonst wäre 3−y = 2−y, also 3 = 2.
  - Bei y = 2 hieße die Gleichung x·0 = 1, also 0 = 1: kein Urbild.
- Bijektiv: f⁻¹: ℝ∖{2} → ℝ∖{−1}, f⁻¹(x) = (3−x)/(x−2) = −1 + 1/(x−2).
- Beispiele im Graph: f(−3) = 1,5 und f(1) = 2,5. In der Waagrechten-Szene: y → 2⁺ ⇒ x → +∞, y → 2⁻ ⇒ x → −∞.

## Farben

| Farbe | Bedeutung |
|---|---|
| Cyan | Eingaben x, a, b und die x-Achse |
| Amber | Werte y, die y-Achse, Bögen und Kreuzlinien beim Rechnen, Graph von f⁻¹ |
| Koralle | ausgeschlossene −1 und 2, Asymptoten, Widersprüche 0 = 1 und 3 = 2, Streichungen |
| Grün | Ergebnisse (Rahmen, „Ja ✓“) |
| Lavendel | Graph von f |

## Szenen (Zeiten im Video)

| Zeit | Sprechtext | Bild |
|---|---|---|
| 0–2 | Mathe-eins-Klausuraufgabe. | Die Karte steht mittig: Mengen, Funktionsterm, a) b) c). |
| 2–7,3 | Ist diese Abbildung injektiv, surjektiv, bijektiv? Und wie lautet die Umkehrfunktion? | Die Karte gleitet nach oben (y 300–500). Mengen und Term rücken nebeneinander, a) b) c) fliegen in drei Chips. Jeder Chip leuchtet bei seinem Wort. |
| 7,8–10,1 | Vorne fehlt die minus eins, hinten die zwei. | Der Graph zeichnet sich über den ganzen Bildschirm. Die Asymptoten x = −1 und y = 2 erscheinen koralle, die passenden Mengen in der Karte leuchten. |
| 10,7–16 | Teil a: injektiv. Injektiv heißt: Verschiedene Eingaben liefern verschiedene Werte. | Chip a ist aktiv. Am Graphen: −3 ↦ 1,5 und 1 ↦ 2,5. |
| 16,5–21 | Wir zeigen: Haben a und b denselben Wert, dann ist a gleich b. | Der Graph dimmt. „Zu zeigen: f(a) = f(b) ⇒ a = b“, darunter f(a) = f(b). Die Brüche entstehen aus f(a) und f(b). |
| 21,5–25 | Die Nenner sind nie null, also multiplizieren wir über Kreuz. | Notiz „a, b ≠ −1“. Kreuzlinien, dann wandern die Nenner über Kreuz nach oben. |
| 25,8–29 | Jetzt ausmultiplizieren. | Acht Bögen über den Faktoren, danach entstehen die Terme der Reihe nach. |
| 29–33 | Zwei a mal b und drei stehen auf beiden Seiten und fallen weg. | 2ab und 3 leuchten, werden gestrichen und fallen weg: 2a + 3b = 2b + 3a. |
| 33,5–39,5 | Minus zwei a, minus zwei b: Es bleibt b gleich a. f ist injektiv. | 2a fließt in 3a, 2b fließt in 3b, es bleibt b = a. Danach wird daraus a = b mit grünem Rahmen. Chip a: Ja ✓. |
| 40–46 | Teil b: surjektiv. Jede Zahl der Zielmenge muss getroffen werden, also jede Zahl außer zwei. | Eine amber Waagrechte läuft über den Graphen, der Schnittpunkt lotet auf die x-Achse. Bei y = 2 wird sie koralle mit „kein Urbild“, der Punkt verschwindet rechts und kommt links wieder. |
| 46,7–50 | Wir nehmen ein beliebiges y und suchen das passende x. | Die Waagrechte steht bei y = 3,5. Danach y = (2x+3)/(x+1). |
| 50,3–58 | Mal x plus eins. Klammer auflösen. Alles mit x nach links, der Rest nach rechts. x ausklammern. | Kürzel „│·(x+1)“. Die Nenner wandern nach links, y verteilt sich mit Bögen. 2x und y tauschen im Bogen die Seiten, + wird zu −. Die x verschmelzen zu x(y−2). |
| 58,8–63,5 | Und durch y minus zwei teilen. Das geht, denn y ist nie zwei. | Die alte Zeile bleibt gedimmt oben. (y−2) gleitet unter 3−y: x = (3−y)/(y−2). Notiz „y ≠ 2“. |
| 63,7–69 | Bei y gleich zwei stünde hier null gleich eins. Deshalb fehlt die Zwei in der Zielmenge. | Feld: „Für y = 2: x(2−2) = 3−2“ wird zu „0 = 1 ✗“. In der Karte leuchtet die {2}. |
| 69,4–73,5 | Und x ist nie minus eins, sonst folgt drei gleich zwei. | Feld: (3−y)/(y−2) = −1 → 3−y = 2−y → 3 = 2 ✗. In der Karte leuchtet die {−1}. |
| 73,8–77 | Jedes y hat also ein Urbild. f ist surjektiv. | Grüner Rahmen um x = (3−y)/(y−2). Chip b: Ja ✓. |
| 77,8–81,5 | Teil c: Injektiv und surjektiv heißt bijektiv. | Chip c: Ja ✓. |
| 81,7–86 | Die Umkehrfunktion steht schon da: Sie bringt jedes y zurück zu seinem x. | x wird zu f⁻¹(y), darunter y ⟼ x. |
| 86,4–88,5 | Mit x als Variable geschrieben. | Alle y werden zu x: f⁻¹(x) = (3−x)/(x−2). |
| 88,9–91,5 | Definitions- und Zielmenge tauschen dabei die Plätze. | Die Mengen fliegen aus der Karte und tauschen die Plätze: f⁻¹: ℝ∖{2} → ℝ∖{−1}. |
| 92–96 | Am Graphen ist das die Spiegelung an der Winkelhalbierenden. | Die Formeln rücken nach oben auf eine dunkle Unterlage, y = x erscheint. Der Graph klappt um y = x, die Asymptoten tauschen (x = 2, y = −1). |
| 96,5–99 | Injektiv, surjektiv, bijektiv: dreimal ja. | Zusammenfassung mit drei „Ja ✓“ und f⁻¹(x) = (3−x)/(x−2). |
| 99,6–104,1 | Mehr davon? Such im App Store nach UniMathe. | CTA wie üblich. |

## Technik

- `src/abb/kit.tsx`: `Morph`, Formelzeilen mit echten Brüchen.
  - Atome mit id gleiten zwischen Zuständen. `from` lässt ein Atom aus einem anderen entstehen, `into` lässt es in ein anderes einfließen, `arc` setzt die Bogenhöhe, `delay` versetzt den Start.
  - Die Breiten werden mit `texW` im Browser gemessen.
  - Eine fertige Zeile darf höchstens 880 px breit sein, sonst gibt es einen Fehler.
- `src/abb/Graph.tsx`: Canvas-Bühne für Gitter, Hyperbel, Asymptoten, Waagrechte und Faltung um y = x.
- `src/abb/Video.tsx`: Karte, Chips, Teil a, Teil b/c, Mengentausch, Zusammenfassung, CTA.
- `tools/music-abb.mjs` → `public/music-abb.wav`, übliches Schema: Stille bei „injektiv“ und „surjektiv“, Dur ab „bijektiv“.
