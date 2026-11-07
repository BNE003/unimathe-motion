# Storyboard: Die dominante Eigenrichtung

Status: vom Nutzer als verbindliches Briefing vorgegeben (2026-11-07), gebaut in `src/er/` (59,5 s) und abgenommen. Branch `video/dominante-eigenrichtung`. Stimme: `er-take1.mp3`, 1 Take, 1.070 Credits (65,76 s).

Format: 9:16, 1080 × 1920, 60 fps, Deutsch, Ziel 50–60 s.

## Kürzung der Aufnahme

Die Aufnahme war 65,8 s lang. Herausgeschnitten (keine neue Erzeugung):
- der Satz „Die Vektoren zeigen zuerst in völlig unterschiedliche Richtungen.“ und das folgende „Doch“, es bleibt „… immer wieder anwende. Mit jeder Anwendung richten sie sich …“
- 18 lange Sprechpausen um zusammen 3,06 s

Die Erklärung mit den zwei Anteilen und der wiederholten Verdopplung ist vollständig.

## Mathematik (geprüft)

- A = [[2, 0], [0, 1]], A · (x; y) = (2x; y), Aⁿ · (x; y) = (2ⁿx; y).
- (1, 1) → (2, 1) → (4, 1) → (8, 1), Winkel zur x-Achse 45° → 26,6° → 14,0° → 7,1°, in echten Längen gezeigt.
- Fächer: 14 Startrichtungen 12°…168° ohne 90°, also alle mit x ≠ 0, links und rechts. Nach 7 Anwendungen weicht keine mehr als 2,1° von der x-Achse ab; links liegende nähern sich der negativen Richtung.
- Im Fächer wird nach jedem Schritt auf gleiche Länge normiert, das ändert nur die Länge. Zwischen Aⁿv und Aⁿ⁺¹v wird linear interpoliert (x-Faktor 2ⁿ · (1 + s)), es gibt keine Drehung.
- Eigenrichtungen: x-Achse mit λ = 2 (der horizontale Pfeil wird bei jeder Anwendung doppelt so lang), y-Achse mit λ = 1 (der vertikale Pfeil bleibt gleich).

## Bühne

Die Ebene der Matrix steht senkrecht auf einem Glasboden: (x, y) liegt bei Welt (x, 0, y). Die x-Achse liegt auf dem Boden, „oben“ ist wirklich oben. Spiegelungen im Glas, Staub vor und hinter der Ebene, feine Lichtstrahlen. Die Matrix schwebt als Glastafel über dem Fächer, jede Anwendung schickt einen Lichtring von ihr aus; jeder Vektor wird umgerechnet, wenn der Ring seine Spitze erreicht.

## Szenen (Zeiten im Video)

| Zeit | Bild und Kamera |
|---|---|
| 0–4,4 s | Kamera fliegt von nah und schräg aus dem Fächer zurück, Matrix schwebt darüber |
| 4,4–8,6 s | 7 Impulse, erst deutlich, dann dichter: der Fächer legt sich auf die Linie |
| 10,2–11,8 s | „Warum?“: Fächer verblasst, der 45°-Vektor läuft zurück auf (1, 1), Kamera fährt heran, Matrix gleitet nach oben |
| 11,6–18,6 s | Ein Vektor (1, 1), Winkel 45°, Anteile amber (1) und cyan (1) |
| 18,6–29,5 s | Verdopplungen mit ×2: (2, 1), (4, 1), (8, 1), Geister der früheren Zustände, Folge oben, Zoom folgt der echten Länge |
| 31–39 s | Linien von der 2 zum horizontalen und von der 1 zum vertikalen Anteil, dann A(x; y) = (2x; y) und Aⁿ(x; y) = (2ⁿx; y) |
| 39–54 s | Flug zurück in den Raum, Fächer neu, x-Achse leuchtet: „Eigenrichtung“, horizontaler Pfeil ×2 je Impuls, vertikaler λ = 1, 9 Impulse richten den Fächer aus |
| 54,8–59,5 s | CTA |

## Technik

Canvas-Bühne mit eigener Perspektivkamera (`src/space.ts`), Staub, Strahlen und Pfeile nach `src/sk/`, kein Three.js. Musik `tools/music-er.mjs` → `public/music-er.wav`. Compositions `Dominante-Eigenrichtung` und `-ohneMusik`.
