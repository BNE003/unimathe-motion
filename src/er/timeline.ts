// Timeline des Videos „Die dominante Eigenrichtung“.
// Alle Zeiten stammen aus den Sprechpausen von voice/er-take1.mp3 (tools/pauses.mjs) und sind in Sekunden.

export const VOICE = 'voice/er-take1.mp3';
export const MUSIC = 'music-er.wav';
export const VOICE_END = 65.76;

// Aus der Stimme herausgeschnitten: [Beginn in der Sprachdatei, Länge].
// Der erste Schnitt entfernt den Satz „Die Vektoren zeigen zuerst in völlig unterschiedliche Richtungen.“ und das folgende „Doch“,
// alle anderen kürzen nur lange Sprechpausen.
export const VOICE_CUTS: [number, number][] = [
  [2.54, 0.16],
  [6.09, 4.04],
  [14.0, 0.11],
  [15.48, 0.15],
  [18.16, 0.22],
  [22.46, 0.3],
  [26.52, 0.2],
  [28.56, 0.24],
  [31.6, 0.12],
  [35.14, 0.23],
  [36.6, 0.22],
  [39.48, 0.12],
  [42.14, 0.18],
  [45.26, 0.08],
  [48.94, 0.14],
  [52.2, 0.16],
  [57.18, 0.12],
  [61.24, 0.23],
  [63.4, 0.08],
];
// Zeit in der Sprachdatei → Zeit im Video
export const V = (s: number) => s - VOICE_CUTS.reduce((acc, [c, d]) => acc + Math.min(d, Math.max(0, s - c)), 0);

export const TOTAL = Math.round((V(VOICE_END) + 0.8) * 10) / 10;

// Wort-Cues im Video
export const T = {
  // Hook
  matrix: V(0),
  veraendert: V(1.4),
  schau: V(2.86),
  anwende: V(4.55),
  mit: V(10.14),
  linie: V(12.7),
  warum: V(14.52),
  // ein Vektor
  schauen: V(16.08),
  einzigen: V(17.0),
  anteilen: V(19.3),
  rechts: V(20.6),
  oben: V(21.7),
  verdoppelt: V(23.55),
  horiz: V(25.2),
  vertikal: V(26.94),
  // Folge
  aus11: V(29.02),
  wird21: V(30.42),
  vier: V(32.54),
  acht: V(34.22),
  siehst: V(35.72),
  // Matrix verstehen
  hAnteil: V(37.06),
  groesser: V(38.68),
  andere: V(39.84),
  deshalb: V(42.56),
  rechts2: V(44.4),
  // Eigenrichtung
  genau: V(45.58),
  eigen: V(47.2),
  gestreckt: V(49.32),
  nicht: V(51.46),
  weil: V(52.6),
  vertR: V(53.9),
  dominiert: V(55.16),
  deshalb2: V(57.54),
  linie2: V(60.3),
  // CTA
  cta: V(61.84),
  such: V(63.72),
  tippt: V(64.6),
};

// Untertitel: [Start, Ende] in Sekunden der Sprachdatei, Text. Im CTA keine.
export const SUBTITLES: [number, number, string][] = [
  [0, 2.38, 'Diese Matrix verändert alle diese Vektoren.'],
  [2.86, 5.64, 'Aber schau, was passiert, wenn ich sie immer wieder anwende.'],
  [10.14, 13.96, 'Mit jeder Anwendung richten sie sich stärker entlang derselben Linie aus.'],
  [14.52, 15.38, 'Warum passiert das?'],
  [16.08, 18.06, 'Schauen wir uns einen einzigen Vektor an.'],
  [18.6, 22.36, 'Er besteht aus zwei Anteilen: einem nach rechts und einem nach oben.'],
  [22.98, 26.42, 'Unsere Matrix verdoppelt jedes Mal den horizontalen Anteil.'],
  [26.94, 28.46, 'Der vertikale bleibt unverändert.'],
  [29.02, 31.5, 'Aus eins und eins wird zwei und eins.'],
  [32.02, 35.04, 'Dann vier und eins. Dann acht und eins.'],
  [35.72, 36.52, 'Siehst du, was passiert?'],
  [37.06, 39.4, 'Der horizontale Anteil wird immer größer.'],
  [39.84, 42.06, 'Der andere fällt im Vergleich kaum noch ins Gewicht.'],
  [42.56, 45.18, 'Deshalb zeigt der Vektor immer stärker nach rechts.'],
  [45.58, 48.86, 'Und genau diese Richtung ist eine Eigenrichtung unserer Matrix.'],
  [49.32, 52.12, 'Sie wird von der Matrix nur gestreckt, nicht gedreht.'],
  [52.6, 57.1, 'Weil sie stärker wächst als die vertikale Richtung, dominiert sie bei wiederholter Anwendung.'],
  [57.54, 61.16, 'Und deshalb richten sich fast alle Vektoren entlang dieser Linie aus.'],
];
