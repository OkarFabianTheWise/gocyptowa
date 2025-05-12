// components/rollup/PriceFeed.tsx
import React, { useState } from 'react';

interface Price {
  price: string;
  timestamp: string;
  source: string;
}

interface PriceFeedProps {
  prices: Price[];
  onUpdatePrice: (price: string) => void;
  activeRollup: number | null;
}

const PriceFeed: React.FC<PriceFeedProps> = ({ prices, onUpdatePrice, activeRollup }) => {
  const [newPrice, setNewPrice] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const priceValue = parseFloat(newPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      setError('Price must be a positive number');
      return;
    }
    
    onUpdatePrice(newPrice);
    setNewPrice('');
  };

  return (
    <div className="bg-white p-3 rounded-md shadow">
      <div className="max-h-48 overflow-y-auto mb-4">
        {prices.length > 0 ? (
          <div className="space-y-2">
            {prices.map((price, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded-md text-sm">
                <div className="flex justify-between">
                  <div className="font-medium">${parseFloat(price.price).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{price.timestamp}</div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Source: {price.source.substring(0, 8)}...
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm p-4">
            No price data available
          </div>
        )}
      </div>

      {activeRollup && (
        <form onSubmit={handleSubmit} className="mt-3">
          {error && (
            <div className="mb-2 p-2 bg-red-50 text-red-700 text-xs rounded-md">
              {error}
            </div>
          )}
          
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                type="text"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="e.g., 50000"
                className="w-full p-2 border rounded-md text-sm"
                required
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Update Price
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            You are updating price as Rollup ID: {activeRollup}
          </div>
        </form>
      )}
    </div>
  );
};

export default PriceFeed;