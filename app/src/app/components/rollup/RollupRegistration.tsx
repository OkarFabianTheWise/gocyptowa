// components/rollup/RollupRegistration.tsx
"use client";

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';


interface RollupRegistrationProps {
  onRegister: (id: number, name: string, metadata: string) => void;
}

const RollupRegistration: React.FC<RollupRegistrationProps> = ({ onRegister }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [metadata, setMetadata] = useState('');
  const [error, setError] = useState('');
  const { connected } = useWallet();
  
  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError("");
    
    if (!connected) {
      setError("Please connect your wallet first");
      return;
    }
    
    const rollupId = parseInt(id);
    if (isNaN(rollupId) || rollupId <= 0) {
      setError('ID must be a positive number');
      return;
    }

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    onRegister(rollupId, name, metadata);
    
    // Reset form
    setId('');
    setName('');
    setMetadata('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
      >
        Register New Rollup
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-3 rounded-md shadow">
      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rollup ID
        </label>
        <input
          type="number"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="e.g., 3"
          className="w-full p-2 border rounded-md text-sm"
          min="1"
          required
        />
      </div>
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., MyRollup"
          className="w-full p-2 border rounded-md text-sm"
          required
        />
      </div>
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Metadata
        </label>
        <textarea
          value={metadata}
          onChange={(e) => setMetadata(e.target.value)}
          placeholder="e.g., A ZK rollup for DeFi applications"
          className="w-full p-2 border rounded-md text-sm h-20"
        />
      </div>
      
      <div className="flex justify-between space-x-2">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
        >
          Register
        </button>
      </div>
    </form>
    );
}

export default dynamic(() => Promise.resolve(RollupRegistration), {
  ssr: false
});