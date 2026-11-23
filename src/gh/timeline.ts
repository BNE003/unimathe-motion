// Timeline des Aha-Videos „Gabriels Horn“.
// Stimme: voice/gh-take1.mp3 (52,16 s, Chris, eleven_v4, 790 Credits). Abschnitte aus tools/pauses.mjs (Mindestpause 0,25 s),
// Sekunden in der Sprachdatei; Wortpositionen aus der feineren Messung (0,07 s), mit ≈ geschätzt.

export const VOICE = 'voice/gh-take1.mp3';
export const MUSIC = 'music-gh.wav';

const S: [number, number][] = [
  [0, 2.02], // 0 Dieses Horn (1.08) ist unendlich lang.
  [2.52, 5.44], // 1 Trotzdem kannst du es (≈4.25) mit genau Pi Litern Farbe füllen.
  [5.92, 9.86], // 2 Aber um es außen gleichmäßig anzustreichen, (8.76) reicht keine Farbe der Welt.
  [10.32, 10.9], // 3 Wie geht das?
  [11.46, 15.34], // 4 Das Horn entsteht, wenn die Kurve Eins durch X (13.72) um die X-Achse rotiert.
  [15.9, 17.02], // 5 Schneiden wir es in Stücke,
  [17.28, 19.02], // 6 jedes (17.70) doppelt so lang wie das davor.
  [19.52, 21.98], // 7 Zieh ein Stück auf doppelte Länge (≈21.1) und halbe Dicke:
  [22.38, 24.0], // 8 Es (22.82) passt genau auf das nächste.
  [24.5, 26.68], // 9 Halbe Dicke heißt (≈25.6) ein Viertel Querschnitt.
  [27.14, 28.04], // 10 Mal doppelte Länge:
  [28.42, 29.18], // 11 halbes Volumen.
  [29.62, 32.04], // 12 Pi Halbe, (30.52) Pi Viertel, (31.38) Pi Achtel …
  [32.5, 33.84], // 13 zusammen (33.12) genau (33.60) Pi.
  [34.36, 36.06], // 14 Der Umfang halbiert sich aber nur.
  [36.5, 37.4], // 15 Mal doppelte Länge:
  [37.78, 40.48], // 16 Jedes Stück hat (38.94) wieder (39.36) über vier Flächeneinheiten.
  [40.88, 42.22], // 17 Und die Stücke hören nie auf.
  [42.84, 43.86], // 18 Endliches Volumen,
  [44.18, 45.56], // 19 unendliche Oberfläche.
  [46.1, 47.64], // 20 Das ist (46.54) Gabriels Horn.
  [48.28, 49.82], // 21 Mehr Mathe verstehen und üben?
  [50.14, 52.16], // 22 Such im App Store nach UniMathe.
];

// Stille nach einem Abschnitt im Video, länger nur, wo eine Animation Zeit braucht
const GAP_DEFAULT = 0.3;
const GAP: Record<number, number> = {
  0: 0.35,
  1: 0.45,
  2: 0.7, // Zähler kippt auf ∞
  3: 0.45,
  4: 1.1, // Rotation läuft zu Ende
  5: 0.25,
  6: 0.6,
  7: 0.35,
  8: 1.3, // zweite Kopie
  9: 0.3,
  10: 0.25,
  11: 0.7,
  13: 1.0, // Balken rastet bei π
  14: 0.35,
  15: 0.25,
  16: 0.7,
  17: 1.1, // Streifen laufen weiter
  19: 0.35,
  20: 1.4, // Formeln
  21: 0.2,
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
export const TOTAL = Math.round((LAST.at + (LAST.to - LAST.from) + 0.6) * 10) / 10;

export const T = {
  // Hook
  lang: V(1.08),
  trotzdem: A(1),
  fuellen: V(4.25),
  fuellEnde: E(1),
  aber: A(2),
  reicht: V(8.76),
  unendl: E(2) + 0.15,
  wie: A(3),
  // Rotation
  entsteht: A(4),
  kurve: V(12.6),
  rotiert: V(13.72),
  rotEnde: E(4) + 0.9,
  // Stücke
  schneiden: A(5),
  jedes: V(17.7),
  zieh: A(7),
  laenge: V(20.3),
  dicke: V(21.1),
  passt: V(22.82),
  passtEnde: E(8),
  // Volumen
  halbeDicke: A(9),
  viertel: V(25.6),
  malL1: A(10),
  halbes: A(11),
  piHalbe: A(12),
  piViertel: V(30.52),
  piAchtel: V(31.38),
  zusammen: A(13),
  genauPi: V(33.6),
  // Haut
  umfang: A(14),
  malL2: A(15),
  jedesStueck: A(16),
  vier: V(39.36),
  nie: A(17),
  // Schluss
  endlich: A(18),
  unendlich: A(19),
  gabriel: V(46.54),
  formeln: E(20),
  // CTA
  cta: A(21),
  such: A(22),
  tippt: V(51.2),
};

// Untertitel: [Start, Ende] in Sekunden der Sprachdatei, Text. Im CTA keine.
const SUB: [number, number, string][] = [
  [0, 2.02, 'Dieses Horn ist unendlich lang.'],
  [2.52, 5.44, 'Trotzdem kannst du es mit genau π Litern Farbe füllen.'],
  [5.92, 9.86, 'Aber um es außen gleichmäßig anzustreichen, reicht keine Farbe der Welt.'],
  [10.32, 10.9, 'Wie geht das?'],
  [11.46, 15.34, 'Das Horn entsteht, wenn die Kurve 1/x um die x-Achse rotiert.'],
  [15.9, 19.02, 'Schneiden wir es in Stücke, jedes doppelt so lang wie das davor.'],
  [19.52, 24.0, 'Zieh ein Stück auf doppelte Länge und halbe Dicke: Es passt genau auf das nächste.'],
  [24.5, 29.18, 'Halbe Dicke heißt ein Viertel Querschnitt. Mal doppelte Länge: halbes Volumen.'],
  [29.62, 33.84, 'π/2, π/4, π/8 … zusammen genau π.'],
  [34.36, 40.48, 'Der Umfang halbiert sich aber nur. Mal doppelte Länge: Jedes Stück hat wieder über vier Flächeneinheiten.'],
  [40.88, 42.22, 'Und die Stücke hören nie auf.'],
  [42.84, 47.64, 'Endliches Volumen, unendliche Oberfläche. Das ist Gabriels Horn.'],
];
export const SUBTITLES: [number, number, string][] = SUB.map(([a, b, s]) => [V(a), V(b), s]);
