// Timeline des Klausurvideos „Inverse mit Gauß-Jordan“.
// Eine Aufnahme (inv-take1.mp3, 94,4 s). Sprechabschnitte aus tools/pauses.mjs (Mindestpause 0,25 s), Sekunden in der Sprachdatei.

export const VOICE = 'voice/inv-take1.mp3';
export const MUSIC = 'music-inv.wav';

const S: [number, number][] = [
  [0, 1.12], // 0 Mathe-eins-Klausur:
  [1.7, 3.74], // 1 Berechne die Inverse dieser Matrix.
  [4.24, 5.16], // 2 Mit Gauß-Jordan –
  [5.5, 7.62], // 3 und die Lösung schreibt sich dabei rechts von selbst.
  [8.18, 9.84], // 4 Die Inverse macht A rückgängig:
  [10.22, 13.56], // 5 A hoch minus eins mal A ergibt die Einheitsmatrix I.
  [14.06, 16.32], // 6 Also schreiben wir A und I nebeneinander.
  [16.94, 19.62], // 7 Links bringen wir A mit Zeilenumformungen auf I.
  [20.06, 22.32], // 8 Und jede Umformung machen wir rechts genauso mit.
  [22.86, 24.78], // 9 Zuerst Nullen unter der Diagonale.
  [25.26, 26.66], // 10 In Zeile zwei steht schon eine.
  [27.0, 27.38], // 11 Also:
  [27.78, 29.4], // 12 dritte Zeile minus erste.
  [29.9, 30.8], // 13 Eins minus eins:
  [31.08, 31.34], // 14 null.
  [31.82, 32.72], // 15 Eins minus zwei:
  [33.02, 33.7], // 16 minus eins.
  [34.14, 35.02], // 17 Eins minus eins:
  [35.32, 35.56], // 18 null.
  [36.02, 36.92], // 19 Rechts genauso.
  [37.44, 39.38], // 20 Dann dritte Zeile plus zweite.
  [39.82, 42.18], // 21 Unten steht jetzt null, null, eins.
  [42.68, 45.6], // 22 Jetzt Nullen über der Diagonale, von unten nach oben.
  [46.04, 47.68], // 23 Zweite Zeile minus dritte.
  [48.16, 49.48], // 24 Erste Zeile minus dritte.
  [49.9, 52.74], // 25 Und erste Zeile minus zwei mal zweite.
  [53.24, 54.36], // 26 Links steht jetzt I.
  [54.78, 55.3], // 27 Und rechts?
  [55.92, 59.76], // 28 Jede Zeilenumformung ist eine Multiplikation mit einer Matrix von links.
  [60.2, 62.54], // 29 Alle fünf zusammen ergeben eine Matrix E,
  [62.96, 65.26], // 30 und E macht aus A die Einheitsmatrix.
  [65.66, 68.22], // 31 Also ist E gleich A hoch minus eins.
  [68.68, 72.48], // 32 Rechts haben wir E auf I angewendet, und E mal I ist E.
  [72.92, 74.44], // 33 Deshalb steht rechts die Inverse.
  [74.96, 75.32], // 34 Probe:
  [75.74, 77.32], // 35 A hoch minus eins mal A.
  [77.84, 79.62], // 36 Erste Zeile mal erste Spalte:
  [80.02, 81.74], // 37 null plus null plus eins,
  [82.02, 82.84], // 38 also eins.
  [83.3, 84.86], // 39 Insgesamt kommt I heraus.
  [85.4, 86.26], // 40 Für deine Klausur:
  [86.72, 88.16], // 41 A und I nebeneinander,
  [88.46, 89.46], // 42 links auf I bringen,
  [89.74, 90.62], // 43 rechts ablesen.
  [91.08, 92.22], // 44 Mehr Klausuraufgaben?
  [92.52, 94.4], // 45 Such im App Store nach UniMathe.
];

// Stille nach einem Abschnitt im Video. Standard 0,32 s, länger nur, wo eine Animation Zeit braucht.
const GAP_DEFAULT = 0.32;
const GAP: Record<number, number> = {
  0: 0.3,
  1: 0.45, // Matrix steht
  3: 0.5,
  5: 0.55, // Formel steht
  6: 0.7, // I zieht ein
  8: 0.55,
  10: 0.4,
  11: 0.22,
  12: 0.5, // Kopien rutschen in den Rechenbereich
  13: 0.12,
  14: 0.3,
  15: 0.12,
  16: 0.3,
  17: 0.12,
  18: 0.3,
  19: 1.25, // rechte Ergebnisse, Flug in die Matrix
  20: 0.3,
  21: 1.35, // rechte Ergebnisse, Flug
  22: 0.45,
  23: 1.0, // ③ läuft
  24: 1.3, // ④ läuft
  25: 0.7, // ⑤ läuft
  26: 0.6,
  27: 0.35,
  28: 0.5, // E₁ lesen
  29: 0.45, // Chips verschmelzen
  31: 0.45,
  32: 0.4,
  33: 0.8, // Aha
  35: 0.45, // Matrizen fliegen in die Probe
  37: 0.2,
  38: 0.3,
  39: 0.9, // übrige Einträge, Haken
  40: 0.3,
  43: 1.1, // Merksatz lesen
  44: 0.26,
};

type Clip = {from: number; to: number; at: number; i: number};
export const CLIPS: Clip[] = (() => {
  const out: Clip[] = [];
  let cur = 0;
  S.forEach(([from, to], i) => {
    const at = i === 0 ? 0 : cur + (GAP[i - 1] ?? GAP_DEFAULT);
    out.push({from, to, at, i});
    cur = at + (to - from);
  });
  return out;
})();

// Sekunde in der Sprachdatei → Sekunde im Video
export const V = (s: number) => {
  let c = CLIPS[0];
  for (const x of CLIPS) if (x.from <= s + 1e-6) c = x;
  return c.at + (s - c.from);
};
// Beginn und Ende eines Abschnitts im Video
export const A = (i: number) => CLIPS[i].at;
export const E = (i: number) => CLIPS[i].at + (CLIPS[i].to - CLIPS[i].from);

const LAST = CLIPS[CLIPS.length - 1];
export const TOTAL = Math.round((LAST.at + (LAST.to - LAST.from) + 1.0) * 10) / 10;

export const T = {
  // Hook
  klausur: A(0),
  berechne: A(1),
  gauss: A(2),
  rechts: V(6.3),
  // Ziel und Ansatz
  rueck: A(4),
  aInv: A(5),
  malA: V(11.25),
  ergibt: V(11.9),
  einheit: V(12.95),
  neben: A(6),
  links: A(7),
  mit: A(8),
  // ② Nullen unten
  unten: A(9),
  schon: A(10),
  op1: A(12),
  r1a: A(14),
  r1b: A(16),
  r1c: A(18),
  r1rechts: A(19),
  op2: A(20),
  untenSteht: A(21),
  r2a: V(40.95),
  r2b: V(41.4),
  r2c: V(41.85),
  // ③ Nullen oben
  oben: A(22),
  op3: A(23),
  op4: A(24),
  op5: A(25),
  zweiMal: V(51.25),
  linksI: A(26),
  // Warum
  undRechts: A(27),
  multi: A(28),
  alleFuenf: A(29),
  macht: A(30),
  alsoE: A(31),
  eInv: V(66.9),
  rechtsHaben: A(32),
  eMalI: V(70.9),
  deshalb: A(33),
  // Probe
  probe: A(34),
  probeAA: A(35),
  ersteZeile: A(36),
  p1: A(37),
  p2: V(80.65),
  p3: V(81.3),
  alsoEins: A(38),
  insgesamt: A(39),
  // Merksatz, CTA
  merk: A(40),
  m1: A(41),
  m2: A(42),
  m3: A(43),
  cta: A(44),
  such: A(45),
  tippt: V(93.4),
};

// Untertitel: [Start, Ende, Text] in Sekunden der Sprachdatei. Im CTA keine.
const SUB: [number, number, string][] = [
  [0, 3.74, 'Mathe-1-Klausur: Berechne die Inverse dieser Matrix.'],
  [4.24, 7.62, 'Mit Gauß-Jordan – und die Lösung schreibt sich dabei rechts von selbst.'],
  [8.18, 13.56, 'Die Inverse macht A rückgängig: A⁻¹ · A ergibt die Einheitsmatrix I.'],
  [14.06, 19.62, 'Also schreiben wir A und I nebeneinander. Links bringen wir A mit Zeilenumformungen auf I.'],
  [20.06, 22.32, 'Und jede Umformung machen wir rechts genauso mit.'],
  [22.86, 26.66, 'Zuerst Nullen unter der Diagonale. In Zeile 2 steht schon eine.'],
  [27.0, 29.4, 'Also: dritte Zeile minus erste.'],
  [29.9, 36.92, '1 − 1 = 0. 1 − 2 = −1. 1 − 1 = 0. Rechts genauso.'],
  [37.44, 42.18, 'Dann dritte Zeile plus zweite. Unten steht jetzt 0, 0, 1.'],
  [42.68, 45.6, 'Jetzt Nullen über der Diagonale, von unten nach oben.'],
  [46.04, 49.48, 'Zweite Zeile minus dritte. Erste Zeile minus dritte.'],
  [49.9, 54.36, 'Und erste Zeile minus 2 · zweite. Links steht jetzt I.'],
  [54.78, 59.76, 'Und rechts? Jede Zeilenumformung ist eine Multiplikation mit einer Matrix von links.'],
  [60.2, 65.26, 'Alle fünf zusammen ergeben eine Matrix E, und E macht aus A die Einheitsmatrix.'],
  [65.66, 68.22, 'Also ist E = A⁻¹.'],
  [68.68, 74.44, 'Rechts haben wir E auf I angewendet, und E · I = E. Deshalb steht rechts die Inverse.'],
  [74.96, 79.62, 'Probe: A⁻¹ · A. Erste Zeile mal erste Spalte:'],
  [80.02, 82.84, '0 + 0 + 1, also 1.'],
  [83.3, 84.86, 'Insgesamt kommt I heraus.'],
  [85.4, 90.62, 'Für deine Klausur: A und I nebeneinander, links auf I bringen, rechts ablesen.'],
];
export const SUBTITLES: [number, number, string][] = SUB.map(([a, b, text]) => [V(a), V(b), text]);
