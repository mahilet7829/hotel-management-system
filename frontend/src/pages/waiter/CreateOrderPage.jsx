import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import orderApi from '../../api/orderApi';
import ErrorMessage from '../../components/shared/ErrorMessage';

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const [locationType, setLocationType] = useState('room');
  const [roomId, setRoomId] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { itemName: '', quantity: 1, unitPrice: '', notes: '' }
  ]);

  const createMutation = useMutation({
    mutationFn: (data) => orderApi.createOrder(data),
    onSuccess: () => {
      toast.success('Order created successfully');
      navigate('/waiter');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create order');
    },
  });

  const addItem = () => {
    setItems([...items, { itemName: '', quantity: 1, unitPrice: '', notes: '' }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateItemTotal = (item) => {
    const price = parseFloat(item.unitPrice) || 0;
    const qty = parseInt(item.quantity) || 0;
    return (price * qty).toFixed(2);
  };

  const calculateGrandTotal = () => {
    return items.reduce((total, item) => {
      return total + parseFloat(calculateItemTotal(item));
    }, 0).toFixed(2);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    const orderItems = items.map(item => ({
      itemName: item.itemName,
      quantity: parseInt(item.quantity),
      unitPrice: parseFloat(item.unitPrice),
      notes: item.notes || null,
    }));

    const data = {
      roomId: locationType === 'room' && roomId ? parseInt(roomId) : null,
      tableNumber: locationType === 'table' ? tableNumber : null,
      notes: notes || null,
      items: orderItems,
    };

    createMutation.mutate(data);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Create New Order</h1>

      {createMutation.isError && (
        <ErrorMessage message={createMutation.error.response?.data?.message || 'Failed to create order'} />
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Location</h2>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => setLocationType('room')}
              style={{
                padding: '8px 16px',
                backgroundColor: locationType === 'room' ? '#3b82f6' : '#e5e7eb',
                color: locationType === 'room' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                flex: 1,
              }}
            >
              Room Number
            </button>
            <button
              type="button"
              onClick={() => setLocationType('table')}
              style={{
                padding: '8px 16px',
                backgroundColor: locationType === 'table' ? '#3b82f6' : '#e5e7eb',
                color: locationType === 'table' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                flex: 1,
              }}
            >
              Table Number
            </button>
          </div>

          {locationType === 'room' ? (
            <div>
              <label style={{ display: 'block', marginBottom: '4px' }}>Room ID</label>
              <input
                type="number"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                placeholder="Enter room ID"
              />
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', marginBottom: '4px' }}>Table Number</label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                placeholder="Enter table number"
              />
            </div>
          )}
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Order Items</h2>
            <button
              type="button"
              onClick={addItem}
              style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Add Item
            </button>
          </div>

          {items.map((item, index) => (
            <div key={index} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '4px', marginBottom: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.itemName}
                  onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                  required
                  style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  min="1"
                  required
                  style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                  step="0.01"
                  min="0.01"
                  required
                  style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    style={{ padding: '8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Item notes"
                  value={item.notes}
                  onChange={(e) => updateItem(index, 'notes', e.target.value)}
                  style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
                <div style={{ marginLeft: '16px', fontWeight: 'bold' }}>
                  Subtotal: ${calculateItemTotal(item)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px' }}>Order Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              rows="3"
              placeholder="Any special instructions..."
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            Grand Total: ${calculateGrandTotal()}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigate('/waiter')}
              style={{ padding: '10px 20px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              style={{ padding: '10px 20px', backgroundColor: createMutation.isPending ? '#93c5fd' : '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateOrderPage;