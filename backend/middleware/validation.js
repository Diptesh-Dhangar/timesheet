const { body } = require('express-validator');

const validateRegister = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('role').optional().isIn(['employee', 'manager']).withMessage('Role must be either employee or manager')
];

const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const validateTimesheet = [
  body('weekStartDate').isISO8601().withMessage('Please provide a valid week start date'),
  body('entries').isArray({ min: 1 }).withMessage('At least one entry is required'),
  body('entries.*.day').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Invalid day'),
  body('entries.*.hours').isFloat({ min: 0, max: 24 }).withMessage('Hours must be between 0 and 24'),
  body('entries.*.project').trim().notEmpty().withMessage('Project/Task name is required'),
  body('entries.*.description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
];

const validateTimeOffRequest = [
  body('fromDate').isISO8601().withMessage('Please provide a valid from date'),
  body('toDate').isISO8601().withMessage('Please provide a valid to date'),
  body('reason').trim().notEmpty().withMessage('Reason is required').isLength({ max: 1000 }).withMessage('Reason cannot exceed 1000 characters')
];

const validateReview = [
  body('action').isIn(['approve', 'reject']).withMessage('Action must be either approve or reject'),
  body('rejectionReason').optional().trim().isLength({ max: 500 }).withMessage('Rejection reason cannot exceed 500 characters')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateTimesheet,
  validateTimeOffRequest,
  validateReview
};
