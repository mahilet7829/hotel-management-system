import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import axiosInstance from '../../api/axiosInstance';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  
  // Fetch open service requests count
  const { data: serviceRequestsCount = 0 } = useQuery({
    queryKey: ['serviceRequestsCount'],
    queryFn: async () => {
      const response = await axiosInstance.get('/service-requests', {
        params: { status: 'OPEN', size: 1 }
      });
      return response.data.data.totalElements;
    }
  });
  
  // Fetch active cleaning tasks count
  const { data: activeCleaningCount = 0 } = useQuery({
    queryKey: ['activeCleaningCount'],
    queryFn: async () => {
      const response = await axiosInstance.get('/cleaning/active');
      return response.data.data.length;
    },
    refetchInterval: 30000
  });
  
  const quickLinks = [
    { label: 'Room Management', path: '/rooms', icon: '🏨', color: '#3b82f6' },
    { label: 'Cleaning Tasks', path: '/manager/cleaning', icon: '🧹', color: '#10b981' },
    { label: 'Service Requests', path: '/manager/service-requests', icon: '🔧', color: '#f59e0b' },
    { label: 'Reports', path: '/manager/reports', icon: '📊', color: '#8b5cf6' }
  ];
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        
        <main style={{ flex: 1, padding: '24px', backgroundColor: '#f9fafb' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
            Manager Dashboard
          </h1>
          
          {/* Stat Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {/* Existing stat cards from Phase 1-3 */}
            {/* ... existing stat cards ... */}
            
            {/* Open Service Requests Card */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/manager/service-requests')}
            >
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                Open Service Requests
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
                {serviceRequestsCount}
              </div>
            </div>
            
            {/* Active Cleaning Tasks Card */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/manager/cleaning')}
            >
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                Active Cleaning Tasks
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
                {activeCleaningCount}
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div style={{ marginTop: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
              Quick Links
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px'
            }}>
              {quickLinks.map(link => (
                <div
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: link.color + '20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    {link.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>
                      {link.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;
