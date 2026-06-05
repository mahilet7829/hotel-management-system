import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import cleaningApi from '../../api/cleaningApi';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

const QRScanPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [scannedValue, setScannedValue] = useState('');
  const [activeTab, setActiveTab] = useState('scan');
  const [manualRoomNumber, setManualRoomNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navItems = [
    { label: 'My Tasks', path: '/cleaner', icon: '📋' },
    { label: 'Scan QR', path: '/cleaner/scan', icon: '📷' },
    { label: 'History', path: '/cleaner/history', icon: '📜' }
  ];
  
  useEffect(() => {
    if (activeTab === 'scan') {
      if (videoRef.current && !qrScannerRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          result => {
            setScannedValue(result.data);
            setError('');
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true
          }
        );
        
        qrScannerRef.current.start().catch(err => {
          setError('Camera access denied. Please check permissions.');
        });
      }
    }
    
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    };
  }, [activeTab]);
  
  const handleStartCleaning = async () => {
    const qrCode = activeTab === 'manual' ? `ROOM:${manualRoomNumber}` : scannedValue;
    
    if (!qrCode) {
      setError('Please scan a QR code or enter a room number');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await cleaningApi.startCleaning({ qrCode });
      setSuccess('Cleaning started successfully!');
      setTimeout(() => {
        navigate('/cleaner');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start cleaning');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCompleteCleaning = async () => {
    const qrCode = activeTab === 'manual' ? `ROOM:${manualRoomNumber}` : scannedValue;
    
    if (!qrCode) {
      setError('Please scan a QR code or enter a room number');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await cleaningApi.completeCleaning({ qrCode });
      setSuccess('Cleaning completed successfully!');
      setTimeout(() => {
        navigate('/cleaner');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete cleaning');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar navItems={navItems} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        
        <main style={{ flex: 1, padding: '24px', backgroundColor: '#f9fafb' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
            Scan QR Code
          </h1>
          
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={() => setActiveTab('scan')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'scan' ? '#3b82f6' : '#e5e7eb',
                color: activeTab === 'scan' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '6px 0 0 6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Scan QR
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'manual' ? '#3b82f6' : '#e5e7eb',
                color: activeTab === 'manual' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '0 6px 6px 0',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Enter Manually
            </button>
          </div>
          
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
          
          {activeTab === 'scan' ? (
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: '100%',
                maxWidth: '500px',
                margin: '0 auto',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <video
                  ref={videoRef}
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
              
              {scannedValue && (
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    Scanned: {scannedValue}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      onClick={handleStartCleaning}
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
                      Start Cleaning
                    </button>
                    <button
                      onClick={handleCompleteCleaning}
                      disabled={loading}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        opacity: loading ? 0.5 : 1
                      }}
                    >
                      Complete Cleaning
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Enter Room Number
                </label>
                <input
                  type="text"
                  value={manualRoomNumber}
                  onChange={(e) => setManualRoomNumber(e.target.value)}
                  placeholder="e.g., 101"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleStartCleaning}
                  disabled={loading || !manualRoomNumber}
                  style={{
                    flex: 1,
                    padding: '12px',
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
                  Start Cleaning
                </button>
                <button
                  onClick={handleCompleteCleaning}
                  disabled={loading || !manualRoomNumber}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  Complete Cleaning
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default QRScanPage;
