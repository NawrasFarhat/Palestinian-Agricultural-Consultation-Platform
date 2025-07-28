import React, { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import styles from '../../styles/ChangeUserRole.module.css';

const ChangeUserRole = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [newRole, setNewRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles = ['farmer', 'engineer', 'manager', 'it'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getUsersAsManager();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    if (!selectedUser || !newRole) {
      setError('Please select a user and a new role');
      setSubmitting(false);
      return;
    }

    try {
      await ApiService.changeUserRole(selectedUser, newRole);
      setSuccess(`User role changed successfully to ${newRole}!`);
      setSelectedUser('');
      setNewRole('');
      fetchUsers(); // Refresh the user list
    } catch (err) {
      setError('Failed to change user role. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!AuthService.isLoggedIn() || AuthService.getCurrentUser()?.role !== 'manager') {
    return <div style={{ padding: 40, color: 'red' }}>Access denied. This page is for managers only.</div>;
  }

  return (
    <div className={styles.container}>
      {/* Current Users Table */}
      <div className={styles.tableContainer} style={{ marginTop: 40 }}>
        <h3 className={styles.title}>Current Users</h3>
        {loading ? (
          <p>Loading users...</p>
        ) : error ? (
          <p className={styles.errorMessage}>{error}</p>
        ) : (
          <div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Current Role</th>
                  <th>User ID</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.username}</strong>
                    </td>
                    <td>
                      <span className={styles.roleBadge}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Success/Error Messages */}
      {success && (
        <div className={styles.successMessage}>
          {success}
        </div>
      )}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ChangeUserRole; 