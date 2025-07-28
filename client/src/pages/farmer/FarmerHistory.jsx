import React, { useEffect, useState } from 'react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';

const FarmerHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await ApiService.makeRequest('/farmer/my-diagnoses');
        setHistory(data);
      } catch (err) {
        setError('Failed to fetch diagnosis history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (!AuthService.isLoggedIn() || AuthService.getCurrentUser()?.role !== 'farmer') {
    return <div style={{ padding: 40, color: 'red' }}>Access denied. This page is for farmers only.</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>My Diagnoses</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : history.length === 0 ? (
        <p>No diagnosis history found.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ marginTop: 20, width: '100%' }}>
          <thead>
            <tr>
              <th>Disease Name</th>
              <th>Date</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id}>
                <td>{item.diseaseName}</td>
                <td>{new Date(item.date).toLocaleString()}</td>
                <td>{item.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FarmerHistory; 