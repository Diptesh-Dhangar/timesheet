const { validationResult } = require('express-validator');
const TimeOffRequest = require('../models/TimeOffRequest');

const createTimeOffRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fromDate, toDate, reason } = req.body;

    const overlappingRequest = await TimeOffRequest.findOne({
      employee: req.user._id,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { fromDate: { $lte: toDate }, toDate: { $gte: fromDate } }
      ]
    });

    if (overlappingRequest) {
      return res.status(400).json({ 
        message: 'You already have a time off request for this period' 
      });
    }

    const timeOffRequest = new TimeOffRequest({
      employee: req.user._id,
      fromDate,
      toDate,
      reason
    });

    await timeOffRequest.save();
    await timeOffRequest.populate('employee', 'firstName lastName employeeId');

    res.status(201).json({
      message: 'Time off request created successfully',
      timeOffRequest
    });
  } catch (error) {
    console.error('Create time off request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyTimeOffRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { employee: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const requests = await TimeOffRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('employee', 'firstName lastName employeeId')
      .populate('reviewedBy', 'firstName lastName');

    const total = await TimeOffRequest.countDocuments(query);

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get time off requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPendingTimeOffRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const requests = await TimeOffRequest.find({ status: 'Pending' })
      .sort({ createdAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('employee', 'firstName lastName employeeId department');

    const total = await TimeOffRequest.countDocuments({ status: 'Pending' });

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get pending time off requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const approveOrRejectTimeOff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, rejectionReason } = req.body;
    const timeOffRequest = await TimeOffRequest.findById(req.params.id);

    if (!timeOffRequest) {
      return res.status(404).json({ message: 'Time off request not found' });
    }

    if (timeOffRequest.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending requests can be reviewed' });
    }

    if (action === 'approve') {
      timeOffRequest.status = 'Approved';
    } else if (action === 'reject') {
      timeOffRequest.status = 'Rejected';
      timeOffRequest.rejectionReason = rejectionReason;
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    timeOffRequest.reviewedAt = new Date();
    timeOffRequest.reviewedBy = req.user._id;
    await timeOffRequest.save();
    await timeOffRequest.populate('employee', 'firstName lastName employeeId');
    await timeOffRequest.populate('reviewedBy', 'firstName lastName');

    res.json({
      message: `Time off request ${action}d successfully`,
      timeOffRequest
    });
  } catch (error) {
    console.error('Review time off request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTimeOffRequestById = async (req, res) => {
  try {
    const request = await TimeOffRequest.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId department')
      .populate('reviewedBy', 'firstName lastName');

    if (!request) {
      return res.status(404).json({ message: 'Time off request not found' });
    }

    if (req.user.role === 'employee' && request.employee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ request });
  } catch (error) {
    console.error('Get time off request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createTimeOffRequest,
  getMyTimeOffRequests,
  getPendingTimeOffRequests,
  approveOrRejectTimeOff,
  getTimeOffRequestById
};
