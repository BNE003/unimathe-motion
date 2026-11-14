// Timeline des Aha-Videos „Was hat dein Herzschlag mit Vektoren zu tun?“ (v2: Zacken oder Wellen, Netzbrummen).
// Die Sprechabschnitte S sind Sekunden in der Sprachdatei (tools/pauses.mjs). Im Video wird jeder Abschnitt als
// eigener Clip gesetzt: Die natürliche Pause danach wird auf CAP gekürzt, dazu kommt EXTRA, wo eine Animation Zeit braucht.
// CLAUSES ist der Sprechtext je Abschnitt (für Untertitel und eine neue Aufnahme).

export const VOICE = 'voice/ekg-v2.mp3';
export const VOICE_READY = true;
export const MUSIC = 'music-ekg.wav';

export const CLAUSES = [
  'Was hat dein Herzschlag mit Vektoren zu tun?', // 0
  'Dieses EKG zittert:', // 1
  'Brummen aus der Steckdose.', // 2
  'Digital ist es nur eine Liste von Messwerten,', // 3
  'hier tausend.', // 4
  'Also ein Vektor.', // 5
  'Jeder Wert sagt: so hoch an dieser Stelle.', // 6
  'Man baut das EKG aus tausend schmalen Zacken,', // 7
  'das sind die Basisvektoren.', // 8
  'Das Brummen steckt in jeder einzelnen Zacke.', // 9
  'Löschen kann man es so nicht.', // 10
  'Aber dieselbe Kurve lässt sich auch aus Wellen bauen:', // 11
  'langsame, schnellere, immer schnellere.', // 12
  'Jede mit einem Gewicht.', // 13
  'Zusammen: wieder genau dieses EKG.', // 14
  'Und in dieser Liste ist das Brummen nur eine einzige Welle,', // 15
  'fünfzig Schwingungen pro Sekunde.', // 16
  'Gewicht auf null,', // 17
  'Wellen addieren:', // 18
  'sauberes EKG.', // 19
  'Derselbe Vektor, zwei Listen.', // 20
  'Wie ein Pfeil im gedrehten Koordinatensystem:', // 21
  'Der Pfeil bleibt, die Zahlen ändern sich.', // 22
  'Das ist die Fourier-Transformation:', // 23
  'ein Basiswechsel von Zacken zu Wellen.', // 24
  'Hundertvierzehn kostenlose Übungen in der App UniMathe.', // 25
  'Link in der Bio.', // 26
];

// Aufnahme ekg-v2.mp3 (61,04 s, Chris, eleven_v4, 922 Credits); Abschnitte aus tools/pauses.mjs (Mindestpause 0,15 s).
// Kurze Pausen innerhalb eines Satzteils (Abschnitte 6, 12, 14, 20) bleiben im Clip.
const S: [number, number][] = [
  [0.0, 2.5], // 0
  [3.04, 4.64], // 1
  [5.14, 6.44], // 2
  [6.98, 9.34], // 3
  [9.58, 10.4], // 4
  [10.84, 11.84], // 5
  [12.44, 14.88], // 6 Jeder Wert sagt: | so hoch an dieser Stelle.
  [15.4, 18.14], // 7
  [18.4, 19.76], // 8
  [20.22, 22.62], // 9
  [23.04, 24.34], // 10
  [24.96, 27.44], // 11
  [27.88, 30.26], // 12 langsame, schnellere, | immer schnellere.
  [30.76, 31.86], // 13
  [32.32, 34.7], // 14 Zusammen: | wieder genau dieses EKG.
  [35.24, 37.98], // 15
  [38.32, 39.86], // 16
  [40.4, 41.22], // 17
  [41.48, 42.28], // 18
  [42.62, 43.62], // 19
  [44.24, 46.1], // 20 Derselbe Vektor, | zwei Listen.
  [46.52, 48.94], // 21
  [49.28, 51.4], // 22
  [51.92, 53.76], // 23
  [54.04, 56.16], // 24
  [56.7, 59.6], // 25
  [59.94, 61.04], // 26
];

const CAP = 0.4;
const EXTRA: Record<number, number> = {
  2: 0.6, // Lupe auf das Zittern
  5: 0.5, // Spaltenvektor
  8: 0.7, // Zacken in der Lupe
  10: 0.6, // eine Zacke repariert, die anderen nicht
  12: 0.4, // Fächer aus Wellen
  14: 1.6, // Rekonstruktion
  16: 0.5,
  17: 0.4, // Balken auf null
  19: 0.9, // sauberes EKG
  20: 0.4,
  22: 0.8, // Gitter dreht sich
  24: 1.2,
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

export const W = (i: number) => CLIPS[i].at;
export const END = (i: number) => CLIPS[i].at + S[i][1] - S[i][0];
// Zeitpunkt bei Anteil f des Abschnitts i
export const at = (i: number, f: number) => W(i) + f * (S[i][1] - S[i][0]);

export const TOTAL = Math.round((END(S.length - 1) + 1.0) * 10) / 10;

export const T = {
  // Hook
  vektoren: at(0, 0.7),
  zittert: W(1),
  steckdose: W(2),
  // Messwerte
  digital: W(3),
  liste: at(3, 0.65),
  tausend: W(4),
  vektor: W(5),
  // Zacken
  jeder: W(6),
  stelle: at(6, 0.6),
  zacken: W(7),
  schmalen: at(7, 0.6),
  basisvektoren: W(8),
  brummen: W(9),
  loeschen: W(10),
  // Wellen
  wellen: W(11),
  langsam: W(12),
  schneller: at(12, 0.35),
  immer: at(12, 0.69),
  gewicht: W(13),
  zusammen: W(14),
  // Filter
  liste2: W(15),
  einzige: at(15, 0.75),
  fuenfzig: W(16),
  null: W(17),
  addieren: W(18),
  sauber: W(19),
  // Auflösung
  derselbe: W(20),
  zweiListen: at(20, 0.6),
  pfeil: W(21),
  bleibt: W(22),
  zahlen: at(22, 0.55),
  fourier: W(23),
  basiswechsel: W(24),
  // CTA
  cta: W(25) - 0.3,
  link: W(26),
};

// Untertitel: [Abschnitt von, Abschnitt bis, Text]. Im CTA keine.
const SUB: [number, number, string][] = [
  [0, 0, 'Was hat dein Herzschlag mit Vektoren zu tun?'],
  [1, 2, 'Dieses EKG zittert: Brummen aus der Steckdose.'],
  [3, 5, 'Digital ist es nur eine Liste von Messwerten, hier 1000. Also ein Vektor.'],
  [6, 8, 'Jeder Wert sagt: so hoch an dieser Stelle. Man baut das EKG aus 1000 schmalen Zacken, das sind die Basisvektoren.'],
  [9, 10, 'Das Brummen steckt in jeder einzelnen Zacke. Löschen kann man es so nicht.'],
  [11, 12, 'Aber dieselbe Kurve lässt sich auch aus Wellen bauen: langsame, schnellere, immer schnellere.'],
  [13, 14, 'Jede mit einem Gewicht. Zusammen: wieder genau dieses EKG.'],
  [15, 16, 'Und in dieser Liste ist das Brummen nur eine einzige Welle, 50 Schwingungen pro Sekunde.'],
  [17, 19, 'Gewicht auf null, Wellen addieren: sauberes EKG.'],
  [20, 22, 'Derselbe Vektor, zwei Listen. Wie ein Pfeil im gedrehten Koordinatensystem: Der Pfeil bleibt, die Zahlen ändern sich.'],
  [23, 24, 'Das ist die Fourier-Transformation: ein Basiswechsel von Zacken zu Wellen.'],
];
export const SUBTITLES = SUB.map(([a, b, text]) => [W(a), END(b), text] as [number, number, string]);
