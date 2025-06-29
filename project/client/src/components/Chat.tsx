import React from 'react';
import { MessageCircle, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';

export const Chat: React.FC = () => {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    retryLastMessage,
    messagesEndRef,
  } = useChat();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Assistant IA</h1>
            <p className="text-xs text-gray-500">En ligne</p>
          </div>
        </div>
        
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Effacer la conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Bienvenue !
              </h2>
              <p className="text-gray-600">
                Commencez une conversation en tapant votre message ci-dessous.
                Je suis là pour vous aider !
              </p>
            </div>
          </div>
        ) : (
          <div className="py-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {/* Indicateur de frappe */}
            {isLoading && (
              <div className="flex gap-3 max-w-4xl mx-auto p-4">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 border border-gray-200 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="max-w-4xl mx-auto p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
                <button
                  onClick={retryLastMessage}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 flex items-center gap-1 hover:underline"
                >
                  <RefreshCw className="w-3 h-3" />
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
};