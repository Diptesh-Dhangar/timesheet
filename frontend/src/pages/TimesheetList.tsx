import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { timesheetService } from '../services/timesheetService';
import { Timesheet } from '../types';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import './TimesheetList.css';

const TimesheetList: React.FC = () => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadTimesheets();
  }, [currentPage, statusFilter]);

  const loadTimesheets = async () => {
    try {
      setLoading(true);
      const response = await timesheetService.getMyTimesheets({
        page: currentPage,
        limit: 10,
        ...(statusFilter && { status: statusFilter })
      });
      
      setTimesheets(response.timesheets || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error loading timesheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return '#27ae60';
      case 'Rejected': return '#e74c3c';
      case 'Submitted': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const createNewTimesheet = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const weekStart = monday.toISOString().split('T')[0];
    
    window.location.href = `/timesheets/new?week=${weekStart}`;
  };

  if (loading) {
    return <div className="loading">Loading timesheets...</div>;
  }

  return (
    <div className="timesheet-list">
      <div className="list-header">
        <h2>My Timesheets</h2>
        <button onClick={createNewTimesheet} className="new-btn">
          New Timesheet
        </button>
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
          <option value="Draft">Draft</option>
          <option value="Submitted">Submitted</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {timesheets.length > 0 ? (
        <>
          <div className="timesheets-grid">
            <div className="grid-header">Week Period</div>
            <div className="grid-header">Total Hours</div>
            <div className="grid-header">Status</div>
            <div className="grid-header">Last Updated</div>
            <div className="grid-header">Actions</div>

            {timesheets.map((timesheet) => (
              <React.Fragment key={timesheet._id}>
                <div className="week-period">
                  {formatDate(timesheet.weekStartDate)} - {formatDate(timesheet.weekEndDate)}
                </div>
                <div className="total-hours">{timesheet.totalHours}h</div>
                <div className="status">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(timesheet.status) }}
                  >
                    {timesheet.status}
                  </span>
                </div>
                <div className="updated-date">
                  {formatDateTime(timesheet.updatedAt)}
                </div>
                <div className="actions">
                  <Link
                    to={`/timesheets/${timesheet._id}`}
                    className="view-btn"
                  >
                    View/Edit
                  </Link>
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
          <p>No timesheets found. Create your first timesheet!</p>
          <button onClick={createNewTimesheet} className="new-btn">
            Create Timesheet
          </button>
        </div>
      )}
    </div>
  );
};

export default TimesheetList;
