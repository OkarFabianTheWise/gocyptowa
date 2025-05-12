// components/rollup/MessageList.tsx
import React from 'react';

interface Message {
  from: string;
  content: string;
  timestamp: string;
  messageType: string;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  if (messages.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-500">No messages received yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="max-h-96 overflow-y-auto">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`p-4 border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-gray-800 break-words">{message.content}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {message.messageType.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="mx-2">•</span>
                  <span>From: {message.from.substring(0, 8)}...</span>
                </div>
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap ml-4">
                {message.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageList;