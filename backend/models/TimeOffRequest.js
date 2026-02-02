const mongoose = require('mongoose');

const timeOffRequestSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fromDate: {
    type: Date,
    required: [true, 'From date is required']
  },
  toDate: {
    type: Date,
    required: [true, 'To date is required'],
    validate: {
      validator: function(value) {
        return value >= this.fromDate;
      },
      message: 'To date must be after or equal to from date'
    }
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [1000, 'Reason cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
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
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  daysRequested: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

timeOffRequestSchema.pre('save', function(next) {
  if (this.fromDate && this.toDate) {
    const timeDiff = this.toDate.getTime() - this.fromDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    this.daysRequested = daysDiff;
  }
  next();
});

module.exports = mongoose.model('TimeOffRequest', timeOffRequestSchema);
