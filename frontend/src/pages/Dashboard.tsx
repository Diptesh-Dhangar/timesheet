import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { timesheetService } from '../services/timesheetService';
import { timeOffService } from '../services/timeOffService';
import { Timesheet, TimeOffRequest } from '../types';
import { formatDate } from '../utils/dateUtils';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentTimesheets, setRecentTimesheets] = useState<Timesheet[]>([]);
  const [recentTimeOff, setRecentTimeOff] = useState<TimeOffRequest[]>([]);
  const [pendingCount, setPendingCount] = useState({ timesheets: 0, timeOff: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [timesheetsRes, timeOffRes] = await Promise.all([
          timesheetService.getMyTimesheets({ limit: 5 }),
          timeOffService.getMyTimeOffRequests({ limit: 5 })
        ]);

        setRecentTimesheets(timesheetsRes.timesheets || []);
        setRecentTimeOff(timeOffRes.requests || []);

        if (user?.role === 'manager') {
          const [pendingTimesheetsRes, pendingTimeOffRes] = await Promise.all([
            timesheetService.getPendingTimesheets({ limit: 1 }),
            timeOffService.getPendingTimeOffRequests({ limit: 1 })
          ]);

          setPendingCount({
            timesheets: pendingTimesheetsRes.total || 0,
            timeOff: pendingTimeOffRes.total || 0
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return '#27ae60';
      case 'Rejected': return '#e74c3c';
      case 'Submitted': return '#f39c12';
      case 'Pending': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.firstName}!</h1>
      
      <div className="dashboard-cards">
        <div className="card">
          <h3>My Recent Timesheets</h3>
          {recentTimesheets.length > 0 ? (
            <div className="recent-list">
              {recentTimesheets.map(timesheet => (
                <div key={timesheet._id} className="recent-item">
                  <div className="item-info">
                    <span>{formatDate(timesheet.weekStartDate)} - {formatDate(timesheet.weekEndDate)}</span>
                    <span className="hours">{timesheet.totalHours}h</span>
                  </div>
                  <span 
                    className="status" 
                    style={{ color: getStatusColor(timesheet.status) }}
                  >
                    {timesheet.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p>No timesheets yet</p>
          )}
        </div>

        <div className="card">
          <h3>My Time Off Requests</h3>
          {recentTimeOff.length > 0 ? (
            <div className="recent-list">
              {recentTimeOff.map(request => (
                <div key={request._id} className="recent-item">
                  <div className="item-info">
                    <span>{formatDate(request.fromDate)} - {formatDate(request.toDate)}</span>
                    <span className="days">{request.daysRequested} days</span>
                  </div>
                  <span 
                    className="status" 
                    style={{ color: getStatusColor(request.status) }}
                  >
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p>No time off requests</p>
          )}
        </div>

        {user?.role === 'manager' && (
          <div className="card manager-card">
            <h3>Manager Dashboard</h3>
            <div className="pending-counts">
              <div className="pending-item">
                <span>Pending Timesheets:</span>
                <span className="count">{pendingCount.timesheets}</span>
              </div>
              <div className="pending-item">
                <span>Pending Time Off:</span>
                <span className="count">{pendingCount.timeOff}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
