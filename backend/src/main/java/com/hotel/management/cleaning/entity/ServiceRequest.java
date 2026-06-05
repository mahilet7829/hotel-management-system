package com.hotel.management.cleaning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "service_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ServiceRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long roomId;
    
    @Column
    private Long requestedBy;
    
    @Column
    private String guestName;
    
    @Column(nullable = false)
    private String requestType;
    
    @Column(nullable = false)
    private String description;
    
    @Column(nullable = false)
    private String priority;
    
    @Column(nullable = false)
    private String status;
    
    @Column
    private Long assignedTo;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime resolvedAt;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
}