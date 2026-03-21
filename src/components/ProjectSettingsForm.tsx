import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectSettings } from '@/lib/types';

interface Props {
  settings: ProjectSettings;
  onChange: (settings: ProjectSettings) => void;
}

const THICKNESS_OPTIONS = [
  { value: '0.75', label: '3/4" (0.75)' },
  { value: '0.5', label: '1/2" (0.50)' },
  { value: '0.70866', label: '18mm (~11/16")' },
  { value: '0.47244', label: '12mm (~15/32")' },
];

export function ProjectSettingsForm({ settings, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Project & Material
      </h3>
      <div className="grid gap-3">
        <div>
          <Label htmlFor="proj-name">Project Name</Label>
          <Input
            id="proj-name"
            placeholder="e.g. Unit #402 Island"
            value={settings.name}
            onChange={(e) => onChange({ ...settings, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Plywood Thickness</Label>
            <Select
              value={String(settings.materialThickness)}
              onValueChange={(v) => onChange({ ...settings, materialThickness: parseFloat(v) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THICKNESS_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="frame-depth">Face Frame Depth</Label>
            <Input
              id="frame-depth"
              type="number"
              step="0.01"
              value={settings.frameDepth}
              onChange={(e) => onChange({ ...settings, frameDepth: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
