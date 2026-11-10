// Timeline des Klausurvideos „Für welche a ist A(a) invertierbar?“.
// Die Stimme besteht aus zwei Aufnahmen: Take 1 (Hook, Rechnung, Merksatz, CTA) und Take 3 (Warum-Teil mit dem Beispiel a = −1).
// Alle Zeiten der Sprechabschnitte stammen aus tools/pauses.mjs und sind Sekunden in der jeweiligen Sprachdatei.

export const VOICES = ['voice/ki-take1.mp3', 'voice/ki-take3-warum.mp3'] as const;
export const MUSIC = 'music-ki.wav';

// Take 1: Sprechabschnitte [Beginn, Ende]
const S1: [number, number][] = [
  [0, 1.08], // 0 Mathe-eins-Klausur:
  [1.72, 4.36], // 1 Für welche a ist diese Matrix invertierbar?
  [5.3, 8.08], // 2 Bei a gleich eins sind alle drei Zeilen gleich.
  [8.6, 10.24], // 3 Dann ist sie sicher nicht invertierbar.
  [10.86, 12.3], // 4 Aber ist das der einzige Wert?
  [13.0, 15.92], // 5 Überall steht eins, nur auf der Diagonale steht a.
  [16.48, 19.2], // 6 Also ziehen wir die erste Zeile von den anderen ab.
  [19.8, 21.36], // 7 Das ändert die Determinante nicht.
  [22.0, 23.5], // 8 Eins minus eins: null.
  [24.1, 25.3], // 9 a minus eins bleibt.
  [25.74, 26.32], // 10 Und wieder null.
  [26.8, 27.6], // 11 Unten genauso.
  [28.04, 30.14], // 12 Jetzt ist es eine Dreiecksmatrix.
  [30.58, 32.98], // 13 Ihre Determinante ist das Produkt der Diagonale:
  [33.4, 34.9], // 14 a minus eins zum Quadrat.
  [35.46, 38.5], // 15 Invertierbar heißt: Determinante ungleich null.
  [38.92, 42.5], // 16 Und a minus eins zum Quadrat ist nur bei a gleich eins null.
  [42.92, 43.3], // 17 Also:
  [43.68, 46.14], // 18 invertierbar für alle a ungleich eins.
  [46.86, 49.26], // 19 Aber warum darf man Zeilen einfach abziehen?
  // 20–35: alter Warum-Teil, ersetzt durch Take 2
  [87.8, 88.64], // 36 Für deine Klausur:
  [89.08, 92.12], // 37 erst Nullen erzeugen, dann die Diagonale multiplizieren.
  [92.88, 93.98], // 38 Mehr Klausuraufgaben?
  [94.3, 96.24], // 39 Such im App Store nach UniMathe.
];

// Take 3: der Warum-Teil (Beispiel a = −1)
const S2: [number, number][] = [
  [0, 2.18], // 0 Jede Zeile ist ein Pfeil im Raum.
  [2.66, 5.7], // 1 Zusammen spannen die drei Pfeile einen schiefen Körper auf,
  [6.2, 8.78], // 2 und die Determinante ist hier genau sein Volumen.
  [9.36, 11.32], // 3 Nehmen wir a gleich minus eins.
  [11.82, 15.26], // 4 Dann ist das Volumen minus eins minus eins zum Quadrat,
  [15.56, 16.22], // 5 also vier.
  [16.92, 19.04], // 6 Das Volumen ist Grundfläche mal Höhe.
  [19.6, 22.22], // 7 Die Grundfläche bilden der erste und der dritte Pfeil.
  [22.76, 26.22], // 8 Die Höhe ist der Abstand der zweiten Pfeilspitze von dieser Fläche.
  [26.92, 29.5], // 9 Jetzt ziehen wir die erste Zeile von der zweiten ab.
  [30.06, 35.92], // 10 Die Spitze des zweiten Pfeils rutscht dabei genau entlang des ersten Pfeils, also parallel zur Grundfläche.
  [36.5, 37.8], // 11 Ihr Abstand bleibt gleich.
  [38.52, 40.38], // 12 Höhe gleich, Grundfläche gleich,
  [40.68, 42.3], // 13 also bleibt das Volumen vier.
  [42.9, 45.04], // 14 Mit dem dritten Pfeil passiert genau dasselbe.
  [45.66, 50.2], // 15 Am Ende steht der Körper auf einem Quadrat mit der Seitenlänge zwei und ist eins hoch.
  [50.84, 52.98], // 16 Zwei mal zwei mal eins ist vier.
  [53.52, 57.86], // 17 Und in der Matrix steht auf der Diagonale eins, minus zwei, minus zwei.
  [58.38, 59.76], // 18 Ihr Produkt ist auch vier.
  [60.36, 62.56], // 19 Und jetzt lassen wir a gegen eins laufen.
  [63.04, 65.22], // 20 Die Seiten des Quadrats werden immer kürzer.
  [65.74, 69.92], // 21 Bei a gleich eins ist das Quadrat nur noch ein Punkt, und der Körper ist platt.
  [70.52, 74.32], // 22 Volumen null heißt Determinante null, also keine Inverse.
  [74.92, 76.02], // 23 Danach wächst er wieder.
  [76.5, 79.12], // 24 Nur bei a gleich eins verschwindet das Volumen.
];

// Stille nach einem Abschnitt im Video, Schlüssel „Take:Index“. Standard 0,32 s.
const GAP_DEFAULT = 0.32;
const GAP: Record<string, number> = {
  '1:0': 0.28,
  '1:1': 0.5, // die a rollen auf 1
  '1:4': 0.85, // offene Frage
  '1:6': 0.36,
  '1:11': 1.05, // dritte Zeile wird umgeformt
  '1:14': 0.7, // (a−1)² landet
  '1:16': 0.3,
  '1:17': 0.24,
  '1:18': 0.95, // Antwortfeld
  '1:19': 0.6, // Flug in den Raum
  '2:0': 0.26,
  '2:1': 0.22,
  '2:2': 0.4,
  '2:3': 0.3,
  '2:4': 0.2,
  '2:5': 0.5,
  '2:6': 0.4,
  '2:7': 0.45, // Grundfläche leuchtet
  '2:8': 0.6, // Höhe
  '2:9': 0.3,
  '2:10': 0.35,
  '2:11': 0.3,
  '2:12': 0.22,
  '2:13': 0.55,
  '2:14': 1.7, // zweite Scherung
  '2:15': 0.3,
  '2:16': 0.4,
  '2:17': 0.25,
  '2:18': 0.5,
  '2:19': 0.3,
  '2:20': 0.3,
  '2:21': 0.35,
  '2:22': 0.4,
  '2:23': 0.25,
  '2:24': 1.0, // a läuft bis 3
  '1:20': 0.3, // nach „Für deine Klausur:“ (Index 20 in S1 = Abschnitt 36)
  '1:21': 0.9, // Merksatz lesen
  '1:22': 0.26,
};

type Clip = {take: 0 | 1; from: number; to: number; at: number; key: string};
const ORDER: [0 | 1, number][] = [
  ...Array.from({length: 20}, (_, i) => [0, i] as [0, number]),
  ...S2.map((_, i) => [1, i] as [1, number]),
  ...[20, 21, 22, 23].map((i) => [0, i] as [0, number]),
];
export const CLIPS: Clip[] = (() => {
  const out: Clip[] = [];
  let cur = 0; // Ende der letzten Sprache im Video
  ORDER.forEach(([take, i], n) => {
    const [from, to] = (take === 0 ? S1 : S2)[i];
    const key = `${take + 1}:${i}`;
    const at = n === 0 ? 0 : cur + (GAP[out[n - 1].key] ?? GAP_DEFAULT);
    out.push({take, from, to, at, key});
    cur = at + (to - from);
  });
  return out;
})();

// Sekunde in einer Sprachdatei → Sekunde im Video
const mapper = (take: 0 | 1) => (s: number) => {
  const cs = CLIPS.filter((c) => c.take === take);
  let c = cs[0];
  for (const x of cs) if (x.from <= s + 1e-6) c = x;
  return c.at + (s - c.from);
};
export const V1 = mapper(0);
export const V2 = mapper(1);

const LAST = CLIPS[CLIPS.length - 1];
export const TOTAL = Math.round((LAST.at + (LAST.to - LAST.from) + 0.9) * 10) / 10;

// Wort-Cues im Video
export const T = {
  // Hook
  klausur: V1(0),
  frage: V1(1.72),
  invertierbar: V1(3.3),
  eins: V1(5.55),
  zeilen: V1(6.6),
  nicht: V1(8.6),
  einzige: V1(10.86),
  // ① Umformen
  ueberall: V1(13.0),
  diag: V1(14.36),
  ziehen: V1(16.48),
  ab: V1(18.6),
  aendert: V1(19.8),
  m1: V1(22.0),
  null1: V1(23.24),
  m2: V1(24.1),
  null2: V1(25.74),
  unten: V1(26.8),
  // ② Dreiecksmatrix
  dreieck: V1(28.32),
  produkt: V1(30.58),
  diagonale: V1(32.2),
  quadrat: V1(33.4),
  // ③ Antwort
  inv: V1(35.64),
  ungleich: V1(37.74),
  nur: V1(39.12),
  eins2: V1(41.6),
  also: V1(42.92),
  antwort: V1(43.68),
  // Warum (Take 3)
  warum: V1(46.86),
  pfeil: V2(0),
  koerper: V2(2.66),
  volumen: V2(6.2),
  drei: V2(9.36), // „Nehmen wir a gleich minus eins“
  vierCalc: V2(11.82),
  vier2: V2(15.56),
  gxh: V2(16.92),
  gf: V2(17.9),
  hoehe: V2(18.7),
  basis: V2(19.6),
  ersten: V2(20.6),
  dritten1: V2(21.4),
  abstand: V2(22.76),
  dieser: V2(25.42),
  zieh: V2(26.92),
  rutscht: V2(30.06),
  parallel: V2(34.2),
  bleibt: V2(36.5),
  hoeheGleich: V2(38.52),
  gfGleich: V2(39.44),
  volumen2: V2(40.68),
  vier3: V2(42.06),
  dritten: V2(42.9),
  quadrat2: V2(45.66),
  zweiMal: V2(47.9), // „Seitenlänge zwei“
  einsHoch: V2(49.3),
  produkt2: V2(50.84),
  diagonale2: V2(53.52),
  diagZahlen: V2(55.8),
  diagProd: V2(58.38),
  laeuft: V2(60.36),
  seiten: V2(63.04),
  punkt: V2(65.74),
  platt: V2(68.68),
  volNull: V2(70.52),
  detNull: V2(71.84),
  keineInv: V2(73.08),
  waechst: V2(74.92),
  nurBei: V2(76.5),
  // Merksatz, CTA (Take 1)
  merk: V1(87.8),
  nullen: V1(89.08),
  dann: V1(90.46),
  cta: V1(92.88),
  such: V1(94.3),
  tippt: V1(95.2),
};

// Untertitel: [Take, Start, Ende, Text] in Sekunden der Sprachdatei. Im CTA keine.
const SUB: [0 | 1, number, number, string][] = [
  [0, 0, 4.36, 'Mathe-1-Klausur: Für welche a ist diese Matrix invertierbar?'],
  [0, 5.3, 10.24, 'Bei a = 1 sind alle drei Zeilen gleich. Dann ist sie sicher nicht invertierbar.'],
  [0, 10.86, 12.3, 'Aber ist das der einzige Wert?'],
  [0, 13.0, 15.92, 'Überall steht 1, nur auf der Diagonale steht a.'],
  [0, 16.48, 21.36, 'Also ziehen wir die erste Zeile von den anderen ab. Das ändert die Determinante nicht.'],
  [0, 22.0, 26.32, '1 − 1 = 0. a − 1 bleibt. Und wieder 0.'],
  [0, 26.8, 27.6, 'Unten genauso.'],
  [0, 28.04, 34.9, 'Jetzt ist es eine Dreiecksmatrix. Ihre Determinante ist das Produkt der Diagonale: (a − 1)².'],
  [0, 35.46, 42.5, 'Invertierbar heißt: Determinante ≠ 0. Und (a − 1)² ist nur bei a = 1 null.'],
  [0, 42.92, 46.14, 'Also: invertierbar für alle a ≠ 1.'],
  [0, 46.86, 49.26, 'Aber warum darf man Zeilen einfach abziehen?'],
  [1, 0, 8.78, 'Jede Zeile ist ein Pfeil im Raum. Zusammen spannen die drei Pfeile einen schiefen Körper auf, und die Determinante ist hier genau sein Volumen.'],
  [1, 9.36, 16.22, 'Nehmen wir a = −1. Dann ist das Volumen (−1 − 1)², also 4.'],
  [1, 16.92, 19.04, 'Das Volumen ist Grundfläche mal Höhe.'],
  [1, 19.6, 26.22, 'Die Grundfläche bilden der erste und der dritte Pfeil. Die Höhe ist der Abstand der zweiten Pfeilspitze von dieser Fläche.'],
  [1, 26.92, 29.5, 'Jetzt ziehen wir die erste Zeile von der zweiten ab.'],
  [1, 30.06, 35.92, 'Die Spitze des zweiten Pfeils rutscht dabei genau entlang des ersten Pfeils, also parallel zur Grundfläche.'],
  [1, 36.5, 42.3, 'Ihr Abstand bleibt gleich. Höhe gleich, Grundfläche gleich, also bleibt das Volumen 4.'],
  [1, 42.9, 45.04, 'Mit dem dritten Pfeil passiert genau dasselbe.'],
  [1, 45.66, 52.98, 'Am Ende steht der Körper auf einem Quadrat mit der Seitenlänge 2 und ist 1 hoch. 2 · 2 · 1 = 4.'],
  [1, 53.52, 59.76, 'Und in der Matrix steht auf der Diagonale 1, −2, −2. Ihr Produkt ist auch 4.'],
  [1, 60.36, 65.22, 'Und jetzt lassen wir a gegen 1 laufen. Die Seiten des Quadrats werden immer kürzer.'],
  [1, 65.74, 69.92, 'Bei a = 1 ist das Quadrat nur noch ein Punkt, und der Körper ist platt.'],
  [1, 70.52, 74.32, 'Volumen 0 heißt Determinante 0, also keine Inverse.'],
  [1, 74.92, 79.12, 'Danach wächst er wieder. Nur bei a = 1 verschwindet das Volumen.'],
  [0, 87.8, 92.12, 'Für deine Klausur: erst Nullen erzeugen, dann die Diagonale multiplizieren.'],
];
export const SUBTITLES: [number, number, string][] = SUB.map(([take, a, b, text]) => {
  const m = take === 0 ? V1 : V2;
  return [m(a), m(b), text];
});
