package com.hotel.management.cleaning.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteCleaningRequest {
    @NotBlank(message = "QR code is required")
    private String qrCode;
    
    private String notes;
}