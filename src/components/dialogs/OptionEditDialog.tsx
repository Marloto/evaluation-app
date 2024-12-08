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
import { Textarea } from "@/components/ui/textarea"
import { Option } from '@/lib/types/types';

interface OptionEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { text: string; score: number }) => void;
  mode: 'add' | 'edit';
  initialData?: Option;
}

export const OptionEditDialog: React.FC<OptionEditDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  initialData = { text: '', score: 1 }
}) => {
  const memoizedInitialData = React.useMemo(() => ({
    text: initialData.text,
    score: initialData.score
}), [initialData.text, initialData.score]);
  const [formData, setFormData] = React.useState(initialData);

  React.useEffect(() => {
    setFormData(memoizedInitialData);
  }, [memoizedInitialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      text: formData.text,
      score: formData.score
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add Option' : 'Edit Option'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">Text</Label>
            <Textarea
              id="text"
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Option text"
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="score">Score</Label>
            <Input
              id="score"
              type="number"
              value={formData.score}
              onChange={(e) => setFormData(prev => ({ ...prev, score: parseInt(e.target.value, 10) }))}
              placeholder="Score"
              step="1"
              min="1"
              max="5"
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