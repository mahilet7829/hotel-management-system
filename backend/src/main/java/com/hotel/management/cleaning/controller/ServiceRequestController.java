package com.hotel.management.cleaning.controller;

import com.hotel.management.cleaning.dto.CreateServiceRequestDTO;
import com.hotel.management.cleaning.dto.ServiceRequestDTO;
import com.hotel.management.cleaning.dto.UpdateServiceRequestDTO;
import com.hotel.management.cleaning.service.ServiceRequestService;
import com.hotel.management.common.response.ApiResponse;
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

import java.util.Map;

@RestController
@RequestMapping("/api/service-requests")
@RequiredArgsConstructor
public class ServiceRequestController {
    
    private final ServiceRequestService serviceRequestService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Page<ServiceRequestDTO>>> getAllRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        Page<ServiceRequestDTO> requests = serviceRequestService.getAllRequests(page, size, status);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }
    
    @GetMapping("/my-requests")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<ServiceRequestDTO>>> getMyRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getCurrentUserId();
        Page<ServiceRequestDTO> requests = serviceRequestService.getMyAssignedRequests(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ServiceRequestDTO>> createRequest(
            @Valid @RequestBody CreateServiceRequestDTO request) {
        Long requestedBy = getCurrentUserId();
        ServiceRequestDTO serviceRequest = serviceRequestService.createRequest(request, requestedBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(serviceRequest));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<ServiceRequestDTO>> updateRequest(
            @PathVariable Long id,
            @Valid @RequestBody UpdateServiceRequestDTO request) {
        Long updatedBy = getCurrentUserId();
        ServiceRequestDTO serviceRequest = serviceRequestService.updateRequest(id, request, updatedBy);
        return ResponseEntity.ok(ApiResponse.success(serviceRequest));
    }
    
    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<ServiceRequestDTO>> assignRequest(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body) {
        Long userId = body.get("userId");
        if (userId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("userId is required"));
        }
        ServiceRequestDTO serviceRequest = serviceRequestService.assignRequest(id, userId);
        return ResponseEntity.ok(ApiResponse.success(serviceRequest));
    }
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }
}