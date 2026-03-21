import { Cabinet, CutPart, PlacedPart, Sheet, ProjectSettings } from './types';

const SHEET_W = 48;
const SHEET_H = 96;
const KERF = 0.125;
const SCRIBE = 0.25;

export function formatInch(decimal: number): string {
  if (!decimal && decimal !== 0) return '0"';
  const negative = decimal < 0;
  decimal = Math.abs(decimal);
  let whole = Math.floor(decimal);
  let remainder = decimal - whole;
  let sixteenths = Math.round(remainder * 16);
  if (sixteenths === 16) { whole++; sixteenths = 0; }
  if (sixteenths === 0) return (negative ? '-' : '') + whole + '"';
  const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
  const common = gcd(sixteenths, 16);
  const num = sixteenths / common;
  const den = 16 / common;
  return (negative ? '-' : '') + (whole > 0 ? whole + ' ' : '') + num + '/' + den + '"';
}

export function generateParts(cabinet: Cabinet, settings: ProjectSettings): CutPart[] {
  const THICK = settings.materialThickness;
  const FRAME = settings.frameDepth;
  const sideD = cabinet.depth - FRAME;
  const backW = cabinet.width - (2 * THICK);
  const botD = sideD - THICK - SCRIBE;
  const parts: CutPart[] = [];

  for (let i = 0; i < cabinet.qty; i++) {
    const suffix = cabinet.qty > 1 ? ` #${i + 1}` : '';
    // Sides: grain matters — height should align with 96" side
    parts.push({
      id: crypto.randomUUID(),
      partName: 'Side L',
      unitName: cabinet.name + suffix,
      width: sideD,
      height: cabinet.height,
      color: 'hsl(var(--part-side))',
      grainAligned: true,
    });
    parts.push({
      id: crypto.randomUUID(),
      partName: 'Side R',
      unitName: cabinet.name + suffix,
      width: sideD,
      height: cabinet.height,
      color: 'hsl(var(--part-side))',
      grainAligned: true,
    });
    parts.push({
      id: crypto.randomUUID(),
      partName: 'Back',
      unitName: cabinet.name + suffix,
      width: backW,
      height: cabinet.height,
      color: 'hsl(var(--part-back))',
      grainAligned: false,
    });
    parts.push({
      id: crypto.randomUUID(),
      partName: 'Bottom',
      unitName: cabinet.name + suffix,
      width: backW,
      height: botD,
      color: 'hsl(var(--part-bottom))',
      grainAligned: false,
    });

    if (cabinet.topStyle === 'full') {
      parts.push({
        id: crypto.randomUUID(),
        partName: 'Top',
        unitName: cabinet.name + suffix,
        width: backW,
        height: botD,
        color: 'hsl(var(--part-top))',
        grainAligned: false,
      });
    } else {
      parts.push({
        id: crypto.randomUUID(),
        partName: 'Rail F',
        unitName: cabinet.name + suffix,
        width: backW,
        height: 4,
        color: 'hsl(var(--part-rail))',
        grainAligned: false,
      });
      parts.push({
        id: crypto.randomUUID(),
        partName: 'Rail B',
        unitName: cabinet.name + suffix,
        width: backW,
        height: 4,
        color: 'hsl(var(--part-rail))',
        grainAligned: false,
      });
    }
  }
  return parts;
}

/**
 * Track-saw nesting: groups parts into width-strips along the 96" side.
 * Parts with similar widths share a strip so the track saw fence stays put.
 * Sides are kept with height along 96" for grain direction.
 */
export function nestParts(parts: CutPart[], settings: ProjectSettings): Sheet[] {
  const isRail = (p: CutPart) => /rail/i.test(p.partName);

  // Normalize orientations
  const normalized = parts.map(p => {
    if (p.grainAligned) {
      // Sides: height runs along 96"
      if (p.width > SHEET_W) {
        return { ...p, width: p.height, height: p.width };
      }
      return { ...p };
    }
    // Rails: always orient longer dim as height (along 96")
    if (isRail(p)) {
      if (p.width > p.height) {
        return { ...p, width: p.height, height: p.width };
      }
      return { ...p };
    }
    // Non-grain, non-rail: keep width under 48
    if (p.width > SHEET_W) {
      return { ...p, width: p.height, height: p.width };
    }
    return { ...p };
  });

  // Sort: rails last, then by width descending for track saw grouping
  normalized.sort((a, b) => {
    const aRail = isRail(a) ? 1 : 0;
    const bRail = isRail(b) ? 1 : 0;
    if (aRail !== bRail) return aRail - bRail;
    return b.width - a.width || b.height - a.height;
  });

  // Pack into strips per sheet. Track all sheets' strips for backfilling.
  interface Strip {
    x: number;
    width: number;
    usedHeight: number;
    sheetIndex: number;
  }

  const allSheetParts: PlacedPart[][] = [];
  const allStrips: Strip[] = [];

  function getOrCreateSheet(index: number): PlacedPart[] {
    if (!allSheetParts[index]) {
      allSheetParts[index] = [];
    }
    return allSheetParts[index];
  }

  let currentSheetIndex = 0;

  function getSheetStrips(si: number): Strip[] {
    return allStrips.filter(s => s.sheetIndex === si);
  }

  function nextStripX(si: number): number {
    const ss = getSheetStrips(si);
    if (ss.length === 0) return 0;
    const last = ss[ss.length - 1];
    return last.x + last.width + KERF;
  }

  for (const part of normalized) {
    let placed = false;

    // Try to backfill into ANY existing sheet's strips — prefer strip with most remaining space
    let bestStrip: Strip | null = null;
    let bestRemaining = -1;
    for (const strip of allStrips) {
      if (part.width <= strip.width && strip.usedHeight + part.height <= SHEET_H) {
        const remaining = SHEET_H - (strip.usedHeight + part.height);
        if (remaining > bestRemaining) {
          bestRemaining = remaining;
          bestStrip = strip;
        }
      }
    }
    if (bestStrip) {
      const sheet = getOrCreateSheet(bestStrip.sheetIndex);
      sheet.push({ ...part, x: bestStrip.x, y: bestStrip.usedHeight });
      bestStrip.usedHeight += part.height + KERF;
      placed = true;
    }

    if (placed) continue;

    // Try to start a new strip on any existing sheet that has horizontal room
    for (let si = 0; si <= currentSheetIndex; si++) {
      const nx = nextStripX(si);
      if (nx + part.width <= SHEET_W) {
        const sheet = getOrCreateSheet(si);
        const strip: Strip = { x: nx, width: part.width, usedHeight: part.height + KERF, sheetIndex: si };
        allStrips.push(strip);
        sheet.push({ ...part, x: nx, y: 0 });
        placed = true;
        break;
      }
    }

    if (placed) continue;

    // Need a brand new sheet
    currentSheetIndex = allSheetParts.length;
    getOrCreateSheet(currentSheetIndex);
    const strip: Strip = { x: 0, width: part.width, usedHeight: part.height + KERF, sheetIndex: currentSheetIndex };
    allStrips.push(strip);
    allSheetParts[currentSheetIndex].push({ ...part, x: 0, y: 0 });
  }

  return allSheetParts
    .filter(parts => parts && parts.length > 0)
    .map((parts, i) => ({ parts, index: i }));
}
