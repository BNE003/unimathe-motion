# UniMathe · Klausuraufgabe „Ebene im ℝ³“ · Storyboard v2 (Entwurf zur Freigabe)

**Status:** v2 freigegeben, gebaut in `src/ku/`, gerendert als `out/klausur-unterraum-*.mp4` (101,2 s). Stimme: 1 Take, 1.337 Credits.

**v1 abgelehnt** (gebaut in `src/ku/`, gerendert als `out/klausur-unterraum-*.mp4`). Feedback:
- Der Einstieg war komisch.
- Den Erklärungen konnte man nicht folgen, sie waren zu schnell.
- Man wusste nicht mehr, wie die Aufgabe aussah.

Ursachen:
- Der Hook „Ja oder nein?“ mit Countdown und sofortigem „Antwort: Ja, aber kaum Punkte“ war ein Gag, keine Orientierung.
- Die Aufgabe verschwand nach 15 s.
- Vier Nebenideen kosteten Zeit, die bei der eigentlichen Rechnung fehlte: Beispiel ≠ Beweis mit Punktwolke, „Gleichungen addieren“-Trick, Aha mit „+ 1“, Wendung mit den Punkten.
- Rechenzeilen kamen und gingen in Sekunden, und das Ziel jeder Rechnung wurde nie vorher gesagt.

Format: 9:16 · 1080×1920 · 60 fps · ca. 90–100 s (Sprechtext 176 Wörter + 24 Pausen ≈ 91 s Stimme; Szenenzeiten unten grob auf 100 s gerechnet)
Stil: „Dark Swiss“ (Serien-Look). Die 3D-Ebene wird aus v1 übernommen.
Stimme: ElevenLabs eleven_v4, Chris, 1 Take
App-Screen: `screen-aufgabe-unterraum-r3.png` (wie in v1)

## Idee: „Die Lösung in 3 Schritten“, mit Aufgabe immer im Bild

Das Video ist wie ein ruhiger Tutor: Es sagt am Anfang, was kommt, und arbeitet dann eine Checkliste ab. Drei Regeln tragen alles:

1. **Die Aufgabe bleibt immer sichtbar.** Ab Szene 2 steht oben eine feste Aufgabenkarte mit U = { (x, y, z) ∈ ℝ³ | x + y = 2z }. Darunter steht die Fortschrittsleiste ① Nullvektor · ② Summe · ③ Vielfaches. Man weiß jederzeit, worum es geht und wo man steht.
2. **Erst das Ziel, dann die Rechnung.** Jeder Nachweis hat dieselbe Struktur und dieselben Beschriftungen: `GEGEBEN` → `ZU ZEIGEN` → `RECHNUNG`. Erst wenn klar ist, wo man hinwill, wird gerechnet.
3. **Langsam und stehen lassen.**
   - Eine Rechenzeile pro Satz.
   - Jede Zeile bleibt stehen, bis die Szene endet.
   - Nach jedem Teilschritt gibt es eine hörbare Pause.
   - Die 3D-Ebene ist nur Bestätigung am Ende eines Schritts. Während gerechnet wird, tritt sie zurück.

Gestrichen gegenüber v1:
- Countdown und „Ja gibt kaum Punkte“
- Punktwolke „1 von ∞“
- „+ 1“-Aha
- Trick „Gleichungen addieren“, ersetzt durch den klassischen Klausurweg: umsortieren, einsetzen, ausklammern. So steht es auch in der App.

## Mathematik (fix, alles aus Code)

- U = { x + y = 2z } ist eine Ebene durch den Ursprung.
  - Beispiel (1, 1, 1): 1 + 1 = 2 = 2·1 ✓
- Kriterien: (1) 0 ∈ U (2) u, v ∈ U ⇒ u + v ∈ U (3) u ∈ U, λ ∈ ℝ ⇒ λu ∈ U
- **(1)** 0 + 0 = 0 = 2·0 ⇒ (0, 0, 0) ∈ U
- **(2)**
  - Gegeben: u = (x₁, y₁, z₁), v = (x₂, y₂, z₂) ∈ U, also x₁ + y₁ = 2z₁ und x₂ + y₂ = 2z₂.
  - Zu zeigen: (x₁ + x₂) + (y₁ + y₂) = 2(z₁ + z₂).
  - Rechnung:
    (x₁ + x₂) + (y₁ + y₂)
    = (x₁ + y₁) + (x₂ + y₂)  (umsortiert)
    = 2z₁ + 2z₂  (eingesetzt)
    = 2(z₁ + z₂) ✓  (ausgeklammert)
- **(3)**
  - Gegeben: u = (x₁, y₁, z₁) ∈ U, λ ∈ ℝ.
  - Zu zeigen: λx₁ + λy₁ = 2(λz₁).
  - Rechnung:
    λx₁ + λy₁
    = λ(x₁ + y₁)  (ausgeklammert)
    = λ·2z₁  (eingesetzt)
    = 2(λz₁) ✓  (umgestellt)
- Fazit: Alle drei erfüllt ⇒ U ist ein Untervektorraum von ℝ³.

## Bildaufbau (gilt ab Szene 2)

```
 y 170–360   AUFGABENKARTE (fest): „Aufgabe“ · U = {(x,y,z) ∈ ℝ³ | x + y = 2z} · „Untervektorraum von ℝ³?“
 y 390–460   FORTSCHRITT (fest):  ① Nullvektor   ② Summe   ③ Vielfaches   (leer → aktiv → ✓)
 y 520–1120  ARBEITSFLÄCHE: GEGEBEN / ZU ZEIGEN / RECHNUNG, Formeln groß (≈ 50 px)
 y 1140–1560 3D-BÜHNE: Ebene U, nur als Bestätigung (während des Rechnens auf 30 % gedimmt)
 ab y 1600   frei für Plattform-UI
```

Farbcode wie in Teil 1:
- u und alles mit Index 1: Amber
- v und alles mit Index 2: Cyan
- λ: Koralle
- Ergebnis und ✓: Weiß
- Ebene: Lavendel

Hervorhebung beim Einsetzen: Die Gleichung unter GEGEBEN, die gerade benutzt wird, leuchtet auf. Eine feine Linie läuft von ihr zu dem Term, der ersetzt wird.

## Szenen

Die Zeiten sind geschätzt (Sprechtempo von Take 1, ca. 2,1 Wörter/s inklusive Pausen). Die endgültigen Zeiten kommen aus der Stimme.

### S1 · Hook (0–7 s)
**Bild:**
- Ab Frame 1 steht groß und mittig die Aufgabenkarte, Header `KLAUSURAUFGABE · LINEARE ALGEBRA`:
  „Gegeben ist U = { (x, y, z) ∈ ℝ³ | x + y = 2z }. Ist U ein Untervektorraum von ℝ³?“
- Bei „in drei Schritten“ erscheinen darunter drei leere Felder ① ② ③ und die Zeile „Lösung in 3 Schritten“.
- Danach fährt die Karte nach oben in ihre feste Position (Übergang zu S2).

> Typische Klausuraufgabe: Ist U ein Untervektorraum? [pause] Ich zeig dir die Lösung in drei Schritten.

### S2 · Was bedeutet U? (7–23 s)
**Bild:**
- Die Arbeitsfläche zeigt in Worten: „U = alle Punkte mit x + y = 2z“.
- Beispiel: (1, 1, 1) wird in die Gleichung eingesetzt, `1 + 1 = 2 · 1`, dann `2 = 2 ✓`.
- Der Punkt erscheint auf der 3D-Bühne.
- Bei „bilden eine Ebene“ wachsen weitere passende Punkte aus und verdichten sich zur Ebene.

> Was bedeutet U? [pause] Alle Punkte, bei denen x plus y genau zwei z ergibt. [pause] Zum Beispiel eins, eins, eins: Eins plus eins gleich zwei mal eins. Passt. [pause] Alle passenden Punkte bilden zusammen eine Ebene.

### S3 · Der Plan (23–31 s)
**Bild:** Die drei Felder der Fortschrittsleiste beschriften sich nacheinander. Auf der Arbeitsfläche steht dazu groß:
```
① Nullvektor    0 ∈ U
② Summe         u + v ∈ U
③ Vielfaches    λu ∈ U
```
Daneben steht klein: „alle drei zeigen ⇒ Untervektorraum“.

> Für einen Untervektorraum prüfst du drei Bedingungen: [pause] Nullvektor, Summe, Vielfaches.

### S4 · Schritt 1: Nullvektor (31–43 s)
**Bild:** ① wird aktiv (Amber). Auf der Arbeitsfläche:
```
ZU ZEIGEN   (0, 0, 0) erfüllt x + y = 2z
RECHNUNG    0 + 0 = 2 · 0
            0 = 0  ✓
```
- Die Nullen werden sichtbar in die Gleichung aus der Aufgabenkarte eingesetzt: x, y, z leuchten kurz auf.
- Zum Schluss pulsiert der Ursprung auf der Bühne *in* der Ebene. ① ✓

> Erstens: der Nullvektor. [pause] Setz ihn ein: null plus null ist null, zwei mal null auch. [pause] Passt. Der Nullvektor liegt in U.

### S5 · Schritt 2: Summe (43–73 s), der Kern, mit doppelt so viel Zeit
**Bild:** ② wird aktiv. Die Arbeitsfläche baut sich Zeile für Zeile auf, und alles bleibt stehen:
```
GEGEBEN     u ∈ U:  x₁ + y₁ = 2z₁          (Amber)
            v ∈ U:  x₂ + y₂ = 2z₂          (Cyan)
ZU ZEIGEN   (x₁ + x₂) + (y₁ + y₂) = 2(z₁ + z₂)
RECHNUNG    (x₁ + x₂) + (y₁ + y₂)
          = (x₁ + y₁) + (x₂ + y₂)          ← umsortiert
          = 2z₁ + 2z₂                       ← eingesetzt (GEGEBEN leuchtet)
          = 2(z₁ + z₂)  ✓                   ← ausgeklammert = rechte Seite von ZU ZEIGEN
```
- Bei „Zu zeigen“ wird die Zeile kurz eingerahmt. Bei der letzten Zeile leuchtet derselbe Rahmen wieder auf: Ziel erreicht.
- Die farbigen Indizes zeigen beim Umsortieren, welche Terme zusammengehören.
- Erst ganz am Ende wird die Bühne hell: Zwei Pfeile u, v liegen auf der Ebene, die Summe u + v auch. ② ✓

> Zweitens: die Summe. Das ist der wichtigste Schritt. [pause] Nimm zwei beliebige Vektoren u und v aus U. Für beide gilt die Gleichung. [pause] Zu zeigen: Sie gilt auch für u plus v. [long pause] Sortier links um: alles von u, dann alles von v. [pause] Jetzt die Gleichungen einsetzen. [pause] Zwei ausklammern. Fertig: genau die rechte Seite.

### S6 · Schritt 3: Vielfaches (73–88 s)
**Bild:** ③ wird aktiv. Dieselbe Struktur, das Muster wiedererkennbar:
```
GEGEBEN     u ∈ U:  x₁ + y₁ = 2z₁,   λ ∈ ℝ
ZU ZEIGEN   λx₁ + λy₁ = 2(λz₁)
RECHNUNG    λx₁ + λy₁
          = λ(x₁ + y₁)                     ← ausgeklammert
          = λ · 2z₁                         ← eingesetzt
          = 2(λz₁)  ✓                       ← umgestellt
```
Am Ende auf der Bühne: Der Pfeil λu wird gestreckt und umgedreht und bleibt in der Ebene. ③ ✓

> Drittens: das Vielfache. Gleiches Muster. [pause] Zu zeigen: Die Gleichung gilt für lambda mal u. [pause] Lambda ausklammern, einsetzen, umstellen. [pause] Wieder genau die rechte Seite.

### S7 · Ergebnis (88–94 s)
**Bild:**
- Die Fortschrittsleiste ist komplett ✓ ✓ ✓.
- In der Aufgabenkarte erscheint unter der Frage die Antwort: „⇒ U ist ein Untervektorraum von ℝ³ ✓“.
- Die Ebene leuchtet einmal auf.

> Alle drei Bedingungen erfüllt. [pause] U ist ein Untervektorraum.

### S8 · Brücke zu UniMathe (94–99 s)
**Bild:**
- Der echte App-Screen (Aufgabe x + y + z = 0) im Telefon-Fenster, unverändert.
- Ausschnitt ohne Statusleiste. Die Karten Schritt 1, 2, 3 bekommen nacheinander Rahmen. Das passt zur Struktur des Videos, das ja auch in drei Schritten lief.

> Mehr Klausuraufgaben, Schritt für Schritt erklärt, findest du in UniMathe.

### S9 · CTA (99–102 s)
**Bild:** Original-Logo (unverändert), „Lineare Algebra · Untervektorräume“, App-Store-Pille.

> Jetzt im App Store.

## Sprechtext komplett

> Typische Klausuraufgabe: Ist U ein Untervektorraum? [pause] Ich zeig dir die Lösung in drei Schritten. [long pause]
> Was bedeutet U? [pause] Alle Punkte, bei denen x plus y genau zwei z ergibt. [pause] Zum Beispiel eins, eins, eins: Eins plus eins gleich zwei mal eins. Passt. [pause] Alle passenden Punkte bilden zusammen eine Ebene. [long pause]
> Für einen Untervektorraum prüfst du drei Bedingungen: [pause] Nullvektor, Summe, Vielfaches. [long pause]
> Erstens: der Nullvektor. [pause] Setz ihn ein: null plus null ist null, zwei mal null auch. [pause] Passt. Der Nullvektor liegt in U. [long pause]
> Zweitens: die Summe. Das ist der wichtigste Schritt. [pause] Nimm zwei beliebige Vektoren u und v aus U. Für beide gilt die Gleichung. [pause] Zu zeigen: Sie gilt auch für u plus v. [long pause] Sortier links um: alles von u, dann alles von v. [pause] Jetzt die Gleichungen einsetzen. [pause] Zwei ausklammern. Fertig: genau die rechte Seite. [long pause]
> Drittens: das Vielfache. Gleiches Muster. [pause] Zu zeigen: Die Gleichung gilt für lambda mal u. [pause] Lambda ausklammern, einsetzen, umstellen. [pause] Wieder genau die rechte Seite. [long pause]
> Alle drei Bedingungen erfüllt. [pause] U ist ein Untervektorraum. [long pause]
> Mehr Klausuraufgaben, Schritt für Schritt erklärt, findest du in UniMathe. [pause] Jetzt im App Store.

## Funnel-Check (Plan)

| Stufe | Wo |
|---|---|
| VIEW | S1: echte Klausuraufgabe ab Frame 1 plus klares Versprechen „Lösung in 3 Schritten“ |
| VERSTEHEN | S2–S7: Aufgabe immer sichtbar, Fortschrittsleiste, je Schritt GEGEBEN → ZU ZEIGEN → RECHNUNG |
| INTERESSE | S7: fertige Antwort in der Aufgabenkarte, „so geht das“ |
| UNIMATHE | S8: echter Screen, dort ebenfalls Schritt 1–3 |
| DOWNLOAD | S9: Logo und App Store, letzte 3 s |

## Kosten (vor der Erzeugung nochmal exakt per Schätzung)

- Stimme: ca. 1.340 Zeichen mit Pausen-Tags, also ca. 1.400 Credits für 1 Take (≈ 0,48 €). v1 lag bei 1.291 Credits.
- Musik und SFX werden im Code erzeugt, kostenlos.
- Die 3D-Bühne, der App-Screen und das CTA-Modul aus v1 werden wiederverwendet.
