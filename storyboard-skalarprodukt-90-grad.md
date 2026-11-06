# Storyboard: Warum ist das Skalarprodukt bei 90° null?

Status: freigegeben am 2026-11-06 und gebaut in `src/sk/` (49,5 s). Branch `video/skalarprodukt-90-grad`. Stimme: 1 Take, 792 Credits (51,84 s), 15 Sprechpausen um zusammen 2,92 s gekürzt.

Format: 9:16, 1080 × 1920, 60 fps, Deutsch, Ziel 45–50 s.

## Idee in einem Satz

Zwei Vektoren spannen ein leuchtendes Rechteck aus Schatten × Länge auf. Bei 90° schrumpft der Schatten zu einem Punkt, und das Rechteck klappt zusammen, obwohl beide Vektoren voll da sind.

## Mathematik (geprüft)

- |a| = 4, |b| = 6, also a · b = 24 · cos(α): 24 bei 0°, 20,8 bei 30°, 12 bei 60°, 0 bei 90°.
- Der Schatten von a auf b ist |a| · cos(α). Das Rechteck hat die Seiten |a| · cos(α) und |b|, seine Fläche ist also genau a · b. Die Einheitsquadrate im Rechteck lassen sich zählen (24 bei 0°).
- Das Licht fällt senkrecht zu b. Bei 90° zeigt a in Lichtrichtung, sein Schatten ist ein Punkt.
- Gedreht wird nur von 0° bis 90°. Deshalb stimmt „Je größer der Winkel, desto kürzer“. Negative Werte kommen nicht vor.
- Bei 90° ist cos(α) = 0, also a · b = 0 für beliebige Längen. Vektoren ungleich null mit a · b = 0 heißen orthogonal, a ⊥ b.

## Bildsprache

- Farben aus src/theme.ts: a amber, b cyan, Schatten und Rechteck warm mit weichem Leuchten, Nulldrama weiß.
- Dunkler Glasboden mit feinem Gitter, Licht von oben als sichtbare feine Strahlen.
- Kamera nie stillstehend. Höhepunkt: Flug in die Blickrichtung des Lichts, a wird zum Punkt.
- Wichtiges liegt in y 300–1500 und x < 940, Untertitel bei y ≈ 1446.

## Logo

Ab Sekunde 3 klein oben links (x 72, y ≈ 312) mit dem Wort „UniMathe“ daneben, etwa 85 % Deckkraft. Im CTA gleitet dieses Logo in die Mitte und wächst. `public/unimathe-logo.webp` bleibt unverändert, nur skaliert, runde Ecken wie in allen Outros.

## Szenen (Zeiten geschätzt, endgültig nach der Stimme)

| Zeit | Bild | Erkenntnis |
|---|---|---|
| 0–8 s | a schwingt im ersten Bild, Schatten fegt über den Boden, Kamera kreist. a dreht auf 90°, Zahl fällt 24 → 0, Rechteck klappt mit Schlag zum Strich, Musik setzt aus. Beide Vektoren pulsieren in voller Länge. | Beide da, trotzdem 0 |
| 8–12 s | „Warum?“: a spult zurück. Bei 0° decken sich die Richtungen, Rechteck voll, Zahl 24. | Gleiche Richtung, volles Ergebnis |
| 12–22 s | Lichtstrahlen, a dreht langsam, Schatten und Rechteck schrumpfen, Zahl fällt. Bei 90° fliegt die Kamera in die Blickrichtung des Lichts: a wird zum Punkt. Rechter-Winkel-Zeichen. | Darum gibt es keinen Schatten |
| 22–32 s | Formel baut sich aus den Objekten: |a| vom Vektor, |b| vom anderen, cos(α) vom Winkelbogen. a schwenkt auf etwa 50°, |a|·cos(α) leuchtet wie der Schatten, |b| wie b, Rechteck zeigt das Produkt. | Die Formel ist dieses Bild |
| 32–41 s | a dreht auf 90°, cos(α) zählt auf 0, Rechteck schließt sich. Beide Vektoren wachsen weit aus dem Bild, Zahl bleibt 0. | 0 mal jede Länge bleibt 0 |
| 41–45 s | Kamera umkreist den rechten Winkel, groß `a ⊥ b` und „orthogonal“. | Der Begriff zum Bild |
| 45–49 s | CTA: Logo gleitet in die Mitte, darunter Suchfeld. | |

## Sprechtext

Stimme Chris (iir30Q1pQmHS1AgZ2mNe), eleven_v4, 1 Take, ohne Pausen-Tags. 121 Wörter, 793 Zeichen.

> Zwei Vektoren. Wenn ich einen davon drehe, passiert etwas Merkwürdiges.
> Bei genau neunzig Grad wird ihr Skalarprodukt null. Obwohl keiner der beiden Vektoren verschwindet.
> Warum?
> Das Skalarprodukt misst, wie stark zwei Vektoren in dieselbe Richtung zeigen.
> Stell dir vor, einer der Vektoren wirft einen Schatten auf den anderen. Je größer der Winkel, desto kürzer wird dieser Schatten.
> Bei neunzig Grad verschwindet er. Die Vektoren stehen senkrecht aufeinander.
> Und genau das steckt hinter dieser Formel.
> Betrag a mal Kosinus Alpha: genau dieser Schatten. Mal Betrag b: diese Fläche.
> Bei neunzig Grad ist der Kosinus null. Deshalb ist das ganze Skalarprodukt null, egal wie lang die Vektoren sind.
> Das nennt man Orthogonalität.
> Mehr Mathe verstehen und üben? Such im App Store nach UniMathe.

## Ton

- Eigener Synth-Track (`tools/music-sk.mjs`), tiefer Schlag auf Frame 0, Ausfall bei den Nullmomenten, Auflösung bei „Orthogonalität“.
- Effekte: Whoosh, Lock beim Einrasten der 0, Ticks bei den Formelteilen, Tippen im Suchfeld.
- Fassungen mit und ohne Musik.

## Kosten

Rund 800 Credits (etwa 0,16 $ ≈ 0,14 €, 1 Take). Wird die Stimme zu lang, kürze ich Pausen, keine neue Erzeugung.
