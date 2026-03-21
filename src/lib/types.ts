export interface Cabinet {
  id: string;
  name: string;
  height: number;
  width: number;
  depth: number;
  qty: number;
  topStyle: 'rails' | 'full';
}

export interface ProjectSettings {
  name: string;
  materialThickness: number;
  frameDepth: number;
}

export interface CutPart {
  id: string;
  partName: string;
  unitName: string;
  width: number;   // dimension along 48" (cross-cut)
  height: number;   // dimension along 96" (rip-cut)
  color: string;
  grainAligned: boolean; // true for sides where grain runs along 96"
}

export interface PlacedPart extends CutPart {
  x: number;
  y: number;
}

export interface Sheet {
  parts: PlacedPart[];
  index: number;
}

export type CanvasOrientation = 'portrait' | 'landscape';
