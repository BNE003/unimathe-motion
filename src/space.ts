import {V2} from './math';

// 3D-Hilfen für die Raum-Szenen: Vektoren und eine Orbit-Kamera mit leichter Perspektive
export type V3 = [number, number, number];
export const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sc3 = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// theta = Höhe über der xy-Ebene, phi = Drehung um z (Grad); bei theta 90, phi −90 entspricht das der 2D-Ansicht
export const makeCam = (theta: number, phi: number, cx: number, cy: number, u: number) => {
  const th = (theta * Math.PI) / 180;
  const ph = (phi * Math.PI) / 180;
  const r: V3 = [-Math.sin(ph), Math.cos(ph), 0];
  const up: V3 = [-Math.sin(th) * Math.cos(ph), -Math.sin(th) * Math.sin(ph), Math.cos(th)];
  const fw: V3 = [Math.cos(th) * Math.cos(ph), Math.cos(th) * Math.sin(ph), Math.sin(th)];
  const D = 16;
  return {
    p: (q: V3): V2 => {
      const depth = D - dot3(q, fw);
      const f = (u * D) / depth;
      return [cx + f * dot3(q, r), cy - f * dot3(q, up)];
    },
    depth: (q: V3) => D - dot3(q, fw),
  };
};
export type Cam = ReturnType<typeof makeCam>;
