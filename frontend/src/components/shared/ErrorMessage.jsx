import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '20px' }}>⚠️</span>
        <p style={{ color: '#dc2626', margin: 0, flex: 1 }}>{message || 'An error occurred'}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '6px 12px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;