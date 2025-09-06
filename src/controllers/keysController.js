const ApiKey = require('../models/keys');
const mongoose = require('mongoose');

const generateRandomKey = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'hv_live_sk_';
  for(let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

class ApiKeyController {
  async listApiKeys(req, res) {
    try {
      const apiKeys = await ApiKey.find({ userId: req.user.userId }).lean();
      
      // Format the response to match frontend expectations
      const formattedKeys = apiKeys.map(key => ({
        id: key._id,
        name: key.name,
        key: key.key,
        permissions: key.permissions,
        status: key.status,
        created: key.createdAt,
        lastUsed: key.lastUsed || 'Never',
        requestsThisMonth: key.requestsThisMonth || 0,
        rateLimit: key.rateLimit || '1000/hour'
      }));

      res.json({ apiKeys: formattedKeys });
    } catch (error) {
      console.error('List API keys error:', error);
      res.status(500).json({ message: 'Failed to retrieve API keys' });
    }
  }

  async createApiKey(req, res) {
    try {
      const { name, permissions } = req.body;

      // Validate input
      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'API key name is required' });
      }

      if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
        return res.status(400).json({ message: 'At least one permission is required' });
      }

      // Validate permissions
      const validPermissions = ['read', 'write', 'delete'];
      const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
      if (invalidPermissions.length > 0) {
        return res.status(400).json({ 
          message: `Invalid permissions: ${invalidPermissions.join(', ')}` 
        });
      }

      const newKey = new ApiKey({
        userId: req.user.userId,
        name: name.trim(),
        key: generateRandomKey(),
        permissions,
        status: 'active',
        createdAt: new Date(),
        requestsThisMonth: 0,
        rateLimit: '1000/hour'
      });

      await newKey.save();

      // Format response
      const formattedKey = {
        id: newKey._id,
        name: newKey.name,
        key: newKey.key,
        permissions: newKey.permissions,
        status: newKey.status,
        created: newKey.createdAt,
        lastUsed: 'Never',
        requestsThisMonth: newKey.requestsThisMonth,
        rateLimit: newKey.rateLimit
      };

      res.status(201).json({ apiKey: formattedKey });
    } catch (error) {
      console.error('Create API key error:', error);
      if (error.code === 11000) {
        res.status(400).json({ message: 'API key name must be unique' });
      } else {
        res.status(500).json({ message: 'Failed to create API key' });
      }
    }
  }

  async deleteApiKey(req, res) {
    try {
      const keyId = req.params.keyId;

      // Validate keyId
      if (!keyId || !mongoose.Types.ObjectId.isValid(keyId)) {
        return res.status(400).json({ message: 'Invalid API key ID' });
      }

      const deleted = await ApiKey.findOneAndDelete({ 
        _id: keyId, 
        userId: req.user.userId 
      });

      if (!deleted) {
        return res.status(404).json({ message: 'API key not found' });
      }

      res.json({ message: 'API key deleted successfully' });
    } catch (error) {
      console.error('Delete API key error:', error);
      res.status(500).json({ message: 'Failed to delete API key' });
    }
  }

  async regenerateApiKey(req, res) {
    try {
      const keyId = req.params.keyId;

      // Validate keyId
      if (!keyId || !mongoose.Types.ObjectId.isValid(keyId)) {
        return res.status(400).json({ message: 'Invalid API key ID' });
      }

      // Generate new key
      const newKeyStr = generateRandomKey();

      // Update the key in database
      const updatedKey = await ApiKey.findOneAndUpdate(
        { _id: keyId, userId: req.user.userId },
        { 
          key: newKeyStr, 
          lastUsed: null,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!updatedKey) {
        return res.status(404).json({ message: 'API key not found' });
      }

      // Format response
      const formattedKey = {
        id: updatedKey._id,
        name: updatedKey.name,
        key: updatedKey.key,
        permissions: updatedKey.permissions,
        status: updatedKey.status,
        created: updatedKey.createdAt,
        lastUsed: updatedKey.lastUsed || 'Never',
        requestsThisMonth: updatedKey.requestsThisMonth || 0,
        rateLimit: updatedKey.rateLimit || '1000/hour'
      };

      res.json({ apiKey: formattedKey });
    } catch (error) {
      console.error('Regenerate API key error:', error);
      res.status(500).json({ message: 'Failed to regenerate API key' });
    }
  }
}

module.exports = new ApiKeyController();