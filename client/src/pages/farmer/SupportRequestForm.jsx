import React, { useState } from 'react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';

const SupportRequestForm = () => {
  const [subject, setSubject] = useState('');
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
    if (subject.trim().length < 3) {
      setError('Subject must be at least 3 characters.');
      setLoading(false);
      return;
    }
    if (message.trim().length < 5) {
      setError('Message must be at least 5 characters.');
      setLoading(false);
      return;
    }
    try {
      await ApiService.submitSupportRequest(subject, message);
      setSuccess('Your support request has been submitted!');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError('Failed to submit support request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Support Request</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            style={{ width: '100%', fontSize: 16, marginBottom: 10 }}
            placeholder="Subject"
            required
            minLength={3}
            disabled={loading}
          />
        </div>
        <div>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            style={{ width: '100%', fontSize: 16 }}
            placeholder="Describe your issue..."
            required
            minLength={5}
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading || subject.length < 3 || message.length < 5}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      {success && <p style={{ color: 'green', marginTop: 10 }}>{success}</p>}
      {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
    </div>
  );
};

export default SupportRequestForm; 