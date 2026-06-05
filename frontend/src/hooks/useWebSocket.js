import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';

const useWebSocket = (topic, onMessage) => {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: { 
        Authorization: `Bearer ${token}` 
      },
      onConnect: () => {
        setConnected(true);
        client.subscribe(topic, (message) => {
          const data = JSON.parse(message.body);
          onMessage(data);
        });
      },
      onDisconnect: () => setConnected(false),
      reconnectDelay: 5000,
      debug: (str) => {
        console.log('WebSocket:', str);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [topic, onMessage]);

  return { connected };
};

export default useWebSocket;