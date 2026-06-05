package com.hotel.management.order.service;

import com.hotel.management.common.exception.ResourceNotFoundException;
import com.hotel.management.common.exception.ValidationException;
import com.hotel.management.notification.service.NotificationService;
import com.hotel.management.order.dto.*;
import com.hotel.management.order.entity.Order;
import com.hotel.management.order.entity.OrderItem;
import com.hotel.management.order.entity.OrderStatus;
import com.hotel.management.order.repository.OrderRepository;
import com.hotel.management.room.entity.Room;
import com.hotel.management.room.repository.RoomRepository;
import com.hotel.management.user.entity.User;
import com.hotel.management.user.repository.UserRepository;
import com.hotel.management.websocket.OrderWebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final OrderWebSocketService webSocketService;
    private final NotificationService notificationService;
    
    public OrderDTO createOrder(CreateOrderRequest request, Long waiterId) {
        if (request.getRoomId() != null) {
            roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + request.getRoomId()));
        }
        
        String orderNumber = generateOrderNumber();
        
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .roomId(request.getRoomId())
                .tableNumber(request.getTableNumber())
                .waiterId(waiterId)
                .status(OrderStatus.PENDING.name())
                .notes(request.getNotes())
                .createdAt(LocalDateTime.now())
                .build();
        
        List<OrderItem> items = request.getItems().stream()
                .map(item -> OrderItem.builder()
                        .itemName(item.getItemName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .notes(item.getNotes())
                        .order(order)
                        .build())
                .collect(Collectors.toList());
        
        order.setItems(items);
        
        BigDecimal totalAmount = items.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalAmount(totalAmount);
        
        Order savedOrder = orderRepository.save(order);
        OrderDTO orderDTO = mapToDTO(savedOrder);
        
        // Notify all chefs about new order
        notifyChefsAboutNewOrder(savedOrder);
        
        webSocketService.notifyKitchenNewOrder(orderDTO);
        
        return orderDTO;
    }
    
    public Page<OrderDTO> getAllOrders(int page, int size, String statusFilter) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Order> orders;
        
        if (statusFilter != null) {
            orders = orderRepository.findByStatus(statusFilter, pageRequest);
        } else {
            orders = orderRepository.findAll(pageRequest);
        }
        
        return orders.map(this::mapToDTO);
    }
    
    public Page<OrderDTO> getOrdersByWaiter(Long waiterId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        return orderRepository.findByWaiterId(waiterId, pageRequest)
                .map(this::mapToDTO);
    }
    
    public Page<OrderDTO> getOrdersByChef(Long chefId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        return orderRepository.findByChefId(chefId, pageRequest)
                .map(this::mapToDTO);
    }
    
    public List<OrderDTO> getActiveKitchenOrders() {
        List<String> activeStatuses = List.of(
                OrderStatus.CONFIRMED.name(),
                OrderStatus.PREPARING.name(),
                OrderStatus.READY.name()
        );
        return orderRepository.findByStatusIn(activeStatuses)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return mapToDTO(order);
    }
    
    public OrderDTO updateOrderStatus(Long orderId, UpdateOrderStatusRequest request, Long currentUserId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        OrderStatus currentStatus = OrderStatus.valueOf(order.getStatus());
        OrderStatus newStatus = OrderStatus.valueOf(request.getStatus().toUpperCase());
        
        validateStatusTransition(currentStatus, newStatus, currentUserId, order.getWaiterId());
        
        updateStatusTimestamps(order, currentStatus, newStatus, currentUserId, request.getChefId());
        
        order.setStatus(newStatus.name());
        Order savedOrder = orderRepository.save(order);
        OrderDTO orderDTO = mapToDTO(savedOrder);
        
        // Send notifications based on new status
        sendStatusChangeNotifications(savedOrder, newStatus);
        
        webSocketService.notifyOrderStatusChange(orderDTO);
        
        if (newStatus == OrderStatus.READY && savedOrder.getWaiterId() != null) {
            webSocketService.notifyWaiterOrderReady(savedOrder.getWaiterId(), orderDTO);
        }
        
        return orderDTO;
    }
    
    public void cancelOrder(Long orderId, Long requestingUserId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        if (OrderStatus.DELIVERED.name().equals(order.getStatus())) {
            throw new ValidationException("Cannot cancel a delivered order");
        }
        
        order.setStatus(OrderStatus.CANCELLED.name());
        order.setCancelledAt(LocalDateTime.now());
        orderRepository.save(order);
    }
    
    private void notifyChefsAboutNewOrder(Order order) {
        // Get all users with ROLE_CHEF
        List<User> chefs = userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> role.getName().equals("ROLE_CHEF")))
                .collect(Collectors.toList());
        
        for (User chef : chefs) {
            notificationService.createNotification(
                chef.getId(),
                "New Order",
                "New order #" + order.getOrderNumber() + " requires preparation",
                "ORDER_CREATED",
                "ORDER",
                order.getId()
            );
        }
    }
    
    private void sendStatusChangeNotifications(Order order, OrderStatus newStatus) {
        switch (newStatus) {
            case READY:
                if (order.getWaiterId() != null) {
                    notificationService.createNotification(
                        order.getWaiterId(),
                        "Order Ready",
                        "Order #" + order.getOrderNumber() + " is ready for delivery",
                        "ORDER_READY",
                        "ORDER",
                        order.getId()
                    );
                }
                break;
                
            case DELIVERED:
                // Notify managers about completed order
                List<User> managers = userRepository.findAll().stream()
                        .filter(user -> user.getRoles().stream()
                                .anyMatch(role -> role.getName().equals("ROLE_MANAGER")))
                        .collect(Collectors.toList());
                
                for (User manager : managers) {
                    notificationService.createNotification(
                        manager.getId(),
                        "Order Delivered",
                        "Order #" + order.getOrderNumber() + " has been delivered",
                        "ORDER_DELIVERED",
                        "ORDER",
                        order.getId()
                    );
                }
                break;
        }
    }
    
    private void validateStatusTransition(OrderStatus current, OrderStatus newStatus, 
                                         Long userId, Long waiterId) {
        boolean isValid = switch (current) {
            case PENDING -> newStatus == OrderStatus.CONFIRMED || newStatus == OrderStatus.CANCELLED;
            case CONFIRMED -> newStatus == OrderStatus.PREPARING || newStatus == OrderStatus.CANCELLED;
            case PREPARING -> newStatus == OrderStatus.READY || newStatus == OrderStatus.CANCELLED;
            case READY -> newStatus == OrderStatus.DELIVERED || newStatus == OrderStatus.CANCELLED;
            case DELIVERED, CANCELLED -> false;
        };
        
        if (!isValid) {
            throw new ValidationException(
                String.format("Invalid status transition from %s to %s", current, newStatus));
        }
    }
    
    private void updateStatusTimestamps(Order order, OrderStatus current, OrderStatus newStatus, 
                                       Long userId, Long chefId) {
        LocalDateTime now = LocalDateTime.now();
        
        switch (newStatus) {
            case CONFIRMED -> order.setConfirmedAt(now);
            case PREPARING -> {
                order.setPreparingAt(now);
                if (order.getChefId() == null) {
                    order.setChefId(userId);
                }
            }
            case READY -> order.setReadyAt(now);
            case DELIVERED -> order.setDeliveredAt(now);
            case CANCELLED -> order.setCancelledAt(now);
        }
    }
    
    private String generateOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = String.format("%04d", new Random().nextInt(10000));
        String orderNumber = "ORD-" + datePart + "-" + randomPart;
        
        while (orderRepository.findByOrderNumber(orderNumber).isPresent()) {
            randomPart = String.format("%04d", new Random().nextInt(10000));
            orderNumber = "ORD-" + datePart + "-" + randomPart;
        }
        
        return orderNumber;
    }
    
    private OrderDTO mapToDTO(Order order) {
        String waiterName = null;
        if (order.getWaiterId() != null) {
            User waiter = userRepository.findById(order.getWaiterId()).orElse(null);
            if (waiter != null) {
                waiterName = waiter.getFirstName() + " " + waiter.getLastName();
            }
        }
        
        String chefName = null;
        if (order.getChefId() != null) {
            User chef = userRepository.findById(order.getChefId()).orElse(null);
            if (chef != null) {
                chefName = chef.getFirstName() + " " + chef.getLastName();
            }
        }
        
        String roomNumber = null;
        if (order.getRoomId() != null) {
            Room room = roomRepository.findById(order.getRoomId()).orElse(null);
            if (room != null) {
                roomNumber = room.getRoomNumber();
            }
        }
        
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .map(item -> OrderItemDTO.builder()
                        .id(item.getId())
                        .itemName(item.getItemName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .notes(item.getNotes())
                        .build())
                .collect(Collectors.toList());
        
        return OrderDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .roomId(order.getRoomId())
                .roomNumber(roomNumber)
                .tableNumber(order.getTableNumber())
                .waiterId(order.getWaiterId())
                .waiterName(waiterName)
                .chefId(order.getChefId())
                .chefName(chefName)
                .status(order.getStatus())
                .notes(order.getNotes())
                .items(itemDTOs)
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .confirmedAt(order.getConfirmedAt())
                .preparingAt(order.getPreparingAt())
                .readyAt(order.getReadyAt())
                .deliveredAt(order.getDeliveredAt())
                .cancelledAt(order.getCancelledAt())
                .build();
    }
}