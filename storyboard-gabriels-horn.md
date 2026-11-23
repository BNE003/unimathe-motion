# Storyboard: Gabriels Horn (Aha-Video)

Status: Konzept freigegeben am 2026-11-23, v1 gebaut in `src/gh/` (55,4 s). Branch `video/gabriels-horn`.
Stimme: Chris, eleven_v4, 1 Take, 790 Credits (52,16 s roh), Pausen im Video per GAP-Map gesetzt.

Format: 9:16, 1080 × 1920, 60 fps, Deutsch.

## Idee in einem Satz

Das Horn ist selbstähnlich: Das Stück [2a, 4a] ist das Stück [a, 2a] mit doppelter Länge und halber Dicke. Daraus folgt:
- Volumen: 2 · ¼ = ½ pro Stück, also π/2 + π/4 + … = π.
- Haut: 2 · ½ = 1 pro Stück, also jedes Stück über 4 Flächeneinheiten, und das unendlich oft.

## Mathematik (geprüft, Assertions in src/gh/fn.ts)

- V = π∫₁^∞ dx/x² = π. Stück [a, 2a]: π/(2a).
- A = 2π∫₁^∞ (1/x)·√(1 + 1/x⁴) dx ≥ 2π∫₁^∞ dx/x = ∞.
  - Geschlossene Form über u = x²: π[asinh(u) − √(u² + 1)/u].
  - Stückhaut: 5,02 / 4,40 / 4,358 / … → 2π·ln 2 ≈ 4,355. Immer über 4, aber nicht exakt gleich. Deshalb heißt es im Sprechtext „wieder über vier“.
- Abgerollter Streifen (ohne Schräge): genau 2π·ln 2 für jedes Stück, Faktor 2 · ½ = 1.
- „π Liter“: Es gilt 1 Einheit = 1 dm, das steht im Bild.
- „Außen gleichmäßig anstreichen“: Eine Schicht konstanter Dicke braucht A·d = ∞.

## Szenen (Zeiten im Video)

| Zeit | Sprechtext | Bild |
|---|---|---|
| 0–2 | Dieses Horn ist unendlich lang. | Frame 0: Horn in starker Perspektive, „Länge = ∞“. Die Kamera fliegt den Schwanz entlang. |
| 2,4–5,3 | Trotzdem kannst du es mit genau Pi Litern Farbe füllen. | Amber Füllung, die Front rast ins Unendliche. Der Zähler V rastet bei π ≈ 3,14 L ein. |
| 5,7–9,8 | Aber um es außen gleichmäßig anzustreichen, reicht keine Farbe der Welt. | Cyan Anstrich mit Front. Der Zähler A (dm²) wächst ohne Ende und kippt auf ∞. |
| 10,4 | Wie geht das? | Die Zähler werden zur Kopfzeile „V = π, A = ∞“ neben dem Logo. |
| 11,4–16,2 | Das Horn entsteht, wenn die Kurve 1/x um die x-Achse rotiert. | Das Horn löst sich in die Kurve auf (2D-Ansicht). Die Fläche entsteht durch eine 360°-Rotation, dann folgt die Seitenansicht. |
| 16,4–19,4 | Schneiden wir es in Stücke … | Schnitte bei 2, 4, 8. Marken 1, 2, 4, 8. |
| 20,1–24,5 | Zieh ein Stück auf doppelte Länge und halbe Dicke: Es passt genau auf das nächste. | Eine Glaskopie von [1, 2] hebt sich ab und zeigt „Länge ×2, Dicke ×½“. Sie rastet exakt auf [2, 4] ein. Dann [2, 4] → [4, 8]. |
| 25,8–30 | Halbe Dicke heißt ein Viertel Querschnitt. Mal doppelte Länge: halbes Volumen. | Die Kamera dreht, die Querschnitte werden sichtbar. Die Scheibe mit r = ½ gleitet in die Scheibe mit r = 1. Rechenzeile: ¼ · 2 = ½. |
| 30,9–35 | π/2, π/4, π/8 … zusammen genau π. | Die Stücke füllen sich nacheinander, der Balken 0…π füllt sich in Halbierungen und rastet bei π. |
| 36–41,5 | Der Umfang halbiert sich aber nur. Mal doppelte Länge: Jedes Stück hat wieder über vier Flächeneinheiten. | Umfangsringe, Rechenzeile ½ · 2 = 1. Die Haut rollt sich bogenlängentreu ab, die Streifen bekommen je „> 4“. |
| 42,6–44,6 | Und die Stücke hören nie auf. | Die Kamera fährt mit, weitere Streifen folgen, „A > 4 + 4 + 4 + … = ∞“. |
| 45–50 | Endliches Volumen, unendliche Oberfläche. Das ist Gabriels Horn. | Heldenaufnahme mit Boden. Titel, V = π∫dx/x² = π, A ≥ 2π∫dx/x = ∞. |
| 51–55,4 | Mehr Mathe verstehen und üben? Such im App Store nach UniMathe. | CTA wie im Skalarprodukt-Video. |

## Technik

- 3D in Canvas 2D, ohne WebGL: tiefensortierte Flächen, Licht an der Kamera, Glas mit Rückseiten, Farbe als innere Hülle.
- Kamera mit einstellbarem Abstand (starke Perspektive im Hook).
- Musik `tools/music-gh.mjs` → `public/music-gh.wav` (Schema music-kr).
- Compositions `Gabriels-Horn` und `Gabriels-Horn-ohneMusik`.

## Abweichung vom Plan

Das ×2-Herauszoomen „sieht aus wie vorher“ ist entfallen. Die Selbstähnlichkeit ist nicht gleichmäßig (Länge ×2, Dicke ×½), deshalb würde ein normaler Zoom sie nicht zeigen. Sie wird nur mit der Streck-Kopie gezeigt.
