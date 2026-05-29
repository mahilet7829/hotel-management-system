import { useState } from 'react';
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import useAuth from "../../hooks/useAuth";
const ManagerDashboard = () => {
  const { getDisplayName, getRoleBadge } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/manager', icon: '📊' },
    { label: 'Staff', path: '/manager/staff', icon: '👥' },
    { label: 'Rooms', path: '/manager/rooms', icon: '🚪' },
    { label: 'Orders', path: '/manager/orders', icon: '📋' },
    { label: 'Payroll', path: '/manager/payroll', icon: '💰' },
    { label: 'Analytics', path: '/manager/analytics', icon: '📈' },
  ];

  const statCards = [
    { label: 'Total Rooms', value: '50', icon: '🚪', color: '#3B82F6' },
    { label: 'Occupied', value: '32', icon: '🛏️', color: '#10B981' },
    { label: 'Active Staff', value: '18', icon: '👥', color: '#8B5CF6' },
    { label: "Today's Orders", value: '47', icon: '📦', color: '#F59E0B' },
  ];

  return (
    <div style={styles.layout}>
      <Sidebar navItems={navItems} title="Hotel Management" />
      <div style={styles.mainArea}>
        <Header title="Dashboard" onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main style={styles.content}>
          {/* Welcome Card */}
          <div style={styles.welcomeCard}>
            <div style={styles.welcomeContent}>
              <h2 style={styles.welcomeTitle}>
                Welcome back, {getDisplayName()}!
              </h2>
              <p style={styles.welcomeSubtitle}>
                Here's what's happening at the hotel today.
              </p>
              <span style={styles.welcomeBadge}>{getRoleBadge()}</span>
            </div>
            <div style={styles.welcomeIcon}>🏨</div>
          </div>

          {/* Stats Grid */}
          <div style={styles.statsGrid}>
            {statCards.map((stat, index) => (
              <div key={index} style={styles.statCard}>
                <div style={styles.statHeader}>
                  <span style={styles.statIcon}>{stat.icon}</span>
                  <span style={styles.statValue}>{stat.value}</span>
                </div>
                <p style={styles.statLabel}>{stat.label}</p>
                <div
                  style={{
                    ...styles.statAccent,
                    backgroundColor: stat.color,
                  }}
                />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

const styles = {
  layout: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  content: {
    padding: '24px',
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  welcomeCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '28px 32px',
    backgroundColor: 'linear-gradient(135deg, #1e2a3a 0%, #2d3f5a 100%)',
    background: 'linear-gradient(135deg, #1e2a3a 0%, #2d3f5a 100%)',
    borderRadius: '16px',
    color: '#ffffff',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(30, 42, 58, 0.3)',
  },
  welcomeContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  welcomeTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '700',
    color: '#ffffff',
  },
  welcomeSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#cbd5e1',
  },
  welcomeBadge: {
    display: 'inline-block',
    padding: '4px 14px',
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    color: '#93C5FD',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    width: 'fit-content',
    marginTop: '4px',
  },
  welcomeIcon: {
    fontSize: '48px',
    opacity: 0.8,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  statIcon: {
    fontSize: '28px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    margin: 0,
    fontSize: '14px',
    color: '#6B7280',
    fontWeight: '500',
  },
  statAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '3px',
    borderRadius: '0 0 12px 12px',
  },
};

export default ManagerDashboard;