import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Weightable } from '@/lib/types/types';

interface CriterionEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; weight: number; isBonus?: boolean }) => void;
  mode: 'add' | 'edit';
  initialData?: Weightable & { excludeFromTotal?: boolean };
}

export const CriterionEditDialog: React.FC<CriterionEditDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  initialData = { title: '', weight: 0.1 }
}) => {
  const memoizedInitialData = React.useMemo(() => ({
    title: initialData.title,
    weight: initialData.weight,
    excludeFromTotal: initialData.excludeFromTotal
}), [initialData.title, initialData.weight, initialData.excludeFromTotal]);
  const [formData, setFormData] = React.useState({
    title: initialData.title,
    weight: initialData.weight,
    isBonus: initialData.excludeFromTotal || false
  });

  React.useEffect(() => {
    setFormData({
      title: memoizedInitialData.title,
      weight: memoizedInitialData.weight,
      isBonus: memoizedInitialData.excludeFromTotal || false
    });
  }, [memoizedInitialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      weight: formData.weight,
      isBonus: formData.isBonus
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add Criterion' : 'Edit Criterion'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Criterion title"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight</Label>
            <Input
              id="weight"
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
              placeholder="Weight"
              step="0.05"
              min="0"
              max="1"
              className="w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isBonus"
              checked={formData.isBonus}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, isBonus: checked === true }))
              }
            />
            <Label 
              htmlFor="isBonus" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Bonus criterion (excluded from total score calculation)
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'add' ? 'Add' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};