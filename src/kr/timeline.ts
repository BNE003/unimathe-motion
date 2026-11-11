// Timeline des Klausurvideos „Rang und Invertierbarkeit“: A(a) = (1 2 1; 2 5 3; 1 3 a).
// Eine Aufnahme (kr-take1.mp3, 94,24 s). Die Sprechabschnitte stammen aus tools/pauses.mjs (Mindestpause 0,2 s)
// und sind Sekunden in der Sprachdatei. Im Video wird jeder Abschnitt als eigener Clip gesetzt, die Pausen kommen aus GAP.

export const VOICE = 'voice/kr-take1.mp3';
export const MUSIC = 'music-kr.wav';

const S: [number, number][] = [
  [0.0, 1.18], // 0 Mathe-eins-Klausur.
  [1.86, 4.32], // 1 Diese Matrix ist fast immer invertierbar:
  [4.78, 5.96], // 2 für a gleich null,
  [6.24, 7.4], // 3 fünf, minus drei.
  [8.02, 9.74], // 4 Aber bei genau einem Wert nicht.
  [10.22, 10.84], // 5 Findest du ihn?
  [11.54, 12.22], // 6 Erst der Rang.
  [12.84, 16.08], // 7 Er zählt, wie viele Zeilen wirklich etwas Neues beitragen.
  [16.7, 18.56], // 8 Ablesen kann man ihn in Stufenform –
  [18.84, 19.66], // 9 also Gauß.
  [20.24, 23.46], // 10 Das Pivot einer Zeile ist ihr erster Eintrag ungleich null,
  [23.82, 25.18], // 11 hier die Eins oben links.
  [25.72, 26.98], // 12 Darunter brauchen wir Nullen.
  [27.56, 30.14], // 13 Zeile zwei minus zweimal Zeile eins:
  [30.5, 30.9], // 14 null,
  [31.16, 31.58], // 15 eins,
  [31.8, 32.18], // 16 eins.
  [32.82, 34.58], // 17 Zeile drei minus Zeile eins:
  [35.0, 35.4], // 18 null,
  [35.66, 36.12], // 19 eins,
  [36.38, 37.32], // 20 a minus eins.
  [37.84, 38.54], // 21 Neues Pivot:
  [38.94, 39.88], // 22 die Eins in der Mitte.
  [40.58, 42.34], // 23 Zeile drei minus Zeile zwei:
  [42.68, 43.1], // 24 null,
  [43.36, 43.8], // 25 null –
  [44.16, 44.42], // 26 und
  [44.68, 45.5], // 27 a minus zwei.
  [46.12, 47.9], // 28 Der Rang ist die Zahl der Pivots.
  [48.3, 50.3], // 29 Für a ungleich zwei sind es drei.
  [50.98, 53.94], // 30 Bei a gleich zwei wird die letzte Zeile komplett null:
  [54.36, 54.98], // 31 Rang zwei.
  [55.52, 56.56], // 32 Warum gerade zwei?
  [57.18, 60.98], // 33 Die Zeilen sind Pfeile im Raum, die ersten beiden spannen eine Ebene auf.
  [61.74, 65.1], // 34 Jeder Gauß-Schritt schiebt einen Pfeil nur parallel zu dieser Ebene.
  [65.58, 67.02], // 35 Deshalb ändert sich der Rang nicht.
  [67.52, 70.26], // 36 Der dritte Pfeil bleibt immer gleich hoch über der Ebene –
  [70.7, 74.22], // 37 am Ende zeigt er gerade nach oben, genau a minus zwei lang.
  [74.66, 76.7], // 38 Bei a gleich zwei schrumpft er auf null.
  [77.02, 77.98], // 39 Keine neue Richtung.
  [78.5, 80.92], // 40 Dann drückt A den ganzen Raum in diese Ebene.
  [81.36, 83.92], // 41 Zwei Ecken dieses Würfels landen am selben Punkt –
  [84.26, 85.26], // 42 zurück geht es nicht.
  [85.78, 86.84], // 43 Invertierbar heißt:
  [87.08, 87.74], // 44 voller Rang.
  [88.1, 90.14], // 45 Also genau für a ungleich zwei.
  [90.7, 91.82], // 46 Mehr Klausuraufgaben:
  [92.14, 94.24], // 47 Such im App Store nach UniMathe.
];

// Stille nach Abschnitt i im Video. Standard 0,32 s wie in den letzten Videos.
// v3: wieder normales Tempo (v2 mit langen Pausen war „zu langsam“). Längere Pausen nur, wo die Animation sie braucht.
const GAP_DEFAULT = 0.32;
const GAP: Record<number, number> = {
  0: 0.28,
  1: 0.3,
  2: 0.36, // Zählrad a = 0 ✓
  3: 0.45, // a = 5 ✓, a = −3 ✓
  4: 0.28,
  5: 0.9, // Zählrad dreht und bleibt bei ? stehen
  6: 0.28,
  7: 0.32,
  8: 0.22,
  9: 0.5, // Ziel-Treppe
  10: 0.26,
  11: 0.4,
  12: 0.4,
  13: 0.35, // Z₂ und 2·Z₁ liegen im Rechenbereich
  14: 0.3,
  15: 0.3,
  16: 0.9, // Ergebnis fliegt in die Matrix
  17: 0.4,
  18: 0.3,
  19: 0.3,
  20: 0.7,
  21: 0.28,
  22: 0.35,
  23: 0.4,
  24: 0.26,
  25: 0.22,
  26: 0.18,
  27: 1.0, // Ergebnis fliegt in die Matrix, Treppe zeichnet sich
  28: 0.4,
  29: 0.6, // Rang 3
  30: 0.3,
  31: 2.8, // Fallunterscheidung lesen
  32: 0.75, // Flug in den Raum
  33: 0.4,
  34: 0.6, // Z₂ gleitet in der Ebene
  35: 0.6, // Z₃ − Z₁
  36: 0.6, // Z₃ − Z₂′
  37: 0.55,
  38: 0.85, // Pfeil schrumpft auf null
  39: 0.6,
  40: 1.2, // Würfel wird platt
  41: 0.3,
  42: 0.5,
  43: 0.24,
  44: 0.28,
  45: 4.4, // Antwort, dann Merksatz lesen
  46: 0.3,
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
// Zeitpunkt im Abschnitt i bei Anteil f seiner Dauer (Wortlage nach Silben geschätzt)
const W = (i: number, f = 0) => CLIPS[i].at + f * (CLIPS[i].to - CLIPS[i].from);
const END = (i: number) => W(i, 1);

const LAST = CLIPS[CLIPS.length - 1];
export const TOTAL = Math.round((LAST.at + (LAST.to - LAST.from) + 0.9) * 10) / 10;

// Wort-Cues im Video
export const T = {
  // Hook
  klausur: W(0),
  matrix: W(1),
  invertierbar: W(1, 0.62),
  a0: W(2, 0.35),
  null: W(2, 0.78),
  fuenf: W(3, 0.0),
  minus3: W(3, 0.45),
  aber: W(4),
  wert: W(4, 0.55),
  nicht: W(4, 0.85),
  findest: W(5),
  findestEnd: END(5),
  // Strategie
  rang: W(6),
  zaehlt: W(7),
  zeilen: W(7, 0.35),
  neues: W(7, 0.7),
  ablesen: W(8),
  stufenform: W(8, 0.55),
  gauss: W(9),
  // Pivot 1
  pivot: W(10),
  eintrag: W(10, 0.5),
  ungleichNull: W(10, 0.78),
  einsOben: W(11),
  darunter: W(12),
  nullen: W(12, 0.7),
  // Z₂ − 2Z₁
  op2: W(13),
  zweimal: W(13, 0.55),
  r2a: W(14),
  r2b: W(15),
  r2c: W(16),
  // Z₃ − Z₁
  op3: W(17),
  r3a: W(18),
  r3b: W(19),
  r3c: W(20),
  // Pivot 2, Z₃ − Z₂
  pivot2: W(21),
  mitte: W(22),
  op4: W(23),
  r4a: W(24),
  r4b: W(25),
  r4c: W(27),
  // Treppe und Fälle
  zahl: W(28),
  pivots: W(28, 0.65),
  fuerA: W(29),
  drei: W(29, 0.75),
  beiA2: W(30),
  letzte: W(30, 0.5),
  komplett: W(30, 0.75),
  rangZwei: W(31),
  faelle: END(31),
  // Raum
  warum: W(32),
  pfeile: W(33),
  ebene: W(33, 0.55),
  gaussSchritt: W(34),
  parallel: W(34, 0.6),
  deshalb: W(35),
  dritte: W(36),
  hoch: W(36, 0.6),
  amEnde: W(37),
  oben: W(37, 0.4),
  aMinus2: W(37, 0.68),
  beiA2b: W(38),
  schrumpft: W(38, 0.55),
  keine: W(39),
  // Invertierbarkeit
  drueckt: W(40),
  ebene2: W(40, 0.75),
  ecken: W(41),
  punkt: W(41, 0.75),
  zurueck: W(42),
  inv: W(43),
  voll: W(44),
  also: W(45),
  merk: END(45) + 1.0,
  // CTA
  cta: W(46),
  such: W(47),
  tippt: W(47, 0.6),
};

// Untertitel: [Start, Ende] in Sekunden der Sprachdatei, Text. Im CTA keine.
const SUB: [number, number, string][] = [
  [0.0, 4.32, 'Mathe-1-Klausur: Diese Matrix ist fast immer invertierbar:'],
  [4.78, 7.4, 'für a = 0, 5, −3.'],
  [8.02, 10.84, 'Aber bei genau einem Wert nicht. Findest du ihn?'],
  [11.54, 16.08, 'Erst der Rang. Er zählt, wie viele Zeilen wirklich etwas Neues beitragen.'],
  [16.7, 19.66, 'Ablesen kann man ihn in Stufenform – also Gauß.'],
  [20.24, 25.18, 'Das Pivot einer Zeile ist ihr erster Eintrag ≠ 0, hier die 1 oben links.'],
  [25.72, 26.98, 'Darunter brauchen wir Nullen.'],
  [27.56, 32.18, 'Zeile 2 minus 2 · Zeile 1: 0, 1, 1.'],
  [32.82, 37.32, 'Zeile 3 minus Zeile 1: 0, 1, a − 1.'],
  [37.84, 39.88, 'Neues Pivot: die 1 in der Mitte.'],
  [40.58, 45.5, 'Zeile 3 minus Zeile 2: 0, 0 – und a − 2.'],
  [46.12, 50.3, 'Der Rang ist die Zahl der Pivots. Für a ≠ 2 sind es drei.'],
  [50.98, 54.98, 'Bei a = 2 wird die letzte Zeile komplett 0: Rang 2.'],
  [55.52, 56.56, 'Warum gerade 2?'],
  [57.18, 60.98, 'Die Zeilen sind Pfeile im Raum, die ersten beiden spannen eine Ebene auf.'],
  [61.74, 67.02, 'Jeder Gauß-Schritt schiebt einen Pfeil nur parallel zu dieser Ebene. Deshalb ändert sich der Rang nicht.'],
  [67.52, 74.22, 'Der dritte Pfeil bleibt immer gleich hoch über der Ebene – am Ende zeigt er gerade nach oben, genau a − 2 lang.'],
  [74.66, 77.98, 'Bei a = 2 schrumpft er auf 0. Keine neue Richtung.'],
  [78.5, 80.92, 'Dann drückt A den ganzen Raum in diese Ebene.'],
  [81.36, 85.26, 'Zwei Ecken dieses Würfels landen am selben Punkt – zurück geht es nicht.'],
  [85.78, 90.14, 'Invertierbar heißt: voller Rang. Also genau für a ≠ 2.'],
];
export const SUBTITLES: [number, number, string][] = SUB.map(([a, b, text]) => [V(a), V(b), text]);
