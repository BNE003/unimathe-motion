import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C} from './theme';
import {sec} from './math';
import {useTexFonts} from './fonts';
import {Grain} from './ui';
import {SCENES, SFX, VOICE} from './timeline';
import {S1, S2, S3, S4, S5, S6, S7, S8, S9} from './scenes/v3';
import {S7a as S10a, S7b as S10b, S8 as S11} from './scenes/outro';

const ORDER: [keyof typeof SCENES, React.FC][] = [
  ['S1', S1],
  ['S2', S2],
  ['S3', S3],
  ['S4', S4],
  ['S5', S5],
  ['S6', S6],
  ['S7', S7],
  ['S8', S8],
  ['S9', S9],
  ['S10a', S10a],
  ['S10b', S10b],
  ['S11', S11],
];

export type VideoProps = {music: boolean; voice: boolean};

export const Video: React.FC<VideoProps> = ({music, voice}) => {
  useTexFonts();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {ORDER.map(([key, Scene]) => (
        <Sequence key={key} name={key} from={sec(SCENES[key].from)} durationInFrames={sec(SCENES[key].dur)}>
          <Scene />
        </Sequence>
      ))}
      <Grain />
      {SFX.map(([key, at, name, vol], i) => (
        <Sequence key={`sfx-${i}`} from={sec(SCENES[key].from + at)} durationInFrames={sec(3.5)} layout="none">
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol * (voice ? 0.55 : 0.8)} />
        </Sequence>
      ))}
      {music ? <Audio src={staticFile('music.wav')} volume={voice ? 0.32 : 0.6} /> : null}
      {voice ? <Audio src={staticFile(VOICE)} volume={1} /> : null}
    </AbsoluteFill>
  );
};
