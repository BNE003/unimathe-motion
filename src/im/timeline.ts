// Timeline des Aha-Videos „Kann man sich eine Zahl ausdenken? – die imaginäre Zahl i“.
// Eine Aufnahme (im-take1.mp3, 55,36 s, Chris, eleven_v4). Sprechabschnitte aus tools/pauses.mjs (Mindestpause 0,25 s), Sekunden in der Sprachdatei.

export const VOICE = 'voice/im-take1.mp3';
export const MUSIC = 'music-im.wav';

const S: [number, number][] = [
  [0, 2.18], // 0 Kann man sich einfach eine Zahl ausdenken?
  [2.64, 5.92], // 1 Genau das scheint bei der imaginären Zahl i passiert zu sein.
  [6.36, 8.6], // 2 Denn ihr Quadrat soll minus eins ergeben.
  [9.0, 10.78], // 3 Aber eins zum Quadrat ist eins,
  [11.14, 12.64], // 4 minus eins zum Quadrat auch.
  [13.14, 14.5], // 5 Kein Quadrat ist negativ.
  [15.14, 18.74], // 6 Doch im sechzehnten Jahrhundert tauchten solche Zahlen in Lösungsformeln auf.
  [19.36, 20.96], // 7 Bombelli rechnete einfach weiter –
  [21.42, 24.06], // 8 und bekam erstaunlicherweise echte Ergebnisse.
  [24.68, 25.3], // 9 Der Ausweg:
  [25.74, 26.76], // 10 eine zweite Achse,
  [27.02, 28.54], // 11 senkrecht zur Zahlengeraden.
  [28.92, 29.94], // 12 Auf ihr liegt i.
  [30.56, 33.08], // 13 Multiplizieren mit i dreht um neunzig Grad.
  [33.48, 34.66], // 14 Aus eins wird i.
  [35.24, 35.74], // 15 Noch einmal:
  [36.14, 37.78], // 16 Aus i wird minus eins.
  [38.26, 40.54], // 17 Zwei Vierteldrehungen, eine halbe Drehung:
  [40.92, 42.64], // 18 i mal i ist minus eins.
  [43.2, 44.08], // 19 Genau definiert:
  [44.46, 48.78], // 20 Jeder Punkt ist ein Paar reeller Zahlen, mit Rechenregeln ohne Widerspruch.
  [49.32, 51.96], // 21 Also nicht ausgedacht, sondern sauber erweitert.
  [52.48, 53.06], // 22 Mehr davon?
  [53.46, 55.36], // 23 Such im App Store nach UniMathe.
];

// Stille nach einem Abschnitt im Video. Standard 0,3 s, länger nur, wo eine Animation Zeit braucht.
const GAP_DEFAULT = 0.3;
const GAP: Record<number, number> = {
  3: 0.2,
  4: 0.4, // Bogen landet auf +1
  5: 0.35,
  6: 0.25,
  7: 0.2,
  8: 0.45, // +i und −i heben sich weg
  9: 0.15,
  10: 0.15,
  11: 0.25,
  12: 0.35,
  15: 0.2,
  16: 0.4, // Pfeil landet auf −1
  17: 0.2,
  18: 0.5, // i² = −1 rastet ein
  19: 0.2,
  20: 0.35,
  21: 0.35,
  22: 0.25,
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
export const TOTAL = Math.round((LAST.at + (LAST.to - LAST.from) + 0.7) * 10) / 10;

export const T = {
  // Hook
  imag: V(4.0), // „imaginären“: i² = −1 erscheint
  bogen: V(4.9), // gestrichelter Vorgriff-Bogen
  // Problem
  quadrat: A(2),
  minusEins: V(7.7),
  eins: A(3),
  minus: A(4),
  kein: A(5),
  // Geschichte
  jh: A(6),
  formel: V(17.4), // „Lösungsformeln“: √−121
  bombelli: A(7),
  erstaunlich: V(22.3),
  echte: V(23.1), // +i und −i heben sich weg
  // Ebene
  ausweg: A(9),
  achse: A(10),
  senkrecht: A(11),
  liegt: A(12),
  iSnap: V(29.55),
  // Drehung
  mult: A(13),
  neunzig: V(32.1),
  einsI: A(14),
  noch: A(15),
  iMinus: A(16),
  zwei: A(17),
  halbe: V(39.55),
  imal: A(18),
  minus1: V(42.0),
  // Paare
  definiert: A(19),
  paar: A(20),
  regeln: V(46.9),
  widerspruch: V(47.9),
  // Schluss, CTA
  also: A(21),
  erweitert: V(51.0),
  cta: A(22),
  such: A(23),
  tippt: V(54.4),
};

// Untertitel: [Start, Ende] in Sekunden der Sprachdatei, Text. Im CTA keine.
const SUB: [number, number, string][] = [
  [0, 2.18, 'Kann man sich einfach eine Zahl ausdenken?'],
  [2.64, 5.92, 'Genau das scheint bei der imaginären Zahl i passiert zu sein.'],
  [6.36, 8.6, 'Denn ihr Quadrat soll −1 ergeben.'],
  [9.0, 12.64, 'Aber 1² ist 1, (−1)² auch.'],
  [13.14, 14.5, 'Kein Quadrat ist negativ.'],
  [15.14, 18.74, 'Doch im 16. Jahrhundert tauchten solche Zahlen in Lösungsformeln auf.'],
  [19.36, 24.06, 'Bombelli rechnete einfach weiter – und bekam erstaunlicherweise echte Ergebnisse.'],
  [24.68, 29.94, 'Der Ausweg: eine zweite Achse, senkrecht zur Zahlengeraden. Auf ihr liegt i.'],
  [30.56, 33.08, 'Multiplizieren mit i dreht um 90°.'],
  [33.48, 37.78, 'Aus 1 wird i. Noch einmal: Aus i wird −1.'],
  [38.26, 42.64, 'Zwei Vierteldrehungen, eine halbe Drehung: i · i = −1.'],
  [43.2, 48.78, 'Genau definiert: Jeder Punkt ist ein Paar reeller Zahlen, mit Rechenregeln ohne Widerspruch.'],
  [49.32, 51.96, 'Also nicht ausgedacht, sondern sauber erweitert.'],
];
export const SUBTITLES: [number, number, string][] = SUB.map(([a, b, s]) => [V(a), V(b), s]);
