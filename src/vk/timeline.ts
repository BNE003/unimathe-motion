// Timeline des Klausurvideos „Verkettung von Abbildungen“.
// Aufnahme vk-take1.mp3 (96,6 s, Chris, eleven_v4, 1.335 Credits). Abschnitte aus tools/pauses.mjs (Mindestpause 0,25 s),
// Sekunden in der Sprachdatei; Wortpositionen aus der feineren Messung (0,1 s).

export const VOICE = 'voice/vk-take1.mp3';
export const MUSIC = 'music-vk.wav';

const S: [number, number][] = [
  [0, 1.88], // 0 Mathe eins Klausuraufgabe.
  [2.36, 4.04], // 1 Gegeben sind Eff und G.
  [4.5, 4.98], // 2 Gesucht:
  [5.46, 9.26], // 3 beide Verkettungen, (6.62) ihre Eigenschaften (8.10) und Eff hoch minus eins.
  [9.72, 10.26], // 4 Teil A.
  [10.8, 12.02], // 5 Eff nach G heißt:
  [12.38, 13.62], // 6 erst G, (12.72) dann Eff.
  [14.28, 16.52], // 7 Minus eins wird zu eins, (15.92) dann zu fünf.
  [17.22, 17.8], // 8 Allgemein:
  [18.3, 22.34], // 9 iks Quadrat in Eff eingesetzt (20.26) gibt zwei iks Quadrat plus drei.
  [22.94, 24.1], // 10 G nach Eff heißt:
  [24.44, 24.9], // 11 erst Eff,
  [25.28, 25.74], // 12 dann G.
  [26.3, 28.68], // 13 Minus eins wird zu eins, (27.82) und bleibt eins.
  [29.18, 31.86], // 14 Allgemein wird zwei iks plus drei quadriert:
  [32.28, 34.96], // 15 vier iks Quadrat plus zwölf iks (34.38) plus neun.
  [35.42, 37.62], // 16 Andere Reihenfolge, (36.66) anderes Ergebnis.
  [38.16, 40.46], // 17 Bei Eff nach G wirkt Eff auf die Werte:
  [40.84, 42.28], // 18 mal zwei, (41.74) plus drei.
  [42.86, 45.58], // 19 Bei G nach Eff (43.82) wirkt Eff (44.40) vorher auf die Eingaben:
  [45.98, 48.2], // 20 Die Parabel wird schmaler (≈46.9) und rutscht nach links.
  [48.72, 49.28], // 21 Teil B.
  [49.78, 51.34], // 22 Die Zielmenge ist jeweils R.
  [51.9, 52.62], // 23 Eff nach G:
  [53.14, 55.16], // 24 Minus eins und eins landen auf (54.94) fünf.
  [55.68, 56.44], // 25 Nicht injektiv.
  [56.94, 58.22], // 26 Unter drei kommt nichts an.
  [58.64, 59.42], // 27 Nicht surjektiv.
  [60.02, 60.66], // 28 G nach Eff:
  [61.3, 63.82], // 29 Minus eins und minus zwei landen auf eins.
  [64.18, 64.92], // 30 Nicht injektiv.
  [65.4, 66.64], // 31 Negative Werte fehlen.
  [67.04, 67.84], // 32 Nicht surjektiv.
  [68.32, 69.74], // 33 Also ist keine bijektiv.
  [70.38, 71.0], // 34 Teil C.
  [71.5, 73.48], // 35 Eff ist eine Gerade mit Steigung zwei,
  [73.76, 76.44], // 36 trifft jeden Wert genau einmal und ist (75.94) bijektiv.
  [77.06, 79.32], // 37 Eff rechnet mal zwei, (78.56) dann plus drei.
  [79.8, 80.34], // 38 Rückwärts:
  [80.6, 82.22], // 39 minus drei, (≈81.4) dann durch zwei.
  [82.74, 83.34], // 40 Umgestellt:
  [83.74, 87.42], // 41 Eff hoch minus eins von iks gleich iks minus drei, (86.86) durch zwei.
  [87.94, 91.74], // 42 Die Reihenfolge zählt, (89.28) keine Verkettung ist injektiv oder surjektiv, (≈90.8) und Eff ist umkehrbar.
  [92.08, 93.34], // 43 Mehr davon?
  [93.86, 94.42], // 44 Such im
  [94.74, 96.64], // 45 App Store nach UniMathe.
];

// Stille nach einem Abschnitt im Video. Standard 0,3 s, länger nur, wo eine Animation Zeit braucht.
const GAP_DEFAULT = 0.3;
const GAP: Record<number, number> = {
  0: 0.35,
  1: 0.25,
  2: 0.2,
  3: 0.55,
  4: 0.25,
  5: 0.2,
  6: 0.45,
  7: 0.45,
  8: 0.2,
  9: 0.9, // Ergebnisrahmen
  10: 0.2,
  11: 0.2,
  12: 0.4,
  13: 0.45,
  14: 0.9, // binomische Formel
  15: 0.8,
  16: 1.3, // Übergang zum Graphen
  17: 0.25,
  18: 0.9, // Kurve hebt sich
  19: 0.2,
  20: 1.6, // Senkrechte bei −1
  21: 0.25,
  22: 0.4,
  23: 0.2,
  24: 0.25,
  25: 0.35,
  26: 0.25,
  27: 0.6,
  28: 0.2,
  29: 0.25,
  30: 0.35,
  31: 0.25,
  32: 0.4,
  33: 1.4, // Tabelle
  34: 0.25,
  35: 0.2,
  36: 0.6,
  38: 0.15,
  39: 0.8, // Token kehrt zurück
  41: 1.1, // Ergebnisrahmen
  42: 0.6,
  43: 0.25,
  44: 0.2,
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
export const TOTAL = Math.round((LAST.at + (LAST.to - LAST.from) + 0.7) * 10) / 10;

export const T = {
  // Einstieg
  gegeben: A(1),
  gesucht: A(2),
  verk: A(3),
  eig: V(6.62),
  inv: V(8.1),
  // Teil a
  teilA: A(4),
  fnachg: A(5),
  erstG: A(6),
  dannF: V(12.72),
  m1: A(7),
  zuFuenf: V(15.92),
  allg1: A(8),
  xq: A(9),
  gibt: V(20.26),
  box1: E(9),
  gnachf: A(10),
  erstF: A(11),
  dannG: A(12),
  m2: A(13),
  bleibt: V(27.82),
  allg2: A(14),
  vier: A(15),
  neun: V(34.38),
  box2: E(15),
  andere: A(16),
  ergebnis: V(36.66),
  aOk: E(16),
  // Graph
  toGraph: E(16) + 0.15,
  werte: A(17),
  mal2: A(18),
  plus3: V(41.74),
  eingaben: A(19),
  wirktF: V(43.82),
  vorher: V(44.4),
  schmaler: A(20),
  links: V(46.9),
  senk: E(20) + 0.1,
  // Teil b
  teilB: A(21),
  ziel: A(22),
  b1: A(23),
  b1pts: A(24),
  b1fuenf: V(54.94),
  b1inj: A(25),
  b1unter: A(26),
  b1sur: A(27),
  b2: A(28),
  b2pts: A(29),
  b2inj: A(30),
  b2neg: A(31),
  b2sur: A(32),
  keine: A(33),
  bOk: E(33) + 0.5,
  // Teil c
  teilC: A(34),
  gerade: A(35),
  trifft: A(36),
  bij: V(75.94),
  rechnet: A(37),
  plus3c: V(78.56),
  rueck: A(38),
  minus3: A(39),
  durch2: V(81.4),
  umgestellt: A(40),
  finv: A(41),
  finvDurch: V(86.86),
  cOk: E(41) + 0.25,
  // Schluss
  summary: A(42),
  sKeine: V(89.28),
  sUmk: V(90.8),
  cta: A(43),
  such: A(44),
  tippt: V(95.3),
};

// Untertitel: [Start, Ende] in Sekunden der Sprachdatei, Text. Im CTA keine.
const SUB: [number, number, string][] = [
  [0, 1.88, 'Mathe 1 Klausuraufgabe.'],
  [2.36, 4.04, 'Gegeben sind f und g.'],
  [4.5, 9.26, 'Gesucht: beide Verkettungen, ihre Eigenschaften und f⁻¹.'],
  [9.72, 13.62, 'Teil a. f nach g heißt: erst g, dann f.'],
  [14.28, 16.52, '−1 wird zu 1, dann zu 5.'],
  [17.22, 22.34, 'Allgemein: x² in f eingesetzt gibt 2x² + 3.'],
  [22.94, 25.74, 'g nach f heißt: erst f, dann g.'],
  [26.3, 28.68, '−1 wird zu 1, und bleibt 1.'],
  [29.18, 34.96, 'Allgemein wird 2x + 3 quadriert: 4x² + 12x + 9.'],
  [35.42, 37.62, 'Andere Reihenfolge, anderes Ergebnis.'],
  [38.16, 42.28, 'Bei f nach g wirkt f auf die Werte: mal 2, plus 3.'],
  [42.86, 48.2, 'Bei g nach f wirkt f vorher auf die Eingaben: Die Parabel wird schmaler und rutscht nach links.'],
  [48.72, 51.34, 'Teil b. Die Zielmenge ist jeweils ℝ.'],
  [51.9, 56.44, 'f nach g: −1 und 1 landen auf 5. Nicht injektiv.'],
  [56.94, 59.42, 'Unter 3 kommt nichts an. Nicht surjektiv.'],
  [60.02, 64.92, 'g nach f: −1 und −2 landen auf 1. Nicht injektiv.'],
  [65.4, 67.84, 'Negative Werte fehlen. Nicht surjektiv.'],
  [68.32, 69.74, 'Also ist keine bijektiv.'],
  [70.38, 76.44, 'Teil c. f ist eine Gerade mit Steigung 2, trifft jeden Wert genau einmal und ist bijektiv.'],
  [77.06, 82.22, 'f rechnet mal 2, dann plus 3. Rückwärts: minus 3, dann durch 2.'],
  [82.74, 87.42, 'Umgestellt: f⁻¹(x) = (x − 3)/2.'],
  [87.94, 91.74, 'Die Reihenfolge zählt, keine Verkettung ist injektiv oder surjektiv, und f ist umkehrbar.'],
];
export const SUBTITLES: [number, number, string][] = SUB.map(([a, b, s]) => [V(a), V(b), s]);
