import express from 'express';
import { openaiService } from '../services/openai.js';
import { userHistoryManager } from '../utils/userHistory.js';
import { chatRateLimit } from '../middleware/rateLimiter.js';

const router = express.Router();

// Route de santé pour Render
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Route de chat avec rate limiting
router.post('/chat', chatRateLimit, async (req, res) => {
  try {
    const { userId, message } = req.body;

    // Validation des entrées
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        error: 'userId requis et doit être une chaîne de caractères',
        code: 'INVALID_USER_ID'
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message requis et ne peut pas être vide',
        code: 'INVALID_MESSAGE'
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        error: 'Message trop long (maximum 4000 caractères)',
        code: 'MESSAGE_TOO_LONG'
      });
    }

    console.log(`Nouveau message de ${userId}: ${message.substring(0, 100)}...`);

    // Ajouter le message utilisateur à l'historique
    userHistoryManager.addMessage(userId, 'user', message);

    // Récupérer le contexte de conversation
    const contextMessages = userHistoryManager.getContextMessages(userId);

    // Appeler OpenAI
    const result = await openaiService.sendMessage(contextMessages, userId);

    if (!result.success) {
      return res.status(500).json({
        error: result.error,
        code: 'OPENAI_ERROR'
      });
    }

    // Ajouter la réponse à l'historique
    userHistoryManager.addMessage(userId, 'assistant', result.message);

    // Retourner la réponse
    res.json({
      success: true,
      message: result.message,
      userId: userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur route /api/chat:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// Route pour obtenir l'historique d'un utilisateur
router.get('/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        error: 'userId requis',
        code: 'INVALID_USER_ID'
      });
    }

    const history = userHistoryManager.getHistory(userId);
    
    res.json({
      success: true,
      history: history,
      count: history.length
    });

  } catch (error) {
    console.error('Erreur route /api/history:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de l\'historique',
      code: 'HISTORY_ERROR'
    });
  }
});

// Route pour effacer l'historique d'un utilisateur
router.delete('/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        error: 'userId requis',
        code: 'INVALID_USER_ID'
      });
    }

    userHistoryManager.clearHistory(userId);
    
    res.json({
      success: true,
      message: 'Historique effacé avec succès'
    });

  } catch (error) {
    console.error('Erreur route DELETE /api/history:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'effacement de l\'historique',
      code: 'CLEAR_HISTORY_ERROR'
    });
  }
});

// Route pour les statistiques (optionnel, pour le monitoring)
router.get('/stats', (req, res) => {
  try {
    const stats = userHistoryManager.getStats();
    res.json({
      success: true,
      stats: stats,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur route /api/stats:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des statistiques',
      code: 'STATS_ERROR'
    });
  }
});

export default router;