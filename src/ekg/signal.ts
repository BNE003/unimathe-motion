// Das Beispielsignal: ein synthetisches, periodisches EKG (ein Herzschlag = Fenster [0, 1)), N = 1000 Messwerte in mV.
// Dazu die Gewichte in der reellen Schwingungsbasis (Konstante, cos k, sin k für k = 1 … 499, cos(πn)) und Näherungen.

export const N = 1000;

// P, Q, R, S, T als Glockenkurven: [Mitte, Höhe in mV, Breite]
const WAVES: [number, number, number][] = [
  [0.2, 0.12, 0.025],
  [0.36, -0.12, 0.009],
  [0.39, 1.0, 0.011],
  [0.42, -0.25, 0.01],
  [0.65, 0.3, 0.045],
];

// Kontinuierliche Kurve, periodisch mit Periode 1
export const ecg = (x: number) => {
  const u = x - Math.floor(x);
  let v = 0;
  for (const [c, a, w] of WAVES) for (const sh of [-1, 0, 1]) v += a * Math.exp(-((u - c - sh) ** 2) / (2 * w * w));
  return v;
};

// Messwerte s_0 … s_999
export const SAMPLES = Float64Array.from({length: N}, (_, n) => ecg(n / N));

// Gewichte: s = C0 · 1 + Σ (A_k cos(2πkn/N) + B_k sin(2πkn/N)) + A_500 cos(πn)
export const A = new Float64Array(N / 2 + 1);
export const B = new Float64Array(N / 2 + 1);
export const C0 = SAMPLES.reduce((q, v) => q + v, 0) / N;
for (let k = 1; k <= N / 2; k++) {
  let a = 0;
  let b = 0;
  for (let n = 0; n < N; n++) {
    const p = (2 * Math.PI * k * n) / N;
    a += SAMPLES[n] * Math.cos(p);
    b += SAMPLES[n] * Math.sin(p);
  }
  // Normquadrat: N/2 für cos k und sin k, N für die schnellste Schwingung
  const f = k === N / 2 ? 1 / N : 2 / N;
  A[k] = a * f;
  B[k] = k === N / 2 ? 0 : b * f;
}

// Gewicht der Zeile r der reellen Fourier-Matrix (Reihenfolge: 1, cos 1, sin 1, cos 2, sin 2, …, cos 500)
export const weight = (r: number) => {
  if (r === 0) return C0;
  if (r === N - 1) return A[N / 2];
  const k = Math.ceil(r / 2);
  return r % 2 ? A[k] : B[k];
};

// Eintrag der reellen Fourier-Matrix der Größe m (Zeile r, Spalte n)
export const basisEntry = (m: number, r: number, n: number) => {
  if (r === 0) return 1;
  if (r === m - 1) return Math.cos(Math.PI * n);
  const k = Math.ceil(r / 2);
  const p = (2 * Math.PI * k * n) / m;
  return r % 2 ? Math.cos(p) : Math.sin(p);
};

// Schwingung k als Funktion von x ∈ [0, 1)
export const harmonic = (k: number, x: number) =>
  k === 0 ? C0 : A[k] * Math.cos(2 * Math.PI * k * x) + B[k] * Math.sin(2 * Math.PI * k * x);

// Näherung mit allen Schwingungen bis k ≤ K (K darf gebrochen sein: die letzte wird anteilig eingeblendet)
export const partial = (x: number, K: number) => {
  let v = C0;
  const kMax = Math.min(N / 2, Math.ceil(K));
  for (let k = 1; k <= kMax; k++) v += harmonic(k, x) * Math.min(1, K - k + 1);
  return v;
};

// Anzahl der Basisvektoren bis k ≤ K
export const basisCount = (K: number) => (K >= N / 2 ? N : 1 + 2 * Math.floor(K));

// Relative Abweichung |s − s_K| / |s| an den Messpunkten, für ganzzahlige K (lazy)
const errCache = new Map<number, number>();
const NORM = Math.sqrt(SAMPLES.reduce((q, v) => q + v * v, 0));
export const relErr = (K: number) => {
  const k = Math.min(N / 2, Math.floor(K));
  const hit = errCache.get(k);
  if (hit !== undefined) return hit;
  let e = 0;
  for (let n = 0; n < N; n++) e += (partial(n / N, k) - SAMPLES[n]) ** 2;
  const r = Math.sqrt(e) / NORM;
  errCache.set(k, r);
  return r;
};

// Index des R-Gipfels
export const R_PEAK = SAMPLES.reduce((best, v, n) => (v > SAMPLES[best] ? n : best), 0);

/* ---------- Netzbrummen: 50 Schwingungen pro Herzschlag-Fenster (1 s) ---------- */

export const HUM_K = 50;
export const HUM_AMP = 0.045; // mV
const HUM_PH = 0.7;
export const hum = (x: number) => HUM_AMP * Math.cos(2 * Math.PI * HUM_K * x + HUM_PH);
export const noisy = (x: number) => ecg(x) + hum(x);
export const NOISY = Float64Array.from({length: N}, (_, n) => noisy(n / N));

// Stärke (Amplitude) der Welle k im verrauschten Signal; bei k = 50 kommt das Brummen dazu
const HA = HUM_AMP * Math.cos(HUM_PH);
const HB = -HUM_AMP * Math.sin(HUM_PH);
export const ampNoisy = (k: number) => (k === 0 ? Math.abs(C0) : k === HUM_K ? Math.hypot(A[k] + HA, B[k] + HB) : Math.hypot(A[k], B[k]));

// Näherung des verrauschten Signals mit allen Wellen bis k ≤ K; humGain skaliert das Gewicht der Welle 50
export const partialNoisy = (x: number, K: number, humGain = 1) => {
  const v = partial(x, K);
  const w = clampK(K - HUM_K + 1);
  return v + w * humGain * (HA * Math.cos(2 * Math.PI * HUM_K * x) + HB * Math.sin(2 * Math.PI * HUM_K * x));
};
const clampK = (v: number) => Math.min(1, Math.max(0, v));
