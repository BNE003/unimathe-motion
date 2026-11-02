// Gemeinsamer Aufbau einer Timeline-Datei: Szenen, Wort-Cues (relativ zum Szenenstart), Soundeffekte, Stimme
export type TimelineData = {
  total: number;
  voice: string;
  music: string;
  scenes: Record<string, {from: number; dur: number}>;
  cues: Record<string, Record<string, number>>;
  sfx: [string, number, string, number][];
};

export const makeTimeline = (data: TimelineData) => ({
  SCENES: data.scenes,
  SFX: data.sfx,
  TOTAL: data.total,
  VOICE: data.voice,
  MUSIC: data.music,
  cue: (scene: string, name: string, fallback: number) => data.cues[scene]?.[name] ?? fallback,
});
