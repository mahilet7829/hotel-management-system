import useAuth from '../../hooks/useAuth';

const Header = ({ title, onMenuToggle }) => {
  const { getDisplayName, getRoleBadge, user } = useAuth();

  const getRoleColor = (role) => {
    if (role === 'Admin' || role === 'Manager') return '#3B82F6';
    if (role === 'Waiter') return '#10B981';
    if (role === 'Chef') return '#F59E0B';
    if (role === 'Cleaner') return '#8B5CF6';
    return '#6B7280';
  };

  const roleBadge = getRoleBadge();
  const roleColor = getRoleColor(roleBadge);

  return (
    <>
      <header style={styles.header}>
        {/* Left Section */}
        <div style={styles.leftSection}>
          <button
            className="header-menu-btn"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <h1 style={styles.title}>{title || 'Dashboard'}</h1>
        </div>

        {/* Right Section */}
        <div style={styles.rightSection}>
          {/* Notification Bell */}
          <div style={styles.notificationContainer}>
            <span style={styles.bellIcon}>🔔</span>
            <span style={styles.notificationBadge}>3</span>
          </div>

          {/* User Info */}
          <div style={styles.userInfo}>
            <span style={styles.userName}>{getDisplayName()}</span>
            <span
              style={{
                ...styles.rolePill,
                backgroundColor: `${roleColor}20`,
                color: roleColor,
                border: `1px solid ${roleColor}40`,
              }}
            >
              {roleBadge}
            </span>
          </div>
        </div>
      </header>
      <style>{`
        .header-menu-btn { display: none; }
        @media (max-width: 767px) {
          .header-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
};

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '0 24px',
    boxSizing: 'border-box',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  menuButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#374151',
    padding: '4px',
    borderRadius: '4px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
    whiteSpace: 'nowrap',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  notificationContainer: {
    position: 'relative',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: '22px',
    lineHeight: 1,
  },
  notificationBadge: {
    position: 'absolute',
    top: '-6px',
    right: '-8px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '700',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #ffffff',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  rolePill: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
};

export default Header;