// Timeline des Klausurvideos „Äquivalenzrelation“: a ∼ b ⟺ 3 ∣ (a − b) auf ℤ.
// Aufnahme aeq-take1.mp3 (99,6 s, Chris, eleven_v4, 1.339 Credits). Abschnitte aus tools/pauses.mjs (Mindestpause 0,25 s),
// Sekunden in der Sprachdatei; Wortpositionen innerhalb eines Abschnitts aus der feineren Messung (0,1 s).

export const VOICE = 'voice/aeq-take1.mp3';
export const MUSIC = 'music-aeq.wav';

const S: [number, number][] = [
  [0, 1.68], // 0 Mathe-eins-Klausuraufgabe.
  [2.3, 3.72], // 1 Auf den ganzen Zahlen gilt:
  [4.14, 7.98], // 2 A steht in Relation zu B, | wenn drei A minus B teilt. (6.02)
  [8.48, 8.92], // 3 Zeige:
  [9.38, 11.26], // 4 Das ist eine Äquivalenzrelation.
  [11.74, 13.18], // 5 Und bestimme alle Klassen.
  [13.78, 15.66], // 6 Drei teilt A minus B heißt:
  [15.96, 18.28], // 7 A minus B ist | ein Vielfaches von drei. (17.26)
  [18.88, 19.38], // 8 Teil A:
  [19.86, 22.1], // 9 Äquivalenzrelation heißt reflexiv,
  [22.4, 24.12], // 10 symmetrisch | und transitiv. (23.26)
  [24.82, 25.34], // 11 Reflexiv:
  [25.92, 28.24], // 12 Jede Zahl steht zu sich selbst in Relation.
  [28.64, 29.96], // 13 A minus A ist null,
  [30.26, 31.68], // 14 und null ist drei mal null.
  [32.3, 32.96], // 15 Symmetrisch:
  [33.36, 35.52], // 16 Aus A zu B | folgt B zu A. (34.48)
  [36.0, 38.0], // 17 A minus B ist | drei mal K, (37.14)
  [38.28, 39.48], // 18 mit einer ganzen Zahl K.
  [39.96, 40.9], // 19 Mal minus eins:
  [41.28, 43.74], // 20 B minus A ist drei mal minus K.
  [44.16, 46.14], // 21 Minus K ist wieder eine ganze Zahl.
  [46.72, 47.28], // 22 Transitiv:
  [47.82, 51.04], // 23 Aus A zu B und B zu C | folgt A zu C. (50.02)
  [51.54, 53.4], // 24 A minus B ist drei mal K,
  [53.86, 55.68], // 25 B minus C ist drei mal L.
  [56.16, 56.76], // 26 Wir addieren.
  [57.14, 59.26], // 27 Minus B und plus B heben sich auf.
  [59.78, 60.3], // 28 Es bleibt:
  [60.64, 63.74], // 29 A minus C ist | drei mal die Summe K plus L. (61.86)
  [64.22, 65.2], // 30 Alle drei gelten:
  [65.52, 67.38], // 31 Das ist eine Äquivalenzrelation.
  [67.92, 68.42], // 32 Teil B:
  [68.88, 72.52], // 33 Die Klasse einer Zahl sind alle Zahlen, die zu ihr in Relation stehen.
  [72.98, 75.4], // 34 Wir starten bei null und springen in Dreierschritten.
  [75.82, 77.06], // 35 Das ist die Klasse der Null.
  [77.54, 78.62], // 36 Die Eins ist noch frei.
  [79.08, 79.96], // 37 Hier ist ihre Klasse.
  [80.4, 81.08], // 38 Dann die Zwei.
  [81.5, 82.06], // 39 Und die Drei?
  [82.48, 83.88], // 40 Die liegt schon in der Klasse der Null.
  [84.36, 86.64], // 41 Jede Zahl landet in genau einer Klasse:
  [87.02, 88.68], // 42 je nach Rest beim Teilen durch drei.
  [89.08, 91.56], // 43 Also gibt es genau drei Äquivalenzklassen.
  [91.96, 92.56], // 44 Reflexiv,
  [92.88, 94.34], // 45 symmetrisch, transitiv,
  [94.78, 96.06], // 46 und genau drei Klassen.
  [96.58, 97.2], // 47 Mehr davon?
  [97.52, 99.6], // 48 Such im App Store nach UniMathe.
];

// Stille nach einem Abschnitt im Video. Standard 0,32 s, länger nur, wo eine Animation Zeit braucht.
const GAP_DEFAULT = 0.32;
const GAP: Record<number, number> = {
  0: 0.4, // Karte
  2: 0.4,
  7: 0.8, // Dreiersprünge
  10: 0.45, // Chips
  12: 0.4,
  13: 0.7, // a − a → 0
  14: 0.9, // 0 = 3 · 0, Rahmen
  16: 0.5,
  18: 0.4,
  19: 0.45,
  20: 1.2, // Tausch und 3(−k)
  21: 1.0, // ✓
  23: 0.5,
  25: 0.5,
  26: 1.0, // Zeilen zusammenführen
  27: 1.1, // Streichen
  29: 1.3, // 3(k + l), ✓
  31: 0.8, // Chips fließen zusammen
  33: 0.6,
  34: 0.9, // Sprünge von 0
  35: 0.9, // Reihe 0
  37: 1.1, // Klasse 1
  38: 1.4, // Klasse 2
  39: 0.4,
  40: 0.8,
  42: 0.9, // Reste
  43: 1.5, // Mengen und ℤ/∼
  46: 1.0, // Zusammenfassung
  47: 0.3,
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
export const A = (i: number) => CLIPS[i].at;
export const E = (i: number) => CLIPS[i].at + (CLIPS[i].to - CLIPS[i].from);

const LAST = CLIPS[CLIPS.length - 1];
export const TOTAL = Math.round((LAST.at + (LAST.to - LAST.from) + 0.8) * 10) / 10;

export const T = {
  // Einstieg
  frage: A(1),
  relation0: A(2),
  teilt0: V(6.02),
  zeige: A(3),
  aeq0: A(4),
  klassen0: A(5),
  heisst: A(6),
  vielfach: V(17.26),
  // Teil a
  teilA: A(8),
  wR: V(21.35),
  wS: A(10),
  wT: V(23.4),
  refl: A(11),
  selbst: A(12),
  aa: A(13),
  null3: A(14),
  reflOk: E(14) + 0.15,
  sym: A(15),
  aus: A(16),
  folgt: V(34.48),
  ak: A(17),
  dreiK: V(37.14),
  ganzK: A(18),
  mal: A(19),
  ba: A(20),
  ganz: A(21),
  symOk: E(21) + 0.25,
  trans: A(22),
  ausT: A(23),
  folgtT: V(50.02),
  abk: A(24),
  bcl: A(25),
  add: A(26),
  heben: A(27),
  bleibt: A(28),
  ac: A(29),
  summe: V(61.86),
  transOk: E(29) + 0.45,
  alle: A(30),
  relation: A(31),
  // Teil b
  teilB: A(32),
  klasse: A(33),
  start: A(34),
  kl0: A(35),
  eins: A(36),
  kl1: A(37),
  zwei: A(38),
  drei: A(39),
  schon: A(40),
  jede: A(41),
  rest: A(42),
  genau: A(43),
  bOk: E(43) + 0.2,
  // Schluss
  summary: A(44),
  sSym: V(92.88),
  sTrans: V(93.78),
  sKl: A(46),
  cta: A(47),
  such: A(48),
  tippt: V(98.75),
};

// Untertitel: [Start, Ende] in Sekunden der Sprachdatei, Text. Im CTA keine.
const SUB: [number, number, string][] = [
  [0, 1.68, 'Mathe-1-Klausuraufgabe.'],
  [2.3, 7.98, 'Auf den ganzen Zahlen gilt: a steht in Relation zu b, wenn 3 a − b teilt.'],
  [8.48, 13.18, 'Zeige: Das ist eine Äquivalenzrelation. Und bestimme alle Klassen.'],
  [13.78, 18.28, '3 teilt a − b heißt: a − b ist ein Vielfaches von 3.'],
  [18.88, 24.12, 'Teil a: Äquivalenzrelation heißt reflexiv, symmetrisch und transitiv.'],
  [24.82, 28.24, 'Reflexiv: Jede Zahl steht zu sich selbst in Relation.'],
  [28.64, 31.68, 'a − a ist 0, und 0 ist 3 · 0.'],
  [32.3, 35.52, 'Symmetrisch: Aus a ∼ b folgt b ∼ a.'],
  [36.0, 39.48, 'a − b ist 3 · k, mit einer ganzen Zahl k.'],
  [39.96, 43.74, 'Mal −1: b − a ist 3 · (−k).'],
  [44.16, 46.14, '−k ist wieder eine ganze Zahl.'],
  [46.72, 51.04, 'Transitiv: Aus a ∼ b und b ∼ c folgt a ∼ c.'],
  [51.54, 55.68, 'a − b ist 3 · k, b − c ist 3 · l.'],
  [56.16, 59.26, 'Wir addieren. −b und +b heben sich auf.'],
  [59.78, 63.74, 'Es bleibt: a − c ist 3 · (k + l).'],
  [64.22, 67.38, 'Alle drei gelten: Das ist eine Äquivalenzrelation.'],
  [67.92, 72.52, 'Teil b: Die Klasse einer Zahl sind alle Zahlen, die zu ihr in Relation stehen.'],
  [72.98, 77.06, 'Wir starten bei 0 und springen in Dreierschritten. Das ist die Klasse der 0.'],
  [77.54, 79.96, 'Die 1 ist noch frei. Hier ist ihre Klasse.'],
  [80.4, 81.08, 'Dann die 2.'],
  [81.5, 83.88, 'Und die 3? Die liegt schon in der Klasse der 0.'],
  [84.36, 88.68, 'Jede Zahl landet in genau einer Klasse: je nach Rest beim Teilen durch 3.'],
  [89.08, 91.56, 'Also gibt es genau drei Äquivalenzklassen.'],
  [91.96, 96.06, 'Reflexiv, symmetrisch, transitiv, und genau drei Klassen.'],
];
export const SUBTITLES: [number, number, string][] = SUB.map(([a, b, s]) => [V(a), V(b), s]);
