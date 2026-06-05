package com.hotel.management.cleaning.service;

import com.hotel.management.cleaning.dto.*;
import com.hotel.management.cleaning.entity.CleaningLog;
import com.hotel.management.cleaning.entity.CleaningStatus;
import com.hotel.management.cleaning.repository.CleaningLogRepository;
import com.hotel.management.common.exception.ResourceNotFoundException;
import com.hotel.management.common.exception.ValidationException;
import com.hotel.management.notification.service.NotificationService;
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
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CleaningService {
    
    private final CleaningLogRepository cleaningLogRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;
    
    public CleaningLogDTO assignCleaning(AssignCleaningRequest request, Long assignedBy) {
        Room room = roomRepository.findById(request.getRoomId())
            .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + request.getRoomId()));
        
        User cleaner = userRepository.findById(request.getCleanerId())
            .orElseThrow(() -> new ResourceNotFoundException("Cleaner not found with id: " + request.getCleanerId()));
        
        Optional<CleaningLog> existingActive = cleaningLogRepository.findByRoom_IdAndStatus(room.getId(), "ASSIGNED");
        if (existingActive.isPresent()) {
            throw new ValidationException("Room already has an active cleaning task");
        }
        
        existingActive = cleaningLogRepository.findByRoom_IdAndStatus(room.getId(), "IN_PROGRESS");
        if (existingActive.isPresent()) {
            throw new ValidationException("Room already has an active cleaning task");
        }
        
        CleaningLog cleaningLog = new CleaningLog();
        cleaningLog.setRoom(room);
        cleaningLog.setCleaner(cleaner);
        
        if (request.getSupervisorId() != null) {
            User supervisor = userRepository.findById(request.getSupervisorId())
                .orElseThrow(() -> new ResourceNotFoundException("Supervisor not found with id: " + request.getSupervisorId()));
            cleaningLog.setSupervisor(supervisor);
        }
        
        cleaningLog.setNotes(request.getNotes());
        cleaningLog.setStatus(CleaningStatus.ASSIGNED.name());
        cleaningLog.setAssignedAt(LocalDateTime.now());
        
        CleaningLog savedLog = cleaningLogRepository.save(cleaningLog);
        
        room.setStatus("CLEANING");
        roomRepository.save(room);
        
        CleaningLogDTO dto = mapToDTO(savedLog);
        
        messagingTemplate.convertAndSendToUser(
            cleaner.getId().toString(),
            "/queue/cleaning",
            Map.of("type", "NEW_TASK", "task", dto)
        );
        
        notificationService.createNotification(
            cleaner.getId(),
            "New Cleaning Task",
            "You have been assigned to clean room " + room.getRoomNumber(),
            "CLEANING_ASSIGNED",
            "CLEANING_LOG",
            savedLog.getId()
        );
        
        String cleanerName = cleaner.getFirstName() + " " + cleaner.getLastName();
        log.info("Cleaning task assigned: room={}, cleaner={}", room.getRoomNumber(), cleanerName);
        return dto;
    }
    
    public CleaningLogDTO startCleaning(StartCleaningRequest request, Long cleanerId) {
        String roomNumber = extractRoomNumberFromQR(request.getQrCode());
        
        Room room = roomRepository.findByRoomNumber(roomNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomNumber));
        
        CleaningLog cleaningLog = cleaningLogRepository.findByRoom_IdAndStatus(room.getId(), "ASSIGNED")
            .orElseThrow(() -> new ValidationException("No assigned cleaning task for this room"));
        
        if (!cleaningLog.getCleaner().getId().equals(cleanerId)) {
            throw new ValidationException("This task is not assigned to you");
        }
        
        cleaningLog.setStatus(CleaningStatus.IN_PROGRESS.name());
        cleaningLog.setStartedAt(LocalDateTime.now());
        
        CleaningLog savedLog = cleaningLogRepository.save(cleaningLog);
        
        room.setStatus("CLEANING");
        roomRepository.save(room);
        
        CleaningLogDTO dto = mapToDTO(savedLog);
        
        messagingTemplate.convertAndSend("/topic/cleaning-updates", 
            Map.of("type", "TASK_STARTED", "task", dto));
        
        log.info("Cleaning started: room={}, cleaner={}", roomNumber, cleanerId);
        return dto;
    }
    
    public CleaningLogDTO completeCleaning(CompleteCleaningRequest request, Long cleanerId) {
        String roomNumber = extractRoomNumberFromQR(request.getQrCode());
        
        Room room = roomRepository.findByRoomNumber(roomNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomNumber));
        
        CleaningLog cleaningLog = cleaningLogRepository.findByRoom_IdAndStatus(room.getId(), "IN_PROGRESS")
            .orElseThrow(() -> new ValidationException("No in-progress cleaning task for this room"));
        
        if (!cleaningLog.getCleaner().getId().equals(cleanerId)) {
            throw new ValidationException("This task is not assigned to you");
        }
        
        long minutes = ChronoUnit.MINUTES.between(cleaningLog.getStartedAt(), LocalDateTime.now());
        cleaningLog.setDurationMinutes((int) minutes);
        cleaningLog.setStatus(CleaningStatus.COMPLETED.name());
        cleaningLog.setCompletedAt(LocalDateTime.now());
        
        if (request.getNotes() != null && !request.getNotes().trim().isEmpty()) {
            cleaningLog.setNotes(request.getNotes());
        }
        
        CleaningLog savedLog = cleaningLogRepository.save(cleaningLog);
        
        room.setStatus("AVAILABLE");
        roomRepository.save(room);
        
        CleaningLogDTO dto = mapToDTO(savedLog);
        
        if (cleaningLog.getSupervisor() != null) {
            messagingTemplate.convertAndSendToUser(
                cleaningLog.getSupervisor().getId().toString(),
                "/queue/cleaning",
                Map.of("type", "TASK_COMPLETED", "task", dto)
            );
            
            notificationService.createNotification(
                cleaningLog.getSupervisor().getId(),
                "Cleaning Completed",
                "Room " + roomNumber + " has been cleaned by " + dto.getCleanerName(),
                "CLEANING_COMPLETED",
                "CLEANING_LOG",
                savedLog.getId()
            );
        }
        
        messagingTemplate.convertAndSend("/topic/cleaning-updates",
            Map.of("type", "TASK_COMPLETED", "task", dto));
        
        log.info("Cleaning completed: room={}, cleaner={}, duration={}min", roomNumber, cleanerId, minutes);
        return dto;
    }
    
    public CleaningLogDTO skipCleaning(Long logId, Long requestingUserId, String reason) {
        CleaningLog cleaningLog = cleaningLogRepository.findById(logId)
            .orElseThrow(() -> new ResourceNotFoundException("Cleaning log not found with id: " + logId));
        
        if (cleaningLog.getStatus().equals(CleaningStatus.COMPLETED.name()) || 
            cleaningLog.getStatus().equals(CleaningStatus.SKIPPED.name())) {
            throw new ValidationException("Cannot skip this task");
        }
        
        cleaningLog.setStatus(CleaningStatus.SKIPPED.name());
        cleaningLog.setNotes(reason);
        
        CleaningLog savedLog = cleaningLogRepository.save(cleaningLog);
        
        Room room = cleaningLog.getRoom();
        room.setStatus("AVAILABLE");
        roomRepository.save(room);
        
        CleaningLogDTO dto = mapToDTO(savedLog);
        
        messagingTemplate.convertAndSend("/topic/cleaning-updates",
            Map.of("type", "TASK_SKIPPED", "task", dto));
        
        log.info("Cleaning task skipped: id={}, room={}", logId, room.getRoomNumber());
        return dto;
    }
    
    public Page<CleaningLogDTO> getAllCleaningLogs(int page, int size, String statusFilter) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "assignedAt"));
        
        Page<CleaningLog> logs;
        if (statusFilter != null && !statusFilter.trim().isEmpty()) {
            logs = cleaningLogRepository.findByStatus(statusFilter, pageable);
        } else {
            logs = cleaningLogRepository.findAll(pageable);
        }
        
        return logs.map(this::mapToDTO);
    }
    
    public Page<CleaningLogDTO> getMyCleaningTasks(Long cleanerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "assignedAt"));
        Page<CleaningLog> logs = cleaningLogRepository.findByCleaner_Id(cleanerId, pageable);
        return logs.map(this::mapToDTO);
    }
    
    public List<CleaningLogDTO> getActiveTasks() {
        List<CleaningLog> activeTasks = cleaningLogRepository.findByStatusIn(Arrays.asList("ASSIGNED", "IN_PROGRESS"));
        return activeTasks.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public CleaningLogDTO getCleaningLogById(Long id) {
        CleaningLog cleaningLog = cleaningLogRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cleaning log not found with id: " + id));
        return mapToDTO(cleaningLog);
    }
    
    public Map<String, Object> getCleanerStats(Long cleanerId) {
        Map<String, Object> stats = new HashMap<>();
        
        List<CleaningLog> completedToday = cleaningLogRepository.findByCleaner_IdAndStatusAndCompletedAtAfter(
            cleanerId, "COMPLETED", LocalDate.now().atStartOfDay());
        stats.put("completedToday", completedToday.size());
        
        long assigned = cleaningLogRepository.countByCleaner_IdAndStatus(cleanerId, "ASSIGNED");
        stats.put("assigned", assigned);
        
        long inProgress = cleaningLogRepository.countByCleaner_IdAndStatus(cleanerId, "IN_PROGRESS");
        stats.put("inProgress", inProgress);
        
        List<CleaningLog> completedLogs = cleaningLogRepository.findByCleaner_IdAndStatus(cleanerId, "COMPLETED");
        double avgDuration = completedLogs.stream()
            .filter(log -> log.getDurationMinutes() != null)
            .mapToInt(CleaningLog::getDurationMinutes)
            .average()
            .orElse(0.0);
        stats.put("avgDurationMinutes", Math.round(avgDuration * 10.0) / 10.0);
        
        return stats;
    }
    
    private String extractRoomNumberFromQR(String qrCode) {
        if (qrCode == null || qrCode.trim().isEmpty()) {
            throw new ValidationException("QR code cannot be empty");
        }
        
        String trimmed = qrCode.trim();
        if (trimmed.startsWith("ROOM:")) {
            String roomNumber = trimmed.substring(5).trim();
            if (roomNumber.isEmpty()) {
                throw new ValidationException("Invalid QR code format: no room number found");
            }
            return roomNumber;
        } else {
            if (trimmed.matches("\\d+")) {
                return trimmed;
            }
            throw new ValidationException("Invalid QR code format. Expected 'ROOM:{roomNumber}' or just the room number");
        }
    }
    
    private CleaningLogDTO mapToDTO(CleaningLog log) {
        Room room = log.getRoom();
        User cleaner = log.getCleaner();
        User supervisor = log.getSupervisor();
        
        String roomNumber = room != null ? room.getRoomNumber() : "";
        String cleanerName = cleaner != null ? cleaner.getFirstName() + " " + cleaner.getLastName() : "";
        String supervisorName = supervisor != null ? supervisor.getFirstName() + " " + supervisor.getLastName() : null;
        
        return CleaningLogDTO.builder()
            .id(log.getId())
            .roomId(room != null ? room.getId() : null)
            .roomNumber(roomNumber)
            .cleanerId(cleaner != null ? cleaner.getId() : null)
            .cleanerName(cleanerName)
            .supervisorId(supervisor != null ? supervisor.getId() : null)
            .supervisorName(supervisorName)
            .status(log.getStatus())
            .assignedAt(log.getAssignedAt())
            .startedAt(log.getStartedAt())
            .completedAt(log.getCompletedAt())
            .durationMinutes(log.getDurationMinutes())
            .notes(log.getNotes())
            .build();
    }
}