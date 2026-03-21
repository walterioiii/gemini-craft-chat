import { useEffect, useRef } from 'react';
import { Sheet, CanvasOrientation } from '@/lib/types';
import { formatInch } from '@/lib/nesting';

const SHEET_W = 48;
const SHEET_H = 96;

interface Props {
  sheet: Sheet;
  orientation: CanvasOrientation;
  zoom: number;
}

export function NestingCanvas({ sheet, orientation, zoom }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isLandscape = orientation === 'landscape';
    const scale = 10 * zoom;
    const canvasW = (isLandscape ? SHEET_H : SHEET_W) * scale;
    const canvasH = (isLandscape ? SHEET_W : SHEET_H) * scale;

    // HiDPI — use 2x for better text rendering
    const dpr = Math.max(2, window.devicePixelRatio || 1);
    canvas.width = canvasW * dpr;
    canvas.height = canvasH * dpr;
    canvas.style.width = canvasW + 'px';
    canvas.style.height = canvasH + 'px';
    ctx.scale(dpr, dpr);

    // Text rendering optimization
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasW, canvasH);

    // No wood grain — clean white background

    // Draw parts
    sheet.parts.forEach(part => {
      let px: number, py: number, pw: number, ph: number;

      if (isLandscape) {
        // Rotate 90°: swap axes
        px = part.y * scale;
        py = part.x * scale;
        pw = part.height * scale;
        ph = part.width * scale;
      } else {
        px = part.x * scale;
        py = part.y * scale;
        pw = part.width * scale;
        ph = part.height * scale;
      }

      // Part fill
      ctx.fillStyle = '#e5e5e5';
      ctx.fillRect(px, py, pw, ph);

      // Border
      ctx.strokeStyle = 'hsl(30, 10%, 25%)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, pw, ph);

      // Labels — scale font with zoom, larger for print
      const minDim = Math.min(pw, ph);
      if (minDim > 30 * zoom) {
        ctx.fillStyle = 'hsl(30, 10%, 10%)';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';

        // Increased base font size for better readability
        const baseFontSize = Math.max(13, Math.min(18, minDim / 4.5));

        // Unit name
        if (ph > 60 * zoom) {
          ctx.font = `bold ${Math.round(baseFontSize * 1.1)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
          ctx.fillText(part.unitName.toUpperCase(), px + 5, py + 4);
        }

        // Part name
        ctx.font = `bold ${Math.round(baseFontSize)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
        const nameY = ph > 60 * zoom ? py + baseFontSize * 2.2 : py + baseFontSize + 2;
        ctx.fillText(part.partName, px + 5, nameY);

        // Dimensions
        ctx.font = `${Math.round(baseFontSize * 0.95)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
        ctx.fillText(
          formatInch(part.width) + ' × ' + formatInch(part.height),
          px + 5,
          nameY + baseFontSize + 3
        );

        // Grain indicator for sides
        if (part.grainAligned) {
          ctx.font = `${Math.round(baseFontSize * 0.85)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
          ctx.fillStyle = 'hsl(30, 10%, 35%)';
          ctx.fillText('↕ grain', px + 5, nameY + baseFontSize * 2 + 5);
        }
      }
    });

    // Sheet border
    ctx.strokeStyle = 'hsl(30, 10%, 20%)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvasW, canvasH);

  }, [sheet, orientation, zoom]);

  return (
    <div className="overflow-auto">
      <canvas
        ref={canvasRef}
        className="rounded border border-border mx-auto block"
      />
    </div>
  );
}
