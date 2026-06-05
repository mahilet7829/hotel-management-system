package com.hotel.management.cleaning.controller;

import com.hotel.management.cleaning.dto.*;
import com.hotel.management.cleaning.service.CleaningService;
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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cleaning")
@RequiredArgsConstructor
public class CleaningController {
    
    private final CleaningService cleaningService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Page<CleaningLogDTO>>> getAllCleaningLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        Page<CleaningLogDTO> logs = cleaningService.getAllCleaningLogs(page, size, status);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
    
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CLEANER')")
    public ResponseEntity<ApiResponse<List<CleaningLogDTO>>> getActiveTasks() {
        List<CleaningLogDTO> tasks = cleaningService.getActiveTasks();
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }
    
    @GetMapping("/my-tasks")
    @PreAuthorize("hasRole('CLEANER')")
    public ResponseEntity<ApiResponse<Page<CleaningLogDTO>>> getMyTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long cleanerId = getCurrentUserId();
        Page<CleaningLogDTO> tasks = cleaningService.getMyCleaningTasks(cleanerId, page, size);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }
    
    @GetMapping("/my-stats")
    @PreAuthorize("hasRole('CLEANER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyStats() {
        Long cleanerId = getCurrentUserId();
        Map<String, Object> stats = cleaningService.getCleanerStats(cleanerId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CLEANER')")
    public ResponseEntity<ApiResponse<CleaningLogDTO>> getCleaningLogById(@PathVariable Long id) {
        CleaningLogDTO log = cleaningService.getCleaningLogById(id);
        return ResponseEntity.ok(ApiResponse.success(log));
    }
    
    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<CleaningLogDTO>> assignCleaning(
            @Valid @RequestBody AssignCleaningRequest request) {
        Long assignedBy = getCurrentUserId();
        CleaningLogDTO cleaningLog = cleaningService.assignCleaning(request, assignedBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(cleaningLog));
    }
    
    @PostMapping("/start")
    @PreAuthorize("hasRole('CLEANER')")
    public ResponseEntity<ApiResponse<CleaningLogDTO>> startCleaning(
            @Valid @RequestBody StartCleaningRequest request) {
        Long cleanerId = getCurrentUserId();
        CleaningLogDTO cleaningLog = cleaningService.startCleaning(request, cleanerId);
        return ResponseEntity.ok(ApiResponse.success(cleaningLog));
    }
    
    @PostMapping("/complete")
    @PreAuthorize("hasRole('CLEANER')")
    public ResponseEntity<ApiResponse<CleaningLogDTO>> completeCleaning(
            @Valid @RequestBody CompleteCleaningRequest request) {
        Long cleanerId = getCurrentUserId();
        CleaningLogDTO cleaningLog = cleaningService.completeCleaning(request, cleanerId);
        return ResponseEntity.ok(ApiResponse.success(cleaningLog));
    }
    
    @PostMapping("/{id}/skip")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<CleaningLogDTO>> skipCleaning(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Long requestingUserId = getCurrentUserId();
        String reason = body.getOrDefault("reason", "Skipped by manager");
        CleaningLogDTO cleaningLog = cleaningService.skipCleaning(id, requestingUserId, reason);
        return ResponseEntity.ok(ApiResponse.success(cleaningLog));
    }
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }
}
