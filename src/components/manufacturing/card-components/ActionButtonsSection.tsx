
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { StepCardData } from '../ManufacturingStepCard';

interface ActionButtonsSectionProps {
  data: StepCardData;
  nextStepName: string | null;
  onStartNextStep: (e: React.MouseEvent) => void;
}

const ActionButtonsSection: React.FC<ActionButtonsSectionProps> = ({ 
  data, 
  nextStepName, 
  onStartNextStep 
}) => {
  if (!nextStepName || !data.onStartNextStep) return null;

  return (
    <div className="pt-2 border-t border-gray-200/50">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onStartNextStep}
        className="w-full h-8 text-xs font-semibold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 shadow-sm"
      >
        <Play className="h-3 w-3 mr-2" />
        Start {nextStepName}
      </Button>
    </div>
  );
};

export default ActionButtonsSection;
