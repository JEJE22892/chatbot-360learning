import rateLimit from 'express-rate-limit';

// Configuration du rate limiting
export const chatRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.MAX_REQUESTS_PER_MINUTE || 30,
  message: {
    error: "Trop de requêtes. Veuillez patienter une minute avant de réessayer.",
    code: "RATE_LIMIT_EXCEEDED",
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Rate limit dépassé pour IP: ${req.ip}`);
    res.status(429).json({
      error: "Trop de requêtes. Veuillez patienter une minute avant de réessayer.",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: 60
    });
  }
});

// Rate limiting général plus souple
export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    error: "Trop de requêtes générales. Veuillez patienter.",
    code: "GENERAL_RATE_LIMIT_EXCEEDED"
  }
});