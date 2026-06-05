import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE':
      case 'READY':
      case 'DELIVERED':
      case 'ACTIVE':
        return { bg: '#d1fae5', text: '#065f46' };
      case 'OCCUPIED':
      case 'CONFIRMED':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'CLEANING':
      case 'PREPARING':
      case 'PENDING':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'MAINTENANCE':
        return { bg: '#fee2e2', text: '#991b1b' };
      case 'OUT_OF_ORDER':
      case 'CANCELLED':
        return { bg: '#f3f4f6', text: '#374151' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const colors = getStatusColor(status);
  const displayStatus = status?.replace(/_/g, ' ') || 'Unknown';

  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      backgroundColor: colors.bg,
      color: colors.text,
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize',
    }}>
      {displayStatus}
    </span>
  );
};

export default StatusBadge;