const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { validateTimesheet, validateReview } = require('../middleware/validation');
const {
  createOrUpdateTimesheet,
  getMyTimesheets,
  getTimesheetById,
  submitTimesheet,
  getPendingTimesheets,
  approveOrRejectTimesheet
} = require('../controllers/timesheetController');

router.post('/', auth, validateTimesheet, createOrUpdateTimesheet);
router.get('/my', auth, getMyTimesheets);
router.get('/pending', auth, authorize('manager'), getPendingTimesheets);
router.get('/:id', auth, getTimesheetById);
router.post('/:id/submit', auth, submitTimesheet);
router.post('/:id/review', auth, authorize('manager'), validateReview, approveOrRejectTimesheet);

module.exports = router;
