// Timeline des How-to-Videos „So berechnest du Eigenvektoren einer 3×3-Matrix“ (Serie „Mathe 1 – So geht's“).
// Aufnahme: hev-take1.mp3 (99,92 s, Chris, eleven_v4). Die Sprechabschnitte stammen aus tools/pauses.mjs (Mindestpause 0,15 s)
// und sind Sekunden in der Sprachdatei. Im Video wird jeder Abschnitt als eigener Clip gesetzt: Die natürliche Pause
// danach wird auf CAP gekürzt, dazu kommt EXTRA, wo eine Animation Zeit braucht.

export const VOICE = 'voice/hev-take1.mp3';
export const MUSIC = 'music-hev.wav';

const S: [number, number][] = [
  [0.0, 2.42], // 0 Eigenvektoren einer Drei-mal-drei-Matrix:
  [2.76, 3.64], // 1 Klausur-Standard.
  [4.24, 5.66], // 2 Hier ist das ganze Verfahren,
  [5.88, 6.6], // 3 in vier Schritten.
  [7.24, 7.74], // 4 Gesucht:
  [8.18, 8.52], // 5 v,
  [8.74, 9.38], // 6 nicht null,
  [9.72, 11.92], // 7 mit A mal v gleich Lambda mal v.
  [12.48, 13.12], // 8 Umgestellt:
  [13.62, 16.28], // 9 A minus Lambda I, mal v, gleich null.
  [16.7, 18.8], // 10 Lambda steht also nur auf der Diagonale.
  [19.36, 22.98], // 11 Eine Lösung außer null gibt es nur, wenn diese Matrix singulär ist,
  [23.16, 24.6], // 12 ihre Determinante also null.
  [25.28, 26.9], // 13 Entwickle nach der letzten Zeile:
  [27.34, 30.66], // 14 drei minus Lambda, mal zwei minus Lambda zum Quadrat,
  [30.82, 31.54], // 15 minus eins.
  [31.98, 33.34], // 16 Nicht ausmultiplizieren,
  [33.56, 34.82], // 17 dritte binomische Formel:
  [35.16, 37.54], // 18 eins minus Lambda, mal drei minus Lambda.
  [38.22, 38.9], // 19 Eigenwerte:
  [39.32, 39.74], // 20 eins,
  [39.98, 40.46], // 21 und drei,
  [40.74, 41.06], // 22 doppelt.
  [41.74, 42.82], // 23 Lambda gleich eins:
  [43.22, 44.88], // 24 Eins von der Diagonale abziehen,
  [45.1, 45.74], // 25 dann Gauß.
  [46.2, 48.38], // 26 Zeile zwei minus Zeile eins wird null,
  [48.76, 50.02], // 27 Zeile drei durch zwei.
  [50.64, 52.5], // 28 Spalte Ypsilon hat kein Pivot,
  [52.76, 54.06], // 29 also ist Ypsilon frei:
  [54.4, 56.14], // 30 ein Regler, den du beliebig wählst.
  [56.54, 57.68], // 31 Ypsilon gleich t,
  [57.94, 59.54], // 32 dann x gleich minus t,
  [59.76, 60.58], // 33 z gleich null.
  [60.98, 61.62], // 34 Ein Regler,
  [61.84, 62.52], // 35 eine Richtung:
  [62.86, 63.46], // 36 eine Gerade.
  [64.12, 65.1], // 37 Lambda gleich drei:
  [65.54, 67.72], // 38 Zeile zwei plus Zeile eins wird null.
  [68.1, 68.7], // 39 Bleibt nur:
  [68.94, 70.04], // 40 x gleich Ypsilon.
  [70.52, 72.3], // 41 Jetzt sind Ypsilon und z frei,
  [72.58, 73.28], // 42 zwei Regler.
  [73.68, 75.0], // 43 Zerleg den Vektor nach ihnen:
  [75.42, 76.38], // 44 s mal eins,
  [76.6, 77.32], // 45 eins, null,
  [77.68, 78.86], // 46 plus t mal null,
  [79.04, 79.4], // 47 null,
  [79.56, 79.96], // 48 eins.
  [80.36, 82.54], // 49 Jeder hat seine Eins beim eigenen Regler:
  [82.8, 83.9], // 50 linear unabhängig.
  [84.44, 86.2], // 51 Zwei Regler, zwei Richtungen:
  [86.56, 88.14], // 52 Der Eigenraum ist eine Ebene.
  [88.52, 89.54], // 53 Jeder Vektor darin,
  [89.7, 90.32], // 54 außer null,
  [90.62, 92.22], // 55 wird von A nur verdreifacht.
  [92.62, 95.2], // 56 Ein doppelter Eigenwert kann so eine Ebene liefern,
  [95.38, 96.04], // 57 muss aber nicht.
  [96.42, 97.54], // 58 Das entscheidet Gauß.
  [97.96, 99.92], // 59 Such im App Store nach UniMathe.
];

// Natürliche Pausen werden auf CAP gekürzt; EXTRA verlängert dort, wo eine Animation läuft
const CAP = 0.4;
const EXTRA: Record<number, number> = {
  3: 0.2, // Schrittleiste baut sich auf
  10: 0.45, // λ fällt auf die Diagonale
  12: 0.6, // det-Kasten, Wechsel zur Entwicklung
  15: 0.2,
  18: 0.25,
  22: 0.75, // Eigenwerte fliegen in die Schrittleiste, Wechsel zu λ = 1
  23: 0.25, // Diagonale wird eingesetzt
  26: 0.45, // Ergebnis fliegt in die Matrix
  27: 0.9, // Zeile durch zwei, Nullzeile nach unten, Pivots
  30: 0.8, // Regler fährt
  33: 0.4,
  36: 1.2, // Gerade entsteht im Raum
  37: 0.75, // Matrix kommt zurück, 3 wird eingesetzt
  38: 0.45,
  40: 0.2,
  42: 0.5, // zwei Regler erscheinen
  48: 0.35,
  50: 0.55, // Wechsel in den Raum
  52: 1.2, // Ebene füllt sich
  55: 0.6, // Vektoren werden verdreifacht
  58: 3.4, // Rezeptkarte zum Speichern (stumm)
};

export const CLIPS = (() => {
  let at = 0;
  return S.map(([from, to], i) => {
    const c = {from, to, at};
    const nat = i + 1 < S.length ? S[i + 1][0] - to : 0;
    at += to - from + Math.min(nat, CAP) + (EXTRA[i] ?? 0);
    return c;
  });
})();

// Zeitpunkt im Video zu einer Sekunde s in der Sprachdatei
export const V = (s: number) => {
  let k = S.findIndex(([a, b]) => s >= a - 0.001 && s <= b + 0.001);
  if (k < 0) {
    // in einer Pause: an den Beginn des nächsten Abschnitts
    k = S.findIndex(([a]) => a > s);
    if (k < 0) k = S.length - 1;
    return CLIPS[k].at - Math.max(0, S[k][0] - s) * 0.5;
  }
  return CLIPS[k].at + (s - S[k][0]);
};
// Beginn bzw. Ende von Abschnitt i
export const W = (i: number) => CLIPS[i].at;
export const END = (i: number) => CLIPS[i].at + S[i][1] - S[i][0];

export const TOTAL = Math.round((END(S.length - 1) + 0.9) * 10) / 10;

// Wort-Cues im Video
export const T = {
  // Hook
  klausur: V(2.76),
  verfahren: V(4.9),
  vier: V(5.88),
  schritten: V(6.1),
  // ① Ansatz
  gesucht: V(7.24),
  vNicht: V(8.18),
  nichtNull: V(8.74),
  av: V(9.98),
  lv: V(11.0),
  umgestellt: V(12.48),
  aMinus: V(13.62),
  malV: V(14.96),
  gleichNull: V(15.74),
  lambdaSteht: V(16.7),
  diagonale: V(17.9),
  loesung: V(19.36),
  singulaer: V(22.0),
  determinante: V(23.4),
  alsoNull: V(24.1),
  // ② Eigenwerte
  entwickle: V(25.28),
  letzte: V(26.2),
  drei: V(27.34),
  malZwei: V(28.7),
  quadrat: V(29.9),
  minusEins: V(30.82),
  nichtAus: V(31.98),
  binom: V(33.56),
  einsMinus: V(35.16),
  malDrei: V(36.4),
  eigenwerte: V(38.22),
  ew1: V(39.32),
  ew3: V(40.1),
  doppelt: V(40.74),
  // ③④ λ = 1
  l1: V(41.74),
  einsVon: V(43.22),
  abziehen: V(44.56),
  gauss1: V(45.3),
  op1: V(46.2),
  op1Null: V(48.06),
  op2: V(48.76),
  durch2: V(49.6),
  spalteY: V(50.64),
  keinPivot: V(51.7),
  frei1: V(53.5),
  regler: V(54.4),
  beliebig: V(55.3),
  yGleichT: V(56.54),
  tT: V(57.34),
  xMinusT: V(58.28),
  zNull: V(59.76),
  einRegler: V(60.98),
  eineRichtung: V(61.84),
  gerade: V(62.86),
  // ③④ λ = 3
  l3: V(64.12),
  op3: V(65.54),
  op3Null: V(67.44),
  bleibt: V(68.1),
  xGleichY: V(68.94),
  jetzt: V(70.52),
  frei3: V(71.6),
  zweiRegler: V(72.58),
  zerleg: V(73.68),
  sMal: V(75.42),
  b1: V(75.9),
  plusT: V(77.68),
  b2: V(78.6),
  jeder: V(80.36),
  eigene: V(81.6),
  linear: V(82.8),
  // Ebene
  zwei2: V(84.44),
  richtungen2: V(85.38),
  eigenraum: V(86.56),
  ebene: V(87.6),
  jederVektor: V(88.52),
  ausserNull: V(89.7),
  verdreifacht: V(91.3),
  doppelter: V(92.62),
  mussNicht: V(95.38),
  entscheidet: V(96.42),
  rezept: END(58) + 0.35,
  // CTA
  such: V(97.96),
  tippt: V(99.16),
  cta: W(59) - 0.35,
};

// Untertitel: [Abschnitt von, Abschnitt bis, Text]. Im CTA keine.
const SUB: [number, number, string][] = [
  [0, 1, 'Eigenvektoren einer 3×3-Matrix: Klausur-Standard.'],
  [2, 3, 'Hier ist das ganze Verfahren, in vier Schritten.'],
  [4, 7, 'Gesucht: v ≠ 0 mit A · v = λ · v.'],
  [8, 9, 'Umgestellt: (A − λI) · v = 0.'],
  [10, 10, 'λ steht also nur auf der Diagonale.'],
  [11, 12, 'Eine Lösung außer null gibt es nur, wenn diese Matrix singulär ist, ihre Determinante also null.'],
  [13, 15, 'Entwickle nach der letzten Zeile: (3 − λ) · ((2 − λ)² − 1).'],
  [16, 18, 'Nicht ausmultiplizieren, dritte binomische Formel: (1 − λ)(3 − λ).'],
  [19, 22, 'Eigenwerte: 1 und 3, doppelt.'],
  [23, 25, 'λ = 1: Eins von der Diagonale abziehen, dann Gauß.'],
  [26, 27, 'Zeile 2 minus Zeile 1 wird null, Zeile 3 durch 2.'],
  [28, 30, 'Spalte y hat kein Pivot, also ist y frei: ein Regler, den du beliebig wählst.'],
  [31, 33, 'y = t, dann x = −t, z = 0.'],
  [34, 36, 'Ein Regler, eine Richtung: eine Gerade.'],
  [37, 38, 'λ = 3: Zeile 2 plus Zeile 1 wird null.'],
  [39, 40, 'Bleibt nur: x = y.'],
  [41, 42, 'Jetzt sind y und z frei, zwei Regler.'],
  [43, 48, 'Zerleg den Vektor nach ihnen: s · (1, 1, 0) + t · (0, 0, 1).'],
  [49, 50, 'Jeder hat seine Eins beim eigenen Regler: linear unabhängig.'],
  [51, 52, 'Zwei Regler, zwei Richtungen: Der Eigenraum ist eine Ebene.'],
  [53, 55, 'Jeder Vektor darin, außer null, wird von A nur verdreifacht.'],
  [56, 58, 'Ein doppelter Eigenwert kann so eine Ebene liefern, muss aber nicht. Das entscheidet Gauß.'],
];
export const SUBTITLES = SUB.map(([a, b, text]) => [W(a), END(b), text] as [number, number, string]);
