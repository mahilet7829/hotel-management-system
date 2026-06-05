package com.hotel.management.cleaning.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateServiceRequestDTO {
    @NotNull(message = "Room ID is required")
    private Long roomId;
    
    private String guestName;
    
    @NotBlank(message = "Request type is required")
    private String requestType;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    private String priority;
    
    private String notes;
}
