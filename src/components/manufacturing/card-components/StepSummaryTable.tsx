
import React from 'react';
import { Factory } from 'lucide-react';

interface StepSummary {
  stepName: string;
  stepOrder: number;
  totalActiveInstances: number;
  weightAssigned: number;
  weightReceived: number;
  reworkWeight: number;
  completionPercentage: number;
}

interface StepSummaryTableProps {
  stepSummaries: StepSummary[];
}

const StepSummaryTable: React.FC<StepSummaryTableProps> = ({ stepSummaries }) => {
  if (stepSummaries.length === 0) return null;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50">
      <div className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide flex items-center gap-2">
        <Factory className="h-3 w-3" />
        Manufacturing Progress
      </div>
      <div className="space-y-2">
        {stepSummaries.map((summary) => (
          <div key={summary.stepName} className="grid grid-cols-4 gap-2 text-xs">
            <div className="font-medium text-gray-900 truncate">{summary.stepName}</div>
            <div className="text-center bg-blue-50 px-2 py-1 rounded text-blue-700 text-sm font-semibold">
              {summary.totalActiveInstances || 0}
            </div>
            <div className="text-right bg-purple-50 px-2 py-1 rounded text-purple-700 text-sm font-semibold">
              {summary.weightAssigned > 0 ? `${summary.weightAssigned.toFixed(1)}kg` : '—'}
            </div>
            <div className="text-right bg-orange-50 px-2 py-1 rounded text-orange-700 text-sm font-semibold">
              {summary.reworkWeight > 0 ? `${summary.reworkWeight.toFixed(1)}kg` : '—'}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-gray-200 text-xs font-medium text-gray-500">
        <div>Step</div>
        <div className="text-center">Active</div>
        <div className="text-right">Assigned</div>
        <div className="text-right">Rework</div>
      </div>
    </div>
  );
};

export default StepSummaryTable;
