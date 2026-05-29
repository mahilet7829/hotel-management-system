const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>⚠️</span>
        </div>
        <div style={styles.textContainer}>
          <h4 style={styles.title}>Something went wrong</h4>
          <p style={styles.message}>{message || 'An unexpected error occurred. Please try again.'}</p>
        </div>
        {onRetry && (
          <button onClick={onRetry} style={styles.retryButton}>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    padding: '16px',
    boxSizing: 'border-box',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '24px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    textAlign: 'center',
  },
  iconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: '24px',
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#991b1b',
  },
  message: {
    margin: 0,
    fontSize: '14px',
    color: '#b91c1c',
    lineHeight: 1.5,
  },
  retryButton: {
    marginTop: '8px',
    padding: '8px 20px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export default ErrorMessage;