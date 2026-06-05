import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import orderApi from '../../api/orderApi';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import StatusBadge from '../../components/shared/StatusBadge';

const ChefDashboard = () => {
  const navigate = useNavigate();

  const { data: kitchenOrders, isLoading } = useQuery({
    queryKey: ['kitchenOrders'],
    queryFn: () => orderApi.getKitchenOrders(),
    refetchInterval: 15000,
  });

  if (isLoading) return <LoadingSpinner />;

  const orders = kitchenOrders?.data || [];
  const confirmedCount = orders.filter(o => o.status === 'CONFIRMED').length;
  const preparingCount = orders.filter(o => o.status === 'PREPARING').length;
  const readyCount = orders.filter(o => o.status === 'READY').length;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Chef Dashboard</h1>
        <button
          onClick={() => navigate('/chef/kitchen')}
          style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
        >
          Open Kitchen Display
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Confirmed Orders</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{confirmedCount}</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Preparing</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>{preparingCount}</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Ready for Pickup</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{readyCount}</div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <h2 style={{ padding: '16px', fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb' }}>Active Kitchen Orders</h2>
        <div style={{ padding: '16px' }}>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>No active orders</div>
          ) : (
            orders.map(order => (
              <div key={order.id} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '4px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>#{order.orderNumber}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {order.items.map(item => `${item.quantity}x ${item.itemName}`).join(', ')}
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChefDashboard;