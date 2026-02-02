import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { timeOffService } from '../services/timeOffService';
import { TimeOffRequest } from '../types';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import './TimeOffList.css';

const TimeOffList: React.FC = () => {
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadRequests();
  }, [currentPage, statusFilter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await timeOffService.getMyTimeOffRequests({
        page: currentPage,
        limit: 10,
        ...(statusFilter && { status: statusFilter })
      });
      
      setRequests(response.requests || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error loading time off requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return '#27ae60';
      case 'Rejected': return '#e74c3c';
      case 'Pending': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <div className="loading">Loading time off requests...</div>;
  }

  return (
    <div className="timeoff-list">
      <div className="list-header">
        <h2>My Time Off Requests</h2>
        <Link to="/time-off/new" className="new-btn">
          New Request
        </Link>
      </div>

      <div className="filters">
        <label htmlFor="statusFilter">Filter by Status:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {requests.length > 0 ? (
        <>
          <div className="requests-grid">
            <div className="grid-header">From Date</div>
            <div className="grid-header">To Date</div>
            <div className="grid-header">Days</div>
            <div className="grid-header">Status</div>
            <div className="grid-header">Submitted</div>
            <div className="grid-header">Actions</div>

            {requests.map((request) => (
              <React.Fragment key={request._id}>
                <div className="from-date">{formatDate(request.fromDate)}</div>
                <div className="to-date">{formatDate(request.toDate)}</div>
                <div className="days">{request.daysRequested}</div>
                <div className="status">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(request.status) }}
                  >
                    {request.status}
                  </span>
                </div>
                <div className="submitted-date">
                  {formatDateTime(request.createdAt)}
                </div>
                <div className="actions">
                  <button
                    onClick={() => alert(request.reason)}
                    className="view-btn"
                  >
                    View Reason
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
          <p>No time off requests found. Create your first request!</p>
          <Link to="/time-off/new" className="new-btn">
            Create Request
          </Link>
        </div>
      )}
    </div>
  );
};

export default TimeOffList;
