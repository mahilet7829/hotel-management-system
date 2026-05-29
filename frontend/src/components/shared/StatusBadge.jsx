const StatusBadge = ({ status }) => {
  const getStatusStyle = (status) => {
    if (!status) return { bg: '#F3F4F6', color: '#6B7280', label: 'Unknown' };

    const upperStatus = status.toUpperCase().replace(/\s+/g, '_');

    // Green statuses
    if (['AVAILABLE', 'COMPLETED', 'DELIVERED', 'PAID', 'ACTIVE', 'CLEAN'].includes(upperStatus)) {
      return { bg: '#D1FAE5', color: '#065F46', label: status };
    }

    // Blue statuses
    if (['OCCUPIED', 'PREPARING', 'IN_PROGRESS', 'APPROVED', 'CONFIRMED', 'ASSIGNED'].includes(upperStatus)) {
      return { bg: '#DBEAFE', color: '#1E40AF', label: status };
    }

    // Yellow/Orange statuses
    if (['CLEANING', 'PENDING', 'DRAFT', 'SCHEDULED', 'WAITING', 'PROCESSING'].includes(upperStatus)) {
      return { bg: '#FEF3C7', color: '#92400E', label: status };
    }

    // Red statuses
    if (['MAINTENANCE', 'CANCELLED', 'OUT_OF_ORDER', 'DECLINED', 'REJECTED', 'EXPIRED'].includes(upperStatus)) {
      return { bg: '#FEE2E2', color: '#991B1B', label: status };
    }

    // Purple statuses
    if (['READY', 'REVIEWED'].includes(upperStatus)) {
      return { bg: '#EDE9FE', color: '#5B21B6', label: status };
    }

    // Default
    return { bg: '#F3F4F6', color: '#374151', label: status };
  };

  const { bg, color, label } = getStatusStyle(status);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        backgroundColor: bg,
        color: color,
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: '600',
        lineHeight: '18px',
        whiteSpace: 'nowrap',
        textTransform: 'capitalize',
        letterSpacing: '0.2px',
      }}
    >
      {label}
    </span>
  );
};

export default StatusBadge;