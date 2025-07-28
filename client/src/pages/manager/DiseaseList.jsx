import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import styles from '../../styles/DiseaseList.module.css';

const DiseaseList = ({ onLogout }) => {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!AuthService.isLoggedIn() || AuthService.getCurrentUser()?.role !== 'manager') {
      return;
    }
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getAllDiseasesWithEngineers();
      setDiseases(data);
    } catch (err) {
      setError('Failed to fetch diseases');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (diseaseId, diseaseName) => {
    if (!window.confirm(`Are you sure you want to delete "${diseaseName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await ApiService.deleteDisease(diseaseId);
      setSuccess(`Disease "${diseaseName}" deleted successfully`);
      fetchDiseases();
    } catch (err) {
      setError('Failed to delete disease');
    }
  };

  if (!AuthService.isLoggedIn() || AuthService.getCurrentUser()?.role !== 'manager') {
    return <div style={{ padding: 40, color: 'red' }}>Access denied. This page is for managers only.</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Disease Management</h1>

      {error && (
        <div className={`${styles.message} ${styles.error}`}>{error}</div>
      )}
      {success && (
        <div className={`${styles.message} ${styles.success}`}>{success}</div>
      )}

      {loading ? (
        <div className={styles.emptyState}>Loading diseases...</div>
      ) : diseases.length === 0 ? (
        <div className={styles.emptyState}>
          No diseases found. <Link to="/manager/add-disease">Add the first disease</Link>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Disease Name</th>
                  <th>Symptoms</th>
                  <th>Solution</th>
                  <th>Created By</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {diseases.map((disease, idx) => (
                  <tr key={disease.id}>
                    <td style={{ fontWeight: 'bold', color: '#e9f5e1' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 'bold', color: '#e9f5e1' }}>{disease.name}</td>
                    <td>
                      <div className={styles.ellipsis} title={disease.symptoms}>
                        {disease.symptoms}
                      </div>
                    </td>
                    <td>
                      <div className={styles.ellipsis} title={disease.solution}>
                        {disease.solution}
                      </div>
                    </td>
                    <td>{disease.engineer || 'Unknown'}</td>
                    <td>{new Date(disease.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className={styles.actions}>
                        <Link to={`/manager/edit-disease/${disease.id}`} className={styles.editBtn}>
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(disease.id, disease.name)}
                          className={styles.editBtn}
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
        </div>
      )}
    </div>
  );
};

export default DiseaseList; 