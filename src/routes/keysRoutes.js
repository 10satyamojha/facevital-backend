const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const apiKeyController = require('../controllers/keysController');

router.get('/listApiKeys', authenticateToken, apiKeyController.listApiKeys);
router.post('/createApiKey', authenticateToken, apiKeyController.createApiKey);
router.delete('/:keyId', authenticateToken, apiKeyController.deleteApiKey);
router.post('/:keyId/regenerate', authenticateToken, apiKeyController.regenerateApiKey);

module.exports = router;



