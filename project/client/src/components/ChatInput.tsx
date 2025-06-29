import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { ChatInputProps } from '../types';

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tapez votre message ici... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
              className="w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              style={{ minHeight: '48px', maxHeight: '120px' }}
              disabled={isLoading}
            />
            
            {/* Compteur de caractères */}
            {message.length > 3800 && (
              <div className="absolute -top-6 right-0 text-xs text-gray-500">
                {message.length}/4000
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Indicateur de frappe */}
        {message.trim() && !isLoading && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            Appuyez sur Entrée pour envoyer
          </div>
        )}
      </form>
    </div>
  );
};