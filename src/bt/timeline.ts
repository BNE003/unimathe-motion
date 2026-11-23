// Timeline des Aha-Videos „Banach-Tarski“.
// Stimme: Aufnahme 0 = voice/bt-take1.mp3 (47,84 s, 739 Credits), Aufnahme 1 = voice/bt-take2.mp3 (39,6 s, 606 Credits), Chris, eleven_v4. Abschnitte aus tools/pauses.mjs (Mindestpause 0,25 s),
// Sekunden in der Sprachdatei; Wortpositionen aus der feineren Messung (0,07 s), mit ≈ geschätzt.

export const VOICES = ['voice/bt-take1.mp3', 'voice/bt-take2.mp3'];
export const MUSIC = 'music-bt.wav';

// [Beginn, Ende, Aufnahme]: Aufnahme 1 = bt-take2.mp3 (39,6 s, 606 Credits): neuer Hook, Baumaufbau, Brücke zur Kugel
const S: [number, number, number][] = [
  [0, 2.48, 1], // 0 Das hier dürfte eigentlich unmöglich sein.
  [2.9, 7.14, 1], // 1 Aber ich kann aus einer Kugel (≈4.5) zwei machen, (5.44) ohne irgendetwas hinzuzufügen.
  [7.56, 9.7, 1], // 2 Kein Trick, (8.26) sondern bewiesene Mathematik.
  [9.12, 9.68, 0], // 3 Wie geht das?
  [10.56, 11.76, 1], // 4 Stell dir einen Punkt vor.
  [12.22, 14.18, 1], // 5 Ein Schritt geht nach rechts, (13.72) links,
  [14.44, 15.48, 1], // 6 oben (≈15.0) oder unten.
  [16.08, 18.3, 1], // 7 Von jedem Ende gehen drei neue Schritte ab,
  [18.6, 19.18, 1], // 8 nie zurück,
  [19.52, 20.36, 1], // 9 jeder halb so lang.
  [20.94, 22.64, 1], // 10 So wächst (21.72) ein unendlicher Baum.
  [15.72, 18.02, 0], // 11 Geh mit dem linken Ast (16.38) einen Schritt nach rechts:
  [18.38, 21.0, 0], // 12 Er wird zum ganzen Baum, (19.70) nur ohne den rechten Ast.
  [21.56, 22.64, 0], // 13 Zusammen mit dem rechten:
  [22.98, 23.82, 0], // 14 ein ganzer Baum.
  [24.26, 25.64, 0], // 15 Oben und unten (25.02) genauso.
  [23.26, 23.82, 1], // 16 Und die Kugel?
  [24.4, 25.82, 1], // 17 Statt Schritten drehen wir sie:
  [26.28, 27.92, 1], // 18 rechts und links um diese Achse,
  [28.24, 29.62, 1], // 19 oben und unten (28.96) um diese.
  [30.36, 32.98, 1], // 20 Jeder Weg führt einen Punkt an einen eigenen Ort.
  [33.48, 35.34, 1], // 21 Den linken Ast verschieben heißt also:
  [35.64, 36.54, 1], // 22 die Kugel drehen.
  [37.16, 39.6, 1], // 23 Jeder Punkt der Kugel liegt auf so einem Baum.
  [30.94, 32.84, 0], // 24 Aus jedem wählt man einen Startpunkt:
  [33.14, 34.22, 0], // 25 das Auswahlaxiom.
  [34.68, 36.0, 0], // 26 Die Teile werden zu Staub.
  [36.42, 37.82, 0], // 27 Drehen, (37.00) zusammensetzen:
  [38.14, 38.78, 0], // 28 zwei Kugeln.
  [39.24, 39.82, 0], // 29 Der Haken:
  [40.28, 42.62, 0], // 30 Diesem Staub kann man kein Volumen zuordnen.
  [42.98, 44.32, 0], // 31 Mit echtem Gold geht das nicht.
  [44.9, 45.52, 0], // 32 Mehr Mathe?
  [45.88, 47.84, 0], // 33 Such im App Store nach UniMathe.
];

const GAP_DEFAULT = 0.3;
const GAP: Record<number, number> = {
  0: 0.35,
  1: 0.4,
  2: 0.5,
  3: 0.5,
  4: 0.25,
  5: 0.2,
  6: 0.5,
  7: 0.15,
  8: 0.25,
  10: 0.8,
  11: 0.25,
  12: 0.7,
  13: 0.25,
  15: 1.2, // zweiter Baum
  16: 0.35,
  17: 0.25,
  18: 1.3, // Drehung um die erste Achse
  19: 1.3, // Drehung um die zweite Achse
  20: 0.4,
  21: 0.2,
  22: 1.0, // Ast rastet auf der Kugel ein
  23: 0.4,
  25: 0.6,
  26: 0.45,
  27: 0.25,
  28: 1.1, // zwei Kugeln
  30: 0.5,
  31: 0.9,
  32: 0.25,
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

// Sekunde in Aufnahme 0 (V) bzw. 1 (V2) → Sekunde im Video
const VS = (src: number) => (s: number) => {
  const cs = CLIPS.filter((x) => x.src === src);
  let c = cs[0];
  for (const x of cs) if (x.from <= s + 1e-6) c = x;
  return c.at + (s - c.from);
};
export const V = VS(0);
export const V2 = VS(1);
export const A = (i: number) => CLIPS[i].at;
export const E = (i: number) => CLIPS[i].at + (CLIPS[i].to - CLIPS[i].from);

const LAST = CLIPS[CLIPS.length - 1];
export const TOTAL = Math.round((LAST.at + (LAST.to - LAST.from) + 0.6) * 10) / 10;

export const T = {
  // Hook
  zerlege: 0.55,
  aber: A(1),
  zweiKugeln: V2(4.5),
  ohneHinzu: V2(5.44),
  trick: A(2),
  satz: V2(8.26),
  wie: A(3),
  // Baum entsteht
  punkt: A(4),
  rechts: V2(12.95),
  links: V2(13.72),
  oben: A(6),
  unten: V2(15.0),
  drei: A(7),
  zurueck: A(8),
  halb: A(9),
  baum: A(10),
  // Weiterrücken
  geh: A(11),
  schritt: V(16.38),
  ganzer: A(12),
  ohneRechts: V(19.7),
  zusammen: A(13),
  ganzer2: A(14),
  oben2: A(15),
  genauso: V(25.02),
  // Brücke zur Kugel
  kugel: A(16),
  statt: A(17),
  achse1: A(18),
  achse2: A(19),
  achse2b: V2(28.96),
  weg: A(20),
  verschieben: A(21),
  drehung: A(22),
  jederPunkt: A(23),
  // Auswahl, Staub, Aufbau
  waehlt: A(24),
  axiom: A(25),
  staub: A(26),
  drehen: A(27),
  setzen: V(37.0),
  zweiK: A(28),
  // Auflösung
  haken: A(29),
  volumen: A(30),
  gold: A(31),
  // CTA
  cta: A(32),
  such: A(33),
  tippt: V(47.0),
};

// Untertitel: [Start, Ende, Aufnahme] in Sekunden der Sprachdatei, Text. Im CTA keine.
const SUB: [number, number, number, string][] = [
  [0, 2.48, 1, 'Das hier dürfte eigentlich unmöglich sein.'],
  [2.9, 7.14, 1, 'Aber ich kann aus einer Kugel zwei machen, ohne irgendetwas hinzuzufügen.'],
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
  [34.68, 36.0, 0, 'Die Teile werden zu Staub.'],
  [36.42, 38.78, 0, 'Drehen, zusammensetzen: zwei Kugeln.'],
  [39.24, 42.62, 0, 'Der Haken: Diesem Staub kann man kein Volumen zuordnen.'],
  [42.98, 44.32, 0, 'Mit echtem Gold geht das nicht.'],
];
export const SUBTITLES: [number, number, string][] = SUB.map(([a, b, src, s]) => [src ? V2(a) : V(a), src ? V2(b) : V(b), s]);
