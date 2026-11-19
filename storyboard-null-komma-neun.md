# Storyboard: Warum ist 0,999… = 1? (Reihe WARUM?, Folge 2)

Status: freigegeben am 2026-11-17, gebaut in `src/nn/` (48,5 s), v1 abgenommen am 2026-11-19. Branch `video/null-komma-neun`. Stimme: Chris, eleven_v4, 1 Take, 722 Credits (50,4 s roh), Sprechpausen auf 0,2–1,0 s gesetzt. „x“ steht im Stimmtext als „iks“.

Format: 9:16, 1080 × 1920, 60 fps, Deutsch, Ziel 45–50 s.

## Mathematik (geprüft)

- 0,999… ist der Grenzwert von 0,9; 0,99; 0,999; … Jede endliche Näherung 0,99…9 (n Neunen) ist kleiner als 1, ihr Abstand zu 1 ist 10⁻ⁿ.
- 10 · 0,999… = 9,999… (alle Ziffern rücken eine Stelle, von hinten kommen Neunen nach, weil es keine letzte gibt). 9,999… − 0,999… = 9, also 9x = 9 und x = 1.
- Die Abstände 10⁻ⁿ unterbieten jede positive Zahl; da 0,999… zwischen allen Näherungen und 1 liegt, ist sein Abstand zu 1 gleich 0.
- Nirgends steht ein eigener Punkt „0,999…“ links von 1. Auf der Geraden tragen nur endliche Näherungen Punkte; „0,999…“ landet am Ende als Beschriftung auf dem Punkt der 1.

## Szenen (Zeiten im Video)

| Zeit | Sprechtext | Bild |
|---|---|---|
| 0–5,2 | Diese Zahl sieht kleiner aus als eins. Aber mathematisch ist sie exakt gleich eins. | „0,“ ab Bild 1, Neunen tippen sich ein und laufen als kleiner werdender Schweif aus, amber „1“. Korallenrotes „<“ bei „kleiner“, kippt bei „Aber“ (2,4 s) in „=“. |
| 5,6–12,0 | Egal wie viele Neunen wir schreiben, es fehlt scheinbar immer ein Stück. Stimmt: Jede davon ist kleiner als eins. | „0,999… = 1“ gleitet als Anker nach oben. Zahlengerade 0–1, Punkt 0,9, Lücke korallenrot. Vier ×10-Zooms auf die 1: das Bild sieht jedes Mal gleich aus, die alte Näherung wandert an den linken Rand, die neue erscheint an derselben Stelle (0,99 … 0,99999). „0,9 < 0,99 < 0,999 < … < 1“. |
| 12,4–14,6 | Aber hier stehen unendlich viele Neunen. | Gerade blendet aus, der Anker wird groß zur Zeile 0,999…, Lauflicht im Schweif. |
| 14,9–23,3 | Nennen wir die Zahl x. Mal zehn verschiebt das Komma. Jetzt ziehen wir x ab. Die Neunen enden nie – jede oben hat eine Partnerin unten. | „x = 0,999…“; Kopie steigt auf zu „10x“, alle Ziffern rücken eine Stelle nach links, die erste 9 über das Komma, aus dem Schweif rückt eine Neun nach: „10x = 9,999…“. Minus, Strich. Amber Partnerlinien Spalte für Spalte bis in den Schweif (geometrisch, alle in endlicher Zeit). |
| 23,3–28,6 | Übrig bleibt: neun x gleich neun. Also x gleich eins. | Paare lösen sich als Welle bis ins Unendliche auf, Kommas verschwinden: „10x = 9“, „− x = 0“, darunter „9x = 9“, dann „x = 1“. |
| 28,7–29,6 | – | „x = 1“ gleitet nach rechts, x wird zu „0,999…“: „0,999… = 1“. |
| 29,6–39,7 | Der Abstand zur Eins: ein Zehntel, ein Hundertstel, ein Tausendstel. Er wird kleiner als jede noch so winzige Zahl. Bei unendlich vielen Neunen bleibt nichts übrig. | Anker oben. Feste Skala ohne Zoom: 0,9 mit Lücke 0,1 (70 px), 0,99 (7 px), 0,999 (unsichtbar). Zeilen „1 − 0,9 = 0,1“, „1 − 0,99 = 0,01“, „1 − 0,999 = 0,001“. Die letzte wächst: Neunen links, Nullen rechts, die 1 wandert in den Schweif und verschwindet; „= 0“ rastet amber ein. |
| 40,4–44,4 | Sie ist nicht unterwegs zur Eins. Sie ist die Eins, nur anders geschrieben. | Näherungen blenden aus, „0,999… = 1“ groß in der Mitte, Beschriftung „0,999…“ senkt sich auf den Punkt der 1 (über der „1“), Punkt leuchtet. |
| 44,9–48,5 | Mehr davon? Such im App Store nach UniMathe. | CTA wie üblich. |

## Ton

Musik `tools/music-nn.mjs` (Schema music-kr): Schlag bei „<“ → „=“, Stille bei x = 1 und bei „= 0“, Dur ab „Sie ist die Eins“, Arpeggio im CTA.
