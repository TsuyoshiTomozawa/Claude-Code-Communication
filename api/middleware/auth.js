const jwt = require('jsonwebtoken');

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  });
}

// Authorization middleware for role-based access
function authorize(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Rate limiting per user
function userRateLimit(req, res, next) {
  // Simple in-memory rate limiting (use Redis in production)
  const userLimits = global.userLimits || new Map();
  global.userLimits = userLimits;

  const userId = req.user?.id;
  if (!userId) return next();

  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30;

  const userRequests = userLimits.get(userId) || [];
  const recentRequests = userRequests.filter(time => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return res.status(429).json({ 
      error: 'Too many requests', 
      retryAfter: Math.ceil(windowMs / 1000) 
    });
  }

  recentRequests.push(now);
  userLimits.set(userId, recentRequests);

  next();
}

// API key authentication (alternative to JWT)
function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return next(); // Continue to JWT auth
  }

  // In production, validate against database
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // Set user context from API key
  req.user = {
    id: 'api-' + apiKey.substring(0, 8),
    type: 'api-key'
  };

  next();
}

// Combined authentication (API key or JWT)
function authenticate(req, res, next) {
  authenticateApiKey(req, res, (err) => {
    if (err) return next(err);
    if (req.user) return next(); // API key auth successful
    authenticateToken(req, res, next); // Try JWT auth
  });
}

module.exports = {
  authenticateToken,
  authorize,
  userRateLimit,
  authenticateApiKey,
  authenticate
};