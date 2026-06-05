package com.hotel.management.cleaning.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignCleaningRequest {
    @NotNull(message = "Room ID is required")
    private Long roomId;
    
    @NotNull(message = "Cleaner ID is required")
    private Long cleanerId;
    
    private Long supervisorId;
    private String notes;
}