// Timeline des Videos „Echte Uni-Klausur: Harvard Math 21b, Aufgabe 1(c)“, Fassung 2 (langsamer, ein Pfeil mit Zahlen).
// Alle Zeiten stammen aus den Sprechpausen von voice/hv-take2.mp3 (tools/pauses.mjs) und sind in Sekunden.

export const VOICE = 'voice/hv-take2.mp3';
export const MUSIC = 'music-hv.wav';
export const VOICE_END = 136.08;

// Eingefügte Stille: [Stelle in der Sprachdatei, Länge]. Alle Stellen liegen in Sprechpausen.
export const VOICE_GAPS: [number, number][] = [
  [10.9, 1.2], // Bedenkzeit
  [17.7, 0.5],
  [20.55, 0.4],
  [29.9, 0.4],
  [36.48, 0.4],
  [39.44, 0.5],
  [58.42, 0.6], // (3, 2) wird (2, 0)
  [72.05, 0.7], // Leere nach dem Zusammenfall
  [87.5, 0.6],
  [109.95, 0.5],
  [113.55, 0.7], // Stille vor der Auflösung
  [118.7, 0.3],
];
// Zeit in der Sprachdatei → Zeit im Video
export const V = (s: number) => s + VOICE_GAPS.reduce((acc, [c, d]) => acc + (s >= c ? d : 0), 0);

export const TOTAL = Math.round((V(VOICE_END) + 0.8) * 10) / 10;

// Wort-Cues im Video
export const T = {
  // Hook
  wenn: V(4.88),
  dann: V(7.4),
  wahr: V(9.58),
  oderF: V(10.2),
  // Was das Wort bedeutet
  eineM: V(11.22),
  matrix: V(13.9),
  neu: V(15.7),
  meist: V(17.98),
  aber: V(20.86),
  sie: V(23.08),
  eigen: V(25.36),
  regel: V(27.38),
  findest: V(30.24),
  dia: V(34.42),
  weniger: V(36.74),
  // Plan
  plan: V(39.78),
  bsp: V(43.1),
  aberA: V(46.42),
  // Matrix
  probieren: V(47.84),
  macht: V(49.36),
  untere: V(51.4),
  undNull: V(53.32),
  aus3: V(55.2),
  wird: V(56.64),
  // A²
  aq: V(58.78),
  zweimal: V(59.98),
  beim: V(62.3),
  aus2: V(64.76),
  jedem: V(67.92),
  nach: V(69.8),
  nullm: V(72.36),
  // Erste Frage
  f1: V(75.22),
  schrumpft: V(79.08),
  gesch: V(81.2),
  bleibt: V(83.08),
  gilt: V(84.9),
  ja: V(86.38),
  // Zweite Frage
  f2: V(87.9),
  aus32: V(91.28),
  wegk: V(94.2),
  jedesA: V(95.84),
  nurx: V(99.14),
  aus30: V(101.18),
  gesch2: V(104.1),
  eineR: V(105.98),
  brauchen: V(107.54),
  nein: V(108.74),
  // Auflösung
  a2ist: V(110.3),
  falsch: V(113.72),
  genau: V(115.58),
  // Grund
  grund: V(118.96),
  kippt: V(120.4),
  deshalb: V(121.96),
  a2k: V(125.24),
  kippen: V(128.8),
  // CTA
  cta: V(131.94),
  such: V(134.04),
  tippt: V(135.0),
};

// Untertitel: [Start, Ende] in Sekunden der Sprachdatei, Text. Im CTA keine.
export const SUBTITLES: [number, number, string][] = [
  [0, 4.2, 'Das ist eine echte Frage aus einer Harvard-Abschlussklausur von 2003.'],
  [11.22, 13.3, 'Klären wir zuerst, was das Wort bedeutet.'],
  [13.9, 17.4, 'Eine Matrix nimmt einen Pfeil und macht daraus einen neuen Pfeil.'],
  [17.98, 20.26, 'Meistens kippt er dabei in eine andere Richtung.'],
  [20.86, 22.88, 'Aber manche Pfeile bleiben auf ihrer Linie.'],
  [23.08, 24.92, 'Sie werden nur länger oder kürzer.'],
  [25.36, 26.88, 'Das sind die Eigenvektoren.'],
  [27.38, 29.56, 'Und jetzt die einzige Regel, die du brauchst:'],
  [30.24, 36.22, 'Findest du in der Ebene zwei verschiedene Richtungen, die auf ihrer Linie bleiben, ist die Matrix diagonalisierbar.'],
  [36.74, 39.1, 'Findest du weniger als zwei, ist sie es nicht.'],
  [39.78, 42.6, 'Um den Satz zu widerlegen, reicht ein einziges Beispiel:'],
  [43.1, 47.28, 'eine Matrix, bei der A² diagonalisierbar ist, aber A nicht.'],
  [47.84, 48.86, 'Probieren wir diese hier.'],
  [49.36, 54.54, 'Sie macht etwas ganz Einfaches: Die untere Zahl rutscht nach oben, und unten steht eine Null.'],
  [55.2, 58.06, 'Aus 3, 2 wird also 2, 0.'],
  [58.78, 61.8, 'A² heißt: das Ganze zweimal hintereinander.'],
  [62.3, 64.3, 'Beim zweiten Mal rutscht die Null nach oben.'],
  [64.76, 67.36, 'Aus 2, 0 wird 0, 0.'],
  [67.92, 71.74, 'Das passiert mit jedem Pfeil. Nach zwei Schritten ist alles null.'],
  [72.36, 74.52, 'A² ist also die Nullmatrix.'],
  [75.22, 78.42, 'Erste Frage: Ist die Nullmatrix diagonalisierbar?'],
  [79.08, 80.82, 'Sie schrumpft jeden Pfeil auf null.'],
  [81.2, 84.52, 'Geschrumpft, nicht gekippt. Er bleibt also auf seiner Linie.'],
  [84.9, 87.14, 'Das gilt für jede Richtung. Also ja.'],
  [87.9, 90.56, 'Zweite Frage: Ist A diagonalisierbar?'],
  [91.28, 93.72, 'Aus 3, 2 wird 2, 0.'],
  [94.2, 95.42, 'Der Pfeil ist weggekippt.'],
  [95.84, 98.58, 'Das passiert jedem Pfeil, der nicht auf der x-Achse liegt.'],
  [99.14, 103.6, 'Nur die x-Achse selbst bleibt: Aus 3, 0 wird 0, 0.'],
  [104.1, 105.58, 'Geschrumpft, nicht gekippt.'],
  [105.98, 109.6, 'Das ist nur eine Richtung. Wir brauchen zwei. Also nein.'],
  [110.3, 113.38, 'A² ist diagonalisierbar, A nicht.'],
  [113.72, 115.04, 'Die Aussage ist falsch.'],
  [115.58, 118.42, 'Genau diese Matrix steht auch in der Lösung zur Klausur.'],
  [118.96, 119.66, 'Warum geht das?'],
  [120.4, 124.62, 'A kippt Pfeile weg, und genau deshalb ist sie nicht diagonalisierbar.'],
  [125.24, 128.34, 'A² kippt nichts mehr, sondern macht alles zu null.'],
  [128.8, 131.12, 'Das Kippen ist im Ergebnis nicht mehr zu sehen.'],
];

// Soundeffekte: [Zeit im Video, Datei, Lautstärke]
export const SFX: [number, string, number][] = [
  [0, 'whoosh', 0.5],
  [0, 'accent_small', 0.4],
  [1.5, 'rise', 0.2],
  [T.wenn - 0.1, 'whoosh', 0.3],
  [T.wahr, 'tick', 0.4],
  [T.oderF, 'tick', 0.4],
  [T.eineM, 'swell', 0.26],
  [T.matrix, 'click', 0.3],
  [T.neu, 'whoosh', 0.24],
  [T.meist + 0.2, 'tick', 0.32],
  [T.aber + 0.1, 'lock_hi', 0.34],
  [T.eigen, 'lock', 0.36],
  [T.findest + 2, 'lock_hi', 0.34],
  [T.dia, 'lock', 0.34],
  [T.weniger, 'tick', 0.32],
  [T.bsp, 'tick', 0.34],
  [T.aberA, 'tick', 0.34],
  [T.probieren - 0.6, 'rise', 0.26],
  [T.probieren + 0.42, 'lock', 0.42],
  [T.untere + 0.2, 'whoosh', 0.22],
  [T.undNull, 'click', 0.32],
  [T.wird, 'whoosh', 0.28],
  [T.aus2 + 0.2, 'whoosh', 0.28],
  [T.jedem + 0.1, 'whoosh', 0.4],
  [T.nach, 'rise', 0.3],
  [T.nach + 1.45, 'collapse', 0.55],
  [T.nullm, 'accent', 0.45],
  [T.schrumpft + 0.1, 'rise', 0.22],
  [T.bleibt + 0.1, 'lock_hi', 0.36],
  [T.gilt, 'swell', 0.38],
  [T.ja, 'lock', 0.42],
  [T.aus32 + 1.0, 'whoosh', 0.28],
  [T.wegk, 'tick', 0.34],
  [T.jedesA, 'rise', 0.24],
  [T.aus30 + 0.4, 'lock_hi', 0.34],
  [T.brauchen, 'buzz', 0.28],
  [T.nein, 'lock', 0.42],
  [T.falsch, 'accent', 0.6],
  [T.genau + 0.1, 'swell', 0.32],
  [T.genau + 1.1, 'lock', 0.35],
  [T.grund, 'whoosh', 0.28],
  [T.a2k, 'click', 0.3],
  [T.cta - 0.1, 'swell', 0.34],
  ...Array.from({length: 8}, (_, i) => [T.tippt + 0.1 + i * 0.075, 'tick', 0.18] as [number, string, number]),
];
