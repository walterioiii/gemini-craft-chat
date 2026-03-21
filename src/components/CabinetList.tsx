import { useState } from 'react';
import { Cabinet } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatInch } from '@/lib/nesting';
import { Copy, Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Props {
  cabinets: Cabinet[];
  onEdit: (cabinet: Cabinet) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string, newName: string) => void;
}

export function CabinetList({ cabinets, onEdit, onDelete, onDuplicate }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<Cabinet | null>(null);
  const [dupTarget, setDupTarget] = useState<Cabinet | null>(null);
  const [dupName, setDupName] = useState('');

  if (cabinets.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Cabinets ({cabinets.length})
      </h3>
      <div className="space-y-2">
        {cabinets.map(cab => (
          <div
            key={cab.id}
            className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{cab.name}</p>
              <p className="text-xs text-muted-foreground">
                {cab.qty}× — {formatInch(cab.height)} H × {formatInch(cab.width)} W × {formatInch(cab.depth)} D
                {cab.topStyle === 'full' ? ' · Full top' : ' · Rails'}
              </p>
            </div>
            <div className="flex gap-1 ml-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => onEdit(cab)}
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => { setDupTarget(cab); setDupName(cab.name + ' Copy'); }}
                title="Duplicate"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(cab)}
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the cabinet and all its cut parts from the project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) onDelete(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate dialog */}
      <Dialog open={!!dupTarget} onOpenChange={() => setDupTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate "{dupTarget?.name}"</DialogTitle>
            <DialogDescription>Enter a name for the duplicated cabinet.</DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="dup-name">New Unit Label</Label>
            <Input
              id="dup-name"
              value={dupName}
              onChange={(e) => setDupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && dupTarget) {
                  onDuplicate(dupTarget.id, dupName);
                  setDupTarget(null);
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (dupTarget) onDuplicate(dupTarget.id, dupName);
                setDupTarget(null);
              }}
            >
              Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
