import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import cleaningApi from '../../api/cleaningApi';
import axiosInstance from '../../api/axiosInstance';

const AssignCleaningPage = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    roomId: '',
    cleanerId: '',
    supervisorId: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [skipReason, setSkipReason] = useState('');
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [skipTaskId, setSkipTaskId] = useState(null);
  
  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await axiosInstance.get('/rooms');
      return response.data.data.content || response.data.data;
    }
  });
  
  const { data: cleaners = [] } = useQuery({
    queryKey: ['cleaners'],
    queryFn: async () => {
      const response = await axiosInstance.get('/users', {
        params: { role: 'ROLE_CLEANER' }
      });
      return response.data.data.content || response.data.data;
    }
  });
  
  const { data: managers = [] } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      const response = await axiosInstance.get('/users', {
        params: { role: 'ROLE_MANAGER' }
      });
      return response.data.data.content || response.data.data;
    }
  });
  
  const { data: activeTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['activeCleaningTasks'],
    queryFn: async () => {
      const response = await cleaningApi.getActiveTasks();
      return response.data.data;
    },
    refetchInterval: 30000
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const data = {
        roomId: parseInt(formData.roomId),
        cleanerId: parseInt(formData.cleanerId),
        supervisorId: formData.supervisorId ? parseInt(formData.supervisorId) : null,
        notes: formData.notes || null
      };
      
      await cleaningApi.assignCleaning(data);
      setSuccess('Cleaning task assigned successfully!');
      setFormData({ roomId: '', cleanerId: '', supervisorId: '', notes: '' });
      queryClient.invalidateQueries({ queryKey: ['activeCleaningTasks'] });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign cleaning task');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSkip = async () => {
    try {
      await cleaningApi.skipCleaning(skipTaskId, skipReason);
      setShowSkipModal(false);
      setSkipReason('');
      queryClient.invalidateQueries({ queryKey: ['activeCleaningTasks'] });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to skip task');
    }
  };
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        
        <main style={{ flex: 1, padding: '24px', backgroundColor: '#f9fafb' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
            Assign Cleaning Tasks
          </h1>
          
          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={{
              padding: '12px',
              backgroundColor: '#d1fae5',
              color: '#065f46',
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              {success}
            </div>
          )}
          
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '32px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
              New Cleaning Assignment
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    Room *
                  </label>
                  <select
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select a room</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        Room {room.roomNumber} ({room.status})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    Cleaner *
                  </label>
                  <select
                    value={formData.cleanerId}
                    onChange={(e) => setFormData({ ...formData, cleanerId: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select a cleaner</option>
                    {cleaners.map(cleaner => (
                      <option key={cleaner.id} value={cleaner.id}>
                        {cleaner.firstName} {cleaner.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    Supervisor (Optional)
                  </label>
                  <select
                    value={formData.supervisorId}
                    onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">No supervisor</option>
                    {managers.map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.firstName} {manager.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                  placeholder="Add any special instructions..."
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: loading ? 0.5 : 1
                }}
              >
                {loading ? 'Assigning...' : 'Assign Cleaning Task'}
              </button>
            </form>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
              Active Cleaning Tasks
            </h2>
            
            {tasksLoading ? (
              <LoadingSpinner />
            ) : activeTasks.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#6b7280', padding: '24px' }}>
                No active cleaning tasks
              </div>
            ) : (
              <div style={{ overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px' }}>Room</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px' }}>Cleaner</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px' }}>Assigned At</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTasks.map(task => (
                      <tr key={task.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                          Room {task.roomNumber}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                          {task.cleanerName}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <StatusBadge status={task.status} />
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                          {new Date(task.assignedAt).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {task.status === 'ASSIGNED' && (
                            <button
                              onClick={() => {
                                setSkipTaskId(task.id);
                                setShowSkipModal(true);
                              }}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Skip
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {showSkipModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                width: '400px',
                maxWidth: '90%'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
                  Skip Cleaning Task
                </h3>
                <textarea
                  value={skipReason}
                  onChange={(e) => setSkipReason(e.target.value)}
                  placeholder="Enter reason for skipping..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '16px',
                    resize: 'vertical'
                  }}
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setShowSkipModal(false);
                      setSkipReason('');
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#e5e7eb',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSkip}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Skip Task
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AssignCleaningPage;
