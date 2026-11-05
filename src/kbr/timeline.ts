// Timeline des Klausurvideos „Kern, Bild und Rang“.
// Alle Zeiten stammen aus den Sprechpausen von voice/kbr-take1.mp3 (tools/pauses.mjs) und sind in Sekunden.

export const VOICE = 'voice/kbr-take1.mp3';
export const MUSIC = 'music-kbr.wav';
export const VOICE_END = 84.88;

// Zusätzliche Stille in der Stimme, damit Animationen Zeit bekommen: [Stelle in der Sprachdatei, Länge]
export const VOICE_GAPS: [number, number][] = [
  [2.6, 0.6], // Kamera auf die Kante der Ebene
  [5.8, 1.0], // Gerade im Nullpunkt
  [9.5, 1.2], // Aufgabe lesen, dann gleitet die Karte hoch
  [14.1, 0.8], // Fortschrittsleiste
  [20.1, 1.0], // Bühne wechselt zur Rechnung
  [24.0, 0.8], // drei Ebenen erscheinen
  [27.5, 1.2], // III − I liegt auf II
  [28.8, 1.0], // Ebene III verblasst
  [38.95, 0.8], // Vektor setzt sich zusammen
  [42.9, 1.2], // Kern fliegt in die Karte
  [46.9, 1.0], // Spalten werden zu Pfeilen
  [51.5, 0.6], // Faktoren fliegen vor die Spalten
  [55.3, 1.6], // Dreieck schließt sich (Aha)
  [60.1, 0.8], // a₂ wird grau
  [64.6, 1.4], // Kantenansicht, Bild fliegt in die Karte
  [70.6, 0.6], // Rang und dim Kern in der Karte
  [74.95, 1.2], // letztes Flachdrücken
  [77.9, 1.6], // Merkkarte
];
// Zeit in der Sprachdatei → Zeit im Video
export const V = (s: number) => s + VOICE_GAPS.reduce((acc, [cut, gap]) => (cut < s ? acc + gap : acc), 0);

export const TOTAL = Math.round((V(VOICE_END) + 1.5) * 10) / 10;

// Wort-Cues im Video (aus Sprachzeiten umgerechnet)
export const T = {
  // S1 Hook
  platt: V(0.9), // der Raum wird flachgedrückt
  edge: V(2.0), // Kamera auf die Kante der Ebene
  gerade: V(2.86), // zurückspulen, Kern-Punkte leuchten
  nochmal: V(3.6), // erneut flachdrücken, Kern-Punkte in den Ursprung
  nullpunkt: V(4.9),
  klausur: V(6.14), // Karte erscheint mittig, Bühne dunkel
  qKern: V(7.42),
  qBild: V(8.48),
  qRang: V(8.95),
  glide: V(9.5) + 0.3, // Karte gleitet hoch
  ende: V(9.82), // Spaltenpfeile erscheinen
  spalte: V(12.1),
  ueberfl: V(12.58), // „?“ über a₂
  steps: V(14.1) + 0.1, // Fortschrittsleiste
  // S2 Idee
  idee: V(14.32),
  kernIs: V(15.44),
  bildIs: V(17.86),
  // S3 Schritt 1: Kern
  s1: V(20.4),
  loese: V(22.12),
  zeile3: V(24.26),
  genau: V(26.0),
  weg: V(27.74),
  uebrig: V(29.0),
  xy: V(30.02),
  yz: V(31.72),
  frei: V(33.82),
  nenn: V(34.84),
  ymt: V(35.74),
  xt: V(37.86),
  kernIst: V(39.14),
  kernCard: V(42.9) + 0.2,
  // S4 Schritt 2: Bild
  s2: V(43.2),
  spalten: V(45.02),
  trick: V(47.12),
  amal: V(48.38),
  sp1: V(51.76),
  sp2: V(52.8),
  sp3: V(53.98),
  ergibt: V(54.88),
  close: V(55.3) + 0.2, // Dreieck schließt sich
  zwei: V(55.52),
  ueberfl2: V(59.16),
  basis: V(60.36),
  vorhin: V(62.94),
  bildCard: V(64.6) + 0.5,
  // S5 Schritt 3: Rang
  s3: V(64.84),
  rang: V(65.82),
  also2: V(67.94),
  dimk: V(68.9),
  von: V(70.76),
  verloren: V(72.16),
  zweiB: V(73.7),
  formel: V(75.12),
  immer: V(76.98),
  merk: V(77.62) + 0.1,
  // S6 CTA
  cta: V(78.16),
  name: V(80.7),
  search: V(82.66),
  tippt: V(84.18),
};

// Untertitel: [Start, Ende] in Sekunden der Sprachdatei, Text. Im CTA keine.
export const SUBTITLES: [number, number, string][] = [
  [0, 2.44, 'Diese Matrix drückt den ganzen Raum platt.'],
  [2.86, 5.6, 'Und eine ganze Gerade verschwindet dabei im Nullpunkt.'],
  [6.14, 9.34, 'Klausuraufgabe: Bestimme Kern, Bild und Rang.'],
  [9.82, 13.66, 'Und am Ende verrät dir der Kern sogar, warum eine Spalte überflüssig ist.'],
  [14.32, 17.5, 'Erst die Idee: Der Kern ist alles, was auf null landet.'],
  [17.86, 19.84, 'Das Bild ist alles, was getroffen wird.'],
  [20.4, 23.82, 'Schritt eins, der Kern: Löse A · x = 0.'],
  [24.26, 28.54, 'Zeile III minus Zeile I ist genau Zeile II. Sie fällt also weg.'],
  [29.0, 33.42, 'Übrig bleibt: x + y = 0 und y + z = 0.'],
  [33.82, 38.78, 'z ist frei, nenn es t. Dann ist y = −t und x = t.'],
  [39.14, 42.66, 'Der Kern ist die Gerade durch (1, −1, 1).'],
  [43.2, 46.72, 'Schritt zwei, das Bild: Es wird von den Spalten aufgespannt.'],
  [47.12, 51.38, 'Und jetzt der Trick: A · (1, −1, 1) = 0 heißt:'],
  [51.62, 55.16, 'Spalte 1 minus Spalte 2 plus Spalte 3 ergibt null.'],
  [55.52, 59.98, 'Spalte 2 ist also nur Spalte 1 plus Spalte 3. Sie ist überflüssig.'],
  [60.36, 64.34, 'Die anderen beiden sind eine Basis des Bildes, genau die Ebene von vorhin.'],
  [64.84, 68.5, 'Schritt drei: Der Rang ist die Dimension des Bildes, also zwei.'],
  [68.9, 70.42, 'Der Kern hat Dimension eins.'],
  [70.76, 74.8, 'Von drei Dimensionen geht eine im Kern verloren, zwei bleiben im Bild.'],
  [75.12, 77.62, 'Zwei plus eins gleich drei, das passt immer.'],
];

// Soundeffekte: [Zeit im Video, Datei, Lautstärke]
export const SFX: [number, string, number][] = [
  [0, 'swell', 0.45],
  [T.platt, 'collapse', 0.45],
  [T.edge, 'whoosh', 0.25],
  [T.gerade, 'tick', 0.35],
  [T.nochmal + 0.2, 'collapse', 0.35],
  [T.nullpunkt + 0.3, 'accent_small', 0.45],
  [T.klausur, 'accent', 0.4],
  [T.qKern, 'tick', 0.3],
  [T.qBild, 'tick', 0.3],
  [T.qRang, 'tick', 0.3],
  [T.glide, 'whoosh', 0.3],
  [T.ende + 0.2, 'rise', 0.25],
  [T.ueberfl, 'click', 0.4],
  [T.steps, 'whoosh', 0.22],
  [T.kernIs + 0.4, 'collapse', 0.3],
  [T.bildIs + 0.2, 'collapse', 0.35],
  [T.s1, 'whoosh', 0.25],
  [T.loese + 0.2, 'tick', 0.35],
  [T.loese + 0.6, 'tick', 0.35],
  [T.loese + 1.0, 'tick', 0.35],
  [T.zeile3 + 0.6, 'whoosh', 0.25],
  [T.genau + 0.6, 'lock', 0.4],
  [T.weg, 'buzz', 0.25],
  [T.weg + 0.9, 'rise', 0.25],
  [T.frei, 'tick', 0.4],
  [T.ymt + 0.2, 'whoosh', 0.22],
  [T.xt + 0.2, 'whoosh', 0.22],
  [T.kernIst + 0.4, 'click', 0.4],
  [T.kernCard, 'lock', 0.5],
  [T.s2, 'whoosh', 0.25],
  [T.spalten + 0.3, 'rise', 0.25],
  [T.amal, 'tick', 0.35],
  [T.sp1, 'tick', 0.35],
  [T.sp2, 'tick', 0.35],
  [T.sp3, 'tick', 0.35],
  [T.close, 'accent', 0.55],
  [T.zwei + 0.8, 'click', 0.35],
  [T.ueberfl2, 'collapse', 0.3],
  [T.basis + 0.3, 'swell', 0.3],
  [T.vorhin, 'whoosh', 0.25],
  [T.bildCard, 'lock', 0.5],
  [T.s3, 'whoosh', 0.25],
  [T.also2, 'lock', 0.45],
  [T.dimk + 0.6, 'lock', 0.45],
  [T.von + 0.3, 'rise', 0.3],
  [T.verloren, 'collapse', 0.45],
  [T.formel + 1.0, 'lock_hi', 0.5],
  [T.merk, 'swell', 0.4],
  [T.cta + 0.5, 'accent', 0.45],
  ...Array.from({length: 8}, (_, i) => [T.tippt + 0.35 + i * 0.075, 'tick', 0.18] as [number, string, number]),
];
