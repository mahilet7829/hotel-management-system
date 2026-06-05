import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import cleaningApi from '../../api/cleaningApi';

const CleaningHistoryPage = () => {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['myTasks', page, statusFilter],
    queryFn: async () => {
      const params = { page, size: 15 };
      if (statusFilter) params.status = statusFilter;
      const response = await cleaningApi.getMyTasks(params);
      return response.data.data;
    }
  });
  
  const navItems = [
    { label: 'My Tasks', path: '/cleaner', icon: '📋' },
    { label: 'Scan QR', path: '/cleaner/scan', icon: '📷' },
    { label: 'History', path: '/cleaner/history', icon: '📜' }
  ];
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar navItems={navItems} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        
        <main style={{ flex: 1, padding: '24px', backgroundColor: '#f9fafb' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
              Cleaning History
            </h1>
            
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="SKIPPED">Skipped</option>
            </select>
          </div>
          
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                        Room
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                        Status
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                        Assigned At
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                        Started At
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                        Completed At
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                        Duration (min)
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.content?.map(log => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>
                          Room {log.roomNumber}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <StatusBadge status={log.status} />
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                          {log.assignedAt ? new Date(log.assignedAt).toLocaleString() : '-'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                          {log.startedAt ? new Date(log.startedAt).toLocaleString() : '-'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                          {log.completedAt ? new Date(log.completedAt).toLocaleString() : '-'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                          {log.durationMinutes || '-'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '16px',
                marginTop: '24px'
              }}>
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: page === 0 ? '#e5e7eb' : '#3b82f6',
                    color: page === 0 ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: page === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Previous
                </button>
                
                <span style={{ fontSize: '14px' }}>
                  Page {page + 1} of {data?.totalPages || 1}
                </span>
                
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page + 1 >= (data?.totalPages || 1)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: page + 1 >= (data?.totalPages || 1) ? '#e5e7eb' : '#3b82f6',
                    color: page + 1 >= (data?.totalPages || 1) ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: page + 1 >= (data?.totalPages || 1) ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default CleaningHistoryPage;
