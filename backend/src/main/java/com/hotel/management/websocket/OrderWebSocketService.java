package com.hotel.management.websocket;

import com.hotel.management.order.dto.OrderDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class OrderWebSocketService {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    public OrderWebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }
    
    public void notifyKitchenNewOrder(OrderDTO order) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "NEW_ORDER");
        message.put("order", order);
        messagingTemplate.convertAndSend("/topic/kitchen", message);
    }
    
    public void notifyOrderStatusChange(OrderDTO order) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "STATUS_CHANGE");
        message.put("order", order);
        messagingTemplate.convertAndSend("/topic/kitchen", message);
    }
    
    public void notifyWaiterOrderReady(Long waiterId, OrderDTO order) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "ORDER_READY");
        message.put("order", order);
        messagingTemplate.convertAndSendToUser(
                waiterId.toString(), "/queue/notifications", message);
    }
}