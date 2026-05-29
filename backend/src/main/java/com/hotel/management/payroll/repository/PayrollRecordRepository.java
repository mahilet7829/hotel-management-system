package com.hotel.management.payroll.repository;

import com.hotel.management.payroll.entity.PayrollRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRecordRepository extends JpaRepository<PayrollRecord, Long> {
    List<PayrollRecord> findByUserId(Long userId);
    List<PayrollRecord> findByStatus(String status);
    Optional<PayrollRecord> findByUserIdAndPeriodStartAndPeriodEnd(Long userId, LocalDate start, LocalDate end);
    List<PayrollRecord> findByPeriodStartBetween(LocalDate start, LocalDate end);
}