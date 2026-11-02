# UniMathe · Eigenvektoren & Eigenwerte · Storyboard v3

**Status:** Story und Sprechtext am 2026-10-31 freigegeben; gebaut in `src/scenes/v3.tsx` + `outro.tsx`, gerendert mit ElevenLabs-Take 1.

Format: 9:16 · 1080×1920 · 60 fps · ca. 96 s
Stil: „Dark Swiss“ (freigegeben, `styleframe/stilrahmen.png`)
Stimme: ElevenLabs über MCP, Voice-ID `iir30Q1pQmHS1AgZ2mNe`, Modell Multilingual v2, satzweise erzeugen. Vor jeder Erzeugung: Inhalt, Grund, Credits, Euro nennen und Freigabe abwarten (ca. 1.350 Zeichen ≈ 1.350 Credits pro Durchgang).
Ton: SFX und Musik-Puls aus Code (`tools/audio.mjs`). Zwei Fassungen: mit Musik / ohne Musik.
Plattform: nur App Store.

## Didaktische Regeln (aus dem Feedback zu v2)

- Ein Gedanke pro Szene. Kein Zurückspulen.
- Erst rechnen, dann sehen: A·x wird als Rechnung aufgebaut, bevor der Pfeil erscheint.
- Das Gitter bleibt bis Szene 9 ruhig (statisches Koordinatensystem). Raum-Verformung nur im „großen Bild“.
- Pro Szene höchstens eine kurze Headline (≤ 5 Wörter) plus Mathematik.
- Der Zuschauer sucht mit: der Aha-Moment („Hier!“) kommt vor der Formel.

## Mathematik (fix)

- A = (2 1; 1 2)
- A·(1,0) = (2·1 + 1·0, 1·1 + 2·0) = (2,1); Kippwinkel arctan(½) ≈ 26,6°
- Suche: Sonde x(θ) = (cos θ, sin θ), Bild A·x(θ). x und A·x liegen genau bei θ = 45° und θ = −45° (und den Gegenrichtungen) auf einer Linie.
- A·(1,1) = (3,3) = 3·(1,1) → λ = 3
- A·(1,−1) = (1,−1) → λ = 1 (Suche in S8 läuft im Uhrzeigersinn von 45° über 0° nach −45°, damit (1,−1) und nicht (−1,1) gefunden wird; passt zur App: v₁ = (1,−1), λ₁ = 1)
- Definition: Av = λv mit v ≠ 0
- Großes Bild: A symmetrisch → Einheitskreis wird Ellipse mit Halbachsen 3 (entlang (1,1)) und 1 (entlang (1,−1)). Zwischenbilder (1−t)·I + t·A halten beide Eigenlinien.
- Winkel zwischen x und A·x live: arccos(x·Ax / (|x||Ax|)), Anzeige mit Komma, eine Nachkommastelle.

## Farbcode (fix)

Bühne #07081A · Raum & Matrix A #4B2BE6 → #00C8C8 · **x (Ausgangsvektor) #A6ADD3** · **A·x (Ergebnis) Cyan #00C8C8** (Farbe von A) · Eigenvektor v #FFC247 (x und A·x werden amber, sobald sie auf einer Linie liegen) · Eigenwert λ #FF7A5C · Text #F3F4FB / #7E84AD

## Sprechtext komplett

> Diese Matrix verdreht fast jeden Vektor. Aber nicht jeden.
> Eine Matrix macht aus einem Vektor einen neuen. Nimm den Vektor eins, null. A mal eins, null ergibt zwei, eins.
> Der neue Vektor zeigt in eine andere Richtung. Er liegt nicht mehr auf der Linie des alten. Er wurde gedreht.
> Gibt es einen Vektor, den A nicht dreht? Einen, der auf seiner eigenen Linie bleibt?
> Lass uns suchen. Wir drehen den Vektor einmal im Kreis und schauen, wohin A ihn schickt … Hier! Entlang dieser Linie zeigen beide in dieselbe Richtung.
> Nehmen wir den Vektor eins, eins. A mal eins, eins ergibt drei, drei. Das ist genau dreimal der alte Vektor: gleiche Richtung, nur dreimal so lang.
> Genau so einen Vektor nennt man Eigenvektor. Und den Faktor, um den er gestreckt wird, nennt man Eigenwert, hier also drei. Kurz: A v gleich Lambda v.
> Suchen wir in die andere Richtung, finden wir noch einen: eins, minus eins. Den lässt A sogar komplett unverändert. Sein Eigenwert ist eins.
> Und das ist der eigentliche Trick: Entlang seiner Eigenvektoren dreht A gar nichts. Es streckt nur, dreifach in die eine Richtung, in die andere gar nicht.
> Genau dieses Beispiel findest du in UniMathe, mit beiden Eigenwerten: eins und drei. Und wie du Eigenwerte ohne Suchen berechnest, übst du dort Schritt für Schritt.
> UniMathe. Mathe verstehen. Selbst lösen.

## Szenen

### S1 · Hook · 0:00–0:05
- Sprechtext: „Diese Matrix verdreht fast jeden Vektor. Aber nicht jeden.“
- Bild: ruhiges Koordinatensystem, ein grauer Vektor x kreist langsam (Start schon in Bewegung), A·x in Cyan läuft schief hinterher, ein Bogen zeigt den Winkel zwischen beiden.
- Mathe: x(θ) für θ ≈ −40° → 44°, A·x live; kurz vor 45° flackert die Amber-Linie auf (Vorgriff, nicht aufgelöst).
- Animation: gleichmäßige Drehung, Bogen atmet mit; bei „nicht jeden“ Amber-Flash.
- On-Screen: „Fast jeder wird gedreht.“ → „Aber nicht jeder.“ (zweite Zeile amber)
- Übergang: harter Schnitt auf den Beat.
- Sound: tiefer Swell, Flash = kurzer heller Ton.

### S2 · Was macht A? · 0:05–0:16
- Sprechtext: „Eine Matrix macht aus einem Vektor einen neuen. Nimm den Vektor eins, null. A mal eins, null ergibt zwei, eins.“
- Bild: oben Rechnung A·(1,0) = (2,1); unten Koordinatensystem.
- Mathe: Zeile 1 von A leuchtet mit (1,0) → „2·1 + 1·0 = 2“; Zeile 2 → „1·1 + 2·0 = 1“; Ergebnis (2,1) in Cyan.
- Animation: Zeilen-Highlight wandert, Ergebnis rastet mit Feder ein; danach wächst x = (1,0) grau, dann A·x = (2,1) cyan aus dem Ursprung.
- On-Screen: Headline „Matrix mal Vektor“
- Übergang: durchgehend (gleiche Bühne).
- Sound: Puls setzt ein; Klick beim Einrasten jeder Ergebniszeile.

### S3 · Gedreht · 0:16–0:24
- Sprechtext: „Der neue Vektor zeigt in eine andere Richtung. Er liegt nicht mehr auf der Linie des alten. Er wurde gedreht.“
- Bild: gestrichelte Linie durch (1,0) zeichnet sich; A·x liegt sichtbar daneben; Bogen 26,6°.
- Animation: Linie wächst vom Ursprung; Bogen zählt hoch bis „26,6°“.
- On-Screen: „gedreht um 26,6°“ (Mono)
- Übergang: Maske entlang einer Rasterlinie in die Frage-Szene.
- Sound: „Tick“ beim Einrasten des Winkels.

### S4 · Die Frage · 0:24–0:30
- Sprechtext: „Gibt es einen Vektor, den A nicht dreht? Einen, der auf seiner eigenen Linie bleibt?“
- Bild: große Typo, Bühne gedimmt im Hintergrund.
- On-Screen: „Gibt es einen,“ / „der nicht gedreht wird?“
- Übergang: Zoom zurück in die Bühne.
- Sound: Musik dünnt aus (Spannung).

### S5 · Die Suche · 0:30–0:41
- Sprechtext: „Lass uns suchen. Wir drehen den Vektor einmal im Kreis und schauen, wohin A ihn schickt … Hier! Entlang dieser Linie zeigen beide in dieselbe Richtung.“
- Bild: Sonde x grau auf Einheitskreis (Kreis gestrichelt), A·x cyan, Winkelzähler groß in Mono.
- Mathe: θ von 0° → 45° gegen den Uhrzeigersinn; Zähler 26,6° … 0,0°.
- Animation: Drehung verlangsamt sich vor 45° (ease-out), Einrasten bei 0,0°: beide Pfeile werden amber, gestrichelte Amber-Linie durch beide, Glow.
- On-Screen: Winkel live; bei Treffer „0,0°“ + „Hier!“
- Übergang: Match Cut (gefundene Linie bleibt stehen).
- Sound: leiser Ticker während der Drehung, „Lock“-Ton beim Treffer.

### S6 · Nachrechnen · 0:41–0:52
- Sprechtext: „Nehmen wir den Vektor eins, eins. A mal eins, eins ergibt drei, drei. Das ist genau dreimal der alte Vektor: gleiche Richtung, nur dreimal so lang.“
- Bild: v = (1,1) auf der Amber-Linie (Maßmarken 1·v, 2·v, 3·v), oben Rechnung.
- Mathe: A·(1,1) = (2+1, 1+2) = (3,3) = 3·(1,1); Pfeil wächst von 1·v auf 3·v.
- Animation: Rechnung wie in S2; Koralle-Zähler ×1,0 → ×3; Feder beim Ankommen.
- On-Screen: „Gleiche Richtung. 3× so lang.“ („3×“ koralle)
- Übergang: Transformation, die Gleichung (3,3) = 3·(1,1) formt sich zu Av = 3v.
- Sound: aufsteigender Ton beim Strecken, Akzent bei „dreimal“.

### S7 · Definition (Aha) · 0:52–1:03
- Sprechtext: „Genau so einen Vektor nennt man Eigenvektor. Und den Faktor, um den er gestreckt wird, nennt man Eigenwert, hier also drei. Kurz: A v gleich Lambda v.“
- Bild: Hero-Bild aus dem Stilrahmen: Av = 3v groß, 3 morpht zu λ → Av = λv.
- Animation: Label „Eigenvektor“ auf das Wort, „Eigenwert“ auf das Wort, Morph auf „Lambda“; danach ca. 0,8 s Stille.
- On-Screen: Av = λv, Labels Matrix / Eigenwert / Eigenvektor, klein „v ≠ 0“.
- Übergang: harter Schnitt nach der Stille.
- Sound: Klick beim Morph, dann Stille.

### S8 · Der zweite · 1:03–1:11
- Sprechtext: „Suchen wir in die andere Richtung, finden wir noch einen: eins, minus eins. Den lässt A sogar komplett unverändert. Sein Eigenwert ist eins.“
- Bild: Suche wie S5, diesmal im Uhrzeigersinn von 45° über 0° nach −45°; erste Amber-Linie bleibt.
- Mathe: bei −45° liegt A·x exakt auf x (gleiche Länge). Label: (1,−1): λ = 1.
- Animation: Einrasten, zweite Amber-Linie; A·x und x decken sich (kurzer Doppel-Glow).
- On-Screen: „Noch einer.“ · „(1, −1): λ = 1“
- Übergang: Zoom heraus (Kamera fährt zurück, Gitter wird sichtbar).
- Sound: zweiter „Lock“, eine Terz höher.

### S9 · Das große Bild · 1:11–1:21
- Sprechtext: „Und das ist der eigentliche Trick: Entlang seiner Eigenvektoren dreht A gar nichts. Es streckt nur, dreifach in die eine Richtung, in die andere gar nicht.“
- Bild: Gitter + Einheitskreis + beide Amber-Linien; Transformation (1−t)·I + t·A.
- Mathe: Kreis → Ellipse, Halbachse 3 entlang (1,1), 1 entlang (1,−1); Beschriftung „×3“ und „×1“ (koralle) an den Achsen.
- Animation: eine einzige ruhige Transformation (ca. 2 s), Ellipsenachsen leuchten.
- On-Screen: „Entlang der Eigenvektoren: nur strecken.“
- Übergang: Match Cut, A = (2 1; 1 2) fliegt auf die Matrix im App-Screen.
- Sound: Musik öffnet sich.

### S10a · Bridge: dieses Beispiel in der App · 1:21–1:26
- Sprechtext: „Genau dieses Beispiel findest du in UniMathe, mit beiden Eigenwerten: eins und drei.“
- Bild: echter Screen `assets/screen-erklaerung-eigenwerte.webp` im Fenster (unverändert, Ausschnitt/Zoom wie v2: Fokus (461, 1075), Faktor 1,1), Koralle-Unterstreichung unter „λ₁ = 1, λ₂ = 3“.
- Hinweis: Zeile „v₁ = 1, −1ᵀ“ hat in der App fehlende Klammern → nicht in den Fokus nehmen.
- Übergang: Zoom in den zweiten Screen.

### S10b · Bridge: selbst üben · 1:26–1:31
- Sprechtext: „Und wie du Eigenwerte ohne Suchen berechnest, übst du dort Schritt für Schritt.“
- Bild: echter Screen `assets/screen-aufgabe-diagonalisierung.webp`, Fokus auf „Schritt 1“ und det(A − λI) (Koralle-Rahmen als Overlay).
- On-Screen: „Verstanden?“ / „Jetzt selbst lösen.“
- Übergang: Wischen, Amber-Linie fegt diagonal.

### S11 · CTA · 1:31–1:36
- Sprechtext: „UniMathe. Mathe verstehen. Selbst lösen.“
- Bild: CTA-Frame aus dem Stilrahmen (Originallogo, Wortmarke, „Mathe verstehen. Selbst lösen.“, Button „Jetzt im App Store“).
- Sound: finaler Akzent, Ausklang.

Übergangsfolge: harter Schnitt → durchgehend → Maske → Zoom → Match Cut → Transformation → harter Schnitt → Zoom → Match Cut → Zoom → Wischen (keine zwei gleichen direkt hintereinander).

## Wiederverwendbar aus v2

`src/plane.tsx` (Stage, Arrow, SpanLine, AngleArc, Ticks), `src/ui.tsx` (Headline, Header, Mono, MatrixView, EigenFormula, Grain), `src/scenes/outro.tsx` (S7a/S7b/S8 → S10a/S10b/S11), `tools/audio.mjs`, `tools/render.mjs`, `tools/stills.mjs`, `tools/sheet.sh`.
