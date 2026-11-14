// Formeln und Beschriftungen über dem Canvas.
import React from 'react';
import {C} from '../theme';
import {F} from '../fonts';
import {bump, clamp, easeInOutCubic, easeOutExpo, prog} from '../math';
import {Tex, col, useSec} from '../ui';
import {END, T} from './timeline';
import {HUM_K, NOISY, ampNoisy} from './signal';
import {COLUMN, MARKED, lensStemX} from './Canvas';
import {K, LENS1, LENS2, N0, REC, STRIP, X0, X1, ex, ey, kAt, pe, turn, vis} from './world';

const shadow = `0 0 14px ${C.bg}, 0 0 30px ${C.bg}`;
const show = (t: number, at: number, d = 0.4) => easeOutExpo(clamp((t - at) / d));
const hide = (t: number, at: number, d = 0.35) => 1 - easeInOutCubic(clamp((t - at) / d));
const de = (v: number, d = 2) => {
  const s = Math.abs(v).toFixed(d).replace('.', '{,}');
  return v < -0.5 * 10 ** -d ? `-${s}` : s;
};
const deTxt = (v: number, d = 2) => {
  const s = Math.abs(v).toFixed(d).replace('.', ',');
  return v < -0.5 * 10 ** -d ? `−${s}` : s;
};

// Formel, mittig an (x, y), mit Ein- und Ausblenden
const At: React.FC<{tex: string; x: number; y: number; size: number; a: number; glow?: number; color?: string; anchor?: 'center' | 'left' | 'right'; dy?: number}> = ({
  tex,
  x,
  y,
  size,
  a,
  glow = 0,
  color = C.txt,
  anchor = 'center',
  dy = 0,
}) => {
  if (a <= 0.005) return null;
  const tx = anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + dy,
        transform: `translate(${tx}, -50%) scale(${1 + 0.1 * glow})`,
        transformOrigin: anchor === 'center' ? '50% 50%' : anchor === 'left' ? '0 50%' : '100% 50%',
        opacity: a,
        whiteSpace: 'nowrap',
        textShadow: glow > 0.02 ? `0 0 ${10 + 24 * glow}px ${color}, ${shadow}` : shadow,
      }}
    >
      <Tex tex={tex} size={size} style={{color}} />
    </div>
  );
};

// Kurzer Text (Inter oder Mono)
const Label: React.FC<{x: number; y: number; a: number; size?: number; color?: string; mono?: boolean; anchor?: 'center' | 'left' | 'right'; weight?: number; children: React.ReactNode}> = ({
  x,
  y,
  a,
  size = 26,
  color = C.txt2,
  mono = false,
  anchor = 'center',
  weight = 600,
  children,
}) => {
  if (a <= 0.005) return null;
  const tx = anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${tx}, -50%)`,
        opacity: a,
        whiteSpace: 'nowrap',
        fontFamily: mono ? F.mono : F.body,
        fontWeight: mono ? 500 : weight,
        fontSize: size,
        letterSpacing: mono ? '.06em' : '-.005em',
        textTransform: mono ? 'uppercase' : 'none',
        color,
        textShadow: shadow,
      }}
    >
      {children}
    </div>
  );
};

// Zustände, die ineinander überblenden (Text rollt nach oben aus und von unten ein)
const Roll: React.FC<{t: number; states: [number, string][]; x: number; y: number; size: number; a: number; glow?: number}> = ({t, states, x, y, size, a, glow = 0}) => {
  let k = -1;
  states.forEach(([at], i) => {
    if (t >= at) k = i;
  });
  if (k < 0) return null;
  const p = easeInOutCubic(clamp((t - states[k][0]) / 0.4));
  const off = size * 0.5;
  return (
    <>
      {k > 0 && p < 1 ? <At tex={states[k - 1][1]} x={x} y={y} size={size} a={a * clamp(1 - 1.6 * p)} dy={-p * off} /> : null}
      <At tex={states[k][1]} x={x} y={y} size={size} a={a * (k > 0 ? clamp(1.6 * p - 0.6) : show(t, states[0][0]))} dy={k > 0 ? (1 - p) * off : 0} glow={glow} />
    </>
  );
};

// Spaltenvektor aus Einzelteilen: Einträge und Klammern
const Column: React.FC<{x: number; ys: number[]; texs: string[]; size: number; a: number; w: number; color?: string}> = ({x, ys, texs, size, a, w, color = C.txt}) => {
  if (a <= 0.005) return null;
  const top = ys[0] - size * 0.75;
  const bot = ys[ys.length - 1] + size * 0.75;
  const h = bot - top;
  return (
    <>
      <svg width={w} height={h} style={{position: 'absolute', left: x - w / 2, top, overflow: 'visible', opacity: a}}>
        <path d={`M 14 2 Q -2 ${h / 2} 14 ${h - 2}`} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
        <path d={`M ${w - 14} 2 Q ${w + 2} ${h / 2} ${w - 14} ${h - 2}`} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
      </svg>
      {texs.map((tx, i) => (
        <At key={i} tex={tx} x={x} y={ys[i]} size={size} a={a} />
      ))}
    </>
  );
};

const CY = col(K.sig, 's');

export const Overlay: React.FC = () => {
  const t = useSec();

  /* Hook */
  const humLbl = vis.lens1(t) * show(t, T.steckdose + 0.1);

  /* Messwerte */
  const idxA = show(t, T.liste) * hide(t, T.jeder);
  const countA = show(t, T.tausend - 0.1) * hide(t, T.jeder);
  const colA = vis.column(t);
  const colYs = Array.from({length: 9}, (_, i) => COLUMN.y0 + i * 45);
  const colTex = colYs.map((_, i) => (i % 2 ? '\\vdots' : col(K.imp, de(NOISY[MARKED[i / 2]]))));
  const rA = colA * show(t, T.vektor + 0.7, 0.5);

  /* Zacken */
  const l2 = vis.lens2(t);
  const formA = show(t, T.basisvektoren - 0.1) * hide(t, T.brummen);
  const mid = (LENS2.n - 1) / 2;
  const midTop = LENS2.base - NOISY[N0] * LENS2.gain;
  const fixA = l2 * show(t, T.loeschen + 0.6) ;

  /* Wellen */
  const recA = vis.rec(t);
  const Kc = kAt(t);
  const cntA = recA * show(t, REC.start + 0.1) * hide(t, T.liste2);
  const stripA = vis.strip(t);
  const bw = (X1 - X0) / (STRIP.kMax + 1);
  const humX = X0 + (HUM_K + 0.5) * bw;
    const humTag = stripA * show(t, T.einzige - 0.1);
  const humWave = recA * show(t, T.fuenfzig) * hide(t, T.null + 0.2);
  const saubA = recA * show(t, T.sauber + 0.1) * hide(t, T.derselbe);

  /* Auflösung */
  const fin = show(t, T.derselbe + 0.2, 0.6) * hide(t, T.cta, 0.4);
  const arrowsA = fin * show(t, T.zweiListen);
  const banner = fin * show(t, T.fourier, 0.5);
  const plA = vis.plane(t);
  const before = plA * show(t, T.pfeil + 0.7) * hide(t, T.bleibt - 0.1, 0.3);
  const after = plA * show(t, T.zahlen + 1.0);

  return (
    <>
      {/* Hook: Lupe */}
      <Label x={LENS1.cx} y={LENS1.cy + LENS1.r + 34} a={humLbl} mono size={22} color={K.err}>
        Netzbrummen · 50 Hz
      </Label>

      {/* Messwerte */}
      <Label x={ex(0)} y={872} a={idxA} mono size={20} anchor="left">
        n = 0
      </Label>
      <Label x={ex(0.999)} y={872} a={idxA} mono size={20} anchor="right">
        n = 999
      </Label>
      <Label x={930} y={430} a={countA} size={34} color={C.txt} weight={700} anchor="right">
        1000 Messwerte
      </Label>
      <At tex={`${CY} =`} x={COLUMN.x - 170} y={(COLUMN.y0 + COLUMN.y1) / 2} size={46} a={colA} />
      <Column x={COLUMN.x} ys={colYs} texs={colTex} size={34} a={colA} w={150} />
      {MARKED.map((n, i) => (
        <At key={n} tex={`s_{${n}}`} x={COLUMN.x - 88} y={colYs[i * 2]} a={colA * 0.75} size={26} anchor="right" color={C.txt2} />
      ))}
      <At tex={`\\in \\mathbb{R}^{1000}`} x={COLUMN.x + 100} y={(COLUMN.y0 + COLUMN.y1) / 2} size={50} a={rA} anchor="left" glow={bump(t, T.vektor + 0.9, 0.8)} />

      {/* Zacken */}
      <At
        tex={`${CY} = s_0\\cdot${col(K.imp, '\\text{Zacke}_0')} + s_1\\cdot${col(K.imp, '\\text{Zacke}_1')} + \\dots + s_{999}\\cdot${col(K.imp, '\\text{Zacke}_{999}')}`}
        x={540}
        y={912}
        size={34}
        a={formA}
        glow={bump(t, T.basisvektoren + 0.3, 0.9)}
      />
      <At tex={`s_{${N0}}\\cdot${col(K.imp, '\\text{Zacke}_{' + N0 + '}')}`} x={lensStemX(mid) + 22} y={midTop - 36} size={28} a={l2 * show(t, T.zacken + 0.1) * hide(t, T.brummen)} anchor="left" />
      <Label x={LENS2.cx} y={LENS2.cy + LENS2.r + 26} a={l2 * show(t, T.brummen + 0.2)} mono size={20} color={K.err}>
        rote Spitzen = Brummen
      </Label>
      <Label x={540} y={930} a={fixA} size={30} color={C.txt} weight={700}>
        1 Zacke repariert – 999 zittern weiter
      </Label>

      {/* Wellen */}
      <Label x={930} y={562} a={recA * bump(t, T.langsam, 1.0)} mono size={20} anchor="right" color={K.wave2}>
        langsam
      </Label>
      <Label x={930} y={822} a={recA * bump(t, T.schneller, 1.0)} mono size={20} anchor="right" color={K.wave2}>
        schneller
      </Label>
      <Label x={930} y={1212} a={recA * bump(t, T.immer, 1.0)} mono size={20} anchor="right" color={K.wave}>
        immer schneller
      </Label>
      <Label x={930} y={420} a={cntA} size={30} anchor="right" color={C.txt} weight={700}>
        {`${Math.max(1, Math.min(60, Math.ceil(Kc)))} Wellen`}
      </Label>
      <Label x={X0} y={STRIP.y + 28} a={stripA} mono size={18} anchor="left">
        langsam
      </Label>
      <Label x={X1} y={STRIP.y + 28} a={stripA} mono size={18} anchor="right">
        schnell
      </Label>
      <Label x={540} y={STRIP.y + 62} a={stripA} mono size={20} color={K.wave}>
        Gewicht jeder Welle
      </Label>
      <Label x={humX} y={STRIP.y - ampNoisy(HUM_K) * STRIP.gain - 30} a={humTag} size={26} color={K.err} weight={700}>
        {t > T.null + 0.3 ? 'Brummen → 0' : 'Brummen'}
      </Label>
      <Label x={humX} y={STRIP.y + 28} a={humTag} mono size={18} color={K.err}>
        50
      </Label>
      <Label x={540} y={1078} a={humWave} mono size={22} color={K.err}>
        50 Schwingungen pro Sekunde
      </Label>
      <Label x={930} y={420} a={saubA} size={32} anchor="right" color={K.sig} weight={700}>
        ✓ sauber
      </Label>

      {/* Auflösung: zwei Listen */}
      <ListCard cx={285} a={fin} color={K.imp} title="Zacken" sub="1000 Messwerte" tex={`${CY} = \\sum_n s_n\\cdot${col(K.imp, '\\text{Zacke}_n')}`} glow={bump(t, T.basiswechsel + 0.3, 1)} />
      <ListCard cx={775} a={fin} color={K.wave} title="Wellen" sub="1000 Gewichte" tex={`${CY} = \\sum_k c_k\\cdot${col(K.wave, '\\text{Welle}_k')}`} glow={bump(t, T.basiswechsel + 0.6, 1)} />
      <Label x={530} y={812} a={arrowsA} size={48} color={C.txt}>
        ⇄
      </Label>
      <Label x={540} y={985} a={banner} size={38} color={C.txt} weight={800}>
        Fourier-Transformation = Basiswechsel
      </Label>
      <Chip x={790} y={1150} a={before} color={K.imp} label="Koordinaten" value="(3 | 1)" />
      <Chip x={790} y={1150} a={after} color={K.wave} label="Koordinaten" value="(1 | 2)" glow={bump(t, T.zahlen + 1.2, 1)} />
      <Label x={pe([3, 1])[0] + 18} y={pe([3, 1])[1] - 22} a={plA * show(t, T.pfeil + 0.4)} size={26} color={K.sig} weight={700} anchor="left">
        derselbe Pfeil
      </Label>
    </>
  );
};

const Chip: React.FC<{x: number; y: number; a: number; color: string; label: string; value: string; glow?: number}> = ({x, y, a, color, label, value, glow = 0}) => {
  if (a <= 0.005) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${1 + 0.08 * glow})`,
        opacity: a,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 16px',
        borderRadius: 16,
        background: 'rgba(12,12,36,.82)',
        border: `2px solid ${color}`,
        boxShadow: glow > 0.02 ? `0 0 ${20 * glow}px ${color}` : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{fontFamily: F.mono, fontSize: 16, letterSpacing: '.06em', textTransform: 'uppercase', color}}>{label}</span>
      <span style={{fontFamily: F.body, fontWeight: 700, fontSize: 30, color: C.txt}}>{value}</span>
    </div>
  );
};

// Eine der beiden Listen desselben Vektors
const ListCard: React.FC<{cx: number; a: number; color: string; title: string; sub: string; tex: string; glow: number}> = ({cx, a, color, title, sub, tex, glow}) => {
  if (a <= 0.005) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - 165,
        top: 705,
        width: 330,
        height: 215,
        borderRadius: 22,
        background: 'rgba(12,12,36,.82)',
        border: `2px solid ${color}`,
        boxShadow: glow > 0.02 ? `0 0 ${30 * glow}px ${color}` : 'none',
        opacity: a,
      }}
    >
      <div style={{position: 'absolute', left: 0, right: 0, top: 18, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 34, color}}>{title}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 64, textAlign: 'center', fontFamily: F.mono, fontSize: 18, letterSpacing: '.06em', textTransform: 'uppercase', color: C.txt2}}>{sub}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', whiteSpace: 'nowrap'}}>
        <Tex tex={tex} size={29} />
      </div>
    </div>
  );
};

void ey;
void turn;
