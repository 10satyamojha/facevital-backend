module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key',
  jwtExpiry: '24h',
  saltRounds: 12,
  resetTokenExpiry: 3600000, // 1 hour
  verificationTokenExpiry: 86400000, // 24 hours
};