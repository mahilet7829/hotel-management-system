package com.hotel.management.cleaning.repository;

import com.hotel.management.cleaning.entity.CleaningLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CleaningLogRepository extends JpaRepository<CleaningLog, Long> {

    List<CleaningLog> findByCleaner_Id(Long cleanerId);

    List<CleaningLog> findByRoom_Id(Long roomId);

    List<CleaningLog> findByStatus(String status);

    Page<CleaningLog> findByCleaner_Id(Long cleanerId, Pageable pageable);

    Page<CleaningLog> findByStatus(String status, Pageable pageable);

    Optional<CleaningLog> findByRoom_IdAndStatus(Long roomId, String status);

    List<CleaningLog> findByCleaner_IdAndStatus(Long cleanerId, String status);

    long countByCleaner_IdAndStatus(Long cleanerId, String status);

    List<CleaningLog> findByStatusIn(List<String> statuses);

    List<CleaningLog> findByCleaner_IdAndStatusAndCompletedAtAfter(Long cleanerId, String status, LocalDateTime date);
}