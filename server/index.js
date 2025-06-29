import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { generalRateLimit } from './middleware/rateLimiter.js';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Vérification des variables d'environnement critiques
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ ERREUR: OPENAI_API_KEY manquante dans les variables d\'environnement');
  console.error('Veuillez créer un fichier .env avec votre clé API OpenAI');
  process.exit(1);
}

// Middleware CORS configuré
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://your-frontend-domain.com']
    : [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware pour parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting général
app.use(generalRateLimit);

// Logging des requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Routes API
app.use('/api', apiRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({
    message: 'Chatbot GPT Server - API prête',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    status: 'active'
  });
});

// Middleware de gestion d'erreurs global
app.use((error, req, res, next) => {
  console.error('Erreur non gérée:', error);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    code: 'INTERNAL_SERVER_ERROR'
  });
});

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 OpenAI API configurée: ${process.env.OPENAI_API_KEY ? '✅' : '❌'}`);
  console.log(`🛡️  Rate limiting: ${process.env.MAX_REQUESTS_PER_MINUTE || 30} requêtes/minute`);
  
  if (process.env.OPENAI_ASSISTANT_ID) {
    console.log(`🤖 Assistant ID configuré: ${process.env.OPENAI_ASSISTANT_ID}`);
  }
});

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu, arrêt propre du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT reçu, arrêt propre du serveur...');
  process.exit(0);
});