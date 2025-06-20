
import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

const StepIndicator = ({ currentStep, steps }: StepIndicatorProps) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        
        return (
          <div key={index} className="flex items-center">
            <div className={`flex items-center space-x-2 ${
              isCompleted ? 'text-green-600' : 
              isCurrent ? 'text-blue-600' : 'text-gray-400'
            }`}>
              {isCompleted ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Circle className={`h-5 w-5 ${isCurrent ? 'fill-current' : ''}`} />
              )}
              <span className={`text-sm font-medium ${
                isCompleted ? 'text-green-600' : 
                isCurrent ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-2 ${
                isCompleted ? 'bg-green-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
