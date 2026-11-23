// Timeline des Klausurvideos „Bild und Urbild“.
// Aufnahme bu-take1.mp3 (98,2 s, Chris, eleven_v4, 1.299 Credits). Abschnitte aus tools/pauses.mjs (Mindestpause 0,25 s),
// Sekunden in der Sprachdatei; Wortpositionen aus der feineren Messung (0,1 s).

export const VOICE = 'voice/bu-take1.mp3';
export const MUSIC = 'music-bu.wav';

const S: [number, number][] = [
  [0, 1.66], // 0 Mathe eins Klausuraufgabe.
  [2.3, 3.88], // 1 Gegeben ist diese Parabel.
  [4.38, 4.86], // 2 Gesucht:
  [5.3, 5.9], // 3 ein Bild,
  [6.2, 6.88], // 4 ein Urbild
  [7.26, 8.56], // 5 und die ganze Bildmenge.
  [9.36, 10.6], // 6 Zuerst die Scheitelform:
  [11.06, 12.64], // 7 plus eins, (11.88) minus eins.
  [13.18, 16.78], // 8 So wird daraus (14.26) iks minus eins zum Quadrat, (16.10) minus vier.
  [17.44, 17.94], // 9 Scheitel:
  [18.44, 19.58], // 10 eins, (18.96) minus vier.
  [20.34, 20.86], // 11 Teil A:
  [21.4, 23.42], // 12 das Bild (21.96) von minus eins bis drei.
  [24.1, 26.06], // 13 Beim Bild starten wir bei den iks-Werten.
  [26.62, 27.04], // 14 Links:
  [27.54, 30.04], // 15 eins plus zwei minus drei, (29.54) also null.
  [30.72, 31.18], // 16 Rechts:
  [31.6, 33.52], // 17 neun minus sechs minus drei,
  [33.86, 34.32], // 18 auch null.
  [34.9, 36.38], // 19 Die Ränder liefern nur die Null.
  [36.88, 38.56], // 20 Doch dazwischen liegt der Scheitel.
  [39.1, 40.52], // 21 Der Punkt läuft den Bogen ab:
  [40.96, 43.46], // 22 hinunter bis minus vier (42.50) und zurück auf null.
  [44.0, 44.48], // 23 Das Bild:
  [44.94, 46.2], // 24 minus vier bis null.
  [47.0, 47.52], // 25 Teil B:
  [48.1, 49.82], // 26 das Urbild von null bis fünf.
  [50.52, 53.72], // 27 Gesucht sind alle iks mit einem Wert zwischen null und fünf.
  [54.42, 56.36], // 28 Dafür braucht man keine Umkehrfunktion.
  [56.88, 58.74], // 29 Diesmal starten wir also bei den Werten.
  [59.44, 60.04], // 30 Plus vier:
  [60.84, 64.2], // 31 iks minus eins zum Quadrat liegt zwischen vier (63.84) und neun.
  [64.7, 67.6], // 32 Also liegt iks (65.72) zwei bis drei (66.64) von der Eins entfernt.
  [68.28, 70.7], // 33 Links gibt das minus zwei bis minus eins,
  [71.04, 72.42], // 34 rechts drei bis vier.
  [72.94, 73.92], // 35 Ein Intervall oben,
  [74.18, 75.18], // 36 zwei Stücke unten.
  [75.94, 76.5], // 37 Teil C:
  [76.96, 77.94], // 38 die ganze Bildmenge.
  [78.46, 80.08], // 39 Ein Quadrat ist nie negativ,
  [80.52, 82.78], // 40 also ist Eff mindestens minus vier.
  [83.4, 85.5], // 41 Nach oben wachsen die Arme unbegrenzt.
  [86.08, 86.56], // 42 Das Bild:
  [87.02, 88.64], // 43 minus vier bis unendlich.
  [89.34, 89.66], // 44 Bild:
  [90.08, 91.42], // 45 von iks zu den Werten.
  [92.08, 92.54], // 46 Urbild:
  [92.92, 94.62], // 47 von den Werten zurück zu iks.
  [95.32, 95.94], // 48 Mehr davon?
  [96.36, 98.24], // 49 Such im App Store nach UniMathe.
];

// Stille nach einem Abschnitt im Video. Standard 0,3 s, länger nur, wo eine Animation Zeit braucht.
const GAP_DEFAULT = 0.3;
const GAP: Record<number, number> = {
  0: 0.35,
  1: 0.25,
  2: 0.15,
  3: 0.15,
  4: 0.15,
  5: 0.45,
  6: 0.25,
  7: 0.45, // Morph
  8: 0.45,
  9: 0.15,
  10: 0.6, // Zeile wandert in die Karte
  11: 0.2,
  12: 0.4,
  14: 0.15,
  15: 0.35,
  16: 0.15,
  17: 0.2,
  18: 0.4,
  21: 0.15,
  22: 0.7, // Punkt kommt an
  23: 0.15,
  24: 0.7,
  25: 0.2,
  26: 0.35,
  29: 0.5,
  30: 0.2,
  31: 0.45,
  32: 0.6,
  34: 0.45,
  35: 0.2,
  36: 0.8, // Aha
  37: 0.2,
  39: 0.2,
  40: 0.4,
  41: 0.6, // Zoom
  42: 0.15,
  43: 0.6,
  44: 0.15,
  46: 0.15,
  47: 0.5,
  48: 0.25,
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
  wBild: A(3),
  wUrbild: A(4),
  wMenge: A(5),
  // Scheitelform
  sf: A(6),
  plus1: A(7),
  minus1: V(11.88),
  sowird: A(8),
  quadrat: V(14.26),
  minus4: V(16.1),
  scheitel: A(9),
  sEins: A(10),
  sMinus4: V(18.96),
  // Teil a
  teilA: A(11),
  bildVon: V(21.96),
  beimBild: A(13),
  links: A(14),
  linksRech: A(15),
  linksNull: V(29.54),
  rechts: A(16),
  rechtsRech: A(17),
  rechtsNull: A(18),
  raender: A(19),
  dazwischen: A(20),
  punkt: A(21),
  hinunter: A(22),
  zurueck: V(42.5),
  zurueckEnd: E(22),
  bildA: A(23),
  bildAWert: A(24),
  aOk: E(24) + 0.1,
  // Teil b
  teilB: A(25),
  urbildVon: A(26),
  alleX: A(27),
  keineUmk: A(28),
  diesmal: A(29),
  plus4: A(30),
  zwischen: A(31),
  vierNeun: V(63.84),
  abstand: A(32),
  zweiDrei: V(65.72),
  vonEins: V(66.64),
  linksB: A(33),
  rechtsB: A(34),
  oben: A(35),
  unten: A(36),
  bOk: E(36) + 0.1,
  // Teil c
  teilC: A(37),
  menge: A(38),
  nieNeg: A(39),
  mind: A(40),
  arme: A(41),
  bildC: A(42),
  bildCWert: A(43),
  cOk: E(43) + 0.1,
  // Schluss
  sum: A(44),
  sumBild: A(45),
  sumUrbild: A(46),
  sumUrbild2: A(47),
  cta: A(48),
  such: A(49),
  tippt: V(97.2),
};

// Untertitel: [Start, Ende] in Sekunden der Sprachdatei, Text. Im CTA keine.
const SUB: [number, number, string][] = [
  [0, 1.66, 'Mathe 1 Klausuraufgabe.'],
  [2.3, 3.88, 'Gegeben ist diese Parabel.'],
  [4.38, 8.56, 'Gesucht: ein Bild, ein Urbild und die ganze Bildmenge.'],
  [9.36, 12.64, 'Zuerst die Scheitelform: plus 1, minus 1.'],
  [13.18, 16.78, 'So wird daraus (x − 1)² − 4.'],
  [17.44, 19.58, 'Scheitel: 1, −4.'],
  [20.34, 23.42, 'Teil a: das Bild von −1 bis 3.'],
  [24.1, 26.06, 'Beim Bild starten wir bei den x-Werten.'],
  [26.62, 30.04, 'Links: 1 + 2 − 3, also 0.'],
  [30.72, 34.32, 'Rechts: 9 − 6 − 3, auch 0.'],
  [34.9, 38.56, 'Die Ränder liefern nur die Null. Doch dazwischen liegt der Scheitel.'],
  [39.1, 43.46, 'Der Punkt läuft den Bogen ab: hinunter bis −4 und zurück auf 0.'],
  [44.0, 46.2, 'Das Bild: −4 bis 0.'],
  [47.0, 49.82, 'Teil b: das Urbild von 0 bis 5.'],
  [50.52, 53.72, 'Gesucht sind alle x mit einem Wert zwischen 0 und 5.'],
  [54.42, 56.36, 'Dafür braucht man keine Umkehrfunktion.'],
  [56.88, 58.74, 'Diesmal starten wir also bei den Werten.'],
  [59.44, 64.2, 'Plus 4: (x − 1)² liegt zwischen 4 und 9.'],
  [64.7, 67.6, 'Also liegt x 2 bis 3 von der 1 entfernt.'],
  [68.28, 72.42, 'Links gibt das −2 bis −1, rechts 3 bis 4.'],
  [72.94, 75.18, 'Ein Intervall oben, zwei Stücke unten.'],
  [75.94, 77.94, 'Teil c: die ganze Bildmenge.'],
  [78.46, 82.78, 'Ein Quadrat ist nie negativ, also ist f mindestens −4.'],
  [83.4, 85.5, 'Nach oben wachsen die Arme unbegrenzt.'],
  [86.08, 88.64, 'Das Bild: −4 bis unendlich.'],
  [89.34, 94.62, 'Bild: von x zu den Werten. Urbild: von den Werten zurück zu x.'],
];
export const SUBTITLES: [number, number, string][] = SUB.map(([a, b, s]) => [V(a), V(b), s]);
