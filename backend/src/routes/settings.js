/**
 * SprinkSync - Settings Routes
 *
 * API routes for system settings and use case profiles
 */

const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  getUseCaseProfiles,
  getProfileDetails,
  getControllerModels,
  getControllerDetails,
  getManufacturers,
  getManufacturerDetails,
  getControllersByMfr,
} = require('../controllers/settingsController');

// GET /api/settings - Get system settings
router.get('/', getSettings);

// PUT /api/settings - Update system settings
router.put('/', updateSettings);

// GET /api/settings/profiles - Get all available use case profiles
router.get('/profiles', getUseCaseProfiles);

// GET /api/settings/profiles/:profileId - Get specific profile details
router.get('/profiles/:profileId', getProfileDetails);

// GET /api/settings/manufacturers - Get all available manufacturers
router.get('/manufacturers', getManufacturers);

// GET /api/settings/manufacturers/:manufacturerId - Get specific manufacturer details
router.get('/manufacturers/:manufacturerId', getManufacturerDetails);

// GET /api/settings/manufacturers/:manufacturerId/controllers - Get controllers by manufacturer
router.get('/manufacturers/:manufacturerId/controllers', getControllersByMfr);

// GET /api/settings/controllers - Get all available controller models
router.get('/controllers', getControllerModels);

// GET /api/settings/controllers/:controllerId - Get specific controller details
router.get('/controllers/:controllerId', getControllerDetails);

module.exports = router;
