import data from './timeline.json';
import {TimelineData, makeTimeline} from '../timelineKit';

export const {SCENES, SFX, TOTAL, VOICE, MUSIC, cue} = makeTimeline(data as TimelineData);
// Zusätzliche Stille in der Stimme, damit Rechenzeilen stehen bleiben: [Stelle in der Sprachdatei, Länge] in Sekunden
export const VOICE_GAPS = data.voiceGaps as [number, number][];
// Untertitel: [Start, Ende] in Sekunden der Sprachdatei, Text
export const SUBTITLES = data.subtitles as [number, number, string][];
// Zeit in der Sprachdatei → Zeit im Video (eingefügte Stille vor dieser Stelle addieren)
export const voiceToVideo = (s: number) => s + VOICE_GAPS.reduce((acc, [cut, gap]) => (cut < s ? acc + gap : acc), 0);
