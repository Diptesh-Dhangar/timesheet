const mongoose = require('mongoose');

const timesheetEntrySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  hours: {
    type: Number,
    required: [true, 'Hours are required'],
    min: [0, 'Hours cannot be negative'],
    max: [24, 'Hours cannot exceed 24 per day']
  },
  project: {
    type: String,
    required: [true, 'Project/Task name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
});

const timesheetSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  entries: [timesheetEntrySchema],
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  totalHours: {
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

timesheetSchema.pre('save', function(next) {
  if (this.entries && this.entries.length > 0) {
    this.totalHours = this.entries.reduce((total, entry) => total + entry.hours, 0);
  } else {
    this.totalHours = 0;
  }
  next();
});

timesheetSchema.index({ employee: 1, weekStartDate: 1 }, { unique: true });

module.exports = mongoose.model('Timesheet', timesheetSchema);
