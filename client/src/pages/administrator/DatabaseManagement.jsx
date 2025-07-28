import React, { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import styles from '../../styles/DatabaseManagement.module.css';

/**
 * DatabaseManagement Component
 * 
 * Enhanced table layout with optimized answer field display:
 * - Flexible column sizing with tableLayout: 'auto'
 * - Answer cells: 350-500px width with proper text wrapping
 * - Visual indicators: borders, background, hover effects
 * - Enhanced readability: larger font, better line height
 * - Overflow handling: content never hidden, always visible
 */
const DatabaseManagement = () => {
  const [activeTable, setActiveTable] = useState('users');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  const tables = [
    { key: 'users', name: 'Users', fields: ['id', 'username', 'role'] },
    { key: 'diseases', name: 'Diseases', fields: ['id', 'name', 'symptoms', 'solution'] }
  ];

  const roles = ['farmer', 'engineer', 'manager', 'it'];

  useEffect(() => {
    fetchTableData();
  }, [activeTable]);

  const fetchTableData = async () => {
    setLoading(true);
    try {
      let result;
      switch (activeTable) {
        case 'users':
          result = await ApiService.getAllUsers();
          break;
        case 'diseases':
          result = await ApiService.getAllDiseases();
          break;
        default:
          result = [];
      }
      setData(result);
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError(`Failed to fetch ${activeTable} data`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({});
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({ ...item });
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      switch (activeTable) {
        case 'users':
          await ApiService.deleteUser(selectedItem.id);
          break;
        case 'diseases':
          await ApiService.deleteDisease(selectedItem.id);
          break;
        default:
          throw new Error('Delete not implemented for this table');
      }
      setSuccess(`${activeTable === 'users' ? 'User' : 'Disease'} deleted successfully!`);
      setShowDeleteModal(false);
      setSelectedItem(null);
      fetchTableData();
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      switch (activeTable) {
        case 'users':
          if (selectedItem) {
            await ApiService.updateUserRole(selectedItem.id, formData.role);
          } else {
            await ApiService.addUser(formData);
          }
          break;
        case 'diseases':
          if (selectedItem) {
            await ApiService.updateDisease(selectedItem.id, formData);
          } else {
            await ApiService.createDisease(formData);
          }
          break;
        default:
          throw new Error('Operation not implemented for this table');
      }
      setSuccess(selectedItem ? 'Item updated successfully!' : 'Item added successfully!');
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedItem(null);
      fetchTableData();
    } catch (err) {
      setError('Failed to save item');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      farmer: '#28a745',
      engineer: '#17a2b8',
      manager: '#ffc107',
      it: '#dc3545'
    };
    return colors[role] || '#6c757d';
  };

  if (!AuthService.isLoggedIn() || AuthService.getCurrentUser()?.role !== 'it') {
    return <div style={{ padding: 40, color: 'red' }}>Access denied. This page is for IT administrators only.</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Database Management</h2>
      <p style={{ marginBottom: 20, color: '#aab7a5', textAlign: 'center' }}>
        Manage all data in the system. View, edit, and delete records from different tables.
      </p>

      <div style={{ marginBottom: 30 }}>
        <label style={{ display: 'block', marginBottom: 10, fontWeight: 'bold', color: '#a6c1a0' }}>
          Select Table:
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          {tables.map(table => (
            <button
              key={table.key}
              onClick={() => setActiveTable(table.key)}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTable === table.key ? '#6f9b6c' : 'rgba(255, 255, 255, 0.1)',
                color: activeTable === table.key ? 'white' : '#e9f5e1',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {table.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <button
          onClick={handleAdd}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6f9b6c',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'background 0.2s'
          }}
        >
          + Add New {tables.find(t => t.key === activeTable)?.name.slice(0, -1)}
        </button>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading {activeTable} data...</p>
      ) : error ? (
        <p className={styles.errorMessage}>{error}</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                {activeTable === 'users' ? (
                  <>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </>
                ) : (
                  <>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Symptoms</th>
                    <th>Solution</th>
                    <th>Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  {activeTable === 'users' ? (
                    <>
                      <td><strong>{item.username}</strong></td>
                      <td>
                        <span className={styles.roleBadge}>{item.role}</span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.symptoms}</td>
                      <td>{item.solution}</td>
                    </>
                  )}
                  <td>
                    <div className={styles.tableActions}>
                      <button
                        onClick={() => handleEdit(item)}
                        className={styles.editBtn}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(item)}
                        className={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </div>
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

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
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
          <div className={styles.modalContainer}>
            <h3 className={styles.modalTitle}>{showEditModal ? 'Edit' : 'Add'} {tables.find(t => t.key === activeTable)?.name.slice(0, -1)}</h3>
            <form onSubmit={handleSubmit}>
              {activeTable === 'users' ? (
                <>
                  {!selectedItem && (
                    <>
                      <div style={{ marginBottom: 20 }}>
                        <label className={styles.modalLabel}>
                          Username *
                        </label>
                        <input
                          type="text"
                          value={formData.username || ''}
                          onChange={e => setFormData({ ...formData, username: e.target.value })}
                          className={styles.modalInput}
                          required
                        />
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <label className={styles.modalLabel}>
                          Password *
                        </label>
                        <input
                          type="password"
                          value={formData.password || ''}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          className={styles.modalInput}
                          required
                        />
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <label className={styles.modalLabel}>
                          Phone *
                        </label>
                        <input
                          type="tel"
                          value={formData.phone || ''}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className={styles.modalInput}
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <label className={styles.modalLabel}>
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email || ''}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className={styles.modalInput}
                        />
                      </div>
                    </>
                  )}
                  <div style={{ marginBottom: 20 }}>
                    <label className={styles.modalLabel}>
                      {selectedItem ? 'Username' : 'Role *'}
                    </label>
                    {selectedItem ? (
                      <input
                        type="text"
                        value={formData.username || ''}
                        disabled
                        className={styles.modalInput}
                        style={{ backgroundColor: '#f8f9fa' }}
                      />
                    ) : (
                      <select
                        value={formData.role || ''}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                        className={styles.modalSelect}
                        required
                      >
                        <option value="">Select role...</option>
                        {roles.map(role => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  {selectedItem && (
                    <div style={{ marginBottom: 20 }}>
                      <label className={styles.modalLabel}>
                        Role *
                      </label>
                      <select
                        value={formData.role || ''}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className={styles.modalSelect}
                        required
                      >
                        <option value="">Select role...</option>
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <label className={styles.modalLabel}>
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={styles.modalInput}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label className={styles.modalLabel}>
                      Symptoms *
                    </label>
                    <textarea
                      value={formData.symptoms || ''}
                      onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                      rows={4}
                      className={styles.modalTextarea}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label className={styles.modalLabel}>
                      Solution *
                    </label>
                    <textarea
                      value={formData.solution || ''}
                      onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                      rows={4}
                      className={styles.modalTextarea}
                      required
                    />
                  </div>
                </>
              )}
              
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedItem(null);
                  }}
                  className={`${styles.modalBtn} ${styles.cancel}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.modalBtn} ${styles.add}`}
                >
                  {showEditModal ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedItem && (
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
          <div className={styles.modalDeleteContainer}>
            <h3 className={styles.modalTitle} style={{ color: '#a6c1a0' }}>Delete {activeTable === 'users' ? 'User' : 'Disease'}</h3>
            <p style={{ marginBottom: 20, color: '#a6c1a0' }}>
              Are you sure you want to delete {activeTable === 'users' ? 'user' : 'disease'} <strong>{activeTable === 'users' ? selectedItem.username : selectedItem.name}</strong>? 
              This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`${styles.modalBtn} ${styles.cancel}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className={`${styles.modalBtn} ${styles.add}`}
              >
                Delete {activeTable === 'users' ? 'User' : 'Disease'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseManagement;
