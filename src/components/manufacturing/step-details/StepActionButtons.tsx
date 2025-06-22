
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
  console.log('🔘 StepActionButtons rendered with isEditMode:', isEditMode);

  return (
    <div className="space-y-3">
      {/* Debug indicator */}
      <div className="text-xs bg-white p-2 rounded border">
        <strong>Component Status:</strong> isEditMode = {isEditMode ? 'TRUE' : 'FALSE'}
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => {
            console.log('✏️ Edit Step Details button clicked - calling onEditClick');
            onEditClick();
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          variant="default"
          size="sm"
        >
          <Edit3 className="h-4 w-4" />
          Edit Step Details
        </Button>
        <Button
          onClick={() => {
            console.log('▶️ Start Next Step button clicked');
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
    </div>
  );
};
