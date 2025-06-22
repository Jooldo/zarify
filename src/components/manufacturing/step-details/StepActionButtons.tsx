
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit3, Play } from 'lucide-react';

interface StepActionButtonsProps {
  isEditMode: boolean;
  onEditClick: () => void;
  onStartNextStep: () => void;
}

export const StepActionButtons: React.FC<StepActionButtonsProps> = ({
  isEditMode,
  onEditClick,
  onStartNextStep,
}) => {
  console.log('StepActionButtons rendered with isEditMode:', isEditMode);

  return (
    <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border">
      <Button
        onClick={() => {
          console.log('Edit Step Details button clicked - calling onEditClick');
          onEditClick();
        }}
        className="flex items-center gap-2"
        variant="default"
        size="sm"
      >
        <Edit3 className="h-4 w-4" />
        Edit Step Details
      </Button>
      <Button
        onClick={() => {
          console.log('Start Next Step button clicked');
          onStartNextStep();
        }}
        className="flex items-center gap-2"
        variant="outline"
        size="sm"
      >
        <Play className="h-4 w-4" />
        Start Next Step
      </Button>
    </div>
  );
};
