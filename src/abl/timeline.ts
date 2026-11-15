// Timeline des Aha-Videos „Warum misst die Ableitung die Steigung?“.
// Vorschau ohne Stimme: Satzteile mit geschätzter Dauer (2,44 Wörter/s wie Chris im Inverse-Video).
// Nach der Aufnahme werden DUR durch die echten Abschnitte aus tools/pauses.mjs ersetzt und VOICE_READY = true.

export const VOICE_READY = false;
export const VOICE = 'voice/abl-take1.mp3';
export const MUSIC = 'music-abl.wav';

// [Text, geschätzte Dauer, Pause danach]
const CLAUSES: [string, number, number][] = [
  ['Warum misst die Ableitung die Steigung –', 2.3, 0.0], // 0
  ['genau in einem Punkt?', 1.6, 0.45], // 1
  ['Steigung misst man eigentlich zwischen zwei Punkten.', 2.8, 0.35], // 2
  ['Von hier bis hier:', 1.4, 0.25], // 3
  ['im Schnitt drei.', 1.2, 0.5], // 4
  ['Rückt der Punkt näher, wird es genauer:', 2.4, 0.3], // 5
  ['zwei Komma fünf,', 1.2, 0.45], // 6
  ['zwei Komma eins,', 1.2, 0.45], // 7
  ['zwei Komma null eins.', 1.6, 0.5], // 8
  ['Von links kommen die Werte von unten.', 2.7, 0.7], // 9
  ['Beide treffen sich bei zwei.', 2.0, 0.5], // 10
  ['Ganz zusammen dürfen die Punkte nie –', 2.4, 0.2], // 11
  ['das wäre null durch null.', 1.9, 0.45], // 12
  ['Aber das Ziel steht fest:', 1.8, 0.2], // 13
  ['die Tangente.', 1.0, 0.45], // 14
  ['Ihre Steigung ist die Ableitung.', 2.0, 0.7], // 15
  ['Mehr davon?', 0.9, 0.25], // 16
  ['Such im App Store nach UniMathe.', 2.3, 0], // 17
];

type Clip = {at: number; dur: number; i: number; text: string};
export const CLIPS: Clip[] = (() => {
  const out: Clip[] = [];
  let cur = 0;
  CLAUSES.forEach(([text, dur, gap], i) => {
    out.push({at: cur, dur, i, text});
    cur += dur + gap;
  });
  return out;
})();

export const A = (i: number) => CLIPS[i].at;
export const E = (i: number) => CLIPS[i].at + CLIPS[i].dur;

const LAST = CLIPS[CLIPS.length - 1];
export const TOTAL = Math.round((LAST.at + LAST.dur + 0.6) * 10) / 10;

export const T = {
  // Hook
  warum: A(0),
  punkt: A(1),
  // zwei Punkte, mittlere Steigung
  zwei: A(2),
  zweiP: A(2) + 2.0, // „zwei Punkten“: Q erscheint
  hier: A(3),
  schnitt: A(4),
  // von rechts heran
  naeher: A(5),
  v25: A(6),
  v21: A(7),
  v201: A(8),
  // von links
  links: A(9),
  beide: A(10),
  // null durch null
  zusammen: A(11),
  nullNull: A(12),
  // Tangente, Ableitung
  ziel: A(13),
  tangente: A(14),
  ableitung: A(15),
  ableitungWort: A(15) + 1.4,
  // CTA
  cta: A(16),
  such: A(17),
  tippt: A(17) + 1.2,
};

// Untertitel: [Start, Ende, Text]. Im Hook steht die Frage groß im Bild, im CTA keine.
const SUB: [number, number, string][] = [
  [A(2), E(4), 'Steigung misst man eigentlich zwischen zwei Punkten. Von hier bis hier: im Schnitt 3.'],
  [A(5), E(8), 'Rückt der Punkt näher, wird es genauer: 2,5 … 2,1 … 2,01'],
  [A(9), E(10), 'Von links kommen die Werte von unten. Beide treffen sich bei 2.'],
  [A(11), E(12), 'Ganz zusammen dürfen die Punkte nie – das wäre 0 durch 0.'],
  [A(13), E(15), 'Aber das Ziel steht fest: die Tangente. Ihre Steigung ist die Ableitung.'],
];
export const SUBTITLES = SUB;
