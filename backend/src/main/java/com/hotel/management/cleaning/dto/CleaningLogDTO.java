package com.hotel.management.cleaning.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CleaningLogDTO {
    private Long id;
    private Long roomId;
    private String roomNumber;
    private Long cleanerId;
    private String cleanerName;
    private Long supervisorId;
    private String supervisorName;
    private String status;
    private LocalDateTime assignedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Integer durationMinutes;
    private String notes;
}