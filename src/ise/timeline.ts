// Timeline des Erklärvideos „Mathe 1 einfach erklärt: Injektiv, surjektiv, bijektiv“.
// Aufnahme ise-take1.mp3 (72,0 s, Chris, eleven_v4, 957 Credits). Abschnitte aus tools/pauses.mjs (Mindestpause 0,25 s),
// Sekunden in der Sprachdatei; Wortpositionen aus der feineren Messung (0,1 s).

export const VOICE = 'voice/ise-take1.mp3';
export const MUSIC = 'music-ise.wav';

const S: [number, number][] = [
  [0, 1.82], // 0 Mathe eins einfach erklärt:
  [2.28, 2.84], // 1 Injektiv,
  [3.16, 3.88], // 2 surjektiv,
  [4.3, 4.84], // 3 bijektiv.
  [5.64, 8.46], // 4 Links die Definitionsmenge, | rechts die Zielmenge. (7.22)
  [9.02, 9.6], // 5 Injektiv:
  [10.3, 12.86], // 6 Verschiedene Elemente treffen nie dasselbe Ziel.
  [13.24, 14.56], // 7 Ein Ziel darf leer bleiben.
  [15.22, 17.24], // 8 Zeigen zwei Pfeile | auf dasselbe Ziel: (15.92)
  [17.62, 18.44], // 9 nicht injektiv.
  [19.22, 19.92], // 10 Surjektiv:
  [20.46, 21.9], // 11 Jedes Ziel wird getroffen.
  [22.34, 24.08], // 12 Hier bleiben B | und D leer. (23.5)
  [24.6, 26.4], // 13 Zwei neue Elemente füllen die Lücken:
  [26.82, 27.46], // 14 surjektiv,
  [27.84, 29.62], // 15 obwohl C doppelt getroffen wird.
  [30.32, 32.04], // 16 Bijektiv heißt beides:
  [32.34, 33.98], // 17 Jedes Ziel genau einmal.
  [34.28, 35.46], // 18 Die Reihenfolge ist egal.
  [36.02, 38.84], // 19 Und jeder Pfeil lässt sich umdrehen: | die Umkehrfunktion. (37.94)
  [39.42, 40.7], // 20 Jetzt iks Quadrat,
  [40.96, 41.98], // 21 von R nach R.
  [42.6, 45.04], // 22 Minus zwei und zwei landen beide auf vier:
  [45.38, 46.16], // 23 nicht injektiv.
  [46.82, 49.02], // 24 Negative Werte erreicht die Parabel nie:
  [49.3, 50.2], // 25 nicht surjektiv.
  [50.88, 52.56], // 26 Jetzt ändern wir nur die Zielmenge:
  [52.9, 53.4], // 27 ab null.
  [53.92, 56.36], // 28 Gleiche Parabel, und jeder Wert wird getroffen:
  [56.64, 57.28], // 29 surjektiv.
  [57.98, 60.38], // 30 Nehmen wir links auch nur iks ab null, | ist Eff (59.88)
  [60.64, 61.16], // 31 bijektiv.
  [61.9, 62.48], // 32 Injektiv:
  [62.96, 64.0], // 33 kein Ziel doppelt.
  [64.5, 65.16], // 34 Surjektiv:
  [65.52, 66.46], // 35 kein Ziel leer.
  [66.98, 67.54], // 36 Bijektiv:
  [67.94, 68.38], // 37 beides.
  [69.0, 69.62], // 38 Mehr davon?
  [70.02, 72.0], // 39 Such im App Store nach UniMathe.
];

// Stille nach einem Abschnitt im Video. Standard 0,28 s, länger nur, wo eine Animation Zeit braucht.
const GAP_DEFAULT = 0.28;
const GAP: Record<number, number> = {
  0: 0.25,
  1: 0.2,
  2: 0.2,
  3: 0.45, // Titel → Chips
  5: 0.22,
  6: 0.5, // Pfeil schwenkt zurück
  8: 0.18,
  9: 0.45,
  10: 0.22,
  13: 0.65, // neue Elemente
  14: 0.18,
  15: 0.45,
  16: 0.18,
  17: 0.32,
  18: 0.3,
  19: 1.25, // Mengen werden zu Achsen
  20: 0.18,
  21: 0.75, // Parabel zeichnet sich
  22: 0.2,
  23: 0.45,
  24: 0.2,
  25: 0.5,
  26: 0.18,
  27: 1.05, // Zielmenge wird geschnitten
  28: 0.18,
  29: 0.5,
  30: 0.2,
  31: 0.8, // Definitionsmenge wird geschnitten
  32: 0.2,
  34: 0.2,
  36: 0.2,
  37: 0.6,
  38: 0.25,
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
  // Intro
  w1: A(1),
  w2: A(2),
  w3: A(3),
  fly: E(3) + 0.05,
  links: A(4),
  rechts: V(7.22),
  // injektiv
  injDef: A(5),
  verschieden: A(6),
  leer: A(7),
  zeigen: A(8),
  auf: V(15.92),
  nichtInj: A(9),
  // surjektiv
  surDef: A(10),
  jedes: A(11),
  hier: A(12),
  undD: V(23.5),
  neue: A(13),
  surOk: A(14),
  obwohl: A(15),
  // bijektiv
  bijDef: A(16),
  genau: A(17),
  reihe: A(18),
  umdrehen: A(19),
  umkehr: V(37.94),
  toGraph: E(19) + 0.12,
  // Parabel
  jetzt: A(20),
  vonR: A(21),
  minus2: A(22),
  vier: V(44.4),
  nichtInj2: A(23),
  negativ: A(24),
  nichtSur2: A(25),
  ziel: A(26),
  ab: A(27),
  gleiche: A(28),
  surOk2: A(29),
  links2: A(30),
  bijOk2: A(31),
  // Schluss
  sum: A(32),
  sumS: A(34),
  sumB: A(36),
  cta: A(38),
  such: A(39),
  tippt: V(71.15),
};

// Untertitel: [Start, Ende] in Sekunden der Sprachdatei, Text. Im CTA keine.
const SUB: [number, number, string][] = [
  [0, 4.84, 'Mathe 1 einfach erklärt: Injektiv, surjektiv, bijektiv.'],
  [5.64, 8.46, 'Links die Definitionsmenge, rechts die Zielmenge.'],
  [9.02, 12.86, 'Injektiv: Verschiedene Elemente treffen nie dasselbe Ziel.'],
  [13.24, 14.56, 'Ein Ziel darf leer bleiben.'],
  [15.22, 18.44, 'Zeigen zwei Pfeile auf dasselbe Ziel: nicht injektiv.'],
  [19.22, 21.9, 'Surjektiv: Jedes Ziel wird getroffen.'],
  [22.34, 24.08, 'Hier bleiben B und D leer.'],
  [24.6, 29.62, 'Zwei neue Elemente füllen die Lücken: surjektiv, obwohl C doppelt getroffen wird.'],
  [30.32, 33.98, 'Bijektiv heißt beides: Jedes Ziel genau einmal.'],
  [34.28, 35.46, 'Die Reihenfolge ist egal.'],
  [36.02, 38.84, 'Und jeder Pfeil lässt sich umdrehen: die Umkehrfunktion.'],
  [39.42, 41.98, 'Jetzt x², von ℝ nach ℝ.'],
  [42.6, 46.16, '−2 und 2 landen beide auf 4: nicht injektiv.'],
  [46.82, 50.2, 'Negative Werte erreicht die Parabel nie: nicht surjektiv.'],
  [50.88, 53.4, 'Jetzt ändern wir nur die Zielmenge: ab 0.'],
  [53.92, 57.28, 'Gleiche Parabel, und jeder Wert wird getroffen: surjektiv.'],
  [57.98, 61.16, 'Nehmen wir links auch nur x ab 0, ist f bijektiv.'],
  [61.9, 68.38, 'Injektiv: kein Ziel doppelt. Surjektiv: kein Ziel leer. Bijektiv: beides.'],
];
export const SUBTITLES: [number, number, string][] = SUB.map(([a, b, s]) => [V(a), V(b), s]);
