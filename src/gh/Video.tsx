import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import 'katex/dist/katex.min.css';
import {C} from '../theme';
import {F, useTexFonts} from '../fonts';
import {bump, clamp, easeInOutCubic, easeOutExpo, fmtDe, lerp, prog, sec, springOS} from '../math';
import {V3} from '../space';
import {Backdrop, Grain, Mono, Tex, col, useSec} from '../ui';
import {COL, Scene} from './Canvas';
import {areaTo} from './fn';
import {BANDS, BAND_K, BAND_ZC, axisVis, bandLanded, coatX, copies, copyPoint, curveVis, cutGap, project, shiftX, unroll, volumeShown} from './world';
import {CLIPS, MUSIC, SUBTITLES, T, TOTAL, VOICE} from './timeline';

const show = (t: number, at: number, d = 0.4) => easeOutExpo(clamp((t - at) / d));
const hide = (t: number, at: number, d = 0.35) => 1 - easeInOutCubic(clamp((t - at) / d));
const shadow = `0 0 14px ${C.bg}, 0 0 30px ${C.bg}`;
const glowOf = (color: string, g: number) => `0 0 ${12 + 30 * g}px ${color}${g > 0.01 ? 'CC' : '00'}, ${shadow}`;
const de = (x: number, d: number) => fmtDe(x, d).replace(',', '{,}');

/* ---------- Beschriftung an einem Weltpunkt ---------- */

const At: React.FC<{t: number; q: V3; dx?: number; dy?: number; o: number; edgeHide?: boolean; children: React.ReactNode}> = ({t, q, dx = 0, dy = 0, o, edgeHide, children}) => {
  if (o <= 0.01) return null;
  const [x, y] = project(t, q);
  // außerhalb des sicheren Bereichs ausblenden statt am Rand stapeln
  if (edgeHide) o *= clamp((x + dx - 70) / 50) * clamp((950 - x - dx) / 50);
  if (o <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: clamp(x + dx, 80, 900), top: clamp(y + dy, 310, 1420), transform: 'translate(-50%, -50%)', opacity: o, textShadow: shadow, whiteSpace: 'nowrap'}}>
      {children}
    </div>
  );
};

/* ---------- Hook-Zähler, die zur Kopfzeile werden ---------- */

const HEAD_Y = 345;

const Counters: React.FC = () => {
  const t = useSec();
  const k = prog(t, T.wie - 0.05, 0.8);
  const end = hide(t, T.cta - 0.3, 0.4);
  // Volumen
  const vo = show(t, T.trotzdem + 0.2, 0.4) * end;
  const vLock = t >= T.fuellEnde - 0.05;
  const vVal = volumeShown(t);
  const vTex = vLock ? `V=\\pi\\approx 3{,}14\\,\\text{L}` : `V=${de(vVal, 2)}\\,\\text{L}`;
  const vHead = `V=\\pi`;
  const vPulse = bump(t, T.fuellEnde, 0.8) + bump(t, T.genauPi + 0.3, 1.0);
  // Oberfläche
  const ao = show(t, T.aber + 0.2, 0.4) * end;
  const inf = t >= T.unendl;
  const aVal = areaTo(coatX(t));
  const aTex = inf ? `A=\\infty` : `A=${de(aVal, 1)}\\,\\text{dm}^2`;
  const aPulse = bump(t, T.unendl, 0.9) + bump(t, T.nie + 1.0, 1.0);
  const item = (o: number, x0: number, y0: number, x1: number, tex0: string, tex1: string, color: string, pulse: number) =>
    o > 0 ? (
      <div
        style={{
          position: 'absolute',
          left: lerp(x0, x1, k),
          top: lerp(y0, HEAD_Y, k),
          transform: `translate(-50%, -50%) scale(${lerp(1, 0.62, k) * (1 + 0.12 * pulse)})`,
          opacity: o,
          textShadow: glowOf(color, pulse),
          whiteSpace: 'nowrap',
        }}
      >
        <Tex tex={col(color, k > 0.5 ? tex1 : tex0)} size={84} />
      </div>
    ) : null;
  const lo = hide(t, T.trotzdem - 0.1, 0.35);
  return (
    <AbsoluteFill>
      {lo > 0.01 ? (
        <div style={{position: 'absolute', left: 520, top: 470, transform: `translate(-50%, -50%) scale(${1 + 0.08 * bump(t, T.lang, 0.9)})`, opacity: lo, textShadow: glowOf(C.txt, bump(t, T.lang, 0.9)), whiteSpace: 'nowrap'}}>
          <Tex tex={`\\text{Länge}=\\infty`} size={84} />
        </div>
      ) : null}
      {item(vo, 520, 470, 610, vTex, vHead, COL.vol, vPulse)}
      {item(ao, 520, 590, 845, aTex, `A=\\infty`, COL.skin, aPulse)}
      {vo > 0 && k < 1 ? (
        <div style={{position: 'absolute', left: 520, top: 670, transform: 'translate(-50%, -50%)', opacity: vo * (1 - k) * show(t, T.fuellen, 0.4), fontFamily: F.mono, fontSize: 26, color: C.txt2, textShadow: shadow}}>
          1 Einheit = 1 dm
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- Achse, Kurve, Kopie ---------- */

const AxisLabels: React.FC = () => {
  const t = useSec();
  const gap = cutGap(t);
  const o = axisVis(t) * hide(t, T.umfang - 0.2, 0.4);
  const cv = curveVis(t) * hide(t, T.rotiert + 0.6, 0.4);
  return (
    <AbsoluteFill>
      {[1, 2, 4, 8].map((x) => (
        <At key={x} t={t} q={[x + shiftX(x, gap), 0, -1.62]} o={o * (x === 1 ? 1 : show(t, T.schneiden + 0.2 + Math.log2(x) * 0.25, 0.3))}>
          <Tex tex={`${x}`} size={44} />
        </At>
      ))}
      <At t={t} q={[4.6, 0, 1.25]} o={cv}>
        <Tex tex={`f(x)=\\tfrac{1}{x},\\;\\; x\\ge 1`} size={50} />
      </At>
    </AbsoluteFill>
  );
};

const CopyLabels: React.FC = () => {
  const t = useSec();
  const c = copies(t)[0];
  const gap = cutGap(t);
  const o = c.o * hide(t, T.passt - 0.4, 0.3);
  if (o <= 0.01) return null;
  const right = copyPoint(c, gap, [2, 0, 0]);
  return (
    <AbsoluteFill>
      <At t={t} q={right} dx={92} dy={-34} o={o * show(t, T.laenge - 0.2, 0.3)}>
        <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 40, color: C.txt}}>
          Länge <span style={{color: '#DDF8FF'}}>×2</span>
        </div>
      </At>
      <At t={t} q={right} dx={92} dy={30} o={o * show(t, T.dicke - 0.1, 0.3)}>
        <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 40, color: C.txt}}>
          Dicke <span style={{color: '#DDF8FF'}}>×½</span>
        </div>
      </At>
    </AbsoluteFill>
  );
};

/* ---------- Rechenzeile: Faktor · Faktor = Ergebnis ---------- */

const CALC_Y = 1110;

const CalcRow: React.FC<{cols: {tex: string; label: string; at: number; color: string}[]; from: number; to: number; pulseAt: number}> = ({cols, from, to, pulseAt}) => {
  const t = useSec();
  const o = show(t, from, 0.35) * hide(t, to, 0.35);
  if (o <= 0.01) return null;
  const X = [330, 540, 750];
  const pulse = bump(t, pulseAt, 0.9);
  return (
    <AbsoluteFill style={{opacity: o}}>
      {cols.map((c, i) => {
        const p = show(t, c.at, 0.35);
        if (p <= 0) return null;
        const g = i === 2 ? pulse : 0;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: X[i], top: CALC_Y, transform: `translate(-50%, -50%) translateY(${(1 - p) * 16}px) scale(${1 + 0.1 * g})`, opacity: p, textShadow: glowOf(c.color, g)}}>
              <Tex tex={col(c.color, c.tex)} size={70} />
            </div>
            <div style={{position: 'absolute', left: X[i], top: CALC_Y + 74, transform: 'translate(-50%, -50%)', opacity: p * 0.85, fontFamily: F.display, fontWeight: 600, fontSize: 30, color: C.txt2, textShadow: shadow}}>
              {c.label}
            </div>
            {i > 0 ? (
              <div style={{position: 'absolute', left: (X[i - 1] + X[i]) / 2, top: CALC_Y, transform: 'translate(-50%, -50%)', opacity: p, textShadow: shadow}}>
                <Tex tex={i === 1 ? '\\cdot' : '='} size={70} />
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

const VolumeCalc: React.FC = () => (
  <CalcRow
    from={T.halbeDicke + 0.2}
    to={T.piHalbe - 0.25}
    pulseAt={T.halbes + 0.1}
    cols={[
      {tex: '\\tfrac14', label: 'Querschnitt', at: T.viertel, color: COL.vol},
      {tex: '2', label: 'Länge', at: T.malL1 + 0.1, color: C.txt},
      {tex: '\\tfrac12', label: 'Volumen', at: T.halbes, color: COL.vol},
    ]}
  />
);

const SkinCalc: React.FC = () => (
  <CalcRow
    from={T.umfang + 0.1}
    to={T.jedesStueck - 0.2}
    pulseAt={T.malL2 + 0.6}
    cols={[
      {tex: '\\tfrac12', label: 'Umfang', at: T.umfang + 0.5, color: COL.skin},
      {tex: '2', label: 'Länge', at: T.malL2 + 0.1, color: C.txt},
      {tex: '1', label: 'Haut', at: T.malL2 + 0.55, color: COL.skin},
    ]}
  />
);

/* ---------- Volumen-Balken: π/2 + π/4 + π/8 + … = π ---------- */

const BAR = {x0: 150, x1: 930, y: 1196, h: 30};

const VolumeBar: React.FC = () => {
  const t = useSec();
  const o = show(t, T.piHalbe - 0.3, 0.4) * hide(t, T.umfang - 0.1, 0.4);
  if (o <= 0.01) return null;
  const w = BAR.x1 - BAR.x0;
  const v = t >= T.piHalbe - 0.3 ? volumeShown(t) : 0;
  const filled = (v / Math.PI) * w;
  const lock = bump(t, T.genauPi + 0.3, 1.0);
  const segs = [1, 2, 4, 8, 16, 32, 64];
  let acc = 0;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: BAR.x0, top: BAR.y - 56, fontFamily: F.display, fontWeight: 700, fontSize: 34, color: COL.vol, textShadow: shadow}}>Volumen</div>
      <div style={{position: 'absolute', left: BAR.x0, top: BAR.y, width: w, height: BAR.h, borderRadius: 8, border: `2px solid rgba(166,173,211,.45)`, boxSizing: 'border-box'}} />
      <div
        style={{
          position: 'absolute',
          left: BAR.x0,
          top: BAR.y,
          width: filled,
          height: BAR.h,
          borderRadius: 8,
          background: `linear-gradient(90deg, ${C.eig}, #FFD98A)`,
          boxShadow: `0 0 ${18 + 30 * lock}px rgba(255,194,71,${0.35 + 0.4 * lock})`,
        }}
      />
      {/* Grenzen der Stücke π/2, π/4, … */}
      {segs.map((a) => {
        acc += 1 / (2 * a);
        const x = BAR.x0 + acc * w;
        return x <= BAR.x0 + filled + 0.5 ? <div key={a} style={{position: 'absolute', left: x - 1.5, top: BAR.y, width: 3, height: BAR.h, background: C.bg, opacity: 0.85}} /> : null;
      })}
      {[
        {a: 1, at: T.piHalbe},
        {a: 2, at: T.piViertel},
        {a: 4, at: T.piAchtel},
      ].map(({a, at}) => {
        const s = 1 - 1 / a; // Beginn des Stücks im Balken, in Einheiten von π
        const e = 1 - 1 / (2 * a);
        return (
          <div key={a} style={{position: 'absolute', left: BAR.x0 + ((s + e) / 2) * w, top: BAR.y + 74, transform: 'translate(-50%, -50%)', opacity: show(t, at + 0.2, 0.35), textShadow: shadow}}>
            <Tex tex={col(COL.vol, `\\tfrac{\\pi}{${2 * a}}`)} size={52} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: BAR.x0, top: BAR.y + 74, transform: 'translate(-50%, -50%)', opacity: 0.8, textShadow: shadow}}>
        <Tex tex="0" size={44} />
      </div>
      <div style={{position: 'absolute', left: BAR.x1 - 6, top: BAR.y - 36, transform: `translate(-50%, -50%) scale(${1 + 0.25 * lock})`, opacity: show(t, T.zusammen, 0.4), textShadow: glowOf(COL.vol, lock)}}>
        <Tex tex={col(COL.vol, '\\pi')} size={60} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Streifen: jeder über 4, Summe ∞ ---------- */

const BandLabels: React.FC = () => {
  const t = useSec();
  const end = hide(t, T.endlich - 0.3, 0.5);
  return (
    <AbsoluteFill>
      {BANDS.slice(0, 5).map(({a, x0}, i) => {
        const u = unroll(t, i);
        const o = clamp((u.m - 0.75) / 0.25) * u.o * end;
        const xc = x0 + 0.5 * a * BAND_K; // Stelle x = 1,5a im Streifen
        const half = (Math.PI / (1.5 * a)) * BAND_K;
        return (
          <At key={a} t={t} q={[xc, 0, BAND_ZC - half - 0.5]} o={o} edgeHide>
            <Tex tex={col(COL.skin, '>4')} size={40} />
          </At>
        );
      })}
    </AbsoluteFill>
  );
};

const SumRow: React.FC = () => {
  const t = useSec();
  const o = show(t, T.nie + 0.1, 0.4) * hide(t, T.endlich - 0.3, 0.4);
  if (o <= 0.01) return null;
  const n = BANDS.slice(0, 5).filter((_, i) => bandLanded(t, i)).length;
  const inf = t >= T.nie + 1.0;
  const terms = '4+4+4';
  void n;
  const pulse = bump(t, T.nie + 1.0, 1.0);
  return (
    <div style={{position: 'absolute', left: 540, top: 470, transform: `translate(-50%, -50%) scale(${1 + 0.06 * pulse})`, opacity: o, textShadow: glowOf(COL.skin, pulse), whiteSpace: 'nowrap'}}>
      <Tex tex={`A>${terms}+\\dots${inf ? `=${col(COL.inf, '\\infty')}` : ''}`} size={64} />
    </div>
  );
};

/* ---------- Schluss: Name und Formeln ---------- */

const Finale: React.FC = () => {
  const t = useSec();
  const end = hide(t, T.cta - 0.3, 0.4);
  const title = show(t, T.gabriel - 0.1, 0.6) * end;
  if (t < T.endlich) return null;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 540, top: 1196, transform: `translate(-50%, -50%) translateY(${(1 - title) * 20}px)`, opacity: title, fontFamily: F.display, fontWeight: 800, fontSize: 92, letterSpacing: '-.03em', color: C.txt, textShadow: shadow, whiteSpace: 'nowrap'}}>
        Gabriels Horn
      </div>
      <div style={{position: 'absolute', left: 540, top: 1300, transform: 'translate(-50%, -50%)', opacity: show(t, T.gabriel + 0.5, 0.5) * end, textShadow: shadow, whiteSpace: 'nowrap'}}>
        <Tex tex={`${col(COL.vol, 'V')}=\\pi\\int_1^\\infty \\frac{dx}{x^2}=${col(COL.vol, '\\pi')}`} size={50} />
      </div>
      <div style={{position: 'absolute', left: 540, top: 1384, transform: 'translate(-50%, -50%)', opacity: show(t, T.gabriel + 1.0, 0.5) * end, textShadow: shadow, whiteSpace: 'nowrap'}}>
        <Tex tex={`${col(COL.skin, 'A')}\\ge 2\\pi\\int_1^\\infty \\frac{dx}{x}=${col(COL.skin, '\\infty')}`} size={50} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Logo: ab Sekunde 3 dezent, im CTA in die Mitte ---------- */

const LOGO_AT = 3;
const LogoMark: React.FC = () => {
  const t = useSec();
  const a = show(t, LOGO_AT, 0.7);
  if (a <= 0) return null;
  const k = prog(t, T.cta, 0.9);
  const size = lerp(60, 248, k);
  const cx = lerp(72 + 30, 540, k);
  const cy = lerp(HEAD_Y, 700, k);
  const glint = clamp((t - LOGO_AT) / 1.1);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, opacity: a * lerp(0.86, 1, k)}}>
        <Img src={staticFile('unimathe-logo.webp')} style={{width: size, height: size, borderRadius: size * 0.223, boxShadow: `0 ${10 + 20 * k}px ${30 + 60 * k}px rgba(30,139,219,${0.25 + 0.2 * k})`, display: 'block'}} />
        {glint > 0 && glint < 1 ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: size * 0.223,
              background: `linear-gradient(115deg, rgba(255,255,255,0) ${glint * 140 - 40}%, rgba(255,255,255,.55) ${glint * 140 - 20}%, rgba(255,255,255,0) ${glint * 140}%)`,
            }}
          />
        ) : null}
      </div>
      <div style={{position: 'absolute', left: 148, top: HEAD_Y, transform: 'translateY(-50%)', opacity: a * hide(t, T.cta, 0.35) * 0.82, fontFamily: F.display, fontWeight: 700, fontSize: 32, letterSpacing: '-.01em', color: C.txt, textShadow: shadow}}>
        UniMathe
      </div>
    </AbsoluteFill>
  );
};

/* ---------- CTA ---------- */

const Centered: React.FC<{y: number; at: number; size: number; color?: string; weight?: number; children: React.ReactNode}> = ({y, at, size, color = C.txt, weight = 800, children}) => {
  const t = useSec();
  const p = easeOutExpo(clamp((t - at) / 0.5));
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y,
        textAlign: 'center',
        fontFamily: F.display,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: weight >= 800 ? '-.035em' : '-.01em',
        color,
        opacity: p,
        transform: `translateY(${(1 - p) * 24}px)`,
        textShadow: shadow,
      }}
    >
      {children}
    </div>
  );
};

const SearchPill: React.FC = () => {
  const t = useSec();
  const p = springOS(clamp((t - (T.such - 0.1)) / 0.6));
  if (p <= 0) return null;
  const word = 'UniMathe';
  const n = Math.max(0, Math.min(word.length, Math.floor((t - T.tippt - 0.2) / 0.075) + 1));
  const caret = Math.floor(t * 2.2) % 2 === 0 || n < word.length;
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - 300,
        top: 1180,
        width: 600,
        height: 100,
        borderRadius: 999,
        background: 'rgba(243,244,251,.96)',
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        padding: '0 36px',
        boxSizing: 'border-box',
        opacity: clamp(p * 1.4),
        transform: `scale(${0.85 + 0.15 * p})`,
        boxShadow: '0 20px 70px rgba(30,139,219,.35)',
      }}
    >
      <svg width={40} height={40} viewBox="0 0 40 40">
        <circle cx={17} cy={17} r={11} fill="none" stroke={C.bg} strokeWidth={4} />
        <line x1={25} y1={25} x2={35} y2={35} stroke={C.bg} strokeWidth={4} strokeLinecap="round" />
      </svg>
      <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 48, color: C.bg}}>
        {word.slice(0, n)}
        <span style={{opacity: caret ? 1 : 0, color: C.blue, fontWeight: 400}}>|</span>
      </span>
    </div>
  );
};

const Outro: React.FC = () => {
  const t = useSec();
  if (t < T.cta) return null;
  return (
    <AbsoluteFill>
      <Centered y={846} at={T.cta + 0.35} size={104}>
        UniMathe
      </Centered>
      <Centered y={980} at={T.cta + 0.7} size={42} color={C.txt2} weight={600}>
        Mathe verstehen und üben.
      </Centered>
      <Mono x={540} y={1120} at={T.such - 0.2} anchor="center" color={C.txt2}>
        Im App Store suchen
      </Mono>
      <SearchPill />
    </AbsoluteFill>
  );
};

/* ---------- Untertitel, Blitz ---------- */

const CUES = SUBTITLES.map(([a, b, text], i) => {
  const next = SUBTITLES[i + 1] ? SUBTITLES[i + 1][0] - 0.1 : Infinity;
  return {from: a - 0.05, to: Math.min(b + 0.3, next), text};
});

// liegt über der Bildunterschrift von TikTok, Reels und Shorts
const SUB_TOP = 1446;

const Subtitles: React.FC = () => {
  const t = useSec();
  const c = CUES.find(({from, to}) => t >= from && t < to);
  if (!c) return null;
  const o = (t < 0.1 ? 1 : clamp((t - c.from) / 0.12)) * clamp((c.to - t) / 0.12);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: SUB_TOP, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{maxWidth: 800, padding: '8px 18px', borderRadius: 12, background: 'rgba(7,8,26,.62)', fontFamily: F.body, fontWeight: 500, fontSize: 30, lineHeight: 1.3, color: 'rgba(243,244,251,.88)', textAlign: 'center'}}>{c.text}</div>
    </div>
  );
};

const LOCKS = () => copies(0).map((c) => c.lock);
const Flash: React.FC = () => {
  const t = useSec();
  const [l1, l2] = LOCKS();
  const f = Math.max(bump(t, 0, 0.22) * 0.8, bump(t, T.fuellEnde, 0.4) * 0.7, bump(t, T.unendl, 0.42), bump(t, l1, 0.4) * 0.8, bump(t, l2, 0.35) * 0.5, bump(t, T.genauPi + 0.3, 0.4) * 0.7, bump(t, T.nie + 1.0, 0.4) * 0.7, bump(t, T.gabriel, 0.4) * 0.5);
  return f > 0 ? <AbsoluteFill style={{background: C.txt, opacity: 0.1 * f}} /> : null;
};

/* ---------- Ton ---------- */

const [LOCK1, LOCK2] = LOCKS();
const SFX: [number, string, number][] = [
  [0, 'whoosh', 0.5],
  [0, 'accent_small', 0.35],
  [T.trotzdem + 0.3, 'rise', 0.24],
  [T.fuellEnde, 'lock', 0.45],
  [T.aber + 0.2, 'rise', 0.26],
  [T.unendl, 'accent', 0.45],
  [T.wie - 0.05, 'whoosh', 0.3],
  [T.rotiert, 'swell', 0.32],
  [T.schneiden + 0.35, 'tick', 0.32],
  [T.schneiden + 0.6, 'tick', 0.32],
  [T.schneiden + 0.85, 'tick', 0.32],
  [T.zieh, 'whoosh', 0.26],
  [LOCK1, 'lock_hi', 0.45],
  [LOCK2, 'lock', 0.32],
  [T.viertel, 'click', 0.3],
  [T.malL1 + 0.1, 'click', 0.3],
  [T.halbes, 'tick', 0.36],
  [T.piHalbe, 'tick', 0.32],
  [T.piViertel, 'tick', 0.32],
  [T.piAchtel, 'tick', 0.32],
  [T.genauPi + 0.3, 'lock_hi', 0.45],
  [T.umfang + 0.5, 'click', 0.3],
  [T.malL2 + 0.55, 'tick', 0.36],
  [T.jedesStueck - 0.1, 'swell', 0.3],
  [T.nie - 0.1, 'rise', 0.3],
  [T.nie + 1.0, 'accent', 0.42],
  [T.endlich - 0.3, 'whoosh', 0.28],
  [T.gabriel, 'accent_small', 0.4],
  [T.cta - 0.1, 'swell', 0.34],
  ...Array.from({length: 8}, (_, i) => [T.tippt + 0.2 + i * 0.075, 'tick', 0.18] as [number, string, number]),
];

const LEAD = 0.08;
const TAIL = 0.1;

export type GHProps = {music: boolean; voice: boolean};

export const VideoGH: React.FC<GHProps> = ({music, voice}) => {
  useTexFonts();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop gx={520} gy={980} strength={0.85} />
      <Scene />
      <AxisLabels />
      <CopyLabels />
      <VolumeCalc />
      <SkinCalc />
      <VolumeBar />
      <BandLabels />
      <SumRow />
      <Counters />
      <Finale />
      <Outro />
      <LogoMark />
      <Subtitles />
      <Flash />
      <Grain />
      {SFX.map(([at, name, vol], i) => (
        <Sequence key={`sfx-${i}`} from={sec(Math.max(0, at))} durationInFrames={sec(3.5)} layout="none">
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol * (voice ? 0.55 : 0.8)} />
        </Sequence>
      ))}
      {music ? <Audio src={staticFile(MUSIC)} volume={voice ? 0.3 : 0.6} /> : null}
      {voice
        ? CLIPS.map((c) => {
            const lead = Math.min(LEAD, c.from, c.at);
            return (
              <Sequence key={`v${c.i}`} from={sec(c.at - lead)} durationInFrames={sec(c.to - c.from + lead + TAIL)} layout="none">
                <Audio src={staticFile(VOICE)} trimBefore={sec(c.from - lead)} trimAfter={sec(c.to + TAIL)} />
              </Sequence>
            );
          })
        : null}
    </AbsoluteFill>
  );
};

export const TOTAL_GH = TOTAL;
