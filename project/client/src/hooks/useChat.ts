import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatState, Message } from '../types';
import { apiClient, ApiError } from '../utils/api';

// Générer un ID utilisateur unique
const generateUserId = (): string => {
  const stored = localStorage.getItem('chatbot_user_id');
  if (stored) return stored;
  
  const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('chatbot_user_id', newId);
  return newId;
};

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    userId: generateUserId(),
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [state.messages, scrollToBottom]);

  // Créer un nouveau message
  const createMessage = useCallback((role: 'user' | 'assistant', content: string): Message => {
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date().toISOString(),
    };
  }, []);

  // Envoyer un message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.isLoading) return;

    const userMessage = createMessage('user', content.trim());

    // Ajouter le message utilisateur immédiatement
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const response = await apiClient.sendMessage(state.userId, content.trim());
      
      const assistantMessage = createMessage('assistant', response.message);

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
      
      if (error instanceof ApiError) {
        switch (error.code) {
          case 'RATE_LIMIT_EXCEEDED':
            errorMessage = 'Trop de messages envoyés. Veuillez patienter une minute.';
            break;
          case 'CONNECTION_ERROR':
            errorMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
            break;
          case 'OPENAI_ERROR':
            errorMessage = 'Service temporairement indisponible. Réessayez dans quelques instants.';
            break;
          default:
            errorMessage = error.message;
        }
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      // Effacer l'erreur après 5 secondes
      setTimeout(() => {
        setState(prev => ({ ...prev, error: null }));
      }, 5000);
    }
  }, [state.userId, state.isLoading, createMessage]);

  // Effacer la conversation
  const clearChat = useCallback(async () => {
    try {
      await apiClient.clearHistory(state.userId);
      setState(prev => ({
        ...prev,
        messages: [],
        error: null,
      }));
    } catch (error) {
      console.error('Erreur lors de l\'effacement:', error);
      setState(prev => ({
        ...prev,
        error: 'Impossible d\'effacer la conversation.',
      }));
    }
  }, [state.userId]);

  // Réessayer le dernier message en cas d'erreur
  const retryLastMessage = useCallback(() => {
    const lastUserMessage = [...state.messages].reverse().find(msg => msg.role === 'user');
    if (lastUserMessage && !state.isLoading) {
      sendMessage(lastUserMessage.content);
    }
  }, [state.messages, state.isLoading, sendMessage]);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    userId: state.userId,
    sendMessage,
    clearChat,
    retryLastMessage,
    messagesEndRef,
  };
};