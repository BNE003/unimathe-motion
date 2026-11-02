import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C} from '../theme';
import {sec} from '../math';
import {useTexFonts} from '../fonts';
import {Grain} from '../ui';
import {MUSIC, SCENES, SFX, VOICE} from './timeline';
import {S1, S10, S11, S12, S13, S2, S3, S4, S5, S6, S7, S8, S9} from './scenes';

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
  ['S10', S10],
  ['S11', S11],
  ['S12', S12],
  ['S13', S13],
];

export type VRProps = {music: boolean; voice: boolean};

export const VideoVR: React.FC<VRProps> = ({music, voice}) => {
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
      {music ? <Audio src={staticFile(MUSIC)} volume={voice ? 0.32 : 0.6} /> : null}
      {voice ? <Audio src={staticFile(VOICE)} volume={1} /> : null}
    </AbsoluteFill>
  );
};
