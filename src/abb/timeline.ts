// Timeline des Klausurvideos „Injektiv, surjektiv, bijektiv“: f: ℝ∖{−1} → ℝ∖{2}, f(x) = (2x+3)/(x+1).
// Aufnahme 1 (abb-take1.mp3, 100,56 s, Chris, eleven_v4). Die Sätze mit b sprach Chris dort als „be“; sie kommen aus
// Aufnahme 2 (abb-take2-b.mp3, 16,4 s, „B“). Abschnitte aus tools/pauses.mjs (Mindestpause 0,25 s), Sekunden in der jeweiligen Sprachdatei.

export const VOICES = ['voice/abb-take1.mp3', 'voice/abb-take2-b.mp3'];
export const MUSIC = 'music-abb.wav';

const S: [number, number, number?][] = [
  [0, 1.64], // 0 Mathe-eins-Klausuraufgabe.
  [2.1, 3.68], // 1 Ist diese Abbildung injektiv,
  [4.02, 4.72], // 2 surjektiv,
  [5.1, 5.6], // 3 bijektiv?
  [6.16, 7.94], // 4 Und wie lautet die Umkehrfunktion?
  [8.5, 10.8], // 5 Vorne fehlt die minus eins, hinten die zwei.
  [11.46, 11.96], // 6 Teil a:
  [12.44, 12.96], // 7 injektiv.
  [13.7, 14.64], // 8 Injektiv heißt:
  [14.92, 17.22], // 9 Verschiedene Eingaben liefern verschiedene Werte.
  [17.72, 18.28], // 10 Wir zeigen:
  [0, 3.56, 1], // 11 Haben a und b denselben Wert, dann ist a gleich b.
  [22.9, 26.16], // 12 Die Nenner sind nie null, also multiplizieren wir über Kreuz.
  [26.72, 27.98], // 13 Jetzt ausmultiplizieren.
  [4.2, 7.82, 1], // 14 Zwei a mal b und drei stehen auf beiden Seiten und fallen weg.
  [8.3, 10.22, 1], // 15 Minus zwei a, minus zwei b:
  [10.62, 11.92, 1], // 16 Es bleibt b gleich a.
  [12.58, 13.74, 1], // 17 f ist injektiv.
  [14.48, 14.98, 1], // 18 Teil b:
  [15.4, 16.32, 1], // 19 surjektiv.
  [41.5, 43.7], // 20 Jede Zahl der Zielmenge muss getroffen werden,
  [44.0, 45.88], // 21 also jede Zahl außer zwei.
  [46.5, 49.62], // 22 Wir nehmen ein beliebiges y und suchen das passende x.
  [50.08, 51.34], // 23 Mal x plus eins.
  [51.76, 52.54], // 24 Klammer auflösen.
  [53.02, 55.5], // 25 Alles mit x nach links, der Rest nach rechts.
  [55.94, 56.88], // 26 x ausklammern.
  [57.36, 59.26], // 27 Und durch y minus zwei teilen.
  [59.7, 61.84], // 28 Das geht, denn y ist nie zwei.
  [62.34, 65.3], // 29 Bei y gleich zwei stünde hier null gleich eins.
  [65.6, 67.38], // 30 Deshalb fehlt die Zwei in der Zielmenge.
  [67.84, 71.44], // 31 Und x ist nie minus eins, sonst folgt drei gleich zwei.
  [72.06, 73.94], // 32 Jedes y hat also ein Urbild.
  [74.4, 75.48], // 33 f ist surjektiv.
  [76.16, 76.76], // 34 Teil c:
  [77.32, 79.76], // 35 Injektiv und surjektiv heißt bijektiv.
  [80.44, 81.96], // 36 Die Umkehrfunktion steht schon da:
  [82.38, 84.76], // 37 Sie bringt jedes y zurück zu seinem x.
  [85.2, 86.88], // 38 Mit x als Variable geschrieben.
  [87.36, 90.0], // 39 Definitions- und Zielmenge tauschen dabei die Plätze.
  [90.54, 93.34], // 40 Am Graphen ist das die Spiegelung an der Winkelhalbierenden.
  [93.82, 95.94], // 41 Injektiv, surjektiv, bijektiv: dreimal ja.
  [96.44, 97.16], // 42 Mehr davon?
  [97.68, 98.24], // 43 Such im
  [98.64, 100.56], // 44 App Store nach UniMathe.
];

// Stille nach einem Abschnitt im Video. Standard 0,32 s, länger nur, wo eine Animation Zeit braucht.
const GAP_DEFAULT = 0.32;
const GAP: Record<number, number> = {
  0: 0.4, // Karte
  1: 0.28,
  2: 0.28,
  5: 0.6, // Graph zeichnet sich
  7: 0.35,
  9: 0.55, // zwei Werte
  11: 0.6, // Brüche
  12: 1.0, // über Kreuz
  13: 2.0, // ausmultiplizieren
  14: 0.7, // Kürzen
  15: 0.4,
  16: 0.6, // a = b
  17: 0.8, // ✓ und Wechsel zu b
  18: 0.25,
  21: 0.5, // Waagrechte
  22: 0.5,
  23: 0.8, // ·(x+1)
  24: 0.75, // Klammer
  25: 0.8, // Seitenwechsel
  26: 0.7, // ausklammern
  27: 0.45,
  28: 0.45,
  29: 0.35,
  30: 0.55,
  31: 0.8, // 3 = 2
  33: 0.7, // ✓ und Wechsel zu c
  34: 0.3,
  35: 0.6,
  37: 0.45,
  38: 0.8, // y → x
  39: 0.6, // Mengen tauschen
  40: 1.6, // Spiegelung
  41: 1.0, // Zusammenfassung
  42: 0.3,
  43: 0.2,
};

type Clip = {from: number; to: number; at: number; i: number; src: number};
export const CLIPS: Clip[] = (() => {
  const out: Clip[] = [];
  let cur = 0;
  S.forEach(([from, to, src = 0], i) => {
    const at = i === 0 ? 0 : cur + (GAP[i - 1] ?? GAP_DEFAULT);
    out.push({from, to, at, i, src});
    cur = at + (to - from);
  });
  return out;
})();

// Sekunde in Sprachdatei 1 (V) bzw. 2 (V2) → Sekunde im Video
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
export const TOTAL = Math.round((LAST.at + (LAST.to - LAST.from) + 0.8) * 10) / 10;

export const T = {
  // Einstieg
  frage: A(1),
  injektiv0: V(3.0),
  surjektiv0: A(2),
  bijektiv0: A(3),
  umkehr0: V(7.0),
  vorne: A(5),
  minusEins: V(9.25),
  zwei0: V(10.35),
  // Teil a
  teilA: A(6),
  heisst: A(8),
  verschieden: A(9),
  zeigen: A(10),
  haben: A(11),
  dann: V2(1.98),
  nenner: A(12),
  kreuz: V(24.45),
  aus: A(13),
  zweiAB: A(14),
  drei: V2(5.4),
  weg: V2(7.01),
  minus2a: A(15),
  minus2b: V2(9.32),
  bleibt: A(16),
  injektiv: A(17),
  // Teil b
  teilB: A(18),
  jede: A(20),
  ausserZwei: V(45.35),
  nehmen: A(22),
  suchen: V(48.2),
  mal: A(23),
  klammer: A(24),
  links: A(25),
  rest: V(54.35),
  ausklammern: A(26),
  teilen: A(27),
  nie2: A(28),
  beiY2: A(29),
  nullEins: V(64.15),
  deshalb: A(30),
  nieMinus1: A(31),
  dreiZwei: V(70.35),
  urbild: A(32),
  surjektiv: A(33),
  // Teil c
  teilC: A(34),
  injUndSur: A(35),
  bijektiv: V(78.85),
  steht: A(36),
  bringt: A(37),
  variable: A(38),
  mengen: A(39),
  graph: A(40),
  spiegel: V(91.9),
  // Schluss
  summary: A(41),
  sSur: V(94.45),
  sBij: V(95.0),
  sJa: V(95.4),
  cta: A(42),
  such: A(43),
  tippt: V(99.6),
};

// Untertitel: [Start, Ende] in Sekunden der Sprachdatei, Text. Im CTA keine.
// [Start, Ende, Text, Datei des Starts, Ende in Datei 2 (falls der Untertitel dort endet)]
const SUB: [number, number, string, number?, number?][] = [
  [0, 1.64, 'Mathe-1-Klausuraufgabe.'],
  [2.1, 7.94, 'Ist diese Abbildung injektiv, surjektiv, bijektiv? Und wie lautet die Umkehrfunktion?'],
  [8.5, 10.8, 'Vorne fehlt die −1, hinten die 2.'],
  [11.46, 12.96, 'Teil a: injektiv.'],
  [13.7, 17.22, 'Injektiv heißt: Verschiedene Eingaben liefern verschiedene Werte.'],
  [17.72, 18.28, 'Wir zeigen: Haben a und b denselben Wert, dann ist a = b.', 0, 3.56],
  [22.9, 26.16, 'Die Nenner sind nie null, also multiplizieren wir über Kreuz.'],
  [26.72, 27.98, 'Jetzt ausmultiplizieren.'],
  [4.2, 7.82, '2ab und 3 stehen auf beiden Seiten und fallen weg.', 1],
  [8.3, 11.92, 'Minus 2a, minus 2b: Es bleibt b = a.', 1],
  [12.58, 13.74, 'f ist injektiv.', 1],
  [14.48, 16.32, 'Teil b: surjektiv.', 1],
  [41.5, 45.88, 'Jede Zahl der Zielmenge muss getroffen werden, also jede Zahl außer 2.'],
  [46.5, 49.62, 'Wir nehmen ein beliebiges y und suchen das passende x.'],
  [50.08, 52.54, 'Mal (x + 1). Klammer auflösen.'],
  [53.02, 55.5, 'Alles mit x nach links, der Rest nach rechts.'],
  [55.94, 56.88, 'x ausklammern.'],
  [57.36, 61.84, 'Und durch y − 2 teilen. Das geht, denn y ist nie 2.'],
  [62.34, 67.38, 'Bei y = 2 stünde hier 0 = 1. Deshalb fehlt die 2 in der Zielmenge.'],
  [67.84, 71.44, 'Und x ist nie −1, sonst folgt 3 = 2.'],
  [72.06, 75.48, 'Jedes y hat also ein Urbild. f ist surjektiv.'],
  [76.16, 79.76, 'Teil c: Injektiv und surjektiv heißt bijektiv.'],
  [80.44, 84.76, 'Die Umkehrfunktion steht schon da: Sie bringt jedes y zurück zu seinem x.'],
  [85.2, 86.88, 'Mit x als Variable geschrieben.'],
  [87.36, 90.0, 'Definitions- und Zielmenge tauschen dabei die Plätze.'],
  [90.54, 93.34, 'Am Graphen ist das die Spiegelung an der Winkelhalbierenden.'],
  [93.82, 95.94, 'Injektiv, surjektiv, bijektiv: dreimal ja.'],
];
export const SUBTITLES: [number, number, string][] = SUB.map(([a, b, s, src = 0, end2]) => [src ? V2(a) : V(a), end2 !== undefined ? V2(end2) : src ? V2(b) : V(b), s]);
