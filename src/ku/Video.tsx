import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C} from '../theme';
import {sec} from '../math';
import {useTexFonts} from '../fonts';
import {Grain} from '../ui';
import {MUSIC, SCENES, SFX, VOICE, VOICE_GAPS} from './timeline';
import {S1, S2, S3, S4, S5, S6, S7, S8, S9} from './scenes';
import {Subtitles} from './Subtitles';

const ORDER: [string, React.FC][] = [
  ['S1', S1],
  ['S2', S2],
  ['S3', S3],
  ['S4', S4],
  ['S5', S5],
  ['S6', S6],
  ['S7', S7],
  ['S8', S8],
  ['S9', S9],
];

// Die Sprachdatei in Stücke zwischen den Schnittstellen teilen; jedes Stück startet um die bisher eingefügte Stille später
const cuts = [0, ...VOICE_GAPS.map(([c]) => c), Infinity];
const PIECES = cuts.slice(0, -1).map((from, i) => ({
  from,
  to: cuts[i + 1],
  delay: VOICE_GAPS.slice(0, i).reduce((s, [, g]) => s + g, 0),
}));

export type KUProps = {music: boolean; voice: boolean};

export const VideoKU: React.FC<KUProps> = ({music, voice}) => {
  useTexFonts();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {ORDER.map(([key, Scene]) => (
        <Sequence key={key} name={key} from={sec(SCENES[key].from)} durationInFrames={sec(SCENES[key].dur)}>
          <Scene />
        </Sequence>
      ))}
      <Subtitles />
      <Grain />
      {SFX.map(([key, at, name, vol], i) => (
        <Sequence key={`sfx-${i}`} from={sec(SCENES[key].from + at)} durationInFrames={sec(3.5)} layout="none">
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol * (voice ? 0.55 : 0.8)} />
        </Sequence>
      ))}
      {music ? <Audio src={staticFile(MUSIC)} volume={voice ? 0.32 : 0.6} /> : null}
      {voice
        ? PIECES.map(({from, to, delay}) => (
            <Sequence key={from} from={sec(from + delay)} durationInFrames={Number.isFinite(to) ? sec(to - from) : undefined} layout="none">
              <Audio src={staticFile(VOICE)} trimBefore={sec(from)} trimAfter={Number.isFinite(to) ? sec(to) : undefined} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
