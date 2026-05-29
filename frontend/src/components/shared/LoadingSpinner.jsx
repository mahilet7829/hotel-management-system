const LoadingSpinner = ({ size = 'md', color = '#3B82F6', fullscreen = false }) => {
  const sizeMap = {
    sm: '24px',
    md: '40px',
    lg: '56px',
    xl: '72px',
  };

  const borderWidthMap = {
    sm: '3px',
    md: '4px',
    lg: '5px',
    xl: '6px',
  };

  const spinnerSize = sizeMap[size] || sizeMap.md;
  const borderWidth = borderWidthMap[size] || borderWidthMap.md;

  const spinner = (
    <div
      style={{
        width: spinnerSize,
        height: spinnerSize,
        border: `${borderWidth} solid #e5e7eb`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );

  if (fullscreen) {
    return (
      <div style={styles.fullscreenOverlay}>
        <div style={styles.fullscreenContent}>
          {spinner}
          <p style={styles.loadingText}>Loading...</p>
        </div>
        <style>{keyframes}</style>
      </div>
    );
  }

  return (
    <div style={styles.inlineContainer}>
      {spinner}
      <style>{keyframes}</style>
    </div>
  );
};

const keyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const styles = {
  inlineContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  fullscreenOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  fullscreenContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  loadingText: {
    fontSize: '14px',
    color: '#6B7280',
    fontWeight: '500',
    margin: 0,
  },
};

export default LoadingSpinner;