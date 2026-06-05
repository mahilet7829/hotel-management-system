package com.hotel.management.cleaning.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateServiceRequestDTO {
    private String status;
    private Long assignedTo;
    private String notes;
    private String priority;
}