import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, H, MARGIN, W} from '../theme';
import {V2, bump, clamp, easeInCubic, lerp, prog, springOS} from '../math';
import {F} from '../fonts';
import {Backdrop, Hairline, Header, Headline, MatrixView, Mono, useSec} from '../ui';
import {MAT_TL as S6_MATRIX} from './v3';
import {cue} from '../timeline';

// Fenster für die echten App-Screens (Screens bleiben unverändert, nur Ausschnitt und Zoom)
export const WIN = {x: MARGIN, y: 660, w: W - 2 * MARGIN, h: 700};
const SRC = {w: 923, h: 2000};
const SC = 1.1;
const toWin = (p: V2, focus: V2, s = SC): V2 => [WIN.w / 2 + s * (p[0] - focus[0]), WIN.h / 2 + s * (p[1] - focus[1])];

export const ScreenWindow: React.FC<{
  src: string;
  focus: V2;
  opacity: number;
  scale: number;
  dy?: number;
  srcW?: number;
  srcH?: number;
  sc?: number;
  y?: number;
  h?: number;
  children?: React.ReactNode;
}> = ({src, focus, opacity, scale, dy = 0, srcW = SRC.w, srcH = SRC.h, sc = SC, y = WIN.y, h = WIN.h, children}) => (
  <div
    style={{
      position: 'absolute',
      left: WIN.x,
      top: y,
      width: WIN.w,
      height: h,
      borderRadius: 36,
      overflow: 'hidden',
      opacity,
      transform: `translateY(${dy}px) scale(${scale})`,
      boxShadow: '0 40px 120px rgba(30,139,219,.32), 0 0 0 1px rgba(255,255,255,.10)',
      background: '#EAF0FB',
    }}
  >
    <Img
      src={staticFile(src)}
      style={{position: 'absolute', left: WIN.w / 2 - focus[0] * sc, top: h / 2 - focus[1] * sc, width: srcW * sc, height: srcH * sc}}
    />
    {children}
  </div>
);

/* S7a · dieselbe Matrix in UniMathe (Match Cut) */
const FOCUS_E: V2 = [461, 1075];
const MATRIX_SRC: V2 = [488, 1137];
export const S7a: React.FC = () => {
  const t = useSec();
  const bgIn = prog(t, 0, 0.45);
  const winIn = springOS(clamp((t - 0.4) / 0.8));
  const exitAt = cue('S10a', 'exit', 5.4);
  const exit = prog(t, exitAt, 0.5, easeInCubic);
  const [mxw, myw] = toWin(MATRIX_SRC, FOCUS_E);
  const fly = prog(t, 0.3, 0.75);
  const mOut = clamp((t - 1.05) / 0.3);
  const ul = prog(t, cue('S10a', 'einsunddrei', 3.6), 0.5);
  const [u1x, uy] = toWin([268, 1369], FOCUS_E);
  const [u2x] = toWin([445, 1369], FOCUS_E);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: bgIn}}>
        <Backdrop gx={540} gy={1010} strength={0.8} />
      </AbsoluteFill>
      <ScreenWindow src="screen-erklaerung-eigenwerte.webp" focus={FOCUS_E} opacity={clamp((t - 0.4) / 0.3) * (1 - exit)} scale={1 + 0.3 * exit} dy={(1 - winIn) * 90}>
        <div style={{position: 'absolute', left: u1x, top: uy, width: (u2x - u1x) * ul, height: 5, borderRadius: 3, background: C.lam}} />
      </ScreenWindow>
      {mOut < 1 ? (
        <MatrixView
          x={lerp(S6_MATRIX.x, WIN.x + mxw, fly)}
          y={lerp(S6_MATRIX.y, WIN.y + myw, fly)}
          size={lerp(S6_MATRIX.size, 48, fly)}
          opacity={1 - mOut}
          entryColor={fly > 0.6 ? '#1B1D2E' : C.txt}
        />
      ) : null}
      <Header index="10" label="UniMathe" at={0.3} out={exitAt - 0.1} />
      <Headline lines={[[['Genau dieses']], [['Beispiel.', C.txt2]]]} at={0.35} out={exitAt - 0.1} size={104} />
      <Hairline y={560} at={-5} out={exitAt - 0.1} />
    </AbsoluteFill>
  );
};

/* S7b · selbst üben: Aufgabe mit det(A − λI) */
export const S7b: React.FC = () => {
  const t = useSec();
  const enter = prog(t, 0.3, 0.6);
  const pan = prog(t, 0.8, 2.7);
  const focus: V2 = [461, lerp(1235, 1265, pan)];
  const [r1x, r1y] = toWin([76, 1304], focus);
  const [r2x, r2y] = toWin([350, 1376], focus);
  const hl = springOS(clamp((t - cue('S10b', 'schritt', 2.0)) / 0.6));
  return (
    <AbsoluteFill style={{opacity: clamp((t - 0.25) / 0.35)}}>
      <Backdrop gx={540} gy={1010} strength={0.8} />
      <ScreenWindow src="screen-aufgabe-diagonalisierung.webp" focus={focus} opacity={enter} scale={lerp(0.88, 1, enter)}>
        {hl > 0 ? (
          <div
            style={{
              position: 'absolute',
              left: r1x,
              top: r1y,
              width: r2x - r1x,
              height: r2y - r1y,
              borderRadius: 14,
              boxShadow: `inset 0 0 0 4px ${C.lam}`,
              background: 'rgba(255,122,92,.10)',
              opacity: clamp(hl),
              transform: `scale(${1.15 - 0.15 * hl})`,
            }}
          />
        ) : null}
      </ScreenWindow>
      <Header index="10" label="Selbst üben" at={0.35} />
      <Headline lines={[[['Verstanden?', C.txt2]], [['Jetzt selbst lösen.']]]} at={0.4} lineAt={[0.4, 0.75]} size={104} />
      <Hairline y={560} at={0.2} />
    </AbsoluteFill>
  );
};

/* CTA der Serie: Originallogo, Wortmarke, App-Store-Button */
export const CTA: React.FC<{label: string; verstehen: number; loesen: number; pillAt: number}> = ({label, verstehen, loesen, pillAt}) => {
  const t = useSec();
  const sw = prog(t, 0, 0.65);
  const s = lerp(-40, 3100, sw); // Wischen entlang x + y = s
  const reveal = sw < 1 ? `polygon(0px 0px, ${s}px 0px, 0px ${s}px)` : undefined;
  const logo = springOS(clamp((t - 0.45) / 0.8));
  const pill = springOS(clamp((t - pillAt) / 0.7));
  const pulse = bump(t, pillAt + 0.9, 0.6);
  const motif = prog(t, 0.8, 0.8);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: reveal}}>
        <Backdrop gx={540} gy={1500} strength={0.9} />
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <line x1={440} y1={1920} x2={440 + 640 * motif} y2={1920 - 640 * motif} stroke={C.eig} strokeWidth={3} strokeOpacity={0.55} />
        </svg>
        <Mono x={MARGIN} y={236} at={0.4}>
          {label}
        </Mono>
        {logo > 0 ? (
          <Img
            src={staticFile('unimathe-logo.webp')}
            style={{
              position: 'absolute',
              left: MARGIN,
              top: 560,
              width: 280,
              height: 280,
              borderRadius: 62,
              opacity: clamp(logo * 1.4),
              transform: `scale(${0.82 + 0.18 * logo})`,
              transformOrigin: '0% 100%',
              boxShadow: '0 30px 80px rgba(30,139,219,.35)',
            }}
          />
        ) : null}
        <Headline lines={[[['UniMathe']]]} at={0.75} y={900} size={132} />
        <Headline
          lines={[[['Mathe verstehen.', C.txt2]], [['Selbst lösen.']]]}
          at={verstehen}
          lineAt={[verstehen, loesen]}
          y={1062}
          size={62}
          weight={600}
          lineHeight={1.12}
          x={MARGIN}
        />
        {pill > 0 ? (
          <div
            style={{
              position: 'absolute',
              left: MARGIN,
              top: 1280,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 18,
              padding: '26px 40px',
              borderRadius: 999,
              background: C.txt,
              color: C.bg,
              fontFamily: F.display,
              fontWeight: 700,
              fontSize: 44,
              opacity: clamp(pill * 1.4),
              transform: `scale(${(0.85 + 0.15 * pill) * (1 + 0.045 * pulse)})`,
              transformOrigin: '0% 50%',
              boxShadow: `0 0 ${50 * pulse}px rgba(243,244,251,${0.45 * pulse})`,
            }}
          >
            Jetzt im App Store <span style={{fontFamily: F.mono, fontSize: 38, transform: `translateX(${8 * pulse}px)`, display: 'inline-block'}}>→</span>
          </div>
        ) : null}
      </AbsoluteFill>
      {sw > 0 && sw < 1 ? (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <line x1={s} y1={0} x2={0} y2={s} stroke={C.eig} strokeWidth={4} strokeOpacity={0.95} />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

/* S11 (Eigenvektoren) · CTA */
export const S8: React.FC = () => (
  <CTA label="Lineare Algebra · Eigenwerte · Diagonalisierung" verstehen={cue('S11', 'verstehen', 1.0)} loesen={cue('S11', 'loesen', 1.25)} pillAt={cue('S11', 'pill', 1.6)} />
);
