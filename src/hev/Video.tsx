// How-to „So berechnest du Eigenvektoren einer 3×3-Matrix“: Komposition mit Stimme, Musik und Effekten.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C} from '../theme';
import {useTexFonts} from '../fonts';
import {bump, sec} from '../math';
import {Backdrop, Grain, useSec} from '../ui';
import {Scene} from './Canvas';
import {useTexReady} from './kit';
import {Header, LogoMark, MiniA, Outro, Rail, Recipe, Subtitles} from './Hud';
import {EQ1, EV_FLY, LAND, OP1, OP3, RES1, RES3, SCALE, STRIKE, SUB1, SUB3, SWAP, Work, landAt} from './Work';
import {STAGE1, STAGE2, SWEEP1, SWEEP_S, SWEEP_T, TRIPLE} from './world';
import {CLIPS, MUSIC, T, TOTAL, VOICE} from './timeline';

const Flash: React.FC = () => {
  const t = useSec();
  const f = Math.max(bump(t, 0, 0.22) * 0.7, bump(t, T.ebene, 0.4) * 0.5, bump(t, TRIPLE[0] + TRIPLE[1], 0.35) * 0.4);
  return f > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.08 * f}} /> : null;
};

const SFX: [number, string, number][] = [
  [0, 'whoosh', 0.4],
  ...[0, 1, 2, 3].map((n) => [T.vier - 0.15 + 0.17 * n, 'tick', 0.26] as [number, string, number]),
  [T.av - 0.05, 'click', 0.24],
  [T.umgestellt + 0.15, 'whoosh', 0.2],
  [T.aMinus + 0.05, 'whoosh', 0.2],
  ...LAND.map((a) => [a - 0.03, 'tick', 0.28] as [number, string, number]),
  [T.singulaer - 0.55, 'click', 0.22],
  [T.determinante, 'lock', 0.34],
  [T.entwickle - 0.45, 'whoosh', 0.24],
  [STRIKE, 'click', 0.24],
  [T.drei + 0.5, 'tick', 0.26],
  [T.malZwei + 0.5, 'tick', 0.26],
  [T.minusEins + 0.5, 'tick', 0.26],
  [T.nichtAus - 0.05, 'accent_small', 0.3],
  [T.einsMinus + 0.6, 'lock', 0.3],
  [T.ew1 - 0.08, 'lock_hi', 0.34],
  [T.ew3 - 0.05, 'lock_hi', 0.34],
  [T.doppelt, 'accent_small', 0.3],
  [EV_FLY[0], 'whoosh', 0.26],
  [SUB1, 'tick', 0.24],
  [RES1, 'click', 0.26],
  [OP1.down1, 'whoosh', 0.18],
  [OP1.down2, 'whoosh', 0.18],
  ...[0, 1, 2].map((j) => [OP1.resAt[j], 'tick', 0.24] as [number, string, number]),
  [landAt(OP1, 2), 'lock', 0.28],
  [SCALE + 0.3, 'click', 0.24],
  [SWAP[0], 'whoosh', 0.2],
  [EQ1 + 0.1, 'lock', 0.26],
  [T.spalteY + 0.25, 'accent_small', 0.3],
  [T.regler - 0.1, 'rise', 0.22],
  [STAGE1[0], 'swell', 0.28],
  [SWEEP1[0], 'rise', 0.24],
  [T.gerade + 0.1, 'lock_hi', 0.32],
  [T.l3 - 0.75, 'whoosh', 0.26],
  [SUB3, 'tick', 0.24],
  [RES3, 'click', 0.26],
  [OP3.down1, 'whoosh', 0.18],
  [OP3.down2, 'whoosh', 0.18],
  ...[0, 1, 2].map((j) => [OP3.resAt[j], 'tick', 0.24] as [number, string, number]),
  [landAt(OP3, 2), 'lock', 0.28],
  [T.xGleichY + 0.05, 'click', 0.26],
  [T.zweiRegler - 0.2, 'rise', 0.22],
  [T.eigene - 0.35, 'tick', 0.26],
  [T.eigene + 0.45, 'tick', 0.26],
  [T.linear - 0.05, 'lock_hi', 0.32],
  [STAGE2[0], 'swell', 0.3],
  [SWEEP_S[0], 'rise', 0.22],
  [SWEEP_T[0], 'rise', 0.24],
  [T.ebene, 'accent', 0.42],
  [TRIPLE[0], 'rise', 0.26],
  [TRIPLE[0] + TRIPLE[1] - 0.03, 'lock', 0.32],
  [T.entscheidet - 0.1, 'click', 0.24],
  [T.rezept, 'swell', 0.3],
  [T.cta - 0.1, 'whoosh', 0.3],
  ...Array.from({length: 8}, (_, i) => [T.tippt + 0.2 + i * 0.075, 'tick', 0.18] as [number, string, number]),
];

const LEAD = 0.03;
const TAIL = 0.08;

export type HEVProps = {music: boolean; voice: boolean};

export const VideoHEV: React.FC<HEVProps> = ({music, voice}) => {
  useTexFonts();
  useTexReady();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={1050} strength={0.85} />
      <Scene />
      <Work />
      <Recipe />
      <Header />
      <MiniA />
      <Rail />
      <Outro />
      <LogoMark />
      <Subtitles />
      <Flash />
      <Grain />
      {SFX.map(([at, name, vol], i) => (
        <Sequence key={`sfx-${i}`} from={sec(Math.max(0, at))} durationInFrames={sec(3.5)} layout="none">
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol * (voice ? 0.5 : 0.8)} />
        </Sequence>
      ))}
      {music ? <Audio src={staticFile(MUSIC)} volume={voice ? 0.3 : 0.6} /> : null}
      {voice
        ? CLIPS.map((c, i) => {
            const lead = Math.min(LEAD, c.from, c.at);
            return (
              <Sequence key={i} from={sec(c.at - lead)} durationInFrames={sec(c.to - c.from + lead + TAIL)} layout="none">
                <Audio src={staticFile(VOICE)} trimBefore={sec(c.from - lead)} trimAfter={sec(c.to + TAIL)} />
              </Sequence>
            );
          })
        : null}
    </AbsoluteFill>
  );
};

export {TOTAL};
