
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useCatalogues } from '@/hooks/useCatalogues';

interface EditCatalogueDialogProps {
  catalogue: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditCatalogueDialog = ({ catalogue, open, onOpenChange }: EditCatalogueDialogProps) => {
  const { updateCatalogue, isUpdating } = useCatalogues();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cover_image_url: '',
    is_active: true,
  });

  useEffect(() => {
    if (catalogue && open) {
      setFormData({
        name: catalogue.name || '',
        description: catalogue.description || '',
        cover_image_url: catalogue.cover_image_url || '',
        is_active: catalogue.is_active ?? true,
      });
    }
  }, [catalogue, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !catalogue) {
      return;
    }

    try {
      await updateCatalogue(catalogue.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        cover_image_url: formData.cover_image_url.trim() || undefined,
        is_active: formData.is_active,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating catalogue:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Catalogue</DialogTitle>
          <DialogDescription>
            Update your catalogue information and settings.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Catalogue Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g. Summer Collection 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of your catalogue"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image_url">Cover Image URL</Label>
            <Input
              id="cover_image_url"
              type="url"
              value={formData.cover_image_url}
              onChange={(e) => handleInputChange('cover_image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Active (visible to customers)</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating || !formData.name.trim()}>
              {isUpdating ? 'Updating...' : 'Update Catalogue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCatalogueDialog;
