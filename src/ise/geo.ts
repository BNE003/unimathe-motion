// Geometrie des Graphen (x²): Ursprung, Einheit, sichtbare Bereiche, Stärke der Mengen-Bänder.
export const OX = 540;
export const OY = 1180;
export const U = 90;
export const XR = 4.6; // x-Band von −XR bis XR
export const YT = 5.9; // y-Band oben
export const YB = -2.6; // y-Band unten
export const BAND = 14;
export const XP = 2.42; // Parabel für |x| ≤ XP, also y ≤ 5,86 < YT
export const sx = (x: number) => OX + U * x;
export const sy = (y: number) => OY - U * y;
