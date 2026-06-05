import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import orderApi from '../../api/orderApi';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import StatusBadge from '../../components/shared/StatusBadge';

const WaiterDashboard = () => {
  const navigate = useNavigate();

  const { data: myOrders, isLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: () => orderApi.getMyOrders({ page: 0, size: 10 }),
  });

  if (isLoading) return <LoadingSpinner />;

  const orders = myOrders?.data?.content || [];
  const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const deliveredToday = orders.filter(o => o.status === 'DELIVERED');

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Waiter Dashboard</h1>
        <button
          onClick={() => navigate('/waiter/new-order')}
          style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
        >
          + New Order
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Active Orders</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>{activeOrders.length}</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Delivered Today</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{deliveredToday.length}</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer' }}
          onClick={() => navigate('/waiter/new-order')}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Quick Action</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>Create Order</div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <h2 style={{ padding: '16px', fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb' }}>Recent Orders</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Order #</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Location</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Items</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px' }}>{order.orderNumber}</td>
                <td style={{ padding: '12px' }}>{order.roomNumber || order.tableNumber || '-'}</td>
                <td style={{ padding: '12px' }}>{order.items.length} items</td>
                <td style={{ padding: '12px' }}>
                  <StatusBadge status={order.status} />
                </td>
                <td style={{ padding: '12px' }}>${order.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WaiterDashboard;