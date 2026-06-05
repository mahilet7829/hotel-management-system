import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import authApi from '../../api/authApi';

const Sidebar = ({ navItems, title }) => {
  const { user, logout, getDisplayName, getRoleBadge } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Silently handle error
    }
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (!user) return '?';
    const first = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
    const last = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
    return `${first}${last}` || 'U';
  };

  const sidebarContent = (
    <div style={styles.sidebar}>
      {/* Logo / Title */}
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>🏨</div>
        <span style={styles.logoText}>{title || 'Hotel Management'}</span>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* User Profile Section */}
      <div style={styles.profileSection}>
        <div style={styles.avatar}>{getInitials()}</div>
        <div style={styles.userName}>{getDisplayName()}</div>
        <span style={styles.roleBadge}>{getRoleBadge()}</span>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Navigation */}
      <nav style={styles.nav}>
        {(navItems || []).map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
            onClick={() => setIsMobileOpen(false)}
          >
            <span style={styles.navIcon}>{item.icon || '📄'}</span>
            <span style={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div style={styles.spacer} />

      {/* Logout Button */}
      <div style={styles.logoutContainer}>
        <button onClick={handleLogout} style={styles.logoutButton}>
          <span style={styles.logoutIcon}>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button - only show on small screens */}
      <button
        className="mobile-toggle-btn"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div style={styles.overlay} onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Desktop Sidebar - always visible */}
      <div className="desktop-sidebar">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar - only when toggled */}
      {isMobileOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000 }}>
          {sidebarContent}
        </div>
      )}

      <style>{`
        .desktop-sidebar { display: flex; }
        .mobile-toggle-btn { display: none; }
        @media (max-width: 767px) {
          .desktop-sidebar { display: none; }
          .mobile-toggle-btn {
            display: block;
            background: #1e2a3a;
            border: none;
            font-size: 22px;
            cursor: pointer;
            color: white;
            padding: 8px 12px;
            position: fixed;
            top: 12px;
            left: 12px;
            z-index: 1001;
            border-radius: 6px;
          }
        }
      `}</style>
    </>
  );
};

const styles = {
  sidebar: {
    width: '250px',
    height: '100vh',
    backgroundColor: '#1e2a3a',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px 16px',
    gap: '12px',
  },
  logoIcon: {
    fontSize: '28px',
  },
  logoText: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '0.5px',
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: '0 16px',
  },
  profileSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 16px',
    gap: '8px',
  },
  avatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#3B82F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  roleBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    padding: '3px 10px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 8px',
    gap: '2px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#cbd5e1',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    gap: '12px',
  },
  navItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    color: '#3B82F6',
    fontWeight: '600',
  },
  navIcon: {
    fontSize: '18px',
    width: '24px',
    textAlign: 'center',
  },
  navLabel: {
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  logoutContainer: {
    padding: '16px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  logoutButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  logoutIcon: {
    fontSize: '16px',
  },
};

export default Sidebar;