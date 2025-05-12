// components/rollup/RollupStatus.tsx
import React from 'react';

interface Rollup {
  id: number;
  name: string;
  isActive: boolean;
  metadata?: string;
}

interface RollupStatusProps {
  rollups: Rollup[];
  activeRollup: number | null;
  onUpdateStatus: (isActive: boolean) => void;
}

const RollupStatus: React.FC<RollupStatusProps> = ({ rollups, activeRollup, onUpdateStatus }) => {
  if (!activeRollup) {
    return null;
  }

  const rollup = rollups.find(r => r.id === activeRollup);
  if (!rollup) {
    return null;
  }

  return (
    <div className="bg-white p-3 rounded-md shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{rollup.name}</div>
        <div className={`px-2 py-1 text-xs rounded-full ${
          rollup.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {rollup.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>
      
      {rollup.metadata && (
        <div className="text-xs text-gray-600 mb-3">
          <div className="font-medium mb-1">Metadata:</div>
          <div className="bg-gray-50 p-2 rounded">{rollup.metadata}</div>
        </div>
      )}
      
      <div className="mt-3">
        <button
          onClick={() => onUpdateStatus(!rollup.isActive)}
          className={`w-full px-3 py-1.5 text-sm rounded-md transition-colors ${
            rollup.isActive
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {rollup.isActive ? 'Deactivate' : 'Activate'} Rollup
        </button>
      </div>
    </div>
  );
};

export default RollupStatus;