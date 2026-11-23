// Timeline des Klausurvideos „Verkettung von Abbildungen“, Version 2.
// Aufnahme 1: vk-take2.mp3 (96,4 s, Chris, eleven_v4, 1.376 Credits). Dort klang „iks“ wie „ix“; alle Sätze mit x kommen
// aus Aufnahme 2: vk-take3-x.mp3 (29,1 s, 404 Credits, „X“ im Stimmtext). Abschnitte aus tools/pauses.mjs (Mindestpause 0,25 s),
// Sekunden in der jeweiligen Sprachdatei (drittes Feld 1 = Aufnahme 2); Wortpositionen aus der feineren Messung, mit ≈ geschätzt.

export const VOICES = ['voice/vk-take2.mp3', 'voice/vk-take3-x.mp3'];
export const MUSIC = 'music-vk.wav';

const S: [number, number, number?][] = [
  [0, 1.94], // 0 Mathe eins Klausuraufgabe.
  [2.42, 4.02], // 1 Gegeben sind Eff und G.
  [4.48, 4.96], // 2 Gesucht:
  [5.32, 8.8], // 3 die Verkettungen, (6.22) ihre Eigenschaften (7.70) und Eff hoch minus eins.
  [9.36, 9.9], // 4 Teil A.
  [10.38, 11.54], // 5 Eff nach G heißt:
  [11.82, 13.04], // 6 erst G, (12.70) dann Eff.
  [13.78, 14.96], // 7 Probieren wir minus eins:
  [15.44, 17.22], // 8 G quadriert, (16.44) das gibt eins.
  [17.76, 19.4], // 9 Eff verdoppelt und addiert drei:
  [19.72, 20.3], // 10 Das gibt fünf.
  [0, 5.34, 1], // 11 Allgemein liefert (≈1.0) G X Quadrat, (2.36) und Eff macht daraus (3.72) zwei X Quadrat plus drei.
  [27.06, 28.9], // 12 Bei G nach Eff ist es umgekehrt:
  [29.18, 29.68], // 13 erst Eff,
  [29.98, 30.46], // 14 dann G.
  [31.04, 33.84], // 15 Aus minus eins macht Eff (32.46) minus zwei plus drei, also eins.
  [34.12, 34.7], // 16 Quadriert
  [35.04, 36.6], // 17 bleibt das eins.
  [5.98, 8.6, 1], // 18 Allgemein liefert (7.12) Eff zwei X plus drei,
  [8.74, 10.18, 1], // 19 und G quadriert das Ganze.
  [10.68, 12.46, 1], // 20 Jeder mit jedem multipliziert:
  [12.98, 15.72, 1], // 21 vier X Quadrat plus zwölf X plus neun.
  [47.22, 47.74], // 22 Einmal fünf,
  [48.06, 50.92], // 23 einmal eins: (49.14) Die Reihenfolge ändert das Ergebnis.
  [51.6, 52.14], // 24 Teil B.
  [52.74, 56.14], // 25 Bei Eff nach G landen minus eins und eins (≈55.3) beide auf fünf,
  [56.5, 58.26], // 26 die Verkettung ist also nicht injektiv.
  [16.22, 19.98, 1], // 27 Und weil X Quadrat nie negativ ist, (18.70) kommt nichts unter drei heraus.
  [63.14, 64.26], // 28 Sie ist auch nicht surjektiv.
  [64.84, 66.18], // 29 Genauso bei G nach Eff:
  [66.82, 71.52], // 30 Minus eins und minus zwei (≈68.6) landen beide auf eins, (69.80) und ein Quadrat ist nie negativ.
  [71.98, 74.84], // 31 Also ist auch sie weder injektiv noch surjektiv.
  [75.44, 77.4], // 32 Damit ist keine von beiden bijektiv.
  [78.18, 78.78], // 33 Teil C.
  [79.34, 83.32], // 34 Eff ist eine Gerade mit Steigung zwei (≈81.2) und trifft jeden Wert genau einmal,
  [83.58, 84.62], // 35 ist also umkehrbar.
  [20.48, 21.54, 1], // 36 Wir lösen nach X auf:
  [22.1, 24.0, 1], // 37 minus drei, (23.16) dann durch zwei.
  [24.5, 29.12, 1], // 38 So ist Eff hoch minus eins von X gleich X minus drei, (28.32) durch zwei.
  [93.54, 94.14], // 39 Mehr davon?
  [94.48, 96.4], // 40 Such im App Store nach UniMathe.
];

// Stille nach einem Abschnitt im Video. Standard 0,3 s, länger nur, wo eine Animation Zeit braucht.
const GAP_DEFAULT = 0.3;
const GAP: Record<number, number> = {
  0: 0.35,
  1: 0.25,
  2: 0.15,
  3: 0.5,
  4: 0.25,
  5: 0.2,
  6: 0.45,
  7: 0.25,
  8: 0.45,
  9: 0.2,
  10: 0.55,
  11: 0.9, // Ergebnis unterstreichen
  12: 0.2,
  13: 0.15,
  14: 0.4,
  15: 0.3,
  16: 0.2,
  17: 0.5,
  18: 0.25,
  19: 1.0, // Produkt aufschreiben
  20: 0.25,
  21: 0.7,
  22: 0.25,
  23: 1.2, // Übergang zum Graphen
  24: 0.3,
  25: 0.25,
  26: 0.4,
  27: 0.25,
  28: 0.8, // Kamera fährt zu g∘f
  29: 0.25,
  31: 0.4,
  32: 1.0, // Übergang zu f
  33: 0.25,
  34: 0.2,
  35: 0.4,
  36: 0.2,
  37: 0.4,
  38: 3.0, // Probe und Zusammenfassung
  39: 0.25,
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
export const TOTAL = Math.round((LAST.at + (LAST.to - LAST.from) + 0.7) * 10) / 10;

export const T = {
  // Einstieg
  gegeben: A(1),
  verk: A(3),
  eig: V(6.22),
  inv: V(7.7),
  // Teil a: f∘g
  teilA: A(4),
  fnachg: A(5),
  erstG: A(6),
  dannF: V(12.7),
  probieren: A(7),
  gQuad: A(8),
  gibtEins: V(16.44),
  fVerd: A(9),
  gibtFuenf: A(10),
  allg1: A(11),
  liefertG: V2(1.0),
  fMacht: V2(2.36),
  zweiX: V2(3.72),
  box1: E(11),
  // Teil a: g∘f
  gnachf: A(12),
  erstF: A(13),
  dannG: A(14),
  ausM1: A(15),
  m2p3: V(32.46),
  quadriert: A(16),
  bleibt: A(17),
  allg2: A(18),
  liefertF: V2(7.12),
  gQuadGanze: A(19),
  jeder: A(20),
  vier: A(21),
  box2: E(21),
  einmal5: A(22),
  einmal1: A(23),
  reihenfolge: V(49.14),
  aOk: E(23),
  // Teil b
  toGraph: E(23) + 0.15,
  teilB: A(24),
  b1: A(25),
  b1fuenf: V(55.3),
  b1inj: A(26),
  b1weil: A(27),
  b1unter: V2(18.7),
  b1sur: A(28),
  b2: A(29),
  b2pts: A(30),
  b2eins: V(68.6),
  b2quad: V(69.8),
  b2weder: A(31),
  keine: A(32),
  bOk: E(32),
  // Teil c
  teilC: A(33),
  gerade: A(34),
  trifft: V(81.2),
  umkehrbar: A(35),
  loesen: A(36),
  minus3: A(37),
  durch2: V2(23.16),
  soIst: A(38),
  finvDurch: V2(28.32),
  cOk: E(38) + 0.1,
  sum: E(38) + 0.9,
  // CTA
  cta: A(39),
  such: A(40),
  tippt: V(95.3),
};

// Untertitel: [Start, Ende] in Sekunden der Sprachdatei, Text. Im CTA keine.
const SUB: [number, number, string, number?][] = [
  [0, 1.94, 'Mathe 1 Klausuraufgabe.'],
  [2.42, 8.8, 'Gegeben sind f und g. Gesucht: die Verkettungen, ihre Eigenschaften und f⁻¹.'],
  [9.36, 13.04, 'Teil a. f nach g heißt: erst g, dann f.'],
  [13.78, 17.22, 'Probieren wir −1: g quadriert, das gibt 1.'],
  [17.76, 20.3, 'f verdoppelt und addiert 3: Das gibt 5.'],
  [0, 5.34, 'Allgemein liefert g x², und f macht daraus 2x² + 3.', 1],
  [27.06, 30.46, 'Bei g nach f ist es umgekehrt: erst f, dann g.'],
  [31.04, 36.6, 'Aus −1 macht f −2 + 3, also 1. Quadriert bleibt das 1.'],
  [5.98, 10.18, 'Allgemein liefert f 2x + 3, und g quadriert das Ganze.', 1],
  [10.68, 15.72, 'Jeder mit jedem multipliziert: 4x² + 12x + 9.', 1],
  [47.22, 50.92, 'Einmal 5, einmal 1: Die Reihenfolge ändert das Ergebnis.'],
  [51.6, 58.26, 'Teil b. Bei f nach g landen −1 und 1 beide auf 5, die Verkettung ist also nicht injektiv.'],
  [16.22, 19.98, 'Und weil x² nie negativ ist, kommt nichts unter 3 heraus.', 1],
  [63.14, 64.26, 'Sie ist auch nicht surjektiv.'],
  [64.84, 71.52, 'Genauso bei g nach f: −1 und −2 landen beide auf 1, und ein Quadrat ist nie negativ.'],
  [71.98, 74.84, 'Also ist auch sie weder injektiv noch surjektiv.'],
  [75.44, 77.4, 'Damit ist keine von beiden bijektiv.'],
  [78.18, 84.62, 'Teil c. f ist eine Gerade mit Steigung 2 und trifft jeden Wert genau einmal, ist also umkehrbar.'],
  [20.48, 24.0, 'Wir lösen nach x auf: minus 3, dann durch 2.', 1],
  [24.5, 29.12, 'So ist f⁻¹(x) = (x − 3)/2.', 1],
];
export const SUBTITLES: [number, number, string][] = SUB.map(([a, b, s, src]) => [src ? V2(a) : V(a), src ? V2(b) : V(b), s]);
