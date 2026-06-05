import React, { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import orderApi from '../../api/orderApi';
import useWebSocket from '../../hooks/useWebSocket';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const KitchenDisplay = () => {
  const [localOrders, setLocalOrders] = useState([]);
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['kitchenOrders'],
    queryFn: () => orderApi.getKitchenOrders(),
    refetchInterval: 30000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }) => orderApi.updateOrderStatus(id, data),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const handleWebSocketMessage = useCallback((message) => {
    if (message.type === 'NEW_ORDER' || message.type === 'STATUS_CHANGE') {
      queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
    }
  }, [queryClient]);

  const { connected } = useWebSocket('/topic/kitchen', handleWebSocketMessage);

  if (isLoading) return <LoadingSpinner />;

  const kitchenOrders = orders?.data || [];
  
  const confirmedOrders = kitchenOrders.filter(o => o.status === 'CONFIRMED');
  const preparingOrders = kitchenOrders.filter(o => o.status === 'PREPARING');
  const readyOrders = kitchenOrders.filter(o => o.status === 'READY');

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const minutes = Math.floor((new Date() - date) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m ago`;
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Kitchen Display</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: connected ? '#10b981' : '#ef4444' }} />
          <span style={{ fontSize: '14px', color: connected ? '#10b981' : '#ef4444' }}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#f59e0b' }}>
            Confirmed ({confirmedOrders.length})
          </h2>
          {confirmedOrders.map(order => (
            <div key={order.id} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>#{order.orderNumber}</span>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>{getTimeAgo(order.createdAt)}</span>
              </div>
              <div style={{ marginBottom: '8px', color: '#6b7280' }}>
                {order.roomNumber ? `Room: ${order.roomNumber}` : `Table: ${order.tableNumber}`}
              </div>
              <div style={{ marginBottom: '12px' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                    <span>{item.quantity}x {item.itemName}</span>
                  </div>
                ))}
              </div>
              {order.notes && (
                <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#fef3c7', borderRadius: '4px', fontSize: '14px' }}>
                  📝 {order.notes}
                </div>
              )}
              <button
                onClick={() => updateStatusMutation.mutate({ id: order.id, data: { status: 'PREPARING' } })}
                style={{ width: '100%', padding: '10px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Start Preparing
              </button>
            </div>
          ))}
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#3b82f6' }}>
            Preparing ({preparingOrders.length})
          </h2>
          {preparingOrders.map(order => (
            <div key={order.id} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>#{order.orderNumber}</span>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>{getTimeAgo(order.preparingAt)}</span>
              </div>
              <div style={{ marginBottom: '8px', color: '#6b7280' }}>
                {order.roomNumber ? `Room: ${order.roomNumber}` : `Table: ${order.tableNumber}`}
              </div>
              <div style={{ marginBottom: '12px' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                    <span>{item.quantity}x {item.itemName}</span>
                  </div>
                ))}
              </div>
              {order.notes && (
                <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#fef3c7', borderRadius: '4px', fontSize: '14px' }}>
                  📝 {order.notes}
                </div>
              )}
              <button
                onClick={() => updateStatusMutation.mutate({ id: order.id, data: { status: 'READY' } })}
                style={{ width: '100%', padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Mark Ready
              </button>
            </div>
          ))}
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#10b981' }}>
            Ready ({readyOrders.length})
          </h2>
          {readyOrders.map(order => (
            <div key={order.id} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>#{order.orderNumber}</span>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>{getTimeAgo(order.readyAt)}</span>
              </div>
              <div style={{ marginBottom: '8px', color: '#6b7280' }}>
                {order.roomNumber ? `Room: ${order.roomNumber}` : `Table: ${order.tableNumber}`}
              </div>
              <div style={{ marginBottom: '12px' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                    <span>{item.quantity}x {item.itemName}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px', backgroundColor: '#d1fae5', borderRadius: '4px', textAlign: 'center', color: '#065f46', fontWeight: 'bold' }}>
                ✓ Ready for pickup
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KitchenDisplay;