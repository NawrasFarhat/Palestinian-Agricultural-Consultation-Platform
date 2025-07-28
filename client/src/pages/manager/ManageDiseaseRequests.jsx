import React, { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import styles from "../../styles/ManageDiseaseRequests.module.css";

const ManageDiseaseRequests = () => {
  const [pendingChanges, setPendingChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedChange, setSelectedChange] = useState(null);

  useEffect(() => {
    if (!AuthService.isLoggedIn() || AuthService.getCurrentUser()?.role !== 'manager') {
      return;
    }
    fetchPendingChanges();
  }, []);

  const fetchPendingChanges = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getPendingDiseaseChanges();
      setPendingChanges(data);
    } catch (err) {
      setError('Failed to fetch pending changes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (changeId) => {
    try {
      await ApiService.approveDiseaseChange(changeId);
      setSuccess('Disease change approved successfully');
      fetchPendingChanges();
    } catch (err) {
      setError('Failed to approve change');
    }
  };

  const handleReject = async (changeId) => {
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    try {
      await ApiService.rejectDiseaseChange(changeId, rejectReason);
      setSuccess('Disease change rejected successfully');
      setRejectReason('');
      setSelectedChange(null);
      fetchPendingChanges();
    } catch (err) {
      setError('Failed to reject change');
    }
  };

  const openRejectModal = (change) => {
    setSelectedChange(change);
    setRejectReason('');
  };

  const closeRejectModal = () => {
    setSelectedChange(null);
    setRejectReason('');
  };

  if (!AuthService.isLoggedIn() || AuthService.getCurrentUser()?.role !== 'manager') {
    return <div style={{ padding: 40, color: 'red' }}>Access denied. This page is for managers only.</div>;
  }

  if (loading) {
    return <div style={{ padding: 40 }}>Loading pending changes...</div>;
  }

  return (
    <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
      <h2>Manage Disease Change Requests</h2>
      
      {error && (
        <div style={{ 
          padding: 15, 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: 4, 
          marginBottom: 20 
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          padding: 15, 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          borderRadius: 4, 
          marginBottom: 20 
        }}>
          {success}
        </div>
      )}

      {pendingChanges.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          No pending disease change requests
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {pendingChanges.map((change) => (
            <div key={change.id} style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 20,
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                <div>
                  <h3 style={{ margin: '0 0 10px 0', color: '#2c5aa0' }}>
                    {change.change_type === 'disease_add' ? 'New Disease Request' : 'Disease Edit Request'}
                  </h3>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Disease:</strong> {change.disease_name}
                  </p>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Submitted by:</strong> {change.engineer_username}
                  </p>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Date:</strong> {new Date(change.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => handleApprove(change.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(change)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 15 }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Disease Details:</h4>
                <div style={{ backgroundColor: 'white', padding: 15, borderRadius: 4 }}>
                  <p><strong>Name:</strong> {change.disease_data.name}</p>
                  <p><strong>Symptoms:</strong> {change.disease_data.symptoms}</p>
                  <p><strong>Solution:</strong> {change.disease_data.solution}</p>
                  <div>
                    <strong>Questions:</strong>
                    <ul style={{ margin: '5px 0', paddingLeft: 20 }}>
                      {change.disease_data.questions.map((question, index) => (
                        <li key={index}>{question}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {selectedChange && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
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
            <h3>Reject Disease Change Request</h3>
            <p>Please provide a reason for rejecting this request:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              style={{
                width: '100%',
                minHeight: 100,
                padding: 10,
                border: '1px solid #ccc',
                borderRadius: 4,
                marginBottom: 20
              }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={closeRejectModal}
                style={{
                  padding: '8px 16px',
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
                onClick={() => handleReject(selectedChange.id)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDiseaseRequests;
