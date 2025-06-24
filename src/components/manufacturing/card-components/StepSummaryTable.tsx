
import React from 'react';
import { Factory } from 'lucide-react';

interface StepSummary {
  stepName: string;
  stepOrder: number;
  totalActiveInstances: number;
  weightAssigned: number;
  weightReceived: number;
  reworkAssigned: number;
  reworkReceived: number;
  reworkRequested: number;
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
          <div key={summary.stepName} className="grid grid-cols-6 gap-1 text-xs">
            <div className="font-medium text-gray-900 truncate">{summary.stepName}</div>
            <div className="text-center bg-blue-50 px-1 py-1 rounded text-blue-700 text-xs font-semibold">
              {summary.totalActiveInstances || 0}
            </div>
            <div className="text-center bg-purple-50 px-1 py-1 rounded text-purple-700 text-xs font-semibold">
              {summary.weightAssigned > 0 ? `${summary.weightAssigned.toFixed(1)}` : '—'}
            </div>
            <div className="text-center bg-emerald-50 px-1 py-1 rounded text-emerald-700 text-xs font-semibold">
              {summary.weightReceived > 0 ? `${summary.weightReceived.toFixed(1)}` : '—'}
            </div>
            <div className="text-center bg-orange-50 px-1 py-1 rounded text-orange-700 text-xs font-semibold">
              {summary.reworkAssigned > 0 ? `${summary.reworkAssigned.toFixed(1)}` : '—'}
            </div>
            <div className="text-center bg-red-50 px-1 py-1 rounded text-red-700 text-xs font-semibold">
              {summary.reworkReceived > 0 ? `${summary.reworkReceived.toFixed(1)}` : '—'}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-6 gap-1 mt-2 pt-2 border-t border-gray-200 text-xs font-medium text-gray-500">
        <div>Step</div>
        <div className="text-center">Active</div>
        <div className="text-center">Assign</div>
        <div className="text-center">Recv</div>
        <div className="text-center">RW Assign</div>
        <div className="text-center">RW Recv</div>
      </div>
    </div>
  );
};

export default StepSummaryTable;
