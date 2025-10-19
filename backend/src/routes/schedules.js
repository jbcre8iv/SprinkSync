/**
 * SprinkSync - Schedules Routes
 *
 * API routes for schedule management.
 */

const express = require('express');
const router = express.Router();
const {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  toggleSchedule
} = require('../controllers/schedules');

// GET /api/schedules - Get all schedules
router.get('/', getAllSchedules);

// GET /api/schedules/:id - Get single schedule
router.get('/:id', getScheduleById);

// POST /api/schedules - Create schedule
router.post('/', createSchedule);

// PUT /api/schedules/:id - Update schedule
router.put('/:id', updateSchedule);

// DELETE /api/schedules/:id - Delete schedule
router.delete('/:id', deleteSchedule);

// POST /api/schedules/:id/toggle - Toggle schedule enabled/disabled
router.post('/:id/toggle', toggleSchedule);

module.exports = router;
