import data from './timeline.json';

// Szenen, Wort-Cues und Soundeffekte in Sekunden (Cues relativ zum Szenenstart, aus der ElevenLabs-Spur)
export type SceneKey = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9' | 'S10a' | 'S10b' | 'S11';
export const SCENES = data.scenes as Record<SceneKey, {from: number; dur: number}>;
export const SFX = data.sfx as [SceneKey, number, string, number][];
export const TOTAL: number = data.total;
export const VOICE: string = data.voice;
const CUES = data.cues as Partial<Record<SceneKey, Record<string, number>>>;

export const cue = (scene: SceneKey, name: string, fallback: number) => CUES[scene]?.[name] ?? fallback;
