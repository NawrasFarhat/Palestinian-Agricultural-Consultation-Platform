import React, { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';

const RoleChangeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchRoleRequests();
  }, []);

  const fetchRoleRequests = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getRoleRequests();
      setRequests(data);
    } catch (err) {
      setError('Failed to fetch role change requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm('Are you sure you want to approve this role change request?')) {
      return;
    }

    try {
      await ApiService.approveRoleRequest(requestId);
      setSuccess('Role change request approved successfully!');
      fetchRoleRequests(); // Refresh the list
    } catch (err) {
      setError('Failed to approve role change request');
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      await ApiService.rejectRoleRequest(requestId, rejectReason);
      setSuccess('Role change request rejected successfully!');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRequest(null);
      fetchRoleRequests(); // Refresh the list
    } catch (err) {
      setError('Failed to reject role change request');
    }
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedRequest(null);
    setRejectReason('');
  };

  if (!AuthService.isLoggedIn() || AuthService.getCurrentUser()?.role !== 'manager') {
    return <div style={{ padding: 40, color: 'red' }}>Access denied. This page is for managers only.</div>;
  }

  return (
    <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
      <h2>Role Change Requests</h2>
      <p style={{ marginBottom: 20, color: '#666' }}>
        Review and manage pending role change requests from users.
      </p>

      {loading ? (
        <p>Loading role change requests...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : requests.length === 0 ? (
        <p>No pending role change requests found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>User</th>
                <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Current Role</th>
                <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Requested Role</th>
                <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Request Date</th>
                <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
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
                      onClick={() => handleApprove(request.id)}
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
                      onClick={() => openRejectModal(request)}
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

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: 30,
            borderRadius: 8,
            maxWidth: 500,
            width: '90%'
          }}>
            <h3>Reject Role Change Request</h3>
            <p style={{ marginBottom: 20 }}>
              Rejecting role change request for <strong>{selectedRequest.User?.username}</strong> 
              from <strong>{selectedRequest.User?.role}</strong> to <strong>{selectedRequest.requested_role}</strong>
            </p>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
                Reason for Rejection *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
                style={{
                  width: '100%',
                  padding: 10,
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  fontSize: 16
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={closeRejectModal}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedRequest.id)}
                disabled={!rejectReason.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: !rejectReason.trim() ? '#ccc' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: !rejectReason.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleChangeRequests; 