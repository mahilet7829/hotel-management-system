import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import roomApi from '../../api/roomApi';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';

const RoomsPage = () => {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [createForm, setCreateForm] = useState({
    roomNumber: '',
    floor: '',
    roomType: '',
    notes: ''
  });
  const [editForm, setEditForm] = useState({
    floor: '',
    roomType: '',
    notes: ''
  });
  const queryClient = useQueryClient();

  const { data: roomsData, isLoading, error } = useQuery({
    queryKey: ['rooms', page, statusFilter, floorFilter],
    queryFn: () => roomApi.getRooms({ page, size: 20, status: statusFilter || null, floor: floorFilter || null }),
  });

  const { data: summaryData } = useQuery({
    queryKey: ['roomSummary'],
    queryFn: () => roomApi.getRoomSummary(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => roomApi.createRoom(data),
    onSuccess: () => {
      toast.success('Room created successfully');
      setShowCreateModal(false);
      setCreateForm({ roomNumber: '', floor: '', roomType: '', notes: '' });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['roomSummary'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create room');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => roomApi.updateRoom(id, data),
    onSuccess: () => {
      toast.success('Room updated successfully');
      setShowEditModal(false);
      setSelectedRoom(null);
      setEditForm({ floor: '', roomType: '', notes: '' });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update room');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }) => roomApi.updateRoomStatus(id, data),
    onSuccess: () => {
      toast.success('Room status updated');
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['roomSummary'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => roomApi.deleteRoom(id),
    onSuccess: () => {
      toast.success('Room deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['roomSummary'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete room');
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  const rooms = roomsData?.data?.content || [];
  const summary = summaryData?.data || {};

  const handleCreate = () => {
    createMutation.mutate({
      roomNumber: createForm.roomNumber,
      floor: createForm.floor ? parseInt(createForm.floor) : null,
      roomType: createForm.roomType,
      notes: createForm.notes || null,
    });
  };

  const handleEdit = () => {
    updateMutation.mutate({
      id: selectedRoom.id,
      data: {
        floor: editForm.floor ? parseInt(editForm.floor) : null,
        roomType: editForm.roomType || null,
        notes: editForm.notes || null,
      }
    });
  };

  const openEditModal = (room) => {
    setSelectedRoom(room);
    setEditForm({
      floor: room.floor || '',
      roomType: room.roomType || '',
      notes: room.notes || '',
    });
    setShowEditModal(true);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Room Management</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {Object.entries(summary).map(([status, count]) => (
          <div key={status} style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>{count}</div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{status.replace(/_/g, ' ')}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #d1d5db' }}
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="OCCUPIED">Occupied</option>
          <option value="CLEANING">Cleaning</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="OUT_OF_ORDER">Out of Order</option>
        </select>
        <input
          type="number"
          placeholder="Filter by floor"
          value={floorFilter}
          onChange={(e) => setFloorFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #d1d5db' }}
        />
        <button
          onClick={() => setShowCreateModal(true)}
          style={{ marginLeft: 'auto', padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Add Room
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Room Number</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Floor</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px' }}>{room.roomNumber}</td>
                <td style={{ padding: '12px' }}>{room.floor || '-'}</td>
                <td style={{ padding: '12px' }}>{room.roomType}</td>
                <td style={{ padding: '12px' }}>
                  <StatusBadge status={room.status} />
                </td>
                <td style={{ padding: '12px' }}>
                  <select
                    value={room.status}
                    onChange={(e) => updateStatusMutation.mutate({ id: room.id, data: { status: e.target.value } })}
                    style={{ padding: '4px 8px', marginRight: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OUT_OF_ORDER">Out of Order</option>
                  </select>
                  <button
                    onClick={() => openEditModal(room)}
                    style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '4px' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { if (window.confirm('Delete this room?')) deleteMutation.mutate(room.id); }}
                    style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 0}
          style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: page === 0 ? 'not-allowed' : 'pointer' }}
        >
          Previous
        </button>
        <button
          onClick={() => setPage(page + 1)}
          disabled={rooms.length < 20}
          style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: rooms.length < 20 ? 'not-allowed' : 'pointer' }}
        >
          Next
        </button>
      </div>

      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '400px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Create Room</h2>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>Room Number *</label>
              <input 
                value={createForm.roomNumber}
                onChange={(e) => setCreateForm({...createForm, roomNumber: e.target.value})}
                required 
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} 
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>Floor</label>
              <input 
                type="number"
                value={createForm.floor}
                onChange={(e) => setCreateForm({...createForm, floor: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} 
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>Room Type *</label>
              <select 
                value={createForm.roomType}
                onChange={(e) => setCreateForm({...createForm, roomType: e.target.value})}
                required 
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              >
                <option value="">Select type</option>
                <option value="SINGLE">Single</option>
                <option value="DOUBLE">Double</option>
                <option value="SUITE">Suite</option>
                <option value="DELUXE">Deluxe</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>Notes</label>
              <textarea 
                value={createForm.notes}
                onChange={(e) => setCreateForm({...createForm, notes: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} 
                rows="3" 
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({ roomNumber: '', floor: '', roomType: '', notes: '' });
                }} 
                style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                disabled={!createForm.roomNumber || !createForm.roomType}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: (!createForm.roomNumber || !createForm.roomType) ? '#93c5fd' : '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: (!createForm.roomNumber || !createForm.roomType) ? 'not-allowed' : 'pointer' 
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedRoom && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '400px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Edit Room {selectedRoom.roomNumber}</h2>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>Floor</label>
              <input 
                type="number"
                value={editForm.floor}
                onChange={(e) => setEditForm({...editForm, floor: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} 
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>Room Type</label>
              <select 
                value={editForm.roomType}
                onChange={(e) => setEditForm({...editForm, roomType: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              >
                <option value="">No change</option>
                <option value="SINGLE">Single</option>
                <option value="DOUBLE">Double</option>
                <option value="SUITE">Suite</option>
                <option value="DELUXE">Deluxe</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>Notes</label>
              <textarea 
                value={editForm.notes}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} 
                rows="3" 
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedRoom(null);
                  setEditForm({ floor: '', roomType: '', notes: '' });
                }} 
                style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleEdit}
                style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;