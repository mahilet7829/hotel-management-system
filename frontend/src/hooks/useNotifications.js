import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import notificationApi from '../api/notificationApi';
import  useWebSocket  from './useWebSocket';

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState([]);
  
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: async () => {
      const response = await notificationApi.getUnreadCount();
      return response.data.data.count;
    },
    refetchInterval: 60000
  });
  
  const { data: recentNotifications = [] } = useQuery({
    queryKey: ['notifications', { page: 0, size: 5 }],
    queryFn: async () => {
      const response = await notificationApi.getNotifications({ page: 0, size: 5 });
      setNotifications(response.data.data.content);
      return response.data.data.content;
    }
  });
  
  const handleWebSocketMessage = useCallback((message) => {
    setNotifications(prev => [message, ...prev].slice(0, 5));
    queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
  }, [queryClient]);
  
  useWebSocket('/queue/notifications', handleWebSocketMessage);
  
  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  return {
    unreadCount: unreadCount || 0,
    notifications,
    markAsRead,
    markAllAsRead
  };
};