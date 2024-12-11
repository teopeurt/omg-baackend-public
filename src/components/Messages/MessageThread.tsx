import React from 'react';
import { motion } from 'framer-motion';
import { formatRelativeTime } from '../../utils/format';

interface Message {
  id: number;
  content: string;
  timestamp: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  isOwn?: boolean;
}

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
}

export function MessageThread({ messages, currentUserId }: MessageThreadProps) {
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  return (
    <div className="flex flex-col space-y-4 overflow-y-auto">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          <div className="flex items-center justify-center my-4">
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {date === new Date().toLocaleDateString() ? 'Today' : date}
            </div>
          </div>
          {dateMessages.map((message) => {
            const isOwn = message.sender.id === currentUserId;
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                {!isOwn && (
                  <img
                    src={message.sender.avatar}
                    alt={message.sender.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div
                  className={`max-w-[70%] ${
                    isOwn
                      ? 'bg-blue-500 text-white rounded-l-lg rounded-tr-lg'
                      : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg'
                  } px-4 py-2`}
                >
                  {!isOwn && (
                    <div className="text-sm font-medium mb-1">{message.sender.name}</div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <div
                    className={`text-xs mt-1 ${
                      isOwn ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatRelativeTime(new Date(message.timestamp))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
}