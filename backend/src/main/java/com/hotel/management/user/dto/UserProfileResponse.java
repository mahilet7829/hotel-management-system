package com.hotel.management.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private List<String> roles;
    private String phone;
    private Boolean isActive;
    private LocalDateTime createdAt;
}