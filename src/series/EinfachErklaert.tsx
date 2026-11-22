// Serien-Intro „Mathe 1 einfach erklärt“: Serienzeile ab Frame 0, Titelwörter im Takt der Stimme.
// Die Titelwörter können am Ende in Zielpunkte fliegen (z. B. Status-Chips) oder einfach ausblenden.
// Die Serienzeile bleibt klein stehen, bis `out` erreicht ist. Die mathematische Animation läuft darunter von Sekunde 0 an.
import React from 'react';
import {C} from '../theme';
import {F} from '../fonts';
import {clamp, easeInOutCubic, easeOutExpo, lerp} from '../math';
import {useSec} from '../ui';

export type IntroWord = {text: string; at: number; x: number; to?: [number, number]; toSize?: number};

const shadow = `0 0 14px ${C.bg}, 0 0 30px ${C.bg}`;

export const EinfachErklaert: React.FC<{
  words: IntroWord[];
  fly: number; // Beginn des Flugs bzw. Ausblendens der Titelwörter
  out: number; // Serienzeile blendet aus (z. B. CTA)
  kicker?: string;
  accent?: string;
  y?: number; // Höhe der Serienzeile
  titleY?: number;
  titleSize?: number;
  separator?: string;
}> = ({words, fly, out, kicker = 'MATHE 1 · EINFACH ERKLÄRT', accent = C.eig, y = 330, titleY = 405, titleSize = 54, separator = '·'}) => {
  const t = useSec();
  const kIn = easeOutExpo(clamp((t + 0.12) / 0.35));
  const kOut = 1 - easeInOutCubic(clamp((t - out) / 0.4));
  const line = easeOutExpo(clamp((t - 0.15) / 0.6));
  const kf = easeInOutCubic(clamp((t - fly) / 0.75));
  return (
    <>
      {kOut > 0.01 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: y - 18, textAlign: 'center', opacity: kIn * kOut, transform: `translateY(${(1 - kIn) * -10}px)`}}>
          <div style={{fontFamily: F.mono, fontWeight: 600, fontSize: 28, letterSpacing: '.14em', color: accent, textShadow: shadow}}>{kicker}</div>
          <div style={{margin: '10px auto 0', width: 150 * line, height: 2, borderRadius: 1, background: accent, opacity: 0.7, boxShadow: `0 0 10px ${accent}`}} />
        </div>
      ) : null}
      {kf < 1
        ? words.map((w, i) => {
            const a = easeOutExpo(clamp((t - w.at + 0.05) / 0.35));
            if (a <= 0) return null;
            const to = w.to ?? [w.x, titleY - 30];
            const x = lerp(w.x, to[0], kf);
            const yy = lerp(titleY, to[1], kf);
            const s = lerp(1, (w.toSize ?? titleSize * 0.6) / titleSize, kf);
            const o = a * (w.to ? 1 - easeInOutCubic(clamp((kf - 0.6) / 0.4)) : 1 - kf);
            return (
              <React.Fragment key={i}>
                <div style={{position: 'absolute', left: x, top: yy, transform: `translate(-50%, -50%) translateY(${(1 - a) * 18}px) scale(${s})`, opacity: o, fontFamily: F.display, fontWeight: 800, fontSize: titleSize, letterSpacing: '-.02em', color: C.txt, whiteSpace: 'nowrap', textShadow: shadow}}>
                  {w.text}
                </div>
                {i > 0 ? (
                  <div style={{position: 'absolute', left: (words[i - 1].x + w.x) / 2, top: titleY, transform: 'translate(-50%, -50%)', opacity: a * (1 - kf), fontFamily: F.display, fontWeight: 800, fontSize: titleSize, color: accent}}>{separator}</div>
                ) : null}
              </React.Fragment>
            );
          })
        : null}
    </>
  );
};
