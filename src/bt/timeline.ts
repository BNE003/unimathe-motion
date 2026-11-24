// Timeline des Aha-Videos „Banach-Tarski“.
// Stimme: Aufnahme 0 = voice/bt-take1.mp3 (47,84 s, 739 Credits), Aufnahme 1 = voice/bt-take2.mp3 (39,6 s, 606 Credits),
// Aufnahme 2 = voice/bt-take3.mp3 (25,28 s, 388 Credits: Hook mit „genauso groß“, Sortieren nach Ästen, Haken, CTA), Chris, eleven_v4.
// Abschnitte aus tools/pauses.mjs (Mindestpause 0,25 s), Sekunden in der Sprachdatei; Wortpositionen aus der feineren Messung (0,07 s), mit ≈ geschätzt.

export const VOICES = ['voice/bt-take1.mp3', 'voice/bt-take2.mp3', 'voice/bt-take3.mp3'];
export const MUSIC = 'music-bt.wav';

// [Beginn, Ende, Aufnahme]
const S: [number, number, number][] = [
  [0, 2.48, 1], // 0 Das hier dürfte eigentlich unmöglich sein.
  [0, 4.24, 2], // 1 Aber ich kann aus einer Kugel (1.46) zwei machen, (2.44) ohne irgendetwas hinzuzufügen.
  [4.66, 7.48, 2], // 2 Und beide sind (≈5.45) genauso groß wie die ursprüngliche Kugel.
  [7.56, 9.7, 1], // 3 Kein Trick, (8.26) sondern bewiesene Mathematik.
  [9.12, 9.68, 0], // 4 Wie geht das?
  [10.56, 11.76, 1], // 5 Stell dir einen Punkt vor.
  [12.22, 14.18, 1], // 6 Ein Schritt geht nach rechts, (13.72) links,
  [14.44, 15.48, 1], // 7 oben (≈15.0) oder unten.
  [16.08, 18.3, 1], // 8 Von jedem Ende gehen drei neue Schritte ab,
  [18.6, 19.18, 1], // 9 nie zurück,
  [19.52, 20.36, 1], // 10 jeder halb so lang.
  [20.94, 22.64, 1], // 11 So wächst (21.72) ein unendlicher Baum.
  [15.72, 18.02, 0], // 12 Geh mit dem linken Ast (16.38) einen Schritt nach rechts:
  [18.38, 21.0, 0], // 13 Er wird zum ganzen Baum, (19.70) nur ohne den rechten Ast.
  [21.56, 22.64, 0], // 14 Zusammen mit dem rechten:
  [22.98, 23.82, 0], // 15 ein ganzer Baum.
  [24.26, 25.64, 0], // 16 Oben und unten (25.02) genauso.
  [23.26, 23.82, 1], // 17 Und die Kugel?
  [24.4, 25.82, 1], // 18 Statt Schritten drehen wir sie:
  [26.28, 27.92, 1], // 19 rechts und links um diese Achse,
  [28.24, 29.62, 1], // 20 oben und unten (28.96) um diese.
  [30.36, 32.98, 1], // 21 Jeder Weg führt einen Punkt an einen eigenen Ort.
  [33.48, 35.34, 1], // 22 Den linken Ast verschieben heißt also:
  [35.64, 36.54, 1], // 23 die Kugel drehen.
  [37.16, 39.6, 1], // 24 Jeder Punkt der Kugel liegt auf so einem Baum.
  [30.94, 32.84, 0], // 25 Aus jedem wählt man einen Startpunkt:
  [33.14, 34.22, 0], // 26 das Auswahlaxiom.
  [8.08, 10.42, 2], // 27 Jetzt sortieren wir jeden Punkt nach seinem Ast:
  [10.8, 14.04, 2], // 28 rechts, (11.40) links, (12.12) oben, (≈12.66) unten (≈13.2) oder Startpunkt.
  [14.54, 15.64, 2], // 29 Das sind die fünf Teile.
  [36.42, 37.82, 0], // 30 Drehen, (37.00) zusammensetzen:
  [38.14, 38.78, 0], // 31 zwei Kugeln.
  [16.22, 16.82, 2], // 32 Der Haken:
  [17.3, 20.8, 2], // 33 Diese Teile sind so seltsam, dass man ihr Volumen nicht messen kann.
  [42.98, 44.32, 0], // 34 Mit echtem Gold geht das nicht.
  [21.4, 22.92, 2], // 35 Lust auf mehr Aha-Momente?
  [23.26, 25.28, 2], // 36 Such im App Store nach (24.48) UniMathe.
];

const GAP_DEFAULT = 0.3;
const GAP: Record<number, number> = {
  0: 0.35,
  1: 0.3,
  2: 0.5,
  3: 0.5,
  4: 0.5,
  5: 0.25,
  6: 0.2,
  7: 0.5,
  8: 0.15,
  9: 0.25,
  11: 0.8,
  12: 0.25,
  13: 0.7,
  14: 0.25,
  16: 1.2, // zweiter Baum
  17: 0.35,
  18: 0.25,
  19: 0.3, // nach „um diese Achse“ direkt weiter (Feedback: Pause war zu lang)
  20: 1.0, // Drehung um die zweite Achse
  21: 0.4,
  22: 0.2,
  23: 1.0, // Ast rastet auf der Kugel ein
  24: 0.4,
  26: 0.6,
  27: 0.25,
  28: 0.5,
  29: 0.6, // fünf Teile
  30: 0.25,
  31: 1.1, // zwei Kugeln
  33: 0.5,
  34: 0.9,
  35: 0.3,
};

type Clip = {from: number; to: number; at: number; i: number; src: number};
export const CLIPS: Clip[] = (() => {
  const out: Clip[] = [];
  let cur = 0;
  S.forEach(([from, to, src], i) => {
    const at = i === 0 ? 0 : cur + (GAP[i - 1] ?? GAP_DEFAULT);
    out.push({from, to, at, i, src});
    cur = at + (to - from);
  });
  return out;
})();

// Sekunde in Aufnahme 0 (V), 1 (V2) bzw. 2 (V3) → Sekunde im Video
const VS = (src: number) => (s: number) => {
  const cs = CLIPS.filter((x) => x.src === src);
  let c = cs[0];
  for (const x of cs) if (x.from <= s + 1e-6) c = x;
  return c.at + (s - c.from);
};
export const V = VS(0);
export const V2 = VS(1);
export const V3 = VS(2);
export const A = (i: number) => CLIPS[i].at;
export const E = (i: number) => CLIPS[i].at + (CLIPS[i].to - CLIPS[i].from);

const LAST = CLIPS[CLIPS.length - 1];
export const TOTAL = Math.round((LAST.at + (LAST.to - LAST.from) + 0.6) * 10) / 10;

export const T = {
  // Hook
  zerlege: 0.55,
  aber: A(1),
  zweiKugeln: V3(1.46),
  ohneHinzu: V3(2.44),
  gross: V3(5.45),
  trick: A(3),
  satz: V2(8.26),
  wie: A(4),
  // Baum entsteht
  punkt: A(5),
  rechts: V2(12.95),
  links: V2(13.72),
  oben: A(7),
  unten: V2(15.0),
  drei: A(8),
  zurueck: A(9),
  halb: A(10),
  baum: A(11),
  // Weiterrücken
  geh: A(12),
  schritt: V(16.38),
  ganzer: A(13),
  ohneRechts: V(19.7),
  zusammen: A(14),
  ganzer2: A(15),
  oben2: A(16),
  genauso: V(25.02),
  // Brücke zur Kugel
  kugel: A(17),
  statt: A(18),
  achse1: A(19),
  achse2: A(20),
  achse2b: V2(28.96),
  weg: A(21),
  verschieben: A(22),
  drehung: A(23),
  jederPunkt: A(24),
  // Auswahl, Sortieren nach Ästen, Aufbau
  waehlt: A(25),
  axiom: A(26),
  staub: A(27), // „Jetzt sortieren wir jeden Punkt …“: Kugel als weiße Punktwolke
  sortA: V3(10.8), // rechts
  sortAi: V3(11.4), // links
  sortB: V3(12.12), // oben
  sortBi: V3(12.66), // unten
  sortE: V3(13.2), // Startpunkt
  teile: A(29),
  drehen: A(30),
  setzen: V(37.0),
  zweiK: A(31),
  // Auflösung
  haken: A(32),
  volumen: A(33),
  gold: A(34),
  // CTA
  cta: A(35),
  such: A(36),
  tippt: V3(24.48),
};

// Untertitel: [Start, Ende, Aufnahme] in Sekunden der Sprachdatei, Text. Im CTA keine.
const SUB: [number, number, number, string][] = [
  [0, 2.48, 1, 'Das hier dürfte eigentlich unmöglich sein.'],
  [0, 4.24, 2, 'Aber ich kann aus einer Kugel zwei machen, ohne irgendetwas hinzuzufügen.'],
  [4.66, 7.48, 2, 'Und beide sind genauso groß wie die ursprüngliche Kugel.'],
  [7.56, 9.7, 1, 'Kein Trick, sondern bewiesene Mathematik.'],
  [9.12, 9.68, 0, 'Wie geht das?'],
  [10.56, 11.76, 1, 'Stell dir einen Punkt vor.'],
  [12.22, 15.48, 1, 'Ein Schritt geht nach rechts, links, oben oder unten.'],
  [16.08, 20.36, 1, 'Von jedem Ende gehen drei neue Schritte ab, nie zurück, jeder halb so lang.'],
  [20.94, 22.64, 1, 'So wächst ein unendlicher Baum.'],
  [15.72, 21.0, 0, 'Geh mit dem linken Ast einen Schritt nach rechts: Er wird zum ganzen Baum, nur ohne den rechten Ast.'],
  [21.56, 25.64, 0, 'Zusammen mit dem rechten: ein ganzer Baum. Oben und unten genauso.'],
  [23.26, 23.82, 1, 'Und die Kugel?'],
  [24.4, 29.62, 1, 'Statt Schritten drehen wir sie: rechts und links um diese Achse, oben und unten um diese.'],
  [30.36, 32.98, 1, 'Jeder Weg führt einen Punkt an einen eigenen Ort.'],
  [33.48, 36.54, 1, 'Den linken Ast verschieben heißt also: die Kugel drehen.'],
  [37.16, 39.6, 1, 'Jeder Punkt der Kugel liegt auf so einem Baum.'],
  [30.94, 34.22, 0, 'Aus jedem wählt man einen Startpunkt: das Auswahlaxiom.'],
  [8.08, 14.04, 2, 'Jetzt sortieren wir jeden Punkt nach seinem Ast: rechts, links, oben, unten oder Startpunkt.'],
  [14.54, 15.64, 2, 'Das sind die fünf Teile.'],
  [36.42, 38.78, 0, 'Drehen, zusammensetzen: zwei Kugeln.'],
  [16.22, 20.8, 2, 'Der Haken: Diese Teile sind so seltsam, dass man ihr Volumen nicht messen kann.'],
  [42.98, 44.32, 0, 'Mit echtem Gold geht das nicht.'],
];
export const SUBTITLES: [number, number, string][] = SUB.map(([a, b, src, s]) => [VS(src)(a), VS(src)(b), s]);
