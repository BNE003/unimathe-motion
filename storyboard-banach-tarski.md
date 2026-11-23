# Storyboard: Banach-Tarski (Aha-Video)

Status: Konzept freigegeben am 2026-11-23. v1 (50,1 s) mit Feedback; v2 gebaut in `src/bt/` (70,5 s). Branch `video/banach-tarski`.
Stimme: Chris, eleven_v4. Take 1 (bt-take1.mp3, 739 Credits) und Take 2 (bt-take2.mp3, 606 Credits) mit neuem Hook, Baumaufbau und Brücke zur Kugel, im Wechsel eingeschnitten (VOICES/src in timeline.ts).

Format: 9:16, 1080 × 1920, 60 fps, Deutsch.

## Idee in einem Satz

Der Trick steckt im unendlichen Baum der Wege: Rückt man den linken Ast einen Schritt nach rechts, wird er zum ganzen Baum ohne den rechten Ast. Auf der Kugel ist ein Schritt eine Drehung, und die Teile werden zu Staub ohne Volumen.

## Mathematik (geprüft, Assertions in src/bt/group.ts)

- a, b = Drehungen um die x- bzw. z-Achse mit cos = 1/3. Sie erzeugen eine freie Gruppe. Geprüft: kein Wort bis Länge 7 ist die Identität.
- F₂ = {e} ∪ S(a) ∪ S(a⁻¹) ∪ S(b) ∪ S(b⁻¹) und a·S(a⁻¹) = F₂ \ S(a). Geprüft auf Wortebene bis Länge 6.
- Baumbild: Das Weiterrücken mit a ist eine Streckung ×2 um (−2, 0) (geprüft). Das ist eine Zeichenkonvention; auf der Kugel ist derselbe Schritt eine Drehung.
- Bahn auf der Kugel (Wörter ≤ 4): Alle Punkte sind verschieden. Die Drehung um a bringt jeden Punkt aus S(a⁻¹) exakt auf einen vorhandenen Bahnpunkt.
- Satz: Die Vollkugel lässt sich in 5 Teile zerlegen (Minimum, Robinson 1947). Die Teile sind nicht messbar, der Beweis braucht das Auswahlaxiom. Physikalisch ist das unmöglich.
- Darstellung: Der Staub ist symbolisch, das steht im Bild. Die echten Teile kann man nicht zeichnen.

## v2 nach Feedback (2026-11-23)

Feedback zu v1:
- Beim Zoom war der Baum dahinter noch zu sehen.
- Die 4 Pfeile passten nicht zu den Achsen.
- Es war nicht genau zu sehen, wie der Baum entsteht.
- Der Zusammenhang zwischen Baum und Kugel war unklar.
- Der Hook sollte neu: „Das hier dürfte eigentlich unmöglich sein. Aber ich kann aus einer Kugel zwei machen – ohne irgendetwas hinzuzufügen.“

Umsetzung in v2:
- Beim Weiterrücken gibt es keinen Geisterbaum mehr, oben und unten werden ausgeblendet.
- Die Pfeilspitzen sitzen auf den Achsenenden.
- Der Baum entsteht Schritt für Schritt:
  1. Ein Punkt.
  2. Rechts, links, oben, unten einzeln.
  3. Am rechten Ende die drei neuen Schritte, der Rückweg durchgestrichen.
  4. Die Längen 1 und ½.
  5. Dann der Rest.
- Die Brücke zur Kugel:
  - Ein kleiner Baum steht neben der Kugel.
  - Achse 1 (rechts/links) und Achse 2 (oben/unten) mit echten Drehwegen vom Startpunkt.
  - Die Bahn wächst synchron.
  - „Ast verschieben = Kugel drehen“: Die Kugel dreht um a, und gleichzeitig rückt der Ast im kleinen Baum.

## Szenen v1 (Zeiten im v1-Video; v2 siehe oben und src/bt/timeline.ts)

| Zeit | Sprechtext | Bild |
|---|---|---|
| 0–6,4 | Ich zerlege eine Kugel, drehe und verschiebe die Teile, und habe zwei Kugeln, jede so groß wie die erste. | Kugel, „1 Kugel“. Sie zerfällt in Staub aus fünf Farben, der wirbelt und sich teilt. Zwei Kugeln entstehen, „1 Kugel → 2 Kugeln“, Radiusmarken r. |
| 6,9–8,7 | Kein Trick, ein bewiesener Satz. | „Satz von Banach–Tarski, 1924“, „5 Teile genügen“. |
| 9,2 | Wie geht das? | Die Kugeln verblassen. |
| 10,4–15,1 | Stell dir alle Wege in vier Richtungen vor, ohne Umkehren: ein unendlicher Baum. | Ein Punkt, vier Schritte (→ amber, ← koralle, ↑ cyan, ↓ lavendel), dann wächst das Fraktal bis Tiefe 7. |
| 15,7–21,1 | Geh mit dem linken Ast einen Schritt nach rechts: Er wird zum ganzen Baum, nur ohne den rechten Ast. | Die Äste rücken auseinander, ein Geisterbaum erscheint. Der korallfarbene Ast streckt sich und rastet exakt ein, der amber Ast pulsiert. |
| 21,7–25,6 | Zusammen mit dem rechten: ein ganzer Baum. Oben und unten genauso. | Baum 1 (amber + koralle) gleitet nach links. Lavendel rückt nach oben, Baum 2 entsteht, „4 Äste → 2 Bäume“. |
| 26,8–31,2 | Auf der Kugel ist ein Schritt eine Drehung, und jeder Punkt liegt auf so einem Baum. | Glaskugel mit echter Bahn (Wörter ≤ 3). „1 Schritt = 1 Drehung“: Der Koralle-Ast dreht um die a-Achse und rastet auf vorhandenen Punkten ein. Danach weitere Bahnen. |
| 31,7–35 | Aus jedem wählt man einen Startpunkt: das Auswahlaxiom. | Die Startpunkte pulsieren, „Auswahlaxiom“. |
| 35,6–39 | Die Teile werden zu Staub. Drehen, zusammensetzen: zwei Kugeln. | Fünffarbiger Staub mit dem Hinweis „symbolisch“. Koralle dreht um die x-Achse, Lavendel um die z-Achse, es entstehen zwei Kugeln. |
| 40,7–44 | Der Haken: Diesem Staub kann man kein Volumen zuordnen. | Nahaufnahme des Koralle-Staubs, „Volumen = ?“. |
| 44,5–46 | Mit echtem Gold geht das nicht. | Goldkugel mit Atomraster, „Mathematik ja, Physik nein“. |
| 46,7–50,1 | Mehr Mathe? Such im App Store nach UniMathe. | CTA. |
