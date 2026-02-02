import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { timesheetService } from '../services/timesheetService';
import { Timesheet, TimesheetEntry } from '../types';
import { getWeekDates, getDaysOfWeek, formatDate } from '../utils/dateUtils';
import './TimesheetForm.css';

const TimesheetForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [weekStart, setWeekStart] = useState(getWeekDates().weekStartString);
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);

  useEffect(() => {
    const initializeEntries = () => {
      const days = getDaysOfWeek();
      const initialEntries: TimesheetEntry[] = days.map(day => ({
        day: day as any,
        hours: 0,
        project: '',
        description: ''
      }));
      setEntries(initialEntries);
    };

    if (id) {
      loadTimesheet();
    } else {
      initializeEntries();
    }
  }, [id]);

  const loadTimesheet = async () => {
    try {
      setLoading(true);
      const response = await timesheetService.getTimesheetById(id!);
      setTimesheet(response.timesheet);
      setWeekStart(response.timesheet.weekStartDate.split('T')[0]);
      setEntries(response.timesheet.entries);
    } catch (error) {
      console.error('Error loading timesheet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEntryChange = (index: number, field: keyof TimesheetEntry, value: string | number) => {
    const updatedEntries = [...entries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: field === 'hours' ? Number(value) : value
    };
    setEntries(updatedEntries);
  };

  const handleSave = async () => {
    const validEntries = entries.filter(entry => entry.hours > 0 && entry.project.trim());
    
    if (validEntries.length === 0) {
      alert('Please add at least one entry with hours and project name');
      return;
    }

    try {
      setSaving(true);
      const response = await timesheetService.createOrUpdateTimesheet({
        weekStartDate: weekStart,
        entries: validEntries
      });
      
      alert(response.message);
      if (!id) {
        navigate(`/timesheets/${response.timesheet._id}`);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving timesheet');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (timesheet && timesheet.status !== 'Draft') {
      alert('Only draft timesheets can be submitted');
      return;
    }

    const validEntries = entries.filter(entry => entry.hours > 0 && entry.project.trim());
    
    if (validEntries.length === 0) {
      alert('Please add at least one entry with hours and project name before submitting');
      return;
    }

    try {
      setSaving(true);
      
      // First save if it's a new timesheet or update existing
      const response = await timesheetService.createOrUpdateTimesheet({
        weekStartDate: weekStart,
        entries: validEntries
      });
      
      // Then submit it
      const submitResponse = await timesheetService.submitTimesheet(response.timesheet._id);
      
      alert('Timesheet submitted successfully!');
      setTimesheet(submitResponse.timesheet);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error submitting timesheet');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading timesheet...</div>;
  }

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

  return (
    <div className="timesheet-form">
      <div className="form-header">
        <h2>{id ? 'Edit Timesheet' : 'New Timesheet'}</h2>
        {timesheet && (
          <div className="timesheet-status">
            <span className={`status ${timesheet.status.toLowerCase()}`}>
              {timesheet.status}
            </span>
          </div>
        )}
      </div>

      <div className="week-selector">
        <label htmlFor="weekStart">Week Starting:</label>
        <input
          type="date"
          id="weekStart"
          value={weekStart}
          onChange={(e) => setWeekStart(e.target.value)}
          disabled={timesheet ? timesheet.status !== 'Draft' : false}
        />
        {weekStart && (
          <span className="week-range">
            {formatDate(weekStart)} - {formatDate(getWeekDates(new Date(weekStart)).weekEndString)}
          </span>
        )}
      </div>

      <div className="entries-container">
        <h3>Daily Entries</h3>
        <div className="entries-grid">
          <div className="grid-header">Day</div>
          <div className="grid-header">Hours</div>
          <div className="grid-header">Project/Task</div>
          <div className="grid-header">Description</div>

          {entries.map((entry, index) => (
            <React.Fragment key={entry.day}>
              <div className="day-label">{entry.day}</div>
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={entry.hours}
                onChange={(e) => handleEntryChange(index, 'hours', e.target.value)}
                className="hours-input"
                disabled={timesheet ? timesheet.status !== 'Draft' : false}
              />
              <input
                type="text"
                value={entry.project}
                onChange={(e) => handleEntryChange(index, 'project', e.target.value)}
                placeholder="Project name"
                className="project-input"
                disabled={timesheet ? timesheet.status !== 'Draft' : false}
              />
              <input
                type="text"
                value={entry.description || ''}
                onChange={(e) => handleEntryChange(index, 'description', e.target.value)}
                placeholder="Optional description"
                className="description-input"
                disabled={timesheet ? timesheet.status !== 'Draft' : false}
              />
            </React.Fragment>
          ))}
        </div>

        <div className="total-hours">
          <strong>Total Hours: {totalHours}</strong>
        </div>
      </div>

      <div className="form-actions">
        <button
          onClick={handleSave}
          disabled={saving || (timesheet?.status !== 'Draft' && timesheet !== null)}
          className="save-btn"
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        
        {(!timesheet || timesheet.status === 'Draft') && (
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="submit-btn"
          >
            {saving ? 'Submitting...' : 'Submit for Approval'}
          </button>
        )}
        
        <button
          onClick={() => navigate('/timesheets')}
          className="cancel-btn"
        >
          Back to Timesheets
        </button>
      </div>

      {timesheet?.rejectionReason && (
        <div className="rejection-reason">
          <h4>Rejection Reason:</h4>
          <p>{timesheet.rejectionReason}</p>
        </div>
      )}
    </div>
  );
};

export default TimesheetForm;
