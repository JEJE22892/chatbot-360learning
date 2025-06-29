# 🤖 Chatbot GPT - Application Web Intégrable

Une application de chatbot GPT moderne et sécurisée, parfaitement adaptée pour l'intégration en iframe dans des plateformes LMS comme 360Learning.

## 🏗️ Architecture

```
chatbot-gpt360/
├── project/
│   └── client/              # Frontend React + TypeScript
│       ├── src/
│       │   ├── components/  # Composants React
│       │   ├── hooks/       # Hooks personnalisés
│       │   ├── types/       # Types TypeScript
│       │   └── utils/       # Utilitaires
├── server/                  # Backend Express.js
│   ├── routes/              # Routes API
│   ├── middleware/          # Middlewares
│   ├── services/            # Services (OpenAI)
│   └── utils/               # Utilitaires serveur
└── README.md
```

## 🔒 Sécurité

- ✅ Clé API OpenAI stockée côté serveur uniquement
- ✅ Rate limiting intelligent (30 req/min par IP)
- ✅ Validation des entrées utilisateur
- ✅ Gestion d'erreurs robuste
- ✅ CORS configuré correctement
- ✅ Pas d'exposition de données sensibles

## 🚀 Installation Locale

### Prérequis
- Node.js 18+ 
- Clé API OpenAI

### 1. Installation des dépendances

```bash
# Backend
cd server
npm install

# Frontend
cd ../project/client
npm install
```

### 2. Configuration du serveur

```bash
cd server
cp .env.example .env
```

Modifiez `.env` avec vos paramètres :

```env
OPENAI_API_KEY=sk-votre-cle-api-openai
PORT=3001
MAX_REQUESTS_PER_MINUTE=30
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Démarrage en développement

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd project/client
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🌐 Déploiement sur Render

### 1. Préparation du repository

1. Créez un repository GitHub avec votre code
2. Assurez-vous que le dossier `server/` est à la racine

### 2. Configuration Render

1. **Connectez votre repository GitHub à Render**
2. **Créez un nouveau Web Service**
3. **Configuration Build & Deploy :**
   - **Root Directory :** `server`
   - **Build Command :** `npm install`
   - **Start Command :** `npm start`
   - **Environment :** `Node`

### 3. Variables d'environnement

Dans les **Environment Variables** de Render :

```
OPENAI_API_KEY=sk-votre-cle-api-openai
NODE_ENV=production
MAX_REQUESTS_PER_MINUTE=30
FRONTEND_URL=https://votre-frontend-domain.com
```

### 4. Health Check

Render utilisera automatiquement `/api/health` pour vérifier l'état du service.

### 5. Frontend (optionnel - Netlify/Vercel)

Si vous souhaitez déployer le frontend séparément :

```bash
cd project/client
npm run build
# Déployez le dossier 'dist' sur Netlify/Vercel
```

## 🎯 Intégration iframe

L'application est optimisée pour les iframes :

```html
<iframe 
  src="https://votre-domain.onrender.com"
  width="100%" 
  height="600"
  frameborder="0"
  title="Assistant IA">
</iframe>
```

### Pour 360Learning :

1. Ajoutez un **élément HTML personnalisé**
2. Insérez le code iframe ci-dessus
3. Ajustez les dimensions selon vos besoins

## 📡 API Endpoints

### `POST /api/chat`
Envoie un message au chatbot

**Body :**
```json
{
  "userId": "user_unique_id",
  "message": "Votre message"
}
```

**Response :**
```json
{
  "success": true,
  "message": "Réponse de l'IA",
  "userId": "user_unique_id",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `GET /api/health`
Vérification de l'état du serveur

### `GET /api/history/:userId`
Récupère l'historique d'un utilisateur

### `DELETE /api/history/:userId`
Efface l'historique d'un utilisateur

## 🛠️ Fonctionnalités

### Frontend
- ✅ Interface de chat moderne et responsive
- ✅ Messages en temps réel avec animations
- ✅ Gestion d'historique automatique
- ✅ États de chargement et d'erreur
- ✅ Auto-resize des zones de texte
- ✅ Compatibilité iframe complète

### Backend
- ✅ Proxy sécurisé pour OpenAI
- ✅ Rate limiting par IP
- ✅ Gestion d'historique en mémoire
- ✅ Support Assistant ID OpenAI
- ✅ Logs détaillés
- ✅ Health checks pour monitoring

## 🐛 Résolution de problèmes

### "OPENAI_API_KEY manquante"
- Vérifiez que votre fichier `.env` contient la clé API
- Sur Render, vérifiez les variables d'environnement

### "Rate limit exceeded"
- L'utilisateur a dépassé 30 messages/minute
- Attendez 1 minute avant de réessayer

### "Connection Error"
- Vérifiez que le serveur backend est démarré
- Vérifiez la configuration du proxy dans `vite.config.ts`

### Interface blanche
- Vérifiez la console pour les erreurs JavaScript
- Vérifiez que l'API backend répond sur `/api/health`

## 🔧 Développement

### Structure des composants
- `Chat.tsx` : Composant principal
- `MessageBubble.tsx` : Affichage des messages
- `ChatInput.tsx` : Zone de saisie
- `useChat.ts` : Hook de gestion d'état

### Personnalisation
- Modifiez `tailwind.config.js` pour les couleurs
- Ajustez `server/services/openai.js` pour le comportement IA
- Configurez `server/middleware/rateLimiter.js` pour les limites

## 📝 Licence

MIT - Libre d'utilisation pour projets commerciaux et personnels.

## 💬 Support

Pour toute question ou problème :
1. Vérifiez d'abord cette documentation
2. Consultez les logs serveur pour les erreurs
3. Testez l'endpoint `/api/health`

---

**🎯 Application prête pour la production et l'intégration LMS !**