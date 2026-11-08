// Timeline des Videos „Wie kann eine Fläche negativ sein?“.
// Alle Zeiten stammen aus den Sprechpausen von voice/dor-take1.mp3 (tools/pauses.mjs) und sind in Sekunden.

export const VOICE = 'voice/dor-take1.mp3';
export const MUSIC = 'music-dor.wav';
export const VOICE_END = 49.52;

// Bearbeitung der Stimme: [Stelle in der Sprachdatei, Länge]. Positive Längen kürzen lange Sprechpausen,
// negative fügen dort Stille ein: nach „Entscheidendes“ für das Umklappen, nach „Im Uhrzeigersinn“ für den Vergleich
// und nach „Orientierung“ für den Zusatzsatz zur x-Komponente (eigene Datei, VOICE2) und den Aufbau der Rechnung.
export const VOICE2 = 'voice/dor-take2-komponente.mp3';
export const VOICE2_LEN = 6.85; // Ende von „minus drei“ in VOICE2
const INSERT_SRC = 35.62;
const INSERT_LEAD = 0.35; // Stille vor dem Zusatzsatz
const CALC_D = 1.9; // Aufbau der Rechnung bis „Das Minus“
export const VOICE_CUTS: [number, number][] = [
  [2.7, 0.15],
  [7.05, 0.2],
  [9.8, 0.12],
  [12.85, 0.15],
  [16.5, 0.15],
  [19.05, 0.15],
  [22.6, -0.4],
  [27.9, -0.4],
  [31.1, 0.12],
  [INSERT_SRC, -(INSERT_LEAD + VOICE2_LEN + CALC_D - (36.0 - INSERT_SRC))],
  [39.05, 0.12],
  [42.5, 0.12],
  [45.35, 0.2],
];
// Zeit in der Sprachdatei → Zeit im Video
export const V = (s: number) => s - VOICE_CUTS.reduce((acc, [c, d]) => acc + (d > 0 ? Math.min(d, Math.max(0, s - c)) : s > c ? d : 0), 0);

// Zusatzsatz „Der Vektor ist immer noch drei Einheiten lang. Aber weil er jetzt nach links zeigt, ist seine x-Komponente minus drei.“
export const VOICE2_AT = V(INSERT_SRC) + INSERT_LEAD;

export const TOTAL = Math.round((V(VOICE_END) + 0.8) * 10) / 10;

// Wort-Cues im Video
export const T = {
  // 1 Hook
  gleich: V(1.36),
  aber: V(3.06),
  positiv: V(5.1),
  negativ: V(6.4),
  // 2 Vektoren
  grund: V(7.6),
  groesse: V(8.85),
  sondern: V(10.12),
  vektoren: V(11.0),
  aufspannen: V(12.0),
  // 3 Orientierung
  achte: V(13.26),
  ersten: V(14.56),
  zweiten: V(15.0),
  drehen: V(15.92),
  hier: V(16.88),
  gegen: V(17.78),
  // 4 Spiegelung
  doch: V(19.46),
  spiegeln: V(20.5),
  entscheidend: V(21.8),
  jetzt: V(23.0),
  ersten2: V(24.42),
  andersherum: V(25.88),
  imUhr: V(26.84),
  // 5 Determinante
  undGenau: V(28.28),
  determinante: V(30.14),
  sie: V(31.44),
  groesse2: V(32.9),
  orientierung: V(34.7),
  // 6 Zusatzsatz: a wird an der y-Achse gespiegelt, x = +3 → −3 (Zeiten in VOICE2 + VOICE2_AT)
  comp: VOICE2_AT,
  drei: VOICE2_AT + 1.4,
  flip: VOICE2_AT + 1.9,
  links: VOICE2_AT + 3.8,
  xkomp: VOICE2_AT + 4.9,
  minus3: VOICE2_AT + 5.85,
  calc: VOICE2_AT + VOICE2_LEN,
  // 7 Rechnung bestätigt
  minus: V(36.3),
  negativ2: V(37.56),
  nur: V(39.42),
  umgekehrt: V(41.6),
  // 8 Schluss
  gleicheF: V(42.88),
  andereO: V(44.06),
  // 9 CTA
  cta: V(45.8),
  such: V(47.62),
  tippt: V(48.76),
};

// Untertitel: [Start, Ende] in Sekunden der Sprachdatei, Text. Im CTA keine. Der Zusatzsatz steht in SUBTITLES2 (Zeiten in VOICE2).
export const SUBTITLES: [number, number, string][] = [
  [0, 2.56, 'Diese beiden Flächen sind exakt gleich groß.'],
  [3.06, 6.92, 'Aber warum ist die eine Determinante positiv und die andere negativ?'],
  [7.6, 9.68, 'Der Grund liegt nicht in der Größe der Fläche.'],
  [10.12, 12.7, 'Sondern in diesen beiden Vektoren, die sie aufspannen.'],
  [13.26, 16.36, 'Achte darauf, wie wir vom ersten zum zweiten Vektor drehen.'],
  [16.88, 18.88, 'Hier drehen wir uns gegen den Uhrzeigersinn.'],
  [19.46, 22.52, 'Doch wenn wir die Fläche spiegeln, passiert etwas Entscheidendes.'],
  [23.0, 26.52, 'Jetzt drehen wir uns vom ersten zum zweiten Vektor genau andersherum.'],
  [26.84, 27.76, 'Im Uhrzeigersinn.'],
  [28.28, 30.98, 'Und genau diesen Unterschied beschreibt die Determinante.'],
  [31.44, 35.5, 'Sie berücksichtigt nicht nur die Größe der Fläche, sondern auch ihre Orientierung.'],
  [36.0, 38.94, 'Das Minus bedeutet also nicht, dass die Fläche negativ ist.'],
  [39.42, 42.38, 'Es bedeutet nur, dass sich ihre Orientierung umgekehrt hat.'],
  [42.88, 45.14, 'Gleiche Fläche. Andere Orientierung.'],
];

export const SUBTITLES2: [number, number, string][] = [
  [0, 2.46, 'Der Vektor ist immer noch drei Einheiten lang.'],
  [2.92, 6.85, 'Aber weil er jetzt nach links zeigt, ist seine x-Komponente minus drei.'],
];
