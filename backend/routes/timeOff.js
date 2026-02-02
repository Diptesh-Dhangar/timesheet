const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { validateTimeOffRequest, validateReview } = require('../middleware/validation');
const {
  createTimeOffRequest,
  getMyTimeOffRequests,
  getPendingTimeOffRequests,
  approveOrRejectTimeOff,
  getTimeOffRequestById
} = require('../controllers/timeOffController');

router.post('/', auth, validateTimeOffRequest, createTimeOffRequest);
router.get('/my', auth, getMyTimeOffRequests);
router.get('/pending', auth, authorize('manager'), getPendingTimeOffRequests);
router.get('/:id', auth, getTimeOffRequestById);
router.post('/:id/review', auth, authorize('manager'), validateReview, approveOrRejectTimeOff);

module.exports = router;
