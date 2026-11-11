// Timeline des Aha-Videos „Wie kann eine Matrix einen Vektor verschwinden lassen?“ (Kern einer Matrix).
// Aufnahmen: kn-take1.mp3 (49,12 s) und der neue Hook kn-hook2.mp3 (6,96 s). Die Sprechabschnitte stammen aus tools/pauses.mjs (Mindestpause 0,15 s bzw. 0,06 s)
// und sind Sekunden in der Sprachdatei. Im Video wird jeder Abschnitt als eigener Clip gesetzt, die Pausen kommen aus GAP.

export const VOICE = 'voice/kn-take1.mp3';
// v2: neuer Hook-Satz als eigene Aufnahme (kn-hook2.mp3, 6,96 s), ersetzt die ersten vier Abschnitte von kn-take1
export const VOICE_HOOK = 'voice/kn-hook2.mp3';
export const MUSIC = 'music-kn.wav';

// [von, bis, Datei]: Datei 0 = VOICE, 1 = VOICE_HOOK
const S: [number, number, 0 | 1][] = [
  [0.0, 2.08, 1], // 0 Ich schicke diesen Vektor durch eine Matrix.
  [2.42, 3.16, 1], // 1 Heraus kommt: …
  [3.54, 4.08, 1], // 2 nichts!
  [4.34, 5.38, 1], // 3 Nur der Nullvektor.
  [5.82, 6.96, 1], // 4 Was ist da passiert?
  [6.32, 8.42, 0], // 5 Spul zurück und schau auf alle Punkte:
  [8.86, 11.38, 0], // 6 Jeder rutscht schräg, bis er auf der x-Achse liegt.
  [11.86, 14.2, 0], // 7 Die anderen Pfeile landen irgendwo auf der Achse.
  [14.76, 18.54, 0], // 8 Aber unser Pfeil liegt genau auf der Schiene, die im Nullpunkt endet.
  [19.22, 19.62, 0], // 9 Moment.
  [20.08, 21.36, 0], // 10 Dann verschwindet nicht nur er.
  [21.8, 22.5, 0], // 11 Der doppelte,
  [22.58, 24.14, 0], // 12 der halbe, der umgedrehte –
  [24.46, 26.24, 0], // 13 jeder Vektor auf dieser Geraden.
  [26.66, 27.7, 0], // 14 Unendlich viele,
  [27.9, 29.16, 0], // 15 in einem einzigen Punkt.
  [29.72, 33.06, 0], // 16 Alle Vektoren auf dieser Geraden zusammen heißen der Kern von A:
  [33.52, 35.96, 0], // 17 alle v, für die A mal v null ist.
  [36.34, 37.92, 0], // 18 Der Nullvektor gehört immer dazu.
  [38.58, 39.96, 0], // 19 Deshalb gibt es kein Zurück:
  [40.38, 42.78, 0], // 20 Diese zwei Vektoren landen auf demselben Punkt.
  [43.18, 45.12, 0], // 21 Von dort weiß niemand mehr, welcher es war.
  [45.74, 46.86, 0], // 22 Mehr Aha-Momente:
  [47.22, 49.12, 0], // 23 Such im App Store nach UniMathe.
];

// Stille nach Abschnitt i im Video. Normales Tempo: 0,3 s, länger nur, wo eine Animation Zeit braucht.
const GAP_DEFAULT = 0.28;
const GAP: Record<number, number> = {
  1: 0.62, // kurze Pause vor „nichts!“: die Matrix trifft den Vektor
  2: 0.35,
  3: 0.4,
  4: 0.35,
  6: 0.45,
  7: 0.35,
  8: 0.75, // v fährt in den Nullpunkt
  10: 0.3,
  13: 0.35,
  14: 0.2,
  15: 0.85, // alle Vektoren der Geraden landen im Nullpunkt
  17: 0.4,
  18: 0.45,
  20: 0.4,
  21: 0.45,
};

export const CLIPS = (() => {
  let at = 0;
  return S.map(([from, to, src], i) => {
    const c = {from, to, at, src};
    at += to - from + (GAP[i] ?? GAP_DEFAULT);
    return c;
  });
})();

// Zeitpunkt im Video: Abschnitt i, Anteil frac (0 = Beginn, 1 = Ende) oder Sekunde in der Sprachdatei VOICE
export const W = (i: number, frac = 0) => CLIPS[i].at + (S[i][1] - S[i][0]) * frac;
export const V = (s: number) => {
  const i = S.findIndex(([a, b, src]) => src === 0 && s >= a - 0.25 && s <= b + 0.25);
  const k = i < 0 ? S.length - 1 : i;
  return CLIPS[k].at + (s - S[k][0]);
};

const END = (i: number) => W(i, 1);
export const TOTAL = Math.round((END(S.length - 1) + 0.9) * 10) / 10;

// Wort-Cues im Video
export const T = {
  // 1 Hook (Zeiten in VOICE_HOOK)
  vektor: W(0, 0.42), // „diesen Vektor“
  matrix: W(0, 0.78), // „durch eine Matrix“
  heraus: W(1),
  nichts: W(2),
  nullvektor0: W(3),
  was: W(4),
  // 2 Schienen
  spul: W(5),
  punkte: V(7.76),
  rutscht: W(6),
  achse: V(10.4),
  // 3 andere Pfeile, dann v
  anderen: W(7),
  irgendwo: V(13.12),
  aber: W(8),
  schiene: V(16.14),
  nullpunkt: V(16.9),
  // 4 unendlich viele
  moment: W(9),
  nichtNur: W(10),
  doppelte: W(11),
  halbe: W(12),
  umgedreht: V(23.28),
  jeder: W(13),
  unendlich: W(14),
  einzigen: W(15),
  // 5 Kern
  alle: W(16),
  kern: V(32.28),
  alleV: W(17),
  amal: V(34.68),
  nullIst: V(35.22),
  nullvektor: W(18),
  dazu: V(37.36),
  // 6 kein Zurück
  deshalb: W(19),
  zwei: W(20),
  demselben: V(41.7),
  dort: W(21),
  welcher: V(44.3),
  // 7 CTA
  cta: W(22),
  such: W(23),
  tippt: V(48.38),
};

// Untertitel: [Clip von, Clip bis, Text]. Im CTA keine.
const SUB: [number, number, string][] = [
  [0, 0, 'Ich schicke diesen Vektor durch eine Matrix.'],
  [1, 2, 'Heraus kommt: … nichts!'],
  [3, 4, 'Nur der Nullvektor. Was ist da passiert?'],
  [5, 5, 'Spul zurück und schau auf alle Punkte:'],
  [6, 6, 'Jeder rutscht schräg, bis er auf der x-Achse liegt.'],
  [7, 7, 'Die anderen Pfeile landen irgendwo auf der Achse.'],
  [8, 8, 'Aber unser Pfeil liegt genau auf der Schiene, die im Nullpunkt endet.'],
  [9, 10, 'Moment. Dann verschwindet nicht nur er.'],
  [11, 12, 'Der doppelte, der halbe, der umgedrehte –'],
  [13, 13, 'jeder Vektor auf dieser Geraden.'],
  [14, 15, 'Unendlich viele, in einem einzigen Punkt.'],
  [16, 16, 'Alle Vektoren auf dieser Geraden zusammen heißen der Kern von A:'],
  [17, 17, 'alle v, für die A mal v null ist.'],
  [18, 18, 'Der Nullvektor gehört immer dazu.'],
  [19, 20, 'Deshalb gibt es kein Zurück: Diese zwei Vektoren landen auf demselben Punkt.'],
  [21, 21, 'Von dort weiß niemand mehr, welcher es war.'],
];
export const SUBTITLES = SUB.map(([a, b, text]) => [W(a), END(b), text] as [number, number, string]);
