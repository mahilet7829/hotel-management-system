package com.hotel.management.room.service;

import com.hotel.management.qr.service.QrCodeService;
import com.hotel.management.room.dto.*;
import com.hotel.management.room.entity.Room;
import com.hotel.management.room.entity.RoomType;
import com.hotel.management.room.entity.RoomStatus;
import com.hotel.management.room.repository.RoomRepository;
import com.hotel.management.common.exception.ResourceNotFoundException;
import com.hotel.management.common.exception.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class RoomService {
    
    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private QrCodeService qrCodeService;
    
    public RoomDTO createRoom(CreateRoomRequest request) {
        if (roomRepository.existsByRoomNumber(request.getRoomNumber())) {
            throw new ValidationException("Room number " + request.getRoomNumber() + " already exists");
        }
        
        try {
            RoomType.valueOf(request.getRoomType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid room type: " + request.getRoomType());
        }
        
        String qrCodePath = qrCodeService.generateRoomQrCode(request.getRoomNumber());
        
        Room room = new Room();
        room.setRoomNumber(request.getRoomNumber());
        room.setFloor(request.getFloor());
        room.setRoomType(request.getRoomType().toUpperCase());
        room.setStatus("AVAILABLE");
        room.setQrCodePath(qrCodePath);
        room.setNotes(request.getNotes());
        
        Room savedRoom = roomRepository.save(room);
        return mapToDTO(savedRoom);
    }
    
    public Page<RoomDTO> getAllRooms(int page, int size, String statusFilter, Integer floorFilter) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Room> rooms;
        
        if (statusFilter != null && !statusFilter.isEmpty() && floorFilter != null) {
            rooms = roomRepository.findByStatusAndFloor(statusFilter, floorFilter, pageRequest);
        } else if (statusFilter != null && !statusFilter.isEmpty()) {
            rooms = roomRepository.findByStatus(statusFilter, pageRequest);
        } else if (floorFilter != null) {
            rooms = roomRepository.findByFloor(floorFilter, pageRequest);
        } else {
            rooms = roomRepository.findAll(pageRequest);
        }
        
        return rooms.map(this::mapToDTO);
    }
    
    public RoomDTO getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        return mapToDTO(room);
    }
    
    public RoomDTO getRoomByNumber(String roomNumber) {
        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with number: " + roomNumber));
        return mapToDTO(room);
    }
    
    public RoomDTO updateRoom(Long id, UpdateRoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        
        if (request.getFloor() != null) {
            room.setFloor(request.getFloor());
        }
        if (request.getRoomType() != null && !request.getRoomType().isEmpty()) {
            try {
                RoomType.valueOf(request.getRoomType().toUpperCase());
                room.setRoomType(request.getRoomType().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new ValidationException("Invalid room type: " + request.getRoomType());
            }
        }
        if (request.getNotes() != null) {
            room.setNotes(request.getNotes());
        }
        
        Room updatedRoom = roomRepository.save(room);
        return mapToDTO(updatedRoom);
    }
    
    public RoomDTO updateRoomStatus(Long id, UpdateRoomStatusRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        
        try {
            RoomStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid room status: " + request.getStatus());
        }
        
        room.setStatus(request.getStatus().toUpperCase());
        if (request.getNotes() != null) {
            room.setNotes(request.getNotes());
        }
        
        Room updatedRoom = roomRepository.save(room);
        return mapToDTO(updatedRoom);
    }
    
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        
        if ("OCCUPIED".equals(room.getStatus())) {
            throw new ValidationException("Cannot delete an occupied room");
        }
        
        roomRepository.delete(room);
    }
    
    public Map<String, Long> getRoomStatusSummary() {
        Map<String, Long> summary = new HashMap<>();
        for (RoomStatus status : RoomStatus.values()) {
            summary.put(status.name(), roomRepository.countByStatus(status.name()));
        }
        return summary;
    }
    
    public RoomDTO regenerateQrCode(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        
        String qrCodePath = qrCodeService.generateRoomQrCode(room.getRoomNumber());
        room.setQrCodePath(qrCodePath);
        
        Room updatedRoom = roomRepository.save(room);
        return mapToDTO(updatedRoom);
    }
    
    private RoomDTO mapToDTO(Room room) {
        RoomDTO dto = new RoomDTO();
        dto.setId(room.getId());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setFloor(room.getFloor());
        dto.setRoomType(room.getRoomType());
        dto.setStatus(room.getStatus());
        dto.setQrCodePath(room.getQrCodePath());
        dto.setNotes(room.getNotes());
        dto.setCreatedAt(room.getCreatedAt());
        dto.setUpdatedAt(room.getUpdatedAt());
        return dto;
    }
}