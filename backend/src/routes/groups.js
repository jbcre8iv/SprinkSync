/**
 * SprinkSync - Zone Groups Routes
 *
 * Routes for zone group management
 */

const express = require('express');
const router = express.Router();
const {
  getAllGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  runGroup
} = require('../controllers/groupsController');

// Get all zone groups
router.get('/', getAllGroups);

// Get specific zone group
router.get('/:id', getGroup);

// Create new zone group
router.post('/', createGroup);

// Update zone group
router.put('/:id', updateGroup);

// Delete zone group
router.delete('/:id', deleteGroup);

// Run zone group (start all zones in sequence)
router.post('/:id/run', runGroup);

module.exports = router;
