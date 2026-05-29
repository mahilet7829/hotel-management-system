package com.hotel.management.cleaning.repository;

import com.hotel.management.cleaning.entity.CleaningLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CleaningLogRepository extends JpaRepository<CleaningLog, Long> {
    List<CleaningLog> findByRoomId(Long roomId);
    List<CleaningLog> findByCleanerId(Long cleanerId);
    List<CleaningLog> findByStatus(String status);
    List<CleaningLog> findByCleanerIdAndAssignedAtBetween(Long cleanerId, LocalDateTime start, LocalDateTime end);
    Long countByCleanerIdAndStatus(Long cleanerId, String status);
}