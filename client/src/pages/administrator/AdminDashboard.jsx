// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ApiService from "../../services/ApiService";
import AuthService from "../../services/AuthService";
import Navbar from "../../components/Navbar";
import styles from "../../styles/AdminDashboard.module.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDiseases: 0,
    pendingRequests: 0,
    systemHealth: 'unknown'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const [users, diseases, feedback, support, health] = await Promise.all([
        ApiService.getAllUsers().catch(() => []),
        ApiService.getAllDiseases().catch(() => []),
        ApiService.getFeedbackRequests().catch(() => []),
        ApiService.getSupportRequests().catch(() => []),
        ApiService.getSystemHealth().catch(() => ({ status: 'unknown' }))
      ]);

      setStats({
        totalUsers: users.length,
        totalDiseases: diseases.length,
        pendingRequests: feedback.length + support.length,
        systemHealth: health.status
      });
    } catch (err) {
      setError("Failed to fetch dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  if (!AuthService.isLoggedIn() || AuthService.getCurrentUser()?.role !== 'it') {
    return <div style={{ padding: 40, color: 'red' }}>Access denied. This page is for IT administrators only.</div>;
  }

  const dashboardCards = [
    {
      title: "Total Users",
      count: stats.totalUsers,
      description: "Registered users in the system",
      link: "/admin/user-management",
      color: "#17a2b8",
      icon: "👥"
    },
    {
      title: "Total Diseases",
      count: stats.totalDiseases,
      description: "Diseases in the database",
      link: "/admin/database-management",
      color: "#28a745",
      icon: "🌿"
    },
    {
      title: "System Health",
      count: stats.systemHealth.toUpperCase(),
      description: "Current system status",
      link: "/admin/system-monitoring",
      color: stats.systemHealth === 'healthy' ? "#28a745" : "#dc3545",
      icon: "🔧"
    }
  ];

  return (
    <div className={styles.container}>
      {/* <Navbar role="administrator" /> */}
      <h1 className={styles.title}>IT Administrator Dashboard</h1>
      {loading ? (
        <p className={styles.loading}>Loading dashboard...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className={styles.cardsGrid}>
            {dashboardCards.map((card, index) => (
              <div key={index} className={styles.card}>
                <div className={styles.cardIcon}>{card.icon}</div>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <div className={styles.cardCount} style={card.title === 'System Health' ? { color: card.color } : {}}>
                  {card.count}
                </div>
                <p className={styles.cardDescription}>{card.description}</p>
                <Link to={card.link} className={styles.cardLink} style={card.title === 'System Health' ? { backgroundColor: card.color } : {}}>
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
      <div className={styles.welcomeBox}>
        <h3 className={styles.welcomeTitle}>Welcome, IT Administrator!</h3>
        <p className={styles.welcomeText}>
          You have full access to system monitoring, user management, database operations, and request handling. Use the navigation menu to access all administrative features.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
