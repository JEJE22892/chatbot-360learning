import { ChatResponse, ApiError } from '../types';

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(data.error || 'Erreur réseau', data.code || 'NETWORK_ERROR');
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof TypeError) {
        throw new ApiError('Erreur de connexion au serveur', 'CONNECTION_ERROR');
      }
      
      throw new ApiError('Erreur inattendue', 'UNEXPECTED_ERROR');
    }
  }

  async sendMessage(userId: string, message: string): Promise<ChatResponse> {
    return this.request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ userId, message }),
    });
  }

  async getHistory(userId: string): Promise<{ success: boolean; history: any[]; count: number }> {
    return this.request(`/history/${userId}`);
  }

  async clearHistory(userId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/history/${userId}`, {
      method: 'DELETE',
    });
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }
}

class ApiError extends Error {
  constructor(public message: string, public code: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = new ApiClient();
export { ApiError };