package com.hotel.management.cleaning.service;

import com.hotel.management.cleaning.dto.CreateServiceRequestDTO;
import com.hotel.management.cleaning.dto.ServiceRequestDTO;
import com.hotel.management.cleaning.dto.UpdateServiceRequestDTO;
import com.hotel.management.cleaning.entity.ServiceRequest;
import com.hotel.management.cleaning.repository.ServiceRequestRepository;
import com.hotel.management.common.exception.ResourceNotFoundException;
import com.hotel.management.common.exception.ValidationException;
import com.hotel.management.room.entity.Room;
import com.hotel.management.room.repository.RoomRepository;
import com.hotel.management.user.entity.User;
import com.hotel.management.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ServiceRequestService {
    
    private final ServiceRequestRepository serviceRequestRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    
    private static final List<String> VALID_REQUEST_TYPES = Arrays.asList(
        "HOUSEKEEPING", "MAINTENANCE", "EXTRA_TOWELS", "WAKE_UP_CALL", "OTHER"
    );
    
    private static final List<String> VALID_PRIORITIES = Arrays.asList(
        "LOW", "NORMAL", "HIGH", "URGENT"
    );
    
    private static final List<String> VALID_STATUSES = Arrays.asList(
        "OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CANCELLED"
    );
    
    public ServiceRequestDTO createRequest(CreateServiceRequestDTO request, Long requestedBy) {
        Room room = roomRepository.findById(request.getRoomId())
            .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + request.getRoomId()));
        
        if (!VALID_REQUEST_TYPES.contains(request.getRequestType().toUpperCase())) {
            throw new ValidationException("Invalid request type. Valid types: " + String.join(", ", VALID_REQUEST_TYPES));
        }
        
        String priority = request.getPriority() != null ? request.getPriority().toUpperCase() : "NORMAL";
        if (!VALID_PRIORITIES.contains(priority)) {
            throw new ValidationException("Invalid priority. Valid priorities: " + String.join(", ", VALID_PRIORITIES));
        }
        
        ServiceRequest serviceRequest = ServiceRequest.builder()
            .roomId(request.getRoomId())
            .requestedBy(requestedBy)
            .guestName(request.getGuestName())
            .requestType(request.getRequestType().toUpperCase())
            .description(request.getDescription())
            .priority(priority)
            .status("OPEN")
            .notes(request.getNotes())
            .build();
        
        ServiceRequest saved = serviceRequestRepository.save(serviceRequest);
        log.info("Service request created: type={}, room={}", request.getRequestType(), room.getRoomNumber());
        return mapToDTO(saved);
    }
    
    public Page<ServiceRequestDTO> getAllRequests(int page, int size, String statusFilter) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Page<ServiceRequest> requests;
        if (statusFilter != null && !statusFilter.trim().isEmpty()) {
            requests = serviceRequestRepository.findByStatus(statusFilter, pageable);
        } else {
            requests = serviceRequestRepository.findAll(pageable);
        }
        
        return requests.map(this::mapToDTO);
    }
    
    public Page<ServiceRequestDTO> getMyAssignedRequests(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ServiceRequest> requests = serviceRequestRepository.findByAssignedTo(userId, pageable);
        return requests.map(this::mapToDTO);
    }
    
    public ServiceRequestDTO updateRequest(Long id, UpdateServiceRequestDTO request, Long updatedBy) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Service request not found with id: " + id));
        
        if (request.getStatus() != null) {
            String status = request.getStatus().toUpperCase();
            if (!VALID_STATUSES.contains(status)) {
                throw new ValidationException("Invalid status. Valid statuses: " + String.join(", ", VALID_STATUSES));
            }
            serviceRequest.setStatus(status);
            
            if (status.equals("RESOLVED")) {
                serviceRequest.setResolvedAt(LocalDateTime.now());
            }
        }
        
        if (request.getAssignedTo() != null) {
            User assignee = userRepository.findById(request.getAssignedTo())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getAssignedTo()));
            serviceRequest.setAssignedTo(request.getAssignedTo());
        }
        
        if (request.getNotes() != null) {
            serviceRequest.setNotes(request.getNotes());
        }
        
        if (request.getPriority() != null) {
            String priority = request.getPriority().toUpperCase();
            if (!VALID_PRIORITIES.contains(priority)) {
                throw new ValidationException("Invalid priority. Valid priorities: " + String.join(", ", VALID_PRIORITIES));
            }
            serviceRequest.setPriority(priority);
        }
        
        ServiceRequest saved = serviceRequestRepository.save(serviceRequest);
        log.info("Service request updated: id={}, status={}", id, saved.getStatus());
        return mapToDTO(saved);
    }
    
    public ServiceRequestDTO assignRequest(Long id, Long assignToUserId) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Service request not found with id: " + id));
        
        User assignee = userRepository.findById(assignToUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + assignToUserId));
        
        serviceRequest.setAssignedTo(assignToUserId);
        serviceRequest.setStatus("ASSIGNED");
        
        ServiceRequest saved = serviceRequestRepository.save(serviceRequest);
        String assigneeName = assignee.getFirstName() + " " + assignee.getLastName();
        log.info("Service request assigned: id={}, assignee={}", id, assigneeName);
        return mapToDTO(saved);
    }
    
    private ServiceRequestDTO mapToDTO(ServiceRequest sr) {
        String roomNumber = "";
        try {
            Room room = roomRepository.findById(sr.getRoomId()).orElse(null);
            if (room != null) {
                roomNumber = room.getRoomNumber();
            }
        } catch (Exception e) {
            log.error("Error fetching room for service request", e);
        }
        
        String requesterName = null;
        if (sr.getRequestedBy() != null) {
            try {
                User requester = userRepository.findById(sr.getRequestedBy()).orElse(null);
                if (requester != null) {
                    requesterName = requester.getFirstName() + " " + requester.getLastName();
                }
            } catch (Exception e) {
                log.error("Error fetching requester for service request", e);
            }
        }
        
        String assignedToName = null;
        if (sr.getAssignedTo() != null) {
            try {
                User assigned = userRepository.findById(sr.getAssignedTo()).orElse(null);
                if (assigned != null) {
                    assignedToName = assigned.getFirstName() + " " + assigned.getLastName();
                }
            } catch (Exception e) {
                log.error("Error fetching assignee for service request", e);
            }
        }
        
        return ServiceRequestDTO.builder()
            .id(sr.getId())
            .roomId(sr.getRoomId())
            .roomNumber(roomNumber)
            .requestedBy(sr.getRequestedBy())
            .requesterName(requesterName)
            .guestName(sr.getGuestName())
            .requestType(sr.getRequestType())
            .description(sr.getDescription())
            .priority(sr.getPriority())
            .status(sr.getStatus())
            .assignedTo(sr.getAssignedTo())
            .assignedToName(assignedToName)
            .createdAt(sr.getCreatedAt())
            .resolvedAt(sr.getResolvedAt())
            .notes(sr.getNotes())
            .build();
    }
}