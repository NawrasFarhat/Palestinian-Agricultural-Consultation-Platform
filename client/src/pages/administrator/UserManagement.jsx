import React, { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import styles from '../../styles/UserManagement.module.css';
import dbStyles from '../../styles/DatabaseManagement.module.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', role: '' });

  const roles = ['farmer', 'engineer', 'manager', 'it'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({ username: user.username, role: user.role });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await ApiService.updateUserRole(selectedUser.id, editForm.role);
      setSuccess(`User ${editForm.username} role updated to ${editForm.role} successfully!`);
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setError('Failed to update user role');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await ApiService.deleteUser(selectedUser.id);
      setSuccess(`User ${selectedUser.username} deleted successfully!`);
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  if (!AuthService.isLoggedIn() || AuthService.getCurrentUser()?.role !== 'it') {
    return <div style={{ padding: 40, color: 'red' }}>Access denied. This page is for IT administrators only.</div>;
  }

  const getRoleColor = (role) => {
    const colors = {
      farmer: '#28a745',
      engineer: '#17a2b8',
      manager: '#ffc107',
      it: '#dc3545'
    };
    return colors[role] || '#6c757d';
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>User Management</h2>
      <p style={{ marginBottom: 20, color: '#aab7a5', textAlign: 'center' }}>
        Manage all users in the system. View, edit roles, and delete user accounts.
      </p>
      {loading ? (
        <p className={styles.loading}>Loading users...</p>
      ) : error ? (
        <p className={styles.errorMessage}>{error}</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td><strong>{user.username}</strong></td>
                  <td>
                    <span className={styles.roleBadge}>{user.role}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleEditUser(user)}
                      className={styles.editBtn}
                    >
                      Edit Role
                    </button>
                    <button
                      onClick={() => openDeleteModal(user)}
                      className={styles.deleteBtn}
                    >
                      Delete
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
        <div className={styles.successMessage}>{success}</div>
      )}
      {error && (
        <div className={styles.errorMessage}>{error}</div>
      )}
      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
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
          <div className={dbStyles.modalContainer}>
            <h3 className={dbStyles.modalTitle}>Edit User Role</h3>
            <form onSubmit={handleUpdateUser}>
              <div style={{ marginBottom: 20 }}>
                <label className={dbStyles.modalLabel}>
                  Username
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  disabled
                  className={dbStyles.modalInput}
                  style={{ backgroundColor: '#f8f9fa' }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className={dbStyles.modalLabel}>
                  Role *
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className={dbStyles.modalSelect}
                  required
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className={`${dbStyles.modalBtn} ${dbStyles.cancel}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${dbStyles.modalBtn} ${dbStyles.add}`}
                >
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
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
          <div className={dbStyles.modalDeleteContainer}>
            <h3 className={dbStyles.modalTitle} style={{ color: '#a6c1a0' }}>Delete User</h3>
            <p style={{ marginBottom: 20, color: '#a6c1a0' }}>
              Are you sure you want to delete user <strong>{selectedUser.username}</strong>? 
              This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`${dbStyles.modalBtn} ${dbStyles.cancel}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className={`${dbStyles.modalBtn} ${dbStyles.add}`}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
