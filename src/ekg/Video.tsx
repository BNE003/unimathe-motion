// Aha-Video „Was hat dein Herzschlag mit Vektoren zu tun?“: Komposition mit Stimme, Musik und Effekten.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C} from '../theme';
import {useTexFonts} from '../fonts';
import {bump, sec} from '../math';
import {Backdrop, Grain, useSec} from '../ui';
import {Scene} from './Canvas';
import {Overlay} from './Overlay';
import {LogoMark, Outro, Subtitles} from './Hud';
import {CLIPS, MUSIC, T, TOTAL, VOICE, VOICE_READY} from './timeline';
import {FAN, REC} from './world';

const Flash: React.FC = () => {
  const t = useSec();
  const f = Math.max(bump(t, 0, 0.22) * 0.7, bump(t, T.sauber + 0.1, 0.45) * 0.5, bump(t, T.fourier + 0.1, 0.45) * 0.35);
  return f > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.08 * f}} /> : null;
};

const SFX: [number, string, number][] = [
  [0, 'whoosh', 0.35],
  [T.zittert - 0.05, 'click', 0.24],
  [T.steckdose + 0.1, 'buzz', 0.18],
  [T.digital - 0.2, 'whoosh', 0.22],
  [T.liste, 'rise', 0.2],
  [T.vektor, 'whoosh', 0.24],
  [T.vektor + 0.8, 'lock', 0.3],
  [T.jeder + 0.15, 'rise', 0.22],
  [T.stelle, 'click', 0.22],
  [T.zacken + 0.1, 'tick', 0.26],
  [T.basisvektoren + 0.2, 'lock_hi', 0.28],
  [T.brummen + 0.1, 'buzz', 0.2],
  [T.loeschen + 0.2, 'tick', 0.26],
  [T.wellen, 'whoosh', 0.24],
  [FAN.open, 'swell', 0.26],
  ...[T.langsam, T.schneller, T.immer].map((at) => [at, 'tick', 0.22] as [number, string, number]),
  [FAN.close, 'collapse', 0.22],
  [REC.start, 'swell', 0.3],
  [T.zusammen + 0.4, 'lock', 0.3],
  [T.einzige, 'accent_small', 0.32],
  [T.fuenfzig + 0.1, 'buzz', 0.2],
  [T.null + 0.15, 'collapse', 0.26],
  [T.addieren + 0.1, 'rise', 0.24],
  [T.sauber + 0.1, 'lock_hi', 0.36],
  [T.derselbe, 'whoosh', 0.24],
  [T.zweiListen, 'click', 0.24],
  [T.pfeil + 0.1, 'whoosh', 0.2],
  [T.bleibt, 'swell', 0.26],
  [T.zahlen + 1.0, 'lock', 0.28],
  [T.fourier, 'accent', 0.4],
  [T.cta - 0.1, 'whoosh', 0.3],
];

const LEAD = 0.03;
const TAIL = 0.08;

export type EKGProps = {music: boolean; voice: boolean};

export const VideoEKG: React.FC<EKGProps> = ({music, voice}) => {
  useTexFonts();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={540} gy={900} strength={0.85} />
      <Scene />
      <Overlay />
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
      {voice && VOICE_READY
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
