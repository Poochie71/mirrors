const express = require('express');
const router = express.Router();

// Targets the controller right next door inside src/
const profileController = require('../controllers/profileController');

// --- PLATFORM ENDPOINTS ---

// ROUTE 1: Public Dynamic Profile Lookups
router.get('/profiles/:username', profileController.getPublicProfile);

// ROUTE 2: Automated Data Synchronization
router.post('/profiles/sync', profileController.syncMetrics);

module.exports = router;