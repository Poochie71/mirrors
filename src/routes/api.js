const express = require('express');
const router = express.Router();

// Import controllers
const profileController = require('../controllers/profileController');

// Import your new security gatekeeper middleware
const requireApiKey = require('../middleware/auth');

// --- HIGHWAY ROUTES ---

// Public Route: Anyone can view a public profile state
router.get('/profiles/:username', profileController.getPublicProfile);

// Protected Ingestion Route: Requires a secure signature header to pass through
router.post('/profiles/sync', requireApiKey, profileController.syncMetrics);

module.exports = router;