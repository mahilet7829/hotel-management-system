package com.hotel.management.room.controller;

import com.hotel.management.common.response.ApiResponse;
import com.hotel.management.room.dto.*;
import com.hotel.management.room.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {
    
    private final RoomService roomService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','WAITER','CLEANER')")
    public ResponseEntity<ApiResponse<Page<RoomDTO>>> getAllRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer floor) {
        Page<RoomDTO> rooms = roomService.getAllRooms(page, size, status, floor);
        return ResponseEntity.ok(ApiResponse.success(rooms));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','WAITER','CLEANER')")
    public ResponseEntity<ApiResponse<RoomDTO>> getRoomById(@PathVariable Long id) {
        RoomDTO room = roomService.getRoomById(id);
        return ResponseEntity.ok(ApiResponse.success(room));
    }
    
    @GetMapping("/number/{roomNumber}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','WAITER','CLEANER')")
    public ResponseEntity<ApiResponse<RoomDTO>> getRoomByNumber(@PathVariable String roomNumber) {
        RoomDTO room = roomService.getRoomByNumber(roomNumber);
        return ResponseEntity.ok(ApiResponse.success(room));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<RoomDTO>> createRoom(@Valid @RequestBody CreateRoomRequest request) {
        RoomDTO room = roomService.createRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(room));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<RoomDTO>> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoomRequest request) {
        RoomDTO room = roomService.updateRoom(id, request);
        return ResponseEntity.ok(ApiResponse.success(room));
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CLEANER')")
    public ResponseEntity<ApiResponse<RoomDTO>> updateRoomStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoomStatusRequest request) {
        RoomDTO room = roomService.updateRoomStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success(room));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok(ApiResponse.success("Room deleted", null));
    }
    
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getRoomSummary() {
        Map<String, Long> summary = roomService.getRoomStatusSummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
    
    @PostMapping("/{id}/regenerate-qr")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<RoomDTO>> regenerateQrCode(@PathVariable Long id) {
        RoomDTO room = roomService.regenerateQrCode(id);
        return ResponseEntity.ok(ApiResponse.success(room));
    }
}