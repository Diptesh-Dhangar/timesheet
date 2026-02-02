const { validationResult } = require('express-validator');
const Timesheet = require('../models/Timesheet');

const getWeekDates = (weekStart) => {
  const startDate = new Date(weekStart);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  
  return {
    weekStartDate: startDate,
    weekEndDate: endDate
  };
};

const createOrUpdateTimesheet = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { weekStartDate, entries } = req.body;
    const { weekStartDate: start, weekEndDate: end } = getWeekDates(weekStartDate);

    const existingTimesheet = await Timesheet.findOne({
      employee: req.user._id,
      weekStartDate: start,
      weekEndDate: end
    });

    const totalHours = entries.reduce((total, entry) => total + entry.hours, 0);

    if (existingTimesheet) {
      existingTimesheet.entries = entries;
      existingTimesheet.totalHours = totalHours;
      existingTimesheet.status = 'Draft';
      await existingTimesheet.save();
      return res.json({
        message: 'Timesheet updated successfully',
        timesheet: existingTimesheet
      });
    }

    const timesheet = new Timesheet({
      employee: req.user._id,
      weekStartDate: start,
      weekEndDate: end,
      entries,
      totalHours
    });

    await timesheet.save();
    res.status(201).json({
      message: 'Timesheet created successfully',
      timesheet
    });
  } catch (error) {
    console.error('Create/Update timesheet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyTimesheets = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { employee: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const timesheets = await Timesheet.find(query)
      .sort({ weekStartDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('employee', 'firstName lastName employeeId')
      .populate('reviewedBy', 'firstName lastName');

    const total = await Timesheet.countDocuments(query);

    res.json({
      timesheets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get timesheets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTimesheetById = async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId')
      .populate('reviewedBy', 'firstName lastName');

    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    if (req.user.role === 'employee' && timesheet.employee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ timesheet });
  } catch (error) {
    console.error('Get timesheet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const submitTimesheet = async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id);

    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    if (timesheet.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (timesheet.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft timesheets can be submitted' });
    }

    if (!timesheet.entries || timesheet.entries.length === 0) {
      return res.status(400).json({ message: 'Cannot submit empty timesheet' });
    }

    timesheet.status = 'Submitted';
    timesheet.submittedAt = new Date();
    await timesheet.save();

    res.json({
      message: 'Timesheet submitted successfully',
      timesheet
    });
  } catch (error) {
    console.error('Submit timesheet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPendingTimesheets = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const timesheets = await Timesheet.find({ status: 'Submitted' })
      .sort({ submittedAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('employee', 'firstName lastName employeeId department');

    const total = await Timesheet.countDocuments({ status: 'Submitted' });

    res.json({
      timesheets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get pending timesheets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const approveOrRejectTimesheet = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, rejectionReason } = req.body;
    const timesheet = await Timesheet.findById(req.params.id);

    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    if (timesheet.status !== 'Submitted') {
      return res.status(400).json({ message: 'Only submitted timesheets can be reviewed' });
    }

    if (action === 'approve') {
      timesheet.status = 'Approved';
    } else if (action === 'reject') {
      timesheet.status = 'Rejected';
      timesheet.rejectionReason = rejectionReason;
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    timesheet.reviewedAt = new Date();
    timesheet.reviewedBy = req.user._id;
    await timesheet.save();

    res.json({
      message: `Timesheet ${action}d successfully`,
      timesheet
    });
  } catch (error) {
    console.error('Review timesheet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrUpdateTimesheet,
  getMyTimesheets,
  getTimesheetById,
  submitTimesheet,
  getPendingTimesheets,
  approveOrRejectTimesheet
};
