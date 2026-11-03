// Zeiten in Sekunden, gemessen an public/voice/det-take1.mp3 (Pausen gekürzt, Tempo 1,08 via tools/tighten.mjs)
export const TOTAL = 31.2;
export const VOICE = 'voice/det-take1.mp3';
export const MUSIC = 'music-det.wav';

export const T = {
  hookGo: 0.45, // Ebene wird zusammengedrückt
  hookHit: 2.1, // alles liegt auf der Linie
  rewind: 3.45, // „Aber wie?“ → zurückspulen
  rewindEnd: 4.35,
  square: 4.5, // „Ein Quadrat“
  area1: 5.68, // „Fläche eins“
  warp: 6.9, // „Die Matrix verzerrt es“
  warpEnd: 9.7, // „… dreimal so groß“
  det: 11.55, // „… die Determinante“
  tease: 12.8, // „Jetzt kippt eine Seite …“
  // Determinante beim Kippen: genau 3, 2, 1, 0 auf den gesprochenen Zahlen
  tilt: [
    [15.3, 3],
    [16.2, 2],
    [17.18, 1],
    [18.1, 0],
  ] as [number, number][],
  hit: 18.1, // „null“
  noArea: 19.0, // „Keine Fläche mehr …“
  line: 20.16, // „Die ganze Ebene liegt auf einer Linie“
  back: 22.42, // „Und zurück geht's nie mehr“
  kernel: 24.08, // „Ganze Linien landen auf einem Punkt“
  land: 25.45,
  cta: 26.0, // „Mehr Aha-Momente …“
  search: 28.56, // „Such im App Store nach UniMathe“
};

// Untertitel: [Start, Ende, Text]
export const SUBTITLES: [number, number, string][] = [
  [0.0, 2.9, 'Diese Matrix lässt eine ganze Dimension verschwinden.'],
  [3.38, 3.96, 'Aber wie?'],
  [4.5, 6.36, 'Ein Quadrat. Fläche eins.'],
  [6.74, 9.94, 'Die Matrix verzerrt es – die Fläche wird dreimal so groß.'],
  [10.32, 12.42, 'Genau dieser Faktor ist die Determinante.'],
  [12.78, 14.78, 'Jetzt kippt eine Seite auf die andere zu.'],
  [15.26, 16.1, 'Drei …'],
  [16.14, 17.1, 'Drei … zwei …'],
  [17.12, 18.0, 'Drei … zwei … eins …'],
  [18.06, 18.6, 'Drei … zwei … eins … null.'],
  [19.0, 22.08, 'Keine Fläche mehr. Die ganze Ebene liegt auf einer Linie.'],
  [22.42, 26.0, 'Und zurück geht’s nie mehr: Ganze Linien landen auf einem Punkt.'],
];

// Soundeffekte: [Zeit, Datei, Lautstärke]. collapse.wav schlägt 0,75 s nach Start auf.
export const SFX: [number, string, number][] = [
  [T.hookHit - 0.75, 'collapse', 1],
  [T.rewind - 0.05, 'whoosh', 0.7],
  [T.square + 0.05, 'click', 0.5],
  [T.det, 'accent_small', 0.7],
  [T.tilt[0][0], 'tick', 0.6],
  [T.tilt[1][0], 'tick', 0.6],
  [T.tilt[2][0], 'tick', 0.6],
  [T.hit - 0.75, 'collapse', 1],
  [T.land - 0.03, 'lock', 0.6],
  [T.cta - 0.35, 'swell', 0.55],
  ...Array.from({length: 8}, (_, i) => [T.search + 0.35 + i * 0.075, 'tick', 0.22] as [number, string, number]),
];
