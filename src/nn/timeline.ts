// Timeline des Aha-Videos „Warum ist 0,999… = 1?“ (Reihe WARUM?, Folge 2).
// Eine Aufnahme (nn-take1.mp3, 50,4 s, Chris, eleven_v4). Sprechabschnitte aus tools/pauses.mjs (Mindestpause 0,25 s), Sekunden in der Sprachdatei.

export const VOICE = 'voice/nn-take1.mp3';
export const MUSIC = 'music-nn.wav';

const S: [number, number][] = [
  [0, 2.18], // 0 Diese Zahl sieht kleiner aus als eins.
  [2.6, 5.36], // 1 Aber mathematisch ist sie exakt gleich eins.
  [5.96, 7.6], // 2 Egal wie viele Neunen wir schreiben,
  [7.9, 9.52], // 3 es fehlt scheinbar immer ein Stück.
  [10.16, 10.52], // 4 Stimmt:
  [11.0, 12.88], // 5 Jede davon ist kleiner als eins.
  [13.38, 15.52], // 6 Aber hier stehen unendlich viele Neunen.
  [16.08, 17.28], // 7 Nennen wir die Zahl x.
  [17.84, 19.3], // 8 Mal zehn verschiebt das Komma.
  [19.98, 21.2], // 9 Jetzt ziehen wir x ab.
  [21.74, 22.96], // 10 Die Neunen enden nie –
  [23.4, 25.22], // 11 jede oben hat eine Partnerin unten.
  [25.78, 26.44], // 12 Übrig bleibt:
  [26.82, 28.26], // 13 neun x gleich neun.
  [28.68, 29.08], // 14 Also
  [29.44, 30.46], // 15 x gleich eins.
  [31.18, 32.32], // 16 Der Abstand zur Eins:
  [32.7, 35.38], // 17 ein Zehntel, ein Hundertstel, ein Tausendstel.
  [35.82, 38.44], // 18 Er wird kleiner als jede noch so winzige Zahl.
  [39.1, 41.74], // 19 Bei unendlich vielen Neunen bleibt nichts übrig.
  [42.28, 43.82], // 20 Sie ist nicht unterwegs zur Eins.
  [44.3, 45.32], // 21 Sie ist die Eins,
  [45.62, 46.56], // 22 nur anders geschrieben.
  [47.4, 47.98], // 23 Mehr davon?
  [48.42, 50.4], // 24 Such im App Store nach UniMathe.
];

// Stille nach einem Abschnitt im Video. Standard 0,3 s, länger nur, wo eine Animation Zeit braucht.
const GAP_DEFAULT = 0.3;
const GAP: Record<number, number> = {
  0: 0.25,
  1: 0.4, // „=“ steht
  3: 0.35,
  4: 0.3,
  5: 0.4,
  6: 0.35,
  7: 0.3,
  8: 0.55, // Ziffern rücken eine Stelle
  9: 0.3,
  10: 0.25,
  11: 1.0, // Paare löschen sich aus
  12: 0.25,
  13: 0.35,
  14: 0.2,
  15: 1.0, // x wird zu 0,999…
  16: 0.25,
  17: 0.4,
  18: 0.35,
  19: 0.7, // die Lücke schließt sich
  20: 0.35,
  21: 0.2,
  22: 0.5,
  23: 0.3,
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
  kleiner: V(1.15), // „kleiner“: „<“ erscheint
  aber: A(1), // „<“ kippt in „=“
  exakt: V(4.35), // „exakt gleich eins“
  // Paradox: Zahlengerade, Zoom in die Lücke
  egal: A(2),
  fehlt: A(3),
  stimmt: A(4),
  jede: A(5),
  hier: A(6),
  unendlich: V(14.22),
  // Rechnung
  nennen: A(7),
  zehn: A(8),
  schiebt: V(18.35), // „verschiebt“: Ziffern rücken
  ziehen: A(9),
  enden: A(10),
  partner: A(11),
  tilgen: E(11) + 0.1, // Paare löschen sich aus
  uebrig: A(12),
  neunX: A(13),
  gleichNeun: V(27.64),
  also: A(14),
  xEins: A(15),
  zurueck: E(15) + 0.15, // x wird wieder 0,999…
  // Abstand
  abstand: A(16),
  zehntel: V(32.7),
  hundertstel: V(33.62),
  tausendstel: V(34.58),
  winzig: A(18),
  nichts: A(19),
  uebrigNull: V(40.94), // „bleibt nichts übrig“
  // Auflösung
  unterwegs: A(20),
  dieEins: A(21),
  anders: A(22),
  // CTA
  cta: A(23),
  such: A(24),
  tippt: V(49.5),
};

// Untertitel: [Start, Ende] in Sekunden der Sprachdatei, Text. Im CTA keine.
const SUB: [number, number, string][] = [
  [0, 2.18, 'Diese Zahl sieht kleiner aus als eins.'],
  [2.6, 5.36, 'Aber mathematisch ist sie exakt gleich eins.'],
  [5.96, 9.52, 'Egal wie viele Neunen wir schreiben, es fehlt scheinbar immer ein Stück.'],
  [10.16, 12.88, 'Stimmt: Jede davon ist kleiner als eins.'],
  [13.38, 15.52, 'Aber hier stehen unendlich viele Neunen.'],
  [16.08, 19.3, 'Nennen wir die Zahl x. Mal zehn verschiebt das Komma.'],
  [19.98, 21.2, 'Jetzt ziehen wir x ab.'],
  [21.74, 25.22, 'Die Neunen enden nie – jede oben hat eine Partnerin unten.'],
  [25.78, 30.46, 'Übrig bleibt: 9x = 9. Also x = 1.'],
  [31.18, 35.38, 'Der Abstand zur Eins: ein Zehntel, ein Hundertstel, ein Tausendstel.'],
  [35.82, 38.44, 'Er wird kleiner als jede noch so winzige Zahl.'],
  [39.1, 41.74, 'Bei unendlich vielen Neunen bleibt nichts übrig.'],
  [42.28, 46.56, 'Sie ist nicht unterwegs zur Eins. Sie ist die Eins, nur anders geschrieben.'],
];
export const SUBTITLES: [number, number, string][] = SUB.map(([a, b, s]) => [V(a), V(b), s]);
