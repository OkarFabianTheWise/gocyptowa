// components/rollup/SendMessageForm.tsx
import React, { useState } from 'react';

interface Rollup {
  id: number;
  name: string;
}

interface SendMessageFormProps {
  rollups: Rollup[];
  onSendMessage: (targetRollupId: number, message: string) => void;
  onBroadcast: (topic: string, payload: string) => void;
}

const SendMessageForm: React.FC<SendMessageFormProps> = ({ rollups, onSendMessage, onBroadcast }) => {
  const [messageType, setMessageType] = useState<'direct' | 'broadcast'>('direct');
  const [targetRollupId, setTargetRollupId] = useState<number | null>(rollups[0]?.id || null);
  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (messageType === 'direct' && targetRollupId !== null && message.trim()) {
      onSendMessage(targetRollupId, message);
      setMessage('');
    } else if (messageType === 'broadcast' && topic.trim() && message.trim()) {
      onBroadcast(topic, message);
      setTopic('');
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow">
      <div className="mb-4">
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="direct"
              checked={messageType === 'direct'}
              onChange={() => setMessageType('direct')}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm">Direct Message</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="broadcast"
              checked={messageType === 'broadcast'}
              onChange={() => setMessageType('broadcast')}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm">Broadcast Event</span>
          </label>
        </div>
      </div>

      {messageType === 'direct' ? (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Rollup
          </label>
          <select
            value={targetRollupId || ''}
            onChange={(e) => setTargetRollupId(Number(e.target.value))}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="" disabled>
              Select a rollup
            </option>
            {rollups.map((rollup) => (
              <option key={rollup.id} value={rollup.id}>
                {rollup.name} (ID: {rollup.id})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., price_update, transaction_confirmed"
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {messageType === 'direct' ? 'Message' : 'Payload'}
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={messageType === 'direct' ? "Enter your message..." : "Enter event payload..."}
          className="w-full p-2 border rounded-md h-24"
          required
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          disabled={
            (messageType === 'direct' && (!targetRollupId || !message.trim())) ||
            (messageType === 'broadcast' && (!topic.trim() || !message.trim()))
          }
        >
          {messageType === 'direct' ? 'Send Message' : 'Broadcast Event'}
        </button>
      </div>
    </form>
  );
};

export default SendMessageForm;