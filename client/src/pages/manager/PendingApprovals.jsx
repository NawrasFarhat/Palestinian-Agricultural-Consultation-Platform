import React, { useEffect, useState } from 'react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import styles from '../../styles/PendingApprovals.module.css';

const PendingApprovals = ({ onLogout }) => {
  const [pendingChanges, setPendingChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  if (!AuthService.isLoggedIn() || AuthService.getCurrentUser()?.role !== 'manager') {
    return <div style={{ padding: 40, color: 'red' }}>Access denied. This page is for managers only.</div>;
  }

  const fetchPendingChanges = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getPendingChanges();
      setPendingChanges(data);
    } catch (err) {
      setError('Failed to fetch pending changes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingChanges();
  }, []);

  const handleApprove = async (submission) => {
    if (!window.confirm(`Approve submission for disease: ${submission.disease_name}?`)) return;
    try {
      await ApiService.approveSubmission(submission.id);
      setSuccess('Submission approved successfully');
      fetchPendingChanges();
    } catch (err) {
      setError('Failed to approve submission');
    }
  };

  const handleReject = async (submission) => {
    setSelectedSubmission(submission);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!selectedSubmission) return;
    try {
      await ApiService.rejectSubmission(selectedSubmission.id, rejectReason);
      setSuccess('Submission rejected successfully');
      setShowRejectModal(false);
      setSelectedSubmission(null);
      setRejectReason('');
      fetchPendingChanges();
    } catch (err) {
      setError('Failed to reject submission');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pending Approvals</h1>
      {loading ? (
        <div className={styles.message}>Loading...</div>
      ) : error ? (
        <div className={`${styles.message} ${styles.error}`}>{error}</div>
      ) : pendingChanges.length === 0 ? (
        <div className={styles.message}>No pending approvals found.</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Disease Name</th>
                <th>Engineer</th>
                <th>Submitted At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingChanges.map((submission) => (
                <tr key={submission.id}>
                  <td>{submission.disease_name || 'Unknown'}</td>
                  <td>{submission.engineer_username || 'Unknown'}</td>
                  <td>{new Date(submission.submitted_at).toLocaleString()}</td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button onClick={() => handleApprove(submission)} className={`${styles.actionBtn} ${styles.approve}`}>
                        Approve
                      </button>
                      <button onClick={() => handleReject(submission)} className={`${styles.actionBtn} ${styles.reject}`}>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {success && <div className={`${styles.message} ${styles.success}`}>{success}</div>}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Reject Submission</h3>
            <p>Disease: {selectedSubmission?.disease_name}</p>
            <p>Engineer: {selectedSubmission?.engineer_username}</p>
            <div>
              <label>Reason (optional):</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows="3"
                placeholder="Enter rejection reason..."
              />
            </div>
            <div className={styles.modalButtons}>
              <button onClick={confirmReject} className={styles.confirmReject}>
                Confirm Reject
              </button>
              <button onClick={() => {
                setShowRejectModal(false);
                setSelectedSubmission(null);
                setRejectReason('');
              }} className={styles.cancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApprovals; 