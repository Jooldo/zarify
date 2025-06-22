
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

  // Only hide the buttons when in edit mode
  if (isEditMode) {
    console.log('Edit mode is active, hiding action buttons');
    return null;
  }

  return (
    <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border">
      <Button
        onClick={() => {
          console.log('Edit Step Details button clicked');
          onEditClick();
        }}
        className="flex items-center gap-2"
        variant="default"
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
      >
        <Play className="h-4 w-4" />
        Start Next Step
      </Button>
    </div>
  );
};
