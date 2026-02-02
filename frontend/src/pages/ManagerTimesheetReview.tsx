import React, { useState, useEffect } from 'react';
import { timesheetService } from '../services/timesheetService';
import { Timesheet } from '../types';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import './ManagerTimesheetReview.css';

const ManagerTimesheetReview: React.FC = () => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [reviewForm, setReviewForm] = useState<{
    action: 'approve' | 'reject' | '';
    rejectionReason: string;
  }>({
    action: '',
    rejectionReason: ''
  });
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    loadPendingTimesheets();
  }, [currentPage]);

  const loadPendingTimesheets = async () => {
    try {
      setLoading(true);
      const response = await timesheetService.getPendingTimesheets({
        page: currentPage,
        limit: 10
      });
      
      setTimesheets(response.timesheets || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error loading pending timesheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTimesheet = async (timesheet: Timesheet) => {
    try {
      const response = await timesheetService.getTimesheetById(timesheet._id);
      setSelectedTimesheet(response.timesheet);
      setReviewForm({ action: '', rejectionReason: '' });
    } catch (error) {
      console.error('Error loading timesheet details:', error);
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTimesheet || !reviewForm.action) {
      alert('Please select an action');
      return;
    }

    if (reviewForm.action === 'reject' && !reviewForm.rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setReviewing(true);
      await timesheetService.approveOrRejectTimesheet(selectedTimesheet._id, {
        action: reviewForm.action as 'approve' | 'reject',
        rejectionReason: reviewForm.rejectionReason
      });
      
      alert(`Timesheet ${reviewForm.action}d successfully`);
      setSelectedTimesheet(null);
      setReviewForm({ action: '', rejectionReason: '' });
      loadPendingTimesheets();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error reviewing timesheet');
    } finally {
      setReviewing(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <div className="loading">Loading pending timesheets...</div>;
  }

  return (
    <div className="manager-review">
      <h2>Review Timesheets</h2>

      {!selectedTimesheet ? (
        <>
          {timesheets.length > 0 ? (
            <>
              <div className="timesheets-grid">
                <div className="grid-header">Employee</div>
                <div className="grid-header">Week Period</div>
                <div className="grid-header">Total Hours</div>
                <div className="grid-header">Submitted</div>
                <div className="grid-header">Actions</div>

                {timesheets.map((timesheet) => (
                  <React.Fragment key={timesheet._id}>
                    <div className="employee">
                      {timesheet.employee.firstName} {timesheet.employee.lastName}
                      <br />
                      <small>{timesheet.employee.employeeId}</small>
                    </div>
                    <div className="week-period">
                      {formatDate(timesheet.weekStartDate)} - {formatDate(timesheet.weekEndDate)}
                    </div>
                    <div className="total-hours">{timesheet.totalHours}h</div>
                    <div className="submitted-date">
                      {formatDateTime(timesheet.submittedAt!)}
                    </div>
                    <div className="actions">
                      <button
                        onClick={() => handleViewTimesheet(timesheet)}
                        className="review-btn"
                      >
                        Review
                      </button>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="page-btn"
                  >
                    Previous
                  </button>
                  
                  <span className="page-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="page-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>No pending timesheets to review.</p>
            </div>
          )}
        </>
      ) : (
        <div className="timesheet-detail">
          <div className="detail-header">
            <h3>Timesheet Details</h3>
            <button
              onClick={() => setSelectedTimesheet(null)}
              className="back-btn"
            >
              Back to List
            </button>
          </div>

          <div className="employee-info">
            <strong>Employee:</strong> {selectedTimesheet.employee.firstName} {selectedTimesheet.employee.lastName}
            <br />
            <strong>Employee ID:</strong> {selectedTimesheet.employee.employeeId}
            <br />
            <strong>Department:</strong> {selectedTimesheet.employee.department || 'N/A'}
            <br />
            <strong>Week:</strong> {formatDate(selectedTimesheet.weekStartDate)} - {formatDate(selectedTimesheet.weekEndDate)}
            <br />
            <strong>Total Hours:</strong> {selectedTimesheet.totalHours}h
          </div>

          <div className="entries-section">
            <h4>Daily Entries</h4>
            <div className="entries-grid">
              <div className="grid-header">Day</div>
              <div className="grid-header">Hours</div>
              <div className="grid-header">Project/Task</div>
              <div className="grid-header">Description</div>

              {selectedTimesheet.entries.map((entry, index) => (
                <React.Fragment key={index}>
                  <div className="day">{entry.day}</div>
                  <div className="hours">{entry.hours}</div>
                  <div className="project">{entry.project}</div>
                  <div className="description">{entry.description || '-'}</div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <form onSubmit={handleReview} className="review-form">
            <h4>Review Action</h4>
            
            <div className="form-group">
              <label>
                <input
                  type="radio"
                  value="approve"
                  checked={reviewForm.action === 'approve'}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, action: e.target.value as 'approve' | 'reject' | '' }))}
                />
                Approve
              </label>
              <label>
                <input
                  type="radio"
                  value="reject"
                  checked={reviewForm.action === 'reject'}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, action: e.target.value as 'approve' | 'reject' | '' }))}
                />
                Reject
              </label>
            </div>

            {reviewForm.action === 'reject' && (
              <div className="form-group">
                <label htmlFor="rejectionReason">Rejection Reason:</label>
                <textarea
                  id="rejectionReason"
                  value={reviewForm.rejectionReason}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, rejectionReason: e.target.value }))}
                  rows={3}
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                disabled={!reviewForm.action || reviewing}
                className="submit-btn"
              >
                {reviewing ? 'Processing...' : ` ${reviewForm.action === 'approve' ? 'Approve' : 'Reject'} Timesheet`}
              </button>
              <button
                type="button"
                onClick={() => setSelectedTimesheet(null)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManagerTimesheetReview;
