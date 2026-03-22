import { useState } from 'react';
import { useProject } from '@/hooks/use-project';
import { ProjectSettingsForm } from '@/components/ProjectSettingsForm';
import { CabinetForm } from '@/components/CabinetForm';
import { CabinetList } from '@/components/CabinetList';
import { NestingCanvas } from '@/components/NestingCanvas';
import { CutList } from '@/components/CutList';
import { generateParts, nestParts } from '@/lib/nesting';
import { Cabinet, CanvasOrientation, Sheet } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { LayoutGrid, Printer, ZoomIn } from 'lucide-react';

export default function Index() {
  const {
    cabinets, settings, setSettings,
    addCabinet, updateCabinet, removeCabinet, duplicateCabinet,
  } = useProject();

  const [editingCabinet, setEditingCabinet] = useState<Cabinet | null>(null);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [orientation, setOrientation] = useState<CanvasOrientation>('portrait');
  const [zoom, setZoom] = useState(1);

  function handleGenerate() {
    if (cabinets.length === 0) return;
    const allParts = cabinets.flatMap(c => generateParts(c, settings));
    const nested = nestParts(allParts, settings);
    setSheets(nested);
    setShowResults(true);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Print header */}
      <div className="hidden print-only">
        <h2 className="text-xl font-bold">{settings.name || 'Cabinet Project'}</h2>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      <div className="no-print max-w-6xl mx-auto p-4 md:p-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Cabinet Nester
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track-saw optimized plywood cut layouts
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Left panel — inputs */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <ProjectSettingsForm settings={settings} onChange={setSettings} />
                <div className="border-t pt-4">
                  <CabinetForm
                    onAdd={addCabinet}
                    editingCabinet={editingCabinet}
                    onUpdate={updateCabinet}
                    onCancelEdit={() => setEditingCabinet(null)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <CabinetList
                  cabinets={cabinets}
                  onEdit={setEditingCabinet}
                  onDelete={removeCabinet}
                  onDuplicate={duplicateCabinet}
                />
                {cabinets.length > 0 && (
                  <Button
                    onClick={handleGenerate}
                    className="w-full mt-4"
                    size="lg"
                  >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Generate Nesting
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right panel — results */}
          <div className="space-y-4">
            {showResults && sheets.length > 0 && (
              <>
                {/* Controls bar */}
                <Card>
                  <CardContent className="py-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="rounded-lg bg-primary px-4 py-2 text-primary-foreground font-bold text-sm">
                        {sheets.length} {sheets.length === 1 ? 'SHEET' : 'SHEETS'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs whitespace-nowrap">View</Label>
                        <Select
                          value={orientation}
                          onValueChange={(v) => setOrientation(v as CanvasOrientation)}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="portrait">Portrait</SelectItem>
                            <SelectItem value="landscape">Landscape</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <ZoomIn className="h-3.5 w-3.5 text-muted-foreground" />
                        <Slider
                          value={[zoom]}
                          onValueChange={([v]) => setZoom(v)}
                          min={0.5}
                          max={2}
                          step={0.1}
                          className="w-24"
                        />
                        <span className="text-xs text-muted-foreground w-8">
                          {Math.round(zoom * 100)}%
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.print()}
                    >
                      <Printer className="h-3.5 w-3.5 mr-1" />
                      Print
                    </Button>
                  </CardContent>
                </Card>

                {/* Sheets */}
                {sheets.map((sheet, i) => (
                  <Card key={i} className="sheet-container">
                    <CardContent className="pt-6">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                        Sheet {i + 1} — {sheet.parts.length} parts
                      </h4>
                      <NestingCanvas
                        sheet={sheet}
                        orientation={orientation}
                        zoom={zoom}
                      />
                    </CardContent>
                  </Card>
                ))}

                {/* Cut List */}
                <Card>
                  <CardContent className="pt-6">
                    <CutList cabinets={cabinets} settings={settings} />
                  </CardContent>
                </Card>
              </>
            )}

            {!showResults && (
              <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                <LayoutGrid className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">Add cabinets and generate nesting to see cut layouts</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print view */}
      {showResults && (
        <>
          {sheets.map((sheet, i) => (
            <div key={`print-${i}`} className="hidden print-only sheet-container">
              <h4 className="text-sm font-semibold mb-2">Sheet {i + 1}</h4>
              <NestingCanvas sheet={sheet} orientation="portrait" zoom={1} />
            </div>
          ))}

          {/* Print Cut List */}
          <div className="hidden print-only cutlist-container">
            <CutList cabinets={cabinets} settings={settings} />
          </div>
        </>
      )}
    </div>
  );
}
