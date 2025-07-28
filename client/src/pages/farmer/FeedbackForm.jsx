import React, { useState } from 'react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';

const FeedbackForm = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (!AuthService.isLoggedIn() || AuthService.getCurrentUser()?.role !== 'farmer') {
    return <div style={{ padding: 40, color: 'red' }}>Access denied. This page is for farmers only.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      await ApiService.submitFeedback(message);
      setSuccess('Thank you for your feedback!');
      setMessage('');
    } catch (err) {
      setError('Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Feedback</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            style={{ width: '100%', fontSize: 16 }}
            placeholder="Enter your feedback..."
            required
            minLength={5}
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading || message.length < 5}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      {success && <p style={{ color: 'green', marginTop: 10 }}>{success}</p>}
      {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
    </div>
  );
};

export default FeedbackForm; 