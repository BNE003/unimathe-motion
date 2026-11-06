// Timeline des Videos „Warum ist das Skalarprodukt bei 90° null?“.
// Alle Zeiten stammen aus den Sprechpausen von voice/sk-take1.mp3 (tools/pauses.mjs) und sind in Sekunden.

export const VOICE = 'voice/sk-take1.mp3';
export const MUSIC = 'music-sk.wav';
export const VOICE_END = 51.84;

// Stille, die aus der Stimme herausgeschnitten wird: [Beginn in der Sprachdatei, Länge]. Alle Schnitte liegen in Sprechpausen.
export const VOICE_CUTS: [number, number][] = [
  [1.19, 0.2],
  [4.97, 0.1],
  [11.93, 0.2],
  [16.67, 0.24],
  [20.67, 0.24],
  [24.07, 0.26],
  [26.36, 0.15],
  [28.85, 0.2],
  [31.55, 0.15],
  [35.43, 0.24],
  [37.15, 0.2],
  [38.31, 0.2],
  [40.89, 0.15],
  [45.25, 0.15],
  [47.47, 0.34],
];
// Zeit in der Sprachdatei → Zeit im Video
export const V = (s: number) => s - VOICE_CUTS.reduce((acc, [c, d]) => acc + Math.min(d, Math.max(0, s - c)), 0);

export const TOTAL = Math.round((V(VOICE_END) + 0.7) * 10) / 10;

// Wort-Cues im Video (aus Sprachzeiten umgerechnet)
export const T = {
  // Hook
  wenn: V(1.56),
  drehe: V(2.7),
  bei: V(5.28),
  null1: V(7.86), // a erreicht 90°, Rechteck klappt zusammen
  obwohl: V(8.8),
  verschw1: V(10.06),
  warum: V(11.36),
  // Bedeutung
  sk: V(12.32),
  richtung: V(15.2),
  // Schatten
  stell: V(17.06),
  schatten: V(19.0),
  je: V(21.06),
  kuerzer: V(22.3),
  bei90: V(24.48),
  verschw2: V(25.46), // a erreicht 90°, Blick von oben
  senk: V(26.74),
  // Formel
  formel: V(29.22),
  fzeile: V(30.2),
  betrag: V(31.86),
  kos: V(32.86),
  dieser: V(34.22),
  malb: V(35.82),
  flaeche: V(37.5),
  // Null
  bei90b: V(38.7),
  kosnull: V(40.2),
  deshalb: V(41.2),
  null3: V(42.86),
  egal: V(43.52),
  // Begriff
  nennt: V(45.58),
  ortho: V(46.2),
  // CTA
  cta: V(47.96),
  such: V(49.84),
  tippt: V(50.5),
};

// Untertitel: [Start, Ende] in Sekunden der Sprachdatei, Text. Im CTA keine.
export const SUBTITLES: [number, number, string][] = [
  [0, 1.02, 'Zwei Vektoren.'],
  [1.56, 4.76, 'Wenn ich einen davon drehe, passiert etwas Merkwürdiges.'],
  [5.28, 8.28, 'Bei genau 90° wird ihr Skalarprodukt null.'],
  [8.8, 10.88, 'Obwohl keiner der beiden Vektoren verschwindet.'],
  [11.36, 11.74, 'Warum?'],
  [12.32, 16.52, 'Das Skalarprodukt misst, wie stark zwei Vektoren in dieselbe Richtung zeigen.'],
  [17.06, 20.52, 'Stell dir vor, einer der Vektoren wirft einen Schatten auf den anderen.'],
  [21.06, 23.92, 'Je größer der Winkel, desto kürzer wird dieser Schatten.'],
  [24.48, 26.14, 'Bei 90° verschwindet er.'],
  [26.74, 28.68, 'Die Vektoren stehen senkrecht aufeinander.'],
  [29.22, 31.38, 'Und genau das steckt hinter dieser Formel.'],
  [31.86, 35.28, 'Betrag a mal Kosinus Alpha: genau dieser Schatten.'],
  [35.82, 38.12, 'Mal Betrag b: diese Fläche.'],
  [38.7, 40.74, 'Bei 90° ist der Kosinus null.'],
  [41.2, 45.08, 'Deshalb ist das ganze Skalarprodukt null, egal wie lang die Vektoren sind.'],
  [45.58, 47.32, 'Das nennt man Orthogonalität.'],
];

// Soundeffekte: [Zeit im Video, Datei, Lautstärke]
export const SFX: [number, string, number][] = [
  [0, 'whoosh', 0.5],
  [0, 'accent_small', 0.35],
  [T.drehe, 'rise', 0.22],
  [T.null1, 'collapse', 0.5],
  [T.null1 + 0.02, 'lock', 0.5],
  [T.obwohl + 0.1, 'tick', 0.35],
  [T.verschw1 - 0.1, 'tick', 0.35],
  [T.warum - 0.1, 'whoosh', 0.32],
  [T.richtung, 'click', 0.3],
  [T.stell, 'swell', 0.32],
  [T.schatten, 'tick', 0.35],
  [T.je, 'rise', 0.24],
  [T.bei90 - 0.1, 'whoosh', 0.3],
  [T.verschw2, 'lock_hi', 0.45],
  [T.senk - 0.1, 'whoosh', 0.26],
  [T.fzeile, 'tick', 0.38],
  [T.fzeile + 0.3, 'tick', 0.38],
  [T.fzeile + 0.6, 'tick', 0.38],
  [T.dieser, 'click', 0.35],
  [T.malb + 0.1, 'swell', 0.34],
  [T.flaeche, 'lock', 0.35],
  [T.kosnull, 'collapse', 0.45],
  [T.null3, 'lock_hi', 0.5],
  [T.egal - 0.1, 'rise', 0.34],
  [T.nennt - 0.2, 'whoosh', 0.28],
  [T.ortho + 0.3, 'accent', 0.5],
  [T.cta - 0.1, 'swell', 0.34],
  ...Array.from({length: 8}, (_, i) => [T.tippt + 0.2 + i * 0.075, 'tick', 0.18] as [number, string, number]),
];
