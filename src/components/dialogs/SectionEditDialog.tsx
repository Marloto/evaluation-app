"use client"

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
import { Weightable } from '@/lib/types/types';

interface SectionEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; weight: number }) => void;
  mode: 'add' | 'edit';
  initialData?: Weightable;
}

export const SectionEditDialog: React.FC<SectionEditDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  initialData = { title: '', weight: 0.1 }
}) => {
  const memoizedInitialData = React.useMemo(() => ({
    title: initialData.title,
    weight: initialData.weight,
}), [initialData.title, initialData.weight]);
  const [formData, setFormData] = React.useState(initialData);

  React.useEffect(() => {
    setFormData(memoizedInitialData);
  }, [memoizedInitialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      weight: formData.weight
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add Section' : 'Edit Section'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Section title"
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
              step="0.1"
              min="0"
              max="1"
              className="w-full"
            />
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