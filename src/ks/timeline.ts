// Timeline des Klausurvideos „Schnitt zweier Untervektorräume“.
// Alle Zeiten stammen aus den Sprechpausen von voice/ks-take1.mp3 (tools/pauses.mjs) und sind in Sekunden.

export const VOICE = 'voice/ks-take1.mp3';
export const MUSIC = 'music-ks.wav';
export const VOICE_END = 100.48;

// Zusätzliche Stille in der Stimme, damit Animationen Zeit bekommen: [Stelle in der Sprachdatei, Länge]
export const VOICE_GAPS: [number, number][] = [
  [33.2, 1.0], // II − I Spalte für Spalte
  [52.2, 0.8], // t ausklammern
  [62.6, 2.0], // Blick entlang der Geraden
  [83.6, 1.2], // w-Kärtchen verschmelzen
  [92.6, 1.8], // Raumgitter, Merkkarte
];
// Zeit in der Sprachdatei → Zeit im Video
export const V = (s: number) => s + VOICE_GAPS.reduce((acc, [cut, gap]) => (cut < s ? acc + gap : acc), 0);

export const TOTAL = Math.round((V(VOICE_END) + 1.4) * 10) / 10;

// Wort-Cues im Video (aus Sprachzeiten umgerechnet)
export const T = {
  // S1 Hook
  ebenen: V(1.5),
  uu: V(3.16),
  vv: V(3.62),
  jede: V(5.3),
  zusammen: V(7.32),
  vier: V(8.2),
  nurDrei: V(9.76),
  drei3: V(10.8),
  wo: V(11.66),
  loesung: V(14.82),
  glide: V(1.08), // nach „Klausuraufgabe:“ gleitet die Karte nach oben, U und V leuchten dann schon auf der freien Bühne
  steps: V(15.4), // Fortschrittsleiste, „?“ wandert an Schritt 3
  // S2 Erst das Bild
  bild: V(17.54),
  gerade: V(18.9),
  linie: V(21.7),
  schnitt: V(23.46),
  // S3 Schritt 1
  s1: V(26.44),
  erfuellt: V(27.58),
  zieh: V(31.04),
  weg: V(33.68),
  z2y: V(35.14),
  einsetzen: V(37.54),
  fly: V(38.3),
  x3y: V(39.42),
  xm3y: V(41.7),
  frei: V(44.72),
  nennt: V(46.1),
  jeder: V(47.56),
  tmal: V(49.1),
  ausklammern: V(52.2),
  // S4 Schritt 2
  s2: V(52.96),
  probe: V(54.02),
  inU: V(55.5),
  inV: V(57.64),
  blick: V(59.3),
  steckt: V(60.94),
  edgeBack: V(62.6) + 1.9,
  w0: V(63.12),
  basis: V(64.6),
  dim1: V(67.52),
  // S5 Schritt 3
  s3: V(69.46),
  raetsel: V(70.48),
  dimUV: V(72.4),
  frei2: V(75.06),
  beide: V(78.8),
  doppelt: V(80.9),
  merge: V(83.6),
  also: V(83.94),
  nie: V(88.08),
  raum: V(90.28),
  // S6 Merkkarte, S7 CTA
  merk: V(92.6) + 0.2,
  cta: V(93.32) - 0.1,
  name: V(95.2),
  search: V(98.0),
};

// Untertitel: [Start, Ende] in Sekunden der Sprachdatei, Text. Im CTA keine.
export const SUBTITLES: [number, number, string][] = [
  [0, 1.02, 'Klausuraufgabe:'],
  [1.5, 4.1, 'zwei Ebenen im Raum, U und V.'],
  [5.3, 8.64, 'Jede hat Dimension zwei. Zusammen also vier?'],
  [9.76, 13.22, 'Der Raum hat aber nur drei. Wo ist eine Dimension geblieben?'],
  [14.82, 16.28, 'Die Lösung in drei Schritten.'],
  [17.54, 22.7, 'Erst das Bild: Zwei verschiedene Ebenen durch den Ursprung schneiden sich in einer Geraden.'],
  [23.46, 25.28, 'Das ist U ∩ V.'],
  [26.44, 30.32, 'Schritt eins: Im Schnitt liegt alles, was beide Gleichungen erfüllt.'],
  [31.04, 32.94, 'Zieh Gleichung I von II ab.'],
  [33.68, 36.7, 'Das x fällt weg: z = 2y.'],
  [37.54, 44.02, 'In Gleichung I eingesetzt: x + 3y = 0, also x = −3y.'],
  [44.72, 46.78, 'y ist frei, nenn es t.'],
  [47.56, 51.84, 'Jeder Punkt im Schnitt ist also t · (−3, 1, 2).'],
  [52.96, 54.94, 'Schritt zwei, zuerst die Probe:'],
  [55.5, 58.46, 'Eingesetzt in U gibt das null, in V auch.'],
  [59.3, 62.34, 'Blick entlang der Geraden: Sie steckt in beiden Ebenen.'],
  [63.12, 68.42, 'Und w ist nicht null, also eine Basis von U ∩ V. Dimension eins.'],
  [69.46, 71.66, 'Schritt drei: das Rätsel vom Anfang.'],
  [72.4, 78.12, 'U und V haben je Dimension zwei: eine Gleichung, drei Unbekannte, zwei bleiben frei.'],
  [78.8, 83.36, 'Aber beide enthalten die Gerade. Wer 2 + 2 rechnet, zählt sie doppelt.'],
  [83.94, 87.34, 'Also: 2 + 2 − 1 = 3.'],
  [88.08, 92.24, 'Die vierte Dimension gab es nie. U + V ist der ganze Raum.'],
];

// Soundeffekte: [Zeit im Video, Datei, Lautstärke]
export const SFX: [number, string, number][] = [
  [0, 'swell', 0.5],
  [T.uu, 'tick', 0.35],
  [T.vv, 'tick', 0.35],
  [T.jede, 'click', 0.4],
  [T.vier, 'click', 0.45],
  [T.drei3, 'buzz', 0.35],
  [T.glide, 'whoosh', 0.3],
  [T.steps, 'whoosh', 0.22],
  [T.linie, 'rise', 0.3],
  [T.schnitt + 0.6, 'lock', 0.45],
  [T.s1, 'whoosh', 0.25],
  [T.erfuellt, 'click', 0.4],
  [T.zieh + 0.3, 'whoosh', 0.25],
  [T.weg, 'tick', 0.45],
  [T.z2y, 'click', 0.4],
  [T.fly, 'whoosh', 0.25],
  [T.xm3y, 'click', 0.4],
  [T.nennt, 'tick', 0.45],
  [T.ausklammern, 'whoosh', 0.25],
  [T.ausklammern + 0.8, 'lock', 0.5],
  [T.s2, 'whoosh', 0.25],
  [T.inU + 0.9, 'tick', 0.45],
  [T.inV + 0.9, 'tick', 0.45],
  [T.blick, 'rise', 0.35],
  [T.steckt + 0.6, 'collapse', 0.4],
  [T.basis, 'lock', 0.5],
  [T.dim1, 'lock_hi', 0.5],
  [T.s3, 'whoosh', 0.25],
  [T.raetsel, 'accent_small', 0.45],
  [T.dimUV, 'click', 0.4],
  [T.beide, 'tick', 0.4],
  [T.merge - 0.1, 'accent', 0.5],
  [T.also + 1.2, 'lock', 0.5],
  [T.raum, 'rise', 0.35],
  [T.raum + 1.2, 'lock_hi', 0.55],
  [T.merk, 'swell', 0.4],
  [T.cta + 0.5, 'accent', 0.45],
  ...Array.from({length: 8}, (_, i) => [T.search + 0.35 + i * 0.075, 'tick', 0.18] as [number, string, number]),
];
