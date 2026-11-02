import data from './timeline.json';
import {TimelineData, makeTimeline} from '../timelineKit';

export const {SCENES, SFX, TOTAL, VOICE, MUSIC, cue} = makeTimeline(data as TimelineData);
