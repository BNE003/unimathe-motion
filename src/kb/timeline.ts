// Timeline des Klausurvideos „Lineare Abhängigkeit, Basis & Dimension“.
// Alle Zeiten stammen aus den Sprechpausen von voice/kb-take1.mp3 (tools/pauses.mjs) und sind in Sekunden.

export const VOICE = 'voice/kb-take1.mp3';
export const MUSIC = 'music-kb.wav';

// Zusätzliche Stille in der Stimme, damit Animationen Zeit bekommen: [Stelle in der Sprachdatei, Länge]
export const VOICE_GAPS: [number, number][] = [
  [29.2, 1.2], // Zeilen werden zu Gleichungen
  [45.4, 0.6], // (a − 1)·λ₃ = 0 wirken lassen
  [63.25, 0.5], // v₃ = v₁ + v₂
  [74.25, 2.0], // Kamera seitlich an die Ebene
  [92.1, 1.5], // Merkkarte
];
// Zeit in der Sprachdatei → Zeit im Video
export const V = (s: number) => s + VOICE_GAPS.reduce((acc, [cut, gap]) => (cut < s ? acc + gap : acc), 0);

export const TOTAL = Math.round((V(99.92) + 1.4) * 10) / 10;

// Wort-Cues im Video (aus Sprachzeiten umgerechnet)
export const T = {
  // S1 Hook
  frage: V(1.66),
  anschaulich: V(6.62),
  wann: V(7.72),
  hookFlat: 9.3, // „in die Ebene“: der Körper klappt flach
  loesung: V(12.22),
  drei: V(13.1),
  // S2 Ansatz
  s1: V(14.78),
  setz: V(17.46),
  kombi: V(18.6),
  def: V(21.38),
  nichtAlle: V(23.6),
  zeilen: V(26.58),
  rows: [V(27.2), V(28.1), V(29.0)] as number[],
  // S3 Lösen
  s2: V(29.94),
  umstellen: V(32.5),
  r1: V(33.7),
  einsetzen: V(35.66),
  fly2: V(36.4),
  r2: V(37.5),
  beides: V(39.44),
  fly3: V(39.9),
  uebrig: V(41.08),
  r3: V(42.1),
  boxA: V(44.6),
  entscheidet: V(45.84),
  nicht: V(47.98),
  nicht2: V(50.0),
  unab: V(51.98),
  gleich: V(53.58),
  frei: V(55.0),
  miteins: V(56.54),
  heisst: V(59.52),
  v3sum: V(60.26),
  linear: V(63.64),
  aEins: V(65.6),
  // S4 Aha
  raum: V(67.38),
  kippt: V(68.48),
  para: V(70.4),
  flach: V(72.56),
  edge: V(73.9),
  edgeBack: V(74.74) - 0.2,
  // S5 Basis & Dimension
  s3: V(74.74),
  ueber: V(78.0),
  spannt: V(79.8),
  unab2: V(83.34),
  zeile1: V(85.3),
  zeile3: V(86.2),
  also: V(87.62),
  basis: V(88.36),
  dim: V(90.46),
  // S6 Merkkarte, S7 CTA
  merk: V(91.7),
  cta: V(92.56) - 0.1,
  name: V(94.9),
  search: V(97.78),
};

// Untertitel: [Start, Ende] in Sekunden der Sprachdatei, Text. Im CTA keine.
export const SUBTITLES: [number, number, string][] = [
  [0, 1.06, 'Klausuraufgabe:'],
  [1.66, 5.04, 'Für welches a sind diese drei Vektoren linear abhängig?'],
  [6.62, 10.62, 'Anschaulich: Wann kippt v₃ in die Ebene der anderen beiden?'],
  [12.22, 13.74, 'Die Lösung in drei Schritten.'],
  [14.78, 16.5, 'Schritt eins: der Ansatz.'],
  [17.46, 20.3, 'Setz eine Kombination der drei Vektoren gleich null.'],
  [21.38, 25.54, 'Linear abhängig heißt: Das klappt, ohne dass alle λ null sind.'],
  [26.58, 28.86, 'Zeile für Zeile gibt das drei Gleichungen.'],
  [29.94, 31.5, 'Schritt zwei: lösen.'],
  [32.5, 34.74, 'Zeile eins nach λ₁ umstellen.'],
  [35.66, 38.54, 'In Zeile zwei einsetzen, das gibt λ₂.'],
  [39.44, 40.64, 'Beides in Zeile drei.'],
  [41.08, 44.82, 'Übrig bleibt: (a − 1) · λ₃ = 0'],
  [45.84, 47.1, 'Jetzt entscheidet a.'],
  [47.98, 52.56, 'Ist a ≠ 1, muss λ₃ = 0 sein, also alle. Unabhängig.'],
  [53.58, 58.72, 'Ist a = 1, ist λ₃ frei. Mit 1 werden die anderen −1.'],
  [59.52, 62.76, 'Heißt: v₃ = v₁ + v₂'],
  [63.64, 66.52, 'Linear abhängig also genau für a = 1.'],
  [67.38, 71.96, 'Und im Raum: v₃ kippt genau in die Ebene von v₁ und v₂.'],
  [72.56, 73.7, 'Der Körper wird flach.'],
  [74.74, 77.1, 'Schritt drei: Basis und Dimension.'],
  [78.0, 82.54, 'v₃ ist überflüssig. U wird schon von v₁ und v₂ aufgespannt.'],
  [83.34, 86.84, 'Und die beiden sind unabhängig, das zeigen Zeile eins und drei.'],
  [87.62, 91.5, 'Also: Basis v₁, v₂. Dimension zwei.'],
];

// Soundeffekte: [Zeit im Video, Datei, Lautstärke]
export const SFX: [number, string, number][] = [
  [0, 'swell', 0.5],
  [T.hookFlat - 0.75, 'collapse', 0.55],
  [T.drei, 'tick', 0.4],
  [T.drei + 0.2, 'tick', 0.4],
  [T.drei + 0.4, 'tick', 0.4],
  [T.s1, 'whoosh', 0.3],
  [T.kombi, 'click', 0.4],
  ...T.rows.map((r) => [r, 'tick', 0.45] as [number, string, number]),
  [T.s2, 'whoosh', 0.3],
  [T.r1, 'click', 0.4],
  [T.fly2, 'whoosh', 0.25],
  [T.r2, 'click', 0.4],
  [T.fly3, 'whoosh', 0.25],
  [T.r3, 'click', 0.4],
  [T.boxA, 'lock', 0.5],
  [T.entscheidet, 'accent_small', 0.5],
  [T.unab, 'tick', 0.45],
  [T.miteins, 'click', 0.4],
  [T.v3sum, 'lock_hi', 0.55],
  [T.aEins, 'lock', 0.6],
  [T.kippt, 'rise', 0.35],
  [T.flach - 0.6, 'collapse', 0.5],
  [T.para, 'tick', 0.4],
  [T.s3, 'whoosh', 0.3],
  [T.ueber, 'click', 0.4],
  [T.spannt, 'rise', 0.3],
  [T.zeile1, 'tick', 0.45],
  [T.zeile3, 'tick', 0.45],
  [T.basis, 'lock', 0.5],
  [T.dim, 'lock_hi', 0.55],
  [T.merk, 'swell', 0.4],
  [T.cta + 0.5, 'accent', 0.45],
  ...Array.from({length: 8}, (_, i) => [T.search + 0.35 + i * 0.075, 'tick', 0.18] as [number, string, number]),
];
