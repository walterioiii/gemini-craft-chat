import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cabinet } from '@/lib/types';
import { Plus, Save } from 'lucide-react';

interface Props {
  onAdd: (cabinet: Omit<Cabinet, 'id'>) => void;
  editingCabinet?: Cabinet | null;
  onUpdate?: (id: string, updates: Partial<Cabinet>) => void;
  onCancelEdit?: () => void;
}

export function CabinetForm({ onAdd, editingCabinet, onUpdate, onCancelEdit }: Props) {
  const [name, setName] = useState('');
  const [height, setHeight] = useState('34.5');
  const [width, setWidth] = useState('36');
  const [depth, setDepth] = useState('24');
  const [qty, setQty] = useState('1');
  const [topStyle, setTopStyle] = useState<'rails' | 'full'>('rails');

  useEffect(() => {
    if (editingCabinet) {
      setName(editingCabinet.name);
      setHeight(String(editingCabinet.height));
      setWidth(String(editingCabinet.width));
      setDepth(String(editingCabinet.depth));
      setQty(String(editingCabinet.qty));
      setTopStyle(editingCabinet.topStyle);
    } else {
      setName('');
      setHeight('34.5');
      setWidth('36');
      setDepth('24');
      setQty('1');
      setTopStyle('rails');
    }
  }, [editingCabinet]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const h = parseFloat(height);
    const w = parseFloat(width);
    const d = parseFloat(depth);
    if (!h || !w || !d) return;

    if (editingCabinet && onUpdate) {
      onUpdate(editingCabinet.id, {
        name: name || editingCabinet.name,
        height: h, width: w, depth: d,
        qty: parseInt(qty) || 1,
        topStyle,
      });
      onCancelEdit?.();
    } else {
      onAdd({
        name: name || `Unit ${Date.now().toString(36)}`,
        height: h, width: w, depth: d,
        qty: parseInt(qty) || 1,
        topStyle,
      });
      setName('');
    }
  }

  const isEditing = !!editingCabinet;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {isEditing ? 'Edit Cabinet' : 'Add Cabinet'}
      </h3>
      <div className="grid gap-3">
        <div>
          <Label htmlFor="cab-name">Unit Label</Label>
          <Input
            id="cab-name"
            placeholder="e.g. Sink Base"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="cab-h">Height (H)</Label>
            <Input id="cab-h" type="number" step="0.0625" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="cab-w">Width (W)</Label>
            <Input id="cab-w" type="number" step="0.0625" value={width} onChange={(e) => setWidth(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="cab-d">Depth (D)</Label>
            <Input id="cab-d" type="number" step="0.0625" value={depth} onChange={(e) => setDepth(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="cab-qty">Qty</Label>
            <Input id="cab-qty" type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Top Style</Label>
          <Select value={topStyle} onValueChange={(v) => setTopStyle(v as 'rails' | 'full')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rails">2 Rails (4")</SelectItem>
              <SelectItem value="full">Full Top</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          {isEditing ? <Save className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {isEditing ? 'Save Changes' : 'Add Cabinet'}
        </Button>
        {isEditing && (
          <Button type="button" variant="outline" onClick={onCancelEdit}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
