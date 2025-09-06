const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: { type: String, required: true },
  key: { type: String, required: true, unique: true },
  permissions: [{ type: String, enum: ['read', 'write', 'delete'], default: ['read'] }],
    status: {
    type: String,
    enum: ['active', 'disabled'],  // add 'active' so it's valid
    default: 'active'
  },

  created: { type: Date, default: Date.now },
  lastUsed: { type: Date, default: null },
  requestsThisMonth: { type: Number, default: 0 },
  rateLimit: { type: String, default: '1000/hour' }
});

module.exports = mongoose.model('ApiKey', apiKeySchema);
