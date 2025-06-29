// Gestion simple de l'historique en mémoire
// Pour une version production, utiliser Redis ou une base de données

class UserHistoryManager {
  constructor() {
    this.history = new Map();
    this.maxHistorySize = 20; // Limite l'historique par utilisateur
    
    // Nettoyage automatique toutes les heures
    setInterval(() => {
      this.cleanupOldHistory();
    }, 60 * 60 * 1000);
  }

  addMessage(userId, role, content) {
    if (!this.history.has(userId)) {
      this.history.set(userId, []);
    }
    
    const userHistory = this.history.get(userId);
    userHistory.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
    
    // Limiter la taille de l'historique
    if (userHistory.length > this.maxHistorySize) {
      userHistory.splice(0, userHistory.length - this.maxHistorySize);
    }
    
    this.history.set(userId, userHistory);
  }

  getHistory(userId) {
    return this.history.get(userId) || [];
  }

  getContextMessages(userId) {
    const userHistory = this.getHistory(userId);
    // Retourner les 10 derniers messages pour le contexte
    return userHistory.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  clearHistory(userId) {
    this.history.delete(userId);
  }

  cleanupOldHistory() {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h ago
    
    for (const [userId, messages] of this.history.entries()) {
      const recentMessages = messages.filter(msg => 
        new Date(msg.timestamp) > cutoffTime
      );
      
      if (recentMessages.length === 0) {
        this.history.delete(userId);
      } else {
        this.history.set(userId, recentMessages);
      }
    }
    
    console.log(`Nettoyage historique terminé. Utilisateurs actifs: ${this.history.size}`);
  }

  getStats() {
    return {
      totalUsers: this.history.size,
      totalMessages: Array.from(this.history.values()).reduce((sum, messages) => sum + messages.length, 0)
    };
  }
}

export const userHistoryManager = new UserHistoryManager();