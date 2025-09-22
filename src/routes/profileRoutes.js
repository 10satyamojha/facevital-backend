const express = require('express');
const profileController = require('../controllers/ProfileControllers');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken); // All profile routes require authentication

router.post('/createOrUpdateProfile',authenticateToken, profileController.createOrUpdateProfile);
router.get('/getProfile',authenticateToken ,profileController.getProfile);
router.get('/getpage',authenticateToken ,profileController.getpage);


module.exports = router;
