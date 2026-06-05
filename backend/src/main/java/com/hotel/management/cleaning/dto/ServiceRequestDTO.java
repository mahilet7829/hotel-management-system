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
public class ServiceRequestDTO {
    private Long id;
    private Long roomId;
    private String roomNumber;
    private Long requestedBy;
    private String requesterName;
    private String guestName;
    private String requestType;
    private String description;
    private String priority;
    private String status;
    private Long assignedTo;
    private String assignedToName;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private String notes;
}
