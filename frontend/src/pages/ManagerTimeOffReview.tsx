import React, { useState, useEffect } from 'react';
import { timeOffService } from '../services/timeOffService';
import { TimeOffRequest } from '../types';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import './ManagerTimeOffReview.css';

const ManagerTimeOffReview: React.FC = () => {
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<TimeOffRequest | null>(null);
  const [reviewForm, setReviewForm] = useState<{
    action: 'approve' | 'reject' | '';
    rejectionReason: string;
  }>({
    action: '',
    rejectionReason: ''
  });
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    loadPendingRequests();
  }, [currentPage]);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await timeOffService.getPendingTimeOffRequests({
        page: currentPage,
        limit: 10
      });
      
      setRequests(response.requests || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error loading pending time off requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = async (request: TimeOffRequest) => {
    try {
      const response = await timeOffService.getTimeOffRequestById(request._id);
      setSelectedRequest(response.request);
      setReviewForm({ action: '', rejectionReason: '' });
    } catch (error) {
      console.error('Error loading request details:', error);
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRequest || !reviewForm.action) {
      alert('Please select an action');
      return;
    }

    if (reviewForm.action === 'reject' && !reviewForm.rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setReviewing(true);
      await timeOffService.approveOrRejectTimeOff(selectedRequest._id, {
        action: reviewForm.action as 'approve' | 'reject',
        rejectionReason: reviewForm.rejectionReason
      });
      
      alert(`Time off request ${reviewForm.action}d successfully`);
      setSelectedRequest(null);
      setReviewForm({ action: '', rejectionReason: '' });
      loadPendingRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error reviewing request');
    } finally {
      setReviewing(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <div className="loading">Loading pending time off requests...</div>;
  }

  return (
    <div className="manager-review">
      <h2>Review Time Off Requests</h2>

      {!selectedRequest ? (
        <>
          {requests.length > 0 ? (
            <>
              <div className="requests-grid">
                <div className="grid-header">Employee</div>
                <div className="grid-header">From Date</div>
                <div className="grid-header">To Date</div>
                <div className="grid-header">Days</div>
                <div className="grid-header">Submitted</div>
                <div className="grid-header">Actions</div>

                {requests.map((request) => (
                  <React.Fragment key={request._id}>
                    <div className="employee">
                      {request.employee.firstName} {request.employee.lastName}
                      <br />
                      <small>{request.employee.employeeId}</small>
                    </div>
                    <div className="from-date">{formatDate(request.fromDate)}</div>
                    <div className="to-date">{formatDate(request.toDate)}</div>
                    <div className="days">{request.daysRequested}</div>
                    <div className="submitted-date">
                      {formatDateTime(request.createdAt)}
                    </div>
                    <div className="actions">
                      <button
                        onClick={() => handleViewRequest(request)}
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
              <p>No pending time off requests to review.</p>
            </div>
          )}
        </>
      ) : (
        <div className="request-detail">
          <div className="detail-header">
            <h3>Time Off Request Details</h3>
            <button
              onClick={() => setSelectedRequest(null)}
              className="back-btn"
            >
              Back to List
            </button>
          </div>

          <div className="employee-info">
            <strong>Employee:</strong> {selectedRequest.employee.firstName} {selectedRequest.employee.lastName}
            <br />
            <strong>Employee ID:</strong> {selectedRequest.employee.employeeId}
            <br />
            <strong>Department:</strong> {selectedRequest.employee.department || 'N/A'}
            <br />
            <strong>From Date:</strong> {formatDate(selectedRequest.fromDate)}
            <br />
            <strong>To Date:</strong> {formatDate(selectedRequest.toDate)}
            <br />
            <strong>Days Requested:</strong> {selectedRequest.daysRequested}
            <br />
            <strong>Submitted:</strong> {formatDateTime(selectedRequest.createdAt)}
          </div>

          <div className="reason-section">
            <h4>Reason for Time Off</h4>
            <div className="reason-text">
              {selectedRequest.reason}
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
                {reviewing ? 'Processing...' : `${reviewForm.action === 'approve' ? 'Approve' : 'Reject'} Request`}
              </button>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
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

export default ManagerTimeOffReview;
