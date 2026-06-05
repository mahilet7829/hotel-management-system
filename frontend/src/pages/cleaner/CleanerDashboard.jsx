import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import cleaningApi from '../../api/cleaningApi';

const CleanerDashboard = () => {
  const navigate = useNavigate();
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['cleanerStats'],
    queryFn: async () => {
      const response = await cleaningApi.getMyStats();
      return response.data.data;
    }
  });
  
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['myTasks'],
    queryFn: async () => {
      const response = await cleaningApi.getMyTasks({ page: 0, size: 5 });
      return response.data.data.content;
    }
  });
  
  const navItems = [
    { label: 'My Tasks', path: '/cleaner', icon: '📋' },
    { label: 'Scan QR', path: '/cleaner/scan', icon: '📷' },
    { label: 'History', path: '/cleaner/history', icon: '📜' }
  ];
  
  if (statsLoading) return <LoadingSpinner />;
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar navItems={navItems} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        
        <main style={{ flex: 1, padding: '24px', backgroundColor: '#f9fafb' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
            Cleaner Dashboard
          </h1>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                Assigned Today
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
                {stats?.assigned || 0}
              </div>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                In Progress
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
                {stats?.inProgress || 0}
              </div>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                Completed Today
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                {stats?.completedToday || 0}
              </div>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                Avg Duration (min)
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6' }}>
                {stats?.avgDurationMinutes || 0}
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
              Active Tasks
            </h2>
            
            {tasksLoading ? (
              <LoadingSpinner />
            ) : tasks && tasks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tasks.map(task => (
                  <div key={task.id} style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                        Room {task.roomNumber}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <StatusBadge status={task.status} />
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          Assigned: {new Date(task.assignedAt).toLocaleString()}
                        </span>
                      </div>
                      {task.notes && (
                        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                          Notes: {task.notes}
                        </div>
                      )}
                    </div>
                    
                    {task.status === 'ASSIGNED' && (
                      <button
                        onClick={() => navigate('/cleaner/scan')}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        Start Cleaning
                      </button>
                    )}
                    
                    {task.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => navigate('/cleaner/scan')}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        Complete Cleaning
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                No active tasks at the moment
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CleanerDashboard;
