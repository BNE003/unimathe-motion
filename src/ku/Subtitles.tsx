import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp} from '../math';
import {F} from '../fonts';
import {useSec} from '../ui';
import {SUBTITLES, voiceToVideo} from './timeline';

// Dezente Untertitel: kleine Schrift, halbtransparente Fläche, unten über der Plattform-UI
const CUES = SUBTITLES.map(([a, b, text], i) => {
  const from = voiceToVideo(a) - 0.05;
  const next = SUBTITLES[i + 1] ? voiceToVideo(SUBTITLES[i + 1][0]) - 0.1 : Infinity;
  return {from, to: Math.min(voiceToVideo(b) + 0.35, next), text};
});

export const Subtitles: React.FC = () => {
  const t = useSec();
  const c = CUES.find(({from, to}) => t >= from && t < to);
  if (!c) return null;
  const o = clamp((t - c.from) / 0.12) * clamp((c.to - t) / 0.12);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 300, display: 'flex', justifyContent: 'center', opacity: o}}>
        <div
          style={{
            maxWidth: 780,
            padding: '8px 18px',
            borderRadius: 12,
            background: 'rgba(7,8,26,.55)',
            fontFamily: F.body,
            fontWeight: 500,
            fontSize: 32,
            lineHeight: 1.3,
            color: 'rgba(243,244,251,.85)',
            textAlign: 'center',
          }}
        >
          {c.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
