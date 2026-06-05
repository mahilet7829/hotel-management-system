package com.hotel.management.cleaning.repository;

import com.hotel.management.cleaning.entity.ServiceRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    
    Page<ServiceRequest> findByStatus(String status, Pageable pageable);
    
    Page<ServiceRequest> findByAssignedTo(Long userId, Pageable pageable);
    
    Page<ServiceRequest> findByRoomId(Long roomId, Pageable pageable);
    
    List<ServiceRequest> findByStatusAndPriority(String status, String priority);
    
    long countByStatus(String status);
}
