// Timeline des Videos „Warum ist AB ≠ BA?“.
// Alle Zeiten stammen aus den Sprechpausen von voice/ab-take1.mp3 (tools/pauses.mjs) und sind in Sekunden.

export const VOICE = 'voice/ab-take1.mp3';
export const MUSIC = 'music-ab.wav';
export const VOICE_END = 44.24;

// Zusätzliche Stille in der Stimme, damit Animationen Zeit bekommen: [Stelle in der Sprachdatei, Länge]
export const VOICE_GAPS: [number, number][] = [
  [6.45, 0.4], // kurz Luft vor „Völlig anderes Ergebnis“
  [14.5, 0.8], // Sturzflug auf die Ebene
  [18.42, 0.8], // Ebene teilt sich in zwei Platten
  [32.4, 0.8], // obere Platte dreht wieder zu AB
  [35.45, 0.6], // Matrizen stehen kurz
];
// Zeit in der Sprachdatei → Zeit im Video
export const V = (s: number) => s + VOICE_GAPS.reduce((acc, [cut, gap]) => (cut < s ? acc + gap : acc), 0);

export const TOTAL = Math.round((V(VOICE_END) + 1.6) * 10) / 10;

// Wort-Cues im Video (aus Sprachzeiten umgerechnet)
export const T = {
  // S1 Hook
  kipp1: V(0.45), // F1 kippt nach vorne
  dreh1: V(2.35), // F1 dreht zur Seite
  anders: V(3.82), // Kamera zieht auf, F2 erscheint
  dreh2: V(4.45), // F2 dreht zuerst
  kipp2: V(5.4), // dann kippt F2
  voellig: V(6.72), // ≠ und Kamerabogen
  // S2 Brücke
  genau: V(8.56),
  ab: V(9.64),
  nicht: V(10.4),
  ba: V(10.96),
  raum: V(12.08), // Raumgitter erscheint
  bewegt: V(13.1), // der ganze Raum schwingt mit
  dive: V(14.3), // Sturzflug auf die Ebene
  // S3 Die zwei Bewegungen
  aDreht: V(14.74),
  bZieht: V(16.64),
  split: V(18.42) + 0.25, // in der eingefügten Pause: Ebene teilt sich
  // S4 Duell
  erstB: V(18.68),
  breit: V(20.4),
  gedreht: V(21.7),
  erstA: V(22.82),
  quer: V(24.52),
  lang: V(25.94),
  // S5 Aha
  zieht: V(27.2),
  waagerecht: V(28.04),
  reihen: V(29.32),
  liegt: V(30.68),
  wieder: V(32.36), // obere Platte dreht wieder (in der eingefügten Pause)
  pfeile: V(32.68),
  zahlen: V(33.74),
  matrix: V(34.9),
  // S6 Rückschluss
  bewegungen: V(35.68),
  zaehlt: V(37.56),
  // S7 CTA
  cta: V(40.06),
  name: V(40.82),
  search: V(42.3),
  tippt: V(43.5),
};

// Untertitel: [Start, Ende] in Sekunden der Sprachdatei, Text. Im CTA keine.
export const SUBTITLES: [number, number, string][] = [
  [0, 3.26, 'Kipp dieses F nach vorne – dann dreh es zur Seite.'],
  [3.82, 4.78, 'Und jetzt andersrum.'],
  [5.24, 8.06, 'Gleiche Bewegungen. Völlig anderes Ergebnis.'],
  [8.56, 11.58, 'Genau deshalb ist A · B nicht B · A.'],
  [12.08, 14.3, 'Denn jede Matrix bewegt den ganzen Raum.'],
  [14.74, 16.1, 'A dreht um 90°.'],
  [16.64, 18.16, 'B zieht alles in die Breite.'],
  [18.68, 22.24, 'Erst B, dann A: Das F wird breit, dann gedreht.'],
  [22.82, 26.82, 'Erst A, dann B: Das F liegt schon quer und wird richtig lang.'],
  [27.2, 28.82, 'Denn B zieht immer waagerecht.'],
  [29.32, 32.08, 'Die Reihenfolge entscheidet, was gerade waagerecht liegt.'],
  [32.68, 35.26, 'Andere Pfeile, andere Zahlen in der Matrix.'],
  [35.68, 39.56, 'Matrizen sind Bewegungen. Und bei Bewegungen zählt die Reihenfolge.'],
];

// Soundeffekte: [Zeit im Video, Datei, Lautstärke]
export const SFX: [number, string, number][] = [
  [0, 'swell', 0.45],
  [T.kipp1, 'whoosh', 0.35],
  [T.kipp1 + 0.85, 'click', 0.4],
  [T.dreh1, 'whoosh', 0.32],
  [T.dreh1 + 0.85, 'click', 0.4],
  [T.anders - 0.1, 'rise', 0.25],
  [T.dreh2, 'whoosh', 0.3],
  [T.dreh2 + 0.8, 'click', 0.38],
  [T.kipp2, 'whoosh', 0.32],
  [T.kipp2 + 0.8, 'click', 0.4],
  [T.voellig, 'accent', 0.55],
  [T.ab, 'tick', 0.4],
  [T.nicht, 'buzz', 0.3],
  [T.ba, 'tick', 0.4],
  [T.bewegt, 'whoosh', 0.3],
  [T.dive - 0.2, 'rise', 0.4],
  [T.dive + 1.2, 'lock', 0.4],
  [T.aDreht + 0.2, 'whoosh', 0.28],
  [T.bZieht + 0.3, 'swell', 0.3],
  [T.split, 'whoosh', 0.3],
  [T.breit, 'swell', 0.3],
  [T.gedreht, 'whoosh', 0.28],
  [T.erstA + 0.08, 'whoosh', 0.28],
  [T.lang - 0.3, 'swell', 0.32],
  [T.lang + 0.7, 'click', 0.4],
  [T.zieht + 0.4, 'rise', 0.3],
  [T.reihen + 0.2, 'tick', 0.4],
  [T.liegt, 'tick', 0.4],
  [T.wieder, 'whoosh', 0.25],
  [T.pfeile, 'tick', 0.4],
  [T.zahlen + 0.6, 'lock', 0.45],
  [T.matrix + 0.2, 'accent_small', 0.45],
  [T.bewegungen, 'rise', 0.3],
  [T.zaehlt + 1.2, 'lock_hi', 0.5],
  [T.cta - 0.2, 'swell', 0.4],
  [T.cta + 0.5, 'accent', 0.45],
  ...Array.from({length: 8}, (_, i) => [T.tippt + 0.35 + i * 0.075, 'tick', 0.18] as [number, string, number]),
];
