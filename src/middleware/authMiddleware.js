const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const token = authHeader.split(' ')[1].trim();

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, authConfig.jwtSecret, (err, user) => {
    if (err) {
      console.error('JWT verification failed:', err);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
