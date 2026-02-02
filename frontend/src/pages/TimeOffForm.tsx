import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { timeOffService } from '../services/timeOffService';
import { formatDate, calculateDaysBetween } from '../utils/dateUtils';
import './TimeOffForm.css';

const TimeOffForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [daysRequested, setDaysRequested] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'fromDate' || name === 'toDate') {
      const updated = { ...formData, [name]: value };
      if (updated.fromDate && updated.toDate) {
        setDaysRequested(calculateDaysBetween(updated.fromDate, updated.toDate));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fromDate || !formData.toDate || !formData.reason.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      alert('From date cannot be after to date');
      return;
    }

    try {
      setLoading(true);
      const response = await timeOffService.createTimeOffRequest(formData);
      alert(response.message);
      navigate('/time-off');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating time off request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="timeoff-form">
      <h2>Request Time Off</h2>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fromDate">From Date *</label>
            <input
              type="date"
              id="fromDate"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="toDate">To Date *</label>
            <input
              type="date"
              id="toDate"
              name="toDate"
              value={formData.toDate}
              onChange={handleChange}
              min={formData.fromDate}
              required
            />
          </div>
        </div>

        {daysRequested > 0 && (
          <div className="days-summary">
            <strong>Days Requested: {daysRequested}</strong>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="reason">Reason *</label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={4}
            placeholder="Please provide a reason for your time off request..."
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/time-off')}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TimeOffForm;
