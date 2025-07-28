import React, { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import styles from '../../styles/SystemMonitoring.module.css';

const SystemMonitoring = () => {
  const [systemHealth, setSystemHealth] = useState({
    status: 'unknown',
    uptime: 0,
    memory: 0,
    cpu: 0
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { key: 'overview', name: 'System Overview', icon: '📊' },
    { key: 'logs', name: 'System Logs', icon: '📝' },
    { key: 'backup', name: 'Backup & Restore', icon: '💾' }
  ];

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemData = async () => {
    setLoading(true);
    try {
      // Fetch system health and logs
      const [health, systemLogs] = await Promise.all([
        ApiService.getSystemHealth().catch(() => ({
          status: 'unknown',
          uptime: 0,
          memory: 0,
          cpu: 0
        })),
        ApiService.getSystemLogs().catch(() => [])
      ]);

      setSystemHealth(health);
      setLogs(systemLogs);
    } catch (err) {
      setError('Failed to fetch system data');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      await ApiService.createBackup();
      setSuccess('System backup created successfully!');
    } catch (err) {
      setError('Failed to create backup');
    }
  };

  const handleRestore = async () => {
    if (!window.confirm('Are you sure you want to restore the system? This will overwrite current data.')) {
      return;
    }

    try {
      await ApiService.restoreBackup();
      setSuccess('System restored successfully!');
    } catch (err) {
      setError('Failed to restore system');
    }
  };

  const getHealthColor = (status) => {
    const colors = {
      healthy: '#28a745',
      warning: '#ffc107',
      critical: '#dc3545',
      unknown: '#6c757d'
    };
    return colors[status] || colors.unknown;
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const renderOverview = () => (
    <div>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: "20px", 
        marginBottom: "30px" 
      }}>
        {/* System Status */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          border: `3px solid ${getHealthColor(systemHealth.status)}`
        }}>
          <h3 style={{ marginBottom: "10px", color: "#333" }}>System Status</h3>
          <div style={{ 
            fontSize: "2em", 
            fontWeight: "bold", 
            color: getHealthColor(systemHealth.status),
            marginBottom: "10px"
          }}>
            {systemHealth.status.toUpperCase()}
          </div>
          <p style={{ color: "#666" }}>
            {systemHealth.status === 'healthy' ? 'All systems operational' :
             systemHealth.status === 'warning' ? 'Some issues detected' :
             systemHealth.status === 'critical' ? 'Critical issues detected' :
             'Status unknown'}
          </p>
        </div>

        {/* Uptime */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ marginBottom: "10px", color: "#333" }}>System Uptime</h3>
          <div style={{ 
            fontSize: "2em", 
            fontWeight: "bold", 
            color: "#17a2b8",
            marginBottom: "10px"
          }}>
            {formatUptime(systemHealth.uptime)}
          </div>
          <p style={{ color: "#666" }}>Time since last restart</p>
        </div>

        {/* Memory Usage */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ marginBottom: "10px", color: "#333" }}>Memory Usage</h3>
          <div style={{ 
            fontSize: "2em", 
            fontWeight: "bold", 
            color: systemHealth.memory > 80 ? "#dc3545" : "#28a745",
            marginBottom: "10px"
          }}>
            {systemHealth.memory}%
          </div>
          <div style={{
            width: "100%",
            height: "10px",
            backgroundColor: "#e9ecef",
            borderRadius: "5px",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${systemHealth.memory}%`,
              height: "100%",
              backgroundColor: systemHealth.memory > 80 ? "#dc3545" : "#28a745"
            }} />
          </div>
        </div>

        {/* CPU Usage */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ marginBottom: "10px", color: "#333" }}>CPU Usage</h3>
          <div style={{ 
            fontSize: "2em", 
            fontWeight: "bold", 
            color: systemHealth.cpu > 80 ? "#dc3545" : "#28a745",
            marginBottom: "10px"
          }}>
            {systemHealth.cpu}%
          </div>
          <div style={{
            width: "100%",
            height: "10px",
            backgroundColor: "#e9ecef",
            borderRadius: "5px",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${systemHealth.cpu}%`,
              height: "100%",
              backgroundColor: systemHealth.cpu > 80 ? "#dc3545" : "#28a745"
            }} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: "30px" }}>
        <div className={styles.systemCard} style={{ borderLeft: '4px solid #28a745' }}>
          <h3 className={styles.cardTitle}>Quick Actions</h3>
          <div style={{ display: "flex", gap: "15px" }}>
            <button
              onClick={fetchSystemData}
              className={styles.quickButton}
              style={{ flex: 1, minWidth: 180 }}
            >
              🔄 Refresh Data
            </button>
            <button
              onClick={handleBackup}
              className={styles.quickButton}
              style={{ flex: 1, minWidth: 180 }}
            >
              💾 Create System Backup
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h3>System Logs</h3>
        <p style={{ color: "#666" }}>Recent system activity and error logs</p>
      </div>

      <div style={{ 
        // تمت إزالة الأنماط الداخلية، يمكن لاحقاً استخدام كلاس خاص إذا رغبت
      }}>
        {logs.length === 0 ? (
          <div className={styles.noLogsBox}>No logs available</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{
              padding: "10px",
              borderBottom: "1px solid #e9ecef",
              fontFamily: "monospace",
              fontSize: "14px"
            }}>
              <div style={{ color: "#6c757d", marginBottom: "5px" }}>
                {new Date(log.timestamp).toLocaleString()} - {log.level}
              </div>
              <div style={{ color: "#333" }}>{log.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderBackup = () => (
    <div>
      <div style={{ marginBottom: "30px" }}>
        <h3>Backup & Restore</h3>
        <p style={{ color: "#666" }}>Manage system backups and restore operations</p>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
        gap: "20px" 
      }}>
        {/* Create Backup */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          border: "1px solid #e9ecef"
        }}>
          <h4 style={{ marginBottom: "15px", color: "#333" }}>Create Backup</h4>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Create a complete backup of the system database and configuration files.
          </p>
          <button
            onClick={handleBackup}
            className={styles.quickButton}
            style={{ width: '100%' }}
          >
            💾 Create System Backup
          </button>
        </div>

        {/* Restore Backup */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          border: "1px solid #e9ecef"
        }}>
          <h4 style={{ marginBottom: "15px", color: "#333" }}>Restore Backup</h4>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Restore the system from a previous backup. This will overwrite current data.
          </p>
          <button
            onClick={handleRestore}
            className={styles.quickButton}
            style={{ width: '100%' }}
          >
            🔄 Restore System
          </button>
        </div>
      </div>

      {/* Backup History */}
      <div style={{ marginTop: "30px" }}>
        <h4 style={{ marginBottom: "15px", color: "#333" }}>Backup History</h4>
        <div className={styles.systemCard}>
          <p style={{ color: '#a6c1a0' }}>Backup history feature coming soon...</p>
        </div>
      </div>
    </div>
  );

  if (!AuthService.isLoggedIn() || AuthService.getCurrentUser()?.role !== 'it') {
    return <div style={{ padding: 40, color: 'red' }}>Access denied. This page is for IT administrators only.</div>;
  }

  return (
    <div className={styles.monitoringContainer}>
      <h2 className={styles.monitoringTitle}>System Monitoring</h2>
      <p className={styles.monitoringDescription}>
        Monitor system health, logs, and perform backup/restore operations.
      </p>
      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? `${styles.tabButton} ${styles.tabButtonActive}` : styles.tabButton}
            onClick={() => setActiveTab(tab.key)}
          >
            <span style={{ marginRight: 6 }}>{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'logs' && renderLogs()}
      {activeTab === 'backup' && renderBackup()}
    </div>
  );
};

export default SystemMonitoring;

