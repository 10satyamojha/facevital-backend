const express = require('express');
const scanController = require('../controllers/scanControllers');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken); // All scan routes require authentication

router.post('/saveHealthData', scanController.saveHealthData);
router.get('/getScanHistory', scanController.getScanHistory);
router.get('/:getScanById', scanController.getScanById);

module.exports = router;