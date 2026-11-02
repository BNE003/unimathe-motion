# UniMathe · Vektorräume · Storyboard v2 (Entwurf zur Freigabe)

**Status:** Story und Sprechtext freigegeben (mit 3D), gebaut in `src/vr/`, gerendert mit ElevenLabs-Take (1 Take).
v1 („Zwei Pfeile, zwei Regeln“) war dem Nutzer zu unverständlich: Der Hook (Punktwolke + Kollaps) setzte voraus, dass man Strecken, Addieren und Spann schon kennt, und es kamen zu viele Konzepte zu schnell (drei Tests, 3D).

Format: 9:16 · 1080×1920 · 60 fps · ca. 135 s
Stil: „Dark Swiss“ wie beim Eigenvektor-Video (Serien-Look)
Stimme: ElevenLabs eleven_v4, Voice `iir30Q1pQmHS1AgZ2mNe` (Chris). Ca. 1.950 Zeichen → ca. 1.950 Credits pro Take; exakte Schätzung und Freigabe vor der Erzeugung.

## Idee: „A oder B?“

Der Hook ist eine konkrete Quizfrage zu zwei Objekten, die jeder sofort sieht: zwei fast gleiche, parallele Linien. Nur eine ist ein Vektorraum. Das Video beantwortet die Frage Schritt für Schritt und dreht sie am Ende um: Die richtige Linie entsteht von selbst, wenn man einen Pfeil streckt (Spann). Damit schließt sich der Kreis.

Didaktische Regeln:
- Grundlagen zuerst: „Vektor = Pfeil vom Nullpunkt“ und „Linie = Menge von Vektoren“ werden explizit gezeigt, bevor getestet wird.
- Ein Gedanke pro Szene, immer mit konkreten Zahlen.
- Nur zwei Mengen (A und B), kein dritter Test. 3D kommt einmal, am Ende, als Ausblick auf die App-Aufgabe im ℝ³.
- Begriff erst nach dem Bild.
- Praktischer Merksatz für die Klausur: „Ohne Nullpunkt kein Vektorraum.“

## Mathematik (fix)

- Linie A: y = x/2 (durch 0, Richtung u = (2, 1)) → Unterraum von ℝ²
- Linie B: y = x/2 + 1 (parallel, verschoben) → kein Unterraum
- Pfeile auf A: Spitzen (2, 1), (−2, −1), (4, 2), …; Pfeile auf B: Spitzen (0, 1), (2, 2), (−2, 0), …
- Addieren: (2, 1) + (1, 2) = (3, 3)
- Strecken: 2·(2, 1) = (4, 2); (−1)·(2, 1) = (−2, −1)
- Test A: (−2, −1) + (4, 2) = (2, 1) liegt auf A ✓; (−1)·(4, 2) = (−4, −2) liegt auf A ✓
- Test B: (0, 1) + (2, 2) = (2, 3); auf B wäre bei x = 2 der Wert y = 2 → (2, 3) liegt nicht auf B ✗
- Schnelltest B: 0·(0, 1) = (0, 0); B enthält bei x = 0 nur (0, 1) → Nullvektor fehlt ✗
- Spann eines Pfeils: { λ·(2, 1) | λ ∈ ℝ } = Linie A
- Zweiter Pfeil w = (1, 2): (4, 5) = 1·u + 2·w = (2, 1) + (2, 4) ✓; Span(u, w) = ℝ²
- Redundant: w = (4, 2) = 2·u → Span(u, w) = Linie A
- 3D: u = (2, 1, 0), w = (1, 2, 0) spannen die Ebene z = 0 auf; t = (0, 0, 2) liegt nicht darin → Span(u, w, t) = ℝ³; t = (3, 3, 0) = u + w liegt darin → Span bleibt die Ebene
- App-Aufgabe: v₁ = (1,2,3), v₂ = (2,4,6) = 2·v₁, v₃ = (1,1,1). Im Video nur der Tipp, keine Lösung.
- Korrektheit: Im Video geht es um Teilmengen des ℝ². Eine solche Menge ist ein (Unter-)Vektorraum, wenn sie nicht leer ist und abgeschlossen unter + und ·; die Rechenregeln (Axiome) erbt sie vom ℝ². On-Screen-Fußnote bei der Definition: „Unterraum-Test im ℝ² · Rechenregeln erbt die Menge vom ℝ²“.

## Farbcode

Bühne #07081A · Gitter #4B2BE6 → #00C8C8 · **Mengen A und B: Weiß-Lavendel #A6ADD3** (bewusst gleich, „fast gleich“) · Vektoren der Menge #A6ADD3 · Ergebnis und dritter Pfeil t Weiß #F3F4FB · **u Amber #FFC247** · **w Cyan #00C8C8** · **Zahlen/Skalare Koralle #FF7A5C** · **„fällt raus“ Magenta #FF4FD8** · Text #F3F4FB / #7E84AD

## Sprechtext komplett (ca. 310 Wörter)

> Diese zwei Linien sehen fast gleich aus. Aber nur eine davon ist ein Vektorraum. Welche? Und warum?
> Zuerst: Ein Vektor ist ein Pfeil vom Nullpunkt aus. Jeder Punkt auf einer Linie ist die Spitze so eines Pfeils. Eine Linie ist also eine Menge von Vektoren.
> Mit Vektoren kannst du zwei Dinge tun. Addieren: Du hängst Pfeile aneinander. Zwei, eins plus eins, zwei ergibt drei, drei. Und Strecken: Du nimmst einen Pfeil mal eine Zahl. Mal zwei wird er doppelt so lang, mal minus eins dreht er sich um.
> Ein Vektorraum ist eine Menge, in der beides immer klappt, ohne dass du sie verlässt. Was du addierst oder streckst, bleibt drin.
> Testen wir Linie A. Sie geht durch den Nullpunkt. Zwei Vektoren darauf, addiert: Das Ergebnis liegt wieder auf der Linie. Gestreckt: bleibt auch drauf. Bestanden.
> Jetzt Linie B. Zwei Vektoren darauf, addiert: Das Ergebnis landet daneben. Durchgefallen. Und es geht noch schneller: Mal null ergibt den Nullvektor. Und der liegt gar nicht auf B.
> Merk dir das: Ohne Nullpunkt kein Vektorraum.
> Aber wie baut man Vektorräume? Nimm einen Pfeil und streck ihn mit allen Zahlen. Heraus kommt: genau Linie A.
> Mit einem zweiten Pfeil in eine neue Richtung kommst du überall hin. Zum Punkt vier, fünf: einmal u plus zweimal w. Das nennt man Linearkombination. Und alle Kombinationen zusammen füllen die ganze Ebene. Das ist der Spann.
> Zeigt der zweite Pfeil aber in dieselbe Richtung, bringt er nichts Neues. Du bleibst auf der Linie.
> Im Raum geht das genauso weiter: Zwei Pfeile spannen eine Ebene auf. Ein dritter, der aus ihr herauszeigt, füllt den ganzen Raum. Liegt er dagegen in der Ebene, bringt er wieder nichts Neues.
> Genau darum geht es in dieser UniMathe-Aufgabe: Bringt jeder der drei Vektoren etwas Neues? Tipp: Schau dir v eins und v zwei genau an.
> UniMathe. Mathe verstehen. Selbst lösen.

## Szenen

### S1 · Hook: A oder B? · 0:00–0:07
- Sprechtext: „Diese zwei Linien sehen fast gleich aus. Aber nur eine davon ist ein Vektorraum. Welche? Und warum?“
- Bild: Koordinatensystem, zwei parallele Linien in gleicher Farbe, groß beschriftet „A“ und „B“. Schon im ersten Frame zeichnen sich beide Linien gleichzeitig von links nach rechts.
- Animation: Linien wachsen, Labels A/B springen mit Feder ein; bei „Welche?“ pulsieren beide abwechselnd.
- On-Screen: „Nur eine ist ein Vektorraum.“ → „A oder B?“
- Übergang: Zoom auf den Nullpunkt.
- Sound: Swell, zwei kurze Töne für A und B.

### S2 · Was ist hier ein Vektor? · 0:07–0:19
- Sprechtext: „Zuerst: Ein Vektor ist ein Pfeil vom Nullpunkt aus. Jeder Punkt auf einer Linie ist die Spitze so eines Pfeils. Eine Linie ist also eine Menge von Vektoren.“
- Bild: Ein Pfeil vom Nullpunkt zu (2, 1). Dann gleitet die Spitze die Linie A entlang, und der Pfeil folgt (eine Kette von Pfeilspitzen bleibt kurz stehen). Dasselbe kurz für B.
- Mathe: Punkt (2, 1) ↔ Pfeil (2, 1).
- On-Screen: „Vektor = Pfeil vom Nullpunkt“ → „Linie = Menge von Vektoren“; Fußnote „(im ℝ²)“
- Übergang: durchgehend.
- Sound: leises Ticken, während die Pfeile wandern.

### S3 · Zwei Rechenarten · 0:19–0:37
- Sprechtext: „Mit Vektoren kannst du zwei Dinge tun. Addieren: Du hängst Pfeile aneinander. Zwei, eins plus eins, zwei ergibt drei, drei. Und Strecken: Du nimmst einen Pfeil mal eine Zahl. Mal zwei wird er doppelt so lang, mal minus eins dreht er sich um.“
- Bild: Linien A/B ausgeblendet, Fokus auf die zwei Operationen, jeweils mit Rechnung oben.
  - Addieren: (2, 1) und (1, 2); der zweite Pfeil gleitet an die Spitze des ersten, der weiße Summenpfeil zeigt auf (3, 3).
  - Strecken: (2, 1) mit Koralle-Regler: ×2 → (4, 2), ×(−1) → (−2, −1), der Pfeil schnappt durch den Nullpunkt.
- On-Screen: „1 · Addieren“ / „2 · Strecken“
- Übergang: harter Schnitt zwischen den beiden Operationen, Wischen in S4.
- Sound: Klick beim Andocken, Tick je Streckstufe.

### S4 · Die Regel · 0:37–0:45
- Sprechtext: „Ein Vektorraum ist eine Menge, in der beides immer klappt, ohne dass du sie verlässt. Was du addierst oder streckst, bleibt drin.“
- Bild: große Swiss-Typo-Karte.
- On-Screen: „Addieren → bleibt drin.“ / „Strecken → bleibt drin.“; Fußnote „Unterraum-Test im ℝ² · Rechenregeln erbt die Menge vom ℝ²“
- Übergang: Zoom zurück auf die Bühne mit A und B.
- Sound: Musik-Puls setzt ein.

### S5 · Test: Linie A · 0:45–0:56
- Sprechtext: „Testen wir Linie A. Sie geht durch den Nullpunkt. Zwei Vektoren darauf, addiert: Das Ergebnis liegt wieder auf der Linie. Gestreckt: bleibt auch drauf. Bestanden.“
- Bild: nur Linie A hervorgehoben, B gedimmt. Nullpunkt leuchtet auf der Linie.
- Mathe: (−2, −1) + (4, 2) = (2, 1) ✓; (−1)·(4, 2) = (−4, −2) ✓
- Animation: Pfeile docken an, das Ergebnis rastet auf der Linie ein; Stempel „✓ Vektorraum“.
- Übergang: Kameraschwenk zu B.
- Sound: positiver Ton.

### S6 · Test: Linie B · 0:56–1:08
- Sprechtext: „Jetzt Linie B. Zwei Vektoren darauf, addiert: Das Ergebnis landet daneben. Durchgefallen. Und es geht noch schneller: Mal null ergibt den Nullvektor. Und der liegt gar nicht auf B.“
- Bild: Linie B hervorgehoben, A gedimmt.
- Mathe: (0, 1) + (2, 2) = (2, 3), springt magenta neben die Linie; Abstand zur Linie als kurzer Strich. Dann 0·(0, 1): der Pfeil schrumpft auf den Nullpunkt, der Nullpunkt blinkt magenta „nicht auf B“.
- On-Screen: „✗ (2, 3) liegt nicht auf B“ → „0 · v = 0 fehlt“
- Übergang: harter Schnitt.
- Sound: kurzer Buzz.

### S7 · Merksatz · 1:08–1:12
- Sprechtext: „Merk dir das: Ohne Nullpunkt kein Vektorraum.“
- Bild: große Typo, darunter A mit leuchtendem Nullpunkt.
- On-Screen: „Ohne Nullpunkt kein Vektorraum.“ (Nullpunkt-Symbol in Weiß, Rest gedimmt)
- Übergang: Match Cut, der Nullpunkt bleibt, alles andere baut sich neu auf.
- Sound: Akzent.

### S8 · Wie baut man einen Vektorraum? · 1:12–1:21
- Sprechtext: „Aber wie baut man Vektorräume? Nimm einen Pfeil und streck ihn mit allen Zahlen. Heraus kommt: genau Linie A.“
- Bild: leere Ebene, nur u = (2, 1) in Amber. Koralle-Regler λ läuft von −3 bis 3, die Spitze hinterlässt eine Spur. Die Spur wird zur Linie und deckt sich exakt mit der eingeblendeten Linie A, die aufleuchtet.
- Mathe: { λ·u } = Linie A
- On-Screen: „Alle Vielfachen von u = Linie A“
- Übergang: durchgehend.
- Sound: aufsteigender Ton, Aha-Akzent beim Deckungsmoment.

### S9 · Zwei Pfeile: Linearkombination und Spann · 1:21–1:37
- Sprechtext: „Mit einem zweiten Pfeil in eine neue Richtung kommst du überall hin. Zum Punkt vier, fünf: einmal u plus zweimal w. Das nennt man Linearkombination. Und alle Kombinationen zusammen füllen die ganze Ebene. Das ist der Spann.“
- Bild: w = (1, 2) in Cyan kommt dazu. Ziel (4, 5) pulsiert, die Route u → w → w trifft das Ziel. Danach laufen die Regler λ, μ, und die Ebene füllt sich mit einem Netz aus Linien parallel zu u und w.
- Mathe: 1·u + 2·w = (4, 5); Span(u, w) = { λu + μw } = ℝ²
- On-Screen: „1·u + 2·w = (4, 5)“ → „Linearkombination“ → „Spann = ganze Ebene“
- Übergang: durchgehend, das Netz bleibt stehen.
- Sound: Treffer-Akzent, Musik öffnet sich.

### S10 · Nichts Neues · 1:37–1:44
- Sprechtext: „Zeigt der zweite Pfeil aber in dieselbe Richtung, bringt er nichts Neues. Du bleibst auf der Linie.“
- Bild: w dreht auf (4, 2), das Netz klappt flach auf Linie A zusammen.
- Mathe: w = 2·u ⇒ Spann = Linie A
- On-Screen: „w = 2·u → nichts Neues“
- Übergang: Transformation, w dreht zurück, und die Ebene kippt in 3D.
- Sound: tiefer Kollaps-Ton.

### S11 · 3D: im Raum geht es weiter · 1:44–1:57
- Sprechtext: „Im Raum geht das genauso weiter: Zwei Pfeile spannen eine Ebene auf. Ein dritter, der aus ihr herauszeigt, füllt den ganzen Raum. Liegt er dagegen in der Ebene, bringt er wieder nichts Neues.“
- Bild: Die Ebene aus S9 (Netz von u und w) kippt in eine 3D-Perspektive (Code, perspektivische Projektion), die z-Achse wächst aus dem Nullpunkt. Langsame Kamerafahrt um den Ursprung.
  - Dritter Pfeil t = (0, 0, 2) in Weiß zeigt nach oben. Kopien der Ebene schieben sich entlang t nach oben und unten (gestapelte, durchscheinende Schichten), bis der Raum gefüllt wirkt.
  - Dann kippt t in die Ebene auf (3, 3, 0) = u + w. Die Schichten fallen auf die eine Ebene zurück.
- Mathe: u = (2, 1, 0), w = (1, 2, 0) → Span = Ebene z = 0; t = (0, 0, 2) liegt nicht in der Ebene → Span(u, w, t) = ℝ³; t = (3, 3, 0) = u + w → Span bleibt die Ebene.
- On-Screen: „2 Pfeile → Ebene“ → „+ neue Richtung → ganzer Raum“ → „t = u + w → nichts Neues“
- Übergang: Match Cut, die drei Pfeile werden zu den drei Vektoren v₁, v₂, v₃ der App-Aufgabe.
- Sound: Swell beim Füllen des Raums, Kollaps-Ton beim Zurückfallen.

### S12 · UniMathe-Bridge · 1:57–2:08
- Sprechtext: „Genau darum geht es in dieser UniMathe-Aufgabe: Bringt jeder der drei Vektoren etwas Neues? Tipp: Schau dir v eins und v zwei genau an.“
- Bild: `assets/screen-aufgabe-unterraeume.png` im Fenster (unverändert), Fokus auf v₁, v₂, v₃; Koralle-Rahmen um v₁ und v₂ beim Tipp. Optional davor 1 s `assets/screen-vektorraeume-r3.png` (Addition und Strecken im ℝ³).
- On-Screen: „Jetzt du.“
- Übergang: Wischen (Amber-Linie).

### S13 · CTA · 2:08–2:14
- Sprechtext: „UniMathe. Mathe verstehen. Selbst lösen.“
- Bild: CTA-Frame der Serie, Mono-Zeile „Lineare Algebra · Vektorräume · Unterräume“.

Übergangsfolge: Zoom → durchgehend → harter Schnitt/Wischen → Zoom → Schwenk → harter Schnitt → Match Cut → durchgehend → durchgehend → Transformation (in 3D) → Match Cut → Wischen.
