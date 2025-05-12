// components/rollup/RollupSelector.tsx
import React from 'react';

interface Rollup {
  id: number;
  name: string;
  isActive: boolean;
}

interface RollupSelectorProps {
  rollups: Rollup[];
  activeRollup: number | null;
  onSelectRollup: (rollupId: number) => void;
}

const RollupSelector: React.FC<RollupSelectorProps> = ({ rollups, activeRollup, onSelectRollup }) => {
  if (rollups.length === 0) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-yellow-700">No rollups registered yet. Register a rollup to begin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rollups.map((rollup) => (
        <button
          key={rollup.id}
          onClick={() => onSelectRollup(rollup.id)}
          className={`w-full flex items-center justify-between p-3 rounded-md transition-colors ${
            activeRollup === rollup.id
              ? 'bg-blue-100 text-blue-800'
              : 'bg-white hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center">
            <div className="font-medium">{rollup.name}</div>
            <div className="text-xs ml-2 px-1.5 py-0.5 rounded-full bg-gray-200">
              ID: {rollup.id}
            </div>
          </div>
          <div className={`h-2 w-2 rounded-full ${rollup.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </button>
      ))}
    </div>
  );
};

export default RollupSelector;