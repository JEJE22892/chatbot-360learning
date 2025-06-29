import React from 'react';
import { User, Bot } from 'lucide-react';
import { MessageBubbleProps } from '../types';

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const timestamp = new Date(message.timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex gap-3 max-w-4xl mx-auto p-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-600 text-white'
      }`}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-2 shadow-sm transition-all duration-200 hover:shadow-md ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        
        {/* Timestamp */}
        <span className={`text-xs mt-1 px-2 ${
          isUser ? 'text-gray-500' : 'text-gray-400'
        }`}>
          {timestamp}
        </span>
      </div>
    </div>
  );
};