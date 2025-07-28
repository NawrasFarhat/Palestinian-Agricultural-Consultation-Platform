import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ApiService from "../../services/ApiService";
import AuthService from "../../services/AuthService";
import styles from "../../styles/ManagerDashboard.module.css";

const ManagerDashboard = ({ onLogout }) => {
  const [stats, setStats] = useState({
    pendingChanges: 0,
    roleRequests: 0,
    totalDiseases: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const [pendingChanges, roleRequests, diseases, users] = await Promise.all([
        ApiService.getPendingChanges().catch(() => []),
        ApiService.getRoleRequests().catch(() => []),
        ApiService.getAllDiseasesWithEngineers().catch(() => []),
        ApiService.getUsersAsManager().catch(() => [])
      ]);

      setStats({
        pendingChanges: pendingChanges.length,
        roleRequests: roleRequests.length,
        totalDiseases: diseases.length,
        totalUsers: users.length
      });
    } catch (err) {
      setError("Failed to fetch dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  if (!AuthService.isLoggedIn() || AuthService.getCurrentUser()?.role !== 'manager') {
    return <div style={{ padding: 40, color: 'red' }}>Access denied. This page is for managers only.</div>;
  }

  const dashboardCards = [
    {
      title: "Pending Disease Approvals",
      count: stats.pendingChanges,
      description: "Disease changes waiting for approval",
      link: "/manager/approvals",
      color: "#ffc107",
      icon: "🔍"
    },
    {
      title: "Total Diseases",
      count: stats.totalDiseases,
      description: "Diseases in the system",
      link: "/manager/diseases",
      color: "#28a745",
      icon: "🌿"
    },
    {
      title: "Total Users",
      count: stats.totalUsers,
      description: "Registered users",
      link: "/manager/change-role",
      color: "#6f42c1",
      icon: "👥"
    }
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Manager Dashboard</h1>
      {loading ? (
        <p className={`${styles.message} ${styles.loading}`}>Loading dashboard...</p>
      ) : error ? (
        <p className={`${styles.message} ${styles.error}`}>{error}</p>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className={styles.cardsGrid}>
            {dashboardCards.map((card, index) => (
              <div key={index} className={styles.card} style={{ border: `2px solid ${card.color}` }}>
                <div className={styles.cardIcon}>{card.icon}</div>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <div className={styles.cardCount} style={{ color: card.color }}>{card.count}</div>
                <p className={styles.cardDescription}>{card.description}</p>
                <Link to={card.link} className={styles.cardLink} style={{ backgroundColor: card.color }}>
                  View Details
                </Link>
              </div>
            ))}
          </div>

          {/* Welcome Message */}
          <div className={styles.welcomeBox}>
            <h3 className={styles.welcomeTitle}>Welcome, Manager!</h3>
            <p className={styles.welcomeText}>
              You have access to all management functions including disease approval, user role management, 
              and system oversight. Use the navigation menu to access specific features.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerDashboard;
