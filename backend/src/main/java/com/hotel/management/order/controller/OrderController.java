package com.hotel.management.order.controller;

import com.hotel.management.common.response.ApiResponse;
import com.hotel.management.order.dto.*;
import com.hotel.management.order.service.OrderService;
import com.hotel.management.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    
    private final OrderService orderService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Page<OrderDTO>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        Page<OrderDTO> orders = orderService.getAllOrders(page, size, status);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
    
    @GetMapping("/kitchen")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CHEF')")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getKitchenOrders() {
        List<OrderDTO> orders = orderService.getActiveKitchenOrders();
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
    
    @GetMapping("/my-orders")
    @PreAuthorize("hasAnyRole('WAITER','ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderDTO>>> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long currentUserId = getCurrentUserId();
        Page<OrderDTO> orders = orderService.getOrdersByWaiter(currentUserId, page, size);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','WAITER','CHEF')")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrderById(@PathVariable Long id) {
        OrderDTO order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(order));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('WAITER','ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<OrderDTO>> createOrder(
            @Valid @RequestBody CreateOrderRequest request) {
        Long currentUserId = getCurrentUserId();
        OrderDTO order = orderService.createOrder(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(order));
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','WAITER','CHEF')")
    public ResponseEntity<ApiResponse<OrderDTO>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        Long currentUserId = getCurrentUserId();
        OrderDTO order = orderService.updateOrderStatus(id, request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(order));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','WAITER')")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id, getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success("Order cancelled", null));
    }
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }
}