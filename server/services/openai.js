import axios from 'axios';

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.assistantId = process.env.OPENAI_ASSISTANT_ID;
    this.baseURL = 'https://api.openai.com/v1';
    
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY manquante dans les variables d\'environnement');
    }
  }

  async sendMessage(messages, userId) {
    try {
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      };

      // Utilisation de l'API Chat Completions
      const requestData = {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant IA utile et professionnel. Réponds de manière claire et concise. ID utilisateur: ${userId}`
          },
          ...messages
        ],
        max_tokens: 1000,
        temperature: 0.7
      };

      // Si un assistant ID est défini, l'utiliser (mode Assistants API)
      if (this.assistantId) {
        return await this.useAssistantsAPI(messages, userId);
      }

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        requestData,
        { headers, timeout: 30000 }
      );

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error('Aucune réponse générée par OpenAI');
      }

      return {
        success: true,
        message: response.data.choices[0].message.content.trim(),
        usage: response.data.usage
      };

    } catch (error) {
      console.error('Erreur OpenAI Service:', error.message);
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 401:
            return { success: false, error: 'Clé API OpenAI invalide' };
          case 429:
            return { success: false, error: 'Limite de taux OpenAI atteinte. Réessayez dans quelques instants.' };
          case 400:
            return { success: false, error: 'Requête invalide envoyée à OpenAI' };
          default:
            return { success: false, error: `Erreur OpenAI: ${data.error?.message || 'Erreur inconnue'}` };
        }
      }
      
      if (error.code === 'ECONNABORTED') {
        return { success: false, error: 'Délai d\'attente dépassé. Réessayez.' };
      }
      
      return { success: false, error: 'Erreur de connexion à OpenAI' };
    }
  }

  async useAssistantsAPI(messages, userId) {
    try {
      // Créer un thread pour la conversation
      const threadResponse = await axios.post(
        `${this.baseURL}/threads`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      );

      const threadId = threadResponse.data.id;

      // Ajouter le message au thread
      await axios.post(
        `${this.baseURL}/threads/${threadId}/messages`,
        {
          role: 'user',
          content: messages[messages.length - 1].content
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      );

      // Lancer l'assistant
      const runResponse = await axios.post(
        `${this.baseURL}/threads/${threadId}/runs`,
        {
          assistant_id: this.assistantId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      );

      const runId = runResponse.data.id;

      // Attendre la completion
      let runStatus = 'in_progress';
      let attempts = 0;
      const maxAttempts = 30;

      while (runStatus === 'in_progress' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const statusResponse = await axios.get(
          `${this.baseURL}/threads/${threadId}/runs/${runId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'OpenAI-Beta': 'assistants=v2'
            }
          }
        );

        runStatus = statusResponse.data.status;
        attempts++;
      }

      if (runStatus !== 'completed') {
        throw new Error(`Assistant run status: ${runStatus}`);
      }

      // Récupérer la réponse
      const messagesResponse = await axios.get(
        `${this.baseURL}/threads/${threadId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      );

      const assistantMessage = messagesResponse.data.data.find(
        msg => msg.role === 'assistant'
      );

      if (!assistantMessage) {
        throw new Error('Aucune réponse de l\'assistant');
      }

      return {
        success: true,
        message: assistantMessage.content[0].text.value,
        usage: null
      };

    } catch (error) {
      console.error('Erreur Assistants API:', error.message);
      return { success: false, error: 'Erreur avec l\'assistant OpenAI' };
    }
  }
}

export const openaiService = new OpenAIService();