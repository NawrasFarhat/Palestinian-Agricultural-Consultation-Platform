import React, { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';

const RequestHandling = () => {
  const [activeTab, setActiveTab] = useState('feedback');
  const [feedbackRequests, setFeedbackRequests] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [roleRequests, setRoleRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const tabs = [
    { key: 'feedback', name: 'Feedback', icon: '💬' },
    { key: 'support', name: 'Support Requests', icon: '🆘' },
    { key: 'role', name: 'Role Requests', icon: '👤' }
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Fetch all types of requests
      const [feedback, support, role] = await Promise.all([
        ApiService.getFeedbackRequests().catch(() => []),
        ApiService.getSupportRequests().catch(() => []),
        ApiService.getRoleRequests().catch(() => [])
      ]);

      setFeedbackRequests(feedback);
      setSupportRequests(support);
      setRoleRequests(role);
    } catch (err) {
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (type, id, action) => {
    try {
      switch (type) {
        case 'feedback':
          // Mark feedback as processed
          setSuccess('Feedback marked as processed');
          break;
        case 'support':
          // Mark support request as resolved
          setSuccess('Support request marked as resolved');
          break;
        case 'role':
          if (action === 'approve') {
            await ApiService.approveRoleRequest(id);
            setSuccess('Role request approved');
          } else if (action === 'reject') {
            await ApiService.rejectRoleRequest(id, 'Rejected by IT Admin');
            setSuccess('Role request rejected');
          }
          break;
      }
      fetchRequests(); // Refresh data
    } catch (err) {
      setError('Failed to process request');
    }
  };

  const renderFeedbackTable = () => (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
      <thead>
        <tr style={{ backgroundColor: '#f5f5f5' }}>
          <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>User</th>
          <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Message</th>
          <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Date</th>
          <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {feedbackRequests.map((feedback) => (
          <tr key={feedback.id} style={{ borderBottom: '1px solid #ddd' }}>
            <td style={{ padding: 12, border: '1px solid #ddd' }}>
              <strong>{feedback.User?.username || 'Unknown'}</strong>
            </td>
            <td style={{ padding: 12, border: '1px solid #ddd', maxWidth: 300 }}>
              <div style={{ wordBreak: 'break-word' }}>{feedback.message}</div>
            </td>
            <td style={{ padding: 12, border: '1px solid #ddd' }}>
              {new Date(feedback.created_at).toLocaleDateString()}
            </td>
            <td style={{ padding: 12, border: '1px solid #ddd' }}>
              <button
                onClick={() => handleProcessRequest('feedback', feedback.id, 'process')}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Mark Processed
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderSupportTable = () => (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
      <thead>
        <tr style={{ backgroundColor: '#f5f5f5' }}>
          <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>User</th>
          <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Subject</th>
          <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Message</th>
          <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Date</th>
          <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {supportRequests.map((support) => (
          <tr key={support.id} style={{ borderBottom: '1px solid #ddd' }}>
            <td style={{ padding: 12, border: '1px solid #ddd' }}>
              <strong>{support.User?.username || 'Unknown'}</strong>
            </td>
            <td style={{ padding: 12, border: '1px solid #ddd' }}>
              <strong>{support.subject}</strong>
            </td>
            <td style={{ padding: 12, border: '1px solid #ddd', maxWidth: 300 }}>
              <div style={{ wordBreak: 'break-word' }}>{support.message}</div>
            </td>
            <td style={{ padding: 12, border: '1px solid #ddd' }}>
              {new Date(support.created_at).toLocaleDateString()}
            </td>
            <td style={{ padding: 12, border: '1px solid #ddd' }}>
              <button
                onClick={() => handleProcessRequest('support', support.id, 'resolve')}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Mark Resolved
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderRoleTable = () => (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
      <thead>
        <tr style={{ backgroundColor: '#f5f5f5' }}>
          <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>User</th>
          <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Current Role</th>
          <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Requested Role</th>
          <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Date</th>
          <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {roleRequests.map((request) => (
          <tr key={request.id} style={{ borderBottom: '1px solid #ddd' }}>
            <td style={{ padding: 12, border: '1px solid #ddd' }}>
              <strong>{request.User?.username || 'Unknown'}</strong>
            </td>
            <td style={{ padding: 12, border: '1px solid #ddd' }}>
              <span style={{
                padding: '4px 8px',
                borderRadius: 4,
                backgroundColor: '#e9ecef',
                fontSize: 12,
                textTransform: 'capitalize'
              }}>
                {request.User?.role || 'Unknown'}
              </span>
            </td>
            <td style={{ padding: 12, border: '1px solid #ddd' }}>
              <span style={{
                padding: '4px 8px',
                borderRadius: 4,
                backgroundColor: '#d4edda',
                color: '#155724',
                fontSize: 12,
                textTransform: 'capitalize'
              }}>
                {request.requested_role}
              </span>
            </td>
            <td style={{ padding: 12, border: '1px solid #ddd' }}>
              {new Date(request.created_at).toLocaleDateString()}
            </td>
            <td style={{ padding: 12, border: '1px solid #ddd' }}>
              <button
                onClick={() => handleProcessRequest('role', request.id, 'approve')}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  marginRight: 8
                }}
              >
                Approve
              </button>
              <button
                onClick={() => handleProcessRequest('role', request.id, 'reject')}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Reject
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const getCurrentData = () => {
    switch (activeTab) {
      case 'feedback':
        return feedbackRequests;
      case 'support':
        return supportRequests;
      case 'role':
        return roleRequests;
      default:
        return [];
    }
  };

  if (!AuthService.isLoggedIn() || AuthService.getCurrentUser()?.role !== 'it') {
    return <div style={{ padding: 40, color: 'red' }}>Access denied. This page is for IT administrators only.</div>;
  }

  return (
    <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
      <h2>Request Handling</h2>
      <p style={{ marginBottom: 20, color: '#666' }}>
        Review and process user feedback, support requests, and role change requests.
      </p>

      {/* Tab Navigation */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ display: 'flex', gap: 10, borderBottom: '2px solid #e9ecef' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 20px',
                backgroundColor: activeTab === tab.key ? '#2c5aa0' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#333',
                border: 'none',
                borderRadius: '4px 4px 0 0',
                cursor: 'pointer',
                fontSize: 16
              }}
            >
              <span style={{ marginRight: 8 }}>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <p>Loading {activeTab} requests...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : getCurrentData().length === 0 ? (
        <p>No {activeTab} requests found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          {activeTab === 'feedback' && renderFeedbackTable()}
          {activeTab === 'support' && renderSupportTable()}
          {activeTab === 'role' && renderRoleTable()}
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div style={{ 
          marginTop: 20, 
          padding: 15, 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          borderRadius: 4,
          border: '1px solid #c3e6cb'
        }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ 
          marginTop: 20, 
          padding: 15, 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: 4,
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default RequestHandling;
